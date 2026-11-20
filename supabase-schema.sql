-- ==============================================================================
-- SCHEMA CV BUILDER RELASIONAL TERNORMALISASI (OPSI B - ENTERPRISE GRADE)
-- PostgreSQL / Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFILES (Header & Identitas)
CREATE TABLE IF NOT EXISTS cv_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL DEFAULT 'primary',
    name TEXT NOT NULL,
    location TEXT,
    phone TEXT,
    email TEXT,
    portfolio TEXT,
    showcase TEXT,
    linkedin TEXT,
    gitlab TEXT,
    photo_url TEXT DEFAULT 'assets/profile.jpg',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL TITLES (Bilingual Title per Focus: Frontend & Fullstack)
CREATE TABLE IF NOT EXISTS cv_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    focus TEXT NOT NULL CHECK (focus IN ('frontend', 'fullstack')),
    title_en TEXT NOT NULL,
    title_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_profile_title_focus UNIQUE (profile_id, focus)
);

-- 4. TABEL SUMMARIES (Bilingual Summary per Focus: Frontend & Fullstack)
CREATE TABLE IF NOT EXISTS cv_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    focus TEXT NOT NULL CHECK (focus IN ('frontend', 'fullstack')),
    summary_en TEXT NOT NULL,
    summary_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_profile_summary_focus UNIQUE (profile_id, focus)
);

-- 5. TABEL SKILLS (Kategori Keahlian & Items)
CREATE TABLE IF NOT EXISTS cv_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    label_en TEXT NOT NULL,
    label_id TEXT NOT NULL,
    items TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABEL EXPERIENCES (Pengalaman Kerja)
CREATE TABLE IF NOT EXISTS cv_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL, -- e.g. 'nusantara-cloud'
    company TEXT NOT NULL,
    location TEXT,
    type_en TEXT NOT NULL DEFAULT 'Full-Time',
    type_id TEXT NOT NULL DEFAULT 'Full-Time',
    period_en TEXT NOT NULL,
    period_id TEXT NOT NULL,
    role_en TEXT NOT NULL,
    role_id TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABEL EXPERIENCE BULLETS (Poin-poin Pekerjaan per Focus & Bilingual)
CREATE TABLE IF NOT EXISTS cv_experience_bullets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES cv_experiences(id) ON DELETE CASCADE,
    focus TEXT NOT NULL CHECK (focus IN ('frontend', 'fullstack')),
    text_en TEXT NOT NULL,
    text_id TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABEL PROJECTS (Portofolio & Proyek)
CREATE TABLE IF NOT EXISTS cv_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stack TEXT NOT NULL,
    url TEXT,
    desc_en TEXT NOT NULL,
    desc_id TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. TABEL EDUCATION (Pendidikan)
CREATE TABLE IF NOT EXISTS cv_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
    school TEXT NOT NULL,
    degree_en TEXT NOT NULL,
    degree_id TEXT NOT NULL,
    period TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. INDEXES UNTUK PERFORMA QUERY
