-- ============================================================
-- EstoqueFlow — Micro-SaaS de Gestão de Estoque para PMEs
-- Migration: 001_schema.sql
-- Descrição: Schema completo com multi-tenancy via RLS
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca fuzzy em nomes de produtos

-- ============================================================
-- TABELA: companies (multi-tenant root)
-- Cada empresa é um tenant isolado. Todos os dados são
-- filtrados por company_id via Row Level Security.
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  cnpj                 TEXT UNIQUE,
  sector               TEXT,                           -- padaria | farmacia | petshop | autopecas | outro
  plan                 TEXT NOT NULL DEFAULT 'trial',  -- trial | starter | professional | business
  subscription_status  TEXT NOT NULL DEFAULT 'trial',  -- trial | active | cancelled | past_due
  trial_ends_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  mp_subscription_id   TEXT,                           -- ID da assinatura no Mercado Pago
  mp_payer_id          TEXT,                           -- ID do pagador no Mercado Pago
  owner_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para lookups por owner (login → company)
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);

-- ============================================================
-- TABELA: company_users (membros adicionais por empresa)
-- Permite que o dono adicione funcionários com roles limitadas.
-- Disponível apenas nos planos Professional e Business.
-- ============================================================
CREATE TABLE IF NOT EXISTS company_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'operator',  -- owner | manager | operator
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users(company_id);

-- ============================================================
-- TABELA: categories (por setor de atuação)
-- Preenchida via seed (002_seed.sql). Compartilhada entre
-- todos os tenants — sem company_id (dados globais somente leitura).
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  sector      TEXT,        -- NULL = universal | padaria | farmacia | petshop | autopecas
  icon        TEXT,        -- emoji ou nome de ícone para o frontend
  sort_order  INTEGER DEFAULT 0
);

-- ============================================================
-- TABELA: suppliers (fornecedores por empresa)
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  whatsapp        TEXT,
  email           TEXT,
  contact_name    TEXT,
  lead_time_days  INTEGER DEFAULT 3,   -- prazo médio de reposição em dias
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);

