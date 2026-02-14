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
  `Dob` DATE NOT NULL,
  `Genero` ENUM('M', 'F', 'O') NOT NULL,
  `UltimoPeriodo` DATE NULL,
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
