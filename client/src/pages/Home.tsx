import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Zap, Target, BarChart3, ShoppingBag, Brain, Globe,
  ArrowLeft, Shield, TrendingUp, Users, Star, ChevronDown,
  Megaphone, Bot, DollarSign, Share2, Search
} from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "لوحة تحكم ذكية",
    desc: "إحصائيات شاملة وتحليلات فورية لأداء متاجرك",
    color: "neon-pink",
    border: "border-[oklch(0.65_0.35_340/0.4)]",
    glow: "oklch(0.65 0.35 340)",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "تحسين SEO",
    desc: "تحليل الكلمات المفتاحية واقتراحات تحسين المحتوى",
    color: "neon-cyan",
    border: "border-[oklch(0.75_0.25_195/0.4)]",
    glow: "oklch(0.75 0.25 195)",
  },
  {
    icon: <Megaphone className="w-6 h-6" />,
    title: "حملات Meta Ads",
    desc: "إنشاء وإدارة حملات Facebook و Instagram",
    color: "neon-pink",
    border: "border-[oklch(0.65_0.35_340/0.4)]",
    glow: "oklch(0.65 0.35 340)",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: "ربط وسائل التواصل",
    desc: "نشر المنتجات تلقائياً على جميع المنصات",
    color: "neon-cyan",
    border: "border-[oklch(0.75_0.25_195/0.4)]",
    glow: "oklch(0.75 0.25 195)",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "محاسب مالي ذكي",
    desc: "تحليل الإيرادات والمصروفات بالذكاء الاصطناعي",
    color: "neon-pink",
    border: "border-[oklch(0.65_0.35_340/0.4)]",
    glow: "oklch(0.65 0.35 340)",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "مساعد ذكاء اصطناعي",
    desc: "روبوت شخصي يرحب ويشرح ويجيب على أسئلتك",
    color: "neon-cyan",
    border: "border-[oklch(0.75_0.25_195/0.4)]",
    glow: "oklch(0.75 0.25 195)",
  },
];

