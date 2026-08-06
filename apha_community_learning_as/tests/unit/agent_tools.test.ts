import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getUpcomingEvents,
  findStudyGroups,
  getPranicFaq,
  calculateBundleFee,
  searchPranicKnowledgeBase,
  rootAgent
} from '../../src/agent';

test('getUpcomingEvents returns all events or filters by level/location', () => {
  const allEvents = getUpcomingEvents({});
  assert.equal(allEvents.length, 4);

  const basicEvents = getUpcomingEvents({ level: 'Basic' });
  assert.equal(basicEvents.length, 1);
  assert.equal(basicEvents[0].title, 'Basic Pranic Healing (Level 1)');

  const laEvents = getUpcomingEvents({ location: 'Los Angeles' });
  assert.equal(laEvents.length, 2);
});

test('findStudyGroups returns groups by city or zip', () => {
  const groups = findStudyGroups({});
  assert.equal(groups.length, 3);

  const laGroup = findStudyGroups({ cityOrZip: 'Los Angeles' });
  assert.equal(laGroup.length, 1);
  assert.equal(laGroup[0].name, 'Los Angeles Pranic Healing Center');
});

test('getPranicFaq searches RAG knowledge base', async () => {
  const answer = await getPranicFaq({ topic: 'twin_hearts' });
  assert.ok(answer, 'Should return a response');
});

test('calculateBundleFee calculates correct discounts', () => {
  const result = calculateBundleFee({ numWorkshops: 2, isEarlyBird: true });
  assert.equal(result.numWorkshops, 2);
  assert.equal(result.baseTotal, 700);
  assert.equal(result.discountPercent, '25%');
  assert.equal(result.finalTotal, '$525.00');
});

test('searchPranicKnowledgeBase queries Vertex AI RAG Corpus', async () => {
  const res: any = await searchPranicKnowledgeBase({ query: '11 major chakras' });
  assert.ok(res, 'RAG query response should exist');
  assert.equal(res.source, 'pranic-healing-guide-corpus');
  assert.ok(res.passages.length > 0, 'Should contain matched passages');
});

test('rootAgent has correct persona and tools registered', () => {
  assert.equal(rootAgent.name, 'apha_learning_assistant');
  assert.equal(rootAgent.tools.length, 7);
});
