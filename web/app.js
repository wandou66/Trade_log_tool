const options = {
  seasons: ["春", "夏", "秋", "冬"],
  marketStates: ["启动", "主升", "震荡", "回调", "退潮"],
  marketHeat: ["冷", "一般", "热", "狂热"],
  targetTypes: ["大盘(BTC)", "二盘(ETH)", "龙头", "共振", "补涨", "普通山寨", "独立行情"],
  entryLogics: [
    "1 启动位",
    "2 小分歧",
    "3 次级5浪-大分歧",
    "4 二波启动",
    "5 主升高位",
    "6 末期反弹",
    "追涨",
    "杀跌",
    "摸顶",
    "抄底",
  ],
  entryEmotions: ["冷静", "FOMO", "急躁", "犹豫", "报复", "随意", "自信", "不甘心错过"],
  exitEmotions: ["按计划执行", "害怕回吐", "贪婪", "随意平仓", "慌张", "麻木", "拿不住", "后悔"],
  tags: [
    "系统内交易",
    "逻辑清晰",
    "顺势",
    "龙头",
    "节奏好",
    "位置好",
    "按计划执行",
    "高质量交易",
    "逆势",
    "FOMO",
    "急躁",
    "追高",
    "追空",
    "刷单",
    "报复交易",
    "止损过窄",
    "止损不坚决",
    "止盈过早",
    "无逻辑",
    "偏离系统",
  ],
};

const state = {
  records: [],
  filterStatus: "持仓中",
  selectedId: null,
  images: [],
  modalImageIndex: 0,
  fullscreen: {
    zoomed: false,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  },
};

const fields = {
  symbol: '[name="symbol"]',
  tradeDirection: '[name="tradeDirection"]',
  entryTime: '[name="entryTime"]',
  entryPrice: '[name="entryPrice"]',
  exitTime: '[name="exitTime"]',
  exitPrice: '[name="exitPrice"]',
  riskAmount: '[name="riskAmount"]',
  pnlAmount: '[name="pnlAmount"]',
  rMultiple: '[name="rMultiple"]',
  score: '[name="score"]',
  marketSeason: '[name="marketSeason"]',
  marketSeasonNote: '[name="marketSeasonNote"]',
  marketState: '[name="marketState"]',
  marketStateNote: '[name="marketStateNote"]',
  marketHeat: '[name="marketHeat"]',
  marketHeatNote: '[name="marketHeatNote"]',
  targetType: '[name="targetType"]',
  targetTypeNote: '[name="targetTypeNote"]',
  entryLogic: '[name="entryLogic"]',
  entryLogicNote: '[name="entryLogicNote"]',
  entryEmotionsNote: '[name="entryEmotionsNote"]',
  exitEmotionsNote: '[name="exitEmotionsNote"]',
  tagsNote: '[name="tagsNote"]',
  executionSummary: '[name="executionSummary"]',
  reviewNotes: '[name="reviewNotes"]',
};

const els = {
  archiveList: document.getElementById("archive-list"),
  filterPills: Array.from(document.querySelectorAll(".filter-pill")),
  newTradeBtn: document.getElementById("new-trade-btn"),
  exportBtnClone: document.getElementById("export-btn-clone"),
  importInputClone: document.getElementById("import-input-clone"),
  form: document.getElementById("trade-form"),
  saveHoldingBtnClone: document.getElementById("save-holding-btn-clone"),
  saveCompletedBtnClone: document.getElementById("save-completed-btn-clone"),
  generateSummaryBtn: document.getElementById("generate-summary-btn"),
  imageInput: document.getElementById("image-input"),
  localShotList: document.getElementById("local-shot-list"),
  viewSummary: document.getElementById("view-summary"),
  heroStats: document.getElementById("hero-stats"),
  summaryStatusBadge: document.getElementById("summary-status-badge"),
  summarySeason: document.getElementById("summary-season"),
  summarySeasonNote: document.getElementById("summary-season-note"),
  summaryMarketState: document.getElementById("summary-market-state"),
  summaryMarketStateNote: document.getElementById("summary-market-state-note"),
  summaryMarketHeat: document.getElementById("summary-market-heat"),
  summaryMarketHeatNote: document.getElementById("summary-market-heat-note"),
  summaryTargetType: document.getElementById("summary-target-type"),
  summaryTargetTypeNote: document.getElementById("summary-target-type-note"),
  summaryEntryLogic: document.getElementById("summary-entry-logic"),
  summaryEntryLogicNote: document.getElementById("summary-entry-logic-note"),
  detailModal: document.getElementById("detail-modal"),
  detailBackdrop: document.getElementById("detail-backdrop"),
  closeModalBtn: document.getElementById("close-modal-btn"),
  modalTitle: document.getElementById("modal-title"),
  modalSubtitle: document.getElementById("modal-subtitle"),
  modalGalleryMain: document.getElementById("modal-gallery-main"),
  modalGalleryThumbs: document.getElementById("modal-gallery-thumbs"),
  modalSummaryTitle: document.getElementById("modal-summary-title"),
  modalSummary: document.getElementById("modal-summary"),
  modalNotesTitle: document.getElementById("modal-notes-title"),
  modalNotes: document.getElementById("modal-notes"),
  fullscreenModal: document.getElementById("fullscreenModal"),
  fullscreenInner: document.querySelector(".fullscreen-inner"),
  fullscreenImage: document.getElementById("fullscreenImage"),
  fullscreenCloseBtn: document.getElementById("fullscreenCloseBtn"),
  archiveItemTemplate: document.getElementById("archive-item-template"),
};

