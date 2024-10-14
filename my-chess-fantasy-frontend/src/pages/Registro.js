// src/pages/Registro/Registro.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Registro.css';
import logo from '../assets/logo.png';

function Registro() {
  const navigate = useNavigate();
  const { register: authRegister, login: authLogin } = useContext(AuthContext);

  const [activeForm, setActiveForm] = useState(null);

  // Estados para Registro
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAccountClick = () => {
    setErrorMessage(''); // Limpiar cualquier error anterior
    setActiveForm(activeForm === 'register' ? null : 'register');
  };

  const handleLoginClick = () => {
    setErrorMessage(''); // Limpiar cualquier error anterior
    setActiveForm(activeForm === 'login' ? null : 'login');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = regEmail.trim();
    const trimmedPassword = regPassword.trim();
    const trimmedConfirmPassword = regConfirmPassword.trim();

    console.log('Registro - Email:', trimmedEmail);
    console.log('Registro - Password:', trimmedPassword);
    console.log('Registro - Confirm Password:', trimmedConfirmPassword);

    // Validaciones iniciales
    if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setErrorMessage('Todos los campos son requeridos');
      console.log('Error: Campos requeridos no completados');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      console.log('Error: Las contraseñas no coinciden');
      return;
    }

    if (!process.env.REACT_APP_API_URL) {
      setErrorMessage('La URL de la API no está definida. Verifique el archivo .env.');
      console.log('Error: La URL de la API no está definida');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }), // No enviar confirmPassword
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message || 'Error desconocido');
        console.log('Error en el registro:', data.message || 'Error desconocido');
        return;
      }

      const data = await response.json(); // Asumiendo que el backend devuelve el usuario y/o token
      console.log('Registro exitoso:', data);

      // Verificar la estructura de la respuesta
      if (data.user && data.token) {
        // Llamar a la función de registro del AuthContext
        authRegister(data.user, data.token); // Asegúrate de que 'data.user' y 'data.token' existen

        // Manejar 'isFirstTimeUser' si es necesario
        localStorage.setItem('isFirstTimeUser', 'true');

        // Limpia los campos
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');

        navigate('/home');
      } else {
        setErrorMessage('Respuesta del servidor no válida.');
        console.log('Error: Respuesta del servidor no contiene user o token.');
      }
    } catch (error) {
      setErrorMessage(`Error en la conexión con el servidor: ${error.message}`);
      console.log('Error en la conexión:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const trimmedLoginEmail = loginEmail.trim();
    const trimmedLoginPassword = loginPassword.trim();

    console.log('Login - Email:', trimmedLoginEmail);
    console.log('Login - Password:', trimmedLoginPassword);

    if (!trimmedLoginEmail || !trimmedLoginPassword) {
      setErrorMessage('Todos los campos son requeridos');
      return;
    }

    if (!process.env.REACT_APP_API_URL) {
      setErrorMessage('La URL de la API no está definida. Verifique el archivo .env.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedLoginEmail, password: trimmedLoginPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message || 'Error desconocido');
        console.log('Error en el login:', data.message || 'Error desconocido');
        return;
      }

      const data = await response.json(); // Asumiendo que el backend devuelve el usuario y/o token
      console.log('Login exitoso:', data);

      // Verificar la estructura de la respuesta
      if (data.user && data.token) {
        // Llamar a la función de login del AuthContext
        authLogin(data.user, data.token); // Asegúrate de que 'data.user' y 'data.token' existen

        // Verificar si es la primera vez que el usuario inicia sesión
        const isFirstTimeUser = localStorage.getItem('isFirstTimeUser');
        if (isFirstTimeUser) {
          localStorage.removeItem('isFirstTimeUser'); // Limpiar el flag
          navigate('/home'); // Redirige a Home
        } else {
          navigate('/perfil'); // Redirige a PerfilUsuario
        }
      } else {
        setErrorMessage('Respuesta del servidor no válida.');
        console.log('Error: Respuesta del servidor no contiene user o token.');
      }
    } catch (error) {
      setErrorMessage(`Error en la conexión con el servidor: ${error.message}`);
      console.log('Error en la conexión:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <img src={logo} alt="Logo" className="logo" />
      <div className="content">
        <h2>GALICHESS FANTASY</h2>

        <button
          className={`toggle-btn ${activeForm === 'register' ? 'active' : ''}`}
          onClick={handleCreateAccountClick}
        >
          Crear Cuenta
        </button>

        {activeForm === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="form-container">
            <input
              type="email"
              placeholder="Email"
              required
              className="input-field"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              required
              className="input-field"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              required
              className="input-field"
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Regístrate'}
            </button>
          </form>
        )}

        <button
          className={`toggle-btn ${activeForm === 'login' ? 'active' : 'inactive'}`}
          onClick={handleLoginClick}
        >
          Ya tengo cuenta
        </button>

        {activeForm === 'login' && (
          <form onSubmit={handleLoginSubmit} className="form-container">
            <input
              type="email"
              placeholder="Email"
              required
              className="input-field"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              required
              className="input-field"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Registro;
