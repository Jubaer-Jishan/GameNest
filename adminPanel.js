// Admin panel client logic for navigation, forms, and CRUD calls
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initForms();
  refreshDashboard();
  loadRentals();
  loadBiddings();
});

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
          alert('Rental game added successfully.');
          await loadRentals();
          await refreshDashboard();
        } else {
          alert(result.message || 'Unable to add rental game.');
        }
      } catch (error) {
        console.error('Rental add failed', error);
        alert('Failed to add rental game.');
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
          alert('Bidding game added successfully.');
          await loadBiddings();
          await refreshDashboard();
        } else {
          alert(result.message || 'Unable to add bidding game.');
        }
      } catch (error) {
        console.error('Bidding add failed', error);
        alert('Failed to add bidding game.');
      } finally {
        toggleButton(submitBtn, false);
      }
    });
  }
}

async function refreshDashboard() {
  try {
    const [rentalsRes, biddingsRes] = await Promise.all([
      fetch('api_rentals.php?action=getRentals'),
      fetch('api_bidding.php?action=getBiddings')
    ]);

    const rentalsJson = await rentalsRes.json();
    const biddingsJson = await biddingsRes.json();

    const rentalCount = rentalsJson?.data?.length || 0;
    const biddingCount = biddingsJson?.data?.length || 0;

    updateText('totalGames', rentalCount + biddingCount);
    updateText('activeRentals', rentalCount);
    updateText('pendingBids', biddingCount);
  } catch (error) {
    console.error('Dashboard load failed', error);
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
          alert('Record deleted.');
          if (type === 'rental') {
            await loadRentals();
          } else {
            await loadBiddings();
          }
          await refreshDashboard();
        } else {
          alert(result.message || 'Deletion failed.');
        }
      } catch (error) {
        console.error('Delete failed', error);
        alert('Unable to delete record.');
      }
    });
  });
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

function generateReport(type) {
  alert(`Generating ${type} report…`);
}
