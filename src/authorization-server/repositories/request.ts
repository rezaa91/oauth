import randomString from 'randomstring';
import db, {UntrustedRequest} from '../db';

export function insertUntrustedRequest(request: UntrustedRequest): string {
  const requestId = randomString.generate();
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
