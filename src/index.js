require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route");


const mongoose = require("mongoose");
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log("MongoDb is Connected"))
  .catch((err) => console.log(err));

app.use("/", route);

const port = process.env.PORT || 3000
app.listen(process.env.PORT || 3000, function () {
  console.log(`Express app running on ${port}...`)
});
