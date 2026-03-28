import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { profile } = useAuth();

  const tabs = [
    profile
      ? { to: '/profile', label: 'Meu perfil' }
      : null,
    profile?.role === 'player' || profile?.role === 'admin'
      ? { to: '/dashboard', label: 'Jogador' }
      : null,
    profile?.role === 'store'
      ? { to: '/store', label: 'Loja' }
      : null,
    profile?.role === 'admin'
      ? { to: '/admin', label: 'Administração' }
      : null,
  ].filter(Boolean) as Array<{ to: string; label: string }>;

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions}
      </header>
      {tabs.length > 0 && (
        <nav className="tabs-nav" aria-label="Navegação interna">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}
      {children}
    </div>
  );
}
