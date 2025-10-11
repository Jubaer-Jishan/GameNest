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
        const price = button.getAttribute('data-price');
        
        // Show modal with rental confirmation
        modalMessage.textContent = `You've rented "${title}" for ${duration === 'week' ? '1 Week' : '1 Month'} at $${price}. Enjoy your game!`;
        modal.classList.add('show');
      });
    });
  }

  // Close modal handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  if (modalBtn) {
    modalBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  // Close modal on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });

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
