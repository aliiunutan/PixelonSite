import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

// Error Handling Function
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      // In a real app, you'd get this from auth.currentUser
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

// Generic CRUD Services
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void,
  queryConstraints: any[] = []
) => {
  const q = query(collection(db, collectionName), ...queryConstraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  });
};

export const addItem = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      kayit_tarihi: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
};

export const updateItem = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
};

export const deleteItem = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
};

// Specific Services
export const getActiveReviews = (callback: (reviews: any[]) => void) => {
  return subscribeToCollection('reviews', callback, [where('durum', '==', 'aktif')]);
};

export const getShoots = (callback: (shoots: any[]) => void) => {
  return subscribeToCollection('shoots', callback, [orderBy('baslangic_tarihi', 'asc')]);
};

export const getPackages = (callback: (packages: any[]) => void) => {
  return subscribeToCollection('packages', callback);
};

export const getShootTypes = (callback: (types: any[]) => void) => {
  return subscribeToCollection('shoot_types', callback);
};
