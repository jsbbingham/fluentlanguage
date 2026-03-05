// FluentLanguage.net - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Load reviews on reviews page
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) {
        loadReviews();
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Review form submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
});

// Load reviews from backend
async function loadReviews() {
    const container = document.getElementById('reviews-container');
    const summaryEl = document.getElementById('reviews-summary');
    
    try {
        const response = await fetch('api/reviews.php?action=list');
        const data = await response.json();
        
        if (data.success && data.reviews.length > 0) {
            // Update summary stats
            updateReviewsSummary(data.reviews);
            
            // Render reviews
            container.innerHTML = data.reviews.map(review => createReviewCard(review)).join('');
        } else {
            // Hide summary if no reviews
            if (summaryEl) summaryEl.style.display = 'none';
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>No reviews yet</h3>
                    <p>Be the first to share your experience!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        if (summaryEl) summaryEl.style.display = 'none';
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Unable to load reviews</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Update reviews summary statistics
function updateReviewsSummary(reviews) {
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / totalReviews;
    
    // Update average rating display
    const avgEl = document.getElementById('average-rating');
    const starsEl = document.getElementById('summary-stars');
    const totalEl = document.getElementById('total-reviews');
    
    if (avgEl) avgEl.textContent = averageRating.toFixed(1);
    if (starsEl) starsEl.innerHTML = '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating));
    if (totalEl) totalEl.textContent = totalReviews;
}

// Create review card HTML
function createReviewCard(review) {
    const rating = parseInt(review.rating) || 0;
    const fullStars = '<span class="star filled">★</span>';
    const emptyStars = '<span class="star empty">★</span>';
    const stars = fullStars.repeat(rating) + emptyStars.repeat(5 - rating);
    
    const date = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
        </div>
    `;
}

// Handle contact form submission
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const messageDiv = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Honeypot check
    if (form.querySelector('input[name="website"]').value) {
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('api/contact.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        messageDiv.style.display = 'block';
        
        if (data.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = 'Message sent successfully! Isela will get back to you within 24-48 hours.';
            form.reset();
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = data.message || 'Failed to send message. Please try again.';
        }
    } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'An error occurred. Please try again or email directly.';
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
}

// Handle review form submission
async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const messageDiv = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Honeypot check
    if (form.querySelector('input[name="website"]').value) {
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    formData.append('action', 'submit');
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const response = await fetch('api/reviews.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        messageDiv.style.display = 'block';
        
        if (data.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = 'Thank you for your review! It has been submitted successfully.';
            form.reset();
            // Reload reviews
            loadReviews();
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = data.message || 'Failed to submit review. Please try again.';
        }
    } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Review';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
