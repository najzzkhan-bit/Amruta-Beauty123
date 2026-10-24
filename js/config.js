/**
 * Amruta Boarde Makeup Artist - Configuration Settings
 * Centralized business details, contact links, and customizable options.
 */

window.AMRUTA_CONFIG = {
  brandName: "AMRUTA MAKEOVER",
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
  businessAddress: "Heaven park lane no 1 Amruta Makeover near mountain high restaurant and bar, Jarande nagar Mohammed wadi Pune Maharashtra 411060",
  googleMapsUrl: "",
  openingHours: "Monday to Sunday: By Prior Appointment",

  // Admin Passcode (Default demo passcode: amruta2026)
  adminPasscode: "amruta2026",

  // Supabase Configuration
  supabaseUrl: "https://amgvannjbrtjxesfjyad.supabase.co",
  supabaseAnonKey: "sb_publishable_vdzhdBYSXISbCoQkGcPdAg_sodVYaQp",

  // Initial Services List (Preserving exact prices from client requirements)
  initialServices: [
    // Hair Services
    { id: "hair-1", name: "Women's Haircut & Style", category: "Hair Services", price: "₹400", priceNum: 400 },
    { id: "hair-2", name: "Only Haircut", category: "Hair Services", price: "₹250", priceNum: 250 },
    { id: "hair-3", name: "Kids Haircut (Under 12)", category: "Hair Services", price: "₹200", priceNum: 200 },
    { id: "hair-4", name: "Wash & Blow Dry", category: "Hair Services", price: "₹350", priceNum: 350 },
    { id: "hair-5", name: "Blow dry", category: "Hair Services", price: "₹300", priceNum: 300 },
    { id: "hair-6", name: "haircut wash n blow dry", category: "Hair Services", price: "₹500", priceNum: 500 },

    // Wax Services
    { id: "wax-1", name: "Classic wax hand", category: "Wax Services", price: "₹250", priceNum: 250 },
    { id: "wax-2", name: "Classic leg", category: "Wax Services", price: "₹475", priceNum: 475 },
    { id: "wax-3", name: "Half leg", category: "Wax Services", price: "₹350", priceNum: 350 },
    { id: "wax-4", name: "UA", category: "Wax Services", price: "₹100", priceNum: 100 },
    { id: "wax-5", name: "rica hand", category: "Wax Services", price: "₹350", priceNum: 350 },
    { id: "wax-6", name: "rica leg", category: "Wax Services", price: "₹700", priceNum: 700 },
    { id: "wax-7", name: "half leg", category: "Wax Services", price: "₹400", priceNum: 400 },
    { id: "wax-8", name: "UA", category: "Wax Services", price: "₹150", priceNum: 150 },
    { id: "wax-9", name: "full arms + leg+ UA", category: "Wax Services", price: "₹700", priceNum: 700 },
    { id: "wax-10", name: "Rica full arms +leg+UA", category: "Wax Services", price: "₹1100", priceNum: 1100 },
    { id: "wax-11", name: "front", category: "Wax Services", price: "₹300 R400", priceNum: 300 },
    { id: "wax-12", name: "back", category: "Wax Services", price: "₹300 R400", priceNum: 300 },
    { id: "wax-13", name: "bikini", category: "Wax Services", price: "₹1500", priceNum: 1500 },
    { id: "wax-14", name: "peel off upper lip", category: "Wax Services", price: "₹70", priceNum: 70 },
    { id: "wax-15", name: "chin", category: "Wax Services", price: "₹80", priceNum: 80 },
    { id: "wax-16", name: "forehade", category: "Wax Services", price: "₹100", priceNum: 100 },
    { id: "wax-17", name: "face", category: "Wax Services", price: "₹350", priceNum: 350 },

    // Treading
    { id: "thread-1", name: "Eyebrows", category: "Treading", price: "₹50", priceNum: 50 },
    { id: "thread-2", name: "upperlip", category: "Treading", price: "₹20", priceNum: 20 },
    { id: "thread-3", name: "forehade.", category: "Treading", price: "₹30", priceNum: 30 },
    { id: "thread-4", name: "chin.", category: "Treading", price: "₹20", priceNum: 20 },
    { id: "thread-5", name: "face.", category: "Treading", price: "₹300", priceNum: 300 },

    // Hair Treatment
    { id: "ht-1", name: "Deep Conditioning Treatment", category: "Hair Treatment", price: "₹600", priceNum: 600 },
    { id: "ht-2", name: "Hair Spa Treatment starts", category: "Hair Treatment", price: "₹850", priceNum: 850 },
    { id: "ht-3", name: "Protein hair spa starts", category: "Hair Treatment", price: "₹1500", priceNum: 1500 },
    { id: "ht-4", name: "Botox Treatment started", category: "Hair Treatment", price: "₹2800", priceNum: 2800 },
    { id: "ht-5", name: "hade massage", category: "Hair Treatment", price: "₹500", priceNum: 500 },
    { id: "ht-6", name: "Hair colour starts", category: "Hair Treatment", price: "₹850", priceNum: 850 },

    // Facial & Skincare
    { id: "facial-1", name: "clean up", category: "Facial & Skincare", price: "₹400", priceNum: 400 },
    { id: "facial-2", name: "fruit Cleansing", category: "Facial & Skincare", price: "₹550", priceNum: 550 },
    { id: "facial-3", name: "whitening clenup", category: "Facial & Skincare", price: "₹750", priceNum: 750 },
    { id: "facial-4", name: "detan clean up", category: "Facial & Skincare", price: "₹850", priceNum: 850 },
    { id: "facial-5", name: "classic facial", category: "Facial & Skincare", price: "₹850", priceNum: 850 },
    { id: "facial-6", name: "Gold facial", category: "Facial & Skincare", price: "₹1050", priceNum: 1050 },
    { id: "facial-7", name: "Whitening facial", category: "Facial & Skincare", price: "₹1350", priceNum: 1350 },
    { id: "facial-8", name: "party glow", category: "Facial & Skincare", price: "₹1450", priceNum: 1450 },
    { id: "facial-9", name: "youth facial", category: "Facial & Skincare", price: "₹1500", priceNum: 1500 },
    { id: "facial-10", name: "detan facial", category: "Facial & Skincare", price: "₹1700", priceNum: 1700 },
    { id: "facial-11", name: "korean facial", category: "Facial & Skincare", price: "₹2500", priceNum: 2500 },

    // HydraFacial & Skincare
    { id: "hydra-1", name: "Classic hydra", category: "HydraFacial & Skincare", price: "₹1500", priceNum: 1500 },
    { id: "hydra-2", name: "golden hydra", category: "HydraFacial & Skincare", price: "₹1650", priceNum: 1650 },
    { id: "hydra-3", name: "whitening hydra", category: "HydraFacial & Skincare", price: "₹1700", priceNum: 1700 },
    { id: "hydra-4", name: "party glow", category: "HydraFacial & Skincare", price: "₹1850", priceNum: 1850 },
    { id: "hydra-5", name: "youthhydra", category: "HydraFacial & Skincare", price: "₹1850", priceNum: 1850 },
    { id: "hydra-6", name: "korean hydra", category: "HydraFacial & Skincare", price: "₹3000", priceNum: 3000 },
    { id: "hydra-7", name: "face detan", category: "HydraFacial & Skincare", price: "₹250", priceNum: 250 },
    { id: "hydra-8", name: "face bleach", category: "HydraFacial & Skincare", price: "₹350", priceNum: 350 }
  ]
};
