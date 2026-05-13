-- 种子数据: 默认用户 (PBKDF2 哈希)
-- admin / admin123
INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', 'c0fsQgDmrSr4CwmesEj4zg:GNTnvfvx8ixTwq9vTfWzO8kHlhWOAR5de5-UuQw3xB8', 'admin');
-- user / user123
INSERT OR IGNORE INTO users (id, username, password, role) VALUES (2, 'user', 'VgM0V04U4wpwOXrBhI405A:nGjZyPeJyuvyaqM0kUBXS2fWXKrkbWbdshR6fkBGw8M', 'user');
