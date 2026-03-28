import { useMemo, useState } from 'react';
import type { TournamentResult } from '../types';

export function ResultsTable({
  results,
  editable = false,
  onEdit,
  onDelete,
}: {
  results: TournamentResult[];
  editable?: boolean;
  onEdit?: (result: TournamentResult) => void;
  onDelete?: (result: TournamentResult) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return results.filter((item) =>
      [item.playerName, item.playerNickname, item.deck, item.tournamentName, item.storeName].join(' ').toLowerCase().includes(search.toLowerCase()),
    );
  }, [results, search]);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Resultados cadastrados</h2>
          <p>Lista de resultados finais enviados pelas lojas</p>
        </div>
        <input className="input" placeholder="Buscar resultado" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Torneio</th>
              <th>Jogador</th>
              <th>Deck</th>
              <th>Loja</th>
              <th>W</th>
              <th>L</th>
              <th>D</th>
              <th>Score</th>
              {editable && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.eventDate}</td>
                <td>{item.tournamentName}</td>
                <td>
                  <strong>{item.playerName}</strong>
                  <div className="muted">@{item.playerNickname}</div>
                </td>
                <td>{item.deck}</td>
                <td>{item.storeName}</td>
                <td>{item.wins}</td>
                <td>{item.losses}</td>
                <td>{item.draws}</td>
                <td>{item.score}</td>
                {editable && (
                  <td>
                    <div className="inline-actions">
                      <button className="button secondary" onClick={() => onEdit?.(item)}>Editar</button>
                      <button className="button danger" onClick={() => onDelete?.(item)}>Excluir</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
