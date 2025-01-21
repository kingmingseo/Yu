import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Nodemailer transporter 설정
    const transporter = nodemailer.createTransport({
      service: "gmail", // 네이버 이메일을 사용
      auth: {
        user: "multi197122@gmail.com", // 본인의 지메일
        pass: "jezf vini ohlm iniq", // 네이버 이메일 비밀번호 또는 앱 비밀번호
      },
    });

    // 이메일 옵션
    const mailOptions = {
      from: email,
      to: "multi197122@gmail.com", // 수신자 이메일
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `,
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
}
