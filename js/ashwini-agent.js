/**
 * Ashwini AI Voice Assistant Controller - Side Box Edition
 * Amruta Makeover Beauty Salon
 * Powers the bottom-left medium side box & Dograh WebRTC voice interaction
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initAshwiniSideWidget);

  function initAshwiniSideWidget() {
    const sideWidget = document.getElementById('ashwiniSideWidget');
    const minimizeBtn = document.getElementById('ashwiniMinimizeBtn');
    const collapsedBtn = document.getElementById('ashwiniCollapsedBtn');
    const startBtn = document.getElementById('ashwiniBoxStartBtn');
    const topicChips = document.querySelectorAll('.ashwini-mini-chip');

    if (!sideWidget) return;

    // 1. Restore minimized state preference from sessionStorage
    if (sessionStorage.getItem('ashwini_side_minimized') === '1') {
      sideWidget.classList.add('minimized');
    }

    // 2. Minimize & Restore Handlers
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        sideWidget.classList.add('minimized');
        sessionStorage.setItem('ashwini_side_minimized', '1');
      });
    }

    if (collapsedBtn) {
      collapsedBtn.addEventListener('click', function () {
        sideWidget.classList.remove('minimized');
        sessionStorage.setItem('ashwini_side_minimized', '0');
      });
    }

    // 3. Connect to Dograh Voice Widget
    function startDograhVoice() {
      // If Dograh inline start button exists in the DOM, click it
      const inlineStartBtn = document.getElementById('dograh-inline-start-btn');
      if (inlineStartBtn) {
        inlineStartBtn.click();
        return;
      }

      // Or call DograhWidget API if exposed
      if (window.DograhWidget && typeof window.DograhWidget.start === 'function') {
        try {
          window.DograhWidget.start();
        } catch (err) {
          console.warn('Dograh start error:', err);
        }
      } else {
        console.info('Connecting to Ashwini voice agent...');
      }
    }

    if (startBtn) {
      startBtn.addEventListener('click', function () {
        startDograhVoice();
      });
    }

    // Hide fallback button once Dograh injects its inline button
    const container = document.getElementById('dograh-inline-container');
    if (container) {
      const observer = new MutationObserver(function () {
        const dograhBtn = container.querySelector('.dograh-inline-btn');
        if (dograhBtn && startBtn) {
          startBtn.style.display = 'none';
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }

    // 4. Topic Suggestions
    topicChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        startDograhVoice();
      });
    });

    // 5. Global helper for opening/maximizing Ashwini widget from any CTA on page
    window.openAshwiniAssistant = function () {
      sideWidget.classList.remove('minimized');
      sessionStorage.setItem('ashwini_side_minimized', '0');
      startDograhVoice();
    };
  }
})();