CREATE INDEX IF NOT EXISTS idx_titles_profile ON cv_titles(profile_id);
CREATE INDEX IF NOT EXISTS idx_summaries_profile ON cv_summaries(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_profile_order ON cv_skills(profile_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_exp_profile_order ON cv_experiences(profile_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_exp_bullets ON cv_experience_bullets(experience_id, focus, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_profile_order ON cv_projects(profile_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_edu_profile_order ON cv_educations(profile_id, sort_order);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Publik/Recruiter: Hanya Read (SELECT)
-- Pemilik/Admin (Authenticated): Bebas CRUD (SELECT, INSERT, UPDATE, DELETE)

ALTER TABLE cv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_experience_bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_educations ENABLE ROW LEVEL SECURITY;

-- Policy SELECT untuk Public (Anon)
CREATE POLICY "Public read cv_profiles" ON cv_profiles FOR SELECT USING (true);
CREATE POLICY "Public read cv_titles" ON cv_titles FOR SELECT USING (true);
CREATE POLICY "Public read cv_summaries" ON cv_summaries FOR SELECT USING (true);
CREATE POLICY "Public read cv_skills" ON cv_skills FOR SELECT USING (true);
CREATE POLICY "Public read cv_experiences" ON cv_experiences FOR SELECT USING (true);
CREATE POLICY "Public read cv_experience_bullets" ON cv_experience_bullets FOR SELECT USING (true);
CREATE POLICY "Public read cv_projects" ON cv_projects FOR SELECT USING (true);
CREATE POLICY "Public read cv_educations" ON cv_educations FOR SELECT USING (true);

-- Policy CRUD untuk Authenticated User (Admin)
CREATE POLICY "Auth manage cv_profiles" ON cv_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage cv_titles" ON cv_titles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage cv_summaries" ON cv_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage cv_skills" ON cv_skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage cv_experiences" ON cv_experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage cv_experience_bullets" ON cv_experience_bullets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage cv_projects" ON cv_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage cv_educations" ON cv_educations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 12. SEED DUMMY DATA (Alex Pratama)
-- ==============================================================================

DO $$
DECLARE
    v_profile_id UUID;
    v_exp_nc UUID;
    v_exp_ft UUID;
    v_exp_di UUID;
BEGIN
    -- Masukkan Profil Utama
    INSERT INTO cv_profiles (slug, name, location, phone, email, portfolio, showcase, linkedin, gitlab, photo_url)
    VALUES (
        'primary',
        'Alex Pratama',
        'Jakarta, Indonesia (Open to Remote)',
        '+62 812-3456-7890',
        'alex.pratama@example.com',
        'https://alexpratama.dev',
        'https://alexpratama.dev/showcase',
        'https://linkedin.com/in/alexpratama-dummy',
        'https://gitlab.com/alexpratama-dummy',
        'assets/profile.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_profile_id;

    -- Titles
    INSERT INTO cv_titles (profile_id, focus, title_en, title_id)
    VALUES 
        (v_profile_id, 'frontend', 'Senior Frontend Engineer', 'Senior Frontend Engineer'),
        (v_profile_id, 'fullstack', 'Fullstack Software Engineer', 'Fullstack Software Engineer')
    ON CONFLICT (profile_id, focus) DO UPDATE SET title_en = EXCLUDED.title_en, title_id = EXCLUDED.title_id;

    -- Summaries
    INSERT INTO cv_summaries (profile_id, focus, summary_en, summary_id)
    VALUES 
        (v_profile_id, 'frontend', 
         'Frontend-focused Software Engineer with 5+ years of experience building scalable, responsive web portals, enterprise design systems, and commercial SaaS applications. Specialized in React, TypeScript, Vue.js, Next.js, Tailwind CSS, and performance optimization with deep understanding of RESTful/GraphQL integrations and web accessibility.',
         'Frontend Software Engineer dengan pengalaman 5+ tahun dalam membangun portal web berskala besar, sistem desain enterprise, dan aplikasi SaaS komersial. Menguasai React, TypeScript, Vue.js, Next.js, Tailwind CSS, dan optimasi performa web dengan pemahaman mendalam tentang integrasi RESTful/GraphQL dan aksesibilitas web.'),
        (v_profile_id, 'fullstack',
         'Fullstack Software Engineer with 5+ years of experience engineering distributed backend services and intuitive modern interfaces. Proficient in Node.js, Go, PostgreSQL, React, TypeScript, and Docker containerization, with solid background in building secure role-based access systems (RBAC) and payment gateway workflows.',
         'Fullstack Software Engineer dengan pengalaman 5+ tahun dalam merancang layanan backend terdistribusi dan antarmuka web modern yang intuitif. Mahir menggunakan Node.js, Go, PostgreSQL, React, TypeScript, dan kontainerisasi Docker, dengan rekam jejak kuat dalam membangun sistem hak akses (RBAC) aman dan alur pembayaran digital.')
    ON CONFLICT (profile_id, focus) DO UPDATE SET summary_en = EXCLUDED.summary_en, summary_id = EXCLUDED.summary_id;

    -- Hapus data child lama jika ada agar seed idempotent
    DELETE FROM cv_skills WHERE profile_id = v_profile_id;
    DELETE FROM cv_experiences WHERE profile_id = v_profile_id;
    DELETE FROM cv_projects WHERE profile_id = v_profile_id;
    DELETE FROM cv_educations WHERE profile_id = v_profile_id;

    -- Skills
    INSERT INTO cv_skills (profile_id, label_en, label_id, items, sort_order)
    VALUES
        (v_profile_id, 'Frontend & UI Engineering', 'Frontend & Rekayasa UI', 'React, TypeScript, Vue.js, Next.js, Tailwind CSS, HTML5/CSS3, State Management (Zustand/Redux), Responsive UI, Figma to Code, Jest, Vitest', 1),
        (v_profile_id, 'Backend, APIs & Databases', 'Backend, API & Basis Data', 'Node.js (Express/NestJS), Go (Gin/Echo), RESTful API Architecture, GraphQL, PostgreSQL, MySQL, Redis, Supabase, Prisma ORM', 2),
        (v_profile_id, 'Architecture, Security & QA', 'Arsitektur, Keamanan & QA', 'Clean Architecture, Role-Based Access Control (RBAC), OAuth 2.0 / JWT, Web Security (CORS, CSP, XSS), CI/CD, Unit & Integration Testing', 3),
        (v_profile_id, 'DevOps & Tooling', 'DevOps & Perangkat Lunak', 'Git, GitHub Actions, Docker, Linux, Netlify, Vercel, Postman, Swagger, Agile / Scrum Workflow', 4);

    -- Experience 1: PT Nusantara Cloud Solutions
    INSERT INTO cv_experiences (profile_id, identifier, company, location, type_en, type_id, period_en, period_id, role_en, role_id, sort_order)
    VALUES (v_profile_id, 'nusantara-cloud', 'PT Nusantara Cloud Solutions', 'Jakarta, Indonesia', 'Full-Time', 'Full-Time', 'Jan 2023 – Present', 'Jan 2023 – Sekarang', 'Senior Frontend & Backend Engineer', 'Senior Frontend & Backend Engineer', 1)
    RETURNING id INTO v_exp_nc;

    -- Bullets Nusantara Cloud (Frontend)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_nc, 'frontend', 'Architected scalable component libraries and responsive web dashboards using React, TypeScript, and Tailwind CSS serving 100K+ monthly active users.', 'Merancang pustaka komponen berskala besar dan dashboard web responsif menggunakan React, TypeScript, dan Tailwind CSS untuk 100rb+ pengguna aktif bulanan.', 1),
        (v_exp_nc, 'frontend', 'Collaborated closely with product designers to convert complex Figma mockups into reusable, accessible, and high-performance UI components.', 'Berkolaborasi erat dengan desainer produk untuk menerjemahkan mockup Figma menjadi komponen UI yang dapat digunakan kembali, aksesibel, dan cepat.', 2),
        (v_exp_nc, 'frontend', 'Optimized client-side rendering performance and state management, reducing initial bundle size and page load time by 35%.', 'Mengoptimalkan performa rendering sisi klien dan manajemen state, mengurangi ukuran bundle awal dan waktu muat halaman sebesar 35%.', 3),
        (v_exp_nc, 'frontend', 'Integrated secure RESTful APIs and real-time WebSocket feeds for financial analytics and transaction monitoring.', 'Mengintegrasikan RESTful API yang aman dan aliran data real-time WebSocket untuk modul analitik keuangan dan pemantauan transaksi.', 4);

    -- Bullets Nusantara Cloud (Fullstack)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_nc, 'fullstack', 'Engineered resilient microservices using Go and Node.js backed by PostgreSQL and Redis caching layers.', 'Mengembangkan layanan microservice tangguh menggunakan Go dan Node.js didukung basis data PostgreSQL dan layer caching Redis.', 1),
        (v_exp_nc, 'fullstack', 'Spearheaded the migration of monolithic endpoints to modular RESTful APIs with automated API documentation via OpenAPI/Swagger.', 'Memimpin migrasi endpoint monolitik ke RESTful API modular yang terdokumentasi otomatis menggunakan OpenAPI/Swagger.', 2),
        (v_exp_nc, 'fullstack', 'Implemented comprehensive Role-Based Access Control (RBAC) and audit trail logging to satisfy regulatory enterprise compliance.', 'Mengimplementasikan sistem hak akses berbasis peran (RBAC) dan pencatatan riwayat audit untuk memenuhi kepatuhan standar enterprise.', 3),
        (v_exp_nc, 'fullstack', 'Configured Dockerized deployment pipelines with GitHub Actions for zero-downtime releases on cloud infrastructure.', 'Mengonfigurasi alur deployment berbasis Docker dengan GitHub Actions untuk rilis berkelanjutan tanpa downtime di infrastruktur cloud.', 4);

    -- Experience 2: Fintech Solusi Utama
    INSERT INTO cv_experiences (profile_id, identifier, company, location, type_en, type_id, period_en, period_id, role_en, role_id, sort_order)
    VALUES (v_profile_id, 'fintech-solusi', 'Fintech Solusi Utama', 'Bandung, Indonesia (Remote)', 'Contract', 'Kontrak', 'Jun 2022 – Dec 2022', 'Jun 2022 – Des 2022', 'Fullstack Software Engineer', 'Fullstack Software Engineer', 2)
    RETURNING id INTO v_exp_ft;

    -- Bullets Fintech Solusi (Frontend)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_ft, 'frontend', 'Developed intuitive customer onboarding and identity verification (e-KYC) flows using Vue.js and Tailwind CSS.', 'Mengembangkan alur pendaftaran pengguna baru dan verifikasi identitas (e-KYC) yang intuitif menggunakan Vue.js dan Tailwind CSS.', 1),
        (v_exp_ft, 'frontend', 'Implemented strict form validation, error handling, and client-side payload sanitization for sensitive user inputs.', 'Menerapkan validasi formulir ketat, penanganan error interaktif, dan sanitasi data sisi klien untuk input pengguna yang sensitif.', 2);

    -- Bullets Fintech Solusi (Fullstack)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_ft, 'fullstack', 'Designed and implemented payment gateway webhooks and automated reconciliation services connecting multiple banking APIs.', 'Merancang dan mengimplementasikan webhook payment gateway serta modul rekonsiliasi otomatis yang terhubung ke beberapa API perbankan.', 1),
        (v_exp_ft, 'fullstack', 'Created robust idempotent transactional routines to eliminate duplicate payments during intermittent network latency.', 'Membangun alur transaksi idempoten untuk mencegah terjadinya pembayaran ganda saat terjadi gangguan jaringan.', 2);

    -- Experience 3: PT Digital Inovasi Mandiri
    INSERT INTO cv_experiences (profile_id, identifier, company, location, type_en, type_id, period_en, period_id, role_en, role_id, sort_order)
    VALUES (v_profile_id, 'digital-inovasi', 'PT Digital Inovasi Mandiri', 'Jakarta, Indonesia', 'Full-Time', 'Full-Time', 'Jan 2021 – May 2022', 'Jan 2021 – Mei 2022', 'Frontend Developer', 'Pengembang Frontend', 3)
    RETURNING id INTO v_exp_di;

    -- Bullets Digital Inovasi (Frontend)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_di, 'frontend', 'Built responsive e-commerce web applications and interactive landing pages using modern JavaScript (ES6+), HTML5, and CSS3.', 'Membangun aplikasi web e-commerce responsif dan landing page interaktif menggunakan JavaScript modern (ES6+), HTML5, dan CSS3.', 1),
        (v_exp_di, 'frontend', 'Integrated third-party analytics, customer support chat widgets, and social login authentication.', 'Mengintegrasikan layanan analitik pihak ketiga, widget obrolan bantuan pelanggan, dan autentikasi login media sosial.', 2);

    -- Bullets Digital Inovasi (Fullstack)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_di, 'fullstack', 'Contributed to back-office order management APIs using Node.js/Express and MySQL alongside frontend admin templates.', 'Berkontribusi dalam pembuatan API manajemen pesanan back-office menggunakan Node.js/Express dan MySQL serta template admin frontend.', 1);

    -- Projects
    INSERT INTO cv_projects (profile_id, name, stack, url, desc_en, desc_id, sort_order)
    VALUES
        (v_profile_id, 'Enterprise RBAC & Audit Platform', 'React, TypeScript, Tailwind CSS, PostgreSQL, Supabase', 'https://demo-rbac.example.com',
         'Production-ready administrative dashboard demonstrating granular Role-Based Access Control, live session revocation, activity audit logs, and internationalized UI (EN/ID).',
         'Dashboard administratif siap produksi dengan demonstrasi kontrol hak akses bertingkat (RBAC), pembatalan sesi aktif, pencatatan log audit, dan antarmuka multibahasa (EN/ID).', 1),
        (v_profile_id, 'Omnichannel Payment & Billing Engine', 'Go, PostgreSQL, Redis, Docker, Payment Gateway APIs', 'https://billing.example.com',
         'High-throughput transactional microservice supporting multi-vendor payment gateways, automated webhook retries, and real-time invoice generation.',
         'Microservice transaksi berkecepatan tinggi yang mendukung integrasi multi-vendor payment gateway, percobaan ulang webhook otomatis, dan pembuatan invoice real-time.', 2),
        (v_profile_id, 'Smart Citizen Public Services Portal', 'Vue.js, Nuxt.js, Tailwind CSS, REST APIs', 'https://portal.example.com',
         'Public-facing civic complaint and service request portal built with responsive, accessible layout and mobile-first navigation.',
         'Portal layanan publik dan pengaduan masyarakat berbasis web dengan tata letak responsif, standar aksesibilitas ramah pengguna, dan navigasi ramah seluler.', 3);

    -- Education
    INSERT INTO cv_educations (profile_id, school, degree_en, degree_id, period, sort_order)
    VALUES
        (v_profile_id, 'Universitas Teknologi Nusantara', 'Bachelor''s Degree in Computer Science', 'Sarjana (S1) Ilmu Komputer', '2018 – 2022', 1),
        (v_profile_id, 'Politeknik Digital Indonesia', 'Diploma in Informatics Engineering', 'Diploma (D3) Teknik Informatika', '2015 – 2018', 2);

END $$;
