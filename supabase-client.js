/**
 * Supabase Client & Relational Data Adapter (Vanilla JS)
 * Mendukung integrasi skema relasional ternormalisasi (Opsi B)
 */
(function (window) {
  'use strict';

  var STORAGE_CONFIG_KEY = 'cv_supabase_config_v1';
  var STORAGE_AUTH_KEY = 'cv_supabase_session_v1';

  var SupabaseAdapter = {
    client: null,
    config: {
      url: '',
      anonKey: '',
    },
    profileId: null,

    // Muat konfigurasi dari localStorage jika ada
    init: function () {
      try {
        var raw = localStorage.getItem(STORAGE_CONFIG_KEY);
        if (raw) {
          this.config = JSON.parse(raw);
          if (this.config.url && this.config.anonKey && window.supabase) {
            this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
          }
        }
      } catch (e) {
        console.warn('Gagal memuat konfigurasi Supabase:', e);
      }
      return this.isConnected();
    },

    saveConfig: function (url, anonKey) {
      this.config = { url: url.trim(), anonKey: anonKey.trim() };
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
      if (this.config.url && this.config.anonKey && window.supabase) {
        this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
        return true;
      }
      return false;
    },

    clearConfig: function () {
      this.config = { url: '', anonKey: '' };
      this.client = null;
      localStorage.removeItem(STORAGE_CONFIG_KEY);
    },

    isConnected: function () {
      return Boolean(this.client && this.config.url && this.config.anonKey);
    },

    // =========================================================================
    // READ / FETCH DATA (Membaca dari 7 tabel relasional & transformasi ke CV_DATA)
    // =========================================================================
    fetchCvData: async function (slug) {
      if (!this.isConnected()) {
        console.info('Supabase belum terkonfigurasi. Menggunakan cv-data.js fallback.');
        return null;
      }

      slug = slug || 'primary';

      try {
        // 1. Ambil Profil Header
        var profileRes = await this.client
          .from('cv_profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (profileRes.error) throw profileRes.error;
        if (!profileRes.data) {
          console.warn('Profil dengan slug "' + slug + '" tidak ditemukan.');
          return null;
        }

        var profile = profileRes.data;
        this.profileId = profile.id;

        // 2. Ambil Data Relasi Secara Paralel
        var results = await Promise.all([
          this.client.from('cv_titles').select('*').eq('profile_id', profile.id),
          this.client.from('cv_summaries').select('*').eq('profile_id', profile.id),
          this.client.from('cv_skills').select('*').eq('profile_id', profile.id).order('sort_order', { ascending: true }),
          this.client.from('cv_experiences').select('*, cv_experience_bullets(*)').eq('profile_id', profile.id).order('sort_order', { ascending: true }),
          this.client.from('cv_projects').select('*').eq('profile_id', profile.id).order('sort_order', { ascending: true }),
          this.client.from('cv_educations').select('*').eq('profile_id', profile.id).order('sort_order', { ascending: true })
        ]);

        var titles = results[0].data || [];
        var summaries = results[1].data || [];
        var skills = results[2].data || [];
        var experiences = results[3].data || [];
        var projects = results[4].data || [];
        var educations = results[5].data || [];

        // 3. Bangun objek terstruktur sesuai format CV_DATA
        var titleMap = {
          frontend: { en: 'Frontend Engineer', id: 'Frontend Engineer' },
          fullstack: { en: 'Fullstack Engineer', id: 'Fullstack Engineer' }
        };
        titles.forEach(function (t) {
          if (titleMap[t.focus]) {
            titleMap[t.focus] = { en: t.title_en, id: t.title_id };
          }
        });

        var summaryMap = {
          frontend: { en: '', id: '' },
          fullstack: { en: '', id: '' }
        };
        summaries.forEach(function (s) {
          if (summaryMap[s.focus]) {
            summaryMap[s.focus] = { en: s.summary_en, id: s.summary_id };
          }
        });

        var formattedSkills = skills.map(function (s) {
          return {
            id: s.id,
            label: { en: s.label_en, id: s.label_id },
            items: s.items
          };
        });

        var formattedExperiences = experiences.map(function (exp) {
          var bullets = {
            frontend: { en: [], id: [] },
            fullstack: { en: [], id: [] }
          };

          var rawBullets = (exp.cv_experience_bullets || []).sort(function (a, b) {
            return (a.sort_order || 0) - (b.sort_order || 0);
          });

          rawBullets.forEach(function (b) {
            if (bullets[b.focus]) {
              bullets[b.focus].en.push(b.text_en);
              bullets[b.focus].id.push(b.text_id);
            }
          });

          return {
            id: exp.id,
            rawId: exp.identifier,
            role: { en: exp.role_en, id: exp.role_id },
            company: exp.company,
            type: { en: exp.type_en, id: exp.type_id },
            period: { en: exp.period_en, id: exp.period_id },
            location: exp.location,
            bullets: bullets
          };
        });

        var formattedProjects = projects.map(function (p) {
          return {
            id: p.id,
            name: p.name,
            stack: p.stack,
            url: p.url,
            description: { en: p.desc_en, id: p.desc_id }
          };
        });

        var formattedEducation = educations.map(function (e) {
          return {
            id: e.id,
            degree: { en: e.degree_en, id: e.degree_id },
            school: e.school,
            period: e.period
          };
        });

        var cvData = {
          header: {
            id: profile.id,
            name: profile.name,
            location: profile.location,
            phone: profile.phone,
            email: profile.email,
            portfolio: profile.portfolio,
            showcase: profile.showcase,
            linkedin: profile.linkedin,
            gitlab: profile.gitlab,
            photo: profile.photo_url || 'assets/profile.jpg',
            title: titleMap
          },
          summary: summaryMap,
          skills: formattedSkills,
          experience: formattedExperiences,
          projects: formattedProjects,
          education: formattedEducation,
          ui: (window.CV_DATA && window.CV_DATA.ui) ? window.CV_DATA.ui : {
            en: {
              secSummary: 'Professional Summary',
              secSkills: 'Technical Skills',
              secExperience: 'Work Experience',
              secProjects: 'Projects & Portfolio',
              secEducation: 'Education',
              secContact: 'Contact & Links'
            },
            id: {
              secSummary: 'Ringkasan Profil',
              secSkills: 'Keahlian Teknis',
              secExperience: 'Pengalaman Kerja',
              secProjects: 'Proyek & Portofolio',
              secEducation: 'Pendidikan',
              secContact: 'Kontak & Tautan'
            }
          }
        };

        return cvData;
      } catch (err) {
        console.error('Error saat fetch dari Supabase:', err);
        return null;
      }
    },

    // =========================================================================
    // AUTHENTICATION (Login / Logout Supabase)
    // =========================================================================
    login: async function (email, password) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung.');
      var res = await this.client.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (res.error) throw res.error;
      return res.data;
    },

    logout: async function () {
      if (!this.isConnected()) return;
      await this.client.auth.signOut();
    },

    getSession: async function () {
      if (!this.isConnected()) return null;
      var res = await this.client.auth.getSession();
      return (res.data && res.data.session) ? res.data.session : null;
    },

    // =========================================================================
    // CRUD: EXPERIENCES (Pengalaman Kerja)
    // =========================================================================
    createExperience: async function (profileId, expData) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var insertExp = {
        profile_id: profileId,
        identifier: expData.identifier || 'exp-' + Date.now(),
        company: expData.company,
        location: expData.location,
        role_en: expData.role_en,
        role_id: expData.role_id,
        type_en: expData.type_en || 'Full-Time',
        type_id: expData.type_id || 'Full-Time',
        period_en: expData.period_en,
        period_id: expData.period_id,
        sort_order: expData.sort_order || 99
      };

      var res = await this.client.from('cv_experiences').insert(insertExp).select().single();
      if (res.error) throw res.error;
      var expId = res.data.id;

      // Masukkan bullets jika disediakan
      if (expData.bullets && expData.bullets.length > 0) {
        var bulletsToInsert = expData.bullets.map(function (b, idx) {
          return {
            experience_id: expId,
            focus: b.focus || 'frontend',
            text_en: b.text_en,
            text_id: b.text_id,
            sort_order: idx + 1
          };
        });
        await this.client.from('cv_experience_bullets').insert(bulletsToInsert);
      }
      return res.data;
    },

    deleteExperience: async function (experienceId) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var res = await this.client.from('cv_experiences').delete().eq('id', experienceId);
      if (res.error) throw res.error;
      return true;
    },

    // =========================================================================
    // CRUD: PROJECTS (Proyek & Portofolio)
    // =========================================================================
    createProject: async function (profileId, projectData) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var insertObj = {
        profile_id: profileId,
        name: projectData.name,
        stack: projectData.stack,
        url: projectData.url || '',
        desc_en: projectData.desc_en,
        desc_id: projectData.desc_id,
        sort_order: projectData.sort_order || 99
      };
      var res = await this.client.from('cv_projects').insert(insertObj).select().single();
      if (res.error) throw res.error;
      return res.data;
    },

    deleteProject: async function (projectId) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var res = await this.client.from('cv_projects').delete().eq('id', projectId);
      if (res.error) throw res.error;
      return true;
    },

    // =========================================================================
    // CRUD: SKILLS
    // =========================================================================
    createSkill: async function (profileId, skillData) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var insertObj = {
        profile_id: profileId,
        label_en: skillData.label_en,
        label_id: skillData.label_id,
        items: skillData.items,
        sort_order: skillData.sort_order || 99
      };
      var res = await this.client.from('cv_skills').insert(insertObj).select().single();
      if (res.error) throw res.error;
      return res.data;
    },

    deleteSkill: async function (skillId) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var res = await this.client.from('cv_skills').delete().eq('id', skillId);
      if (res.error) throw res.error;
      return true;
    },

    // =========================================================================
    // CRUD: EDUCATION
    // =========================================================================
    createEducation: async function (profileId, eduData) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var insertObj = {
        profile_id: profileId,
        school: eduData.school,
        degree_en: eduData.degree_en,
        degree_id: eduData.degree_id,
        period: eduData.period,
        sort_order: eduData.sort_order || 99
      };
      var res = await this.client.from('cv_educations').insert(insertObj).select().single();
      if (res.error) throw res.error;
      return res.data;
    },

    deleteEducation: async function (educationId) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var res = await this.client.from('cv_educations').delete().eq('id', educationId);
      if (res.error) throw res.error;
      return true;
    },

    // =========================================================================
    // UPDATE PROFILE HEADER & SUMMARIES
    // =========================================================================
    updateProfile: async function (profileId, profileData) {
      if (!this.isConnected()) throw new Error('Supabase belum terhubung');
      var res = await this.client.from('cv_profiles').update(profileData).eq('id', profileId);
      if (res.error) throw res.error;
      return true;
    }
  };

  window.SupabaseAdapter = SupabaseAdapter;
})(window);
