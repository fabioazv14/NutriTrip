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
  `Email` VARCHAR(255) NOT NULL UNIQUE,
  `Nome` VARCHAR(63) NOT NULL,
  `Dob` DATE NOT NULL,
  `Genero` ENUM('M', 'F', 'O') NOT NULL,
  `UltimoPeriodo` DATE NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Restricao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Restricao` (
  `Utilizador` INT NOT NULL,
  `Restricao` VARCHAR(60) NOT NULL,
  PRIMARY KEY (`Utilizador`, `Restricao`),
  CONSTRAINT `fk_Restricao_Utilizador`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Tag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Tag` (
  `Id` INT NOT NULL,
  `Tipo` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`Id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`UtilizadorTag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`UtilizadorTag` (
  `Utilizador` INT NOT NULL,
  `Tag` INT NOT NULL,
  PRIMARY KEY (`Utilizador`, `Tag`),
  INDEX `fk_UtilizadorTag_Tag1_idx` (`Tag` ASC) VISIBLE,
  CONSTRAINT `fk_UtilizadorTag_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_UtilizadorTag_Tag1`
    FOREIGN KEY (`Tag`)
    REFERENCES `nutritrip`.`Tag` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Refeicao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Refeicao` (
  `Id` INT NOT NULL,
  `Utilizador` INT NOT NULL,
  `Tipo` ENUM('Pequeno-Almoco', 'Snack', 'Almoco', 'Jantar') NOT NULL,
  `Designacao` VARCHAR(64) NOT NULL,
  `Tag` INT NULL,
  PRIMARY KEY (`Id`, `Utilizador`),
  INDEX `fk_Refeicao_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  INDEX `fk_Refeicao_Tag1_idx` (`Tag` ASC) VISIBLE,
  CONSTRAINT `fk_Refeicao_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Refeicao_Tag1`
    FOREIGN KEY (`Tag`)
    REFERENCES `nutritrip`.`Tag` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `nutritrip`.`Alimento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Alimento` (
  `Id` INT NOT NULL,
  `Designacao` VARCHAR(64) NOT NULL,
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


-- -----------------------------------------------------
-- Table `nutritrip`.`Objetivo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritrip`.`Objetivo` (
  `Id` INT NOT NULL,
  `Utilizador` INT NOT NULL,
  `Descricao` VARCHAR(128) NOT NULL,
  `Prazo` DATE NULL,
  PRIMARY KEY (`Id`, `Utilizador`),
  INDEX `fk_Objetivo_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  CONSTRAINT `fk_Objetivo_Utilizador1`
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
  `Utilizador` INT NOT NULL,
  `Atividade` VARCHAR(64) NOT NULL,
  `Duracao` INT NOT NULL,
  PRIMARY KEY (`Id`, `Utilizador`),
  INDEX `fk_AtividadeFisica_Utilizador1_idx` (`Utilizador` ASC) VISIBLE,
  CONSTRAINT `fk_AtividadeFisica_Utilizador1`
    FOREIGN KEY (`Utilizador`)
    REFERENCES `nutritrip`.`Utilizador` (`Id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;