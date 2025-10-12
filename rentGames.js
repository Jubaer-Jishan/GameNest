// rent-games.js
document.addEventListener('DOMContentLoaded', function () {
  const games = [
   {
  id: 1,
  title: 'Elden Ring',
  image: 'sliderImage/11.jpg',
  platforms: ['PS4/PS5', 'Xbox One/Series'],
  platformKeys: ['ps', 'xbox'],
  week: 6,
  month: 17
},
{
  id: 2,
  title: 'God of War (2018)',
  image: 'sliderImage/10.jpg',
  platforms: ['PC', 'PS4/PS5'],
  platformKeys: ['pc', 'ps'],
  week: 5,
  month: 15
},
{
  id: 3,
  title: 'Sekiro: Shadows Die Twice',
  image: 'sliderImage/3.jpeg',
  platforms: ['PS4', 'PS5', 'PC'],
  platformKeys: ['ps', 'pc'],
  week: 7,
  month: 19
},
{
  id: 4,
  title: 'Spider Man',
  image: 'sliderImage/14.jpg',
  platforms: ['PS5', 'PC'],
  platformKeys: ['ps', 'pc'],
  week: 6,
  month: 18
},
{
  id: 5,
  title: 'Dark Souls 3',
  image: 'sliderImage/6.jpeg',
  platforms: ['PC', 'PS4/PS5', 'Switch'],
  platformKeys: ['pc', 'ps', 'switch'],
  week: 8,
  month: 21
},
{
  id: 6,
  title: 'Red Dead Redemption 2',
  image: 'sliderImage/1.jpeg',
  platforms: ['PS4', 'Xbox One', 'PC'],
  platformKeys: ['ps', 'xbox', 'pc'],
  week: 7,
  month: 22
},
{
  id: 7,
  title: "Assassin's Creed Mirage",
  image: 'sliderImage/9.jpg',
  platforms: ['PC', 'PS5'],
  platformKeys: ['pc', 'ps'],
  week: 5,
  month: 17
},
{
  id: 8,
  title: 'Fc 26',
  image: 'sliderImage/8.jpg',
  platforms: ['PC', 'PS5', 'Xbox One/Series'],
  platformKeys: ['pc', 'ps', 'xbox'],
  week: 6,
  month: 16
},  
{
  id: 9,
  title: 'Dishonored',
  image: 'sliderImage/17.jpg',
  platforms: ['PC', 'PS4'],
  platformKeys: ['pc', 'ps'],
  week: 7,
  month: 19
}, 
{
  id: 10,
  title: 'Little Nightmares',
  image: 'sliderImage/18.jpg',
  platforms: ['Switch', 'PS4'],
  platformKeys: ['switch', 'ps'],
  week: 8,
  month: 18
},
{
  id: 11,
  title: 'GTA V',
  image: 'sliderImage/19.jpg',
  platforms: ['PS4/PS5', 'Xbox Series X/S'],
  platformKeys: ['ps', 'xbox'],
  week: 6,
  month: 20
},
{
  id: 12,
  title: 'Hollow-Knight Silksong',
  image: 'sliderImage/20.jpg',
  platforms: ['Switch', 'PC'],
  platformKeys: ['switch', 'pc'],
  week: 5,
  month: 15
},
{
  id: 13,
  title: 'F1 25',
  image: 'sliderImage/21.jpg',
  platforms: ['PC', 'Xbox One/Series'],
  platformKeys: ['pc', 'xbox'],
  week: 7,
  month: 19
},
{
  id: 15,
  title: 'DOOM Dark Ages',
  image: 'sliderImage/22.jpg',
  platforms: ['PC', 'PS5'],
  platformKeys: ['pc', 'ps'],
  week: 6,
  month: 18
},
{
  id: 16,
  title: 'Ghost of Yotei',
  image: 'sliderImage/23.jpg',
  platforms: ['PS4', 'Switch'],
  platformKeys: ['ps', 'switch'],
  week: 8,
  month: 21
},
{
  id: 17,
  title: 'Hell is Us',
  image: 'sliderImage/24.jpg',
  platforms: ['PC', 'Xbox One/Series'],
  platformKeys: ['pc', 'xbox'],
  week: 6,
  month: 17
},

  ];

  // DOM references
  const gameGrid = document.getElementById('gameGrid');
  const searchInput = document.getElementById('searchInput');
  const platformFilter = document.getElementById('platformFilter');
  const modal = document.getElementById('rentModal');
  const modalMessage = document.getElementById('modalMessage');
  const closeBtn = document.querySelector('.close-modal');
  const modalBtn = document.querySelector('.modal-btn');
  const modalTitle = modal ? modal.querySelector('h2') : null;
  const modalIcon = modal ? modal.querySelector('.modal-icon') : null;

  function resolveEndpoint(fileName) {
    const { protocol, origin, pathname } = window.location;

    if (protocol === 'file:') {
      const decodedPath = decodeURIComponent(pathname);
      const segments = decodedPath.split('/').filter(Boolean);
      const htdocsIndex = segments.indexOf('htdocs');
      let relativeSegments = [];

      const projectIndex = segments.findIndex(segment => segment.toLowerCase() === 'gamenest');

      if (projectIndex !== -1) {
        relativeSegments = segments.slice(projectIndex);
      } else if (htdocsIndex !== -1 && segments.length > htdocsIndex + 1) {
        relativeSegments = segments.slice(htdocsIndex + 1);
      }

      if (relativeSegments.length) {
        const lastIndex = relativeSegments.length - 1;
        if (relativeSegments[lastIndex] && relativeSegments[lastIndex].includes('.')) {
          relativeSegments.pop();
        }

        const relativePath = relativeSegments.join('/');
        const prefix = relativePath ? `${relativePath}/` : '';
        return `http://localhost/${prefix}${fileName}`;
      }

      return `http://localhost/${fileName}`;
    }

    const basePath = pathname.replace(/[^/]*$/, '');
    return `${origin}${basePath}${fileName}`;
  }

  const rentalEndpoint = resolveEndpoint('record_rental.php');

  function setModalState({ title, message, icon = '✅', buttonText = 'Continue Browsing', redirect = '', disableButton = false }) {
    if (!modal) return;
    if (modalTitle && title) modalTitle.textContent = title;
    if (modalMessage && message) modalMessage.textContent = message;
    if (modalIcon && icon) modalIcon.textContent = icon;

    if (modalBtn) {
      modalBtn.textContent = buttonText;
      modalBtn.disabled = !!disableButton;
      if (redirect) {
        modalBtn.dataset.redirect = redirect;
      } else {
        delete modalBtn.dataset.redirect;
      }
    }

    modal.classList.add('show');
  }

  function hideModal() {
    if (!modal) return;
    modal.classList.remove('show');
    if (modalBtn) {
      modalBtn.disabled = false;
      delete modalBtn.dataset.redirect;
      modalBtn.textContent = 'Continue Browsing';
    }
    if (modalIcon) modalIcon.textContent = '✅';
    if (modalTitle) modalTitle.textContent = 'Rental Successful!';
    if (modalMessage) modalMessage.textContent = 'Your rental has been confirmed. Enjoy your game!';
  }

  async function persistRental(game, duration, price) {
    const payload = {
      game_id: game.id,
      game_title: game.title,
      duration,
      price,
      platforms: game.platforms ? game.platforms.join(', ') : '',
      image_url: game.image
    };

    let response;

    try {
      response = await fetch(rentalEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('record_rental fetch failed:', error);
      throw error;
    }

    if (!response.ok) {
      let message = `Network error (${response.status}) while saving rental`;

      let isAuthError = response.status === 401;

      try {
        const errorPayload = await response.json();
        if (errorPayload && typeof errorPayload.error === 'string') {
          message = errorPayload.error;
        }
        if (response.status === 401) {
          const authError = new Error(message);
          authError.code = 'AUTH';
          throw authError;
        }
      } catch (parseError) {
        console.error('Failed to parse rental error response:', parseError);
      }

      if (isAuthError) {
        const authError = new Error(message);
        authError.code = 'AUTH';
        throw authError;
      }

      throw new Error(message);
    }

    const result = await response.json();
    if (!result.success) {
      const error = new Error(result.error || 'Failed to save rental');
      if (result.error === 'Not logged in') {
        error.code = 'AUTH';
      }
      throw error;
    }

    return result;
  }

  // ---------- CREATE CARD ----------
  function createCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-platforms', game.platformKeys.join(' '));

    card.innerHTML = `
      <div class="game-image">
        <img src="${game.image}" alt="${game.title}">
      </div>
      <div class="game-info">
        <h3>${game.title}</h3>
        <div class="platforms">
          ${game.platforms
            .map(
              (plat, i) =>
                `<span class="platform-tag">${plat}</span>`
            )
            .join('')}
        </div>
        <div class="pricing">
          <div class="price-option">
            <span class="price-label">Weekly</span>
            <span class="price-value">$${game.week}</span>
            <button type="button" class="rent-btn" data-duration="week" data-price="${game.week}" data-title="${game.title}">
              Rent Week
            </button>
          </div>
          <div class="price-option">
            <span class="price-label">Monthly</span>
            <span class="price-value">$${game.month}</span>
            <button type="button" class="rent-btn" data-duration="month" data-price="${game.month}" data-title="${game.title}">
              Rent Month
            </button>
          </div>
        </div>
      </div>
    `;
    return card;
  }

  // ---------- RENDER ALL GAMES ----------
  function renderGameCards(games) {
    gameGrid.innerHTML = '';
    if (games.length === 0) {
      gameGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-gamepad"></i>
          <h3>No games found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      `;
      return;
    }
    games.forEach(game => gameGrid.appendChild(createCard(game)));
    attachRentListeners();
  }

  // ---------- EVENT HANDLING ----------
  function attachRentListeners() {
    const rentButtons = document.querySelectorAll('.rent-btn');

    rentButtons.forEach(button => {
      button.addEventListener('click', () => {
        const title = button.getAttribute('data-title');
        const duration = button.getAttribute('data-duration');
        const price = Number(button.getAttribute('data-price'));
        const selectedGame = games.find((item) => item.title === title);

        if (!modal) return;

        setModalState({
          title: 'Processing Rental...',
          message: `Locking in "${title}" for you. Hold tight!`,
          icon: '⏳',
          buttonText: 'Processing',
          disableButton: true
        });

        if (!selectedGame) {
          setModalState({
            title: 'Something Went Wrong',
            message: 'Unable to find the selected game. Please refresh and try again.',
            icon: '⚠️',
            buttonText: 'Close'
          });
          return;
        }

        persistRental(selectedGame, duration, price)
          .then(() => {
            setModalState({
              title: 'Rental Confirmed!',
              message: `You've rented "${title}" for ${duration === 'week' ? '1 Week' : '1 Month'} at $${price}. Enjoy your game!`,
              icon: '✅',
              buttonText: 'Continue Browsing'
            });
          })
          .catch((error) => {
            if (error.code === 'AUTH') {
              setModalState({
                title: 'Login Required',
                message: 'Please log in to rent games and track them in your profile.',
                icon: '🔒',
                buttonText: 'Go to Login',
                redirect: 'auth.html'
              });
            } else {
              setModalState({
                title: 'Something Went Wrong',
                message: error.message || 'Unable to complete rental right now. Please try again later.',
                icon: '⚠️',
                buttonText: 'Close'
              });
            }
          });
      });
    });
  }

  // Close modal handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideModal();
    });
  }

  if (modalBtn) {
    modalBtn.addEventListener('click', () => {
      if (modalBtn.dataset.redirect === 'auth.html') {
        window.location.href = 'auth.html';
        return;
      }

      hideModal();
    });
  }

  // Close modal on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
  }

  // ---------- FILTER & SEARCH ----------
  function filterGames() {
    const searchTerm = searchInput.value.toLowerCase();
    const platformValue = platformFilter.value;

    const filteredGames = games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm);
      const matchesPlatform = platformValue === '' || game.platformKeys.includes(platformValue);
      return matchesSearch && matchesPlatform;
    });

    renderGameCards(filteredGames);
  }

  searchInput.addEventListener('input', filterGames);
  platformFilter.addEventListener('change', filterGames);

  // ---------- INITIAL RENDER ----------
  renderGameCards(games);
});
