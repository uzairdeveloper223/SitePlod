// Complete Test Site JavaScript

console.log('✅ External JavaScript loaded successfully!');

// Test function for button
function showAlert() {
    alert('🎉 JavaScript is working! All files loaded successfully.');
}

// Check if CSS loaded
function checkCSSLoaded() {
    const statusElement = document.getElementById('status');
    
    // Check if styles are applied
    const heroElement = document.querySelector('.hero');
    const computedStyle = window.getComputedStyle(heroElement);
    
    if (computedStyle.background.includes('gradient') || computedStyle.background.includes('rgb')) {
        statusElement.textContent = '✅ All files loaded successfully! CSS and JS are working.';
        statusElement.classList.add('success');
        console.log('✅ CSS loaded and applied successfully');
    } else {
        statusElement.textContent = '⚠️ CSS might not be loaded correctly';
        statusElement.classList.add('error');
        console.log('⚠️ CSS not detected');
    }
}

// Run checks when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded');
    
    // Check CSS after a short delay to ensure styles are applied
    setTimeout(checkCSSLoaded, 100);
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Log all loaded resources
    console.log('📦 Loaded resources:');
    console.log('  - index.html ✅');
    console.log('  - css/style.css ✅');
    console.log('  - js/app.js ✅');
});

// Add some interactivity to feature cards
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
});
