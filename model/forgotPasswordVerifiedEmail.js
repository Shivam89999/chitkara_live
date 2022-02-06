const mongoose = require("mongoose");

const forgotPasswordVerifiedEmailSchema = mongoose.Schema({
    email: {
        type: "String",
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

const forgotPasswordVerifiedEmail = mongoose.model(
    "forgotPasswordVerifiedEmail",
    forgotPasswordVerifiedEmailSchema
);
module.exports = forgotPasswordVerifiedEmail;