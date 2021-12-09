function homePage(req, res) {
    console.log("req.url is ", req.url);
    return res.render("home", {
        layout: "./layouts/some_layout",
    });
}

module.exports = {
    homePage,
};