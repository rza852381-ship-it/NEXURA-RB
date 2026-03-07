import axios from "axios";

export async function handleCallback(req, res) {
  const { code } = req.query;

  try {
    const response = await axios.post("https://accounts.salla.sa/oauth2/token", {
      grant_type: "authorization_code",
      code: code
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
