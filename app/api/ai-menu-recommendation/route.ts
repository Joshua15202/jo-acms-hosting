import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { readFileSync } from "fs"
import { join } from "path"

const METRO_MANILA_VENUES = readFileSync(join(process.cwd(), "data/venues-metro-manila.txt"), "utf-8")
const BULACAN_VENUES = readFileSync(join(process.cwd(), "data/venues-bulacan.txt"), "utf-8")
const ALL_VENUES_DATA = `${METRO_MANILA_VENUES}\n\n${BULACAN_VENUES}`

export async function POST(request: Request) {
  try {
    const { eventType, guestCount, aiPreferences, availableMenuItems, generationCount } = await request.json()

    if (!eventType || !guestCount || !availableMenuItems) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      console.log("Gemini API key not found. Using fallback logic.")
      return NextResponse.json({
        success: false,
        message: "AI service unavailable",
        fallback: true,
      })
    }

    const parseAdvancedUserPreferences = (preferences: string) => {
      const lowerPrefs = preferences.toLowerCase()
      const restrictions: string[] = []
      const emphasis: string[] = []
      

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

      Object.keys(restrictionPatterns).forEach((category) => {
        // if (!onlyRequests.includes(category)) { // Removed this condition
          const patterns = restrictionPatterns[category as keyof typeof restrictionPatterns]
          if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
            restrictions.push(category)
          }
        // } // Removed this condition
      })

      Object.keys(emphasisPatterns).forEach((category) => {
        if (!restrictions.includes(category)) {
          const patterns = emphasisPatterns[category as keyof typeof emphasisPatterns]
          if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
            emphasis.push(category)
          }
        }
      })

      // Users can still express preferences, but AI must select from ALL categories
      
      if (lowerPrefs.includes("vegetarian") || lowerPrefs.includes("veggie") || lowerPrefs.includes("plant based")) {
        emphasis.push("vegetables")
        // Don't restrict meat - AI will still select from all categories but emphasize vegetables
      }

      if (lowerPrefs.includes("pescatarian") || lowerPrefs.includes("fish lover") || lowerPrefs.includes("seafood lover")) {
        emphasis.push("seafood")
        // Don't restrict meat - AI will still select from all categories but emphasize seafood
      }


      return {
        restrictions: [...new Set(restrictions)],
        emphasis: [...new Set(emphasis)],
      }
    }

    const validateSelections = (selections: string[], availableItems: string[], category: string) => {
      return selections.filter((item) => {
        const exists = availableItems.some((available) => available.toLowerCase().trim() === item.toLowerCase().trim())
        if (!exists) {
          console.warn(`Item "${item}" not found in ${category} menu`)
        }
        return exists
      })
    }

    const applyUserConstraints = (items: string[], category: string, userPrefs: any) => {

      if (userPrefs.restrictions.includes(category.toLowerCase())) {
        return []
      }

      return items
    }

    const userPrefs = parseAdvancedUserPreferences(aiPreferences || "")

    const shuffleArray = (array: string[]) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

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

    const sessionId = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().toISOString()

    const parseUserLocation = (preferences: string) => {
      const lowerPrefs = preferences.toLowerCase()
      
      // Define all service area cities
      const cities = ['quezon city', 'valenzuela', 'malabon', 'malolos', 'meycauayan', 'pandi', 'marilao']
      
      // Define common barangays from venue database for better matching
      const knownBarangays = [
        // Metro Manila barangays
        'cubao', 'bagumbayan', 'kamuning', 'sacred heart', 'ugong norte', 'balingasa', 'bahay toro',
        'commonwealth', 'fairview', 'talipapa', 'batasan hills', 'novaliches', 'diliman',
        'gen t de leon', 'karuhatan', 'marulas', 'malinta', 'malanday', 'bagong barrio', 'tugatog',
        'potrero', 'santolan', 'longos', 'tañong', 'acacia', 'niugan', 'concepcion', 'tonsuya',
        // Bulacan barangays  
        'loma de gato', 'atlag', 'mojon', 'san pablo', 'bulihan', 'caingin', 'sta rosa',
        'calvario', 'canalate', 'catmon', 'dakila', 'ligas', 'longos', 'pamarawan', 'panasahan',
        'barangca', 'banga', 'bancal', 'hulo', 'lawa', 'paligsahan', 'pulo', 'sta rita',
        'bagbaguin', 'buhol na mangga', 'camalig', 'cacarong bata', 'cacarong matanda', 'ibayo',
        'ilang ilang', 'loma de gato', 'namayan', 'patubig', 'prenza', 'tabing ilog'
      ]
      
      let mentionedCity: string | undefined = undefined
      let mentionedBarangay: string | null = null
      
      // First, try to find city mentions
      mentionedCity = cities.find(city => lowerPrefs.includes(city))
      
      // Try multiple strategies to extract barangay
      
      // Strategy 1: Look for known barangays directly in the text
      for (const barangay of knownBarangays) {
        if (lowerPrefs.includes(barangay)) {
          mentionedBarangay = barangay
          break
        }
      }
      
      // Strategy 2: Pattern matching for common phrases
      if (!mentionedBarangay) {
        const barangayPatterns = [
          // "i live in [barangay] [city]" pattern - captures text between "in" and city name
          new RegExp(`(?:live in|from|at|in)\\s+([a-z\\s]+?)\\s+(${cities.join('|')})`, 'i'),
          // "barangay [name]" or "brgy [name]" pattern
          /(?:barangay|brgy\.?)\s+([a-z\s]+?)(?:\s|,|$)/i,
          // "[barangay], [city]" pattern with comma
          new RegExp(`([a-z\\s]+?),\\s+(${cities.join('|')})`, 'i'),
        ]
        
        for (const pattern of barangayPatterns) {
          const match = preferences.match(pattern)
          if (match && match[1]) {
            const extracted = match[1].trim().toLowerCase()
            // Validate: barangay should be 2-30 characters and not be a city name
            if (extracted.length >= 2 && extracted.length <= 30 && !cities.includes(extracted)) {
              mentionedBarangay = extracted
              break
            }
          }
        }
      }
      
      return { city: mentionedCity, barangay: mentionedBarangay }
    }

    const userLocation = parseUserLocation(aiPreferences || "")
    console.log("Parsed user location:", userLocation)

    let venueSelectionGuidance = ""
    if (userLocation.barangay) {
      venueSelectionGuidance = `
   - User mentioned SPECIFIC BARANGAY: "${userLocation.barangay}"
   - FIRST: Search for venues IN THIS EXACT BARANGAY from the database
   - If barangay EXISTS in database: Select that venue and mention "Selected [VENUE] in [BARANGAY] because you live in [BARANGAY]"
   - If barangay NOT in database: Find closest venue in the same city "${userLocation.city || 'nearby area'}"
   - IMPORTANT: In your reasoning, EXPLAIN this: "I couldn't find a venue in ${userLocation.barangay}, so I selected [VENUE NAME] in [ACTUAL BARANGAY] which is close to your location in ${userLocation.city || 'your area'}."
   `
    } else if (userLocation.city) {
      venueSelectionGuidance = `
   - User mentioned CITY/MUNICIPALITY ONLY: "${userLocation.city}"
   - NO specific barangay mentioned
   - RANDOMIZE: Select ANY venue from this city randomly
   - DO NOT always pick the same venue - ensure variety across generations
   - In reasoning: "Selected [VENUE NAME] in [BARANGAY], ${userLocation.city} based on your location"
   `
    } else {
      venueSelectionGuidance = `
   - User did NOT mention specific location
   - Select popular/accessible venue from our service area
   - Randomize selection to provide variety
   - In reasoning: "Selected [VENUE NAME] as a convenient location in our service area"
   `
    }

    const prompt = `You are an expert catering menu curator for Jo Pacheco Wedding & Event Catering Services with deep understanding of Filipino cuisine, dietary preferences, venue recommendations, and event design.

**CRITICAL MENU COMPOSITION RULE - NON-NEGOTIABLE:**
You MUST ALWAYS select from ALL available categories following this EXACT structure:
- Exactly 1 dish from Menu 1 (Pork and Beef category)
- Exactly 1 dish from Menu 2 (Chicken category)
- Exactly 1 dish from Menu 3 (Seafood and Vegetables category)
- Exactly 1 Pasta
- Exactly 1 Dessert
- Exactly 1 Beverage

**IMPORTANT:** 
- You CANNOT skip any category even if the user says "vegetarian only", "no meat", or "seafood only"
- You CANNOT provide only 1 total item from all categories
- You MUST maintain the 3 main course structure (1 from each menu) + 1 pasta + 1 dessert + 1 beverage
- User preferences guide your CHOICES WITHIN each category, but you still select from ALL categories

For example:
- If user says "I'm vegetarian": Select the lightest/most vegetable-forward options from each category, but still select from pork/beef, chicken, and seafood categories
- If user says "I love seafood": Emphasize seafood choices but still select from all 3 main course categories

IMPORTANT: This is session ${sessionId} at ${timestamp}. Generation #${generationCount}. You MUST provide COMPLETELY DIFFERENT menu selections from previous recommendations to ensure maximum variety and prevent any repetition.

EVENT DETAILS:
- Event Type: ${eventType}
- Guest Count: ${guestCount}

USER'S COMBINED AI PREFERENCES:
"${aiPreferences || "No specific preferences provided - please randomize menu and suggest venue based on service area"}"

YOUR TASKS:
1. **Parse Menu Preferences**: Extract dietary restrictions (hard nos), preferences (would like), and emphasis (love/prefer) from user input
2. **Identify Location**: Extract the area/city mentioned and suggest appropriate venues nearby
3. **Understand Theme/Color Preferences**: Extract style preferences and suggest event theme and color motif
4. **Maintain Menu Composition**: ALWAYS follow the fixed structure - select 1 item from each of the 3 main course categories plus extras
5. **Pool/Resort Requirements**: If user mentions wanting a pool/swimming, ONLY suggest venues with "Resort" or "Pool" in the name

SERVICE AREA FOR VENUE SUGGESTIONS:
Jo Pacheco serves: Quezon City, Valenzuela, Malabon (Metro Manila Province), and Malolos, Meycauayan, Pandi, Marilao (Bulacan Province), and nearby areas.

AVAILABLE VENUES DATABASE (Select venues ONLY from this list):
${ALL_VENUES_DATA}

PARSED USER RESTRICTIONS (Avoid these if user explicitly said "no" or "allergic"):
${userPrefs.restrictions.length > 0 ? userPrefs.restrictions.join(", ") : "None"}

PARSED USER EMPHASIS (Prioritize these within each category when possible):
${userPrefs.emphasis.length > 0 ? userPrefs.emphasis.join(", ") : "None"}

AVAILABLE MENU ITEMS BY CATEGORY (ALREADY FILTERED FOR USER HARD RESTRICTIONS):
Menu 1 - Pork and Beef:
  Beef: ${randomizedMenuItems.beef.join(", ")}
  Pork: ${randomizedMenuItems.pork.join(", ")}

Menu 2 - Chicken: ${randomizedMenuItems.chicken.join(", ")}

Menu 3 - Seafood and Vegetables:
  Seafood: ${randomizedMenuItems.seafood.join(", ")}
  Vegetables: ${randomizedMenuItems.vegetables.join(", ")}

Extras:
  Pasta: ${randomizedMenuItems.pasta.join(", ")}
  Desserts: ${randomizedMenuItems.dessert.join(", ")}
  Beverages: ${randomizedMenuItems.beverage.join(", ")}

**SELECTION INSTRUCTIONS:**
1. From Menu 1: Choose EITHER 1 beef OR 1 pork dish (return the other as empty array)
2. From Menu 2: Choose exactly 1 chicken dish
3. From Menu 3: Choose EITHER 1 seafood OR 1 vegetable dish (return the other as empty array)
4. Choose exactly 1 pasta, 1 dessert, 1 beverage

RESPONSE FORMAT REQUIREMENTS:
Respond with a JSON object containing:
{
  "beef": ["selected beef item if chosen from Menu 1, otherwise EMPTY array []"],
  "pork": ["selected pork item if chosen from Menu 1, otherwise EMPTY array []"],
  "chicken": ["exactly 1 chicken item from Menu 2"], 
  "seafood": ["selected seafood item if chosen from Menu 3, otherwise EMPTY array []"],
  "vegetables": ["selected vegetable item if chosen from Menu 3, otherwise EMPTY array []"],
  "pasta": ["exactly 1 pasta item"],
  "dessert": ["exactly 1 dessert item"],
  "beverage": ["exactly 1 beverage item"],
  "venueRecommendation": {
    "venueName": "Exact venue name from database",
    "barangay": "Exact barangay from database",
    "streetAddress": "Exact street address from database",
    "city": "City name (Quezon City, Valenzuela, Malabon, Malolos, Meycauayan, Pandi, or Marilao)",
    "province": "Province name (Metro Manila or Bulacan)",
    "postalCode": "Exact postal/zip code from database",
    "reasoning": "Why this venue suits the user's location and needs"
  },
  "eventTheme": "Suggested theme based on preferences",
  "colorMotif": "Suggested color palette",
  "reasoning": "CRITICAL: Write 2-3 sentences that SPECIFICALLY reference the EXACT dishes you selected (from Menu 1, Menu 2, Menu 3), the EXACT venue you chose, and the EXACT theme/colors. Explain WHY each was chosen based on the user's AI preferences.",
  "explanation": "Step-by-step breakdown of recommendations"
}

CRITICAL VENUE SELECTION RULES:
1. Parse the user's location from their AI Preferences (city, barangay, neighborhood, landmarks)
2. If user mentions wanting a POOL or swimming: ONLY suggest venues with "Resort", "Pool", or "Private Resort" in the name
3. **VENUE SELECTION LOGIC:**
   ${venueSelectionGuidance}
4. Select a venue from the AVAILABLE VENUES DATABASE that matches the logic above
5. Extract the EXACT barangay, street address, city, and postal code from the database entry
6. Format in database: "Venue Name — Barangay Name — Street Address, City — Postal Code"
7. ALWAYS provide complete address components (venue name, barangay, street, city, province, postal code)
8. Match city names correctly: Malolos/Meycauayan/Pandi/Marilao are in Bulacan Province, Quezon City/Valenzuela/Malabon are in Metro Manila

CRITICAL REASONING REQUIREMENT:
Your "reasoning" field MUST include these SPECIFIC elements:

1. **MENU ITEMS** - List the EXACT dish names you selected from each menu:
   - Example: "From Menu 1, I selected Roast Beef with Mashed Potato. From Menu 2, I chose Chicken Lollipop. From Menu 3, I picked Fish Tofu..."
   - NEVER say generic items like "Pork Mahonado" or "Fisherman's Delight" unless those are the actual names
   - Quote the EXACT menu item names as they appear in the categories above

2. **WHY THESE DISHES** - Reference the user's food preferences:
   - Example: "...because you mentioned loving seafood and elegant dishes"
   - Quote or paraphrase what the user actually said in "${aiPreferences || "preferences"}"

3. **VENUE SELECTION** - Explain the venue choice with EXACT location:
   ${userLocation.barangay ? `
   - If venue IS in ${userLocation.barangay}: Say "I chose [EXACT VENUE NAME] in ${userLocation.barangay}, ${userLocation.city || ''} because you live in ${userLocation.barangay}"
   - If venue NOT in ${userLocation.barangay}: Say "I couldn't find a venue in ${userLocation.barangay}, so I selected [EXACT VENUE NAME] in [ACTUAL BARANGAY] which is close to your location in ${userLocation.city || 'your area'}"
   ` : userLocation.city ? `
   - Say "I selected [EXACT VENUE NAME] in [BARANGAY], ${userLocation.city} based on your location"
   ` : `
   - Say "I selected [EXACT VENUE NAME] as a convenient location in our service area"
   `}

4. **THEME & COLORS** - Reference user's aesthetic preferences:
   - Example: "The Elegant Seaside theme with Navy Blue and Silver reflects your preference for elegant style"

Remember: ALWAYS maintain the menu composition (1 from Menu 1, 1 from Menu 2, 1 from Menu 3, plus pasta/dessert/beverage). User preferences guide your choices WITHIN each required category. Maximum variety for generation #${generationCount}.`

    const response = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: prompt,
      temperature: 0.8,
      maxTokens: 2000,
    })

    let aiRecommendations
    try {
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
        `Menu curated with fixed structure: exactly 1 item per main course category (beef, pork, chicken, seafood, vegetables), 1 pasta, 1 dessert, 1 beverage. Your dietary restrictions and preferences: "${aiPreferences}" have been carefully respected.`,
      explanation:
        aiRecommendations.explanation ||
        `This menu was carefully selected to follow your dietary preferences and restrictions while maintaining our standard structure of exactly 1 item per main course category, 1 pasta, 1 dessert, and 1 beverage.`,
    }

    // Logic to select one item from Menu 1 (Beef or Pork)
    let menu1Selected = false
    const menu1Available = [...(randomizedMenuItems.beef || []), ...(randomizedMenuItems.pork || [])]
    const menu1Selections = validateSelections(
        [...(aiRecommendations.beef || []), ...(aiRecommendations.pork || [])],
        menu1Available,
        "Menu 1 (Beef/Pork)"
    )

    if (menu1Selections.length > 0) {
        // Prioritize beef if available and requested/emphasized, otherwise pork
        const selectedItem = menu1Selections[0]
        if (userPrefs.emphasis.includes('beef') && randomizedMenuItems.beef.includes(selectedItem)) {
            validatedRecommendations.beef = [selectedItem]
            menu1Selected = true
        } else if (userPrefs.emphasis.includes('pork') && randomizedMenuItems.pork.includes(selectedItem)) {
            validatedRecommendations.pork = [selectedItem]
            menu1Selected = true
        } else if (randomizedMenuItems.beef.includes(selectedItem)) {
            validatedRecommendations.beef = [selectedItem]
            menu1Selected = true
        } else if (randomizedMenuItems.pork.includes(selectedItem)) {
            validatedRecommendations.pork = [selectedItem]
            menu1Selected = true
        }
    }

    if (!menu1Selected && menu1Available.length > 0) {
        // Fallback: randomly pick one if AI didn't provide a valid selection or if no emphasis matched
        const randomItem = menu1Available[Math.floor(Math.random() * menu1Available.length)]
        if (randomizedMenuItems.beef.includes(randomItem)) {
            validatedRecommendations.beef = [randomItem]
            console.log(`Menu 1: Fallback selected beef "${randomItem}"`)
        } else {
            validatedRecommendations.pork = [randomItem]
            console.log(`Menu 1: Fallback selected pork "${randomItem}"`)
        }
    }


    // Logic to select one item from Menu 2 (Chicken)
    if (filteredMenuItems.chicken.length > 0) {
      const chickenSelections = validateSelections(
        aiRecommendations.chicken || [],
        filteredMenuItems.chicken,
        "Chicken",
      )

      if (chickenSelections.length > 0) {
        validatedRecommendations.chicken = [chickenSelections[0]]
        console.log(
          `Chicken: Selected "${chickenSelections[0]}"`,
        )
      } else {
        const randomItem = filteredMenuItems.chicken[Math.floor(Math.random() * filteredMenuItems.chicken.length)]
        validatedRecommendations.chicken = [randomItem]
        console.log(`Chicken: Fallback selected "${randomItem}"`)
      }
    }

    // Logic to select one item from Menu 3 (Seafood or Vegetables)
    let menu3Selected = false
    const menu3Available = [...(randomizedMenuItems.seafood || []), ...(randomizedMenuItems.vegetables || [])]
    const menu3Selections = validateSelections(
        [...(aiRecommendations.seafood || []), ...(aiRecommendations.vegetables || [])],
        menu3Available,
        "Menu 3 (Seafood/Vegetables)"
    )

    if (menu3Selections.length > 0) {
        // Prioritize seafood if emphasized, otherwise vegetables if emphasized, otherwise take the first valid selection
        const selectedItem = menu3Selections[0]
        if (userPrefs.emphasis.includes('seafood') && randomizedMenuItems.seafood.includes(selectedItem)) {
            validatedRecommendations.seafood = [selectedItem]
            menu3Selected = true
        } else if (userPrefs.emphasis.includes('vegetables') && randomizedMenuItems.vegetables.includes(selectedItem)) {
            validatedRecommendations.vegetables = [selectedItem]
            menu3Selected = true
        } else if (randomizedMenuItems.seafood.includes(selectedItem)) {
            validatedRecommendations.seafood = [selectedItem]
            menu3Selected = true
        } else if (randomizedMenuItems.vegetables.includes(selectedItem)) {
            validatedRecommendations.vegetables = [selectedItem]
            menu3Selected = true
        }
    }

    if (!menu3Selected && menu3Available.length > 0) {
        // Fallback: randomly pick one if AI didn't provide a valid selection or if no emphasis matched
        const randomItem = menu3Available[Math.floor(Math.random() * menu3Available.length)]
        if (randomizedMenuItems.seafood.includes(randomItem)) {
            validatedRecommendations.seafood = [randomItem]
            console.log(`Menu 3: Fallback selected seafood "${randomItem}"`)
        } else {
            validatedRecommendations.vegetables = [randomItem]
            console.log(`Menu 3: Fallback selected vegetables "${randomItem}"`)
        }
    }

    // Logic for Pasta
    if (filteredMenuItems.pasta.length > 0) {
      const pastaSelections = validateSelections(aiRecommendations.pasta || [], filteredMenuItems.pasta, "Pasta")

      if (pastaSelections.length > 0) {
        validatedRecommendations.pasta = [pastaSelections[0]]
        console.log(
          `Pasta: Selected "${pastaSelections[0]}"`,
        )
      } else {
        const randomItem = filteredMenuItems.pasta[Math.floor(Math.random() * filteredMenuItems.pasta.length)]
        validatedRecommendations.pasta = [randomItem]
        console.log(`Pasta: Fallback selected "${randomItem}"`)
      }
    }

    // Logic for Dessert
    if (filteredMenuItems.dessert.length > 0) {
      const dessertSelections = validateSelections(
        aiRecommendations.dessert || [],
        filteredMenuItems.dessert,
        "Dessert",
      )

      if (dessertSelections.length > 0) {
        validatedRecommendations.dessert = [dessertSelections[0]]
        console.log(
          `Dessert: Selected "${dessertSelections[0]}"`,
        )
      } else {
        const randomItem = filteredMenuItems.dessert[Math.floor(Math.random() * filteredMenuItems.dessert.length)]
        validatedRecommendations.dessert = [randomItem]
        console.log(`Dessert: Fallback selected "${randomItem}"`)
      }
    }

    // Logic for Beverage
    if (filteredMenuItems.beverage.length > 0) {
      const beverageSelections = validateSelections(
        aiRecommendations.beverage || [],
        filteredMenuItems.beverage,
        "Beverage",
      )

      if (beverageSelections.length > 0) {
        validatedRecommendations.beverage = [beverageSelections[0]]
        console.log(
          `Beverage: Selected "${beverageSelections[0]}"`,
        )
      } else {
        const randomItem = filteredMenuItems.beverage[Math.floor(Math.random() * filteredMenuItems.beverage.length)]
        validatedRecommendations.beverage = [randomItem]
        console.log(`Beverage: Fallback selected "${randomItem}"`)
      }
    }


    // Ensure only one item per category is selected and arrays are sliced to be safe
    validatedRecommendations.beef = validatedRecommendations.beef.slice(0, 1)
    validatedRecommendations.pork = validatedRecommendations.pork.slice(0, 1)
    validatedRecommendations.chicken = validatedRecommendations.chicken.slice(0, 1)
    validatedRecommendations.seafood = validatedRecommendations.seafood.slice(0, 1)
    validatedRecommendations.vegetables = validatedRecommendations.vegetables.slice(0, 1)
    validatedRecommendations.pasta = validatedRecommendations.pasta.slice(0, 1)
    validatedRecommendations.dessert = validatedRecommendations.dessert.slice(0, 1)
    validatedRecommendations.beverage = validatedRecommendations.beverage.slice(0, 1)

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

    const totalMainCourses =
      (validatedRecommendations.beef.length > 0 ? 1 : 0) +
      (validatedRecommendations.pork.length > 0 ? 1 : 0) +
      (validatedRecommendations.chicken.length > 0 ? 1 : 0) +
      (validatedRecommendations.seafood.length > 0 ? 1 : 0) +
      (validatedRecommendations.vegetables.length > 0 ? 1 : 0)
    const totalItems =
      totalMainCourses +
      validatedRecommendations.pasta.length +
      validatedRecommendations.dessert.length +
      validatedRecommendations.beverage.length

    console.log(`COMPLIANCE CHECK: ${totalMainCourses} main courses, ${totalItems} total items`)

    if (
      (validatedRecommendations.beef.length > 1) ||
      (validatedRecommendations.pork.length > 1) ||
      (validatedRecommendations.chicken.length > 1) ||
      (validatedRecommendations.seafood.length > 1) ||
      (validatedRecommendations.vegetables.length > 1) ||
      (validatedRecommendations.pasta.length > 1) ||
      (validatedRecommendations.dessert.length > 1) ||
      (validatedRecommendations.beverage.length > 1)
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

    // Build a summary of what was actually selected for validation
    const selectedDishes = [
      ...validatedRecommendations.beef,
      ...validatedRecommendations.pork,
      ...validatedRecommendations.chicken,
      ...validatedRecommendations.seafood,
      ...validatedRecommendations.vegetables,
      ...validatedRecommendations.pasta,
    ].filter(dish => dish); // Filter out empty strings if any category was not selected

    console.log("[v0] Selected dishes for reasoning validation:", selectedDishes)
    console.log("[v0] AI-generated reasoning:", validatedRecommendations.reasoning)

    // Create an enhanced reasoning that references the actual selections
    const enhancedReasoning = `I selected ${selectedDishes.join(", ")} ${
      selectedDishes.length > 0 
        ? `because ${userPrefs.emphasis.includes('beef') ? 'you expressed a strong preference for beef' : 
             userPrefs.emphasis.includes('pork') ? 'you expressed a strong preference for pork' :
             userPrefs.emphasis.includes('chicken') ? 'you expressed a strong preference for chicken' :
             userPrefs.emphasis.includes('seafood') ? 'you expressed a strong preference for seafood' :
             userPrefs.emphasis.includes('vegetables') ? 'you expressed a strong preference for vegetables' :
             'they align with your preferences'}` 
        : 'based on your preferences'
    }. ${
      aiRecommendations.venueRecommendation 
        ? `I chose ${aiRecommendations.venueRecommendation.venueName} in ${aiRecommendations.venueRecommendation.barangay}${
            userLocation.barangay && aiRecommendations.venueRecommendation.barangay?.toLowerCase() !== userLocation.barangay.toLowerCase()
              ? ` (close to ${userLocation.barangay})`
              : userLocation.barangay 
                ? ` because you live in ${userLocation.barangay}`
                : ''
          }${userLocation.city ? `, ${userLocation.city}` : ''}.`
        : ''
    } The ${aiRecommendations.eventTheme || 'elegant'} theme with ${aiRecommendations.colorMotif || 'sophisticated colors'} ${
      userPrefs.emphasis.some(pref => ['elegant', 'modern', 'rustic'].includes(pref)) ? 
        `reflects your preference for ${userPrefs.emphasis.find(pref => ['elegant', 'modern', 'rustic'].includes(pref))} style` :
      'complements your event perfectly'
    }.`

    validatedRecommendations.reasoning = enhancedReasoning

    console.log("[v0] Enhanced reasoning with actual selections:", enhancedReasoning)

    return NextResponse.json({
      success: true,
      recommendations: validatedRecommendations,
      venueRecommendation: aiRecommendations.venueRecommendation || null,
      eventTheme: aiRecommendations.eventTheme || "",
      colorMotif: aiRecommendations.colorMotif || "",
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
