const express = require("express");
const sql = require("mssql");
const config = require("../dbConfig");

const router = express.Router();

// GET groupprices filtered by year
router.get("/", async (req, res) => {
  try {
    const { year } = req.query;

    let pool = await sql.connect(config);
    let query = "SELECT * FROM groupprices";

    // If year parameter is provided, filter by year (Date field contains year like 2025)
    if (year) {
      const yearValue = parseInt(year, 10);
      query += ` WHERE Date = ${yearValue}`;
    }

    let result = await pool.request().query(query);

    if (result.recordset.length === 0) {
      return res.status(404).send("No data found.");
    }

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
