require("dotenv").config();

const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/auth");

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Inkflow API listening on port ${port}`);
});
