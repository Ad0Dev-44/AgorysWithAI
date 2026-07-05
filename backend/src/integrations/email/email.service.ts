import { transporter } from "./email.client";

export const sendEmail = async (
  to: string,
  subject: string,
  body: string
) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: body,
      html: `<b>${body}</b>`,
    });

    console.log("Email sent, messageId:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};