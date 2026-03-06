import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


/*
========================
HOME ROUTE
========================
*/

app.get("/", (req, res) => {
  res.json({
    app: "NEXORA",
    status: "running",
    message: "AI Marketing & Analytics System",
  });
});


/*
========================
HEALTH CHECK
========================
*/

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    server: "NEXORA",
    time: new Date(),
  });
});


/*
========================
SALLA WEBHOOK
========================
*/

app.post("/api/salla/webhook", (req, res) => {

  const data = req.body;

  console.log("New webhook from Salla:");
  console.log(data);

  /*
  هنا نقدر نضيف تحليل الطلب
  مثل:
  - تسجيل الطلب
  - تحديث التقارير
  - تشغيل AI اعلان
  */

  res.status(200).json({
    success: true,
    message: "Webhook received",
  });

});


/*
========================
REPORTS
========================
*/

app.get("/api/reports", (req, res) => {

  const report = {
    today_sales: 12400,
    orders: 57,
    best_product: "Example Product",
    low_products: 3,
  };

  res.json(report);

});


/*
========================
CAMPAIGNS
========================
*/

app.post("/api/campaigns", (req, res) => {

  const campaign = req.body;

  console.log("New Campaign:");
  console.log(campaign);

  res.json({
    success: true,
    message: "Campaign created",
  });

});


/*
========================
START SERVER
========================
*/

app.listen(PORT, () => {
  console.log(`NEXORA running on port ${PORT}`);
});
