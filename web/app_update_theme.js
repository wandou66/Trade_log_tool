(function () {
  const THEME_KEY = "trade_journal_theme";
  const STAR_FILLED = "\u2605";
  const STAR_EMPTY = "\u2606";
  const TEXT_NO_RECORDS = "\u5f53\u524d\u72b6\u6001\u4e0b\u8fd8\u6ca1\u6709\u8bb0\u5f55\u3002";
  const TEXT_UNNAMED = "\u672a\u547d\u540d";
  const TEXT_PENDING_LOGIC = "\u7b49\u5f85\u8865\u5145\u903b\u8f91";
  const TEXT_WAIT_EXIT = "\u7b49\u5f85\u5e73\u4ed3";
  const TEXT_NO_TAGS = "\u672a\u6253\u6807\u7b7e";
  const STATUS_DONE = "\u5df2\u5b8c\u6210";
  const TAG_TONES = ["tone-blue", "tone-green", "tone-red", "tone-amber", "tone-purple", "tone-cyan"];

  function toTenStarScore(score) {
    const numeric = Number(score);
    if (!Number.isFinite(numeric)) return STAR_EMPTY.repeat(10);
    const filled = Math.max(1, Math.min(10, Math.round(numeric)));
    return `${STAR_FILLED.repeat(filled)}${STAR_EMPTY.repeat(10 - filled)}`;
  }

  function buildLogicText(record) {
    if (typeof pickSummaryValue === "function") {
      return pickSummaryValue(record.entryLogic, record.entryLogicNote) || TEXT_PENDING_LOGIC;
    }
    return record.entryLogic || record.entryLogicNote || TEXT_PENDING_LOGIC;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function splitTagNotes(text) {
    return String(text || "")
      .split("\u3001")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function readFormTagsNoteFallback(record) {
    if (!record || typeof state === "undefined" || record.id !== state.selectedId) return "";
    if (typeof fields === "undefined" || typeof $ !== "function") return "";
    const input = fields.tagsNote ? $(fields.tagsNote) : null;
    return input?.value?.trim() || "";
  }

  function readFormTagsFallback(record) {
    if (!record || typeof state === "undefined" || record.id !== state.selectedId) return [];
    const group = document.getElementById("trade-tags");
    if (!group) return [];
    return Array.from(group.querySelectorAll(".chip.active"))
      .map((chip) => chip.textContent.trim())
      .filter(Boolean);
  }

  function collectTags(record) {
    const selected = Array.isArray(record.tags) && record.tags.length
      ? record.tags.filter(Boolean)
      : readFormTagsFallback(record);
    const notedSource = record.tagsNote || readFormTagsNoteFallback(record);
    const noted = splitTagNotes(notedSource);
    return Array.from(new Set([...selected, ...noted]));
  }

  function tagTone(tag) {
    const source = String(tag || "");
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = ((hash << 5) - hash) + source.charCodeAt(index);
      hash |= 0;
    }
    return TAG_TONES[Math.abs(hash) % TAG_TONES.length];
  }

  function buildTagMarkup(record) {
    const tags = collectTags(record);
    if (!tags.length) {
      return `<span class="archive-tag-empty">${TEXT_NO_TAGS}</span>`;
    }

    return tags
      .map((tag) => `<span class="archive-tag-chip ${tagTone(tag)}">${escapeHtml(tag)}</span>`)
      .join("");
  }

  function buildRText(record) {
    const value = String(record.rMultiple || "").trim();
    return value ? `${value}R` : "--";
  }

  function buildPnlText(record) {
    if (record.status !== STATUS_DONE) return TEXT_WAIT_EXIT;
    const pnlValue = typeof safeNumber === "function" ? safeNumber(record.pnlAmount) : Number(record.pnlAmount);
    return record.pnlAmount ? `${pnlValue > 0 ? "+" : ""}${record.pnlAmount}` : "--";
  }

  function wrapRenderArchiveList() {
    if (typeof renderArchiveList !== "function") return;
    const original = renderArchiveList;

    renderArchiveList = function () {
      original();
      if (typeof els === "undefined" || !els?.archiveList || typeof state === "undefined") return;

      const records = (state.records || [])
        .filter((record) => record.status === state.filterStatus)
        .sort((a, b) => String(b.entryTime || b.createdAt).localeCompare(String(a.entryTime || a.createdAt)));

      const cards = Array.from(els.archiveList.querySelectorAll(".trade-item"));
      if (!records.length) {
        els.archiveList.innerHTML = `<div class="trade-item"><div class="logic">${TEXT_NO_RECORDS}</div></div>`;
        return;
      }

      cards.forEach((card, index) => {
        const record = records[index];
        if (!record) return;

        const symbolEl = card.querySelector(".archive-symbol");
        if (symbolEl) symbolEl.textContent = record.symbol || TEXT_UNNAMED;

        const timeEl = card.querySelector(".archive-time");
        if (timeEl) {
          timeEl.textContent = typeof toDisplayTime === "function"
            ? toDisplayTime(record.entryTime)
            : (record.entryTime || "--");
        }

        const rEl = card.querySelector(".archive-rmultiple");
        if (rEl) rEl.textContent = buildRText(record);

        const logicEl = card.querySelector(".archive-logic");
        if (logicEl) logicEl.textContent = buildLogicText(record);

        const scoreEl = card.querySelector(".archive-score");
        if (scoreEl) {
          scoreEl.textContent = toTenStarScore(record.score);
          scoreEl.title = record.score ? `${record.score} / 10` : "0 / 10";
        }

        const pnlEl = card.querySelector(".archive-pnl");
        if (pnlEl) {
          pnlEl.textContent = buildPnlText(record);
          pnlEl.classList.remove("positive", "negative");
          if (record.status === STATUS_DONE) {
            const pnlValue = typeof safeNumber === "function" ? safeNumber(record.pnlAmount) : Number(record.pnlAmount);
            pnlEl.classList.add(pnlValue >= 0 ? "positive" : "negative");
          }
        }

        const tagsEl = card.querySelector(".archive-tags");
        if (tagsEl) tagsEl.innerHTML = buildTagMarkup(record);
      });
    };
  }

  function initThemeToggle() {
    const toggle = document.getElementById("theme-toggle-btn");
    const detailModal = document.getElementById("detail-modal");
    const toggleLabel = '<span class="theme-sun">☀</span> 亮 / <span class="theme-moon">☾</span> 暗';

    const applyTheme = (theme) => {
      document.body.classList.toggle("theme-dark", theme === "dark");
      if (toggle) toggle.innerHTML = toggleLabel;
    };

    const syncToggleLayer = () => {
      if (!toggle || !detailModal) return;
      toggle.classList.toggle("is-backgrounded", detailModal.classList.contains("open"));
    };

    try {
      applyTheme(localStorage.getItem(THEME_KEY) || "light");
    } catch (_) {
      applyTheme("light");
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("theme-dark") ? "light" : "dark";
        applyTheme(nextTheme);
        try {
          localStorage.setItem(THEME_KEY, nextTheme);
        } catch (_) {
          // ignore storage failures
        }
      });
    }

    if (detailModal) {
      syncToggleLayer();
      const observer = new MutationObserver(syncToggleLayer);
      observer.observe(detailModal, { attributes: true, attributeFilter: ["class"] });
    }
  }

  function initThemeEnhance() {
    initThemeToggle();
    wrapRenderArchiveList();
    if (typeof renderArchiveList === "function") {
      renderArchiveList();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeEnhance);
  } else {
    initThemeEnhance();
  }
})();
