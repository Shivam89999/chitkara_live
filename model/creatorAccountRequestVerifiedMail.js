const mongoose = require("mongoose");

const creatorAccountRequestVerifiedEmailSchema = mongoose.Schema({
    email: {
        type: "String",
        required: true,
        unique: true,
    },
    name: {
        type: "String",
        required: true,
    },
    type: {
        type: "String",
        enum: ["Hostel", "Club", "Depart"],
        required: true,
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    expireAt: { type: Date, default: Date.now(), index: { expires: 20 } },
}, {
    timestamps: true,
});

const creatorAccountRequestVerifiedEmail = mongoose.model(
    "creatorAccountRequestVerifiedEmail",
    creatorAccountRequestVerifiedEmailSchema
);
module.exports = creatorAccountRequestVerifiedEmail;