const stats = [
  { value: "500+", label: "متجر مربوط", icon: <ShoppingBag className="w-5 h-5" /> },
  { value: "10K+", label: "حملة ناجحة", icon: <Target className="w-5 h-5" /> },
  { value: "98%", label: "رضا العملاء", icon: <Star className="w-5 h-5" /> },
  { value: "3X", label: "نمو المبيعات", icon: <TrendingUp className="w-5 h-5" /> },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden cyber-grid">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[oklch(0.65_0.35_340/0.2)] bg-[oklch(0.06_0.01_240/0.9)] backdrop-blur-md">
        <div className="container flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 border border-[oklch(0.65_0.35_340/0.6)] rotate-45 pulse-neon" />
              <Zap className="w-5 h-5 text-[oklch(0.65_0.35_340)]" />
            </div>
            <div>
              <span className="font-cyber text-lg gradient-text-cyber font-bold tracking-widest flicker">
                NEXURA
              </span>
              <span className="font-cyber text-lg text-[oklch(0.75_0.25_195)] font-bold tracking-widest">
                &RB
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {["الميزات", "التسعير", "الدعم"].map((item) => (
              <button
                key={item}
                className="font-rajdhani text-sm text-muted-foreground hover:text-[oklch(0.65_0.35_340)] transition-colors uppercase tracking-wider"
              >
                {item}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-neon px-5 py-2 text-sm rounded"
              >
                لوحة التحكم
              </button>
            ) : (
              <>
                <a
                  href={getLoginUrl()}
                  className="font-rajdhani text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  تسجيل الدخول
                </a>
                <a
                  href={getLoginUrl()}
                  className="btn-neon px-5 py-2 text-sm rounded"
                >
                  ابدأ مجاناً
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.65_0.35_340/0.06)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.75_0.25_195/0.06)] blur-3xl pointer-events-none" />

        {/* Horizontal scan line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.35_340/0.3)] to-transparent pointer-events-none" />

        <div className="container text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-[oklch(0.75_0.25_195/0.4)] rounded-full bg-[oklch(0.75_0.25_195/0.05)]"
          >
            <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.25_195)] pulse-neon" />
            <span className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest uppercase">
              منصة التسويق الذكي - الجيل القادم
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-cyber font-black mb-6 leading-tight"
          >
            <span className="gradient-text-cyber flicker">NEXURA</span>
            <span className="text-[oklch(0.75_0.25_195)]">&RB</span>
            <br />
            <span className="text-2xl md:text-4xl text-foreground/80 font-light tracking-widest">
              منصة التسويق الرقمي المتكاملة
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 font-rajdhani leading-relaxed"
          >
            أدر متاجرك، أطلق حملاتك الإعلانية، وحلل أداءك المالي بقوة الذكاء الاصطناعي.
            كل شيء في مكان واحد — مستقبل التسويق الرقمي بين يديك.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <a
              href={isAuthenticated ? "/dashboard" : getLoginUrl()}
              onClick={isAuthenticated ? (e) => { e.preventDefault(); navigate("/dashboard"); } : undefined}
              className="btn-neon px-8 py-3 text-base rounded flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              ابدأ الآن مجاناً
            </a>
            <button className="btn-neon-cyan px-8 py-3 text-base rounded flex items-center gap-2">
              <Globe className="w-4 h-4" />
              شاهد العرض التجريبي
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="hud-box p-4 text-center rounded">
                <div className="flex justify-center mb-2 text-[oklch(0.65_0.35_340)]">{stat.icon}</div>
                <div className="font-cyber text-2xl font-bold gradient-text-cyber">{stat.value}</div>
                <div className="font-rajdhani text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ duration: 2, delay: 1.5, repeat: Infinity }}
            className="mt-16 flex justify-center"
          >
            <ChevronDown className="w-6 h-6 text-[oklch(0.65_0.35_340/0.5)]" />
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 relative">
        <div className="cyber-divider mb-16" />
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[oklch(0.65_0.35_340/0.3)] rounded mb-4">
              <span className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// CORE_MODULES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-cyber font-bold gradient-text-cyber mb-4">
              كل ما تحتاجه في منصة واحدة
            </h2>
            <p className="text-muted-foreground font-rajdhani max-w-xl mx-auto">
              أدوات تسويقية متكاملة مدعومة بالذكاء الاصطناعي لتنمية أعمالك بشكل أسرع
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="hud-box p-6 rounded group cursor-pointer"
                style={{ transition: "box-shadow 0.3s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 25px ${feat.glow}30`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded mb-4 border ${feat.border}`}
                  style={{ background: `${feat.glow}10` }}
                >
                  <span className={feat.color}>{feat.icon}</span>
                </div>
                <h3 className="font-cyber text-base font-bold text-foreground mb-2 group-hover:text-[oklch(0.65_0.35_340)] transition-colors">
                  {feat.title}
                </h3>
                <p className="font-rajdhani text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[oklch(0.65_0.35_340)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-tech text-xs">استكشف</span>
                  <ArrowLeft className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="cyber-divider mt-16" />
      </section>

      {/* ===== AI SECTION ===== */}
      <section className="py-24 relative">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[oklch(0.55_0.30_290/0.4)] rounded mb-6">
                <Brain className="w-3 h-3 text-[oklch(0.55_0.30_290)]" />
                <span className="font-tech text-xs text-[oklch(0.55_0.30_290)] tracking-widest">// AI_POWERED</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-6">
                <span className="text-foreground">ذكاء اصطناعي</span>
                <br />
                <span className="gradient-text-cyber">يعمل لصالحك</span>
              </h2>
              <p className="font-rajdhani text-muted-foreground text-lg leading-relaxed mb-8">
                من توليد النصوص الإعلانية الإبداعية إلى تحليل أداء متجرك المالي، يعمل نظام الذكاء الاصطناعي المدمج على مدار الساعة لتحقيق أقصى نتائج لحملاتك.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Brain className="w-4 h-4" />, text: "توليد نصوص إعلانية إبداعية تلقائياً" },
                  { icon: <BarChart3 className="w-4 h-4" />, text: "تحليل مالي ذكي وتقارير تفصيلية" },
                  { icon: <Target className="w-4 h-4" />, text: "استهداف دقيق للجمهور المناسب" },
                  { icon: <Shield className="w-4 h-4" />, text: "تنبيهات فورية عند أي مشكلة" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center border border-[oklch(0.65_0.35_340/0.3)] rounded text-[oklch(0.65_0.35_340)]">
                      {item.icon}
                    </div>
                    <span className="font-rajdhani text-foreground/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Visual */}
            <div className="relative">
              <div className="hud-box p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.35_340)] pulse-neon" />
                  <span className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">NEXURA_AI // ONLINE</span>
                </div>
                <div className="space-y-3">
                  {[
                    { role: "user", msg: "أنشئ نصاً إعلانياً لمنتج العطور الفاخرة" },
                    { role: "ai", msg: "✨ تم توليد 3 نصوص إعلانية مخصصة لجمهورك المستهدف مع اقتراحات للصور والهاشتاقات..." },
                    { role: "user", msg: "ما هو أداء حملتي الأسبوع الماضي؟" },
                    { role: "ai", msg: "📊 الحملة حققت 2,450 نقرة بمعدل تحويل 3.2% — أعلى بـ 18% من المتوسط الصناعي" },
                  ].map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "ai" && (
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center border border-[oklch(0.65_0.35_340/0.4)] rounded-full">
                          <Bot className="w-3 h-3 text-[oklch(0.65_0.35_340)]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded text-xs font-rajdhani ${
                          msg.role === "user"
                            ? "bg-[oklch(0.65_0.35_340/0.15)] border border-[oklch(0.65_0.35_340/0.3)] text-foreground"
                            : "bg-[oklch(0.75_0.25_195/0.1)] border border-[oklch(0.75_0.25_195/0.2)] text-foreground/90"
                        }`}
                      >
                        {msg.msg}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 h-8 border border-[oklch(0.65_0.35_340/0.2)] rounded bg-[oklch(0.08_0.02_240)] px-3 flex items-center">
                      <span className="font-tech text-xs text-muted-foreground">اكتب رسالتك...</span>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center border border-[oklch(0.65_0.35_340/0.4)] rounded bg-[oklch(0.65_0.35_340/0.1)] text-[oklch(0.65_0.35_340)]">
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 relative">
        <div className="cyber-divider mb-16" />
        <div className="container text-center">
          <div className="max-w-2xl mx-auto hud-box p-12 rounded-lg">
            <div className="w-16 h-16 flex items-center justify-center border border-[oklch(0.65_0.35_340/0.5)] rounded-full mx-auto mb-6 bg-[oklch(0.65_0.35_340/0.1)]">
              <Zap className="w-8 h-8 text-[oklch(0.65_0.35_340)]" />
            </div>
            <h2 className="text-3xl font-cyber font-bold gradient-text-cyber mb-4">
              جاهز للانطلاق؟
            </h2>
            <p className="font-rajdhani text-muted-foreground mb-8 text-lg">
              انضم إلى آلاف التجار الذين يستخدمون NEXURA&RB لتنمية أعمالهم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={isAuthenticated ? "/dashboard" : getLoginUrl()}
                onClick={isAuthenticated ? (e) => { e.preventDefault(); navigate("/dashboard"); } : undefined}
                className="btn-neon px-8 py-3 text-base rounded flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                ابدأ مجاناً الآن
              </a>
              <button className="btn-neon-cyan px-8 py-3 text-base rounded flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                تواصل مع الفريق
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[oklch(0.65_0.35_340/0.15)] py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[oklch(0.65_0.35_340)]" />
            <span className="font-cyber text-sm gradient-text-cyber">NEXURA&RB</span>
          </div>
          <p className="font-tech text-xs text-muted-foreground">
            © 2026 NEXURA&RB — منصة التسويق الذكي
          </p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.70_0.28_160)] pulse-neon" />
            <span className="font-tech text-xs text-[oklch(0.70_0.28_160)]">SYSTEM ONLINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
