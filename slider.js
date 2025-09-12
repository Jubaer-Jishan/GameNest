const track = document.querySelector(".carousel-track");
let slides = Array.from(document.querySelectorAll(".carousel-slide"));
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

const slideWidth = slides[0].offsetWidth + 20; // width + margin
const visibleSlides = 7;

// Clone first & last slides and preload images
const firstClones = slides.slice(0, visibleSlides).map(slide => {
  const clone = slide.cloneNode(true);
  const img = clone.querySelector('img');
  const src = img.getAttribute('src');
  const preloaded = new Image();
  preloaded.src = src;
  return clone;
});

const lastClones = slides.slice(-visibleSlides).map(slide => {
  const clone = slide.cloneNode(true);
  const img = clone.querySelector('img');
  const src = img.getAttribute('src');
  const preloaded = new Image();
  preloaded.src = src;
  return clone;
});

// Append/prepend clones
firstClones.forEach(clone => track.appendChild(clone));
lastClones.reverse().forEach(clone => track.prepend(clone));

// Update slides after cloning
slides = Array.from(document.querySelectorAll(".carousel-slide"));

// Start from first original slide
let index = visibleSlides;
track.style.transform = `translateX(-${index * slideWidth}px)`;

function moveToSlide(i) {
  track.style.transition = 'transform 0.5s ease-in-out';
  track.style.transform = `translateX(-${i * slideWidth}px)`;
}

function nextSlide() {
  index++;
  moveToSlide(index);
  track.addEventListener('transitionend', checkIndex);
}

function prevSlide() {
  index--;
  moveToSlide(index);
  track.addEventListener('transitionend', checkIndex);
}

function checkIndex() {
  track.removeEventListener('transitionend', checkIndex);
  // Wrap-around circular effect
  if (index >= slides.length - visibleSlides) {
    index = visibleSlides;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${index * slideWidth}px)`;
  }
  if (index < visibleSlides) {
    index = slides.length - (2 * visibleSlides);
    track.style.transition = 'none';
    track.style.transform = `translateX(-${index * slideWidth}px)`;
  }
}

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

// Auto slide every 3 seconds
setInterval(nextSlide, 5000);
