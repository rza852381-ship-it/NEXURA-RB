import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import CyberLayout from "@/components/CyberLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Store, Link2, Link2Off, RefreshCw, ExternalLink,
  CheckCircle2, Loader2, Package, ShoppingCart,
  DollarSign, Zap, Shield, Clock, AlertCircle,
  ChevronRight, Eye, EyeOff
} from "lucide-react";

export default function SallaConnect() {
  const [, navigate] = useLocation();
  const [manualToken, setManualToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [page, setPage] = useState(1);

  const utils = trpc.useUtils();

  // قراءة params من URL (بعد callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");
    const storeName = params.get("store");

    if (success === "true") {
      toast.success(`✅ تم ربط متجر "${storeName || "سلة"}" بنجاح!`);
      utils.sallaOAuth.getConnections.invalidate();
      window.history.replaceState({}, "", "/salla-connect");
    } else if (error) {
      const errorMessages: Record<string, string> = {
        no_code: "لم يتم استقبال كود التفويض من سلة",
        token_exchange_failed: "فشل تبادل الكود بتوكن — تأكد من إعدادات التطبيق",
        server_error: "حدث خطأ في السيرفر",
      };
      toast.error(`❌ ${errorMessages[error] || error}`);
      window.history.replaceState({}, "", "/salla-connect");
    }
  }, []);

  // جلب الاتصالات المحفوظة
  const { data: connections, isLoading: connectionsLoading } = trpc.sallaOAuth.getConnections.useQuery();

  // جلب رابط OAuth
  const { data: authData } = trpc.sallaOAuth.getAuthUrl.useQuery(
    { origin: typeof window !== "undefined" ? window.location.origin : "" },
    { enabled: typeof window !== "undefined" }
  );

  // جلب إحصائيات المتجر المحدد
  const { data: storeStats, isLoading: statsLoading } = trpc.sallaOAuth.getStoreStats.useQuery(
    { connectionId: selectedStore! },
    { enabled: !!selectedStore }
  );

  // جلب المنتجات
  const { data: productsData, isLoading: productsLoading } = trpc.sallaOAuth.getProducts.useQuery(
    { connectionId: selectedStore!, page, perPage: 8 },
    { enabled: !!selectedStore && activeTab === "products" }
  );

  // جلب الطلبات
  const { data: ordersData, isLoading: ordersLoading } = trpc.sallaOAuth.getOrders.useQuery(
    { connectionId: selectedStore!, page, perPage: 8 },
    { enabled: !!selectedStore && activeTab === "orders" }
  );

  const connectWithTokenMutation = trpc.sallaOAuth.connectWithToken.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ تم ربط متجر "${data.store.name}" بنجاح!`);
      utils.sallaOAuth.getConnections.invalidate();
      setManualToken("");
      setConnecting(false);
    },
    onError: (err) => {
      toast.error(`❌ ${err.message}`);
      setConnecting(false);
    },
  });

  const disconnectMutation = trpc.sallaOAuth.disconnect.useMutation({
    onSuccess: () => {
      toast.success("تم فصل المتجر");
      utils.sallaOAuth.getConnections.invalidate();
      setSelectedStore(null);
    },
  });

  const handleOAuthConnect = () => {
    if (!authData?.url) return;
    // إضافة userId في الـ state لحفظه بعد callback
    window.location.href = authData.url;
  };

  const handleManualConnect = () => {
    if (!manualToken.trim()) {
      toast.error("يرجى إدخال التوكن");
      return;
    }
    setConnecting(true);
    connectWithTokenMutation.mutate({ accessToken: manualToken.trim() });
  };

  const activeConnections = connections?.filter((c) => c.isActive) || [];

  return (
    <CyberLayout>
      <div className="p-6 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-gradient flex items-center gap-3">
              <Store className="w-8 h-8 text-[var(--cyber-pink)]" />
              ربط متاجر سلة
            </h1>
            <p className="text-[var(--cyber-cyan)]/70 mt-1">
              اربط متاجر سلة تلقائياً عبر OAuth 2.0 — آمن ودائم
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">
            <Shield className="w-3 h-3 ml-1" />
            OAuth 2.0 آمن
          </Badge>
        </div>

        {/* طريقتا الربط */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* الطريقة الأولى: OAuth تلقائي */}
          <div className="cyber-card p-6 space-y-4 border-[var(--cyber-pink)]/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--cyber-pink)]/20 border border-[var(--cyber-pink)]/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[var(--cyber-pink)]" />
              </div>
              <div>
                <h3 className="text-white font-bold">ربط تلقائي عبر سلة</h3>
                <p className="text-xs text-gray-400">موصى به — تجديد تلقائي للتوكن</p>
              </div>
              <Badge className="mr-auto bg-[var(--cyber-pink)]/20 text-[var(--cyber-pink)] border-[var(--cyber-pink)]/30 text-xs">
                الأفضل
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              {[
                "اضغط الزر أدناه",
                "وافق على الصلاحيات في سلة",
                "يتم الربط تلقائياً",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--cyber-pink)]/20 border border-[var(--cyber-pink)]/40 flex items-center justify-center text-[var(--cyber-pink)] text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>

            <Button
              onClick={handleOAuthConnect}
              className="w-full cyber-button"
              disabled={!authData?.url}
            >
              <Link2 className="w-4 h-4 ml-2" />
              ربط متجر سلة تلقائياً
            </Button>

            {authData?.redirectUri && (
              <div className="text-xs text-gray-500 bg-black/30 rounded p-2">
                <span className="text-[var(--cyber-cyan)]">Redirect URL للإعدادات:</span>
                <br />
                <code className="text-gray-300 break-all">{authData.redirectUri}</code>
              </div>
            )}
          </div>

          {/* الطريقة الثانية: توكن يدوي */}
          <div className="cyber-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--cyber-cyan)]/20 border border-[var(--cyber-cyan)]/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--cyber-cyan)]" />
              </div>
              <div>
                <h3 className="text-white font-bold">ربط بالتوكن المباشر</h3>
                <p className="text-xs text-gray-400">للاختبار أو التوكن الدائم</p>
              </div>
            </div>

            <div className="relative">
              <Input
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="أدخل Access Token من سلة..."
                className="cyber-input text-right pl-10"
                type={showToken ? "text" : "password"}
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              onClick={handleManualConnect}
              disabled={connecting || !manualToken.trim()}
              variant="outline"
              className="w-full cyber-border text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)]/10"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Link2 className="w-4 h-4 ml-2" />
              )}
              ربط بالتوكن
            </Button>
          </div>
        </div>

        {/* المتاجر المربوطة */}
        <div className="space-y-3">
          <h2 className="text-[var(--cyber-cyan)] font-bold text-lg flex items-center gap-2">
            <Store className="w-5 h-5" />
            المتاجر المربوطة
            {activeConnections.length > 0 && (
              <Badge className="bg-[var(--cyber-cyan)]/20 text-[var(--cyber-cyan)] border-[var(--cyber-cyan)]/30">
                {activeConnections.length}
              </Badge>
            )}
          </h2>

          {connectionsLoading ? (
            <div className="cyber-card p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--cyber-pink)]" />
            </div>
          ) : activeConnections.length === 0 ? (
            <div className="cyber-card p-8 text-center space-y-3">
              <Store className="w-12 h-12 mx-auto text-gray-600" />
              <p className="text-gray-400">لا يوجد متاجر مربوطة بعد</p>
              <p className="text-gray-500 text-sm">استخدم إحدى الطريقتين أعلاه لربط متجرك</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {activeConnections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => { setSelectedStore(conn.id); setPage(1); }}
                  className={`cyber-card p-4 text-right transition-all hover:border-[var(--cyber-pink)]/50 ${
                    selectedStore === conn.id ? "border-[var(--cyber-pink)]/60 bg-[var(--cyber-pink)]/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {conn.storeAvatar ? (
                      <img src={conn.storeAvatar} alt={conn.storeName || ""} className="w-10 h-10 rounded-full border border-[var(--cyber-pink)]/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--cyber-pink)]/20 border border-[var(--cyber-pink)]/30 flex items-center justify-center">
                        <Store className="w-5 h-5 text-[var(--cyber-pink)]" />
                      </div>
                    )}
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{conn.storeName || "متجر سلة"}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          <CheckCircle2 className="w-2.5 h-2.5 ml-1" />
                          متصل
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">{conn.storeEmail || conn.storeDomain}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {conn.storePlan && (
                          <span className="text-[var(--cyber-cyan)] text-xs">{conn.storePlan}</span>
                        )}
                        {conn.hasRefreshToken && (
                          <span className="text-green-400 text-xs flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            تجديد تلقائي
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* تفاصيل المتجر المحدد */}
        {selectedStore && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">
                {connections?.find((c) => c.id === selectedStore)?.storeName || "تفاصيل المتجر"}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => utils.sallaOAuth.getStoreStats.invalidate()}
                  className="cyber-border text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)]/10 text-xs"
                >
                  <RefreshCw className="w-3 h-3 ml-1" />
                  تحديث
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectMutation.mutate({ connectionId: selectedStore })}
                  className="cyber-border text-red-400 hover:bg-red-500/10 text-xs"
                >
                  <Link2Off className="w-3 h-3 ml-1" />
                  فصل
                </Button>
              </div>
            </div>

            {/* إحصائيات */}
            {statsLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cyber-card p-4 animate-pulse">
                    <div className="h-8 bg-white/5 rounded mb-2" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : storeStats ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "المنتجات", value: storeStats.totalProducts, icon: Package, color: "var(--cyber-pink)" },
                  { label: "الطلبات", value: storeStats.totalOrders, icon: ShoppingCart, color: "var(--cyber-cyan)" },
                  { label: `الإيرادات (${storeStats.currency})`, value: parseFloat(storeStats.totalRevenue || "0").toLocaleString("ar-SA"), icon: DollarSign, color: "#a855f7" },
                ].map((stat) => (
                  <div key={stat.label} className="cyber-card p-4 text-center">
                    <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--cyber-cyan)]/20">
              {[
                { id: "products", label: "المنتجات" },
                { id: "orders", label: "الطلبات" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setPage(1); }}
                  className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-[var(--cyber-pink)] text-[var(--cyber-pink)]"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* المنتجات */}
            {activeTab === "products" && (
              <div className="cyber-card overflow-hidden">
                {productsLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--cyber-pink)]" />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="border-b border-[var(--cyber-cyan)]/20">
                      <tr className="text-right">
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">المنتج</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">السعر</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">المخزون</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(productsData?.data || []).map((p: any) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {p.images?.[0]?.url && (
                                <img src={p.images[0].url} alt={p.name} className="w-9 h-9 rounded object-cover border border-[var(--cyber-pink)]/20" />
                              )}
                              <span className="text-white text-sm">{p.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-[var(--cyber-cyan)] font-bold text-sm">
                            {p.price?.amount} {p.price?.currency || "SAR"}
                          </td>
                          <td className="p-3 text-gray-300 text-sm">{p.quantity ?? "—"}</td>
                          <td className="p-3">
                            <Badge className={p.status === "sale" ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" : "bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs"}>
                              {p.status === "sale" ? "نشط" : p.status || "—"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {productsData?.data?.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا يوجد منتجات</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
                {productsData && productsData.pagination?.total > 8 && (
                  <div className="p-3 flex justify-center gap-2 border-t border-white/5">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cyber-border text-xs">السابق</Button>
                    <span className="text-gray-400 text-sm flex items-center px-2">صفحة {page}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={(productsData.data?.length || 0) < 8} className="cyber-border text-xs">التالي</Button>
                  </div>
                )}
              </div>
            )}

            {/* الطلبات */}
            {activeTab === "orders" && (
              <div className="cyber-card overflow-hidden">
                {ordersLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--cyber-cyan)]" />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="border-b border-[var(--cyber-cyan)]/20">
                      <tr className="text-right">
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">رقم الطلب</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">العميل</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">المبلغ</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ordersData?.data || []).map((o: any) => (
                        <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 text-[var(--cyber-pink)] font-mono font-bold text-sm">#{o.reference_id}</td>
                          <td className="p-3 text-white text-sm">{o.customer?.first_name} {o.customer?.last_name}</td>
                          <td className="p-3 text-[var(--cyber-cyan)] font-bold text-sm">
                            {o.amounts?.total?.amount || "—"} SAR
                          </td>
                          <td className="p-3">
                            <Badge className="bg-[var(--cyber-pink)]/20 text-[var(--cyber-pink)] border-[var(--cyber-pink)]/30 text-xs">
                              {o.status?.name || "—"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {ordersData?.data?.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا يوجد طلبات</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* تعليمات إعداد Redirect URL */}
        <div className="cyber-card p-5 border-[var(--cyber-cyan)]/20">
          <h3 className="text-[var(--cyber-cyan)] font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            إعداد مهم — أضف Redirect URL في تطبيق سلة
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            لكي يعمل الربط التلقائي، يجب إضافة هذا الرابط في إعدادات تطبيقك في سلة:
          </p>
          <div className="bg-black/40 rounded-lg p-3 font-mono text-sm text-[var(--cyber-cyan)] break-all">
            {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/salla/callback
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <span className="text-[var(--cyber-pink)] font-bold">المسار:</span> لوحة تحكم سلة للمطورين ← تطبيقاتي ← تطبيقك ← إعدادات ← Redirect URL
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
