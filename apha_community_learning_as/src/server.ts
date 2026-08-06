import * as dotenv from 'dotenv';
dotenv.config();

process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "qwiklabs-gcp-04-a63326fe2771";
process.env.GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

import express from 'express';
import {
  InMemoryRunner,
  InMemorySessionService,
  VertexAiMemoryBankService,
  InMemoryArtifactService
} from '@google/adk';
import { rootAgent, MEMORY_BANK_ID, PROJECT_ID, LOCATION } from './agent';

console.log('Initializing APHA Assistant with Vertex AI Memory Bank Service...');
console.log(`Project: ${PROJECT_ID}, Location: ${LOCATION}, Memory Bank ID: ${MEMORY_BANK_ID}`);

export const memoryService = new VertexAiMemoryBankService({
  projectId: PROJECT_ID,
  location: LOCATION,
  agentEngineId: MEMORY_BANK_ID,
});

export const sessionService = new InMemorySessionService();
export const artifactService = new InMemoryArtifactService();

export const runner = new InMemoryRunner({
  agent: rootAgent,
  sessionService,
  memoryService,
  artifactService,
});

export const app = express();
app.use(express.json());

const HTML_UI = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APHA Community & Learning Assistant</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
    body { background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .chat-container { width: 100%; max-width: 800px; height: 90vh; background: #1e293b; border-radius: 16px; border: 1px solid #334155; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #0284c7, #2563eb); padding: 20px; text-align: center; }
    .header h1 { font-size: 1.5rem; font-weight: 600; color: #fff; }
    .header p { font-size: 0.875rem; color: #e0f2fe; opacity: 0.9; margin-top: 4px; }
    .messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
    .message { max-width: 80%; padding: 12px 16px; border-radius: 12px; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap; }
    .message.user { align-self: flex-end; background: #2563eb; color: #fff; border-bottom-right-radius: 2px; }
    .message.agent { align-self: flex-start; background: #334155; color: #f8fafc; border-bottom-left-radius: 2px; border: 1px solid #475569; }
    .input-area { padding: 16px; background: #0f172a; border-top: 1px solid #334155; display: flex; gap: 12px; }
    input { flex: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #fff; font-size: 0.95rem; outline: none; }
    input:focus { border-color: #38bdf8; }
    button { padding: 12px 24px; border-radius: 8px; border: none; background: #0284c7; color: #fff; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="header">
      <h1>American Pranic Healing Association</h1>
      <p>Community & Learning Assistant (pranichealing.us)</p>
    </div>
    <div class="messages" id="messages">
      <div class="message agent">Welcome to the APHA Community & Learning Assistant! How can I help you with courses, local Twin Hearts meditation groups, or Pranic Healing today?</div>
    </div>
    <div class="input-area">
      <input type="text" id="userInput" placeholder="Type your question..." onkeydown="if(event.key === 'Enter') sendMessage()" />
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>

  <script>
    async function sendMessage() {
      const input = document.getElementById('userInput');
      const text = input.value.trim();
      if (!text) return;

      const messagesDiv = document.getElementById('messages');
      const userMsg = document.createElement('div');
      userMsg.className = 'message user';
      userMsg.textContent = text;
      messagesDiv.appendChild(userMsg);
      input.value = '';
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'message agent';
      loadingMsg.textContent = 'Thinking...';
      messagesDiv.appendChild(loadingMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'web_user', message: text })
        });
        const data = await res.json();
        let reply = 'Sorry, I did not receive a response.';
        if (data.events) {
          for (const ev of data.events) {
            if (ev.content && ev.content.parts) {
              for (const p of ev.content.parts) {
                if (p.text) reply = p.text;
              }
            }
          }
        }
        loadingMsg.textContent = reply;
      } catch (err) {
        loadingMsg.textContent = 'Error communicating with assistant.';
      }
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(HTML_UI);
});

app.post('/chat', async (req, res) => {
  try {
    const { userId = 'user_demo', message = 'Hello' } = req.body;
    const appName = runner.appName;

    const session = await runner.sessionService.createSession({ userId, appName });

    const events = [];
    for await (const event of runner.runAsync({
      userId,
      sessionId: session.id,
      newMessage: { role: 'user', parts: [{ text: message }] }
    })) {
      events.push(event);
    }

    res.json({ sessionId: session.id, events });
  } catch (err: any) {
    console.error('Error handling /chat:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

if (require.main === module || (process.argv[1] && process.argv[1].endsWith('server.ts'))) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 APHA Agent Playground Server listening at http://0.0.0.0:${PORT}`);
  });
}
