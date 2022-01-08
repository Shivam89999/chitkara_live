const mongoose = require("mongoose");
const eventSchema = mongoose.Schema({
    caption: {
        type: "String",
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }, ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    venu: {
        type: "String",
        default: "",
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
    }, ],
});