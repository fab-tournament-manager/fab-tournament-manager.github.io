import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, getUserProfile, updateUserProfile } from '../lib/firestoreService';
import type { FavoriteDeck, UserProfile } from '../types';

interface RegisterInput {
  name: string;
  nickname: string;
  email: string;
  password: string;
  gemId: string;
  favoriteDeck: string;
  favoriteDecks?: FavoriteDeck[];
}

interface GoogleRegisterInput {
  gemId?: string;
}

interface CreateStoreInput {
  name: string;
  nickname: string;
  email: string;
  password: string;
  storeName: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  createStoreAccess: (input: CreateStoreInput) => Promise<void>;
  googleSignIn: (input?: GoogleRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  reloadProfile: (uid?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeStoreId(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const currentProfile = await getUserProfile(currentUser.uid);
        setProfile(currentProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(input: RegisterInput) {
    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await updateProfile(credential.user, { displayName: input.name });
    await createUserProfile(credential.user.uid, {
      name: input.name,
      nickname: input.nickname,
      email: input.email,
      gemId: input.gemId,
      favoriteDeck: input.favoriteDeck,
      favoriteDecks: input.favoriteDecks,
    });
    const currentProfile = await getUserProfile(credential.user.uid);
    setProfile(currentProfile);
  }

  async function googleSignIn(input?: GoogleRegisterInput) {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const existingProfile = await getUserProfile(user.uid);

    if (!existingProfile) {
      if (!input?.gemId?.trim()) {
        await signOut(auth);
        throw new Error('Para cadastrar com Google, preencha o GEM ID na tela de cadastro.');
      }

      await createUserProfile(user.uid, {
        name: user.displayName || 'Usuario Google',
        nickname: user.displayName || 'Usuario Google',
        email: user.email || '',
        gemId: input.gemId.trim(),
        favoriteDeck: '',
        favoriteDecks: [],
      });
    } else if (existingProfile.role !== 'store' && !existingProfile.gemId?.trim() && input?.gemId?.trim()) {
      await updateUserProfile(user.uid, { gemId: input.gemId.trim() });
    }

    const currentProfile = await getUserProfile(user.uid);
    setProfile(currentProfile);
  }

  async function createStoreAccess(input: CreateStoreInput) {
    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    const storeId = normalizeStoreId(input.storeName);

    await updateProfile(credential.user, { displayName: input.name });
    await createUserProfile(credential.user.uid, {
      name: input.name,
      nickname: input.nickname,
      email: input.email,
      gemId: '',
      favoriteDeck: '',
      favoriteDecks: [],
      role: 'store',
      storeId,
      storeName: input.storeName,
    });
    await signOut(auth);
  }

  async function logout() {
    await signOut(auth);
  }

  async function reloadProfile(uid?: string) {
    const targetUid = uid ?? auth.currentUser?.uid;
    if (!targetUid) return;
    const currentProfile = await getUserProfile(targetUid);
    setProfile(currentProfile);
  }

  const value = useMemo(
    () => ({ user, profile, loading, login, register, createStoreAccess, googleSignIn, logout, reloadProfile }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
