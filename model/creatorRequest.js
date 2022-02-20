const mongoose = require("mongoose");

const creatorRequestSchema = mongoose.Schema({
    name: {
        type: "String",
        required: true,
    },
    email: {
        type: "String",
        required: true,
        unique: true,
    },
    onModel: {
        type: "String",
        enum: ["Club", "Hostel", "Depart"],
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});

const creatorRequest = mongoose.model("creatorRequest", creatorRequestSchema);

module.exports = creatorRequest;