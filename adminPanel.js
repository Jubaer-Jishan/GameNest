// adminPanel.js
// Sample data (replace with database calls later)
let inventoryData = [
  { id: 1, title: 'Elden Ring', platform: 'PS5', condition: 'new', quantity: 10, price: 59.99 },
  { id: 2, title: 'God of War', platform: 'PC', condition: 'used', quantity: 5, price: 29.99 },
  { id: 3, title: 'The Witcher 3', platform: 'Xbox', condition: 'new', quantity: 8, price: 39.99 }
];

let salesData = [
  { id: 1, title: 'Elden Ring', condition: 'new', price: 59.99, stock: 10 },
  { id: 2, title: 'God of War', condition: 'used', price: 29.99, stock: 5 }
];

let rentalsData = [
  { id: 1, title: 'God of War', platforms: ['PS5', 'PC'], week: 7, month: 20 },
  { id: 2, title: 'The Witcher 3', platforms: ['Xbox', 'Switch'], week: 5, month: 15 }
];

let usersData = [
  { id: 1, username: 'AdminUser', email: 'admin@gamenest.com', role: 'Admin', joined: '2025-01-01' },
  { id: 2, username: 'Gamer123', email: 'gamer@email.com', role: 'User', joined: '2025-02-15' }
];

let currentEditingId = null;

// Navigation
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      showSection(section);
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Logout
  document.querySelector('.logout').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
      // Redirect to login
      window.location.href = 'auth.html';
    }
  });

  // Initial load
  loadDashboard();
  loadInventory();
  loadSales();
  loadRentals();
  loadUsers();

  // Forms
  document.getElementById('addSaleForm').addEventListener('submit', addSale);
  document.getElementById('addRentalForm').addEventListener('submit', addRental);

  // Modal close
  document.querySelector('.close').addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) closeModal();
  });

  // Add game button
  document.getElementById('addGameBtn').addEventListener('click', () => {
    showSection('sales');
  });

  // Condition filter
  document.getElementById('conditionFilter').addEventListener('change', filterInventory);

  // Search filters
  document.getElementById('salesSearch').addEventListener('input', filterTable);
  document.getElementById('rentalsSearch').addEventListener('input', filterTable);
  document.getElementById('usersSearch').addEventListener('input', filterTable);
});

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

function loadDashboard() {
  document.getElementById('totalGames').textContent = inventoryData.length;
  document.getElementById('activeRentals').textContent = rentalsData.length;
  document.getElementById('totalUsers').textContent = usersData.length;
  document.getElementById('pendingBids').textContent = '23'; // Static for now
}

function loadInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = '';
  inventoryData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>${item.platform}</td>
      <td><span class="badge ${item.condition}">${item.condition.toUpperCase()}</span></td>
      <td>${item.quantity}</td>
      <td>$${item.price}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('inventory', ${item.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteItem('inventory', ${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function loadSales() {
  const tbody = document.querySelector('#salesTable tbody');
  tbody.innerHTML = '';
  salesData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.title}</td>
      <td><span class="badge ${item.condition}">${item.condition.toUpperCase()}</span></td>
      <td>$${item.price}</td>
      <td>${item.stock}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('sales', ${item.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteItem('sales', ${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function loadRentals() {
  const tbody = document.querySelector('#rentalsTable tbody');
  tbody.innerHTML = '';
  rentalsData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>${item.platforms.join(', ')}</td>
      <td>$${item.week}</td>
      <td>$${item.month}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('rentals', ${item.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteItem('rentals', ${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function loadUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  usersData.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td><span class="badge ${user.role.toLowerCase()}">${user.role}</span></td>
      <td>${user.joined}</td>
      <td>
        <button class="btn btn-edit" onclick="editUser(${user.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addSale(e) {
  e.preventDefault();
  const title = document.getElementById('saleTitle').value;
  const condition = document.getElementById('saleCondition').value;
  const price = parseFloat(document.getElementById('salePrice').value);
  const platforms = Array.from(document.getElementById('salePlatforms').selectedOptions).map(opt => opt.value);
  const stock = parseInt(document.getElementById('saleStock').value);

  const newSale = {
    id: salesData.length + 1,
    title,
    condition,
    price,
    platforms: platforms.join(', '),
    stock
  };

  salesData.push(newSale);
  loadSales();
  e.target.reset();
  alert('Game added for sale!');
}

function addRental(e) {
  e.preventDefault();
  const title = document.getElementById('rentalTitle').value;
  const platforms = Array.from(document.getElementById('rentalPlatforms').selectedOptions).map(opt => opt.value);
  const week = parseInt(document.getElementById('rentalWeek').value);
  const month = parseInt(document.getElementById('rentalMonth').value);

  const newRental = {
    id: rentalsData.length + 1,
    title,
    platforms,
    week,
    month
  };

  rentalsData.push(newRental);
  loadRentals();
  e.target.reset();
  alert('Rental added!');
}

function editItem(section, id) {
  currentEditingId = id;
  const data = section === 'inventory' ? inventoryData : section === 'sales' ? salesData : rentalsData;
  const item = data.find(i => i.id === id);

  const modal = document.getElementById('editModal');
  const form = document.getElementById('editForm');
  form.innerHTML = `
    <div class="form-group">
      <label>Title:</label>
      <input type="text" id="editTitle" value="${item.title}" required>
    </div>
    <div class="form-group">
      <label>Price/Week:</label>
      <input type="number" id="editPrice" value="${item.price || item.week}" step="0.01" required>
    </div>
    <div class="form-group">
      <label>Stock/Quantity:</label>
      <input type="number" id="editStock" value="${item.stock || item.quantity}" min="0" required>
    </div>
    <button type="submit" class="btn btn-primary">Save Changes</button>
  `;

  form.onsubmit = (e) => {
    e.preventDefault();
    item.title = document.getElementById('editTitle').value;
    item.price = parseFloat(document.getElementById('editPrice').value);
    item.stock = parseInt(document.getElementById('editStock').value);
    loadInventory(); // Refresh relevant table
    closeModal();
    alert('Item updated!');
  };

  modal.style.display = 'block';
}

function deleteItem(section, id) {
  if (confirm('Are you sure?')) {
    const data = section === 'inventory' ? inventoryData : section === 'sales' ? salesData : rentalsData;
    const index = data.findIndex(i => i.id === id);
    data.splice(index, 1);
    if (section === 'inventory') loadInventory();
    else if (section === 'sales') loadSales();
    else loadRentals();
    alert('Item deleted!');
  }
}

function editUser(id) {
  // Similar to editItem, but for users
  alert('Edit user functionality - implement form');
}

function deleteUser(id) {
  if (confirm('Are you sure?')) {
    const index = usersData.findIndex(u => u.id === id);
    usersData.splice(index, 1);
    loadUsers();
    alert('User deleted!');
  }
}

function filterInventory() {
  const filter = document.getElementById('conditionFilter').value;
  // Implement filtering logic
  loadInventory(); // Reload with filter
}

function filterTable() {
  // Generic filter for tables
  const search = event.target.value.toLowerCase();
  const tableId = event.target.id.replace('Search', 'Table');
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
}

function generateReport(type) {
  const output = document.getElementById('reportOutput');
  output.innerHTML = `<p>Generating ${type} report... (Mock data - connect to DB later)</p><pre>${JSON.stringify(type === 'sales' ? salesData : type === 'rentals' ? rentalsData : usersData, null, 2)}</pre>`;
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

function logout() {
  if (confirm('Logout?')) {
    window.location.href = 'login.html'; // Or auth.html
  }
}

function loadAllData() {
  loadDashboard();
  loadInventory();
  loadSales();
  loadRentals();
  loadUsers();
  alert('Data refreshed!');
}