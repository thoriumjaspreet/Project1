const authorModels = require("../models/authorModel.js");

module.exports = async function (req, res) {
  let data = req.body;
  let author = await authorModels.create(data);
  res.send({ msg: author });
};
