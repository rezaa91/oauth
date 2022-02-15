export enum Client {
  id = 'oauth-client-id-1',
  secret = 'oauth-client-id-1-secret',
  redirectURL = 'http://localhost:5000/callback',
  scope = 'read'
}

export enum Auth {
  authorizeURL = 'http://localhost:5001/authorize',
  tokenURL = 'http://localhost:5001/token',
  revokeURL = 'http://localhost:5001/revoke'
}

export enum Resource {
  protected = 'http://localhost:5002/resource'
}
