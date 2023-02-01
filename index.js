const express = require("express");
const connected = require("./config/db");
require("dotenv").config();
// const PORT = process.env.PORT;
const groceryRouter = require("./routes/routes");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/grocery", groceryRouter);
const port=process.env.PORT || 8080
connected()
app.listen(port, async () => {
  try {
    await connected;
    console.log("connected to db successfully");
  } catch {
    console.log("something went wrong while connecting to db");
  }
  console.log("Server listening");
});