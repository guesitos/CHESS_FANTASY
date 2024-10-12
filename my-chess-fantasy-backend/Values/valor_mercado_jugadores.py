# valor_mercado_jugadores.py
# Este script calcula el valor de mercado de los jugadores en base a factores como el ELO, la división, el tablero y las métricas de rendimiento.
# El valor de mercado inicial se calcula a partir del ELO del jugador, la división, el tablero en el que se encuentra y la comparación de su ELO con la media de ELO de su tablero.
# Posteriormente, el valor de mercado se ajusta semanalmente en base a los puntos obtenidos y la cantidad de compras realizadas por los usuarios.

import sys
import mysql.connector
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

class Jugador:
    def __init__(self, nombre, elo, division, tablero, media_elo_tablero, puntos):
        self.nombre = nombre
        self.elo = elo
        self.division = division
        self.tablero = tablero
        self.media_elo_tablero = media_elo_tablero  # Media de ELO del tablero
        self.puntos = puntos  # Puntos obtenidos
        self.valor_mercado = self.calcular_valor_inicial()
        self.historico_compras = []  # Historial del número de compras por semana
        self.historico_puntos = []  # Historial de puntos por semana

    def calcular_valor_inicial(self):
        # Valor base a partir del ELO
        valor_base = self.elo * 1000
        
        # Ajuste por División (mayor división, mayor valor)
        # Asumimos que las divisiones están numeradas de 1 a 4 (1 siendo la más alta)
        try:
            division_num = int(self.division)
        except ValueError:
            division_num = 1  # Valor por defecto si no se puede convertir
        
        ajuste_division = (5 - division_num) * 10000000  # Entre más alta la división, mayor es el valor
        
        # Ajuste por Tablero (entre más arriba esté en el tablero, mayor valor)
        try:
            ajuste_tablero = (6 - self.tablero) * 5000000  # Tableros más altos aportan más valor
        except TypeError:
            ajuste_tablero = 5000000  # Valor por defecto si tablero no es un número
        
        # Ajuste por comparación de ELO con la media del tablero
        diferencia_elo = self.elo - self.media_elo_tablero
        ajuste_elo_vs_media = diferencia_elo * 50000  # Ajuste significativo basado en la diferencia de ELO respecto a la media
        
        # Ajuste por puntos obtenidos
        ajuste_puntos = self.puntos * 1000  # Puedes ajustar este factor según tus necesidades
        
        # Valor de mercado inicial
        valor_inicial = valor_base + ajuste_division + ajuste_tablero + ajuste_elo_vs_media + ajuste_puntos
        return max(100000, min(valor_inicial, 100000000000))  # Limitar entre 100k y 100B

    def actualizar_valor_semanal(self, puntos_semanales, compras_semanales, media_puntos):
        # [Código existente de actualización semanal...]
        pass

    def __str__(self):
        return f"Jugador: {self.nombre}, Valor de Mercado: {self.valor_mercado:.2f} EUR"

# Función para obtener los datos del jugador desde la base de datos
def obtener_datos_jugador(fide_id):
    try:
        conexion = mysql.connector.connect(
            host=os.getenv('DB_CHESS_HOST'),
            user=os.getenv('DB_CHESS_USER'),
            password=os.getenv('DB_CHESS_PASSWORD'),
            database=os.getenv('DB_CHESS_NAME'),
            port=int(os.getenv('DB_CHESS_PORT'))
        )
        cursor = conexion.cursor(dictionary=True)
        
        # Buscar al jugador por fide_id
        cursor.execute('''
            SELECT first_name, last_name, elo_fide AS elo, division, tablero, total_points AS puntos
            FROM players
            WHERE fide_id = %s
            LIMIT 1
        ''', (fide_id,))
        jugador = cursor.fetchone()
        
        if not jugador:
            print("Error: Jugador no encontrado.", file=sys.stderr)
            sys.exit(1)
        
        # Obtener la media de ELO del tablero
        cursor.execute('SELECT AVG(CAST(elo_fide AS DECIMAL)) AS media_elo FROM players WHERE tablero = %s', (jugador['tablero'],))
        media = cursor.fetchone()['media_elo']
        jugador['media_elo_tablero'] = media
        
        cursor.close()
        conexion.close()
        return jugador
    except Exception as e:
        print(f"Error al conectar con la base de datos: {e}", file=sys.stderr)
        sys.exit(1)

# Función principal para calcular y retornar el valor de mercado
def main():
    if len(sys.argv) != 2:
        print("Error: Debe proporcionar el fide_id del jugador.", file=sys.stderr)
        sys.exit(1)
    
    fide_id = sys.argv[1]
    
    # Validar que el fide_id es un número
    if not fide_id.isdigit():
        print("Error: El fide_id debe ser un número.", file=sys.stderr)
        sys.exit(1)
    
    jugador_data = obtener_datos_jugador(fide_id)
    
    # Convertir tipos de datos
    try:
        elo = int(jugador_data['elo']) if jugador_data['elo'] else 0
    except ValueError:
        elo = 0
    try:
        division = int(jugador_data['division']) if jugador_data['division'] else 1  # Asumiendo división 1 por defecto
    except ValueError:
        division = 1
    try:
        tablero = int(jugador_data['tablero']) if jugador_data['tablero'] else 1  # Asumiendo tablero 1 por defecto
    except ValueError:
        tablero = 1
    try:
        media_elo_tablero = float(jugador_data['media_elo_tablero']) if jugador_data['media_elo_tablero'] else 0.0
    except ValueError:
        media_elo_tablero = 0.0
    try:
        puntos = int(jugador_data['puntos']) if jugador_data['puntos'] else 0
    except ValueError:
        puntos = 0
    
    jugador = Jugador(
        nombre=f"{jugador_data['first_name']} {jugador_data['last_name']}",
        elo=elo,
        division=division,
        tablero=tablero,
        media_elo_tablero=media_elo_tablero,
        puntos=puntos
    )
    
    # Retornar el valor de mercado como salida estándar
    print(jugador.valor_mercado)

if __name__ == "__main__":
    main()
