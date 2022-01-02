const mongoose = require("mongoose");

const departSchema = mongoose.Schema({
    info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    textPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "TextPost",
    }, ],
    notices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notice",
    }, ],
    alerts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alert",
    }, ],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
    comingRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
    sendRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
});

const Depart = mongoose.model("Depart", departSchema);

module.exports = Depart;