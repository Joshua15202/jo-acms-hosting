import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { equipmentItem, quantityNeeded, category } = await request.json()

    console.log(`Checking inventory for: ${equipmentItem} (${quantityNeeded} needed)`)

    // Use AI to search for matching inventory items
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })

    // Get all inventory items from the database
    const { data: inventoryItems, error: inventoryError } = await supabaseAdmin
      .from("tbl_inventory")
      .select("*")
      .order("item_name")

    if (inventoryError) {
      console.error("Error fetching inventory:", inventoryError)
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
    }

    // Use AI to match the equipment need with available inventory items
    const prompt = `You are an inventory matching specialist. Given the following:

NEEDED EQUIPMENT:
- Item: ${equipmentItem}
- Quantity Needed: ${quantityNeeded}
- Category: ${category}

AVAILABLE INVENTORY:
${inventoryItems?.map((item) => `- ${item.item_name} (Category: ${item.category}, Available: ${item.available_quantity}/${item.quantity}, Condition: ${item.condition})`).join("\n")}

Your task:
1. Find ALL inventory items that could fulfill this equipment need
2. Consider similar items, alternative options, and related equipment
3. Calculate if there's enough inventory to meet the need
4. Provide recommendations

Return ONLY a valid JSON object with this structure:
{
  "matches": [
    {
      "inventory_id": "uuid-here",
      "item_name": "exact item name from inventory",
      "available": 50,
      "needed": ${quantityNeeded},
      "sufficient": true,
      "match_confidence": "exact|high|medium|low",
      "reason": "why this item matches"
    }
  ],
  "total_available": 100,
  "total_needed": ${quantityNeeded},
  "can_fulfill": true,
  "recommendations": "Additional suggestions or alternatives",
  "shortfall": 0
}`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      temperature: 0.2,
    })

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response")
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error checking equipment inventory:", error)
    return NextResponse.json({ error: "Failed to analyze inventory" }, { status: 500 })
  }
}
