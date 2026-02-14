-- ===========================================
-- NutriTrip - Dados de exemplo / Seed data
-- Executar após database_v1.sql
-- mysql -u root nutritrip < seed.sql
-- ===========================================

USE nutritrip;

-- Utilizadores de teste
INSERT INTO Utilizador (Id, Email, Nome, Dob, Genero, UltimoPeriodo) VALUES
(1, 'joao@teste.pt', 'João Silva', '1995-06-15', 'M', NULL),
(2, 'maria@teste.pt', 'Maria Santos', '1998-03-22', 'F', '2026-01-28'),
(3, 'alex@teste.pt', 'Alex Costa', '2000-11-10', 'O', NULL);

-- Tags
INSERT INTO Tag (Id, Tipo) VALUES
(1, 'Vegetariano'),
(2, 'Vegan'),
(3, 'Keto'),
(4, 'Low-carb'),
(5, 'Sem glúten'),
(6, 'Desportista'),
(7, 'Grávida');

-- Tags dos utilizadores
INSERT INTO UtilizadorTag (Utilizador, Tag) VALUES
(1, 6),   -- João: Desportista
(2, 1),   -- Maria: Vegetariana
(2, 5),   -- Maria: Sem glúten
(3, 2);   -- Alex: Vegan

-- Restrições alimentares
INSERT INTO Restricao (Utilizador, Restricao) VALUES
(1, 'Intolerância à lactose'),
(2, 'Alergia a frutos secos'),
(2, 'Sem glúten'),
(3, 'Alergia a soja');

-- Objetivos
INSERT INTO Objetivo (Id, Utilizador, Descricao, Prazo) VALUES
(1, 1, 'Ganhar massa muscular', '2026-06-01'),
(2, 1, 'Comer mais proteína', NULL),
(1, 2, 'Perder 5kg', '2026-04-15'),
(2, 2, 'Comer mais legumes variados', NULL),
(1, 3, 'Manter peso atual', NULL),
(2, 3, 'Descobrir receitas vegan novas', '2026-03-01');

-- Atividades físicas
INSERT INTO AtividadeFisica (Id, Utilizador, Atividade, Duracao) VALUES
(1, 1, 'Musculação', 90),
(2, 1, 'Corrida', 45),
(1, 2, 'Yoga', 60),
(2, 2, 'Caminhada', 30),
(1, 3, 'Ciclismo', 60);

-- Alimentos
INSERT INTO Alimento (Id, Designacao) VALUES
(1, 'Arroz integral'),
(2, 'Frango grelhado'),
(3, 'Brócolos'),
(4, 'Ovo cozido'),
(5, 'Aveia'),
(6, 'Banana'),
(7, 'Tofu'),
(8, 'Quinoa'),
(9, 'Espinafres'),
(10, 'Batata-doce'),
(11, 'Salmão'),
(12, 'Abacate'),
(13, 'Pão sem glúten'),
(14, 'Lentilhas'),
(15, 'Grão-de-bico');

-- Refeições do João
INSERT INTO Refeicao (Id, Utilizador, Tipo, Designacao, Tag) VALUES
(1, 1, 'Pequeno-Almoco', 'Aveia com banana', NULL),
(2, 1, 'Almoco', 'Frango com arroz e brócolos', 6),
(3, 1, 'Snack', 'Ovos cozidos', NULL),
(4, 1, 'Jantar', 'Salmão com batata-doce', 6);

-- Refeições da Maria
INSERT INTO Refeicao (Id, Utilizador, Tipo, Designacao, Tag) VALUES
(1, 2, 'Pequeno-Almoco', 'Pão sem glúten com abacate', 5),
(2, 2, 'Almoco', 'Quinoa com lentilhas e espinafres', 1),
(3, 2, 'Jantar', 'Sopa de legumes', 1);

-- Refeições do Alex
INSERT INTO Refeicao (Id, Utilizador, Tipo, Designacao, Tag) VALUES
(1, 3, 'Pequeno-Almoco', 'Aveia com banana', 2),
(2, 3, 'Almoco', 'Tofu com quinoa e espinafres', 2),
(3, 3, 'Snack', 'Grão-de-bico tostado', 2);

-- Alimentos de cada refeição (João)
INSERT INTO RefeicaoAlimento (Refeicao, Utilizador, Alimento) VALUES
(1, 1, 5), (1, 1, 6),             -- Aveia, Banana
(2, 1, 2), (2, 1, 1), (2, 1, 3),  -- Frango, Arroz, Brócolos
(3, 1, 4),                         -- Ovo
(4, 1, 11), (4, 1, 10);            -- Salmão, Batata-doce

-- Alimentos de cada refeição (Maria)
INSERT INTO RefeicaoAlimento (Refeicao, Utilizador, Alimento) VALUES
(1, 2, 13), (1, 2, 12),            -- Pão s/ glúten, Abacate
(2, 2, 8), (2, 2, 14), (2, 2, 9), -- Quinoa, Lentilhas, Espinafres
(3, 2, 3);                         -- Brócolos (sopa)

-- Alimentos de cada refeição (Alex)
INSERT INTO RefeicaoAlimento (Refeicao, Utilizador, Alimento) VALUES
(1, 3, 5), (1, 3, 6),             -- Aveia, Banana
(2, 3, 7), (2, 3, 8), (2, 3, 9), -- Tofu, Quinoa, Espinafres
(3, 3, 15);                        -- Grão-de-bico
