// frontend/src/pages/Landing.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaLightbulb, FaChartLine, FaGamepad } from 'react-icons/fa';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>PredictBattle</h1>
          <h2>اختبر قدراتك في التوقع مع الأصدقاء</h2>
          <p>
            منصة تفاعلية تتيح لك إنشاء جلسات توقع مع أصدقائك ومشاركة الأفكار في بيئة تنافسية ممتعة.
          </p>
          
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                الذهاب للوحة التحكم
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  تسجيل الدخول
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>مميزات المنصة</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3>جلسات تفاعلية</h3>
            <p>أنشئ جلسات توقع واشترك مع أصدقائك في منافسة ممتعة.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaLightbulb />
            </div>
            <h3>أسئلة متنوعة</h3>
            <p>اطرح أي سؤال للتوقع، سواء كان رياضيًا، ثقافيًا، أو ترفيهيًا.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>تتبع النتائج</h3>
            <p>احتفظ بسجل لجميع جلساتك وتوقعاتك السابقة بسهولة.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaGamepad />
            </div>
            <h3>واجهة سهلة</h3>
            <p>استمتع بتجربة استخدام سلسة وممتعة على جميع الأجهزة.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>كيف تعمل المنصة</h2>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>أنشئ حسابًا</h3>
            <p>قم بإنشاء حساب بخطوات بسيطة باستخدام اسم مستخدم وكلمة مرور.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>أنشئ جلسة أو انضم إليها</h3>
            <p>يمكنك إنشاء جلسة توقع جديدة أو الانضمام إلى جلسة بواسطة كود.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>شارك توقعك</h3>
            <p>اكتب توقعك للسؤال المطروح وشاهد توقعات الآخرين.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>تفاعل مع الجلسات</h3>
            <p>استمتع بمناقشة التوقعات ومشاركة التجربة مع الأصدقاء.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>ابدأ الآن!</h2>
        <p>انضم إلى مجتمع PredictBattle وشارك في جلسات توقع ممتعة.</p>
        
        <div className="cta-buttons">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-large">
              الذهاب للوحة التحكم
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-large">
              أنشئ حسابك الآن
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;