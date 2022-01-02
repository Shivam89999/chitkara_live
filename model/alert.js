const mongoose = require("mongoose");

const alertSchema = mongoose.Schema({
    content: {
        type: "String",
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    //you can write index here as
    expireAt: { type: Date, default: new Date(), index: { expires: 0 } },
    // expireAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// alertSchema.index = { expires: "1m" };
const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;