-- Script para verificar y corregir la estructura de la base de datos
-- Ejecutar este script en Supabase SQL Editor

-- 1. Verificar qué columnas existen en transactions
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name LIKE '%invoice%'
ORDER BY column_name;

-- 2. Verificar qué columnas existen en recurring_payments  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'recurring_payments' 
AND column_name LIKE '%invoice%'
ORDER BY column_name;

-- 3. Verificar si la tabla invoice_alerts existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'invoice_alerts'
);

-- 4. Agregar restricciones CHECK que faltan (si es necesario)
-- Esto podría fallar si ya existen, pero es seguro intentarlo

-- Para transactions.invoice_status
DO $$
BEGIN
    BEGIN
        ALTER TABLE transactions ADD CONSTRAINT transactions_invoice_status_check 
        CHECK (invoice_status IN ('pending', 'completed', 'overdue'));
    EXCEPTION
        WHEN duplicate_object THEN
            -- La restricción ya existe, no hacer nada
            NULL;
    END;
END $$;

-- Para recurring_payments.invoice_status  
DO $$
BEGIN
    BEGIN
        ALTER TABLE recurring_payments ADD CONSTRAINT recurring_payments_invoice_status_check 
        CHECK (invoice_status IN ('pending', 'completed', 'overdue'));
    EXCEPTION
        WHEN duplicate_object THEN
            -- La restricción ya existe, no hacer nada
            NULL;
    END;
END $$;

-- 5. Verificar datos existentes que podrían causar conflictos
SELECT id, invoice_status, requires_invoice 
FROM transactions 
WHERE requires_invoice = true 
LIMIT 5;

SELECT id, invoice_status, requires_invoice 
FROM recurring_payments 
WHERE requires_invoice = true 
LIMIT 5;

-- 6. Mensaje final
SELECT 'Verificación y corrección completada' as resultado;
