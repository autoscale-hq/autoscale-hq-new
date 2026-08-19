/* ============================================
   AUTOSCALE HQ — Contact Form
   Validation · Animated states · Submission
   ============================================ */

(function () {
  'use strict';

  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const formContent = form.closest('.contact-form-card')?.querySelector('.form-content') || form;
    const formSuccess = form.closest('.contact-form-card')?.querySelector('.form-success');

    // Validation rules
    const validators = {
      name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters)',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address',
      phone: (v) => !v || /^[\d\s\-\+\(\)]{7,}$/.test(v) ? '' : 'Please enter a valid phone number',
      company: () => '', // optional
      service: (v) => v ? '' : 'Please select a service',
      message: (v) => v.trim().length >= 10 ? '' : 'Please enter a message (at least 10 characters)',
    };

    // Real-time validation on blur
    form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group?.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    function validateField(input) {
      const name = input.name;
      const value = input.value;
      const group = input.closest('.form-group');
      const errorEl = group?.querySelector('.form-error');
      const validator = validators[name];

      if (!validator || !group) return true;

      const error = validator(value);

      if (error) {
        group.classList.add('error');
        group.classList.remove('success');
        if (errorEl) errorEl.textContent = error;
        return false;
      } else {
        group.classList.remove('error');
        if (value.trim()) group.classList.add('success');
        if (errorEl) errorEl.textContent = '';
        return true;
      }
    }

    function validateAll() {
      let isValid = true;
      form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach((input) => {
        if (!validateField(input)) isValid = false;
      });
      return isValid;
    }

    // Submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateAll()) {
        // Shake the first error field
        const firstError = form.querySelector('.form-group.error .form-input, .form-group.error .form-textarea');
        if (firstError) {
          firstError.style.animation = 'none';
          firstError.offsetHeight; // trigger reflow
          firstError.style.animation = 'shake 0.4s ease-in-out';
          firstError.focus();
        }
        return;
      }

      // Collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Animate button to loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        Sending...
      `;
      submitBtn.style.opacity = '0.7';

      // Simulate submission delay (replace with actual fetch to your endpoint)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success state
      submitBtn.innerHTML = '✓ Sent!';
      submitBtn.style.background = 'var(--color-teal)';

      // After a moment, show the success message
      setTimeout(() => {
        if (formContent && formSuccess) {
          formContent.style.display = 'none';
          formSuccess.classList.add('show');
        }

        // Reset form
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style.opacity = '';
        submitBtn.style.background = '';

        form.querySelectorAll('.form-group').forEach((g) => {
          g.classList.remove('error', 'success');
        });
      }, 1000);

      // Log data to console for debugging
      console.log('Form submitted:', data);
    });
  }

  // Add shake keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    .btn-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(11, 15, 20, 0.3);
      border-top-color: var(--color-ink);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
