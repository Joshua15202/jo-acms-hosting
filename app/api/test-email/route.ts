import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, generateTastingConfirmationEmailHTML } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing email configuration...")

    // Test email with sample data
    const testEmail = "delacruzjoshuacumplido.pdm@gmail.com" // Your email
    const sampleData = {
      firstName: "Joshua",
      eventType: "Wedding",
      eventDate: "2025-07-15",
      tastingDate: "2025-07-12",
      tastingTime: "10:00 AM",
      tastingToken: "test-token-123",
    }

    const emailHtml = generateTastingConfirmationEmailHTML(
      sampleData.firstName,
      sampleData.eventType,
      sampleData.eventDate,
      sampleData.tastingDate,
      sampleData.tastingTime,
      sampleData.tastingToken,
    )

    console.log("Sending test email to:", testEmail)

    const emailResult = await sendEmail({
      to: testEmail,
      subject: "Test - Food Tasting Confirmation",
      html: emailHtml,
    })

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        emailSent: true,
        recipient: testEmail,
        messageId: emailResult.messageId,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to send test email",
        error: emailResult.error,
        skipped: emailResult.skipped || false,
      })
    }
  } catch (error: any) {
    console.error("Test email error:", error)
    return NextResponse.json({
      success: false,
      message: "Error testing email",
      error: error.message,
    })
  }
}
