import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

process.env.FUB_API_KEY ||= 'fka_contract_test';
const { TOOL_DEFINITIONS } = await import('../index.js');
const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');
const tools = new Map(TOOL_DEFINITIONS.map(tool => [tool.name, tool]));

assert.equal(TOOL_DEFINITIONS.length, 164, 'unexpected tool count');
assert.equal(tools.size, TOOL_DEFINITIONS.length, 'tool names must be unique');

for (const name of [
  'ignoreUnclaimedPerson', 'inboxAppAddSystemMessage',
  'getRateLimitUsage', 'getRateLimitLimits'
]) assert(tools.has(name), `missing documented endpoint tool: ${name}`);

const expectedRoutes = [
  "post('/people/ignoreUnclaimed'",
  'post(`/inboxApps/${inboxAppId}/message`',
  'post(`/inboxApps/${inboxAppId}/systemMessage`',
  'put(`/inboxApps/${inboxAppId}/message`',
  'post(`/inboxApps/${inboxAppId}/note`',
  'put(`/inboxApps/${inboxAppId}/conversations/${extConversationId}`',
  'get(`/inboxApps/${args.inboxAppId}/conversations/${args.extConversationId}/participants`',
  'post(`/inboxApps/${inboxAppId}/conversations/${extConversationId}/participants`',
  'delete(`/inboxApps/${inboxAppId}/conversations/${extConversationId}/participants/${participantId}`',
  'get(`/inboxApps/installedApps/${args.publishedInboxAppId}`',
  "get('/rateLimit/usage'", "get('/rateLimit/limits'"
];
for (const route of expectedRoutes) assert(source.includes(route), `missing route: ${route}`);

for (const obsoleteRoute of [
  "post('/inboxApps/messages'", "put(`/inboxApps/messages/",
  "post('/inboxApps/notes'", "get('/inboxApps/participants'",
  "post('/inboxApps/participants'", "get('/inboxApps')"
]) assert(!source.includes(obsoleteRoute), `obsolete undocumented route remains: ${obsoleteRoute}`);

const addMessage = tools.get('inboxAppAddMessage').inputSchema;
assert.deepEqual(addMessage.required, [
  'inboxAppId', 'externalConversationId', 'externalMessageId',
  'message', 'isIncoming', 'sender'
]);
assert.equal(addMessage.properties.deliveryStatus.enum.length, 4);

console.log('api-contract: endpoint coverage and corrected Inbox App routes passed');
