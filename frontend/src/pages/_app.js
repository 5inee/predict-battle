import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // تتبع تغييرات المسار لإضافة تأثيرات الانتقال
  useEffect(() => {
    const handleRouteChangeStart = () => {
      // يمكن إضافة أنماط للتحميل هنا
      document.body.classList.add('page-transition');
    };

    const handleRouteChangeComplete = () => {
      // إزالة أنماط التحميل
      document.body.classList.remove('page-transition');
      
      // تمرير للأعلى عند تغيير الصفحة
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;