import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { dishName, guestCount } = await request.json()

    console.log(`=== Researching ingredients for: "${dishName}" (${guestCount} guests) ===`)

    if (!dishName || !guestCount) {
      return NextResponse.json({ error: "Dish name and guest count are required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("❌ OpenAI API key not found in environment variables")

      // Return structured fallback data instead of error
      const fallbackData = generateFallbackIngredients(dishName, guestCount)
      console.log("⚠️ Using fallback ingredient data")
      return NextResponse.json(fallbackData)
    }

    console.log("✓ OpenAI API key found, generating ingredient research...")

    const prompt = `You are a professional Filipino chef and ingredient specialist. Analyze this EXACT Filipino dish: "${dishName}"

CRITICAL INSTRUCTIONS:
1. This is a SPECIFIC dish called "${dishName}" - research THIS EXACT recipe
2. Provide ONLY ingredients that are actually used in THIS specific dish recipe
3. DO NOT give generic ingredients - be SPECIFIC to "${dishName}"
4. Calculate quantities for EXACTLY ${guestCount} guests
5. Use Philippine market standards and pricing
6. DO NOT include rice unless it's part of the actual dish recipe (like in fried rice)
7. DO NOT include seasonings, spices, or condiments - ONLY main ingredients

For example:
- "Beef Teriyaki w/ Vegetable siding" needs: beef sirloin strips, soy sauce, mirin, sake, sugar, bell peppers, broccoli, carrots
- "Buttered Chicken" needs: chicken pieces, unsalted butter, garlic, cream
- "Fish Fillet w/ Tartar Sauce" needs: cream dory fillet, mayonnaise, pickles, capers, lemon
- "Roast Beef w/ Mashed Potato" needs: beef brisket, potatoes, butter, milk, garlic

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "dishName": "${dishName}",
  "guestCount": ${guestCount},
  "ingredients": {
    "main": [
      {"name": "SPECIFIC ingredient name for ${dishName}", "quantity": "EXACT amount with unit for ${guestCount} guests"}
    ]
  },
  "cookingNotes": "Brief professional cooking tips SPECIFIC to ${dishName} preparation",
  "totalEstimatedCost": "Philippine Peso cost estimate (number only)"
}

Research the EXACT dish "${dishName}" and provide SPECIFIC ingredients that are used in THIS recipe for ${guestCount} guests.`

    try {
      console.log("Sending request to OpenAI...")

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.1,
        maxTokens: 1500,
      })

      console.log(`✓ AI Response received for "${dishName}"`)
      console.log("Raw response:", text.substring(0, 300) + "...")

      // Try to parse the JSON response
      let parsedResponse
      try {
        let cleanedText = text.trim()
        cleanedText = cleanedText.replace(/```json\s*/g, "").replace(/```\s*/g, "")

        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0])
          console.log("✓ Successfully parsed AI response")
        } else {
          throw new Error("No JSON object found in response")
        }
      } catch (parseError) {
        console.error("❌ Failed to parse AI response:", parseError)
        console.error("Full response text:", text)

        // Use fallback on parse error
        const fallbackData = generateFallbackIngredients(dishName, guestCount)
        console.log("⚠️ Using fallback due to parse error")
        return NextResponse.json(fallbackData)
      }

      // Validate the response structure
      if (
        !parsedResponse.ingredients ||
        !parsedResponse.ingredients.main ||
        !Array.isArray(parsedResponse.ingredients.main)
      ) {
        console.error("❌ Invalid response structure:", parsedResponse)
        const fallbackData = generateFallbackIngredients(dishName, guestCount)
        console.log("⚠️ Using fallback due to invalid structure")
        return NextResponse.json(fallbackData)
      }

      // Validate that we have actual ingredients
      if (parsedResponse.ingredients.main.length === 0) {
        console.error("❌ No ingredients returned for dish:", dishName)
        const fallbackData = generateFallbackIngredients(dishName, guestCount)
        console.log("⚠️ Using fallback due to empty ingredients")
        return NextResponse.json(fallbackData)
      }

      console.log(`✓ Successfully researched ${parsedResponse.ingredients.main.length} ingredients for "${dishName}"`)
      return NextResponse.json(parsedResponse)
    } catch (aiError: any) {
      console.error("❌ AI generation error:", aiError)

      // Use fallback on AI error
      const fallbackData = generateFallbackIngredients(dishName, guestCount)
      console.log("⚠️ Using fallback due to AI error")
      return NextResponse.json(fallbackData)
    }
  } catch (error: any) {
    console.error("❌ Error in dish ingredients research:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "Failed to research dish ingredients",
      },
      { status: 500 },
    )
  }
}

