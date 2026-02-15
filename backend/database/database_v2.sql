DROP DATABASE IF EXISTS nutritrip;

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema nutritrip
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema nutritrip
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `nutritrip` DEFAULT CHARACTER SET utf8 ;
USE `nutritrip` ;

-- -----------------------------------------------------
-- Table `nutritrip`.`Utilizador`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Utilizador` (
  `Id` INT NOT NULL,
  `Nome` VARCHAR(64) NOT NULL,
  `Email` VARCHAR(256) NOT NULL,
  `Password` VARCHAR(255) NULL,
  `Dob` DATE NOT NULL,
  `Genero` ENUM('M', 'F', 'O') NOT NULL,
  `UltimoPeriodo` DATE NULL,
  `DiaInicio` ENUM('Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo') NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`PreferenciasRefeicoes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`PreferenciasRefeicoes` (
  `Id` INT NOT NULL,
  `Preferencia` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Refeicao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Refeicao` (
  `Id` INT NOT NULL,
  `Utilizador` INT NOT NULL,
  `Tag` INT NULL,
  `Constituicao` VARCHAR(64) NOT NULL,
  `Data` DATE NOT NULL,
  `Tipo` ENUM('Almoco', 'Jantar', 'Outro') NULL,
  `Notas` VARCHAR(256) NULL,
  PRIMARY KEY (`Id`, `Utilizador`),
  INDEX `fk_Refeicao_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  CONSTRAINT `fk_Refeicao_Tag1`
    FOREIGN KEY (`Tag`)
    REFERENCES `nutritrip`.`PreferenciasRefeicoes` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Refeicao_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`UtilizadorPreferenciasRefeicoes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`UtilizadorPreferenciasRefeicoes` (
  `Utilizador` INT NOT NULL,
  `PreferenciasRefeicoes` INT NOT NULL,
  PRIMARY KEY (`Utilizador`, `PreferenciasRefeicoes`),
  INDEX `fk_UtilizadorTag_Tag1_idx` (`PreferenciasRefeicoes` ASC) VISIBLE,
  CONSTRAINT `fk_UtilizadorTag_Utilizador`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_UtilizadorTag_Tag1`
    FOREIGN KEY (`PreferenciasRefeicoes`)
    REFERENCES `nutritrip`.`PreferenciasRefeicoes` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Restricao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Restricao` (
  `Descricao` VARCHAR(64) NOT NULL,
  `Utilizador` INT NOT NULL,
  `Severidade` ENUM('Baixa', 'Media', 'Alto', '?') NOT NULL,
  PRIMARY KEY (`Descricao`, `Utilizador`),
  INDEX `fk_Restricao_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  CONSTRAINT `fk_Restricao_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Objetivo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Objetivo` (
  `Descricao` VARCHAR(64) NOT NULL,
  `Utilizador` INT NOT NULL,
  `DataAdicao` DATE NOT NULL,
  PRIMARY KEY (`Descricao`, `Utilizador`),
  INDEX `fk_Objetivo_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  CONSTRAINT `fk_Objetivo_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Chat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Chat` (
  `Id` INT NOT NULL,
  `Utilizador` INT NOT NULL,
  `Ligacao` VARCHAR(255) NOT NULL,
  `Data` DATE NULL,
  PRIMARY KEY (`Id`, `Utilizador`),
  INDEX `fk_Chat_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  CONSTRAINT `fk_Chat_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`AtividadeFisica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`AtividadeFisica` (
  `Id` INT NOT NULL,
  `Designacao` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`UtilizadorAtividadeFisica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`UtilizadorAtividadeFisica` (
  `Utilizador` INT NOT NULL,
  `AtividadeFisica` INT NOT NULL,
  `Data` DATE NOT NULL,
  PRIMARY KEY (`Utilizador`, `AtividadeFisica`),
  INDEX `fk_UtilizadorAtividadeFisica_AtividadeFisica1_idx` (`AtividadeFisica` ASC) VISIBLE,
  CONSTRAINT `fk_UtilizadorAtividadeFisica_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_UtilizadorAtividadeFisica_AtividadeFisica1`
    FOREIGN KEY (`AtividadeFisica`)
    REFERENCES `nutritrip`.`AtividadeFisica` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`RegistoPeso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`RegistoPeso` (
  `Registo` INT NOT NULL,
  `Data` DATE NOT NULL,
  `Utilizador` INT NOT NULL,
  PRIMARY KEY (`Registo`, `Utilizador`),
  INDEX `fk_RegistoPeso_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  CONSTRAINT `fk_RegistoPeso_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Alimento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Alimento` (
  `Id` INT NOT NULL,
  `Designacao` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`RefeicaoAlimento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`RefeicaoAlimento` (
  `Refeicao` INT NOT NULL,
  `Utilizador` INT NOT NULL,
  `Alimento` INT NOT NULL,
  PRIMARY KEY (`Refeicao`, `Utilizador`, `Alimento`),
  INDEX `fk_RefeicaoAlimento_Alimento1_idx` (`Alimento` ASC) VISIBLE,
  CONSTRAINT `fk_RefeicaoAlimento_Refeicao1`
    FOREIGN KEY (`Refeicao` , `Utilizador`)
    REFERENCES `nutritrip`.`Refeicao` (`Id` , `Utilizador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_RefeicaoAlimento_Alimento1`
    FOREIGN KEY (`Alimento`)
    REFERENCES `nutritrip`.`Alimento` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

ALTER TABLE `nutritrip`.`RefeicaoAlimento` 
DROP FOREIGN KEY `fk_RefeicaoAlimento_Refeicao1`;

ALTER TABLE `nutritrip`.`RefeicaoAlimento` 
ADD CONSTRAINT `fk_RefeicaoAlimento_Refeicao1`
  FOREIGN KEY (`Refeicao`, `Utilizador`)
  REFERENCES `nutritrip`.`Refeicao` (`Id`, `Utilizador`)
  ON DELETE CASCADE;
  
-- 1. Ativar o agendador (se ainda não estiver ativo)
SET GLOBAL event_scheduler = ON;

DELIMITER $$

CREATE EVENT IF NOT EXISTS `ev_limpeza_geral_nutritrip`
ON SCHEDULE EVERY 1 DAY                     -- Executa todos os dias
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 3 HOUR) -- Começa às 03:00 (hora de pouco uso)
DO
BEGIN
    -- LIMPEZA 1: Refeições
    -- Ao apagar aqui, o ON DELETE CASCADE apaga automaticamente a 'RefeicaoAlimento'
    DELETE FROM `nutritrip`.`Refeicao` 
    WHERE `Data` < DATE_SUB(CURDATE(), INTERVAL 2 MONTH);

    -- LIMPEZA 2: Atividades Físicas
    DELETE FROM `nutritrip`.`UtilizadorAtividadeFisica` 
    WHERE `Data` < DATE_SUB(CURDATE(), INTERVAL 2 MONTH);

    -- LIMPEZA 3: Chats
    DELETE FROM `nutritrip`.`Chat` 
    WHERE `Data` < DATE_SUB(CURDATE(), INTERVAL 2 MONTH);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- Table `nutritrip`.`PerfilUtilizador`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`PerfilUtilizador` (
  `Id` INT AUTO_INCREMENT PRIMARY KEY,
  `Utilizador` INT NOT NULL,
  `Objetivo` VARCHAR(64) NULL,
  `Dieta` TEXT NULL,
  `Alergias` TEXT NULL,
  `Orcamento` DECIMAL(10,2) NULL,
  FOREIGN KEY (`Utilizador`) REFERENCES `nutritrip`.`Utilizador`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `nutritrip`.`PreferenciaAprendida`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`PreferenciaAprendida` (
  `Id` INT AUTO_INCREMENT PRIMARY KEY,
  `Utilizador` INT NOT NULL,
  `Tipo` VARCHAR(32) NOT NULL,
  `Tag` VARCHAR(64) NOT NULL,
  `Fonte` VARCHAR(32) NULL,
  FOREIGN KEY (`Utilizador`) REFERENCES `nutritrip`.`Utilizador`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `nutritrip`.`Tag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Tag` (
  `Id` INT AUTO_INCREMENT PRIMARY KEY,
  `Tipo` VARCHAR(64) NOT NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `nutritrip`.`UtilizadorTag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`UtilizadorTag` (
  `Utilizador` INT NOT NULL,
  `Tag` INT NOT NULL,
  PRIMARY KEY (`Utilizador`, `Tag`),
  FOREIGN KEY (`Utilizador`) REFERENCES `nutritrip`.`Utilizador`(`Id`) ON DELETE CASCADE,
  FOREIGN KEY (`Tag`) REFERENCES `nutritrip`.`Tag`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `nutritrip`.`ChatSession`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`ChatSession` (
  `Id` VARCHAR(36) PRIMARY KEY,
  `Utilizador` INT NOT NULL,
  `Titulo` VARCHAR(100) NULL,
  `CriadoEm` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `AtualizadoEm` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`Utilizador`) REFERENCES `nutritrip`.`Utilizador`(`Id`) ON DELETE CASCADE,
  INDEX `idx_chat_session_user` (`Utilizador`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `nutritrip`.`ChatMensagem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`ChatMensagem` (
  `Id` INT AUTO_INCREMENT PRIMARY KEY,
  `Sessao` VARCHAR(36) NOT NULL,
  `Role` ENUM('user', 'assistant', 'system') NOT NULL,
  `Conteudo` TEXT NOT NULL,
  `CriadoEm` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`Sessao`) REFERENCES `nutritrip`.`ChatSession`(`Id`) ON DELETE CASCADE,
  INDEX `idx_chat_msg_session` (`Sessao`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `nutritrip`.`RegistoRefeicao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`RegistoRefeicao` (
  `Id` INT AUTO_INCREMENT PRIMARY KEY,
  `Utilizador` INT NOT NULL,
  `TipoRefeicao` ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  `Nome` VARCHAR(255) NULL,
  `Notas` TEXT NULL,
  `Imagem` LONGTEXT NULL,
  `Calorias` INT DEFAULT 0,
  `Proteina` DECIMAL(6,1) DEFAULT 0,
  `Hidratos` DECIMAL(6,1) DEFAULT 0,
  `Gordura` DECIMAL(6,1) DEFAULT 0,
  `RegistadoEm` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`Utilizador`) REFERENCES `nutritrip`.`Utilizador`(`Id`) ON DELETE CASCADE,
  INDEX `idx_meal_user` (`Utilizador`),
  INDEX `idx_meal_date` (`RegistadoEm`)
) ENGINE=InnoDB;
DELIMITER $$

CREATE EVENT IF NOT EXISTS `ev_ajuste_inteligente_preferencias`
ON SCHEDULE EVERY 1 DAY -- Analisa os hábitos diariamente
STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 4 HOUR) -- Corre às 04:00
DO
BEGIN
    
    -- CENÁRIO 1: Adicionar preferências automáticas
    -- Se o utilizador comeu >= 10 vezes algo que NÃO está nas suas preferências
    INSERT IGNORE INTO `nutritrip`.`UtilizadorPreferenciasRefeicoes` (Utilizador, PreferenciasRefeicoes)
    SELECT Utilizador, Tag
    FROM `nutritrip`.`Refeicao`
    WHERE Tag IS NOT NULL 
      AND Data > DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    GROUP BY Utilizador, Tag
    HAVING COUNT(*) >= 10;

    -- CENÁRIO 2: Remover preferências por desuso
    -- Se o utilizador TEM a preferência, mas comeu < 3 vezes nos últimos 30 dias
    DELETE FROM up
    USING `nutritrip`.`UtilizadorPreferenciasRefeicoes` AS up
    LEFT JOIN (
        SELECT Utilizador, Tag, COUNT(*) as frequencia
        FROM `nutritrip`.`Refeicao`
        WHERE Data > DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
        GROUP BY Utilizador, Tag
    ) AS habitos ON up.Utilizador = habitos.Utilizador AND up.PreferenciasRefeicoes = habitos.Tag
    WHERE (habitos.frequencia IS NULL OR habitos.frequencia < 3);

END$$

DELIMITER ;