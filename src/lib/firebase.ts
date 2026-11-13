/**
 * Galle Taxi - Firebase Client Configuration
 * Provisioned for project "galle-taxi" (Blaze Plan - unlimited Cloud Firestore reads/writes)
 * connected explicitly to the standard (default) Firestore database instance.
 */

import { initializeApp, getApps, FirebaseApp, deleteApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer, collection, getDocs, limit, query, serverTimestamp } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import bundledConfig from '../../firebase-applet-config.json';

export const FIRESTORE_DATABASE_ID = '(default)';

export interface FirebaseWebConfig {
  apiKey: string;
  projectId: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
  databaseId?: string;
}

const STORAGE_KEY = 'galletaxi_v1_firebase_config';

/**
 * Recursively strips undefined values from objects and arrays so Firestore setDoc/updateDoc
 * never fails on "Unsupported field value: undefined".
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as unknown as T;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    // Preserve special Firestore objects (FieldValue, Timestamp, Date, etc.)
    if (obj.constructor && obj.constructor.name !== 'Object') {
      return obj;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Validate that an API key is a legitimate Google/Firebase Web API key
 */
export function isValidFirebaseApiKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (!trimmed.startsWith('AIzaSy')) return false;
  if (trimmed.length < 35 || trimmed.length > 50) return false;
  if (
    trimmed.includes('Your') ||
    trimmed.includes('ApiKey') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('MY_GEMINI')
  ) {
    return false;
  }
  return true;
}

/**
 * Retrieve active Firebase configuration. Priority order:
 * 1. Provisioned firebase-applet-config.json (bundled with app)
 * 2. Stored custom credentials in localStorage
 * 3. Environment variables
 * Always targets the standard (default) Firestore database instance so all collections stay unified.
 */
export function getStoredFirebaseConfig(): FirebaseWebConfig | null {
  // 1. Check bundled configuration first (from ProvisionFirebase)
  if (bundledConfig && bundledConfig.apiKey && isValidFirebaseApiKey(bundledConfig.apiKey)) {
    return {
      apiKey: bundledConfig.apiKey,
      projectId: bundledConfig.projectId || 'galle-taxi',
      authDomain: bundledConfig.authDomain || `${bundledConfig.projectId || 'galle-taxi'}.firebaseapp.com`,
      storageBucket: bundledConfig.storageBucket || `${bundledConfig.projectId || 'galle-taxi'}.firebasestorage.app`,
      messagingSenderId: bundledConfig.messagingSenderId || undefined,
      appId: bundledConfig.appId || undefined,
      firestoreDatabaseId: FIRESTORE_DATABASE_ID,
    };
  }

  // 2. Check localStorage in case administrator updated credentials in UI
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && isValidFirebaseApiKey(parsed.apiKey)) {
        const pId = parsed.projectId || 'galle-taxi';
        return {
          apiKey: parsed.apiKey.trim(),
          projectId: pId,
          authDomain: parsed.authDomain || `${pId}.firebaseapp.com`,
          storageBucket: parsed.storageBucket || `${pId}.firebasestorage.app`,
          messagingSenderId: parsed.messagingSenderId || undefined,
          appId: parsed.appId || undefined,
          firestoreDatabaseId: FIRESTORE_DATABASE_ID,
        };
      }
    }
  } catch {
    // ignore parse error
  }

  // 3. Fallback to environment variables
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'galle-taxi';

  if (envApiKey && isValidFirebaseApiKey(envApiKey)) {
    return {
      apiKey: envApiKey.trim(),
      projectId: envProjectId.trim(),
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
      firestoreDatabaseId: FIRESTORE_DATABASE_ID,
    };
  }

  return null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let isConfigured = false;
let configSource: 'bundled' | 'env' | 'storage' | 'none' = 'none';

function initFirebase() {
  const cfg = getStoredFirebaseConfig();

  if (cfg && cfg.apiKey && isValidFirebaseApiKey(cfg.apiKey) && cfg.projectId) {
    try {
      const options = {
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain || `${cfg.projectId}.firebaseapp.com`,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket || `${cfg.projectId}.firebasestorage.app`,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId,
      };

      if (getApps().length > 0) {
        const existingApp = getApps()[0];
        if (existingApp.options.apiKey === cfg.apiKey) {
          app = existingApp;
        } else {
          app = initializeApp(options, 'galle-taxi-app-' + Date.now());
        }
      } else {
        app = initializeApp(options);
      }

      auth = getAuth(app);

      // Explicitly connect to the standard (default) Cloud Firestore database instance
      // so vehicles, fareRules, siteSettings, tours, taxi_hubs, and bookings share one unified DB.
      db = getFirestore(app);

      try {
        storage = getStorage(app);
      } catch {
        storage = null;
      }

      isConfigured = true;
      configSource =
        bundledConfig && bundledConfig.apiKey === cfg.apiKey
          ? 'bundled'
          : localStorage.getItem(STORAGE_KEY)
          ? 'storage'
          : 'env';

      console.info(`[Galle Taxi] Connected to Firebase project "${cfg.projectId}" (Firestore Database: ${FIRESTORE_DATABASE_ID}).`);

      // Validate connection to Firestore as mandated by skill
      validateFirestoreConnection(db);
    } catch (err) {
      console.warn('[Galle Taxi] Firebase initialization notice:', err);
      app = null;
      auth = null;
      db = null;
      storage = null;
      isConfigured = false;
      configSource = 'none';
    }
  } else {
    app = null;
    auth = null;
    db = null;
    storage = null;
    isConfigured = false;
    configSource = 'none';
  }
}

