const nodeMailer = require("../config/nodemailer");
const from = "AAA Tech <aaa.techy.in@gmail.com";
//another way of rendering a module
exports.newComment = (comment) => {
    console.log("inside the new comment send mail ");
    let htmlString = nodeMailer.renderTemplate({ data: comment },
        "/comments/new_comment.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
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