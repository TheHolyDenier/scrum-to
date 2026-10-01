import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

type FirebaseEnvironmentKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_DATABASE_URL'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID'

function getEnvironmentValue(key: FirebaseEnvironmentKey): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${key}`)
  }
  return value
}

const firebaseConfig = {
  apiKey: getEnvironmentValue('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvironmentValue('VITE_FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnvironmentValue('VITE_FIREBASE_DATABASE_URL'),
  projectId: getEnvironmentValue('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvironmentValue('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvironmentValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvironmentValue('VITE_FIREBASE_APP_ID'),
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)
