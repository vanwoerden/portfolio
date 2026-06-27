(function() {
    var ORDER = [
        'design',
        'focus',
        'slack-variety-cadence',
        'seeing-it-through-together',
        'starting-out-informed',
        'time-vs-scope',
        'quality',
        'before-and-after',
        'designers-should-code'
    ];
    var BASE = '/on/principles/';

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

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.preventDefault();
            sessionStorage.setItem('nav-direction', 'backward');
            window.location.href = '/';
            return;
        }

        var slug = currentSlug();
        if (!slug) {
            return;
        }

        var index = ORDER.indexOf(slug);
        if (index === -1) {
            return;
        }

        if (event.key === 'ArrowLeft' || event.keyCode === 37) {
            event.preventDefault();
            var prev = ORDER[(index - 1 + ORDER.length) % ORDER.length];
            navigateTo(prev, 'backward');
        } else if (event.key === 'ArrowRight' || event.keyCode === 39) {
            event.preventDefault();
            var next = ORDER[(index + 1) % ORDER.length];
            navigateTo(next, 'forward');
        }
    });

    document.querySelectorAll('.nav-button[href]').forEach(function(link) {
        link.addEventListener('click', function() {
            var slug = currentSlug();
            if (!slug) {
                return;
            }
            var index = ORDER.indexOf(slug);
            var target = link.getAttribute('href');
            var prev = principleUrl(ORDER[(index - 1 + ORDER.length) % ORDER.length]);
            sessionStorage.setItem('nav-direction', target === prev ? 'backward' : 'forward');
        });
    });
})();
