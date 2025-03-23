import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaBolt, FaSignOutAlt } from 'react-icons/fa'; // إضافة أيقونة تسجيل الخروج
import { useAuth } from '../context/AuthContext'; // استيراد سياق المصادقة

export default function Layout({ children, title = 'PredictBattle' }) {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth(); // استخدام hook المصادقة

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

          {/* إضافة زر تسجيل الخروج إذا كان المستخدم مسجل دخول */}
          {isAuthenticated() && (
            <div className="user-controls">
              {user && <span className="username-display">{user.username}</span>}
              <button onClick={logout} className="logout-btn">
                <FaSignOutAlt /> تسجيل الخروج
              </button>
            </div>
          )}
        </header>
        <main>{children}</main>
      </div>
    </>
  );
}