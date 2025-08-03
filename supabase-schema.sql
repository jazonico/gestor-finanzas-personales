-- Crear tabla de perfiles de usuarios
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Crear tabla de transacciones
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_day INTEGER CHECK (recurring_day >= 1 AND recurring_day <= 31),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pagos recurrentes
CREATE TABLE recurring_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
    is_active BOOLEAN DEFAULT TRUE,
    type TEXT CHECK (type IN ('expense', 'income')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de gastos compartidos del hogar
CREATE TABLE shared_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0), -- en CLP (pesos chilenos)
    date DATE NOT NULL,
    paid_by TEXT CHECK (paid_by IN ('Felipe', 'Camila')) NOT NULL,
    is_shared BOOLEAN DEFAULT TRUE,
    shared_percentage INTEGER DEFAULT 50 CHECK (shared_percentage >= 0 AND shared_percentage <= 100),
    has_installments BOOLEAN DEFAULT FALSE,
    installments_total INTEGER CHECK (installments_total IS NULL OR installments_total > 0),
    installment_number INTEGER CHECK (installment_number IS NULL OR installment_number > 0),
    parent_expense_id UUID REFERENCES shared_expenses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas de seguridad para transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para recurring_payments
CREATE POLICY "Users can view own recurring payments" ON recurring_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring payments" ON recurring_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring payments" ON recurring_payments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring payments" ON recurring_payments
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para shared_expenses
CREATE POLICY "Users can view own shared expenses" ON shared_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shared expenses" ON shared_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared expenses" ON shared_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared expenses" ON shared_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_payments_updated_at 
    BEFORE UPDATE ON recurring_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en shared_expenses
CREATE TRIGGER update_shared_expenses_updated_at 
    BEFORE UPDATE ON shared_expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar el rendimiento
CREATE INDEX idx_transactions_user_id_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_id_type ON transactions(user_id, type);
CREATE INDEX idx_recurring_payments_user_id ON recurring_payments(user_id);
CREATE INDEX idx_recurring_payments_user_id_active ON recurring_payments(user_id, is_active); 
CREATE INDEX idx_shared_expenses_user_id_date ON shared_expenses(user_id, date DESC);
CREATE INDEX idx_shared_expenses_user_id_month ON shared_expenses(user_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date));
CREATE INDEX idx_shared_expenses_parent_id ON shared_expenses(parent_expense_id) WHERE parent_expense_id IS NOT NULL; 