function $(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateTimeInput(date = new Date()) {
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeDateTimeInput(value) {
  if (!value) return "";
  const raw = String(value).trim().replace(" ", "T");
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return match ? `${match[1]}T${match[2]}` : raw;
}

function toDisplayTime(value) {
  const normalized = normalizeDateTimeInput(value);
  return normalized ? normalized.replace("T", " ") : "--";
}

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calcR(pnlAmount, riskAmount) {
  const pnl = safeNumber(pnlAmount);
  const risk = safeNumber(riskAmount);
  if (pnl === null || risk === null || risk === 0) return "";
  return (pnl / risk).toFixed(2);
}

function toFiveStarScore(score) {
  const numeric = safeNumber(score);
  if (numeric === null) return "--";
  const filled = Math.max(0, Math.min(5, Math.round(numeric / 2)));
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
}

function setScoreDisplay(value = "8") {
  const display = document.getElementById("score-display");
  if (display) display.textContent = `${value} / 10`;
}

function createButtonChip(text, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chip${extraClass ? ` ${extraClass}` : ""}`;
  button.textContent = text;
  button.dataset.value = text;
  return button;
}

function populateHiddenSelect(selector, values) {
  const select = $(selector);
  if (!select) return;
  select.innerHTML = `<option value=""></option>${values.map((value) => `<option value="${value}">${value}</option>`).join("")}`;
}

function buildSingleChoiceGroup(containerId, selector, values) {
  const container = document.getElementById(containerId);
  const select = $(selector);
  if (!container || !select) return;
  container.innerHTML = "";
  values.forEach((value) => {
    const button = createButtonChip(value);
    button.addEventListener("click", () => {
      select.value = value;
      syncSingleChoiceGroup(containerId, select.value);
      renderLivePreview();
    });
    container.appendChild(button);
  });
  syncSingleChoiceGroup(containerId, select.value);
}

function syncSingleChoiceGroup(containerId, selectedValue) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll(".chip").forEach((button) => {
    button.classList.toggle("active", button.dataset.value === selectedValue);
  });
}

function isNegativeTag(value) {
  return /逆势|FOMO|急躁|追高|追空|刷单|报复|止损|止盈|无逻辑|偏离/.test(value);
}

function buildMultiChoiceGroup(containerId, values, selected = []) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  values.forEach((value) => {
    const button = createButtonChip(value, isNegativeTag(value) ? "bad" : "good");
    button.classList.toggle("active", selected.includes(value));
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      renderLivePreview();
    });
    container.appendChild(button);
  });
}

function getSelectedMultiChoice(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} .chip.active`)).map((button) => button.dataset.value);
}

