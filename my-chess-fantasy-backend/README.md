# Proyecto de Gestión de Jugadores de Ajedrez y Usuarios

Este proyecto es una aplicación de backend que gestiona datos de usuarios y jugadores de ajedrez, incluyendo la programación de tareas automáticas para scraping y actualización de ELO FIDE. También incluye la funcionalidad de registro y autenticación de usuarios.

## Tabla de Contenidos
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración e Instalación](#configuración-e-instalación)
- [Uso](#uso)
- [Scripts Disponibles](#scripts-disponibles)
- [Dependencias](#dependencias)

## Estructura del Proyecto

- **server.js**: Archivo principal que configura y ejecuta el servidor.
- **scheduler.js**: Programa tareas automáticas para el scraping de jugadores y la actualización de ELO FIDE.
- **controllers/**:
  - **userController.js**: Maneja el registro y autenticación de usuarios.
  - **chessPlayerController.js**: Gestiona operaciones relacionadas con jugadores de ajedrez, incluyendo actualización de ELO FIDE.
- **routes/**:
  - **userRoutes.js**: Define rutas para el registro y login de usuarios.
  - **chessPlayerRoutes.js**: Define rutas para la gestión de jugadores de ajedrez.
- **Lists/Players_list.js**: Contiene la lista de jugadores de ajedrez por defecto que pueden ser verificados y añadidos a la base de datos.
- **db.js**: Configura y maneja las conexiones a las bases de datos para usuarios y jugadores.
- **Reviewer.js**: Revisa y corrige la capitalización de nombres de jugadores, y verifica y añade jugadores faltantes.
- **scrapePlayers.js**: Realiza scraping para obtener FIDE IDs de jugadores. Si faltan datos, ejecuta un script de Python para completar información desde un archivo XML.
- **Crear_tabla_players_fide.py**: Script en Python que carga datos de jugadores desde un archivo XML y los actualiza en la base de datos.

## Configuración e Instalación

1. Clona el repositorio:
   ```bash
   git clone URL REPO
   cd cd PROYECTO

2. Instala las dependencias:
    npm install

3. Configura el entorno con un .env adecuado:
    # Configuración base de datos de usuarios
    DB_HOST=localhost
    DB_USER=chess_user
    DB_PASSWORD=contraseña
    DB_NAME=chess_db
    DB_PORT=3306

    # Configuración de la base de datos de jugadores
    DB_CHESS_HOST=localhost
    DB_CHESS_USER=chess_user
    DB_CHESS_PASSWORD=contraseña
    DB_CHESS_NAME=chess_players_db
    DB_CHESS_PORT=3306

4. Ejecuta el servidor principal del backend:
    node server.js


## Uso
# Endpoints de Usuarios
POST /api/users/register: Registra un nuevo usuario. Requiere email, password, y confirmPassword en el cuerpo de la solicitud.
POST /api/users/login: Autentica un usuario. Requiere email y password en el cuerpo de la solicitud.

# Endpoints de Jugadores
GET /api/chess_players: Obtiene una lista de todos los jugadores.
GET /api/chess_players/search: Busca un jugador por nombre y apellido. Requiere firstName y lastName como parámetros de consulta.
GET /api/chess_players/details: Obtiene detalles de un jugador usando el ID FIDE. Requiere fideId como parámetro de consulta.

# Scripts Disponibles y estructura
server.js: Archivo principal que configura y ejecuta el servidor.
scheduler.js: Programa tareas automáticas para el scraping de jugadores y la actualización de ELO FIDE.
controllers/:
userController.js: Maneja el registro y autenticación de usuarios.
chessPlayerController.js: Lógica para obtener y actualizar datos de jugadores.
routes/:
userRoutes.js: Define las rutas de registro y login de usuarios.
chessPlayerRoutes.js: Define las rutas para obtener información de jugadores.
db.js: Configura las conexiones a las bases de datos de usuarios y jugadores.
scrapePlayers.js: Realiza scraping de datos de jugadores FIDE.
Reviewer.js: Contiene funciones para revisar y corregir datos de jugadores.
Lists/Players_list.js: Lista de jugadores predefinidos a verificar y agregar en la base de datos.
Crear_tabla_players_fide.py: Script de Python para procesar un archivo XML de jugadores FIDE y actualizar la base de datos.
.env: Archivo de configuración con variables de entorno para la base de datos.

# Dependencias
express: Framework de servidor para Node.js.
mysql2: Conector de MySQL para Node.js.
dotenv: Manejo de variables de entorno.
bcrypt: Encriptación de contraseñas.
puppeteer: Herramienta para scraping web.
cheerio: Analiza y manipula el HTML.
node-cron: Programa tareas periódicas.
winston: Registro y manejo de logs.