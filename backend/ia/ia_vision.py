"""
NutriTrip Meal Scanner — uses GPT-4o vision to identify meals and estimate macros.
Receives JSON via stdin, returns JSON via stdout.

Input:  { "image": "base64...", "mealType": "lunch" }
Output: { "name": "...", "calories": 450, "protein": 30, "carbs": 50, "fat": 15, "description": "..." }
"""
from openai import OpenAI
import sys
import os
import json
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(script_dir, ".env"))

MINHA_CHAVE = os.getenv("OPENAI_API_KEY")
if not MINHA_CHAVE:
    print(json.dumps({"error": "OPENAI_API_KEY not found in .env"}))
    sys.exit(1)

client = OpenAI(api_key=MINHA_CHAVE)
MODEL = "gpt-4o-mini"

SCAN_PROMPT = """You are a nutrition analysis AI. Analyze the food in this image and respond ONLY with a valid JSON object (no markdown, no code fences, just raw JSON).

The JSON must have exactly these fields:
{
  "name": "Name of the dish/meal",
  "description": "Brief 1-sentence description of what you see",
  "calories": <estimated total kcal as integer>,
  "protein": <estimated grams of protein as integer>,
  "carbs": <estimated grams of carbohydrates as integer>,
  "fat": <estimated grams of fat as integer>,
  "confidence": "<low|medium|high> - how confident you are in the estimate",
  "items": ["item1", "item2"] 
}

Rules:
- Estimate based on a typical serving size visible in the photo
- If you cannot identify the food, set name to "Unknown" and all macros to 0
- Be realistic with estimates — round to nearest 5 for calories, nearest integer for macros
- The "items" array should list individual food components you can identify
- Respond in English"""


def scan_meal(data):
    image_base64 = data.get("image", "")
    meal_type = data.get("mealType", "meal")

    if not image_base64:
        return {"error": "Image is required"}

    # Strip data URL prefix if present
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SCAN_PROMPT,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Analyze this {meal_type} photo and estimate the nutritional content.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                                "detail": "low",
                            },
                        },
                    ],
                },
            ],
            max_tokens=500,
        )

        raw = response.choices[0].message.content.strip()

        # Try to extract JSON if wrapped in code fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        result = json.loads(raw)
        return result

    except json.JSONDecodeError:
        return {"error": "AI returned invalid JSON", "raw": raw}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    try:
        raw = sys.stdin.read()
        data = json.loads(raw)
        result = scan_meal(data)
        print(json.dumps(result, ensure_ascii=False))
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
