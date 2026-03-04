const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// يسمح بقراءة JSON القادم من سلة و Zapier
app.use(express.json());

/* ===============================
   الصفحة الرئيسية (مهم لسلة)
================================ */
app.get("/", (req, res) => {
  res.status(200).send("Nexora API is running ✅");
});

/* ===============================
   Webhook سلة
================================ */
app.post("/api/salla/callback", (req, res) => {
  console.log("📦 New Salla Event Received:");
  console.log(req.body);

  // هنا مستقبلاً نضيف AI أو حفظ الطلبات

  res.status(200).json({
    success: true,
    message: "Webhook received successfully"
  });
});

/* ===============================
   تشغيل السيرفر
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
