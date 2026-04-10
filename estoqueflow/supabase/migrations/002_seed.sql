-- ============================================================
-- EstoqueFlow — Seed de Categorias por Setor
-- Migration: 002_seed.sql
-- ============================================================

INSERT INTO product_categories (name, sector, icon, sort_order) VALUES

-- ── Categorias Universais (todos os setores) ──────────────────
('Outros',              NULL,          '📦', 99),
('Serviços',            NULL,          '🔧', 98),
('Embalagens',          NULL,          '📫', 97),
('Limpeza e Higiene',   NULL,          '🧹', 96),
('Escritório',          NULL,          '📎', 95),
('EPI / Segurança',     NULL,          '🦺', 94),

-- ── Padaria / Confeitaria ─────────────────────────────────────
('Farinhas e Amidos',   'padaria',     '🌾', 1),
('Açúcares e Adoçantes','padaria',     '🍬', 2),
('Gorduras e Óleos',    'padaria',     '🧈', 3),
('Ovos e Laticínios',   'padaria',     '🥛', 4),
('Fermento e Leveduras','padaria',     '🫧', 5),
('Frutas e Recheios',   'padaria',     '🍓', 6),
('Coberturas e Geleias','padaria',     '🍯', 7),
('Chocolates',          'padaria',     '🍫', 8),
('Bebidas e Sucos',     'padaria',     '🥤', 9),
('Salgados e Frios',    'padaria',     '🥐', 10),
('Descartáveis',        'padaria',     '🥡', 11),

-- ── Farmácia / Drogaria ───────────────────────────────────────
('Medicamentos OTC',         'farmacia', '💊', 1),
('Medicamentos Controlados', 'farmacia', '🔒', 2),
('Suplementos',              'farmacia', '💪', 3),
('Cosméticos e Perfumaria',  'farmacia', '💄', 4),
('Higiene Pessoal',          'farmacia', '🪥', 5),
('Dermocosméticos',          'farmacia', '🧴', 6),
('Fraldas e Bebê',           'farmacia', '👶', 7),
('Ortopédicos',              'farmacia', '🩼', 8),
('Equipamentos Médicos',     'farmacia', '🩺', 9),
('Genéricos',                'farmacia', '💉', 10),

-- ── Pet Shop ──────────────────────────────────────────────────
('Ração Seca Cão',       'petshop', '🐕', 1),
('Ração Seca Gato',      'petshop', '🐈', 2),
('Ração Úmida',          'petshop', '🥫', 3),
('Petiscos e Snacks',    'petshop', '🦴', 4),
('Medicamentos Vet.',    'petshop', '💊', 5),
('Antiparasitários',     'petshop', '🪲', 6),
('Higiene Animal',       'petshop', '🛁', 7),
('Acessórios e Brinquedos', 'petshop', '🎾', 8),
('Camas e Casinhas',     'petshop', '🏠', 9),
('Coleiras e Guias',     'petshop', '🔗', 10),

-- ── Auto Peças ───────────────────────────────────────────────
('Filtros',              'autopecas', '🔵', 1),
('Freios e Pastilhas',   'autopecas', '🔴', 2),
('Suspensão',            'autopecas', '🔩', 3),
('Motor e Componentes',  'autopecas', '⚙️',  4),
('Elétrica e Bateria',   'autopecas', '⚡', 5),
('Pneus e Rodas',        'autopecas', '🔄', 6),
('Lubrificantes e Fluidos', 'autopecas', '🛢️', 7),
('Acessórios Externos',  'autopecas', '🚗', 8),
('Ferramentas',          'autopecas', '🔧', 9),
('Escapamento',          'autopecas', '💨', 10),

-- ── Varejo Geral / Distribuidora ─────────────────────────────
('Alimentos Secos',      'varejo', '🛒', 1),
('Bebidas',              'varejo', '🍺', 2),
('Limpeza',              'varejo', '🧽', 3),
('Higiene Pessoal',      'varejo', '🧼', 4),
('Bazar e Utilidades',   'varejo', '🏮', 5),
('Frios e Laticínios',   'varejo', '🧀', 6),
('Hortifruti',           'varejo', '🥦', 7),
('Mercearia',            'varejo', '🫙', 8);
