import nodemailer from "nodemailer";

export async function POST(request) {
  const { name, email, phone, message } = await request.json();

  if (!name || !email || !message) {
    return Response.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    // Nodemailer transporter 설정
    const transporter = nodemailer.createTransporter({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER, // 환경 변수에서 이메일 주소
        pass: process.env.EMAIL_PASS, // 환경 변수에서 앱 비밀번호
      },
    });

    // 이메일 옵션
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_TO, // 환경 변수에서 수신자 이메일
      subject: `[Yu] New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `,
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    return Response.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ message: "Failed to send email" }, { status: 500 });
  }
}
