/**
 * Amruta Makeover Beauty Salon - AI Voice Receptionist: Shreya
 * Warm, friendly, natural conversational Indian English/Hinglish receptionist.
 * Strict rate card matching, gentle add-on suggestions, and Supabase booking integration.
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

  // Initialize Speech Synthesis Voices
  function initVoices() {
    if (!state.synth) return;
    const load = () => {
      const voices = state.synth.getVoices();
      // Prioritize natural Indian English female voices or pleasant conversational voices
      state.selectedVoice =
        voices.find(v => v.lang.includes("en-IN") || v.name.includes("India") || v.name.includes("Heera") || v.name.includes("Neerja")) ||
        voices.find(v => v.lang.includes("hi-IN") || v.name.includes("Hindi")) ||
        voices.find(v => v.name.includes("Google UK English Female") || v.name.includes("Samantha")) ||
        voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.lang.startsWith("en")) ||
        voices[0] || null;
    };
    load();
    if (state.synth.onvoiceschanged !== undefined) {
      state.synth.onvoiceschanged = load;
    }
  }

  // Initialize Speech Recognition
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";

    rec.onstart = () => {
      state.isListening = true;
      updateVisualizer("listening", "Listening... Speak naturally to Shreya");
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
      if (event.error === "not-allowed") {
        updateVisualizer("idle", "Microphone blocked. You can type below!");
      } else {
        updateVisualizer("idle", "Tap microphone to speak to Shreya");
      }
    };

    rec.onend = () => {
      state.isListening = false;
      if (!state.isSpeaking) {
        updateVisualizer("idle", "Tap microphone to speak to Shreya");
      }
    };

    return rec;
  }

  // Speak aloud with natural pauses
  function speakText(text, onComplete) {
    if (!state.synth) {
      if (onComplete) onComplete();
      return;
    }

    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/₹/g, "Rupees ")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    state.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (state.selectedVoice) {
      utterance.voice = state.selectedVoice;
    }
    utterance.rate = 0.98; // Natural, conversational speed
    utterance.pitch = 1.05; // Friendly, warm tone

    utterance.onstart = () => {
      state.isSpeaking = true;
      updateVisualizer("speaking", "Shreya is speaking...");
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      updateVisualizer("idle", "Tap microphone to reply");
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

  function toggleMicrophone() {
    if (state.isSpeaking && state.synth) {
      state.synth.cancel();
      state.isSpeaking = false;
      updateVisualizer("idle", "Tap microphone to speak");
      return;
    }

    if (!state.recognition) {
      state.recognition = initSpeechRecognition();
    }

    if (!state.recognition) {
      alert("Microphone recognition is not supported in this browser. Please use the text input below!");
      return;
    }

    if (state.isListening) {
      try { state.recognition.stop(); } catch (e) {}
      state.isListening = false;
      updateVisualizer("idle", "Tap microphone to speak to Shreya");
    } else {
      try {
        state.recognition.start();
      } catch (e) {
        state.recognition.stop();
        setTimeout(() => state.recognition.start(), 200);
      }
    }
  }

  // Save Booking to Supabase appointment_requests
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
          requested_service: data.service || "Appointment Enquiry",
          preferred_date: data.date || new Date().toISOString().split("T")[0],
          preferred_time: data.time || "11:00 AM",
          customer_message: "Booked via Shreya (AI Voice Receptionist)",
          status: "pending_confirmation"
        })
      });

      return { success: res.ok };
    } catch (err) {
      console.error("Supabase booking error:", err);
      return { success: false, error: err.message };
    }
  }

  // Shreya's Knowledge & Conversational Processing Engine
  async function processShreyaResponse(userText) {
    const raw = userText.trim();
    const query = raw.toLowerCase();

    // Check for negative reply to add-on suggestion
    if (state.askedAddon && /^(no|nah|nahi|nhi|not now|no thanks|cancel|bas yahi)/i.test(query)) {
      state.askedAddon = false;
      return {
        reply: "Alright, no problem! Should we proceed with your booking? Please share your name and mobile number."
      };
    }

    // Check for phone number in user input
    const phoneMatch = query.match(/(?:\+91|91|0)?[6-9]\d{9}/);
    if (phoneMatch) {
      state.bookingDraft.phone = phoneMatch[0];
    }

    // Check for name in user input
    const nameMatch = raw.match(/(?:my name is|i am|mera naam|naam)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      state.bookingDraft.name = nameMatch[1];
    } else if (state.bookingDraft.service && !state.bookingDraft.name && !phoneMatch && raw.split(" ").length <= 3 && !/book|price|cost|kya|hai/i.test(query)) {
      // Short text likely a name
      state.bookingDraft.name = raw;
    }

    // If both name and phone are collected, register booking!
    if (state.bookingDraft.phone && (state.bookingDraft.name || state.bookingDraft.service)) {
      const bookedService = state.bookingDraft.service || "Salon Appointment";
      const customerName = state.bookingDraft.name || "Valued Client";
      const customerPhone = state.bookingDraft.phone;

      const result = await saveBookingToSupabase({
        name: customerName,
        phone: customerPhone,
        service: bookedService
      });

      // Reset draft
      state.bookingDraft = { name: "", phone: "", service: "", date: "", time: "" };
      state.askedAddon = false;

      if (result.success) {
        return {
          reply: `Thank you ${customerName}! Your appointment request for ${bookedService} has been noted in our system. Amruta will verify availability and confirm with you on ${customerPhone} shortly!`,
          isConfirmedBooking: true
        };
      } else {
        return {
          reply: `Thank you ${customerName}! Please call Amruta Makeover Beauty Salon directly at 7387268299 to confirm your slot right away.`
        };
      }
    }

    // 1. Offers Query
    if (/offer|discount|deal|package offer|scheme/i.test(query)) {
      return {
        reply: "For offers you need to contact Amruta directly on 7387268299. Would you like to check our popular services like HydraFacial, Haircut, or Bridal packages?"
      };
    }

    // 2. WhatsApp Rate Card Query
    if (/whatsapp|rate card|pdf|list bhej|send price/i.test(query)) {
      return {
        reply: "Aap Amruta Makeover ko seven three eight seven two six eight two nine nine par contact kar sakte hain for the rate card."
      };
    }

    // 3. Front / Back Waxing Queries (Strict rule: do not guess 300 R400)
    if (/\bfront\b/i.test(query) && /wax/i.test(query)) {
      return {
        reply: "For front waxing, I will ask Amruta to confirm the exact price for you before quoting. Would you like to check other waxing services like arms or legs?"
      };
    }
    if (/\bback\b/i.test(query) && /wax/i.test(query)) {
      return {
        reply: "For back waxing, I will ask Amruta to confirm the exact price for you before quoting. Would you like to check other waxing services?"
      };
    }

    // 4. Hair Spa Queries
    if (/hair spa|spa/i.test(query) && !/protein/i.test(query) && !/botox/i.test(query)) {
      state.bookingDraft.service = "Hair Spa";
      state.askedAddon = true;
      return {
        reply: "Hair spa starts at eight hundred fifty rupees. Aapko normal hair spa chahiye ya protein hair spa? And would you also like to add a quick eyebrow shaping at fifty rupees?"
      };
    }
    if (/protein hair spa|protein spa/i.test(query)) {
      state.bookingDraft.service = "Protein Hair Spa";
      return {
        reply: "Protein hair spa starts at fifteen hundred rupees. Would you like to book an appointment for this?"
      };
    }
    if (/botox/i.test(query)) {
      state.bookingDraft.service = "Botox Treatment";
      return {
        reply: "Botox Treatment starts at twenty-eight hundred rupees. When would you like to schedule your session?"
      };
    }
    if (/deep conditioning/i.test(query)) {
      state.bookingDraft.service = "Deep Conditioning Treatment";
      return {
        reply: "Deep Conditioning Treatment is six hundred rupees. Would you like to book a slot?"
      };
    }
    if (/hade massage|head massage/i.test(query)) {
      state.bookingDraft.service = "Head Massage";
      return {
        reply: "Head massage is five hundred rupees. Would you like to schedule your appointment?"
      };
    }
    if (/hair colou?r/i.test(query)) {
      state.bookingDraft.service = "Hair Colour";
      return {
        reply: "Hair colour starts at eight hundred fifty rupees. Which shade or style are you looking for?"
      };
    }

    // 5. Haircut & Styling Queries
    if (/haircut.*wash.*blow dry|wash.*blow dry.*haircut/i.test(query)) {
      state.bookingDraft.service = "Haircut Wash & Blow Dry";
      return {
        reply: "Haircut, wash aur blow dry together five hundred rupees hai. Would you like to book a slot?"
      };
    }
    if (/wash.*blow dry|blow dry.*wash/i.test(query)) {
      state.bookingDraft.service = "Wash & Blow Dry";
      return {
        reply: "Wash and Blow Dry is three hundred fifty rupees. Would you like to schedule an appointment?"
      };
    }
    if (/\bblow dry\b/i.test(query)) {
      state.bookingDraft.service = "Blow Dry";
      return {
        reply: "Blow dry is three hundred rupees. When would you like to visit?"
      };
    }
    if (/women'?s? haircut|haircut & style|haircut and style/i.test(query)) {
      state.bookingDraft.service = "Women's Haircut & Style";
      state.askedAddon = true;
      return {
        reply: "Women's Haircut and Style is four hundred rupees. Would you also like to add a quick eyebrow threading or manicure?"
      };
    }
    if (/kids? haircut/i.test(query)) {
      state.bookingDraft.service = "Kids Haircut";
      return {
        reply: "Kids Haircut for children under twelve is two hundred rupees. When would you like to bring your child?"
      };
    }
    if (/haircut|hair cut/i.test(query)) {
      state.bookingDraft.service = "Haircut";
      state.askedAddon = true;
      return {
        reply: "Only Haircut two hundred fifty rupees hai, and Women's Haircut and Style four hundred rupees hai. Would you also like to add a quick eyebrow threading at fifty rupees?"
      };
    }

    // 6. Threading Queries
    if (/eyebrows?|eye brow/i.test(query)) {
      state.bookingDraft.service = "Eyebrows Threading";
      return {
        reply: "Eyebrows threading fifty rupees hai. Aapko upper lip ya forehead bhi saath me karwana hai?"
      };
    }
    if (/upper ?lips?/i.test(query)) {
      return {
        reply: "Upper lip threading twenty rupees hai, aur peel off upper lip wax seventy rupees hai. Aapko kaunsa option chahiye?"
      };
    }
    if (/forehead|forehade/i.test(query)) {
      return {
        reply: "Forehead threading thirty rupees hai, aur forehead waxing one hundred rupees hai. Which one would you prefer?"
      };
    }
    if (/chin/i.test(query)) {
      return {
        reply: "Chin threading twenty rupees hai, aur chin waxing eighty rupees hai."
      };
    }
    if (/threading|thread/i.test(query)) {
      return {
        reply: "Eyebrows is fifty rupees, Upper lip is twenty rupees, Forehead is thirty rupees, Chin is twenty rupees, and Full Face threading is three hundred rupees. Which one would you like?"
      };
    }

    // 7. Waxing Queries
    if (/half leg/i.test(query)) {
      return {
        reply: "Half leg waxing me Classic half leg three hundred fifty rupees hai, aur Rica half leg four hundred rupees hai. Aapko Classic chahiye ya Rica wax?"
      };
    }
    if (/underarm|under arm|\bua\b/i.test(query)) {
      return {
        reply: "Underarms waxing me Classic UA one hundred rupees hai, aur Rica UA one hundred fifty rupees hai. Which one would you like?"
      };
    }
    if (/bikini wax|bikini/i.test(query)) {
      state.bookingDraft.service = "Bikini Wax";
      return {
        reply: "Bikini waxing fifteen hundred rupees hai. Would you like to schedule an appointment?"
      };
    }
    if (/rica.*arms|rica.*leg|rica full/i.test(query)) {
      state.bookingDraft.service = "Rica Full Arms + Leg + UA";
      return {
        reply: "Rica full arms plus leg plus underarms eleven hundred rupees hai. Rica hand three fifty aur Rica leg seven hundred rupees hai."
      };
    }
    if (/full arms|full body wax|arms.*leg/i.test(query)) {
      state.bookingDraft.service = "Full Arms + Leg + UA";
      return {
        reply: "Classic full arms plus leg plus underarms seven hundred rupees hai, aur Rica wax me eleven hundred rupees hai. Would you like to book this?"
      };
    }
    if (/classic wax|wax hand|classic leg/i.test(query)) {
      return {
        reply: "Classic wax hand two hundred fifty rupees hai, aur Classic full leg four hundred seventy-five rupees hai."
      };
    }
    if (/wax|waxing/i.test(query)) {
      return {
        reply: "We offer both Classic and Rica wax for hands, legs, full arms, face, and bikini. Classic hand is two fifty, Classic leg is four seventy-five. Kaunsa area aap karwana chahte hain?"
      };
    }

    // 8. HydraFacial Queries
    if (/hydra|hydrafacial/i.test(query)) {
      state.bookingDraft.service = "HydraFacial";
      state.askedAddon = true;
      return {
        reply: "Classic Hydra fifteen hundred rupees hai, Golden Hydra sixteen fifty, aur Korean Hydra three thousand rupees hai. We also have Party Glow and Youth Hydra at eighteen fifty. Aapko kaunsa option jaana hai?"
      };
    }

    // 9. Facial & Skincare Queries
    if (/gold facial/i.test(query)) {
      state.bookingDraft.service = "Gold Facial";
      return {
        reply: "Gold facial one thousand fifty rupees hai. Would you like to schedule an appointment?"
      };
    }
    if (/korean facial/i.test(query)) {
      state.bookingDraft.service = "Korean Facial";
      return {
        reply: "Korean facial twenty-five hundred rupees hai. Would you like to book a slot for glass skin facial?"
      };
    }
    if (/whitening facial/i.test(query)) {
      state.bookingDraft.service = "Whitening Facial";
      return {
        reply: "Whitening facial thirteen hundred fifty rupees hai."
      };
    }
    if (/party glow facial|party glow/i.test(query)) {
      state.bookingDraft.service = "Party Glow Facial";
      return {
        reply: "Party glow facial fourteen hundred fifty rupees hai. And Party Glow Hydra is eighteen fifty. Which one would you prefer?"
      };
    }
    if (/youth facial/i.test(query)) {
      state.bookingDraft.service = "Youth Facial";
      return {
        reply: "Youth facial fifteen hundred rupees hai."
      };
    }
    if (/detan facial/i.test(query)) {
      state.bookingDraft.service = "Detan Facial";
      return {
        reply: "Detan facial seventeen hundred rupees hai. Face detan starts at two fifty rupees."
      };
    }
    if (/fruit cleansing/i.test(query)) {
      state.bookingDraft.service = "Fruit Cleansing";
      return {
        reply: "Fruit cleansing five hundred fifty rupees hai."
      };
    }
    if (/whitening clenup|whitening clean/i.test(query)) {
      state.bookingDraft.service = "Whitening Cleanup";
      return {
        reply: "Whitening clean up seven hundred fifty rupees hai."
      };
    }
    if (/detan clean up|detan cleanup/i.test(query)) {
      state.bookingDraft.service = "Detan Cleanup";
      return {
        reply: "Detan clean up eight hundred fifty rupees hai."
      };
    }
    if (/clean up|cleanup/i.test(query)) {
      state.bookingDraft.service = "Clean Up";
      return {
        reply: "Basic clean up four hundred rupees hai, Whitening clean up seven fifty, aur Detan clean up eight fifty rupees hai."
      };
    }
    if (/facial/i.test(query)) {
      return {
        reply: "Our facials start with Classic facial at eight hundred fifty rupees, Gold facial at ten fifty, Whitening at thirteen fifty, and Korean facial at twenty-five hundred rupees. Which one are you looking for?"
      };
    }
    if (/face detan/i.test(query)) {
      return {
        reply: "Face detan is two hundred fifty rupees, and face bleach is three hundred fifty rupees."
      };
    }

    // 10. Bridal Makeup Queries
    if (/bridal|bride|wedding|marriage|nauvari|gown/i.test(query)) {
      state.bookingDraft.service = "Bridal Makeup";
      return {
        reply: "Amruta has 12 years of specialized bridal expertise! We provide customized Maharashtrian Nauvari Bridal Makeup, Christian Gown Bridal Makeup, HD and Airbrush bridal looks, and family makeup packages. For bridal dates and customized quotes, please contact Amruta at 7387268299. What is your wedding date?"
      };
    }

    // 11. Location & Timings
    if (/address|location|kaha|where|reach|map/i.test(query)) {
      return {
        reply: "Amruta Makeover is located at Heaven park lane no 1, near Mountain High Restaurant and Bar, Jarande Nagar, Mohammed Wadi, Pune. Would you like our contact number?"
      };
    }
    if (/time|timing|kab open|hours/i.test(query)) {
      return {
        reply: "We operate Monday to Sunday by prior appointment to ensure dedicated personal attention for every client."
      };
    }
    if (/contact|phone|number|call/i.test(query)) {
      return {
        reply: "You can reach Amruta Makeover Beauty Salon directly at 7387268299. Would you like me to book an appointment for you right now?"
      };
    }

    // 12. Booking Intent Trigger
    if (/book|appointment|schedule|slot|reserve|aana hai/i.test(query)) {
      return {
        reply: "I would be happy to help you book! Which service would you like to schedule, and what is your preferred date or time?"
      };
    }

    // Default Greeting & Assistance
    return {
      reply: "Hello! I am Shreya, receptionist at Amruta Makeover Beauty Salon. How may I assist you today? You can ask me about our haircut, hair spa, waxing, HydraFacials, bridal makeup, or book an appointment."
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

  // Handle User Input
  async function handleUserInput(text) {
    if (!text || !text.trim()) return;

    appendMessage("user", text.trim());
    updateVisualizer("thinking", "Shreya is thinking...");

    try {
      const response = await processShreyaResponse(text.trim());
      appendMessage("ai", response.reply, response.isConfirmedBooking);
      speakText(response.reply);
    } catch (err) {
      console.error("Shreya processing error:", err);
      const fallback = "You can contact Amruta Makeover directly at 7387268299 for instant assistance!";
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

    if (document.querySelectorAll("#voiceTranscriptBody .voice-msg").length === 0) {
      const welcome = "Hello! I am Shreya, receptionist at Amruta Makeover Beauty Salon. How may I assist you today? You can ask me about our hair services, HydraFacials, waxing, or booking an appointment.";
      appendMessage("ai", welcome);
      speakText(welcome);
    }
  }

  function closeVoiceModal() {
    const modal = document.getElementById("voiceModalBackdrop");
    if (!modal) return;
    modal.classList.remove("active");
    setTimeout(() => { modal.style.display = "none"; }, 300);
    if (state.synth) state.synth.cancel();
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
