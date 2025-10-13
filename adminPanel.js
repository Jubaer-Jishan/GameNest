// Admin panel client logic for navigation, forms, and CRUD calls
let currentUsersSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initForms();
  setupUsersSearch();
  initImagePreview('rentalImage', '#rentalImagePreview img', 'sliderImage/1.jpeg');
  initImagePreview('biddingImage', '#biddingImagePreview img', 'sliderImage/1.jpeg');
  refreshDashboard();
  loadRentals();
  loadBiddings();
  loadUsers();
});

function showToast(message, type = 'info') {
  const log = type === 'error' ? console.error : type === 'warning' ? console.warn : console.info;
  log.call(console, message);
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(message);
  }
}

function initNavigation() {
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  links.forEach(link => {
    link.addEventListener('click', event => {
      if (link.classList.contains('logout')) {
        event.preventDefault();
        if (confirm('Logout from admin panel?')) window.location.href = 'home.html';
        return;
      }

      event.preventDefault();
      const targetId = link.dataset.section;
      if (!targetId) return;

      links.forEach(l => l.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));

      link.classList.add('active');
      const section = document.getElementById(targetId);
      if (section) section.classList.add('active');

      if (targetId === 'dashboard') refreshDashboard();
      if (targetId === 'rentals') loadRentals();
      if (targetId === 'biddings') loadBiddings();
      if (targetId === 'users') loadUsers(currentUsersSearch);
    });
  });
}

function initForms() {
  const rentalForm = document.getElementById('addRentalForm');
  if (rentalForm) {
    rentalForm.addEventListener('submit', async event => {
      event.preventDefault();
      const submitBtn = rentalForm.querySelector('button[type="submit"]');
      toggleButton(submitBtn, true);

      const formData = new FormData(rentalForm);
      formData.append('action', 'addRental');
      formData.set('title', (document.getElementById('rentalTitle')?.value || '').trim());
      formData.set('weekly_price', (document.getElementById('rentalWeek')?.value || '').trim());
      formData.set('monthly_price', (document.getElementById('rentalMonth')?.value || '').trim());
      const rentalPlatforms = Array.from(document.getElementById('rentalPlatforms')?.selectedOptions || [])
        .map(option => option.value)
        .join(',');
      formData.set('platforms', rentalPlatforms);

      try {
        const response = await fetch('api_rentals.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success) {
          rentalForm.reset();
          setImagePreview('#rentalImagePreview img', 'sliderImage/1.jpeg');
          showToast('Rental game added successfully.', 'success');
          await loadRentals();
          await refreshDashboard();
        } else {
          showToast(result.message || 'Unable to add rental game.', 'error');
        }
      } catch (error) {
        console.error('Rental add failed', error);
        showToast('Failed to add rental game.', 'error');
      } finally {
        toggleButton(submitBtn, false);
      }
    });
  }

  const biddingForm = document.getElementById('addBiddingForm');
  if (biddingForm) {
    biddingForm.addEventListener('submit', async event => {
      event.preventDefault();
      const submitBtn = biddingForm.querySelector('button[type="submit"]');
      toggleButton(submitBtn, true);

      const formData = new FormData(biddingForm);
      formData.append('action', 'addBidding');
      formData.set('title', (document.getElementById('biddingTitle')?.value || '').trim());
      formData.set('platform', (document.getElementById('biddingPlatform')?.value || '').trim());
      formData.set('condition', (document.getElementById('biddingCondition')?.value || '').trim());
      formData.set('current_bid', (document.getElementById('biddingCurrentBid')?.value || '').trim());
      formData.set('min_bid', (document.getElementById('biddingMinBid')?.value || '').trim());
      formData.set('time_left', (document.getElementById('biddingTimeLeft')?.value || '').trim());

      try {
        const response = await fetch('api_bidding.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success) {
          biddingForm.reset();
          setImagePreview('#biddingImagePreview img', 'sliderImage/1.jpeg');
          showToast('Bidding game added successfully.', 'success');
          await loadBiddings();
          await refreshDashboard();
        } else {
          showToast(result.message || 'Unable to add bidding game.', 'error');
        }
      } catch (error) {
        console.error('Bidding add failed', error);
        showToast('Failed to add bidding game.', 'error');
      } finally {
        toggleButton(submitBtn, false);
      }
    });
  }
}

async function refreshDashboard() {
  try {
    const [rentalsRes, biddingsRes, usersRes] = await Promise.all([
      fetch('api_rentals.php?action=getRentals'),
      fetch('api_bidding.php?action=getBiddings'),
      fetch('api_users.php?action=getStats')
    ]);

    const rentalsJson = await rentalsRes.json();
    const biddingsJson = await biddingsRes.json();
    const usersJson = await usersRes.json();

    const rentalCount = rentalsJson?.data?.length || 0;
    const biddingCount = biddingsJson?.data?.length || 0;
    const userCount = usersJson?.success ? Number(usersJson.total_users || usersJson.total || 0) : 0;

    updateText('totalGames', rentalCount + biddingCount);
    updateText('activeRentals', rentalCount);
    updateText('pendingBids', biddingCount);
    updateText('totalUsers', userCount);

    if (!usersJson?.success) {
      console.warn('User stats load failed:', usersJson?.message);
    }
  } catch (error) {
    console.error('Dashboard load failed', error);
    showToast('Unable to refresh dashboard metrics.', 'warning');
  }
}

