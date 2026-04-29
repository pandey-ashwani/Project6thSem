// Admin Add Doctor Form - Modern Validation & UX
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form[action="/add-doctor"]');
  if (!form) return;

  const inputs = {
    username: form.querySelector('#username'),
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    phone: form.querySelector('#phone'),
    specialization: form.querySelector('#specialization'),
    experience: form.querySelector('#experience'),
    qualification: form.querySelector('#qualification'),
    password: form.querySelector('#password')
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  const strengthBar = document.createElement('div');
  strengthBar.className = 'password-strength';
  inputs.password.parentNode.appendChild(strengthBar);

  let isValid = false;

  // Real-time validation
  Object.keys(inputs).forEach(key => {
    if (!inputs[key]) return;
    
    inputs[key].addEventListener('blur', validateField.bind(null, key));
    inputs[key].addEventListener('input', () => {
      if (key === 'password') updatePasswordStrength(inputs.password.value);
      validateField(key);
    });
  });

  // Field validation
  function validateField(fieldKey) {
    const field = inputs[fieldKey];
    const value = field.value.trim();
    let feedback = field.parentNode.querySelector('.invalid-feedback, .valid-feedback');
    
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentNode.appendChild(feedback);
    }

    let isFieldValid = true;
    let message = '';

    switch (fieldKey) {
      case 'username':
        if (value.length < 3) {
          isFieldValid = false;
          message = 'Username must be at least 3 characters';
        }
        break;
        
      case 'name':
        if (value.length < 2) {
          isFieldValid = false;
          message = 'Name must be at least 2 characters';
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isFieldValid = false;
          message = 'Enter valid email address';
        }
        break;
        
      case 'phone':
        const phoneNum = value.replace(/[^0-9]/g, '');
        if (phoneNum.length !== 10) {
          isFieldValid = false;
          message = 'Phone must be 10 digits';
        } else {
          field.value = phoneNum; // Clean format
        }
        break;
        
      case 'specialization':
      case 'qualification':
        if (value.length < 2) {
          isFieldValid = false;
          message = `Enter ${fieldKey} details`;
        }
        break;
        
      case 'experience':
        const expNum = parseInt(value);
        if (isNaN(expNum) || expNum < 0 || expNum > 50) {
          isFieldValid = false;
          message = 'Experience must be 0-50 years';
        }
        break;
    }

    if (isFieldValid && value) {
      field.classList.add('is-valid');
      field.classList.remove('is-invalid');
      feedback.className = 'valid-feedback';
      feedback.textContent = 'Looks good!';
    } else if (value) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      feedback.className = 'invalid-feedback';
      feedback.textContent = message;
    } else {
      field.classList.remove('is-valid', 'is-invalid');
      feedback.textContent = '';
    }

    updateSubmitState();
  }

  // Password strength
  function updatePasswordStrength(password) {
    const score = calculatePasswordScore(password);
    strengthBar.className = 'password-strength';
    
    switch (score) {
      case 1: strengthBar.classList.add('strength-weak'); break;
      case 2: strengthBar.classList.add('strength-fair'); break;
      case 3: strengthBar.classList.add('strength-good'); break;
      case 4: strengthBar.classList.add('strength-strong'); break;
    }
  }

  function calculatePasswordScore(password) {
    let score = 0;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  // Update submit button
  function updateSubmitState() {
    const allValid = Object.keys(inputs).every(key => {
      const field = inputs[key];
      return field.classList.contains('is-valid');
    });
    
    submitBtn.disabled = !allValid;
    isValid = allValid;
  }

  // Form submit
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!isValid) {
      showFeedback('Please fix all errors before submitting', 'error');
      return;
    }

    // Show loader
    const originalText = submitBtn.textContent;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Adding Doctor...';

    try {
      const formData = new FormData(form);
      const response = await fetch('/add-doctor', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        showSuccessModal('Doctor added successfully!', '/home');
      } else {
        const error = await response.text();
        showFeedback(error || 'Error adding doctor', 'error');
      }
    } catch (err) {
      showFeedback('Network error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.innerHTML = originalHTML;
    }
  });

  // Modal functions
  function showSuccessModal(title, redirectUrl) {
    let modal = document.querySelector('.success-modal');
    if (!modal) {
      modal = createSuccessModal(title, redirectUrl);
      document.body.appendChild(modal);
    }
    
    modal.querySelector('.success-title').textContent = title;
    modal.classList.add('show');
    
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
  }

  function createSuccessModal(title, redirectUrl) {
    return `
      <div class="success-modal">
        <div class="success-modal-content">
          <div class="success-icon">
            <i class="fa-solid fa-check-circle"></i>
          </div>
          <h2 class="success-title">${title}</h2>
          <button class="success-btn" onclick="window.location.href='${redirectUrl}'">
            <i class="fa-solid fa-home"></i> Go to Dashboard
          </button>
        </div>
      </div>
    `;
  }

  function showFeedback(message, type = 'success') {
    // Simple toast-like feedback
    const toast = document.createElement('div');
    toast.className = `toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 10001;
      transform: translateX(400px);
      transition: var(--transition);
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initial validation
  Object.keys(inputs).forEach(validateField);
});
