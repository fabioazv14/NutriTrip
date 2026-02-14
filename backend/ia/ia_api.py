"""
NutriTrip AI Chat — called by the Node.js backend.
Receives JSON via stdin, returns JSON via stdout.

Input:  { "message": "...", "history": [...], "systemPrompt": "..." }
Output: { "response": "..." }  or  { "error": "..." }
"""
from openai import OpenAI
# from google import genai
# from google.genai import types
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

# --- Gemini ---
# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
# MODEL = "gemini-2.0-flash"

# --- OpenAI ---
client = OpenAI(api_key=MINHA_CHAVE)
MODEL = "gpt-4o-mini"


def chat(data):
    message = data.get("message", "")
    history = data.get("history", [])
    system_prompt = data.get("systemPrompt", "")

    if not message:
        return {"error": "Message is required"}

    # --- OpenAI format ---
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
        )
        resposta = response.choices[0].message.content
        return {"response": resposta}

    # --- Gemini format ---
    # contents = []
    # for msg in history:
    #     role = "user" if msg["role"] == "user" else "model"
    #     contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))
    # contents.append(types.Content(role="user", parts=[types.Part(text=message)]))
    # try:
    #     config = types.GenerateContentConfig(
    #         system_instruction=system_prompt if system_prompt else None,
    #     )
    #     response = client.models.generate_content(
    #         model=MODEL,
    #         contents=contents,
    #         config=config,
    #     )
    #     resposta = response.text
    #     return {"response": resposta}

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
