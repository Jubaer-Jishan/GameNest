// profile.js - Complete Profile Management with Database Integration

document.addEventListener('DOMContentLoaded', function() {
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

  const profileEndpoint = resolveEndpoint('get_profile.php');
  const updateProfileEndpoint = resolveEndpoint('update_profile.php');
  const statsEndpoint = resolveEndpoint('update_stats.php');

  function updateHeaderGreeting(name) {
    const headerUser = document.querySelector('[data-auth-aware] .header-user');
    if (headerUser) {
      headerUser.textContent = name ? `Hi, ${name}` : 'Hi, Player';
    }
  }

  document.addEventListener('gamenest:session', (event) => {
    const session = event.detail?.session;
    if (session?.authenticated && session.user) {
      const firstName = (session.user.full_name || session.user.email || 'Player').split(' ')[0];
      updateHeaderGreeting(firstName);
    }
  });

  if (window.GameNestSession?.authenticated && window.GameNestSession.user) {
    const firstName = (window.GameNestSession.user.full_name || window.GameNestSession.user.email || 'Player').split(' ')[0];
    updateHeaderGreeting(firstName);
  }
  
  // ==================== LOAD PROFILE DATA ====================
  async function loadProfileData() {
    try {
      const response = await fetch(profileEndpoint, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success && data.user) {
        updateProfileUI(data.user);
        console.log('✅ Profile loaded successfully');
      } else {
        console.error('❌ Failed to load profile:', data.error);
        if (data.error === 'Not logged in') {
          const cachedUserRaw = localStorage.getItem('currentUser');
          if (cachedUserRaw) {
            try {
              const cachedUser = JSON.parse(cachedUserRaw);
              if (cachedUser) {
                updateProfileUI({
                  id: cachedUser.id,
                  full_name: cachedUser.fullName,
                  email: cachedUser.email
                });
                console.warn('⚠️ Using cached profile data; server session missing.');
                return;
              }
            } catch (parseError) {
              console.warn('GameNest Profile: unable to parse cached user', parseError);
            }
          }

          const currentPage = window.location.pathname.split('/').pop() || 'profile.html';
          window.location.href = `auth.html?redirect=${currentPage}`;
        }
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    }
  }

  // ==================== UPDATE UI WITH USER DATA ====================
  function updateProfileUI(user) {
    // Player Name & Basic Info
    const userName = document.getElementById('userName');
    if (userName) userName.textContent = user.full_name || user.username || 'Player';

    const firstName = user.full_name ? user.full_name.split(' ')[0] : (user.username || user.email || 'Player');
    updateHeaderGreeting(firstName);
    
    // Profile Picture
    const avatarImg = document.querySelector('.player-avatar img');
    if (avatarImg) {
      const fallbackAvatar = 'images/default-gamer-avatar.svg';
      avatarImg.src = user.profile_picture || fallbackAvatar;
      avatarImg.alt = user.full_name || 'Player Avatar';
    }
    
    // Player Title
    const titleElement = document.querySelector('.player-meta h1');
    if (titleElement) titleElement.textContent = user.full_name || user.username || 'Player';
    
    // Bio/Description
    const bioElement = document.querySelector('.player-meta p');
    if (bioElement) bioElement.textContent = user.bio || 'No bio available';
    
    // Online Status Tag
    const onlineTag = document.querySelector('.tag-online');
    if (onlineTag) {
      onlineTag.textContent = user.is_online ? '● Online' : '● Offline';
      onlineTag.style.display = 'inline-flex';
    }
    
    // Player Badge/Title
    const badgeElement = document.querySelector('.badge');
    if (badgeElement) badgeElement.textContent = user.title || 'Newbie';
    
    // Level Display
    const levelElement = document.querySelector('.level-header h3');
    if (levelElement) levelElement.textContent = `Level ${user.level || 1}`;
    
    // Global Rank
    const rankElement = document.querySelector('.rank');
    if (rankElement) {
      rankElement.textContent = user.global_rank ? `#${user.global_rank} Global` : 'Unranked';
    }
    
    // XP Progress Bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${user.xp_percentage || 0}%`;
    }
    
    // XP Text
    const xpLabel = document.querySelector('.xp-progress label');
    if (xpLabel) {
      xpLabel.textContent = `${user.xp_current || 0} / ${user.xp_next_level || 1000} XP`;
    }
    
    // Progress Grid Stats
    updateProgressStat('Current Level', user.level || 1);
    updateProgressStat('Current Streak', `${user.current_streak || 0} days`);
    updateProgressStat('Season Rank', user.season_rank || 'Bronze I');
    updateProgressStat('Win Ratio', `${user.win_ratio || 0}%`);
    
    // Player Highlights
    const highlights = document.querySelector('.player-highlights');
    if (highlights) {
      highlights.innerHTML = `
        <li>🌍 <strong>Location:</strong> ${user.location || 'Unknown'}</li>
        <li>📅 <strong>Member Since:</strong> ${user.member_since_formatted || 'Recently'}</li>
        <li>🎮 <strong>Favorite Genre:</strong> ${user.favorite_genre || 'Not specified'}</li>
        ${user.guild_name ? `<li>🛡️ <strong>Guild:</strong> ${user.guild_name}</li>` : ''}
      `;
    }
    
    // Upcoming Event
    if (user.upcoming_event) {
      const upcomingElement = document.querySelector('.upcoming');
      if (upcomingElement) {
        upcomingElement.innerHTML = `
          <div class="label" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px;">
            Upcoming Event
          </div>
          <div style="font-weight: 600; color: var(--accent); font-size: 1.05rem;">
            ${user.upcoming_event}
          </div>
          ${user.upcoming_event_formatted ? `
            <small style="color: var(--text-muted); margin-top: 4px; display: block;">
              ${user.upcoming_event_formatted}
            </small>
          ` : ''}
        `;
      }
    }
    
    // Stats Cards
    updateStatCard('Games Owned', user.games_owned || 0, '+12 this month');
    updateStatCard('Hours Played', user.hours_played || 0, '+45 this week');
    updateStatCard('Achievements', user.achievements || 0, '85% completed');
    updateStatCard('Friends', user.friends_count || 0, '+3 this week');

    renderRentals(user.rentals || []);
    renderBids(user.bids || []);
    updateActivitySummary(user.activity_stats || {});
    
    console.log('✅ UI updated with user data');
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Helper function to update progress stats
  function updateProgressStat(label, value) {
    const stats = document.querySelectorAll('.progress-grid > div');
    stats.forEach(stat => {
      const labelEl = stat.querySelector('.label');
      if (labelEl && labelEl.textContent === label) {
        const valueEl = stat.querySelector('.value');
        if (valueEl) valueEl.textContent = value;
      }
    });
  }

  // Helper function to update stat cards
  function updateStatCard(title, value, delta) {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
      const h3 = card.querySelector('h3');
      if (h3 && h3.textContent === title) {
        const valueEl = card.querySelector('.stat-value');
        const deltaEl = card.querySelector('.delta');
        if (valueEl) valueEl.textContent = value;
        if (deltaEl && delta) deltaEl.textContent = delta;
      }
    });
  }

  function buildActivityItem({ image, title, subtitle, badgeLabel, badgeStatus, amount, timestamp }) {
    const thumbMarkup = image ? `<div class="activity-thumb" style="background-image: url('${escapeHtml(image)}')"></div>` : '';
    const subtitleMarkup = subtitle ? `<p>${escapeHtml(subtitle)}</p>` : '';
    const badgeMarkup = badgeLabel ? `<span class="badge" data-status="${escapeHtml(badgeStatus || 'active')}">${escapeHtml(badgeLabel)}</span>` : '';
    const amountMarkup = amount ? `<span class="amount">${escapeHtml(amount)}</span>` : '';
    const timeMarkup = timestamp ? `<time>${escapeHtml(timestamp)}</time>` : '';

    return `
      <li class="${image ? 'with-thumb' : ''}">
        ${thumbMarkup}
        <div class="activity-item-text">
          <h4>${escapeHtml(title)}</h4>
          ${subtitleMarkup}
        </div>
        <div class="activity-meta">
          ${badgeMarkup}
          ${amountMarkup}
          ${timeMarkup}
        </div>
      </li>
    `;
  }

  function renderRentals(rentals) {
    const list = document.getElementById('rentalsList');
    if (!list) return;

    if (!rentals.length) {
      list.innerHTML = '<li class="empty-state">No rentals recorded yet.</li>';
      return;
    }

    const items = rentals.map(rental => {
      const subtitleParts = [];
      if (rental.duration_label) subtitleParts.push(rental.duration_label);
      if (rental.platforms) subtitleParts.push(rental.platforms);

      return buildActivityItem({
        image: rental.image_url,
        title: rental.game_title || 'Unknown title',
        subtitle: subtitleParts.join(' • '),
        badgeLabel: rental.status ? rental.status.charAt(0).toUpperCase() + rental.status.slice(1) : 'Active',
        badgeStatus: rental.status || 'active',
        amount: rental.display_price ? `$${rental.display_price}` : '',
        timestamp: rental.rented_at_formatted || ''
      });
    });

    list.innerHTML = items.join('');
  }

  function renderBids(bids) {
    const list = document.getElementById('bidsList');
    if (!list) return;

    if (!bids.length) {
      list.innerHTML = '<li class="empty-state">No bids placed yet.</li>';
      return;
    }

    const items = bids.map(bid => buildActivityItem({
      image: bid.image_url,
      title: bid.game_title || 'Unknown title',
      subtitle: 'Bid placed',
      badgeLabel: bid.status ? bid.status.charAt(0).toUpperCase() + bid.status.slice(1) : 'Active',
      badgeStatus: bid.status || 'active',
      amount: bid.display_amount ? `$${bid.display_amount}` : '',
      timestamp: bid.created_at_formatted || ''
    }));

    list.innerHTML = items.join('');
  }

  function updateActivitySummary(stats) {
    const rentalsHeading = document.querySelector('#rentalsBoard .section-heading h2');
    if (rentalsHeading) {
      const count = typeof stats.active_rentals === 'number' ? stats.active_rentals : 0;
      rentalsHeading.textContent = `Recent Rentals${count ? ' (' + count + ' active)' : ''}`;
    }

    const bidsHeading = document.querySelector('#bidsBoard .section-heading h2');
    if (bidsHeading) {
      const count = typeof stats.active_bids === 'number' ? stats.active_bids : 0;
      bidsHeading.textContent = `Recent Bids${count ? ' (' + count + ' active)' : ''}`;
    }

    const rentalsLink = document.getElementById('viewAllRentals');
    if (rentalsLink && typeof stats.total_rentals === 'number') {
      rentalsLink.textContent = `View all (${stats.total_rentals})`;
    }

    const bidsLink = document.getElementById('viewAllBids');
    if (bidsLink && typeof stats.total_bids === 'number') {
      bidsLink.textContent = `View all (${stats.total_bids})`;
    }
  }

  // ==================== EDIT PROFILE FUNCTIONALITY ====================
  
  // Make profile editable
  function enableProfileEdit() {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Profile';
    editBtn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 1000;';
    
    editBtn.addEventListener('click', showEditModal);
    document.body.appendChild(editBtn);
    
    // Add change picture button on avatar
    addChangePictureButton();
  }

  // Add change picture button overlay on avatar
  function addChangePictureButton() {
    const avatarDiv = document.querySelector('.player-avatar');
    if (!avatarDiv) return;
    
    // Create overlay button
    const changePicBtn = document.createElement('div');
    changePicBtn.className = 'change-pic-overlay';
    changePicBtn.innerHTML = '<i class="fas fa-camera"></i><br><span>Change Picture</span>';
    
    avatarDiv.style.position = 'relative';
    avatarDiv.appendChild(changePicBtn);
    
    // Create file input (persistent, reusable)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
    fileInput.style.display = 'none';
    fileInput.id = 'avatarFileInput';
    
    // File change handler
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Show loading
      changePicBtn.style.opacity = '1';
      changePicBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br><span>Uploading...</span>';
      
      // Upload immediately
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      try {
        const response = await fetch(updateProfileEndpoint, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success && result.user) {
          // Update UI immediately
          updateProfileUI(result.user);
          
          // Show success toast
          const toast = document.createElement('div');
          toast.className = 'success-toast';
          toast.innerHTML = '✅ Profile picture updated!';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
          
          // Reset button
          changePicBtn.style.opacity = '0';
          changePicBtn.innerHTML = '<i class="fas fa-camera"></i><br><span>Change Picture</span>';
        } else {
          alert('❌ Failed to update picture: ' + (result.error || 'Unknown error'));
          changePicBtn.style.opacity = '0';
          changePicBtn.innerHTML = '<i class="fas fa-camera"></i><br><span>Change Picture</span>';
        }
      } catch (error) {
        console.error('Error uploading picture:', error);
        alert('❌ Error uploading picture');
        changePicBtn.style.opacity = '0';
        changePicBtn.innerHTML = '<i class="fas fa-camera"></i><br><span>Change Picture</span>';
      }
      
      // Reset file input
      fileInput.value = '';
    });
    
    // Click handler - open file picker
    changePicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    
    // Append file input to body
    document.body.appendChild(fileInput);
  }

  // Show edit modal
  function showEditModal() {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
      <div class="edit-modal-content glass-panel">
        <span class="close-edit-modal">&times;</span>
        <h2 style="margin-bottom: 24px; color: var(--accent);">Edit Profile</h2>
        
        <form id="editProfileForm">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" name="full_name" id="edit_full_name" class="form-input" required>
          </div>
          
          <div class="form-group">
            <label>Username</label>
            <input type="text" name="username" id="edit_username" class="form-input">
          </div>
          
          <div class="form-group">
            <label>Title</label>
            <input type="text" name="title" id="edit_title" class="form-input" placeholder="e.g., Pro Gamer, Newbie">
          </div>
          
          <div class="form-group">
            <label>Bio</label>
            <textarea name="bio" id="edit_bio" class="form-input" rows="3" placeholder="Tell us about yourself..."></textarea>
          </div>
          
          <div class="form-group">
            <label>Location</label>
            <input type="text" name="location" id="edit_location" class="form-input" placeholder="City, Country">
          </div>
          
          <div class="form-group">
            <label>Favorite Genre</label>
            <input type="text" name="favorite_genre" id="edit_favorite_genre" class="form-input" placeholder="e.g., RPG, FPS, Strategy">
          </div>
          
          <div class="form-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button type="button" class="btn btn-ghost cancel-edit">Cancel</button>
            <button type="submit" class="btn btn-primary" id="saveBtn">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate current values
    fetch(profileEndpoint, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          document.getElementById('edit_full_name').value = data.user.full_name || '';
          document.getElementById('edit_username').value = data.user.username || '';
          document.getElementById('edit_title').value = data.user.title || '';
          document.getElementById('edit_bio').value = data.user.bio || '';
          document.getElementById('edit_location').value = data.user.location || '';
          document.getElementById('edit_favorite_genre').value = data.user.favorite_genre || '';
        }
      });
    
    // Close modal handlers
    modal.querySelector('.close-edit-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-edit').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    // Form submission
    document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
  }

  // Handle profile update
  async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Convert FormData to JSON object (since we're not uploading files from modal)
    const updateData = {};
    for (let [key, value] of formData.entries()) {
      if (value.trim()) {
        updateData[key] = value.trim();
      }
    }
    
    try {
      const response = await fetch(updateProfileEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Instantly update UI with new data
        if (result.user) {
          updateProfileUI(result.user);
        }
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-toast';
        successMsg.innerHTML = '✅ Profile updated successfully!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => successMsg.remove(), 3000);
        
        // Close modal
        document.querySelector('.edit-modal').remove();
      } else {
        alert('❌ Failed to update profile: ' + result.error);
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error updating profile');
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  }

  // ==================== MOBILE MENU TOGGLE ====================
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const headerNav = document.querySelector('.header-nav');
  
  if (mobileMenuToggle && headerNav) {
    mobileMenuToggle.addEventListener('click', () => {
      headerNav.classList.toggle('active');
    });
  }

  // ==================== INITIALIZE ====================
  loadProfileData();
  enableProfileEdit();
  
  // Set user online when page loads
  fetch(statsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stat_type: 'set_online', is_online: true }),
    credentials: 'include'
  });
  
  // Set user offline when page unloads
  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon(statsEndpoint, JSON.stringify({
      stat_type: 'set_online',
      is_online: false
    }));
  });

});

