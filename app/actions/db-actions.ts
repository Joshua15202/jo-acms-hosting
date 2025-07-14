"use server"

import { query } from "@/lib/db"

export async function testDatabaseConnection() {
  try {
    const result = await query("SELECT 1 as connection_test")
    return {
      success: true,
      message: "Database connection successful",
      result,
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getDatabaseTables() {
  try {
    const result = await query("SHOW TABLES")
    return {
      success: true,
      tables: result,
    }
  } catch (error) {
    console.error("Failed to get database tables:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
