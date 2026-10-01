const state = {
  cards: [],
  payload: null,
  activeTab: "knowledge",
};

const pageTitles = {
  knowledge: ["KNOWLEDGE BASE", "知识库"],
  extract: ["TEXT EXTRACTION", "文字提取"],
  rules: ["RULES", "提取规则"],
};

const elements = {
  tabs: [...document.querySelectorAll("[data-tab]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  workspaceEyebrow: document.querySelector("#workspaceEyebrow"),
  workspaceTitle: document.querySelector("#workspaceTitle"),
  generatedAt: document.querySelector("#generatedAt"),
  cardCount: document.querySelector("#cardCount"),
  totalOccurrences: document.querySelector("#totalOccurrences"),
  sourceCount: document.querySelector("#sourceCount"),
  masteredCount: document.querySelector("#masteredCount"),
  cardList: document.querySelector("#cardList"),
  searchInput: document.querySelector("#searchInput"),
  kindFilter: document.querySelector("#kindFilter"),
  extractForm: document.querySelector("#extractForm"),
  sourceTitle: document.querySelector("#sourceTitle"),
  sourceText: document.querySelector("#sourceText"),
  fillDemo: document.querySelector("#fillDemo"),
  candidateList: document.querySelector("#candidateList"),
  confirmCandidates: document.querySelector("#confirmCandidates"),
  ruleEditor: document.querySelector("#ruleEditor"),
};

const demoText = `A: Let's take it one step at a time.
B: Sounds good. I'll keep you posted.
A: What is our priority?
B: The launch is our priority. I'll keep you posted.`;

const simulatedRules = [
  {
    match: /one step at a time/gi,
    phrase: "One step at a time",
    meaning: "一步一步来",
    kind: "phrase",
  },
  {
    match: /keep you posted/gi,
    phrase: "Keep you posted",
    meaning: "随时向你同步进展",
    kind: "phrase",
  },
  {
    match: /priority/gi,
    phrase: "Priority",
    meaning: "优先事项",
    kind: "word",
  },
  {
    match: /sounds good/gi,
    phrase: "Sounds good",
    meaning: "听起来不错",
    kind: "phrase",
  },
];

function formatDate(value) {
  if (!value) {
    return "暂无数据";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setTab(tab) {
  state.activeTab = tab;
  elements.tabs.forEach((item) => item.classList.toggle("active", item.dataset.tab === tab));
  elements.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
  const [eyebrow, title] = pageTitles[tab] || pageTitles.knowledge;
  elements.workspaceEyebrow.textContent = eyebrow;
  elements.workspaceTitle.textContent = title;
}

function updateSummary(payload) {
  const summary = payload.summary || {};
  elements.generatedAt.textContent = `更新于 ${formatDate(payload.generated_at)}`;
  elements.cardCount.textContent = summary.card_count ?? 0;
  elements.totalOccurrences.textContent = summary.total_occurrences ?? 0;
  elements.sourceCount.textContent = summary.source_count ?? 0;
  elements.masteredCount.textContent = summary.mastered_count ?? 0;
}

function latestOccurrence(card) {
  const occurrences = card.occurrences || [];
  return occurrences[occurrences.length - 1] || {};
}

function renderCards(cards) {
  if (!cards.length) {
    elements.cardList.innerHTML = `
      <div class="empty">
        还没有匹配的卡片。请把原文放入 <code>content/inbox</code>，本地运行处理脚本后同步到 GitHub。
      </div>
    `;
    return;
  }

  elements.cardList.innerHTML = cards
    .map((card) => {
      const occurrence = latestOccurrence(card);
      return `
        <article class="expression-card">
          <div class="card-meta">
            <span>${card.kind === "word" ? "WORD" : "PHRASE"}</span>
            <span>${card.total_count} 次</span>
          </div>
          <div>
            <h3>${escapeHtml(card.phrase)}</h3>
            <p class="meaning">${escapeHtml(card.meaning || "待补充含义")}</p>
          </div>
          <p class="example">${escapeHtml(occurrence.example || "暂无例句")}</p>
          <div class="card-footer">
            <span>${escapeHtml(occurrence.source_title || "未知来源")}</span>
            <span>${escapeHtml(card.proficiency || "new")}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function applyFilters() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const kind = elements.kindFilter.value;

  const filtered = state.cards.filter((card) => {
    const occurrence = latestOccurrence(card);
    const text = [card.phrase, card.meaning, occurrence.source_title, occurrence.example]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (!query || text.includes(query)) && (kind === "all" || card.kind === kind);
  });

  renderCards(filtered);
}

function sentenceFor(text, phrase) {
  const sentences = text.split(/(?<=[.!?。！？])\s+/);
  const found = sentences.find((sentence) => sentence.toLowerCase().includes(phrase.toLowerCase()));
  return found || text.split("\n").find(Boolean) || "";
}

function simulateExtract(text) {
  return simulatedRules
    .map((rule) => {
      const matches = text.match(rule.match) || [];
      if (!matches.length) {
        return null;
      }
      return {
        ...rule,
        count: matches.length,
        example: sentenceFor(text, rule.phrase),
      };
    })
    .filter(Boolean);
}

function renderCandidates(candidates) {
  if (!candidates.length) {
    elements.candidateList.innerHTML = `<div class="empty">没有生成候选。真实提取会在后续接入本地模型和 Skill。</div>`;
    elements.confirmCandidates.disabled = true;
    return;
  }

  elements.candidateList.innerHTML = candidates
    .map(
      (candidate) => `
        <article class="candidate-card">
          <span>${candidate.kind === "word" ? "单词" : "短句"} · ${candidate.count} 次</span>
          <strong>${escapeHtml(candidate.phrase)}</strong>
          <p>${escapeHtml(candidate.meaning)}</p>
          <p class="example">${escapeHtml(candidate.example)}</p>
        </article>
      `,
    )
    .join("");
  elements.confirmCandidates.disabled = false;
}

async function loadKnowledge() {
  try {
    const response = await fetch("./public/knowledge.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load knowledge: ${response.status}`);
    }
    const payload = await response.json();
    state.payload = payload;
    state.cards = payload.cards || [];
    updateSummary(payload);
    elements.ruleEditor.value = payload.skill?.content || "暂无 Skill 内容";
    renderCards(state.cards);
  } catch (error) {
    elements.generatedAt.textContent = "未找到导出数据";
    elements.ruleEditor.value = "请先本地运行 python3 scripts/process.py 生成 public/knowledge.json。";
    elements.cardList.innerHTML = `
      <div class="empty">
        未能读取 <code>public/knowledge.json</code>。请先运行本地处理脚本，然后 push 到 GitHub。
      </div>
    `;
  }
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

elements.searchInput.addEventListener("input", applyFilters);
elements.kindFilter.addEventListener("change", applyFilters);

elements.fillDemo.addEventListener("click", () => {
  elements.sourceTitle.value = "Demo work conversation";
  elements.sourceText.value = demoText;
});

elements.extractForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.sourceText.value.trim();
  if (!text) {
    renderCandidates([]);
    return;
  }
  renderCandidates(simulateExtract(text));
});

elements.confirmCandidates.addEventListener("click", () => {
  elements.confirmCandidates.textContent = "一期需由本地脚本入库";
  window.setTimeout(() => {
    elements.confirmCandidates.textContent = "确认并同步到知识库";
  }, 1800);
});

setTab("knowledge");
loadKnowledge();
