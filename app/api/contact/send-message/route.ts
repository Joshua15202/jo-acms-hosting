import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    console.log("=== Contact Form Message API Called ===")

    const body = await request.json()
    const { name, email, phone, subject, message } = body

    console.log("Contact form data:", { name, email, phone, subject, messageLength: message?.length })

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Create admin notification email
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Contact Form Message</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Jo Pacheco Wedding & Event Planning</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; background-color: #ffffff;">
          <!-- Customer Information -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">
              Customer Information
            </h2>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center;">
                <strong style="color: #374151; min-width: 80px;">Name:</strong>
                <span style="color: #1f2937; margin-left: 10px;">${name}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <strong style="color: #374151; min-width: 80px;">Email:</strong>
                <a href="mailto:${email}" style="color: #dc2626; text-decoration: none; margin-left: 10px;">${email}</a>
              </div>
              ${
                phone
                  ? `
              <div style="display: flex; align-items: center;">
                <strong style="color: #374151; min-width: 80px;">Phone:</strong>
                <a href="tel:${phone}" style="color: #dc2626; text-decoration: none; margin-left: 10px;">${phone}</a>
              </div>
              `
                  : ""
              }
              <div style="display: flex; align-items: center;">
                <strong style="color: #374151; min-width: 80px;">Subject:</strong>
                <span style="color: #1f2937; margin-left: 10px; font-weight: 600;">${subject}</span>
              </div>
            </div>
          </div>

          <!-- Message Content -->
          <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #991b1b; font-size: 18px; margin: 0 0 15px 0;">Message Content:</h3>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
              <p style="color: #1f2937; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Quick Actions:</h3>
            <div style="display: inline-flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}&body=Hi ${encodeURIComponent(name)},%0A%0AThank you for contacting Jo Pacheco Wedding %26 Event Planning.%0A%0A" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                📧 Reply to Customer
              </a>
              ${
                phone
                  ? `
              <a href="tel:${phone}" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                📞 Call Customer
              </a>
              `
                  : ""
              }
            </div>
          </div>

          <!-- Message Details -->
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 15px; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              <strong>Received:</strong> ${new Date().toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })} (Philippine Time)
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">
              This message was sent through the contact form on your website.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; font-size: 14px;">
            <strong style="color: #ffffff;">Jo Pacheco Wedding & Event Planning</strong><br>
            Creating memorable moments for your special occasions
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
            Admin Notification System • Please respond to customer inquiries promptly
          </p>
        </div>
      </div>
    `

    // Send email to admin
    await sendEmail({
      to: "blacksights99@gmail.com",
      subject: `New Contact Form Message: ${subject}`,
      html: adminEmailContent,
    })

    console.log("✅ Contact form message sent successfully to admin")

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    })
  } catch (error: any) {
    console.error("❌ Error sending contact form message:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message. Please try again later.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
