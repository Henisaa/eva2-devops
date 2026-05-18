CREATE DATABASE IF NOT EXISTS tienda_semestral;
USE tienda_semestral;
INSERT INTO venta (id_venta, direccion_compra, valor_compra, fecha_compra, despacho_generado)
VALUES
  (1, 'Av. Providencia 1234, Santiago', 35980, '2024-01-10', false),
  (2, 'Calle Las Condes 567, Santiago', 17990, '2024-01-11', false),
  (3, 'Pasaje El Roble 89, Ñuñoa', 25990, '2024-01-12', false)
ON DUPLICATE KEY UPDATE id_venta = id_venta;
