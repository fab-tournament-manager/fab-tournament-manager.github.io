import { useEffect, useMemo, useState } from 'react';
import { CreateStoreForm, StoresList, TournamentResultForm } from '../components/AdminForms';
import { Layout } from '../components/Layout';
import { ResultsTable } from '../components/ResultsTable';
import { ScoreTable } from '../components/ScoreTable';
import { useAuth } from '../contexts/AuthContext';
import {
  addTournamentResult,
  deleteTournamentResult,
  subscribeToAllResults,
  subscribeToStoreUsers,
  updateTournamentResult,
} from '../lib/firestoreService';
import { computeStandings } from '../lib/standings';
import type { TournamentResult, UserProfile } from '../types';

export function AdminPage() {
  const { profile, logout, createStoreAccess } = useAuth();
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [stores, setStores] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<TournamentResult | null>(null);

  useEffect(() => {
    const unsubscribeResults = subscribeToAllResults(setResults);
    const unsubscribeStores = subscribeToStoreUsers(setStores);
    return () => {
      unsubscribeResults();
      unsubscribeStores();
    };
  }, []);

  const standings = useMemo(() => computeStandings(results), [results]);

  if (!profile) return null;

  return (
    <Layout
      title="Administração do campeonato"
      subtitle="Poder total sobre lojas, ranking e resultados"
      actions={<button className="button secondary" onClick={logout}>Sair</button>}
    >
      <div className="stats-grid">
        <article className="stat-card"><span>Perfil</span><strong>{profile.name}</strong></article>
        <article className="stat-card"><span>Lojas</span><strong>{stores.length}</strong></article>
        <article className="stat-card"><span>Resultados</span><strong>{results.length}</strong></article>
        <article className="stat-card"><span>Participantes ranqueados</span><strong>{standings.length}</strong></article>
      </div>

      <div className="stack">
        <div className="content-grid admin-grid">
          <CreateStoreForm
            onSubmit={async (data) => {
              await createStoreAccess(data);
            }}
          />
          <StoresList stores={stores} />
        </div>

        <div className="content-grid admin-grid">
          <TournamentResultForm
            mode="admin"
            stores={stores}
            selected={selected}
            onSubmit={async (payload) => {
              if (payload.id) {
                await updateTournamentResult(payload.id, payload);
                setSelected(null);
                return;
              }

              await addTournamentResult({
                ...payload,
                createdBy: profile.uid,
              });
            }}
          />
          <ResultsTable
            results={results}
            editable
            onEdit={setSelected}
            onDelete={async (result) => {
              await deleteTournamentResult(result.id);
              if (selected?.id === result.id) setSelected(null);
            }}
          />
        </div>

        <ScoreTable players={standings} />
      </div>
    </Layout>
  );
}
