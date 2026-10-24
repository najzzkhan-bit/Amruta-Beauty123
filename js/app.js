/**
 * Amruta Boarde Makeup Artist - Application Core Logic
 * Handles interactive before/after slider, filterable gallery, services catalog,
 * appointment booking with WhatsApp integration, and protected admin dashboard.
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.AMRUTA_CONFIG;

  // --------------------------------------------------------------------------
  // 1. Data Store Initialization (Local Storage with Supabase readiness)
  // --------------------------------------------------------------------------
  let services = (config && config.initialServices && config.initialServices.length > 0) ? config.initialServices : loadStoredData('amruta_services_v3', []);
  let appointments = loadStoredData('amruta_appointments', [
    {
      id: "demo-apt-1",
      customer_name: "Pooja Deshmukh",
      customer_phone: "+91 98230 45678",
      requested_service: "Bridal Mehndi",
      preferred_date: "2026-11-15",
      preferred_time: "10:00 AM",
      customer_message: "Wedding in Pune. Need bridal mehndi for hands and feet.",
      status: "pending_confirmation",
      source: "website_form",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "demo-apt-2",
      customer_name: "Sneha Kulkarni",
      customer_phone: "+91 94220 12345",
      requested_service: "Fruit Facial",
      preferred_date: "2026-10-28",
      preferred_time: "03:00 PM",
      customer_message: "Pre-engagement skin glow cleanup and facial.",
      status: "confirmed",
      source: "website_form",
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  let enquiries = loadStoredData('amruta_enquiries', [
    {
      id: "demo-enq-1",
      customer_name: "Rutuja Shinde",
      customer_phone: "+91 91234 56789",
      customer_email: "rutuja@example.com",
      requested_service: "Complete Bridal Artistry Package",
      enquiry_message: "Hi Amruta, what are your destination wedding packages outside Pune?",
      status: "new",
      created_at: new Date().toISOString()
    }
  ]);

  function loadStoredData(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('LocalStorage unavailable, using fallback', e);
      return fallback;
    }
  }

  function saveStoredData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  // --------------------------------------------------------------------------
  // 2. Mobile Drawer Navigation & Sticky Header
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const mainHeader = document.getElementById('mainHeader');

  // Prevent unintended pinch zooming on mobile Safari / iOS
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

  function closeMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    mobileToggle?.classList.remove('active');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    mobileDrawerBackdrop?.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    mobileToggle?.classList.add('active');
    mobileToggle?.setAttribute('aria-expanded', 'true');
    mobileDrawerBackdrop?.classList.add('active');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }

  window.__toggleAmrutaMobileMenu = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isOpen = mobileDrawer?.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', (e) => {
      window.__toggleAmrutaMobileMenu(e);
    });

    // Close drawer when any navigation link is clicked
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close when tapping the backdrop overlay
    mobileDrawerBackdrop?.addEventListener('click', () => {
      closeMobileMenu();
    });

    // Close when tapping anywhere outside header and drawer
    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('open')) {
        if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      mainHeader?.classList.add('scrolled');
    } else {
      mainHeader?.classList.remove('scrolled');
    }
  });

  // --------------------------------------------------------------------------
  // 3. Interactive Before & After Slider
  // --------------------------------------------------------------------------
  const transformationsData = [
    {
      id: "pair-1",
      title: "Royal Bridal Elegance",
      subtitle: "Bare Face to Resplendent Bride",
      beforeImg: "assets/images/before-after/transformation-1-before.jpg",
      afterImg: "assets/images/before-after/transformation-1-after.jpg",
      tag: "Bridal Transformation",
      description: "A complete bridal makeover highlighting radiant dewy skin, defined smokey eye contours, sculpted brows, and traditional royal jewelry styling.",
      highlights: [
        "Flawless complexion prep & color correction",
        "Subtle winged liner and smokey depth",
        "Regal matha patti and neckpiece coordination"
      ]
    },
    {
      id: "pair-2",
      title: "Traditional Paithani & Silk Glam",
      subtitle: "Daytime to Radiant Wedding Splendor",
      beforeImg: "assets/images/before-after/transformation-2-before.jpg",
      afterImg: "assets/images/before-after/transformation-2-after.jpg",
      tag: "Silk Saree Glam",
      description: "Transforming natural beauty into a luminous, regal bride adorned in purple silk and heritage gold temple jewelry.",
      highlights: [
        "High-definition lasting foundation and blush",
        "Intricate Maharashtrian bindi & traditional nath",
        "Voluminous traditional bridal hairdo"
      ]
    },
    {
      id: "pair-3",
      title: "Evening Reception & Cocktail Artistry",
      subtitle: "Casual to Dazzling Red Carpet Glamour",
      beforeImg: "assets/images/before-after/transformation-3-before.jpg",
      afterImg: "assets/images/before-after/transformation-3-after.jpg",
      tag: "Reception Makeover",
      description: "Sophisticated modern glamour designed for evening lighting and celebration, matching a stunning violet glitter gown.",
      highlights: [
        "Velvet smokey eyes with multi-dimensional shimmer",
        "Soft rose-nude sculpted lips",
        "Sleek side-swept textured hair styling"
      ]
    }
  ];

  let currentTransformationIdx = 0;
  const baContainer = document.getElementById('baSliderContainer');
  const baBeforeLayer = document.getElementById('baBeforeLayer');
  const baHandle = document.getElementById('baHandle');
  const baBeforeImg = document.getElementById('baBeforeImg');
  const baAfterImg = document.getElementById('baAfterImg');
  const baDetailsTitle = document.getElementById('baDetailsTitle');
  const baDetailsDesc = document.getElementById('baDetailsDesc');
  const baDetailsTag = document.getElementById('baDetailsTag');
  const baDetailsList = document.getElementById('baDetailsList');

  function renderTransformation(idx) {
    const item = transformationsData[idx];
    if (!item) return;
    currentTransformationIdx = idx;

    if (baBeforeImg) baBeforeImg.src = item.beforeImg;
    if (baAfterImg) baAfterImg.src = item.afterImg;
    if (baDetailsTitle) baDetailsTitle.textContent = item.title;
    if (baDetailsDesc) baDetailsDesc.textContent = item.description;
    if (baDetailsTag) baDetailsTag.textContent = item.tag;

    if (baDetailsList) {
      baDetailsList.innerHTML = item.highlights.map(h => `
        <li class="ba-feature-item">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <span>${h}</span>
        </li>
      `).join('');
    }

    // Set slider to 50%
    setSliderPosition(50);

    // Update switcher tab state
    document.querySelectorAll('.ba-tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });
  }

  function setSliderPosition(percentage) {
    if (!baBeforeLayer || !baHandle) return;
    const clamped = Math.max(0, Math.min(100, percentage));
    baBeforeLayer.style.width = clamped + '%';
    baHandle.style.left = clamped + '%';
  }

  if (baContainer && baHandle) {
    let isDragging = false;

    const startDrag = () => { isDragging = true; };
    const stopDrag = () => { isDragging = false; };

    const moveDrag = (clientX) => {
      if (!isDragging) return;
      const rect = baContainer.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setSliderPosition(pct);
    };

    baHandle.addEventListener('mousedown', startDrag);
    baContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      moveDrag(e.clientX);
    });
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX));

    // Touch events for mobile phones (iPhone & Android)
    baContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) moveDrag(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) moveDrag(e.touches[0].clientX);
    }, { passive: true });

    // Slider tabs
    document.querySelectorAll('.ba-tab-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => renderTransformation(i));
    });

    // Preset buttons (Show Before, 50-50, Show After)
    document.getElementById('btnShowBefore')?.addEventListener('click', () => setSliderPosition(98));
    document.getElementById('btnSplitFifty')?.addEventListener('click', () => setSliderPosition(50));
    document.getElementById('btnShowAfter')?.addEventListener('click', () => setSliderPosition(2));

    // Initialize first transformation
    renderTransformation(0);
  }

  // --------------------------------------------------------------------------
  // 4. Portfolio & Gallery Filter and Lightbox
  // --------------------------------------------------------------------------
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const btnLightboxWa = document.getElementById('btnLightboxWa');

  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';
      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category') || '';
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox click
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-item-title')?.textContent || 'Amruta Boarde Artistry';
      const category = item.querySelector('.gallery-item-category')?.textContent || 'Bridal Makeup';

      if (lightboxImg && img) lightboxImg.src = img.src;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCategory) lightboxCategory.textContent = category;

      if (btnLightboxWa) {
        const text = encodeURIComponent(`Hello Amruta, I saw this look on your website portfolio (${title} - ${category}) and would like to inquire about booking a similar service.`);
        btnLightboxWa.href = `https://wa.me/${config.whatsappNumber}?text=${text}`;
      }

      if (lightboxModal && typeof lightboxModal.showModal === 'function') {
        lightboxModal.showModal();
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Services Menu Catalog Rendering & Search
  // --------------------------------------------------------------------------
  const servicesCatalogGrid = document.getElementById('servicesCatalogGrid');
  const categoryTabBtns = document.querySelectorAll('.category-tab-btn');
  const searchServicesInput = document.getElementById('searchServices');
  let activeCategory = 'all';
  let searchQuery = '';

  function renderServices() {
    if (!servicesCatalogGrid) return;

    const filtered = services.filter(srv => {
      if (!srv.active && srv.active !== undefined) return false;
      const matchCat = activeCategory === 'all' || srv.category === activeCategory;
      const matchSearch = !searchQuery || 
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (srv.description && srv.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      servicesCatalogGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #fff; border-radius: 16px;">
          <p style="color: var(--c-text-muted); font-size: 1.05rem;">No services found matching your search. Please try another keyword or browse all categories.</p>
        </div>
      `;
      return;
    }

    servicesCatalogGrid.innerHTML = filtered.map(srv => {
      const waText = encodeURIComponent(`Hello Amruta, I would like to inquire about your ${srv.name} service (${srv.price}).`);
      const waUrl = `https://wa.me/${config.whatsappNumber}?text=${waText}`;

      return `
        <div class="service-item-card" data-service-id="${srv.id}">
          <div>
            <div class="service-card-top">
              <h3 class="service-name">${srv.name}</h3>
              <span class="service-price-pill">${srv.price}</span>
            </div>
            <p class="service-category-tag">${srv.category}</p>
            <p class="service-description">${srv.description || ''}</p>
          </div>
          <div class="service-card-actions">
            <button type="button" class="btn-book-service select-service-cta" data-service-name="${srv.name}">
              <span>Book Appointment</span>
              <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align: -2px; margin-left: 6px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
            </button>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-service">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener to book button
    servicesCatalogGrid.querySelectorAll('.select-service-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        const srvName = btn.getAttribute('data-service-name');
        const selectEl = document.getElementById('bookingService');
        if (selectEl && srvName) {
          selectEl.value = srvName;
        }
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // Populate Booking Form Service Dropdown
  function populateBookingDropdown() {
    const selectEl = document.getElementById('bookingService');
    if (!selectEl) return;
    selectEl.innerHTML = `
      <option value="">Select a Service or Package...</option>
      ${services.map(s => `<option value="${s.name}">${s.name} (${s.price})</option>`).join('')}
    `;
  }

  categoryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'all';
      renderServices();
    });
  });

  searchServicesInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderServices();
  });

  populateBookingDropdown();
  renderServices();

  // --------------------------------------------------------------------------
  // 6. Appointment Booking Form Submission & WhatsApp Workflow
  // --------------------------------------------------------------------------
  const appointmentForm = document.getElementById('appointmentForm');
  const appointmentSuccessModal = document.getElementById('appointmentSuccessModal');
  const summaryCustomerName = document.getElementById('summaryCustomerName');
  const summaryService = document.getElementById('summaryService');
  const summaryDateTime = document.getElementById('summaryDateTime');
  const summaryPhone = document.getElementById('summaryPhone');
  const btnContinueWhatsApp = document.getElementById('btnContinueWhatsApp');

  if (appointmentForm) {
    // Set min date to today
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }

    const bookingTimeSelect = document.getElementById('bookingTime');
    bookingTimeSelect?.addEventListener('change', () => {
      document.getElementById('timeGroup')?.classList.remove('has-error');
    });

    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('bookingName')?.value.trim();
      const phone = document.getElementById('bookingPhone')?.value.trim();
      const service = document.getElementById('bookingService')?.value;
      const date = document.getElementById('bookingDate')?.value;
      const time = document.getElementById('bookingTime')?.value;
      const notes = document.getElementById('bookingNotes')?.value.trim() || 'None';

      let hasError = false;

      // Validate Name
      const nameGroup = document.getElementById('nameGroup');
      if (!name || name.length < 2) {
        nameGroup?.classList.add('has-error');
        hasError = true;
      } else {
        nameGroup?.classList.remove('has-error');
      }

      // Validate Phone
      const phoneGroup = document.getElementById('phoneGroup');
      const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
      if (!phone || cleanPhone.length < 10) {
        phoneGroup?.classList.add('has-error');
        hasError = true;
      } else {
        phoneGroup?.classList.remove('has-error');
      }

      // Validate Service
      const serviceGroup = document.getElementById('serviceGroup');
      if (!service) {
        serviceGroup?.classList.add('has-error');
        hasError = true;
      } else {
        serviceGroup?.classList.remove('has-error');
      }

      // Validate Date
      const dateGroup = document.getElementById('dateGroup');
      if (!date) {
        dateGroup?.classList.add('has-error');
        hasError = true;
      } else {
        dateGroup?.classList.remove('has-error');
      }

      // Validate Time
      const timeGroup = document.getElementById('timeGroup');
      if (!time) {
        timeGroup?.classList.add('has-error');
        hasError = true;
      } else {
        timeGroup?.classList.remove('has-error');
      }

      if (hasError) return;

      // Save appointment record
      const newApt = {
        id: "apt-" + Date.now(),
        customer_name: name,
        customer_phone: phone,
        requested_service: service,
        preferred_date: date,
        preferred_time: time,
        customer_message: notes,
        status: "pending_confirmation",
        source: "website_form",
        created_at: new Date().toISOString()
      };

      appointments.unshift(newApt);
      saveStoredData('amruta_appointments', appointments);

      // Attempt Supabase sync if credentials provided
      if (config.supabaseUrl && config.supabaseAnonKey) {
        const { id, ...supabasePayload } = newApt;
        fetch(`${config.supabaseUrl}/rest/v1/appointment_requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.supabaseAnonKey,
            'Authorization': `Bearer ${config.supabaseAnonKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(supabasePayload)
        }).catch(err => console.warn('Supabase sync error (using local storage fallback):', err));
      }

      // Populate Success Modal
      if (summaryCustomerName) summaryCustomerName.textContent = name;
      if (summaryService) summaryService.textContent = service;
      if (summaryDateTime) summaryDateTime.textContent = `${date} at ${time}`;
      if (summaryPhone) summaryPhone.textContent = phone;

      // Build strictly formatted prefilled WhatsApp message
      const waMessage = 
`Hello Amruta, I would like to request an appointment.

Name: ${name}
Service: ${service}
Preferred Date: ${date}
Preferred Time: ${time}
Contact Number: ${phone}
Additional Requirements: ${notes}

Please confirm availability. Thank you.`;

      const encodedMessage = encodeURIComponent(waMessage);
      const waUrl = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;

      if (btnContinueWhatsApp) {
        btnContinueWhatsApp.href = waUrl;
      }

      // Show modal
      if (appointmentSuccessModal && typeof appointmentSuccessModal.showModal === 'function') {
        appointmentSuccessModal.showModal();
      }

      // Reset form
      appointmentForm.reset();
    });
  }

  // --------------------------------------------------------------------------
  // 7. Contact Us Form Submission
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const contactSuccessNotice = document.getElementById('contactSuccessNotice');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName')?.value.trim();
    const phone = document.getElementById('contactPhone')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const service = document.getElementById('contactService')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !phone || !message) return;

    const newEnquiry = {
      id: "enq-" + Date.now(),
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      requested_service: service,
      enquiry_message: message,
      preferred_contact_method: "whatsapp",
      status: "new",
      created_at: new Date().toISOString()
    };

    enquiries.unshift(newEnquiry);
    saveStoredData('amruta_enquiries', enquiries);

    // Attempt Supabase sync for enquiry
    if (config.supabaseUrl && config.supabaseAnonKey) {
      const { id, ...supabasePayload } = newEnquiry;
      fetch(`${config.supabaseUrl}/rest/v1/enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.supabaseAnonKey,
          'Authorization': `Bearer ${config.supabaseAnonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(supabasePayload)
      }).catch(err => console.warn('Supabase enquiry sync error:', err));
    }

    if (contactSuccessNotice) {
      contactSuccessNotice.style.display = 'block';
      setTimeout(() => {
        contactSuccessNotice.style.display = 'none';
      }, 5000);
    }

    // Direct WhatsApp Option
    const waText = encodeURIComponent(`Hello Amruta, I have an enquiry:

Name: ${name}
Phone: ${phone}
Service: ${service || 'General Enquiry'}
Message: ${message}`);

    window.open(`https://wa.me/${config.whatsappNumber}?text=${waText}`, '_blank');
    contactForm.reset();
  });

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // 8. Protected Admin Dashboard Logic (with Live Supabase Sync & WhatsApp)
  // --------------------------------------------------------------------------
  const adminModal = document.getElementById('adminModal');
  const adminPinModal = document.getElementById('adminPinModal');
  const adminPinForm = document.getElementById('adminPinForm');
  const adminPinInput = document.getElementById('adminPinInput');
  const adminPinError = document.getElementById('adminPinError');
  const btnOpenAdmin = document.getElementById('btnOpenAdmin');
  const btnRefreshData = document.getElementById('btnRefreshData');

  // Tables & Containers
  const adminEnquiriesTable = document.getElementById('adminEnquiriesTable');
  const adminAppointmentsTable = document.getElementById('adminAppointmentsTable');
  const adminServicesTable = document.getElementById('adminServicesTable');

  // Filters & Search
  const adminFilterEnquiryStatus = document.getElementById('adminFilterEnquiryStatus');
  const adminSearchEnquiries = document.getElementById('adminSearchEnquiries');
  const adminFilterStatus = document.getElementById('adminFilterStatus');
  const adminSearchInput = document.getElementById('adminSearchInput');

  let adminAuthorized = false;
  window.__adminAuthorized = false;
  window.__syncAndRenderDashboard = syncAndRenderDashboard;

  function triggerAdminOpen(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (window.__toggleAmrutaMobileMenu && document.getElementById('mobileDrawer')?.classList.contains('open')) {
      window.__toggleAmrutaMobileMenu();
    }
    if (adminAuthorized) {
      syncAndRenderDashboard();
      adminModal?.showModal();
    } else {
      adminPinInput.value = '';
      if (adminPinError) adminPinError.style.display = 'none';
      adminPinModal?.showModal();
    }
  }

  btnOpenAdmin?.addEventListener('click', triggerAdminOpen);
  document.querySelectorAll('.btn-admin-nav, .btn-open-admin, .mobile-nav-admin').forEach(btn => {
    btn.addEventListener('click', triggerAdminOpen);
  });

  adminPinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (adminPinInput.value === config.adminPasscode) {
      adminAuthorized = true;
      window.__adminAuthorized = true;
      adminPinModal?.close();
      syncAndRenderDashboard();
      adminModal?.showModal();
    } else {
      if (adminPinError) adminPinError.style.display = 'block';
    }
  });

  // Tab Switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderBottom = '3px solid transparent';
        b.style.color = 'var(--c-text-muted)';
      });
      btn.classList.add('active');
      btn.style.borderBottom = '3px solid var(--c-gold)';
      btn.style.color = 'var(--c-gold-dark)';

      document.querySelectorAll('.admin-tab-panel').forEach(panel => {
        panel.style.display = 'none';
      });

      if (targetTab === 'enquiries') {
        const el = document.getElementById('tabContentEnquiries');
        if (el) el.style.display = 'block';
        renderAdminEnquiries();
      } else if (targetTab === 'appointments') {
        const el = document.getElementById('tabContentAppointments');
        if (el) el.style.display = 'block';
        renderAdminAppointments();
      } else if (targetTab === 'services') {
        const el = document.getElementById('tabContentServices');
        if (el) el.style.display = 'block';
        renderAdminServices();
      }
    });
  });

  // Live Supabase Data Fetching
  async function fetchLiveSupabaseData() {
    if (!config.supabaseUrl || !config.supabaseAnonKey) return;
    try {
      const headers = {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      };

      // Fetch Enquiries
      const resEnq = await fetch(`${config.supabaseUrl}/rest/v1/enquiries?order=created_at.desc`, { headers });
      if (resEnq.ok) {
        const dataEnq = await resEnq.json();
        if (Array.isArray(dataEnq) && dataEnq.length > 0) {
          enquiries = dataEnq;
          saveStoredData('amruta_enquiries', enquiries);
        }
      }

      // Fetch Appointments
      const resApt = await fetch(`${config.supabaseUrl}/rest/v1/appointment_requests?order=created_at.desc`, { headers });
      if (resApt.ok) {
        const dataApt = await resApt.json();
        if (Array.isArray(dataApt) && dataApt.length > 0) {
          appointments = dataApt;
          saveStoredData('amruta_appointments', appointments);
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local data:', err);
    }
  }

  async function syncAndRenderDashboard() {
    await fetchLiveSupabaseData();
    renderAdminDashboard();
  }

  btnRefreshData?.addEventListener('click', async () => {
    btnRefreshData.textContent = 'Refreshing...';
    await syncAndRenderDashboard();
    btnRefreshData.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
      Refresh
    `;
  });

  function renderAdminDashboard() {
    updateAdminStats();
    renderAdminEnquiries();
    renderAdminAppointments();
    renderAdminServices();
  }

  function updateAdminStats() {
    const totalApt = appointments.length;
    const pendingApt = appointments.filter(a => a.status === 'pending_confirmation').length;
    const confirmedApt = appointments.filter(a => a.status === 'confirmed').length;
    const totalEnq = enquiries.length;

    const elTotal = document.getElementById('statTotalApt');
    const elPending = document.getElementById('statPendingApt');
    const elConfirmed = document.getElementById('statConfirmedApt');
    const elEnq = document.getElementById('statTotalEnq');

    if (elTotal) elTotal.textContent = totalApt;
    if (elPending) elPending.textContent = pendingApt;
    if (elConfirmed) elConfirmed.textContent = confirmedApt;
    if (elEnq) elEnq.textContent = totalEnq;
  }

  // --------------------------------------------------------------------------
  // 8A. Customer Enquiries Management (WhatsApp quick-action & Status Sync)
  // --------------------------------------------------------------------------
  function renderAdminEnquiries() {
    if (!adminEnquiriesTable) return;
    const filterStatus = adminFilterEnquiryStatus?.value || 'all';
    const filterSearch = adminSearchEnquiries?.value.toLowerCase().trim() || '';

    const filtered = enquiries.filter(item => {
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchSearch = !filterSearch ||
        (item.customer_name && item.customer_name.toLowerCase().includes(filterSearch)) ||
        (item.customer_phone && item.customer_phone.toLowerCase().includes(filterSearch)) ||
        (item.customer_email && item.customer_email.toLowerCase().includes(filterSearch)) ||
        (item.requested_service && item.requested_service.toLowerCase().includes(filterSearch)) ||
        (item.enquiry_message && item.enquiry_message.toLowerCase().includes(filterSearch));
      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      adminEnquiriesTable.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 28px; color: var(--c-text-muted);">
            No customer enquiries match your search or filter.
          </td>
        </tr>
      `;
      return;
    }

    adminEnquiriesTable.innerHTML = filtered.map(item => {
      const cleanPhone = (item.customer_phone || '').replace(/[^0-9]/g, '');
      const waMessage = encodeURIComponent(
        `Hello ${item.customer_name}, thank you for contacting Amruta Boarde Artistry regarding ${item.requested_service || 'our bridal services'}! I am writing to assist you with your enquiry.`
      );
      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waMessage}` : '#';
      const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

      const statusColors = {
        'new': 'background: #FEF3C7; color: #92400E;',
        'contacted': 'background: #DBEAFE; color: #1E40AF;',
        'converted': 'background: #D1FAE5; color: #065F46;',
        'closed': 'background: #F3F4F6; color: #4B5563;'
      };

      return `
        <tr>
          <td>
            <strong style="color: var(--c-text-primary); font-size: 0.95rem;">${item.customer_name}</strong><br>
            <a href="tel:${item.customer_phone}" style="color: var(--c-gold-dark); text-decoration: none; font-size: 0.82rem; font-weight: 600;">📞 ${item.customer_phone}</a>
            ${item.customer_email ? `<br><small style="color: var(--c-text-muted); font-size: 0.78rem;">✉️ ${item.customer_email}</small>` : ''}
          </td>
          <td>
            <span style="font-weight: 600; color: var(--c-text-primary);">${item.requested_service || 'General Bridal Enquiry'}</span>
          </td>
          <td>
            <div style="max-height: 85px; overflow-y: auto; font-size: 0.85rem; line-height: 1.45; background: rgba(0,0,0,0.02); padding: 6px 10px; border-radius: 6px; border-left: 3px solid var(--c-gold);">
              ${item.enquiry_message || '-'}
            </div>
          </td>
          <td>
            <small style="color: var(--c-text-secondary); white-space: nowrap;">${createdDate}</small>
          </td>
          <td>
            <select class="enquiry-status-select" data-enq-id="${item.id}" style="padding: 5px 8px; border-radius: 6px; border: 1px solid var(--c-border); font-size: 0.8rem; font-weight: 600; ${statusColors[item.status] || ''}">
              <option value="new" ${item.status === 'new' ? 'selected' : ''}>🟡 New</option>
              <option value="contacted" ${item.status === 'contacted' ? 'selected' : ''}>🔵 Contacted</option>
              <option value="converted" ${item.status === 'converted' ? 'selected' : ''}>🟢 Converted</option>
              <option value="closed" ${item.status === 'closed' ? 'selected' : ''}>⚪ Closed</option>
            </select>
          </td>
          <td style="text-align: center; white-space: nowrap;">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="padding: 6px 12px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 4px;" title="Chat with customer on WhatsApp">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              WhatsApp
            </a>
            <br>
            <a href="tel:${item.customer_phone}" class="btn btn-outline-gold btn-sm" style="padding: 4px 10px; font-size: 0.74rem;">
              Call
            </a>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Status Change Listener
    adminEnquiriesTable.querySelectorAll('.enquiry-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const enqId = sel.getAttribute('data-enq-id');
        const newStatus = e.target.value;
        const target = enquiries.find(item => item.id == enqId);
        if (target) {
          target.status = newStatus;
          saveStoredData('amruta_enquiries', enquiries);
          updateAdminStats();
          renderAdminEnquiries();

          // Sync status to Supabase
          if (config.supabaseUrl && config.supabaseAnonKey) {
            fetch(`${config.supabaseUrl}/rest/v1/enquiries?id=eq.${enqId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${config.supabaseAnonKey}`
              },
              body: JSON.stringify({ status: newStatus })
            }).catch(err => console.warn('Supabase enquiry status sync error:', err));
          }
        }
      });
    });
  }

  adminFilterEnquiryStatus?.addEventListener('change', renderAdminEnquiries);
  adminSearchEnquiries?.addEventListener('input', renderAdminEnquiries);

  // Export Enquiries CSV
  document.getElementById('btnExportEnquiriesCsv')?.addEventListener('click', () => {
    if (enquiries.length === 0) {
      alert('No enquiries to export.');
      return;
    }
    const headers = ["ID", "Customer Name", "Phone", "Email", "Service Interested", "Message", "Status", "Created At"];
    const rows = enquiries.map(e => [
      `"${e.id}"`,
      `"${e.customer_name}"`,
      `"${e.customer_phone}"`,
      `"${e.customer_email || ''}"`,
      `"${e.requested_service || ''}"`,
      `"${(e.enquiry_message || '').replace(/"/g, '""')}"`,
      `"${e.status}"`,
      `"${e.created_at || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amruta_customer_enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // --------------------------------------------------------------------------
  // 8B. Appointments Management (WhatsApp quick-action & Status Sync)
  // --------------------------------------------------------------------------
  function renderAdminAppointments() {
    if (!adminAppointmentsTable) return;
    const filterStatus = adminFilterStatus?.value || 'all';
    const filterSearch = adminSearchInput?.value.toLowerCase().trim() || '';

    const filtered = appointments.filter(a => {
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchSearch = !filterSearch ||
        (a.customer_name && a.customer_name.toLowerCase().includes(filterSearch)) ||
        (a.customer_phone && a.customer_phone.toLowerCase().includes(filterSearch)) ||
        (a.requested_service && a.requested_service.toLowerCase().includes(filterSearch));
      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      adminAppointmentsTable.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 28px; color: var(--c-text-muted);">
            No appointment requests match your filter.
          </td>
        </tr>
      `;
      return;
    }

    adminAppointmentsTable.innerHTML = filtered.map(a => {
      const cleanPhone = (a.customer_phone || '').replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(
        `Hello ${a.customer_name}, this is Amruta Boarde regarding your appointment request for ${a.requested_service} on ${a.preferred_date} (${a.preferred_time}).`
      );
      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waMsg}` : '#';

      return `
        <tr>
          <td>
            <strong style="color: var(--c-text-primary); font-size: 0.95rem;">${a.customer_name}</strong><br>
            <a href="tel:${a.customer_phone}" style="color: var(--c-gold-dark); text-decoration: none; font-size: 0.82rem; font-weight: 600;">📞 ${a.customer_phone}</a>
          </td>
          <td>
            <strong style="color: var(--c-text-primary);">${a.requested_service}</strong>
          </td>
          <td>
            <span style="font-weight: 600;">${a.preferred_date}</span><br>
            <small style="color: var(--c-text-muted); font-size: 0.8rem;">⏰ ${a.preferred_time}</small>
          </td>
          <td>
            <small style="max-width: 180px; display: inline-block; line-height: 1.4;">${a.customer_message || '-'}</small>
          </td>
          <td>
            <select class="status-select" data-apt-id="${a.id}">
              <option value="pending_confirmation" ${a.status === 'pending_confirmation' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="rescheduling_requested" ${a.status === 'rescheduling_requested' ? 'selected' : ''}>Reschedule</option>
              <option value="cancellation_requested" ${a.status === 'cancellation_requested' ? 'selected' : ''}>Cancellation</option>
              <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td style="text-align: center; white-space: nowrap;">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="padding: 6px 12px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              WhatsApp
            </a>
            <br>
            <a href="tel:${a.customer_phone}" class="btn btn-outline-gold btn-sm" style="padding: 4px 10px; font-size: 0.74rem;">
              Call
            </a>
          </td>
        </tr>
      `;
    }).join('');

    // Attach status change listeners
    adminAppointmentsTable.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const aptId = sel.getAttribute('data-apt-id');
        const newStatus = e.target.value;
        const target = appointments.find(a => a.id == aptId);
        if (target) {
          target.status = newStatus;
          saveStoredData('amruta_appointments', appointments);
          updateAdminStats();
          renderAdminAppointments();

          // Sync status to Supabase
          if (config.supabaseUrl && config.supabaseAnonKey) {
            fetch(`${config.supabaseUrl}/rest/v1/appointment_requests?id=eq.${aptId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${config.supabaseAnonKey}`
              },
              body: JSON.stringify({ status: newStatus })
            }).catch(err => console.warn('Supabase appointment status sync error:', err));
          }
        }
      });
    });
  }

  adminFilterStatus?.addEventListener('change', renderAdminAppointments);
  adminSearchInput?.addEventListener('input', renderAdminAppointments);

  // Export Appointments to CSV
  document.getElementById('btnExportCsv')?.addEventListener('click', () => {
    if (appointments.length === 0) {
      alert('No appointments to export.');
      return;
    }
    const headers = ["ID", "Customer Name", "Phone", "Service", "Date", "Time", "Notes", "Status", "Created At"];
    const rows = appointments.map(a => [
      `"${a.id}"`,
      `"${a.customer_name}"`,
      `"${a.customer_phone}"`,
      `"${a.requested_service}"`,
      `"${a.preferred_date}"`,
      `"${a.preferred_time}"`,
      `"${(a.customer_message || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.created_at || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amruta_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Service Price Manager in Admin
  function renderAdminServices() {
    if (!adminServicesTable) return;
    adminServicesTable.innerHTML = services.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td><small>${s.category}</small></td>
        <td>
          <input type="text" class="admin-price-input" data-srv-id="${s.id}" value="${s.price}" style="width: 120px; padding: 4px 8px; border: 1px solid var(--c-border); border-radius: 4px;">
        </td>
        <td>
          <button type="button" class="btn-sm btn-outline-gold save-service-price-btn" data-srv-id="${s.id}">Save</button>
        </td>
      </tr>
    `).join('');

    adminServicesTable.querySelectorAll('.save-service-price-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const srvId = btn.getAttribute('data-srv-id');
        const input = adminServicesTable.querySelector(`.admin-price-input[data-srv-id="${srvId}"]`);
        const item = services.find(s => s.id === srvId);
        if (item && input) {
          item.price = input.value.trim();
          saveStoredData('amruta_services_v3', services);
          renderServices();
          populateBookingDropdown();
          alert(`Updated price for ${item.name} to ${item.price}`);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. Modern Dialog Accessibility & Light Dismiss Fallback
  // (Conforming to modern-web-guidance: light-dismiss-a-dialog standard)
  // --------------------------------------------------------------------------
  const allDialogs = document.querySelectorAll('dialog');
  allDialogs.forEach(dialog => {
    // Light-dismiss fallback for browsers without closedby support
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        // 1. When clicking the backdrop, event target is the dialog element itself
        if (event.target !== dialog) return;

        // 2. Check if click coordinates fall within dialog bounding box
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (isDialogContent) return;

        // 3. Click was outside content area on backdrop, close dialog
        dialog.close();
      });
    }

    // Modal Close Buttons
    dialog.querySelectorAll('.modal-close-btn, [data-modal-close]').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        dialog.close();
      });
    });
  });

  // Footer Modal Triggers
  document.getElementById('linkPrivacyPolicy')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('privacyModal')?.showModal();
  });

  document.getElementById('linkTerms')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('termsModal')?.showModal();
  });
});
