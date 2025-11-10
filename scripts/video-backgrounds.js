/**
 * Video Background Manager
 * Handles lazy loading and playback of background videos
 * A Paul Phillips Manifestation
 */

(function() {
    'use strict';

    const VideoBackgroundManager = {
        videos: [],
        observer: null,

        init() {
            this.setupIntersectionObserver();
            this.initializeVideos();
            this.handleReducedMotion();
        },

        setupIntersectionObserver() {
            if (!('IntersectionObserver' in window)) {
                this.loadAllVideos();
                return;
            }

            const options = {
                root: null,
                rootMargin: '100px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        this.loadVideo(video);
                        this.observer.unobserve(video);
                    }
                });
            }, options);
        },

        initializeVideos() {
            const videoElements = document.querySelectorAll('.video-background video');

            videoElements.forEach(video => {
                // Set video attributes
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.preload = 'metadata';

                // Store reference
                this.videos.push(video);

                // Observe for lazy loading
                if (this.observer) {
                    this.observer.observe(video);
                } else {
                    this.loadVideo(video);
                }

                // Handle load event
                video.addEventListener('loadeddata', () => {
                    video.classList.add('loaded');
                    video.closest('.video-background')?.classList.add('loaded');
                });

                // Error handling
                video.addEventListener('error', () => {
                    console.warn('Video failed to load:', video.dataset.src || video.src);
                    video.closest('.video-background')?.classList.add('error');
                });
            });
        },

        loadVideo(video) {
            const src = video.dataset.src;
            if (src && !video.src) {
                video.src = src;
                video.load();

                // Attempt to play (may be blocked by browser)
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log('Video autoplay prevented:', error);
                        // Try playing on user interaction
                        document.addEventListener('click', () => {
                            video.play().catch(e => console.log('Still cannot play:', e));
                        }, { once: true });
                    });
                }
            }
        },

        loadAllVideos() {
            this.videos.forEach(video => this.loadVideo(video));
        },

        handleReducedMotion() {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

            const toggleVideos = (shouldDisable) => {
                this.videos.forEach(video => {
                    if (shouldDisable) {
                        video.pause();
                        video.style.display = 'none';
                    } else {
                        video.style.display = 'block';
                        video.play().catch(() => {});
                    }
                });
            };

            toggleVideos(reduceMotion.matches);

            if (reduceMotion.addEventListener) {
                reduceMotion.addEventListener('change', (e) => {
                    toggleVideos(e.matches);
                });
            }
        },

        pauseAll() {
            this.videos.forEach(video => video.pause());
        },

        playAll() {
            this.videos.forEach(video => {
                video.play().catch(() => {});
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            VideoBackgroundManager.init();
        });
    } else {
        VideoBackgroundManager.init();
    }

    // Expose to window for debugging
    window.VideoBackgroundManager = VideoBackgroundManager;

    // Pause videos when page is hidden (performance)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            VideoBackgroundManager.pauseAll();
        } else {
            VideoBackgroundManager.playAll();
        }
    });

})();
