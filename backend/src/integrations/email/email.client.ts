import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,
  port: Number(process.env.SES_SMTP_PORT),
  secure: process.env.SES_SMTP_SECURE === "true",
  auth: {
    user: process.env.SES_SMTP_USERNAME,
    pass: process.env.SES_SMTP_PASSWORD,
  },
});