const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/salla-webhook", (req, res) => {
  console.log("Webhook Received:", req.body);
  res.status(200).json({ success: true });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
