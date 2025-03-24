import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaBolt, FaSignOutAlt, FaUser, FaRegSmile } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Layout({ children, title = 'PredictBattle' }) {
  const router = useRouter();
  const { isAuthenticated, logout, user, isGuest } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    // لا نحتاج إلى إعادة تعيين حالة setLoggingOut لأن المكون سيتم إعادة تحميله بعد تسجيل الخروج
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
          <div className="logo-container" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <FaBolt />
            </div>
            <div className="logo-text">PredictBattle</div>
          </div>

          {isAuthenticated() && (
            <div className="user-controls">
              {user && (
                <div className={`username-display ${isGuest ? 'guest-user' : ''}`}>
                  {isGuest ? <FaRegSmile style={{ marginLeft: '5px' }} /> : <FaUser style={{ marginLeft: '5px' }} />}
                  {user.username}
                  {isGuest && <span className="guest-indicator">ضيف</span>}
                </div>
              )}
              <button 
                onClick={handleLogout} 
                className="logout-btn"
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <>
                    <div className="loading"></div>
                    <span>جار تسجيل الخروج...</span>
                  </>
                ) : (
                  <>
                    <FaSignOutAlt /> تسجيل الخروج
                  </>
                )}
              </button>
            </div>
          )}
        </header>
        <main>{children}</main>
        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          marginTop: '40px',
          color: 'var(--medium)',
          fontSize: '14px'
        }}>
          <p>PredictBattle © 2025 - منصة التوقعات التفاعلية</p>
        </footer>
      </div>
    </>
  );
};