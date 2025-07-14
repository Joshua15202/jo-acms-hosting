import mysql from "mysql2/promise"
import { v4 as uuidv4 } from "uuid"
import { hashPassword } from "../lib/auth-utils"

async function main() {
  console.log("Initializing database...")

  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
  })

  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || "jo_acms"}`)
    await connection.execute(`USE ${process.env.MYSQL_DATABASE || "jo_acms"}`)

    console.log("Creating tables...")

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_users (
        id VARCHAR(36) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'assistant') DEFAULT 'user',
        created_at DATETIME NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
      )
    `)

    // Create appointments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_appointments (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        service_type VARCHAR(100) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
      )
    `)

    // Check if admin user exists
    const [adminUsers] = await connection.execute("SELECT * FROM tbl_users WHERE email = ? AND role = ?", [
      "admin@example.com",
      "admin",
    ])

    // Create admin user if it doesn't exist
    if (!(adminUsers as any[]).length) {
      console.log("Creating admin user...")
      const adminId = uuidv4()
      const adminPassword = hashPassword("admin123")

      await connection.execute(
        "INSERT INTO tbl_users (id, full_name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [adminId, "Admin User", "admin@example.com", "1234567890", adminPassword, "admin"],
      )

      console.log("Admin user created with email: admin@example.com and password: admin123")
    } else {
      console.log("Admin user already exists")
    }

    // Check if assistant user exists
    const [assistantUsers] = await connection.execute("SELECT * FROM tbl_users WHERE email = ? AND role = ?", [
      "assistant@example.com",
      "assistant",
    ])

    // Create assistant user if it doesn't exist
    if (!(assistantUsers as any[]).length) {
      console.log("Creating assistant user...")
      const assistantId = uuidv4()
      const assistantPassword = hashPassword("assistant123")

      await connection.execute(
        "INSERT INTO tbl_users (id, full_name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [assistantId, "Assistant User", "assistant@example.com", "0987654321", assistantPassword, "assistant"],
      )

      console.log("Assistant user created with email: assistant@example.com and password: assistant123")
    } else {
      console.log("Assistant user already exists")
    }

    console.log("Database initialization completed successfully!")
  } catch (error) {
    console.error("Error initializing database:", error)
  } finally {
    await connection.end()
  }
}

main().catch(console.error)
