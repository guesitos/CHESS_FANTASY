// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        console.log('Usuario cargado desde localStorage:', parsedUser);
      }
    } catch (error) {
      console.error('Error al parsear el usuario desde localStorage:', error);
      // Opcional: limpiar los datos corruptos
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const register = (newUser, jwtToken) => {
    setUser(newUser);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
    }
    console.log('Usuario registrado en AuthContext:', newUser);
  };

  const login = (existingUser, jwtToken) => {
    setUser(existingUser);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(existingUser));
    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
    }
    console.log('Usuario logueado en AuthContext:', existingUser);
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
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
