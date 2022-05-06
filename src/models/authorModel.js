const mongoose = require("mongoose");

const newSchema = new mongoose.Schema(
  {
    fname: {
      type:String,
      required:"First Name is Required" ,
      trim:true
    },

    lname: {
      type:String,
      required:"Last Name is Required",
      trim:true
    },

    title: {
      type: String,
      required: true,
      enum: ["Mr", "Mrs", "Miss"],
      required:"Title is Required"
    },

    email: {
      type: String,
      unique: true,
      lowercase:true,
      required: "Email is Required",
      trim:true,
    },

    password: {
      type: String,
      required: "Password is Required",
      trim:true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", newSchema);
