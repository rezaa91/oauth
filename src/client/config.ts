export enum Client {
  id = 'oauth-client-id-1',
  secret = 'oauth-client-id-1-secret',
  redirectURL = 'http://localhost:5000/auth/callback',
  scope = 'read,write'
}

export enum Auth {
  authorizeURL = 'http://localhost:5001/auth',
  tokenURL = 'http://localhost:5001/auth/token'
}

export enum Resource {
  protected = 'http://localhost:5002/books'
}