/**
 * Validates connection to Firestore at application boot
 */
async function validateFirestoreConnection(firestoreInstance: Firestore) {
  try {
    await getDocFromServer(doc(firestoreInstance, 'test', 'connection'));
    console.info('[Galle Taxi] Firestore (default) connection validated successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Initial initialization
initFirebase();

/**
 * Save custom Firebase configuration to localStorage and re-initialize
 */
export async function saveFirebaseWebConfig(config: FirebaseWebConfig): Promise<boolean> {
  if (!isValidFirebaseApiKey(config.apiKey)) {
    throw new Error(
      'Invalid Firebase API Key format. A valid key starts with "AIzaSy" and is approximately 39 characters long.'
    );
  }

  try {
    const sanitized: FirebaseWebConfig = {
      apiKey: config.apiKey.trim(),
      projectId: (config.projectId || 'galle-taxi').trim(),
      authDomain: (config.authDomain || `${config.projectId || 'galle-taxi'}.firebaseapp.com`).trim(),
      storageBucket: (config.storageBucket || `${config.projectId || 'galle-taxi'}.firebasestorage.app`).trim(),
      messagingSenderId: config.messagingSenderId?.trim(),
      appId: config.appId?.trim(),
      firestoreDatabaseId: FIRESTORE_DATABASE_ID,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));

    if (app) {
      try {
        await deleteApp(app);
      } catch {
        // ignore
      }
    }

    app = initializeApp({
      apiKey: sanitized.apiKey,
      authDomain: sanitized.authDomain,
      projectId: sanitized.projectId,
      storageBucket: sanitized.storageBucket,
      messagingSenderId: sanitized.messagingSenderId,
      appId: sanitized.appId,
    });
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isConfigured = true;
    configSource = 'storage';
    validateFirestoreConnection(db);
    return true;
  } catch (err) {
    console.warn('[Galle Taxi] Failed to apply new Firebase config:', err);
    throw err;
  }
}

/**
 * Clear stored Firebase configuration
 */
export async function clearFirebaseWebConfig(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  if (app) {
    try {
      await deleteApp(app);
    } catch {
      // ignore
    }
  }
  app = null;
  auth = null;
  db = null;
  storage = null;
  isConfigured = false;
  configSource = 'none';
  initFirebase();
}

/**
 * Live connection diagnostic test for Cloud Firestore
 */
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  message: string;
  projectId: string;
  databaseId: string;
  latencyMs?: number;
  error?: string;
}> {
  const currentConfig = getStoredFirebaseConfig();
  const projectId = currentConfig?.projectId || 'galle-taxi';

  if (!isConfigured || !db || !currentConfig || !isValidFirebaseApiKey(currentConfig.apiKey)) {
    return {
      success: false,
      projectId,
      databaseId: FIRESTORE_DATABASE_ID,
      message: `Firebase is not configured yet for project "${projectId}". Enter your Web App API Key to connect.`,
    };
  }

  const startTime = Date.now();
  try {
    const q = query(collection(db, 'bookings'), limit(1));
    await getDocs(q);
    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      projectId,
      databaseId: FIRESTORE_DATABASE_ID,
      latencyMs,
      message: `Successfully connected to Cloud Firestore ${FIRESTORE_DATABASE_ID} on project "${projectId}" (${latencyMs}ms response time).`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    let errorExplanation = err?.message || 'Unknown Firestore connection error';
    if (err?.code === 'permission-denied') {
      return {
        success: true, // Backend reached, rules actively protecting data
        projectId,
        databaseId: FIRESTORE_DATABASE_ID,
        latencyMs,
        message: `Firestore ${FIRESTORE_DATABASE_ID} is active and rules are enforcing security (permission-denied for unauthenticated query as expected).`,
      };
    } else if (err?.code === 'unavailable') {
      errorExplanation = 'Could not reach Firestore backend. Verify your internet connection and Firebase project status.';
    } else if (err?.message?.includes('API key not valid') || err?.code?.includes('api-key-not-valid')) {
      errorExplanation = 'The provided Firebase API Key is invalid or expired. Check your Firebase Web App configuration.';
    }

    console.warn('[Galle Taxi] Firestore probe returned notice:', errorExplanation);
    return {
      success: false,
      projectId,
      databaseId: FIRESTORE_DATABASE_ID,
      latencyMs,
      message: errorExplanation,
      error: err?.code || err?.message,
    };
  }
}

export { app, auth, db, storage, isConfigured as isFirebaseConfigured, configSource, serverTimestamp };
