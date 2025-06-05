-- Script SQL para poblar la aplicación con datos de prueba completos
-- Estudio Contable - Sistema de Gestión

-- Limpiar datos existentes (opcional - usar con cuidado)
-- TRUNCATE TABLE invoices CASCADE;
-- TRUNCATE TABLE contracted_services CASCADE;
-- TRUNCATE TABLE notifications CASCADE;
-- TRUNCATE TABLE alert_settings CASCADE;
-- TRUNCATE TABLE company_settings CASCADE;
-- TRUNCATE TABLE services CASCADE;
-- TRUNCATE TABLE clients CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- 1. USUARIOS DEL SISTEMA
INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES
('Administrador Principal', 'admin@estudiocontable.com', '$2b$10$example_hash_admin', 'admin', 'activo', NOW(), NOW()),
('María González', 'maria@estudiocontable.com', '$2b$10$example_hash_maria', 'contador', 'activo', NOW(), NOW()),
('Carlos Rodríguez', 'carlos@estudiocontable.com', '$2b$10$example_hash_carlos', 'asistente', 'activo', NOW(), NOW()),
('Ana Martínez', 'ana@estudiocontable.com', '$2b$10$example_hash_ana', 'contador', 'activo', NOW(), NOW());

-- 2. SERVICIOS OFRECIDOS POR EL ESTUDIO
INSERT INTO services (name, description, price, status, created_at, updated_at) VALUES
('Contabilidad Básica', 'Servicios de contabilidad básica para pequeñas empresas', 350.00, 'activo', NOW(), NOW()),
('Contabilidad Completa', 'Servicios de contabilidad completa con análisis financiero', 750.00, 'activo', NOW(), NOW()),
('Facturación Electrónica', 'Gestión y emisión de comprobantes electrónicos', 200.00, 'activo', NOW(), NOW()),
('Declaración Mensual', 'Preparación y presentación de declaraciones mensuales', 180.00, 'activo', NOW(), NOW()),
('Declaración Anual', 'Preparación de declaración jurada anual de renta', 500.00, 'activo', NOW(), NOW()),
('Planilla Electrónica', 'Gestión de planillas y remuneraciones', 250.00, 'activo', NOW(), NOW()),
('Libros Contables', 'Legalización y mantenimiento de libros contables', 400.00, 'activo', NOW(), NOW()),
('Asesoría Tributaria', 'Consultoría en temas tributarios y fiscales', 150.00, 'activo', NOW(), NOW()),
('Constitución de Empresa', 'Trámites para constitución de empresas', 800.00, 'activo', NOW(), NOW()),
('Auditoría Interna', 'Servicios de auditoría y revisión contable', 1200.00, 'activo', NOW(), NOW());

-- 3. CLIENTES (Ampliando la lista existente)
INSERT INTO clients (name, ruc, phone, email, address, status, join_date, created_at, updated_at) VALUES
-- Clientes pequeñas empresas
('Empresa Comercial XYZ', '20987654321', '987654321', 'contacto@xyz.com', 'Jr. Comercio 456, Lima', 'activo', '2022-01-15', NOW(), NOW()),
('Consultora ABC', '20123987654', '912345678', 'info@consultoraabc.com', 'Av. Los Consultores 789, Lima', 'activo', '2021-06-20', NOW(), NOW()),
('Importaciones DEF', '20567891234', '945678123', 'ventas@importacionesdef.com', 'Av. Importadores 321, Callao', 'activo', '2023-03-10', NOW(), NOW()),

