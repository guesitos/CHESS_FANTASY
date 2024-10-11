# Calcula Puntos para Fantasy de Ajedrez

Este archivo proporciona una breve explicación sobre cómo funciona el script `calcula_puntos.py`, que calcula los puntos totales y la bonificación de ELO para un jugador en un sistema de fantasy de ajedrez. Este README está diseñado para que cualquier persona sin conocimiento previo del código pueda entender cómo funciona.

## Descripción General

El script `calcula_puntos.py` está diseñado para calcular los puntos obtenidos por un jugador después de una partida de ajedrez en el contexto de una liga de fantasy de ajedrez. Los puntos se basan en el resultado individual del jugador, el resultado de su equipo, y ciertos factores como la división y el tablero en el que juega. También considera bonificaciones por la diferencia de ELO entre el jugador y su oponente, así como el color con el que jugó (blancas o negras).

## ¿Qué Hace el Script?

El script realiza lo siguiente:

1. **Toma entradas relacionadas con la partida de ajedrez**: incluyendo resultados individuales, resultados del equipo, información sobre el jugador y su oponente, y otros parámetros que influyen en la puntuación.
2. **Calcula los puntos totales del jugador** basados en varios factores, que se describen a continuación.
3. **Retorna los puntos totales y la bonificación ELO** aplicados al jugador.

## Cómo Utilizar el Script

El script se ejecuta a través de la línea de comandos y requiere que proporciones ciertos parámetros. Estos parámetros incluyen información sobre el resultado de la partida y otros detalles necesarios para calcular la puntuación del jugador.

Ejemplo de ejecución del script:

```sh
python3 calcula_puntos.py --resultado_individual victoria --resultado_equipo victoria --division 2 --tablero 4 --elo_jugador 1900 --elo_oponente 1500 --color blancas
```

### Parámetros Requeridos

- `--resultado_individual`: Resultado individual de la partida. Puede ser `victoria`, `tablas` o `derrota`.
- `--resultado_equipo`: Resultado del equipo. Puede ser `victoria`, `empate` o `derrota`.
- `--division`: División en la que juega el jugador (entre 1 y 4).
- `--tablero`: Número del tablero en el que juega el jugador.
- `--elo_jugador`: ELO del jugador.
- `--elo_oponente`: ELO del oponente.
- `--color`: Color con el que juega el jugador (`blancas` o `negras`).

### Parámetros Opcionales

- `--K`: Parámetro K para el cálculo del ELO (default=200).
- `--puntos_victoria`: Puntos por victoria (default=50).
- `--puntos_tablas`: Puntos por tablas (default=25).
- `--puntos_derrota`: Puntos por derrota (default=5).
- `--factor_negras`: Factor de ajuste por jugar con negras (default=1.5).

## Cómo Funciona el Cálculo de Puntos

El cálculo de los puntos se realiza en varias etapas. A continuación se explica cada una de estas etapas de forma sencilla:

1. **Puntos Base por Resultado Individual**
    - Cada resultado tiene un valor predeterminado:
      - **Victoria**: 50 puntos.
      - **Tablas**: 25 puntos.
      - **Derrota**: 5 puntos.

2. **Bonificación por Diferencia de ELO**
    - Se otorgan puntos adicionales (o se restan) dependiendo de la diferencia de ELO entre el jugador y su oponente. Si el oponente tiene un ELO más alto, el jugador puede ganar más puntos y viceversa.
    - En caso de derrota, esta bonificación se reduce significativamente.

3. **Bonificación por División y Tablero**
    - Los jugadores en divisiones más bajas (números más altos) o que juegan en tableros menos destacados pueden recibir una bonificación menor. Esto se ajusta para equilibrar la dificultad.
    - En caso de derrota, esta bonificación se reduce.

4. **Bonificación por Resultado del Equipo**
    - Si el equipo del jugador gana o empata, el jugador recibe puntos adicionales:
      - **Victoria del equipo**: 5 puntos.
      - **Empate del equipo**: 2 puntos.
      - **Derrota del equipo**: 0 puntos.
    - En caso de derrota del jugador, esta bonificación se reduce.

5. **Ajuste por Color**
    - Jugar con **negras** es generalmente considerado más difícil que jugar con **blancas**. Por lo tanto, se aplica un multiplicador de 1.5 a los puntos totales si el jugador jugó con negras.
    - Este multiplicador se reduce a 1.25 en caso de tablas y no se aplica en caso de derrota.

## Ejemplo de Resultado

Si ejecutamos el siguiente comando:

```sh
python3 calcula_puntos.py --resultado_individual tablas --resultado_equipo victoria --division 2 --tablero 4 --elo_jugador 1900 --elo_oponente 1500 --color blancas
```

El script calcula los puntos del jugador con base en los parámetros dados y mostrará un resultado similar al siguiente:

```
--- Resultados ---
Puntos Totales: 40.00
Bonificación ELO: -8.00
```

## Estructura del Código

El archivo principal tiene dos secciones importantes:

1. **Función `calcular_puntos`**: Esta función realiza todo el cálculo de los puntos, basándose en las entradas proporcionadas.
2. **Función `main`**: Esta función maneja la entrada de argumentos y llama a `calcular_puntos` para obtener los resultados.

### Ejemplo de Código

```python
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
    bonificacion_elo_factor=args.bonificacion_elo_factor,
    factor_negras=args.factor_negras
)
```

## Requisitos para Ejecutar el Script

- Python 3.x
- Biblioteca `argparse` (incluida en la biblioteca estándar de Python)

## Notas Finales

Este script proporciona un sistema flexible para calcular la puntuación de los jugadores en un sistema de fantasy de ajedrez, teniendo en cuenta diferentes factores para simular de la manera más justa posible las contribuciones de cada jugador a su equipo y su rendimiento individual.

Esperamos que esta guía te sea útil para comprender cómo funciona el sistema de puntos y puedas modificarlo según sea necesario para tu liga de fantasy de ajedrez. ¡Diviértete jugando y administrando tu liga!