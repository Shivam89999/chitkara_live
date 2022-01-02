const mongoose = require("mongoose");

const likeSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    obj: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel",
    },
    onModel: {
        type: "String",
        enum: ["Post", "Comment", "Notice"],
    },
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;