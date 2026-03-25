const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const app = express();

/* ---------------- CREATE UPLOAD FOLDER IF NOT EXISTS ---------------- */
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static(uploadPath));

/* ---------------- FILE UPLOAD ---------------- */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("document");

/* ---------------- POSTGRESQL CONNECTION ---------------- */
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "business_app",
  password: "Wish4688",
  port: 5432,
});

/* ---------------- TEST DATABASE CONNECTION ---------------- */
pool.connect()
  .then(() => console.log("PostgreSQL Connected Successfully"))
  .catch(err => console.error("PostgreSQL Connection Error:", err));

/* ---------------- APPLY FORM ---------------- */
app.post("/apply", (req, res) => {

  upload(req, res, async function (err) {

    if (err instanceof multer.MulterError) {
      console.error("Multer Error:", err);
      return res.status(400).json({
        message: "File upload error",
        error: err.message
      });
    }

    if (err) {
      console.error("Unknown Upload Error:", err);
      return res.status(500).json({
        message: "Unknown upload error",
        error: err.message
      });
    }

    const {
      name,
      email,
      phone,
      country,
      type,
      bname,
      reg_country,
      activity,
      notes
    } = req.body;

    const document = req.file ? req.file.filename : null;

    try {

      const result = await pool.query(
        `INSERT INTO applications
        (full_name, email, phone, country, company_type, business_name, registration_country, activity, document, notes, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *`,
        [
          name,
          email,
          phone,
          country,
          type,
          bname,
          reg_country,
          activity,
          document,
          notes,
          "Pending"
        ]
      );

      console.log("APPLICATION RECEIVED:", result.rows[0]);

      res.json({
        success: true,
        message: "Application submitted successfully",
        data: result.rows[0]
      });

    } catch (dbErr) {

      console.error("Database Error:", dbErr);

      res.status(500).json({
        success: false,
        message: "Database error",
        error: dbErr.message
      });
    }

  });

});

/* ---------------- CONTACT FORM ---------------- */
app.post("/contact", async (req, res) => {

  const { name, email, message } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO contacts (name, email, message)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [name, email, message]
    );

    console.log("NEW CONTACT MESSAGE:", result.rows[0]);

    res.json({
      success: true,
      message: "Message sent successfully",
      data: result.rows[0]
    });

  } catch (err) {

    console.error("Error saving contact:", err);

    res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message
    });
  }

});

/* ---------------- ADMIN FETCH APPLICATIONS ---------------- */
app.get("/admin/applications", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT * FROM applications ORDER BY id DESC`
    );

    res.json(result.rows);

  } catch (err) {

    console.error("Fetch Error:", err);

    res.status(500).json({
      message: "Error fetching applications"
    });
  }

});

/* ---------------- SERVER ---------------- */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});