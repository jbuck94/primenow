const nodemailer = require("nodemailer");

const smtpConfig = {
  service: "Mailjet",
  auth: {
    user: "9644f251fa0b66b948232a6ab87ee573",
    pass: "5a3579267d70e7b8723cec9af9be3b60"
  }
};

const mailTransporter = nodemailer.createTransport(smtpConfig);

const sendIt = async filename => {
  const mailOptions = {
    from: "The Grocery Man <info@jamiewbuck.com>",
    to: "jamie.william.buck@gmail.com",
    subject: "GETEMMMM",
    text: "Grocery Apts",
    attachments: [
      {
        filename: filename,
        path: `./tmp/${filename}`,
        cid: "jamie.william.buck@gmail.com"
      }
    ]
  };

  await mailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports.sendIt = sendIt;
