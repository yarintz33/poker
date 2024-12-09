import nodemailer from "nodemailer";

async function sendEmail(address, code) {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can use other services too
    auth: {
      user: "mobank158@gmail.com", // Your Gmail address
      pass: "hhgt xpoj frpl qgiv", // Your Gmail app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: "mobank158@gmail.com",
    to: address,
    subject: "Code to bank",
    html: `<strong>Your code: ${code}</strong>`,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export default sendEmail;
