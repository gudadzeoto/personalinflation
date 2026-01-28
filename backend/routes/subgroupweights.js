const express = require("express");
const sql = require("mssql");
const config = require("../dbConfig");

const router = express.Router();

// GET /api/subgroupweights?year=2025
router.get("/", async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ error: "Year parameter is required" });
    }

    let pool = await sql.connect(config);

    let query = "SELECT * FROM subgroupweights";
    const yearValue = parseInt(year, 10);
    query += ` WHERE Year = ${yearValue}`;

    let result = await pool.request().query(query);

    if (result.recordset.length === 0) {
      pool.close();
      return res.status(404).json({ message: "No data found for that year." });
    }

    res.json(result.recordset);
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
