import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, email, subject, and message are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 },
      )
    }

    console.log("=== Contact Form Submission ===")
    console.log("From:", name, email)
    console.log("Subject:", subject)
    console.log("Phone:", phone || "Not provided")

    // Create admin notification email
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Message</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e11d48, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .customer-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #e11d48; }
            .message-section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #fecaca; }
            .info-row { margin-bottom: 12px; }
            .label { font-weight: bold; color: #374151; display: inline-block; width: 80px; }
            .value { color: #1f2937; }
            .message-content { background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #e11d48; white-space: pre-wrap; }
            .actions { text-align: center; margin: 20px 0; }
            .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .btn-primary { background: #e11d48; color: white; }
            .btn-secondary { background: #6b7280; color: white; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .timestamp { background: #f3f4f6; padding: 10px; border-radius: 6px; font-size: 14px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">New Contact Form Message</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Jo Pacheco Wedding & Event Planning</p>
            </div>
            
            <div class="content">
              <div class="customer-info">
                <h2 style="margin-top: 0; color: #e11d48;">Customer Information</h2>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">${name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value"><a href="mailto:${email}" style="color: #e11d48;">${email}</a></span>
                </div>
                ${
                  phone
                    ? `<div class="info-row">
                         <span class="label">Phone:</span>
                         <span class="value"><a href="tel:${phone}" style="color: #e11d48;">${phone}</a></span>
                       </div>`
                    : ""
                }
                <div class="info-row">
                  <span class="label">Subject:</span>
                  <span class="value"><strong>${subject}</strong></span>
                </div>
              </div>

              <div class="message-section">
                <h3 style="margin-top: 0; color: #e11d48;">Message</h3>
                <div class="message-content">${message}</div>
              </div>

              <div class="actions">
                <a href="mailto:${email}?subject=Re: ${subject}" class="btn btn-primary">Reply to Customer</a>
                ${phone ? `<a href="tel:${phone}" class="btn btn-secondary">Call Customer</a>` : ""}
              </div>

              <div class="timestamp">
                <strong>Received:</strong> ${new Date().toLocaleString("en-PH", {
                  timeZone: "Asia/Manila",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })} (Philippine Time)
              </div>
            </div>

            <div class="footer">
              <p><strong>Jo Pacheco Wedding & Event Planning</strong></p>
              <p>Admin Notification System</p>
              <p style="font-size: 12px; margin-top: 15px;">
                This is an automated message from your website contact form.<br>
                Please respond to the customer within 24 hours for best service.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to admin
    const emailResult = await sendEmail({
      to: "blacksights99@gmail.com",
      subject: `New Contact Form Message: ${subject}`,
      html: adminEmailHtml,
    })

    if (!emailResult.success) {
      console.error("Failed to send admin notification email:", emailResult.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send message. Please try again later.",
        },
        { status: 500 },
      )
    }

    console.log("✅ Contact form message sent successfully to admin")

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you within 24 hours.",
    })
  } catch (error) {
    console.error("Error in contact form submission:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
