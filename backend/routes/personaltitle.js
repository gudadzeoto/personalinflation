const express = require("express");
const sql = require("mssql");
const config = require("../dbConfig");

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .query(`
        SELECT name_geo, name_en, code, level, title_geo, title_en
        FROM personaltitle
        ORDER BY level, code
      `);

    if (result.recordset.length === 0) {
      return res.status(404).send("No data found.");
    }

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
