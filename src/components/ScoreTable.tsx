import { useMemo, useState } from 'react';
import type { StandingRow } from '../types';

interface ScoreTableProps {
  players: StandingRow[];
}

export function ScoreTable({ players }: ScoreTableProps) {
  const [search, setSearch] = useState('');

  const filteredPlayers = useMemo(() => {
    return players.filter((player) =>
      [player.playerName, player.playerNickname, player.deck, player.stores.join(' ')].join(' ').toLowerCase().includes(search.toLowerCase()),
    );
  }, [players, search]);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Tabela de pontuação</h2>
          <p>Ranking geral consolidado dos participantes</p>
        </div>
        <input
          className="input"
          placeholder="Buscar participante"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Jogador</th>
              <th>Deck</th>
              <th>Eventos</th>
              <th>Vitórias</th>
              <th>Derrotas</th>
              <th>Empates</th>
              <th>Score</th>
              <th>Lojas</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr key={player.id}>
                <td>{player.rank}</td>
                <td>
                  <strong>{player.playerName}</strong>
                  <div className="muted">@{player.playerNickname}</div>
                </td>
                <td>{player.deck}</td>
                <td>{player.events}</td>
                <td>{player.totalWins}</td>
                <td>{player.totalLosses}</td>
                <td>{player.totalDraws}</td>
                <td>{player.totalScore}</td>
                <td>{player.stores.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
