// src/App.js

import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Importa useLocation
import AuthProvider, { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Clasificacion from './pages/Clasificacion';
import Mercado from './pages/Mercado';
import Jugadores from './pages/Jugadores';
import MiEquipo from './pages/MiEquipo';
import PerfilUsuario from './pages/PerfilUsuario';
import Estadisticas from './pages/Estadisticas';
import Comunidad from './pages/Comunidad';
import Soporte from './pages/Soporte';
import Calendario from './pages/Calendario';

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/" />;
};

function App() {
  const location = useLocation(); // Obtén la ubicación actual

  // Define las rutas donde NO se mostrará la Navbar
  const hideNavbarRoutes = ['/']; // '/' es la ruta de Registro

  // Determina si la Navbar debe estar oculta en la ruta actual
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      {/* Renderiza la Navbar solo si shouldHideNavbar es falso */}
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* Ruta pública: Registro */}
        <Route path="/" element={<Registro />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/clasificacion"
          element={
            <PrivateRoute>
              <Clasificacion />
            </PrivateRoute>
          }
        />
        <Route
          path="/mercado"
          element={
            <PrivateRoute>
              <Mercado />
            </PrivateRoute>
          }
        />
        <Route
          path="/jugadores"
          element={
            <PrivateRoute>
              <Jugadores />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipo"
          element={
            <PrivateRoute>
              <MiEquipo />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <PerfilUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <PrivateRoute>
              <Estadisticas />
            </PrivateRoute>
          }
        />
        <Route
          path="/comunidad"
          element={
            <PrivateRoute>
              <Comunidad />
            </PrivateRoute>
          }
        />
        <Route
          path="/soporte"
          element={
            <PrivateRoute>
              <Soporte />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendario"
          element={
            <PrivateRoute>
              <Calendario />
            </PrivateRoute>
          }
        />
        
        {/* Ruta por defecto: Redirige a Registro */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
