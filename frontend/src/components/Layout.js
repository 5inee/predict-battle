import Head from 'next/head';
import Link from 'next/link';
import { FaBolt } from 'react-icons/fa';

export default function Layout({ children, title = 'PredictBattle' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="منصة PredictBattle - تحدي التوقعات والمنافسة في المعرفة والتخمين" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="app-container">
        <header className="main-header">
          <Link href="/">
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
          color: 'var(--medium)', 
          fontSize: '14px',
          marginTop: '20px'
        }}>
          <p>PredictBattle &copy; {new Date().getFullYear()} - منصة تحدي التوقعات</p>
        </footer>
      </div>
    </>
  );
}