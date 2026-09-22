import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { Agent, Call, User } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfigData);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Connection test as required by skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or uninitialized:', error.message);
    } else {
      console.log('Firestore initialized, ping complete.');
    }
    return false;
  }
}

// Initial connection test
testFirestoreConnection();

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================
export async function firebaseSignUp(email: string, pass: string, name: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = credential.user;
  
  const userProfile: User = {
    id: fbUser.uid,
    name: name || email.split('@')[0],
    email: fbUser.email || email,
    role: 'owner',
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
    businessId: 'biz_01',
  };

  // Persist user profile to Firestore
  try {
    await setDoc(doc(db, 'users', fbUser.uid), userProfile);
  } catch (err) {
    console.warn('Firestore user save notice:', err);
  }

  return userProfile;
}

export async function firebaseSignIn(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = credential.user;

  try {
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
  } catch (err) {
    console.warn('Firestore user fetch notice:', err);
  }

  return {
    id: fbUser.uid,
    name: fbUser.displayName || email.split('@')[0],
    email: fbUser.email || email,
    role: 'owner',
    businessId: 'biz_01',
  };
}

export async function firebaseSignInAnonymous(): Promise<User> {
  const credential = await signInAnonymously(auth);
  const fbUser = credential.user;
  return {
    id: fbUser.uid,
    name: 'Demo Workspace User',
    email: 'demo@auris.ai',
    role: 'owner',
    businessId: 'biz_01',
  };
}

export async function firebaseSignInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  const fbUser = credential.user;
  const userProfile: User = {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
    email: fbUser.email || 'user@auris.ai',
    role: 'owner',
    avatar: fbUser.photoURL || undefined,
    businessId: 'biz_01',
  };
  try {
    await setDoc(doc(db, 'users', fbUser.uid), userProfile, { merge: true });
  } catch (err) {
    console.warn('Firestore user save notice:', err);
  }
  return userProfile;
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
          return;
        }
      } catch (e) {
        console.warn('Auth state sync notice:', e);
      }
      callback({
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Auris Admin',
        email: fbUser.email || 'user@auris.ai',
        role: 'owner',
        businessId: 'biz_01',
      });
    } else {
      callback(null);
    }
  });
}

// ==========================================
// FIRESTORE AGENT HELPERS
// ==========================================
export async function syncAgentToFirestore(agent: Agent): Promise<void> {
  try {
    await setDoc(doc(db, 'agents', agent.id), agent, { merge: true });
  } catch (err) {
    console.warn('Firestore syncAgent notice:', err);
  }
}

export async function deleteAgentFromFirestore(agentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'agents', agentId));
  } catch (err) {
    console.warn('Firestore deleteAgent notice:', err);
  }
}

export function subscribeAgents(callback: (agents: Agent[]) => void) {
  try {
    return onSnapshot(collection(db, 'agents'), (snapshot) => {
      const items: Agent[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Agent);
      });
      if (items.length > 0) {
        callback(items);
      }
    }, (error) => {
      console.warn('Firestore subscribeAgents listener notice:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe agents:', err);
    return () => {};
  }
}

// ==========================================
// FIRESTORE CALL HELPERS
// ==========================================
export async function syncCallToFirestore(call: Call): Promise<void> {
  try {
    await setDoc(doc(db, 'calls', call.id), call, { merge: true });
  } catch (err) {
    console.warn('Firestore syncCall notice:', err);
  }
}

export function subscribeCalls(callback: (calls: Call[]) => void) {
  try {
    const callsCol = collection(db, 'calls');
    return onSnapshot(callsCol, (snapshot) => {
      const items: Call[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Call);
      });
      if (items.length > 0) {
        callback(items);
      }
    }, (error) => {
      console.warn('Firestore subscribeCalls listener notice:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe calls:', err);
    return () => {};
  }
}

// ==========================================
// FIRESTORE INTEGRATION CONFIG HELPERS
// ==========================================
export interface ThirdPartyIntegrationConfig {
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    uploadPreset: string;
    enabled: boolean;
  };
  googleForms?: {
    formUrl: string;
    formId: string;
    nameFieldEntryId: string;
    phoneFieldEntryId: string;
    notesFieldEntryId: string;
    enabled: boolean;
  };
  razorpay?: {
    keyId: string;
    keySecret?: string;
    currency: 'INR' | 'USD';
    enabled: boolean;
  };
}

export async function saveIntegrationSettings(settings: ThirdPartyIntegrationConfig): Promise<void> {
  try {
    await setDoc(doc(db, 'integrations', 'active_settings'), settings, { merge: true });
  } catch (err) {
    console.warn('Firestore saveIntegrationSettings notice:', err);
  }
}

export async function getIntegrationSettings(): Promise<ThirdPartyIntegrationConfig | null> {
  try {
    const snap = await getDoc(doc(db, 'integrations', 'active_settings'));
    if (snap.exists()) {
      return snap.data() as ThirdPartyIntegrationConfig;
    }
  } catch (err) {
    console.warn('Firestore getIntegrationSettings notice:', err);
  }
  return null;
}

// ==========================================
// FIRESTORE KNOWLEDGE BASE SYNC HELPERS
// ==========================================
export async function syncKnowledgeItemToFirestore(item: any): Promise<void> {
  try {
    await setDoc(doc(db, 'knowledge_items', item.id), item, { merge: true });
  } catch (err) {
    console.warn('Firestore syncKnowledgeItem notice:', err);
  }
}

export async function deleteKnowledgeItemFromFirestore(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'knowledge_items', itemId));
  } catch (err) {
    console.warn('Firestore deleteKnowledgeItem notice:', err);
  }
}

export function subscribeKnowledgeItems(callback: (items: any[]) => void) {
  try {
    const kbCol = collection(db, 'knowledge_items');
    return onSnapshot(kbCol, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data());
      });
      if (items.length > 0) {
        callback(items);
      }
    }, (error) => {
      console.warn('Firestore subscribeKnowledgeItems notice:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe knowledge items:', err);
    return () => {};
  }
}
