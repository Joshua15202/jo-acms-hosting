import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "monthly"
    const period = searchParams.get("period") || "monthly"
    const selectedMonth = Number.parseInt(searchParams.get("month") || "0", 10)
    const selectedYear = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString(), 10)

    console.log("[v0] Download PDF - Received params:", { format, period, selectedMonth, selectedYear })

    let startDate: Date
    let endDate: Date
    let title: string

    if (period === "monthly") {
      // Use selected month and year (month is 1-12, convert to 0-11 for Date)
      startDate = new Date(selectedYear, selectedMonth - 1, 1)
      endDate = new Date(selectedYear, selectedMonth, 0) // Last day of selected month
      title = `Monthly Sales Report - ${startDate.toLocaleString("en-US", { month: "long", year: "numeric" })}`
    } else {
      // Yearly report for selected year
      startDate = new Date(selectedYear, 0, 1)
      endDate = new Date(selectedYear, 11, 31)
      title = `Yearly Sales Report - ${selectedYear}`
    }

    console.log("[v0] Download PDF - Date range:", { startDate: startDate.toISOString(), endDate: endDate.toISOString() })

    // Fetch completed events
    const { data: events, error } = await supabase
      .from("tbl_comprehensive_appointments")
      .select(`
        *,
        tbl_users!inner(
          full_name,
          email
        )
      `)
      .eq("status", "completed")
      .gte("event_date", startDate.toISOString().split("T")[0])
      .lte("event_date", endDate.toISOString().split("T")[0])
      .order("event_date", { ascending: false })

    if (error) throw error

    // Calculate statistics
    const totalRevenue = events?.reduce((sum, e) => sum + Number.parseFloat(e.total_package_amount || "0"), 0) || 0
    const totalEvents = events?.length || 0
    const avgRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0

    // Event type breakdown
    const eventTypes = new Map<string, { count: number; revenue: number }>()
    events?.forEach((event) => {
      const type = event.event_type
      const revenue = Number.parseFloat(event.total_package_amount || "0")
      const current = eventTypes.get(type) || { count: 0, revenue: 0 }
      eventTypes.set(type, {
        count: current.count + 1,
        revenue: current.revenue + revenue,
      })
    })

    // Monthly breakdown for yearly reports
    const monthlyData = new Map<string, { events: number; revenue: number }>()
    if (format === "yearly") {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

      events?.forEach((event) => {
        const eventDate = new Date(event.event_date)
        const monthKey = monthNames[eventDate.getMonth()]
        const revenue = Number.parseFloat(event.total_package_amount || "0")

        const current = monthlyData.get(monthKey) || { events: 0, revenue: 0 }
        monthlyData.set(monthKey, {
          events: current.events + 1,
          revenue: current.revenue + revenue,
        })
      })
    }

    // Find peak month
    let peakMonth = { month: "N/A", events: 0, revenue: 0 }
    monthlyData.forEach((data, month) => {
      if (data.events > peakMonth.events) {
        peakMonth = { month, events: data.events, revenue: data.revenue }
      }
    })

    // Generate PDF content as HTML (will be converted to PDF by jsPDF)
    const jsPDF = (await import("jspdf")).default
    const autoTable = (await import("jspdf-autotable")).default

    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.text(title, 105, 20, { align: "center" })

    // Summary
    doc.setFontSize(12)
    doc.text("Executive Summary", 14, 35)
    doc.setFontSize(10)
    doc.text(`Total Revenue: ₱${totalRevenue.toLocaleString()}`, 14, 45)
    doc.text(`Total Events: ${totalEvents}`, 14, 52)
    doc.text(`Average Revenue per Event: ₱${avgRevenue.toLocaleString()}`, 14, 59)

    // Event Type Distribution
    const yPos = 70
    doc.setFontSize(12)
    doc.text("Event Type Distribution", 14, yPos)

    const eventTypeRows = Array.from(eventTypes.entries()).map(([type, data]) => [
      type,
      data.count.toString(),
      `${((data.count / totalEvents) * 100).toFixed(1)}%`,
      `₱${data.revenue.toLocaleString()}`,
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Event Type", "Count", "Percentage", "Revenue"]],
      body: eventTypeRows,
      theme: "grid",
      headStyles: { fillColor: [225, 29, 72] },
    })

    // Monthly Breakdown (for yearly)
    if (format === "yearly" && monthlyData.size > 0) {
      doc.addPage()
      doc.setFontSize(12)
      doc.text("Monthly Breakdown", 14, 20)

      const monthlyRows = Array.from(monthlyData.entries()).map(([month, data]) => [
        month,
        data.events.toString(),
        `₱${data.revenue.toLocaleString()}`,
      ])

      autoTable(doc, {
        startY: 25,
        head: [["Month", "Events", "Revenue"]],
        body: monthlyRows,
        theme: "grid",
        headStyles: { fillColor: [225, 29, 72] },
      })

      // Peak Month Analysis
      const finalY = (doc as any).lastAutoTable.finalY || 25
      doc.setFontSize(12)
      doc.text("Peak Season Analysis", 14, finalY + 15)
      doc.setFontSize(10)
      doc.text(`Busiest Month: ${peakMonth.month}`, 14, finalY + 25)
      doc.text(`Events: ${peakMonth.events}`, 14, finalY + 32)
      doc.text(`Revenue: ₱${peakMonth.revenue.toLocaleString()}`, 14, finalY + 39)
    }

    // Detailed Event List (last 50 events)
    if (events && events.length > 0) {
      doc.addPage()
      doc.setFontSize(12)
      doc.text("Recent Completed Events", 14, 20)

      const eventRows = events
        .slice(0, 50)
        .map((event) => [
          new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          event.event_type,
          event.tbl_users?.full_name || "N/A",
          event.guest_count?.toString() || "0",
          `₱${Number.parseFloat(event.total_package_amount || "0").toLocaleString()}`,
        ])

      autoTable(doc, {
        startY: 25,
        head: [["Date", "Type", "Client", "Guests", "Amount"]],
        body: eventRows,
        theme: "grid",
        headStyles: { fillColor: [225, 29, 72] },
        styles: { fontSize: 8 },
      })
    }

    // Footer with generation date
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`, 105, 290, { align: "center" })
    }

    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sales-report-${format}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate PDF report",
      },
      { status: 500 },
    )
  }
}
