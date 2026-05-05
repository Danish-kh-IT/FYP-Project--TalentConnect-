import os
import MySQLdb
from decouple import config

# Load settings from .env
# Ensure we are reading from the correct path if needed, but decouple usually handles it if .env is in CWD
print(f"Loading configuration from .env in {os.getcwd()}")
DB_NAME = config('DB_NAME', default='nokri_clone_db')
DB_USER = config('DB_USER', default='root')
DB_PASSWORD = config('DB_PASSWORD', default='')
DB_HOST = config('DB_HOST', default='localhost')
DB_PORT = config('DB_PORT', default=3306, cast=int)

print(f"Connecting to MySQL host: {DB_HOST} as user: {DB_USER}...")

try:
    # Connect to MySQL Server (not the specific DB yet)
    db = MySQLdb.connect(host=DB_HOST, user=DB_USER, passwd=DB_PASSWORD, port=DB_PORT)
    cursor = db.cursor()
    
    print(f"Dropping database {DB_NAME} if it exists...")
    cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
    
    print(f"Creating database {DB_NAME}...")
    cursor.execute(f"CREATE DATABASE {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    
    print("Database reset successfully!")
    db.close()
except Exception as e:
    print(f"Error resetting database: {e}")
    exit(1)
