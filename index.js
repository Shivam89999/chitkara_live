const express = require("express");
const port = 8000;
const fs = require("fs");

const app = express();

//connect app to db
const db = require("./config/mongoose");

app.set("view engine", "ejs");
app.set("views", "./views");

//this is a middleware
// app.use(function(req, res, next) {
//     console.log("This is middleware ", req.url);
//     next();
// });

app.use(express.urlencoded());

app.use("/", require("./routes"));

app.listen(port, function(err) {
    if (err) {
        console.log("Err in Running the Server");
        return;
    }
    console.log("Server is up and running on port: ", port);
    return;
});