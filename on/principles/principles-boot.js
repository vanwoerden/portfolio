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

    // Incoming page: match home ↔ Dutch & Dutch vertical language for list ↔ detail
    applyDirection(sessionStorage.getItem('nav-direction'));
    sessionStorage.removeItem('nav-direction');

    // Outgoing page: collapse named layers into root before the snapshot is taken
    window.addEventListener('pageswap', function() {
        var direction = sessionStorage.getItem('nav-direction');
        if (direction === 'up' || direction === 'down') {
            applyDirection(direction);
        }
    });
})();
