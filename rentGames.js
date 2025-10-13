// rent-games.js
document.addEventListener('DOMContentLoaded', function () {
  let games = [];
  const platformLabels = {
    pc: 'PC',
    ps: 'PlayStation',
    xbox: 'Xbox',
    switch: 'Switch'
  };
  const fallbackImage = 'sliderImage/1.jpeg';

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
  const authRedirect = 'auth.html?redirect=rentGames.html';

  function getCachedSessionSnapshot() {
    if (window.GameNestSession?.authenticated) {
      return window.GameNestSession;
    }

    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      try {
        const cachedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (cachedUser) {
          return { authenticated: true, user: cachedUser };
        }
      } catch (error) {
        console.warn('GameNest Rentals: failed to parse cached user', error);
      }
    }

    return { authenticated: false };
  }

  function getSessionId() {
    return window.GameNestSessionId || localStorage.getItem('gamenestSessionId') || sessionStorage.getItem('gamenestSessionId') || null;
  }

  let sessionState = getCachedSessionSnapshot();

  function isAuthenticated() {
    return !!sessionState?.authenticated;
  }

  function updateRentButtonState() {
    document.querySelectorAll('.rent-btn').forEach((button) => {
      const disabled = !isAuthenticated();
      button.disabled = disabled;
      button.classList.toggle('rent-btn-disabled', disabled);
      if (disabled) {
        button.title = 'Login required to rent';
      } else {
        button.removeAttribute('title');
      }
    });
  }

  document.addEventListener('gamenest:session', (event) => {
    sessionState = event.detail?.session || { authenticated: false };
    updateRentButtonState();
  });

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
  const rentalsApiEndpoint = resolveEndpoint('api_rentals.php');

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
    if (!isAuthenticated()) {
      const authError = new Error('Not logged in');
      authError.code = 'AUTH';
      throw authError;
    }

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
      const headers = { 'Content-Type': 'application/json' };
      const sessionId = getSessionId();
      if (sessionId) {
        headers['X-Session-Id'] = sessionId;
      }

      response = await fetch(rentalEndpoint, {
      method: 'POST',
      headers,
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
            <button type="button" class="rent-btn" data-duration="week" data-price="${game.week}" data-game-id="${game.id}">
              Rent Week
            </button>
          </div>
          <div class="price-option">
            <span class="price-label">Monthly</span>
            <span class="price-value">$${game.month}</span>
            <button type="button" class="rent-btn" data-duration="month" data-price="${game.month}" data-game-id="${game.id}">
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
    updateRentButtonState();
  }

  // ---------- EVENT HANDLING ----------
  function attachRentListeners() {
    const rentButtons = document.querySelectorAll('.rent-btn');

    rentButtons.forEach(button => {
      button.addEventListener('click', () => {
        const gameId = Number(button.getAttribute('data-game-id'));
        const duration = button.getAttribute('data-duration');
        const price = Number(button.getAttribute('data-price'));
        const selectedGame = games.find((item) => item.id === gameId);

        if (!modal) return;

        if (!isAuthenticated()) {
          setModalState({
            title: 'Login Required',
            message: 'Please log in to rent games and sync them to your profile.',
            icon: '🔒',
            buttonText: 'Go to Login',
            redirect: authRedirect
          });
          return;
        }

        if (!selectedGame) {
          setModalState({
            title: 'Something Went Wrong',
            message: 'Unable to find the selected game. Please refresh and try again.',
            icon: '⚠️',
            buttonText: 'Close'
          });
          return;
        }

        setModalState({
          title: 'Processing Rental...',
          message: `Locking in "${selectedGame.title}" for you. Hold tight!`,
          icon: '⏳',
          buttonText: 'Processing',
          disableButton: true
        });

        persistRental(selectedGame, duration, price)
          .then(() => {
            setModalState({
              title: 'Rental Confirmed!',
              message: `You've rented "${selectedGame.title}" for ${duration === 'week' ? '1 Week' : '1 Month'} at $${price}. Enjoy your game!`,
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
                redirect: authRedirect
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
      const redirectTarget = modalBtn.dataset.redirect;
      if (redirectTarget) {
        window.location.href = redirectTarget;
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
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const platformValue = platformFilter?.value || '';

    const filteredGames = games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm);
      const matchesPlatform = platformValue === '' || game.platformKeys.includes(platformValue);
      return matchesSearch && matchesPlatform;
    });

    renderGameCards(filteredGames);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterGames);
  }
  if (platformFilter) {
    platformFilter.addEventListener('change', filterGames);
  }

  // ---------- INITIAL RENDER ----------
  function mapPlatforms(rawPlatforms) {
    if (!rawPlatforms) return { labels: [], keys: [] };
    const keys = rawPlatforms
      .split(',')
      .map(value => value.trim().toLowerCase())
      .filter(Boolean);

    const labels = keys.map(key => platformLabels[key] || key.toUpperCase());
    return { labels, keys };
  }

  function mapRentalRecord(record) {
    const { labels, keys } = mapPlatforms(record.platforms || '');
    return {
      id: Number(record.id),
      title: record.title,
      image: record.image || fallbackImage,
      platforms: labels.length ? labels : ['All Platforms'],
      platformKeys: keys.length ? keys : ['all'],
      week: Number(parseFloat(record.weekly_price || 0).toFixed(2)) || 0,
      month: Number(parseFloat(record.monthly_price || 0).toFixed(2)) || 0,
      raw: record
    };
  }

  function showLoadingState() {
    if (!gameGrid) return;
    gameGrid.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading games...</p>
      </div>
    `;
  }

  async function loadRentalGames() {
    if (!gameGrid) return;
    showLoadingState();

    try {
      const response = await fetch(`${rentalsApiEndpoint}?action=getRentals`);
      const payload = await response.json();

      if (!payload.success || !Array.isArray(payload.data)) {
        throw new Error(payload.message || 'Unable to load rentals');
      }

      games = payload.data.map(mapRentalRecord);
      filterGames();
    } catch (error) {
      console.error('Failed to load rental games:', error);
      renderGameCards([]);
      const errorHtml = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Unable to load games</h3>
          <p>${error.message || 'Please try again later.'}</p>
        </div>
      `;
      gameGrid.innerHTML = errorHtml;
    }
  }

  loadRentalGames();
});
