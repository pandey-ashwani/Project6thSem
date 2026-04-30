// Admin Add Doctor Form - AJAX Submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form[action="/add-doctor"]');
  if (!form) {
    console.log('Form not found - addDoctor.js');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');

  // Form submit handler
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Adding Doctor...';

try {
      // Create URL-encoded form data (more reliable)
      const formData = new URLSearchParams(new FormData(form));
      
      const response = await fetch('/add-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const result = await response.text();
      console.log('Response:', response.status, result);

      if (response.ok || response.status === 201) {
        // Success - show message and redirect
        alert('Doctor added successfully!');
        window.location.href = '/home';
      } else {
        // Error from server
        alert('Error: ' + result);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Network error. Please try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });
  
  console.log('addDoctor.js loaded');
});
