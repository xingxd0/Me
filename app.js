const state = {
  cards: [],
  payload: null,
  activeTab: "knowledge",
  flippedCards: new Set(),
  practiceStats: {},
};

const PRACTICE_STORAGE_KEY = "phrasebook-practice-stats";

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
  navCardCount: document.querySelector("#navCardCount"),
  cardCount: document.querySelector("#cardCount"),
  totalOccurrences: document.querySelector("#totalOccurrences"),
  sourceCount: document.querySelector("#sourceCount"),
  masteredCount: document.querySelector("#masteredCount"),
  cardList: document.querySelector("#cardList"),
  searchInput: document.querySelector("#searchInput"),
  kindFilter: document.querySelector("#kindFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  proficiencyFilter: document.querySelector("#proficiencyFilter"),
  sortSelect: document.querySelector("#sortSelect"),
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

function loadPracticeStats() {
  try {
    state.practiceStats = JSON.parse(window.localStorage.getItem(PRACTICE_STORAGE_KEY) || "{}");
  } catch (error) {
    state.practiceStats = {};
  }
}

function savePracticeStats() {
  window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(state.practiceStats));
}

function cardKey(card) {
  return card.normalized_phrase || card.id || card.phrase;
}

function practiceFor(card) {
  return state.practiceStats[cardKey(card)] || { correct: 0, wrong: 0 };
}

function accuracyFor(stats) {
  const total = stats.correct + stats.wrong;
  if (!total) {
    return "未测试";
  }
  return `${Math.round((stats.correct / total) * 100)}%`;
}

function accuracyValue(card) {
  const stats = practiceFor(card);
  const total = stats.correct + stats.wrong;
  return total ? stats.correct / total : -1;
}

function frequencyValue(card) {
  if (card.frequency_label === "待核对") {
    return null;
  }
  return Number.isFinite(Number(card.total_count)) ? Number(card.total_count) : null;
}

function priorityValue(card) {
  const priority = card.priority || "P9";
  const match = priority.match(/\d+/);
  return match ? Number(match[0]) : 9;
}

function proficiencyValue(card) {
  const proficiency = card.proficiency || "";
  const match = proficiency.match(/^\d/);
  return match ? match[0] : "unknown";
}

function sortCards(cards) {
  const sort = elements.sortSelect?.value || "frequency-desc";
  const sorted = [...cards];
  const compareFrequency = (a, b, direction = "desc") => {
    const left = frequencyValue(a);
    const right = frequencyValue(b);

    if (left === null && right === null) {
      return a.phrase.localeCompare(b.phrase);
    }
    if (left === null) {
      return 1;
    }
    if (right === null) {
      return -1;
    }
    return direction === "desc" ? right - left : left - right;
  };

  sorted.sort((a, b) => {
    if (sort === "frequency-desc") {
      return compareFrequency(a, b, "desc") || a.phrase.localeCompare(b.phrase);
    }
    if (sort === "frequency-asc") {
      return compareFrequency(a, b, "asc") || a.phrase.localeCompare(b.phrase);
    }
    if (sort === "accuracy-desc") {
      return accuracyValue(b) - accuracyValue(a) || compareFrequency(a, b, "desc");
    }
    if (sort === "accuracy-asc") {
      return accuracyValue(a) - accuracyValue(b) || compareFrequency(a, b, "desc");
    }
    if (sort === "priority-desc") {
      return priorityValue(b) - priorityValue(a) || compareFrequency(a, b, "desc");
    }
    return priorityValue(a) - priorityValue(b) || compareFrequency(a, b, "desc");
  });

  return sorted;
}

function setTab(tab) {
  state.activeTab = tab;
  elements.tabs.forEach((item) => item.classList.toggle("active", item.dataset.tab === tab));
  elements.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
  const [eyebrow, title] = pageTitles[tab] || pageTitles.knowledge;
  if (elements.workspaceEyebrow) {
    elements.workspaceEyebrow.textContent = eyebrow;
  }
  if (elements.workspaceTitle) {
    elements.workspaceTitle.textContent = title;
  }
}

