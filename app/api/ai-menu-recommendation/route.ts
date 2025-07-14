import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: Request) {
  try {
    const {
      eventType,
      guestCount,
      budget,
      preferredMenus,
      venue,
      theme,
      colorMotif,
      availableMenuItems,
      generationCount,
    } = await request.json()

    if (!eventType || !guestCount || !budget || !availableMenuItems) {
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

    // Enhanced preference parsing with budget validation
    const parseAdvancedUserPreferences = (preferences: string, budget: number, guestCount: number) => {
      const lowerPrefs = preferences.toLowerCase()
      const restrictions = []
      const emphasis = []
      const onlyRequests = []
      const budgetWarnings = []

      // Service fee calculation for budget validation
      let serviceFee = 0
      const isWeddingOrDebut = eventType === "wedding" || eventType === "debut"
      if (!isWeddingOrDebut) {
        const serviceFees: { [key: string]: number } = {
          "50": 11500,
          "80": 10400,
          "100": 11000,
          "150": 16500,
          "200": 22000,
        }
        serviceFee = serviceFees[guestCount.toString()] || 11500
      }

      const availableMenuBudget = budget - serviceFee
      const numGuests = Number.parseInt(guestCount)

      // Menu pricing per guest
      const menuPricing = {
        beef: 70,
        pork: 70,
        chicken: 60,
        seafood: 50,
        vegetables: 50,
        pasta: 40,
        dessert: 25,
        beverage: 25,
      }

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

      // Special dietary requirements with budget validation
      if (lowerPrefs.includes("vegetarian") || lowerPrefs.includes("veggie only") || lowerPrefs.includes("no meat")) {
        onlyRequests.push("vegetables")
        restrictions.push("beef", "pork", "chicken", "seafood")

        // Budget validation for vegetarian
        const vegetarianCost =
          (menuPricing.vegetables * 4 + menuPricing.pasta * 2 + menuPricing.dessert + menuPricing.beverage) * numGuests
        if (vegetarianCost > availableMenuBudget) {
          const suggestedBudget = vegetarianCost + serviceFee + vegetarianCost * 0.2
          budgetWarnings.push({
            category: "vegetarian",
            currentBudget: budget,
            suggestedBudget: Math.ceil(suggestedBudget / 1000) * 1000,
            reason: `Vegetarian menu requires minimum ₱${vegetarianCost.toLocaleString()} for adequate variety (4 vegetable dishes + 2 pasta + dessert + beverage), but your available menu budget is only ₱${availableMenuBudget.toLocaleString()}.`,
          })
        }
      }

      if (lowerPrefs.includes("pescatarian") || lowerPrefs.includes("fish only")) {
        onlyRequests.push("seafood")
        restrictions.push("beef", "pork", "chicken")
        emphasis.push("seafood", "vegetables")

        // Budget validation for pescatarian
        const pescatarianCost =
          (menuPricing.seafood * 3 +
            menuPricing.vegetables * 2 +
            menuPricing.pasta +
            menuPricing.dessert +
            menuPricing.beverage) *
          numGuests
        if (pescatarianCost > availableMenuBudget) {
          const suggestedBudget = pescatarianCost + serviceFee + pescatarianCost * 0.2
          budgetWarnings.push({
            category: "pescatarian",
            currentBudget: budget,
            suggestedBudget: Math.ceil(suggestedBudget / 1000) * 1000,
            reason: `Pescatarian menu requires minimum ₱${pescatarianCost.toLocaleString()} for adequate variety (3 seafood + 2 vegetable dishes + pasta + dessert + beverage), but your available menu budget is only ₱${availableMenuBudget.toLocaleString()}.`,
          })
        }
      }

      // Premium preference validation (multiple emphasis)
      if (emphasis.length >= 3) {
        const premiumCost =
          emphasis.reduce((total, cat) => {
            return total + menuPricing[cat as keyof typeof menuPricing] * 2 * numGuests
          }, 0) +
          (menuPricing.pasta + menuPricing.dessert + menuPricing.beverage) * numGuests

        if (premiumCost > availableMenuBudget) {
          const suggestedBudget = premiumCost + serviceFee + premiumCost * 0.2
          budgetWarnings.push({
            category: "premium_preferences",
            currentBudget: budget,
            suggestedBudget: Math.ceil(suggestedBudget / 1000) * 1000,
            reason: `Your multiple preferences (${emphasis.join(", ")}) require a premium menu costing ₱${premiumCost.toLocaleString()}, but your available menu budget is only ₱${availableMenuBudget.toLocaleString()}.`,
          })
        }
      }

      return {
        restrictions: [...new Set(restrictions)],
        emphasis: [...new Set(emphasis)],
        onlyRequests: [...new Set(onlyRequests)],
        budgetWarnings,
        availableMenuBudget,
        serviceFee,
      }
    }

    // Parse user preferences with enhanced budget validation
    const userPrefs = parseAdvancedUserPreferences(preferredMenus || "", budget, Number.parseInt(guestCount))

    // If there are budget warnings, return them immediately
    if (userPrefs.budgetWarnings.length > 0) {
      return NextResponse.json({
        success: false,
        budgetExceeded: true,
        budgetWarnings: userPrefs.budgetWarnings,
        message:
          "Your menu preferences exceed your current budget range. Please consider increasing your budget or adjusting your preferences.",
        suggestions: userPrefs.budgetWarnings.map((warning) => ({
          issue: warning.reason,
          suggestedBudget: warning.suggestedBudget,
          category: warning.category,
        })),
      })
    }

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
    const randomSeed = Math.random() * generationCount + Date.now()
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

    // Create the enhanced AI prompt with budget-conscious recommendations
    const prompt = `You are an expert catering menu curator for Jo Pacheco Wedding & Event Catering Services with deep understanding of Filipino cuisine, dietary preferences, and budget optimization.

IMPORTANT: This is session ${sessionId} at ${timestamp}. Generation #${generationCount}. You MUST provide COMPLETELY DIFFERENT menu selections from previous recommendations to ensure maximum variety and prevent any repetition. Randomize ALL categories including pasta, desserts, and beverages while still following user preferences strictly.

EVENT DETAILS:
- Event Type: ${eventType}
- Guest Count: ${guestCount}
- Budget: ₱${budget}
- Available Menu Budget: ₱${userPrefs.availableMenuBudget}
- Service Fee: ₱${userPrefs.serviceFee}
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

CRITICAL BUDGET VALIDATION: Budget has been pre-validated for user preferences. You can proceed with confidence that the budget supports their requests.

MENU PRICING PER GUEST:
- Beef & Pork (Menu 1): ₱70 per guest
- Chicken (Menu 2): ₱60 per guest
- Seafood & Vegetables (Menu 3): ₱50 per guest
- Pasta: ₱40 per guest
- Desserts: ₱25 per guest
- Beverages: ₱25 per guest

SERVICE FEE (for non-wedding/debut events):
- 50 guests: ₱11,500
- 80 guests: ₱10,400
- 100 guests: ₱11,000
- 150 guests: ₱16,500
- 200 guests: ₱22,000

AVAILABLE MENU ITEMS BY CATEGORY (RANDOMIZED FOR VARIETY):
Menu 1 (Beef & Pork): ${randomizedMenuItems.beef.join(", ")}, ${randomizedMenuItems.pork.join(", ")}
Menu 2 (Chicken): ${randomizedMenuItems.chicken.join(", ")}
Menu 3 (Seafood & Vegetables): ${randomizedMenuItems.seafood.join(", ")}, ${randomizedMenuItems.vegetables.join(", ")}
Pasta: ${randomizedMenuItems.pasta.join(", ")}
Desserts: ${randomizedMenuItems.dessert.join(", ")}
Beverages: ${randomizedMenuItems.beverage.join(", ")}

ENHANCED PREFERENCE HANDLING RULES:

1. EXCLUSIVE "ONLY" REQUESTS (HIGHEST PRIORITY - MUST BE STRICTLY ENFORCED):
   - If user says "only beef", "beef only", "just beef" → ONLY select from beef items, COMPLETELY EXCLUDE all pork, chicken, seafood, vegetables from main courses
   - If user says "only chicken", "chicken only" → ONLY select from chicken items, COMPLETELY EXCLUDE all beef, pork, seafood, vegetables from main courses  
   - If user says "only seafood", "seafood only" → ONLY select from seafood items, COMPLETELY EXCLUDE all beef, pork, chicken, vegetables from main courses
   - If user says "only vegetables", "vegetarian only" → ONLY select from vegetables, COMPLETELY EXCLUDE all meat/seafood from main courses
   - If user says "only pork & chicken" or "pork and chicken only" → ONLY select from pork AND chicken, COMPLETELY EXCLUDE beef, seafood, vegetables from main courses
   - For "only" requests, provide 4-6 items ONLY from the specified category/categories to ensure variety within the constraint
   - Still include pasta, dessert, and beverage unless specifically excluded
   - CRITICAL: "Only" means EXCLUSIVE - no other main course categories should appear

2. MAIN COURSE CATEGORY MAPPING FOR "ONLY" REQUESTS:
   - "only beef" → menu1 = [beef items only], menu2 = [], menu3 = []
   - "only pork" → menu1 = [pork items only], menu2 = [], menu3 = []  
   - "only chicken" → menu1 = [], menu2 = [chicken items only], menu3 = []
   - "only seafood" → menu1 = [], menu2 = [], menu3 = [seafood items only]
   - "only vegetables" → menu1 = [], menu2 = [], menu3 = [vegetable items only]
   - "only pork & chicken" → menu1 = [pork items only], menu2 = [chicken items only], menu3 = []
   - "only beef & seafood" → menu1 = [beef items only], menu2 = [], menu3 = [seafood items only]

3. RESTRICTION ENFORCEMENT (SECOND PRIORITY):
   - Complete exclusion of restricted categories
   - No exceptions or substitutions
   - Religious restrictions (halal, kosher) must be strictly observed

4. EMPHASIS AMPLIFICATION (THIRD PRIORITY):
   - Double the normal quantity for emphasized categories
   - Prioritize premium items from emphasized categories
   - Ensure emphasized categories dominate the menu composition

5. BUDGET OPTIMIZATION STRATEGY:
   - Available menu budget: ₱${userPrefs.availableMenuBudget}
   - Use 85-95% of available budget for optimal value
   - Prioritize user preferences even if it means fewer total items
   - Quality over quantity when budget is constrained

6. MENU COMPOSITION INTELLIGENCE:
   - Minimum 3 main course items (unless "only" request specifies otherwise)
   - Scale quantities based on budget tier:
     * Economy (₱25k-40k): 3-4 main, 1 pasta, 1 dessert, 1 beverage
     * Standard (₱41k-80k): 4-6 main, 1-2 pasta, 1-2 dessert, 1-2 beverage
     * Premium (₱81k-150k): 6-8 main, 2-3 pasta, 2-3 dessert, 2-3 beverage
     * Luxury (₱150k+): 8+ main, 3+ pasta, 3+ dessert, 3+ beverage

7. SPECIAL DIETARY HANDLING:
   - Vegetarian: Focus on vegetables + pasta, exclude all meat/seafood
   - Pescatarian: Seafood + vegetables only, exclude meat
   - Halal: Exclude pork completely, ensure halal compliance
   - Keto: Emphasize meat/seafood, minimize pasta
   - Gluten-free: Exclude pasta, emphasize other categories

CRITICAL SUCCESS FACTORS:
- User satisfaction is paramount - follow their preferences exactly
- Budget compliance is mandatory - stay within ₱${userPrefs.availableMenuBudget} for menu items
- Ensure variety within constraints
- Provide clear reasoning for all selections
- MAXIMUM RANDOMIZATION for generation #${generationCount}

RESPONSE FORMAT REQUIREMENTS:
Respond with a JSON object containing:
{
  "menu1": ["selected beef/pork items - EMPTY array [] if user restricted these or requested only other categories"],
  "menu2": ["selected chicken items - EMPTY array [] if user restricted chicken or requested only other categories"], 
  "menu3": ["selected seafood/vegetable items - EMPTY array [] if user restricted these or requested only other categories"],
  "pasta": ["selected pasta items - EMPTY array [] if user restricted pasta"],
  "dessert": ["selected dessert items"],
  "beverage": ["selected beverage items"],
  "reasoning": "Detailed explanation of how user preferences were interpreted and applied, including budget considerations and any special handling for 'only' requests",
  "explanation": "Step-by-step breakdown of selection process, budget calculations, and any trade-offs made to stay within budget while honoring preferences",
  "budgetUtilization": "Percentage of available menu budget used and justification for the utilization level"
}

EXAMPLE HANDLING FOR "ONLY" REQUESTS:
- User says "only beef": menu1 = [4-6 beef items], menu2 = [], menu3 = [], pasta = [1-2 items], dessert = [1-2 items], beverage = [1-2 items]
- User says "only chicken": menu1 = [], menu2 = [4-6 chicken items], menu3 = [], pasta = [1-2 items], dessert = [1-2 items], beverage = [1-2 items]
- User says "vegetarian only": menu1 = [], menu2 = [], menu3 = [4-6 vegetable items], pasta = [2-3 items], dessert = [1-2 items], beverage = [1-2 items]

Remember: The user's preferences and budget have been pre-validated. Focus on creating the perfect menu within their constraints while ensuring maximum variety for generation #${generationCount}.`

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
      pasta: validateSelections(aiRecommendations.pasta || [], filteredMenuItems.pasta, "Pasta"),
      dessert: validateSelections(aiRecommendations.dessert || [], filteredMenuItems.dessert, "Dessert"),
      beverage: validateSelections(aiRecommendations.beverage || [], filteredMenuItems.beverage, "Beverage"),
      reasoning:
        aiRecommendations.reasoning ||
        `Menu curated based on your specific preferences: "${preferredMenus}". Your dietary restrictions, "only" requests, and budget constraints have been carefully respected.`,
      explanation:
        aiRecommendations.explanation ||
        `This menu was carefully selected to follow your dietary preferences and restrictions while staying within your available menu budget of ₱${userPrefs.availableMenuBudget.toLocaleString()} and ensuring variety.`,
      budgetUtilization: aiRecommendations.budgetUtilization || "Budget optimized for your preferences",
    }

    return NextResponse.json({
      success: true,
      recommendations: validatedRecommendations,
      userPreferences: userPrefs, // Include parsed preferences for debugging
      sessionId: sessionId, // Include session ID for tracking variety
      budgetAnalysis: {
        totalBudget: budget,
        serviceFee: userPrefs.serviceFee,
        availableMenuBudget: userPrefs.availableMenuBudget,
        budgetValidated: true,
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
