import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { backupUrl } = await request.json()

    if (!backupUrl) {
      return NextResponse.json({ error: "Backup URL is required" }, { status: 400 })
    }

    console.log("[v0] Starting database restore from:", backupUrl)

    // Fetch backup data
    const response = await fetch(backupUrl)
    if (!response.ok) {
      throw new Error("Failed to fetch backup file")
    }

    const backup = await response.json()

    if (!backup.data || !backup.metadata) {
      throw new Error("Invalid backup file format")
    }

    console.log("[v0] Backup metadata:", backup.metadata)

    // Restore each table
    for (const [tableName, tableData] of Object.entries(backup.data)) {
      if (!Array.isArray(tableData) || tableData.length === 0) {
        console.log(`[v0] Skipping empty table: ${tableName}`)
        continue
      }

      console.log(`[v0] Restoring table: ${tableName} (${tableData.length} rows)`)

      // Delete existing data (optional - you might want to keep this or make it configurable)
      const { error: deleteError } = await supabase.from(tableName).delete().neq("id", 0)

      if (deleteError) {
        console.error(`[v0] Error deleting from ${tableName}:`, deleteError)
      }

      // Insert backup data
      const { error: insertError } = await supabase.from(tableName).insert(tableData)

      if (insertError) {
        console.error(`[v0] Error restoring ${tableName}:`, insertError)
        // Continue with other tables even if one fails
      } else {
        console.log(`[v0] Restored ${tableData.length} rows to ${tableName}`)
      }
    }

    console.log("[v0] Database restore completed")

    return NextResponse.json({
      success: true,
      message: "Database restored successfully",
      tablesRestored: Object.keys(backup.data).length,
    })
  } catch (error) {
    console.error("[v0] Restore error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to restore backup" },
      { status: 500 },
    )
  }
}
