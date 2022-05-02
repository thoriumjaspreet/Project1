const mongoose = require("mongoose");

const newSchema = new mongoose.Schema(
  {
    fname: {
      type:String,
      required:true 
    },
    lname: {
      type:String,
      required:true
    },
    title: {
      type: String,
      required: true,
      enum: ["Mr", "Mrs", "Miss"],
    },
    email: {
      type: String,
      unique: true,
      lowercase:true,
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
