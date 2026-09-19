import re

ai_path = "server/aiService.ts"
with open(ai_path, "r") as f:
    content = f.read()

chat_function = """
export async function callDeepSeekChat(
  messages: Array<{role: 'system' | 'user' | 'assistant', content: string}>,
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // 1. Try DeepSeek
  if (deepseekKey && deepseekKey !== 'MY_DEEPSEEK_API_KEY') {
    try {
      const payload: any = {
        model: 'deepseek-v4.1-flash',
        messages: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        stream: false
      };
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json() as DeepSeekChatResponse;
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
      } else {
        const errText = await response.text();
        console.warn('DeepSeek Chat API error:', response.status, errText);
      }
    } catch (e) {
      console.warn('DeepSeek Chat fetch failed:', e);
    }
  }

  // 2. Fallback to Gemini
  if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      // Convert messages to Gemini format (system goes first as instructions, others as history)
      const systemMsgs = messages.filter(m => m.role === 'system').map(m => m.content).join('\\n');
      const historyMsgs = messages.filter(m => m.role !== 'system');
      
      let contents = [];
      for (const msg of historyMsgs) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
      
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemMsgs || "You are a helpful AI assistant.",
          temperature: options.temperature ?? 0.7,
        }
      });
      if (geminiResponse.text) {
        return geminiResponse.text;
      }
    } catch (e) {
      console.warn('Gemini Chat Fallback failed:', e);
    }
  }

  // 3. Mock fallback
  return "I am a helpful AI assistant. I am currently running in offline mock mode since API keys are missing. How can I help you today?";
}
"""

content = content.replace("export async function callDeepSeekOrFallback(", chat_function + "\nexport async function callDeepSeekOrFallback(")

with open(ai_path, "w") as f:
    f.write(content)

print("Added callDeepSeekChat")
