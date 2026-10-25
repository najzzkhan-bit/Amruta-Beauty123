/**
 * Amruta Makeover Beauty Salon - 2-Way Conversational Voice AI Receptionist: Shreya
 * Natural Maharashtra / Indian Girl Voice with Real-Time Interruption & Auto Language Mirroring
 */

(function () {
  "use strict";

  const config = window.AMRUTA_CONFIG || {
    brandName: "AMRUTA MAKEOVER",
    contactPhone: "+917387268299",
    contactPhoneDisplay: "7387268299",
    whatsappNumber: "917387268299",
    businessAddress: "Heaven park lane no 1, Amruta Makeover",
    supabaseUrl: "https://amgvannjbrtjxesfjyad.supabase.co",
    supabaseAnonKey: "sb_publishable_vdzhdBYSXISbCoQkGcPdAg_sodVYaQp"
  };

  // State Management
  const state = {
    isListening: false,
    isSpeaking: false,
    continuousConversation: false,
    activeLanguage: "hinglish", // 'marathi' or 'hinglish'
    recognition: null,
    synth: window.speechSynthesis || null,
    selectedVoice: null,
    askedAddon: false,
    bookingDraft: {
      name: "",
      phone: "",
      service: "",
      date: "",
      time: ""
    }
  };

  // Voice Selection for Indian / Maharashtra Girl Voice
  function initVoices() {
    if (!state.synth) return;
    const load = () => {
      const voices = state.synth.getVoices();
      // Select best female voice for Indian/Hindi/Marathi accent
      state.selectedVoice =
        voices.find(v => v.lang.includes("mr-IN") || v.name.toLowerCase().includes("marathi")) ||
        voices.find(v => (v.lang.includes("hi-IN") || v.lang.includes("en-IN")) && (v.name.includes("Swara") || v.name.includes("Kavya") || v.name.includes("Heera") || v.name.includes("Neerja") || v.name.includes("Kalpana") || v.name.toLowerCase().includes("female"))) ||
        voices.find(v => v.lang.includes("hi-IN")) ||
        voices.find(v => v.lang.includes("en-IN")) ||
        voices.find(v => v.name.includes("Google UK English Female") || v.name.includes("Samantha")) ||
        voices[0] || null;
    };
    load();
    if (state.synth.onvoiceschanged !== undefined) {
      state.synth.onvoiceschanged = load;
    }
  }

  // Detect Language: Marathi vs Hinglish vs English
  function detectLanguage(text) {
    const marathiKeywords = [
      "kay", "kiti", "aahe", "ahet", "kuthe", "kadhi", "rupaye", "mala", "sang",
      "bhav", "karaycha", "karaychi", "karnar", "nakkich", "kitiye", "tumhi",
      "tumhala", "amhi", "madhe", "sobat", "aani", "pahije", "hava", "nahi", "ho"
    ];

    const words = text.toLowerCase().split(/\s+/);
    let marathiMatches = 0;
    words.forEach(w => {
      if (marathiKeywords.includes(w)) marathiMatches++;
    });

    if (marathiMatches >= 1) {
      state.activeLanguage = "marathi";
    } else {
      state.activeLanguage = "hinglish";
    }

    // Update Language Badge in UI
    const badge = document.getElementById("voiceLangBadge");
    if (badge) {
      badge.textContent = state.activeLanguage === "marathi" ? "मराठी (Marathi)" : "Hinglish / Hindi";
    }
  }

  // Speech Recognition with Hands-free 2-Way Turn-Taking
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = state.activeLanguage === "marathi" ? "mr-IN" : "hi-IN";

    rec.onstart = () => {
      state.isListening = true;
      updateVisualizer("listening", state.activeLanguage === "marathi" ? "मी ऐकतेय... बोला (Listening...)" : "Listening... Shreya is hearing you");
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        handleUserInput(transcript.trim());
      }
    };

    rec.onerror = (event) => {
      console.warn("Speech recognition notice:", event.error);
      state.isListening = false;
      if (!state.isSpeaking) {
        updateVisualizer("idle", "Tap microphone to speak to Shreya");
      }
    };

    rec.onend = () => {
      state.isListening = false;
      // If we are in active 2-way conversation and Shreya is not speaking, reopen mic after short pause
      if (state.continuousConversation && !state.isSpeaking) {
        setTimeout(() => {
          if (state.continuousConversation && !state.isSpeaking && !state.isListening) {
            try { rec.start(); } catch (e) {}
          }
        }, 350);
      } else if (!state.isSpeaking) {
        updateVisualizer("idle", "Tap microphone to speak to Shreya");
      }
    };

    return rec;
  }

  // Interruption: Cut Shreya off immediately
  function interruptShreya() {
    if (state.synth) {
      state.synth.cancel();
    }
    state.isSpeaking = false;
  }

  // Speak aloud with Maharashtra Girl Voice Inflection & 2-Way Turn Handoff
  function speakText(text, onComplete) {
    if (!state.synth) {
      if (onComplete) onComplete();
      return;
    }

    interruptShreya(); // Stop any leftover speech

    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/₹/g, state.activeLanguage === "marathi" ? "rupaye " : "rupees ")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (state.selectedVoice) {
      utterance.voice = state.selectedVoice;
    }
    // Young Maharashtra girl voice parameters: natural pitch and warm tempo
    utterance.rate = 0.96;
    utterance.pitch = 1.14;

    utterance.onstart = () => {
      state.isSpeaking = true;
      updateVisualizer("speaking", "Shreya is speaking... (Tap orb to interrupt)");
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      updateVisualizer("idle", "Your turn to speak...");

      // 2-WAY HANDS-FREE LOOP: Automatically listen after Shreya finishes!
      if (state.continuousConversation) {
        setTimeout(() => {
          if (state.continuousConversation && !state.isSpeaking && !state.isListening) {
            startListening();
          }
        }, 400);
      }

      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      state.isSpeaking = false;
      updateVisualizer("idle", "Tap microphone to speak");
      if (onComplete) onComplete();
    };

    state.synth.speak(utterance);
  }

  function updateVisualizer(mode, statusText) {
    const orb = document.getElementById("voiceOrbBtn");
    const status = document.getElementById("voiceStatusText");
    if (status && statusText) status.textContent = statusText;
    if (!orb) return;

    orb.classList.remove("listening", "speaking");
    if (mode === "listening") orb.classList.add("listening");
    if (mode === "speaking") orb.classList.add("speaking");
  }

  function startListening() {
    if (!state.recognition) {
      state.recognition = initSpeechRecognition();
    }
    if (!state.recognition) return;

    // Adjust speech recognition language dynamically
    state.recognition.lang = state.activeLanguage === "marathi" ? "mr-IN" : "hi-IN";

    try {
      state.recognition.start();
    } catch (e) {
      try {
        state.recognition.stop();
        setTimeout(() => state.recognition.start(), 200);
      } catch (err) {}
    }
  }

  function toggleMicrophone() {
    state.continuousConversation = true; // activate 2-way natural conversation loop

    // If Shreya is currently talking, user tapping the mic means INTERRUPT!
    if (state.isSpeaking) {
      interruptShreya();
      updateVisualizer("idle", "Interrupted. Listening to you...");
      setTimeout(() => startListening(), 250);
      return;
    }

    if (state.isListening) {
      try { state.recognition.stop(); } catch (e) {}
      state.isListening = false;
      state.continuousConversation = false;
      updateVisualizer("idle", "Paused. Tap microphone to speak");
    } else {
      startListening();
    }
  }

  // Save Booking to Supabase
  async function saveBookingToSupabase(data) {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      return { success: false, error: "Supabase not configured" };
    }

    try {
      const endpoint = `${config.supabaseUrl}/rest/v1/appointment_requests`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": config.supabaseAnonKey,
          "Authorization": `Bearer ${config.supabaseAnonKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          customer_name: data.name || "Customer",
          customer_phone: data.phone || "Not specified",
          requested_service: data.service || "Salon Appointment",
          preferred_date: data.date || new Date().toISOString().split("T")[0],
          preferred_time: data.time || "11:00 AM",
          customer_message: `Booked via Shreya (AI Voice) in ${state.activeLanguage.toUpperCase()}`,
          status: "pending_confirmation"
        })
      });

      return { success: res.ok };
    } catch (err) {
      console.error("Supabase booking error:", err);
      return { success: false, error: err.message };
    }
  }

  // Shreya Conversational Intelligence (Marathi & Hinglish Dual Engine)
  async function processShreyaResponse(userText) {
    const raw = userText.trim();
    const query = raw.toLowerCase();

    // 1. Detect Language
    detectLanguage(userText);
    const isMarathi = state.activeLanguage === "marathi";

    // 2. Add-on "No" handling (Graceful, never pushy)
    if (state.askedAddon && /^(no|nah|nahi|nhi|nako|nako aahe|not now|no thanks|bas yahi)/i.test(query)) {
      state.askedAddon = false;
      return {
        reply: isMarathi
          ? "Theek aahe, kaahi harakat nahi! Aapan booking karun gheu ya? Krupaya tumche shubh nav aani mobile number sanga."
          : "Alright, no problem! Should we proceed with your booking? Please share your name and mobile number."
      };
    }

    // 3. Extract Phone Number
    const phoneMatch = query.match(/(?:\+91|91|0)?[6-9]\d{9}/);
    if (phoneMatch) {
      state.bookingDraft.phone = phoneMatch[0];
    }

    // 4. Extract Name
    const nameMatch = raw.match(/(?:my name is|i am|mera naam|majha nav|naav)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      state.bookingDraft.name = nameMatch[1];
    } else if (state.bookingDraft.service && !state.bookingDraft.name && !phoneMatch && raw.split(" ").length <= 3 && !/book|price|cost|kya|kay|hai/i.test(query)) {
      state.bookingDraft.name = raw;
    }

    // 5. If Name & Phone are ready -> Save booking in Supabase!
    if (state.bookingDraft.phone && (state.bookingDraft.name || state.bookingDraft.service)) {
      const bookedService = state.bookingDraft.service || "Salon Appointment";
      const customerName = state.bookingDraft.name || (isMarathi ? "Graahak" : "Customer");
      const customerPhone = state.bookingDraft.phone;

      const result = await saveBookingToSupabase({
        name: customerName,
        phone: customerPhone,
        service: bookedService
      });

      state.bookingDraft = { name: "", phone: "", service: "", date: "", time: "" };
      state.askedAddon = false;

      if (result.success) {
        return {
          reply: isMarathi
            ? `Dhanyavaad ${customerName}! Tumchi ${bookedService} sathi appointment request aamchya system madhe nondavli aahe. Amruta tai lagetch ${customerPhone} var slot confirm kartil!`
            : `Thank you ${customerName}! Your appointment request for ${bookedService} has been noted in our system. Amruta will verify availability and confirm with you on ${customerPhone} shortly!`,
          isConfirmedBooking: true
        };
      } else {
        return {
          reply: isMarathi
            ? `Dhanyavaad ${customerName}! Krupaya direct Amruta Makeover la 7387268299 ya number var call karun slot confirm kara.`
            : `Thank you ${customerName}! Please call Amruta Makeover directly at 7387268299 to confirm your slot right away.`
        };
      }
    }

    // 6. Offers Query Rule
    if (/offer|discount|deal|package offer|scheme|savalat/i.test(query)) {
      return {
        reply: isMarathi
          ? "Offers sathi tumhi direct Amruta tai na 7387268299 ya number var samparka kara. Tumhala konti service karaychi aahe?"
          : "For offers you need to contact Amruta directly on 7387268299. Would you like to check our popular services like HydraFacial, Haircut, or Bridal packages?"
      };
    }

    // 7. Rate Card on WhatsApp
    if (/whatsapp|rate card|pdf|list bhej|send price|suchi/i.test(query)) {
      return {
        reply: isMarathi
          ? "Aap Amruta Makeover la seven three eight seven two six eight two nine nine var contact karu shakta for the rate card."
          : "Aap Amruta Makeover ko seven three eight seven two six eight two nine nine par contact kar sakte hain for the rate card."
      };
    }

    // 8. Front / Back Waxing Rule (Never guess 300 R400)
    if (/\bfront\b/i.test(query) && /wax/i.test(query)) {
      return {
        reply: isMarathi
          ? "Front waxing sathi, mi Amruta tai kadun confirm karun sangte. Tumhala arms ki legs chi waxing pahije?"
          : "For front waxing, I will ask Amruta to confirm the exact price for you before quoting. Would you like to check other waxing services like arms or legs?"
      };
    }
    if (/\bback\b/i.test(query) && /wax/i.test(query)) {
      return {
        reply: isMarathi
          ? "Back waxing sathi, mi Amruta tai kadun confirm karun sangte. Tumhala itar services baghaychya aahet ka?"
          : "For back waxing, I will ask Amruta to confirm the exact price for you before quoting. Would you like to check other waxing services?"
      };
    }

    // 9. Hair Spa Queries
    if (/hair spa|spa/i.test(query) && !/protein/i.test(query) && !/botox/i.test(query)) {
      state.bookingDraft.service = "Hair Spa";
      state.askedAddon = true;
      return {
        reply: isMarathi
          ? "Hair spa aath-she pannas rupaye pasun start hoto. Tumhala normal hair spa hava aahe ki protein hair spa? Aani sobat eyebrow threading pan karaychi aahe ka?"
          : "Hair spa starts at eight hundred fifty rupees. Aapko normal hair spa chahiye ya protein hair spa? Aur saath me quick eyebrow threading bhi add karni hai?"
      };
    }
    if (/protein hair spa|protein spa/i.test(query)) {
      state.bookingDraft.service = "Protein Hair Spa";
      return {
        reply: isMarathi
          ? "Protein hair spa starts at fifteen hundred rupees. Booking karun gheu ya ka?"
          : "Protein hair spa starts at fifteen hundred rupees. Would you like to book an appointment for this?"
      };
    }
    if (/botox/i.test(query)) {
      state.bookingDraft.service = "Botox Treatment";
      return {
        reply: isMarathi
          ? "Botox Treatment starts at twenty-eight hundred rupees. Tumhala kadhi appointment havi aahe?"
          : "Botox Treatment starts at twenty-eight hundred rupees. When would you like to schedule your session?"
      };
    }
    if (/deep conditioning/i.test(query)) {
      state.bookingDraft.service = "Deep Conditioning Treatment";
      return {
        reply: isMarathi
          ? "Deep Conditioning Treatment six hundred rupees aahe. Slot book karaycha ka?"
          : "Deep Conditioning Treatment is six hundred rupees. Would you like to book a slot?"
      };
    }
    if (/hade massage|head massage/i.test(query)) {
      state.bookingDraft.service = "Head Massage";
      return {
        reply: isMarathi
          ? "Head massage five hundred rupees aahe. Kadhi yetayt?"
          : "Head massage is five hundred rupees. Would you like to schedule your appointment?"
      };
    }
    if (/hair colou?r/i.test(query)) {
      state.bookingDraft.service = "Hair Colour";
      return {
        reply: isMarathi
          ? "Hair colour starts at eight hundred fifty rupees. Konta shade baghaycha aahe?"
          : "Hair colour starts at eight hundred fifty rupees. Which shade or style are you looking for?"
      };
    }

    // 10. Haircut & Styling Queries
    if (/haircut.*wash.*blow dry|wash.*blow dry.*haircut/i.test(query)) {
      state.bookingDraft.service = "Haircut Wash & Blow Dry";
      return {
        reply: isMarathi
          ? "Haircut, wash aani blow dry ekatra five hundred rupees aahe. Appointment book karu ka?"
          : "Haircut, wash aur blow dry together five hundred rupees hai. Would you like to book a slot?"
      };
    }
    if (/wash.*blow dry|blow dry.*wash/i.test(query)) {
      state.bookingDraft.service = "Wash & Blow Dry";
      return {
        reply: isMarathi
          ? "Wash aani Blow Dry three hundred fifty rupees aahe. Slot pahije ka?"
          : "Wash and Blow Dry is three hundred fifty rupees. Would you like to schedule an appointment?"
      };
    }
    if (/\bblow dry\b/i.test(query)) {
      state.bookingDraft.service = "Blow Dry";
      return {
        reply: isMarathi
          ? "Blow dry three hundred rupees aahe. Kadhi yetayt?"
          : "Blow dry is three hundred rupees. When would you like to visit?"
      };
    }
    if (/women'?s? haircut|haircut & style|haircut and style/i.test(query)) {
      state.bookingDraft.service = "Women's Haircut & Style";
      state.askedAddon = true;
      return {
        reply: isMarathi
          ? "Women's Haircut and Style four hundred rupees aahe. Sobat eyebrow threading kinva manicure pan karaychi aahe ka?"
          : "Women's Haircut and Style four hundred rupees hai. Saath me eyebrow threading ya manicure bhi add karein?"
      };
    }
    if (/kids? haircut/i.test(query)) {
      state.bookingDraft.service = "Kids Haircut";
      return {
        reply: isMarathi
          ? "Barah varshaanchya aatlya lahan mulansathi haircut two hundred rupees aahe."
          : "Kids Haircut for children under twelve is two hundred rupees. When would you like to bring your child?"
      };
    }
    if (/haircut|hair cut/i.test(query)) {
      state.bookingDraft.service = "Haircut";
      state.askedAddon = true;
      return {
        reply: isMarathi
          ? "Only Haircut two hundred fifty rupees aahe, aani Women's Haircut and Style four hundred rupees aahe. Sobat quick eyebrow threading karaychi ka?"
          : "Only Haircut two hundred fifty rupees hai, and Women's Haircut and Style four hundred rupees hai. Saath me quick eyebrow threading fifty rupees me add karni hai?"
      };
    }

    // 11. Threading Queries
    if (/eyebrows?|eye brow/i.test(query)) {
      state.bookingDraft.service = "Eyebrows Threading";
      return {
        reply: isMarathi
          ? "Eyebrows threading pannas (fifty) rupees aahe. Upper lip kinva forehead pan sobat karayche aahe ka?"
          : "Eyebrows threading fifty rupees hai. Aapko upper lip ya forehead bhi saath me karwana hai?"
      };
    }
    if (/upper ?lips?/i.test(query)) {
      return {
        reply: isMarathi
          ? "Upper lip threading twenty rupees aahe, aani peel off upper lip wax seventy rupees aahe."
          : "Upper lip threading twenty rupees hai, aur peel off upper lip wax seventy rupees hai. Aapko kaunsa option chahiye?"
      };
    }
    if (/forehead|forehade/i.test(query)) {
      return {
        reply: isMarathi
          ? "Forehead threading thirty rupees aahe, aani forehead waxing one hundred rupees aahe."
          : "Forehead threading thirty rupees hai, aur forehead waxing one hundred rupees hai. Which one would you prefer?"
      };
    }
    if (/chin/i.test(query)) {
      return {
        reply: isMarathi
          ? "Chin threading twenty rupees aahe, aani chin waxing eighty rupees aahe."
          : "Chin threading twenty rupees hai, aur chin waxing eighty rupees hai."
      };
    }
    if (/threading|thread/i.test(query)) {
      return {
        reply: isMarathi
          ? "Eyebrows fifty rupees, Upper lip twenty, Forehead thirty, aani Full Face threading three hundred rupees aahe. Konti karaychi aahe?"
          : "Eyebrows is fifty rupees, Upper lip is twenty, Forehead is thirty, Chin is twenty, and Full Face is three hundred rupees. Which one would you like?"
      };
    }

    // 12. Waxing Queries (Duplicate handling: Half Leg & Underarms)
    if (/half leg/i.test(query)) {
      return {
        reply: isMarathi
          ? "Half leg waxing madhe Classic half leg three hundred fifty rupees aahe, aani Rica half leg four hundred rupees aahe. Tumhala Classic pahije ki Rica wax?"
          : "Half leg waxing me Classic half leg three hundred fifty rupees hai, aur Rica half leg four hundred rupees hai. Aapko Classic chahiye ya Rica wax?"
      };
    }
    if (/underarm|under arm|\bua\b/i.test(query)) {
      return {
        reply: isMarathi
          ? "Underarms waxing madhe Classic UA one hundred rupees aahe, aani Rica UA one hundred fifty rupees aahe. Konta option pahije?"
          : "Underarms waxing me Classic UA one hundred rupees hai, aur Rica UA one hundred fifty rupees hai. Which one would you like?"
      };
    }
    if (/bikini wax|bikini/i.test(query)) {
      state.bookingDraft.service = "Bikini Wax";
      return {
        reply: isMarathi
          ? "Bikini waxing fifteen hundred rupees aahe. Slot book karaycha aahe ka?"
          : "Bikini waxing fifteen hundred rupees hai. Would you like to schedule an appointment?"
      };
    }
    if (/rica.*arms|rica.*leg|rica full/i.test(query)) {
      state.bookingDraft.service = "Rica Full Arms + Leg + UA";
      return {
        reply: isMarathi
          ? "Rica full arms plus leg plus underarms eleven hundred rupees aahe. Rica hand three fifty aani Rica leg seven hundred rupees aahe."
          : "Rica full arms plus leg plus underarms eleven hundred rupees hai. Rica hand three fifty aur Rica leg seven hundred rupees hai."
      };
    }
    if (/full arms|full body wax|arms.*leg/i.test(query)) {
      state.bookingDraft.service = "Full Arms + Leg + UA";
      return {
        reply: isMarathi
          ? "Classic full arms plus leg plus underarms seven hundred rupees aahe, aani Rica wax madhe eleven hundred rupees aahe. Booking karu ka?"
          : "Classic full arms plus leg plus underarms seven hundred rupees hai, aur Rica wax me eleven hundred rupees hai. Would you like to book this?"
      };
    }
    if (/classic wax|wax hand|classic leg/i.test(query)) {
      return {
        reply: isMarathi
          ? "Classic wax hand two hundred fifty rupees aahe, aani Classic full leg four hundred seventy-five rupees aahe."
          : "Classic wax hand two hundred fifty rupees hai, aur Classic full leg four hundred seventy-five rupees hai."
      };
    }
    if (/wax|waxing/i.test(query)) {
      return {
        reply: isMarathi
          ? "Aamchya kade Classic aani Rica wax available aahe. Hand wax two fifty, Leg wax four seventy-five. Konta area karaycha aahe?"
          : "We offer both Classic and Rica wax for hands, legs, full arms, face, and bikini. Classic hand is two fifty, Classic leg is four seventy-five. Kaunsa area aap karwana chahte hain?"
      };
    }

    // 13. HydraFacial Queries
    if (/hydra|hydrafacial/i.test(query)) {
      state.bookingDraft.service = "HydraFacial";
      state.askedAddon = true;
      return {
        reply: isMarathi
          ? "Classic Hydra fifteen hundred rupees aahe, Golden Hydra sixteen fifty, aani Korean Hydra three thousand rupees aahe. Party Glow aani Youth Hydra eighteen fifty aahe. Konta option pahije?"
          : "Classic Hydra fifteen hundred rupees hai, Golden Hydra sixteen fifty, aur Korean Hydra three thousand rupees hai. We also have Party Glow and Youth Hydra at eighteen fifty. Aapko kaunsa option jaana hai?"
      };
    }

    // 14. Facial & Skincare Queries
    if (/gold facial/i.test(query)) {
      state.bookingDraft.service = "Gold Facial";
      return {
        reply: isMarathi
          ? "Gold facial one thousand fifty rupees aahe. Appointment book karaychi ka?"
          : "Gold facial one thousand fifty rupees hai. Would you like to schedule an appointment?"
      };
    }
    if (/korean facial/i.test(query)) {
      state.bookingDraft.service = "Korean Facial";
      return {
        reply: isMarathi
          ? "Korean facial twenty-five hundred rupees aahe. Glass skin facial sathi slot book karu ka?"
          : "Korean facial twenty-five hundred rupees hai. Would you like to book a slot for glass skin facial?"
      };
    }
    if (/whitening facial/i.test(query)) {
      state.bookingDraft.service = "Whitening Facial";
      return {
        reply: isMarathi
          ? "Whitening facial thirteen hundred fifty rupees aahe."
          : "Whitening facial thirteen hundred fifty rupees hai."
      };
    }
    if (/party glow facial|party glow/i.test(query)) {
      state.bookingDraft.service = "Party Glow Facial";
      return {
        reply: isMarathi
          ? "Party glow facial fourteen hundred fifty rupees aahe, aani Party Glow Hydra eighteen fifty aahe. Konta karaycha aahe?"
          : "Party glow facial fourteen hundred fifty rupees hai. And Party Glow Hydra is eighteen fifty. Which one would you prefer?"
      };
    }
    if (/clean up|cleanup/i.test(query)) {
      state.bookingDraft.service = "Clean Up";
      return {
        reply: isMarathi
          ? "Clean up four hundred rupees, Whitening clean up seven fifty, aani Detan clean up eight fifty rupees aahe."
          : "Basic clean up four hundred rupees hai, Whitening clean up seven fifty, aur Detan clean up eight fifty rupees hai."
      };
    }
    if (/facial/i.test(query)) {
      return {
        reply: isMarathi
          ? "Aamche facials Classic facial eight hundred fifty pasun start hotat, Gold facial ten fifty, aani Korean facial twenty-five hundred rupees aahe. Konta facial hava aahe?"
          : "Our facials start with Classic facial at eight hundred fifty rupees, Gold facial at ten fifty, and Korean facial at twenty-five hundred rupees. Which one are you looking for?"
      };
    }

    // 15. Bridal Makeup Queries
    if (/bridal|bride|wedding|marriage|nauvari|gown|lagn/i.test(query)) {
      state.bookingDraft.service = "Bridal Makeup";
      return {
        reply: isMarathi
          ? "Amruta tai na 12 varshancha bridal cha anubhav aahe! Maharashtrian Nauvari bride, Christian gown makeup, HD aani Airbrush look aamhi karto. Wedding date aani customized packages sathi 7387268299 var call kara. Tumchi lagnaachi date kay aahe?"
          : "Amruta has 12 years of specialized bridal expertise! We provide customized Maharashtrian Nauvari Bridal Makeup, Christian Gown Bridal Makeup, HD and Airbrush bridal looks, and family makeup packages. For bridal dates and customized quotes, please contact Amruta at 7387268299. What is your wedding date?"
      };
    }

    // 16. Location & Timings
    if (/address|location|kaha|kuthe|where|pune/i.test(query)) {
      return {
        reply: isMarathi
          ? "Amruta Makeover cha address: Heaven park lane no 1, Mountain High Restaurant javal, Jarande Nagar, Mohammed Wadi, Pune. Tumhala direct contact number deu ka?"
          : "Amruta Makeover is located at Heaven park lane no 1, near Mountain High Restaurant and Bar, Jarande Nagar, Mohammed Wadi, Pune. Would you like our contact number?"
      };
    }
    if (/time|timing|vel|hours|kab open/i.test(query)) {
      return {
        reply: isMarathi
          ? "Aamhi Monday te Sunday prior appointment ne open asto, pratyek client la personal time milava mhanun."
          : "We operate Monday to Sunday by prior appointment to ensure dedicated personal attention for every client."
      };
    }
    if (/contact|phone|number|call|samparka/i.test(query)) {
      return {
        reply: isMarathi
          ? "Tumhi Amruta Makeover Beauty Salon la direct 7387268299 ya number var call karu shakta. Mi ithech tumchi booking karu ka?"
          : "You can reach Amruta Makeover Beauty Salon directly at 7387268299. Would you like me to book an appointment for you right now?"
      };
    }

    // 17. Booking Intent Trigger
    if (/book|appointment|slot|reserve|aana hai|karaycha aahe|booking/i.test(query)) {
      return {
        reply: isMarathi
          ? "Nakkich! Tumhala konti service karaychi aahe, aani kontya divashi kiti vajta appointment havi aahe?"
          : "I would be happy to help you book! Which service would you like to schedule, and what is your preferred date or time?"
      };
    }

    // Default Greeting
    return {
      reply: isMarathi
        ? "Namaste! Mi Shreya, Amruta Makeover Beauty Salon chi receptionist. Mi tumchi kay madat karu shakte? Tumhi haircut, hair spa, waxing, HydraFacials kinva appointment sathi vicharu shakta."
        : "Hello! I am Shreya, receptionist at Amruta Makeover Beauty Salon. How may I assist you today? You can ask me about our haircut, hair spa, waxing, HydraFacials, bridal makeup, or book an appointment."
    };
  }

  // Append Message to UI Transcript
  function appendMessage(sender, text, isConfirmedBooking) {
    const transcript = document.getElementById("voiceTranscriptBody");
    if (!transcript) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `voice-msg ${sender}`;
    msgDiv.textContent = text;

    if (isConfirmedBooking) {
      const card = document.createElement("div");
      card.className = "voice-msg-booking-card";
      card.innerHTML = `
        <strong>✨ Appointment Recorded with Shreya</strong><br>
        <span style="color:#D4AF37;">Amruta will verify availability and confirm with you shortly.</span><br>
        <a href="https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hi Amruta, I just requested an appointment with Shreya on your website!')}" target="_blank" rel="noopener">Notify Amruta on WhatsApp &rarr;</a>
      `;
      msgDiv.appendChild(card);
    }

    transcript.appendChild(msgDiv);
    transcript.scrollTop = transcript.scrollHeight;
  }

  // Handle User Input (Voice or Text)
  async function handleUserInput(text) {
    if (!text || !text.trim()) return;

    interruptShreya(); // Stop Shreya if she was still talking

    appendMessage("user", text.trim());
    updateVisualizer("thinking", "Shreya is thinking...");

    try {
      const response = await processShreyaResponse(text.trim());
      appendMessage("ai", response.reply, response.isConfirmedBooking);
      speakText(response.reply);
    } catch (err) {
      console.error("Shreya processing error:", err);
      const fallback = state.activeLanguage === "marathi"
        ? "Tumhi Amruta Makeover la 7387268299 ya number var call karu shakta!"
        : "You can contact Amruta Makeover directly at 7387268299 for instant assistance!";
      appendMessage("ai", fallback);
      speakText(fallback);
    }
  }

  // Open / Close Voice Assistant Modal
  function openVoiceModal() {
    const modal = document.getElementById("voiceModalBackdrop");
    if (!modal) return;
    modal.classList.add("active");
    modal.style.display = "flex";

    state.continuousConversation = true;

    if (document.querySelectorAll("#voiceTranscriptBody .voice-msg").length === 0) {
      const welcome = "Namaste! I am Shreya, receptionist at Amruta Makeover Beauty Salon. How may I assist you today? Aapan Marathi kinva Hinglish madhe bolu shakta.";
      appendMessage("ai", welcome);
      speakText(welcome);
    }
  }

  function closeVoiceModal() {
    const modal = document.getElementById("voiceModalBackdrop");
    if (!modal) return;
    modal.classList.remove("active");
    setTimeout(() => { modal.style.display = "none"; }, 300);
    state.continuousConversation = false;
    interruptShreya();
    if (state.recognition && state.isListening) state.recognition.stop();
    state.isSpeaking = false;
    state.isListening = false;
  }

  // Bind UI Events
  function init() {
    initVoices();

    const triggerBtn = document.getElementById("floatingVoiceTrigger");
    const closeBtn = document.getElementById("voiceModalCloseBtn");
    const backdrop = document.getElementById("voiceModalBackdrop");
    const orbBtn = document.getElementById("voiceOrbBtn");
    const textInput = document.getElementById("voiceTextInput");
    const sendBtn = document.getElementById("voiceSendBtn");

    if (triggerBtn) triggerBtn.addEventListener("click", openVoiceModal);
    if (closeBtn) closeBtn.addEventListener("click", closeVoiceModal);
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeVoiceModal();
      });
    }

    if (orbBtn) orbBtn.addEventListener("click", toggleMicrophone);

    if (sendBtn && textInput) {
      const send = () => {
        const val = textInput.value;
        if (val && val.trim()) {
          handleUserInput(val.trim());
          textInput.value = "";
        }
      };
      sendBtn.addEventListener("click", send);
      textInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") send();
      });
    }

    document.querySelectorAll(".voice-quick-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const text = pill.getAttribute("data-query") || pill.textContent;
        handleUserInput(text);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.__openAmrutaVoiceAssistant = openVoiceModal;
})();
