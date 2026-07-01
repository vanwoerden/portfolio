(function() {
    function cubicPath(x0, y0, x1, y1) {
        var dy = y1 - y0;
        var dx = x1 - x0;
        var cp1x = x0 + dx * 0.08;
        var cp1y = y0 + dy * 0.42;
        var cp2x = x1 - dx * 0.08;
        var cp2y = y1 - dy * 0.42;
        return 'M ' + x0 + ' ' + y0 +
            ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + x1 + ' ' + y1;
    }

    function relPoint(el, container) {
        var rect = el.getBoundingClientRect();
        var c = container.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - c.left,
            y: rect.top + rect.height / 2 - c.top
        };
    }

    function initProjectCallouts(root) {
        if (!root || root.dataset.ddCalloutsInit === 'true') return;

        var sections = Array.from(root.querySelectorAll('[data-callout-target]'));
        var anchors = Array.from(root.querySelectorAll('[data-callout-anchor]'));
        var mediaItems = Array.from(root.querySelectorAll('[data-callout-media]'));
        var svg = root.querySelector('.dd-project-scroll__lines');
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var desktop = window.matchMedia('(min-width: 901px)').matches;
        var activeId = null;
        var lineDrawMs = reduceMotion ? 0 : 880;
        var paths = {};
        var frame = 0;
        var carousel = null;
        var carouselSlides = [];
        var stepSections = sections.filter(function(section) {
            return section.classList.contains('dd-callout-section--step');
        });

        if (!sections.length || !svg) return;

        function buildCarousel() {
            if (carousel || !stepSections.length || !mediaItems.length) return;

            var content = root.querySelector('.dd-project-scroll__content');
            if (!content) return;

            carousel = document.createElement('div');
            carousel.className = 'dd-project-scroll__carousel';
            carousel.setAttribute('role', 'region');
            carousel.setAttribute('aria-label', 'Screenshots');
            carousel.setAttribute('tabindex', '0');

            stepSections.forEach(function(step) {
                var id = step.getAttribute('data-callout-target');
                if (!id) return;

                var media = mediaFor(id);
                var title = step.querySelector('.dd-callout-section__title');
                var body = step.querySelector('.dd-callout-section__body');
                if (!media || !body) return;

                var slide = document.createElement('article');
                slide.className = 'dd-project-scroll__carousel-slide';
                slide.setAttribute('data-callout-target', id);

                var figure = document.createElement('figure');
                figure.className = 'dd-project-scroll__carousel-slide__media';

                var img = media.cloneNode(true);
                img.classList.remove('is-active');
                img.removeAttribute('data-callout-media');
                figure.appendChild(img);

                var copy = body.cloneNode(true);

                var inner = document.createElement('div');
                inner.className = 'dd-project-scroll__carousel-slide__inner';
                if (title) {
                    inner.appendChild(title.cloneNode(true));
                }
                inner.appendChild(figure);
                inner.appendChild(copy);
                slide.appendChild(inner);
                carousel.appendChild(slide);
                carouselSlides.push(slide);
            });

            if (!carouselSlides.length) {
                carousel = null;
                return;
            }

            content.insertBefore(carousel, stepSections[0]);
            root.classList.add('dd-project-scroll--has-carousel');

            stepSections.forEach(function(step) {
                step.setAttribute('aria-hidden', 'true');
            });

            var stage = root.querySelector('.dd-project-scroll__stage');
            if (stage) {
                stage.setAttribute('aria-hidden', 'true');
            }

            carousel.addEventListener('scroll', function() {
                pickActiveSection();
            }, { passive: true });
        }

        anchors.forEach(function(anchor) {
            var id = anchor.getAttribute('data-callout-anchor');
            if (!id || paths[id]) return;

            var under = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            under.setAttribute('class', 'dd-callout-line--under');
            under.dataset.calloutLine = id;

            var main = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            main.setAttribute('class', 'dd-callout-line--main');
            main.dataset.calloutLine = id;

            svg.appendChild(under);
            svg.appendChild(main);
            paths[id] = { under: under, main: main };
        });

        function anchorFor(id) {
            return root.querySelector('[data-callout-anchor="' + id + '"]');
        }

        function sectionFor(id) {
            return root.querySelector('[data-callout-target="' + id + '"]');
        }

        function mediaFor(id) {
            if (!id) return null;
            return root.querySelector('[data-callout-media="' + id + '"]');
        }

        function setActiveMedia(id) {
            if (carousel || !mediaItems.length) return;

            var activeMedia = null;
            if (id) {
                activeMedia = mediaFor(id);
                if (!activeMedia) {
                    activeMedia = mediaItems.find(function(item) {
                        var ids = (item.getAttribute('data-callout-media') || '').split(/\s+/);
                        return ids.indexOf(id) !== -1;
                    }) || null;
                }
            }

            if (!activeMedia) {
                if (id) return;
                activeMedia = mediaItems.find(function(item) {
                    return item.classList.contains('is-default');
                }) || mediaItems[0];
            }

            mediaItems.forEach(function(item) {
                item.classList.toggle('is-active', item === activeMedia);
            });

            var stack = root.querySelector('.dd-project-media__stack');
            if (stack) {
                stack.classList.toggle('is-showing', Boolean(activeMedia));
            }
        }

        function setActive(id) {
            if (activeId === id) return;
            activeId = id;

            sections.forEach(function(section) {
                var sectionId = section.getAttribute('data-callout-target');
                var isActive = sectionId === id;
                section.classList.toggle('dd-callout-section--active', isActive);
                if (isActive) {
                    section.classList.add('dd-callout-section--revealed');
                }
            });

            carouselSlides.forEach(function(slide) {
                slide.classList.toggle(
                    'dd-callout-section--active',
                    slide.getAttribute('data-callout-target') === id
                );
            });

            anchors.forEach(function(anchor) {
                anchor.classList.toggle(
                    'is-visible',
                    anchor.getAttribute('data-callout-anchor') === id
                );
            });

            Object.keys(paths).forEach(function(key) {
                var visible = key === id;
                paths[key].under.classList.toggle('is-visible', visible);
                paths[key].main.classList.toggle('is-visible', visible);
            });

            setActiveMedia(id);
            root.classList.toggle('dd-project-scroll--active', Boolean(id));
            scheduleUpdate(true);
        }

        function applyDashState(animateIn) {
            Object.keys(paths).forEach(function(id) {
                var pair = paths[id];
                var len = pair.main.getTotalLength();

                if (!len) return;

                pair.main.style.strokeDasharray = String(len);
                pair.under.style.strokeDasharray = String(len);

                if (id !== activeId) {
                    pair.main.style.transition = 'none';
                    pair.under.style.transition = 'none';
                    pair.main.style.strokeDashoffset = String(len);
                    pair.under.style.strokeDashoffset = String(len);
                    return;
                }

                if (animateIn && !reduceMotion) {
                    pair.main.style.transition = 'none';
                    pair.under.style.transition = 'none';
                    pair.main.style.strokeDashoffset = String(len);
                    pair.under.style.strokeDashoffset = String(len);

                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            pair.main.style.transition = 'stroke-dashoffset ' + lineDrawMs + 'ms linear';
                            pair.under.style.transition = 'stroke-dashoffset ' + lineDrawMs + 'ms linear';
                            pair.main.style.strokeDashoffset = '0';
                            pair.under.style.strokeDashoffset = '0';
                        });
                    });
                } else {
                    pair.main.style.transition = 'none';
                    pair.under.style.transition = 'none';
                    pair.main.style.strokeDashoffset = '0';
                    pair.under.style.strokeDashoffset = '0';
                }
            });
        }

        function updateLines(animateIn) {
            if (!desktop) return;

            var bounds = root.getBoundingClientRect();
            if (bounds.width < 1 || bounds.height < 1) return;

            svg.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
            svg.setAttribute('width', bounds.width);
            svg.setAttribute('height', bounds.height);

            if (!activeId) {
                applyDashState(false);
                return;
            }

            var section = sectionFor(activeId);
            var anchor = anchorFor(activeId);
            var pair = paths[activeId];

            if (!section || !anchor || !pair) {
                applyDashState(false);
                return;
            }

            var start = relPoint(section.querySelector('.dd-callout-section__note') || section, root);
            var end = relPoint(anchor, root);
            var d = cubicPath(start.x, start.y, end.x, end.y);

            pair.main.setAttribute('d', d);
            pair.under.setAttribute('d', d);
            applyDashState(animateIn);
        }

        function scheduleUpdate(animateIn) {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(function() {
                updateLines(Boolean(animateIn));
            });
        }

        function pickActiveSection() {
            if (carousel) {
                var focusX = carousel.getBoundingClientRect().left + carousel.clientWidth * 0.35;
                var best = null;
                var bestDistance = Infinity;

                carouselSlides.forEach(function(slide) {
                    var id = slide.getAttribute('data-callout-target');
                    if (!id) return;

                    var rect = slide.getBoundingClientRect();
                    var center = rect.left + rect.width * 0.5;
                    var distance = Math.abs(center - focusX);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        best = id;
                    }
                });

                setActive(best);
                return;
            }

            var focusY = window.innerHeight * 0.42;
            var best = null;
            var bestDistance = Infinity;

            sections.forEach(function(section) {
                var id = section.getAttribute('data-callout-target');
                if (!id) return;

                var rect = section.getBoundingClientRect();
                if (rect.bottom < focusY * 0.5 || rect.top > window.innerHeight * 0.85) return;

                var center = rect.top + rect.height * 0.35;
                var distance = Math.abs(center - focusY);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    best = id;
                }
            });

            if (!desktop && !best) {
                setActive(null);
                return;
            }

            setActive(best);
        }

        var observer = new IntersectionObserver(function() {
            pickActiveSection();
        }, {
            root: null,
            threshold: [0, 0.15, 0.35, 0.5, 0.75, 1]
        });

        sections.forEach(function(section) {
            observer.observe(section);
        });

        window.addEventListener('scroll', function() {
            scheduleUpdate(false);
            pickActiveSection();
        }, { passive: true });

        window.addEventListener('resize', function() {
            desktop = window.matchMedia('(min-width: 901px)').matches;
            scheduleUpdate(false);
            pickActiveSection();
        }, { passive: true });

        buildCarousel();

        root.querySelectorAll('.dd-project-media__video:not([controls]), .dd-solution-video__media:not([controls])').forEach(function(video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        });

        root.querySelectorAll('.dd-inline-volume-demo').forEach(function(demo) {
            var slider = demo.querySelector('.dd-volume-slider');
            var valueEl = demo.querySelector('.dd-volume-slider__value');
            var easyEl = demo.querySelector('.dd-volume-slider__easy');
            var hasDragged = false;
            if (!slider || !valueEl) return;

            function syncValue() {
                var value = hasDragged ? slider.value : '100';

                valueEl.textContent = value;
                if (easyEl) {
                    easyEl.hidden = !hasDragged || Number(slider.value) !== 100;
                }

                var fill = hasDragged
                    ? ((Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min))) * 100
                    : 0;
                slider.style.setProperty('--volume-fill', fill + '%');
                slider.classList.toggle('is-active', hasDragged);
                valueEl.classList.toggle('is-max', hasDragged && Number(slider.value) === 100);
            }

            slider.addEventListener('input', function() {
                hasDragged = true;
                syncValue();
            });

            syncValue();
        });

        root.dataset.ddCalloutsInit = 'true';
        pickActiveSection();
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-dd-project-scroll]').forEach(initProjectCallouts);
    });
})();
