# INFORMACION DEL FRONTEND

## Descripción
El frontend de **Chess Fantasy** es una aplicación web que permite a los usuarios visualizar información sobre jugadores de ajedrez y gestionar su equipo de fantasy de manera intuitiva. Esta aplicación se comunica con el backend para proporcionar datos actualizados sobre jugadores, rankings, fichajes y otros elementos relacionados con la liga fantasy.

## Tecnologías Utilizadas (variable)

- **HTML5**: Estructura de las páginas web.
- **CSS3**: Estilo y apariencia de la aplicación, incluyendo elementos de diseño responsivo.
- **JavaScript (ES6+)**: Lógica de interacción y comportamiento del usuario.
- **React.js**.
- **Bootstrap**: Para componentes de la interfaz y estilos adicionales.

## Estructura del Proyecto

El directorio del frontend contiene los siguientes elementos principales:

```
Chess_Fantasy/
|— public/               # Archivos estáticos, como el logo y el índice HTML
|   |— favicon.ico       # Icono de la página
|   |— index.html        # Archivo HTML principal
|   |— logo192.png       # Logo en resolución 192x192
|   |— logo512.png       # Logo en resolución 512x512
|   |— manifest.json     # Manifesto de la aplicación
|   |— robots.txt        # Archivo para control de robots de búsqueda
|— src/                  # Código fuente principal del frontend
   |— assets/            # Recursos estáticos como imágenes
   |   |— club-logo.png             # Imagen del logo del club
   |   |— default-player.png        # Imagen predeterminada del jugador
   |   |— logo.png                  # Logo de la aplicación
   |— components/       # Componentes reutilizables de la UI
   |   |— Navbar.js      # Barra de navegación, incluye enlaces a las principales páginas
   |   |— PlayerList.js  # Componente para mostrar la lista de jugadores en formato de tabla
   |— pages/            # Páginas principales de la aplicación
   |   |— Home.js       # Página inicial, muestra un mensaje de bienvenida y el Navbar
   |   |— Home.css      # Estilos para la página inicial
   |   |— Jugadores.js  # Página con lista de jugadores, con el buscador implementado y detalles extensos
   |   |— Jugadores.css # Estilos para la página de jugadores
   |   |— Registro.js   # Formulario de registro de usuario, incluye validaciones y manejo de errores
   |   |— Registro.css  # Estilos para la página de registro
   |   |— Standings.js  # Clasificaciones de jugadores, muestra los puntos obtenidos por cada jugador
   |   |— Transfers.js  # Página de fichajes, muestra una lista de jugadores transferibles
   |— App.js            # Punto de entrada del frontend, define el enrutamiento entre las páginas
   |— index.js          # Renderizado principal
   |— index.css         # Estilos generales de la aplicación
   |— styles.css        # Estilos compartidos entre diferentes componentes
|— .env                 # Configuraciones del entorno (debe ser añadido por cada usuario, no subir)
|— package.json         # Dependencias y scripts del proyecto
|— package-lock.json    # Registro de versiones exactas de las dependencias
|— README.md            # Documentación del proyecto
```

### Detalle de Archivos Importantes

- **`public/`**: Contiene archivos estáticos que no cambian, como el logo de la aplicación o el archivo `index.html`, que sirve de punto de entrada HTML para React.
- **`assets/`**: Contiene imágenes y otros recursos gráficos utilizados en el frontend.
- **`components/`**: Incluye componentes reutilizables como el `Navbar`, que proporciona enlaces de navegación, y `PlayerList`, que muestra una tabla con jugadores.
- **`pages/`**: Contiene cada una de las páginas completas de la aplicación. Por ejemplo, `Jugadores.js` muestra la lista de jugadores de la fantasy con funcionalidades de búsqueda y visualización detallada.
  - **`Home.js`**: Página inicial que muestra un mensaje de bienvenida y el componente `Navbar` para facilitar la navegación.
  - **`Registro.js`**: Página de registro de usuarios, con validaciones de campos, manejo de errores y autenticación.
  - **`Standings.js`**: Muestra las clasificaciones de los jugadores, obteniendo la información de la API y mostrando los puntos de cada jugador.
  - **`Transfers.js`**: Página donde se muestra la lista de jugadores transferibles, utilizando el componente `PlayerList`.
  - **`Jugadores.js`**: Página dedicada a la visualización de los jugadores de la fantasy. Incluye un buscador avanzado que permite filtrar jugadores por nombre, y muestra detalles como el **valor del jugador**, **ELO FIDE**, **equipo**, **división**, y **puntos en partidas**. Utiliza una cuadrícula para organizar la información de los jugadores en tarjetas detalladas, y muestra una representación visual de los puntos de cada jugador en partidas recientes.

- **`App.js`**: Define la estructura principal de la aplicación, incluyendo el enrutamiento entre las distintas páginas utilizando `react-router-dom`.
- **`index.js`**: Renderiza `App.js` dentro del `DOM` para mostrar la aplicación en el navegador.

## Funcionalidades

- **Búsqueda Avanzada de Jugadores**: El archivo `Jugadores.js` tiene un buscador básico, que permite buscar jugadores por nombre. Queremos expandir esta funcionalidad para incluir búsquedas por **club**, **rango de ELO**, y otros **filtros** relevantes.
- **Visualización Detallada de Jugadores**: La página `Jugadores.js` muestra información detallada de cada jugador, como **nombre**, **ELO FIDE**, **valor**, **equipo**, **división**, y **puntos en partidas**. Cada tarjeta de jugador está diseñada para ofrecer una visión clara y rápida de sus estadísticas y detalles.
- **Registro de Usuarios**: Implementado en `Registro.js`, permite a los usuarios crear cuentas en la plataforma.
- **Navegación Intuitiva**: `Navbar.js` facilita la navegación entre las distintas secciones de la aplicación, como **Inicio**, **Clasificaciones**, **Fichajes** y **Jugadores**.
- **Listado de Jugadores**: `PlayerList.js` permite mostrar una lista de jugadores en formato de tabla, incluyendo el **nombre**, **ELO**, y **equipo**.
- **Clasificaciones de Jugadores**: `Standings.js` muestra los puntos de los jugadores, que se obtienen dinámicamente desde la API configurada en el archivo `.env`.
- **Fichajes**: `Transfers.js` muestra una lista de jugadores disponibles para fichar, con su **nombre**, **ELO**, y **equipo**.

## Requisitos para Ejecutar

Para ejecutar el frontend, necesitarás tener **Node.js** y **npm** instalados.

1. Clona el repositorio:

   ```bash
   git clone https://github.com/guesitos/CHESS_FANTASY.git
   cd CHESS_FANTASY
   ```

2. Navega al directorio del frontend y luego instala las dependencias:

   ```bash
   cd my-chess-fantasy-frontend
   npm install
   ```

3. Ejecuta el servidor de desarrollo:

   ```bash
   npm start
   ```
   
---
**Autor**: guesitos

**Licencia**: MIT