import { useState } from "react";
import { trpc } from "@/lib/trpc";
import CyberLayout from "@/components/CyberLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Store, Package, ShoppingCart, Users, TrendingUp,
  Link2, Link2Off, RefreshCw, ExternalLink, ChevronRight,
  DollarSign, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";

export default function SallaIntegration() {
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "customers">("overview");

  const utils = trpc.useUtils();

  // جلب إحصائيات المتجر
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.salla.stats.useQuery(undefined, {
    retry: false,
  });

  // جلب المنتجات
  const { data: productsData, isLoading: productsLoading } = trpc.salla.products.useQuery(
    { page, perPage: 10 },
    { enabled: activeTab === "products" && !!stats }
  );

  // جلب الطلبات
  const { data: ordersData, isLoading: ordersLoading } = trpc.salla.orders.useQuery(
    { page, perPage: 10 },
    { enabled: activeTab === "orders" && !!stats }
  );

  // جلب العملاء
  const { data: customersData, isLoading: customersLoading } = trpc.salla.customers.useQuery(
    { page, perPage: 10 },
    { enabled: activeTab === "customers" && !!stats }
  );

  const connectMutation = trpc.salla.connect.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ تم ربط متجر "${data.store.name}" بنجاح!`);
      utils.salla.stats.invalidate();
      setToken("");
      setConnecting(false);
    },
    onError: (err) => {
      toast.error(`❌ فشل الربط: ${err.message}`);
      setConnecting(false);
    },
  });

  const disconnectMutation = trpc.salla.disconnect.useMutation({
    onSuccess: () => {
      toast.success("تم فصل المتجر بنجاح");
      utils.salla.stats.invalidate();
    },
  });

  const handleConnect = () => {
    if (!token.trim()) {
      toast.error("يرجى إدخال توكن سلة");
      return;
    }
    setConnecting(true);
    connectMutation.mutate({ token: token.trim() });
  };

  const isConnected = !!stats;

  return (
    <CyberLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-gradient flex items-center gap-3">
              <Store className="w-8 h-8 text-[var(--cyber-pink)]" />
              تكامل سلة
            </h1>
            <p className="text-[var(--cyber-cyan)]/70 mt-1">
              ربط متجرك في سلة وعرض بياناته الحقيقية مباشرة
            </p>
          </div>
          {isConnected && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => refetchStats()}
                className="cyber-border text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)]/10"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
              <Button
                variant="outline"
                onClick={() => disconnectMutation.mutate()}
                className="cyber-border text-red-400 hover:bg-red-500/10"
              >
                <Link2Off className="w-4 h-4 ml-2" />
                فصل المتجر
              </Button>
            </div>
          )}
        </div>

        {/* حالة الاتصال */}
        {!isConnected ? (
          <div className="cyber-card p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--cyber-pink)]/10 border border-[var(--cyber-pink)]/30 flex items-center justify-center">
              <Store className="w-10 h-10 text-[var(--cyber-pink)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">ربط متجر سلة</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                أدخل توكن الوصول الخاص بمتجرك في سلة لعرض المنتجات والطلبات والإحصائيات
              </p>
            </div>

            {/* خطوات الحصول على التوكن */}
            <div className="cyber-card bg-[var(--cyber-cyan)]/5 border-[var(--cyber-cyan)]/20 p-4 text-right max-w-lg mx-auto">
              <h3 className="text-[var(--cyber-cyan)] font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                كيف تحصل على توكن سلة؟
              </h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-pink)] font-bold">١.</span>
                  اذهب إلى <a href="https://store.salla.com" target="_blank" rel="noreferrer" className="text-[var(--cyber-cyan)] underline">store.salla.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-pink)] font-bold">٢.</span>
                  من القائمة: التطبيقات ← تطبيقاتي
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-pink)] font-bold">٣.</span>
                  افتح تطبيقك ← إنشاء Access Token
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-pink)] font-bold">٤.</span>
                  الصق التوكن هنا
                </li>
              </ol>
            </div>

            <div className="flex gap-3 max-w-lg mx-auto">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="أدخل Access Token من سلة..."
                className="cyber-input flex-1 text-right"
                type="password"
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              />
              <Button
                onClick={handleConnect}
                disabled={connecting || !token.trim()}
                className="cyber-button"
              >
                {connecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-4 h-4 ml-2" />
                    ربط
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* معلومات المتجر */}
            <div className="cyber-card p-5 flex items-center gap-4">
              {stats.store?.avatar && (
                <img
                  src={stats.store.avatar}
                  alt={stats.store.name}
                  className="w-14 h-14 rounded-full border-2 border-[var(--cyber-pink)]"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{stats.store?.name}</h2>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 ml-1" />
                    متصل
                  </Badge>
                  <Badge className="bg-[var(--cyber-cyan)]/20 text-[var(--cyber-cyan)] border-[var(--cyber-cyan)]/30">
                    {stats.store?.plan}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mt-1">{stats.store?.email}</p>
                {stats.store?.domain && (
                  <a
                    href={stats.store.domain}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--cyber-cyan)] text-sm flex items-center gap-1 mt-1 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {stats.store.domain}
                  </a>
                )}
              </div>
            </div>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "إجمالي المنتجات",
                  value: stats.totalProducts,
                  icon: Package,
                  color: "var(--cyber-pink)",
                  tab: "products" as const,
                },
                {
                  label: "إجمالي الطلبات",
                  value: stats.totalOrders,
                  icon: ShoppingCart,
                  color: "var(--cyber-cyan)",
                  tab: "orders" as const,
                },
                {
                  label: "إجمالي الإيرادات",
                  value: `${parseFloat(stats.totalRevenue || "0").toLocaleString("ar-SA")} ${stats.currency}`,
                  icon: DollarSign,
                  color: "#a855f7",
                  tab: "overview" as const,
                },
                {
                  label: "العملاء",
                  value: "—",
                  icon: Users,
                  color: "#f59e0b",
                  tab: "customers" as const,
                },
              ].map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => { setActiveTab(stat.tab); setPage(1); }}
                  className="cyber-card p-4 text-right hover:border-[var(--cyber-pink)]/50 transition-all cursor-pointer w-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </button>
              ))}
            </div>

            {/* حالة الطلبات */}
            {stats.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
              <div className="cyber-card p-5">
                <h3 className="text-[var(--cyber-cyan)] font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  توزيع حالات الطلبات
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center gap-2 bg-[var(--cyber-pink)]/10 border border-[var(--cyber-pink)]/20 rounded-lg px-3 py-2"
                    >
                      <span className="text-white font-bold">{count as number}</span>
                      <span className="text-gray-400 text-sm">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--cyber-cyan)]/20 pb-0">
              {[
                { id: "overview", label: "نظرة عامة" },
                { id: "products", label: `المنتجات (${stats.totalProducts})` },
                { id: "orders", label: `الطلبات (${stats.totalOrders})` },
                { id: "customers", label: "العملاء" },
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
                  <div className="p-8 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--cyber-pink)]" />
                    جاري تحميل المنتجات...
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="border-b border-[var(--cyber-cyan)]/20">
                      <tr className="text-right">
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">المنتج</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">السعر</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">المخزون</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(productsData?.data || []).map((product: any) => (
                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {product.images?.[0]?.url && (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover border border-[var(--cyber-pink)]/20"
                                />
                              )}
                              <div>
                                <div className="text-white font-medium text-sm">{product.name}</div>
                                <div className="text-gray-500 text-xs">#{product.sku || product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-[var(--cyber-cyan)] font-bold">
                            {product.price?.amount} {product.price?.currency || "SAR"}
                          </td>
                          <td className="p-3 text-gray-300">
                            {product.quantity ?? "—"}
                          </td>
                          <td className="p-3">
                            <Badge className={
                              product.status === "sale"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }>
                              {product.status === "sale" ? "نشط" : product.status || "—"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* Pagination */}
                {productsData && productsData.pagination?.total > 10 && (
                  <div className="p-3 flex justify-center gap-2 border-t border-white/5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="cyber-border text-xs"
                    >السابق</Button>
                    <span className="text-gray-400 text-sm flex items-center px-2">
                      صفحة {page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={productsData.data?.length < 10}
                      className="cyber-border text-xs"
                    >التالي</Button>
                  </div>
                )}
              </div>
            )}

            {/* الطلبات */}
            {activeTab === "orders" && (
              <div className="cyber-card overflow-hidden">
                {ordersLoading ? (
                  <div className="p-8 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--cyber-cyan)]" />
                    جاري تحميل الطلبات...
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="border-b border-[var(--cyber-cyan)]/20">
                      <tr className="text-right">
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">رقم الطلب</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">العميل</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">المبلغ</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">الحالة</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ordersData?.data || []).map((order: any) => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 text-[var(--cyber-pink)] font-mono font-bold">
                            #{order.reference_id}
                          </td>
                          <td className="p-3 text-white text-sm">
                            {order.customer?.first_name} {order.customer?.last_name}
                          </td>
                          <td className="p-3 text-[var(--cyber-cyan)] font-bold">
                            {order.amounts?.total?.amount || "—"} {order.amounts?.total?.currency || "SAR"}
                          </td>
                          <td className="p-3">
                            <Badge className="bg-[var(--cyber-pink)]/20 text-[var(--cyber-pink)] border-[var(--cyber-pink)]/30 text-xs">
                              {order.status?.name || "—"}
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-400 text-xs">
                            {order.date?.date
                              ? new Date(order.date.date).toLocaleDateString("ar-SA")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {ordersData && ordersData.pagination?.total > 10 && (
                  <div className="p-3 flex justify-center gap-2 border-t border-white/5">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="cyber-border text-xs">السابق</Button>
                    <span className="text-gray-400 text-sm flex items-center px-2">صفحة {page}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={ordersData.data?.length < 10} className="cyber-border text-xs">التالي</Button>
                  </div>
                )}
              </div>
            )}

            {/* العملاء */}
            {activeTab === "customers" && (
              <div className="cyber-card overflow-hidden">
                {customersLoading ? (
                  <div className="p-8 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--cyber-cyan)]" />
                    جاري تحميل العملاء...
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="border-b border-[var(--cyber-cyan)]/20">
                      <tr className="text-right">
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">الاسم</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">الإيميل</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">الجوال</th>
                        <th className="p-3 text-[var(--cyber-cyan)] text-sm font-medium">تاريخ التسجيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(customersData?.data || []).map((customer: any) => (
                        <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[var(--cyber-pink)]/20 border border-[var(--cyber-pink)]/30 flex items-center justify-center text-[var(--cyber-pink)] text-xs font-bold">
                                {(customer.first_name || "?")[0]}
                              </div>
                              <span className="text-white text-sm">
                                {customer.first_name} {customer.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-300 text-sm">{customer.email || "—"}</td>
                          <td className="p-3 text-gray-300 text-sm">{customer.mobile || "—"}</td>
                          <td className="p-3 text-gray-400 text-xs">
                            {customer.created_at
                              ? new Date(customer.created_at).toLocaleDateString("ar-SA")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                      {customersData?.data?.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">
                            لا يوجد عملاء حتى الآن
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* نظرة عامة */}
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="cyber-card p-5">
                  <h3 className="text-[var(--cyber-pink)] font-bold mb-4">معلومات المتجر</h3>
                  <div className="space-y-3">
                    {[
                      { label: "اسم المتجر", value: stats.store?.name },
                      { label: "البريد الإلكتروني", value: stats.store?.email },
                      { label: "العملة", value: stats.store?.currency },
                      { label: "الخطة", value: stats.store?.plan },
                      { label: "النوع", value: stats.store?.type === "demo" ? "تجريبي" : "حقيقي" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">{item.label}</span>
                        <span className="text-white text-sm font-medium">{item.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cyber-card p-5">
                  <h3 className="text-[var(--cyber-cyan)] font-bold mb-4">ملخص الأداء</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">إجمالي المنتجات</span>
                      <span className="text-2xl font-bold text-[var(--cyber-pink)]">{stats.totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">إجمالي الطلبات</span>
                      <span className="text-2xl font-bold text-[var(--cyber-cyan)]">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">إجمالي الإيرادات</span>
                      <span className="text-2xl font-bold text-purple-400">
                        {parseFloat(stats.totalRevenue || "0").toLocaleString("ar-SA")} {stats.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CyberLayout>
  );
}
