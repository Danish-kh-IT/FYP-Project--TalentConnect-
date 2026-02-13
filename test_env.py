from decouple import config
import os

print(f"Current Working Directory: {os.getcwd()}")
print(f"Checking for .env file: {os.path.exists('.env')}")

db_user = config('DB_USER', default='NOT_FOUND')
db_password = config('DB_PASSWORD', default='NOT_FOUND')

print(f"DB_USER from env: {db_user}")
# Mask password for security in logs, but check if it's empty
if db_password == 'NOT_FOUND':
    print("DB_PASSWORD: NOT_FOUND (env file not read or key missing)")
elif db_password == '':
    print("DB_PASSWORD: <EMPTY_STRING> (User has not set a password)")
else:
    print("DB_PASSWORD: ***** (Password is set)")
