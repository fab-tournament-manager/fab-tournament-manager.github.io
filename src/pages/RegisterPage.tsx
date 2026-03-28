import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const { register, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    email: '',
    gemId: '',
    password: '',
    favoriteDeck: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!form.gemId.trim()) {
      setError('O GEM ID é obrigatório para cadastrar com Google.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await googleSignIn({ gemId: form.gemId });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Criar conta de jogador</h1>
        <p>Você também pode criar sua conta usando o Google, mas o GEM ID continua obrigatório.</p>
        <label>
          GEM ID
          <input className="input" value={form.gemId} onChange={(e) => setForm({ ...form, gemId: e.target.value })} required />
        </label>
        <button className="button google-button" type="button" onClick={handleGoogleSignIn} disabled={loading}>
          <span className="google-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.8 2.4 2.6 6.7 2.6 12s4.2 9.6 9.4 9.6c5.4 0 9-3.8 9-9.1 0-.6-.1-1.1-.2-1.6H12Z" />
              <path fill="#34A853" d="M2.6 12c0 1.7.4 3.2 1.2 4.6l3.8-2.9c-.2-.5-.4-1.1-.4-1.7s.1-1.2.4-1.7L3.8 7.4C3 8.8 2.6 10.3 2.6 12Z" />
              <path fill="#FBBC05" d="M12 21.6c2.5 0 4.7-.8 6.3-2.3l-3.1-2.4c-.8.6-1.9 1.1-3.2 1.1-2.5 0-4.6-1.7-5.4-4l-3.8 2.9c1.6 3 4.8 4.7 9.2 4.7Z" />
              <path fill="#4285F4" d="M18.3 19.3c1.8-1.7 2.7-4.1 2.7-6.8 0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.4-1.1 2.6-2.3 3.4l3.2 2.5Z" />
            </svg>
          </span>
          <span>{loading ? 'Entrando...' : 'Cadastrar com Google'}</span>
        </button>
        <div className="auth-divider" aria-hidden="true">
          <span>ou cadastre com email</span>
        </div>
        <label>
          Nome
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Nickname
          <input className="input" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required />
        </label>
        <label>
          Email
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Deck favorito
          <input className="input" value={form.favoriteDeck} onChange={(e) => setForm({ ...form, favoriteDeck: e.target.value })} required />
        </label>
        <label>
          Senha
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
        {error && <p className="error-text">{error}</p>}
        <p className="muted">
          Já possui conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
