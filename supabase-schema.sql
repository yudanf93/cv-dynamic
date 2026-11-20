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
-- 12. SEED DUMMY DATA (Mahasiswa UGM Jurusan Manajemen - FEB UGM)
-- ==============================================================================

DO $$
DECLARE
    v_profile_id UUID;
    v_exp_unilever UUID;
    v_exp_mandiri UUID;
    v_exp_ikamma UUID;
BEGIN
    -- Masukkan Profil Utama
    INSERT INTO cv_profiles (slug, name, location, phone, email, portfolio, showcase, linkedin, gitlab, photo_url)
    VALUES (
        'primary',
        'Dimas Arya Wijaya',
        'Sleman, D.I. Yogyakarta (Open to On-site & Hybrid)',
        '+62 812-9876-5432',
        'dimas.arya.wijaya@mail.ugm.ac.id',
        'https://dimaswijaya.com',
        'https://dimaswijaya.com/portfolio',
        'https://linkedin.com/in/dimas-arya-wijaya-dummy',
        'https://github.com/dimas-arya-wijaya',
        'assets/profile.jpg'
    )
    ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        location = EXCLUDED.location,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        portfolio = EXCLUDED.portfolio,
        showcase = EXCLUDED.showcase,
        linkedin = EXCLUDED.linkedin,
        gitlab = EXCLUDED.gitlab
    RETURNING id INTO v_profile_id;

    -- Titles
    INSERT INTO cv_titles (profile_id, focus, title_en, title_id)
    VALUES 
        (v_profile_id, 'frontend', 'Business Development & Marketing Specialist', 'Spesialis Pengembangan Bisnis & Pemasaran'),
        (v_profile_id, 'fullstack', 'Corporate Finance & Operations Analyst', 'Analis Keuangan Korporasi & Manajemen Operasional')
    ON CONFLICT (profile_id, focus) DO UPDATE SET title_en = EXCLUDED.title_en, title_id = EXCLUDED.title_id;

    -- Summaries
    INSERT INTO cv_summaries (profile_id, focus, summary_en, summary_id)
    VALUES 
        (v_profile_id, 'frontend', 
         'Final-year Management student at Faculty of Economics and Business, Universitas Gadjah Mada (FEB UGM) with 3.86/4.00 GPA, specializing in Strategic Marketing and Market Expansion. Proven track record in national business case competitions and brand activation internships at multinational FMCG. Adept at customer journey mapping, competitor intelligence, digital campaign ROI optimization, and cross-functional leadership.',
         'Mahasiswa tingkat akhir Jurusan Manajemen Fakultas Ekonomika dan Bisnis Universitas Gadjah Mada (FEB UGM) dengan IPK 3,86/4,00, peminatan Manajemen Pemasaran dan Ekspansi Bisnis. Berpengalaman dalam kejuaraan kompetisi business case nasional serta magang aktivasi merek di perusahaan FMCG multinasional. Terampil dalam riset konsumen, pemetaan pesaing, analisis ROI kampanye, dan kepemimpinan tim lintas divisi.'),
        (v_profile_id, 'fullstack',
         'Management undergraduate at Universitas Gadjah Mada (FEB UGM) focusing on Corporate Finance and Operational Strategy (GPA: 3.86/4.00). Experienced in corporate loan evaluation, financial statement forecasting, and cost-benefit feasibility studies from commercial banking internships. Highly proficient in financial modeling (DCF/NPV), budgeting, working capital analysis, and ERP workflow coordination.',
         'Mahasiswa Jurusan Manajemen Universitas Gadjah Mada (FEB UGM) dengan fokus Keuangan Korporat dan Manajemen Operasional (IPK: 3,86/4,00). Berpengalaman dalam analisis kelayakan kredit korporasi, peramalan laporan keuangan, dan studi kelayakan biaya-manfaat melalui magang di perbankan nasional. Mahir dalam pemodelan keuangan (DCF/NPV), budgeting, manajemen modal kerja, dan koordinasi sistem ERP.')
    ON CONFLICT (profile_id, focus) DO UPDATE SET summary_en = EXCLUDED.summary_en, summary_id = EXCLUDED.summary_id;

    -- Hapus data child lama jika ada agar seed idempotent
    DELETE FROM cv_skills WHERE profile_id = v_profile_id;
    DELETE FROM cv_experiences WHERE profile_id = v_profile_id;
    DELETE FROM cv_projects WHERE profile_id = v_profile_id;
    DELETE FROM cv_educations WHERE profile_id = v_profile_id;

    -- Skills
    INSERT INTO cv_skills (profile_id, label_en, label_id, items, sort_order)
    VALUES
        (v_profile_id, 'Business Strategy & Marketing', 'Strategi Bisnis & Pemasaran', 'Market Research & Sizing (TAM/SAM/SOM), Brand Activation, Consumer Behavior Analysis, Go-To-Market (GTM) Strategy, Growth Marketing, SWOT & Porter''s Five Forces', 1),
        (v_profile_id, 'Financial Analysis & Valuation', 'Analisis Keuangan & Valuasi', 'Discounted Cash Flow (DCF), Financial Statement Forecasting, Capital Budgeting, Cost-Benefit Analysis, Ratio & Sensitivity Analysis, Credit Assessment', 2),
        (v_profile_id, 'Operations & Project Management', 'Manajemen Operasional & Proyek', 'Supply Chain Fundamentals, Agile & Scrum, Lean Operations, Risk Assessment, Key Performance Indicators (KPI) Tracking, SAP/ERP Basics', 3),
        (v_profile_id, 'Tools & Data Analytics', 'Perangkat Analisis & Data', 'Advanced Microsoft Excel (VLOOKUP, Pivot, What-If Analysis, Solver), Tableau, Power BI, SPSS, Google Analytics, Pitch Deck Design (Canva/Figma)', 4);

    -- Experience 1: PT Unilever Indonesia Tbk
    INSERT INTO cv_experiences (profile_id, identifier, company, location, type_en, type_id, period_en, period_id, role_en, role_id, sort_order)
    VALUES (v_profile_id, 'unilever-indonesia', 'PT Unilever Indonesia Tbk', 'Tangerang / Hybrid', 'Internship', 'Magang', 'Jul 2025 – Dec 2025', 'Jul 2025 – Des 2025', 'Brand Marketing & Trade Promotion Intern', 'Intern Manajemen Merek & Promosi Perdagangan', 1)
    RETURNING id INTO v_exp_unilever;

    -- Bullets Unilever (Frontend - Marketing Focus)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_unilever, 'frontend', 'Spearheaded brand activation execution across 14 key modern retail accounts in Java, contributing to a 12% quarterly sales volume lift.', 'Memimpin eksekusi aktivasi merek di 14 jaringan ritel modern utama wilayah Jawa, berkontribusi pada peningkatan volume penjualan sebesar 12% kuartalan.', 1),
        (v_exp_unilever, 'frontend', 'Synthesized retail audit scanner data (NielsenIQ) and shopper demographic insights to formulate localized promotional calendar.', 'Menganalisis data audit ritel (NielsenIQ) dan demografi pembeli untuk merumuskan jadwal promosi tematik yang tepat sasaran.', 2),
        (v_exp_unilever, 'frontend', 'Collaborated with creative agencies, logistics distributors, and legal teams to guarantee 100% on-time deployment of in-store POSM display materials.', 'Berkolaborasi dengan agensi kreatif, distributor logistik, dan tim legal untuk memastikan penyebaran materi promosi POSM tepat waktu.', 3);

    -- Bullets Unilever (Fullstack - Finance & Ops Focus)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_unilever, 'fullstack', 'Monitored and reconciled brand marketing expenditures against allocated quarterly budget of IDR 3.2 Billion, achieving zero budget overshoot.', 'Memantau dan merekonsiliasi pengeluaran pemasaran merek terhadap anggaran kuartalan sebesar Rp 3,2 Miliar tanpa adanya over-budget.', 1),
        (v_exp_unilever, 'fullstack', 'Conducted post-campaign ROI evaluations and sensitivity analyses across promotional SKU bundles, identifying IDR 180 Million in cost-saving efficiencies.', 'Melakukan evaluasi ROI dan analisis sensitivitas pasca-kampanye pada bundel produk, mengidentifikasi potensi efisiensi biaya sebesar Rp 180 Juta.', 2),
        (v_exp_unilever, 'fullstack', 'Streamlined weekly inventory stock reconciliation with third-party distribution hubs, mitigating out-of-stock risk during festive promotions.', 'Mengoptimalkan rekonsiliasi stok inventaris mingguan dengan pusat distribusi, meminimalkan risiko kehabisan stok saat periode puncak promosi.', 3);

    -- Experience 2: PT Bank Mandiri (Persero) Tbk
    INSERT INTO cv_experiences (profile_id, identifier, company, location, type_en, type_id, period_en, period_id, role_en, role_id, sort_order)
    VALUES (v_profile_id, 'bank-mandiri', 'PT Bank Mandiri (Persero) Tbk', 'Yogyakarta, Indonesia', 'Internship', 'Magang', 'Jan 2025 – Jun 2025', 'Jan 2025 – Jun 2025', 'Commercial Banking Credit Analyst Intern', 'Intern Analis Kredit Perbankan Komersial', 2)
    RETURNING id INTO v_exp_mandiri;

    -- Bullets Bank Mandiri (Frontend - Strategy Focus)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_mandiri, 'frontend', 'Synthesized macroeconomic and regional industry sector reports to assess market competitiveness for prospective commercial borrowers.', 'Menyusun laporan kondisi makroekonomi dan sektor industri regional untuk menilai daya saing pasar calon debitur komersial.', 1),
        (v_exp_mandiri, 'frontend', 'Co-authored client credit proposals and presentation decks delivered to the Regional Credit Committee for facilities totaling IDR 45 Billion.', 'Turut menyusun proposal kredit dan materi presentasi bagi Komite Kredit Regional untuk fasilitas pembiayaan senilai total Rp 45 Miliar.', 2);

    -- Bullets Bank Mandiri (Fullstack - Finance Focus)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_mandiri, 'fullstack', 'Built multi-scenario cash flow forecast models and debt service coverage ratio (DSCR) calculations for manufacturing and agro-industry clients.', 'Membangun model proyeksi arus kas multi-skenario dan rasio kecukupan pelunasan utang (DSCR) untuk nasabah sektor manufaktur dan agroindustri.', 1),
        (v_exp_mandiri, 'fullstack', 'Audited historical financial statements (3-year trends) and verified legal covenant compliance for an active commercial borrower portfolio.', 'Mengaudit tren laporan keuangan historis (3 tahun) dan memverifikasi kepatuhan persyaratan kredit pada portofolio debitur aktif.', 2);

    -- Experience 3: Ikatan Keluarga Mahasiswa Manajemen (IKAMMA) FEB UGM
    INSERT INTO cv_experiences (profile_id, identifier, company, location, type_en, type_id, period_en, period_id, role_en, role_id, sort_order)
    VALUES (v_profile_id, 'ikamma-ugm', 'IKAMMA FEB UGM', 'Yogyakarta, Indonesia', 'Organization', 'Organisasi', 'Jan 2024 – Dec 2024', 'Jan 2024 – Des 2024', 'Head of Business Development & Partnership', 'Kepala Departemen Pengembangan Bisnis & Kemitraan', 3)
    RETURNING id INTO v_exp_ikamma;

    -- Bullets IKAMMA UGM (Frontend)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_ikamma, 'frontend', 'Formulated enterprise sponsorship pitching strategy, securing IDR 210 Million in cash and in-kind partnerships from 11 corporate sponsors.', 'Merumuskan strategi proposal sponsor korporasi, menghimpun pendanaan kemitraan senilai Rp 210 Juta dari 11 sponsor perusahaan nasional.', 1),
        (v_exp_ikamma, 'frontend', 'Led a committee team of 16 students organizing the flagship Gadjah Mada Business Case Competition (GMBCC) with 250+ delegates from ASEAN universities.', 'Memimpin tim panitia 16 mahasiswa dalam menyelenggarakan Gadjah Mada Business Case Competition (GMBCC) dengan 250+ delegasi dari kampus se-ASEAN.', 2);

    -- Bullets IKAMMA UGM (Fullstack)
    INSERT INTO cv_experience_bullets (experience_id, focus, text_en, text_id, sort_order) VALUES
        (v_exp_ikamma, 'fullstack', 'Managed overall organizational operating budget of IDR 350 Million with comprehensive financial transparency audits and post-event reporting.', 'Mengelola total anggaran operasional organisasi sebesar Rp 350 Juta dengan audit transparansi finansial dan pelaporan pertanggungjawaban lengkap.', 1),
        (v_exp_ikamma, 'fullstack', 'Standardized procurement workflow and event vendor contracts, negotiating bulk price discounts that reduced operational expenditures by 15%.', 'Menstandarkan alur pengadaan logistik dan kontrak vendor acara, menegosiasikan potongan harga yang menghemat biaya pengeluaran operasional hingga 15%.', 2);

    -- Projects & Case Competitions
    INSERT INTO cv_projects (profile_id, name, stack, url, desc_en, desc_id, sort_order)
    VALUES
        (v_profile_id, '1st Place Winner — National Business Case Competition 2025', 'Market Sizing, DCF Valuation, GTM Strategy, Pitch Deck', 'https://gmbcc.feb.ugm.ac.id',
         'Champion among 140+ university teams across Indonesia; crafted a comprehensive 5-year market expansion and digital ecosystem adoption strategy for a prominent financial institution.',
         'Juara 1 di antara 140+ tim universitas se-Indonesia; merancang strategi penetrasi pasar 5 tahun dan adopsi ekosistem digital untuk institusi perbankan nasional terkemuka.', 1),
        (v_profile_id, 'SME Financial Restructuring & Digital Marketing Consulting', 'Financial Literacy, Cost Accounting, POS Digitalization', 'https://feb.ugm.ac.id/pengabdian',
         'Conducted community consulting project for 8 culinary MSMEs in Sleman, establishing digital bookkeeping workflows and reducing inventory ingredient waste by 18%.',
         'Menjalankan proyek konsultasi pemberdayaan 8 UMKM kuliner di Sleman, mengimplementasikan pencatatan keuangan digital dan menekan pemborosan bahan baku hingga 18%.', 2),
        (v_profile_id, 'ESG Branding & Gen-Z Consumer Purchase Intention Research', 'SPSS, Structural Equation Modeling, Survey Design', 'https://etd.repository.ugm.ac.id',
         'Undergraduate capstone research examining the empirical impact of corporate sustainability initiatives on purchasing decisions among 420 surveyed millennial and Gen-Z consumers in Java.',
         'Riset terapan skripsi yang menguji pengaruh inisiatif keberlanjutan (ESG) korporasi terhadap keputusan pembelian pada 420 responden konsumen generasi muda di Pulau Jawa.', 3);

    -- Education
    INSERT INTO cv_educations (profile_id, school, degree_en, degree_id, period, sort_order)
    VALUES
        (v_profile_id, 'Universitas Gadjah Mada (UGM)', 'Bachelor of Economics (S.M.) in Management — Faculty of Economics and Business (FEB)', 'Sarjana Manajemen (S.M.) — Fakultas Ekonomika dan Bisnis (FEB)', '2022 – Present (Expected: 2026)', 1),
        (v_profile_id, 'SMA Negeri 3 Yogyakarta', 'High School Diploma in Social Sciences (IPS)', 'Sekolah Menengah Atas (Jurusan IPS)', '2019 – 2022', 2);

END $$;
