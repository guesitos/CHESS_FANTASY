// src/components/PerfilUsuario.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './PerfilUsuario.css';

function PerfilUsuario() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    teamName: user?.teamName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
        method: 'PUT', // O 'PATCH' según tu API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluye el token si es necesario
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Error al actualizar el perfil:', data.message || 'Error desconocido');
        alert(data.message || 'Error al actualizar el perfil');
        return;
      }

      const updatedUserResponse = await response.json();
      console.log('Perfil actualizado exitosamente:', updatedUserResponse);

      // Actualiza el contexto de usuario con el objeto user recibido
      updateUser(updatedUserResponse.user);

      setIsEditing(false);
    } catch (error) {
      console.error('Error en la conexión:', error.message);
      alert(`Error en la conexión: ${error.message}`);
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <div className="perfil-header">
          <h2>{user?.username || 'Usuario'}</h2>
        </div>
        <div className="perfil-body">
          {isEditing ? (
            <div className="perfil-info">
              {/* Mostrar correo y nombre de usuario como texto estático */}
              <p><strong>Correo:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Nombre de Usuario:</strong> {user?.username || 'N/A'}</p>

              {/* Campos editables */}
              <label>
                <strong>Nombre:</strong>
                <input
                  type="text"
                  name="firstName"
                  value={editData.firstName}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                <strong>Apellidos:</strong>
                <input
                  type="text"
                  name="lastName"
                  value={editData.lastName}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                <strong>Nombre de Equipo:</strong>
                <input
                  type="text"
                  name="teamName"
                  value={editData.teamName}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          ) : (
            <div className="perfil-info">
              <p><strong>Correo:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Nombre de Usuario:</strong> {user?.username || 'N/A'}</p>
              <p><strong>Nombre:</strong> {user?.firstName || 'N/A'}</p>
              <p><strong>Apellidos:</strong> {user?.lastName || 'N/A'}</p>
              <p><strong>Nombre de Equipo:</strong> {user?.teamName || 'N/A'}</p>
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
