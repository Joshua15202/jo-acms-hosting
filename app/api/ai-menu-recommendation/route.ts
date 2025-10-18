import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: Request) {
  try {
    const { eventType, guestCount, preferredMenus, venue, theme, colorMotif, availableMenuItems, generationCount } =
      await request.json()

    if (!eventType || !guestCount || !availableMenuItems) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      console.log("Gemini API key not found. Using fallback logic.")
      return NextResponse.json({
        success: false,
        message: "AI service unavailable",
        fallback: true,
      })
    }

    // Enhanced preference parsing for fixed structure
    const parseAdvancedUserPreferences = (preferences: string) => {
      const lowerPrefs = preferences.toLowerCase()
      const restrictions: string[] = []
      const emphasis: string[] = []
      const onlyRequests: string[] = []

      // Enhanced "only" pattern detection with more comprehensive patterns
      const onlyPatterns = {
        beef: [
          "only beef",
          "beef only",
          "just beef",
          "beef alone",
          "exclusively beef",
          "nothing but beef",
          "purely beef",
          "solely beef",
          "beef dishes only",
          "beef main course only",
          "main course beef only",
          "beef for main course",
          "beef main dishes only",
        ],
        pork: [
          "only pork",
          "pork only",
          "just pork",
          "pork alone",
          "exclusively pork",
          "nothing but pork",
          "purely pork",
          "solely pork",
          "pork dishes only",
          "pork main course only",
          "main course pork only",
          "pork for main course",
          "pork main dishes only",
        ],
        chicken: [
          "only chicken",
          "chicken only",
          "just chicken",
          "chicken alone",
          "exclusively chicken",
          "nothing but chicken",
          "purely chicken",
          "solely chicken",
          "chicken dishes only",
          "chicken main course only",
          "main course chicken only",
          "chicken for main course",
          "chicken main dishes only",
        ],
        seafood: [
          "only seafood",
          "seafood only",
          "just seafood",
          "seafood alone",
          "exclusively seafood",
          "nothing but seafood",
          "purely seafood",
          "solely seafood",
          "seafood dishes only",
          "only fish",
          "fish only",
          "just fish",
          "seafood main course only",
          "main course seafood only",
          "seafood for main course",
          "seafood main dishes only",
        ],
        vegetables: [
          "only vegetables",
          "vegetables only",
          "just vegetables",
          "vegetables alone",
          "exclusively vegetables",
          "nothing but vegetables",
          "purely vegetables",
          "solely vegetables",
          "vegetable dishes only",
          "only veggies",
          "veggies only",
          "just veggies",
          "vegetable main course only",
          "main course vegetables only",
          "vegetables for main course",
          "vegetable main dishes only",
        ],
        pasta: [
          "only pasta",
          "pasta only",
          "just pasta",
          "pasta alone",
          "exclusively pasta",
          "nothing but pasta",
          "purely pasta",
          "solely pasta",
          "pasta dishes only",
          "pasta main course only",
          "main course pasta only",
          "pasta for main course",
          "pasta main dishes only",
        ],
      }

      // Handle combination "only" requests like "only pork & chicken" or "only beef and pork"
      const combinationPatterns = [
        {
          pattern:
            /only\s+(beef|pork|chicken|seafood|vegetables|pasta)(\s*(&|and)\s*(beef|pork|chicken|seafood|vegetables|pasta))+/i,
          extract: (match: string) => {
            const categories = match
              .toLowerCase()
              .replace(/only\s+/, "")
              .replace(/\s*(&|and)\s*/g, ",")
              .split(",")
              .map((cat) => cat.trim())
              .filter((cat) => ["beef", "pork", "chicken", "seafood", "vegetables", "pasta"].includes(cat))
            return categories
          },
        },
        {
          pattern:
            /(beef|pork|chicken|seafood|vegetables|pasta)(\s*(&|and)\s*(beef|pork|chicken|seafood|vegetables|pasta))+\s+only/i,
          extract: (match: string) => {
            const categories = match
              .toLowerCase()
              .replace(/\s+only$/, "")
              .replace(/\s*(&|and)\s*/g, ",")
              .split(",")
              .map((cat) => cat.trim())
              .filter((cat) => ["beef", "pork", "chicken", "seafood", "vegetables", "pasta"].includes(cat))
            return categories
          },
        },
      ]

      // Check for combination "only" requests first
      for (const pattern of combinationPatterns) {
        const match = lowerPrefs.match(pattern.pattern)
        if (match) {
          const categories = pattern.extract(match[0])
          onlyRequests.push(...categories)
          console.log(`Detected combination "only" request:`, categories)
          break // Only process the first match to avoid duplicates
        }
      }

      // If no combination patterns matched, check individual "only" requests
      if (onlyRequests.length === 0) {
        Object.keys(onlyPatterns).forEach((category) => {
          const patterns = onlyPatterns[category as keyof typeof onlyPatterns]
          if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
            onlyRequests.push(category)
          }
        })
      }

      // Enhanced restriction patterns
      const restrictionPatterns = {
        beef: [
          "no beef",
          "without beef",
          "exclude beef",
          "remove beef",
          "skip beef",
          "avoid beef",
          "dont include beef",
          "i dont like beef",
          "i hate beef",
          "not a fan of beef",
          "allergic to beef",
          "cant eat beef",
          "beef free",
        ],
        pork: [
          "no pork",
          "without pork",
          "exclude pork",
          "remove pork",
          "skip pork",
          "avoid pork",
          "dont include pork",
          "i hate pork",
          "not a fan of pork",
          "allergic to pork",
          "cant eat pork",
          "halal",
          "muslim",
          "islamic",
          "no pork for religious reasons",
          "pork free",
        ],
        chicken: [
          "no chicken",
          "without chicken",
          "exclude chicken",
          "remove chicken",
          "skip chicken",
          "avoid chicken",
          "dont include chicken",
          "i dont like chicken",
          "i hate chicken",
          "not a fan of chicken",
          "allergic to chicken",
          "cant eat chicken",
          "chicken free",
        ],
        seafood: [
          "no seafood",
          "without seafood",
          "exclude seafood",
          "remove seafood",
          "skip seafood",
          "avoid seafood",
          "dont include seafood",
          "i dont like seafood",
          "i hate seafood",
          "not a fan of seafood",
          "allergic to seafood",
          "cant eat seafood",
          "no fish",
          "shellfish allergy",
          "seafood free",
        ],
        vegetables: [
          "no vegetables",
          "without vegetables",
          "exclude vegetables",
          "remove vegetables",
          "skip vegetables",
          "avoid vegetables",
          "dont include vegetables",
          "i dont like vegetables",
          "i hate vegetables",
          "not a fan of vegetables",
          "no veggies",
          "meat only",
          "vegetable free",
        ],
        pasta: [
          "no pasta",
          "without pasta",
          "exclude pasta",
          "remove pasta",
          "skip pasta",
          "avoid pasta",
          "dont include pasta",
          "i dont like pasta",
          "i hate pasta",
          "not a fan of pasta",
          "no carbs",
          "low carb",
          "keto",
          "gluten free",
          "pasta free",
        ],
      }

      // Enhanced emphasis patterns
      const emphasisPatterns = {
        beef: [
          "more beef",
          "extra beef",
          "add more beef",
          "lots of beef",
          "plenty of beef",
          "i love beef",
          "my favorite is beef",
          "prefer beef",
          "focus on beef",
          "emphasize beef",
          "highlight beef",
          "feature beef",
          "showcase beef",
          "double the beef",
          "heavy on beef",
          "rich in beef",
          "beef lover",
          "beef heavy",
        ],
        pork: [
          "more pork",
          "extra pork",
          "add more pork",
          "lots of pork",
          "plenty of pork",
          "i love pork",
          "my favorite is pork",
          "prefer pork",
          "focus on pork",
          "emphasize pork",
          "highlight pork",
          "feature pork",
          "showcase pork",
          "double the pork",
          "heavy on pork",
          "rich in pork",
          "pork lover",
          "pork heavy",
        ],
        chicken: [
          "more chicken",
          "extra chicken",
          "add more chicken",
          "lots of chicken",
          "plenty of chicken",
          "i love chicken",
          "my favorite is chicken",
          "prefer chicken",
          "focus on chicken",
          "emphasize chicken",
          "highlight chicken",
          "feature chicken",
          "showcase chicken",
          "double the chicken",
          "heavy on chicken",
          "rich in chicken",
          "chicken lover",
          "chicken heavy",
        ],
        seafood: [
          "more seafood",
          "extra seafood",
          "add more seafood",
          "lots of seafood",
          "plenty of seafood",
          "i love seafood",
          "my favorite is seafood",
          "prefer seafood",
          "focus on seafood",
          "emphasize seafood",
          "highlight seafood",
          "feature seafood",
          "showcase seafood",
          "double the seafood",
          "heavy on seafood",
          "rich in seafood",
          "seafood lover",
          "pescatarian",
          "fish only",
          "seafood heavy",
        ],
        vegetables: [
          "more vegetables",
          "extra vegetables",
          "add more vegetables",
          "lots of vegetables",
          "plenty of vegetables",
          "i love vegetables",
          "my favorite is vegetables",
          "prefer vegetables",
          "focus on vegetables",
          "emphasize vegetables",
          "highlight vegetables",
          "feature vegetables",
          "showcase vegetables",
          "double the vegetables",
          "heavy on vegetables",
          "rich in vegetables",
          "vegetable lover",
          "vegetarian",
          "veggie",
          "plant based",
          "green",
          "healthy",
          "vegetable heavy",
        ],
        pasta: [
          "more pasta",
          "extra pasta",
          "add more pasta",
          "lots of pasta",
          "plenty of pasta",
          "i love pasta",
          "my favorite is pasta",
          "prefer pasta",
          "focus on pasta",
          "emphasize pasta",
          "highlight pasta",
          "feature pasta",
          "showcase pasta",
          "double the pasta",
          "heavy on pasta",
          "rich in pasta",
          "pasta lover",
          "carb lover",
          "pasta heavy",
        ],
      }

      // Check for restrictions (but not if "only" is specified for that category)
      Object.keys(restrictionPatterns).forEach((category) => {
        if (!onlyRequests.includes(category)) {
          const patterns = restrictionPatterns[category as keyof typeof restrictionPatterns]
          if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
            restrictions.push(category)
          }
        }
      })

      // Check for emphasis (but not if restricted)
      Object.keys(emphasisPatterns).forEach((category) => {
        if (!restrictions.includes(category)) {
          const patterns = emphasisPatterns[category as keyof typeof emphasisPatterns]
          if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
            emphasis.push(category)
          }
        }
      })

      // Special dietary requirements
      if (lowerPrefs.includes("vegetarian") || lowerPrefs.includes("veggie only") || lowerPrefs.includes("no meat")) {
        onlyRequests.push("vegetables")
        restrictions.push("beef", "pork", "chicken", "seafood")
      }

      if (lowerPrefs.includes("pescatarian") || lowerPrefs.includes("fish only")) {
        onlyRequests.push("seafood")
        restrictions.push("beef", "pork", "chicken")
        emphasis.push("seafood", "vegetables")
      }

      return {
        restrictions: [...new Set(restrictions)],
        emphasis: [...new Set(emphasis)],
        onlyRequests: [...new Set(onlyRequests)],
      }
    }

    // Helper function to validate selections
    const validateSelections = (selections: string[], availableItems: string[], category: string) => {
      return selections.filter((item) => {
        const exists = availableItems.some((available) => available.toLowerCase().trim() === item.toLowerCase().trim())
        if (!exists) {
          console.warn(`Item "${item}" not found in ${category} menu`)
        }
        return exists
      })
    }

    // Helper function to apply user constraints
    const applyUserConstraints = (items: string[], category: string, userPrefs: any) => {
      // If there are "only" requests and this category is not in the list, return empty
      if (userPrefs.onlyRequests.length > 0 && !userPrefs.onlyRequests.includes(category.toLowerCase())) {
        return []
      }

      // If this category is restricted, return empty
      if (userPrefs.restrictions.includes(category.toLowerCase())) {
        return []
      }

      return items
    }

    // Parse user preferences
    const userPrefs = parseAdvancedUserPreferences(preferredMenus || "")

    // Randomize menu items to ensure variety in recommendations
    const shuffleArray = (array: string[]) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    // Apply user constraints to available items
    const filteredMenuItems = {
      beef: applyUserConstraints(availableMenuItems.beef || [], "beef", userPrefs),
      pork: applyUserConstraints(availableMenuItems.pork || [], "pork", userPrefs),
      chicken: applyUserConstraints(availableMenuItems.chicken || [], "chicken", userPrefs),
      seafood: applyUserConstraints(availableMenuItems.seafood || [], "seafood", userPrefs),
      vegetables: applyUserConstraints(availableMenuItems.vegetables || [], "vegetables", userPrefs),
      pasta: applyUserConstraints(availableMenuItems.pasta || [], "pasta", userPrefs),
      dessert: availableMenuItems.dessert || [],
      beverage: availableMenuItems.beverage || [],
    }

    // Randomize all menu categories for variety - include generation count for more randomness
    const randomizedMenuItems = {
      beef: shuffleArray([...filteredMenuItems.beef]).sort(() => Math.random() - 0.5),
      pork: shuffleArray([...filteredMenuItems.pork]).sort(() => Math.random() - 0.5),
      chicken: shuffleArray([...filteredMenuItems.chicken]).sort(() => Math.random() - 0.5),
      seafood: shuffleArray([...filteredMenuItems.seafood]).sort(() => Math.random() - 0.5),
      vegetables: shuffleArray([...filteredMenuItems.vegetables]).sort(() => Math.random() - 0.5),
      pasta: shuffleArray([...filteredMenuItems.pasta]).sort(() => Math.random() - 0.5),
      dessert: shuffleArray([...filteredMenuItems.dessert]).sort(() => Math.random() - 0.5),
      beverage: shuffleArray([...filteredMenuItems.beverage]).sort(() => Math.random() - 0.5),
    }

    // Generate a random session ID to ensure variety in AI responses
    const sessionId = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().toISOString()

    // Create the enhanced AI prompt with CORRECTED structure enforcement
    const prompt = `You are an expert catering menu curator for Jo Pacheco Wedding & Event Catering Services with deep understanding of Filipino cuisine and dietary preferences.

CRITICAL FIXED STRUCTURE REQUIREMENT:
You MUST provide EXACTLY:
- 1 beef dish OR empty if restricted
- 1 pork dish OR empty if restricted  
- 1 chicken dish OR empty if restricted
- 1 seafood dish OR empty if restricted
- 1 vegetable dish OR empty if restricted
- 1 pasta dish OR empty if restricted
- 1 dessert
- 1 beverage

NEVER exceed these quantities. NEVER provide more than 1 item per main course category (beef, pork, chicken, seafood, vegetables).

IMPORTANT: This is session ${sessionId} at ${timestamp}. Generation #${generationCount}. You MUST provide COMPLETELY DIFFERENT menu selections from previous recommendations to ensure maximum variety and prevent any repetition. Randomize ALL categories while following user preferences strictly.

EVENT DETAILS:
- Event Type: ${eventType}
- Guest Count: ${guestCount}
- Venue: ${venue || "Not specified"}
- Theme: ${theme || "Not specified"}
- Color Motif: ${colorMotif || "Not specified"}

ENHANCED USER PREFERENCES ANALYSIS:
"${preferredMenus || "No specific preferences mentioned - RANDOMIZE ALL CATEGORIES for maximum variety"}"

PARSED USER RESTRICTIONS (MUST EXCLUDE THESE COMPLETELY):
${userPrefs.restrictions.length > 0 ? userPrefs.restrictions.join(", ") : "None"}

PARSED USER EMPHASIS (PRIORITIZE THESE HEAVILY):
${userPrefs.emphasis.length > 0 ? userPrefs.emphasis.join(", ") : "None"}

EXCLUSIVE "ONLY" REQUESTS (FOCUS EXCLUSIVELY ON THESE):
${userPrefs.onlyRequests.length > 0 ? userPrefs.onlyRequests.join(", ") : "None"}

AVAILABLE MENU ITEMS BY CATEGORY (ALREADY FILTERED FOR USER RESTRICTIONS):
Beef: ${randomizedMenuItems.beef.join(", ")}
Pork: ${randomizedMenuItems.pork.join(", ")}
Chicken: ${randomizedMenuItems.chicken.join(", ")}
Seafood: ${randomizedMenuItems.seafood.join(", ")}
Vegetables: ${randomizedMenuItems.vegetables.join(", ")}
Pasta: ${randomizedMenuItems.pasta.join(", ")}
Desserts: ${randomizedMenuItems.dessert.join(", ")}
Beverages: ${randomizedMenuItems.beverage.join(", ")}

ENHANCED PREFERENCE HANDLING RULES:

1. RESTRICTION ENFORCEMENT (HIGHEST PRIORITY):
   - If user restricts a category (e.g., "no beef"), that category MUST be completely excluded
   - If user restricts beef: beef = []
   - If user restricts pork: pork = []
   - If user restricts chicken: chicken = []
   - If user restricts seafood: seafood = []
   - If user restricts vegetables: vegetables = []
   - If user restricts pasta: pasta = []

2. MAIN COURSE DISTRIBUTION RULES:
   - ALWAYS provide exactly 0 or 1 item per main course category (beef, pork, chicken, seafood, vegetables)
   - NEVER exceed 1 item per category under any circumstances
   - When a category is restricted, other categories can still have 1 item each

3. RESTRICTION EXAMPLES:
   - "no beef" → beef = [], pork = [1 item], chicken = [1 item], seafood = [1 item], vegetables = [1 item]
   - "no pork" → beef = [1 item], pork = [], chicken = [1 item], seafood = [1 item], vegetables = [1 item]
   - "no chicken" → beef = [1 item], pork = [1 item], chicken = [], seafood = [1 item], vegetables = [1 item]
   - "no seafood" → beef = [1 item], pork = [1 item], chicken = [1 item], seafood = [], vegetables = [1 item]
   - "vegetarian" → beef = [], pork = [], chicken = [], seafood = [], vegetables = [1 item]
   - "halal" (no pork) → beef = [1 item], pork = [], chicken = [1 item], seafood = [1 item], vegetables = [1 item]

4. EMPHASIS AMPLIFICATION (SECOND PRIORITY):
   - Prioritize emphasized categories when selecting within available options
   - If user emphasizes chicken and chicken is available, select chicken
   - Ensure emphasized categories are well-represented within the 1-item limit per category

5. NORMAL DISTRIBUTION (NO SPECIAL REQUESTS):
   - Distribute exactly 1 item per available main course category
   - Try to include variety across all non-restricted categories
   - NEVER exceed 1 item per main course category

CRITICAL SUCCESS FACTORS:
- User satisfaction is paramount - follow their restrictions exactly
- ALWAYS provide exactly 0 or 1 item per main course category
- NEVER exceed these quantities under any circumstances
- Respect all dietary restrictions completely
- Provide clear reasoning for all selections
- MAXIMUM RANDOMIZATION for generation #${generationCount}

RESPONSE FORMAT REQUIREMENTS:
Respond with a JSON object containing:
{
  "beef": ["selected beef item - EMPTY array [] if user restricted beef"],
  "pork": ["selected pork item - EMPTY array [] if user restricted pork"],
  "chicken": ["selected chicken item - EMPTY array [] if user restricted chicken"], 
  "seafood": ["selected seafood item - EMPTY array [] if user restricted seafood"],
  "vegetables": ["selected vegetable item - EMPTY array [] if user restricted vegetables"],
  "pasta": ["exactly 1 pasta item - EMPTY array [] if user restricted pasta"],
  "dessert": ["exactly 1 dessert item"],
  "beverage": ["exactly 1 beverage item"],
  "reasoning": "Detailed explanation of how user preferences were interpreted and applied, including how restrictions were respected",
  "explanation": "Step-by-step breakdown of selection process and any trade-offs made to respect user restrictions"
}

VALIDATION RULES:
- beef.length MUST BE 0 or 1 (0 if beef is restricted, 1 otherwise)
- pork.length MUST BE 0 or 1 (0 if pork is restricted, 1 otherwise)
- chicken.length MUST BE 0 or 1 (0 if chicken is restricted, 1 otherwise)
- seafood.length MUST BE 0 or 1 (0 if seafood is restricted, 1 otherwise)
- vegetables.length MUST BE 0 or 1 (0 if vegetables is restricted, 1 otherwise)
- pasta.length MUST BE 0 or 1 (0 if pasta is restricted, 1 otherwise)
- dessert.length MUST EQUAL exactly 1
- beverage.length MUST EQUAL exactly 1
- NEVER provide more than 1 item per main course category
- ALWAYS respect user restrictions completely

Remember: Always maintain the fixed structure while respecting user restrictions completely. Focus on creating the perfect menu within these constraints while ensuring maximum variety for generation #${generationCount}.`

    const response = await generateText({
      model: google("gemini-1.5-flash-latest"),
      prompt: prompt,
      temperature: 0.8,
      maxTokens: 1500,
    })

    // Parse the AI response
    let aiRecommendations
    try {
      // Extract JSON from the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiRecommendations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.log("Raw AI response:", response.text)
      return NextResponse.json({
        success: false,
        message: "Failed to parse AI response",
        fallback: true,
      })
    }

    // Validate and clean the AI selections with STRICT enforcement of 1 item per category
    const validatedRecommendations = {
      beef: [] as string[],
      pork: [] as string[],
      chicken: [] as string[],
      seafood: [] as string[],
      vegetables: [] as string[],
      pasta: [] as string[],
      dessert: [] as string[],
      beverage: [] as string[],
      reasoning:
        aiRecommendations.reasoning ||
        `Menu curated with fixed structure: exactly 1 item per main course category (beef, pork, chicken, seafood, vegetables), 1 pasta, 1 dessert, 1 beverage. Your dietary restrictions and preferences: "${preferredMenus}" have been carefully respected.`,
      explanation:
        aiRecommendations.explanation ||
        `This menu was carefully selected to follow your dietary preferences and restrictions while maintaining our standard structure of exactly 1 item per main course category, 1 pasta, 1 dessert, and 1 beverage.`,
    }

    // Beef: Only add if available and not restricted
    if (filteredMenuItems.beef.length > 0) {
      const beefSelections = validateSelections(aiRecommendations.beef || [], filteredMenuItems.beef, "Beef")

      if (beefSelections.length > 0) {
        validatedRecommendations.beef = [beefSelections[0]]
        console.log(
          `Beef: Selected "${beefSelections[0]}" (AI provided ${beefSelections.length} items, took first only)`,
        )
      } else if (filteredMenuItems.beef.length > 0) {
        const randomItem = filteredMenuItems.beef[Math.floor(Math.random() * filteredMenuItems.beef.length)]
        validatedRecommendations.beef = [randomItem]
        console.log(`Beef: Fallback selected "${randomItem}"`)
      }
    }

    // Pork: Only add if available and not restricted
    if (filteredMenuItems.pork.length > 0) {
      const porkSelections = validateSelections(aiRecommendations.pork || [], filteredMenuItems.pork, "Pork")

      if (porkSelections.length > 0) {
        validatedRecommendations.pork = [porkSelections[0]]
        console.log(
          `Pork: Selected "${porkSelections[0]}" (AI provided ${porkSelections.length} items, took first only)`,
        )
      } else if (filteredMenuItems.pork.length > 0) {
        const randomItem = filteredMenuItems.pork[Math.floor(Math.random() * filteredMenuItems.pork.length)]
        validatedRecommendations.pork = [randomItem]
        console.log(`Pork: Fallback selected "${randomItem}"`)
      }
    }

    // Chicken: Only add if available and not restricted
    if (filteredMenuItems.chicken.length > 0) {
      const chickenSelections = validateSelections(
        aiRecommendations.chicken || [],
        filteredMenuItems.chicken,
        "Chicken",
      )

      if (chickenSelections.length > 0) {
        validatedRecommendations.chicken = [chickenSelections[0]]
        console.log(
          `Chicken: Selected "${chickenSelections[0]}" (AI provided ${chickenSelections.length} items, took first only)`,
        )
      } else {
        const randomItem = filteredMenuItems.chicken[Math.floor(Math.random() * filteredMenuItems.chicken.length)]
        validatedRecommendations.chicken = [randomItem]
        console.log(`Chicken: Fallback selected "${randomItem}"`)
      }
    }

    // Seafood: Only add if available and not restricted
    if (filteredMenuItems.seafood.length > 0) {
      const seafoodSelections = validateSelections(
        aiRecommendations.seafood || [],
        filteredMenuItems.seafood,
        "Seafood",
      )

      if (seafoodSelections.length > 0) {
        validatedRecommendations.seafood = [seafoodSelections[0]]
        console.log(
          `Seafood: Selected "${seafoodSelections[0]}" (AI provided ${seafoodSelections.length} items, took first only)`,
        )
      } else if (filteredMenuItems.seafood.length > 0) {
        const randomItem = filteredMenuItems.seafood[Math.floor(Math.random() * filteredMenuItems.seafood.length)]
        validatedRecommendations.seafood = [randomItem]
        console.log(`Seafood: Fallback selected "${randomItem}"`)
      }
    }

    // Vegetables: Only add if available and not restricted
    if (filteredMenuItems.vegetables.length > 0) {
      const vegetableSelections = validateSelections(
        aiRecommendations.vegetables || [],
        filteredMenuItems.vegetables,
        "Vegetables",
      )

      if (vegetableSelections.length > 0) {
        validatedRecommendations.vegetables = [vegetableSelections[0]]
        console.log(
          `Vegetables: Selected "${vegetableSelections[0]}" (AI provided ${vegetableSelections.length} items, took first only)`,
        )
      } else if (filteredMenuItems.vegetables.length > 0) {
        const randomItem = filteredMenuItems.vegetables[Math.floor(Math.random() * filteredMenuItems.vegetables.length)]
        validatedRecommendations.vegetables = [randomItem]
        console.log(`Vegetables: Fallback selected "${randomItem}"`)
      }
    }

    // Pasta: Exactly 1 item (if not restricted)
    if (filteredMenuItems.pasta.length > 0) {
      const pastaSelections = validateSelections(aiRecommendations.pasta || [], filteredMenuItems.pasta, "Pasta")

      if (pastaSelections.length > 0) {
        validatedRecommendations.pasta = [pastaSelections[0]]
        console.log(
          `Pasta: Selected "${pastaSelections[0]}" (AI provided ${pastaSelections.length} items, took first only)`,
        )
      } else {
        const randomItem = filteredMenuItems.pasta[Math.floor(Math.random() * filteredMenuItems.pasta.length)]
        validatedRecommendations.pasta = [randomItem]
        console.log(`Pasta: Fallback selected "${randomItem}"`)
      }
    }

    // Dessert: Exactly 1 item (always required)
    if (filteredMenuItems.dessert.length > 0) {
      const dessertSelections = validateSelections(
        aiRecommendations.dessert || [],
        filteredMenuItems.dessert,
        "Dessert",
      )

      if (dessertSelections.length > 0) {
        validatedRecommendations.dessert = [dessertSelections[0]]
        console.log(
          `Dessert: Selected "${dessertSelections[0]}" (AI provided ${dessertSelections.length} items, took first only)`,
        )
      } else {
        const randomItem = filteredMenuItems.dessert[Math.floor(Math.random() * filteredMenuItems.dessert.length)]
        validatedRecommendations.dessert = [randomItem]
        console.log(`Dessert: Fallback selected "${randomItem}"`)
      }
    }

    // Beverage: Exactly 1 item (always required)
    if (filteredMenuItems.beverage.length > 0) {
      const beverageSelections = validateSelections(
        aiRecommendations.beverage || [],
        filteredMenuItems.beverage,
        "Beverage",
      )

      if (beverageSelections.length > 0) {
        validatedRecommendations.beverage = [beverageSelections[0]]
        console.log(
          `Beverage: Selected "${beverageSelections[0]}" (AI provided ${beverageSelections.length} items, took first only)`,
        )
      } else {
        const randomItem = filteredMenuItems.beverage[Math.floor(Math.random() * filteredMenuItems.beverage.length)]
        validatedRecommendations.beverage = [randomItem]
        console.log(`Beverage: Fallback selected "${randomItem}"`)
      }
    }

    // FINAL ENFORCEMENT: Double-check that we never exceed 1 item per category
    validatedRecommendations.beef = validatedRecommendations.beef.slice(0, 1)
    validatedRecommendations.pork = validatedRecommendations.pork.slice(0, 1)
    validatedRecommendations.chicken = validatedRecommendations.chicken.slice(0, 1)
    validatedRecommendations.seafood = validatedRecommendations.seafood.slice(0, 1)
    validatedRecommendations.vegetables = validatedRecommendations.vegetables.slice(0, 1)
    validatedRecommendations.pasta = validatedRecommendations.pasta.slice(0, 1)
    validatedRecommendations.dessert = validatedRecommendations.dessert.slice(0, 1)
    validatedRecommendations.beverage = validatedRecommendations.beverage.slice(0, 1)

    // Final validation with detailed logging
    console.log("FINAL STRICT VALIDATION:", {
      beef: `${validatedRecommendations.beef.length} items: [${validatedRecommendations.beef.join(", ")}]`,
      pork: `${validatedRecommendations.pork.length} items: [${validatedRecommendations.pork.join(", ")}]`,
      chicken: `${validatedRecommendations.chicken.length} items: [${validatedRecommendations.chicken.join(", ")}]`,
      seafood: `${validatedRecommendations.seafood.length} items: [${validatedRecommendations.seafood.join(", ")}]`,
      vegetables: `${validatedRecommendations.vegetables.length} items: [${validatedRecommendations.vegetables.join(", ")}]`,
      pasta: `${validatedRecommendations.pasta.length} items: [${validatedRecommendations.pasta.join(", ")}]`,
      dessert: `${validatedRecommendations.dessert.length} items: [${validatedRecommendations.dessert.join(", ")}]`,
      beverage: `${validatedRecommendations.beverage.length} items: [${validatedRecommendations.beverage.join(", ")}]`,
    })

    // Verify strict compliance
    const totalMainCourses =
      validatedRecommendations.beef.length +
      validatedRecommendations.pork.length +
      validatedRecommendations.chicken.length +
      validatedRecommendations.seafood.length +
      validatedRecommendations.vegetables.length
    const totalItems =
      totalMainCourses +
      validatedRecommendations.pasta.length +
      validatedRecommendations.dessert.length +
      validatedRecommendations.beverage.length

    console.log(`COMPLIANCE CHECK: ${totalMainCourses} main courses, ${totalItems} total items`)

    // Ensure we never have more than 1 item in any category
    if (
      validatedRecommendations.beef.length > 1 ||
      validatedRecommendations.pork.length > 1 ||
      validatedRecommendations.chicken.length > 1 ||
      validatedRecommendations.seafood.length > 1 ||
      validatedRecommendations.vegetables.length > 1 ||
      validatedRecommendations.pasta.length > 1 ||
      validatedRecommendations.dessert.length > 1 ||
      validatedRecommendations.beverage.length > 1
    ) {
      console.error("CRITICAL ERROR: More than 1 item detected in a category!")
      validatedRecommendations.beef = validatedRecommendations.beef.slice(0, 1)
      validatedRecommendations.pork = validatedRecommendations.pork.slice(0, 1)
      validatedRecommendations.chicken = validatedRecommendations.chicken.slice(0, 1)
      validatedRecommendations.seafood = validatedRecommendations.seafood.slice(0, 1)
      validatedRecommendations.vegetables = validatedRecommendations.vegetables.slice(0, 1)
      validatedRecommendations.pasta = validatedRecommendations.pasta.slice(0, 1)
      validatedRecommendations.dessert = validatedRecommendations.dessert.slice(0, 1)
      validatedRecommendations.beverage = validatedRecommendations.beverage.slice(0, 1)
    }

    return NextResponse.json({
      success: true,
      recommendations: validatedRecommendations,
      userPreferences: userPrefs,
      sessionId: sessionId,
      fixedStructure: {
        beef: validatedRecommendations.beef.length,
        pork: validatedRecommendations.pork.length,
        chicken: validatedRecommendations.chicken.length,
        seafood: validatedRecommendations.seafood.length,
        vegetables: validatedRecommendations.vegetables.length,
        pasta: validatedRecommendations.pasta.length,
        dessert: validatedRecommendations.dessert.length,
        beverage: validatedRecommendations.beverage.length,
      },
    })
  } catch (error) {
    console.error("Error generating AI recommendations:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to generate AI recommendations",
      fallback: true,
    })
  }
}
