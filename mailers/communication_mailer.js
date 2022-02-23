const nodeMailer = require("../config/nodemailer");

exports.sendCommuncationMail = (obj) => {
    console.log("inside the communication send mail ");
    //  console.log("obj.data is ", obj.data);
    let htmlString = nodeMailer.renderTemplate({ data: obj.data },
        "/communication/info_mail.ejs"
    );
    // console.log("htmlString is ", htmlString);
    console.log("heading is ", obj.data.heading);
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: obj.targetEmail,
            subject: obj.data.heading,
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending communication mail  ", err);
                return;
            }
            console.log("communication mail sended successfully");
            return;
        }
    );
};