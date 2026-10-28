/**
 * Luxe Salon & Hair Spa - Main JavaScript
 * Premium interactions and functionality
 */

(function() {
    'use strict';

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroStats = document.querySelectorAll('.stat-number');
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceFilters = document.querySelectorAll('.services .filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryFilters = document.querySelectorAll('.gallery .filter-btn');
    const testimonialsTrack = document.getElementById('testimonials-track');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    const sliderDots = document.getElementById('slider-dots');
    const bookingForm = document.getElementById('booking-form');
    const newsletterForm = document.getElementById('newsletter-form');
    const bookingModal = document.getElementById('booking-modal');
    const closeModal = document.getElementById('close-modal');
    const dateInput = document.getElementById('date');

    // ========================================
    // STATE
    // ========================================
    let currentTestimonial = 0;
    let testimonialInterval = null;
    const testimonialsPerView = 1;
    const totalTestimonials = testimonialCards.length;

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        setupNavigation();
        setupHeroStats();
        setupServiceFilters();
        setupGalleryFilters();
        setupTestimonialsSlider();
        setupBookingForm();
        setupNewsletterForm();
        setupModal();
        setupDateInput();
        setupScrollAnimations();
        setupSmoothScroll();
        setupNavbarScroll();
    }

    // ========================================
    // NAVIGATION
    // ========================================
    function setupNavigation() {
        // Mobile menu toggle
        navToggle.addEventListener('click', () => {
            const isActive = navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    function setupNavbarScroll() {
        let lastScroll = 0;
        const threshold = 50;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > threshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ========================================
    // HERO STATS COUNTER
    // ========================================
    function setupHeroStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        heroStats.forEach(stat => observer.observe(stat));
    }

    function animateCounter(element) {
        const target = parseInt(element.dataset.count, 10);
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.floor(target * eased);
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(update);
    }

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // ========================================
    // SERVICE FILTERS
    // ========================================
    function setupServiceFilters() {
        serviceFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active state
                serviceFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter cards
                serviceCards.forEach(card => {
                    const category = card.dataset.category;
                    const shouldShow = filter === 'all' || category === filter;

                    if (shouldShow) {
                        card.style.display = '';
                        card.style.animation = 'fadeInUp 0.4s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========================================
    // GALLERY FILTERS
    // ========================================
    function setupGalleryFilters() {
        galleryFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active state
                galleryFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter items
                galleryItems.forEach(item => {
                    const category = item.dataset.category;
                    const shouldShow = filter === 'all' || category === filter;

                    if (shouldShow) {
                        item.style.display = '';
                        item.style.animation = 'fadeInUp 0.4s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========================================
    // TESTIMONIALS SLIDER
    // ========================================
    function setupTestimonialsSlider() {
        // Create dots
        testimonialCards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            dot.addEventListener('click', () => goToTestimonial(index));
            sliderDots.appendChild(dot);
        });

        const dots = sliderDots.querySelectorAll('.slider-dot');

        // Navigation buttons
        prevBtn.addEventListener('click', () => goToTestimonial(currentTestimonial - 1));
        nextBtn.addEventListener('click', () => goToTestimonial(currentTestimonial + 1));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') goToTestimonial(currentTestimonial - 1);
            if (e.key === 'ArrowRight') goToTestimonial(currentTestimonial + 1);
        });

        // Auto-play
        startAutoPlay();

        // Pause on hover
        const slider = document.querySelector('.testimonials-slider');
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    goToTestimonial(currentTestimonial + 1);
                } else {
                    goToTestimonial(currentTestimonial - 1);
                }
            }
        }

        function goToTestimonial(index) {
            // Wrap around
            if (index < 0) index = totalTestimonials - 1;
            if (index >= totalTestimonials) index = 0;

            currentTestimonial = index;
            const offset = -currentTestimonial * 100;
            testimonialsTrack.style.transform = `translateX(${offset}%)`;

            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentTestimonial);
            });

            // Update button states
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        }

        function startAutoPlay() {
            stopAutoPlay();
            testimonialInterval = setInterval(() => {
                goToTestimonial(currentTestimonial + 1);
            }, 5000);
        }

        function stopAutoPlay() {
            clearInterval(testimonialInterval);
        }
    }

    // ========================================
    // BOOKING FORM
    // ========================================
    function setupBookingForm() {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Booking...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success modal
            showModal();

            // Reset form
            bookingForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
    }

    function setupDateInput() {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;

        // Set max date to 3 months from now
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        dateInput.max = maxDate.toISOString().split('T')[0];
    }

    // ========================================
    // NEWSLETTER FORM
    // ========================================
    function setupNewsletterForm() {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('newsletter-email').value;
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success
            submitBtn.textContent = 'Subscribed!';
            submitBtn.style.background = 'var(--color-success)';

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                newsletterForm.reset();
            }, 2000);
        });
    }

    // ========================================
    // MODAL
    // ========================================
    function setupModal() {
        closeModal.addEventListener('click', hideModal);

        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                hideModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
                hideModal();
            }
        });
    }

    function showModal() {
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        bookingModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    function setupScrollAnimations() {
        const revealElements = document.querySelectorAll(
            '.service-card, .gallery-item, .team-card, .about-image, .about-text, .booking-info, .booking-form'
        );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('reveal', 'active');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offset = navbar.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========================================
    // INITIALIZE ON DOM READY
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========================================
    // EXPORT FOR TESTING (optional)
    // ========================================
    window.LuxeSalon = {
        showModal,
        hideModal,
        goToTestimonial: (index) => {
            // Would need access to slider functions
        }
    };
})();