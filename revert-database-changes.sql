-- Script para revertir los cambios de facturación en la base de datos
-- Ejecutar este script en Supabase SQL Editor

-- 1. Eliminar tabla invoice_alerts si existe
DROP TABLE IF EXISTS invoice_alerts CASCADE;

-- 2. Eliminar columnas de facturación de transactions
ALTER TABLE transactions DROP COLUMN IF EXISTS requires_invoice;
ALTER TABLE transactions DROP COLUMN IF EXISTS invoice_due_date;
ALTER TABLE transactions DROP COLUMN IF EXISTS invoice_status;
ALTER TABLE transactions DROP COLUMN IF EXISTS invoice_completed_date;

-- 3. Eliminar columnas de facturación de recurring_payments
ALTER TABLE recurring_payments DROP COLUMN IF EXISTS requires_invoice;
ALTER TABLE recurring_payments DROP COLUMN IF EXISTS invoice_due_days_before;
ALTER TABLE recurring_payments DROP COLUMN IF EXISTS invoice_status;

-- 4. Verificar que las tablas quedaron como antes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recurring_payments' 
ORDER BY column_name;

-- 5. Mensaje de confirmación
SELECT 'Base de datos revertida exitosamente' as resultado;
