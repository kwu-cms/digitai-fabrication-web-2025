const normalizeText = (value) => (value || "").toString().trim();

const normalizePath = (value) => {
    const text = normalizeText(value);
    if (!text) return "";
    if (text.startsWith(".stl/")) return text.replace(".stl/", "stl/");
    if (text.startsWith(".images/")) return text.replace(".images/", "images/");
    if (text.startsWith(".pdf/")) return text.replace(".pdf/", "pdf/");
    return text;
};

const normalizeAssetPath = (value, type) => {
    const text = normalizePath(value);
    if (!text) return "";
    if (text.includes("/") || text.startsWith("http")) return text;
    if (type === "stl") return `stl/${text}`;
    if (type === "image") return `images/${text}`;
    if (type === "pdf") return `pdf/${text}`;
    return text;
};

const normalizePaths = (value, type) => {
    const text = normalizeText(value);
    if (!text) return [];
    return text
        .split(/[|,]/)
        .map((entry) => normalizeAssetPath(entry, type))
        .filter(Boolean);
};

const getField = (item, keys) => {
    for (const key of keys) {
        const value = normalizeText(item[key]);
        if (value) return value;
    }
    return "";
};

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

export const buildItemsFromCsv = (text) =>
    parseCsv(text)
        .map((item) => {
            const tagsText = getField(item, ["tags", "タグ", "TAGS"]);
            const title = getField(item, ["title", "制作物", "TITLE"]) || "無題";
            const student = getField(item, ["student", "氏名", "NAME_JA"]);
            const year = getField(item, ["year", "年度", "YEAR"]);
            const department = getField(item, ["department", "所属学年", "COURSE_YEAR"]);
            const description = getField(item, ["description", "説明"]);
            const images = normalizePaths(
                getField(item, ["image", "images", "IMAGES_FILENAME"]),
                "image",
            );
            const image = images[0] || "";
            const stl = normalizeAssetPath(getField(item, ["stl", "STL", "STL_FILENAME"]), "stl");
            const pdf = normalizeAssetPath(getField(item, ["pdf", "PDF", "PDF_FILENAME"]), "pdf");
            const tinkercad = getField(item, ["tinkercad", "URL"]);
            const presentFlag = getField(item, ["発表", "PRESENTATION"]);

            return {
                id: getField(item, ["id", "No.", "学籍番号", "ID"]),
                title,
                student,
                year,
                department,
                description,
                image,
                images,
                stl,
                pdf,
                tinkercad,
                presentFlag,
                tags: tagsText
                    .split(/[\|,]/)
                    .map((tag) => normalizeText(tag))
                    .filter(Boolean),
            };
        })
        .filter((item) => item.title)
        .filter((item) => item.presentFlag && item.presentFlag.toLowerCase() === "true");
