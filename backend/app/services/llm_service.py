import os
import google.generativeai as genai

class LLMService:
    """
    負責封裝 Google Gemini 大語言模型，用於生成結構化的繁體中文 AI 回答。
    使用 google-generativeai 穩定版 SDK。
    """
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    def generate_answer(self, prompt: str, system_instruction: str = None) -> str:
        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"❌ [LLMService] 生成回答失敗: {str(e)}")
            return f"呼叫 Gemini AI 服務時發生錯誤：{str(e)}"
