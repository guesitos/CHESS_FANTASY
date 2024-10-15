// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importa jwtDecode como exportación con nombre

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [authError, setAuthError] = useState(null); // Estado para manejar errores de autenticación

  // Función para verificar si el token ha expirado
  const isTokenExpired = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken);
      const currentTime = Date.now() / 1000; // Tiempo actual en segundos
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return true; // Si hay un error al decodificar, consideramos el token como expirado
    }
  };

  // Función para manejar el auto logout cuando el token expira
  const setupAutoLogout = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken);
      const currentTime = Date.now() / 1000; // Tiempo actual en segundos
      const timeLeft = decoded.exp - currentTime;
      
      if (timeLeft <= 0) {
        logout();
      } else {
        // Configura un timeout para cerrar la sesión automáticamente cuando el token expire
        const timeout = setTimeout(() => {
          logout();
        }, timeLeft * 1000); // Convierte segundos a milisegundos

        return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta o el token cambia
      }
    } catch (error) {
      console.error('Error al configurar el auto logout:', error);
      logout();
    }
  };

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          if (isTokenExpired(storedToken)) {
            // Si el token ha expirado, cerrar la sesión
            logout();
            return;
          }
          
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          console.log('Usuario cargado desde localStorage:', parsedUser);
          
          // Configura el auto logout
          setupAutoLogout(storedToken);
        }
      } catch (error) {
        console.error('Error al parsear el usuario desde localStorage:', error);
        // Limpia los datos corruptos
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    loadUserFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = (newUser, jwtToken) => {
    setLoading(true);
    try {
      setUser(newUser);
      setToken(jwtToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
      }
      console.log('Usuario registrado en AuthContext:', newUser);

      // Configura el auto logout
      setupAutoLogout(jwtToken);
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      setAuthError('Error al registrar el usuario. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const login = (existingUser, jwtToken) => {
    setLoading(true);
    try {
      setUser(existingUser);
      setToken(jwtToken);
      localStorage.setItem('user', JSON.stringify(existingUser));
      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
      }
      console.log('Usuario logueado en AuthContext:', existingUser);

      // Configura el auto logout
      setupAutoLogout(jwtToken);
    } catch (error) {
      console.error('Error al loguear el usuario:', error);
      setAuthError('Error al iniciar sesión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/'); // Redirige al registro después del logout
    console.log('Usuario desconectado.');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      register, 
      login, 
      logout, 
      loading, 
      authError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
