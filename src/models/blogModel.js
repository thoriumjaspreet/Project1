const mongoose = require("mongoose");

const newSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    authorId: {
      type: mobgoose.Schema.Types.ObjectId,
      ref: "Author",
    },
    tags: [String],
    category: {
      type: String,
      required: true,
    },
    subcategory: [String],
    deletedAt: Date.now,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date.now,
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", newSchema);

//   deletedAt: {when the document is deleted}, isDeleted: {boolean, default: false}, publishedAt: {when the blog is published}, isPublished: {boolean, default: false}
