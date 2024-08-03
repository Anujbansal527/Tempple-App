const express = require("express");

const cors = require("cors");

const Database = require("./Config/Database");

const router = require("./Routes/Routes");

const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 6000 || 8000;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

Database();

app.listen(PORT, () => {
  console.log(`Successfully connected to PORT ${PORT}`);
});
