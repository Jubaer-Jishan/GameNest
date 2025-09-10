document.addEventListener("DOMContentLoaded", function() {
    // Initialize particles.js
    particlesJS("particles-js", {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.2,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.2, sync: false }
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 3, size_min: 0.1, sync: false }
        },
        line_linked: { enable: true, distance: 120, color: "#ffffff", opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },  // hover effect: grab, repulse, bubble
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 150, line_linked: { opacity: 0.3 } },
          repulse: { distance: 120, duration: 0.4 },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  
    // Radial masking effect: center opacity lower, edges higher
    const canvas = document.querySelector('#particles-js canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const originalDraw = ctx.drawImage;
      
      canvas.style.pointerEvents = "none"; // make sure cursor events still work
  
      // subtle parallax cursor effect
      document.addEventListener('mousemove', e => {
        const moveX = (e.clientX - window.innerWidth/2) * 0.08;
        const moveY = (e.clientY - window.innerHeight/2) * 0.08;
        canvas.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
  
      // radial masking by overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.pointerEvents = 'none';
      overlay.style.background = 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 0%)';
      overlay.style.zIndex = '0';
      document.body.appendChild(overlay);
    }
  });
  