# NEXURA&RB - منصة التسويق الرقمي الذكي

## نظرة عامة

**NEXURA&RB** هي منصة تسويق رقمي متكاملة مبنية بتقنيات حديثة، تجمع بين الذكاء الاصطناعي وأدوات التسويق الرقمي في واجهة سايبربانك احترافية.

---

## الميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| **لوحة التحكم** | إحصائيات فورية للمتاجر والحملات والإيرادات |
| **تحسين SEO** | تحليل الكلمات المفتاحية والميتا تاجز باستخدام الذكاء الاصطناعي |
| **الحملات الإعلانية** | إنشاء وإدارة حملات Meta Ads مع جدولة ومتابعة الأداء |
| **ربط المتاجر** | ربط المتاجر بـ Facebook, Instagram, Twitter للنشر التلقائي |
| **المحاسب المالي** | روبو ذكي لتحليل الإيرادات والمصروفات وتقديم توصيات |
| **تحليل الزيارات** | إحصائيات تفصيلية للزوار ومصادر الزيارات ومعدل التحويل |
| **توليد النصوص** | توليد نصوص إعلانية إبداعية بالذكاء الاصطناعي |
| **المساعد الذكي** | روبوت نيكسورا يرحب بالعملاء ويشرح ميزات المنصة |
| **التنبيهات** | إشعارات تلقائية للمالك عند الأحداث المهمة |
| **تخزين الملفات** | رفع وتخزين الصور والفيديوهات والمواد التسويقية بأمان |

---

## التقنيات المستخدمة

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express.js + tRPC 11
- **Database**: MySQL / TiDB (Drizzle ORM)
- **AI**: Manus Built-in LLM (GPT-compatible)
- **Storage**: AWS S3
- **Auth**: Manus OAuth
- **Charts**: Recharts
- **Deployment**: Vercel / Manus Hosting

---

## هيكل المشروع

```
nexura-rb/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # الصفحة الرئيسية
│   │   │   ├── Dashboard.tsx     # لوحة التحكم
│   │   │   ├── SEO.tsx           # تحسين SEO
│   │   │   ├── Campaigns.tsx     # الحملات الإعلانية
│   │   │   ├── Finance.tsx       # المحاسب المالي
│   │   │   └── Stores.tsx        # المتاجر والتحليلات
│   │   ├── components/
│   │   │   ├── CyberLayout.tsx   # تخطيط سايبربانك
│   │   │   └── AIAssistant.tsx   # روبوت المساعد
│   │   └── App.tsx               # التوجيه الرئيسي
├── server/
│   ├── routers.ts                # جميع API endpoints
│   └── db.ts                     # استعلامات قاعدة البيانات
├── drizzle/
│   └── schema.ts                 # مخطط قاعدة البيانات
├── vercel.json                   # إعداد Vercel
└── todo.md                       # قائمة المهام
```

---

## النشر على Vercel

### الخطوات:

1. **رفع الكود إلى GitHub**:
```bash
git init
git add .
git commit -m "Initial commit: NEXURA&RB Platform"
git remote add origin https://github.com/yourusername/nexura-rb.git
git push -u origin main
```

2. **ربط المشروع بـ Vercel**:
   - اذهب إلى [vercel.com](https://vercel.com)
   - اختر "Import Project" وحدد المستودع
   - أضف متغيرات البيئة من `.env.example`

3. **متغيرات البيئة المطلوبة**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `VITE_APP_ID`
   - `BUILT_IN_FORGE_API_KEY`
   - `BUILT_IN_FORGE_API_URL`

---

## التطوير المحلي

```bash
# تثبيت الحزم
pnpm install

# تشغيل قاعدة البيانات
pnpm db:push

# تشغيل السيرفر
pnpm dev

# بناء المشروع
pnpm build

# تشغيل الاختبارات
pnpm test
```

---

## التصميم

المنصة تستخدم تصميم **Cyberpunk** مع:
- خلفية سوداء عميقة
- إضاءة نيون وردي زاهي (`oklch(0.65 0.35 340)`)
- لون سماوي كهربائي (`oklch(0.75 0.25 195)`)
- خطوط هندسية بأسلوب HUD تقني
- تأثيرات توهج خارجي قوية
- عناصر واجهة بأسلوب مستقبلي

---

## الترخيص

MIT License - NEXURA&RB © 2026
