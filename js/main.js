// FluentLanguage.net - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const isActive = navLinks.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
        });
    }

    // Load reviews
    if (document.getElementById('reviews-container')) {
        loadReviews();
    }

    // Interactive star rating
    initStarRating();

    // Character counter
    initCharCounter();

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Review form
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
});

// Star rating interaction
function initStarRating() {
    const bar = document.querySelector('.star-rating-bar');
    if (!bar) return;

    const stars = bar.querySelectorAll('.rating-star');
    const input = document.getElementById('rating-value');
    let selected = 0;

    function setStars(rating) {
        stars.forEach(s => {
            const val = parseInt(s.dataset.value);
            s.classList.toggle('active', val <= rating);
            s.setAttribute('aria-checked', val <= rating);
        });
    }

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selected = parseInt(star.dataset.value);
            input.value = selected;
            setStars(selected);
        });

        star.addEventListener('mouseenter', () => {
            setStars(parseInt(star.dataset.value));
        });

        star.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selected = parseInt(star.dataset.value);
                input.value = selected;
                setStars(selected);
            }
        });
    });

    bar.addEventListener('mouseleave', () => setStars(selected));
}

// Character counter for review textarea
function initCharCounter() {
    const textarea = document.getElementById('review-text');
    const counter = document.getElementById('char-count');
    if (!textarea || !counter) return;

    textarea.addEventListener('input', () => {
        counter.textContent = textarea.value.length;
    });
}

// Fetch with timeout
function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
}

// Get CSRF token
async function getCsrfToken() {
    const res = await fetchWithTimeout('api/csrf.php');
    const data = await res.json();
    return data.token;
}

// Load reviews from backend
async function loadReviews() {
    const container = document.getElementById('reviews-container');
    const summary = document.getElementById('reviews-summary');

    try {
        const res = await fetchWithTimeout('api/reviews.php?action=list');
        const data = await res.json();

        if (data.success && data.reviews.length > 0) {
            updateReviewsSummary(data.reviews);
            container.innerHTML = data.reviews.map(createReviewCard).join('');
        } else {
            if (summary) summary.style.display = 'none';
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>No reviews yet</h3>
                    <p>Be the first to share your experience!</p>
                </div>`;
        }
    } catch (err) {
        console.error('Error loading reviews:', err);
        if (summary) summary.style.display = 'none';
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Unable to load reviews</h3>
                <p>Please try again later.</p>
            </div>`;
    }
}

function updateReviewsSummary(reviews) {
    const total = reviews.length;
    const avg = reviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / total;

    const avgEl = document.getElementById('average-rating');
    const starsEl = document.getElementById('summary-stars');
    const totalEl = document.getElementById('total-reviews');

    if (avgEl) avgEl.textContent = avg.toFixed(1);
    if (starsEl) starsEl.innerHTML = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    if (totalEl) totalEl.textContent = total;
}

function createReviewCard(review) {
    const rating = parseInt(review.rating) || 0;
    const stars = '<span class="star filled">★</span>'.repeat(rating) +
                  '<span class="star empty">★</span>'.repeat(5 - rating);

    const date = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const name = review.name || 'Anonymous';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${initials}</div>
                    <div class="reviewer-details">
                        <span class="reviewer-name">${escapeHtml(name)}</span>
                        <span class="review-date">${date}</span>
                    </div>
                </div>
            </div>
            <div class="review-rating" aria-label="${rating} out of 5 stars">${stars}</div>
            <p class="review-text">${escapeHtml(review.comment)}</p>
        </div>`;
}

// Shared form submission
async function handleFormSubmit(form, apiUrl, successMsg) {
    const msgDiv = document.getElementById('form-message');
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.textContent;

    if (form.querySelector('input[name="website"]').value) return false;

    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
        const token = await getCsrfToken();
        const fd = new FormData(form);
        fd.append('csrf_token', token);

        const res = await fetchWithTimeout(apiUrl, {
            method: 'POST', body: fd, credentials: 'include'
        });
        const data = await res.json();

        msgDiv.style.display = 'block';
        if (data.success) {
            msgDiv.className = 'form-message success';
            msgDiv.textContent = successMsg;
            form.reset();
            return true;
        } else {
            msgDiv.className = 'form-message error';
            msgDiv.textContent = data.message || 'Something went wrong. Please try again.';
            return false;
        }
    } catch (err) {
        msgDiv.style.display = 'block';
        msgDiv.className = 'form-message error';
        msgDiv.textContent = err.name === 'AbortError'
            ? 'Request timed out. Please check your connection and try again.'
            : 'An error occurred. Please try again.';
        return false;
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    await handleFormSubmit(e.target, 'api/contact.php',
        'Message sent successfully! Isela will get back to you within 24-48 hours.');
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const msgDiv = document.getElementById('form-message');

    // Validate rating selection
    const ratingVal = document.getElementById('rating-value').value;
    if (!ratingVal || ratingVal === '0') {
        msgDiv.style.display = 'block';
        msgDiv.className = 'form-message error';
        msgDiv.textContent = 'Please select a rating.';
        return;
    }

    const success = await handleFormSubmit(form, 'api/reviews.php',
        'Thank you for your review! It has been submitted successfully.');

    if (success) {
        // Reset star display and counter
        document.querySelectorAll('.rating-star').forEach(s => s.classList.remove('active'));
        document.getElementById('rating-value').value = '0';
        const counter = document.getElementById('char-count');
        if (counter) counter.textContent = '0';
        loadReviews();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
