const express = require("express");
const cors = require("cors");

const personaltitleRoute = require("./routes/personaltitle");
const infogroupsRoute = require("./routes/infogroups");
const subgroupindexRoute = require("./routes/subgroupindex");
const grouppricesRoute = require("./routes/groupprices");
const subgroupweightsRoute = require("./routes/subgroupweights");
const ttsRoute = require("./routes/tts");

const app = express();
const PORT = 5000;

// ✅ IMPORTANT — allow your frontend domain
const corsOptions = {
  origin: [
    "https://personalinflation.geostat.ge",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// routes
app.use("/api/personaltitle", personaltitleRoute);
app.use("/api/infogroups", infogroupsRoute);
app.use("/api/subgroupindex", subgroupindexRoute);
app.use("/api/groupprices", grouppricesRoute);
app.use("/api/subgroupweights", subgroupweightsRoute);
app.use("/api/tts", ttsRoute);

// health test
app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