// ==================== EDIT MODAL STYLES ====================
const style = document.createElement('style');
style.textContent = `
  .edit-modal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  }

  .edit-modal-content {
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 40px;
    position: relative;
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .close-edit-modal {
    position: absolute;
    top: 20px;
    right: 24px;
    font-size: 32px;
    font-weight: 700;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.3s ease;
    line-height: 1;
  }

  .close-edit-modal:hover {
    color: var(--accent);
    transform: rotate(90deg);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text);
    font-size: 0.95rem;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(16, 23, 42, 0.6);
    border: 1.5px solid rgba(96, 165, 250, 0.3);
    border-radius: 12px;
    color: var(--text);
    font-size: 15px;
    font-family: inherit;
    transition: all 0.3s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  textarea.form-input {
    resize: vertical;
    min-height: 80px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .success-toast {
    position: fixed;
    top: 30px;
    right: 30px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    z-index: 100000;
    animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .change-pic-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      rgba(138, 43, 226, 0.1) 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(138, 43, 226, 0.1) 100%
    );
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border-radius: 50%;
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 10;
    border: 2px solid rgba(255, 255, 255, 0);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0);
  }

  .player-avatar:hover .change-pic-overlay {
    opacity: 1;
    visibility: visible;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 
      inset 0 0 0 1px rgba(255, 255, 255, 0.1),
      0 8px 32px rgba(138, 43, 226, 0.3);
  }

  .change-pic-overlay:hover {
    background: linear-gradient(
      135deg, 
      rgba(138, 43, 226, 0.4) 0%,
      rgba(157, 78, 221, 0.5) 50%,
      rgba(138, 43, 226, 0.4) 100%
    );
    backdrop-filter: blur(12px) saturate(200%);
    -webkit-backdrop-filter: blur(12px) saturate(200%);
    border-color: rgba(138, 43, 226, 0.5);
    box-shadow: 
      inset 0 0 20px rgba(138, 43, 226, 0.3),
      0 0 30px rgba(138, 43, 226, 0.5),
      0 8px 32px rgba(138, 43, 226, 0.4);
    transform: scale(1.02);
  }

  .change-pic-overlay i {
    font-size: 2.5rem;
    margin-bottom: 12px;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
    animation: iconPulse 2s ease-in-out infinite;
  }

  @keyframes iconPulse {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
    }
    50% {
      transform: scale(1.1);
      filter: drop-shadow(0 6px 12px rgba(138, 43, 226, 0.6));
    }
  }

  .change-pic-overlay span {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    font-weight: 700;
    background: linear-gradient(90deg, #ffffff 0%, #e0d4ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .change-pic-overlay:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  /* ==================== LOGOUT MODAL STYLES ==================== */
  .logout-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .logout-modal.show {
    opacity: 1;
  }

  .logout-modal-content {
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 35, 0.95));
    border: 2px solid rgba(138, 43, 226, 0.3);
    border-radius: 20px;
    padding: 40px;
    max-width: 450px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(138, 43, 226, 0.4);
    animation: modalSlideIn 0.3s ease;
  }

  @keyframes modalSlideIn {
    from {
      transform: translateY(-30px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  .logout-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #8a2be2, #9d4edd);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(138, 43, 226, 0.4);
  }

  .logout-icon i {
    font-size: 36px;
    color: white;
  }

  .logout-modal-content h2 {
    color: #ffffff;
    font-size: 28px;
    margin: 20px 0 15px;
    font-weight: 700;
    text-shadow: 0 2px 10px rgba(138, 43, 226, 0.5);
  }

  .logout-modal-content p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .logout-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .logout-cancel-btn,
  .logout-confirm-btn {
    flex: 1;
    padding: 14px 28px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .logout-cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .logout-cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
  }

  .logout-confirm-btn {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    border: 2px solid rgba(231, 76, 60, 0.5);
  }

  .logout-confirm-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #c0392b, #a93226);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
  }

  .logout-confirm-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .logout-confirm-btn i {
    margin-right: 5px;
  }
`;
document.head.appendChild(style);
