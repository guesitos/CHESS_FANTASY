// src/App.js

import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta pública: Registro */}
        <Route path="/" element={<Registro />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Navbar />
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/clasificacion"
          element={
            <PrivateRoute>
              <Navbar />
              <Clasificacion />
            </PrivateRoute>
          }
        />
        <Route
          path="/mercado"
          element={
            <PrivateRoute>
              <Navbar />
              <Mercado />
            </PrivateRoute>
          }
        />
        <Route
          path="/jugadores"
          element={
            <PrivateRoute>
              <Navbar />
              <Jugadores />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipo"
          element={
            <PrivateRoute>
              <Navbar />
              <MiEquipo />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Navbar />
              <PerfilUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <PrivateRoute>
              <Navbar />
              <Estadisticas />
            </PrivateRoute>
          }
        />
        <Route
          path="/comunidad"
          element={
            <PrivateRoute>
              <Navbar />
              <Comunidad />
            </PrivateRoute>
          }
        />
        <Route
          path="/soporte"
          element={
            <PrivateRoute>
              <Navbar />
              <Soporte />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendario"
          element={
            <PrivateRoute>
              <Navbar />
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
