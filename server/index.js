require("dotenv").config();

const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.listen(port, () => {
  console.log(`Inkflow API listening on port ${port}`);
});
