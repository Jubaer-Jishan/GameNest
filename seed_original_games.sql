-- Seed script restoring the original hardcoded rental and bidding games
-- Run inside the `gamenest` database (e.g., via phpMyAdmin or the MySQL client)
-- The script removes any existing matching titles to prevent duplicates,
-- then inserts the canonical records that previously lived in rentGames.js and bidding.js.

START TRANSACTION;

-- ---------- Rental games ----------
DELETE FROM rental_games
WHERE title IN (
  'Elden Ring',
  'God of War (2018)',
  'Sekiro: Shadows Die Twice',
  'Spider Man',
  'Dark Souls 3',
  'Red Dead Redemption 2',
  'Assassin''s Creed Mirage',
  'FC 26',
  'Dishonored',
  'Little Nightmares',
  'GTA V',
  'Hollow-Knight Silksong',
  'F1 25',
  'DOOM Dark Ages',
  'Ghost of Yotei',
  'Hell is Us'
);

INSERT INTO rental_games (title, image, platforms, weekly_price, monthly_price, available)
VALUES
  ('Elden Ring', 'sliderImage/11.jpg', 'PS4/PS5, Xbox One/Series', 6.00, 17.00, 1),
  ('God of War (2018)', 'sliderImage/10.jpg', 'PC, PS4/PS5', 5.00, 15.00, 1),
  ('Sekiro: Shadows Die Twice', 'sliderImage/3.jpeg', 'PS4, PS5, PC', 7.00, 19.00, 1),
  ('Spider Man', 'sliderImage/14.jpg', 'PS5, PC', 6.00, 18.00, 1),
  ('Dark Souls 3', 'sliderImage/6.jpeg', 'PC, PS4/PS5, Switch', 8.00, 21.00, 1),
  ('Red Dead Redemption 2', 'sliderImage/1.jpeg', 'PS4, Xbox One, PC', 7.00, 22.00, 1),
  ('Assassin''s Creed Mirage', 'sliderImage/9.jpg', 'PC, PS5', 5.00, 17.00, 1),
  ('FC 26', 'sliderImage/8.jpg', 'PC, PS5, Xbox One/Series', 6.00, 16.00, 1),
  ('Dishonored', 'sliderImage/17.jpg', 'PC, PS4', 7.00, 19.00, 1),
  ('Little Nightmares', 'sliderImage/18.jpg', 'Switch, PS4', 8.00, 18.00, 1),
  ('GTA V', 'sliderImage/19.jpg', 'PS4/PS5, Xbox Series X/S', 6.00, 20.00, 1),
  ('Hollow-Knight Silksong', 'sliderImage/20.jpg', 'Switch, PC', 5.00, 15.00, 1),
  ('F1 25', 'sliderImage/21.jpg', 'PC, Xbox One/Series', 7.00, 19.00, 1),
  ('DOOM Dark Ages', 'sliderImage/22.jpg', 'PC, PS5', 6.00, 18.00, 1),
  ('Ghost of Yotei', 'sliderImage/23.jpg', 'PS4, Switch', 8.00, 21.00, 1),
  ('Hell is Us', 'sliderImage/24.jpg', 'PC, Xbox One/Series', 6.00, 17.00, 1);

-- ---------- Bidding games ----------
DELETE FROM bidding_games
WHERE title IN (
  'Bloodborne',
  'FC 26',
  'God of War',
  'Minecraft',
  'Spider-Man',
  'Until Dawn',
  'Red Dead Redemption 2',
  'NBA',
  'The Witcher 3',
  'Dishonored',
  'Little Nightmares',
  'GTA V',
  'Hollow-Knight Silksong',
  'F1 25',
  'DOOM Dark Ages',
  'Ghost of Yotei',
  'Hell is Us'
);

INSERT INTO bidding_games (title, image, platform, `condition`, current_bid, min_bid, time_left, status)
VALUES
  ('Bloodborne', 'https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg', 'PlayStation', 'Used - Good', 50.00, 55.00, '2d 5h', 'active'),
  ('FC 26', 'sliderImage/8.jpg', 'Multi-Platform', 'New', 40.00, 45.00, '3d 4h', 'active'),
  ('God of War', 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg', 'PlayStation', 'Collector''s Edition', 60.00, 65.00, '1d 20h', 'active'),
  ('Minecraft', 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fencrypted-tbn2.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcS8GqmyBiwcs2RvDreAHAs_fg5e8es-KYLzHM9NqA7nWuU6K705&psig=AOvVaw39cnyTlwkw8KPNgy6WUnyt&ust=1757803059443000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCKCYxOmk1I8DFQAAAAAdAAAAABAE', 'All Platforms', 'Used - Fair', 30.00, 35.00, '4d 2h', 'active'),
  ('Spider-Man', 'sliderImage/14.jpg', 'PlayStation', 'Like New', 55.00, 60.00, '22h 15m', 'active'),
  ('Until Dawn', 'sliderImage/15.jpg', 'PlayStation', 'Used - Good', 35.00, 40.00, '18h 30m', 'active'),
  ('Red Dead Redemption 2', 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg', 'PlayStation & Xbox', 'Collector''s Steelbook', 70.00, 75.00, '1d 8h', 'active'),
  ('NBA', 'sliderImage/16.jpg', 'PlayStation', 'New', 20.00, 25.00, '12h 10m', 'active'),
  ('The Witcher 3', 'sliderImage/12.jpg', 'PC & PlayStation', 'Used - Excellent', 70.00, 75.00, '2d 12h', 'active'),
  ('Dishonored', 'sliderImage/17.jpg', 'PC & Xbox', 'Used - Good', 45.00, 50.00, '3d 6h', 'active'),
  ('Little Nightmares', 'sliderImage/18.jpg', 'Switch & PlayStation', 'New', 35.00, 40.00, '1d 4h', 'active'),
  ('GTA V', 'sliderImage/19.jpg', 'PS5 & Xbox Series', 'Used - Good', 60.00, 65.00, '2d 1h', 'active'),
  ('Hollow-Knight Silksong', 'sliderImage/20.jpg', 'Switch & PC', 'Preorder Bundle', 55.00, 60.00, '21h 45m', 'active'),
  ('F1 25', 'sliderImage/21.jpg', 'PC & Xbox', 'New', 40.00, 45.00, '19h 5m', 'active'),
  ('DOOM Dark Ages', 'sliderImage/22.jpg', 'PC & PS5', 'Deluxe Edition', 50.00, 55.00, '16h 20m', 'active'),
  ('Ghost of Yotei', 'sliderImage/23.jpg', 'PS4 & Switch', 'Used - Excellent', 45.00, 50.00, '2d 9h', 'active'),
  ('Hell is Us', 'sliderImage/24.jpg', 'PC & Xbox', 'New', 40.00, 45.00, '3d 1h', 'active');

COMMIT;
