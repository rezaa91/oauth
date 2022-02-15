import db, {Client, UntrustedRequest, Resource} from './db';
import randomstring from 'randomstring';

export function getClientById(id: string): Client|undefined {
  return db.clients.find(client => client.client_id === id);
}

export function clientScopeDisallowed(client: Client, requestedScopes: string[]): boolean {
  const clientScopes = client.scope.split(' ');
  return requestedScopes.some(requestedScope => !clientScopes.includes(requestedScope));
}

export function getProtectedResourceById(id?: string): Resource|undefined {
  return db.resources.find(resource => resource.id === id);
}

export function insertUntrustedRequest(request: UntrustedRequest): string {
  const requestId = randomstring.generate();
  db.untrusted_requests.push({
    ...request,
    id: requestId
  });
  return requestId;
}

export function getUntrustedRequestById(id: string): UntrustedRequest|undefined {
  return db.untrusted_requests.find(req => req.id === id);
}

export function deleteUntrustedRequest(id: string): void {
  const index = db.untrusted_requests.findIndex(req => req.id === id);
  if (index) {
    db.untrusted_requests.splice(index, 1);
  }
}

export function insertCode(clientId: string, code: string): void {
  db.code_client.push({
    client_id: clientId,
    authorizationCode: code
  });
}

export function removeCode(code: string): void {
  const index = db.code_client.findIndex(row => row.authorizationCode === code);
  if (index) {
    db.code_client.splice(index, 1);
  }
}

export function getClientByAuthCode(code: string): Client|undefined {
  const record = db.code_client.find(row => row.authorizationCode === code);
  if (!record) {
    return;
  }
  return getClientById(record.client_id);
}

export function getClientByAccessToken(code: string): Client|undefined {
  return db.clients.find(client => client.access_token === code);
}

export function insertAccessToken(clientId: string, accessToken: string): void {
  const client = getClientById(clientId);
  if (client) {
    client.access_token = accessToken;
  }
}

export function insertRefreshToken(clientId: string, refreshToken: string): void {
  const client = getClientById(clientId);
  if (client) {
    client.refresh_token = refreshToken;
  }
}
