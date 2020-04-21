const nodemailer = require("nodemailer");
const secrets = require("./secrets.json");

const smtpConfig = {
  service: "Mailjet",
  auth: {
    user: secrets.mailjet.api_key,
    pass: secrets.mailjet.secret_key,
  },
};

const mailTransporter = nodemailer.createTransport(smtpConfig);

const sendIt = async (filename, url) => {
  const mailOptions = {
    from: "Delivery Finder <info@jamiewbuck.com>",
    to: secrets.notifcations.send_to_email,
    subject: "Found New Delivery Windows",
    text: "Found New Delivery Windows",
    html: `<a href="${url}" target="_blank">Click here to checkout</a>`,
    attachments: [
      {
        filename: filename,
        path: `./tmp/${filename}`,
        cid: "jamie.william.buck@gmail.com",
      },
    ],
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
