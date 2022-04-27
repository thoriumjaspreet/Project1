const mongoose = require("mongoose");

const newSchema = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    title: {
      type: String,
      required: true,
      enum: ["Mr", "Mrs", "Miss"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", newSchema);
