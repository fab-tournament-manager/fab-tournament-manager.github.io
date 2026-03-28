import { Layout } from '../components/Layout';
import { ProfileForm } from '../components/ProfileForm';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/firestoreService';

function getRoleLabel(role: string) {
  if (role === 'admin') return 'Administrador';
  if (role === 'store') return 'Loja';
  return 'Jogador';
}

export function ProfilePage() {
  const { profile, logout, reloadProfile } = useAuth();

  if (!profile) return null;

  return (
    <Layout
      title="Meu perfil"
      subtitle="Atualize suas informações em uma aba dedicada"
      actions={<button className="button secondary" onClick={logout}>Sair</button>}
    >
      <div className="stats-grid">
        <article className="stat-card"><span>Perfil</span><strong>{getRoleLabel(profile.role)}</strong></article>
        <article className="stat-card"><span>Email</span><strong>{profile.email}</strong></article>
        {profile.role !== 'store' && (
          <article className="stat-card"><span>GEM ID</span><strong>{profile.gemId || '-'}</strong></article>
        )}
        <article className="stat-card"><span>Nickname</span><strong>{profile.nickname}</strong></article>
        {profile.role !== 'store' && (
          <article className="stat-card"><span>Decks cadastrados</span><strong>{profile.favoriteDecks?.length ?? 0}</strong></article>
        )}
      </div>

      <ProfileForm
        profile={profile}
        onSave={async (data) => {
          await updateUserProfile(profile.uid, data);
          await reloadProfile();
        }}
      />
    </Layout>
  );
}
