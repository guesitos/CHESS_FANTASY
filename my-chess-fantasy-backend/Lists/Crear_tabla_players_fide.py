import xml.etree.ElementTree as ET
import mysql.connector
import os
import sys
import requests
import zipfile
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

def normalize_string(s):
    import unicodedata
    return ''.join(
        c for c in unicodedata.normalize('NFD', s)
        if unicodedata.category(c) != 'Mn'
    ).upper().replace('-', ' ').replace("'", '').strip()

def check_player_existence(cursor, first_name, last_name):
    # Normaliza los nombres para la comparación
    first_name_normalized = normalize_string(first_name)
    last_name_normalized = normalize_string(last_name)

    query = '''
    SELECT * FROM fide_players 
    WHERE first_name_normalized = %s 
      AND last_name_normalized = %s
    '''
    cursor.execute(query, (first_name_normalized, last_name_normalized))
    results = cursor.fetchall()

    if results:
        print(f"Jugador ya existe: {first_name} {last_name}")
    else:
        print(f"No se encontró el jugador: {first_name} {last_name}")

    return results

def download_and_extract_xml():
    url = 'https://ratings.fide.com/download/players_list_xml_foa.zip'
    zip_path = 'players_list_xml_foa.zip'
    xml_filename = 'players_list_xml_foa.xml'

    # Eliminar el archivo XML anterior si existe
    if os.path.exists(xml_filename):
        os.remove(xml_filename)
        print(f"Archivo anterior '{xml_filename}' eliminado.")

    # Descargar el archivo ZIP
    response = requests.get(url)
    if response.status_code == 200:
        with open(zip_path, 'wb') as file:
            file.write(response.content)
        print(f"Archivo '{zip_path}' descargado.")

        # Extraer el archivo XML del ZIP
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extract(xml_filename)
        print(f"Archivo '{xml_filename}' extraído del ZIP.")

        # Eliminar el archivo ZIP
        os.remove(zip_path)
    else:
        print(f"Error al descargar el archivo: {response.status_code}")
        sys.exit(1)

def main():
    # Descargar y extraer el archivo XML
    download_and_extract_xml()

    # Obtener la configuración de la base de datos desde variables de entorno
    host = os.getenv('DB_CHESS_HOST', 'localhost')
    user = os.getenv('DB_CHESS_USER', 'chess_user')
    password = os.getenv('DB_PASSWORD')
    database = os.getenv('DB_CHESS_NAME', 'chess_players_db')
    port = int(os.getenv('DB_CHESS_PORT', 3306))

    if not password:
        print('La variable de entorno DB_CHESS_PASSWORD no está definida.')
        sys.exit(1)

    # Conectar a la base de datos MySQL
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port
        )
    except mysql.connector.Error as err:
        print(f"Error al conectar a la base de datos: {err}")
        sys.exit(1)

    cursor = conn.cursor()

    # Crear la tabla fide_players si no existe
    create_table_query = '''
    CREATE TABLE IF NOT EXISTS fide_players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        license_number VARCHAR(50) NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        first_name_normalized VARCHAR(255) NOT NULL,
        last_name_normalized VARCHAR(255) NOT NULL,
        fide_id VARCHAR(50) UNIQUE NOT NULL
    )
    '''
    cursor.execute(create_table_query)
    conn.commit()

    # Procesar el archivo XML usando iterparse
    players_data = []
    chunk_size = 1000
    fide_ids_set = set()

    try:
        context = ET.iterparse('players_list_xml_foa.xml', events=('end',))
        for event, elem in context:
            if elem.tag == 'player':
                fideid_text = elem.find('fideid').text
                name = elem.find('name').text

                if fideid_text and name:
                    fide_id = fideid_text.strip()
                    if fide_id in fide_ids_set:
                        print(f"FIDE ID duplicado encontrado: {fide_id}")
                        elem.clear()
                        continue
                    else:
                        fide_ids_set.add(fide_id)

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

                    # Verificar si el jugador ya existe
                    if check_player_existence(cursor, first_name, last_name):
                        continue  # Si existe, no lo añadimos a la lista

                    # Normalizar nombres
                    first_name_normalized = normalize_string(first_name)
                    last_name_normalized = normalize_string(last_name)

                    license_number = None  # No tenemos este dato

                    players_data.append((
                        license_number, first_name, last_name,
                        first_name_normalized, last_name_normalized, fide_id
                    ))

                    # Insertar en la base de datos en chunks
                    if len(players_data) >= chunk_size:
                        insert_data(cursor, players_data)
                        conn.commit()
                        players_data = []
                        fide_ids_set.clear()

                elem.clear()  # Liberar memoria
    except FileNotFoundError:
        print("El archivo 'players_list_xml_foa.xml' no se encontró.")
        sys.exit(1)
    except ET.ParseError as e:
        print(f"Error al parsear el archivo XML: {e}")
        sys.exit(1)

    # Insertar los datos restantes
    if players_data:
        insert_data(cursor, players_data)
        conn.commit()

    print("Procesamiento completado.")

    cursor.close()
    conn.close()

def insert_data(cursor, data):
    insert_query = '''
    INSERT INTO fide_players
    (license_number, first_name, last_name, first_name_normalized, last_name_normalized, fide_id)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        first_name_normalized = VALUES(first_name_normalized),
        last_name_normalized = VALUES(last_name_normalized)
    '''
    try:
        cursor.executemany(insert_query, data)
        print(f"Se han insertado/actualizado {cursor.rowcount} registros en la tabla 'fide_players'.")
    except mysql.connector.Error as err:
        print(f"Error al insertar datos: {err}")

if __name__ == '__main__':
    main()