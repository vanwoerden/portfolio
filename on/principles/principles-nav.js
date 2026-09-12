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
        // Blank content first so the outgoing VT snapshot has no morphing text
        document.documentElement.classList.add('vt-hide-content');
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                window.location.href = principleUrl(slug);
            });
        });
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
        link.addEventListener('click', function(event) {
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
            var direction = target === prev ? 'backward' : 'forward';
            var match = target && target.match(/\/principles\/([^/]+)/);
            if (!match) {
                sessionStorage.setItem('nav-direction', direction);
                return;
            }
            event.preventDefault();
            navigateTo(match[1], direction);
        });
    });

    function refreshNav() {
        rewriteNavButtons();
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
        }, 350);
    }
})();
