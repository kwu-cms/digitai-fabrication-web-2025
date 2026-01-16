const state = {
  works: [],
  filtered: [],
};

const elements = {
  keyword: document.getElementById("filter-keyword"),
  year: document.getElementById("filter-year"),
  tags: document.getElementById("filter-tags"),
  cards: document.getElementById("cards"),
  count: document.getElementById("result-count"),
  modal: document.getElementById("modal"),
  modalBody: document.getElementById("modal-body"),
  courseModal: document.getElementById("course-modal"),
  openCourse: document.getElementById("open-course"),
};

const csvPath = "data/works.csv";

const normalizeText = (value) => (value || "").toString().trim();

const parseCsv = (text) => {
  const rows = [];
  let current = "";
  let inQuotes = false;
  const pushCell = (row, cell) => {
    row.push(cell);
  };

  let row = [];
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      pushCell(row, current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      pushCell(row, current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    pushCell(row, current);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((header) => normalizeText(header));

  return rows.slice(1).map((cells) => {
    const item = {};
    headers.forEach((header, idx) => {
      item[header] = normalizeText(cells[idx] || "");
    });
    return item;
  });
};

const buildFilters = (data) => {
  const years = new Set();
  const tags = new Set();

  data.forEach((work) => {
    if (work.year) years.add(work.year);
    work.tags.forEach((tag) => tags.add(tag));
  });

  const updateSelect = (select, values) => {
    const options = Array.from(values).sort().map((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      return option;
    });
    select.append(...options);
  };

  updateSelect(elements.year, years);

  const tagOptions = Array.from(tags).sort().map((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    return option;
  });
  elements.tags.append(...tagOptions);
};

const getSelectedTags = () =>
  Array.from(elements.tags.selectedOptions).map((option) => option.value);

const matchesKeyword = (work, keyword) => {
  if (!keyword) return true;
  const source = [
    work.title,
    work.student,
    work.description,
    work.department,
    work.year,
    work.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return source.includes(keyword.toLowerCase());
};

const applyFilters = () => {
  const keyword = elements.keyword.value.trim();
  const year = elements.year.value;
  const selectedTags = getSelectedTags();

  state.filtered = state.works.filter((work) => {
    if (year && work.year !== year) return false;
    if (selectedTags.length > 0 && !work.tags.some((tag) => selectedTags.includes(tag))) {
      return false;
    }
    return matchesKeyword(work, keyword);
  });

  renderCards();
};

const buildTagChips = (tags) =>
  tags.map((tag) => `<span class="tag">${tag}</span>`).join("");

const renderCards = () => {
  elements.cards.innerHTML = "";
  elements.count.textContent = `${state.filtered.length} 件`;

  if (state.filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "該当する作品がありません。";
    elements.cards.appendChild(empty);
    return;
  }

  state.filtered.forEach((work) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${work.image || "assets/images/placeholder.svg"}" alt="${work.title}" />
      <div class="card-body">
        <div class="card-title">${work.title}</div>
        <div class="card-meta">${work.student || "学生名未設定"} / ${work.year || "年度未設定"}</div>
        <div class="card-tags">${buildTagChips(work.tags)}</div>
      </div>
    `;
    card.addEventListener("click", () => openModal(work));
    elements.cards.appendChild(card);
  });
};

const openModal = (work) => {
  const links = [];
  if (work.stl) {
    links.push(`<a class="link-button" href="${work.stl}" download>STLダウンロード</a>`);
  }
  if (work.tinkercad) {
    links.push(`<a class="link-button" href="${work.tinkercad}" target="_blank" rel="noreferrer">Tinkercad</a>`);
  }

  elements.modalBody.innerHTML = `
    <h2 id="modal-title">${work.title}</h2>
    <div class="meta">${work.student || "学生名未設定"} / ${work.department || "学科未設定"} / ${
    work.year || "年度未設定"
  }</div>
    <img src="${work.image || "assets/images/placeholder.svg"}" alt="${work.title}" />
    <div class="viewer-section">
      <div class="viewer-header">STLプレビュー</div>
      <div id="stl-viewer" class="stl-viewer">
        <div class="viewer-placeholder">STLファイルがありません。</div>
      </div>
    </div>
    <p>${work.description || "説明はまだありません。"}</p>
    <div class="links">${links.join("") || "<span>リンクはまだありません。</span>"}</div>
  `;
  elements.modal.classList.add("is-open");
  elements.modal.setAttribute("aria-hidden", "false");

  if (window.StlViewer && work.stl) {
    window.StlViewer.render({ containerId: "stl-viewer", url: work.stl });
  }
};

const closeModal = () => {
  elements.modal.classList.remove("is-open");
  elements.modal.setAttribute("aria-hidden", "true");
  if (window.StlViewer) {
    window.StlViewer.dispose();
  }
};

const setupModal = () => {
  elements.modal.addEventListener("click", (event) => {
    if (event.target.dataset.close) {
      closeModal();
    }
  });
  elements.courseModal.addEventListener("click", (event) => {
    if (event.target.dataset.close) {
      elements.courseModal.classList.remove("is-open");
      elements.courseModal.setAttribute("aria-hidden", "true");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      if (elements.courseModal.classList.contains("is-open")) {
        elements.courseModal.classList.remove("is-open");
        elements.courseModal.setAttribute("aria-hidden", "true");
      }
    }
  });
};

const init = async () => {
  try {
    const response = await fetch(csvPath);
    const text = await response.text();
    const items = parseCsv(text)
      .map((item) => ({
        id: item.id,
        title: item.title || "無題",
        student: item.student,
        year: item.year,
        department: item.department,
        description: item.description,
        image: item.image,
        stl: item.stl,
        tinkercad: item.tinkercad,
        tags: (item.tags || "")
          .split("|")
          .map((tag) => normalizeText(tag))
          .filter(Boolean),
      }))
      .filter((item) => item.title);

    state.works = items;
    state.filtered = items;
    buildFilters(items);
    renderCards();

    ["input", "change"].forEach((eventName) => {
      elements.keyword.addEventListener(eventName, applyFilters);
      elements.year.addEventListener(eventName, applyFilters);
      elements.tags.addEventListener(eventName, applyFilters);
    });

    elements.openCourse.addEventListener("click", () => {
      elements.courseModal.classList.add("is-open");
      elements.courseModal.setAttribute("aria-hidden", "false");
    });
  } catch (error) {
    elements.cards.innerHTML = `<div class="empty-state">CSVの読み込みに失敗しました。</div>`;
    console.error(error);
  }
};

setupModal();
init();
