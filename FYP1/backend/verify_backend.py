import requests

try:
    response = requests.get('http://127.0.0.1:8000/api/jobs/listings/')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    if response.status_code == 200:
        print("Backend is responding correctly!")
    else:
        print("Backend returned an error.")
except Exception as e:
    print(f"Failed to connect to backend: {e}")
