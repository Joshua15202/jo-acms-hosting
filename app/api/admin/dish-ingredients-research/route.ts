import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { dishName, guestCount } = await request.json()

    console.log(`Researching ingredients for: ${dishName} (${guestCount} guests)`)

    if (!dishName || !guestCount) {
      return NextResponse.json({ error: "Dish name and guest count are required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log("OpenAI API key not found. Using fallback data.")

      // Provide fallback ingredient data
      const fallbackData = {
        dishName,
        guestCount,
        ingredients: {
          main: getSpecificFallbackIngredients(dishName, guestCount),
        },
        cookingNotes: getSpecificCookingNotes(dishName, guestCount),
        totalEstimatedCost: calculateSpecificCost(dishName, guestCount).toString(),
      }

      return NextResponse.json(fallbackData)
    }

    const prompt = `You are a professional Filipino chef and ingredient specialist. I need you to research and provide SPECIFIC detailed ingredient information for the EXACT dish: "${dishName}" for ${guestCount} guests.

IMPORTANT: This is a specific Filipino dish called "${dishName}". Please analyze this EXACT dish name and provide ingredients that are specifically used for THIS particular recipe, not generic ingredients.

For example:
- "Buttered Chicken" uses butter, chicken, specific seasonings for buttered chicken
- "Chicken Galantina" uses chicken, eggs, carrots, raisins, specific galantina ingredients
- "Fish Fillet w/ Tartar Sauce" uses fish fillet, ingredients for tartar sauce
- "Roast Beef w/ Mashed Potato" uses beef roast cuts, potatoes for mashing

Please provide ONLY the main ingredients (proteins, vegetables, starches, dairy, etc.) that are SPECIFICALLY used in "${dishName}" - DO NOT include seasonings, spices, garnishes, or condiments.

Return the response in this exact JSON format:
{
  "dishName": "${dishName}",
  "guestCount": ${guestCount},
  "ingredients": {
    "main": [
      {"name": "specific ingredient name for this dish", "quantity": "amount with unit"}
    ]
  },
  "cookingNotes": "Brief professional cooking tips specific to ${dishName} preparation method",
  "totalEstimatedCost": "estimated cost in Philippine Peso (number only, no currency symbol)"
}

Focus on:
- SPECIFIC ingredients for "${dishName}" recipe
- Accurate quantities for ${guestCount} people
- Philippine market prices and availability
- Professional catering standards for this specific dish
- Main ingredients only (no seasonings/spices)
- Realistic cost estimates in PHP for this particular dish

Research the specific Filipino dish "${dishName}" and provide ingredients that are actually used in this recipe.`

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2, // Lower temperature for more consistent, specific results
        maxTokens: 1000,
      })

      console.log("AI Response received for", dishName, ":", text.substring(0, 200) + "...")

      // Try to parse the JSON response
      let parsedResponse
      try {
        // Extract JSON from the response if it's wrapped in markdown or other text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0])
        } else {
          parsedResponse = JSON.parse(text)
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError)
        console.log("Raw AI response:", text)

        // Use specific fallback data if parsing fails
        const fallbackData = {
          dishName,
          guestCount,
          ingredients: {
            main: getSpecificFallbackIngredients(dishName, guestCount),
          },
          cookingNotes: getSpecificCookingNotes(dishName, guestCount),
          totalEstimatedCost: calculateSpecificCost(dishName, guestCount).toString(),
        }

        return NextResponse.json(fallbackData)
      }

      // Validate the response structure
      if (!parsedResponse.ingredients || !parsedResponse.ingredients.main) {
        parsedResponse.ingredients = {
          main: getSpecificFallbackIngredients(dishName, guestCount),
        }
      }

      console.log(`Successfully researched specific ingredients for ${dishName}`)
      return NextResponse.json(parsedResponse)
    } catch (aiError) {
      console.error("AI generation error:", aiError)

      // Provide specific fallback data when AI fails
      const fallbackData = {
        dishName,
        guestCount,
        ingredients: {
          main: getSpecificFallbackIngredients(dishName, guestCount),
        },
        cookingNotes: getSpecificCookingNotes(dishName, guestCount),
        totalEstimatedCost: calculateSpecificCost(dishName, guestCount).toString(),
      }

      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error("Error in dish ingredients research:", error)
    return NextResponse.json(
      {
        error: "Failed to research dish ingredients",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Specific fallback ingredient generator for individual Filipino dishes
function getSpecificFallbackIngredients(dishName: string, guestCount: number) {
  const lowerDishName = dishName.toLowerCase()

  // Calculate base quantities per guest
  const proteinPerGuest = 0.2 // 200g protein per guest
  const starchPerGuest = 0.15 // 150g starch per guest
  const vegetablePerGuest = 0.1 // 100g vegetables per guest

  const totalProtein = Math.round(proteinPerGuest * guestCount * 10) / 10
  const totalStarch = Math.round(starchPerGuest * guestCount * 10) / 10
  const totalVegetables = Math.round(vegetablePerGuest * guestCount * 10) / 10

  // Specific ingredients for specific dishes
  if (lowerDishName.includes("buttered chicken") || lowerDishName.includes("butter chicken")) {
    return [
      { name: "Chicken (cut into serving pieces)", quantity: `${totalProtein} kg` },
      { name: "Butter (unsalted)", quantity: `${Math.round(guestCount * 0.03 * 10) / 10} kg` },
      { name: "Rice (jasmine or regular)", quantity: `${totalStarch} kg` },
      { name: "Potatoes (for sides)", quantity: `${Math.round(totalVegetables * 0.6 * 10) / 10} kg` },
      { name: "Cooking oil", quantity: "500 ml" },
      { name: "Onions", quantity: "1 kg" },
    ]
  } else if (lowerDishName.includes("chicken galantina") || lowerDishName.includes("galantina")) {
    return [
      { name: "Whole chicken (deboned)", quantity: `${totalProtein} kg` },
      { name: "Ground pork", quantity: `${Math.round(totalProtein * 0.3 * 10) / 10} kg` },
      { name: "Hard-boiled eggs", quantity: `${Math.round(guestCount * 0.5)} pieces` },
      { name: "Carrots (diced)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
      { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
      { name: "Raisins", quantity: "500 g" },
      { name: "Rice", quantity: `${totalStarch} kg` },
      { name: "Aluminum foil", quantity: "2 rolls" },
    ]
  } else if (lowerDishName.includes("fish fillet") && lowerDishName.includes("tartar")) {
    return [
      { name: "Fish fillet (cream dory or similar)", quantity: `${totalProtein} kg` },
      { name: "All-purpose flour", quantity: "1 kg" },
      { name: "Eggs", quantity: `${Math.round(guestCount * 0.1)} pieces` },
      { name: "Breadcrumbs", quantity: "500 g" },
      { name: "Mayonnaise (for tartar sauce)", quantity: "500 g" },
      { name: "Pickles (for tartar sauce)", quantity: "200 g" },
      { name: "Rice", quantity: `${totalStarch} kg` },
      { name: "Cooking oil (for frying)", quantity: "1 liter" },
    ]
  } else if (
    lowerDishName.includes("fish fillet") &&
    lowerDishName.includes("sweet") &&
    lowerDishName.includes("sour")
  ) {
    return [
      { name: "Fish fillet (cream dory or similar)", quantity: `${totalProtein} kg` },
      { name: "All-purpose flour", quantity: "1 kg" },
      { name: "Eggs", quantity: `${Math.round(guestCount * 0.1)} pieces` },
      { name: "Pineapple chunks", quantity: "1 kg" },
      { name: "Bell peppers (mixed colors)", quantity: `${Math.round(totalVegetables * 0.5 * 10) / 10} kg` },
      { name: "Onions", quantity: "1 kg" },
      { name: "Tomato sauce", quantity: "500 g" },
      { name: "Rice", quantity: `${totalStarch} kg` },
      { name: "Cooking oil", quantity: "1 liter" },
    ]
  } else if (lowerDishName.includes("roast beef") && lowerDishName.includes("mashed")) {
    return [
      { name: "Beef chuck roast or beef brisket", quantity: `${totalProtein} kg` },
      { name: "Potatoes (for mashing)", quantity: `${totalStarch} kg` },
      { name: "Butter (for mashed potatoes)", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} kg` },
      { name: "Fresh milk", quantity: "1 liter" },
      { name: "Mixed vegetables (carrots, green beans)", quantity: `${totalVegetables} kg` },
      { name: "Cooking oil", quantity: "500 ml" },
      { name: "Onions", quantity: "1 kg" },
    ]
  } else if (lowerDishName.includes("roast beef") && lowerDishName.includes("mix vegetable")) {
    return [
      { name: "Beef chuck roast or beef brisket", quantity: `${totalProtein} kg` },
      { name: "Mixed vegetables (carrots, green beans, corn)", quantity: `${totalVegetables} kg` },
      { name: "Potatoes", quantity: `${Math.round(totalStarch * 0.7 * 10) / 10} kg` },
      { name: "Rice", quantity: `${Math.round(totalStarch * 0.3 * 10) / 10} kg` },
      { name: "Cooking oil", quantity: "500 ml" },
      { name: "Onions", quantity: "1 kg" },
    ]
  } else if (lowerDishName.includes("pork")) {
    return [
      { name: "Pork (shoulder or loin)", quantity: `${totalProtein} kg` },
      { name: "Rice", quantity: `${totalStarch} kg` },
      { name: "Mixed vegetables", quantity: `${totalVegetables} kg` },
      { name: "Cooking oil", quantity: "500 ml" },
      { name: "Onions", quantity: "1 kg" },
    ]
  } else {
    // Generic fallback for unknown dishes
    return [
      { name: `Main protein for ${dishName}`, quantity: `${totalProtein} kg` },
      { name: "Rice or potatoes", quantity: `${totalStarch} kg` },
      { name: "Mixed vegetables", quantity: `${totalVegetables} kg` },
      { name: "Cooking oil", quantity: "500 ml" },
      { name: "Onions", quantity: "1 kg" },
    ]
  }
}

// Specific cooking notes for individual dishes
function getSpecificCookingNotes(dishName: string, guestCount: number) {
  const lowerDishName = dishName.toLowerCase()

  if (lowerDishName.includes("buttered chicken")) {
    return `For Buttered Chicken: Season chicken pieces and pan-fry until golden. In the same pan, melt butter and sauté garlic. Return chicken to pan and simmer in butter sauce. Serve with steamed rice. Cooking time: 45 minutes for ${guestCount} guests.`
  } else if (lowerDishName.includes("chicken galantina")) {
    return `For Chicken Galantina: Debone whole chicken carefully. Mix ground pork with diced vegetables. Stuff chicken with mixture and hard-boiled eggs. Wrap tightly in aluminum foil and steam for 1.5-2 hours. Cool before slicing. Prep time: 2 hours, cooking time: 2 hours for ${guestCount} guests.`
  } else if (lowerDishName.includes("fish fillet") && lowerDishName.includes("tartar")) {
    return `For Fish Fillet with Tartar Sauce: Coat fish in flour, egg, then breadcrumbs. Deep fry until golden and crispy. For tartar sauce, mix mayonnaise with chopped pickles and herbs. Serve immediately with rice. Cooking time: 30 minutes for ${guestCount} guests.`
  } else if (
    lowerDishName.includes("fish fillet") &&
    lowerDishName.includes("sweet") &&
    lowerDishName.includes("sour")
  ) {
    return `For Fish Fillet Sweet and Sour: Coat and fry fish until crispy. Prepare sweet and sour sauce with pineapple juice, tomato sauce, and vinegar. Stir-fry vegetables, add sauce and fried fish. Serve with rice. Cooking time: 40 minutes for ${guestCount} guests.`
  } else if (lowerDishName.includes("roast beef")) {
    return `For Roast Beef: Season beef and sear all sides. Roast in oven at 160°C until desired doneness (internal temp 60°C for medium-rare). Rest for 15 minutes before slicing. Prepare mashed potatoes or vegetables as sides. Cooking time: 3-4 hours for ${guestCount} guests.`
  } else {
    return `Professional preparation for ${dishName}. Follow standard Filipino catering practices and cooking methods appropriate for this specific dish. Estimated preparation and cooking time for ${guestCount} guests.`
  }
}

// Specific cost calculation for individual dishes
function calculateSpecificCost(dishName: string, guestCount: number) {
  const lowerDishName = dishName.toLowerCase()

  if (lowerDishName.includes("buttered chicken")) {
    return Math.round(guestCount * 180) // Higher cost due to butter
  } else if (lowerDishName.includes("chicken galantina")) {
    return Math.round(guestCount * 200) // Higher cost due to complexity and eggs
  } else if (lowerDishName.includes("fish fillet")) {
    return Math.round(guestCount * 170) // Fish fillet is more expensive
  } else if (lowerDishName.includes("roast beef")) {
    return Math.round(guestCount * 220) // Beef is most expensive
  } else if (lowerDishName.includes("pork")) {
    return Math.round(guestCount * 160) // Pork is moderately priced
  } else {
    return Math.round(guestCount * 150) // Generic estimate
  }
}
