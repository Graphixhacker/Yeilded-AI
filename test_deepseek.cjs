require('dotenv').config();

async function test() {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  console.log("Key length:", deepseekKey ? deepseekKey.length : 0);
  
  const payload = {
    model: 'deepseek-chat', 
    messages: [{role: 'user', content: 'hello'}],
    temperature: 0.7,
    max_tokens: 2000,
    stream: false
  };
  
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${deepseekKey}`
    },
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Body:", text);
}
test();
