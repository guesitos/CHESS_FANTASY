import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css';
import logo from '../assets/logo.png';

function Registro() {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateAccountClick = () => {
    setActiveForm(activeForm === 'register' ? null : 'register');
  };

  const handleLoginClick = () => {
    setActiveForm(activeForm === 'login' ? null : 'login');
  };

  // Validación del registro de cuenta
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validar si las contraseñas coinciden
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();
      if (response.status === 400) {
        setErrorMessage(data.message);
      } else {
        navigate('/home'); // Redirige a la página principal solo si es exitoso
      }
    } catch (error) {
      setErrorMessage('Error en la conexión con el servidor');
    }
  };

  // Validación del login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
  
    try {
      console.log("Enviando solicitud a:", `${process.env.REACT_APP_API_URL}/users/login`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
  
      if (response.status === 400) {
        setErrorMessage(data.message);
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error("Error en la conexión con el servidor:", error);
      setErrorMessage('Error en la conexión con el servidor');
    }
  };
  

  return (
    <div className="home-container">
      <img src={logo} alt="Logo" className="logo" />
      <div className="content">
        <h2>GALICHESS FANTASY</h2>

        {/* Botón Crear Cuenta */}
        <button className={`toggle-btn ${activeForm === 'register' ? 'active' : ''}`} onClick={handleCreateAccountClick}>
          Crear Cuenta
        </button>

        {/* Formulario de Crear Cuenta */}
        {activeForm === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="form-container">
            <input
              type="email"
              placeholder="Email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              required
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="submit-btn">Regístrate</button>
          </form>
        )}

        {/* Botón Ya tengo cuenta */}
        <button className={`toggle-btn ${activeForm === 'login' ? 'active' : 'inactive'}`} onClick={handleLoginClick}>
          Ya tengo cuenta
        </button>

        {/* Formulario de Login */}
        {activeForm === 'login' && (
          <form onSubmit={handleLoginSubmit} className="form-container">
            <input
              type="email"
              placeholder="Email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="submit-btn">Iniciar Sesión</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Registro;