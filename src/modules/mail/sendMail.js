import nodemailder from "nodemailer";
import { MAIL_USER, MAIL_PASS } from "../../common/configs/environment.js";

const tranporter = nodemailder.createTransport({
  service: "gmail",
  port: 465,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

export const sendMail = async (toEmail, subject, template) => {
  const info = await tranporter.sendMail({
    from: "GoTicket <no-reply@goticket.com>",
    to: toEmail,
    subject: `${subject}`,
    html: template,
    replyTo: undefined,
  });
  console.log("Email send: %s", info.messageId);
};
