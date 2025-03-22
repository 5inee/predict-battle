# منصة PredictBattle

منصة تفاعلية تتيح للمستخدمين اختبار قدراتهم في التوقع ضمن جلسات لعب منظمة.

## مميزات التطبيق

- إنشاء حسابات مستخدمين
- إنشاء جلسات توقع
- الانضمام للجلسات عبر رمز خاص
- إرسال توقعات وعرض توقعات الآخرين
- متابعة الجلسات السابقة
- واجهة سلسة وسهلة الاستخدام

## التقنيات المستخدمة

- **الواجهة الأمامية**: React, React Router, Axios
- **الخادم الخلفي**: Node.js, Express
- **قاعدة البيانات**: MongoDB
- **المصادقة**: JWT

## خطوات التشغيل

### المتطلبات الأساسية

- Node.js (النسخة 14 أو أعلى)
- npm (النسخة 6 أو أعلى)
- MongoDB (محلي أو عن بعد)

### تثبيت التطبيق وتشغيله محلياً

1. **استنساخ المشروع**

```bash
git clone https://github.com/yourusername/predict-battle.git
cd predict-battle
```

2. **تثبيت الاعتماديات الرئيسية**

```bash
npm install
```

3. **تثبيت اعتماديات الخادم الخلفي**

```bash
cd backend
npm install
cd ..
```

4. **تثبيت اعتماديات الواجهة الأمامية**

```bash
cd frontend
npm install
cd ..
```

5. **تعديل متغيرات البيئة**

قم بإنشاء ملف `.env` في مجلد `backend` وأضف المتغيرات البيئية:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/predict-battle
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

6. **تشغيل التطبيق في وضع التطوير**

```bash
npm run dev
```

هذا سيقوم بتشغيل كل من الخادم الخلفي (على المنفذ 5000) والواجهة الأمامية (على المنفذ 3000) بشكل متزامن.

### النشر على Railway

1. **إنشاء حساب على Railway**

قم بإنشاء حساب على [Railway](https://railway.app/) إذا لم يكن لديك حساب.

2. **تثبيت CLI الخاص بـ Railway**

```bash
npm i -g @railway/cli
```

3. **تسجيل الدخول إلى Railway**

```bash
railway login
```

4. **ربط المشروع**

```bash
railway init
```

5. **إضافة متغيرات البيئة**

قم بإضافة متغيرات البيئة التالية إلى مشروعك على Railway:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

6. **نشر المشروع**

```bash
railway up
```

## هيكل المشروع

```
predict-battle/
├── backend/                 # الخادم الخلفي
│   ├── controllers/         # متحكمات لمعالجة الطلبات
│   ├── middleware/          # وسائط المصادقة والخطأ
│   ├── models/              # نماذج قاعدة البيانات
│   ├── routes/              # مسارات API
│   ├── config/              # ملفات التكوين
│   └── server.js            # نقطة دخول الخادم
│
├── frontend/                # الواجهة الأمامية
│   ├── public/              # الملفات العامة
│   └── src/                 # كود المصدر
│       ├── api/             # خدمات الاتصال بـ API
│       ├── components/      # المكونات القابلة لإعادة الاستخدام
│       ├── context/         # مزودو السياق
│       ├── pages/           # صفحات التطبيق
│       └── styles/          # ملفات CSS
│
└── README.md                # توثيق المشروع
```

## واجهات البرمجة (API Endpoints)

### المصادقة

- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - الحصول على بيانات المستخدم الحالي

### الجلسات

- `POST /api/sessions/create` - إنشاء جلسة جديدة
- `POST /api/sessions/join` - الانضمام إلى جلسة
- `POST /api/sessions/predict` - إرسال توقع
- `GET /api/sessions/:sessionId` - الحصول على تفاصيل جلسة
- `GET /api/sessions` - الحصول على جلسات المستخدم

## المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. قم بعمل fork للمشروع
2. قم بإنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. قم بإجراء التغييرات
4. قم بعمل commit للتغييرات (`git commit -m 'إضافة ميزة رائعة'`)
5. قم بدفع التغييرات إلى الفرع (`git push origin feature/amazing-feature`)
6. قم بفتح طلب سحب (Pull Request)

## الترخيص

هذا المشروع مرخص تحت [رخصة MIT](LICENSE).