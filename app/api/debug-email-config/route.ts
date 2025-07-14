import { NextResponse } from "next/server"

export async function GET() {
  console.log("=== EMAIL CONFIGURATION DEBUG ===")

  const envVars = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS ? `${process.env.SMTP_PASS.substring(0, 4)}...` : undefined,
    SMTP_FROM: process.env.SMTP_FROM,
  }

  console.log("Environment variables:", envVars)

  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

  console.log("Missing environment variables:", missingEnvVars)

  return NextResponse.json({
    environmentVariables: envVars,
    missingVariables: missingEnvVars,
    allConfigured: missingEnvVars.length === 0,
    nodeEnv: process.env.NODE_ENV,
    message:
      missingEnvVars.length === 0
        ? "All email environment variables are configured"
        : `Missing: ${missingEnvVars.join(", ")}`,
  })
}
