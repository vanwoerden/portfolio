(function () {
  var section = document.getElementById('ux-explainer');
  if (!section) return;

  var video = document.getElementById('what-is-ux');
  var hint = section.querySelector('.ux-compare__hint');

  function syncPlayState() {
    if (!video) return;
    video.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
  }

  function toggleVideo() {
    if (!video) return;
    if (video.paused) {
      var pending = video.play();
      if (pending && typeof pending.catch === 'function') {
        pending.catch(function () {});
      }
    } else {
      video.pause();
    }
  }

  if (video) {
    video.addEventListener('click', toggleVideo);
    video.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleVideo();
    });
    video.addEventListener('play', syncPlayState);
    video.addEventListener('pause', syncPlayState);
    syncPlayState();
  }

  function dismissHint() {
    if (!hint || hint.hidden || hint.classList.contains('is-dismissed')) return;
    hint.classList.add('is-dismissed');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      hint.hidden = true;
      return;
    }
    hint.addEventListener('transitionend', function () {
      hint.hidden = true;
    }, { once: true });
  }

  function setReveal(frame, ratio) {
    var clamped = Math.min(1, Math.max(0, ratio));
    frame.style.setProperty('--ux-reveal', String(clamped));
    var range = frame.querySelector('.ux-compare__range');
    if (!range) return;
    var next = String(Math.round(clamped * 100));
    if (range.value !== next) range.value = next;
  }

  var frames = section.querySelectorAll('.ux-compare__frame');
  frames.forEach(function (frame) {
    var range = frame.querySelector('.ux-compare__range');
    if (!range) return;

    frame.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      var rect = frame.getBoundingClientRect();
      if (!rect.width) return;
      setReveal(frame, (event.clientX - rect.left) / rect.width);
      dismissHint();
    });

    range.addEventListener('input', function () {
      frame.style.setProperty('--ux-reveal', String(range.value / 100));
      dismissHint();
    });
  });
})();
