
const hardcodedGames = [
  { id: 1, title: "Bloodborne", description: "A dark and gothic action RPG set in Yharnam.", image: "https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg", currentBid: 50 },
  { id: 2, title: "FC 26", description: "Next-gen football realism.", image: "sliderImage/8.jpg", currentBid: 40 },
  { id: 3, title: "God of War", description: "Kratos and Atreus in Norse mythology.", image: "https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg", currentBid: 60 },
  { id: 4, title: "Minecraft", description: "Build and survive in a blocky world.", image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fencrypted-tbn2.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcS8GqmyBiwcs2RvDreAHAs_fg5e8es-KYLzHM9NqA7nWuU6K705&psig=AOvVaw39cnyTlwkw8KPNgy6WUnyt&ust=1757803059443000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCKCYxOmk1I8DFQAAAAAdAAAAABAE", currentBid: 30 },
  { id: 5, title: "Spider-Man", description: "Swing through New York City.", image: "sliderImage/14.jpg", currentBid: 55 },
  { id: 6, title: "Until Dawn", description: "Cinematic horror adventure.", image: "sliderImage/15.jpg", currentBid: 35 },
  { id: 7, title: "Red Dead Redemption 2", description: "Epic Western tale.", image: "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg", currentBid: 70 },
  { id: 8, title: "NBA", description: "Aim for goal.", image: "sliderImage/16.jpg", currentBid: 20 },
  { id: 8, title: "Witcher 3", description: "Fantasy world.", image: "sliderImage/12.jpg", currentBid: 70 },
  { id: 9, title: "Dishonored", description: "Stealth action game where your choices shape the fate of Dunwall.", image: "sliderImage/17.jpg", currentBid: 45 },
{ id: 10, title: "Little Nightmares", description: "Creepy puzzle-platformer following a child escaping a dark world.", image: "sliderImage/18.jpg", currentBid: 35 },
{ id: 11, title: "GTA V", description: "Open-world crime epic set in Los Santos.", image: "sliderImage/19.jpg", currentBid: 60 },
{ id: 12, title: "Hollow-Knight Silksong", description: "Fast-paced action adventure in a haunting bug kingdom.", image: "sliderImage/20.jpg", currentBid: 55 },
{ id: 13, title: "F1 25", description: "High-speed Formula 1 racing with realistic handling.", image: "sliderImage/21.jpg", currentBid: 40 },
{ id: 15, title: "DOOM Dark Ages", description: "Brutal medieval shooter blending metal and mayhem.", image: "sliderImage/22.jpg", currentBid: 50 },
{ id: 16, title: "Ghost of Yotei", description: "Samurai-inspired action adventure through snow-covered lands.", image: "sliderImage/23.jpg", currentBid: 45 },
{ id: 17, title: "Hell is Us", description: "Mysterious third-person action game set in a war-torn land.", image: "sliderImage/24.jpg", currentBid: 40 },


];

// DOM reference
const container = document.getElementById('biddingCardsContainer');

function createCard(game, index) {
  const card = document.createElement('div');
  card.className = 'bidding-card';
  card.innerHTML = `
    <div class="card-badge">#${index + 1}</div>
    <img src="${game.image}" alt="${game.title}" />
    <div class="bidding-info">
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      <p><strong>Current Bid:</strong> $<span class="current-bid">${game.currentBid}</span></p>
      <form class="bid-form" data-game-id="${game.id}">
        <input type="number" min="${game.currentBid + 1}" placeholder="Your bid (min $${game.currentBid + 1})" required />
        <button type="submit">Place Bid</button>
      </form>
      <p class="bid-message" style="display:none; margin-top:0.5rem;"></p>
    </div>`;
  return card;
}

function renderBiddingCards(games) {
  container.innerHTML = '';
  games.forEach((game, index) => container.appendChild(createCard(game, index)));
  attachFormListeners();
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

      const game = hardcodedGames.find(g => g.id == gameId);
      if (bidValue > game.currentBid) {
        game.currentBid = bidValue;
        form.parentElement.querySelector('.current-bid').textContent = bidValue;
        input.min = bidValue + 1;
        input.placeholder = `Your bid (min $${bidValue + 1})`;
        input.value = '';
        messageEl.textContent = '✓ Bid placed successfully!';
        messageEl.style.color = '#4ade80';
        messageEl.style.background = 'rgba(74, 222, 128, 0.1)';
        messageEl.style.border = '1px solid rgba(74, 222, 128, 0.3)';
      } else {
        messageEl.textContent = '✗ Bid must be higher than current bid';
        messageEl.style.color = '#f87171';
        messageEl.style.background = 'rgba(248, 113, 113, 0.1)';
        messageEl.style.border = '1px solid rgba(248, 113, 113, 0.3)';
      }
      messageEl.style.display = 'block';
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 3000);
    });
  });
}

// Render games on page load
renderBiddingCards(hardcodedGames);
