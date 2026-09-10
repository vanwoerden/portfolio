(function() {
    var root = document.documentElement;

    function applyDirection(direction) {
        if (direction === 'up') {
            root.style.setProperty('--vt-new-animation', 'push-in-from-top');
            root.style.setProperty('--vt-old-animation', 'push-out-to-bottom');
            root.classList.add('vt-vertical');
        } else if (direction === 'down') {
            root.style.setProperty('--vt-new-animation', 'push-in-from-bottom');
            root.style.setProperty('--vt-old-animation', 'push-out-to-top');
            root.classList.add('vt-vertical');
        } else if (direction === 'backward') {
            // Principle ↔ principle: horizontal
            root.classList.remove('vt-vertical');
            root.style.setProperty('--vt-new-animation', 'push-in-from-left');
            root.style.setProperty('--vt-old-animation', 'push-out-to-right');
        } else {
            // Default / forward: horizontal
            root.classList.remove('vt-vertical');
            root.style.setProperty('--vt-new-animation', 'push-in-from-right');
            root.style.setProperty('--vt-old-animation', 'push-out-to-left');
        }
    }

    function isHorizontalPrincipleNav(direction) {
        return direction === 'forward' || direction === 'backward';
    }

    var direction = sessionStorage.getItem('nav-direction');
    applyDirection(direction);

    // Principle ↔ principle: keep incoming title/body invisible until the slide finishes
    if (isHorizontalPrincipleNav(direction)) {
        root.classList.add('vt-hide-content');
    }

    sessionStorage.removeItem('nav-direction');

    window.addEventListener('pagereveal', function(event) {
        if (!root.classList.contains('vt-hide-content')) {
            return;
        }
        function reveal() {
            root.classList.remove('vt-hide-content');
        }
        if (event.viewTransition && event.viewTransition.finished) {
            event.viewTransition.finished.then(reveal).catch(reveal);
        } else {
            reveal();
        }
    });

    // Fallback if pagereveal never fires
    if (!('onpagereveal' in window) && root.classList.contains('vt-hide-content')) {
        window.setTimeout(function() {
            root.classList.remove('vt-hide-content');
        }, 100);
    }

    // Outgoing page: keep direction in sync; content is already blanked by principles-nav
    window.addEventListener('pageswap', function() {
        var nextDirection = sessionStorage.getItem('nav-direction');
        if (!nextDirection) {
            return;
        }
        applyDirection(nextDirection);
        if (isHorizontalPrincipleNav(nextDirection)) {
            root.classList.add('vt-hide-content');
        }
    });
})();
