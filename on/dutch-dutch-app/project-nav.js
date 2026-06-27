(function() {
    document.documentElement.style.setProperty('--vt-new-animation', 'push-in-from-right');
    document.documentElement.style.setProperty('--vt-old-animation', 'push-out-to-left');
    sessionStorage.removeItem('nav-direction');
})();

function closeDetailPage() {
    sessionStorage.setItem('nav-direction', 'sub-backward');
    window.location.href = '/on/dutch-dutch-app/index.html';
}

window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        closeDetailPage();
    }
});
