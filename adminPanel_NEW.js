// GameNest Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
  setupNavigation();
  setupForms();
  loadDashboardStats();
  loadRentals();
  loadBiddings();
});

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (!this.classList.contains('logout')) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        if (sectionId === 'dashboard') loadDashboardStats();
        else if (sectionId === 'rentals') loadRentals();
        else if (sectionId === 'biddings') loadBiddings();
      }
    });
  });
  document.querySelector('.logout').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Logout?')) window.location.href = 'home.html';
  });
}

function setupForms() {
  const rentalForm = document.getElementById('addRentalForm');
  if (rentalForm) {
    rentalForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const platforms = Array.from(document.getElementById('rentalPlatforms').selectedOptions).map(o => o.value).join(',');
      const data = {
        title: document.getElementById('rentalTitle').value,
        platforms: platforms,
        weekly_price: document.getElementById('rentalWeek').value,
        monthly_price: document.getElementById('rentalMonth').value
      };
      try {
        const res = await fetch('api_rentals.php?action=addRental', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          alert('Rental added!');
          e.target.reset();
          loadRentals();
          loadDashboardStats();
        } else alert('Error: ' + result.message);
      } catch(err) { alert('Failed'); }
    });
  }

  const biddingForm = document.getElementById('addBiddingForm');
  if (biddingForm) {
    biddingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const data = {
        title: document.getElementById('biddingTitle').value,
        platform: document.getElementById('biddingPlatform').value,
        condition: document.getElementById('biddingCondition').value,
        current_bid: document.getElementById('biddingCurrentBid').value,
        min_bid: document.getElementById('biddingMinBid').value,
        time_left: document.getElementById('biddingTimeLeft').value
      };
      try {
        const res = await fetch('api_bidding.php?action=addBidding', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          alert('Bidding added!');
          e.target.reset();
          loadBiddings();
          loadDashboardStats();
        } else alert('Error: ' + result.message);
      } catch(err) { alert('Failed'); }
    });
  }
}

async function loadDashboardStats() {
  try {
    const [r1, r2] = await Promise.all([
      fetch('api_rentals.php?action=getRentals'),
      fetch('api_bidding.php?action=getBiddings')
    ]);
    const rentals = await r1.json();
    const biddings = await r2.json();
    document.getElementById('totalGames').textContent = (rentals.data?.length || 0) + (biddings.data?.length || 0);
    document.getElementById('activeRentals').textContent = rentals.data?.length || 0;
    document.getElementById('pendingBids').textContent = biddings.data?.length || 0;
  } catch(err) { console.error(err); }
}

async function loadRentals() {
  try {
    const res = await fetch('api_rentals.php?action=getRentals');
    const result = await res.json();
    const tbody = document.querySelector('#rentalsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (result.success && result.data?.length) {
      result.data.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = '<td>' + r.title + '</td><td>' + r.platforms + '</td><td>$' + r.weekly_price + '</td><td>$' + r.monthly_price + '</td><td><button class=\"btn-delete\" onclick=\"deleteRental(' + r.id + ')\"><i class=\"fas fa-trash\"></i></button></td>';
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan=\"5\" style=\"text-align:center;\">No rentals</td></tr>';
    }
  } catch(err) { console.error(err); }
}

async function deleteRental(id) {
  if (!confirm('Delete?')) return;
  try {
    const res = await fetch('api_rentals.php?action=deleteRental', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id})
    });
    const result = await res.json();
    if (result.success) {
      alert('Deleted!');
      loadRentals();
      loadDashboardStats();
    }
  } catch(err) { alert('Failed'); }
}

async function loadBiddings() {
  try {
    const res = await fetch('api_bidding.php?action=getBiddings');
    const result = await res.json();
    const tbody = document.querySelector('#biddingsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (result.success && result.data?.length) {
      result.data.forEach(b => {
        const row = document.createElement('tr');
        row.innerHTML = '<td>' + b.title + '</td><td>' + b.platform + '</td><td>' + b.condition + '</td><td>$' + b.current_bid + '</td><td>' + b.time_left + '</td><td><button class=\"btn-delete\" onclick=\"deleteBidding(' + b.id + ')\"><i class=\"fas fa-trash\"></i></button></td>';
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan=\"6\" style=\"text-align:center;\">No biddings</td></tr>';
    }
  } catch(err) { console.error(err); }
}

async function deleteBidding(id) {
  if (!confirm('Delete?')) return;
  try {
    const res = await fetch('api_bidding.php?action=deleteBidding', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id})
    });
    const result = await res.json();
    if (result.success) {
      alert('Deleted!');
      loadBiddings();
      loadDashboardStats();
    }
  } catch(err) { alert('Failed'); }
}

function generateReport(type) {
  alert('Generating ' + type + ' report...');
}
