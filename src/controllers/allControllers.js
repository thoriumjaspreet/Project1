const authorModels = require("../models/authorModel.js");
const blogModels = require("../models/blogModel.js");

module.exports.createAuthor = async function (req, res) {
  let data = req.body;
  let Author = await authorModels.create(data);
  res.send({ msg: Author });
};