function updateSummary(payload) {
  const summary = payload.summary || {};
  if (elements.generatedAt) {
    elements.generatedAt.textContent = `更新于 ${formatDate(payload.generated_at)}`;
  }
  if (elements.navCardCount) {
    elements.navCardCount.textContent = summary.card_count ?? 0;
  }
  if (elements.cardCount) {
    elements.cardCount.textContent = summary.card_count ?? 0;
  }
  if (elements.totalOccurrences) {
    elements.totalOccurrences.textContent = summary.total_occurrences ?? 0;
  }
  if (elements.sourceCount) {
    elements.sourceCount.textContent = summary.source_count ?? 0;
  }
  if (elements.masteredCount) {
    elements.masteredCount.textContent = summary.mastered_count ?? 0;
  }
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
      const frequency = card.frequency_label || `${card.total_count ?? 0} 次`;
      const key = cardKey(card);
      const stats = practiceFor(card);
      const isFlipped = state.flippedCards.has(key);
      return `
        <article class="expression-card ${isFlipped ? "flipped" : ""}" data-card-key="${escapeHtml(key)}">
          <div class="card-face card-front">
            <div class="card-meta">
              <span>${escapeHtml(card.priority || (card.kind === "word" ? "WORD" : "PHRASE"))}</span>
              <span>${escapeHtml(frequency)}</span>
            </div>
            <div class="front-word">
              <h3>${escapeHtml(card.phrase)}</h3>
              <p>${card.kind === "word" ? "WORD" : "PHRASE"}</p>
            </div>
            <div class="card-footer">
              <span>点击查看详情</span>
              <span>${escapeHtml(card.proficiency || "new")}</span>
            </div>
          </div>

          <div class="card-face card-back">
            <div class="card-meta">
              <span>${escapeHtml(card.priority || "未分级")}</span>
              <span>正确率 ${accuracyFor(stats)}</span>
            </div>
            <div>
              <h3>${escapeHtml(card.phrase)}</h3>
              <p class="meaning">${escapeHtml(card.meaning || "待补充含义")}</p>
            </div>
            <dl class="detail-grid">
              <div>
                <dt>频率</dt>
                <dd>${escapeHtml(frequency)}</dd>
              </div>
              <div>
                <dt>优先级</dt>
                <dd>${escapeHtml(card.priority || "未分级")}</dd>
              </div>
              <div>
                <dt>正确</dt>
                <dd>${stats.correct}</dd>
              </div>
              <div>
                <dt>错误</dt>
                <dd>${stats.wrong}</dd>
              </div>
            </dl>
            <p class="example">${escapeHtml(occurrence.example || "暂无例句")}</p>
            <div class="practice-actions">
              <button type="button" data-practice="correct" data-card-key="${escapeHtml(key)}">正确</button>
              <button type="button" data-practice="wrong" data-card-key="${escapeHtml(key)}">错误</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function applyFilters() {
  renderCards(currentFilteredCards());
}

function currentFilteredCards() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const kind = elements.kindFilter.value;
  const priority = elements.priorityFilter?.value || "all";
  const proficiency = elements.proficiencyFilter?.value || "all";

  const filtered = state.cards.filter((card) => {
    const occurrence = latestOccurrence(card);
    const text = [card.phrase, card.meaning, card.priority, card.frequency_label, occurrence.source_title, occurrence.example]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesKind = kind === "all" || card.kind === kind;
    const matchesPriority = priority === "all" || card.priority === priority;
    const matchesProficiency = proficiency === "all" || proficiencyValue(card) === proficiency;
    return matchesQuery && matchesKind && matchesPriority && matchesProficiency;
  });

  return sortCards(filtered);
}

function rerenderCurrentCards() {
  renderCards(currentFilteredCards());
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
    if (elements.generatedAt) {
      elements.generatedAt.textContent = "未找到导出数据";
    }
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
elements.priorityFilter.addEventListener("change", applyFilters);
elements.proficiencyFilter.addEventListener("change", applyFilters);
elements.sortSelect.addEventListener("change", applyFilters);

elements.cardList.addEventListener("click", (event) => {
  const practiceButton = event.target.closest("[data-practice]");
  if (practiceButton) {
    event.stopPropagation();
    const key = practiceButton.dataset.cardKey;
    const action = practiceButton.dataset.practice;
    const stats = state.practiceStats[key] || { correct: 0, wrong: 0 };
    stats[action] += 1;
    state.practiceStats[key] = stats;
    savePracticeStats();
    rerenderCurrentCards();
    return;
  }

  const card = event.target.closest(".expression-card");
  if (!card) {
    return;
  }

  const key = card.dataset.cardKey;
  if (state.flippedCards.has(key)) {
    state.flippedCards.delete(key);
  } else {
    state.flippedCards.add(key);
  }
  rerenderCurrentCards();
});

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

loadPracticeStats();
setTab("knowledge");
loadKnowledge();
