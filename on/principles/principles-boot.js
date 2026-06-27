(function() {
    var direction = sessionStorage.getItem('nav-direction');
    if (direction === 'backward') {
        document.documentElement.style.setProperty('--vt-new-animation', 'push-in-from-left');
        document.documentElement.style.setProperty('--vt-old-animation', 'push-out-to-right');
    } else {
        document.documentElement.style.setProperty('--vt-new-animation', 'push-in-from-right');
        document.documentElement.style.setProperty('--vt-old-animation', 'push-out-to-left');
    }
    sessionStorage.removeItem('nav-direction');
})();
