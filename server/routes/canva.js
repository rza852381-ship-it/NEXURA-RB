const express = require("express");
const router = express.Router();

router.get("/canva", (req, res) => {
  res.json({ status: "canva ready" });
});

module.exports = router;
