-- ============================================================
-- Base de datos del Proyecto Semestral ISY1101
-- Ventas y Despachos
-- ============================================================
CREATE DATABASE IF NOT EXISTS tienda_semestral;
USE tienda_semestral;

-- Spring Boot (ddl-auto=update) creará las tablas venta y despacho
-- automáticamente al iniciar. Este script solo provee datos de ejemplo.

-- Nota: Las tablas son creadas por Hibernate al arrancar la app Spring Boot.
-- Los INSERT de ejemplo se ejecutarán una vez que las tablas existan.
-- Si las tablas no existen aún, este bloque es referencial.

-- Datos de ejemplo para ventas (tabla generada por Hibernate como 'venta')
INSERT INTO venta (id_venta, direccion_compra, valor_compra, fecha_compra, despacho_generado)
VALUES
  (1, 'Av. Providencia 1234, Santiago', 35980, '2024-01-10', false),
  (2, 'Calle Las Condes 567, Santiago', 17990, '2024-01-11', false),
  (3, 'Pasaje El Roble 89, Ñuñoa', 25990, '2024-01-12', false)
ON DUPLICATE KEY UPDATE id_venta = id_venta;
