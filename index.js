const express = require("express");
const port = 8000;
const fs = require("fs");
const app = express();

app.use(function(req, res, next) {
    console.log("This is middleware ", req.url);
    next();
});

app.get("/", function(req, res) {
    console.log("req.url is ", req.url);
    // return res.end("<h1>This is Page</h1>");
    fs.readFile("home.html", function(err, data) {
        if (err) {
            console.log("Err in reading the file");
            return res.end("<h1>Error,in reading File</h1>");
        }
        return res.end(data);
    });
});

app.listen(port, function(err) {
    if (err) {
        console.log("Err in Running the Server");
        return;
    }
    console.log("Server is up and running on port: ", port);
    return;
});