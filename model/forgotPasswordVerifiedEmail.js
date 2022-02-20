const mongoose = require("mongoose");

const forgotPasswordVerifiedEmailSchema = mongoose.Schema({
    email: {
        type: "String",
        required: true,
        unique: true,
    },
    expireAt: { type: Date, default: Date.now, index: { expires: 86400 } },
}, {
    timestamps: true,
});

const forgotPasswordVerifiedEmail = mongoose.model(
    "forgotPasswordVerifiedEmail",
    forgotPasswordVerifiedEmailSchema
);
module.exports = forgotPasswordVerifiedEmail;