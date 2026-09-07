(function() {
    // Keep in sync with on/principles/principles.json (loaded via principles-data.js)
    var BASE = '/on/principles/';
    function navOrder() {
        if (window.PrinciplesDrafts) {
            return window.PrinciplesDrafts.visiblePrinciples().map(function(p) {
                return p.slug;
            });
        }
        return (window.PRINCIPLES || []).filter(function(p) {
            return p.published;
        }).map(function(p) {
            return p.slug;
        });
    }


    function currentSlug() {
        var match = window.location.pathname.match(/\/principles\/([^/]+)/);
        return match ? match[1] : null;
    }

    function principleUrl(slug) {
        return BASE + slug + '/';
    }

    function navigateTo(slug, direction) {
        sessionStorage.setItem('nav-direction', direction);
        window.location.href = principleUrl(slug);
    }

    function neighborSlug(order, index, delta) {
        if (!order.length) {
            return null;
        }
        return order[(index + delta + order.length) % order.length];
    }

    function rewriteNavButtons() {
        var order = navOrder();
        var buttons = document.querySelectorAll('.nav-button[href]');
        if (buttons.length < 2 || !order.length) {
            return;
        }

        var slug = currentSlug();
        var index = order.indexOf(slug);
        var prev;
        var next;

        if (index === -1) {
            // Outside active list: point at ends of the list
            prev = order[order.length - 1];
            next = order[0];
        } else {
            prev = neighborSlug(order, index, -1);
            next = neighborSlug(order, index, 1);
        }

        if (prev) {
            buttons[0].setAttribute('href', principleUrl(prev));
        }
        if (next) {
            buttons[1].setAttribute('href', principleUrl(next));
        }
    }

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.preventDefault();
            sessionStorage.setItem('nav-direction', 'backward');
            window.location.href = '/';
            return;
        }

        var order = navOrder();
        var slug = currentSlug();
        if (!slug || !order.length) {
            return;
        }

        var index = order.indexOf(slug);
        if (index === -1) {
            return;
        }

        if (event.key === 'ArrowLeft' || event.keyCode === 37) {
            event.preventDefault();
            var prev = neighborSlug(order, index, -1);
            if (prev) {
                navigateTo(prev, 'backward');
            }
        } else if (event.key === 'ArrowRight' || event.keyCode === 39) {
            event.preventDefault();
            var next = neighborSlug(order, index, 1);
            if (next) {
                navigateTo(next, 'forward');
            }
        }
    });

    document.querySelectorAll('.nav-button[href]').forEach(function(link) {
        link.addEventListener('click', function() {
            var order = navOrder();
            var slug = currentSlug();
            if (!slug || !order.length) {
                return;
            }
            var index = order.indexOf(slug);
            var target = link.getAttribute('href');
            var prevSlug = index === -1
                ? order[order.length - 1]
                : neighborSlug(order, index, -1);
            var prev = prevSlug ? principleUrl(prevSlug) : null;
            sessionStorage.setItem('nav-direction', target === prev ? 'backward' : 'forward');
        });
    });

    function cssLengthToPx(value) {
        if (!value) {
            return 0;
        }
        var trimmed = String(value).trim();
        if (!trimmed) {
            return 0;
        }
        if (trimmed.endsWith('px')) {
            return parseFloat(trimmed) || 0;
        }
        var probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;visibility:hidden;width:' + trimmed + ';pointer-events:none;';
        document.body.appendChild(probe);
        var px = probe.offsetWidth;
        document.body.removeChild(probe);
        return px;
    }

    function titleFirstLineMidY() {
        var title = document.querySelector('h1.principle');
        if (!title) {
            return null;
        }
        var rect = title.getBoundingClientRect();
        var cs = getComputedStyle(title);
        var lineHeight = parseFloat(cs.lineHeight);
        if (!lineHeight || isNaN(lineHeight)) {
            var fontSize = parseFloat(cs.fontSize) || 16;
            lineHeight = fontSize * 1.1;
        }
        return rect.top + lineHeight / 2;
    }

    function clearNavPositionVars(nav) {
        if (!nav) {
            return;
        }
        nav.style.removeProperty('--principle-nav-title-mid');
        nav.style.removeProperty('--principle-nav-right-x');
    }

    function syncNavSidePositions() {
        var nav = document.querySelector('.nav-buttons');
        if (!nav || document.body.classList.contains('principle-nav-bottom')) {
            clearNavPositionVars(nav);
            return;
        }

        var mid = titleFirstLineMidY();
        if (mid == null) {
            nav.style.removeProperty('--principle-nav-title-mid');
        } else {
            nav.style.setProperty('--principle-nav-title-mid', mid + 'px');
        }

        var page = document.querySelector('.principle-site__page');
        var rightBtn = document.querySelector('.nav-buttons .nav-button:last-child');
        if (!page || !rightBtn) {
            nav.style.removeProperty('--principle-nav-right-x');
            return;
        }

        var styles = getComputedStyle(document.documentElement);
        var gap = cssLengthToPx(styles.getPropertyValue('--principle-nav-clearance')) || 24;
        var pageRight = page.getBoundingClientRect().right;
        nav.style.setProperty('--principle-nav-right-x', (pageRight + gap) + 'px');
    }

    function syncNavLayout() {
        if (!document.body.classList.contains('principle-site')) {
            return;
        }

        var styles = getComputedStyle(document.documentElement);
        var edgePx = cssLengthToPx(styles.getPropertyValue('--principle-nav-edge'));
        var clearancePx = cssLengthToPx(styles.getPropertyValue('--principle-nav-clearance'));

        // Measure in side-nav mode so footprints are accurate
        document.body.classList.remove('principle-nav-bottom');
        clearNavPositionVars(document.querySelector('.nav-buttons'));

        var leftBtn = document.querySelector('.nav-buttons .nav-button');
        var rightBtn = document.querySelector('.nav-buttons .nav-button:last-child');
        var page = document.querySelector('.principle-site__page');
        var collision = false;

        if (leftBtn && page) {
            var leftRight = leftBtn.getBoundingClientRect().right;
            var contentLeft = page.getBoundingClientRect().left;
            if (contentLeft < leftRight + clearancePx) {
                collision = true;
            }
        }

        // Right arrow sits beside the column — need room for it past the column
        if (!collision && page && rightBtn) {
            var pageRight = page.getBoundingClientRect().right;
            var arrowW = rightBtn.getBoundingClientRect().width;
            if (pageRight + clearancePx + arrowW + edgePx > window.innerWidth) {
                collision = true;
            }
        }

        document.body.classList.toggle('principle-nav-bottom', collision);
        syncNavSidePositions();
    }

    function refreshNav() {
        rewriteNavButtons();
        syncNavLayout();
    }

    var navRevealScheduled = false;

    function prefersReducedMotion() {
        return window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function revealNavArrows() {
        document.body.classList.add('principle-nav-visible');
    }

    function scheduleNavReveal(viewTransition) {
        if (navRevealScheduled) {
            return;
        }
        navRevealScheduled = true;
        if (prefersReducedMotion()) {
            revealNavArrows();
            return;
        }
        document.body.classList.remove('principle-nav-visible');
        if (viewTransition && viewTransition.finished) {
            viewTransition.finished.then(revealNavArrows).catch(revealNavArrows);
            return;
        }
        // Cold load / no cross-doc transition: short beat, then fade in
        window.setTimeout(revealNavArrows, 120);
    }

    refreshNav();
    window.addEventListener('resize', syncNavLayout);
    window.addEventListener('scroll', syncNavSidePositions, { passive: true });
    window.addEventListener('pageshow', refreshNav);

    window.addEventListener('pagereveal', function(event) {
        scheduleNavReveal(event.viewTransition || null);
    });

    // Fallback when pagereveal is unsupported or already fired
    if (!('onpagereveal' in window)) {
        scheduleNavReveal(null);
    } else {
        window.setTimeout(function() {
            if (!document.body.classList.contains('principle-nav-visible')) {
                navRevealScheduled = false;
                scheduleNavReveal(null);
            }
        }, 700);
    }
})();
