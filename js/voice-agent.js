/**
 * Amruta Makeover - AI Voice Assistant Engine
 * Pure zero-cost browser voice AI with instant Supabase booking integration.
 */

(function () {
  "use strict";

  const config = window.AMRUTA_CONFIG || {
    brandName: "AMRUTA MAKEOVER",
    contactPhone: "+917387268299",
    whatsappNumber: "917387268299",
    businessAddress: "Heaven park lane no 1 Amruta Makeover near mountain high restaurant and bar, Jarande nagar Mohammed wadi Pune Maharashtra 411060",
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
    conversationHistory: [],
    bookingDraft: {
      name: "",
      phone: "",
      service: "",
      date: "",
      time: ""
    }
  };

  // Pre-load speech synthesis voices
  function initVoices() {
    if (!state.synth) return;
    const load = () => {
      const voices = state.synth.getVoices();
      // Prefer warm Indian English, Hindi, or natural female English voices
      state.selectedVoice =
        voices.find(v => v.lang.includes("en-IN") || v.name.includes("India")) ||
        voices.find(v => v.lang.includes("hi-IN") || v.name.includes("Hindi")) ||
        voices.find(v => v.name.includes("Google UK English Female") || v.name.includes("Samantha")) ||
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
      console.warn("Speech recognition not supported in this browser.");
      return null;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN"; // Supports Indian English, handles common Hindi/Marathi terms naturally

    rec.onstart = () => {
      state.isListening = true;
      updateVisualizer("listening", "Listening... Speak now");
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        handleUserInput(transcript.trim());
      }
    };

    rec.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      state.isListening = false;
      if (event.error === "not-allowed") {
        updateVisualizer("idle", "Microphone access blocked. You can type below!");
      } else {
        updateVisualizer("idle", "Tap microphone to speak");
      }
    };

    rec.onend = () => {
      state.isListening = false;
      if (!state.isSpeaking) {
        updateVisualizer("idle", "Tap microphone to speak");
      }
    };

    return rec;
  }

  // Speak Text Aloud
  function speakText(text, onComplete) {
    if (!state.synth) {
      if (onComplete) onComplete();
      return;
    }

    // Clean up markdown / symbols before reading
    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/₹/g, "Rupees ")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    state.synth.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (state.selectedVoice) {
      utterance.voice = state.selectedVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      state.isSpeaking = true;
      updateVisualizer("speaking", "Amruta AI is speaking...");
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

  // Update Visualizer UI
  function updateVisualizer(mode, statusText) {
    const orb = document.getElementById("voiceOrbBtn");
    const status = document.getElementById("voiceStatusText");
    if (status && statusText) status.textContent = statusText;
    if (!orb) return;

    orb.classList.remove("listening", "speaking");
    if (mode === "listening") orb.classList.add("listening");
    if (mode === "speaking") orb.classList.add("speaking");
  }

  // Toggle Microphone
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
      alert("Microphone speech recognition is not supported in this browser. Please use the text input below!");
      return;
    }

    if (state.isListening) {
      try { state.recognition.stop(); } catch (e) {}
      state.isListening = false;
      updateVisualizer("idle", "Tap microphone to speak");
    } else {
      try {
        state.recognition.start();
      } catch (e) {
        state.recognition.stop();
        setTimeout(() => state.recognition.start(), 200);
      }
    }
  }

  // Conversational AI Knowledge Engine
  async function generateAIResponse(userText) {
    const query = userText.toLowerCase();

    // 1. Direct Booking Detection
    const isBooking = /book|appointment|schedule|slot|reserve|tarikh|timing/i.test(query);

    // Extract potential contact info
    const phoneMatch = query.match(/(?:\+91|91|0)?[6-9]\d{9}/);
    if (phoneMatch) state.bookingDraft.phone = phoneMatch[0];

    // Check for specific service queries
    if (/hydra|hydrafacial/i.test(query)) {
      return {
        reply: "We offer 6 specialized HydraFacials: Classic Hydra at ₹1,500, Golden Hydra at ₹1,650, Whitening Hydra at ₹1,700, Party Glow & Youth Hydra at ₹1,850, and our premium Korean Hydra at ₹3,000. Would you like to book a session?",
        topic: "hydra"
      };
    }

    if (/bridal|bride|wedding|marriage|nauvari|gown|haldi|sangeet|mehendi/i.test(query)) {
      return {
        reply: "Amruta has 12 years of specialized bridal expertise! We provide Royal Maharashtrian Nauvari Bridal Makeup, Christian Gown Bridal Makeup, HD and Airbrush Bridal looks, as well as family packages. We also travel to wedding venues across India and destination events. Would you like to check date availability?",
        topic: "bridal"
      };
    }

    if (/haircut|hair cut|hair wash|blow dry|hair style/i.test(query)) {
      return {
        reply: "Our hair services include Women's Haircut & Style at ₹400, Only Haircut at ₹250, Kids Haircut at ₹200, Wash & Blow Dry at ₹350, and Full Haircut + Wash + Blow Dry package at ₹500. When would you like to visit?",
        topic: "hair"
      };
    }

    if (/botox|spa|hair spa|protein|hair treatment|hair color|colour/i.test(query)) {
      return {
        reply: "For hair repair and glow, we have Deep Conditioning at ₹600, Hair Spa starting at ₹850, Protein Hair Spa at ₹1,500, and advanced Hair Botox Treatment starting at ₹2,800. Global Hair Color starts at ₹850. Would you like to book an appointment?",
        topic: "hair-treatment"
      };
    }

    if (/facial|clean up|cleanup|fruit|gold facial|korean facial|bleach|detan/i.test(query)) {
      return {
        reply: "Our facial options include: Clean Up at ₹400, Fruit Cleansing at ₹550, Whitening & Detan Clean Up at ₹750–₹850, Gold Facial at ₹1,050, Party Glow Facial at ₹1,450, and Korean Glass Skin Facial at ₹2,500. Which facial would you like?",
        topic: "facial"
      };
    }

    if (/wax|waxing|rica|bikini|arms|legs/i.test(query)) {
      return {
        reply: "For waxing: Classic Hand Wax is ₹250, Classic Full Legs is ₹475, Full Arms + Legs + Underarms package is ₹700 (or ₹1,100 for Rica Wax). Bikini Wax is ₹1,500. Face waxing is ₹350.",
        topic: "waxing"
      };
    }

    if (/threading|eyebrow|upper lip|chin|forehead/i.test(query)) {
      return {
        reply: "Eyebrow threading is ₹50, Upper Lip is ₹20, Forehead is ₹30, Chin is ₹20, and Full Face Threading is ₹300.",
        topic: "threading"
      };
    }

    if (/address|location|kaha hai|where|pune|direction|map/i.test(query)) {
      return {
        reply: "Amruta Makeover is located at: Heaven Park Lane No. 1, near Mountain High Restaurant & Bar, Jarande Nagar, Mohammed Wadi, Pune 411060. Visits are by prior appointment. Would you like our WhatsApp location link?",
        topic: "location"
      };
    }

    if (/timing|hours|time|kab open|open/i.test(query)) {
      return {
        reply: "Amruta's studio operates Monday to Sunday from 10:00 AM to 8:00 PM by prior appointment to ensure personalized 1-on-1 attention.",
        topic: "timing"
      };
    }

    if (/contact|phone|number|call|whatsapp/i.test(query)) {
      return {
        reply: "You can directly call or WhatsApp Amruta at +91 7387268299. You can also book directly through me right here!",
        topic: "contact"
      };
    }

    // Booking Intent Flow
    if (isBooking || state.bookingDraft.phone) {
      if (!state.bookingDraft.name) {
        // try to extract name
        const nameMatch = userText.match(/(?:my name is|i am|name is|naam)\s+([a-zA-Z]+)/i);
        if (nameMatch) state.bookingDraft.name = nameMatch[1];
      }

      if (state.bookingDraft.name && state.bookingDraft.phone) {
        // Save to Supabase
        const bookingResult = await saveBookingToSupabase({
          name: state.bookingDraft.name,
          phone: state.bookingDraft.phone,
          service: userText,
          date: new Date().toISOString().split("T")[0],
          time: "Flexible / To Be Confirmed"
        });

        if (bookingResult.success) {
          const resp = `Thank you ${state.bookingDraft.name}! Your appointment request for ${state.bookingDraft.phone} has been registered successfully in our system. Amruta will verify your slot on WhatsApp shortly!`;
          // Reset draft
          state.bookingDraft = { name: "", phone: "", service: "", date: "", time: "" };
          return { reply: resp, isConfirmedBooking: true };
        }
      }

      return {
        reply: "I would be happy to schedule your appointment! Please share your Name, Mobile Number, and preferred date or service.",
        topic: "booking-prompt"
      };
    }

    // Default Greeting & Assistance
    return {
      reply: "Namaste! I am Amruta's AI Assistant. I can help you with our Bridal Makeup packages, HydraFacials, Hair Treatments, price lists, or booking an appointment. What would you like to know?",
      topic: "general"
    };
  }

  // Save Confirmed Booking directly to Supabase appointment_requests
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
          customer_name: data.name || "Website Voice Visitor",
          customer_phone: data.phone || "Not specified",
          requested_service: data.service || "General Inquiry via AI Voice",
          preferred_date: data.date || new Date().toISOString().split("T")[0],
          preferred_time: data.time || "11:00 AM",
          customer_message: "Booked via Website AI Voice Assistant",
          status: "pending_confirmation"
        })
      });

      return { success: res.ok };
    } catch (err) {
      console.error("Supabase booking error:", err);
      return { success: false, error: err.message };
    }
  }

  // Append Message to UI
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
        <strong>✨ Appointment Recorded in Supabase</strong><br>
        <span style="color:#D4AF37;">Amruta will reach out to confirm your timing.</span><br>
        <a href="https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hi Amruta, I just registered an appointment through your website AI Voice Assistant!')}" target="_blank" rel="noopener">Confirm immediately on WhatsApp &rarr;</a>
      `;
      msgDiv.appendChild(card);
    }

    transcript.appendChild(msgDiv);
    transcript.scrollTop = transcript.scrollHeight;
  }

  // Handle User Input (via Voice or Text)
  async function handleUserInput(text) {
    if (!text || !text.trim()) return;

    appendMessage("user", text.trim());
    updateVisualizer("thinking", "Thinking...");

    try {
      const response = await generateAIResponse(text.trim());
      appendMessage("ai", response.reply, response.isConfirmedBooking);
      speakText(response.reply);
    } catch (err) {
      console.error("AI response error:", err);
      const fallback = "You can reach Amruta directly on WhatsApp or phone at +91 7387268299 for instant assistance!";
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

    // Greeting on first open
    if (state.conversationHistory.length === 0) {
      const welcome = "Namaste! Welcome to Amruta Makeover. How can I help you today? You can ask about our bridal packages, HydraFacial rates, or book an appointment.";
      appendMessage("ai", welcome);
      speakText(welcome);
      state.conversationHistory.push({ role: "ai", text: welcome });
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

    // Quick topic pills click
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
