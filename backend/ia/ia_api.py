"""
NutriTrip AI Chat — called by the Node.js backend.
Receives JSON via stdin, returns JSON via stdout.

Input:  { "message": "...", "history": [...], "systemPrompt": "..." }
Output: { "response": "..." }  or  { "error": "..." }
"""
from openai import OpenAI
import sys
import os
import json
from dotenv import load_dotenv

# Load .env from the same directory as this script
script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(script_dir, ".env"))

MINHA_CHAVE = os.getenv("OPENAI_API_KEY")
if not MINHA_CHAVE:
    print(json.dumps({"error": "OPENAI_API_KEY not found in .env"}))
    sys.exit(1)

client = OpenAI(api_key=MINHA_CHAVE)


def chat(data):
    message = data.get("message", "")
    history = data.get("history", [])
    system_prompt = data.get("systemPrompt", "")

    if not message:
        return {"error": "Message is required"}

    # Build messages list
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    # Add conversation history
    messages.extend(history)

    # Add current user message
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model="gpt-5-chat-latest",
            messages=messages
        )

        resposta = response.choices[0].message.content
        return {"response": resposta}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    try:
        # Read JSON from stdin
        raw = sys.stdin.read()
        data = json.loads(raw)
        result = chat(data)
        print(json.dumps(result, ensure_ascii=False))
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
