// Preloader functionality
document.addEventListener('DOMContentLoaded', function() {
  const preloader = document.getElementById('gamenest-preloader');
  
  if (!preloader) return;

  // Generate random particles
  const particlesContainer = preloader.querySelector('.preloader-particles');
  if (particlesContainer) {
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (8 + Math.random() * 4) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  // Hide preloader after page load
  window.addEventListener('load', function() {
    setTimeout(function() {
      preloader.classList.add('hidden');
      
      // Remove preloader from DOM after animation
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 500);
    }, 800); // Show for at least 800ms
  });

  // Fallback: Hide preloader after 5 seconds if page hasn't fully loaded
  setTimeout(function() {
    if (!preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 500);
    }
  }, 5000);
});
