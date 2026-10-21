# Amruta Boarde Makeup Artist — Luxury Brand Website

A premium, dynamic web application built for **Amruta Boarde**, a luxury Bridal Makeup Artist & Hairstylist with 12 years of experience serving India and international destinations.

---

##  Features & Highlights

1. **Luxury Visual Aesthetic**:
   - Curated color scheme: Ivory, Champagne, Beige, Soft Blush, and tasteful Metallic Gold accents.
   - Editorial typography: *Playfair Display*, *Cormorant Garamond*, and *Outfit* (Google Fonts).
   - Glassmorphic navigation bar with scroll detection and mobile drawer menu.

2. **Real Portfolio & Photography**:
   - Uses genuine client photographs provided by Amruta.
   - Separate owner profile in the About section.
   - Authentic bridal gallery (Nauvari Paithani, Peach Matha Patti, Christian White Gown & Veil, Peacock Blue Zardozi, Mundavalya).
   - Studio & In-Action session photographs.

3. **Interactive Before-and-After Transformations**:
   - Live interactive draggable comparison slider with touch support for Android & iPhone.
   - Quick preset controls (*Show Before*, *Split 50/50*, *Show After*).
   - Switchable looks (Bridal Elegance, Traditional Silk Glam, Evening Reception).

4. **Complete Services Menu & Transparent Pricing**:
   - All categories and prices preserved in Indian Rupees (₹):
     - **Skincare & Facial Services** (Eyebrow ₹30, Fruit Cleanup ₹300, Upper Lips ₹15, Fruit Facial ₹500, Forehead ₹15, Fruit Bleach ₹150, D-Tan ₹200, Face Wax ₹200, Arms Bleach ₹150, Arms D-Tan ₹250, Raga Facial ₹700, Aroma Facial ₹500, Hand Polishing ₹300).
     - **Waxing & Body Care** (Waxing "Contact for price", Full Arms + Underarms ₹150, Half Legs ₹150, Full Legs ₹300, Head Massage ₹200, Full Body Massage ₹1,000, Foot Massage ₹150, Leg Polishing ₹400, Full Body Polishing ₹1,000).
     - **Nail Care** (Manicure ₹250, Pedicure ₹350).
     - **Hair Services** (Hair Spa Matrix ₹500, Hair Spa Keratin ₹700, Hair Cutting ₹350, Head Wash ₹150, Root Touch Up ₹500, Head Wash + Blow Dry ₹250).
     - **Mehndi Services** (Arabic Mehndi ₹250, Bridal Mehndi ₹2,000).
     - **Signature Bridal Artistry Packages**.
   - Real-time search and category filtering.
   - 1-click booking CTA on every service item.

5. **Appointment Request & WhatsApp Direct Workflow**:
   - Collects Customer Name, WhatsApp Phone, Requested Service, Preferred Date & Preferred Time Slot, and Notes.
   - Live client-side validation.
   - Generates a correctly URL-encoded, formatted WhatsApp message addressed to **+91 7387268299**.
   - Displays clear "Appointment Request Submitted" modal (never false "Confirmed" or "Message Sent").
   - Direct button: **Continue on WhatsApp with Pre-filled Request**.

6. **Protected Administration Dashboard**:
   - Accessible via "Owner Login" in the footer.
   - Protected with admin passcode (Demo default: `amruta2026`, configurable in `js/config.js`).
   - Summary statistics (Total, Pending, Confirmed, Enquiries).
   - Live search & filter by status.
   - 1-click status dropdown updates (*Pending*, *Confirmed*, *Reschedule*, *Cancelled*, *Completed*).
   - Export appointment requests to CSV.
   - Real-time Service Pricing Manager.

7. **Configurable Address & Map**:
   - `BUSINESS_ADDRESS`, `GOOGLE_MAPS_URL`, and `OPENING_HOURS` configurable in `js/config.js`.
   - Graceful notice displayed when map location is not yet published.

8. **Modern Web Standards & Accessibility**:
   - Native `<dialog closedby="any">` modal implementation.
   - Light-dismiss fallback for cross-browser backdrop dismissal.
   - Mobile-first responsive design tested for Android & iPhone.

---

##  Project Structure

```text
Amruta's Beauty/
├── index.html                   # Main luxury website
├── css/
│   └── styles.css               # Luxury design system & responsive styling
├── js/
│   ├── config.js                # Centralized settings & contact configuration
│   └── app.js                   # Application logic, slider, WhatsApp, admin
├── assets/
│   └── images/
│       ├── owner/               # Amruta Boarde portrait
│       ├── branding/            # Official gold logo & emblem
│       ├── bridal/              # Real bridal portfolio photographs
│       ├── before-after/        # Paired before-and-after transformations
│       ├── party/               # Party, sangeet & reception styling
│       ├── studio/              # In-action studio makeup sessions
│       └── hair/                # Hair artistry & prep
├── supabase/
│   └── migrations/
│       └── 01_initial_schema.sql # PostgreSQL schema, RLS policies & initial seeds
├── render.yaml                  # Render deployment configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
└── README.md                    # Documentation
```

---

##  Quick Start / Local Preview

1. **Directly open in browser**:
   Double click `index.html` in file explorer or open it with any web browser (Chrome, Edge, Safari, Firefox).
   The website is completely self-contained with no build step required.

2. **Using a local web server (optional)**:
   ```bash
   # Using Python
   python -m http.server 3000

   # Or using Node npx
   npx serve .
   ```
   Then visit `http://localhost:3000`.

---

## ️ Supabase Database Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/01_initial_schema.sql` and run the script.
4. It creates:
   - `services` table with initial seeded services and prices.
   - `appointment_requests` table with status constraints.
   - `enquiries` table for client inquiries.
   - Row Level Security (RLS) policies allowing public inserts and authenticated admin updates.
5. In `js/config.js`, set your `supabaseUrl` and `supabaseAnonKey`.

---

##  Render Deployment

1. Push this repository to GitHub.
2. In [render.com](https://render.com), click **New +** -&gt; **Blueprint** and select your repository (it will automatically detect `render.yaml`).
3. Or create a **Static Site** on Render with:
   - **Build Command**: *(leave empty)*
   - **Publish Directory**: `./`
4. Click **Deploy**. Your luxury website will be live with free HTTPS and global CDN.

---

##  Owner Admin Passcode

- Default Demo Passcode: `amruta2026`
- To change, edit `adminPasscode` in `js/config.js` or set `ADMIN_PASSCODE` in `.env`.
