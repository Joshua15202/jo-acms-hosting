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
      const restrictions = []
      const emphasis = []
      const onlyRequests = []

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

    // Randomize all menu categories for variety - include generation count for more randomness
    const randomizedMenuItems = {
      beef: shuffleArray([...availableMenuItems.beef]).sort(() => Math.random() - 0.5),
      pork: shuffleArray([...availableMenuItems.pork]).sort(() => Math.random() - 0.5),
      chicken: shuffleArray([...availableMenuItems.chicken]).sort(() => Math.random() - 0.5),
      seafood: shuffleArray([...availableMenuItems.seafood]).sort(() => Math.random() - 0.5),
      vegetables: shuffleArray([...availableMenuItems.vegetables]).sort(() => Math.random() - 0.5),
      pasta: shuffleArray([...availableMenuItems.pasta]).sort(() => Math.random() - 0.5),
      dessert: shuffleArray([...availableMenuItems.dessert]).sort(() => Math.random() - 0.5),
      beverage: shuffleArray([...availableMenuItems.beverage]).sort(() => Math.random() - 0.5),
    }

    // Generate a random session ID to ensure variety in AI responses
    const sessionId = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().toISOString()

    // Create the enhanced AI prompt with strict fixed structure enforcement
    const prompt = `You are an expert catering menu curator for Jo Pacheco Wedding & Event Catering Services with deep understanding of Filipino cuisine and dietary preferences.

CRITICAL FIXED STRUCTURE REQUIREMENT:
You MUST provide EXACTLY:
- 3 main courses total (distributed across Menu 1, Menu 2, Menu 3)
- 1 pasta dish
- 1 dessert
- 1 beverage

NEVER exceed these quantities. NEVER provide more than 3 main courses total.

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

AVAILABLE MENU ITEMS BY CATEGORY (RANDOMIZED FOR VARIETY):
Menu 1 (Beef & Pork): ${randomizedMenuItems.beef.join(", ")}, ${randomizedMenuItems.pork.join(", ")}
Menu 2 (Chicken): ${randomizedMenuItems.chicken.join(", ")}
Menu 3 (Seafood & Vegetables): ${randomizedMenuItems.seafood.join(", ")}, ${randomizedMenuItems.vegetables.join(", ")}
Pasta: ${randomizedMenuItems.pasta.join(", ")}
Desserts: ${randomizedMenuItems.dessert.join(", ")}
Beverages: ${randomizedMenuItems.beverage.join(", ")}

ENHANCED PREFERENCE HANDLING RULES:

1. EXCLUSIVE "ONLY" REQUESTS (HIGHEST PRIORITY - MUST BE STRICTLY ENFORCED):
   - If user says "only beef", "beef only", "just beef" → ALL 3 main courses MUST be beef items from Menu 1, menu2=[], menu3=[]
   - If user says "only chicken", "chicken only" → ALL 3 main courses MUST be chicken items from Menu 2, menu1=[], menu3=[]
   - If user says "only seafood", "seafood only" → ALL 3 main courses MUST be seafood items from Menu 3, menu1=[], menu2=[]
   - If user says "only vegetables", "vegetarian only" → ALL 3 main courses MUST be vegetable items from Menu 3, menu1=[], menu2=[]
   - If user says "only pork & chicken" → Distribute 3 main courses between ONLY pork (Menu 1) AND chicken (Menu 2), menu3=[]
   - For "only" requests, provide exactly 3 items total ONLY from the specified category/categories
   - Still include exactly 1 pasta, 1 dessert, and 1 beverage unless specifically excluded
   - CRITICAL: "Only" means EXCLUSIVE - no other main course categories should appear

2. MAIN COURSE DISTRIBUTION FOR "ONLY" REQUESTS:
   - "only beef" → menu1 = [3 beef items], menu2 = [], menu3 = []
   - "only pork" → menu1 = [3 pork items], menu2 = [], menu3 = []  
   - "only chicken" → menu1 = [], menu2 = [3 chicken items], menu3 = []
   - "only seafood" → menu1 = [], menu2 = [], menu3 = [3 seafood items]
   - "only vegetables" → menu1 = [], menu2 = [], menu3 = [3 vegetable items]
   - "only pork & chicken" → menu1 = [1-2 pork items], menu2 = [1-2 chicken items], menu3 = [] (total must be exactly 3)
   - "only beef & seafood" → menu1 = [1-2 beef items], menu2 = [], menu3 = [1-2 seafood items] (total must be exactly 3)

3. RESTRICTION ENFORCEMENT (SECOND PRIORITY):
   - Complete exclusion of restricted categories
   - No exceptions or substitutions
   - Religious restrictions (halal, kosher) must be strictly observed
   - If all main course categories are restricted, return error

4. EMPHASIS AMPLIFICATION (THIRD PRIORITY):
   - Prioritize emphasized categories when distributing the 3 main courses
   - If user emphasizes chicken, try to include 2 chicken dishes out of 3 main courses
   - Ensure emphasized categories are well-represented within the 3-item limit

5. NORMAL DISTRIBUTION (NO SPECIAL REQUESTS):
   - Distribute exactly 3 main courses across available categories
   - Try to include variety: 1 from Menu 1 (beef/pork), 1 from Menu 2 (chicken), 1 from Menu 3 (seafood/vegetables)
   - If a category is restricted, redistribute to remaining categories
   - NEVER exceed 3 main courses total

6. SPECIAL DIETARY HANDLING:
   - Vegetarian: All 3 main courses from vegetables (Menu 3), exclude all meat/seafood
   - Pescatarian: All 3 main courses from seafood (Menu 3), exclude meat
   - Halal: Exclude pork completely, distribute 3 items among beef, chicken, seafood, vegetables
   - Keto: Emphasize meat/seafood, exclude pasta if requested
   - Gluten-free: Exclude pasta if requested, emphasize other categories

CRITICAL SUCCESS FACTORS:
- User satisfaction is paramount - follow their preferences exactly
- ALWAYS provide exactly 3 main courses total, 1 pasta, 1 dessert, 1 beverage
- NEVER exceed these quantities under any circumstances
- Ensure variety within constraints
- Provide clear reasoning for all selections
- MAXIMUM RANDOMIZATION for generation #${generationCount}

RESPONSE FORMAT REQUIREMENTS:
Respond with a JSON object containing:
{
  "menu1": ["selected beef/pork items - EMPTY array [] if user restricted these or requested only other categories"],
  "menu2": ["selected chicken items - EMPTY array [] if user restricted chicken or requested only other categories"], 
  "menu3": ["selected seafood/vegetable items - EMPTY array [] if user restricted these or requested only other categories"],
  "pasta": ["exactly 1 pasta item - EMPTY array [] if user restricted pasta"],
  "dessert": ["exactly 1 dessert item"],
  "beverage": ["exactly 1 beverage item"],
  "reasoning": "Detailed explanation of how user preferences were interpreted and applied, including how the fixed structure of exactly 3 main courses, 1 pasta, 1 dessert, 1 beverage was maintained",
  "explanation": "Step-by-step breakdown of selection process and any trade-offs made to maintain the fixed structure while honoring preferences"
}

VALIDATION RULES:
- menu1.length + menu2.length + menu3.length MUST EQUAL exactly 3
- pasta.length MUST EQUAL exactly 1 (unless restricted)
- dessert.length MUST EQUAL exactly 1
- beverage.length MUST EQUAL exactly 1

EXAMPLE HANDLING FOR "ONLY" REQUESTS:
- User says "only beef": menu1 = [3 beef items], menu2 = [], menu3 = [], pasta = [1 item], dessert = [1 item], beverage = [1 item]
- User says "only chicken": menu1 = [], menu2 = [3 chicken items], menu3 = [], pasta = [1 item], dessert = [1 item], beverage = [1 item]
- User says "vegetarian only": menu1 = [], menu2 = [], menu3 = [3 vegetable items], pasta = [1 item], dessert = [1 item], beverage = [1 item]

Remember: Always maintain the fixed structure of exactly 3 main courses total, 1 pasta, 1 dessert, and 1 beverage while respecting user preferences. Focus on creating the perfect menu within these constraints while ensuring maximum variety for generation #${generationCount}.`

    const response = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
      temperature: 0.8, // Increased temperature for more variety
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
      return NextResponse.json({
        success: false,
        message: "Failed to parse AI response",
        fallback: true,
      })
    }

    // Validate that all selected items exist in the available menu and respect user preferences
    const validateSelections = (selections: string[], availableItems: string[], category: string) => {
      return selections.filter((item) => {
        const exists = availableItems.some((available) => available.toLowerCase().trim() === item.toLowerCase().trim())
        if (!exists) {
          console.warn(`Item "${item}" not found in ${category} menu`)
        }
        return exists
      })
    }

    // Apply user restrictions and "only" requests to available items
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

    // Filter available items based on user constraints
    const filteredMenuItems = {
      beef: applyUserConstraints(randomizedMenuItems.beef, "beef", userPrefs),
      pork: applyUserConstraints(randomizedMenuItems.pork, "pork", userPrefs),
      chicken: applyUserConstraints(randomizedMenuItems.chicken, "chicken", userPrefs),
      seafood: applyUserConstraints(randomizedMenuItems.seafood, "seafood", userPrefs),
      vegetables: applyUserConstraints(randomizedMenuItems.vegetables, "vegetables", userPrefs),
      pasta: applyUserConstraints(randomizedMenuItems.pasta, "pasta", userPrefs),
      dessert: randomizedMenuItems.dessert, // Desserts rarely restricted
      beverage: randomizedMenuItems.beverage, // Beverages rarely restricted
    }

    // Validate and clean the AI selections with enhanced user preference enforcement
    const validatedRecommendations = {
      menu1: validateSelections(
        aiRecommendations.menu1 || [],
        [...filteredMenuItems.beef, ...filteredMenuItems.pork],
        "Menu 1",
      ),
      menu2: validateSelections(aiRecommendations.menu2 || [], filteredMenuItems.chicken, "Menu 2"),
      menu3: validateSelections(
        aiRecommendations.menu3 || [],
        [...filteredMenuItems.seafood, ...filteredMenuItems.vegetables],
        "Menu 3",
      ),
      pasta: validateSelections(aiRecommendations.pasta || [], filteredMenuItems.pasta, "Pasta").slice(0, 1), // Ensure exactly 1
      dessert: validateSelections(aiRecommendations.dessert || [], filteredMenuItems.dessert, "Dessert").slice(0, 1), // Ensure exactly 1
      beverage: validateSelections(aiRecommendations.beverage || [], filteredMenuItems.beverage, "Beverage").slice(
        0,
        1,
      ), // Ensure exactly 1
      reasoning:
        aiRecommendations.reasoning ||
        `Menu curated with fixed structure: exactly 3 main courses, 1 pasta, 1 dessert, 1 beverage. Your dietary restrictions and preferences: "${preferredMenus}" have been carefully respected.`,
      explanation:
        aiRecommendations.explanation ||
        `This menu was carefully selected to follow your dietary preferences and restrictions while maintaining our standard structure of exactly 3 main courses, 1 pasta, 1 dessert, and 1 beverage.`,
    }

    // CRITICAL: Enforce exactly 3 main courses total
    const totalMainCourses =
      validatedRecommendations.menu1.length +
      validatedRecommendations.menu2.length +
      validatedRecommendations.menu3.length

    console.log("AI Response validation:", {
      menu1: validatedRecommendations.menu1.length,
      menu2: validatedRecommendations.menu2.length,
      menu3: validatedRecommendations.menu3.length,
      totalMainCourses,
      pasta: validatedRecommendations.pasta.length,
      dessert: validatedRecommendations.dessert.length,
      beverage: validatedRecommendations.beverage.length,
    })

    // If AI didn't provide exactly 3 main courses, fix it
    if (totalMainCourses !== 3) {
      console.log(`AI provided ${totalMainCourses} main courses instead of 3. Fixing...`)

      // Collect all main course items
      const allMainItems = [
        ...validatedRecommendations.menu1.map((item) => ({ item, category: "menu1" })),
        ...validatedRecommendations.menu2.map((item) => ({ item, category: "menu2" })),
        ...validatedRecommendations.menu3.map((item) => ({ item, category: "menu3" })),
      ]

      // Reset main course arrays
      validatedRecommendations.menu1 = []
      validatedRecommendations.menu2 = []
      validatedRecommendations.menu3 = []

      if (totalMainCourses > 3) {
        // Too many items - take first 3
        const selectedItems = allMainItems.slice(0, 3)
        selectedItems.forEach(({ item, category }) => {
          validatedRecommendations[category as keyof typeof validatedRecommendations].push(item)
        })
      } else if (totalMainCourses < 3) {
        // Too few items - add more
        // First, add existing items back
        allMainItems.forEach(({ item, category }) => {
          validatedRecommendations[category as keyof typeof validatedRecommendations].push(item)
        })

        // Then add more items to reach exactly 3
        const needed = 3 - totalMainCourses
        const availableCategories = [
          { key: "menu1", items: [...filteredMenuItems.beef, ...filteredMenuItems.pork] },
          { key: "menu2", items: filteredMenuItems.chicken },
          { key: "menu3", items: [...filteredMenuItems.seafood, ...filteredMenuItems.vegetables] },
        ].filter((cat) => cat.items.length > 0)

        for (let i = 0; i < needed && availableCategories.length > 0; i++) {
          const category = availableCategories[i % availableCategories.length]
          const currentItems = validatedRecommendations[
            category.key as keyof typeof validatedRecommendations
          ] as string[]
          const availableItems = category.items.filter((item) => !currentItems.includes(item))

          if (availableItems.length > 0) {
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)]
            currentItems.push(randomItem)
          }
        }
      }
    }

    // Ensure we have exactly 1 pasta, 1 dessert, 1 beverage
    if (validatedRecommendations.pasta.length === 0 && filteredMenuItems.pasta.length > 0) {
      validatedRecommendations.pasta = [filteredMenuItems.pasta[0]]
    }
    if (validatedRecommendations.dessert.length === 0 && filteredMenuItems.dessert.length > 0) {
      validatedRecommendations.dessert = [filteredMenuItems.dessert[0]]
    }
    if (validatedRecommendations.beverage.length === 0 && filteredMenuItems.beverage.length > 0) {
      validatedRecommendations.beverage = [filteredMenuItems.beverage[0]]
    }

    // Final validation
    const finalMainCourses =
      validatedRecommendations.menu1.length +
      validatedRecommendations.menu2.length +
      validatedRecommendations.menu3.length
    console.log("Final validation:", {
      menu1: validatedRecommendations.menu1.length,
      menu2: validatedRecommendations.menu2.length,
      menu3: validatedRecommendations.menu3.length,
      totalMainCourses: finalMainCourses,
      pasta: validatedRecommendations.pasta.length,
      dessert: validatedRecommendations.dessert.length,
      beverage: validatedRecommendations.beverage.length,
    })

    return NextResponse.json({
      success: true,
      recommendations: validatedRecommendations,
      userPreferences: userPrefs, // Include parsed preferences for debugging
      sessionId: sessionId, // Include session ID for tracking variety
      fixedStructure: {
        mainCourses: finalMainCourses,
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
