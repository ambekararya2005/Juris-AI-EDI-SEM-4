# backend/scripts/test_llm.py
import asyncio, sys
sys.path.insert(0, ".")
from app.services.llm import chat

async def main():
    from app.core.config import settings
    print("Loaded Settings:")
    print("  LLM_API_KEY:", settings.LLM_API_KEY[:10] + "..." if settings.LLM_API_KEY else "None")
    print("  LLM_BASE_URL:", settings.LLM_BASE_URL)
    print("  LLM_MODEL:", settings.LLM_MODEL)
    
    response = await chat([{
        "role": "user",
        "content": "Write a one-line court heading for Pune Sessions Court, Maharashtra."
    }])
    print("[OK] FastRouter connected!")
    print("Response:", response)

asyncio.run(main())
