// SuperAdmin Login - Modern Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Detect if login or signup page
    const isSignup = document.body.matches('.superadmin-signup-page') || window.location.pathname.includes('signup');
    const form = document.querySelector('form');
    const passwordInput = document.querySelector('#password');
    const confirmPasswordInput = document.querySelector('#confirm-password');
    const passwordToggle = document.querySelector('.superadmin-password-toggle');
    const loginBtn = document.querySelector('.superadmin-btn-primary');
    const strengthMeter = document.querySelector('.superadmin-strength-fill');
    const strengthText = document.querySelector('.superadmin-strength-text');
    const matchIcon = document.querySelector('.superadmin-match-icon');
    const body = document.body;

    // Enhanced password handling for both login and signup
    function initPasswordToggle(input, toggle) {
        if (toggle && input) {
            toggle.addEventListener('click', function() {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }
    }

// Initialize password toggles
    initPasswordToggle(passwordInput, passwordToggle);
    if (confirmPasswordInput) {
        const confirmToggle = document.querySelector('.confirm-password-toggle');
        initPasswordToggle(confirmPasswordInput, confirmToggle);
    }

    // Form submission with loading state
    if (form) {
        form.addEventListener('submit', function(e) {
            if (isSignup) {
                if (!validateSignupForm()) {
                    e.preventDefault();
                    return false;
                }
            } else {
                if (!validateLoginForm()) {
                    e.preventDefault();
                    return false;
                }
            }
            showLoading(true);
        });
    }

    function validateLoginForm() {
        const username = document.querySelector('#username')?.value.trim();
        const password = passwordInput?.value.trim();

        if (!username || !password) {
            showError('Please fill in all fields');
            return false;
        }
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return false;
        }
        return true;
    }

    function validateSignupForm() {
        const name = document.querySelector('#name')?.value.trim();
        const email = document.querySelector('#email')?.value.trim();
        const phone = document.querySelector('#phone')?.value.trim();
        const username = document.querySelector('#username')?.value.trim();
        const password = passwordInput?.value.trim();
        const confirmPassword = confirmPasswordInput?.value.trim();

        if (!name || !email || !phone || !username || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return false;
        }

        if (name.length < 2) {
            showError('Name must be at least 2 characters');
            return false;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            showError('Please enter a valid email address');
            return false;
        }

        if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
            showError('Please enter a valid 10-digit phone number');
            return false;
        }

        if (username.length < 3) {
            showError('Username must be at least 3 characters');
            return false;
        }

        if (password.length < 8) {
            showError('Password must be at least 8 characters');
            return false;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return false;
        }

        return true;
    }

// Real-time validation and feedback
    function initRealTimeValidation() {
        const inputs = document.querySelectorAll('.superadmin-input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                hideError();
                this.classList.remove('error');
                if (isSignup) updateSignupFeedback();
            });

            input.addEventListener('blur', function() {
                if (isSignup) validateSignupField(this);
                else validateLoginField(this);
            });
        });
    }

    initRealTimeValidation();

function validateLoginField(input) {
        const value = input.value.trim();
        if (!value) input.classList.add('error');
    }

    function validateSignupField(input) {
        const id = input.id;
        const value = input.value.trim();

        if (!value) {
            input.classList.add('error');
            return;
        }

        let isValid = true;
        switch(id) {
            case 'email':
                isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
                break;
            case 'phone':
                isValid = /^\d{10}$/.test(value.replace(/\D/g, ''));
                break;
            case 'username':
                isValid = value.length >= 3;
                break;
        }

        if (!isValid) input.classList.add('error');
        else input.classList.remove('error');
    }

    function updateSignupFeedback() {
        if (!isSignup) return;

        // Password strength
        if (passwordInput && strengthMeter && strengthText) {
            const strength = calculatePasswordStrength(passwordInput.value);
            updateStrengthMeter(strength);
        }

        // Password match
        if (confirmPasswordInput && passwordInput && matchIcon) {
            const match = passwordInput.value === confirmPasswordInput.value;
            updatePasswordMatch(match);
        }
    }

    function calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return Math.min(score, 4);
    }

    function updateStrengthMeter(strength) {
        const fill = strengthMeter;
        const text = strengthText;
        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        const classes = ['strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];

        fill.className = 'superadmin-strength-fill' + (strength > 0 ? ' ' + classes[strength - 1] : '');
        text.textContent = strength > 0 ? (labels[strength - 1] || 'Weak') : 'Weak';
    }

    function updatePasswordMatch(match) {
        const icon = matchIcon;
        if (match) {
            icon.className = 'superadmin-match-icon match-valid fas fa-check-circle';
        } else if (confirmPasswordInput.value.length > 0) {
            icon.className = 'superadmin-match-icon match-invalid fas fa-times-circle';
        } else {
            icon.className = 'superadmin-match-icon match-checking fas fa-circle';
        }
    }

    // Error handling
    function showError(message) {
        hideError();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'superadmin-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
        `;
        form.insertBefore(errorDiv, form.firstElementChild.nextSibling);
        
        // Shake animation
        errorDiv.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function hideError() {
        const existingError = document.querySelector('.superadmin-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function showLoading(show) {
        if (show) {
            // Disable the button in a setTimeout to avoid canceling the browser's form submission
            setTimeout(() => {
                if (loginBtn) loginBtn.disabled = true;
            }, 0);

            if (loginBtn) {
                loginBtn.innerHTML = isSignup ? `
                    <span>Creating Account...</span>
                    <div class="spinner-border spinner-border-sm ms-2" role="status"></div>
                ` : `
                    <span>Logging in...</span>
                    <div class="spinner-border spinner-border-sm ms-2" role="status"></div>
                `;
            }
            body.classList.add('superadmin-loading');
        } else {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = isSignup ? 
                    'Create Account <i class="fas fa-arrow-right ms-2"></i>' : 
                    'Log In <i class="fas fa-arrow-right ms-2"></i>';
            }
            body.classList.remove('superadmin-loading');
        }
    }

    // Auto-hide loading on page unload (in case of errors)
    window.addEventListener('beforeunload', function() {
        showLoading(false);
    });

    // Focus first input on page load
    setTimeout(() => {
        document.querySelector('#username').focus();
    }, 500);

    console.log('✅ SuperAdmin Login JS loaded');
});
