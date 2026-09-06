(function() {
    // Keep in sync with on/principles/principles.json (loaded via principles-data.js)
    var PRINCIPLES = window.PRINCIPLES || [];
    var BASE = '/on/principles/';

    function publishedOrder() {
        return PRINCIPLES.filter(function(p) {
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
        var order = publishedOrder();
        var buttons = document.querySelectorAll('.nav-button[href]');
        if (buttons.length < 2 || !order.length) {
            return;
        }

        var slug = currentSlug();
        var index = order.indexOf(slug);
        var prev;
        var next;

        if (index === -1) {
            // Draft page (local): point at first/last published neighbors
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

        var order = publishedOrder();
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
            var order = publishedOrder();
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

    function syncNavLayout() {
        if (!document.body.classList.contains('principle-site')) {
            return;
        }

        var styles = getComputedStyle(document.documentElement);
        var contentPx = cssLengthToPx(
            getComputedStyle(document.body).getPropertyValue('--principle-main-width')
            || styles.getPropertyValue('--principle-main-width')
        );
        var edgePx = cssLengthToPx(styles.getPropertyValue('--principle-nav-edge'));
        var clearancePx = cssLengthToPx(styles.getPropertyValue('--principle-nav-clearance'));
        var sideReservePx = cssLengthToPx(styles.getPropertyValue('--principle-nav-side-reserve'));

        // Measure in side-nav mode so footprints are accurate
        document.body.classList.remove('principle-nav-bottom');

        var leftBtn = document.querySelector('.nav-buttons .nav-button');
        var page = document.querySelector('.principle-site__page');
        if (leftBtn) {
            sideReservePx = edgePx + leftBtn.getBoundingClientRect().width + clearancePx;
        }

        var collision = window.innerWidth < contentPx + sideReservePx * 2;

        // True overlap only (reserve math already includes clearance)
        if (!collision && leftBtn && page) {
            var arrowRight = leftBtn.getBoundingClientRect().right;
            var contentLeft = page.getBoundingClientRect().left;
            if (contentLeft < arrowRight) {
                collision = true;
            }
        }

        document.body.classList.toggle('principle-nav-bottom', collision);
    }

    rewriteNavButtons();
    syncNavLayout();
    window.addEventListener('resize', syncNavLayout);
})();
