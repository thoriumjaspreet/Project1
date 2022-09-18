require('dotenv').config()
const express = require("express");
const route = require("./routes/route");

const mongoose = require("mongoose");
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://Sai0047:rXxgqYKPqwnhcXX7@cluster0.qptsw.mongodb.net/Blogging_Site_Project_1",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is Connected"))
  .catch((err) => console.log(err));

app.use("/", route);

const port = process.env.PORT || 3000

app.listen(process.env.PORT || 3000, function () {
  console.log(`Express app running on ${port}...`)
});
