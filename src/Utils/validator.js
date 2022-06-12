const mongoose = require('mongoose')

const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId);
};


//------------Function to check every element of Array TAGS to be string
const check = (x) => {
    return x.every(i => typeof (i) === "string")
}



module.exports = { isValidObjectId, check }