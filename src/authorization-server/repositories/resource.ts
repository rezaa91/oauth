import db, {Resource} from '../db';

export function getProtectedResourceById(id?: string): Resource|undefined {
  return db.resources.find(resource => resource.id === id);
}
