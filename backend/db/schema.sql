CREATE DATABASE IF NOT EXISTS kelp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kelp;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('client','coach') NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coaches (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL UNIQUE,
  specialty  VARCHAR(255),
  is_head    BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clients (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE,
  height_cm      FLOAT,
  date_of_birth  DATE,
  head_coach_id  INT,
  joined_at      DATE NOT NULL DEFAULT (CURRENT_DATE),
  FOREIGN KEY (user_id)       REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (head_coach_id) REFERENCES coaches(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS client_coaches (
  client_id INT NOT NULL,
  coach_id  INT NOT NULL,
  since     DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (client_id, coach_id),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (coach_id)  REFERENCES coaches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  client_id       INT NOT NULL UNIQUE,
  weight_kg       FLOAT,
  body_fat_pct    FLOAT,
  muscle_mass_kg  FLOAT,
  water_pct       FLOAT,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scans (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  client_id       INT NOT NULL,
  coach_id        INT NOT NULL,
  scan_date       DATE NOT NULL,
  weight_kg       FLOAT NOT NULL,
  body_fat_pct    FLOAT NOT NULL,
  muscle_mass_kg  FLOAT NOT NULL,
  visceral_fat    INT NOT NULL,
  water_pct       FLOAT NOT NULL,
  metabolic_age   INT NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (coach_id)  REFERENCES coaches(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at     TIMESTAMP NULL,
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