async function loadRentals() {
  const tableBody = document.querySelector('#rentalsTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  try {
    const response = await fetch('api_rentals.php?action=getRentals');
    const result = await response.json();

    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No rental games found</td></tr>';
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No rental games found</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    result.data.forEach(game => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(game.title)}</td>
        <td>${escapeHtml(game.platforms || '-')}</td>
        <td>$${Number(game.weekly_price || 0).toFixed(2)}</td>
        <td>$${Number(game.monthly_price || 0).toFixed(2)}</td>
        <td>
          <button class="btn-delete" data-id="${game.id}" data-type="rental">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    attachDeleteHandlers(tableBody, 'rental');
  } catch (error) {
    console.error('Rental load failed', error);
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Failed to load rentals</td></tr>';
    showToast('Failed to load rental games.', 'error');
  }
}

async function loadBiddings() {
  const tableBody = document.querySelector('#biddingsTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    const response = await fetch('api_bidding.php?action=getBiddings');
    const result = await response.json();

    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No bidding games found</td></tr>';
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No bidding games found</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    result.data.forEach(game => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(game.title)}</td>
        <td>${escapeHtml(game.platform || '-')}</td>
        <td>${escapeHtml(game.condition || '-')}</td>
        <td>$${Number(game.current_bid || 0).toFixed(2)}</td>
        <td>${escapeHtml(game.time_left || '-')}</td>
        <td>
          <button class="btn-delete" data-id="${game.id}" data-type="bidding">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    attachDeleteHandlers(tableBody, 'bidding');
  } catch (error) {
    console.error('Bidding load failed', error);
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load bidding games</td></tr>';
    showToast('Failed to load bidding games.', 'error');
  }
}

function attachDeleteHandlers(container, type) {
  container.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      if (!id) return;

      const confirmText = type === 'rental' ? 'Delete this rental game?' : 'Delete this bidding game?';
      if (!confirm(confirmText)) return;

      try {
        const endpoint = type === 'rental' ? 'api_rentals.php?action=deleteRental' : 'api_bidding.php?action=deleteBidding';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(id) })
        });
        const result = await response.json();
        if (result.success) {
          showToast('Record deleted.', 'success');
          if (type === 'rental') {
            await loadRentals();
          } else {
            await loadBiddings();
          }
          await refreshDashboard();
        } else {
          showToast(result.message || 'Deletion failed.', 'error');
        }
      } catch (error) {
        console.error('Delete failed', error);
        showToast('Unable to delete record.', 'error');
      }
    });
  });
}

async function loadUsers(searchTerm = '') {
  currentUsersSearch = searchTerm;
  const tableBody = document.querySelector('#usersTable tbody');
  if (!tableBody) return;

  const params = new URLSearchParams({ action: 'getUsers' });
  if (searchTerm) params.append('search', searchTerm);

  tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    const response = await fetch(`api_users.php?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load users</td></tr>';
      showToast(result.message || 'Failed to load users.', 'error');
      return;
    }

    const users = Array.isArray(result.data) ? result.data : [];
    tableBody.innerHTML = '';

    if (users.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found</td></tr>';
      return;
    }

    users.forEach(user => {
      const row = document.createElement('tr');
      const displayName = user.full_name || user.username || user.email || 'Unknown';
      const levelValue = user.level !== null && user.level !== undefined && user.level !== ''
        ? `Level ${user.level}`
        : 'Level N/A';
      const memberSinceValue = formatDate(user.member_since || user.created_at);
      const isOnline = user.is_online === true || user.is_online === 1 || user.is_online === '1';

      row.innerHTML = `
        <td>${escapeHtml(user.id)}</td>
        <td>${escapeHtml(displayName)}</td>
        <td>${escapeHtml(user.email || 'Unavailable')}</td>
        <td>${escapeHtml(levelValue)}</td>
        <td>${escapeHtml(memberSinceValue)}</td>
        <td>
          <span class="status-label ${isOnline ? 'online' : 'offline'}">
            <span class="status-dot"></span>${isOnline ? 'Online' : 'Offline'}
          </span>
        </td>
        <td>
          <div class="table-actions compact">
            <button class="btn-icon btn-icon-sm edit" data-action="view" data-id="${escapeHtml(user.id)}" title="View profile" aria-label="View profile">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon btn-icon-sm delete" data-action="remove" data-id="${escapeHtml(user.id)}" title="Remove user" aria-label="Remove user">
              <i class="fas fa-user-slash"></i>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    attachUserActionHandlers(tableBody);

    if (typeof result.total_users === 'number') {
      updateText('totalUsers', result.total_users);
    }
  } catch (error) {
    console.error('User load failed', error);
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load users</td></tr>';
    showToast('Failed to load users.', 'error');
  }
}

function attachUserActionHandlers(container) {
  container.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', event => {
      const action = button.dataset.action;
      const userId = button.dataset.id;
      if (action === 'view') {
        showToast(`User ${userId} details coming soon.`, 'info');
      } else if (action === 'remove') {
        showToast('User management controls will be available soon.', 'warning');
      }
    });
  });
}

function setupUsersSearch() {
  const searchInput = document.getElementById('usersSearch');
  if (!searchInput) return;
  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentUsersSearch = searchInput.value.trim();
      loadUsers(currentUsersSearch);
    }, 300);
  });
}

function initImagePreview(inputId, previewSelector, fallbackSrc) {
  const input = document.getElementById(inputId);
  const previewImg = document.querySelector(previewSelector);
  if (!input || !previewImg) return;

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) {
      previewImg.src = fallbackSrc;
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      previewImg.src = event.target?.result || fallbackSrc;
    };
    reader.readAsDataURL(file);
  });
}

function setImagePreview(previewSelector, src) {
  const img = document.querySelector(previewSelector);
  if (img) {
    img.src = src;
  }
}

function toggleButton(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = isLoading ? 'Please wait…' : button.dataset.originalText;
}

function updateText(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return 'N/A';
  const parsed = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function generateReport(type) {
  showToast(`Report generation for ${type} is coming soon.`, 'info');
}
