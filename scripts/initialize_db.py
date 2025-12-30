
import sys
import os
import mysql.connector
from mysql.connector import Error

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import config

def create_database_and_tables():

    try:
        conn = mysql.connector.connect(
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD
        )
        cursor = conn.cursor()
        
        print(f"Creating database '{config.DB_NAME}' if it doesn't exist...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {config.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("Database created or already exists.")
        
        cursor.execute(f"USE {config.DB_NAME}")
        
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r') as f:
            sql_script = f.read()
        
        print("Executing schema.sql to create tables and indexes...")
        for statement in sql_script.split(';'):
            if statement.strip():
                try:
                    cursor.execute(statement)
                except Error as e:
                    print(f"Failed to execute statement: {statement.strip()}\nError: {e}")

        print("Database tables and indexes created successfully.")
        
    except Error as e:
        print(f"Error connecting to MySQL or setting up database: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    print("--- Database Initializer ---")
    confirm = input(
        f"This will create/update tables in the database '{config.DB_NAME}' "
        f"on host '{config.DB_HOST}'.\nAre you sure you want to continue? (y/n): "
    )
    if confirm.lower() == 'y':
        create_database_and_tables()
    else:
        print("Initialization cancelled.")