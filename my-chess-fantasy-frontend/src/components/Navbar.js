// src/components/Navbar.js

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext'; 
import './Navbar.css'; // Asegúrate de tener este archivo para estilos específicos de Navbar

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <BootstrapNavbar.Brand as={Link} to="/home">My Chess Fantasy</BootstrapNavbar.Brand>
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/home">Inicio</Nav.Link>
          <Nav.Link as={Link} to="/clasificacion">Clasificación</Nav.Link>
          <Nav.Link as={Link} to="/mercado">Mercado</Nav.Link>
          <Nav.Link as={Link} to="/jugadores">Jugadores</Nav.Link>
          <Nav.Link as={Link} to="/equipo">Mi Equipo</Nav.Link>
          <Nav.Link as={Link} to="/estadisticas">Estadísticas</Nav.Link>
          <Nav.Link as={Link} to="/comunidad">Comunidad</Nav.Link>
          <Nav.Link as={Link} to="/soporte">Soporte</Nav.Link>
          <Nav.Link as={Link} to="/calendario">Calendario</Nav.Link>
          {user && <Nav.Link as={Link} to="/perfil">Perfil</Nav.Link>}
          {user ? (
            <Button variant="outline-light" onClick={logout}>Cerrar Sesión</Button>
          ) : (
            <Nav.Link as={Link} to="/">Iniciar Sesión</Nav.Link>
          )}
        </Nav>
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
}

export default Navbar;
