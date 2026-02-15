-- =====================================================
-- NutriTrip: Migrate all remaining tables to MySQL
-- This adds: Password column, chat sessions/messages, meal logs
-- =====================================================

-- Add Password column to Utilizador if it doesn't exist
-- (Python auth may have already added it)

-- Chat sessions
CREATE TABLE IF NOT EXISTS ChatSession (
  Id VARCHAR(36) PRIMARY KEY,
  Utilizador INT NOT NULL,
  Titulo VARCHAR(100) NULL,
  CriadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  AtualizadoEm DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (Utilizador) REFERENCES Utilizador(Id) ON DELETE CASCADE,
  INDEX idx_chat_session_user (Utilizador)
) ENGINE=InnoDB;

-- Chat messages
CREATE TABLE IF NOT EXISTS ChatMensagem (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Sessao VARCHAR(36) NOT NULL,
  Role ENUM('user', 'assistant', 'system') NOT NULL,
  Conteudo TEXT NOT NULL,
  CriadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Sessao) REFERENCES ChatSession(Id) ON DELETE CASCADE,
  INDEX idx_chat_msg_session (Sessao)
) ENGINE=InnoDB;

-- Meal logs
CREATE TABLE IF NOT EXISTS RegistoRefeicao (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Utilizador INT NOT NULL,
  TipoRefeicao ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  Nome VARCHAR(255) NULL,
  Notas TEXT NULL,
  Imagem LONGTEXT NULL,
  Calorias INT DEFAULT 0,
  Proteina DECIMAL(6,1) DEFAULT 0,
  Hidratos DECIMAL(6,1) DEFAULT 0,
  Gordura DECIMAL(6,1) DEFAULT 0,
  RegistadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Utilizador) REFERENCES Utilizador(Id) ON DELETE CASCADE,
  INDEX idx_meal_user (Utilizador),
  INDEX idx_meal_date (RegistadoEm)
) ENGINE=InnoDB;
