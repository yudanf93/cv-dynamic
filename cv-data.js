window.CV_DATA = {
  header: {
    name: 'Alex Pratama',
    title: {
      frontend: {
        en: 'Senior Frontend Engineer',
        id: 'Senior Frontend Engineer',
      },
      fullstack: {
        en: 'Fullstack Software Engineer',
        id: 'Fullstack Software Engineer',
      },
    },
    location: 'Jakarta, Indonesia (Open to Remote)',
    phone: '+62 812-3456-7890',
    email: 'alex.pratama@example.com',
    portfolio: 'https://alexpratama.dev',
    showcase: 'https://alexpratama.dev/showcase',
    linkedin: 'https://linkedin.com/in/alexpratama-dummy',
    gitlab: 'https://gitlab.com/alexpratama-dummy',
    photo: 'assets/profile.jpg',
  },
  summary: {
    frontend: {
      en: 'Frontend-focused Software Engineer with 5+ years of experience building scalable, responsive web portals, enterprise design systems, and commercial SaaS applications. Specialized in React, TypeScript, Vue.js, Next.js, Tailwind CSS, and performance optimization with deep understanding of RESTful/GraphQL integrations and web accessibility.',
      id: 'Frontend Software Engineer dengan pengalaman 5+ tahun dalam membangun portal web berskala besar, sistem desain enterprise, dan aplikasi SaaS komersial. Menguasai React, TypeScript, Vue.js, Next.js, Tailwind CSS, dan optimasi performa web dengan pemahaman mendalam tentang integrasi RESTful/GraphQL dan aksesibilitas web.',
    },
    fullstack: {
      en: 'Fullstack Software Engineer with 5+ years of experience engineering distributed backend services and intuitive modern interfaces. Proficient in Node.js, Go, PostgreSQL, React, TypeScript, and Docker containerization, with solid background in building secure role-based access systems (RBAC) and payment gateway workflows.',
      id: 'Fullstack Software Engineer dengan pengalaman 5+ tahun dalam merancang layanan backend terdistribusi dan antarmuka web modern yang intuitif. Mahir menggunakan Node.js, Go, PostgreSQL, React, TypeScript, dan kontainerisasi Docker, dengan rekam jejak kuat dalam membangun sistem hak akses (RBAC) aman dan alur pembayaran digital.',
    },
  },
  skills: [
    {
      label: { en: 'Frontend & UI Engineering', id: 'Frontend & Rekayasa UI' },
      items:
        'React, TypeScript, Vue.js, Next.js, Tailwind CSS, HTML5/CSS3, State Management (Zustand/Redux), Responsive UI, Figma to Code, Jest, Vitest',
    },
    {
      label: { en: 'Backend, APIs & Databases', id: 'Backend, API & Basis Data' },
      items:
        'Node.js (Express/NestJS), Go (Gin/Echo), RESTful API Architecture, GraphQL, PostgreSQL, MySQL, Redis, Supabase, Prisma ORM',
    },
    {
      label: { en: 'Architecture, Security & QA', id: 'Arsitektur, Keamanan & QA' },
      items:
        'Clean Architecture, Role-Based Access Control (RBAC), OAuth 2.0 / JWT, Web Security (CORS, CSP, XSS), CI/CD, Unit & Integration Testing',
    },
    {
      label: { en: 'DevOps & Tooling', id: 'DevOps & Perangkat Lunak' },
      items:
        'Git, GitHub Actions, Docker, Linux, Netlify, Vercel, Postman, Swagger, Agile / Scrum Workflow',
    },
  ],
  experience: [
    {
      id: 'nusantara-cloud',
      role: {
        en: 'Senior Frontend & Backend Engineer',
        id: 'Senior Frontend & Backend Engineer',
      },
      company: 'PT Nusantara Cloud Solutions',
      type: { en: 'Full-Time', id: 'Full-Time' },
      period: { en: 'Jan 2023 – Present', id: 'Jan 2023 – Sekarang' },
      location: 'Jakarta, Indonesia',
      bullets: {
        frontend: {
          en: [
            'Architected scalable component libraries and responsive web dashboards using React, TypeScript, and Tailwind CSS serving 100K+ monthly active users.',
            'Collaborated closely with product designers to convert complex Figma mockups into reusable, accessible, and high-performance UI components.',
            'Optimized client-side rendering performance and state management, reducing initial bundle size and page load time by 35%.',
            'Integrated secure RESTful APIs and real-time WebSocket feeds for financial analytics and transaction monitoring.',
          ],
          id: [
            'Merancang pustaka komponen berskala besar dan dashboard web responsif menggunakan React, TypeScript, dan Tailwind CSS untuk 100rb+ pengguna aktif bulanan.',
            'Berkolaborasi erat dengan desainer produk untuk menerjemahkan mockup Figma menjadi komponen UI yang dapat digunakan kembali, aksesibel, dan cepat.',
            'Mengoptimalkan performa rendering sisi klien dan manajemen state, mengurangi ukuran bundle awal dan waktu muat halaman sebesar 35%.',
            'Mengintegrasikan RESTful API yang aman dan aliran data real-time WebSocket untuk modul analitik keuangan dan pemantauan transaksi.',
          ],
        },
        fullstack: {
          en: [
            'Engineered resilient microservices using Go and Node.js backed by PostgreSQL and Redis caching layers.',
            'Spearheaded the migration of monolithic endpoints to modular RESTful APIs with automated API documentation via OpenAPI/Swagger.',
            'Implemented comprehensive Role-Based Access Control (RBAC) and audit trail logging to satisfy regulatory enterprise compliance.',
            'Configured Dockerized deployment pipelines with GitHub Actions for zero-downtime releases on cloud infrastructure.',
          ],
          id: [
            'Mengembangkan layanan microservice tangguh menggunakan Go dan Node.js didukung basis data PostgreSQL dan layer caching Redis.',
            'Memimpin migrasi endpoint monolitik ke RESTful API modular yang terdokumentasi otomatis menggunakan OpenAPI/Swagger.',
            'Mengimplementasikan sistem hak akses berbasis peran (RBAC) dan pencatatan riwayat audit untuk memenuhi kepatuhan standar enterprise.',
            'Mengonfigurasi alur deployment berbasis Docker dengan GitHub Actions untuk rilis berkelanjutan tanpa downtime di infrastruktur cloud.',
          ],
        },
      },
    },
    {
      id: 'fintech-solusi',
      role: {
        en: 'Fullstack Software Engineer',
        id: 'Fullstack Software Engineer',
      },
      company: 'Fintech Solusi Utama',
      type: { en: 'Contract', id: 'Kontrak' },
      period: { en: 'Jun 2022 – Dec 2022', id: 'Jun 2022 – Des 2022' },
      location: 'Bandung, Indonesia (Remote)',
      bullets: {
        frontend: {
          en: [
            'Developed intuitive customer onboarding and identity verification (e-KYC) flows using Vue.js and Tailwind CSS.',
            'Implemented strict form validation, error handling, and client-side payload sanitization for sensitive user inputs.',
          ],
          id: [
            'Mengembangkan alur pendaftaran pengguna baru dan verifikasi identitas (e-KYC) yang intuitif menggunakan Vue.js dan Tailwind CSS.',
            'Menerapkan validasi formulir ketat, penanganan error interaktif, dan sanitasi data sisi klien untuk input pengguna yang sensitif.',
          ],
        },
        fullstack: {
          en: [
            'Designed and implemented payment gateway webhooks and automated reconciliation services connecting multiple banking APIs.',
            'Created robust idempotent transactional routines to eliminate duplicate payments during intermittent network latency.',
          ],
          id: [
            'Merancang dan mengimplementasikan webhook payment gateway serta modul rekonsiliasi otomatis yang terhubung ke beberapa API perbankan.',
            'Membangun alur transaksi idempoten untuk mencegah terjadinya pembayaran ganda saat terjadi gangguan jaringan.',
          ],
        },
      },
    },
    {
      id: 'digital-inovasi',
      role: {
        en: 'Frontend Developer',
        id: 'Pengembang Frontend',
      },
      company: 'PT Digital Inovasi Mandiri',
      type: { en: 'Full-Time', id: 'Full-Time' },
      period: { en: 'Jan 2021 – May 2022', id: 'Jan 2021 – Mei 2022' },
      location: 'Jakarta, Indonesia',
      bullets: {
        frontend: {
          en: [
            'Built responsive e-commerce web applications and interactive landing pages using modern JavaScript (ES6+), HTML5, and CSS3.',
            'Integrated third-party analytics, customer support chat widgets, and social login authentication.',
          ],
          id: [
            'Membangun aplikasi web e-commerce responsif dan landing page interaktif menggunakan JavaScript modern (ES6+), HTML5, dan CSS3.',
            'Mengintegrasikan layanan analitik pihak ketiga, widget obrolan bantuan pelanggan, dan autentikasi login media sosial.',
          ],
        },
        fullstack: {
          en: [
            'Contributed to back-office order management APIs using Node.js/Express and MySQL alongside frontend admin templates.',
          ],
          id: [
            'Berkontribusi dalam pembuatan API manajemen pesanan back-office menggunakan Node.js/Express dan MySQL serta template admin frontend.',
          ],
        },
      },
    },
  ],
  projects: [
    {
      name: 'Enterprise RBAC & Audit Platform',
      stack: 'React, TypeScript, Tailwind CSS, PostgreSQL, Supabase',
      url: 'https://demo-rbac.example.com',
      description: {
        en: 'Production-ready administrative dashboard demonstrating granular Role-Based Access Control, live session revocation, activity audit logs, and internationalized UI (EN/ID).',
        id: 'Dashboard administratif siap produksi dengan demonstrasi kontrol hak akses bertingkat (RBAC), pembatalan sesi aktif, pencatatan log audit, dan antarmuka multibahasa (EN/ID).',
      },
    },
    {
      name: 'Omnichannel Payment & Billing Engine',
      stack: 'Go, PostgreSQL, Redis, Docker, Payment Gateway APIs',
      url: 'https://billing.example.com',
      description: {
        en: 'High-throughput transactional microservice supporting multi-vendor payment gateways, automated webhook retries, and real-time invoice generation.',
        id: 'Microservice transaksi berkecepatan tinggi yang mendukung integrasi multi-vendor payment gateway, percobaan ulang webhook otomatis, dan pembuatan invoice real-time.',
      },
    },
    {
      name: 'Smart Citizen Public Services Portal',
      stack: 'Vue.js, Nuxt.js, Tailwind CSS, REST APIs',
      url: 'https://portal.example.com',
      description: {
        en: 'Public-facing civic complaint and service request portal built with responsive, accessible layout and mobile-first navigation.',
        id: 'Portal layanan publik dan pengaduan masyarakat berbasis web dengan tata letak responsif, standar aksesibilitas ramah pengguna, dan navigasi ramah seluler.',
      },
    },
  ],
  education: [
    {
      degree: {
        en: "Bachelor's Degree in Computer Science",
        id: 'Sarjana (S1) Ilmu Komputer',
      },
      school: 'Universitas Teknologi Nusantara',
      period: '2018 – 2022',
    },
    {
      degree: {
        en: 'Diploma in Informatics Engineering',
        id: 'Diploma (D3) Teknik Informatika',
      },
      school: 'Politeknik Digital Indonesia',
      period: '2015 – 2018',
    },
  ],
  ui: {
    en: {
      secSummary: 'Professional Summary',
      secSkills: 'Technical Skills',
      secExperience: 'Work Experience',
      secProjects: 'Projects & Portfolio',
      secEducation: 'Education',
      secContact: 'Contact & Links',
    },
    id: {
      secSummary: 'Ringkasan Profil',
      secSkills: 'Keahlian Teknis',
      secExperience: 'Pengalaman Kerja',
      secProjects: 'Proyek & Portofolio',
      secEducation: 'Pendidikan',
      secContact: 'Kontak & Tautan',
    },
  },
};
