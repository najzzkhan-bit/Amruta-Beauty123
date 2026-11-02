/**
 * Ashwini AI Voice Assistant - Small Box In-Place Controller
 * Amruta Makeover Beauty Salon
 * 
 * Features:
 * 1. Compact corner box (290px x 128px - Not portrait!)
 * 2. Clean professional UI: Zero emojis, single language mention
 * 3. Bulletproof Web Audio & WebRTC audio pipeline (AudioContext + HTML5 Audio)
 * 4. Dograh WebRTC API integration (start, end, onCallStart, onCallEnd)
 * 5. Microphone mute/unmute and live call duration timer
 */

(function () {
  'use strict';

  // State
  const state = {
    isCalling: false,
    isConnected: false,
    isMuted: false,
    timerInterval: null,
    callSeconds: 0,
    audioContext: null,
    voiceAudio: null,
    audioWired: false
  };

  // -------------------------------------------------------------------------
  // 1. Audio Engine & WebRTC Interception (Guarantees Voice Playback)
  // -------------------------------------------------------------------------

  function setupAudioEngine() {
    // A. Create permanent audio element on document.body (never removed from DOM)
    if (!state.voiceAudio) {
      let audio = document.getElementById('ashwini-voice-audio');
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'ashwini-voice-audio';
        audio.autoplay = true;
        audio.playsInline = true;
        audio.muted = false;
        audio.volume = 1.0;
        // Visible to browser compositor so background/battery throttling never suspends it
        audio.style.cssText = 'position:fixed;bottom:-200px;left:-200px;width:10px;height:10px;opacity:0.01;pointer-events:none;z-index:-1;';
        document.body.appendChild(audio);
      }
      state.voiceAudio = audio;
    }

    // B. Hook RTCPeerConnection to intercept remote audio stream from server
    if (window.RTCPeerConnection && !window.RTCPeerConnection.__ashwini_hooked) {
      window.RTCPeerConnection.__ashwini_hooked = true;

      const origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function (...args) {
        const pc = this;
        if (!pc.__ashwini_tracked) {
          pc.__ashwini_tracked = true;

          pc.addEventListener('track', function (event) {
            if (event.track && event.track.kind === 'audio') {
              console.log('Ashwini WebRTC: Remote voice track received from server');
              const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
              routeAudioToSpeakers(stream, event.track);
            }
          });
        }
        return origSetRemoteDescription.apply(this, args);
      };
    }
  }

  // Unlock AudioContext and Pre-warm OS Audio Device on User Click
  function unlockAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!state.audioContext && AudioCtx) {
        state.audioContext = new AudioCtx();
      }
      if (state.audioContext && state.audioContext.state === 'suspended') {
        state.audioContext.resume();
      }

      // Pre-warm audio hardware with a silent oscillator pulse
      if (state.audioContext) {
        const osc = state.audioContext.createOscillator();
        const gain = state.audioContext.createGain();
        gain.gain.value = 0.001;
        osc.connect(gain);
        gain.connect(state.audioContext.destination);
        osc.start();
        osc.stop(state.audioContext.currentTime + 0.05);
      }

      // Prime persistent HTML5 audio tag
      if (state.voiceAudio) {
        state.voiceAudio.play().catch(function () {});
      }
    } catch (e) {
      console.warn('Audio unlock note:', e);
    }
  }

  // Route incoming WebRTC audio stream to speakers via dual-pipeline
  function routeAudioToSpeakers(stream, track) {
    if (!stream) return;

    // Pipeline 1: Persistent HTML5 Audio Tag
    if (state.voiceAudio) {
      state.voiceAudio.srcObject = stream;
      state.voiceAudio.muted = false;
      state.voiceAudio.volume = 1.0;
      state.voiceAudio.play().then(function () {
        console.log('Ashwini Voice: Actively playing via HTML5 audio element');
      }).catch(function (err) {
        console.warn('HTML5 audio play error, relying on Web Audio:', err);
      });
    }

    // Pipeline 2: Track Unmute Listener
    if (track) {
      track.onunmute = function () {
        console.log('Ashwini WebRTC: Audio track unmuted by server');
        if (state.voiceAudio) {
          state.voiceAudio.play().catch(function () {});
        }
        if (state.audioContext && state.audioContext.state === 'suspended') {
          state.audioContext.resume();
        }
      };
    }

    // Pipeline 3: Web Audio API Destination (Bypasses Chrome/Safari autoplay policies)
    try {
      if (state.audioContext && !state.audioWired) {
        if (state.audioContext.state === 'suspended') {
          state.audioContext.resume();
        }
        const source = state.audioContext.createMediaStreamSource(stream);
        source.connect(state.audioContext.destination);
        console.log('Ashwini Voice: Stream successfully connected to AudioContext destination');
        state.audioWired = true;
      }
    } catch (err) {
      console.warn('AudioContext route error:', err);
    }
  }

  // Keep Dograh state synchronized and redirect its internal audioElement
  function monitorDograh() {
    const pollInterval = setInterval(function () {
      if (!window.DograhWidget || typeof window.DograhWidget.getState !== 'function') return;

      const dState = window.DograhWidget.getState();
      if (!dState) return;

      // Ensure Dograh's internal audio reference uses our permanent element
      if (state.voiceAudio && dState.audioElement !== state.voiceAudio) {
        dState.audioElement = state.voiceAudio;
      }

      // If peer connection exists, attach remote audio tracks
      if (dState.pc && !state.audioWired) {
        const receivers = dState.pc.getReceivers ? dState.pc.getReceivers() : [];
        receivers.forEach(function (rec) {
          if (rec.track && rec.track.kind === 'audio') {
            const stream = new MediaStream([rec.track]);
            routeAudioToSpeakers(stream, rec.track);
          }
        });
      }

      // Sync active state
      if (dState.connectionStatus === 'connected' && !state.isConnected) {
        handleCallConnected();
      } else if (
        (dState.connectionStatus === 'failed' || dState.connectionStatus === 'ended' || dState.connectionStatus === 'idle') &&
        state.isCalling &&
        dState.connectionStatus !== 'connecting'
      ) {
        if (dState.connectionStatus === 'failed') {
          handleCallFailed();
        } else if (state.isConnected) {
          handleCallEnded();
        }
      }
    }, 200);

    // Stop polling after 1 hour
    setTimeout(function () {
      clearInterval(pollInterval);
    }, 3600000);
  }

  // -------------------------------------------------------------------------
  // 2. UI Controllers & State Transitions (Small In-Place Box)
  // -------------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', initAshwiniWidget);

  function initAshwiniWidget() {
    setupAudioEngine();
    monitorDograh();

    // DOM Elements
    const idleCard = document.getElementById('ashwiniIdleCard');
    const activeCard = document.getElementById('ashwiniActiveCard');
    const startBtn = document.getElementById('ashwiniStartCallBtn');
    const endBtn = document.getElementById('ashwiniEndCallBtn');
    const muteBtn = document.getElementById('ashwiniMuteBtn');
    const timerDisplay = document.getElementById('ashwiniCallTimer');
    const headingDisplay = document.getElementById('ashwiniActiveHeading');
    const listeningTag = document.getElementById('ashwiniListeningTag');

    if (!idleCard || !activeCard || !startBtn) return;

    // --- Start Call Action ---
    function startCall() {
      unlockAudioContext();
      state.isCalling = true;
      state.isConnected = false;
      state.audioWired = false;
      state.callSeconds = 0;

      // In-place switch: Hide idle card, show active card (exact same small size!)
      idleCard.style.display = 'none';
      activeCard.style.display = 'flex';

      if (headingDisplay) headingDisplay.textContent = 'Connecting...';
      if (timerDisplay) timerDisplay.textContent = '00:00';
      if (listeningTag) listeningTag.textContent = 'Connecting...';

      // Provide context to Dograh
      if (window.DograhWidget && typeof window.DograhWidget.setContext === 'function') {
        window.DograhWidget.setContext({
          page_url: window.location.href,
          salon_name: "Amruta's Makeover Pune",
          languages: 'Hindi, Marathi, English',
          today: new Date().toISOString().slice(0, 10)
        });
      }

      // Call Dograh start
      const inlineStartBtn = document.getElementById('dograh-inline-start-btn');
      if (inlineStartBtn) {
        inlineStartBtn.click();
        return;
      }

      if (window.DograhWidget && typeof window.DograhWidget.start === 'function') {
        window.DograhWidget.start().catch(function (err) {
          console.warn('Dograh start error:', err);
          if (headingDisplay) headingDisplay.textContent = 'Connection Error';
          if (listeningTag) listeningTag.textContent = 'Tap to retry';
          setTimeout(handleCallEnded, 3000);
        });
      }
    }

    startBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      startCall();
    });

    // --- Connected State ---
    function handleCallConnected() {
      state.isConnected = true;
      if (headingDisplay) headingDisplay.textContent = 'Call in progress';
      if (listeningTag) listeningTag.textContent = 'Listening...';

      // Start call timer
      clearInterval(state.timerInterval);
      state.callSeconds = 0;
      state.timerInterval = setInterval(function () {
        state.callSeconds++;
        const mins = String(Math.floor(state.callSeconds / 60)).padStart(2, '0');
        const secs = String(state.callSeconds % 60).padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = mins + ':' + secs;
      }, 1000);

      // Verify persistent audio playback
      if (state.voiceAudio) {
        state.voiceAudio.play().catch(function () {});
      }
    }

    // --- Failed State ---
    function handleCallFailed() {
      if (headingDisplay) headingDisplay.textContent = 'Call Failed';
      if (listeningTag) listeningTag.textContent = 'Check microphone';
      setTimeout(handleCallEnded, 3000);
    }

    // --- End Call Action ---
    function handleCallEnded() {
      state.isCalling = false;
      state.isConnected = false;
      state.audioWired = false;
      clearInterval(state.timerInterval);

      // Call Dograh end (from integration instructions)
      if (window.DograhWidget && typeof window.DograhWidget.end === 'function') {
        window.DograhWidget.end();
      } else if (window.DograhWidget && typeof window.DograhWidget.stop === 'function') {
        window.DograhWidget.stop();
      }
      const inlineEndBtn = document.getElementById('dograh-inline-end-btn');
      if (inlineEndBtn) {
        inlineEndBtn.click();
      }

      // Reset Audio
      if (state.voiceAudio) {
        state.voiceAudio.srcObject = null;
      }

      // In-place switch back to idle card
      activeCard.style.display = 'none';
      idleCard.style.display = 'flex';
      if (timerDisplay) timerDisplay.textContent = '00:00';
    }

    if (endBtn) {
      endBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        handleCallEnded();
      });
    }

    // --- Mute / Unmute Action ---
    if (muteBtn) {
      muteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        state.isMuted = !state.isMuted;

        const micOn = muteBtn.querySelector('.ashwini-mic-on');
        const micOff = muteBtn.querySelector('.ashwini-mic-off');

        if (state.isMuted) {
          muteBtn.classList.add('is-muted');
          muteBtn.title = 'Unmute Microphone';
          if (micOn) micOn.style.display = 'none';
          if (micOff) micOff.style.display = 'block';
        } else {
          muteBtn.classList.remove('is-muted');
          muteBtn.title = 'Mute Microphone';
          if (micOn) micOn.style.display = 'block';
          if (micOff) micOff.style.display = 'none';
        }

        // Toggle user mic track in Dograh state
        if (window.DograhWidget && typeof window.DograhWidget.getState === 'function') {
          const dState = window.DograhWidget.getState();
          if (dState && dState.stream) {
            dState.stream.getAudioTracks().forEach(function (t) {
              t.enabled = !state.isMuted;
            });
          }
        }
      });
    }

    // --- Dograh Integration Callbacks (from dashboard instructions) ---
    window.addEventListener('load', function () {
      if (window.DograhWidget) {
        if (typeof window.DograhWidget.onCallStart === 'function') {
          window.DograhWidget.onCallStart(function () {
            if (!state.isCalling) startCall();
            handleCallConnected();
          });
        }
        if (typeof window.DograhWidget.onCallConnected === 'function') {
          window.DograhWidget.onCallConnected(handleCallConnected);
        }
        if (typeof window.DograhWidget.onCallEnd === 'function') {
          window.DograhWidget.onCallEnd(handleCallEnded);
        }
        if (typeof window.DograhWidget.onCallDisconnected === 'function') {
          window.DograhWidget.onCallDisconnected(handleCallEnded);
        }
      }
    });

    // Global launcher hook
    window.openAshwiniAssistant = function () {
      startCall();
    };
  }
})();
