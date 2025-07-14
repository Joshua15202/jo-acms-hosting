import nodemailer from "nodemailer"

// Create reusable transporter object using SMTP transport
let transporter: any = null

function createTransporter() {
  if (transporter) return transporter

  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingEnvVars.length > 0) {
    console.warn(`Missing email environment variables: ${missingEnvVars.join(", ")}`)
    return null
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    console.log("✅ Email transporter created successfully")
    return transporter
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error)
    return null
  }
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const emailTransporter = createTransporter()

    if (!emailTransporter) {
      console.warn("⚠️ Email transporter not available - checking environment variables...")
      const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]
      const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

      if (missingEnvVars.length > 0) {
        console.warn(`Missing: ${missingEnvVars.join(", ")}`)
      }

      return {
        success: false,
        error: "Email service not configured properly",
        skipped: true,
      }
    }

    console.log("📧 Sending email to:", to)
    console.log("📧 Subject:", subject)

    const info = await emailTransporter.sendMail({
      from: `"Jo Pacheco Wedding & Event" <${process.env.SMTP_FROM}>`,
      to: to,
      subject: subject,
      html: html,
    })

    console.log("✅ Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function generateVerificationEmailHTML(firstName: string, verificationCode: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be185d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Jo Pacheco Wedding & Event</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 16px;">Professional Catering Services</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">Verify Your Account</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Welcome ${firstName}! Please use the verification code below to complete your registration.
            </p>
          </div>
          
          <!-- Verification Code -->
          <div style="background: #f3f4f6; border: 2px dashed #e11d48; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <span style="color: #e11d48; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${verificationCode}
              </span>
            </div>
          </div>
          
          <!-- Instructions -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Important:</strong> This code will expire in 30 minutes for security reasons.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center; margin: 20px 0;">
            If you didn't create an account with Jo Pacheco Wedding & Event, please ignore this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <h3 style="color: #e11d48; margin: 0 0 10px 0; font-size: 18px;">Contact Us</h3>
            <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
              📍 Sullera St. Pandayan, Bulacan<br>
              📞 Phone: (044) 308 3396<br>
              📱 Mobile: 0917-8543221<br>
              ✉️ Email: ${process.env.SMTP_FROM}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Jo Pacheco Wedding & Event. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

export function generatePasswordResetEmailHTML(firstName: string, resetCode: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be185d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Jo Pacheco Wedding & Event</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 16px;">Professional Catering Services</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">🔐 Password Reset Request</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Hi ${firstName}! We received a request to reset your password. Use the verification code below to create a new password.
            </p>
          </div>
          
          <!-- Reset Code -->
          <div style="background: #fef2f2; border: 2px dashed #e11d48; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Password Reset Code</p>
            <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <span style="color: #e11d48; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${resetCode}
              </span>
            </div>
          </div>
          
          <!-- Security Notice -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> This code will expire in 30 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center; margin: 20px 0;">
            For your security, never share this code with anyone. Our team will never ask for your verification code.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <h3 style="color: #e11d48; margin: 0 0 10px 0; font-size: 18px;">Contact Us</h3>
            <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
              📍 Sullera St. Pandayan, Bulacan<br>
              📞 Phone: (044) 308 3396<br>
              📱 Mobile: 0917-8543221<br>
              ✉️ Email: ${process.env.SMTP_FROM}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Jo Pacheco Wedding & Event. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

export function generateTastingConfirmationEmailHTML(
  firstName: string,
  eventType: string,
  eventDate: string,
  proposedTastingDate: string,
  proposedTastingTime: string,
  tastingToken: string,
): string {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "")
  const confirmUrl = `${baseUrl}/api/tasting/confirm?token=${tastingToken}&action=confirm`
  const rescheduleUrl = `${baseUrl}/api/tasting/confirm?token=${tastingToken}&action=reschedule`

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be185d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Jo Pacheco Wedding & Event</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 16px;">Professional Catering Services</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">🎉 Thank You for Your Booking!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Hi ${firstName}! We're excited to cater your ${eventType} on ${new Date(eventDate).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}.
            </p>
          </div>
          
          <!-- Tasting Schedule -->
          <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 20px;">🍽️ Let's Schedule Your Tasting!</h3>
            <p style="color: #075985; margin: 0 0 20px 0; font-size: 16px;">
              We've tentatively scheduled your tasting session for:
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
              <div style="color: #e11d48; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
                ${new Date(proposedTastingDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div style="color: #6b7280; font-size: 18px;">
                ${proposedTastingTime}
              </div>
            </div>
            <p style="color: #075985; margin: 0; font-size: 14px;">
              This gives us time to prepare the perfect menu for your event!
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              <strong>Is this date and time convenient for you?</strong>
            </p>
            
            <div style="margin-bottom: 15px;">
              <a href="${confirmUrl}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px;">
                ✅ Confirm This Date
              </a>
            </div>
            
            <div>
              <a href="${rescheduleUrl}" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px;">
                📅 Request a Different Date
              </a>
            </div>
          </div>
          
          <!-- What to Expect -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">What to Expect at Your Tasting:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Sample portions of your selected menu items</li>
              <li>Opportunity to make adjustments to your menu</li>
              <li>Discussion of final event details</li>
              <li>Finalization of your catering package</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center; margin: 20px 0;">
            If you have any questions or concerns, please don't hesitate to contact us directly.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <h3 style="color: #e11d48; margin: 0 0 10px 0; font-size: 18px;">Contact Us</h3>
            <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
              📍 Sullera St. Pandayan, Bulacan<br>
              📞 Phone: (044) 308 3396<br>
              📱 Mobile: 0917-8543221<br>
              ✉️ Email: ${process.env.SMTP_FROM}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Jo Pacheco Wedding & Event. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

export function generateTastingConfirmedEmailHTML(
  firstName: string,
  eventType: string,
  eventDate: string,
  tastingDate: string,
  tastingTime: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Jo Pacheco Wedding & Event</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 16px;">Professional Catering Services</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">✅ Tasting Confirmed!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Perfect! Hi ${firstName}, your tasting session has been confirmed.
            </p>
          </div>
          
          <!-- Confirmed Details -->
          <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 20px;">📅 Your Confirmed Tasting</h3>
            <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
              <div style="color: #10b981; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
                ${new Date(tastingDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div style="color: #6b7280; font-size: 18px;">
                ${tastingTime}
              </div>
            </div>
            <p style="color: #065f46; margin: 0; font-size: 14px;">
              We'll see you then to finalize your ${eventType} menu!
            </p>
          </div>
          
          <!-- Next Steps -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">What's Next:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>We'll prepare sample portions of your selected menu</li>
              <li>Please arrive 10 minutes early</li>
              <li>Bring any dietary restrictions or special requests</li>
              <li>We'll finalize all details for your ${eventType}</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center; margin: 20px 0;">
            Looking forward to seeing you! If you need to make any changes, please contact us as soon as possible.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <h3 style="color: #e11d48; margin: 0 0 10px 0; font-size: 18px;">Contact Us</h3>
            <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
              📍 Sullera St. Pandayan, Bulacan<br>
              📞 Phone: (044) 308 3396<br>
              📱 Mobile: 0917-8543221<br>
              ✉️ Email: ${process.env.SMTP_FROM}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Jo Pacheco Wedding & Event. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

export function generateAdminNotificationEmailHTML(
  customerName: string,
  eventType: string,
  eventDate: string,
  tastingDate: string,
  tastingTime: string,
  action: "confirmed" | "reschedule_requested",
): string {
  const actionText = action === "confirmed" ? "CONFIRMED" : "RESCHEDULE REQUESTED"
  const actionColor = action === "confirmed" ? "#10b981" : "#f59e0b"

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Admin Notification</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 16px;">Jo Pacheco Wedding & Event</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">Tasting ${actionText}</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
              Customer action required for tasting appointment.
            </p>
          </div>
          
          <!-- Customer Details -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Customer Information</h3>
            <p style="color: #4b5563; margin: 5px 0; font-size: 14px;"><strong>Name:</strong> ${customerName}</p>
            <p style="color: #4b5563; margin: 5px 0; font-size: 14px;"><strong>Event Type:</strong> ${eventType}</p>
            <p style="color: #4b5563; margin: 5px 0; font-size: 14px;"><strong>Event Date:</strong> ${new Date(
              eventDate,
            ).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
          
          <!-- Tasting Details -->
          <div style="background: ${actionColor}20; border: 2px solid ${actionColor}; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: ${actionColor}; margin: 0 0 15px 0; font-size: 18px;">Tasting Status: ${actionText}</h3>
            <div style="background: white; border-radius: 8px; padding: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="color: #1f2937; font-size: 16px; font-weight: bold; margin-bottom: 5px;">
                ${new Date(tastingDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                ${tastingTime}
              </div>
            </div>
          </div>
          
          <!-- Action Required -->
          ${
            action === "reschedule_requested"
              ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Action Required:</h4>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
              The customer has requested a different tasting date. Please contact them to arrange a new appointment.
            </p>
          </div>
          `
              : `
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">Tasting Confirmed:</h4>
            <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.6;">
              The customer has confirmed the tasting appointment. Please prepare accordingly.
            </p>
          </div>
          `
          }
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Jo Pacheco Wedding & Event - Admin System
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}
