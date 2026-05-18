# Imagen base MySQL 8 oficial
FROM mysql:8

# Variables de entorno para la BD del Proyecto Semestral
ENV MYSQL_ROOT_PASSWORD=admin123
ENV MYSQL_DATABASE=tienda_semestral
ENV MYSQL_USER=alumno
ENV MYSQL_PASSWORD=alumno123

# Copiar el script de inicialización
# Spring Boot creará las tablas automáticamente (ddl-auto=update)
COPY init.sql /docker-entrypoint-initdb.d/

# Exponer el puerto de MySQL
EXPOSE 3306
