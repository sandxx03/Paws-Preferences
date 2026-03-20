const stack = document.getElementById("card-stack");
const likedSummary = document.getElementById("liked-summary");
const mainContainer = document.getElementById("main-container");
const resultsGrid = document.getElementById("liked-images");
const statsText = document.getElementById("stats-text");
const progressBar = document.getElementById("progress-bar");
const counterText = document.getElementById("counter-text");
const loadingScreen = document.getElementById("loading-screen");

// Reaction Elements
const reactionContainer = document.getElementById("reaction-container");
const heartIcon = document.getElementById("heart-icon");
const heartbreakIcon = document.getElementById("heartbreak-icon");

const total_cats = 15;
let likedCats = [];
let cardsProcessed = 0;

document.getElementById('start-btn').onclick = () => {
    document.getElementById('start-overlay').classList.add('hidden');
    init();
};

function init() {
    updateUI();
    for (let i = 0; i < Math.min(3, total_cats); i++) { // render 3 cards at the start for cleaner shadow if not shadows will stack and create layers
        createCard(i);
    }
}

function updateUI() {
    const percent = (cardsProcessed / total_cats) * 100;
    progressBar.style.width = `${percent}%`;
    counterText.innerText = `${cardsProcessed} / ${total_cats}`;
}

function createCard(index) {
    const card = document.createElement('div'); // Create a new div "box"
    card.className = 'card';    // Assign class to 'card'
    card.style.zIndex = total_cats - index; // Ensure first card is on top of the 2nd card

    // Create the loading placeholder
    const loader = document.createElement('div');
    loader.className = 'card-loader';
    loader.innerText = 'Finding kitty...';  // Placeholder

    // Create the image, initially hidden
    const imgUrl = `https://cataas.com/cat?unique=${index}`;
    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = "Cat";
    img.style.opacity = '0'; // Start hidden

    // When image loads, hide loader and show image
    img.onload = () => {
        loader.style.display = 'none';
        img.style.opacity = '1';
    };

    card.appendChild(loader);
    card.appendChild(img);
    stack.appendChild(card);

    setupSwipe(card, imgUrl);
}

function setupSwipe(card, url) {
    let startX = 0;
    let isDragging = false;

    // Use pointer events for cross-platform support (mouse & touch)
    card.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        card.style.transition = 'none';
        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const currentX = e.clientX - startX;    // Calculate how far your finger moved
        card.style.transform = `translateX(${currentX}px) rotate(${currentX / 20}deg)`; // Move the card left/right AND tilt it slightly as it moves.

        // Dynamic opacity for hint text based on swipe direction
        const hintOpacity = Math.min(Math.abs(currentX) / 100, 1);
        const nopeHint = document.querySelector('.swipe-hint.left');
        const likeHint = document.querySelector('.swipe-hint.right');

        if (currentX > 0) { // Swiping right
            likeHint.style.opacity = hintOpacity;
            nopeHint.style.opacity = '0';
        } else if (currentX < 0) { // Swiping left
            nopeHint.style.opacity = hintOpacity;
            likeHint.style.opacity = '0';
        } else {
            nopeHint.style.opacity = '0';
            likeHint.style.opacity = '0';
        }
    });

    card.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.clientX - startX;
        const threshold = 120; // Distance required to complete swipe

        card.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease';

        // Reset hint opacities
        document.querySelectorAll('.swipe-hint').forEach(el => el.style.opacity = '0');

        if (Math.abs(endX) > threshold) {
            completeSwipe(card, endX > 0 ? 'right' : 'left', url);
        } else {
            // Snap back if threshold not met
            card.style.transform = '';
        }
    });
}

function completeSwipe(card, direction, url) {
    const moveOut = direction === 'right' ? 1000 : -1000;
    // Animate card completely off-screen
    card.style.transform = `translateX(${moveOut}px) rotate(${moveOut / 15}deg)`;
    card.style.opacity = '0';

    setTimeout(() => card.remove(), 450);   // After the card flies off-screen, delete from the code.

    if (direction === 'right') {    // If user swipe right (positive distance)
        likedCats.push(url);
        showReaction('heart');
    } else {    // If user swipe left (negative distance)
        showReaction('heartbreak');
    }

    cardsProcessed++;
    updateUI();

    // Check if all cards have been swiped
    if (cardsProcessed + 2 < total_cats) {
        createCard(cardsProcessed + 2); // Every time a card is deleted, add a new one to the bottom of the stack.
    }

    if (cardsProcessed === total_cats) {
        setTimeout(() => {
            loadingScreen.classList.remove('hidden');
            setTimeout(showSummary, 1800);
        }, 500);
    }
}

// Handles showing either the heart or heartbreak icon
function showReaction(type) {
    reactionContainer.classList.remove('hidden');
    heartIcon.classList.add('hidden');
    heartbreakIcon.classList.add('hidden');

    if (type === 'heart') {
        heartIcon.classList.remove('hidden');
    } else {
        heartbreakIcon.classList.remove('hidden');
    }

    // Hide the container after animation finishes
    setTimeout(() => reactionContainer.classList.add('hidden'), 600);
}

function showSummary() {
    // Clear the main interface elements
    loadingScreen.classList.add('hidden');
    mainContainer.classList.add('hidden');
    document.querySelector('header').classList.add('hidden');

    // Show summary
    likedSummary.classList.remove('hidden');

    // Update statistics text
    statsText.innerHTML = `You liked <strong>${likedCats.length}</strong> cats out of ${total_cats}`;

    // Clear previous summary and generate new grid items (if user played previously)
    resultsGrid.innerHTML = '';

    // Render the cat images in the grid
    likedCats.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'grid-item';
        img.style.animationDelay = `${index * 0.1}s`;
        resultsGrid.appendChild(img);
    });
}

// Navigation button handlers
document.getElementById('exit-btn').onclick = () => {
    alert("Thank you for playing! 🐾");
    location.reload();
};

document.getElementById('restart-btn').onclick = () => location.reload();