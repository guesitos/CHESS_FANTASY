## test_valor_mercado_jugadores.py
# Este script se utiliza para probar el comportamiento del archivo 'valor_mercado_jugadores.py'.
# Crea múltiples jugadores y simula diferentes semanas de puntos y compras para validar cómo varían sus valores de mercado.

from valor_mercado_jugadores import Jugador

def probar_valores_mercado():
    # Crear jugadores de ejemplo
    jugador1 = Jugador(nombre="Carlos", elo=1800, division=2, tablero=3, media_elo_tablero=1750)
    jugador2 = Jugador(nombre="Ana", elo=2000, division=1, tablero=1, media_elo_tablero=1900)
    jugador3 = Jugador(nombre="Luis", elo=1600, division=3, tablero=5, media_elo_tablero=1650)
    
    # Ejemplos extremos
    jugador4 = Jugador(nombre="Juan", elo=2100, division=1, tablero=1, media_elo_tablero=1900)  # Muy por encima de la media, mejor tablero y división
    jugador5 = Jugador(nombre="Pedro", elo=1400, division=4, tablero=6, media_elo_tablero=1600)  # Muy por debajo de la media, peor tablero y división

    jugadores = [jugador1, jugador2, jugador3, jugador4, jugador5]

    # Imprimir valores iniciales
    print("Valores iniciales de los jugadores:")
    for jugador in jugadores:
        print(jugador)
    print("\n")

    # Simular varias semanas con una media de puntos fija
    media_puntos = 8
    semanas = [
        {"puntos_semanales": 10, "compras_semanales": 15},
        {"puntos_semanales": 5, "compras_semanales": 20},
        {"puntos_semanales": -3, "compras_semanales": 10},
        {"puntos_semanales": 7, "compras_semanales": 18},
        {"puntos_semanales": 12, "compras_semanales": 25},
    ]

    # Actualizar valores de mercado por cada semana
    for semana_idx, semana in enumerate(semanas):
        print(f"Semana {semana_idx + 1}:")
        for jugador in jugadores:
            jugador.actualizar_valor_semanal(puntos_semanales=semana["puntos_semanales"], compras_semanales=semana["compras_semanales"], media_puntos=media_puntos)
            print(jugador)
        print("\n")

if __name__ == "__main__":
    probar_valores_mercado()