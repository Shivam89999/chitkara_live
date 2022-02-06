const mongoose = require("mongoose");

const verifiedEmailSchema = mongoose.Schema({
    email: {
        type: "String",
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

const verifiedEmail = mongoose.model("verifiedEmail", verifiedEmailSchema);
module.exports = verifiedEmail;