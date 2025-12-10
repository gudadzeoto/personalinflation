const express = require("express");
const app = express();

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// example API route
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from API!" });
});

// start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
