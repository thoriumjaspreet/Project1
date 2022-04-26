const express = require("express");
const bodyParser = require("body-parser");
const route = require("./route/route.js");
const { default: mongoose } = require("mongoose");
const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://Sai0047:rXxgqYKPqwnhcXX7@cluster0.qptsw.mongodb.net/PROJECT",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log(" 😎😎 MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", router);

app.listen(process.env.PORT || 3000, function () {
  console.log(" 😍😍Express app running on port" + (process.env.PORT || 3000));
});
