// rent-games.js
document.addEventListener('DOMContentLoaded', function () {
  const games = [
    {
      id: 1,
      title: 'Elden Ring',
      image: 'sliderImage/11.jpg',
      platforms: ['PC', 'PS4/PS5', 'Xbox One/Series'],
      platformKeys: ['pc', 'ps', 'xbox'],
      week: 7,
      month: 20
    },
    {
      id: 2,
      title: 'God of War (2018)',
      image: 'sliderImage/10.jpg',
      platforms: ['PS4/PS5', 'PC'],
      platformKeys: ['ps', 'pc'],
      week: 5,
      month: 15
    },
    {
      id: 3,
      title: 'Sekiro: Shadows Die Twice',
      image: 'sliderImage/3.jpeg',
      platforms: ['PC', 'PS4', 'Xbox One'],
      platformKeys: ['pc', 'ps', 'xbox'],
      week: 6,
      month: 18
    },
    {
      id: 4,
      title: 'Spider Man',
      image: 'sliderImage/14.jpg',
      platforms: ['PC', 'PS4/PS5', 'Xbox One/Series', 'Switch'],
      platformKeys: ['pc', 'ps', 'xbox', 'switch'],
      week: 6,
      month: 18
    },
    {
      id: 5,
      title: 'Dark Souls 3',
      image: 'sliderImage/6.jpeg',
      platforms: ['PC', 'PS4/PS5', 'Xbox One/Series'],
      platformKeys: ['pc', 'ps', 'xbox'],
      week: 8,
      month: 22
    },
    {
      id: 6,
      title: 'Red Dead Redemption 2',
      image: 'sliderImage/1.jpeg',
      platforms: ['PC', 'PS4', 'Xbox One'],
      platformKeys: ['pc', 'ps', 'xbox'],
      week: 7,
      month: 20
    },
    {
      id: 7,
      title: "Assassin's Creed Mirage",
      image: 'sliderImage/9.jpg',
      platforms: ['PC', 'PS4/PS5', 'Xbox One/Series'],
      platformKeys: ['pc', 'ps', 'xbox'],
      week: 6,
      month: 19
    },
    {
      id: 8,
      title: 'Fc 26',
      image: 'sliderImage/8.jpg',
      platforms: ['Switch', 'Wii U'],
      platformKeys: ['switch', 'xbox'],
      week: 5,
      month: 16
    }
  ];

  // DOM references
  const gameGrid = document.getElementById('gameGrid');
  const searchInput = document.getElementById('searchInput');
  const platformFilter = document.getElementById('platformFilter');
  const modal = document.getElementById('rentModal');
  const modalMessage = document.getElementById('modalMessage');
  const closeBtn = document.querySelector('.close');

  // ---------- CREATE CARD ----------
  function createCard(game) {
    const card = document.createElement('div');
    card.className = 'rental-card';
    card.setAttribute('data-platforms', game.platformKeys.join(' '));

    card.innerHTML = `
      <h3 class="card-title">${game.title}</h3>
      <p class="rent-message" style="display:none; margin: 0.5rem 0; text-align: center;"></p>
      <img src="${game.image}" alt="${game.title}" class="game-image">
      <div class="rental-info" style="text-align: center;">
        <div class="platforms">
          ${game.platforms
            .map(
              (plat, i) =>
                `<span class="platform-badge platform-${game.platformKeys[i]}">${plat}</span>`
            )
            .join('')}
        </div>
        <p class="availability">Available Now</p>
        <div class="rental-prices">
          <span class="price-badge active" data-duration="week">$${game.week}/week</span>
          <span class="price-badge" data-duration="month">$${game.month}/month</span>
        </div>
        <form class="rental-form" data-game-id="${game.id}">
          <select class="duration-select">
            <option value="1-week" data-price="${game.week}">1 Week ($${game.week})</option>
            <option value="1-month" data-price="${game.month}">1 Month ($${game.month})</option>
          </select>
          <button type="submit" class="rent-btn">Rent Now</button>
        </form>
      </div>
    `;
    return card;
  }

  // ---------- RENDER ALL GAMES ----------
  function renderGameCards(games) {
    gameGrid.innerHTML = '';
    games.forEach(game => gameGrid.appendChild(createCard(game)));
    attachFormListeners();
  }

  // ---------- EVENT HANDLING ----------
  function attachFormListeners() {
    const forms = document.querySelectorAll('.rental-form');

    forms.forEach(form => {
      const card = form.closest('.rental-card');
      const priceBadges = card.querySelectorAll('.price-badge');
      const durationSelect = card.querySelector('.duration-select');
      const rentBtn = form.querySelector('.rent-btn');
      const availability = card.querySelector('.availability');
      const messageEl = card.querySelector('.rent-message');
      const gameTitle = card.querySelector('.card-title').textContent;

      // Sync badges with select
      durationSelect.addEventListener('change', () => {
        const selected = durationSelect.value.split('-')[1];
        priceBadges.forEach(b =>
          b.classList.toggle('active', b.getAttribute('data-duration') === selected)
        );
      });

      priceBadges.forEach(badge => {
        badge.addEventListener('click', () => {
          const duration = badge.getAttribute('data-duration');
          durationSelect.value = `1-${duration}`;
          priceBadges.forEach(b =>
            b.classList.toggle('active', b === badge)
          );
        });
      });

      // Handle rent form submit
      form.addEventListener('submit', e => {
        e.preventDefault();
        const selectedOption = durationSelect.options[durationSelect.selectedIndex];
        const duration = selectedOption.value.replace('-', ' ');
        const price = selectedOption.getAttribute('data-price');

        rentBtn.disabled = true;
        rentBtn.textContent = 'Renting...';
        messageEl.style.display = 'none';

        setTimeout(() => {
          rentBtn.disabled = false;
          rentBtn.textContent = 'Rent Now';
          availability.textContent = 'Rented - Returning Soon';
          availability.style.color = '#f85149';
          messageEl.textContent = `You have rented "${gameTitle}" for ${duration} at $${price}!`;
          messageEl.style.color = '#4ade80';
          messageEl.style.display = 'block';
          modalMessage.textContent = messageEl.textContent;
          modal.style.display = 'block';
        }, 1200);
      });
    });
  }

  // ---------- FILTERS ----------
  function filterCards() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedPlatform = platformFilter.value.toLowerCase();
    const cards = document.querySelectorAll('.rental-card');

    cards.forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      const platforms = card.getAttribute('data-platforms').toLowerCase();
      const matchesSearch = title.includes(searchTerm);
      const matchesPlatform = !selectedPlatform || platforms.includes(selectedPlatform);
      card.style.display = matchesSearch && matchesPlatform ? 'block' : 'none';
    });
  }

  searchInput.addEventListener('input', filterCards);
  platformFilter.addEventListener('change', filterCards);

  // ---------- MODAL ----------
  window.onclick = function (event) {
    if (event.target === modal) modal.style.display = 'none';
  };
  closeBtn.onclick = function () {
    modal.style.display = 'none';
  };

  // ---------- INIT ----------
  renderGameCards(games);
});
