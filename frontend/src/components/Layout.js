import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaBolt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title = 'PredictBattle' }) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="شارك توقعاتك وتحدى الآخرين في لعبة تفاعلية ممتعة" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="app-container">
        <header className="main-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaBolt />
            </div>
            <div className="logo-text">PredictBattle</div>
          </div>
          
          {/* زر تسجيل الخروج يظهر فقط إذا كان المستخدم مسجل الدخول */}
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="logout-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '14px',
                cursor: 'pointer',
                position: 'absolute',
                left: '20px',
                top: '30px'
              }}
            >
              <FaSignOutAlt />
              <span>تسجيل الخروج</span>
            </button>
          )}
        </header>
        <main>{children}</main>
      </div>
    </>
  );
}