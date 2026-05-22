import requests, os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("LLM_API_KEY")
base_url = os.getenv("LLM_BASE_URL", "https://go.fastrouter.ai/api/v1")

headers = {
    "Authorization": f"Bearer {api_key}"
}

print(f"Requesting models from {base_url}/models...")
try:
    response = requests.get(f"{base_url}/models", headers=headers)
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        models = [m["id"] for m in data.get("data", [])]
        print(f"Authorized Models ({len(models)}):")
        for m in sorted(models):
            print(f"  - {m}")
    else:
        print("Error Response:", response.text)
except Exception as e:
    print("Exception:", e)
