## calcula_puntos.py
# Entrada: Parámetros relacionados con la partida.
# Procesamiento: Calcula los puntos totales y la bonificación ELO según las reglas de tu modelo.
# Salida: Retorna puntos_totales y bonificacion_elo.

#Función main:
#Manejo de Argumentos: Utiliza argparse para recibir argumentos de línea de comandos. Si faltan argumentos requeridos, solicita la entrada interactiva.
#Validaciones: Asegura que los valores proporcionados son válidos (por ejemplo, división entre 1 y 4, tablero dentro del rango, ELO razonable).
#Cálculo y Salida: Llama a calcular_puntos y muestra los resultados.

import argparse
import sys


def calcular_puntos(resultado_individual, resultado_equipo, division, tablero, total_tableros,
                   elo_jugador, elo_oponente, color,
                   K=200, puntos_victoria=50, puntos_tablas=25, puntos_derrota=5,
                   puntos_max_tablero=3, puntos_max_division=2.5,  # Ajustados
                   bonificacion_elo_factor=2.0, factor_negras=1.5):
    """
    Calcula los puntos totales y la bonificación ELO para un jugador en una partida específica.
    
    Parámetros:
    - resultado_individual (str): 'victoria', 'tablas', 'derrota'
    - resultado_equipo (str): 'victoria', 'empate', 'derrota'
    - division (int): División del jugador (1 a 4)
    - tablero (int): Número de tablero (1 a total_tableros)
    - total_tableros (int): Total de tableros en la división
    - elo_jugador (int): ELO del jugador
    - elo_oponente (int): ELO del oponente
    - color (str): 'blancas' o 'negras'
    - K (int): Parámetro K (default=200)
    - puntos_victoria (int): Puntos por victoria (default=50)
    - puntos_tablas (int): Puntos por tablas (default=25)
    - puntos_derrota (int): Puntos por derrota (default=5)
    - puntos_max_tablero (int): Puntos máximos por tablero (default=3)
    - puntos_max_division (float): Puntos máximos por división (default=2.5)
    - bonificacion_elo_factor (float): Factor de bonificación ELO (default=2.0)
    - factor_negras (float): Factor de ajuste por jugar con negras (default=1.5)
    
    Retorna:
    - puntos_totales (float): Puntos totales obtenidos en la partida
    - bonificacion_elo (float): Bonificación ELO aplicada
    """
    # Ajustar ELO mínimo
    elo_jugador = max(elo_jugador, 1400) if elo_jugador == 0 else elo_jugador
    elo_oponente = max(elo_oponente, 1400) if elo_oponente == 0 else elo_oponente

    # Paso 1: Puntos base por resultado individual
    puntos_base = {
        'victoria': puntos_victoria,
        'tablas': puntos_tablas,
        'derrota': puntos_derrota
    }
    resultado_individual_lower = resultado_individual.lower()
    puntos_resultado = puntos_base.get(resultado_individual_lower, 0)

    # Paso 2: Bonificación por diferencia de ELO
    diferencia_elo = (elo_oponente - elo_jugador) / 50 * bonificacion_elo_factor
    bonificacion_elo = diferencia_elo if resultado_individual_lower != 'derrota' else max(-10, diferencia_elo / 3)

    # Paso 3: Bonificación por División y Tablero
    bonificacion_division_tablero = max(1, 4 - (division + tablero) / 2)
    if resultado_individual_lower == 'derrota':
        bonificacion_division_tablero /= 3

    # Paso 4: Bonificación por Resultado del Equipo
    puntos_equipo = {
        'victoria': 5,
        'empate': 2,
        'derrota': 0
    }
    resultado_equipo_lower = resultado_equipo.lower()
    bonificacion_equipo = puntos_equipo.get(resultado_equipo_lower, 0)
    if resultado_individual_lower == 'derrota':
        bonificacion_equipo /= 3

    # Puntos totales antes del ajuste por color y resultado
    puntos_totales = puntos_resultado + bonificacion_elo + bonificacion_division_tablero + bonificacion_equipo

    # Ajustar bonificaciones y puntos según el resultado
    if resultado_individual_lower == 'tablas':
        factor_negras = 1.25
        bonificacion_elo /= 2
        bonificacion_division_tablero /= 2
        bonificacion_equipo /= 2
    elif resultado_individual_lower == 'derrota':
        factor_negras = 1.0

    # Ajustar puntos por color
    if color.lower() == 'negras':
        puntos_totales *= factor_negras

    # Asegurarse de que los puntos totales no sean negativos
    puntos_totales = max(0, puntos_totales)

    return puntos_totales, bonificacion_elo


