import test from 'node:test';
import assert from 'node:assert/strict';
import { runner } from '../../src/server';

test('test_agent_stream integration test with Memory Bank', async () => {
  const userId = 'test_ts_user_123';
  const session = await runner.sessionService.createSession({
    userId,
    appName: runner.appName,
  });

  assert.ok(session.id, 'Session should have an ID');

  const events = [];
  for await (const event of runner.runAsync({
    userId,
    sessionId: session.id,
    newMessage: {
      role: 'user',
      parts: [{ text: 'I am interested in Pranic Healing in Los Angeles. What events are upcoming?' }],
    },
  })) {
    events.push(event);
  }

  assert.ok(events.length > 0, 'Expected at least one response event from agent');
});
