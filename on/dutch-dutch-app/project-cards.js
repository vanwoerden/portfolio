(function() {
    function navigateToProject(href) {
        if (!href) return;
        sessionStorage.setItem('nav-direction', 'sub-forward');
        window.location.href = href;
    }

    document.querySelectorAll('.dd-project-card--linked').forEach(function(card) {
        var href = card.getAttribute('data-project-href');
        if (!href) return;

        var button = card.querySelector('.dd-project-card__view');

        card.addEventListener('click', function(e) {
            if (button && button.contains(e.target)) return;
            navigateToProject(href);
        });

        card.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            if (button && button.contains(e.target)) return;
            e.preventDefault();
            navigateToProject(href);
        });

        if (button) {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateToProject(href);
            });
        }
    });

    document.querySelectorAll('button.dd-project-highlight[data-project-href]').forEach(function(button) {
        var href = button.getAttribute('data-project-href');
        if (!href) return;

        button.addEventListener('click', function() {
            navigateToProject(href);
        });
    });

    document.querySelectorAll('.dd-main-video__media').forEach(function(video) {
        video.addEventListener('click', function() {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    });
})();
