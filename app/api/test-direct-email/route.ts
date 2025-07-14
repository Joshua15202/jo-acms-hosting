import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    console.log("=== DIRECT EMAIL TEST ===")

    // Check environment variables
    const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]
    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing environment variables: ${missingEnvVars.join(", ")}`,
        missingVars: missingEnvVars,
      })
    }

    console.log("Creating transporter with config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
    })

    // Create transporter directly
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    console.log("Testing connection...")

    // Test the connection
    await transporter.verify()
    console.log("Connection verified successfully")

    // Send test email
    console.log("Sending test email...")
    const info = await transporter.sendMail({
      from: `"Jo Pacheco Wedding & Event" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: "Direct Email Test - Jo Pacheco Wedding & Event",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #e11d48;">Email Test Successful!</h1>
          <p>This is a direct test of your Gmail SMTP configuration.</p>
          <p><strong>Configuration used:</strong></p>
          <ul>
            <li>Host: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT}</li>
            <li>User: ${process.env.SMTP_USER}</li>
            <li>From: ${process.env.SMTP_FROM}</li>
          </ul>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
        </div>
      `,
    })

    console.log("Email sent successfully:", info.messageId)

    return NextResponse.json({
      success: true,
      message: "Direct email test successful",
      messageId: info.messageId,
      recipient: process.env.SMTP_USER,
    })
  } catch (error: any) {
    console.error("Direct email test failed:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
    })
  }
}
