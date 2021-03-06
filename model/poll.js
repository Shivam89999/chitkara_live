const mongoose = require("mongoose");
const pollSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    question: {
        type: "String",
        required: true,
    },
    yes_option: {
        type: "String",
        default: "YES",
    },
    yes_votes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    no_votes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    no_option: {
        type: "String",
        default: "NO",
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: 86400 },
    },
    // createdAt: { type: Date, expires: "2m", default: Date.now },
}, {
    timestamps: true,
}, {
    strict: false,
});
// pollSchema.index({ expireAt: 1 }, { expireAfterSeconds: 1000 });
// pollSchema.index = { expires: "1m" };
const Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;