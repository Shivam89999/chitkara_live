const nodeMailer = require("../config/nodemailer");
const from = "Aaa Tech <aaa.techy.in@gmail.com";
exports.newUserEnterMail = (obj) => {
    console.log("inside the new user enter send mail ");
    //  console.log("obj.data is ", obj.data);
    let htmlString = nodeMailer.renderTemplate({ user: obj.user },
        "/new_user/new_user_enter_mail.ejs"
    );
    // console.log("htmlString is ", htmlString);
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "New User Enter",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending new user enter send mail  ", err);
                return;
            }
            console.log("new user enter mail sended successfully");
            return;
        }
    );
};