-- Clientes medianas empresas
('Soluciones Tech Perú S.A.C.', '20601234567', '987654321', 'contacto@solucionestech.pe', 'Av. Javier Prado Este 1020, San Isidro', 'activo', '2022-03-15', NOW(), NOW()),
('Agroindustrias El Sol E.I.R.L.', '20502345678', '976543210', 'ventas@agroelsol.com.pe', 'Carretera Panamericana Sur Km 250, Ica', 'activo', '2021-11-01', NOW(), NOW()),
('Transportes Rápidos del Norte S.R.L.', '20403456789', '965432109', 'logistica@rapidonorte.pe', 'Calle Los Pinos 300, Trujillo', 'activo', '2023-01-20', NOW(), NOW()),
('Constructora Andina S.A.', '20304567890', '954321098', 'proyectos@andina-construct.com', 'Jr. Cusco 750, Cusco', 'activo', '2020-07-10', NOW(), NOW()),

-- Clientes servicios profesionales
('Servicios Gráficos Creativos S.A.C.', '20205678901', '943210987', 'arte@graficacreativa.pe', 'Av. Arequipa 2580, Lince', 'activo', '2022-08-05', NOW(), NOW()),
('Academia de Idiomas FastLearn S.R.L.', '20300123456', '977665544', 'inscripciones@fastlearn.edu.pe', 'Av. Angamos Oeste 880, Miraflores', 'activo', '2022-09-12', NOW(), NOW()),
('Clínica Veterinaria Mascota Feliz S.R.L.', '20504567893', '933221100', 'citas@mascotafeliz.vet', 'Calle Schell 345, Miraflores', 'activo', '2022-11-10', NOW(), NOW()),

-- Clientes comercio y restaurantes
('Restaurante Sabor Peruano E.I.R.L.', '20607890123', '921098765', 'reservas@saborperuano.restaurant', 'Av. Larco 650, Miraflores', 'activo', '2023-05-01', NOW(), NOW()),
('Panadería Dulce Aroma E.I.R.L.', '20102345671', '955443322', 'pedidos@dulcearoma.bakery', 'Jr. De la Unión 550, Cercado de Lima', 'activo', '2021-06-22', NOW(), NOW()),
('Ferretería El Constructor S.A.', '20603456782', '944332211', 'ventas@ferreteriaelconstructor.com', 'Av. Argentina 3030, Callao', 'activo', '2019-12-05', NOW(), NOW()),

-- Clientes inactivos para testing
('Comercializadora del Pacífico S.R.L.', '20106789012', '932109876', 'comercial@pacifico-trade.com', 'Calle Mercurio 123, Callao', 'inactivo', '2019-05-25', NOW(), NOW()),
('Agencia de Viajes Aventura Andina S.A.', '20207890126', '900998877', 'tours@aventuraandina.travel', 'Portal de Panes 123, Plaza de Armas, Cusco', 'inactivo', '2020-01-15', NOW(), NOW());

-- 4. SERVICIOS CONTRATADOS POR CLIENTES
INSERT INTO contracted_services (client_id, service_id, start_date, next_payment, price, status, invoice_days, created_at, updated_at) VALUES
-- Cliente 1: Empresa Comercial XYZ
(1, 1, '2024-01-01', '2025-01-25', 350.00, 'activo', 0, NOW(), NOW()),
(1, 3, '2024-01-01', '2025-01-28', 200.00, 'activo', 0, NOW(), NOW()),

-- Cliente 2: Consultora ABC
(2, 2, '2024-01-01', '2025-01-30', 750.00, 'activo', 0, NOW(), NOW()),
(2, 4, '2024-01-01', '2025-02-05', 180.00, 'activo', 0, NOW(), NOW()),

-- Cliente 3: Importaciones DEF
(3, 2, '2024-01-01', '2025-01-22', 750.00, 'activo', 0, NOW(), NOW()),
(3, 3, '2024-01-01', '2025-01-24', 200.00, 'activo', 0, NOW(), NOW()),
(3, 6, '2024-01-01', '2025-01-26', 250.00, 'activo', 0, NOW(), NOW()),

