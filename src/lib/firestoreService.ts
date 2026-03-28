import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { FavoriteDeck, TournamentResult, UserProfile, UserRole } from '../types';

const usersCollection = collection(db, 'users');
const resultsCollection = collection(db, 'tournament_results');

function ensurePrimaryDeck(decks: FavoriteDeck[]): FavoriteDeck[] {
  const normalized = decks.map((deck, index) => ({
    id: deck.id || `deck-${index + 1}`,
    name: deck.name,
    cards: Array.isArray(deck.cards) ? deck.cards : [],
    isPrimary: Boolean(deck.isPrimary),
  }));

  const firstNamedDeckIndex = normalized.findIndex((deck) => deck.name.trim());
  if (firstNamedDeckIndex === -1) return normalized;

  const hasPrimary = normalized.some((deck) => deck.isPrimary);
  if (!hasPrimary) {
    normalized[firstNamedDeckIndex] = {
      ...normalized[firstNamedDeckIndex],
      isPrimary: true,
    };
  }

  const primaryIndex = normalized.findIndex((deck) => deck.isPrimary);
  return normalized.map((deck, index) => ({
    ...deck,
    isPrimary: index === primaryIndex,
  }));
}

function normalizeFavoriteDecks(favoriteDeck: string, favoriteDecks?: FavoriteDeck[]): FavoriteDeck[] {
  if (favoriteDecks && favoriteDecks.length > 0) {
    return ensurePrimaryDeck(favoriteDecks);
  }

  if (favoriteDeck.trim()) {
    return ensurePrimaryDeck([
      {
        id: 'deck-1',
        name: favoriteDeck,
        cards: [],
        isPrimary: true,
      },
    ]);
  }

  return [];
}

function getPrimaryDeckName(favoriteDecks: FavoriteDeck[], fallback: string) {
  return favoriteDecks.find((deck) => deck.isPrimary)?.name ?? favoriteDecks[0]?.name ?? fallback;
}

export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    nickname: string;
    email: string;
    gemId?: string;
    favoriteDeck: string;
    favoriteDecks?: FavoriteDeck[];
    role?: UserRole;
    storeId?: string;
    storeName?: string;
  },
): Promise<void> {
  const ref = doc(usersCollection, uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) return;

  const favoriteDecks = normalizeFavoriteDecks(data.favoriteDeck, data.favoriteDecks);

  await setDoc(ref, {
    uid,
    name: data.name,
    nickname: data.nickname,
    email: data.email,
    gemId: data.gemId ?? '',
    favoriteDeck: getPrimaryDeckName(favoriteDecks, data.favoriteDeck),
    favoriteDecks,
    role: data.role ?? 'player',
    storeId: data.storeId ?? null,
    storeName: data.storeName ?? null,
    createdAt: new Date().toISOString(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(usersCollection, uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as UserProfile;
  const favoriteDecks = normalizeFavoriteDecks(data.favoriteDeck ?? '', data.favoriteDecks);

  return {
    ...data,
    gemId: data.gemId ?? '',
    favoriteDeck: getPrimaryDeckName(favoriteDecks, ''),
    favoriteDecks,
  };
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const ref = doc(usersCollection, uid);

  if (data.favoriteDecks) {
    const favoriteDecks = normalizeFavoriteDecks(data.favoriteDeck ?? '', data.favoriteDecks);
    await updateDoc(ref, {
      ...data,
      favoriteDeck: getPrimaryDeckName(favoriteDecks, ''),
      favoriteDecks,
    });
    return;
  }

  await updateDoc(ref, data);
}

export async function addTournamentResult(data: Omit<TournamentResult, 'id'>): Promise<void> {
  await addDoc(resultsCollection, {
    ...data,
    updatedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export async function updateTournamentResult(
  id: string,
  data: Partial<Omit<TournamentResult, 'id' | 'storeId' | 'storeName' | 'createdBy'>>,
): Promise<void> {
  const ref = doc(resultsCollection, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTournamentResult(id: string): Promise<void> {
  await deleteDoc(doc(resultsCollection, id));
}

export function subscribeToAllResults(callback: (results: TournamentResult[]) => void): () => void {
  const q = query(resultsCollection, orderBy('eventDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<TournamentResult, 'id'>),
    })));
  });
}

export function subscribeToStoreResults(storeId: string, callback: (results: TournamentResult[]) => void): () => void {
  const q = query(resultsCollection, where('storeId', '==', storeId));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<TournamentResult, 'id'>),
    }));
    rows.sort((a, b) => b.eventDate.localeCompare(a.eventDate));
    callback(rows);
  });
}

export function subscribeToStoreUsers(callback: (users: UserProfile[]) => void): () => void {
  const q = query(usersCollection, where('role', '==', 'store'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => item.data() as UserProfile));
  });
}

export async function getStoreUsers(): Promise<UserProfile[]> {
  const q = query(usersCollection, where('role', '==', 'store'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => item.data() as UserProfile);
}
