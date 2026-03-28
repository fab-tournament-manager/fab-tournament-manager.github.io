import { useEffect, useMemo, useState } from 'react';
import type { FavoriteDeck, UserProfile } from '../types';

interface FavoriteDeckFormItem {
  id: string;
  name: string;
  cardsText: string;
  isPrimary: boolean;
}

function createDeckId() {
  return `deck-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDeckFormItems(profile: UserProfile): FavoriteDeckFormItem[] {
  const favoriteDecks = profile.favoriteDecks && profile.favoriteDecks.length > 0
    ? profile.favoriteDecks
    : profile.favoriteDeck
      ? [{ id: createDeckId(), name: profile.favoriteDeck, cards: [], isPrimary: true }]
      : [];

  return favoriteDecks.map((deck, index) => ({
    id: deck.id || `deck-${index + 1}`,
    name: deck.name,
    cardsText: deck.cards.join('\n'),
    isPrimary: Boolean(deck.isPrimary) || index === 0,
  })).map((deck, index, decks) => ({
    ...deck,
    isPrimary: decks.some((item) => item.isPrimary) ? deck.isPrimary : index === 0,
  }));
}

function toFavoriteDecks(decks: FavoriteDeckFormItem[]): FavoriteDeck[] {
  const filteredDecks = decks
    .map((deck) => ({
      id: deck.id,
      name: deck.name.trim(),
      cards: deck.cardsText
        .split('\n')
        .map((card) => card.trim())
        .filter(Boolean),
      isPrimary: deck.isPrimary,
    }))
    .filter((deck) => deck.name);

  const primaryIndex = filteredDecks.findIndex((deck) => deck.isPrimary);
  return filteredDecks.map((deck, index) => ({
    ...deck,
    isPrimary: primaryIndex === -1 ? index === 0 : index === primaryIndex,
  }));
}

export function ProfileForm({
  profile,
  onSave,
}: {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}) {
  const initial = useMemo(() => ({
    name: profile.name,
    nickname: profile.nickname,
    gemId: profile.gemId ?? '',
    favoriteDecks: toDeckFormItems(profile),
  }), [profile.favoriteDeck, profile.favoriteDecks, profile.gemId, profile.name, profile.nickname]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const favoriteDecks = toFavoriteDecks(form.favoriteDecks);
      await onSave({
        name: form.name,
        nickname: form.nickname,
        gemId: form.gemId.trim(),
        favoriteDecks,
        favoriteDeck: favoriteDecks.find((deck) => deck.isPrimary)?.name ?? favoriteDecks[0]?.name ?? '',
      });
      setMessage('Perfil atualizado com sucesso.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <h2>Meu perfil</h2>
      <p className="muted">Atualize suas informações pessoais.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            className="input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label>
          Nickname
          <input
            className="input"
            value={form.nickname}
            onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
          />
        </label>
        {profile.role !== 'store' && (
          <label>
            GEM ID
            <input
              className="input"
              value={form.gemId}
              onChange={(event) => setForm((current) => ({ ...current, gemId: event.target.value }))}
              required
            />
          </label>
        )}
        {profile.role !== 'store' && (
          <div className="full-span deck-builder">
            <div className="section-header compact">
              <div>
                <h2>Lista de decks</h2>
                <p className="muted">Cadastre seus decks e marque um deles como deck principal.</p>
              </div>
              <button
                className="button secondary"
                type="button"
                onClick={() => setForm((current) => ({
                  ...current,
                  favoriteDecks: [
                    ...current.favoriteDecks,
                    {
                      id: createDeckId(),
                      name: '',
                      cardsText: '',
                      isPrimary: current.favoriteDecks.length === 0,
                    },
                  ],
                }))}
              >
                Adicionar deck
              </button>
            </div>

            {form.favoriteDecks.length === 0 && (
              <p className="muted">Nenhum deck cadastrado ainda.</p>
            )}

            <div className="deck-list">
              {form.favoriteDecks.map((deck, index) => (
                <article key={deck.id} className="deck-card">
                  <div className="deck-card-header">
                    <strong>Deck {index + 1}</strong>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setForm((current) => {
                        const nextDecks = current.favoriteDecks.filter((item) => item.id !== deck.id);
                        return {
                          ...current,
                          favoriteDecks: nextDecks.map((item, itemIndex) => ({
                            ...item,
                            isPrimary: nextDecks.some((candidate) => candidate.isPrimary)
                              ? item.isPrimary && item.id !== deck.id
                              : itemIndex === 0,
                          })),
                        };
                      })}
                    >
                      Remover
                    </button>
                  </div>
                  <label className="deck-primary-toggle">
                    <input
                      type="radio"
                      name="primaryDeck"
                      checked={deck.isPrimary}
                      onChange={() => setForm((current) => ({
                        ...current,
                        favoriteDecks: current.favoriteDecks.map((item) => ({
                          ...item,
                          isPrimary: item.id === deck.id,
                        })),
                      }))}
                    />
                    <span>Definir como deck principal</span>
                  </label>
                  <label>
                    Nome do deck
                    <input
                      className="input"
                      value={deck.name}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        favoriteDecks: current.favoriteDecks.map((item) => (
                          item.id === deck.id ? { ...item, name: event.target.value } : item
                        )),
                      }))}
                    />
                  </label>
                  <label>
                    Lista de cartas
                    <textarea
                      className="input deck-cards-input"
                      value={deck.cardsText}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        favoriteDecks: current.favoriteDecks.map((item) => (
                          item.id === deck.id ? { ...item, cardsText: event.target.value } : item
                        )),
                      }))}
                      placeholder={"Uma carta por linha\nEx.: Fyendal's Spring Tunic"}
                    />
                  </label>
                </article>
              ))}
            </div>
          </div>
        )}
        <div className="full-span">
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>

      {message && <p className="feedback">{message}</p>}
    </section>
  );
}