// Fallback function to generate dish-specific ingredients
function generateFallbackIngredients(dishName: string, guestCount: number) {
  const lowerDishName = dishName.toLowerCase()

  // Base calculations per guest
  const proteinPerGuest = 0.2 // 200g
  const vegetablePerGuest = 0.1 // 100g
  const starchPerGuest = 0.15 // 150g

  const totalProtein = Math.round(proteinPerGuest * guestCount * 10) / 10
  const totalVegetables = Math.round(vegetablePerGuest * guestCount * 10) / 10
  const totalStarch = Math.round(starchPerGuest * guestCount * 10) / 10

  // ========== BEEF DISHES ==========
  if (lowerDishName.includes("beef broccoli")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef sirloin (sliced thin)", quantity: `${totalProtein} kg` },
          { name: "Broccoli florets (fresh)", quantity: `${totalVegetables} kg` },
          { name: "Oyster sauce", quantity: `${Math.round(guestCount * 0.03 * 10) / 10} liters` },
          { name: "Soy sauce", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Cornstarch", quantity: "300 g" },
          { name: "Garlic (minced)", quantity: "200 g" },
          { name: "Ginger (julienned)", quantity: "150 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Marinate beef in soy sauce and cornstarch for 30 minutes. Blanch broccoli for 2 minutes. Stir-fry beef until browned, remove. Sauté garlic and ginger, add broccoli and oyster sauce mixture. Return beef and toss to coat. Cooking time: 35 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 180).toString(),
    }
  }

  if (lowerDishName.includes("beef caldereta")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef chuck (cubed)", quantity: `${totalProtein} kg` },
          { name: "Tomato sauce", quantity: "1.5 kg" },
          { name: "Liver spread", quantity: "500 g" },
          { name: "Red bell peppers", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Green bell peppers", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Potatoes (cubed)", quantity: `${Math.round(totalStarch * 0.6 * 10) / 10} kg` },
          { name: "Carrots (cubed)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Onions", quantity: "1 kg" },
          { name: "Garlic", quantity: "300 g" },
          { name: "Green olives", quantity: "400 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Sauté garlic and onions, brown beef. Add tomato sauce, liver spread, and simmer for 1.5 hours until tender. Add potatoes, carrots, and bell peppers. Cook until vegetables are tender. Add olives. Cooking time: 2 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 200).toString(),
    }
  }

  if (lowerDishName.includes("beef mahonado")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef brisket (cubed)", quantity: `${totalProtein} kg` },
          { name: "Chorizo Bilbao (sliced)", quantity: "800 g" },
          { name: "Vienna sausage", quantity: "600 g" },
          { name: "Potatoes (cubed)", quantity: `${Math.round(totalStarch * 0.5 * 10) / 10} kg` },
          { name: "Carrots (cubed)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Red bell peppers", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Tomato sauce", quantity: "1 kg" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Raisins", quantity: "400 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Sauté garlic and onions, brown beef. Add tomato sauce and simmer for 1.5 hours. Add chorizo, sausages, potatoes, carrots. Cook until tender. Add bell peppers, peas, and raisins. Cooking time: 2 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 220).toString(),
    }
  }

  if (lowerDishName.includes("roast beef") && lowerDishName.includes("mashed")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef brisket or chuck roast", quantity: `${totalProtein} kg` },
          { name: "Potatoes (for mashing)", quantity: `${totalStarch} kg` },
          { name: "Butter (for mashed potatoes)", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} kg` },
          { name: "Fresh milk", quantity: "1.5 liters" },
          { name: "Heavy cream", quantity: "500 ml" },
          { name: "Garlic (whole cloves)", quantity: "300 g" },
          { name: "Onions", quantity: "1 kg" },
          { name: "Beef stock", quantity: "1 liter" },
          { name: "Cooking oil", quantity: "300 ml" },
        ],
      },
      cookingNotes: `Season beef generously and sear all sides. Roast at 160°C until internal temp reaches 60°C for medium-rare (2-3 hours). Rest 15 minutes. For mashed potatoes: boil until tender, mash with butter, milk, and cream. Cooking time: 3-4 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 220).toString(),
    }
  }

  if (lowerDishName.includes("roast beef") && (lowerDishName.includes("vegetable") || lowerDishName.includes("mix"))) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef brisket or chuck roast", quantity: `${totalProtein} kg` },
          { name: "Carrots (large chunks)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Green beans", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Corn kernels", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Potatoes", quantity: `${Math.round(totalStarch * 0.7 * 10) / 10} kg` },
          { name: "Garlic", quantity: "300 g" },
          { name: "Onions", quantity: "1 kg" },
          { name: "Beef stock", quantity: "1 liter" },
          { name: "Cooking oil", quantity: "300 ml" },
        ],
      },
      cookingNotes: `Season and sear beef until brown. Roast at 160°C until desired doneness (2-3 hours). Blanch or steam mixed vegetables until tender-crisp. Serve sliced beef with vegetable medley. Cooking time: 3-4 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 210).toString(),
    }
  }

  if (lowerDishName.includes("kare-kare") && lowerDishName.includes("oxtail")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Oxtail (cut into pieces)", quantity: `${totalProtein} kg` },
          { name: "Peanut butter", quantity: "1 kg" },
          { name: "Toasted ground rice", quantity: "400 g" },
          { name: "Eggplant (sliced)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "String beans", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Banana heart (sliced)", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Bok choy", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Bagoong (shrimp paste)", quantity: "500 g" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Boil oxtail for 2-3 hours until tender. Sauté garlic and onions, add peanut butter and toasted rice with stock. Add oxtail and simmer. Add vegetables gradually by firmness. Serve with bagoong. Cooking time: 3-4 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 250).toString(),
    }
  }

  if (lowerDishName.includes("beef teriyaki")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef sirloin (sliced thin)", quantity: `${totalProtein} kg` },
          { name: "Soy sauce", quantity: `${Math.round(guestCount * 0.05 * 10) / 10} liters` },
          { name: "Mirin (sweet rice wine)", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Brown sugar", quantity: `${Math.round(guestCount * 0.015)} kg` },
          { name: "Bell peppers (mixed colors)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Broccoli florets", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Carrots (julienned)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Cooking oil", quantity: "500 ml" },
          { name: "Garlic", quantity: "200 g" },
        ],
      },
      cookingNotes: `Marinate beef in soy sauce, mirin, and sugar for 30 minutes. Stir-fry beef on high heat until browned (2-3 minutes). Remove beef, stir-fry vegetables until tender-crisp. Return beef and coat with teriyaki glaze. Cooking time: 45 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 200).toString(),
    }
  }

  if (lowerDishName.includes("beef lengua pastel")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef tongue (ox tongue)", quantity: `${totalProtein} kg` },
          { name: "Puff pastry sheets", quantity: `${Math.round(guestCount * 0.1)} kg` },
          { name: "Mushrooms (sliced)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Bell peppers", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Vienna sausage", quantity: "600 g" },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Tomato sauce", quantity: "800 g" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Eggs (for egg wash)", quantity: `${Math.round(guestCount * 0.05)} pieces` },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Boil tongue for 2-3 hours until tender, peel skin. Dice and sauté with garlic, onions. Add tomato sauce, mushrooms, sausages, peas, bell peppers. Top with puff pastry, brush with egg wash. Bake at 180°C for 30 minutes. Cooking time: 4 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 280).toString(),
    }
  }

  if (lowerDishName.includes("garlic beef")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef sirloin or tenderloin (sliced)", quantity: `${totalProtein} kg` },
          { name: "Garlic (minced, lots)", quantity: "600 g" },
          { name: "Soy sauce", quantity: `${Math.round(guestCount * 0.03 * 10) / 10} liters` },
          { name: "Oyster sauce", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Cornstarch", quantity: "300 g" },
          { name: "Brown sugar", quantity: "200 g" },
          { name: "Spring onions (chopped)", quantity: "300 g" },
          { name: "Cooking oil", quantity: "600 ml" },
        ],
      },
      cookingNotes: `Marinate beef in soy sauce, cornstarch, and sugar for 30 minutes. Heat oil and fry massive amounts of garlic until golden and crispy. Set aside. Stir-fry beef on high heat. Add oyster sauce and fried garlic. Garnish with spring onions. Cooking time: 40 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 210).toString(),
    }
  }

  if (lowerDishName.includes("beef") && lowerDishName.includes("mushroom")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Beef sirloin (sliced thin)", quantity: `${totalProtein} kg` },
          { name: "Button mushrooms (sliced)", quantity: `${Math.round(totalVegetables * 0.5 * 10) / 10} kg` },
          { name: "Shiitake mushrooms (sliced)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Heavy cream", quantity: "1 liter" },
          { name: "Butter", quantity: "500 g" },
          { name: "Soy sauce", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Oyster sauce", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Cornstarch", quantity: "300 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Onions", quantity: "800 g" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Marinate beef in soy sauce and cornstarch. Stir-fry beef until browned, set aside. Sauté garlic and onions in butter, add mushrooms. Add cream, oyster sauce. Return beef and simmer until sauce thickens. Cooking time: 45 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 220).toString(),
    }
  }

  // ========== CHICKEN DISHES ==========
  if (lowerDishName.includes("chicken alexander")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken breast (butterflied)", quantity: `${totalProtein} kg` },
          { name: "Ham slices", quantity: "1 kg" },
          { name: "Cheese slices", quantity: "800 g" },
          { name: "All-purpose flour", quantity: "800 g" },
          { name: "Eggs (beaten)", quantity: `${Math.round(guestCount * 0.15)} pieces` },
          { name: "Breadcrumbs", quantity: "1 kg" },
          { name: "Heavy cream", quantity: "800 ml" },
          { name: "Butter", quantity: "400 g" },
          { name: "Mushrooms", quantity: `${Math.round(totalVegetables * 0.5 * 10) / 10} kg` },
          { name: "Cooking oil (for frying)", quantity: "2 liters" },
        ],
      },
      cookingNotes: `Butterfly chicken breast, stuff with ham and cheese. Coat in flour, egg, breadcrumbs. Deep fry until golden. Make cream sauce with butter, mushrooms, and cream. Serve chicken topped with sauce. Cooking time: 1 hour for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 230).toString(),
    }
  }

  if (lowerDishName.includes("sweet fire chicken")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken (cut into pieces)", quantity: `${totalProtein} kg` },
          { name: "Sweet chili sauce", quantity: "1.2 kg" },
          { name: "Honey", quantity: "500 g" },
          { name: "Sriracha or hot sauce", quantity: "300 ml" },
          { name: "Soy sauce", quantity: "400 ml" },
          { name: "Garlic (minced)", quantity: "300 g" },
          { name: "Ginger (minced)", quantity: "200 g" },
          { name: "Cornstarch", quantity: "400 g" },
          { name: "Spring onions", quantity: "300 g" },
          { name: "Sesame seeds", quantity: "200 g" },
          { name: "Cooking oil", quantity: "1.5 liters" },
        ],
      },
      cookingNotes: `Coat chicken in cornstarch and fry until crispy. Make sauce with sweet chili, honey, sriracha, soy sauce, garlic, ginger. Toss fried chicken in sauce. Garnish with spring onions and sesame seeds. Cooking time: 50 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 190).toString(),
    }
  }

  if (lowerDishName.includes("chicken onion")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken (cut into pieces)", quantity: `${totalProtein} kg` },
          { name: "Onions (large, sliced thick)", quantity: "2.5 kg" },
          { name: "Soy sauce", quantity: `${Math.round(guestCount * 0.03 * 10) / 10} liters` },
          { name: "Oyster sauce", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Brown sugar", quantity: "300 g" },
          { name: "Ginger", quantity: "200 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Spring onions", quantity: "300 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Marinate chicken in soy sauce and sugar. Pan-fry chicken until golden. Set aside. Caramelize onions slowly until sweet and soft. Add garlic, ginger, oyster sauce. Return chicken and simmer. Garnish with spring onions. Cooking time: 50 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 170).toString(),
    }
  }

  if (lowerDishName.includes("buttered chicken")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken (cut into serving pieces)", quantity: `${totalProtein} kg` },
          { name: "Unsalted butter", quantity: `${Math.round(guestCount * 0.03 * 10) / 10} kg` },
          { name: "Heavy cream", quantity: `${Math.round(guestCount * 0.05 * 10) / 10} liters` },
          { name: "Garlic (minced)", quantity: "300 g" },
          { name: "Onions", quantity: "1 kg" },
          { name: "Chicken stock", quantity: "1 liter" },
          { name: "Cooking oil", quantity: "300 ml" },
        ],
      },
      cookingNotes: `Pan-fry seasoned chicken until golden. In the same pan, melt butter and sauté garlic until fragrant. Add cream and simmer. Return chicken and coat with butter sauce. Cooking time: 40 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 180).toString(),
    }
  }

  if (lowerDishName.includes("chicken galantina")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Whole chicken (deboned)", quantity: `${totalProtein} kg` },
          { name: "Ground pork", quantity: `${Math.round(totalProtein * 0.3 * 10) / 10} kg` },
          { name: "Hard-boiled eggs", quantity: `${Math.round(guestCount * 0.5)} pieces` },
          { name: "Carrots (diced)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Raisins", quantity: "500 g" },
          { name: "Sweet pickle relish", quantity: "300 g" },
          { name: "Cheese (grated)", quantity: "500 g" },
          { name: "Aluminum foil", quantity: "2 rolls" },
        ],
      },
      cookingNotes: `Debone chicken carefully keeping skin intact. Mix ground pork with diced vegetables, cheese, and relish. Stuff chicken with mixture and hard-boiled eggs. Wrap tightly in foil and steam for 1.5-2 hours. Cool before slicing. Prep time: 2 hours, cooking: 2 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 200).toString(),
    }
  }

  if (lowerDishName.includes("fried chicken") && !lowerDishName.includes("breaded")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken (cut into pieces)", quantity: `${totalProtein} kg` },
          { name: "All-purpose flour", quantity: "1.2 kg" },
          { name: "Cornstarch", quantity: "400 g" },
          { name: "Soy sauce (for marinade)", quantity: "400 ml" },
          { name: "Garlic powder", quantity: "150 g" },
          { name: "Onion powder", quantity: "100 g" },
          { name: "Calamansi or lemon juice", quantity: "300 ml" },
          { name: "Cooking oil (for deep frying)", quantity: "3 liters" },
        ],
      },
      cookingNotes: `Marinate chicken in soy sauce, calamansi, garlic for 2 hours. Mix flour, cornstarch, garlic powder, onion powder. Coat chicken thoroughly. Deep fry at 180°C until golden and cooked through (12-15 minutes). Drain on paper towels. Cooking time: 3 hours including marination for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 160).toString(),
    }
  }

  if (lowerDishName.includes("chicken cordon blue") || lowerDishName.includes("chicken cordon bleu")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken breast (butterflied)", quantity: `${totalProtein} kg` },
          { name: "Ham slices (quality)", quantity: "1 kg" },
          { name: "Swiss cheese slices", quantity: "800 g" },
          { name: "All-purpose flour", quantity: "800 g" },
          { name: "Eggs (beaten)", quantity: `${Math.round(guestCount * 0.15)} pieces` },
          { name: "Breadcrumbs (panko)", quantity: "1 kg" },
          { name: "Butter", quantity: "400 g" },
          { name: "Cooking oil (for frying)", quantity: "2 liters" },
        ],
      },
      cookingNotes: `Pound chicken thin, place ham and cheese, roll tightly. Secure with toothpicks. Coat in flour, egg, breadcrumbs. Deep fry or bake at 180°C until golden (25-30 minutes). Remove toothpicks before serving. Cooking time: 1 hour for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 240).toString(),
    }
  }

  if (lowerDishName.includes("chicken pastel")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken (cut into pieces)", quantity: `${totalProtein} kg` },
          { name: "Puff pastry sheets", quantity: `${Math.round(guestCount * 0.1)} kg` },
          { name: "Vienna sausage (sliced)", quantity: "800 g" },
          { name: "Carrots (diced)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Potatoes (diced)", quantity: `${Math.round(totalStarch * 0.4 * 10) / 10} kg` },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Red bell peppers", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Heavy cream", quantity: "800 ml" },
          { name: "Chicken stock", quantity: "1 liter" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Eggs (for egg wash)", quantity: `${Math.round(guestCount * 0.05)} pieces` },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Sauté chicken with garlic and onions. Add stock, simmer until tender. Add vegetables, sausages, cream. Transfer to baking dish, top with puff pastry, brush with egg. Bake at 180°C for 30 minutes until golden. Cooking time: 1.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 210).toString(),
    }
  }

  if (lowerDishName.includes("chicken teriyaki")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken thighs or breast (sliced)", quantity: `${totalProtein} kg` },
          { name: "Soy sauce", quantity: `${Math.round(guestCount * 0.05 * 10) / 10} liters` },
          { name: "Mirin", quantity: `${Math.round(guestCount * 0.03 * 10) / 10} liters` },
          { name: "Sake or white wine", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Brown sugar", quantity: "400 g" },
          { name: "Ginger (grated)", quantity: "200 g" },
          { name: "Garlic (minced)", quantity: "250 g" },
          { name: "Spring onions", quantity: "300 g" },
          { name: "Sesame seeds", quantity: "150 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Marinate chicken in soy sauce, mirin, sake, sugar, ginger, garlic for 1 hour. Pan-fry or grill chicken until cooked. Reduce marinade into thick glaze. Brush chicken with glaze. Garnish with spring onions and sesame seeds. Cooking time: 1.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 180).toString(),
    }
  }

  if (lowerDishName.includes("breaded fried chicken")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken (cut into pieces)", quantity: `${totalProtein} kg` },
          { name: "All-purpose flour", quantity: "1 kg" },
          { name: "Breadcrumbs (panko)", quantity: "1.2 kg" },
          { name: "Eggs (beaten)", quantity: `${Math.round(guestCount * 0.15)} pieces` },
          { name: "Soy sauce (marinade)", quantity: "400 ml" },
          { name: "Calamansi juice", quantity: "300 ml" },
          { name: "Garlic powder", quantity: "150 g" },
          { name: "Black pepper", quantity: "100 g" },
          { name: "Cooking oil (for deep frying)", quantity: "3 liters" },
        ],
      },
      cookingNotes: `Marinate chicken in soy sauce, calamansi, garlic for 2 hours. Set up breading station: flour, beaten eggs, breadcrumbs. Coat chicken thoroughly. Deep fry at 180°C until golden and cooked (12-15 minutes). Cooking time: 3 hours including marination for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 170).toString(),
    }
  }

  if (lowerDishName.includes("chicken lollipop")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken wings (mid and tip sections)", quantity: `${Math.round(guestCount * 0.15)} kg` },
          { name: "All-purpose flour", quantity: "800 g" },
          { name: "Cornstarch", quantity: "500 g" },
          { name: "Eggs", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Soy sauce", quantity: "400 ml" },
          { name: "Sweet chili sauce", quantity: "800 g" },
          { name: "Hot sauce", quantity: "200 ml" },
          { name: "Garlic powder", quantity: "150 g" },
          { name: "Ginger powder", quantity: "100 g" },
          { name: "Cooking oil (for deep frying)", quantity: "2.5 liters" },
        ],
      },
      cookingNotes: `Cut chicken wings, push meat down to form lollipop shape. Marinate in soy sauce, garlic, ginger. Coat in flour-cornstarch mix and egg. Deep fry until crispy. Toss in sweet chili sauce mixture. Cooking time: 1 hour for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 150).toString(),
    }
  }

  if (lowerDishName.includes("lemon chicken")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Chicken breast (sliced)", quantity: `${totalProtein} kg` },
          { name: "Lemons (juice and zest)", quantity: `${Math.round(guestCount * 0.15)} pieces` },
          { name: "Honey", quantity: "600 g" },
          { name: "Cornstarch", quantity: "400 g" },
          { name: "Chicken stock", quantity: "800 ml" },
          { name: "Butter", quantity: "400 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "All-purpose flour", quantity: "800 g" },
          { name: "Eggs", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Cooking oil", quantity: "1.5 liters" },
        ],
      },
      cookingNotes: `Coat chicken in flour and egg, fry until golden. Make lemon sauce with lemon juice, honey, stock, cornstarch. Add butter and lemon zest. Pour sauce over fried chicken. Cooking time: 50 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 190).toString(),
    }
  }

  // ========== PORK DISHES ==========
  if (lowerDishName.includes("lengua pastel") && !lowerDishName.includes("beef")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork tongue", quantity: `${totalProtein} kg` },
          { name: "Puff pastry sheets", quantity: `${Math.round(guestCount * 0.1)} kg` },
          { name: "Mushrooms (sliced)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Bell peppers", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Vienna sausage", quantity: "600 g" },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Tomato sauce", quantity: "800 g" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Eggs (for egg wash)", quantity: `${Math.round(guestCount * 0.05)} pieces` },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Boil pork tongue for 2 hours until tender, peel skin. Dice and sauté with garlic, onions. Add tomato sauce, mushrooms, sausages, peas, bell peppers. Top with puff pastry, brush with egg. Bake at 180°C for 30 minutes. Cooking time: 3.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 260).toString(),
    }
  }

  if (lowerDishName.includes("pork teriyaki")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork loin or tenderloin (sliced)", quantity: `${totalProtein} kg` },
          { name: "Soy sauce", quantity: `${Math.round(guestCount * 0.05 * 10) / 10} liters` },
          { name: "Mirin", quantity: `${Math.round(guestCount * 0.03 * 10) / 10} liters` },
          { name: "Sake", quantity: `${Math.round(guestCount * 0.02 * 10) / 10} liters` },
          { name: "Brown sugar", quantity: "400 g" },
          { name: "Ginger", quantity: "200 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Spring onions", quantity: "300 g" },
          { name: "Sesame seeds", quantity: "150 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Marinate pork in teriyaki sauce mixture for 1 hour. Pan-fry or grill until cooked through. Reduce marinade into glaze. Brush pork with glaze. Garnish with spring onions and sesame. Cooking time: 1.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 190).toString(),
    }
  }

  if (lowerDishName.includes("menudo")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork shoulder (cubed)", quantity: `${Math.round(totalProtein * 0.6 * 10) / 10} kg` },
          { name: "Pork liver (cubed)", quantity: `${Math.round(totalProtein * 0.4 * 10) / 10} kg` },
          { name: "Chorizo Bilbao (sliced)", quantity: "600 g" },
          { name: "Hotdog (sliced)", quantity: "500 g" },
          { name: "Tomato sauce", quantity: "1 kg" },
          { name: "Potatoes (cubed)", quantity: `${Math.round(totalStarch * 0.5 * 10) / 10} kg` },
          { name: "Carrots (cubed)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Red bell peppers", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Raisins", quantity: "400 g" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Sauté garlic and onions, brown pork. Add tomato sauce, simmer for 45 minutes. Add liver, chorizo, hotdog. Add potatoes and carrots, cook until tender. Add bell peppers, peas, raisins. Cooking time: 1.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 200).toString(),
    }
  }

  if (lowerDishName.includes("pork kare-kare")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork hocks or belly (cubed)", quantity: `${totalProtein} kg` },
          { name: "Peanut butter", quantity: "1 kg" },
          { name: "Toasted ground rice", quantity: "400 g" },
          { name: "Eggplant (sliced)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "String beans", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Banana heart", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Bok choy", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Bagoong (shrimp paste)", quantity: "500 g" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Boil pork for 1.5-2 hours until tender. Sauté garlic and onions, add peanut butter and toasted rice with stock. Add pork and simmer. Add vegetables by firmness. Serve with bagoong. Cooking time: 2.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 210).toString(),
    }
  }

  if (lowerDishName.includes("pork mahonado")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork shoulder (cubed)", quantity: `${totalProtein} kg` },
          { name: "Chorizo Bilbao", quantity: "800 g" },
          { name: "Vienna sausage", quantity: "600 g" },
          { name: "Potatoes (cubed)", quantity: `${Math.round(totalStarch * 0.5 * 10) / 10} kg` },
          { name: "Carrots (cubed)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Red bell peppers", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Tomato sauce", quantity: "1 kg" },
          { name: "Raisins", quantity: "400 g" },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Sauté garlic and onions, brown pork. Add tomato sauce and simmer for 1 hour. Add chorizo, sausages, potatoes, carrots. Cook until tender. Add bell peppers, peas, raisins. Cooking time: 1.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 200).toString(),
    }
  }

  if (lowerDishName.includes("hawaiian spareribs")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork spareribs", quantity: `${totalProtein} kg` },
          { name: "Pineapple chunks (canned)", quantity: "1.5 kg" },
          { name: "Pineapple juice", quantity: "1 liter" },
          { name: "Brown sugar", quantity: "500 g" },
          { name: "Soy sauce", quantity: "400 ml" },
          { name: "Tomato ketchup", quantity: "600 g" },
          { name: "Bell peppers", quantity: `${Math.round(totalVegetables * 0.5 * 10) / 10} kg` },
          { name: "Onions", quantity: "1 kg" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Marinate ribs in pineapple juice, soy sauce, sugar for 2 hours. Bake or grill ribs. Make sauce with ketchup, pineapple juice, brown sugar. Add pineapple chunks and bell peppers. Coat ribs with sauce. Cooking time: 3 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 220).toString(),
    }
  }

  if (lowerDishName.includes("braised pork")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork belly or shoulder", quantity: `${totalProtein} kg` },
          { name: "Soy sauce", quantity: "600 ml" },
          { name: "Oyster sauce", quantity: "400 ml" },
          { name: "Brown sugar", quantity: "400 g" },
          { name: "Star anise", quantity: "50 g" },
          { name: "Cinnamon sticks", quantity: "30 g" },
          { name: "Ginger (sliced)", quantity: "200 g" },
          { name: "Garlic (whole cloves)", quantity: "300 g" },
          { name: "Spring onions", quantity: "300 g" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Brown pork in oil. Add soy sauce, oyster sauce, sugar, star anise, cinnamon, ginger, garlic. Simmer covered for 2 hours until tender and sauce reduces. Garnish with spring onions. Cooking time: 2.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 210).toString(),
    }
  }

  if (lowerDishName.includes("embutido")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Ground pork", quantity: `${totalProtein} kg` },
          { name: "Hard-boiled eggs", quantity: `${Math.round(guestCount * 0.4)} pieces` },
          { name: "Carrots (diced small)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Green peas", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Raisins", quantity: "500 g" },
          { name: "Sweet pickle relish", quantity: "400 g" },
          { name: "Cheese (grated)", quantity: "600 g" },
          { name: "Red bell peppers (diced)", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Vienna sausage", quantity: "400 g" },
          { name: "Aluminum foil", quantity: "3 rolls" },
          { name: "Eggs (raw, for binding)", quantity: `${Math.round(guestCount * 0.1)} pieces` },
        ],
      },
      cookingNotes: `Mix ground pork with vegetables, cheese, relish, raisins, and eggs. Spread mixture on foil, place whole eggs and sausages in center. Roll tightly and steam for 1.5 hours. Cool before slicing. Prep: 45 minutes, cooking: 1.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 190).toString(),
    }
  }

  if (lowerDishName.includes("pork and pickles")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Pork belly or shoulder (sliced)", quantity: `${totalProtein} kg` },
          { name: "Pickled vegetables (atsara)", quantity: "1.5 kg" },
          { name: "Pineapple chunks", quantity: "1 kg" },
          { name: "Soy sauce", quantity: "400 ml" },
          { name: "Vinegar", quantity: "300 ml" },
          { name: "Brown sugar", quantity: "400 g" },
          { name: "Bell peppers", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Cornstarch", quantity: "300 g" },
          { name: "Cooking oil", quantity: "500 ml" },
        ],
      },
      cookingNotes: `Marinate pork in soy sauce. Stir-fry pork until browned. Add pickled vegetables, pineapple, vinegar, sugar. Simmer until pork is tender. Add bell peppers. Thicken sauce with cornstarch slurry. Cooking time: 1 hour for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 200).toString(),
    }
  }

  if (lowerDishName.includes("lumpiang shanghai")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Ground pork", quantity: `${totalProtein} kg` },
          { name: "Spring roll wrappers", quantity: `${Math.round(guestCount * 5)} pieces` },
          { name: "Carrots (finely chopped)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Onions (finely chopped)", quantity: "800 g" },
          { name: "Green onions", quantity: "400 g" },
          { name: "Garlic (minced)", quantity: "200 g" },
          { name: "Eggs (for binding)", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Soy sauce", quantity: "300 ml" },
          { name: "Cooking oil (for deep frying)", quantity: "2.5 liters" },
        ],
      },
      cookingNotes: `Mix ground pork with all vegetables, garlic, egg, soy sauce. Place filling on wrapper, roll tightly, seal edges with water. Deep fry at 180°C until golden and crispy (3-4 minutes). Serve with sweet chili sauce. Cooking time: 1.5 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 160).toString(),
    }
  }

  // ========== SEAFOOD DISHES ==========
  if (lowerDishName.includes("fish fillet") && lowerDishName.includes("tartar")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Cream dory fillet", quantity: `${totalProtein} kg` },
          { name: "All-purpose flour", quantity: "1 kg" },
          { name: "Eggs (beaten)", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Breadcrumbs (panko)", quantity: "800 g" },
          { name: "Mayonnaise (for tartar sauce)", quantity: "500 g" },
          { name: "Pickles (finely chopped)", quantity: "200 g" },
          { name: "Capers", quantity: "100 g" },
          { name: "Lemon juice", quantity: "100 ml" },
          { name: "Cooking oil (for deep frying)", quantity: "2 liters" },
        ],
      },
      cookingNotes: `Coat fish in flour, dip in eggs, coat with breadcrumbs. Deep fry at 180°C until golden (4-5 minutes per side). For tartar sauce: mix mayo, chopped pickles, capers, lemon juice. Serve immediately. Cooking time: 35 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 170).toString(),
    }
  }

  if (lowerDishName.includes("fish fillet") && (lowerDishName.includes("sweet") || lowerDishName.includes("sour"))) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Cream dory fillet", quantity: `${totalProtein} kg` },
          { name: "All-purpose flour", quantity: "1 kg" },
          { name: "Eggs", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Pineapple chunks (canned)", quantity: "1.5 kg" },
          { name: "Bell peppers (red and green)", quantity: `${Math.round(totalVegetables * 0.5 * 10) / 10} kg` },
          { name: "Onions (chunks)", quantity: "1 kg" },
          { name: "Tomato sauce", quantity: "800 g" },
          { name: "White vinegar", quantity: "300 ml" },
          { name: "Sugar", quantity: "400 g" },
          { name: "Cornstarch", quantity: "300 g" },
          { name: "Cooking oil", quantity: "1.5 liters" },
        ],
      },
      cookingNotes: `Coat and deep-fry fish until crispy. Make sweet and sour sauce: mix pineapple juice, tomato sauce, vinegar, sugar. Stir-fry vegetables, add sauce, bring to boil. Thicken with cornstarch. Add fried fish, coat with sauce. Cooking time: 45 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 175).toString(),
    }
  }

  if (lowerDishName.includes("camaron rebosado")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Large shrimps (peeled, deveined)", quantity: `${totalProtein} kg` },
          { name: "All-purpose flour", quantity: "800 g" },
          { name: "Cornstarch", quantity: "500 g" },
          { name: "Eggs", quantity: `${Math.round(guestCount * 0.15)} pieces` },
          { name: "Baking powder", quantity: "100 g" },
          { name: "Sweet chili sauce (for dipping)", quantity: "800 g" },
          { name: "Mayonnaise", quantity: "400 g" },
          { name: "Cooking oil (for deep frying)", quantity: "2 liters" },
        ],
      },
      cookingNotes: `Make batter with flour, cornstarch, eggs, baking powder, water until smooth. Dip shrimps in batter, deep fry at 180°C until golden (3-4 minutes). Mix sweet chili sauce with mayo for dipping. Serve hot. Cooking time: 40 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 220).toString(),
    }
  }

  if (lowerDishName.includes("fish tofu")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Fish fillet (ground or minced)", quantity: `${Math.round(totalProtein * 0.6 * 10) / 10} kg` },
          { name: "Firm tofu (mashed)", quantity: `${Math.round(totalProtein * 0.4 * 10) / 10} kg` },
          { name: "Carrots (finely chopped)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Green onions (chopped)", quantity: "400 g" },
          { name: "Eggs", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Cornstarch", quantity: "500 g" },
          { name: "Soy sauce", quantity: "300 ml" },
          { name: "Oyster sauce", quantity: "200 ml" },
          { name: "Cooking oil", quantity: "1.5 liters" },
        ],
      },
      cookingNotes: `Mix ground fish with mashed tofu, carrots, green onions, egg, cornstarch. Form into patties or balls. Deep fry or pan-fry until golden. Make sauce with soy sauce, oyster sauce. Pour over fish tofu. Cooking time: 50 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 160).toString(),
    }
  }

  if (lowerDishName.includes("apple fish salad")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Fish fillet (fried and flaked)", quantity: `${totalProtein} kg` },
          { name: "Green apples (diced)", quantity: `${Math.round(guestCount * 0.15)} kg` },
          { name: "Mayonnaise", quantity: "800 g" },
          { name: "All-purpose cream", quantity: "500 ml" },
          { name: "Condensed milk", quantity: "400 ml" },
          { name: "Raisins", quantity: "400 g" },
          { name: "Walnuts or cashews", quantity: "500 g" },
          { name: "Lettuce leaves (for serving)", quantity: "500 g" },
          { name: "All-purpose flour (for frying fish)", quantity: "600 g" },
          { name: "Cooking oil", quantity: "1.5 liters" },
        ],
      },
      cookingNotes: `Coat fish in flour, fry until crispy, flake when cool. Mix mayo, cream, condensed milk. Fold in fish flakes, diced apples, raisins, nuts. Chill for 2 hours. Serve on lettuce leaves. Prep: 30 minutes, chilling: 2 hours for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 190).toString(),
    }
  }

  if (lowerDishName.includes("crispy fish fillet")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Fish fillet (cream dory or tilapia)", quantity: `${totalProtein} kg` },
          { name: "All-purpose flour", quantity: "1 kg" },
          { name: "Cornstarch", quantity: "600 g" },
          { name: "Eggs", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Breadcrumbs (panko)", quantity: "1 kg" },
          { name: "Garlic powder", quantity: "150 g" },
          { name: "Paprika", quantity: "100 g" },
          { name: "Lemon wedges (for serving)", quantity: `${Math.round(guestCount * 0.1)} pieces` },
          { name: "Cooking oil (for deep frying)", quantity: "2.5 liters" },
        ],
      },
      cookingNotes: `Season fish with salt, pepper, garlic powder, paprika. Coat in flour, dip in beaten eggs, coat with breadcrumbs. Deep fry at 180°C until golden and crispy (4-5 minutes per side). Serve with lemon wedges. Cooking time: 45 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 170).toString(),
    }
  }

  if (lowerDishName.includes("fisherman") && lowerDishName.includes("delight")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Mixed seafood (fish, shrimp, squid)", quantity: `${totalProtein} kg` },
          { name: "Coconut milk", quantity: "1.5 liters" },
          { name: "Coconut cream", quantity: "500 ml" },
          { name: "Ginger (julienned)", quantity: "300 g" },
          { name: "Lemongrass (crushed)", quantity: "200 g" },
          { name: "Chili peppers", quantity: "150 g" },
          { name: "Tomatoes (quartered)", quantity: `${Math.round(totalVegetables * 0.4 * 10) / 10} kg` },
          { name: "Onions", quantity: "800 g" },
          { name: "Garlic", quantity: "250 g" },
          { name: "Fish sauce", quantity: "200 ml" },
          { name: "Calamansi or lime juice", quantity: "200 ml" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Sauté garlic, onions, ginger, lemongrass. Add coconut milk, bring to simmer. Add seafood gradually by cooking time needed. Add tomatoes, chili. Finish with coconut cream, fish sauce, calamansi. Cooking time: 45 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 240).toString(),
    }
  }

  // ========== VEGETABLE DISHES ==========
  if (lowerDishName.includes("chopsuey")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Cabbage (chopped)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Carrots (sliced)", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Bell peppers (mixed)", quantity: `${Math.round(totalVegetables * 0.15 * 10) / 10} kg` },
          { name: "Cauliflower florets", quantity: `${Math.round(totalVegetables * 0.15 * 10) / 10} kg` },
          { name: "Broccoli florets", quantity: `${Math.round(totalVegetables * 0.1 * 10) / 10} kg` },
          { name: "Snow peas", quantity: `${Math.round(totalVegetables * 0.1 * 10) / 10} kg` },
          { name: "Baby corn", quantity: "500 g" },
          { name: "Oyster sauce", quantity: "400 ml" },
          { name: "Soy sauce", quantity: "300 ml" },
          { name: "Cornstarch", quantity: "200 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Onions", quantity: "600 g" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Blanch harder vegetables (carrots, cauliflower, broccoli) for 2 minutes. Stir-fry garlic and onions, add vegetables by firmness. Add oyster sauce, soy sauce. Thicken with cornstarch slurry. Cooking time: 30 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 120).toString(),
    }
  }

  if (lowerDishName.includes("green peas") && !lowerDishName.includes("oriental")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Green peas (fresh or frozen)", quantity: `${totalVegetables} kg` },
          { name: "Carrots (diced)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Corn kernels", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Butter", quantity: "400 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Onions", quantity: "600 g" },
          { name: "Chicken or vegetable stock", quantity: "500 ml" },
          { name: "Cooking oil", quantity: "300 ml" },
        ],
      },
      cookingNotes: `Sauté garlic and onions in butter. Add carrots, cook for 3 minutes. Add green peas and corn. Add stock, simmer until vegetables are tender. Season to taste. Cooking time: 25 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 100).toString(),
    }
  }

  if (lowerDishName.includes("oriental") && lowerDishName.includes("mixed") && lowerDishName.includes("vegetable")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Bok choy", quantity: `${Math.round(totalVegetables * 0.25 * 10) / 10} kg` },
          { name: "Carrots (sliced)", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Bell peppers", quantity: `${Math.round(totalVegetables * 0.15 * 10) / 10} kg` },
          { name: "Broccoli florets", quantity: `${Math.round(totalVegetables * 0.15 * 10) / 10} kg` },
          { name: "Snow peas", quantity: `${Math.round(totalVegetables * 0.1 * 10) / 10} kg` },
          { name: "Baby corn", quantity: `${Math.round(totalVegetables * 0.1 * 10) / 10} kg` },
          { name: "Water chestnuts (sliced)", quantity: "400 g" },
          { name: "Oyster sauce", quantity: "400 ml" },
          { name: "Soy sauce", quantity: "300 ml" },
          { name: "Sesame oil", quantity: "100 ml" },
          { name: "Cornstarch", quantity: "200 g" },
          { name: "Ginger", quantity: "150 g" },
          { name: "Garlic", quantity: "200 g" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Stir-fry garlic and ginger in hot oil. Add vegetables by firmness (carrots, broccoli first). Add sauces and water chestnuts. Toss quickly to maintain crunch. Thicken with cornstarch. Drizzle sesame oil. Cooking time: 25 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 130).toString(),
    }
  }

  if (lowerDishName.includes("lumpiang ubod")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Ubod (heart of palm, julienned)", quantity: `${Math.round(totalVegetables * 0.5 * 10) / 10} kg` },
          { name: "Ground pork or shrimp", quantity: `${Math.round(totalProtein * 0.3 * 10) / 10} kg` },
          { name: "Carrots (julienned)", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Green beans (julienned)", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Tofu (diced)", quantity: "500 g" },
          { name: "Spring roll wrappers (fresh)", quantity: `${Math.round(guestCount * 3)} pieces` },
          { name: "Lettuce leaves", quantity: "800 g" },
          { name: "Peanuts (crushed)", quantity: "400 g" },
          { name: "Garlic (minced)", quantity: "200 g" },
          { name: "Onions", quantity: "600 g" },
          { name: "Sweet sauce (for serving)", quantity: "800 g" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Sauté garlic and onions, add meat until cooked. Add ubod, carrots, green beans, tofu. Season and cook until tender. To serve: place filling on fresh wrapper with lettuce, roll. Top with sweet sauce and crushed peanuts. Can be fried or served fresh. Cooking time: 45 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 140).toString(),
    }
  }

  if (lowerDishName.includes("lumpiang sariwa")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Ground pork or shrimp", quantity: `${Math.round(totalProtein * 0.4 * 10) / 10} kg` },
          { name: "Cabbage (shredded)", quantity: `${Math.round(totalVegetables * 0.3 * 10) / 10} kg` },
          { name: "Carrots (julienned)", quantity: `${Math.round(totalVegetables * 0.25 * 10) / 10} kg` },
          { name: "Green beans (sliced)", quantity: `${Math.round(totalVegetables * 0.25 * 10) / 10} kg` },
          { name: "Bean sprouts", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Tofu (diced)", quantity: "600 g" },
          { name: "Lumpia wrapper (fresh, large)", quantity: `${Math.round(guestCount * 3)} pieces` },
          { name: "Lettuce leaves", quantity: "800 g" },
          { name: "Peanuts (crushed)", quantity: "500 g" },
          { name: "Garlic (minced)", quantity: "250 g" },
          { name: "Sweet brown sauce", quantity: "1 kg" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Sauté garlic, add meat until cooked. Add vegetables gradually, tofu last. Season well. Place filling on fresh wrapper with lettuce leaf, roll tightly. Top with sweet brown sauce and crushed peanuts. Serve fresh, not fried. Cooking time: 40 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 135).toString(),
    }
  }

  if (lowerDishName.includes("stir fry") && lowerDishName.includes("vegetable")) {
    return {
      dishName,
      guestCount,
      ingredients: {
        main: [
          { name: "Mixed vegetables (cabbage, carrots, broccoli)", quantity: `${totalVegetables} kg` },
          { name: "Bell peppers", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Snow peas", quantity: `${Math.round(totalVegetables * 0.15 * 10) / 10} kg` },
          { name: "Baby corn", quantity: "400 g" },
          { name: "Mushrooms", quantity: `${Math.round(totalVegetables * 0.2 * 10) / 10} kg` },
          { name: "Oyster sauce", quantity: "350 ml" },
          { name: "Soy sauce", quantity: "250 ml" },
          { name: "Sesame oil", quantity: "100 ml" },
          { name: "Cornstarch", quantity: "200 g" },
          { name: "Garlic (minced)", quantity: "200 g" },
          { name: "Ginger", quantity: "150 g" },
          { name: "Cooking oil", quantity: "400 ml" },
        ],
      },
      cookingNotes: `Heat wok or large pan until very hot. Stir-fry garlic and ginger. Add vegetables by firmness (harder vegetables first). Keep vegetables moving constantly. Add sauces, toss to coat. Thicken with cornstarch slurry. Finish with sesame oil. Cooking time: 20 minutes for ${guestCount} guests.`,
      totalEstimatedCost: Math.round(guestCount * 110).toString(),
    }
  }

  // Generic fallback for unknown dishes
  return {
    dishName,
    guestCount,
    ingredients: {
      main: [
        { name: `Main protein for ${dishName}`, quantity: `${totalProtein} kg` },
        { name: "Mixed vegetables", quantity: `${totalVegetables} kg` },
        { name: "Cooking oil", quantity: "500 ml" },
        { name: "Onions", quantity: "1 kg" },
        { name: "Garlic", quantity: "200 g" },
      ],
    },
    cookingNotes: `Professional preparation for ${dishName} following Filipino catering standards. Estimated preparation and cooking time for ${guestCount} guests.`,
    totalEstimatedCost: Math.round(guestCount * 150).toString(),
  }
}
