import re

router_path = "server/apiRouter.ts"
with open(router_path, "r") as f:
    router = f.read()

# Add import for callDeepSeekChat
if "callDeepSeekChat" not in router:
    router = router.replace("callDeepSeekOrFallback } from './aiService.ts';", "callDeepSeekOrFallback, callDeepSeekChat } from './aiService.ts';")

chat_route = """
// --- CHATBOT ENDPOINT ---
apiRouter.post('/chat', authenticate, async (req: any, res: any) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    // Check if user is authenticated (can be optional or required based on tier)
    // We will allow anyone to chat, or you can restrict. Let's allow but maybe rate limit later.
    const reply = await callDeepSeekChat(messages);
    res.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});
"""

router = router.replace("// --- AUTH ENDPOINTS ---", chat_route + "\n// --- AUTH ENDPOINTS ---")

with open(router_path, "w") as f:
    f.write(router)

print("Added /api/chat route")
