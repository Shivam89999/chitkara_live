const mongoose = require("mongoose");

const clubSchema = mongoose.Schema({
    info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
    }, ],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }, ],
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
}, {
    timestamps: true,
}, {
    strict: false,
});

const Club = mongoose.model("Club", clubSchema);

module.exports = Club;