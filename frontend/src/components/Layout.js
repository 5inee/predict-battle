import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaBolt } from 'react-icons/fa';

export default function Layout({ children, title = 'PredictBattle' }) {
  const router = useRouter();

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
        </header>
        <main>{children}</main>
      </div>
    </>
  );
}