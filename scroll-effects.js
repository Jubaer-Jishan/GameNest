// GameNest Simple Effects - Counter Animation Only
document.addEventListener('DOMContentLoaded', function() {
  
  // Number counter animation
  function animateCounter(element, target, suffix = '') {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      if (suffix === '%') {
        element.textContent = Math.floor(current) + suffix;
      } else if (target >= 1000) {
        element.textContent = (current / 1000).toFixed(1) + 'K+';
      } else {
        element.textContent = Math.floor(current) + (suffix ? '+' : '');
      }
    }, 16);
  }
  
  // Initialize counters when visible
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach((stat, index) => {
          const target = parseInt(stat.getAttribute('data-count'));
          const suffix = index === 2 ? '%' : '';
          setTimeout(() => {
            animateCounter(stat, target, suffix);
          }, index * 200);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  
  const statsContainer = document.querySelector('.hero-stats-inline');
  if (statsContainer) {
    statsObserver.observe(statsContainer);
  }
  
  console.log('🎮 GameNest Counter Animation Loaded');
});