-- ============================================================
-- TABELA: products (catálogo de produtos por empresa)
-- current_stock é calculado via trigger a partir de
-- stock_movements — nunca atualizado manualmente.
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id      UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  category_id      UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  sku              TEXT,               -- código interno da empresa
  barcode          TEXT,               -- EAN-13 ou similar
  unit             TEXT NOT NULL DEFAULT 'un',  -- un | kg | lt | cx | pct | m | par
  current_stock    DECIMAL(12,3) NOT NULL DEFAULT 0,
  min_stock        DECIMAL(12,3) NOT NULL DEFAULT 0,   -- limiar para alerta de estoque baixo
  max_stock        DECIMAL(12,3),                       -- limiar para alerta de excesso
  cost_price       DECIMAL(12,2),     -- preço de custo (última compra)
  sale_price       DECIMAL(12,2),     -- preço de venda sugerido
  photo_url        TEXT,              -- Supabase Storage URL
  location         TEXT,              -- ex: "Prateleira A3", "Freezer 2"
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(company_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(company_id, barcode);
-- Índice parcial para alertas: somente produtos ativos com estoque abaixo do mínimo
CREATE INDEX IF NOT EXISTS idx_products_low_stock
  ON products(company_id)
  WHERE is_active = TRUE AND current_stock <= min_stock AND min_stock > 0;

-- ============================================================
-- TABELA: stock_movements (ledger imutável de movimentações)
-- Cada linha é uma entrada/saída. O estoque atual é calculado
-- via trigger. NUNCA delete ou edite registros desta tabela.
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,           -- entrada | saida | ajuste | inventario | transferencia
  -- quantidade: positiva = entrada, negativa = saída
  quantity      DECIMAL(12,3) NOT NULL,
  unit_cost     DECIMAL(12,2),           -- custo unitário nesta movimentação
  total_cost    DECIMAL(12,2) GENERATED ALWAYS AS (
                  ABS(quantity) * COALESCE(unit_cost, 0)
                ) STORED,
  reference     TEXT,                    -- nº de NF, pedido, etc.
  notes         TEXT,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movements_company_id ON stock_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON stock_movements(company_id, created_at DESC);

-- ============================================================
-- TRIGGER: atualizar current_stock após cada movimentação
-- ============================================================
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    current_stock = current_stock + NEW.quantity,
    updated_at    = NOW()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_product_stock
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- ============================================================
-- TRIGGER: gerar alertas de estoque após atualização do produto
-- Chamado sempre que current_stock muda (via trigger acima).
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_create_stock_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_alert_type TEXT;
BEGIN
  -- Determinar tipo de alerta
  IF NEW.current_stock <= 0 AND NEW.min_stock > 0 THEN
    v_alert_type := 'out_of_stock';
  ELSIF NEW.current_stock <= NEW.min_stock AND NEW.min_stock > 0 THEN
    v_alert_type := 'low_stock';
  ELSIF NEW.max_stock IS NOT NULL AND NEW.current_stock >= NEW.max_stock THEN
    v_alert_type := 'overstock';
  ELSE
    -- Estoque normalizado: marcar alertas existentes como resolvidos
    UPDATE stock_alerts
    SET is_resolved = TRUE, resolved_at = NOW()
    WHERE product_id = NEW.id AND is_resolved = FALSE;
    RETURN NEW;
  END IF;

  -- Inserir alerta apenas se não existir alerta ativo do mesmo tipo
  INSERT INTO stock_alerts (company_id, product_id, alert_type)
  SELECT NEW.company_id, NEW.id, v_alert_type
  WHERE NOT EXISTS (
    SELECT 1 FROM stock_alerts
    WHERE product_id = NEW.id
      AND alert_type = v_alert_type
      AND is_resolved = FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_stock_alert
  AFTER UPDATE OF current_stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_stock_alert();

-- ============================================================
-- TABELA: stock_alerts (alertas gerados automaticamente)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alert_type   TEXT NOT NULL,   -- low_stock | out_of_stock | overstock
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved  BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at  TIMESTAMPTZ,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_company_id ON stock_alerts(company_id, is_resolved, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON stock_alerts(product_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Função auxiliar: retorna o company_id do usuário autenticado.
-- Usada em todas as policies para isolar dados entre tenants.
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT id FROM companies WHERE owner_id = auth.uid()
  UNION
  SELECT company_id FROM company_users WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário acessa apenas sua empresa" ON companies
  FOR ALL USING (
    owner_id = auth.uid()
    OR id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid())
  );

-- company_users
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da empresa veem outros membros" ON company_users
  FOR ALL USING (company_id = get_user_company_id());

-- product_categories (somente leitura para todos os autenticados)
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias são públicas para usuários autenticados" ON product_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresa acessa apenas seus fornecedores" ON suppliers
  FOR ALL USING (company_id = get_user_company_id());

-- products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresa acessa apenas seus produtos" ON products
  FOR ALL USING (company_id = get_user_company_id());

-- stock_movements (insert only por operators; managers/owners podem ler tudo)
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresa acessa apenas suas movimentações" ON stock_movements
  FOR ALL USING (company_id = get_user_company_id());

-- stock_alerts
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresa acessa apenas seus alertas" ON stock_alerts
  FOR ALL USING (company_id = get_user_company_id());

-- ============================================================
-- HABILITAR REALTIME para alertas e movimentações em tempo real
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE stock_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- VIEW: stock_overview (dashboard principal)
-- Retorna métricas agregadas por empresa.
-- ============================================================
CREATE OR REPLACE VIEW stock_overview AS
SELECT
  p.company_id,
  COUNT(*)                                                  AS total_products,
  COUNT(*) FILTER (WHERE p.current_stock <= 0 AND p.min_stock > 0)
                                                            AS out_of_stock_count,
  COUNT(*) FILTER (WHERE p.current_stock > 0 AND p.current_stock <= p.min_stock AND p.min_stock > 0)
                                                            AS low_stock_count,
  SUM(p.current_stock * COALESCE(p.cost_price, 0))         AS total_stock_value,
  COUNT(*) FILTER (WHERE p.is_active = TRUE)               AS active_products
FROM products p
WHERE p.is_active = TRUE
GROUP BY p.company_id;
