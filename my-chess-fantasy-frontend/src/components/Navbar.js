// src/components/Navbar.js

import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css'; // Asegúrate de tener este archivo para estilos específicos de Navbar

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="modern-navbar">
      <BootstrapNavbar.Brand as={Link} to="/home">My Chess Fantasy</BootstrapNavbar.Brand>
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="nav-links">
          <Nav.Link as={Link} to="/home">Inicio</Nav.Link>
          <Nav.Link as={Link} to="/clasificacion">Clasificación</Nav.Link>
          <Nav.Link as={Link} to="/mercado">Mercado</Nav.Link>
          <Nav.Link as={Link} to="/jugadores">Jugadores</Nav.Link>
          <Nav.Link as={Link} to="/equipo">Mi Equipo</Nav.Link>
          <Nav.Link as={Link} to="/estadisticas">Estadísticas</Nav.Link>
          <Nav.Link as={Link} to="/comunidad">Comunidad</Nav.Link>
          <Nav.Link as={Link} to="/soporte">Soporte</Nav.Link>
          <Nav.Link as={Link} to="/calendario">Calendario</Nav.Link>
        </Nav>
        <Nav className="ml-auto">
          {user && (
            <NavDropdown 
              title={<FontAwesomeIcon icon={faUser} className="user-icon" />} 
              id="user-dropdown"
              align="end"
              show={showDropdown}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <NavDropdown.Item as={Link} to="/perfil">Mi Perfil</NavDropdown.Item>
              <NavDropdown.Item as="button" onClick={logout}>Cerrar Sesión</NavDropdown.Item>
            </NavDropdown>
          )}
          {!user && (
            <Nav.Link as={Link} to="/">Iniciar Sesión</Nav.Link>
          )}
        </Nav>
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
}

export default Navbar;
