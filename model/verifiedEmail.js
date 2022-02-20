const mongoose = require("mongoose");

const verifiedEmailSchema = mongoose.Schema({
    email: {
        type: "String",
        required: true,
        unique: true,
    },
    expireAt: { type: Date, default: Date.now, index: { expires: 86400 } },
}, {
    timestamps: true,
});

const verifiedEmail = mongoose.model("verifiedEmail", verifiedEmailSchema);
module.exports = verifiedEmail;