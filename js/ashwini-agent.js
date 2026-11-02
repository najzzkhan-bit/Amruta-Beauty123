/**
 * Ashwini AI Voice Assistant Controller
 * Amruta Makeover Beauty Salon
 * Powers the bottom-left floating widget & Dograh WebRTC voice interaction
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initAshwiniAssistant);

  function initAshwiniAssistant() {
    const triggerBtn = document.getElementById('ashwiniTriggerBtn');
    const modalBackdrop = document.getElementById('ashwiniModalBackdrop');
    const modalCloseBtn = document.getElementById('ashwiniModalCloseBtn');
    const greetingBubble = document.getElementById('ashwiniGreetingBubble');
    const bubbleCloseBtn = document.getElementById('ashwiniBubbleCloseBtn');
    const fallbackStartBtn = document.getElementById('ashwiniFallbackStartBtn');
    const topicPills = document.querySelectorAll('.ashwini-topic-pill');

    // 1. Bubble dismiss persistence (session)
    if (bubbleCloseBtn && greetingBubble) {
      if (sessionStorage.getItem('ashwini_bubble_dismissed') === '1') {
        greetingBubble.classList.add('dismissed');
      }
      bubbleCloseBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        greetingBubble.classList.add('dismissed');
        sessionStorage.setItem('ashwini_bubble_dismissed', '1');
      });
    }

    // 2. Open / Close Modal
    function openModal() {
      if (!modalBackdrop) return;
      modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Auto-trigger Dograh start if ready and idle
      checkAndPromptDograh();
    }

    function closeModal() {
      if (!modalBackdrop) return;
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (triggerBtn) {
      triggerBtn.addEventListener('click', openModal);
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', function (e) {
        if (e.target === modalBackdrop) {
          closeModal();
        }
      });
    }

    // Escape key closes modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });

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
        console.info('Dograh widget is connecting...');
      }
    }

    if (fallbackStartBtn) {
      fallbackStartBtn.addEventListener('click', function () {
        startDograhVoice();
      });
    }

    // Hide fallback button once Dograh injects its inline button
    const container = document.getElementById('dograh-inline-container');
    if (container) {
      const observer = new MutationObserver(function () {
        const dograhBtn = container.querySelector('.dograh-inline-btn');
        if (dograhBtn && fallbackStartBtn) {
          fallbackStartBtn.style.display = 'none';
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }

    function checkAndPromptDograh() {
      // Optional: sync Dograh inline UI if present
      if (window.DograhWidget && typeof window.DograhWidget.refresh === 'function') {
        try {
          window.DograhWidget.refresh();
        } catch (e) {}
      }
    }

    // 4. Topic Suggestions
    topicPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        startDograhVoice();
      });
    });

    // 5. Expose global helper for any CTA buttons on the site
    window.openAshwiniAssistant = openModal;
  }
})();
