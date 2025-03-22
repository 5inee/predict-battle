# Dockerfile للمشروع

# مرحلة بناء الواجهة الأمامية
FROM node:16 as frontend-build

# تعيين دليل العمل
WORKDIR /app/frontend

# نسخ ملفات النصوص للواجهة الأمامية واعتمادياتها
COPY frontend/package*.json ./

# تثبيت الاعتماديات
RUN npm install

# نسخ بقية ملفات الواجهة الأمامية
COPY frontend/ ./

# إصلاح مشكلة ملف CSS المفقود (إذا لم يكن موجودًا)
RUN mkdir -p src/styles && touch src/App.css

# بناء التطبيق
RUN npm run build

# مرحلة بناء الخادم الخلفي وتشغيل التطبيق
FROM node:16-slim

# تعيين دليل العمل
WORKDIR /app

# نسخ ملفات النصوص للخادم الخلفي واعتمادياتها
COPY backend/package*.json ./

# تثبيت اعتماديات الإنتاج فقط
RUN npm install --production

# نسخ بقية ملفات الخادم الخلفي
COPY backend/ ./

# نسخ ملفات البناء من مرحلة بناء الواجهة الأمامية
COPY --from=frontend-build /app/frontend/build ./public

# تعيين متغيرات البيئة
ENV NODE_ENV=production
ENV PORT=8080

# تعريض المنفذ
EXPOSE 8080

# تشغيل التطبيق
CMD ["node", "server.js"]