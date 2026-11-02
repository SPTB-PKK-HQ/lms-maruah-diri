/* ============================================================
   DASHBOARD GURU — Logik
   ============================================================ */

(function () {
  "use strict";

  const CFG = window.LMS_CONFIG || {};
  const API_STORAGE_KEY = "lms_maruah_api";
  const SESSION_KEY = "lms_guru_key";
  const QUIZ_NAMES = {
    1: "Maksud Maruah",
    2: "Kewajipan",
    3: "Cara Menjaga",
    4: "Akibat & Hikmah"
  };
  const TEMPLATES = {
    cemerlang: "Tahniah! Anda menunjukkan kefahaman yang sangat baik tentang maruah diri. Teruskan menjaga adab, kejujuran dan akhlak dalam kehidupan harian. Jadilah contoh yang baik kepada rakan-rakan.",
    baik: "Syabas kerana melengkapkan modul ini dengan jayanya. Tingkatkan lagi kefahaman dengan membaca semula topik yang lebih mencabar dan teruskan amalan baik di sekolah serta di rumah.",
    bimbingan: "Terima kasih kerana berusaha menyelesaikan modul ini. Sila semak semula Topik 1 hingga 4 dan ulang kuiz untuk mengukuhkan kefahaman. Jangan malu bertanya kepada guru jika memerlukan bantuan."
  };

  const params = new URLSearchParams(window.location.search);
  const queryApi = (params.get("api") || "").trim();
  if (queryApi) {
    try { localStorage.setItem(API_STORAGE_KEY, queryApi); } catch (e) { /* abaikan */ }
  }

  let apiUrl = queryApi || String(CFG.API_URL || "").trim() || readStorage(localStorage, API_STORAGE_KEY) || "";
  let teacherKey = readStorage(sessionStorage, SESSION_KEY) || "";
  let results = [];
  let filtered = [];
  let selectedId = null;
  let selectedRecord = null;
  let sheetUrl = "";
  let refreshTimer = null;
  let loading = false;
  let saving = false;

  const $ = function (id) { return document.getElementById(id); };

  function readStorage(storage, key) {
    try { return storage.getItem(key) || ""; } catch (e) { return ""; }
  }

  function writeStorage(storage, key, value) {
    try {
      if (value) storage.setItem(key, value);
      else storage.removeItem(key);
    } catch (e) { /* abaikan */ }
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function truncate(text, max) {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return value.slice(0, max - 1).trimEnd() + "…";
  }

  function toast(message, type) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", type === "error");
    el.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { el.classList.remove("show"); }, 3600);
  }

  /* ============================ API ============================ */

  function hasScriptBridge() {
    return !!(window.google && window.google.script && window.google.script.run);
  }

  function callApi(paramsObj, timeoutMs) {
    if (hasScriptBridge()) {
      return new Promise(function (resolve, reject) {
        let finished = false;
        const timer = setTimeout(function () {
          if (finished) return;
          finished = true;
          reject(new Error("Masa tamat. Sila cuba lagi."));
        }, timeoutMs || 30000);
        const payload = {};
        Object.keys(paramsObj).forEach(function (key) {
          if (key !== "action") payload[key] = paramsObj[key];
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
            .apiCall(paramsObj.action, payload);
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
      if (!apiUrl) {
        reject(new Error("URL backend belum ditetapkan."));
        return;
      }
      let url;
      try {
        url = new URL(apiUrl);
      } catch (e) {
        reject(new Error("URL backend tidak sah."));
        return;
      }
      const cbName = "guruJsonp_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
      Object.keys(paramsObj).forEach(function (key) {
        const value = paramsObj[key];
        if (value === undefined || value === null) return;
        url.searchParams.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
      });
      url.searchParams.set("callback", cbName);

      const script = document.createElement("script");
      let finished = false;
      const timer = setTimeout(function () {
        done(new Error("Masa tamat. Sila semak sambungan dan URL Web App."));
      }, timeoutMs || 25000);

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
        done(new Error("Tidak dapat menghubungi backend. Semak URL dan akses Web App."));
      };
      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  /* ============================ FORMAT ============================ */

  function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  function dateParts(value) {
    const d = parseDate(value);
    if (!d) return { date: "—", time: "" };
    try {
      return {
        date: d.toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })
      };
    } catch (e) {
      return { date: d.toDateString(), time: "" };
    }
  }

  function fullDate(value) {
    const parts = dateParts(value);
    return parts.time ? parts.date + " • " + parts.time : parts.date;
  }

  function statusLabel(status) {
    if (status === "cemerlang") return "Cemerlang";
    if (status === "baik") return "Baik";
    if (status === "bimbingan") return "Perlu Bimbingan";
    return "Sudah diulas";
  }

  function statusClass(status) {
    return ["cemerlang", "baik", "bimbingan"].indexOf(status) !== -1 ? status : "neutral";
  }

  function hasFeedback(record) {
    return !!(String(record.feedback || "").trim() || String(record.feedbackStatus || "").trim());
  }

  function quizEntries(record) {
    const quizzes = record.quizzes && typeof record.quizzes === "object" ? record.quizzes : {};
    return [1, 2, 3, 4].map(function (n) {
      const q = quizzes[n] || quizzes[String(n)] || {};
      return {
        num: n,
        best: Number(q.best) || 0,
        passed: !!q.passed,
        attempts: Number(q.attempts) || 0
      };
    });
  }

  function totalAttempts(record) {
    return quizEntries(record).reduce(function (sum, q) { return sum + q.attempts; }, 0);
  }

  /* ============================ LOG MASUK ============================ */

  function init() {
    const apiInput = $("apiUrl");
    if (hasScriptBridge()) {
      const group = apiInput ? apiInput.closest(".g-field") : null;
      if (group) group.hidden = true;
    } else if (apiInput) {
      apiInput.value = apiUrl;
    }

    bindEvents();
    prepopulateSheetLink();

    if (teacherKey && (apiUrl || hasScriptBridge())) {
      $("teacherKey").value = teacherKey;
      connect({ silent: true });
    }
  }

  function bindEvents() {
    $("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      connect({ silent: false });
    });

    $("logoutBtn").addEventListener("click", logout);
    $("refreshBtn").addEventListener("click", function () { loadResults(false); });

    $("searchInput").addEventListener("input", renderRows);
    $("filterSelect").addEventListener("change", renderRows);
    $("exportBtn").addEventListener("click", exportCsv);
    $("autoRefresh").addEventListener("change", toggleAutoRefresh);

    $("resultsBody").addEventListener("click", function (e) {
      const btn = e.target.closest("[data-open]");
      if (!btn) return;
      openFeedback(btn.getAttribute("data-open"));
    });

    $("modalClose").addEventListener("click", closeModal);
    $("cancelFeedback").addEventListener("click", closeModal);
    $("feedbackModal").addEventListener("click", function (e) {
      if (e.target === $("feedbackModal")) closeModal();
    });
    $("feedbackModal").addEventListener("close", function () {
      selectedId = null;
      selectedRecord = null;
      document.body.style.overflow = "";
    });

    $("feedbackForm").addEventListener("submit", saveFeedback);
    $("feedbackText").addEventListener("input", updateCharCount);

    document.querySelectorAll("[data-template]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const key = btn.getAttribute("data-template");
        if (!TEMPLATES[key]) return;
        $("feedbackStatus").value = key;
        $("feedbackText").value = TEMPLATES[key];
        updateCharCount();
        $("feedbackText").focus();
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && $("autoRefresh").checked && teacherKey) loadResults(true);
    });
  }

  async function connect(opts) {
    const bridge = hasScriptBridge();
    const urlValue = bridge ? "" : $("apiUrl").value.trim();
    const keyValue = $("teacherKey").value.trim();
    const errorEl = $("loginError");
    const btn = $("loginBtn");

    errorEl.hidden = true;

    if (!bridge && (!urlValue || !/^https?:\/\//i.test(urlValue))) {
      errorEl.textContent = "Sila masukkan URL Web App Apps Script yang sah (bermula dengan https://).";
      errorEl.hidden = false;
      $("apiUrl").focus();
      return;
    }
    if (!keyValue) {
      errorEl.textContent = "Sila masukkan kunci guru.";
      errorEl.hidden = false;
      $("teacherKey").focus();
      return;
    }

    apiUrl = bridge ? "" : urlValue;
    teacherKey = keyValue;
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="margin:0"></span><span>Menyambung…</span>';

    try {
      const res = await callApi({ action: "setup", key: teacherKey });
      writeStorage(sessionStorage, SESSION_KEY, teacherKey);
      if (!bridge) writeStorage(localStorage, API_STORAGE_KEY, apiUrl);
      sheetUrl = res.sheetUrl || sheetUrl;
      showDashboard();
      await loadResults(true);
      if (!opts || !opts.silent) toast("Berjaya masuk. Selamat menyemak!");
    } catch (err) {
      teacherKey = "";
      writeStorage(sessionStorage, SESSION_KEY, "");
      if (!opts || !opts.silent) {
        errorEl.textContent = err.message || "Gagal menyambung ke backend.";
        errorEl.hidden = false;
      } else {
        toast("Sesi guru tamat: " + err.message, "error");
      }
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  }

  function showDashboard() {
    $("loginView").hidden = true;
    $("dashboardView").hidden = false;
    $("logoutBtn").hidden = false;
    $("apiUrl").disabled = true;
    $("teacherKey").disabled = true;
    setSheetLink(sheetUrl);
  }

  function logout() {
    teacherKey = "";
    selectedId = null;
    selectedRecord = null;
    results = [];
    filtered = [];
    writeStorage(sessionStorage, SESSION_KEY, "");
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    $("autoRefresh").checked = false;
    $("dashboardView").hidden = true;
    $("loginView").hidden = false;
    $("logoutBtn").hidden = true;
    $("apiUrl").disabled = false;
    $("teacherKey").disabled = false;
    $("teacherKey").value = "";
    $("apiUrl").value = apiUrl;
    $("loginError").hidden = true;
    $("searchInput").value = "";
    $("filterSelect").value = "all";
    document.body.style.overflow = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ============================ MUAT DATA ============================ */

  async function loadResults(silent) {
    if (!teacherKey || loading) return;
    loading = true;
    const refreshBtn = $("refreshBtn");
    refreshBtn.disabled = true;
    refreshBtn.classList.add("loading");
    if (!silent) {
      $("lastUpdated").textContent = "Memuatkan keputusan…";
      if (results.length === 0) showTableLoading();
    }

    try {
      const res = await callApi({ action: "list", key: teacherKey });
      results = Array.isArray(res.results) ? res.results : [];
      sheetUrl = res.sheetUrl || sheetUrl;
      setSheetLink(sheetUrl);
      const now = new Date();
      $("lastUpdated").textContent = "Dikemas kini " + now.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }) +
        " • " + results.length + " rekod";
      renderRows();
      renderStats();
    } catch (err) {
      $("lastUpdated").textContent = "Gagal memuatkan keputusan.";
      if (!silent) toast("Gagal memuatkan data: " + err.message, "error");
      if (results.length === 0) {
        $("resultsBody").innerHTML = "";
        $("emptyState").hidden = false;
      }
    } finally {
      loading = false;
      refreshBtn.disabled = false;
      refreshBtn.classList.remove("loading");
    }
  }

  function showTableLoading() {
    $("emptyState").hidden = true;
    $("resultsBody").innerHTML = '<tr class="loading-row"><td colspan="6"><div class="spinner"></div>Memuatkan keputusan murid…</td></tr>';
  }

  function renderStats() {
    const total = results.length;
    const passed = results.filter(function (r) { return Number(r.percent) >= 80; }).length;
    const pending = results.filter(function (r) { return !hasFeedback(r); }).length;
    const average = total
      ? results.reduce(function (sum, r) { return sum + (Number(r.percent) || 0); }, 0) / total
      : 0;
    $("statTotal").textContent = total;
    $("statPassed").textContent = passed;
    $("statAverage").textContent = (Math.round(average * 10) / 10).toFixed(total ? 1 : 0) + "%";
    $("statPending").textContent = pending;
  }

  function applyFilter() {
    const query = $("searchInput").value.trim().toLowerCase();
    const filter = $("filterSelect").value;

    filtered = results.filter(function (r) {
      const haystack = (r.name + " " + r.className).toLowerCase();
      if (query && haystack.indexOf(query) === -1) return false;

      if (filter === "pending") return !hasFeedback(r);
      if (filter === "reviewed") return hasFeedback(r);
      if (["cemerlang", "baik", "bimbingan"].indexOf(filter) !== -1) {
        return String(r.feedbackStatus || "") === filter;
      }
      return true;
    });
  }

  function renderRows() {
    applyFilter();
    const tbody = $("resultsBody");
    const empty = $("emptyState");

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      empty.hidden = false;
      const hasResults = results.length > 0;
      empty.querySelector("h3").textContent = hasResults ? "Tiada murid sepadan" : "Tiada keputusan untuk dipaparkan";
      empty.querySelector("p").textContent = hasResults
        ? "Cuba tukar carian atau tapisan. Rekod lain masih tersimpan."
        : "Keputusan murid akan muncul di sini selepas mereka melengkapkan semua kuiz dan backend disambungkan.";
      return;
    }

    empty.hidden = true;
    tbody.innerHTML = filtered.map(function (record) {
      const parts = dateParts(record.submittedAt);
      const percent = Number(record.percent) || 0;
      const quizzes = quizEntries(record);
      const reviewed = hasFeedback(record);
      const feedbackPill = reviewed
        ? '<span class="pill ' + statusClass(record.feedbackStatus) + '">' + esc(statusLabel(record.feedbackStatus)) + "</span>" +
          (record.feedback ? "<small>" + esc(truncate(record.feedback, 58)) + "</small>" : "<small>Tiada ulasan teks</small>")
        : '<span class="pill neutral">Belum diulas</span><small>Menunggu respons guru</small>';

      return '<tr>' +
        '<td><div class="student-cell"><span class="avatar">' + esc((record.name || "M").charAt(0).toUpperCase()) + "</span>" +
          "<div><strong>" + esc(record.name) + "</strong><small>" + esc(record.className) + "</small></div></div></td>" +
        '<td><div class="date-cell">' + esc(parts.date) + "<small>" + esc(parts.time) + "</small></div></td>" +
        '<td><div class="mark-cell"><div class="mark-top"><strong>' + percent + '%</strong><span>' +
          (percent >= 80 ? "Lulus" : "Belum lulus") + '</span></div><div class="mark-bar"><span style="width:' + Math.min(100, Math.max(0, percent)) + '%"></span></div></div></td>' +
        '<td><div class="quiz-mini">' + quizzes.map(function (q) {
          return '<span class="' + (q.best < 80 ? "low" : "") + '">K' + q.num + " " + q.best + "%</span>";
        }).join("") + "</div></td>" +
        '<td><div class="respons-cell">' + feedbackPill + "</div></td>" +
        '<td class="action-cell"><button type="button" class="row-btn' + (reviewed ? " has-feedback" : "") + '" data-open="' + esc(record.id) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          (reviewed ? "Edit Respons" : "Beri Respons") + "</button></td>" +
      "</tr>";
    }).join("");
  }

  /* ============================ MODAL ============================ */

  function openFeedback(id) {
    const record = results.find(function (r) { return r.id === id; });
    if (!record) return;
    selectedId = id;
    selectedRecord = record;
    fillModal(record);
    const modal = $("feedbackModal");
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      const text = $("feedbackText");
      if (text) text.focus();
    }, 120);
  }

  function fillModal(record) {
    $("modalName").textContent = record.name || "Murid";
    const parts = dateParts(record.submittedAt);
    $("modalMeta").textContent = (record.className || "—") + " • Dihantar " + parts.date +
      (parts.time ? " " + parts.time : "");
    $("modalPercent").textContent = (Number(record.percent) || 0) + "%";
    $("modalDuration").textContent = (Number(record.duration) || 0) + " minit";
    $("modalAttempts").textContent = totalAttempts(record) + " kali";
    $("modalCert").textContent = record.certificateNo || "—";

    const quizzes = quizEntries(record);
    $("modalQuizBreakdown").innerHTML = quizzes.map(function (q) {
      return '<div class="qb-card"><small>Kuiz ' + q.num + " • " + esc(QUIZ_NAMES[q.num]) + "</small>" +
        "<strong>" + q.best + "%</strong><span>" + (q.attempts || 0) + " percubaan • " +
        (q.passed ? "Lulus" : "Belum lulus") + "</span></div>";
    }).join("");

    const answers = Array.isArray(record.answers) ? record.answers : [];
    $("answersCount").textContent = "(" + answers.length + ")";
    $("modalAnswers").innerHTML = answers.length
      ? answers.map(function (a) {
          return '<div class="answer-row">' +
            '<span class="answer-mark ' + (a.betul ? "ok" : "no") + '">' + (a.betul ? "✓" : "×") + "</span>" +
            "<div><strong>Kuiz " + (Number(a.kuiz) || "—") + " • " + esc(a.soalan || "Soalan") + "</strong>" +
            "<small>Jawapan murid: " + esc(a.jawapan || "—") +
            (a.betul ? "" : " • Betul: " + esc(a.betulJawapan || "—")) + "</small></div>" +
          "</div>";
        }).join("")
      : '<p class="muted" style="padding:12px 0;font-size:.76rem">Tiada butiran jawapan disimpan untuk rekod ini.</p>';

    $("feedbackStatus").value = record.feedbackStatus || "";
    $("feedbackText").value = record.feedback || "";
    $("feedbackError").hidden = true;
    updateCharCount();
  }

  function closeModal() {
    const modal = $("feedbackModal");
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
    document.body.style.overflow = "";
  }

  function updateCharCount() {
    const text = $("feedbackText");
    const count = $("charCount");
    if (text && count) count.textContent = text.value.length;
  }

  async function saveFeedback(e) {
    e.preventDefault();
    if (saving || !selectedId) return;

    const status = $("feedbackStatus").value;
    const feedback = $("feedbackText").value.trim();
    const errorEl = $("feedbackError");
    errorEl.hidden = true;

    if (!status && !feedback) {
      const record = results.find(function (r) { return r.id === selectedId; });
      if (record && hasFeedback(record) &&
        confirm("Kosongkan respons untuk murid ini? Ulasan sedia ada akan dipadam.")) {
        // teruskan untuk memadam
      } else {
        errorEl.textContent = "Sila pilih status pencapaian atau tulis ulasan sebelum menyimpan.";
        errorEl.hidden = false;
        return;
      }
    }

    saving = true;
    const btn = $("saveFeedbackBtn");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="margin:0"></span><span>Menyimpan…</span>';

    try {
      const res = await callApi({
        action: "feedback",
        key: teacherKey,
        id: selectedId,
        status: status,
        feedback: feedback
      });

      const record = results.find(function (r) { return r.id === selectedId; });
      if (record) {
        record.feedback = res.feedback || feedback;
        record.feedbackStatus = res.status || status;
        record.feedbackAt = res.feedbackAt || new Date().toISOString();
      }
      renderRows();
      renderStats();
      closeModal();
      toast(feedback || status ? "Respons berjaya disimpan dan boleh dilihat oleh murid." : "Respons telah dikosongkan.");
    } catch (err) {
      errorEl.textContent = err.message || "Gagal menyimpan respons.";
      errorEl.hidden = false;
      toast("Gagal menyimpan respons: " + err.message, "error");
    } finally {
      saving = false;
      btn.disabled = false;
      btn.innerHTML = original;
    }
  }

  /* ============================ SHEET & CSV ============================ */

  function setSheetLink(url) {
    const link = $("sheetLink");
    if (!link) return;
    if (url) {
      link.href = url;
      link.hidden = false;
    } else {
      link.hidden = true;
    }
  }

  function prepopulateSheetLink() {
    if (sheetUrl) setSheetLink(sheetUrl);
  }

  function toggleAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    if ($("autoRefresh").checked) {
      refreshTimer = setInterval(function () {
        if (!document.hidden && teacherKey) loadResults(true);
      }, 30000);
      toast("Auto muat semula setiap 30 saat diaktifkan.");
    }
  }

  function csvCell(value) {
    const text = String(value == null ? "" : value).replace(/"/g, '""');
    return '"' + text + '"';
  }

  function exportCsv() {
    applyFilter();
    if (filtered.length === 0) {
      toast("Tiada rekod untuk dieksport.", "error");
      return;
    }
    const header = [
      "Nama", "Kelas", "Tarikh Hantar", "Peratus", "Status",
      "Kuiz 1 (%)", "Kuiz 2 (%)", "Kuiz 3 (%)", "Kuiz 4 (%)",
      "Tempoh (minit)", "No. Sijil", "Status Ulasan", "Ulasan Guru", "Tarikh Ulasan"
    ];
    const rows = filtered.map(function (r) {
      const quizzes = quizEntries(r);
      return [
        r.name, r.className, fullDate(r.submittedAt), Number(r.percent) || 0, r.status || "",
        quizzes[0].best, quizzes[1].best, quizzes[2].best, quizzes[3].best,
        Number(r.duration) || 0, r.certificateNo || "",
        r.feedbackStatus ? statusLabel(r.feedbackStatus) : "",
        r.feedback || "", r.feedbackAt ? fullDate(r.feedbackAt) : ""
      ].map(csvCell).join(",");
    });
    const csv = "\uFEFF" + header.map(csvCell).join(",") + "\r\n" + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Keputusan-Maruah-Diri-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast("CSV sedang dimuat turun (" + filtered.length + " rekod).");
  }

  /* ============================ MULA ============================ */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
