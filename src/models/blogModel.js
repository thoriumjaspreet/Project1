const mongoose = require("mongoose");

const newSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "Blog title is required",
      trim:true
    },

    body: {
      type: String,
      required: "Blog body is required",
      trim:true
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: "AuthorId is required"
    },

    tags: [{type:String,trim:true}],

    category: {
      type: String,
      required:"Category is required",
      trim:true
    },

    subcategory:[{type:String,trim:true}],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Blog", newSchema);
