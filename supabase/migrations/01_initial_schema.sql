-- Supabase Schema Migration: Amruta Boarde Makeup Artist
-- Database initialization for services, appointment requests, enquiries, and RLS policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Services Table
create table if not exists public.services (
    id uuid primary key default uuid_generate_v4(),
    service_name text not null,
    category text not null,
    description text,
    price text not null,
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Appointment Requests Table
create table if not exists public.appointment_requests (
    id uuid primary key default uuid_generate_v4(),
    customer_name text not null,
    customer_phone text not null,
    requested_service text not null,
    preferred_date date not null,
    preferred_time text not null,
    customer_message text,
    status text not null default 'pending_confirmation' check (
        status in (
            'pending_confirmation',
            'confirmed',
            'rescheduling_requested',
            'cancellation_requested',
            'completed',
            'cancelled'
        )
    ),
    source text not null default 'website_form',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enquiries and Leads Table
create table if not exists public.enquiries (
    id uuid primary key default uuid_generate_v4(),
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    requested_service text,
    enquiry_message text not null,
    preferred_contact_method text default 'whatsapp' check (
        preferred_contact_method in ('whatsapp', 'phone', 'email')
    ),
    contact_consent boolean default true,
    status text not null default 'new' check (
        status in ('new', 'contacted', 'converted', 'closed')
    ),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index if not exists idx_services_category on public.services(category);
create index if not exists idx_services_active on public.services(active);
create index if not exists idx_appointments_status on public.appointment_requests(status);
create index if not exists idx_appointments_date on public.appointment_requests(preferred_date);
create index if not exists idx_enquiries_status on public.enquiries(status);

-- Enable Row Level Security (RLS)
alter table public.services enable row level security;
alter table public.appointment_requests enable row level security;
alter table public.enquiries enable row level security;

-- RLS Policies: Services
-- Public can view active services
create policy "Allow public read access to active services"
    on public.services for select
    using (active = true);

-- Authenticated admins can manage all services
create policy "Allow authenticated admin full access to services"
    on public.services for all
    to authenticated
    using (true)
    with check (true);

-- RLS Policies: Appointment Requests
-- Anyone can submit an appointment request from the website
create policy "Allow public insert into appointment_requests"
    on public.appointment_requests for insert
    with check (true);

-- Website owner dashboard can read appointment requests
create policy "Allow public select on appointment_requests"
    on public.appointment_requests for select
    using (true);

-- Website owner dashboard can update appointment statuses
create policy "Allow public update on appointment_requests"
    on public.appointment_requests for update
    using (true)
    with check (true);

-- Authenticated admins have full access
create policy "Allow authenticated admin full access to appointments"
    on public.appointment_requests for all
    to authenticated
    using (true)
    with check (true);

-- RLS Policies: Enquiries
-- Anyone can submit an enquiry
create policy "Allow public insert into enquiries"
    on public.enquiries for insert
    with check (true);

-- Website owner dashboard can read enquiries
create policy "Allow public select on enquiries"
    on public.enquiries for select
    using (true);

-- Website owner dashboard can update enquiry status
create policy "Allow public update on enquiries"
    on public.enquiries for update
    using (true)
    with check (true);

-- Authenticated admins have full access
create policy "Allow authenticated admin full access to enquiries"
    on public.enquiries for all
    to authenticated
    using (true)
    with check (true);

-- Trigger to auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger tr_services_updated_at
    before update on public.services
    for each row execute function public.handle_updated_at();

create trigger tr_appointments_updated_at
    before update on public.appointment_requests
    for each row execute function public.handle_updated_at();

create trigger tr_enquiries_updated_at
    before update on public.enquiries
    for each row execute function public.handle_updated_at();

-- Seed initial services and official pricing
insert into public.services (service_name, category, description, price, active) values
-- Skincare and Facial Services
('Eyebrow', 'Skincare and Facial Services', 'Precise eyebrow shaping for neat, defined brows', '₹30', true),
('Fruit Cleanup', 'Skincare and Facial Services', 'Refreshing natural fruit cleanup for radiant and clear skin', '₹300', true),
('Upper Lips', 'Skincare and Facial Services', 'Quick and hygienic hair removal for upper lips', '₹15', true),
('Fruit Facial', 'Skincare and Facial Services', 'Nourishing facial with fruit extracts to rejuvenate and hydrate', '₹500', true),
('Forehead', 'Skincare and Facial Services', 'Clean and gentle forehead threading', '₹15', true),
('Fruit Bleach', 'Skincare and Facial Services', 'Gentle fruit-infused bleach to lighten facial hair naturally', '₹150', true),
('D-Tan', 'Skincare and Facial Services', 'Effective de-tanning treatment to restore your natural skin glow', '₹200', true),
('Face Wax', 'Skincare and Facial Services', 'Smooth and gentle face waxing for lasting hair-free radiance', '₹200', true),
('Arms Bleach', 'Skincare and Facial Services', 'Skin tone evening bleach treatment for full arms', '₹150', true),
('Arms D-Tan', 'Skincare and Facial Services', 'Targeted tan removal treatment for glowing arms', '₹250', true),
('Raga Facial', 'Skincare and Facial Services', 'Premium Raga therapeutic facial for deep renewal and luminous skin', '₹700', true),
('Aroma Facial', 'Skincare and Facial Services', 'Relaxing aroma oil therapy facial to nourish and calm the skin', '₹500', true),
('Hand Polishing', 'Skincare and Facial Services', 'Deep exfoliation, hydration, and polishing treatment for soft hands', '₹300', true),

-- Waxing and Body Care
('Waxing', 'Waxing and Body Care', 'Custom waxing treatment tailored to your skin type', 'Contact for price', true),
('Full Arms + Underarms', 'Waxing and Body Care', 'Complete arms and underarm waxing for satin-smooth finish', '₹150', true),
('Half Legs', 'Waxing and Body Care', 'Knee-down waxing for clean and smooth legs', '₹150', true),
('Full Legs', 'Waxing and Body Care', 'Thorough full-leg waxing for ultra-smooth skin', '₹300', true),
('Head Massage', 'Waxing and Body Care', 'Rejuvenating acupressure oil massage to relieve stress and tension', '₹200', true),
('Full Body Massage', 'Waxing and Body Care', 'Deeply relaxing full body therapeutic massage', '₹1,000', true),
('Foot Massage', 'Waxing and Body Care', 'Soothing foot reflexology and relaxation massage', '₹150', true),
('Leg Polishing', 'Waxing and Body Care', 'Gentle exfoliation and luminous glow polishing for legs', '₹400', true),
('Full Body Polishing', 'Waxing and Body Care', 'Luxurious full body exfoliating scrub, wrap, and glow treatment', '₹1,000', true),

-- Nail Care
('Manicure', 'Nail Care', 'Comprehensive cuticle care, nail shaping, hand massage, and polish', '₹250', true),
('Pedicure', 'Nail Care', 'Deep foot soak, callus care, gentle exfoliation, massage, and nail polish', '₹350', true),

-- Hair Services
('Hair Spa Matrix', 'Hair Services', 'Intense moisture and protein conditioning spa treatment by Matrix', '₹500', true),
('Hair Spa Keratin', 'Hair Services', 'Restorative keratin therapy for silky smooth, frizz-free hair', '₹700', true),
('Hair Cutting', 'Hair Services', 'Custom haircut and style to complement your facial structure', '₹350', true),
('Head Wash', 'Hair Services', 'Cleansing shampoo and conditioning wash', '₹150', true),
('Root Touch Up', 'Hair Services', 'Flawless grey coverage and root color touch up', '₹500', true),
('Head Wash + Blow Dry', 'Hair Services', 'Luxurious head wash followed by professional blowout and styling', '₹250', true),

-- Mehndi Services
('Arabic Mehndi', 'Mehndi Services', 'Graceful Arabic floral and geometric mehndi patterns', '₹250', true),
('Bridal Mehndi', 'Mehndi Services', 'Intricate, high-detail traditional bridal mehndi up to elbows & feet', '₹2,000', true);
