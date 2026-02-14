-- =====================================================
-- NutriTrip: Learned Preferences & User Profile (MySQL)
-- Linked to Utilizador table
-- =====================================================

-- User profile from onboarding (goal, diet, allergies, budget)
CREATE TABLE IF NOT EXISTS PerfilUtilizador (
  Utilizador INT PRIMARY KEY,
  Objetivo VARCHAR(20),                           -- 'lose', 'maintain', 'gain'
  Dieta JSON,                                     -- '["vegetarian","keto"]'
  Alergias JSON,                                  -- '["dairy","nuts"]'
  Orcamento VARCHAR(20),                          -- 'low', 'medium', 'high'
  AtualizadoEm DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (Utilizador) REFERENCES Utilizador(Id) ON DELETE CASCADE
);

-- Learned food preferences (extracted from AI chats, onboarding, or manual input)
CREATE TABLE IF NOT EXISTS PreferenciaAprendida (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Utilizador INT NOT NULL,
  Tipo ENUM('like', 'dislike', 'allergy', 'avoid', 'goal') NOT NULL,
  Tag VARCHAR(100) NOT NULL,
  Fonte VARCHAR(20) DEFAULT 'chat',               -- 'chat', 'onboarding', 'manual'
  CriadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Utilizador) REFERENCES Utilizador(Id) ON DELETE CASCADE,
  UNIQUE(Utilizador, Tag, Tipo)
);

-- Indexes (MySQL doesn't support IF NOT EXISTS for indexes — use ALTER TABLE IGNORE)
ALTER TABLE PreferenciaAprendida ADD INDEX idx_pref_utilizador (Utilizador);
