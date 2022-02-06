const nodeMailer = require("../config/nodemailer");

//another way of rendering a module
exports.newComment = (comment) => {
    console.log("inside the new comment send mail ");
    let htmlString = nodeMailer.renderTemplate({ data: comment },
        "/comments/new_comment.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: comment.to + "",
            subject: "new Comment published",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for new comment: ", err);
                return;
            }
            console.log("mail send for new comment successfully");
            return;
        }
    );
};