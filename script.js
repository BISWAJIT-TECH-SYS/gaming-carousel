let currentIndex = 0;
let autoPlayInterval = null;
let autoPlaySpeed = 5000; // Default 5 seconds
let isAutoPlayOn = false;
let isSoundOn = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDots();
    setupKeyboardNavigation();
    setupSwipeNavigation();
    updateGameCounter();
    
    // Set initial button states
    document.getElementById('autoPlayBtn').classList.remove('active');
    document.getElementById('soundBtn').classList.remove('active');
});

// Move carousel
function moveCarousel(direction) {
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    currentIndex += direction;

    // Loop back or forward
    if (currentIndex >= totalItems) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = totalItems - 1;
    }

    // Move carousel with smooth animation
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update UI
    updateDots();
    updateGameCounter();
    playSound();

    // Reset auto-play timer if it's running
    if (isAutoPlayOn) {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }
}

// Go to specific slide
function currentSlide(index) {
    currentIndex = index;
    const carousel = document.querySelector('.carousel');
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
    updateGameCounter();
    playSound();
}

// Update dots
function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Update game counter
function updateGameCounter() {
    document.getElementById('currentGame').textContent = currentIndex + 1;
}

// Toggle auto-play
function toggleAutoPlay() {
    const btn = document.getElementById('autoPlayBtn');
    
    if (isAutoPlayOn) {
        clearInterval(autoPlayInterval);
        isAutoPlayOn = false;
        btn.classList.remove('active');
    } else {
        startAutoPlay();
        isAutoPlayOn = true;
        btn.classList.add('active');
    }
}

// Start auto-play
function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        moveCarousel(1);
    }, autoPlaySpeed);
}

// Update auto-play speed
function updateAutoPlaySpeed() {
    const slider = document.getElementById('speedSlider');
    autoPlaySpeed = (11 - parseInt(slider.value)) * 1000; // Invert so higher number = faster
    
    if (isAutoPlayOn) {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }
}

// Toggle sound
function toggleSound() {
    const btn = document.getElementById('soundBtn');
    isSoundOn = !isSoundOn;
    
    if (isSoundOn) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}

// Play sound effect
function playSound() {
    if (!isSoundOn) return;
    
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Fallback if audio context fails
        console.log('Audio not supported');
    }
}

// Keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            moveCarousel(-1);
        } else if (e.key === 'ArrowRight') {
            moveCarousel(1);
        }
    });
}

// Swipe/Touch support
function setupSwipeNavigation() {
    const carousel = document.querySelector('.carousel-wrapper');
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        // Pause auto-play on touch
        if (isAutoPlayOn) {
            clearInterval(autoPlayInterval);
        }
    }, false);

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swiped left - next image
            moveCarousel(1);
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swiped right - previous image
            moveCarousel(-1);
        }
    }
}

// Pause on hover
document.addEventListener('mouseover', (e) => {
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper && carouselWrapper.contains(e.target)) {
        if (isAutoPlayOn) {
            clearInterval(autoPlayInterval);
        }
    }
});

document.addEventListener('mouseout', (e) => {
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper && !carouselWrapper.contains(e.relatedTarget) && isAutoPlayOn) {
        startAutoPlay();
    }
});