(function () {
  var STORAGE_KEY = 'yuda_cv_builder_state_v1';
  var CUSTOM_HTML_KEY = 'yuda_cv_custom_html_v1';

  var defaultState = {
    layout: 'ats',
    focus: 'frontend',
    lang: 'en',
    accent: '#0067FF',
    accentSoft: '#eff6ff',
    photo: 'off',
    density: 'compact',
    fontSize: '9.8pt',
    editMode: false,
  };

  var state = loadState();
  var customEdits = loadCustomEdits();

  var sheet = document.getElementById('cv-sheet');
  var layoutSelect = document.getElementById('select-layout');
  var focusSelect = document.getElementById('select-focus');
  var langSelect = document.getElementById('select-lang');
  var accentSelect = document.getElementById('select-accent');
  var photoSelect = document.getElementById('select-photo');
  var densitySelect = document.getElementById('select-density');
  var fontSizeSelect = document.getElementById('select-fontsize');
  var editToggleBtn = document.getElementById('btn-edit');
  var resetBtn = document.getElementById('btn-reset');
  var downloadJsonBtn = document.getElementById('btn-export-data');
  var printBtn = document.getElementById('btn-print');
  var statusText = document.getElementById('status-text');

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, defaultState);
      return Object.assign({}, defaultState, JSON.parse(raw));
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore storage quota errors */
    }
  }

  function loadCustomEdits() {
    try {
      var raw = localStorage.getItem(CUSTOM_HTML_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCustomEdits() {
    try {
      localStorage.setItem(CUSTOM_HTML_KEY, JSON.stringify(customEdits));
    } catch (e) {
      /* ignore */
    }
  }

  function currentVariantKey() {
    return [state.layout, state.focus, state.lang, state.photo].join(':');
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderContactLinks(data, vertical) {
    var h = data.header;
    var portfolioLabel = h.portfolio ? h.portfolio.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Portfolio';
    var items = [
      '<span>' + escapeHtml(h.location) + '</span>',
      '<a href="tel:' + escapeHtml(h.phone.replace(/\s+/g, '')) + '">' + escapeHtml(h.phone) + '</a>',
      '<a href="mailto:' + escapeHtml(h.email) + '">' + escapeHtml(h.email) + '</a>',
      '<a href="' + escapeHtml(h.portfolio) + '" target="_blank" rel="noopener">' + escapeHtml(portfolioLabel) + '</a>',
      '<a href="' + escapeHtml(h.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a>',
      '<a href="' + escapeHtml(h.gitlab) + '" target="_blank" rel="noopener">GitLab</a>',
    ];
    return items.join(vertical ? '' : '<span>·</span>');
  }

  function localizeValue(val, lang) {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') return val[lang] || val.en || '';
    return '';
  }

  function renderExperienceList(data) {
    var lang = state.lang;
    var focus = state.focus;
    return data.experience
      .map(function (item) {
        var bullets = (item.bullets && item.bullets[focus] && item.bullets[focus][lang])
          ? item.bullets[focus][lang]
              .map(function (b) {
                return '<li>' + escapeHtml(b) + '</li>';
              })
              .join('')
          : '';
        var typeClass = state.layout === 'modern' ? 'cv-badge-pill' : 'cv-item-type';
        var delBtn = item.id
          ? '<button type="button" class="item-delete-btn" contenteditable="false" data-action="delete-exp" data-id="' + escapeHtml(item.id) + '">🗑 Hapus</button>'
          : '';
        return (
          '<article class="cv-item">' +
          '<div class="cv-item-head">' +
          '<span class="cv-item-title">' + escapeHtml(item.role[lang]) + delBtn + '</span>' +
          '<span class="cv-item-meta">' + escapeHtml(localizeValue(item.period, lang)) + '</span>' +
          '</div>' +
          '<div class="cv-item-sub">' +
          '<span>' + escapeHtml(item.company) + (item.location ? ' — ' + escapeHtml(item.location) : '') + '</span>' +
          '<span class="' + typeClass + '">' + escapeHtml(item.type[lang]) + '</span>' +
          '</div>' +
          '<ul class="cv-bullets">' + bullets + '</ul>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderProjectsList(data) {
    var lang = state.lang;
    return data.projects
      .map(function (proj) {
        var urlPart = proj.url
          ? ' · <a href="' + escapeHtml(proj.url) + '" target="_blank" rel="noopener">' + escapeHtml(proj.url.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a>'
          : '';
        var delBtn = proj.id
          ? '<button type="button" class="item-delete-btn" contenteditable="false" data-action="delete-proj" data-id="' + escapeHtml(proj.id) + '">🗑 Hapus</button>'
          : '';
        return (
          '<article class="cv-item">' +
          '<div class="cv-item-head">' +
          '<span class="cv-item-title">' + escapeHtml(proj.name) + delBtn + '</span>' +
          '<span class="cv-project-stack">' + escapeHtml(proj.stack) + urlPart + '</span>' +
          '</div>' +
          '<p class="cv-project-desc">' + escapeHtml(proj.description[lang]) + '</p>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderEducationList(data) {
    var lang = state.lang;
    return data.education
      .map(function (edu) {
        var delBtn = edu.id
          ? '<button type="button" class="item-delete-btn" contenteditable="false" data-action="delete-edu" data-id="' + escapeHtml(edu.id) + '">🗑 Hapus</button>'
          : '';
        return (
          '<article class="cv-item">' +
          '<div class="cv-item-head">' +
          '<span class="cv-item-title">' + escapeHtml(edu.degree[lang]) + delBtn + '</span>' +
          '<span class="cv-item-meta">' + escapeHtml(localizeValue(edu.period, lang)) + '</span>' +
          '</div>' +
          '<div class="cv-item-sub"><span>' + escapeHtml(edu.school) + '</span></div>' +
          '</article>'
        );
      })
      .join('');
  }

  function buildSingleColumnHtml(data) {
    var lang = state.lang;
    var focus = state.focus;
    var ui = data.ui[lang];
    var showPhoto = state.photo === 'on';

    var headerHtml =
      '<header class="cv-header">' +
      '<div class="cv-header-flex">' +
      '<div>' +
      '<h1 class="cv-name">' + escapeHtml(data.header.name) + '</h1>' +
      '<p class="cv-role">' + escapeHtml(data.header.title[focus][lang]) + '</p>' +
      '<div class="cv-contact-row">' + renderContactLinks(data, false) + '</div>' +
      '</div>' +
      (showPhoto
        ? '<img class="cv-photo" src="' + escapeHtml(data.header.photo) + '" alt="' + escapeHtml(data.header.name) + '" onerror="this.style.display=\'none\'" />'
        : '') +
      '</div>' +
      '</header>';

    var skillsHtml = data.skills
      .map(function (s) {
        var delBtn = s.id
          ? '<button type="button" class="item-delete-btn" contenteditable="false" data-action="delete-skill" data-id="' + escapeHtml(s.id) + '">🗑 Hapus</button>'
          : '';
        return (
          '<div class="cv-skill-row">' +
          '<span class="cv-skill-label">' + escapeHtml(s.label[lang]) + ': </span>' +
          '<span>' + escapeHtml(s.items) + delBtn + '</span>' +
          '</div>'
        );
      })
      .join('');

    return (
      headerHtml +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secSummary) + '</h2>' +
      '<p class="cv-summary">' + escapeHtml(data.summary[focus][lang]) + '</p>' +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secSkills) + '</h2>' +
      '<div class="cv-skills-list">' + skillsHtml + '</div>' +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secExperience) + '</h2>' +
      renderExperienceList(data) +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secProjects) + '</h2>' +
      renderProjectsList(data) +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secEducation) + '</h2>' +
      renderEducationList(data) +
      '</section>'
    );
  }

  function buildSidebarHtml(data) {
    var lang = state.lang;
    var focus = state.focus;
    var ui = data.ui[lang];
    var showPhoto = state.photo === 'on';

    var skillsSidebar = data.skills
      .map(function (s) {
        var delBtn = s.id
          ? '<button type="button" class="item-delete-btn" contenteditable="false" data-action="delete-skill" data-id="' + escapeHtml(s.id) + '">🗑</button>'
          : '';
        return (
          '<div class="cv-item">' +
          '<div class="cv-skill-label" style="font-size:8.6pt;">' + escapeHtml(s.label[lang]) + delBtn + '</div>' +
          '<div style="font-size:8.3pt;color:#334155;margin-top:2px;">' + escapeHtml(s.items) + '</div>' +
          '</div>'
        );
      })
      .join('');

    var eduSidebar = data.education
      .map(function (edu) {
        var delBtn = edu.id
          ? '<button type="button" class="item-delete-btn" contenteditable="false" data-action="delete-edu" data-id="' + escapeHtml(edu.id) + '">🗑</button>'
          : '';
        return (
          '<div class="cv-item">' +
          '<div style="font-weight:700;font-size:8.7pt;color:#0f172a;">' + escapeHtml(edu.degree[lang]) + delBtn + '</div>' +
          '<div style="font-size:8.4pt;color:#334155;">' + escapeHtml(edu.school) + '</div>' +
          '<div style="font-size:8pt;color:#64748b;">' + escapeHtml(edu.period) + '</div>' +
          '</div>'
        );
      })
      .join('');

    var sidebar =
      '<aside class="cv-sidebar-col">' +
      (showPhoto
        ? '<img class="cv-photo" src="' + escapeHtml(data.header.photo) + '" alt="' + escapeHtml(data.header.name) + '" onerror="this.style.display=\'none\'" />'
        : '') +
      '<h1 class="cv-name" style="font-size:17pt;">' + escapeHtml(data.header.name) + '</h1>' +
      '<p class="cv-role" style="font-size:10pt;">' + escapeHtml(data.header.title[focus][lang]) + '</p>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secContact) + '</h2>' +
      '<div class="cv-contact-col">' + renderContactLinks(data, true) + '</div>' +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secSkills) + '</h2>' +
      skillsSidebar +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secEducation) + '</h2>' +
      eduSidebar +
      '</section>' +
      '</aside>';

    var main =
      '<div class="cv-main-col">' +
      '<section class="cv-section" style="margin-top:0;">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secSummary) + '</h2>' +
      '<p class="cv-summary">' + escapeHtml(data.summary[focus][lang]) + '</p>' +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secExperience) + '</h2>' +
      renderExperienceList(data) +
      '</section>' +
      '<section class="cv-section">' +
      '<h2 class="cv-section-title">' + escapeHtml(ui.secProjects) + '</h2>' +
      renderProjectsList(data) +
      '</section>' +
      '</div>';

    return sidebar + main;
  }

  function applyVisualTokens() {
    document.documentElement.style.setProperty('--cv-font-size', state.fontSize);
    document.documentElement.style.setProperty('--cv-accent', state.accent);
    document.documentElement.style.setProperty('--cv-accent-soft', state.accentSoft);

    sheet.className = 'cv-sheet layout-' + state.layout;
    sheet.setAttribute('data-density', state.density);
    sheet.setAttribute('contenteditable', state.editMode ? 'true' : 'false');

    if (editToggleBtn) {
      editToggleBtn.classList.toggle('is-active', state.editMode);
      editToggleBtn.textContent = state.editMode ? 'Edit Text: ON' : 'Edit Text: OFF';
    }
  }

  function render() {
    var data = window.CV_DATA;
    if (data && data.header && data.header.name) {
      document.title = 'CV — ' + data.header.name;
    }
    var key = currentVariantKey();
    applyVisualTokens();

    if (customEdits[key]) {
      sheet.innerHTML = customEdits[key];
      updateStatus('Loaded your saved inline edits for this layout.');
    } else {
      sheet.innerHTML =
        state.layout === 'sidebar' ? buildSidebarHtml(data) : buildSingleColumnHtml(data);
      updateStatus('Edit cv-data.js or toggle "Edit Text: ON" to customize directly.');
    }
  }

  function updateStatus(msg) {
    if (statusText) statusText.textContent = msg;
  }

  function syncControlsFromState() {
    layoutSelect.value = state.layout;
    focusSelect.value = state.focus;
    langSelect.value = state.lang;
    accentSelect.value = state.accent;
    photoSelect.value = state.photo;
    densitySelect.value = state.density;
    fontSizeSelect.value = state.fontSize;
  }

  var ACCENT_SOFT_MAP = {
    '#0f172a': '#f1f5f9',
    '#0067FF': '#eff6ff',
    '#0e7490': '#ecfeff',
    '#4f46e5': '#eef2ff',
  };

  layoutSelect.addEventListener('change', function (e) {
    state.layout = e.target.value;
    saveState();
    render();
  });

  focusSelect.addEventListener('change', function (e) {
    state.focus = e.target.value;
    saveState();
    render();
  });

  langSelect.addEventListener('change', function (e) {
    state.lang = e.target.value;
    saveState();
    render();
  });

  accentSelect.addEventListener('change', function (e) {
    state.accent = e.target.value;
    state.accentSoft = ACCENT_SOFT_MAP[state.accent] || '#f1f5f9';
    saveState();
    applyVisualTokens();
  });

  photoSelect.addEventListener('change', function (e) {
    state.photo = e.target.value;
    saveState();
    render();
  });

  densitySelect.addEventListener('change', function (e) {
    state.density = e.target.value;
    saveState();
    applyVisualTokens();
  });

  fontSizeSelect.addEventListener('change', function (e) {
    state.fontSize = e.target.value;
    saveState();
    applyVisualTokens();
  });

  editToggleBtn.addEventListener('click', function () {
    state.editMode = !state.editMode;
    saveState();
    applyVisualTokens();
    updateStatus(
      state.editMode
        ? 'Inline editing enabled — click any text on the CV to edit (auto-saved).'
        : 'Inline editing locked.',
    );
  });

  sheet.addEventListener('input', function () {
    if (!state.editMode) return;
    customEdits[currentVariantKey()] = sheet.innerHTML;
    saveCustomEdits();
    updateStatus('Draft changes saved automatically in browser.');
  });

  resetBtn.addEventListener('click', function () {
    delete customEdits[currentVariantKey()];
    saveCustomEdits();
    render();
    updateStatus('Current layout reset to cv-data.js default.');
  });

  downloadJsonBtn.addEventListener('click', function () {
    var payload = {
      exportedAt: new Date().toISOString(),
      activeState: state,
      baseData: window.CV_DATA,
      inlineEditedHtmlByVariant: customEdits,
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'cv-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  printBtn.addEventListener('click', function () {
    if (state.editMode) {
      state.editMode = false;
      saveState();
      applyVisualTokens();
    }
    window.print();
  });

  // =========================================================================
  // SUPABASE DATABASE & CRUD INTEGRATION (Opsi B: Relasional)
  // =========================================================================
  var btnDb = document.getElementById('btn-db');
  var modalDb = document.getElementById('modal-db');
  var modalClose = document.getElementById('modal-close');
  var modalFooterClose = document.getElementById('modal-footer-close');
  var dbStatusBadge = document.getElementById('db-status-badge');
  var inputSupabaseUrl = document.getElementById('input-supabase-url');
  var inputSupabaseKey = document.getElementById('input-supabase-key');
  var btnSaveDbConfig = document.getElementById('btn-save-db-config');
  var btnDisconnectDb = document.getElementById('btn-disconnect-db');
  var inputAuthEmail = document.getElementById('input-auth-email');
  var inputAuthPass = document.getElementById('input-auth-password');
  var btnLoginAuth = document.getElementById('btn-login-auth');
  var btnLogoutAuth = document.getElementById('btn-logout-auth');
  var authStatusText = document.getElementById('auth-status-text');

  var btnSubmitExp = document.getElementById('btn-submit-exp');
  var btnSubmitProj = document.getElementById('btn-submit-proj');
  var btnSubmitSkill = document.getElementById('btn-submit-skill');
  var btnSubmitEdu = document.getElementById('btn-submit-edu');

  function updateDbStatusUi() {
    if (!window.SupabaseAdapter) return;
    var isConnected = window.SupabaseAdapter.isConnected();
    if (isConnected) {
      if (dbStatusBadge) {
        dbStatusBadge.className = 'db-status-badge is-online';
        dbStatusBadge.textContent = '● Status: Terhubung ke Supabase PostgreSQL';
      }
      if (btnDb) {
        btnDb.textContent = '⚡ Supabase: Aktif';
        btnDb.style.background = '#059669';
        btnDb.style.borderColor = '#059669';
      }
      if (inputSupabaseUrl) inputSupabaseUrl.value = window.SupabaseAdapter.config.url || '';
      if (inputSupabaseKey) inputSupabaseKey.value = window.SupabaseAdapter.config.anonKey || '';
    } else {
      if (dbStatusBadge) {
        dbStatusBadge.className = 'db-status-badge is-offline';
        dbStatusBadge.textContent = '● Status: Offline (Memakai cv-data.js lokal)';
      }
      if (btnDb) {
        btnDb.textContent = '⚡ Database Supabase';
        btnDb.style.background = '#0284c7';
        btnDb.style.borderColor = '#0284c7';
      }
    }
  }

  // Modal open & close
  if (btnDb && modalDb) {
    btnDb.addEventListener('click', function () {
      updateDbStatusUi();
      modalDb.classList.add('is-active');
    });
  }
  if (modalClose && modalDb) {
    modalClose.addEventListener('click', function () {
      modalDb.classList.remove('is-active');
    });
  }
  if (modalFooterClose && modalDb) {
    modalFooterClose.addEventListener('click', function () {
      modalDb.classList.remove('is-active');
    });
  }
  if (modalDb) {
    modalDb.addEventListener('click', function (e) {
      if (e.target === modalDb) modalDb.classList.remove('is-active');
    });
  }

  // Modal tabs
  var tabButtons = document.querySelectorAll('.modal-tab-btn');
  var tabContents = document.querySelectorAll('.modal-tab-content');
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabButtons.forEach(function (b) { b.classList.remove('is-active'); });
      tabContents.forEach(function (c) { c.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var targetId = btn.getAttribute('data-tab');
      var targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('is-active');
    });
  });

  // Save DB Config & fetch
  if (btnSaveDbConfig) {
    btnSaveDbConfig.addEventListener('click', async function () {
      var url = inputSupabaseUrl ? inputSupabaseUrl.value.trim() : '';
      var key = inputSupabaseKey ? inputSupabaseKey.value.trim() : '';
      if (!url || !key) {
        alert('Mohon isi Project URL dan Anon Key Supabase Anda.');
        return;
      }
      btnSaveDbConfig.disabled = true;
      btnSaveDbConfig.textContent = 'Menghubungkan...';
      try {
        window.SupabaseAdapter.saveConfig(url, key);
        var dbData = await window.SupabaseAdapter.fetchCvData('primary');
        if (dbData) {
          window.CV_DATA = dbData;
          delete customEdits[currentVariantKey()];
          render();
          updateDbStatusUi();
          alert('Berhasil terhubung ke Supabase! Data relasional CV berhasil dimuat.');
        } else {
          alert('Terhubung, namun data dengan slug "primary" belum ditemukan. Pastikan Anda sudah menjalankan script SQL migration di Supabase.');
          updateDbStatusUi();
        }
      } catch (err) {
        alert('Gagal menghubungkan ke Supabase: ' + (err.message || err));
      } finally {
        btnSaveDbConfig.disabled = false;
        btnSaveDbConfig.textContent = 'Simpan & Tarik Data';
      }
    });
  }

  // Disconnect DB
  if (btnDisconnectDb) {
    btnDisconnectDb.addEventListener('click', function () {
      if (confirm('Putuskan koneksi Supabase dan kembali ke cv-data.js lokal?')) {
        window.SupabaseAdapter.clearConfig();
        updateDbStatusUi();
        location.reload();
      }
    });
  }

  // Auth: Login Admin
  if (btnLoginAuth) {
    btnLoginAuth.addEventListener('click', async function () {
      var email = inputAuthEmail ? inputAuthEmail.value.trim() : '';
      var pass = inputAuthPass ? inputAuthPass.value : '';
      if (!email || !pass) {
        alert('Masukkan email dan password admin.');
        return;
      }
      try {
        btnLoginAuth.disabled = true;
        btnLoginAuth.textContent = 'Memverifikasi...';
        var authRes = await window.SupabaseAdapter.login(email, pass);
        if (authStatusText) authStatusText.textContent = 'Login sebagai: ' + (authRes.user ? authRes.user.email : email);
        btnLoginAuth.style.display = 'none';
        if (btnLogoutAuth) btnLogoutAuth.style.display = 'inline-block';
        alert('Login berhasil! Anda sekarang dapat melakukan operasi CRUD (Insert, Update, Delete) di Supabase.');
      } catch (err) {
        alert('Gagal login: ' + (err.message || err));
      } finally {
        btnLoginAuth.disabled = false;
        btnLoginAuth.textContent = 'Login Admin';
      }
    });
  }

  // Auth: Logout
  if (btnLogoutAuth) {
    btnLogoutAuth.addEventListener('click', async function () {
      await window.SupabaseAdapter.logout();
      if (authStatusText) authStatusText.textContent = 'Belum login';
      btnLoginAuth.style.display = 'inline-block';
      btnLogoutAuth.style.display = 'none';
      alert('Telah logout dari Supabase.');
    });
  }

  // CRUD: Tambah Pengalaman
  if (btnSubmitExp) {
    btnSubmitExp.addEventListener('click', async function () {
      if (!window.SupabaseAdapter || !window.SupabaseAdapter.isConnected()) {
        alert('Hubungkan ke Supabase terlebih dahulu di tab Koneksi!');
        return;
      }
      var company = document.getElementById('exp-company').value.trim();
      var loc = document.getElementById('exp-location').value.trim();
      var roleEn = document.getElementById('exp-role-en').value.trim();
      var roleId = document.getElementById('exp-role-id').value.trim();
      var periodEn = document.getElementById('exp-period-en').value.trim();
      var periodId = document.getElementById('exp-period-id').value.trim();
      var bulletsEn = (document.getElementById('exp-bullets-en').value || '').trim().split('\n').filter(Boolean);
      var bulletsId = (document.getElementById('exp-bullets-id').value || '').trim().split('\n').filter(Boolean);

      if (!company || !roleEn || !roleId) {
        alert('Nama Perusahaan dan Jabatan (Role) wajib diisi.');
        return;
      }

      var bullets = [];
      bulletsEn.forEach(function (text, i) {
        bullets.push({
          focus: 'frontend',
          text_en: text,
          text_id: bulletsId[i] || text
        });
      });

      try {
        btnSubmitExp.disabled = true;
        btnSubmitExp.textContent = 'Menyimpan...';
        await window.SupabaseAdapter.createExperience(window.SupabaseAdapter.profileId, {
          company: company,
          location: loc,
          role_en: roleEn,
          role_id: roleId,
          period_en: periodEn || 'Jan 2024 – Present',
          period_id: periodId || 'Jan 2024 – Sekarang',
          bullets: bullets
        });
        var updated = await window.SupabaseAdapter.fetchCvData('primary');
        if (updated) {
          window.CV_DATA = updated;
          delete customEdits[currentVariantKey()];
          render();
        }
        alert('Pengalaman baru berhasil disimpan ke Supabase!');
        modalDb.classList.remove('is-active');
        document.getElementById('exp-company').value = '';
        document.getElementById('exp-location').value = '';
        document.getElementById('exp-role-en').value = '';
        document.getElementById('exp-role-id').value = '';
        document.getElementById('exp-bullets-en').value = '';
        document.getElementById('exp-bullets-id').value = '';
      } catch (err) {
        alert('Gagal menyimpan pengalaman: ' + (err.message || err));
      } finally {
        btnSubmitExp.disabled = false;
        btnSubmitExp.textContent = '+ Simpan Pengalaman ke Supabase';
      }
    });
  }

  // CRUD: Tambah Proyek
  if (btnSubmitProj) {
    btnSubmitProj.addEventListener('click', async function () {
      if (!window.SupabaseAdapter || !window.SupabaseAdapter.isConnected()) {
        alert('Hubungkan ke Supabase terlebih dahulu di tab Koneksi!');
        return;
      }
      var name = document.getElementById('proj-name').value.trim();
      var stack = document.getElementById('proj-stack').value.trim();
      var url = document.getElementById('proj-url').value.trim();
      var descEn = document.getElementById('proj-desc-en').value.trim();
      var descId = document.getElementById('proj-desc-id').value.trim();

      if (!name) {
        alert('Nama proyek wajib diisi.');
        return;
      }

      try {
        btnSubmitProj.disabled = true;
        btnSubmitProj.textContent = 'Menyimpan...';
        await window.SupabaseAdapter.createProject(window.SupabaseAdapter.profileId, {
          name: name,
          stack: stack,
          url: url,
          desc_en: descEn,
          desc_id: descId
        });
        var updated = await window.SupabaseAdapter.fetchCvData('primary');
        if (updated) {
          window.CV_DATA = updated;
          delete customEdits[currentVariantKey()];
          render();
        }
        alert('Proyek baru berhasil disimpan ke Supabase!');
        modalDb.classList.remove('is-active');
        document.getElementById('proj-name').value = '';
        document.getElementById('proj-stack').value = '';
        document.getElementById('proj-url').value = '';
        document.getElementById('proj-desc-en').value = '';
        document.getElementById('proj-desc-id').value = '';
      } catch (err) {
        alert('Gagal menyimpan proyek: ' + (err.message || err));
      } finally {
        btnSubmitProj.disabled = false;
        btnSubmitProj.textContent = '+ Simpan Proyek ke Supabase';
      }
    });
  }

  // CRUD: Tambah Skill
  if (btnSubmitSkill) {
    btnSubmitSkill.addEventListener('click', async function () {
      if (!window.SupabaseAdapter || !window.SupabaseAdapter.isConnected()) {
        alert('Hubungkan ke Supabase terlebih dahulu di tab Koneksi!');
        return;
      }
      var labelEn = document.getElementById('skill-label-en').value.trim();
      var labelId = document.getElementById('skill-label-id').value.trim();
      var items = document.getElementById('skill-items').value.trim();

      if (!labelEn || !items) {
        alert('Label kategori dan daftar skill wajib diisi.');
        return;
      }

      try {
        btnSubmitSkill.disabled = true;
        btnSubmitSkill.textContent = 'Menyimpan...';
        await window.SupabaseAdapter.createSkill(window.SupabaseAdapter.profileId, {
          label_en: labelEn,
          label_id: labelId || labelEn,
          items: items
        });
        var updated = await window.SupabaseAdapter.fetchCvData('primary');
        if (updated) {
          window.CV_DATA = updated;
          delete customEdits[currentVariantKey()];
          render();
        }
        alert('Skill berhasil disimpan ke Supabase!');
        modalDb.classList.remove('is-active');
        document.getElementById('skill-label-en').value = '';
        document.getElementById('skill-label-id').value = '';
        document.getElementById('skill-items').value = '';
      } catch (err) {
        alert('Gagal menyimpan skill: ' + (err.message || err));
      } finally {
        btnSubmitSkill.disabled = false;
        btnSubmitSkill.textContent = '+ Simpan Skill ke Supabase';
      }
    });
  }

  // CRUD: Tambah Pendidikan
  if (btnSubmitEdu) {
    btnSubmitEdu.addEventListener('click', async function () {
      if (!window.SupabaseAdapter || !window.SupabaseAdapter.isConnected()) {
        alert('Hubungkan ke Supabase terlebih dahulu di tab Koneksi!');
        return;
      }
      var school = document.getElementById('edu-school').value.trim();
      var degreeEn = document.getElementById('edu-degree-en').value.trim();
      var degreeId = document.getElementById('edu-degree-id').value.trim();
      var period = document.getElementById('edu-period').value.trim();

      if (!school || !degreeEn) {
        alert('Nama Institusi dan Gelar wajib diisi.');
        return;
      }

      try {
        btnSubmitEdu.disabled = true;
        btnSubmitEdu.textContent = 'Menyimpan...';
        await window.SupabaseAdapter.createEducation(window.SupabaseAdapter.profileId, {
          school: school,
          degree_en: degreeEn,
          degree_id: degreeId || degreeEn,
          period: period || '2020 – 2024'
        });
        var updated = await window.SupabaseAdapter.fetchCvData('primary');
        if (updated) {
          window.CV_DATA = updated;
          delete customEdits[currentVariantKey()];
          render();
        }
        alert('Pendidikan berhasil disimpan ke Supabase!');
        modalDb.classList.remove('is-active');
        document.getElementById('edu-school').value = '';
        document.getElementById('edu-degree-en').value = '';
        document.getElementById('edu-degree-id').value = '';
        document.getElementById('edu-period').value = '';
      } catch (err) {
        alert('Gagal menyimpan pendidikan: ' + (err.message || err));
      } finally {
        btnSubmitEdu.disabled = false;
        btnSubmitEdu.textContent = '+ Simpan Pendidikan ke Supabase';
      }
    });
  }

  // Event delegation untuk DELETE item dari CV Sheet saat inline edit aktif
  sheet.addEventListener('click', async function (e) {
    var target = e.target.closest('.item-delete-btn');
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();

    var action = target.getAttribute('data-action');
    var id = target.getAttribute('data-id');

    if (!window.SupabaseAdapter || !window.SupabaseAdapter.isConnected()) {
      alert('Operasi hapus langsung membutuhkan koneksi Supabase aktif.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus item ini secara permanen dari Supabase?')) {
      return;
    }

    try {
      target.textContent = 'Menghapus...';
      if (action === 'delete-exp') {
        await window.SupabaseAdapter.deleteExperience(id);
      } else if (action === 'delete-proj') {
        await window.SupabaseAdapter.deleteProject(id);
      } else if (action === 'delete-skill') {
        await window.SupabaseAdapter.deleteSkill(id);
      } else if (action === 'delete-edu') {
        await window.SupabaseAdapter.deleteEducation(id);
      }
      var updated = await window.SupabaseAdapter.fetchCvData('primary');
      if (updated) {
        window.CV_DATA = updated;
        delete customEdits[currentVariantKey()];
        render();
      }
      updateStatus('Item berhasil dihapus dari Supabase.');
    } catch (err) {
      alert('Gagal menghapus item: ' + (err.message || err));
      target.textContent = '🗑 Hapus';
    }
  });

  // Auto-connect on load if configuration exists
  if (window.SupabaseAdapter) {
    var connected = window.SupabaseAdapter.init();
    updateDbStatusUi();
    if (connected) {
      window.SupabaseAdapter.fetchCvData('primary').then(function (dbData) {
        if (dbData) {
          window.CV_DATA = dbData;
          render();
          updateStatus('Data dinamis dimuat dari database Supabase PostgreSQL.');
        }
      });
      window.SupabaseAdapter.getSession().then(function (session) {
        if (session && session.user && authStatusText) {
          authStatusText.textContent = 'Login sebagai: ' + session.user.email;
          if (btnLoginAuth) btnLoginAuth.style.display = 'none';
          if (btnLogoutAuth) btnLogoutAuth.style.display = 'inline-block';
        }
      });
    }
  }

  syncControlsFromState();
  render();
})();
