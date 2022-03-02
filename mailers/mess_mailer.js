const nodeMailer = require("../config/nodemailer");
const from = "Aaa Tech <aaa.techy.in@gmail.com";
module.exports.menuChanged = (obj) => {
    console.log("inside the menu change send mail ");
    let htmlString = nodeMailer.renderTemplate({ obj }, "/mess/menu_change.ejs");
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: obj.byName + " Hostel Menu Changed",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for menu changed: ", err);
                return;
            }
            console.log("mail send for menu changed  successfully");
            return;
        }
    );
};