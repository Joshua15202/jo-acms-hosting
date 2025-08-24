import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Send email to admin
    const adminEmail = "blacksights99@gmail.com"
    const emailResult = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Message: ${subject}`,
      html: generateContactFormEmailHTML(name, email, phone, subject, message),
    })

    if (emailResult.success) {
      console.log("✅ Contact form message sent successfully")
      return NextResponse.json({ success: true })
    } else {
      console.error("❌ Failed to send contact form message:", emailResult.error)
      return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Contact form API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

function generateContactFormEmailHTML(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be185d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">New Contact Form Message</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 16px;">Jo Pacheco Wedding & Event</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">📧 Contact Form Submission</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              You have received a new message from your website contact form.
            </p>
          </div>
          
          <!-- Customer Details -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">Customer Information</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 100px;">Name:</strong>
              <span style="color: #4b5563;">${name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 100px;">Email:</strong>
              <a href="mailto:${email}" style="color: #e11d48; text-decoration: none;">${email}</a>
            </div>
            
            ${
              phone
                ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 100px;">Phone:</strong>
              <a href="tel:${phone}" style="color: #e11d48; text-decoration: none;">${phone}</a>
            </div>
            `
                : ""
            }
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 100px;">Subject:</strong>
              <span style="color: #4b5563;">${subject}</span>
            </div>
          </div>
          
          <!-- Message Content -->
          <div style="background: #fef2f2; border: 2px solid #e11d48; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #e11d48; margin: 0 0 15px 0; font-size: 18px;">💬 Message</h3>
            <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              Quick Actions:
            </p>
            
            <div style="margin-bottom: 15px;">
              <a href="mailto:${email}?subject=Re: ${subject}" 
                 style="display: inline-block; background: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin: 0 10px;">
                📧 Reply to Customer
              </a>
            </div>
            
            ${
              phone
                ? `
            <div>
              <a href="tel:${phone}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin: 0 10px;">
                📞 Call Customer
              </a>
            </div>
            `
                : ""
            }
          </div>
          
          <!-- Timestamp -->
          <div style="background: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              <strong>Received:</strong> ${new Date().toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              })}
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <h3 style="color: #e11d48; margin: 0 0 10px 0; font-size: 16px;">Jo Pacheco Wedding & Event</h3>
            <p style="color: #6b7280; margin: 0; font-size: 12px; line-height: 1.6;">
              📍 Sullera St. Pandayan, Bulacan<br>
              📞 Phone: (044) 308 3396 | 📱 Mobile: 0917-8543221
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              © 2024 Jo Pacheco Wedding & Event - Admin Notification System
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}
