// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission handling
    const waitlistForms = document.querySelectorAll('form');
    waitlistForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && validateEmail(email)) {
                // In a real app, you would send this to your backend
                console.log('Email submitted:', email);
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Thanks for joining the waitlist! We\'ll be in touch soon.';
                successMessage.style.color = '#10B981';
                successMessage.style.marginTop = '1rem';
                successMessage.style.fontWeight = '500';
                
                this.parentNode.insertBefore(successMessage, this.nextSibling);
                emailInput.value = '';
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
                
                // In a real app, you might want to redirect to a thank you page
                // or show a modal instead
            } else {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid email address.';
                errorMessage.style.color = '#EF4444';
                errorMessage.style.marginTop = '0.5rem';
                errorMessage.style.fontSize = '0.875rem';
                
                // Remove any existing error message
                const existingError = this.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                this.appendChild(errorMessage);
            }
        });
    });

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(i => {
                if (i !== item) {
                    i.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Change the plus/minus icon
            const icon = question.querySelector('span');
            if (item.classList.contains('active')) {
                question.querySelector('h3:after').textContent = '−';
            } else {
                question.querySelector('h3:after').textContent = '+';
            }
        });
    });

    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .step, .pricing-card, .testimonial');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate-fade-in');
            }
        });
    };
    
    // Initial check on page load
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Add active class to nav items on scroll
    const sections = document.querySelectorAll('section[id]');
    
    const navHighlighter = () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`nav a[href="#${sectionId}"]`)?.classList.add('active');
            } else {
                document.querySelector(`nav a[href="#${sectionId}"]`)?.classList.remove('active');
            }
        });
    };
    
    window.addEventListener('scroll', navHighlighter);
});

// Email validation helper function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// In a real app, you would add your analytics tracking code here
// For example, Google Analytics or Mixpanel
