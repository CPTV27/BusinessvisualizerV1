/**
 * Firebase Service — The Studio
 * Connects to sidekick-bigmuddy Firebase project
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import {
    getFirestore,
    Firestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    DocumentReference
} from 'firebase/firestore';
import { BusinessEntity, ThemeId } from '../../types';

// Firebase configuration for sidekick-bigmuddy
// TODO: Move to environment variables for production
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: 'sidekick-bigmuddy.firebaseapp.com',
    projectId: 'sidekick-bigmuddy',
    storageBucket: 'sidekick-bigmuddy.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const initializeFirebase = (): { app: FirebaseApp; auth: Auth; db: Firestore } => {
    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    }
    return { app: app!, auth: auth!, db: db! };
};

// --- AUTHENTICATION ---

export const signInWithGoogle = async (): Promise<User | null> => {
    const { auth } = initializeFirebase();
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');

    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        return null;
    }
};

export const signOut = async (): Promise<void> => {
    const { auth } = initializeFirebase();
    await firebaseSignOut(auth);
};

export const subscribeToAuthState = (callback: (user: User | null) => void): (() => void) => {
    const { auth } = initializeFirebase();
    return onAuthStateChanged(auth, callback);
};

// --- CLIENT MANAGEMENT ---

export interface StudioClient {
    id: string;
    name: string;
    tagline?: string;
    themeId: ThemeId;
    customColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    logoUrl?: string;
    discoverySheetId?: string; // Google Sheets ID for Discovery Model
    createdAt: Timestamp;
    updatedAt: Timestamp;
    ownerId: string; // Firebase Auth UID
}

export const getClient = async (clientId: string): Promise<StudioClient | null> => {
    const { db } = initializeFirebase();
    const docRef = doc(db, 'clients', clientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StudioClient;
    }
    return null;
};

export const getClientsByOwner = async (ownerId: string): Promise<StudioClient[]> => {
    const { db } = initializeFirebase();
    const q = query(
        collection(db, 'clients'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudioClient));
};

export const createClient = async (
    client: Omit<StudioClient, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    const { db } = initializeFirebase();
    const docRef = doc(collection(db, 'clients'));

    await setDoc(docRef, {
        ...client,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    });

    return docRef.id;
};

export const updateClient = async (
    clientId: string,
    updates: Partial<StudioClient>
): Promise<void> => {
    const { db } = initializeFirebase();
    const docRef = doc(db, 'clients', clientId);

    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
    });
};

// --- ENTITY MANAGEMENT ---

export const getEntities = async (clientId: string): Promise<BusinessEntity[]> => {
    const { db } = initializeFirebase();
    const q = query(
        collection(db, 'clients', clientId, 'entities'),
        orderBy('name')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessEntity));
};

export const saveEntity = async (
    clientId: string,
    entity: BusinessEntity
): Promise<void> => {
    const { db } = initializeFirebase();
    const docRef = doc(db, 'clients', clientId, 'entities', entity.id);

    await setDoc(docRef, {
        ...entity,
        updatedAt: Timestamp.now()
    });
};

export const subscribeToEntities = (
    clientId: string,
    callback: (entities: BusinessEntity[]) => void
): (() => void) => {
    const { db } = initializeFirebase();
    const q = query(
        collection(db, 'clients', clientId, 'entities'),
        orderBy('name')
    );

    return onSnapshot(q, (snapshot) => {
        const entities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BusinessEntity));
        callback(entities);
    });
};

// --- GAME BOARD STATE ---

export interface GameBoardState {
    activeView: 'ECOSYSTEM' | 'LAYERS' | 'GAPS' | 'REVENUE' | 'REGISTRY';
    filters: {
        entityTypes?: string[];
        layers?: string[];
        gapStatus?: string[];
    };
    zoom: number;
    panX: number;
    panY: number;
}

export const saveGameBoardState = async (
    clientId: string,
    userId: string,
    state: GameBoardState
): Promise<void> => {
    const { db } = initializeFirebase();
    const docRef = doc(db, 'clients', clientId, 'userPreferences', userId);

    await setDoc(docRef, {
        gameBoardState: state,
        updatedAt: Timestamp.now()
    }, { merge: true });
};

// --- AMBIENT SETTINGS ---

export interface AmbientSettings {
    soundEnabled: boolean;
    soundVolume: number; // 0-1
    timeAwareThemes: boolean;
    particleEffects: boolean;
}

export const saveAmbientSettings = async (
    userId: string,
    settings: AmbientSettings
): Promise<void> => {
    const { db } = initializeFirebase();
    const docRef = doc(db, 'userSettings', userId);

    await setDoc(docRef, {
        ambient: settings,
        updatedAt: Timestamp.now()
    }, { merge: true });
};

export const getAmbientSettings = async (
    userId: string
): Promise<AmbientSettings | null> => {
    const { db } = initializeFirebase();
    const docRef = doc(db, 'userSettings', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().ambient) {
        return docSnap.data().ambient as AmbientSettings;
    }
    return null;
};
