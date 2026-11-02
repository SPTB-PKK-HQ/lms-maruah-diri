/* ============================================================
   LMS MARUAH DIRI — Logik pelajar
   ============================================================ */

(function () {
  "use strict";

  const MODULE = window.LMS_CONTENT.module;
  const TOPICS = window.LMS_CONTENT.topics;
  const QUIZZES = window.LMS_CONTENT.quizzes;
  const CFG = window.LMS_CONFIG || {};
  const STORAGE_KEY = "lms_maruah_v1";
  const API_STORAGE_KEY = "lms_maruah_api";
  const PASS_MARK = 80;

  const STEPS = [
    { id: "topik1", kind: "topic", num: 1, eyebrow: "Topik 1", title: "Maksud Menjaga Maruah Diri", short: "Topik 1" },
    { id: "kuiz1", kind: "quiz", num: 1, eyebrow: "Kuiz 1", title: "Isi Tempat Kosong", short: "Kuiz 1" },
    { id: "topik2", kind: "topic", num: 2, eyebrow: "Topik 2", title: "Kewajipan Menjaga Maruah Diri", short: "Topik 2" },
    { id: "kuiz2", kind: "quiz", num: 2, eyebrow: "Kuiz 2", title: "Betul atau Salah", short: "Kuiz 2" },
    { id: "topik3", kind: "topic", num: 3, eyebrow: "Topik 3", title: "Cara Menjaga Maruah Diri", short: "Topik 3" },
    { id: "kuiz3", kind: "quiz", num: 3, eyebrow: "Kuiz 3", title: "Seret, Letak & Pilih", short: "Kuiz 3" },
    { id: "topik4", kind: "topic", num: 4, eyebrow: "Topik 4", title: "Akibat dan Hikmah", short: "Topik 4" },
    { id: "kuiz4", kind: "quiz", num: 4, eyebrow: "Kuiz 4", title: "Pilihan Terbaik", short: "Kuiz 4" },
    { id: "sijil", kind: "cert", num: 0, eyebrow: "Penutup", title: "Sijil Penghargaan", short: "Sijil" }
  ];

  const SVG = {
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 17h12v4H6z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    star: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M42 12a20 20 0 1 0 0 40 23 23 0 1 1 0-40z" fill="currentColor"/><circle cx="45" cy="18" r="4" fill="currentColor"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    award: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5"/></svg>',
    message: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    hand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 13V5a2 2 0 0 1 4 0v6"/><path d="M12 11V4a2 2 0 0 1 4 0v7"/><path d="M16 11V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.8L3 14a2 2 0 0 1 3.4-2.1L8 14"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    certificate: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 9h10"/><path d="M7 13h6"/><circle cx="17" cy="17" r="3"/><path d="M15.5 19.5L15 23l2-1 2 1-.5-3.5"/></svg>'
  };

  const API_QUERY = new URLSearchParams(window.location.search).get("api");
  if (API_QUERY && API_QUERY.trim()) {
    try { localStorage.setItem(API_STORAGE_KEY, API_QUERY.trim()); } catch (e) { /* abaikan */ }
  }
  const API_URL = (API_QUERY && API_QUERY.trim()) ||
    String(CFG.API_URL || "").trim() ||
    (function () {
      try { return localStorage.getItem(API_STORAGE_KEY) || ""; } catch (e) { return ""; }
    })();

  let state = loadState() || freshState();
  let currentStep = "topik1";
  let drafts = {};
  let results = {};
  let savingPromise = null;

  const els = {};

  /* ============================ UTILITI ============================ */

  function $(id) {
    return document.getElementById(id);
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function freshState() {
    return {
      version: 1,
      name: "",
      className: "",
      startedAt: null,
      completedTopics: [],
      quizzes: {},
      certificate: null,
      resultId: null,
      clientId: null,
      syncedPercent: null,
      saveError: "",
      lastStep: "topik1"
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !parsed.name) return null;
      const base = freshState();
      const merged = Object.assign(base, parsed);
      merged.completedTopics = Array.isArray(merged.completedTopics) ? merged.completedTopics.filter(function (n) { return n >= 1 && n <= 4; }) : [];
      merged.quizzes = merged.quizzes && typeof merged.quizzes === "object" ? merged.quizzes : {};
      return merged;
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* storan penuh / mod peribadi */ }
  }

  function makeId(prefix) {
    return (prefix || "MRH") + "-" + Date.now().toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function formatDate(value, withTime) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    try {
      return d.toLocaleString("ms-MY", withTime
        ? { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
        : { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return d.toDateString();
    }
  }

  function toast(message, type) {
    const el = els.toast;
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("toast-error", type === "error");
    el.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      el.classList.remove("show");
    }, 3400);
  }

  function stepIndex(id) {
    return STEPS.findIndex(function (s) { return s.id === id; });
  }

  function isQuizPassed(num) {
    return !!(state.quizzes[num] && state.quizzes[num].passed);
  }

  function completedTopicsCount() {
    return state.completedTopics.length;
  }

  function passedQuizCount() {
    return Object.keys(QUIZZES).filter(function (n) { return isQuizPassed(Number(n)); }).length;
  }

  function completedStepCount() {
    return completedTopicsCount() + passedQuizCount();
  }

  function progressPercent() {
    return Math.round((completedStepCount() / 8) * 100);
  }

  function allQuizzesPassed() {
    return passedQuizCount() === Object.keys(QUIZZES).length;
  }

  function isStepUnlocked(id) {
    const idx = stepIndex(id);
    if (idx <= 0) return true;
    const prev = STEPS[idx - 1];
    if (prev.kind === "topic") return state.completedTopics.indexOf(prev.num) !== -1;
    if (prev.kind === "quiz") return isQuizPassed(prev.num);
    return true;
  }

  function resumeStep() {
    for (let i = 0; i < STEPS.length; i++) {
      const s = STEPS[i];
      if (s.kind === "topic" && state.completedTopics.indexOf(s.num) === -1) return s.id;
      if (s.kind === "quiz" && !isQuizPassed(s.num)) return s.id;
    }
    return allQuizzesPassed() ? "sijil" : "topik1";
  }

  function nextStep(id) {
    const idx = stepIndex(id);
    return idx >= 0 && idx < STEPS.length - 1 ? STEPS[idx + 1] : null;
  }

  function nextStepButtonLabel(step) {
    if (!step) return "Selesai";
    if (step.kind === "cert") return "Lihat Sijil Penghargaan";
    if (step.kind === "quiz") return "Teruskan: Kuiz " + step.num;
    return "Teruskan: Topik " + step.num;
  }

  function overallPercent() {
    const ids = Object.keys(QUIZZES);
    let total = 0;
    ids.forEach(function (n) {
      const q = state.quizzes[n];
      total += q && typeof q.best === "number" ? q.best : 0;
    });
    return Math.round(total / ids.length);
  }

  function quizSummary() {
    const out = {};
    Object.keys(QUIZZES).forEach(function (n) {
      const q = state.quizzes[n];
      out[n] = q
        ? { best: q.best || 0, passed: !!q.passed, attempts: q.attempts || 0 }
        : { best: 0, passed: false, attempts: 0 };
    });
    return out;
  }

  function allDetails() {
    const out = [];
    Object.keys(QUIZZES).forEach(function (n) {
      const q = state.quizzes[n];
      if (!q || !Array.isArray(q.detail)) return;
      q.detail.forEach(function (d) {
        out.push({
          kuiz: Number(n),
          soalan: String(d.soalan || "").slice(0, 160),
          jawapan: String(d.jawapan || "").slice(0, 100),
          betul: !!d.betul,
          betulJawapan: String(d.betulJawapan || "").slice(0, 100)
        });
      });
    });
    return out;
  }

  function minutesSpent() {
    if (!state.startedAt) return 1;
    const ms = Date.now() - new Date(state.startedAt).getTime();
    if (!isFinite(ms) || ms < 0) return 1;
    return Math.max(1, Math.round(ms / 60000));
  }

  function safeFilename(name) {
    const base = String(name || "Murid").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-");
    return base.slice(0, 60) || "Murid";
  }

  /* ============================ API ============================ */

  function hasScriptBridge() {
    return !!(window.google && window.google.script && window.google.script.run);
  }

  function apiAvailable() {
    return hasScriptBridge() || !!API_URL;
  }

  function callApi(params, timeoutMs) {
    if (hasScriptBridge()) {
      return new Promise(function (resolve, reject) {
        let finished = false;
        const timer = setTimeout(function () {
          if (finished) return;
          finished = true;
          reject(new Error("Masa tamat. Sila cuba lagi."));
        }, timeoutMs || 30000);
        const payload = {};
        Object.keys(params).forEach(function (key) {
          if (key !== "action") payload[key] = params[key];
        });
        try {
          window.google.script.run
            .withSuccessHandler(function (data) {
              if (finished) return;
              finished = true;
              clearTimeout(timer);
              if (!data || data.ok === false) {
                reject(new Error((data && data.message) || "Backend memulangkan ralat."));
                return;
              }
              resolve(data);
            })
            .withFailureHandler(function (err) {
              if (finished) return;
              finished = true;
              clearTimeout(timer);
              reject(new Error((err && err.message) || "Ralat sambungan ke backend."));
            })
            .apiCall(params.action, payload);
        } catch (err) {
          if (!finished) {
            finished = true;
            clearTimeout(timer);
            reject(new Error(err && err.message ? err.message : "Ralat sambungan ke backend."));
          }
        }
      });
    }

    return new Promise(function (resolve, reject) {
      if (!API_URL) {
        reject(new Error("URL backend Apps Script belum ditetapkan."));
        return;
      }
      const cbName = "lmsJsonp_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
      const url = new URL(API_URL);
      Object.keys(params).forEach(function (key) {
        const value = params[key];
        if (value === undefined || value === null) return;
        url.searchParams.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
      });
      url.searchParams.set("callback", cbName);

      const script = document.createElement("script");
      let finished = false;
      const timer = setTimeout(function () {
        done(new Error("Masa tamat. Sila semak sambungan internet dan cuba lagi."));
      }, timeoutMs || 20000);

      function done(err) {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
        if (err) reject(err);
      }

      window[cbName] = function (data) {
        if (finished) return;
        if (!data || data.ok === false) {
          done(new Error((data && data.message) || "Backend memulangkan ralat."));
          return;
        }
        done();
        resolve(data);
      };

      script.onerror = function () {
        done(new Error("Tidak dapat menghubungi backend. Semak URL Web App."));
      };
      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  /* ============================ SIFIR SIJIL ============================ */

  function certificateUnlocked() {
    return allQuizzesPassed();
  }

  function ensureCertificate() {
    if (!certificateUnlocked()) return null;
    const percent = overallPercent();
    if (!state.certificate) {
      state.certificate = {
        no: makeCertNo(),
        date: new Date().toISOString(),
        percent: percent
      };
      saveState();
    } else {
      state.certificate.percent = Math.max(state.certificate.percent || 0, percent);
    }
    return state.certificate;
  }

  function makeCertNo() {
    const cls = String(state.className || "T1").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6) || "T1";
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "MD30/" + cls + "/" + year + "/" + rand;
  }

  /* ============================ PENGURUSAN SKRIN ============================ */

  function init() {
    els.cover = $("cover");
    els.app = $("app");
    els.startForm = $("startForm");
    els.studentName = $("studentName");
    els.studentClass = $("studentClass");
    els.formError = $("formError");
    els.resumeBox = $("resumeBox");
    els.resumePercent = $("resumePercent");
    els.resumeBar = $("resumeBar");
    els.resumeMeta = $("resumeMeta");
    els.coverCardTitle = $("coverCardTitle");
    els.coverCardDesc = $("coverCardDesc");
    els.stepNav = $("stepNav");
    els.content = $("content");
    els.progressLabel = $("progressLabel");
    els.progressPercent = $("progressPercent");
    els.progressBar = $("progressBar");
    els.sidebarProgress = $("sidebarProgress");
    els.studentInitial = $("studentInitial");
    els.studentChipName = $("studentChipName");
    els.studentChipClass = $("studentChipClass");
    els.feedbackShortcut = $("feedbackShortcut");
    els.toast = $("toast");

    bindGlobalEvents();
    renderCoverState();
  }

  function bindGlobalEvents() {
    els.startForm.addEventListener("submit", function (e) {
      e.preventDefault();
      startLearning();
    });

    $("resumeBtn").addEventListener("click", function () {
      enterApp();
    });

    $("newStartBtn").addEventListener("click", function () {
      if (!confirm("Mula semula dari awal? Semua progres pada peranti ini akan dipadam.")) return;
      clearProgress();
      renderCoverState();
    });

    $("brandHome").addEventListener("click", function (e) {
      e.preventDefault();
      showCover();
    });

    $("resetBtn").addEventListener("click", resetFromApp);
    $("sidebarReset").addEventListener("click", resetFromApp);

    els.feedbackShortcut.addEventListener("click", function () {
      if (!certificateUnlocked()) {
        toast("Sijil dan respons guru dibuka selepas semua kuiz lulus.");
        return;
      }
      navigate("sijil");
    });

    els.stepNav.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-step]");
      if (!btn) return;
      const id = btn.getAttribute("data-step");
      if (!isStepUnlocked(id)) {
        toast("Selesaikan langkah sebelumnya dahulu untuk membuka bahagian ini.");
        return;
      }
      navigate(id);
    });
  }

  function renderCoverState() {
    const hasProgress = !!state.name;
    els.coverCardTitle.textContent = hasProgress ? "Selamat kembali" : "Selamat datang";
    els.coverCardDesc.textContent = hasProgress
      ? "Teruskan pembelajaran anda dari tempat terakhir."
      : "Isi butiran diri untuk memulakan pengembaraan ilmu.";

    if (hasProgress) {
      els.startForm.hidden = true;
      els.resumeBox.hidden = false;
      const pct = progressPercent();
      els.resumePercent.textContent = pct + "%";
      els.resumeBar.style.width = pct + "%";
      const next = STEPS.find(function (s) { return s.id === resumeStep(); });
      els.resumeMeta.textContent = state.name + " • " + state.className + " • " +
        completedStepCount() + "/8 langkah" + (allQuizzesPassed() ? " • Sijil tersedia" : "");
      $("resumeBtn").textContent = allQuizzesPassed() ? "Lihat Sijil & Maklum Balas" : "Sambung: " + (next ? next.short : "Pembelajaran");
    } else {
      els.startForm.hidden = false;
      els.resumeBox.hidden = true;
      els.studentName.value = "";
      els.studentClass.value = "";
      els.formError.hidden = true;
    }
  }

  function showCover() {
    els.app.hidden = true;
    els.cover.hidden = false;
    renderCoverState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startLearning() {
    const name = els.studentName.value.trim().replace(/\s+/g, " ");
    const className = els.studentClass.value.trim().replace(/\s+/g, " ");
    if (name.length < 2) {
      els.formError.textContent = "Sila masukkan nama penuh anda (sekurang-kurangnya 2 huruf).";
      els.formError.hidden = false;
      els.studentName.focus();
      return;
    }
    if (!className) {
      els.formError.textContent = "Sila masukkan kelas anda, contoh: 1 Amanah.";
      els.formError.hidden = false;
      els.studentClass.focus();
      return;
    }

    state = freshState();
    state.name = name;
    state.className = className;
    state.startedAt = new Date().toISOString();
    state.clientId = makeId("MRH");
    state.lastStep = "topik1";
    saveState();
    enterApp();
  }

  function enterApp() {
    els.cover.hidden = true;
    els.app.hidden = false;
    els.studentChipName.textContent = state.name;
    els.studentChipClass.textContent = state.className;
    els.studentInitial.textContent = (state.name.charAt(0) || "M").toUpperCase();
    refreshChrome();
    navigate(validStartStep(), { initial: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function validStartStep() {
    const saved = state.lastStep;
    if (saved && stepIndex(saved) !== -1 && isStepUnlocked(saved)) return saved;
    return resumeStep();
  }

  function clearProgress() {
    state = freshState();
    drafts = {};
    results = {};
    savingPromise = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* abaikan */ }
    currentStep = "topik1";
  }

  function resetFromApp() {
    if (!confirm("Mula semula? Semua progres pada peranti ini akan dipadam. Keputusan yang telah dihantar kepada guru kekal dalam rekod guru.")) return;
    clearProgress();
    showCover();
  }

  function refreshChrome() {
    const pct = progressPercent();
    els.progressLabel.textContent = completedStepCount() + " / 8 langkah";
    els.progressPercent.textContent = pct + "%";
    els.progressBar.style.width = pct + "%";
    if (els.sidebarProgress) els.sidebarProgress.textContent = pct + "% selesai";
    if (els.feedbackShortcut) els.feedbackShortcut.hidden = !certificateUnlocked();
    renderNav();
  }

  /* ============================ NAVIGASI ============================ */

  function renderNav() {
    const html = STEPS.map(function (step) {
      const unlocked = isStepUnlocked(step.id);
      const done = step.kind === "topic"
        ? state.completedTopics.indexOf(step.num) !== -1
        : step.kind === "quiz"
          ? isQuizPassed(step.num)
          : certificateUnlocked();
      const active = currentStep === step.id;
      const status = unlocked ? (done ? SVG.check : SVG.arrow) : SVG.lock;
      const classes = ["step-item"];
      if (active) classes.push("active");
      if (done) classes.push("done");
      if (!unlocked) classes.push("locked");
      const label = "Langkah: " + step.eyebrow + " — " + step.title + (unlocked ? "" : " (berkunci)");
      const divider = step.kind === "quiz" ? '<div class="nav-divider"></div>' : "";
      return '<button type="button" class="' + classes.join(" ") + '" data-step="' + step.id + '" data-kind="' + step.kind + '" aria-label="' + esc(label) + '"' +
        (active ? ' aria-current="step"' : "") + (unlocked ? "" : ' aria-disabled="true"') + '>' +
        '<span class="step-dot"><span>' + (step.kind === "cert" ? "S" : step.num) + "</span>" + SVG.check + "</span>" +
        '<span class="step-text"><small>' + esc(step.eyebrow) + "</small><strong>" + esc(step.kind === "quiz" ? step.title : step.title) + "</strong></span>" +
        '<span class="step-status">' + status + "</span></button>" + divider;
    }).join("");
    els.stepNav.innerHTML = html;
  }

  function navigate(id, opts) {
    if (stepIndex(id) === -1) return;
    if (!isStepUnlocked(id)) {
      toast("Selesaikan langkah sebelumnya dahulu untuk membuka bahagian ini.");
      return;
    }
    currentStep = id;
    state.lastStep = id;
    saveState();
    refreshChrome();
    if (id === "sijil") {
      renderCertificate();
    } else {
      const step = STEPS[stepIndex(id)];
      if (step.kind === "topic") renderTopic(step.num);
      else renderQuiz(step.num);
    }
    if (!opts || !opts.initial) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      els.content.focus({ preventScroll: true });
    }
  }

  /* ============================ TOPIK ============================ */

  function renderTopic(num) {
    const topic = TOPICS[num];
    const done = state.completedTopics.indexOf(num) !== -1;
    const quiz = QUIZZES[num];
    const heroDots = [1, 2, 3, 4].map(function (n) {
      return '<span class="' + (n <= num ? "on" : "") + '"></span>';
    }).join("");

    els.content.innerHTML =
      '<article class="panel">' +
        '<header class="topic-hero">' +
          '<div class="hero-topline">' +
            '<span class="hero-badge">Topik ' + num + " daripada 4</span>" +
            '<span class="hero-time">' + SVG.clock + topic.minutes + " minit bacaan</span>" +
          "</div>" +
          "<h2>" + esc(topic.title) + "</h2>" +
          '<p class="hero-sub">' + esc(topic.subtitle) + "</p>" +
          '<div class="hero-steps" aria-hidden="true">' + heroDots + "</div>" +
        "</header>" +
        '<div class="topic-body">' +
          topic.html +
          '<div class="lesson-actions">' +
            "<div><strong>" + (done ? "Topik ini telah selesai." : "Sudah faham?") + "</strong>" +
              '<p class="note">' + (done
                ? "Anda boleh baca semula pada bila-bila masa. Teruskan ke kuiz untuk menguji kefahaman."
                : "Tandakan topik ini selesai untuk membuka Kuiz " + num + ".") + "</p></div>" +
            '<button id="completeTopic" type="button" class="btn btn-primary">' +
              "<span>" + (done ? "Teruskan ke Kuiz " + num : "Saya telah faham — teruskan") + "</span>" + SVG.arrow +
            "</button>" +
          "</div>" +
        "</div>" +
      "</article>";

    $("completeTopic").addEventListener("click", function () {
      if (state.completedTopics.indexOf(num) === -1) {
        state.completedTopics.push(num);
        state.completedTopics.sort(function (a, b) { return a - b; });
        saveState();
        toast("Topik " + num + " selesai. Kuiz " + num + " telah dibuka.");
        refreshChrome();
      }
      navigate("kuiz" + num);
    });
  }

  /* ============================ KUIZ: DRAF ============================ */

  function getDraft(num) {
    if (drafts[num]) return drafts[num];
    const q = QUIZZES[num];
    if (q.type === "blank") drafts[num] = { answer: null };
    else if (q.type === "tf") drafts[num] = { answers: q.statements.map(function () { return null; }) };
    else if (q.type === "mcq") drafts[num] = { answers: q.questions.map(function () { return null; }) };
    else if (q.type === "dragmcq") drafts[num] = {
      assign: {},
      answers: q.mcqs.map(function () { return null; }),
      selectedItem: null
    };
    return drafts[num];
  }

  function isQuizReady(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    if (q.type === "blank") return !!d.answer;
    if (q.type === "tf") return d.answers.every(function (a) { return a !== null; });
    if (q.type === "mcq") return d.answers.every(function (a) { return a !== null; });
    if (q.type === "dragmcq") {
      const allPlaced = q.items.every(function (item) { return !!d.assign[item.id]; });
      const allMcq = d.answers.every(function (a) { return a !== null; });
      return allPlaced && allMcq;
    }
    return false;
  }

  /* ============================ KUIZ: RENDER ============================ */

  const FORMAT_LABEL = {
    blank: "Isi Tempat Kosong",
    tf: "Betul atau Salah",
    mcq: "Pelbagai Pilihan",
    dragmcq: "Seret & Letak + Pilihan"
  };

  function quizHero(num, extraMeta) {
    const q = QUIZZES[num];
    const st = state.quizzes[num];
    const attempts = st && st.attempts ? st.attempts : 0;
    return '<header class="quiz-hero">' +
      '<div class="quiz-eyebrow"><span class="quiz-badge">Kuiz ' + num + " daripada 4</span>" +
      '<span class="quiz-format">' + esc(FORMAT_LABEL[q.type]) + "</span></div>" +
      "<h2>" + esc(q.title) + "</h2>" +
      '<p class="quiz-intro">' + esc(q.intro) + "</p>" +
      '<div class="quiz-meta-row">' +
        '<span class="quiz-meta">' + SVG.award + "Lulus " + q.passMark + "%</span>" +
        '<span class="quiz-meta">' + SVG.check + "Markah terbaik: " + (st && typeof st.best === "number" ? st.best + "%" : "—") + "</span>" +
        '<span class="quiz-meta">' + SVG.refresh + "Percubaan: " + attempts + "</span>" +
        (extraMeta || "") +
      "</div>" +
    "</header>";
  }

  function quizWrapper(num, body, extraMeta) {
    return '<article class="panel">' + quizHero(num, extraMeta) + body + "</article>";
  }

  function renderQuiz(num) {
    if (results[num]) {
      els.content.innerHTML = quizWrapper(num, resultBody(num));
      bindResultActions(num);
      return;
    }
    if (isQuizPassed(num)) {
      els.content.innerHTML = quizWrapper(num, passedBody(num));
      bindResultActions(num);
      return;
    }
    els.content.innerHTML = quizWrapper(num, '<div class="quiz-body">' + interactiveBody(num) + "</div>");
    bindQuizInteractive(num);
  }

  function passedBody(num) {
    const st = state.quizzes[num];
    const next = nextStep("kuiz" + num);
    return '<div class="quiz-body">' +
      '<div class="quiz-feedback pass">' +
        '<div class="feedback-head">' +
          '<div class="score-ring" style="--score:' + (st.best || 0) + '"><span>' + (st.best || 0) + "%</span></div>" +
          '<div class="feedback-title"><small>Sudah lulus</small><h3>Syabas, kuiz ini telah dilengkapkan!</h3>' +
            "<p>Skor terbaik anda: " + (st.best || 0) + "% dalam " + (st.attempts || 1) + " percubaan.</p></div>" +
        "</div>" +
        '<div class="feedback-explain">Anda boleh mengulang kuiz ini untuk memperbaiki skor, atau meneruskan pembelajaran ke langkah seterusnya.</div>' +
        '<div class="result-actions">' +
          '<button type="button" class="btn btn-primary" data-next>' + esc(nextStepButtonLabel(next)) + SVG.arrow + "</button>" +
          '<button type="button" class="btn btn-outline" data-retry>' + SVG.refresh + "Ulang Kuiz</button>" +
          '<button type="button" class="btn btn-quiet" data-back-topic>Baca semula topik</button>' +
        "</div>" +
      "</div>" +
    "</div>";
  }

  function bindResultActions(num) {
    const next = nextStep("kuiz" + num);
    const nextBtn = els.content.querySelector("[data-next]");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (next) navigate(next.id);
      });
    }
    const retryBtn = els.content.querySelector("[data-retry]");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        delete drafts[num];
        delete results[num];
        renderQuiz(num);
        toast("Kuiz dimulakan semula. Cuba sehingga lulus!");
      });
    }
    const backBtn = els.content.querySelector("[data-back-topic]");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        navigate("topik" + num);
      });
    }
  }

  function interactiveBody(num) {
    const q = QUIZZES[num];
    if (q.type === "blank") return blankBody(num);
    if (q.type === "tf") return tfBody(num);
    if (q.type === "mcq") return mcqBody(num);
    return dragmcqBody(num);
  }

  function quizFooter() {
    return '<div class="quiz-actions">' +
      '<div class="quiz-actions-left">' +
        '<button type="button" class="btn btn-outline" id="resetQuiz">Kosongkan Jawapan</button>' +
        '<span class="quiz-helper" id="quizHelper">Lengkapkan semua bahagian untuk menyemak.</span>' +
      '</div>' +
      '<button type="button" class="btn btn-primary" id="checkQuiz" disabled>Semak Jawapan' + SVG.arrow + "</button>" +
    "</div>";
  }

  function bindCommonFooter(num) {
    const check = $("checkQuiz");
    const reset = $("resetQuiz");
    updateCheckState(num);
    check.addEventListener("click", function () {
      if (!isQuizReady(num)) {
        toast("Sila jawab semua bahagian terlebih dahulu.");
        return;
      }
      gradeQuiz(num);
    });
    reset.addEventListener("click", function () {
      delete drafts[num];
      renderQuiz(num);
      toast("Jawapan dikosongkan.");
    });
  }

  function updateCheckState(num) {
    const check = $("checkQuiz");
    const helper = $("quizHelper");
    if (!check) return;
    const ready = isQuizReady(num);
    check.disabled = !ready;
    if (helper) {
      helper.textContent = ready
        ? "Semua bahagian telah dijawab. Anda boleh menyemak sekarang."
        : "Lengkapkan semua bahagian untuk menyemak.";
    }
  }

  function blankBody(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    const chosen = q.options.find(function (o) { return o.id === d.answer; });
    const pair = chosen ? chosen.text.split(" / ") : ["________", "________"];
    return '<div class="quiz-section">' +
      '<div class="blank-sentence">' + esc(q.parts[0]) +
        '<span class="blank-slot' + (chosen ? " filled" : "") + '" data-blank="0">' + esc(pair[0] || "________") + "</span>" +
        esc(q.parts[1]) +
        '<span class="blank-slot' + (chosen ? " filled" : "") + '" data-blank="1">' + esc(pair[1] || "________") + "</span>" +
        esc(q.parts[2]) +
      "</div>" +
      '<div class="option-grid" id="optionGrid">' +
        q.options.map(function (o) {
          return '<button type="button" class="option-card' + (d.answer === o.id ? " selected" : "") + '" data-opt="' + o.id + '">' +
            '<span class="option-letter">' + o.id + "</span><span>" + esc(o.text) + "</span></button>";
        }).join("") +
      "</div>" + quizFooter() + "</div>";
  }

  function tfBody(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    return '<div class="quiz-section"><div class="tf-list" id="tfList">' +
      q.statements.map(function (statement, i) {
        const val = d.answers[i];
        return '<article class="tf-card" data-index="' + i + '">' +
          '<div class="question-top"><span class="question-number">' + (i + 1) + "</span><p>" + esc(statement.text) + "</p></div>" +
          '<div class="tf-actions">' +
            '<button type="button" class="tf-btn' + (val === true ? " selected" : "") + '" data-val="true" data-tf="' + i + '">' + SVG.check + "Betul</button>" +
            '<button type="button" class="tf-btn' + (val === false ? " selected" : "") + '" data-val="false" data-tf="' + i + '">' + SVG.lock + "Salah</button>" +
          "</div>" +
        "</article>";
      }).join("") +
    "</div>" + quizFooter() + "</div>";
  }

  function mcqMarkup(questions, answers, prefix) {
    return questions.map(function (question, qi) {
      return '<article class="mcq-card" data-qindex="' + qi + '">' +
        '<div class="question-top"><span class="question-number">' + (qi + 1) + "</span><p>" + esc(question.text) + "</p></div>" +
        '<div class="mcq-options">' +
          question.options.map(function (o) {
            return '<button type="button" class="mcq-option' + (answers[qi] === o.id ? " selected" : "") + '" data-mcq="' + qi + '" data-val="' + o.id + '">' +
              '<span class="mcq-letter">' + o.id + "</span><span>" + esc(o.text) + "</span></button>";
          }).join("") +
        "</div>" +
      "</article>";
    }).join("");
  }

  function mcqBody(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    return '<div class="quiz-section"><div class="mcq-list" id="mcqList">' +
      mcqMarkup(q.questions, d.answers, "q") + "</div>" + quizFooter() + "</div>";
  }

  function dragChip(item, draft, fromPool) {
    const selected = fromPool && draft.selectedItem === item.id;
    return '<button type="button" class="drag-chip' + (selected ? " selected" : "") + '" data-item="' + item.id + '" draggable="' + (fromPool ? "true" : "false") + '" title="' +
      (fromPool ? "Seret atau ketik kad ini" : "Ketik untuk kembalikan ke senarai") + '">' + esc(item.text) + "</button>";
  }

  function dragBoardMarkup(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    const placed = Object.keys(d.assign).length;
    const poolItems = q.items.filter(function (item) { return !d.assign[item.id]; });
    const pool = poolItems.length
      ? poolItems.map(function (item) { return dragChip(item, d, true); }).join("")
      : "";
    const zones = q.categories.map(function (cat) {
      const items = q.items.filter(function (item) { return d.assign[item.id] === cat.id; });
      return '<div class="drop-zone" data-cat="' + cat.id + '">' +
        '<div class="drop-zone-header"><strong>' + esc(cat.label) + "</strong><small>" + items.length + " kad</small></div>" +
        '<div class="drop-zone-items">' +
          items.map(function (item) { return dragChip(item, d, false); }).join("") +
        "</div>" +
      "</div>";
    }).join("");
    return '<div class="drag-pool" id="dragPool">' + pool + "</div>" +
      '<div class="drop-zones" id="dropZones">' + zones + "</div>" +
      '<p class="quiz-helper" id="dragCount">' + placed + " / " + q.items.length + " kad telah diletakkan.</p>";
  }

  function dragmcqBody(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    return '<section class="quiz-section">' +
      '<div class="section-head"><span class="section-number">A</span><h3>Seret & Letak</h3></div>' +
      '<p class="section-hint">Kategorikan setiap amalan sama ada berkaitan pakaian, percakapan atau tingkah laku.</p>' +
      '<div class="drag-note">' + SVG.hand + "<span>Seret kad ke kategori yang betul. Pada telefon atau tablet, ketik kad kemudian ketik kategori.</span></div>" +
      '<div id="dragBoard">' + dragBoardMarkup(num) + "</div>" +
    "</section>" +
    '<section class="quiz-section">' +
      '<div class="section-head"><span class="section-number">B</span><h3>Pilihan Terbaik</h3></div>' +
      '<p class="section-hint">Pilih satu jawapan bagi setiap soalan di bawah.</p>' +
      '<div class="mcq-list" id="mcqList">' + mcqMarkup(q.mcqs, d.answers, "d") + "</div>" +
    "</section>" + quizFooter();
  }

  /* ============================ KUIZ: INTERAKSI ============================ */

  function bindQuizInteractive(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);

    if (q.type === "blank") {
      els.content.querySelectorAll("[data-opt]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          d.answer = btn.getAttribute("data-opt");
          const chosen = q.options.find(function (o) { return o.id === d.answer; });
          const pair = chosen.text.split(" / ");
          els.content.querySelectorAll(".blank-slot").forEach(function (slot, i) {
            slot.textContent = pair[i] || "________";
            slot.classList.add("filled");
          });
          els.content.querySelectorAll("[data-opt]").forEach(function (b) {
            b.classList.toggle("selected", b === btn);
          });
          updateCheckState(num);
        });
      });
    }

    if (q.type === "tf") {
      els.content.querySelectorAll("[data-tf]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const idx = Number(btn.getAttribute("data-tf"));
          d.answers[idx] = btn.getAttribute("data-val") === "true";
          els.content.querySelectorAll('[data-tf="' + idx + '"]').forEach(function (b) {
            b.classList.toggle("selected", b === btn);
          });
          updateCheckState(num);
        });
      });
    }

    if (q.type === "mcq") {
      bindMcqChoices(num, d.answers);
    }

    if (q.type === "dragmcq") {
      bindMcqChoices(num, d.answers);
      bindDragBoard(num);
    }

    bindCommonFooter(num);
  }

  function bindMcqChoices(num, answers) {
    els.content.querySelectorAll("[data-mcq]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const qi = Number(btn.getAttribute("data-mcq"));
        answers[qi] = btn.getAttribute("data-val");
        els.content.querySelectorAll('[data-mcq="' + qi + '"]').forEach(function (b) {
          b.classList.toggle("selected", b === btn);
        });
        updateCheckState(num);
        if ($("dragCount")) updateDragCount(num);
      });
    });
  }

  function updateDragCount(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    const el = $("dragCount");
    if (el) el.textContent = Object.keys(d.assign).length + " / " + q.items.length + " kad telah diletakkan.";
  }

  function renderDragBoard(num) {
    const board = $("dragBoard");
    if (!board) return;
    board.innerHTML = dragBoardMarkup(num);
    updateDragCount(num);
    updateCheckState(num);
  }

  function bindDragBoard(num) {
    const q = QUIZZES[num];
    const d = getDraft(num);
    const board = $("dragBoard");
    if (!board) return;

    board.addEventListener("dragstart", function (e) {
      const chip = e.target.closest(".drag-chip");
      if (!chip || chip.getAttribute("draggable") !== "true") return;
      e.dataTransfer.setData("text/plain", chip.getAttribute("data-item"));
      e.dataTransfer.effectAllowed = "move";
      chip.classList.add("dragging");
    });

    board.addEventListener("dragend", function (e) {
      const chip = e.target.closest(".drag-chip");
      if (chip) chip.classList.remove("dragging");
      board.querySelectorAll(".drag-over").forEach(function (z) { z.classList.remove("drag-over"); });
    });

    board.addEventListener("dragover", function (e) {
      const zone = e.target.closest(".drop-zone");
      if (!zone) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      board.querySelectorAll(".drop-zone").forEach(function (z) {
        z.classList.toggle("drag-over", z === zone);
      });
    });

    board.addEventListener("dragleave", function (e) {
      const zone = e.target.closest(".drop-zone");
      if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("drag-over");
    });

    board.addEventListener("drop", function (e) {
      const zone = e.target.closest(".drop-zone");
      if (!zone) return;
      e.preventDefault();
      const itemId = e.dataTransfer.getData("text/plain");
      if (!itemId) return;
      d.assign[itemId] = zone.getAttribute("data-cat");
      d.selectedItem = null;
      renderDragBoard(num);
    });

    board.addEventListener("click", function (e) {
      const chip = e.target.closest(".drag-chip");
      const zone = e.target.closest(".drop-zone");

      if (chip) {
        e.stopPropagation();
        const itemId = chip.getAttribute("data-item");
        if (chip.getAttribute("draggable") === "true") {
          d.selectedItem = d.selectedItem === itemId ? null : itemId;
          renderDragBoard(num);
        } else {
          delete d.assign[itemId];
          d.selectedItem = null;
          renderDragBoard(num);
        }
        return;
      }

      if (zone && d.selectedItem) {
        d.assign[d.selectedItem] = zone.getAttribute("data-cat");
        d.selectedItem = null;
        renderDragBoard(num);
      }
    });
  }

  /* ============================ KUIZ: PENILAIAN ============================ */

  function gradeQuiz(num) {
    if (!isQuizReady(num)) {
      toast("Sila jawab semua bahagian terlebih dahulu.");
      return;
    }
    const q = QUIZZES[num];
    const d = getDraft(num);
    let score = 0;
    let detail = [];

    if (q.type === "blank") {
      const chosen = q.options.find(function (o) { return o.id === d.answer; });
      const correct = q.options.find(function (o) { return o.id === q.answer; });
      const isCorrect = d.answer === q.answer;
      if (isCorrect) score++;
      detail.push({
        soalan: q.parts.join("________"),
        jawapan: chosen ? chosen.text : "Tidak dijawab",
        betul: isCorrect,
        betulJawapan: correct.text,
        nota: q.explanation
      });
    }

    if (q.type === "tf") {
      detail = q.statements.map(function (st, i) {
        const val = d.answers[i];
        const isCorrect = val === st.answer;
        if (isCorrect) score++;
        return {
          soalan: st.text,
          jawapan: val === null ? "Tidak dijawab" : val ? "Betul" : "Salah",
          betul: isCorrect,
          betulJawapan: st.answer ? "Betul" : "Salah",
          nota: st.explanation
        };
      });
    }

    if (q.type === "mcq") {
      detail = q.questions.map(function (question, i) {
        const val = d.answers[i];
        const chosen = question.options.find(function (o) { return o.id === val; });
        const correct = question.options.find(function (o) { return o.id === question.answer; });
        const isCorrect = val === question.answer;
        if (isCorrect) score++;
        return {
          soalan: question.text,
          jawapan: chosen ? chosen.text : "Tidak dijawab",
          betul: isCorrect,
          betulJawapan: correct.text,
          nota: question.explanation
        };
      });
    }

    if (q.type === "dragmcq") {
      q.items.forEach(function (item) {
        const catId = d.assign[item.id];
        const cat = q.categories.find(function (c) { return c.id === catId; });
        const correctCat = q.categories.find(function (c) { return c.id === item.category; });
        const isCorrect = catId === item.category;
        if (isCorrect) score++;
        detail.push({
          soalan: "Seret & Letak: " + item.text,
          jawapan: cat ? cat.label : "Belum diletakkan",
          betul: isCorrect,
          betulJawapan: correctCat.label,
          nota: "Amalan ini tergolong dalam kategori " + correctCat.label.toLowerCase() + "."
        });
      });
      q.mcqs.forEach(function (question, i) {
        const val = d.answers[i];
        const chosen = question.options.find(function (o) { return o.id === val; });
        const correct = question.options.find(function (o) { return o.id === question.answer; });
        const isCorrect = val === question.answer;
        if (isCorrect) score++;
        detail.push({
          soalan: question.text,
          jawapan: chosen ? chosen.text : "Tidak dijawab",
          betul: isCorrect,
          betulJawapan: correct.text,
          nota: question.explanation
        });
      });
    }

    finishAttempt(num, score, detail);
  }

  function finishAttempt(num, score, detail) {
    const q = QUIZZES[num];
    const total = detail.length;
    const pct = Math.round((score / total) * 100);
    const prev = state.quizzes[num] || { passed: false, best: 0, attempts: 0, total: total };
    const passedNow = pct >= q.passMark;
    const newBest = Math.max(prev.best || 0, pct);
    const keepNewDetail = pct >= (prev.best || 0);

    state.quizzes[num] = {
      passed: !!(prev.passed || passedNow),
      best: newBest,
      total: total,
      attempts: (prev.attempts || 0) + 1,
      detail: keepNewDetail ? detail : (prev.detail || detail),
      at: new Date().toISOString()
    };
    saveState();

    results[num] = {
      score: score,
      total: total,
      pct: pct,
      passed: passedNow,
      best: newBest,
      bestPassed: state.quizzes[num].passed,
      detail: detail
    };

    refreshChrome();
    renderQuiz(num);

    if (passedNow) {
      celebrate();
      if (allQuizzesPassed()) {
        ensureCertificate();
        toast("Semua kuiz lulus! Sijil dan respons guru kini dibuka.");
        ensureResultSaved().catch(function () { /* status dipaparkan pada skrin sijil */ });
      } else {
        toast("Syabas! Anda lulus Kuiz " + num + " dengan skor " + pct + "%.");
      }
    } else if (state.quizzes[num].passed) {
      toast("Percubaan ini " + pct + "%. Skor terbaik " + newBest + "% kekal dan anda masih lulus.");
    } else {
      toast("Skor " + pct + "%. Perlu sekurang-kurangnya " + q.passMark + "% untuk lulus. Cuba lagi!", "error");
    }
  }

  function resultBody(num) {
    const r = results[num];
    const q = QUIZZES[num];
    const next = nextStep("kuiz" + num);
    const keepPassed = state.quizzes[num].passed;
    const showNext = keepPassed;
    const lines = r.detail.map(function (d) {
      return '<div class="review-item ' + (d.betul ? "ok" : "no") + '">' +
        '<span class="review-icon">' + (d.betul ? "✓" : "×") + "</span>" +
        "<div><strong>" + esc(d.soalan) + "</strong>" +
          "<small>Jawapan anda: " + esc(d.jawapan) + (d.betul ? "" : " • Jawapan betul: " + esc(d.betulJawapan || "—")) + "</small>" +
          (d.nota ? "<small>" + esc(d.nota) + "</small>" : "") +
        "</div></div>";
    }).join("");

    const bestNote = !r.passed && keepPassed
      ? '<div class="feedback-explain"><strong>Nota:</strong> Anda sudah lulus kuiz ini sebelum ini dengan skor terbaik ' +
        (state.quizzes[num].best || 0) + "%. Skor terbaik anda kekal dan anda boleh meneruskan.</div>"
      : "";

    return '<div class="quiz-body">' +
      '<div class="quiz-feedback ' + (r.passed ? "pass" : "fail") + '">' +
        '<div class="feedback-head">' +
          '<div class="score-ring" style="--score:' + r.pct + '"><span>' + r.pct + "%</span></div>" +
          '<div class="feedback-title"><small>Keputusan percubaan ini</small>' +
            "<h3>" + (r.passed ? "Syabas, anda lulus!" : "Hampir berjaya. Jangan putus asa!") + "</h3>" +
            "<p>" + r.score + " daripada " + r.total + " bahagian betul • Skor terbaik: " + (state.quizzes[num].best || r.pct) + "%</p></div>" +
        "</div>" +
        '<div class="feedback-explain">' + (r.passed
          ? "Markah lulus ialah " + q.passMark + "%. Anda boleh menyemak semula jawapan di bawah atau meneruskan ke langkah seterusnya."
          : "Markah lulus ialah " + q.passMark + "%. Baca semula topik berkaitan, semak jawapan betul di bawah, kemudian cuba lagi.") + "</div>" +
        bestNote +
        '<div class="review-list">' + lines + "</div>" +
        '<div class="result-actions">' +
          (showNext ? '<button type="button" class="btn btn-primary" data-next>' + esc(nextStepButtonLabel(next)) + SVG.arrow + "</button>" : "") +
          '<button type="button" class="btn ' + (showNext ? "btn-outline" : "btn-primary") + '" data-retry>' + SVG.refresh +
            (r.passed ? "Cuba Perbaiki Skor" : "Cuba Lagi") + "</button>" +
          '<button type="button" class="btn btn-quiet" data-back-topic>Baca semula topik</button>' +
        "</div>" +
      "</div>" +
    "</div>";
  }

  /* ============================ SIJIL ============================ */

  function renderCertificate() {
    if (!certificateUnlocked()) {
      renderCertificateLocked();
      return;
    }
    ensureCertificate();
    const cert = state.certificate;
    const pct = overallPercent();
    const quizRows = Object.keys(QUIZZES).map(function (n) {
      return '<div class="summary-item"><small>Kuiz ' + n + "</small><strong>" +
        (state.quizzes[n] ? (state.quizzes[n].best || 0) + "%" : "—") + "</strong></div>";
    }).join("");

    els.content.innerHTML =
      '<article class="panel">' +
        '<div class="cert-layout">' +
          '<div class="cert-top">' +
            "<div><span class=\"quiz-badge\">" + SVG.award + "Pencapaian</span>" +
              "<h2>Sijil Penghargaan</h2><p>Tahniah! Anda telah melengkapkan keseluruhan modul dengan jayanya.</p></div>" +
            '<div class="cert-actions">' +
              '<button type="button" class="btn btn-primary" id="downloadCert">' + SVG.download + "Muat Turun PNG</button>" +
              '<button type="button" class="btn btn-outline" id="printCert">' + SVG.print + "Cetak</button>" +
            "</div>" +
          "</div>" +
          '<div class="cert-stage">' + certificateMarkup(cert, pct) + "</div>" +
          '<div class="cert-summary">' + quizRows +
            '<div class="summary-item"><small>Markah Keseluruhan</small><strong>' + pct + "%</strong></div>" +
          "</div>" +
          '<div class="cert-sync" id="certSync">' +
            '<span class="feedback-sync"><span class="sync-dot wait" id="syncDot"></span><span id="syncText">Menyediakan keputusan…</span></span>' +
            '<button type="button" class="btn btn-outline btn-small" id="retrySync" hidden>Hantar Semula</button>' +
          "</div>" +
          '<div class="guru-feedback-card">' +
            '<div class="guru-feedback-head">' +
              '<div><span class="teacher-avatar">' + SVG.user + "</span>" +
                "<div><h3>Respons Guru</h3><small id=\"feedbackMeta\">Maklum balas daripada guru mata pelajaran</small></div></div>" +
              '<span class="status-pill neutral" id="feedbackStatus">Belum diulas</span>' +
            "</div>" +
            '<div class="feedback-body" id="guruFeedbackBody">' +
              '<div class="feedback-empty"><span class="mini-spinner"></span><span>Menyemak respons guru…</span></div>' +
            "</div>" +
            '<div class="feedback-foot">' +
              '<span class="feedback-date" id="feedbackDate"></span>' +
              '<button type="button" class="btn btn-outline btn-small" id="refreshFeedback">' + SVG.refresh + "Semak Semula</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</article>";

    $("downloadCert").addEventListener("click", downloadCertificate);
    $("printCert").addEventListener("click", printCertificate);
    $("refreshFeedback").addEventListener("click", loadStudentFeedback);
    $("retrySync").addEventListener("click", function () {
      ensureResultSaved(true).catch(function () { /* status dikemas kini */ });
    });

    updateSyncUI("idle");
    if (!apiAvailable()) {
      updateSyncUI("offline");
      loadStudentFeedback();
    } else if (!state.resultId || state.syncedPercent !== pct) {
      ensureResultSaved().catch(function () { /* status dikemas kini */ });
    } else {
      updateSyncUI("saved");
      loadStudentFeedback();
    }
  }

  function renderCertificateLocked() {
    const next = resumeStep();
    const quizRows = Object.keys(QUIZZES).map(function (n) {
      const passed = isQuizPassed(Number(n));
      return '<li class="' + (passed ? "ok" : "") + '"><span>' + SVG.check + "</span>Kuiz " + n + " • " +
        esc(QUIZZES[n].title) + '<span class="state">' + (passed ? "Lulus" : "Belum lulus") + "</span></li>";
    }).join("");
    const pct = progressPercent();
    els.content.innerHTML =
      '<article class="panel"><div class="locked-panel">' +
        '<div class="locked-icon">' + SVG.lock + "</div>" +
        "<h2>Sijil masih berkunci</h2>" +
        "<p>Lulus kesemua empat kuiz untuk membuka sijil penghargaan dan ruang respons guru. Teruskan usaha, anda sudah hampir!</p>" +
        '<div class="locked-progress"><div class="progress-copy"><span>Kemajuan keseluruhan</span><strong>' + pct + "%</strong></div>" +
          '<div class="progress-track"><span style="width:' + pct + '%"></span></div></div>' +
        '<ul class="locked-list">' + quizRows + "</ul>" +
        '<button type="button" class="btn btn-primary" id="certContinue">Sambung: ' + esc((STEPS.find(function (s) { return s.id === next; }) || {}).short || "Pembelajaran") + SVG.arrow + "</button>" +
      "</div></article>";
    $("certContinue").addEventListener("click", function () {
      navigate(next);
    });
  }

  function certificateMarkup(cert, pct) {
    const school = CFG.SCHOOL_NAME ? '<div class="cert-school">' + esc(CFG.SCHOOL_NAME) + "</div>" : "";
    const issuer = CFG.CERT_ISSUER || "Guru Pendidikan Islam";
    return '<div class="certificate" id="certificatePreview">' +
      '<div class="cert-pattern" aria-hidden="true"></div>' +
      '<span class="cert-corner tl"></span><span class="cert-corner tr"></span>' +
      '<span class="cert-corner bl"></span><span class="cert-corner br"></span>' +
      '<div class="cert-inner">' +
        '<div class="cert-emblem">' + SVG.star + "</div>" +
        '<div class="cert-kicker">Pendidikan Islam • Tingkatan 1</div>' +
        school +
        '<h2 class="cert-title">Sijil Penghargaan</h2>' +
        '<p class="cert-subtitle">Pelajaran 30 • Maruah Diri Cermin Peribadi</p>' +
        '<p class="cert-present">Dengan ini disahkan bahawa</p>' +
        '<div class="cert-name">' + esc(state.name) + "</div>" +
        '<div class="cert-name-rule"></div>' +
        '<p class="cert-body">daripada kelas <strong>' + esc(state.className) + "</strong> telah berjaya menyempurnakan " +
          "Modul Pembelajaran Elektronik Pendidikan Islam serta lulus kesemua kuiz dengan jayanya.</p>" +
        '<div class="cert-mark">Markah Keseluruhan <strong>' + pct + "%</strong></div>" +
        '<p class="cert-quote">“Maruah diri ialah cermin peribadi — jagalah ia dengan iman dan akhlak.”</p>' +
        '<div class="cert-bottom">' +
          '<div class="cert-meta"><strong>' + formatDate(cert.date) + "</strong>Tarikh dianugerahkan<br>No. Sijil: " + esc(cert.no) + "</div>" +
          '<div class="cert-seal"><div class="cert-seal-inner">' + SVG.star + "<span>LULUS</span></div></div>" +
          '<div class="cert-sign"><div class="cert-sign-line"></div><strong>' + esc(issuer) + "</strong><small>Guru Mata Pelajaran</small></div>" +
        "</div>" +
        '<p class="cert-footer-note">Sijil digital ini dijana oleh LMS Maruah Diri • ' + esc(cert.no) + "</p>" +
      "</div>" +
    "</div>";
  }

  function updateSyncUI(mode, message) {
    const dot = $("syncDot");
    const text = $("syncText");
    const retry = $("retrySync");
    if (!dot || !text || !retry) return;

    dot.className = "sync-dot";
    if (mode === "saving") {
      dot.classList.add("wait");
      text.textContent = message || "Menyimpan keputusan untuk guru…";
      retry.hidden = true;
    } else if (mode === "saved") {
      dot.classList.add("ok");
      text.textContent = message || "Keputusan berjaya dihantar kepada guru. Respons akan dipaparkan di bawah.";
      retry.hidden = true;
    } else if (mode === "error") {
      dot.classList.add("err");
      text.textContent = message || "Keputusan belum dihantar. Sila cuba semula.";
      retry.hidden = false;
    } else if (mode === "offline") {
      dot.classList.add("err");
      text.textContent = "Mod offline: keputusan disimpan pada peranti ini. Guru akan dapat melihatnya setelah backend disambungkan.";
      retry.hidden = true;
    } else {
      dot.classList.add("wait");
      text.textContent = "Menyediakan keputusan…";
      retry.hidden = true;
    }
  }

  async function ensureResultSaved(force) {
    if (!certificateUnlocked()) return;
    const pct = overallPercent();

    if (!apiAvailable()) {
      updateSyncUI("offline");
      return;
    }
    if (!force && state.resultId && state.syncedPercent === pct) {
      updateSyncUI("saved");
      return;
    }
    if (savingPromise) {
      updateSyncUI("saving");
      return savingPromise;
    }

    if (!state.clientId) {
      state.clientId = state.resultId || makeId("MRH");
      saveState();
    }

    const cert = ensureCertificate();
    updateSyncUI("saving");

    savingPromise = (async function () {
      try {
        const result = await callApi({
          action: "save",
          id: state.clientId,
          name: state.name,
          className: state.className,
          percent: pct,
          quizzes: quizSummary(),
          answers: allDetails(),
          duration: minutesSpent(),
          certificateNo: cert ? cert.no : "",
          completedAt: cert ? cert.date : new Date().toISOString()
        });
        state.resultId = result.id || state.clientId;
        state.clientId = state.resultId;
        state.syncedPercent = pct;
        state.saveError = "";
        saveState();
        updateSyncUI("saved");
        if ($("guruFeedbackBody")) loadStudentFeedback();
      } catch (err) {
        state.saveError = err && err.message ? err.message : "Ralat tidak diketahui.";
        saveState();
        updateSyncUI("error", "Keputusan belum dihantar: " + state.saveError);
      } finally {
        savingPromise = null;
      }
    })();

    return savingPromise;
  }

  async function loadStudentFeedback() {
    const body = $("guruFeedbackBody");
    if (!body) return;
    const statusEl = $("feedbackStatus");
    const metaEl = $("feedbackMeta");
    const dateEl = $("feedbackDate");

    if (!apiAvailable()) {
      if (statusEl) {
        statusEl.className = "status-pill neutral";
        statusEl.textContent = "Belum diulas";
      }
      body.innerHTML = '<div class="feedback-empty">' + SVG.message +
        "<span>Respons guru memerlukan sambungan backend Apps Script. Sila hubungi guru anda.</span></div>";
      if (metaEl) metaEl.textContent = "Backend belum dikonfigurasi";
      if (dateEl) dateEl.textContent = "";
      return;
    }

    if (!state.resultId) {
      body.innerHTML = '<div class="feedback-empty">' + SVG.message +
        "<span>Keputusan anda sedang disediakan. Sila tunggu sebentar atau tekan Semak Semula.</span></div>";
      if (metaEl) metaEl.textContent = "Menunggu keputusan dihantar";
      if (dateEl) dateEl.textContent = "";
      return;
    }

    body.innerHTML = '<div class="feedback-empty"><span class="mini-spinner"></span><span>Menyemak respons guru…</span></div>';
    if (dateEl) dateEl.textContent = "";

    try {
      const res = await callApi({ action: "result", id: state.resultId }, 15000);
      const result = res.result || {};
      const feedback = String(result.feedback || "").trim();
      const status = String(result.feedbackStatus || "").toLowerCase();
      const hasStatus = ["cemerlang", "baik", "bimbingan"].indexOf(status) !== -1;

      if (statusEl) {
        statusEl.className = "status-pill " + (hasStatus ? status : "neutral");
        statusEl.textContent = hasStatus ? statusLabel(status) : "Belum diulas";
      }
      if (metaEl) {
        metaEl.textContent = result.name
          ? result.name + (result.className ? " • " + result.className : "")
          : "Maklum balas daripada guru mata pelajaran";
      }
      if (dateEl) {
        dateEl.textContent = result.feedbackAt
          ? "Dikemas kini: " + formatDate(result.feedbackAt, true)
          : "";
      }

      if (!feedback && hasStatus) {
        body.innerHTML = '<div class="feedback-empty">' + SVG.award +
          "<span>Guru telah menandakan pencapaian anda sebagai <strong>" + esc(statusLabel(status)) +
          "</strong>. Ulasan penuh akan dipaparkan apabila guru menambahnya.</span></div>";
      } else if (!feedback) {
        body.innerHTML = '<div class="feedback-empty">' + SVG.message +
          "<span>Guru belum meninggalkan respons. Semak semula selepas guru menyemak keputusan anda.</span></div>";
      } else {
        body.innerHTML = '<p>' + esc(feedback) + "</p>";
      }
    } catch (err) {
      body.innerHTML = '<div class="feedback-empty">' + SVG.info +
        "<span>Tidak dapat memuatkan respons guru: " + esc(err.message) + "</span></div>";
      if (statusEl) {
        statusEl.className = "status-pill neutral";
        statusEl.textContent = "Ralat sambungan";
      }
      if (metaEl) metaEl.textContent = "Cuba tekan Semak Semula";
    }
  }

  function statusLabel(status) {
    if (status === "cemerlang") return "Cemerlang";
    if (status === "bimbingan") return "Perlu Bimbingan";
    if (status === "baik") return "Baik";
    return "Sudah diulas";
  }

  /* ============================ Sijil: CANVAS ============================ */

  async function prepareFonts() {
    if (!document.fonts) return;
    try {
      await Promise.all([
        document.fonts.load('600 90px Fraunces'),
        document.fonts.load('italic 600 90px Fraunces'),
        document.fonts.load('700 40px "Plus Jakarta Sans"'),
        document.fonts.load('600 30px "Plus Jakarta Sans"')
      ]);
      await document.fonts.ready;
    } catch (e) { /* guna font fallback */ }
  }

  function drawSpacedText(ctx, text, centerX, y, spacing) {
    const previousAlign = ctx.textAlign;
    ctx.textAlign = "left";
    const chars = Array.from(text);
    const widths = chars.map(function (ch) { return ctx.measureText(ch).width; });
    const total = widths.reduce(function (a, b) { return a + b; }, 0) + spacing * Math.max(0, chars.length - 1);
    let x = centerX - total / 2;
    chars.forEach(function (ch, i) {
      ctx.fillText(ch, x, y);
      x += widths[i] + spacing;
    });
    ctx.textAlign = previousAlign;
  }

  function wrapLines(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach(function (word) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawStar(ctx, cx, cy, outer, inner, points) {
    const n = points || 8;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (Math.PI / n) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  async function buildCertificateCanvas() {
    await prepareFonts();
    const W = 2000;
    const H = 1414;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak disokong oleh pelayar ini.");

    const cert = ensureCertificate() || { no: "—", date: new Date().toISOString() };
    const pct = overallPercent();
    const school = String(CFG.SCHOOL_NAME || "").trim();
    const issuer = String(CFG.CERT_ISSUER || "Guru Pendidikan Islam").trim();

    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, W, H);

    /* Corak geometri halus */
    ctx.strokeStyle = "rgba(11, 107, 79, 0.055)";
    ctx.lineWidth = 1.5;
    for (let y = -80; y < H + 80; y += 118) {
      for (let x = -80; x < W + 80; x += 118) {
        ctx.beginPath();
        ctx.moveTo(x, y - 34);
        ctx.lineTo(x + 34, y);
        ctx.lineTo(x, y + 34);
        ctx.lineTo(x - 34, y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    /* Bingkai */
    ctx.strokeStyle = "#cfa246";
    ctx.lineWidth = 10;
    ctx.strokeRect(46, 46, W - 92, H - 92);
    ctx.strokeStyle = "#0b6b4f";
    ctx.lineWidth = 2;
    ctx.strokeRect(76, 76, W - 152, H - 152);
    ctx.strokeStyle = "rgba(207, 162, 70, 0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(90, 90, W - 180, H - 180);

    /* Hiasan sudut */
    ctx.strokeStyle = "#b98a32";
    ctx.lineWidth = 5;
    const corners = [
      [110, 110, 1, 1], [W - 110, 110, -1, 1],
      [110, H - 110, 1, -1], [W - 110, H - 110, -1, -1]
    ];
    corners.forEach(function (c) {
      const x = c[0], y = c[1], sx = c[2], sy = c[3];
      ctx.beginPath();
      ctx.moveTo(x + 74 * sx, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + 74 * sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 18 * sx, y + 18 * sy, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#cfa246";
      ctx.fill();
    });

    /* Lambang */
    const emblemX = W / 2;
    const emblemY = 154;
    ctx.beginPath();
    ctx.arc(emblemX, emblemY, 47, 0, Math.PI * 2);
    ctx.strokeStyle = "#cfa246";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(emblemX, emblemY, 38, -0.5, Math.PI * 1.25);
    ctx.strokeStyle = "#0b6b4f";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(emblemX + 21, emblemY - 20, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#cfa246";
    ctx.fill();

    /* Teks kepala */
    ctx.textAlign = "center";
    ctx.fillStyle = "#9b6f20";
    ctx.font = '700 25px "Plus Jakarta Sans", Segoe UI, sans-serif';
    drawSpacedText(ctx, "PENDIDIKAN ISLAM  •  TINGKATAN 1", W / 2, 256, 7);

    if (school) {
      ctx.fillStyle = "#0b6b4f";
      ctx.font = '700 27px "Plus Jakarta Sans", Segoe UI, sans-serif';
      ctx.fillText(school, W / 2, 294);
    }

    ctx.fillStyle = "#073d2f";
    ctx.font = '700 96px Fraunces, Georgia, serif';
    drawSpacedText(ctx, "SIJIL PENGHARGAAN", W / 2, 408, 2);

    ctx.fillStyle = "#72857f";
    ctx.font = '700 24px "Plus Jakarta Sans", Segoe UI, sans-serif';
    drawSpacedText(ctx, "PELAJARAN 30  •  MARUAH DIRI CERMIN PERIBADI", W / 2, 462, 2.5);

    ctx.fillStyle = "#4a635c";
    ctx.font = '400 33px "Plus Jakarta Sans", Segoe UI, sans-serif';
    ctx.fillText("Dengan ini disahkan bahawa", W / 2, 540);

    /* Nama */
    let nameSize = 100;
    ctx.font = 'italic 600 ' + nameSize + 'px Fraunces, Georgia, serif';
    while (ctx.measureText(state.name).width > 1460 && nameSize > 48) {
      nameSize -= 4;
      ctx.font = 'italic 600 ' + nameSize + 'px Fraunces, Georgia, serif';
    }
    ctx.fillStyle = "#052f25";
    ctx.fillText(state.name, W / 2, 648);

    /* Garis emas */
    const grad = ctx.createLinearGradient(W / 2 - 330, 0, W / 2 + 330, 0);
    grad.addColorStop(0, "rgba(207, 162, 70, 0)");
    grad.addColorStop(0.5, "#cfa246");
    grad.addColorStop(1, "rgba(207, 162, 70, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(W / 2 - 330, 680, 660, 3);

    ctx.fillStyle = "#4a635c";
    ctx.font = '600 30px "Plus Jakarta Sans", Segoe UI, sans-serif';
    ctx.fillText("Tingkatan / Kelas: " + state.className, W / 2, 730);

    ctx.fillStyle = "#4a635c";
    ctx.font = '400 34px "Plus Jakarta Sans", Segoe UI, sans-serif';
    const bodyLines = [
      "telah berjaya menyempurnakan Modul Pembelajaran Elektronik",
      "Pendidikan Islam — Pelajaran 30: Maruah Diri Cermin Peribadi",
      "serta lulus kesemua kuiz dengan jayanya."
    ];
    bodyLines.forEach(function (line, i) {
      ctx.fillText(line, W / 2, 802 + i * 48);
    });

    /* Pil markah */
    const pillW = 540;
    const pillH = 66;
    const pillX = W / 2 - pillW / 2;
    const pillY = 928;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 33);
    else ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fillStyle = "#faf2dc";
    ctx.fill();
    ctx.strokeStyle = "#e0b75d";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#9b6f20";
    ctx.font = '700 22px "Plus Jakarta Sans", Segoe UI, sans-serif';
    drawSpacedText(ctx, "MARKAH KESELURUHAN", W / 2 - 82, pillY + 42, 2.5);
    ctx.fillStyle = "#0b6b4f";
    ctx.font = '700 34px Fraunces, Georgia, serif';
    ctx.fillText(pct + "%", W / 2 + 182, pillY + 45);

    /* Tarikh */
    ctx.textAlign = "left";
    ctx.fillStyle = "#72857f";
    ctx.font = '700 20px "Plus Jakarta Sans", Segoe UI, sans-serif';
    drawSpacedText(ctx, "TARIKH", 245, 1120, 3);
    ctx.fillStyle = "#16332b";
    ctx.font = '600 27px "Plus Jakarta Sans", Segoe UI, sans-serif';
    ctx.fillText(formatDate(cert.date), 245, 1162);

    ctx.fillStyle = "#72857f";
    ctx.font = '700 20px "Plus Jakarta Sans", Segoe UI, sans-serif';
    drawSpacedText(ctx, "NO. SIJIL", 245, 1220, 3);
    ctx.fillStyle = "#4a635c";
    ctx.font = '600 23px "Plus Jakarta Sans", Segoe UI, sans-serif';
    ctx.fillText(cert.no, 245, 1258);

    /* Meterai */
    const sealX = W / 2;
    const sealY = 1132;
    const sealGrad = ctx.createRadialGradient(sealX - 30, sealY - 36, 10, sealX, sealY, 118);
    sealGrad.addColorStop(0, "#eac56f");
    sealGrad.addColorStop(0.6, "#cfa246");
    sealGrad.addColorStop(1, "#9b6f20");
    ctx.beginPath();
    ctx.arc(sealX, sealY, 112, 0, Math.PI * 2);
    ctx.fillStyle = sealGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sealX, sealY, 94, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 250, 235, 0.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fff8e6";
    ctx.strokeStyle = "#fff8e6";
    ctx.lineWidth = 2;
    drawStar(ctx, sealX, sealY - 32, 24, 10, 8);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff8e6";
    ctx.font = '800 23px "Plus Jakarta Sans", Segoe UI, sans-serif';
    drawSpacedText(ctx, "LULUS", sealX, sealY + 26, 5);
    ctx.font = '600 14px "Plus Jakarta Sans", Segoe UI, sans-serif';
    drawSpacedText(ctx, "MARUAH DIRI", sealX, sealY + 52, 3);

    /* Tandatangan */
    ctx.textAlign = "center";
    ctx.strokeStyle = "#4a635c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1540, 1198);
    ctx.lineTo(1850, 1198);
    ctx.stroke();
    ctx.fillStyle = "#16332b";
    ctx.font = '700 26px "Plus Jakarta Sans", Segoe UI, sans-serif';
    ctx.fillText(issuer, 1695, 1240);
    ctx.fillStyle = "#72857f";
    ctx.font = '500 20px "Plus Jakarta Sans", Segoe UI, sans-serif';
    ctx.fillText("Guru Mata Pelajaran", 1695, 1270);

    /* Kaki */
    ctx.fillStyle = "#9aa9a3";
    ctx.font = '500 18px "Plus Jakarta Sans", Segoe UI, sans-serif';
    ctx.fillText("Sijil digital dijana oleh LMS Maruah Diri • " + cert.no, W / 2, 1314);

    return canvas;
  }

  async function downloadCertificate() {
    const btn = $("downloadCert");
    if (btn) btn.disabled = true;
    try {
      const canvas = await buildCertificateCanvas();
      const filename = "Sijil-Marurah-Diri-" + safeFilename(state.name) + ".png";
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (!blob) {
            downloadDataUrl(canvas.toDataURL("image/png"), filename);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        }, "image/png");
      } else {
        downloadDataUrl(canvas.toDataURL("image/png"), filename);
      }
      toast("Sijil sedang dimuat turun.");
    } catch (err) {
      toast("Gagal menjana sijil: " + err.message, "error");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function downloadDataUrl(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function printCertificate() {
    try {
      const canvas = await buildCertificateCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write('<!DOCTYPE html><html><head><title>Sijil Penghargaan</title><style>' +
        '@page{size:A4 landscape;margin:0}html,body{margin:0;padding:0}img{width:100%;height:auto;display:block}' +
        '</style></head><body><img src="' + dataUrl + '" alt="Sijil Penghargaan"></body></html>');
      doc.close();
      const img = doc.querySelector("img");
      const doPrint = function () {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          toast("Cetak tidak disokong. Sila muat turun PNG dan cetak.", "error");
        }
        setTimeout(function () { iframe.remove(); }, 60000);
      };
      if (img && !img.complete) img.onload = doPrint;
      else setTimeout(doPrint, 300);
    } catch (err) {
      toast("Gagal menyediakan cetakan: " + err.message, "error");
    }
  }

  /* ============================ KONFETI ============================ */

  let confettiFrame = null;

  function celebrate() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = $("confetti");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (confettiFrame) cancelAnimationFrame(confettiFrame);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#0e8160", "#e0b75d", "#149a72", "#cfa246", "#f3e3b9", "#0b6b4f"];
    const particles = Array.from({ length: 110 }, function () {
      return {
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
        y: window.innerHeight * 0.28 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 9 - 3,
        size: 5 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
      };
    });

    const start = performance.now();
    function frame(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(function (p) {
        p.vy += 0.22;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 2800);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (elapsed < 2800) {
        confettiFrame = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        confettiFrame = null;
      }
    }
    confettiFrame = requestAnimationFrame(frame);
  }

  /* ============================ MULA ============================ */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
