import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// List of all tables to backup
const TABLES_TO_BACKUP = [
  "tbl_users",
  "tbl_comprehensive_appointments",
  "tbl_admin_notifications",
  "tbl_backdrop_styles",
  "tbl_cancellation_requests",
  "tbl_event_ingredients",
  "tbl_inventory",
  "tbl_notifications",
  "tbl_payment_transactions",
  "tbl_pending_registrations",
  "tbl_food_tastings",
  "tbl_menu_items",
  "tbl_testimonials",
]

export async function POST() {
  try {
    console.log("[v0] Starting database backup...")

    const backupData: Record<string, any[]> = {}

    // Fetch data from all tables
    for (const tableName of TABLES_TO_BACKUP) {
      console.log(`[v0] Backing up table: ${tableName}`)
      const { data, error } = await supabase.from(tableName).select("*")

      if (error) {
        console.error(`[v0] Error backing up ${tableName}:`, error)
        // Continue with other tables even if one fails
        backupData[tableName] = []
      } else {
        backupData[tableName] = data || []
        console.log(`[v0] Backed up ${data?.length || 0} rows from ${tableName}`)
      }
    }

    // Add metadata
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        tables: TABLES_TO_BACKUP,
        version: "1.0",
      },
      data: backupData,
    }

    // Convert to JSON
    const backupJson = JSON.stringify(backup, null, 2)
    const blob = new Blob([backupJson], { type: "application/json" })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `backup-${timestamp}.json`

    // Upload to Vercel Blob
    const { url } = await put(filename, blob, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("[v0] Backup created successfully:", url)

    return NextResponse.json({
      success: true,
      filename,
      url,
      size: backupJson.length,
      tablesBackedUp: Object.keys(backupData).length,
    })
  } catch (error) {
    console.error("[v0] Backup creation error:", error)
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
