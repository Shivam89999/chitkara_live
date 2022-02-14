const mongoose = require("mongoose");

const otpStoreSchema = mongoose.Schema({
    email: {
        type: "String",
        required: true,
        unique: true,
    },
    otp: {
        type: "String",
        required: true,
        unique: true,
    },
    validTill: {
        type: "String",
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

const otpStore = mongoose.model("otpStore", otpStoreSchema);
module.exports = otpStore;