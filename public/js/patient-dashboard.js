// Patient Dashboard - Interactive Features
document.addEventListener('DOMContentLoaded', function() {
  
  // Animated Stats Counters
  const counters = document.querySelectorAll('.stat-number');
  const animateCounters = () => {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const count = parseInt(counter.innerText);
      const increment = target / 100;
      
      if (count < target) {
        counter.innerText = Math.floor(count + increment);
        setTimeout(animateCounters, 30);
      } else {
        counter.innerText = target;
      }
    });
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  });
  
  document.querySelector('.patient-stats-grid')?.parentNode && observer.observe(document.querySelector('.patient-stats-grid'));
  
  // Quick Action Clicks (Ripple Effect)
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('div');
      ripple.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
  
  // Hero CTA Hover Effects
  document.querySelectorAll('.cta-buttons button').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05) translateY(-4px)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) translateY(0)';
    });
  });
  
  // Live Health Metrics Animation (Pulse)
  const pulseElements = document.querySelectorAll('.live-metric');
  pulseElements.forEach(el => {
    setInterval(() => {
      el.style.transform = 'scale(1.05)';
      setTimeout(() => el.style.transform = 'scale(1)', 200);
    }, 2000);
  });
  
  // Notification Toggle
  const notificationToggle = document.querySelector('.notification-toggle');
  if (notificationToggle) {
    notificationToggle.addEventListener('click', function() {
      document.querySelector('.notifications-panel').classList.toggle('active');
      this.classList.toggle('active');
    });
  }
  
  // Dark/Light Mode Toggle (Optional)
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }
  
  // Parallax Hero Effect
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroShapes = document.querySelector('.hero-shapes');
    if (heroShapes) {
      heroShapes.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });
  
  // Smooth Scroll to Sections
  document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
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
});