-- Cliente 4: Soluciones Tech Perú (Cliente ID 4 - el que tenía problema)
(4, 2, '2024-01-01', '2025-01-27', 750.00, 'activo', 0, NOW(), NOW()),
(4, 6, '2024-01-01', '2025-01-29', 250.00, 'activo', 0, NOW(), NOW()),
(4, 8, '2024-02-01', '2025-01-31', 150.00, 'activo', 0, NOW(), NOW()),

-- Cliente 5: Agroindustrias El Sol
(5, 2, '2024-01-01', '2025-02-01', 750.00, 'activo', 0, NOW(), NOW()),
(5, 7, '2024-01-01', '2025-02-03', 400.00, 'activo', 0, NOW(), NOW()),

-- Cliente 6: Transportes Rápidos del Norte
(6, 1, '2024-01-01', '2025-02-07', 350.00, 'activo', 0, NOW(), NOW()),
(6, 4, '2024-01-01', '2025-02-10', 180.00, 'activo', 0, NOW(), NOW()),

-- Cliente 7: Constructora Andina
(7, 2, '2024-01-01', '2025-02-15', 750.00, 'activo', 0, NOW(), NOW()),
(7, 6, '2024-01-01', '2025-02-18', 250.00, 'activo', 0, NOW(), NOW()),
(7, 10, '2024-06-01', '2025-02-20', 1200.00, 'activo', 0, NOW(), NOW()),

-- Servicios adicionales para otros clientes
(8, 1, '2024-01-01', '2025-03-01', 350.00, 'activo', 0, NOW(), NOW()),
(9, 1, '2024-01-01', '2025-03-05', 350.00, 'activo', 0, NOW(), NOW()),
(10, 1, '2024-01-01', '2025-03-10', 350.00, 'activo', 0, NOW(), NOW()),
(11, 2, '2024-01-01', '2025-03-15', 750.00, 'activo', 0, NOW(), NOW()),
(12, 1, '2024-01-01', '2025-03-20', 350.00, 'activo', 0, NOW(), NOW()),
(13, 2, '2024-01-01', '2025-03-25', 750.00, 'activo', 0, NOW(), NOW());

-- 5. FACTURAS/PROFORMAS CON DIFERENTES ESTADOS
INSERT INTO invoices (number, client_id, service_id, issue_date, due_date, amount, status, document_type, paid_amount, payments, created_at, updated_at) VALUES
-- Facturas del mes actual (Enero 2025)
('F001-00001', 1, 1, '2025-01-05', '2025-01-20', 350.00, 'pendiente', 'factura', 0.00, '[]', NOW(), NOW()),
('F001-00002', 2, 2, '2025-01-05', '2025-01-20', 750.00, 'pendiente', 'factura', 0.00, '[]', NOW(), NOW()),
('F001-00003', 3, 2, '2025-01-05', '2025-01-20', 750.00, 'pagada', 'factura', 750.00, '[{"date": "2025-01-10", "amount": 750.00, "method": "transferencia", "voucher": null, "notes": "Pago completo enero"}]', NOW(), NOW()),

-- Facturas con pagos parciales
('F001-00004', 4, 2, '2025-01-05', '2025-01-20', 750.00, 'pendiente', 'factura', 300.00, '[{"date": "2025-01-08", "amount": 300.00, "method": "efectivo", "voucher": null, "notes": "Pago parcial"}]', NOW(), NOW()),
('F001-00005', 5, 2, '2025-01-05', '2025-01-20', 750.00, 'pendiente', 'factura', 400.00, '[{"date": "2025-01-07", "amount": 200.00, "method": "transferencia", "voucher": null, "notes": "Primer pago"}, {"date": "2025-01-12", "amount": 200.00, "method": "efectivo", "voucher": null, "notes": "Segundo pago"}]', NOW(), NOW()),

-- Facturas vencidas (Diciembre 2024)
('F001-00006', 6, 1, '2024-12-05', '2024-12-20', 350.00, 'vencida', 'factura', 0.00, '[]', '2024-12-05 10:00:00', '2024-12-05 10:00:00'),
('F001-00007', 7, 2, '2024-12-05', '2024-12-20', 750.00, 'vencida', 'factura', 0.00, '[]', '2024-12-05 10:00:00', '2024-12-05 10:00:00'),

