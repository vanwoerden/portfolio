function formatMetricPart(part) {
    if (!part) return '';
    if (typeof part.string === 'string' && part.string.length > 0) return part.string;
    if (typeof part.number === 'number') return String(part.number);
    return '';
}

function formatMetricValue(metric) {
    const absolute = formatMetricPart(metric.absolute);
    const relative = formatMetricPart(metric.relative);
    const visible = metric.visible || 'absolute';

    if (visible === 'absolute') return absolute;
    if (visible === 'relative') return relative;
    if (visible === 'both') {
        if (relative && absolute) return `${relative} to ${absolute}`;
        return relative || absolute;
    }
    return absolute || relative;
}

function toSparksCode(series) {
    if (!Array.isArray(series) || series.length === 0) return '';

    const numbers = series
        .map(function(value) { return Number(value); })
        .filter(function(value) { return Number.isFinite(value); });

    if (!numbers.length) return '';

    const max = Math.max.apply(null, numbers);
    if (max <= 0) return '';

    const scaled = numbers.map(function(value) {
        return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    });

    // Sparks requires no spaces after commas for calt substitutions.
    return '{' + scaled.join(',') + '}';
}

function renderSparkline(series) {
    const code = toSparksCode(series);
    if (!code) return null;

    const wrap = document.createElement('span');
    wrap.className = 'project-card__sparkline-wrap';

    const sparkline = document.createElement('span');
    sparkline.className = 'project-card__sparkline';
    sparkline.setAttribute('aria-hidden', 'true');
    sparkline.textContent = code;
    wrap.appendChild(sparkline);

    return wrap;
}

function renderProgressBar(progress) {
    if (!progress) return null;

    const value = Number(progress.value);
    const max = Number(progress.max);
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return null;

    const percent = Math.max(0, Math.min(100, (value / max) * 100));

    const bar = document.createElement('span');
    bar.className = 'project-card__progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuenow', String(value));
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(max));
    bar.setAttribute('aria-label', value + ' of ' + max);

    const fill = document.createElement('span');
    fill.className = 'project-card__progress-fill';
    fill.style.width = percent + '%';
    bar.appendChild(fill);

    return bar;
}

function appendMetricValueText(container, value) {
    const currencyMatch = value.match(/^(\$)(.*)$/);

    if (currencyMatch) {
        const symbol = document.createElement('span');
        symbol.className = 'project-card__metric-currency';
        symbol.textContent = currencyMatch[1];
        container.appendChild(symbol);
        container.appendChild(document.createTextNode(currencyMatch[2]));
        return;
    }

    container.appendChild(document.createTextNode(value));
}

function renderMetric(metric) {
    const value = formatMetricValue(metric);
    if (!value) return null;

    const description = typeof metric.description === 'string' && metric.description.trim()
        ? metric.description.trim()
        : null;

    const item = document.createElement('div');
    item.className = 'project-card__metric';
    item.dataset.visualization = metric.visualization || 'KPI';
    if (metric.id) item.dataset.metricId = metric.id;

    const label = document.createElement('dt');
    label.className = 'project-card__metric-label';
    label.textContent = metric.label || '';
    item.appendChild(label);

    const valueRow = document.createElement('dd');
    valueRow.className = 'project-card__metric-value';

    const valueText = document.createElement('span');
    valueText.className = metric.blurred
        ? 'project-card__metric-value-text project-card__metric-value-text--blurred'
        : 'project-card__metric-value-text';
    appendMetricValueText(valueText, value);

    if (description) {
        const asterisk = document.createElement('span');
        asterisk.className = 'project-card__metric-asterisk';
        asterisk.setAttribute('aria-hidden', 'true');
        asterisk.textContent = '*';
        valueText.appendChild(asterisk);
    }

    valueRow.appendChild(valueText);

    const sparkline = renderSparkline(metric.series);
    if (sparkline) {
        valueRow.appendChild(sparkline);
        valueRow.setAttribute(
            'aria-label',
            value + ', trend from ' + metric.series[0] + 'k to ' + metric.series[metric.series.length - 1] + 'k'
        );
    }

    const progressBar = renderProgressBar(metric.progress);
    if (progressBar) {
        valueRow.appendChild(progressBar);
    }

    item.appendChild(valueRow);

    if (description) {
        const descriptionEl = document.createElement('dd');
        descriptionEl.className = 'project-card__metric-description';
        descriptionEl.textContent = description;
        item.appendChild(descriptionEl);
    }

    return item;
}

function renderProjectMetrics(section, metrics) {
    const list = section.querySelector('.project-card__metrics');
    if (!list) return;

    list.replaceChildren();

    if (!Array.isArray(metrics) || metrics.length === 0) {
        section.hidden = true;
        return;
    }

    let rendered = 0;
    metrics.forEach(function(metric) {
        const item = renderMetric(metric);
        if (item) {
            list.appendChild(item);
            rendered += 1;
        }
    });

    section.hidden = rendered === 0;
}

async function loadProjectMetrics() {
    const response = await fetch('/data/project-metrics.json');
    if (!response.ok) {
        throw new Error('Failed to load project metrics');
    }
    return response.json();
}

async function initProjectMetrics() {
    const containers = document.querySelectorAll('[data-project-metrics]');
    if (!containers.length) return;

    try {
        const data = await loadProjectMetrics();
        const projects = data.projects || {};

        containers.forEach(function(container) {
            const projectId = container.getAttribute('data-project-metrics');
            const metrics = projects[projectId]?.metrics || [];
            renderProjectMetrics(container, metrics);
        });
    } catch (error) {
        console.error(error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectMetrics);
} else {
    initProjectMetrics();
}
