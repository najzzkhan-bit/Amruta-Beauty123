# Dograh AI Voice Assistant Integration & Troubleshooting Guide

This guide documents the root causes, diagnostic methods, and step-by-step resolutions for integrating the **Dograh AI WebRTC Voice Assistant** into luxury client websites (e.g. Amruta Makeover / Shivani Sharma Salon).

---

## 1. Summary of Issues Resolved

| Problem | Symptoms | Root Cause | Permanent Resolution |
| :--- | :--- | :--- | :--- |
| **Audio Silence / Ambient Noise Only** | Call connected, ambient hum heard, but AI voice never spoke. | Chrome Autoplay Policy muted audio inside `display:none` and failed to call `.play()` asynchronously on incoming tracks. | Added user-gesture audio unlocker + direct WebRTC `pc.ontrack` audio bridge. |
| **Tall Stretched Box (Portrait)** | Widget grew to 600px+ height, showing Start and End buttons stacked together. | CSS `.ashwini-footer-active { display: flex; }` overrode the HTML `[hidden]` attribute due to specificity. | Explicit `275px` by `275px` square sizing + explicit JS screen toggling. |
| **Widget Collision with WhatsApp** | Agent collided with the green WhatsApp floating button. | Dograh defaults to `bottom-right`, the same position as WhatsApp. | Anchored agent to **bottom-left** (`left: 1.8rem; bottom: 1.8rem;`). |
| **Brand Integrity (Zero Emojis)** | Unicode emojis looked informal on a luxury bridal salon site. | Unicode emojis in buttons, titles, and language banners. | Replaced 100% of emojis with clean, lightweight vector SVGs. |

---

## 2. Issue Deep-Dive & Exact Code Fixes

### Issue 1: WebRTC Audio Silence (Agent Not Speaking)

#### Root Cause Analysis
1. **Container Muting**: In `embedMode: "inline"`, Dograh injects its `<audio>` tag into `<div id="dograh-inline-container">`. When that container had `display: none !important;`, modern browsers (Chrome, Edge, Safari, Android/iOS) automatically suspended and muted the audio pipeline.
2. **Missing Async `.play()` Call**: When WebRTC receives remote audio (`pc.ontrack`), Dograh sets `audioElement.srcObject = event.streams[0];`, but does not call `.play()`. Modern browser security prevents audio streams from autoplaying unless explicitly unlocked during a user click gesture.

#### Technical Resolution
1. Unhide `#dograh-inline-container` by keeping it active in the DOM (`width: 1px; height: 1px; opacity: 0.01; overflow: hidden; pointer-events: none;`).
2. Create an **unlocked Master Audio Element** in the DOM:
```javascript
var masterAudioEl = document.createElement('audio');
masterAudioEl.id = 'ashwiniMasterAudio';
masterAudioEl.autoplay = true;
masterAudioEl.playsInline = true;
document.body.appendChild(masterAudioEl);
```
3. **Unlock on User Click & Bridge the WebRTC Stream**:
```javascript
function startAshwiniVoiceCall() {
  // 1. Immediately unlock browser audio context during user click gesture
  masterAudioEl.play().catch(function(){});

  // 2. Intercept Dograh's WebRTC ontrack handler and route incoming stream
  var hookTimer = setInterval(function() {
    if (window.DograhWidget && typeof window.DograhWidget.getState === 'function') {
      var state = window.DograhWidget.getState();
      if (state && state.pc) {
        clearInterval(hookTimer);
        var origOnTrack = state.pc.ontrack;
        state.pc.ontrack = function(event) {
          if (origOnTrack) origOnTrack(event);
          if (event.track && event.track.kind === 'audio') {
            masterAudioEl.srcObject = event.streams[0];
            masterAudioEl.muted = false;
            masterAudioEl.volume = 1.0;
            masterAudioEl.play().catch(function(e){ console.warn('Audio play:', e); });
          }
        };
      }
    }
  }, 100);
  setTimeout(function() { clearInterval(hookTimer); }, 10000);

  // 3. Initiate WebRTC connection
  window.DograhWidget.start();
}
```

---

### Issue 2: Card Stretched into a Tall Portrait Rectangle

#### Root Cause Analysis
The modal HTML had:
```html
<div class="ashwini-footer-active" id="ashwiniFooterActive" hidden>
```
However, the CSS stylesheet had:
```css
.ashwini-footer-active {
  display: flex;
}
```
In browser CSS rules, class selector rules (`.ashwini-footer-active`) have higher specificity than the HTML attribute selector (`[hidden]`). As a result, `display: flex` canceled out `hidden`, causing the **Idle view and Active call view to render simultaneously**, stretching the card height to over 600px.

#### Technical Resolution
1. Lock the card to an **exact square**:
```css
.ashwini-square-modal {
  position: fixed;
  left: 1.8rem;
  bottom: 1.8rem;
  z-index: 992;
  width: 275px;
  height: 275px;
  background: #ffffff;
  border: 1.5px solid #EFE8DF;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(43, 30, 26, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .ashwini-square-modal {
    left: 0.8rem;
    bottom: 0.8rem;
    width: 260px;
    height: 260px;
  }
}
```
2. Control screens with direct JavaScript state toggling:
```javascript
// On Call Start:
document.getElementById('ashwiniScreenIdle').style.display = 'none';
document.getElementById('ashwiniScreenActive').style.display = 'flex';

// On Call End:
document.getElementById('ashwiniScreenIdle').style.display = 'flex';
document.getElementById('ashwiniScreenActive').style.display = 'none';
```

---

### Issue 3: Duplicate Dograh Floating Launcher

#### Root Cause Analysis
Dograh's embed script automatically attempts to append its own generic green or dark floating button to the document body.

#### Technical Resolution
Suppress Dograh's generic button so our custom luxury launcher pill controls the state:
```css
.dograh-widget-container {
  display: none !important;
}
```

---

### Issue 4: Strict Zero-Emoji Luxury Brand Compliance

#### Technical Resolution
Replaced all emojis with inline SVGs:
- **Microphone**: Vector path SVG.
- **Languages**: SVG globe icon with text `Hindi • English • मराठी`.
- **Soundwaves**: 5 CSS animated wave bars colored in luxury metallic gold (`#D4AF37`).
- **Call Controls**: Pure SVG End Call square and mic toggle.

---

## 3. Quick Checklist for Future Integrations

When adding Dograh AI Voice Agent to a new client site, verify these 5 items:
1. [ ] **Token**: Extract `token=emb_...` from the client's Dograh workflow settings.
2. [ ] **Dograh Embed Script**: Place before `</body>`.
3. [ ] **Runtime Container**: Include `<div id="dograh-inline-container" style="width:1px;height:1px;opacity:0.01;overflow:hidden;pointer-events:none;"></div>`.
4. [ ] **Audio Bridge**: Include `masterAudioEl` and hook into `state.pc.ontrack` inside the user click handler to bypass Autoplay restrictions.
5. [ ] **Layout**: Set explicit square width & height (`275px` × `275px`) and anchor opposite WhatsApp at `bottom-left`.
