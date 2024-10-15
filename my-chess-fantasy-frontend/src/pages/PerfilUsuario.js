// src/pages/PerfilUsuario.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './PerfilUsuario.css';

function PerfilUsuario() {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    equipo: user?.equipo || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    // Aquí podrías agregar la lógica para guardar los cambios en el backend
    console.log('Datos guardados:', editData);
    setIsEditing(false);
  };

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <div className="perfil-header">
          <h2>Perfil de {user?.nombre || 'Usuario'}</h2>
        </div>
        <div className="perfil-body">
          {isEditing ? (
            <div className="perfil-info">
              <label>
                <strong>Nombre:</strong>
                <input
                  type="text"
                  name="nombre"
                  value={editData.nombre}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                <strong>Correo:</strong>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                <strong>Equipo:</strong>
                <input
                  type="text"
                  name="equipo"
                  value={editData.equipo}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          ) : (
            <div className="perfil-info">
              <p><strong>Nombre:</strong> {user?.nombre || 'N/A'}</p>
              <p><strong>Correo:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Equipo:</strong> {user?.equipo || 'N/A'}</p>
              <p><strong>Puntos Totales:</strong> {user?.puntosTotales || '0'}</p>
            </div>
          )}
          <div className="perfil-actions">
            {isEditing ? (
              <>
                <button className="btn-guardar" onClick={handleSave}>Guardar</button>
                <button className="btn-cancelar" onClick={() => setIsEditing(false)}>Cancelar</button>
              </>
            ) : (
              <>
                <button className="btn-editar" onClick={() => setIsEditing(true)}>Editar Perfil</button>
                <button className="btn-cerrar-sesion" onClick={logout}>Cerrar Sesión</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilUsuario;
