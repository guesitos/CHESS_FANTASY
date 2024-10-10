# WEB Fantasy Chess

## Descripción
**WEB Fantasy Chess** es una aplicación que combina elementos de Fantasy Sports con el mundo del ajedrez. Los usuarios pueden seleccionar jugadores y crear equipos basados en partidas de ajedrez reales, puntuando según los resultados y el desempeño de los jugadores.

## Estructura del Proyecto
El proyecto se compone de tres módulos principales:

- **Frontend** (`frontend`): Desarrollado en React para la interfaz de usuario.
- **Backend** (`backend`): API y lógica del servidor construida con Node.js y Express.
- **Scraper** (`scraper`): Un módulo independiente para obtener datos de clasificaciones de jugadores de ajedrez.

## Configuración

### Requisitos
- Node.js
- NPM o Yarn
- MySQL (para la base de datos del backend)

### Instrucciones de Instalación

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/guesitos/CHESS_FANTASY.git
cd CHESS_FANTASY
```
#### 2. Instalar Dependencias
Para el Frontend:
```bash
cd my-chess-fantasy-frontend
npm install
```
Para el Backend:
```bash
cd my-chess-fantasy-backend
npm install
```
#### 3.Configurar Variables de Entorno
Crea un archivo .env en la carpeta my-chess-fantasy-backend con las siguientes variables:
makefile
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=chess_fantasy
```

#### 4.Iniciar la Aplicación
Frontend:
```bash
npm start
```
Backend:
```bash
npm run dev
```

#### 5.Módulo Scraper - FIDE Ratings Scraper
Para obtener y actualizar datos de jugadores de ajedrez, utiliza el FIDE Ratings Scraper: https://github.com/xRuiAlves/fide-ratings-scraper/tree/master.

Instalación del Scraper
```bash
npm install -g fide-ratings-scraper
```
Uso del Scraper
```bash
fide-ratings-scraper get info 1503014
fide-ratings-scraper api
```

Rutas API Disponibles:

Obtener información completa del jugador:
```bash
GET /player/{fide_number}/info
```
Ejemplo de respuesta:
```bash
{
    "name": "Doe, John",
    "federation": "Portugal",
    "standard_elo": 1700,
    "rapid_elo": 1650,
    "blitz_elo": 1750,
    "world_rank_all_players": 180000
}
```