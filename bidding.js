(function () {
function resolveEndpoint(fileName) {
  const { protocol, origin, pathname } = window.location;

  if (protocol === 'file:') {
    const decodedPath = decodeURIComponent(pathname);
    const segments = decodedPath.split('/').filter(Boolean);
    const gamenestIndex = segments.findIndex(segment => segment.toLowerCase() === 'gamenest');
    let baseSegments = [];

    if (gamenestIndex !== -1) {
      baseSegments = segments.slice(gamenestIndex, -1);
    } else if (segments.length > 1) {
      baseSegments = segments.slice(0, -1);
    }

    const basePath = baseSegments.length ? `${baseSegments.join('/')}/` : '';
    return `http://localhost/${basePath}${fileName}`;
  }

  const basePath = pathname.replace(/[^/]*$/, '');
  return `${origin}${basePath}${fileName}`;
}

const bidEndpoint = resolveEndpoint('record_bid.php');
const biddingApiEndpoint = resolveEndpoint('api_bidding.php');
const fallbackImage = 'sliderImage/1.jpeg';
let biddingGames = [];

// DOM reference
const container = document.getElementById('biddingCardsContainer');
const authRedirect = 'auth.html?redirect=bidding.html';
const loginPromptHtml = `Please <a href="${authRedirect}">log in</a> to place bids and save them to your profile.`;

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
      console.warn('GameNest Bidding: failed to parse cached user', error);
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

function applyAuthState() {
  if (!container) return;
  const loggedIn = isAuthenticated();

  container.querySelectorAll('.bid-form').forEach((form) => {
    const input = form.querySelector('input');
    const button = form.querySelector('button');

    if (input) {
      if (!input.dataset.defaultPlaceholder) {
        input.dataset.defaultPlaceholder = input.placeholder;
      }
      if (loggedIn) {
        input.disabled = false;
        input.placeholder = input.dataset.defaultPlaceholder;
        input.removeAttribute('title');
      } else {
        input.disabled = true;
        input.placeholder = 'Login required to bid';
        input.title = 'Login required to bid';
      }
    }

    if (button) {
      if (!button.dataset.defaultLabel) {
        button.dataset.defaultLabel = button.textContent.trim();
      }
      button.disabled = !loggedIn;
      button.textContent = loggedIn ? (button.dataset.defaultLabel || 'Place Bid') : 'Login Required';
      if (loggedIn) {
        button.removeAttribute('title');
      } else {
        button.title = 'Login required to bid';
      }
    }
  });
}

document.addEventListener('gamenest:session', (event) => {
  sessionState = event.detail?.session || { authenticated: false };
  applyAuthState();
});

function createCard(game, index) {
  const card = document.createElement('div');
  card.className = 'bidding-card';
  const minRequired = Math.max(game.currentBid || 0, game.minBid || 0) + 1;
  card.innerHTML = `
    <div class="card-badge">#${index + 1}</div>
    <img src="${game.image}" alt="${game.title}" />
    <div class="bidding-info">
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      <p><strong>Current Bid:</strong> $<span class="current-bid">${game.currentBid}</span></p>
      <p><strong>Minimum Increment:</strong> $${game.minBid}</p>
      <p><strong>Time Left:</strong> ${game.timeLeft}</p>
      <form class="bid-form" data-game-id="${game.id}">
        <input type="number" min="${minRequired}" placeholder="Your bid (min $${minRequired})" data-default-placeholder="Your bid (min $${minRequired})" required />
        <button type="submit" data-default-label="Place Bid">Place Bid</button>
      </form>
      <p class="bid-message" style="display:none; margin-top:0.5rem;"></p>
    </div>`;
  return card;
}

function renderBiddingCards(games) {
  if (!container) return;
  container.innerHTML = '';

  if (!games.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-gamepad"></i>
        <h3>No bidding games available</h3>
        <p>Please check back later.</p>
      </div>
    `;
    return;
  }

  games.forEach((game, index) => container.appendChild(createCard(game, index)));
  attachFormListeners();
  applyAuthState();
}

async function persistBid(game, amount) {
  if (!isAuthenticated()) {
    const authError = new Error('Not logged in');
    authError.code = 'AUTH';
    throw authError;
  }

  const payload = {
    game_id: game.id,
    game_title: game.title,
    bid_amount: amount,
    image_url: game.image
  };

  const headers = { 'Content-Type': 'application/json' };
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const response = await fetch(bidEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 401) {
      const error = new Error('Not logged in');
      error.code = 'AUTH';
      throw error;
    }
    throw new Error(`Network error (${response.status}) while saving bid`);
  }

  const result = await response.json();
  if (!result.success) {
    const error = new Error(result.error || 'Failed to record bid');
    if (result.error === 'Not logged in') {
      error.code = 'AUTH';
    }
    throw error;
  }

  return result;
}

function attachFormListeners() {
  container.querySelectorAll('.bid-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const gameId = form.getAttribute('data-game-id');
      const input = form.querySelector('input');
      const bidValue = Number(input.value);
      const messageEl = form.parentElement.querySelector('.bid-message');
      messageEl.style.display = 'none';

      if (!isAuthenticated()) {
        messageEl.innerHTML = loginPromptHtml;
        messageEl.style.color = '#f87171';
        messageEl.style.background = 'rgba(248, 113, 113, 0.1)';
        messageEl.style.border = '1px solid rgba(248, 113, 113, 0.3)';
        messageEl.style.display = 'block';

        setTimeout(() => {
          messageEl.style.display = 'none';
        }, 4000);
        return;
      }

  const game = biddingGames.find(g => g.id == gameId);
      if (!game) {
        messageEl.textContent = 'Unable to find the selected game. Please refresh and try again.';
        messageEl.style.color = '#f87171';
        messageEl.style.background = 'rgba(248, 113, 113, 0.1)';
        messageEl.style.border = '1px solid rgba(248, 113, 113, 0.3)';
        messageEl.style.display = 'block';

        setTimeout(() => {
          messageEl.style.display = 'none';
        }, 4000);
        return;
      }
      const minRequired = Math.max(game.currentBid || 0, game.minBid || 0) + 1;
      if (bidValue >= minRequired) {
        persistBid(game, bidValue)
          .then(() => {
            game.currentBid = bidValue;
            form.parentElement.querySelector('.current-bid').textContent = bidValue;
            const nextMin = Math.max(bidValue, game.minBid || 0) + 1;
            input.min = nextMin;
            const updatedPlaceholder = `Your bid (min $${nextMin})`;
            input.placeholder = updatedPlaceholder;
            input.dataset.defaultPlaceholder = updatedPlaceholder;
            input.value = '';
            messageEl.textContent = '✓ Bid placed successfully!';
            messageEl.style.color = '#4ade80';
            messageEl.style.background = 'rgba(74, 222, 128, 0.1)';
            messageEl.style.border = '1px solid rgba(74, 222, 128, 0.3)';
            messageEl.style.display = 'block';

            setTimeout(() => {
              messageEl.style.display = 'none';
            }, 3000);
          })
          .catch((error) => {
            if (error.code === 'AUTH') {
              messageEl.innerHTML = loginPromptHtml;
            } else {
              messageEl.textContent = error.message || 'Unable to record bid right now.';
            }
            messageEl.style.color = '#f87171';
            messageEl.style.background = 'rgba(248, 113, 113, 0.1)';
            messageEl.style.border = '1px solid rgba(248, 113, 113, 0.3)';
            messageEl.style.display = 'block';

            setTimeout(() => {
              messageEl.style.display = 'none';
            }, 4000);
          });
      } else {
        messageEl.textContent = `✗ Bid must be at least $${minRequired}`;
        messageEl.style.color = '#f87171';
        messageEl.style.background = 'rgba(248, 113, 113, 0.1)';
        messageEl.style.border = '1px solid rgba(248, 113, 113, 0.3)';
        messageEl.style.display = 'block';

        setTimeout(() => {
          messageEl.style.display = 'none';
        }, 3000);
      }
    });
  });
}

function formatDescription(record) {
  const bits = [];
  if (record.platform) bits.push(record.platform);
  if (record.condition) bits.push(record.condition);
  return bits.length ? bits.join(' • ') : 'Ready for bidding';
}

function mapBiddingRecord(record) {
  return {
    id: Number(record.id),
    title: record.title,
    description: record.description || formatDescription(record),
    image: record.image || fallbackImage,
    currentBid: Number(record.current_bid || 0),
    minBid: Number(record.min_bid || 0),
    timeLeft: record.time_left || 'TBD',
    platform: record.platform || '',
    condition: record.condition || '',
    raw: record
  };
}

function renderLoadingState() {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading bidding games...</p>
    </div>
  `;
}

async function loadBiddingGames() {
  if (!container) return;
  renderLoadingState();

  try {
    const response = await fetch(`${biddingApiEndpoint}?action=getBiddings`);
    const payload = await response.json();

    if (!payload.success || !Array.isArray(payload.data)) {
      throw new Error(payload.message || 'Unable to load bidding games');
    }

    biddingGames = payload.data.map(mapBiddingRecord);
    renderBiddingCards(biddingGames);
  } catch (error) {
    console.error('Failed to load bidding games:', error);
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unable to load bidding games</h3>
        <p>${error.message || 'Please try again later.'}</p>
      </div>
    `;
  }
}

renderLoadingState();
loadBiddingGames();

})();