function setSelectedMultiChoice(containerId, values = []) {
  document.querySelectorAll(`#${containerId} .chip`).forEach((button) => {
    button.classList.toggle("active", values.includes(button.dataset.value));
  });
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function autoResizeTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.max(textarea.scrollHeight, textarea.classList.contains("large") ? 96 : 56)}px`;
}

function autoResizeAllTextareas() {
  document.querySelectorAll("textarea.textarea").forEach(autoResizeTextarea);
}

function normalizeImage(image) {
  return {
    name: String(image?.name || ""),
    mimeType: String(image?.mimeType || image?.mime_type || "application/octet-stream"),
    data: String(image?.data || ""),
    size: Number(image?.size || 0),
  };
}

function normalizeRecord(record = {}) {
  const images = Array.isArray(record.images) ? record.images.map(normalizeImage) : [];
  return {
    id: String(record.id || crypto.randomUUID()),
    status: String(record.status || "持仓中"),
    symbol: String(record.symbol || ""),
    tradeDirection: String(record.tradeDirection || "多"),
    entryTime: normalizeDateTimeInput(record.entryTime),
    entryPrice: String(record.entryPrice || ""),
    exitTime: normalizeDateTimeInput(record.exitTime),
    exitPrice: String(record.exitPrice || ""),
    riskAmount: String(record.riskAmount || ""),
    pnlAmount: String(record.pnlAmount || ""),
    rMultiple: String(record.rMultiple || calcR(record.pnlAmount, record.riskAmount)),
    score: String(record.score || "8"),
    marketSeason: String(record.marketSeason || ""),
    marketSeasonNote: String(record.marketSeasonNote || ""),
    marketState: String(record.marketState || ""),
    marketStateNote: String(record.marketStateNote || ""),
    marketHeat: String(record.marketHeat || ""),
    marketHeatNote: String(record.marketHeatNote || ""),
    targetType: String(record.targetType || ""),
    targetTypeNote: String(record.targetTypeNote || ""),
    entryLogic: String(record.entryLogic || ""),
    entryLogicNote: String(record.entryLogicNote || ""),
    entryEmotions: Array.isArray(record.entryEmotions) ? record.entryEmotions : [],
    exitEmotions: Array.isArray(record.exitEmotions) ? record.exitEmotions : [],
    entryEmotionsNote: String(record.entryEmotionsNote || ""),
    exitEmotionsNote: String(record.exitEmotionsNote || ""),
    tags: Array.isArray(record.tags) ? record.tags : [],
    tagsNote: String(record.tagsNote || ""),
    executionSummary: String(record.executionSummary || ""),
    reviewNotes: String(record.reviewNotes || ""),
    images,
    createdAt: String(record.createdAt || new Date().toISOString()),
  };
}

function findRecordById(id) {
  return state.records.find((record) => record.id === id) || null;
}

function currentRecordFromForm() {
  const record = {
    id: state.selectedId || crypto.randomUUID(),
    status: "持仓中",
    symbol: $(fields.symbol).value.trim(),
    tradeDirection: $(fields.tradeDirection).value,
    entryTime: normalizeDateTimeInput($(fields.entryTime).value),
    entryPrice: $(fields.entryPrice).value.trim(),
    exitTime: normalizeDateTimeInput($(fields.exitTime).value),
    exitPrice: $(fields.exitPrice).value.trim(),
    riskAmount: $(fields.riskAmount).value.trim(),
    pnlAmount: $(fields.pnlAmount).value.trim(),
    rMultiple: calcR($(fields.pnlAmount).value.trim(), $(fields.riskAmount).value.trim()),
    score: $(fields.score).value || "8",
    marketSeason: $(fields.marketSeason).value,
    marketSeasonNote: $(fields.marketSeasonNote).value.trim(),
    marketState: $(fields.marketState).value,
    marketStateNote: $(fields.marketStateNote).value.trim(),
    marketHeat: $(fields.marketHeat).value,
    marketHeatNote: $(fields.marketHeatNote).value.trim(),
    targetType: $(fields.targetType).value,
    targetTypeNote: $(fields.targetTypeNote).value.trim(),
    entryLogic: $(fields.entryLogic).value,
    entryLogicNote: $(fields.entryLogicNote).value.trim(),
    entryEmotions: getSelectedMultiChoice("entry-emotions"),
    exitEmotions: getSelectedMultiChoice("exit-emotions"),
    entryEmotionsNote: $(fields.entryEmotionsNote).value.trim(),
    exitEmotionsNote: $(fields.exitEmotionsNote).value.trim(),
    tags: getSelectedMultiChoice("trade-tags"),
    tagsNote: $(fields.tagsNote)?.value.trim() || "",
    executionSummary: $(fields.executionSummary).value.trim(),
    reviewNotes: $(fields.reviewNotes).value.trim(),
    images: [...state.images],
    createdAt: findRecordById(state.selectedId)?.createdAt || new Date().toISOString(),
  };

  $(fields.rMultiple).value = record.rMultiple;
  return normalizeRecord(record);
}

function validateRecord(record, targetStatus) {
  const required = [
    ["symbol", "交易品种"],
    ["entryTime", "开仓时间"],
    ["entryPrice", "开仓点位"],
    ["riskAmount", "风险金额"],
  ];

  for (const [key, label] of required) {
    if (!record[key]) {
      alert(`请先填写：${label}`);
      return false;
    }
  }

  const grouped = [
    ["marketSeason", "marketSeasonNote", "市场季节"],
    ["marketState", "marketStateNote", "大盘状态"],
    ["marketHeat", "marketHeatNote", "市场热度"],
    ["targetType", "targetTypeNote", "标的类型"],
    ["entryLogic", "entryLogicNote", "入场逻辑"],
  ];

  for (const [mainKey, noteKey, label] of grouped) {
    if (!record[mainKey] && !record[noteKey]) {
      alert(`请至少填写：${label} 或它的补充说明`);
      return false;
    }
  }

  if (targetStatus === "已完成") {
    const completedRequired = [
      ["exitTime", "平仓时间"],
      ["exitPrice", "平仓点位"],
      ["pnlAmount", "盈亏金额"],
    ];
    for (const [key, label] of completedRequired) {
      if (!record[key]) {
        alert(`更新为已完成前，请先填写：${label}`);
        return false;
      }
    }
  }

  return true;
}

function pickSummaryValue(primary, note) {
  if (primary && note) return `${primary}（${note}）`;
  if (primary) return primary;
  if (note) return note;
  return "";
}

function setSummaryMini(valueEl, noteEl, primary, note) {
  if (!valueEl) return;
  valueEl.textContent = primary || note || "--";
  if (!noteEl) return;
  noteEl.textContent = primary && note ? note : "";
}

function appendClause(parts, label, value) {
  if (value) parts.push(`${label}${value}`);
}

function makeSummary(record) {
  const season = pickSummaryValue(record.marketSeason, record.marketSeasonNote);
  const marketState = pickSummaryValue(record.marketState, record.marketStateNote);
  const heat = pickSummaryValue(record.marketHeat, record.marketHeatNote);
  const targetType = pickSummaryValue(record.targetType, record.targetTypeNote);
  const entryLogic = pickSummaryValue(record.entryLogic, record.entryLogicNote);
  const entryEmotions = pickSummaryValue((record.entryEmotions || []).join("、"), record.entryEmotionsNote);
  const exitEmotions = pickSummaryValue((record.exitEmotions || []).join("、"), record.exitEmotionsNote);
  const score = record.score ? `${record.score} / 10` : "";

  const sections = [];
  const opening = [];
  if (record.entryTime) opening.push(`${toDisplayTime(record.entryTime)} 开仓`);
  if (record.symbol) opening.push(record.symbol);
  if (record.tradeDirection) opening.push(`${record.tradeDirection}单`);
  if (opening.length) sections.push(opening.join("，"));

  const environment = [];
  appendClause(environment, "季节判断：", season);
  appendClause(environment, "大盘状态：", marketState);
  appendClause(environment, "市场热度：", heat);
  if (environment.length) sections.push(environment.join("，"));

  const logic = [];
  appendClause(logic, "标的类型：", targetType);
  appendClause(logic, "入场逻辑：", entryLogic);
  appendClause(logic, "入场情绪：", entryEmotions);
  appendClause(logic, "评分：", score);
  if (logic.length) sections.push(logic.join("，"));

  if (record.status === "已完成") {
    const closing = [];
    if (record.exitTime) closing.push(`${toDisplayTime(record.exitTime)} 完全平仓`);
    appendClause(closing, "盈亏金额：", record.pnlAmount);
    appendClause(closing, "盈亏比：", record.rMultiple);
    appendClause(closing, "出场情绪：", exitEmotions);
    if (closing.length) sections.push(closing.join("，"));
  } else {
    sections.push("当前仍在持仓中，等待完全平仓后补全结果、出场情绪和截图");
  }

  return `${sections.join("。")}。`;
}

async function apiGet(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("请求失败");
  }
  return response.json();
}

async function apiPost(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "请求失败");
  }
  return payload;
}

async function loadRecords() {
  const payload = await apiGet("/api/trades");
  state.records = Array.isArray(payload.records) ? payload.records.map(normalizeRecord) : [];
  syncFilterStatus();
  renderArchiveList();

  if (state.records.length) {
    const selected = findRecordById(state.selectedId);
    const record = selected || state.records.find((item) => item.status === state.filterStatus) || state.records[0];
    selectRecord(record.id, false);
  } else {
    createNewTrade(false);
  }
}

function syncFilterStatus() {
  if (!state.records.length) {
    state.filterStatus = "持仓中";
    for (let index = 0; index < 3; index += 1) {
      const emptyThumb = document.createElement("div");
      emptyThumb.className = "detail-thumb detail-thumb-empty";
      emptyThumb.innerHTML = `<div class="detail-thumb-empty-text">缩略图0${index + 1}</div>`;
      els.modalGalleryThumbs.appendChild(emptyThumb);
    }
    return;
  }
  const currentHasRecords = state.records.some((record) => record.status === state.filterStatus);
  if (!currentHasRecords) {
    state.filterStatus = state.records.some((record) => record.status === "持仓中") ? "持仓中" : "已完成";
  }
}

function updateFilterPills() {
  const counts = {
    持仓中: state.records.filter((record) => record.status === "持仓中").length,
    已完成: state.records.filter((record) => record.status === "已完成").length,
  };

  els.filterPills.forEach((button) => {
    const status = button.dataset.status;
    button.classList.toggle("active", status === state.filterStatus);
    button.textContent = `${status} ${counts[status]}`;
  });
}

function renderArchiveList() {
  els.archiveList.innerHTML = "";
  updateFilterPills();

  const filtered = state.records
    .filter((record) => record.status === state.filterStatus)
    .sort((a, b) => String(b.entryTime || b.createdAt).localeCompare(String(a.entryTime || a.createdAt)));

  if (!filtered.length) {
    els.archiveList.innerHTML = `<div class="trade-item"><div class="logic">当前状态下还没有记录。</div></div>`;
    return;
  }

  filtered.forEach((record) => {
    const fragment = els.archiveItemTemplate.content.cloneNode(true);
    const root = fragment.querySelector(".trade-item");
    root.classList.toggle("active", record.id === state.selectedId);
    root.querySelector(".archive-symbol").textContent = record.symbol || "未命名";

    const direction = root.querySelector(".archive-direction");
    direction.textContent = record.tradeDirection || "--";
    direction.classList.add(record.tradeDirection === "空" ? "short" : "long");

    root.querySelector(".archive-logic").textContent = record.entryLogic || record.entryLogicNote || "等待补充逻辑";

    const statusBadge = root.querySelector(".archive-status");
    statusBadge.textContent = record.status;
    statusBadge.classList.add(record.status === "已完成" ? "done" : "live");

    root.querySelector(".archive-time").textContent = toDisplayTime(record.entryTime);

    const pnl = root.querySelector(".archive-pnl");
    const pnlValue = safeNumber(record.pnlAmount);
    pnl.textContent = record.status === "已完成" ? (record.pnlAmount ? `${pnlValue > 0 ? "+" : ""}${record.pnlAmount}` : "--") : "等待平仓";
    if (record.status === "已完成") {
      pnl.classList.add(pnlValue >= 0 ? "positive" : "negative");
    }

    const deleteBtn = root.querySelector(".archive-delete-btn");
    deleteBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      await deleteRecord(record.id);
    });

    root.addEventListener("click", () => selectRecord(record.id));
    root.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectRecord(record.id);
      }
    });
    els.archiveList.appendChild(fragment);
  });
}

function setStatusBadge(el, status) {
  if (!el) return;
  el.textContent = status || "--";
  el.classList.remove("live", "done");
  el.classList.add(status === "已完成" ? "done" : "live");
}

function renderHero(record) {
  const holdings = state.records
    .filter((item) => item.status === "持仓中")
    .sort((a, b) => String(b.entryTime || b.createdAt).localeCompare(String(a.entryTime || a.createdAt)));

  if (!holdings.length) {
    els.heroStats.innerHTML = `<div class="holding-empty">当前还没有持仓中的交易。</div>`;
    return;
  }

  els.heroStats.innerHTML = holdings
    .map(
      (holding) => `
        <div class="holding-card ${holding.tradeDirection === "空" ? "short" : "long"}" data-holding-id="${holding.id}">
          <div class="holding-card-title">${escapeHtml(holding.symbol || "未命名")}</div>
          <div class="holding-card-line">
            <div class="stat-label">风险金额</div>
            <div class="stat-value">${escapeHtml(holding.riskAmount || "--")}</div>
          </div>
          <div class="holding-card-line">
            <div class="stat-label">开仓点位</div>
            <div class="stat-value">${escapeHtml(holding.entryPrice || "--")}</div>
          </div>
          <div class="holding-card-line">
            <div class="stat-label">开仓时间</div>
            <div class="stat-value">${escapeHtml(toDisplayTime(holding.entryTime))}</div>
          </div>
        </div>
      `,
    )
    .join("");

  els.heroStats.querySelectorAll("[data-holding-id]").forEach((card) => {
    card.addEventListener("click", () => selectRecord(card.dataset.holdingId, false));
    card.addEventListener("mouseenter", () => layoutHoldingCards(card.dataset.holdingId));
    card.addEventListener("mouseleave", () => layoutHoldingCards());
  });

  requestAnimationFrame(() => layoutHoldingCards());
}

function layoutHoldingCards(activeId = null) {
  const cards = Array.from(els.heroStats.querySelectorAll(".holding-card"));
  if (!cards.length) return;

  const containerWidth = els.heroStats.clientWidth || 0;
  const cardWidth = cards[0].offsetWidth || 188;
  const count = cards.length;
  const compactGap = 14;
  const compactLayoutThreshold = 5;

  if (!containerWidth || count < compactLayoutThreshold) {
    cards.forEach((card, index) => {
      card.style.left = `${Math.max(0, index * (cardWidth + compactGap))}px`;
      card.style.zIndex = String(index + 1);
    });

    if (activeId) {
      const activeCard = cards.find((card) => card.dataset.holdingId === activeId);
      if (activeCard) {
        activeCard.style.zIndex = "99";
      }
    }

    const totalWidth = cardWidth * count + compactGap * (count - 1);
    els.heroStats.style.height = `${Math.max(184, cards[0].offsetHeight || 184)}px`;
    els.heroStats.style.maxWidth = `${Math.max(containerWidth, totalWidth)}px`;
    return;
  }

  const step = (containerWidth - cardWidth) / (count - 1);

  cards.forEach((card, index) => {
    const left = Math.max(0, Math.round(step * index));
    card.style.left = `${left}px`;
    card.style.zIndex = String(index + 1);
  });

  if (activeId) {
    const activeCard = cards.find((card) => card.dataset.holdingId === activeId);
    if (activeCard) {
      activeCard.style.zIndex = "99";
    }
  }

  const maxRight = Math.max(...cards.map((card) => {
    const left = Number.parseFloat(card.style.left || "0");
    return left + cardWidth;
  }));
  els.heroStats.style.height = `${Math.max(184, cards[0].offsetHeight || 184)}px`;
  els.heroStats.style.maxWidth = `${Math.max(containerWidth, maxRight)}px`;
}

function shouldRefreshHeroFromForm() {
  if (!state.selectedId) return false;
  const selected = findRecordById(state.selectedId);
  return Boolean(selected && selected.status === "持仓中");
}

function syncSelectedHoldingDraft() {
  if (!shouldRefreshHeroFromForm()) return;
  const draft = currentRecordFromForm();
  const index = state.records.findIndex((record) => record.id === draft.id);
  if (index >= 0) {
    state.records[index] = { ...state.records[index], ...draft };
  }
}

function renderSummary(record) {
  const workingRecord = record || currentRecordFromForm();
  setStatusBadge(els.summaryStatusBadge, workingRecord.status || "持仓中");
  setSummaryMini(els.summarySeason, els.summarySeasonNote, workingRecord.marketSeason, workingRecord.marketSeasonNote);
  setSummaryMini(els.summaryMarketState, els.summaryMarketStateNote, workingRecord.marketState, workingRecord.marketStateNote);
  setSummaryMini(els.summaryMarketHeat, els.summaryMarketHeatNote, workingRecord.marketHeat, workingRecord.marketHeatNote);
  setSummaryMini(els.summaryTargetType, els.summaryTargetTypeNote, workingRecord.targetType, workingRecord.targetTypeNote);
  setSummaryMini(els.summaryEntryLogic, els.summaryEntryLogicNote, workingRecord.entryLogic, workingRecord.entryLogicNote);

  const summaryText = workingRecord.executionSummary || makeSummary(workingRecord);
  els.viewSummary.textContent = summaryText;
}

function renderLocalShots() {
  els.localShotList.innerHTML = "";
  if (!state.images.length) {
    els.localShotList.innerHTML = `<div class="shot">还没有截图</div>`;
    return;
  }

  state.images.forEach((image, index) => {
    const card = document.createElement("div");
    card.className = "shot";
    card.style.height = "auto";
    card.style.padding = "10px";
    card.style.alignItems = "stretch";
    card.style.justifyContent = "flex-start";
    card.innerHTML = `
      <img src="${image.data}" alt="${escapeHtml(image.name || `截图 ${index + 1}`)}" style="width:100%;height:118px;object-fit:cover;border-radius:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;margin-top:10px;">
        <span style="min-width:0;flex:1;padding:4px 0;font-size:11px;line-height:1.4;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(image.name || `截图 ${index + 1}`)}</span>
        <button type="button" class="btn" data-remove-image="${index}" style="padding:4px 10px;font-size:11px;flex-shrink:0;">删除</button>
      </div>
    `;
    els.localShotList.appendChild(card);
  });

  els.localShotList.querySelectorAll("[data-remove-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeImage);
      state.images.splice(index, 1);
      renderLocalShots();
      renderLivePreview();
    });
  });
}

function fillForm(record) {
  state.selectedId = record.id;
  state.images = [...record.images];

  $(fields.symbol).value = record.symbol;
  $(fields.tradeDirection).value = record.tradeDirection || "多";
  $(fields.entryTime).value = normalizeDateTimeInput(record.entryTime);
  $(fields.entryPrice).value = record.entryPrice;
  $(fields.exitTime).value = normalizeDateTimeInput(record.exitTime);
  $(fields.exitPrice).value = record.exitPrice;
  $(fields.riskAmount).value = record.riskAmount;
  $(fields.pnlAmount).value = record.pnlAmount;
  $(fields.rMultiple).value = record.rMultiple;
  $(fields.score).value = record.score || "8";
  setScoreDisplay($(fields.score).value);

  $(fields.marketSeason).value = record.marketSeason;
  $(fields.marketSeasonNote).value = record.marketSeasonNote;
  $(fields.marketState).value = record.marketState;
  $(fields.marketStateNote).value = record.marketStateNote;
  $(fields.marketHeat).value = record.marketHeat;
  $(fields.marketHeatNote).value = record.marketHeatNote;
  $(fields.targetType).value = record.targetType;
  $(fields.targetTypeNote).value = record.targetTypeNote;
  $(fields.entryLogic).value = record.entryLogic;
  $(fields.entryLogicNote).value = record.entryLogicNote;
  $(fields.entryEmotionsNote).value = record.entryEmotionsNote;
  $(fields.exitEmotionsNote).value = record.exitEmotionsNote;
  if ($(fields.tagsNote)) $(fields.tagsNote).value = record.tagsNote || "";
  $(fields.executionSummary).value = record.executionSummary;
  $(fields.reviewNotes).value = record.reviewNotes;

  syncSingleChoiceGroup("single-market-season", record.marketSeason);
  syncSingleChoiceGroup("single-market-state", record.marketState);
  syncSingleChoiceGroup("single-market-heat", record.marketHeat);
  syncSingleChoiceGroup("single-target-type", record.targetType);
  syncSingleChoiceGroup("single-entry-logic", record.entryLogic);
  setSelectedMultiChoice("entry-emotions", record.entryEmotions);
  setSelectedMultiChoice("exit-emotions", record.exitEmotions);
  setSelectedMultiChoice("trade-tags", record.tags);

  renderLocalShots();
  renderHero(record);
  renderSummary(record);
  renderArchiveList();
  autoResizeAllTextareas();
}

function resetForm() {
  els.form.reset();
  $(fields.entryTime).value = formatDateTimeInput();
  $(fields.tradeDirection).value = "多";
  $(fields.score).value = "8";
  $(fields.rMultiple).value = "";
  setScoreDisplay("8");
  state.images = [];

  [
    "single-market-season",
    "single-market-state",
    "single-market-heat",
    "single-target-type",
    "single-entry-logic",
  ].forEach((id) => syncSingleChoiceGroup(id, ""));

  ["entry-emotions", "exit-emotions", "trade-tags"].forEach((id) => setSelectedMultiChoice(id, []));
  if ($(fields.tagsNote)) $(fields.tagsNote).value = "";
  renderLocalShots();
  renderHero(null);
  renderSummary(currentRecordFromForm());
  autoResizeAllTextareas();
}

function createNewTrade(selectAfter = true) {
  state.selectedId = null;
  resetForm();
  if (selectAfter) renderArchiveList();
}

function selectRecord(id, openDetail = true) {
  const record = findRecordById(id);
  if (!record) return;
  fillForm(record);
  if (openDetail) openModal(record);
}

function getRecordTitle(record) {
  return `${record.symbol || "未命名"} ${record.tradeDirection || ""}单`;
}

function renderModalGallery(record) {
  state.modalImageIndex = 0;
  els.modalGalleryMain.innerHTML = "";
  els.modalGalleryThumbs.innerHTML = "";

  if (!record.images.length) {
    els.modalGalleryMain.innerHTML = `<div class="detail-main-empty">这笔档案还没有上传 K 线截图</div>`;
    for (let index = 0; index < 3; index += 1) {
      const emptyThumb = document.createElement("div");
      emptyThumb.className = "detail-thumb detail-thumb-empty";
      emptyThumb.innerHTML = `<div class="detail-thumb-empty-text">缩略图0${index + 1}</div>`;
      els.modalGalleryThumbs.appendChild(emptyThumb);
    }
    return;
  }

  const mainImage = document.createElement("img");
  mainImage.src = record.images[0].data;
  mainImage.alt = record.images[0].name || "主图";
  mainImage.addEventListener("dblclick", () => openFullscreen(mainImage.src, mainImage.alt));
  els.modalGalleryMain.appendChild(mainImage);

  for (let index = 0; index < 3; index += 1) {
    const image = record.images[index];
    if (!image) {
      const emptyThumb = document.createElement("div");
      emptyThumb.className = "detail-thumb detail-thumb-empty";
      emptyThumb.innerHTML = `<div class="detail-thumb-empty-text">缩略图0${index + 1}</div>`;
      els.modalGalleryThumbs.appendChild(emptyThumb);
      continue;
    }

    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "detail-thumb";
    thumb.innerHTML = `<img src="${image.data}" alt="${escapeHtml(image.name || `缩略图 ${index + 1}`)}">`;
    thumb.classList.toggle("active", index === 0);
    thumb.addEventListener("click", () => {
      state.modalImageIndex = index;
      mainImage.src = image.data;
      mainImage.alt = image.name || `主图 ${index + 1}`;
      els.modalGalleryThumbs.querySelectorAll(".detail-thumb").forEach((item, itemIndex) => {
        item.classList.toggle("active", itemIndex === index);
      });
    });
    els.modalGalleryThumbs.appendChild(thumb);
  }
}

function openModal(record) {
  const title = getRecordTitle(record);
  els.modalTitle.textContent = title;
  els.modalSubtitle.textContent = "";
  if (els.modalSummaryTitle) {
    els.modalSummaryTitle.textContent = `${title} - 执行摘要`;
  }
  if (els.modalNotesTitle) {
    els.modalNotesTitle.textContent = `${title} - 复盘笔记`;
  }
  els.modalSummary.textContent = record.executionSummary || makeSummary(record);
  els.modalNotes.textContent = record.reviewNotes || "这笔档案还没有填写复盘笔记。";
  renderModalGallery(record);
  els.detailModal.classList.add("open");
}

function closeModal() {
  els.detailModal.classList.remove("open");
}

function resetFullscreenView() {
  state.fullscreen.zoomed = false;
  state.fullscreen.scale = 1;
  state.fullscreen.offsetX = 0;
  state.fullscreen.offsetY = 0;
  state.fullscreen.dragging = false;
  state.fullscreen.startX = 0;
  state.fullscreen.startY = 0;
  state.fullscreen.width = 0;
  state.fullscreen.height = 0;
  els.fullscreenImage.style.width = "";
  els.fullscreenImage.style.height = "";
  els.fullscreenImage.style.maxWidth = "100%";
  els.fullscreenImage.style.maxHeight = "100%";
  els.fullscreenImage.style.cursor = "zoom-in";
  els.fullscreenImage.style.transform = "translate(0px, 0px) scale(1)";
  els.fullscreenImage.style.transformOrigin = "center center";
}

function clampFullscreenOffsets() {
  const scaledWidth = state.fullscreen.width * state.fullscreen.scale;
  const scaledHeight = state.fullscreen.height * state.fullscreen.scale;
  const extraX = Math.max(0, (scaledWidth - window.innerWidth) / 2);
  const extraY = Math.max(0, (scaledHeight - window.innerHeight) / 2);
  state.fullscreen.offsetX = Math.min(extraX, Math.max(-extraX, state.fullscreen.offsetX));
  state.fullscreen.offsetY = Math.min(extraY, Math.max(-extraY, state.fullscreen.offsetY));
}

function syncFullscreenTransform() {
  els.fullscreenImage.style.transform = `translate(${state.fullscreen.offsetX}px, ${state.fullscreen.offsetY}px) scale(${state.fullscreen.scale})`;
}

function refreshFullscreenCursor() {
  if (!state.fullscreen.zoomed) {
    els.fullscreenImage.style.cursor = "zoom-in";
    return;
  }

  const scaledWidth = state.fullscreen.width * state.fullscreen.scale;
  const scaledHeight = state.fullscreen.height * state.fullscreen.scale;
  els.fullscreenImage.style.cursor = scaledWidth > window.innerWidth || scaledHeight > window.innerHeight ? "grab" : "zoom-out";
}

function toggleFullscreenActualSize() {
  if (!els.fullscreenModal.classList.contains("open") || !els.fullscreenImage.src) return;

  if (!state.fullscreen.zoomed) {
    const naturalWidth = els.fullscreenImage.naturalWidth || 0;
    const naturalHeight = els.fullscreenImage.naturalHeight || 0;
    state.fullscreen.zoomed = true;
    state.fullscreen.scale = 1;
    state.fullscreen.offsetX = 0;
    state.fullscreen.offsetY = 0;
    state.fullscreen.width = naturalWidth;
    state.fullscreen.height = naturalHeight;
    els.fullscreenImage.style.width = `${naturalWidth}px`;
    els.fullscreenImage.style.height = `${naturalHeight}px`;
    els.fullscreenImage.style.maxWidth = "none";
    els.fullscreenImage.style.maxHeight = "none";
    clampFullscreenOffsets();
    syncFullscreenTransform();
    refreshFullscreenCursor();
    return;
  }

  resetFullscreenView();
}

function openFullscreen(src, alt = "主图") {
  if (!src) return;
  els.fullscreenImage.src = src;
  els.fullscreenImage.alt = alt;
  resetFullscreenView();
  els.fullscreenModal.classList.add("open");
}

function closeFullscreen() {
  resetFullscreenView();
  els.fullscreenModal.classList.remove("open");
}

function renderLivePreview() {
  const record = currentRecordFromForm();
  syncSelectedHoldingDraft();
  renderSummary(record);
}

async function saveRecord(status) {
  const wasNewRecord = !state.selectedId;
  const record = currentRecordFromForm();
  record.status = status;

  if (!record.executionSummary) {
    record.executionSummary = makeSummary(record);
    $(fields.executionSummary).value = record.executionSummary;
  }

  if (!validateRecord(record, status)) return;

  const payload = await apiPost("/api/trades", { record });
  const saved = normalizeRecord(payload.record);
  const index = state.records.findIndex((item) => item.id === saved.id);
  if (index >= 0) {
    state.records[index] = saved;
  } else {
    state.records.push(saved);
  }

  state.selectedId = saved.id;
  syncFilterStatus();
  renderArchiveList();
  renderHero();

  if (status === "持仓中" && wasNewRecord) {
    createNewTrade(false);
    alert("已保存到持仓中，并自动为下一笔持仓准备了空白表单。");
    return;
  }

  fillForm(saved);
  alert(status === "已完成" ? "这笔交易已经更新为已完成。" : "已保存到持仓中。");
}

async function deleteRecord(id) {
  const record = findRecordById(id);
  if (!record) return;
  const ok = window.confirm(`确定删除档案：${record.symbol || "未命名交易"} 吗？`);
  if (!ok) return;

  await apiPost("/api/delete", { id });
  state.records = state.records.filter((item) => item.id !== id);

  if (state.selectedId === id) {
    state.selectedId = null;
  }

  syncFilterStatus();
  renderArchiveList();

  if (state.records.length) {
    const nextRecord = state.records.find((item) => item.status === state.filterStatus) || state.records[0];
    fillForm(nextRecord);
  } else {
    createNewTrade(false);
  }
}

function exportJson() {
  window.open("/api/export", "_blank");
}

async function importJson(file) {
  if (!file) return;
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    alert("这个 JSON 文件格式不正确。");
    return;
  }

  const payload = Array.isArray(parsed) ? parsed : parsed.records || parsed.data || parsed;
  const response = await apiPost("/api/import", { records: payload });
  state.records = Array.isArray(response.records) ? response.records.map(normalizeRecord) : [];
  syncFilterStatus();
  renderArchiveList();

  if (state.records.length) {
    const nextRecord = state.records.find((record) => record.status === state.filterStatus) || state.records[0];
    fillForm(nextRecord);
  } else {
    createNewTrade(false);
  }

  alert(`导入成功，共导入 ${response.count || state.records.length} 条记录。`);
}

async function handleImageUpload(fileList) {
  const files = Array.from(fileList).slice(0, Math.max(0, 3 - state.images.length));
  if (!files.length) return;

  for (const file of files) {
    const dataUrl = await readAsDataUrl(file);
    state.images.push(
      normalizeImage({
        name: file.name,
        mimeType: file.type || "image/*",
        data: dataUrl,
        size: file.size,
      }),
    );
  }

  renderLocalShots();
  renderLivePreview();
}

function wireFormEvents() {
  els.filterPills.forEach((button) => {
    button.addEventListener("click", () => {
      state.filterStatus = button.dataset.status;
      renderArchiveList();
    });
  });

  els.newTradeBtn.addEventListener("click", () => createNewTrade());
  els.newTradeBtn.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      createNewTrade();
    }
  });
  els.exportBtnClone.addEventListener("click", exportJson);

  const importHandler = async (event) => {
    const [file] = event.target.files || [];
    await importJson(file);
    event.target.value = "";
  };
  els.importInputClone.addEventListener("change", importHandler);

  els.saveHoldingBtnClone.addEventListener("click", () => saveRecord("持仓中"));
  els.saveCompletedBtnClone.addEventListener("click", () => saveRecord("已完成"));

  els.generateSummaryBtn.addEventListener("click", () => {
    const summary = makeSummary(currentRecordFromForm());
    $(fields.executionSummary).value = summary;
    autoResizeTextarea($(fields.executionSummary));
    renderLivePreview();
  });

  els.imageInput.addEventListener("change", async (event) => {
    await handleImageUpload(event.target.files || []);
    event.target.value = "";
  });

  els.closeModalBtn.addEventListener("click", closeModal);
  els.detailBackdrop.addEventListener("click", closeModal);
  els.detailModal.addEventListener("click", (event) => {
    if (
      event.target === els.detailModal ||
      event.target === els.detailBackdrop ||
      event.target.classList?.contains("detail-dialog") ||
      event.target.classList?.contains("detail-body")
    ) {
      closeModal();
    }
  });
  els.fullscreenCloseBtn.addEventListener("click", closeFullscreen);
  els.fullscreenModal.addEventListener("click", (event) => {
    if (event.target === els.fullscreenModal) closeFullscreen();
  });
  els.fullscreenInner?.addEventListener("click", (event) => {
    if (event.target === els.fullscreenInner) closeFullscreen();
  });
  els.fullscreenImage.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    toggleFullscreenActualSize();
  });
  els.fullscreenImage.addEventListener("wheel", (event) => {
    if (!els.fullscreenModal.classList.contains("open")) return;
    event.preventDefault();
    if (!state.fullscreen.zoomed) {
      toggleFullscreenActualSize();
    }
    const delta = event.deltaY < 0 ? 0.12 : -0.12;
    state.fullscreen.scale = Math.min(4, Math.max(0.35, state.fullscreen.scale + delta));
    clampFullscreenOffsets();
    syncFullscreenTransform();
    refreshFullscreenCursor();
  }, { passive: false });
  els.fullscreenImage.addEventListener("mousedown", (event) => {
    if (!state.fullscreen.zoomed) return;
    const overflowX = state.fullscreen.width * state.fullscreen.scale > window.innerWidth;
    const overflowY = state.fullscreen.height * state.fullscreen.scale > window.innerHeight;
    if (!overflowX && !overflowY) return;
    event.preventDefault();
    state.fullscreen.dragging = true;
    state.fullscreen.startX = event.clientX - state.fullscreen.offsetX;
    state.fullscreen.startY = event.clientY - state.fullscreen.offsetY;
    els.fullscreenImage.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", (event) => {
    if (!state.fullscreen.dragging) return;
    state.fullscreen.offsetX = event.clientX - state.fullscreen.startX;
    state.fullscreen.offsetY = event.clientY - state.fullscreen.startY;
    clampFullscreenOffsets();
    syncFullscreenTransform();
  });
  window.addEventListener("mouseup", () => {
    if (!state.fullscreen.dragging) return;
    state.fullscreen.dragging = false;
    refreshFullscreenCursor();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (els.fullscreenModal.classList.contains("open")) {
        closeFullscreen();
        return;
      }
      if (els.detailModal.classList.contains("open")) {
        closeModal();
      }
    }
  });
  window.addEventListener("resize", () => {
    if (!els.fullscreenModal.classList.contains("open") || !state.fullscreen.zoomed) return;
    clampFullscreenOffsets();
    syncFullscreenTransform();
  });

  els.form.addEventListener("input", () => {
    $(fields.rMultiple).value = calcR($(fields.pnlAmount).value.trim(), $(fields.riskAmount).value.trim());
    setScoreDisplay($(fields.score).value || "8");
    if (document.activeElement?.matches("textarea.textarea")) {
      autoResizeTextarea(document.activeElement);
    }
    renderLivePreview();
  });

  els.form.addEventListener("change", () => {
    setScoreDisplay($(fields.score).value || "8");
    renderLivePreview();
  });
}

function initOptions() {
  populateHiddenSelect(fields.marketSeason, options.seasons);
  populateHiddenSelect(fields.marketState, options.marketStates);
  populateHiddenSelect(fields.marketHeat, options.marketHeat);
  populateHiddenSelect(fields.targetType, options.targetTypes);
  populateHiddenSelect(fields.entryLogic, options.entryLogics);

  buildSingleChoiceGroup("single-market-season", fields.marketSeason, options.seasons);
  buildSingleChoiceGroup("single-market-state", fields.marketState, options.marketStates);
  buildSingleChoiceGroup("single-market-heat", fields.marketHeat, options.marketHeat);
  buildSingleChoiceGroup("single-target-type", fields.targetType, options.targetTypes);
  buildSingleChoiceGroup("single-entry-logic", fields.entryLogic, options.entryLogics);

  buildMultiChoiceGroup("entry-emotions", options.entryEmotions);
  buildMultiChoiceGroup("exit-emotions", options.exitEmotions);
  buildMultiChoiceGroup("trade-tags", options.tags);
}


function renderLocalShotsLegacyDuplicate() {
  els.localShotList.innerHTML = "";
  if (!state.images.length) {
    els.localShotList.innerHTML = `<div class="shot">杩樻病鏈夋埅鍥?/div>`;
    return;
  }

  state.images.forEach((image, index) => {
    const card = document.createElement("div");
    card.className = "shot";
    card.style.height = "auto";
    card.style.padding = "10px";
    card.style.alignItems = "stretch";
    card.style.justifyContent = "flex-start";
    card.innerHTML = `
      <img src="${image.data}" alt="${escapeHtml(image.name || `鎴浘 ${index + 1}`)}" style="width:100%;height:118px;object-fit:cover;border-radius:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;margin-top:10px;">
        <span style="min-width:0;flex:1;padding:4px 0;font-size:11px;line-height:1.4;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(image.name || `鎴浘 ${index + 1}`)}</span>
        <button type="button" class="btn" data-remove-image="${index}" style="padding:4px 10px;font-size:11px;flex-shrink:0;">删除</button>
      </div>
    `;
    els.localShotList.appendChild(card);
  });

  els.localShotList.querySelectorAll("[data-remove-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeImage);
      state.images.splice(index, 1);
      renderLocalShots();
      renderLivePreview();
    });
  });
}

function resetFullscreenViewLegacyDuplicate() {
  state.fullscreen.zoomed = false;
  state.fullscreen.scale = 1;
  state.fullscreen.offsetX = 0;
  state.fullscreen.offsetY = 0;
  state.fullscreen.dragging = false;
  state.fullscreen.startX = 0;
  state.fullscreen.startY = 0;
  state.fullscreen.width = 0;
  state.fullscreen.height = 0;
  els.fullscreenImage.style.width = "";
  els.fullscreenImage.style.height = "";
  els.fullscreenImage.style.maxWidth = "100%";
  els.fullscreenImage.style.maxHeight = "100%";
  els.fullscreenImage.style.cursor = "zoom-in";
  els.fullscreenImage.style.transform = "translate(0px, 0px) scale(1)";
  els.fullscreenImage.style.transformOrigin = "center center";
}

function clampFullscreenOffsetsLegacyDuplicate() {
  const scaledWidth = state.fullscreen.width * state.fullscreen.scale;
  const scaledHeight = state.fullscreen.height * state.fullscreen.scale;
  const extraX = Math.max(0, (scaledWidth - window.innerWidth) / 2);
  const extraY = Math.max(0, (scaledHeight - window.innerHeight) / 2);
  state.fullscreen.offsetX = Math.min(extraX, Math.max(-extraX, state.fullscreen.offsetX));
  state.fullscreen.offsetY = Math.min(extraY, Math.max(-extraY, state.fullscreen.offsetY));
}

function syncFullscreenTransformLegacyDuplicate() {
  els.fullscreenImage.style.transform = `translate(${state.fullscreen.offsetX}px, ${state.fullscreen.offsetY}px) scale(${state.fullscreen.scale})`;
}

function refreshFullscreenCursorLegacyDuplicate() {
  if (!state.fullscreen.zoomed) {
    els.fullscreenImage.style.cursor = "zoom-in";
    return;
  }
  const scaledWidth = state.fullscreen.width * state.fullscreen.scale;
  const scaledHeight = state.fullscreen.height * state.fullscreen.scale;
  els.fullscreenImage.style.cursor = scaledWidth > window.innerWidth || scaledHeight > window.innerHeight ? "grab" : "zoom-out";
}

function toggleFullscreenActualSizeLegacyDuplicate() {
  if (!els.fullscreenModal.classList.contains("open") || !els.fullscreenImage.src) return;

  if (!state.fullscreen.zoomed) {
    const naturalWidth = els.fullscreenImage.naturalWidth || 0;
    const naturalHeight = els.fullscreenImage.naturalHeight || 0;
    state.fullscreen.zoomed = true;
    state.fullscreen.scale = 1;
    state.fullscreen.offsetX = 0;
    state.fullscreen.offsetY = 0;
    state.fullscreen.width = naturalWidth;
    state.fullscreen.height = naturalHeight;
    els.fullscreenImage.style.width = `${naturalWidth}px`;
    els.fullscreenImage.style.height = `${naturalHeight}px`;
    els.fullscreenImage.style.maxWidth = "none";
    els.fullscreenImage.style.maxHeight = "none";
    clampFullscreenOffsets();
    syncFullscreenTransform();
    refreshFullscreenCursor();
    return;
  }

  resetFullscreenView();
}

function openFullscreenLegacyDuplicate(src, alt = "主图") {
  if (!src) return;
  els.fullscreenImage.src = src;
  els.fullscreenImage.alt = alt;
  resetFullscreenView();
  els.fullscreenModal.classList.add("open");
}

function closeFullscreenLegacyDuplicate() {
  resetFullscreenView();
  els.fullscreenModal.classList.remove("open");
}

function openModalLegacyDuplicate(record) {
  const title = getRecordTitle(record);
  els.modalTitle.textContent = "";
  els.modalSubtitle.textContent = "";
  if (els.modalSummaryTitle) {
    els.modalSummaryTitle.textContent = `${title}-执行摘要`;
  }
  if (els.modalNotesTitle) {
    els.modalNotesTitle.textContent = `${title}--复盘笔记`;
  }
  els.modalSummary.textContent = record.executionSummary || makeSummary(record);
  els.modalNotes.textContent = record.reviewNotes || "这笔档案还没有填写复盘笔记。";
  renderModalGallery(record);
  els.detailModal.classList.add("open");
}

async function init() {
  initOptions();
  wireFormEvents();
  createNewTrade(false);
  await loadRecords();
  autoResizeAllTextareas();
}

init().catch((error) => {
  console.error(error);
  alert(`启动失败：${error.message}`);
});
