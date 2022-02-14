const mongoose = require("mongoose");

const saveSchema = mongoose.Schema({
    refItem: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel",
    },
    onModel: {
        type: "String",
        enum: ["Post", "TextPost"],
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
}, {
    strict: false,
});

const Save = mongoose.model("Save", saveSchema);

module.exports = Save;