import Head from 'next/head';
import Link from 'next/link';
import { FaBolt } from 'react-icons/fa';

export default function Layout({ children, title = 'PredictBattle' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="PredictBattle - منصة التوقعات التفاعلية. شارك توقعاتك وتحدى الآخرين في بيئة تفاعلية ممتعة" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content="PredictBattle - منصة التوقعات التفاعلية. شارك توقعاتك وتحدى الآخرين" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#6366f1" />
      </Head>
      <div className="app-container">
        <header className="main-header">
          <Link href={typeof window !== "undefined" && localStorage.getItem('token') ? '/sessions' : '/'}>
            <div className="logo-container">
              <div className="logo-icon">
                <FaBolt />
              </div>
              <div className="logo-text">PredictBattle</div>
            </div>
          </Link>
        </header>
        <main>{children}</main>
        <footer style={{
          textAlign: 'center',
          padding: '20px 0',
          marginTop: '20px',
          fontSize: '14px',
          color: 'var(--medium)',
          opacity: 0.8
        }}>
          <p>PredictBattle &copy; {new Date().getFullYear()} - منصة التوقعات التفاعلية</p>
        </footer>
      </div>
    </>
  );
}