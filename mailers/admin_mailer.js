const nodeMailer = require("../config/nodemailer");
const from = "Aaa Tech <aaa.techy.in@gmail.com";
exports.addAdmin = (obj) => {
    console.log("inside the add admin send mail ");
    //  console.log("obj.data is ", obj.data);
    let htmlString = nodeMailer.renderTemplate({ creatorProfile: obj.creatorProfile, targetName: obj.targetName },
        "/admin/add_admin.ejs"
    );
    // console.log("htmlString is ", htmlString);
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "You are selected for admin",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending add admin send mail  ", err);
                return;
            }
            console.log("add admin mail sended successfully");
            return;
        }
    );
};

exports.removeAdmin = (obj) => {
    console.log("inside the add admin send mail ");
    //  console.log("obj.data is ", obj.data);
    let htmlString = nodeMailer.renderTemplate({ creatorProfile: obj.creatorProfile, targetName: obj.targetName },
        "/admin/removed_admin.ejs"
    );
    // console.log("htmlString is ", htmlString);
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "You are removed from admin",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending add admin send mail  ", err);
                return;
            }
            console.log("add admin mail sended successfully");
            return;
        }
    );
};