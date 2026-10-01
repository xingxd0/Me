const state = {
  cards: [],
  filteredCards: [],
  payload: null,
};

const elements = {
  generatedAt: document.querySelector("#generatedAt"),
  cardCount: document.querySelector("#cardCount"),
  totalOccurrences: document.querySelector("#totalOccurrences"),
  sourceCount: document.querySelector("#sourceCount"),
  masteredCount: document.querySelector("#masteredCount"),
  cardList: document.querySelector("#cardList"),
  searchInput: document.querySelector("#searchInput"),
  kindFilter: document.querySelector("#kindFilter"),
  skillContent: document.querySelector("#skillContent"),
};

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
        还没有匹配的卡片。请在 GitHub 仓库的 <code>content/inbox</code> 添加原文，然后本地运行处理脚本。
      </div>
    `;
    return;
  }

  elements.cardList.innerHTML = cards
    .map((card) => {
      const occurrence = latestOccurrence(card);
      const example = occurrence.example || "暂无例句";
      const source = occurrence.source_title || "未知来源";
      return `
        <article class="expression-card">
          <div class="card-meta">
            <span>${card.kind === "word" ? "WORD" : "PHRASE"}</span>
            <span>${card.total_count} 次</span>
          </div>
          <div>
            <h3>${card.phrase}</h3>
            <p class="meaning">${card.meaning || "待补充含义"}</p>
          </div>
          <p class="example">${example}</p>
          <div class="card-footer">
            <span>${source}</span>
            <span>${card.proficiency || "new"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function applyFilters() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const kind = elements.kindFilter.value;

  state.filteredCards = state.cards.filter((card) => {
    const occurrence = latestOccurrence(card);
    const text = [card.phrase, card.meaning, occurrence.source_title, occurrence.example]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesKind = kind === "all" || card.kind === kind;
    return matchesQuery && matchesKind;
  });

  renderCards(state.filteredCards);
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
    state.filteredCards = state.cards;
    updateSummary(payload);
    elements.skillContent.textContent = payload.skill?.content || "暂无 Skill 内容";
    renderCards(state.filteredCards);
  } catch (error) {
    elements.generatedAt.textContent = "未找到导出数据";
    elements.skillContent.textContent = "请先本地运行 python3 scripts/process.py 生成 public/knowledge.json。";
    elements.cardList.innerHTML = `
      <div class="empty">
        未能读取 <code>public/knowledge.json</code>。请先运行本地处理脚本，然后 push 到 GitHub。
      </div>
    `;
  }
}

elements.searchInput.addEventListener("input", applyFilters);
elements.kindFilter.addEventListener("change", applyFilters);

loadKnowledge();
