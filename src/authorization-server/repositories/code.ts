import db from '../db';

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