-- Facturas de servicios adicionales
('F001-00008', 1, 3, '2025-01-05', '2025-01-20', 200.00, 'pendiente', 'factura', 0.00, '[]', NOW(), NOW()),
('F001-00009', 3, 3, '2025-01-05', '2025-01-20', 200.00, 'pagada', 'factura', 200.00, '[{"date": "2025-01-11", "amount": 200.00, "method": "transferencia", "voucher": null, "notes": "Facturación electrónica enero"}]', NOW(), NOW()),
('F001-00010', 3, 6, '2025-01-05', '2025-01-20', 250.00, 'pendiente', 'factura', 0.00, '[]', NOW(), NOW()),

-- RHE (Recibos por Honorarios Electrónicos)
('RHE001-00001', 8, 1, '2025-01-05', '2025-01-20', 350.00, 'pendiente', 'rhe', 0.00, '[]', NOW(), NOW()),
('RHE001-00002', 9, 1, '2025-01-05', '2025-01-20', 350.00, 'pagada', 'rhe', 350.00, '[{"date": "2025-01-09", "amount": 350.00, "method": "transferencia", "voucher": null, "notes": "Academia idiomas - enero"}]', NOW(), NOW()),

-- Facturas próximas a vencer (vencen en pocos días)
('F001-00011', 11, 2, '2025-01-15', '2025-01-25', 750.00, 'pendiente', 'factura', 0.00, '[]', NOW(), NOW()),
('F001-00012', 12, 1, '2025-01-15', '2025-01-24', 350.00, 'pendiente', 'factura', 0.00, '[]', NOW(), NOW()),

-- Facturas de servicios especiales
('F001-00013', 7, 10, '2025-01-10', '2025-02-10', 1200.00, 'pendiente', 'factura', 0.00, '[]', NOW(), NOW()),
('F001-00014', 4, 8, '2025-01-05', '2025-01-20', 150.00, 'pagada', 'factura', 150.00, '[{"date": "2025-01-13", "amount": 150.00, "method": "efectivo", "voucher": null, "notes": "Asesoría tributaria"}]', NOW(), NOW()),

-- Facturas del año anterior para reportes
('F001-00015', 1, 1, '2024-11-05', '2024-11-20', 350.00, 'pagada', 'factura', 350.00, '[{"date": "2024-11-18", "amount": 350.00, "method": "transferencia", "voucher": null, "notes": "Noviembre 2024"}]', '2024-11-05 10:00:00', '2024-11-05 10:00:00'),
('F001-00016', 2, 2, '2024-11-05', '2024-11-20', 750.00, 'pagada', 'factura', 750.00, '[{"date": "2024-11-19", "amount": 750.00, "method": "transferencia", "voucher": null, "notes": "Noviembre 2024"}]', '2024-11-05 10:00:00', '2024-11-05 10:00:00');

-- 6. CONFIGURACIONES DE LA EMPRESA
INSERT INTO company_settings (company_name, ruc, address, phone, email, logo_url, tax_regime, accounting_period, fiscal_year_start, created_at, updated_at) VALUES
('Estudio Contable Profesional S.A.C.', '20123456789', 'Av. República de Panamá 3420, San Isidro, Lima', '01-4567890', 'contacto@estudiocontable.com', '/assets/logo.png', 'Régimen General', 'mensual', '2024-01-01', NOW(), NOW());

