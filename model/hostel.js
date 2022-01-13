const mongoose = require("mongoose");

const hostelSchema = mongoose.Schema({
    info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] }],
    textPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "TextPost",
        default: [],
    }, ],
    notices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notice",
        default: [],
    }, ],
    alerts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alert",
        default: [],
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
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        default: null,
    },
}, {
    strict: false,
});

const Hostel = mongoose.model("Hostel", hostelSchema);

module.exports = Hostel;