-- campuswire_schema.sql
DROP DATABASE IF EXISTS campuswire_db;
CREATE DATABASE campuswire_db;
USE campuswire_db;

CREATE TABLE `User` (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  dept VARCHAR(50),
  year INT,
  role ENUM('Student','Moderator','Admin') DEFAULT 'Student',
  warning_level ENUM('Green','Orange','Red') DEFAULT 'Green',
  warning_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `Post` (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  emotion ENUM('Happy','Sad','Angry','Excited','Neutral') DEFAULT 'Neutral',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Active','Flagged','Deleted') DEFAULT 'Active',
  FOREIGN KEY (user_id) REFERENCES `User`(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Reaction` (
  reaction_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  type ENUM('Like','Comment') NOT NULL,
  comment_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES `Post`(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES `User`(user_id)
) ENGINE=InnoDB;

CREATE TABLE `Warning` (
  warning_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reason VARCHAR(255),
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES `User`(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `FestivalTheme` (
  theme_id INT AUTO_INCREMENT PRIMARY KEY,
  festival_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  background_image VARCHAR(255),
  banner_image VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `EmotionFeed` (
  feed_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  emotion_preference ENUM('Happy','Sad','Angry','Excited','Neutral') DEFAULT 'Neutral',
  suggested_post_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES `User`(user_id),
  FOREIGN KEY (suggested_post_id) REFERENCES `Post`(post_id)
) ENGINE=InnoDB;

CREATE TABLE `Report` (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  reported_by INT NOT NULL,
  reason VARCHAR(255),
  report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES `Post`(post_id),
  FOREIGN KEY (reported_by) REFERENCES `User`(user_id)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER prevent_duplicate_email
BEFORE INSERT ON `User`
FOR EACH ROW
BEGIN
  IF (SELECT COUNT(*) FROM `User` WHERE email = NEW.email) > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account already exists for this email.';
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER issue_warning_after_flag
AFTER UPDATE ON `Post`
FOR EACH ROW
BEGIN
  IF NEW.status = 'Flagged' AND OLD.status <> 'Flagged' THEN
    INSERT INTO `Warning`(user_id, reason) VALUES (NEW.user_id, CONCAT('Post flagged (post_id=', NEW.post_id, ')'));
    UPDATE `User`
    SET warning_count = warning_count + 1,
        warning_level = CASE
          WHEN warning_count + 1 >= 3 THEN 'Red'
          WHEN warning_count + 1 = 2 THEN 'Orange'
          ELSE 'Green'
        END
    WHERE user_id = NEW.user_id;
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER update_user_on_warning_insert
AFTER INSERT ON `Warning`
FOR EACH ROW
BEGIN
  UPDATE `User`
  SET warning_count = warning_count + 1,
      warning_level = CASE
        WHEN warning_count + 1 >= 3 THEN 'Red'
        WHEN warning_count + 1 = 2 THEN 'Orange'
        ELSE 'Green'
      END
  WHERE user_id = NEW.user_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE update_warning_status(IN uid INT)
BEGIN
  DECLARE wcount INT DEFAULT 0;
  SELECT warning_count INTO wcount FROM `User` WHERE user_id = uid;
  UPDATE `User`
  SET warning_level = CASE
    WHEN wcount >= 3 THEN 'Red'
    WHEN wcount = 2 THEN 'Orange'
    ELSE 'Green'
  END
  WHERE user_id = uid;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE getEmotionFeed(IN uid INT)
BEGIN
  DECLARE emo ENUM('Happy','Sad','Angry','Excited','Neutral');
  DECLARE userPresent INT DEFAULT 0;
  SELECT COUNT(*) INTO userPresent FROM `EmotionFeed` WHERE user_id = uid;
  IF userPresent = 1 THEN
    SELECT emotion_preference INTO emo FROM `EmotionFeed` WHERE user_id = uid LIMIT 1;
  ELSE
    SET emo = 'Neutral';
  END IF;

  IF emo = 'Sad' THEN
    SELECT * FROM `Post` WHERE emotion IN ('Happy','Excited') AND status='Active' ORDER BY created_at DESC;
  ELSEIF emo = 'Angry' THEN
    SELECT * FROM `Post` WHERE emotion IN ('Neutral','Happy') AND status='Active' ORDER BY created_at DESC;
  ELSEIF emo = 'Happy' THEN
    SELECT * FROM `Post` WHERE emotion IN ('Happy','Excited') AND status='Active' ORDER BY created_at DESC;
  ELSEIF emo = 'Excited' THEN
    SELECT * FROM `Post` WHERE emotion IN ('Excited','Happy') AND status='Active' ORDER BY created_at DESC;
  ELSE
    SELECT * FROM `Post` WHERE status='Active' ORDER BY created_at DESC;
  END IF;
END$$
DELIMITER ;

CREATE VIEW TopActiveUsers AS
SELECT U.user_id, U.name, COUNT(P.post_id) AS total_posts
FROM `User` U LEFT JOIN `Post` P ON U.user_id = P.user_id
GROUP BY U.user_id
ORDER BY total_posts DESC;

CREATE VIEW UserWarningSummary AS
SELECT U.user_id, U.name, U.warning_level, U.warning_count, COUNT(W.warning_id) AS warnings_logged
FROM `User` U LEFT JOIN `Warning` W ON U.user_id = W.user_id
GROUP BY U.user_id;

CREATE VIEW FlaggedPosts AS
SELECT P.post_id, P.user_id, U.name AS author_name, P.content, P.created_at
FROM `Post` P JOIN `User` U ON P.user_id = U.user_id
WHERE P.status = 'Flagged'
ORDER BY P.created_at DESC;

CREATE EVENT IF NOT EXISTS purge_red_users
ON SCHEDULE EVERY 1 WEEK
DO
  DELETE FROM `User` WHERE warning_level = 'Red' AND warning_count >= 5;

-- sample data
INSERT INTO `User`(name, email, password, dept, year, role)
VALUES
('Alice Johnson','alice@university.edu','hashed_pw1','CSE',3,'Student'),
('Bob Singh','bob@university.edu','hashed_pw2','ECE',2,'Student'),
('Carol Mehta','carol@university.edu','hashed_pw3','ME',4,'Moderator'),
('Admin User','admin@university.edu','hashed_pw_admin','AdminDept',0,'Admin');

INSERT INTO `Post`(user_id, content, emotion) VALUES
(1, 'Lovely day at campus! ☀️', 'Happy'),
(2, 'Stressed about exams 😓', 'Sad'),
(1, 'Club fest this weekend, everyone join!', 'Excited'),
(2, 'This is an offensive test post with bad words', 'Angry');

UPDATE `Post`
SET status = 'Flagged'
ORDER BY post_id DESC
LIMIT 1;


INSERT INTO `EmotionFeed`(user_id, emotion_preference) VALUES
(1, 'Happy'),
(2, 'Sad');

INSERT INTO `FestivalTheme`(festival_name, start_date, end_date, primary_color, secondary_color, background_image, banner_image)
VALUES
('Diwali','2025-10-20','2025-10-27','#FFD700','#FF9933','/themes/diwali_bg.png','/themes/diwali_banner.svg'),
('Christmas','2025-12-20','2025-12-26','#B30000','#FFFFFF','/themes/christmas_bg.png','/themes/christmas_banner.svg');

-- end
