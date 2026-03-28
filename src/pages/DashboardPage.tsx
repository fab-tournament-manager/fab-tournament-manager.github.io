import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { ScoreTable } from '../components/ScoreTable';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToAllResults } from '../lib/firestoreService';
import { computeStandings } from '../lib/standings';
import type { TournamentResult } from '../types';

export function DashboardPage() {
  const { profile, logout } = useAuth();
  const [results, setResults] = useState<TournamentResult[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToAllResults(setResults);
    return unsubscribe;
  }, []);

  const standings = useMemo(() => computeStandings(results), [results]);

  if (!profile) return null;

  return (
    <Layout
      title="Painel do jogador"
      subtitle="Veja o ranking geral dos jogadores"
      actions={<button className="button secondary" onClick={logout}>Sair</button>}
    >
      <div className="stats-grid">
        <article className="stat-card"><span>Resultados lançados</span><strong>{results.length}</strong></article>
        <article className="stat-card"><span>Líder atual</span><strong>{standings[0]?.playerNickname ?? '-'}</strong></article>
        <article className="stat-card"><span>Seu perfil</span><strong>Jogador</strong></article>
      </div>

      <div className="content-grid">
        <ScoreTable players={standings} />
        <section className="card">
          <h2>Resumo do seu acesso</h2>
          <p className="muted">Seu perfil agora fica disponível na aba separada "Meu perfil".</p>
          <div className="stack">
            <article className="stat-card">
              <span>Tipo de conta</span>
              <strong>Jogador</strong>
            </article>
            <article className="stat-card">
              <span>Nickname</span>
              <strong>{profile.nickname}</strong>
            </article>
          </div>
        </section>
      </div>
    </Layout>
  );
}
