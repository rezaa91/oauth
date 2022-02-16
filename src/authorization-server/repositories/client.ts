import db, {Client} from '../db';

export function getClientById(id: string): Client|undefined {
  return db.clients.find(client => client.client_id === id);
}

export function clientScopeDisallowed(client: Client, requestedScopes: string[]): boolean {
  const clientScopes = client.scope.split(' ');
  return requestedScopes.some(requestedScope => !clientScopes.includes(requestedScope));
}

export function getClientByAuthCode(code: string): Client|undefined {
  const record = db.code_client.find(row => row.authorizationCode === code);
  if (!record) {
    return;
  }
  return getClientById(record.client_id);
}

export function insertAccessToken(clientId: string, accessToken: string): void {
  const client = getClientById(clientId);
  if (client) {
    client.access_token = accessToken;
  }
}

export function getClientByAccessToken(code: string): Client|undefined {
  return db.clients.find(client => client.access_token === code);
}

export function insertRefreshToken(clientId: string, refreshToken: string): void {
  const client = getClientById(clientId);
  if (client) {
    client.refresh_token = refreshToken;
  }
}
