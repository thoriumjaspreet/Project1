const mongoose = require("mongoose");

const isValid = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "undefined" || value === null) return false;
    return true;
}

const isValid2 = function (value) {
    const dv = /[a-zA-Z]/;
    if (typeof value !== 'string') return false;
    if (dv.test(value) === false) return false;
    return true;
}

const check = (value) => {
    value.every(i => typeof i === "string"); return true
}

const isValidObjectId = (objectId) => {
    if (mongoose.Types.ObjectId.isValid(objectId)) return true;
    return false;
};

const isValidEmail = function (value) {
    if (! /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(value)) {
        return false
    }
    return true
}


const isValidPassword = function (value) {
    return (/^(?!\S*\s)(?=\D*\d)(?=.*[!@#$%^&*])(?=[^A-Z]*[A-Z]).{8,15}$/).test(value)
}

const isValidBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
module.exports = {
    isValid,
    isValid2,
    isValidObjectId,
    check,
    isValidEmail,
    isValidPassword,
    isValidBody
}