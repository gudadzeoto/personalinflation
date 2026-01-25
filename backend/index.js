const express = require("express");
const cors = require("cors");
const personaltitleRoute = require("./routes/personaltitle");
const infogroupsRoute = require("./routes/infogroups");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/personaltitle", personaltitleRoute);
app.use("/api/infogroups", infogroupsRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
