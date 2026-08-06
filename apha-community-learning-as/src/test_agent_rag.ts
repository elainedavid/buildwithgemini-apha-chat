import * as dotenv from 'dotenv';
dotenv.config();

process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "qwiklabs-gcp-04-a63326fe2771";
process.env.GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

import { InMemoryRunner, InMemorySessionService } from '@google/adk';
import { rootAgent } from './agent';

async function testAgentRag() {
  console.log("==================================================");
  console.log("🧪 Testing Agent RAG Grounding Execution");
  console.log("==================================================\n");

  const runner = new InMemoryRunner({
    agent: rootAgent,
  });

  const userId = "test_user_rag";
  const appName = runner.appName;
  const session = await runner.sessionService.createSession({ userId, appName });

  const query = "What are the 5 core steps of the Pranic Healing process according to the official guide?";
  console.log(`👤 User Query: "${query}"\n`);

  console.log("🤖 Running agent turn and tracking tool execution...\n");

  let toolCalled = false;

  for await (const event of runner.runAsync({
    userId,
    sessionId: session.id,
    newMessage: { role: 'user', parts: [{ text: query }] }
  })) {
    const parts = (event as any)?.content?.parts || (event as any)?.parts || [];

    for (const part of parts) {
      if (part.functionCall) {
        console.log(`🛠️  [TOOL CALL] Agent invoked tool: ${part.functionCall.name}`);
        console.log(`   Arguments:`, JSON.stringify(part.functionCall.args, null, 2));
        if (part.functionCall.name === "consultPranicDocs") {
          toolCalled = true;
        }
      }

      if (part.functionResponse) {
        console.log(`📥 [TOOL RESPONSE] Name: ${part.functionResponse.name}`);
        const responseSnippet = JSON.stringify(part.functionResponse.response).slice(0, 300);
        console.log(`   Result Preview: ${responseSnippet}...\n`);
      }

      if (part.text) {
        console.log(`💬 [AGENT RESPONSE]\n${part.text}\n`);
      }
    }
  }

  console.log("==================================================");
  if (toolCalled) {
    console.log("✅ VERIFICATION SUCCESS: The agent actively referenced the RAG retrieval tool (consultPranicDocs)!");
  } else {
    console.log("⚠️  NOTICE: The agent did not invoke consultPranicDocs in this turn.");
  }
  console.log("==================================================");
}

testAgentRag().catch(console.error);
