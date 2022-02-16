export type Client = {
  client_name: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string;
  access_token?: string;
  refresh_token?: string;
}

type CodeToClient = {
  client_id: string;
  authorizationCode: string;
}

export type UntrustedRequest = Pick<Client, 'client_id'|'redirect_uri'|'scope'> & {
  id?: string;
  response_type?: 'code'|'token';
  state: string;
}

export type Resource = {
  id: string;
  secret: string;
}

type Db = {
  clients: Client[];
  code_client: CodeToClient[];
  untrusted_requests: UntrustedRequest[];
  resources: Resource[];
}

const db: Db = {
  clients: [
    {
      "client_name": "My Application",
      "client_id": "oauth-client-id-1",
      "client_secret": "oauth-client-id-1-secret",
      "redirect_uri": "http://localhost:5000/auth/callback",
      "scope": "read"
    }
  ],

  code_client: [],

  untrusted_requests: [],

  resources: [
    {
      "id": "oauth-resource-id-1",
      "secret": "oauth-resource-id-1-secret"
    }
  ]
}

export default db;
