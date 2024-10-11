## valor_mercado_jugadores.py
# Este script calcula el valor de mercado de los jugadores en base a factores como el ELO, la división, el tablero y las métricas de rendimiento.
# El valor de mercado inicial se calcula a partir del ELO del jugador, la división, el tablero en el que se encuentra y la comparación de su ELO con la media de ELO de su tablero.
# Posteriormente, el valor de mercado se ajusta semanalmente en base a los puntos obtenidos y la cantidad de compras realizadas por los usuarios.

class Jugador:
    def __init__(self, nombre, elo, division, tablero, media_elo_tablero):
        self.nombre = nombre
        self.elo = elo
        self.division = division
        self.tablero = tablero
        self.media_elo_tablero = media_elo_tablero  # Media de ELO del tablero
        self.valor_mercado = self.calcular_valor_inicial()
        self.historico_compras = []  # Historial del número de compras por semana
        self.historico_puntos = []  # Historial de puntos por semana

    def calcular_valor_inicial(self):
        # Valor base a partir del ELO
        valor_base = self.elo * 1000
        
        # Ajuste por División (mayor división, mayor valor)
        ajuste_division = (5 - self.division) * 10000000  # Entre más alta la división, mayor es el valor
        
        # Ajuste por Tablero (entre más arriba esté en el tablero, mayor valor)
        ajuste_tablero = (6 - self.tablero) * 5000000  # Tableros más altos aportan más valor
        
        # Ajuste por comparación de ELO con la media del tablero
        diferencia_elo = self.elo - self.media_elo_tablero
        ajuste_elo_vs_media = diferencia_elo * 50000  # Ajuste significativo basado en la diferencia de ELO respecto a la media
        
        # Valor de mercado inicial
        valor_inicial = valor_base + ajuste_division + ajuste_tablero + ajuste_elo_vs_media
        return max(100000, min(valor_inicial, 100000000000))  # Limitar entre 100k y 100B

    def actualizar_valor_semanal(self, puntos_semanales, compras_semanales, media_puntos):
        # Límites de variación
        variacion_maxima = 20000000  # Variación máxima de 20 millones por semana

        # Determinar si el valor debería subir o bajar
        subir_precio = puntos_semanales > media_puntos and (
            len(self.historico_compras) == 0 or compras_semanales > self.historico_compras[-1]
        )
        bajar_precio = puntos_semanales < media_puntos and (
            len(self.historico_compras) == 0 or compras_semanales < self.historico_compras[-1]
        )

        # Cálculo de ajuste por puntos semanales
        ajuste_puntos = puntos_semanales * 1000000 if subir_precio else -puntos_semanales * 1000000
        ajuste_puntos = max(-variacion_maxima, min(ajuste_puntos, variacion_maxima))

        # Cálculo de ajuste por compras semanales
        ajuste_compras = 0
        if len(self.historico_compras) > 0:
            compras_previas = self.historico_compras[-1]
            variacion_compras = compras_semanales - compras_previas
            ajuste_compras = variacion_compras * 500000 if subir_precio else -abs(variacion_compras) * 500000
            ajuste_compras = max(-variacion_maxima / 2, min(ajuste_compras, variacion_maxima / 2))

        # Calcular nuevo valor de mercado
        nuevo_valor = self.valor_mercado + ajuste_puntos + ajuste_compras

        # Asegurarse de que el valor esté dentro de los límites
        self.valor_mercado = max(100000, min(nuevo_valor, 100000000000))

        # Actualizar el historial de compras y puntos
        self.historico_compras.append(compras_semanales)
        self.historico_puntos.append(puntos_semanales)

    def __str__(self):
        return f"Jugador: {self.nombre}, Valor de Mercado: {self.valor_mercado:.2f} EUR"


# Ejemplo de cómo usar la clase
if __name__ == "__main__":
    # Crear un jugador
    jugador = Jugador(nombre="Carlos", elo=1800, division=2, tablero=3, media_elo_tablero=1750)
    print(jugador)

    # Actualizar valor de mercado con puntos semanales y compras
    media_puntos = 8
    jugador.actualizar_valor_semanal(puntos_semanales=10, compras_semanales=15, media_puntos=media_puntos)
    print(jugador)

    jugador.actualizar_valor_semanal(puntos_semanales=5, compras_semanales=10, media_puntos=media_puntos)
    print(jugador)

    jugador.actualizar_valor_semanal(puntos_semanales=-3, compras_semanales=5, media_puntos=media_puntos)
    print(jugador)

    # Ejemplo con más jugadores
    jugador2 = Jugador(nombre="Ana", elo=2000, division=1, tablero=1, media_elo_tablero=1900)
    print(jugador2)
    jugador2.actualizar_valor_semanal(puntos_semanales=15, compras_semanales=20, media_puntos=media_puntos)
    print(jugador2)
    jugador2.actualizar_valor_semanal(puntos_semanales=7, compras_semanales=25, media_puntos=media_puntos)
    print(jugador2)