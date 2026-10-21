/**
 * Amruta Boarde Makeup Artist - Configuration Settings
 * Centralized business details, contact links, and customizable options.
 */

window.AMRUTA_CONFIG = {
  brandName: "Amruta Boarde Makeup Artist",
  tagline: "Bridal Makeup Artist | Hairstylist",
  experienceYears: 12,
  contactPhone: "+917387268299",
  contactPhoneDisplay: "+91 7387268299",
  whatsappNumber: "917387268299",
  instagramUrl: "https://www.instagram.com/makeup_byamruta/",
  // Facebook URL: left empty until officially provided by Amruta. The UI hides Facebook if empty.
  facebookUrl: "",
  serviceCoverage: "India & International Destinations",

  // Business Location Configuration
  // Keep empty until Amruta configures her permanent studio address and map embed
  businessAddress: "",
  googleMapsUrl: "",
  openingHours: "Monday to Sunday: By Prior Appointment",

  // Admin Passcode (Default demo passcode: amruta2026)
  adminPasscode: "amruta2026",

  // Supabase Configuration
  supabaseUrl: "https://amgvannjbrtjxesfjyad.supabase.co",
  supabaseAnonKey: "sb_publishable_vdzhdBYSXISbCoQkGcPdAg_sodVYaQp",

  // Initial Services List (Preserving exact prices from client requirements)
  initialServices: [
    // Skincare and Facial Services
    { id: "srv-1", name: "Eyebrow", category: "Skincare and Facial Services", price: "₹30", priceNum: 30, description: "Precise shaping to complement your facial structure" },
    { id: "srv-2", name: "Fruit Cleanup", category: "Skincare and Facial Services", price: "₹300", priceNum: 300, description: "Gentle natural cleansing for clear, radiant skin" },
    { id: "srv-3", name: "Upper Lips", category: "Skincare and Facial Services", price: "₹15", priceNum: 15, description: "Quick, hygienic threading for smooth skin" },
    { id: "srv-4", name: "Fruit Facial", category: "Skincare and Facial Services", price: "₹500", priceNum: 500, description: "Rejuvenating organic fruit extracts facial" },
    { id: "srv-5", name: "Forehead", category: "Skincare and Facial Services", price: "₹15", priceNum: 15, description: "Clean forehead threading and shaping" },
    { id: "srv-6", name: "Fruit Bleach", category: "Skincare and Facial Services", price: "₹150", priceNum: 150, description: "Mild fruit bleach to naturally brighten skin tone" },
    { id: "srv-7", name: "D-Tan", category: "Skincare and Facial Services", price: "₹200", priceNum: 200, description: "Targeted de-tanning therapy for radiant glow" },
    { id: "srv-8", name: "Face Wax", category: "Skincare and Facial Services", price: "₹200", priceNum: 200, description: "Gentle facial waxing for a lasting velvet finish" },
    { id: "srv-9", name: "Arms Bleach", category: "Skincare and Facial Services", price: "₹150", priceNum: 150, description: "Skin tone balancing bleach for full arms" },
    { id: "srv-10", name: "Arms D-Tan", category: "Skincare and Facial Services", price: "₹250", priceNum: 250, description: "Sun tan removal treatment for glowing arms" },
    { id: "srv-11", name: "Raga Facial", category: "Skincare and Facial Services", price: "₹700", priceNum: 700, description: "Premium therapeutic facial for deep cellular renewal" },
    { id: "srv-12", name: "Aroma Facial", category: "Skincare and Facial Services", price: "₹500", priceNum: 500, description: "Soothing aromatic essential oil facial treatment" },
    { id: "srv-13", name: "Hand Polishing", category: "Skincare and Facial Services", price: "₹300", priceNum: 300, description: "Exfoliation and nourishing polish for silky hands" },

    // Waxing and Body Care
    { id: "srv-14", name: "Waxing", category: "Waxing and Body Care", price: "Contact for price", priceNum: null, description: "Custom waxing session customized to your skin sensitivity" },
    { id: "srv-15", name: "Full Arms + Underarms", category: "Waxing and Body Care", price: "₹150", priceNum: 150, description: "Complete arms and underarm gentle waxing" },
    { id: "srv-16", name: "Half Legs", category: "Waxing and Body Care", price: "₹150", priceNum: 150, description: "Smooth knee-down leg waxing" },
    { id: "srv-17", name: "Full Legs", category: "Waxing and Body Care", price: "₹300", priceNum: 300, description: "Silky full-length leg waxing" },
    { id: "srv-18", name: "Head Massage", category: "Waxing and Body Care", price: "₹200", priceNum: 200, description: "Relaxing stress-relief acupressure warm oil massage" },
    { id: "srv-19", name: "Full Body Massage", category: "Waxing and Body Care", price: "₹1,000", priceNum: 1000, description: "Deeply restorative full-body therapeutic oil massage" },
    { id: "srv-20", name: "Foot Massage", category: "Waxing and Body Care", price: "₹150", priceNum: 150, description: "Soothing foot reflexology and relaxation" },
    { id: "srv-21", name: "Leg Polishing", category: "Waxing and Body Care", price: "₹400", priceNum: 400, description: "Exfoliating scrub and luminous glow polish for legs" },
    { id: "srv-22", name: "Full Body Polishing", category: "Waxing and Body Care", price: "₹1,000", priceNum: 1000, description: "Luxurious head-to-toe exfoliation and skin glow wrap" },

    // Nail Care
    { id: "srv-23", name: "Manicure", category: "Nail Care", price: "₹250", priceNum: 250, description: "Nail shaping, cuticle therapy, hand massage, and polish" },
    { id: "srv-24", name: "Pedicure", category: "Nail Care", price: "₹350", priceNum: 350, description: "Warm foot soak, exfoliation, massage, and nail care" },

    // Hair Services
    { id: "srv-25", name: "Hair Spa Matrix", category: "Hair Services", price: "₹500", priceNum: 500, description: "Matrix deep moisture and smoothing hair therapy" },
    { id: "srv-26", name: "Hair Spa Keratin", category: "Hair Services", price: "₹700", priceNum: 700, description: "Intense keratin infusion for glossy, frizz-free hair" },
    { id: "srv-27", name: "Hair Cutting", category: "Hair Services", price: "₹350", priceNum: 350, description: "Precision haircut tailored to your styling preferences" },
    { id: "srv-28", name: "Head Wash", category: "Hair Services", price: "₹150", priceNum: 150, description: "Clarifying wash with nourishing hair conditioner" },
    { id: "srv-29", name: "Root Touch Up", category: "Hair Services", price: "₹500", priceNum: 500, description: "Flawless root color application and seamless blending" },
    { id: "srv-30", name: "Head Wash + Blow Dry", category: "Hair Services", price: "₹250", priceNum: 250, description: "Cleansing head wash paired with voluminous blowout styling" },

    // Mehndi Services
    { id: "srv-31", name: "Arabic Mehndi", category: "Mehndi Services", price: "₹250", priceNum: 250, description: "Elegant Arabic floral and geometric mehndi patterns" },
    { id: "srv-32", name: "Bridal Mehndi", category: "Mehndi Services", price: "₹2,000", priceNum: 2000, description: "Traditional intricate bridal mehndi for hands and feet" },

    // Signature Bridal Artistry (Special packages)
    { id: "srv-33", name: "Complete Bridal Artistry Package", category: "Bridal & Wedding Artistry", price: "Inquire for Bridal Package", priceNum: null, description: "Full bridal makeup, luxury hairstyling, saree draping / veil fitting, and touch-up kit" },
    { id: "srv-34", name: "Engagement & Sangeet Glam", category: "Bridal & Wedding Artistry", price: "Inquire for Bridal Package", priceNum: null, description: "High-definition camera-ready makeup and designer hairstyling" },
    { id: "srv-35", name: "Reception Look & Cocktail Artistry", category: "Bridal & Wedding Artistry", price: "Inquire for Bridal Package", priceNum: null, description: "Sophisticated red-carpet evening makeup and statement hairstyles" }
  ]
};
