const mongoose = require("mongoose");

const menuSchema = mongoose.Schema({
    heading: {
        type: "String",
        required: true,
        default: "",
    },
    dayWise: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DayMenuDetail",
        default: null,
    }, ],
}, {
    timestamps: true,
}, {
    strict: false,
});

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;