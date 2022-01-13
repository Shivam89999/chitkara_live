const mongoose = require("mongoose");

const dayMenuDetail = mongoose.Schema({
    // breakfast: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "FoodDetail",
    // },
    //all breakfaast lunch snacks dinner in one array
    timeFood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodDetail",
    }, ],
    // lunch: {

    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "FoodDetail",
    // },
    // snacks: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "FoodDetail",
    // },
    // dinner: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "FoodDetail",
    // },
}, {
    strict: false
});

const DayMenuDetail = mongoose.model("DayMenuDetail", dayMenuDetail);

module.exports = DayMenuDetail;