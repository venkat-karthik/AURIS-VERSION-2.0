import os
import sys

# Attempt to load .env manually if dotenv is not installed
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key not in os.environ:
                        os.environ[key] = val

load_env_file()

from sarvamai import SarvamAI

api_key = os.environ.get("SARVAM_API_KEY", "").strip()
if not api_key:
    print("Error: SARVAM_API_KEY is not set in environment or .env file.", file=sys.stderr)
    sys.exit(1)

client = SarvamAI(api_subscription_key=api_key)

response = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[
        {"role": "user", "content": "నమస్కారం! మీరు ఎవరు?"}
    ]
)

if response and response.choices:
    print("Sarvam AI Response:")
    print(response.choices[0].message.content)
else:
    print("No response choices returned:", response)
