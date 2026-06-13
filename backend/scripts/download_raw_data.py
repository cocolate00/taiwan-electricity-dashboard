import os
import urllib.request
import json

# Define URLs for the Bureau of Energy API
URLS = {
    "supply_demand.json": "https://ea01.moeaea.gov.tw/a0303/02/api/v1/zone/monthly/3/1",
    "generation.json": "https://ea01.moeaea.gov.tw/a0303/02/api/v1/zone/monthly/3/2",
    "consumption.json": "https://ea01.moeaea.gov.tw/a0303/02/api/v1/zone/monthly/3/4"
}

# Define raw data storage directory
RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
os.makedirs(RAW_DATA_DIR, exist_ok=True)

def download_file(filename, url):
    target_path = os.path.join(RAW_DATA_DIR, filename)
    print(f"Downloading {url} to {target_path}...")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            with open(target_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully downloaded {filename}.")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")

if __name__ == "__main__":
    for filename, url in URLS.items():
        download_file(filename, url)
