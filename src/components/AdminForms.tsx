import { useEffect, useState } from 'react';
import type { TournamentResult, UserProfile } from '../types';

export function CreateStoreForm({
  onSubmit,
}: {
  onSubmit: (data: {
    name: string;
    nickname: string;
    email: string;
    password: string;
    storeName: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    storeName: '',
  });
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    await onSubmit(form);
    setForm({ name: '', nickname: '', email: '', password: '', storeName: '' });
    setMessage('Loja criada com sucesso. Faça login novamente com sua conta de administrador.');
  }

  return (
    <section className="card">
      <h2>Criar acesso de loja</h2>
      <p className="muted">Somente o administrador cria lojas. Cada loja recebe seu próprio login.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Responsável
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Nickname do responsável
          <input className="input" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required />
        </label>
        <label>
          Nome da loja
          <input className="input" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} required />
        </label>
        <label>
          Email da loja
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="full-span">
          Senha inicial
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <div className="full-span">
          <button className="button" type="submit">Criar loja</button>
        </div>
      </form>
      {message && <p className="feedback">{message}</p>}
    </section>
  );
}

export function StoresList({ stores }: { stores: UserProfile[] }) {
  return (
    <section className="card">
      <h2>Lojas cadastradas</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Loja</th>
              <th>Responsável</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.uid}>
                <td>{store.storeName}</td>
                <td>{store.name}</td>
                <td>{store.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const emptyResult = {
  playerName: '',
  playerNickname: '',
  deck: '',
  tournamentName: '',
  eventDate: '',
  score: 0,
  wins: 0,
  losses: 0,
  draws: 0,
};

export function TournamentResultForm({
  mode,
  currentStoreId,
  currentStoreName,
  stores,
  selected,
  onSubmit,
}: {
  mode: 'admin' | 'store';
  currentStoreId?: string;
  currentStoreName?: string;
  stores: UserProfile[];
  selected?: TournamentResult | null;
  onSubmit: (payload: {
    id?: string;
    playerName: string;
    playerNickname: string;
    deck: string;
    tournamentName: string;
    eventDate: string;
    score: number;
    wins: number;
    losses: number;
    draws: number;
    storeId: string;
    storeName: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    ...emptyResult,
    storeId: currentStoreId ?? '',
    storeName: currentStoreName ?? '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selected) {
      setForm({
        playerName: selected.playerName,
        playerNickname: selected.playerNickname,
        deck: selected.deck,
        tournamentName: selected.tournamentName,
        eventDate: selected.eventDate,
        score: selected.score,
        wins: selected.wins,
        losses: selected.losses,
        draws: selected.draws,
        storeId: selected.storeId,
        storeName: selected.storeName,
      });
      return;
    }

    setForm({
      ...emptyResult,
      storeId: currentStoreId ?? '',
      storeName: currentStoreName ?? '',
    });
  }, [selected, currentStoreId, currentStoreName]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    await onSubmit({
      id: selected?.id,
      ...form,
    });
    if (!selected) {
      setForm({
        ...emptyResult,
        storeId: currentStoreId ?? form.storeId,
        storeName: currentStoreName ?? form.storeName,
      });
    }
    setMessage(selected ? 'Resultado atualizado.' : 'Resultado lançado com sucesso.');
  }

  return (
    <section className="card">
      <h2>{selected ? 'Editar resultado' : 'Lançar resultado'}</h2>
      <p className="muted">Sem rodadas. Cada registro representa o resultado final de um torneio.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        {mode === 'admin' && (
          <label className="full-span">
            Loja responsável
            <select
              className="input"
              value={form.storeId}
              onChange={(e) => {
                const store = stores.find((item) => item.storeId === e.target.value);
                setForm((current) => ({
                  ...current,
                  storeId: e.target.value,
                  storeName: store?.storeName ?? '',
                }));
              }}
              required
            >
              <option value="">Selecione uma loja</option>
              {stores.map((store) => (
                <option key={store.uid} value={store.storeId}>{store.storeName}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Jogador
          <input className="input" value={form.playerName} onChange={(e) => setForm({ ...form, playerName: e.target.value })} required />
        </label>
        <label>
          Nickname
          <input className="input" value={form.playerNickname} onChange={(e) => setForm({ ...form, playerNickname: e.target.value })} required />
        </label>
        <label>
          Deck
          <input className="input" value={form.deck} onChange={(e) => setForm({ ...form, deck: e.target.value })} required />
        </label>
        <label>
          Torneio
          <input className="input" value={form.tournamentName} onChange={(e) => setForm({ ...form, tournamentName: e.target.value })} required />
        </label>
        <label>
          Data do evento
          <input className="input" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
        </label>
        <label>
          Score final
          <input className="input" type="number" min="0" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} required />
        </label>
        <label>
          Vitórias
          <input className="input" type="number" min="0" value={form.wins} onChange={(e) => setForm({ ...form, wins: Number(e.target.value) })} required />
        </label>
        <label>
          Derrotas
          <input className="input" type="number" min="0" value={form.losses} onChange={(e) => setForm({ ...form, losses: Number(e.target.value) })} required />
        </label>
        <label className="full-span">
          Empates
          <input className="input" type="number" min="0" value={form.draws} onChange={(e) => setForm({ ...form, draws: Number(e.target.value) })} required />
        </label>
        <div className="full-span">
          <button className="button" type="submit">{selected ? 'Salvar alterações' : 'Salvar resultado'}</button>
        </div>
      </form>
      {message && <p className="feedback">{message}</p>}
    </section>
  );
}
