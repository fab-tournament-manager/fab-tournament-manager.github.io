import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GEM_ID_REQUIRED_ERROR = 'Para cadastrar com Google, preencha o GEM ID na tela de cadastro.';

export function LoginPage() {
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gemId, setGemId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleClick() {
    setError('');
    setLoading(true);

    try {
      await googleSignIn();
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao entrar com Google.';

      if (message === GEM_ID_REQUIRED_ERROR) {
        setGoogleModalOpen(true);
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignInWithGemId() {
    setError('');
    setLoading(true);

    try {
      await googleSignIn({ gemId });
      setGoogleModalOpen(false);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-stack">
        <img className="auth-logo auth-logo-outside" src="/fab-tournaments-logo.png" alt="FAB Tournaments" />
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>FAB Tournament Manager</h1>
          <label>
            Email
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Senha
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button className="button google-button" type="button" onClick={handleGoogleClick} disabled={loading}>
            <span className="google-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.8 2.4 2.6 6.7 2.6 12s4.2 9.6 9.4 9.6c5.4 0 9-3.8 9-9.1 0-.6-.1-1.1-.2-1.6H12Z" />
                <path fill="#34A853" d="M2.6 12c0 1.7.4 3.2 1.2 4.6l3.8-2.9c-.2-.5-.4-1.1-.4-1.7s.1-1.2.4-1.7L3.8 7.4C3 8.8 2.6 10.3 2.6 12Z" />
                <path fill="#FBBC05" d="M12 21.6c2.5 0 4.7-.8 6.3-2.3l-3.1-2.4c-.8.6-1.9 1.1-3.2 1.1-2.5 0-4.6-1.7-5.4-4l-3.8 2.9c1.6 3 4.8 4.7 9.2 4.7Z" />
                <path fill="#4285F4" d="M18.3 19.3c1.8-1.7 2.7-4.1 2.7-6.8 0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.4-1.1 2.6-2.3 3.4l3.2 2.5Z" />
              </svg>
            </span>
            <span>{loading ? 'Entrando...' : 'Entrar com Google'}</span>
          </button>
          {error && <p className="error-text">{error}</p>}
          <p className="muted">
            Ainda não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </form>
      </div>

      {googleModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => !loading && setGoogleModalOpen(false)}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="google-gemid-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="google-gemid-title">Primeiro acesso com Google</h2>
            <p className="muted">
              Informe o GEM ID para concluir o cadastro desta conta Google.
            </p>
            <label>
              GEM ID
              <input
                className="input"
                value={gemId}
                onChange={(event) => setGemId(event.target.value)}
                placeholder="Obrigatório no primeiro acesso"
              />
            </label>
            <div className="inline-actions modal-actions">
              <button className="button secondary" type="button" onClick={() => setGoogleModalOpen(false)} disabled={loading}>
                Cancelar
              </button>
              <button className="button google-button" type="button" onClick={handleGoogleSignInWithGemId} disabled={loading}>
                {loading ? 'Entrando...' : 'Continuar com Google'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
