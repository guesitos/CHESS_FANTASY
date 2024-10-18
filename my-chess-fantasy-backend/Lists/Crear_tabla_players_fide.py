# Lists/Crear_tabla_players_fide.py

import xml.etree.ElementTree as ET
import mysql.connector
import os
import sys
import requests
import zipfile
import logging
from dotenv import load_dotenv

# Configurar el logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s [%(levelname)s]: %(message)s')
logger = logging.getLogger(__name__)

# Determinar la ruta base del proyecto (asumiendo que este script está en la carpeta 'Lists')
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Especificar la ruta al archivo .env
ENV_PATH = os.path.join(BASE_DIR, '.env')

# Cargar las variables de entorno desde el archivo .env
load_dotenv(dotenv_path=ENV_PATH)

def normalize_string(s):
    import unicodedata
    return ''.join(
        c for c in unicodedata.normalize('NFD', s)
        if unicodedata.category(c) != 'Mn'
    ).upper().replace('-', ' ').replace("'", '').strip()

def download_and_extract_xml():
    url = 'https://ratings.fide.com/download/players_list_xml.zip'
    zip_path = os.path.join(os.path.dirname(__file__), 'players_list_xml_foa.zip')  # Guardar en 'Lists' o 'scheduler' según corresponda
    xml_filename = 'players_list_xml_foa.xml'
    xml_path = os.path.join(os.path.dirname(__file__), xml_filename)  # Ruta completa al XML

    # Eliminar el archivo XML anterior si existe
    if os.path.exists(xml_path):
        os.remove(xml_path)
        logger.info(f"Archivo anterior '{xml_filename}' eliminado.")

    # Descargar el archivo ZIP
    try:
        logger.info(f"Iniciando la descarga del archivo ZIP desde {url}...")
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        with open(zip_path, 'wb') as file:
            file.write(response.content)
        logger.info(f"Archivo '{zip_path}' descargado.")

        # Extraer el archivo XML del ZIP
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extract(xml_filename, os.path.dirname(zip_path))
        logger.info(f"Archivo '{xml_filename}' extraído del ZIP.")

        # Eliminar el archivo ZIP
        os.remove(zip_path)
        logger.info(f"Archivo ZIP '{zip_path}' eliminado.")
    except requests.RequestException as e:
        logger.error(f"Error al descargar el archivo: {e}")
        sys.exit(1)

def main():
    logger.info("Iniciando el proceso principal...")
    # Descargar y extraer el archivo XML
    download_and_extract_xml()

    # Obtener la configuración de la base de datos desde variables de entorno
    host = os.getenv('DB_CHESS_HOST', 'localhost')
    user = os.getenv('DB_CHESS_USER', 'chess_user')
    password = os.getenv('DB_CHESS_PASSWORD')
    database = os.getenv('DB_CHESS_NAME', 'chess_players_db')
    port = int(os.getenv('DB_CHESS_PORT', 3306))

    logger.debug(f"Configuración de la base de datos: host={host}, user={user}, database={database}, port={port}")

    if not password:
        logger.error('La variable de entorno DB_CHESS_PASSWORD no está definida.')
        sys.exit(1)

    # Conectar a la base de datos MySQL
    try:
        logger.info("Intentando conectar a la base de datos MySQL...")
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port
        )
        logger.info("Conexión a la base de datos MySQL exitosa.")
    except mysql.connector.Error as err:
        logger.error(f"Error al conectar a la base de datos: {err}")
        sys.exit(1)

    cursor = conn.cursor()

    # Crear la tabla fide_players si no existe
    logger.info("Creando/verificando la existencia de la tabla 'fide_players'...")
    create_table_query = '''
    CREATE TABLE IF NOT EXISTS fide_players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        first_name_normalized VARCHAR(255) NOT NULL,
        last_name_normalized VARCHAR(255) NOT NULL,
        fide_id VARCHAR(50) UNIQUE NOT NULL
    )
    '''
    cursor.execute(create_table_query)
    conn.commit()
    logger.info("Tabla 'fide_players' creada o verificada con éxito.")

    # Procesar el archivo XML usando iterparse
    players_data = []
    chunk_size = 1000

    xml_path = os.path.join(os.path.dirname(__file__), 'players_list_xml_foa.xml')

    try:
        logger.info("Iniciando el procesamiento del archivo XML...")
        context = ET.iterparse(xml_path, events=('end',))
        for event, elem in context:
            if elem.tag == 'player':
                fideid_text = elem.find('fideid').text
                name = elem.find('name').text

                logger.debug(f"Procesando jugador con FIDE ID: {fideid_text} y nombre: {name}")

                if fideid_text and name:
                    fide_id = fideid_text.strip()

                    # Procesar nombres
                    first_name = ''
                    last_name = ''

                    if ',' in name:
                        last_name, first_name = [part.strip() for part in name.split(',', 1)]
                    else:
                        name_parts = name.strip().split(' ')
                        if len(name_parts) > 1:
                            first_name = ' '.join(name_parts[:-1])
                            last_name = name_parts[-1]
                        else:
                            first_name = name_parts[0]
                            last_name = 'Desconocido'

                    # Asignar valores por defecto si están vacíos
                    first_name = first_name or 'Desconocido'
                    last_name = last_name or 'Desconocido'

                    # Normalizar nombres
                    first_name_normalized = normalize_string(first_name)
                    last_name_normalized = normalize_string(last_name)

                    players_data.append((
                        first_name, last_name,
                        first_name_normalized, last_name_normalized, fide_id
                    ))

                    # Insertar en la base de datos en chunks
                    if len(players_data) >= chunk_size:
                        logger.info(f"Insertando un chunk de {len(players_data)} jugadores en la base de datos...")
                        insert_data(cursor, players_data)
                        conn.commit()
                        players_data = []

                elem.clear()  # Liberar memoria
        logger.info("Procesamiento del archivo XML completado.")
    except FileNotFoundError:
        logger.error(f"El archivo '{xml_path}' no se encontró.")
        sys.exit(1)
    except ET.ParseError as e:
        logger.error(f"Error al parsear el archivo XML: {e}")
        sys.exit(1)

    # Insertar los datos restantes
    if players_data:
        logger.info(f"Insertando los últimos {len(players_data)} jugadores en la base de datos...")
        insert_data(cursor, players_data)
        conn.commit()

    logger.info("Procesamiento completado.")

    cursor.close()
    conn.close()
    logger.info("Conexión a la base de datos cerrada.")

def insert_data(cursor, data):
    insert_query = '''
    INSERT INTO fide_players
    (first_name, last_name, first_name_normalized, last_name_normalized, fide_id)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        first_name_normalized = VALUES(first_name_normalized),
        last_name_normalized = VALUES(last_name_normalized)
    '''
    try:
        logger.info(f"Insertando {len(data)} registros en la base de datos...")
        cursor.executemany(insert_query, data)
        logger.info(f"Se han insertado/actualizado {cursor.rowcount} registros en la tabla 'fide_players'.")
    except mysql.connector.Error as err:
        logger.error(f"Error al insertar datos: {err}")

if __name__ == '__main__':
    main()
    