-- 7. CONFIGURACIONES DE ALERTAS
INSERT INTO alert_settings (alert_type, days_before, is_active, email_enabled, system_enabled, created_at, updated_at) VALUES
('vencimiento_factura', 7, true, true, true, NOW(), NOW()),
('vencimiento_factura', 3, true, true, true, NOW(), NOW()),
('vencimiento_factura', 1, true, true, true, NOW(), NOW()),
('vencimiento_servicio', 15, true, true, false, NOW(), NOW()),
('pago_vencido', 1, true, true, true, NOW(), NOW()),
('pago_vencido', 7, true, true, true, NOW(), NOW()),
('renovacion_servicio', 30, true, true, false, NOW(), NOW());

-- 8. NOTIFICACIONES DEL SISTEMA
INSERT INTO notifications (title, message, type, status, user_id, entity_type, entity_id, created_at, updated_at) VALUES
-- Notificaciones de facturas vencidas
('Factura Vencida', 'La factura F001-00006 de Transportes Rápidos del Norte ha vencido', 'warning', 'no_leida', 1, 'invoice', 6, NOW(), NOW()),
('Factura Vencida', 'La factura F001-00007 de Constructora Andina ha vencido', 'warning', 'no_leida', 1, 'invoice', 7, NOW(), NOW()),

-- Notificaciones de facturas próximas a vencer
('Factura por Vencer', 'La factura F001-00011 vence en 3 días', 'info', 'no_leida', 1, 'invoice', 11, NOW(), NOW()),
('Factura por Vencer', 'La factura F001-00012 vence en 2 días', 'info', 'no_leida', 1, 'invoice', 12, NOW(), NOW()),

-- Notificaciones de pagos recibidos
('Pago Recibido', 'Se registró un pago de S/. 750.00 para la factura F001-00003', 'success', 'no_leida', 1, 'invoice', 3, NOW(), NOW()),
('Pago Recibido', 'Se registró un pago de S/. 350.00 para la factura RHE001-00002', 'success', 'no_leida', 1, 'invoice', 9, NOW(), NOW()),

-- Notificaciones de nuevos clientes
('Nuevo Cliente', 'Se registró el cliente: Soluciones Tech Perú S.A.C.', 'info', 'leida', 1, 'client', 4, '2025-01-15 10:30:00', '2025-01-15 10:30:00'),
('Nuevo Cliente', 'Se registró el cliente: Agroindustrias El Sol E.I.R.L.', 'info', 'leida', 1, 'client', 5, '2025-01-10 14:20:00', '2025-01-10 14:20:00'),

-- Notificaciones del sistema
('Sistema Actualizado', 'El sistema ha sido actualizado correctamente', 'info', 'leida', 1, 'system', NULL, '2025-01-01 09:00:00', '2025-01-01 09:00:00'),
('Backup Completado', 'El backup automático se ha completado exitosamente', 'success', 'leida', 1, 'system', NULL, '2025-01-20 02:00:00', '2025-01-20 02:00:00');

-- CONSULTAS ÚTILES PARA VERIFICAR LOS DATOS

-- Verificar clientes y sus servicios contratados
-- SELECT c.name as cliente, s.name as servicio, cs.monthly_fee, cs.status
-- FROM clients c
-- JOIN contracted_services cs ON c.id = cs.client_id
-- JOIN services s ON cs.service_id = s.id
-- ORDER BY c.name;

-- Verificar facturas con estados y pagos
-- SELECT i.number, c.name as cliente, i.amount, i.paid_amount, 
--        (i.amount - i.paid_amount) as pendiente, i.status, i.due_date
-- FROM invoices i
-- JOIN clients c ON i.client_id = c.id
-- ORDER BY i.due_date DESC;

-- Verificar notificaciones activas
-- SELECT title, message, type, status, created_at
-- FROM notifications
-- WHERE status = 'no_leida'
-- ORDER BY created_at DESC;

-- Resumen de ingresos por cliente
-- SELECT c.name, SUM(i.paid_amount) as total_pagado, COUNT(i.id) as facturas_emitidas
-- FROM clients c
-- LEFT JOIN invoices i ON c.id = i.client_id
-- GROUP BY c.id, c.name
-- ORDER BY total_pagado DESC;

COMMIT;