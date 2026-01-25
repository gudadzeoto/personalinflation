const express = require("express");
const sql = require("mssql");
const config = require("../dbConfig");

const router = express.Router();

// GET infogroups with optional date range filtering by Year and Month
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;

    let pool = await sql.connect(config);
    let query = "SELECT * FROM infogroups";

    // If date parameters are provided, split into Year and Month
    if (from && to) {
      // Split "YYYY/MM" format into year and month
      const fromParts = from.split("/");
      const toParts = to.split("/");

      const fromYear = parseInt(fromParts[0], 10);
      const fromMonth = parseInt(fromParts[1], 10);
      const toYear = parseInt(toParts[0], 10);
      const toMonth = parseInt(toParts[1], 10);

      // Build WHERE clause with explicit comparisons
      query += ` WHERE (Year > ${fromYear} OR (Year = ${fromYear} AND Month >= ${fromMonth}))
                 AND (Year < ${toYear} OR (Year = ${toYear} AND Month <= ${toMonth}))`;
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
