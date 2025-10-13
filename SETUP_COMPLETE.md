# 🎮 GameNest Admin Panel - Complete Setup Guide

## ⚠️ CRITICAL: Use Localhost, NOT File Protocol!

### ❌ WRONG Way (Will Show CORS Error):
```
file:///C:/xampp/htdocs/GameNest/GameNest/adminPanel.html
```

### ✅ CORRECT Way:
```
http://localhost/GameNest/GameNest/adminPanel.html
```

---

## 📋 Step-by-Step Setup:

### 1️⃣ Start XAMPP
1. Open **XAMPP Control Panel**
2. Click **Start** on **Apache**
3. Click **Start** on **MySQL**
4. Wait until both show green "Running" status

### 2️⃣ Create Database
1. Open browser and go to: `http://localhost/phpmyadmin`
2. Click **"New"** in left sidebar
3. Database name: `gamenest`
4. Click **"Create"**
5. Click **"SQL"** tab
6. Open `database_schema.sql` file
7. Copy all SQL code
8. Paste in SQL tab
9. Click **"Go"**
10. ✅ All tables created!

### 3️⃣ Open Admin Panel
1. Go to: `http://localhost/GameNest/GameNest/adminPanel.html`
2. You should see admin panel without errors!

---

## 🎯 Features Now Working:

### ✅ Image Upload
- **Rental Games**: Upload thumbnail when adding game
- **Bidding Games**: Upload thumbnail when adding game
- Supported formats: JPG, PNG, WebP, GIF
- Images saved in: `uploads/rentals/` and `uploads/biddings/`

### ✅ Navigation
- Dashboard
- Inventory
- Manage Sales
- Manage Rentals (with image upload)
- Manage Bidding (with image upload)
- Users
- Reports
- Logout

### ✅ CRUD Operations
- **Add** rental games with images
- **Delete** rental games
- **Add** bidding games with images  
- **Delete** bidding games
- **View** all games in tables
- **Real-time** dashboard statistics

---

## 🧪 How to Test:

### Test 1: Add Rental Game
1. Go to **"Manage Rentals"**
2. Fill form:
   - Title: God of War
   - Upload image (game cover)
   - Platforms: PlayStation, PC
   - Weekly Price: 5
   - Monthly Price: 15
3. Click **"Add Rental"**
4. ✅ Should see success message
5. ✅ Game appears in table below
6. ✅ Dashboard stats update

### Test 2: Add Bidding Game
1. Go to **"Manage Bidding"**
2. Fill form:
   - Title: Spider-Man
   - Upload image (game cover)
   - Platform: PlayStation
   - Condition: New
   - Starting Bid: 25
   - Minimum Bid: 30
   - Time Left: 2d 5h
3. Click **"Add Bidding Game"**
4. ✅ Should see success message
5. ✅ Game appears in table below
6. ✅ Dashboard stats update

### Test 3: Delete Games
1. Click trash icon next to any game
2. Confirm deletion
3. ✅ Game removed from table
4. ✅ Dashboard stats update

---

## 📁 Project Structure:

```
GameNest/
├── adminPanel.html          ← Admin interface
├── adminPanel.js            ← Admin logic (with image upload)
├── api_rentals.php          ← Rental API (handles uploads)
├── api_bidding.php          ← Bidding API (handles uploads)
├── database_schema.sql      ← Database structure
├── uploads/                 ← NEW! Image storage
│   ├── rentals/            ← Rental game images
│   └── biddings/           ← Bidding game images
└── sliderImage/            ← Default images
```

---

## 🔧 Troubleshooting:

### Problem: CORS Error
**Solution**: Use `http://localhost/...` NOT `file:///...`

### Problem: Image not uploading
**Check**:
1. `uploads/rentals/` and `uploads/biddings/` folders exist ✅
2. Folders have write permissions
3. File size under 10MB
4. File format is JPG/PNG/WebP/GIF

### Problem: Database error
**Check**:
1. XAMPP MySQL is running
2. Database `gamenest` exists
3. All tables created from `database_schema.sql`
4. Check `dbConnect.php` has correct credentials

### Problem: "Failed to add game"
**Check**:
1. All required fields filled
2. Image selected
3. Browser console for errors (F12)
4. PHP error logs in `C:\xampp\php\logs\`

---

## 🎉 Success Checklist:

- [ ] XAMPP Apache running
- [ ] XAMPP MySQL running
- [ ] Database `gamenest` created
- [ ] All tables created from SQL file
- [ ] Admin panel opens at `http://localhost/...`
- [ ] No CORS errors in console
- [ ] Can add rental game with image
- [ ] Can add bidding game with image
- [ ] Can delete games
- [ ] Dashboard shows correct counts
- [ ] Images stored in `uploads/` folders

---

## 🚀 Next Steps:

1. Connect `rentGames.html` to load from database
2. Connect `bidding.html` to load from database
3. Make frontend pages dynamic
4. Add user authentication
5. Add sales management

---

**Admin Panel Ready! 🎮✨**

Use: `http://localhost/GameNest/GameNest/adminPanel.html`
