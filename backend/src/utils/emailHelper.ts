export const sendEmail = async (
  to: string,
  subject: string,
  message: string,
): Promise<void> => {
  // For now (development mode)
  console.log("EMAIL SENT:");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Message:", message);

  // Later you can replace this with:
  // - nodemailer
  // - resend
  // - sendgrid
};