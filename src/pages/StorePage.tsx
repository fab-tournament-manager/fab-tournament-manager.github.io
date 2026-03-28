import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { ResultsTable } from '../components/ResultsTable';
import { TournamentResultForm } from '../components/AdminForms';
import { useAuth } from '../contexts/AuthContext';
import {
  addTournamentResult,
  deleteTournamentResult,
  subscribeToStoreResults,
  updateTournamentResult,
} from '../lib/firestoreService';
import type { TournamentResult } from '../types';

export function StorePage() {
  const { profile, logout } = useAuth();
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [selected, setSelected] = useState<TournamentResult | null>(null);

  useEffect(() => {
    if (!profile?.storeId) return;
    const unsubscribe = subscribeToStoreResults(profile.storeId, setResults);
    return unsubscribe;
  }, [profile?.storeId]);

  const totalScore = useMemo(() => results.reduce((acc, item) => acc + item.score, 0), [results]);

  if (!profile) return null;

  return (
    <Layout
      title={`Portal da loja ${profile.storeName ?? ''}`}
      subtitle="Cadastre e gerencie os resultados finais do torneio da sua loja"
      actions={<button className="button secondary" onClick={logout}>Sair</button>}
    >
      <div className="stats-grid">
        <article className="stat-card"><span>Loja</span><strong>{profile.storeName ?? '-'}</strong></article>
        <article className="stat-card"><span>Resultados enviados</span><strong>{results.length}</strong></article>
        <article className="stat-card"><span>Score somado</span><strong>{totalScore}</strong></article>
      </div>

      <div className="content-grid admin-grid">
        <div className="stack">
          <TournamentResultForm
            mode="store"
            currentStoreId={profile.storeId}
            currentStoreName={profile.storeName}
            stores={[]}
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
          <section className="card">
            <h2>Conta da loja</h2>
            <p className="muted">Os dados da loja agora ficam centralizados na aba "Meu perfil".</p>
            <div className="stack">
              <article className="stat-card">
                <span>Loja ativa</span>
                <strong>{profile.storeName ?? '-'}</strong>
              </article>
              <article className="stat-card">
                <span>ID da loja</span>
                <strong>{profile.storeId ?? '-'}</strong>
              </article>
            </div>
          </section>
        </div>

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
    </Layout>
  );
}