def main():
    parser = argparse.ArgumentParser(description='Calcular puntos totales y bonificación ELO para un jugador en una partida de fantasy de ajedrez.')

    # Parámetros requeridos
    parser.add_argument('--resultado_individual', type=str, choices=['victoria', 'tablas', 'derrota'],
                        help='Resultado individual de la partida: victoria, tablas, derrota.')
    parser.add_argument('--resultado_equipo', type=str, choices=['victoria', 'empate', 'derrota'],
                        help='Resultado del equipo: victoria, empate, derrota.')
    parser.add_argument('--division', type=int, choices=range(1,5),
                        help='División del jugador (1 a 4).')
    parser.add_argument('--tablero', type=int,
                        help='Número de tablero en el que juega el jugador (1 a total_tableros).')
    parser.add_argument('--total_tableros', type=int, default=6,
                        help='Número total de tableros en la división (default=6).')
    parser.add_argument('--elo_jugador', type=int,
                        help='ELO del jugador.')
    parser.add_argument('--elo_oponente', type=int,
                        help='ELO del oponente.')
    parser.add_argument('--color', type=str, choices=['blancas', 'negras'],
                        help='Color con el que juega el jugador: blancas o negras.')

    # Parámetros opcionales
    parser.add_argument('--K', type=int, default=200,
                        help='Parámetro K (default=200).')
    parser.add_argument('--puntos_victoria', type=int, default=50,
                        help='Puntos por victoria (default=50).')
    parser.add_argument('--puntos_tablas', type=int, default=25,
                        help='Puntos por tablas (default=25).')
    parser.add_argument('--puntos_derrota', type=int, default=5,
                        help='Puntos por derrota (default=5).')
    parser.add_argument('--puntos_max_tablero', type=int, default=3,
                        help='Puntos máximos por tablero (default=3).')
    parser.add_argument('--puntos_max_division', type=float, default=2.5,
                        help='Puntos máximos por división (default=2.5).')
    parser.add_argument('--bonificacion_elo_factor', type=float, default=2.0,
                        help='Factor de bonificación ELO (default=2.0).')
    parser.add_argument('--factor_negras', type=float, default=1.5,
                        help='Factor de ajuste por jugar con negras (default=1.5).')

    args = parser.parse_args()

    # Si no se proporcionan todos los argumentos requeridos, solicitar entrada interactiva
    required_args = ['resultado_individual', 'resultado_equipo', 'division', 'tablero', 'elo_jugador', 'elo_oponente', 'color']
    missing_args = [arg for arg in required_args if getattr(args, arg) is None]

    if missing_args:
        print("Faltan algunos argumentos requeridos. Ingresar los valores manualmente.\n")
        for arg in missing_args:
            if arg == 'resultado_individual':
                value = input("Resultado Individual (victoria/tablas/derrota): ").strip().lower()
                while value not in ['victoria', 'tablas', 'derrota']:
                    value = input("Valor inválido. Resultado Individual (victoria/tablas/derrota): ").strip().lower()
                setattr(args, arg, value)
            elif arg == 'resultado_equipo':
                value = input("Resultado del Equipo (victoria/empate/derrota): ").strip().lower()
                while value not in ['victoria', 'empate', 'derrota']:
                    value = input("Valor inválido. Resultado del Equipo (victoria/empate/derrota): ").strip().lower()
                setattr(args, arg, value)
            elif arg == 'division':
                value = input("División del Jugador (1-4): ").strip()
                while not value.isdigit() or int(value) not in range(1,5):
                    value = input("Valor inválido. División del Jugador (1-4): ").strip()
                setattr(args, arg, int(value))
            elif arg == 'tablero':
                value = input(f"Número de Tablero (1-{args.total_tableros}): ").strip()
                while not value.isdigit() or int(value) not in range(1, args.total_tableros + 1):
                    value = input(f"Valor inválido. Número de Tablero (1-{args.total_tableros}): ").strip()
                setattr(args, arg, int(value))
            elif arg == 'elo_jugador':
                value = input("ELO del Jugador: ").strip()
                while not value.isdigit() or int(value) < 1000 or int(value) > 3000:
                    value = input("Valor inválido. ELO del Jugador (1000-3000): ").strip()
                setattr(args, arg, int(value))
            elif arg == 'elo_oponente':
                value = input("ELO del Oponente: ").strip()
                while not value.isdigit() or int(value) < 1000 or int(value) > 3000:
                    value = input("Valor inválido. ELO del Oponente (1000-3000): ").strip()
                setattr(args, arg, int(value))
            elif arg == 'color':
                value = input("Color del Jugador (blancas/negras): ").strip().lower()
                while value not in ['blancas', 'negras']:
                    value = input("Valor inválido. Color del Jugador (blancas/negras): ").strip().lower()
                setattr(args, arg, value)

    # Validar que el tablero no exceda el total_tableros
    if args.tablero < 1 or args.tablero > args.total_tableros:
        print(f"\nError: El tablero debe estar entre 1 y {args.total_tableros}.")
        sys.exit(1)

    # Calcular los puntos
    puntos_totales, bonificacion_elo = calcular_puntos(
        resultado_individual=args.resultado_individual,
        resultado_equipo=args.resultado_equipo,
        division=args.division,
        tablero=args.tablero,
        total_tableros=args.total_tableros,
        elo_jugador=args.elo_jugador,
        elo_oponente=args.elo_oponente,
        color=args.color,
        K=args.K,
        puntos_victoria=args.puntos_victoria,
        puntos_tablas=args.puntos_tablas,
        puntos_derrota=args.puntos_derrota,
        puntos_max_tablero=args.puntos_max_tablero,
        puntos_max_division=args.puntos_max_division,
        bonificacion_elo_factor=args.bonificacion_elo_factor,
        factor_negras=args.factor_negras
    )

    # Mostrar los resultados
    print("\n--- Resultados ---")
    print(f"Puntos Totales: {puntos_totales:.2f}")
    print(f"Bonificación ELO: {bonificacion_elo:.2f}")


if __name__ == "__main__":
    main()