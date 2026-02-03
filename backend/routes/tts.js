const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const { text = "", lang = "en" } = req.query;

  try {
    const url = `https://www.geostat.ge/personalinflation/request.php?text=${encodeURIComponent(text)}&lang=${lang}`;
    const response = await fetch(url);

    if (!response.ok) return res.status(500).send("Failed to fetch TTS");

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("TTS proxy error");
  }
});

module.exports = router;
