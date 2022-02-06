const Post = require("../../../model/post");
module.exports.index = async function(req, res) {
    let posts = await Post.find({});

    return res.json(200, {
        message: "List of Posts",
        posts: posts,
    });
};