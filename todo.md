const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*
========================================
Root
========================================
*/

app.get("/", (req, res) => {
  res.send("NEXORA SERVER RUNNING ✅");
});

/*
========================================
SALLA CALLBACK
========================================
*/

app.get("/api/salla/callback", async (req, res) => {
  try {
    const code = req.query.code;

    console.log("Salla Code:", code);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "No code received",
      });
    }

    // هنا لاحقاً نحط طلب التوكن من سلة

    return res.json({
      success: true,
      message: "Salla connected",
      code: code,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/*
========================================
TEST API
========================================
*/

app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
  });
});

/*
========================================
PORT
========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
