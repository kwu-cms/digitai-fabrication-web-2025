const backgroundImageCount = 209;
const backgroundImages = Array.from({ length: backgroundImageCount }, (_, i) => {
    const index = String(i + 1).padStart(3, "0");
    return `images/background_images/2025_digitai_fabrication_research_${index}.jpg`;
});

const shuffleArray = (items) => {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const buildBackgroundCollage = () => {
    const container = document.getElementById("bg-collage");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const baseRowHeight = rect.height / 4;
    const baseColWidth = rect.width / 5;
    const rows = Math.max(1, Math.ceil(rect.height / baseRowHeight));
    const cols = Math.max(1, Math.ceil(rect.width / baseColWidth));
    const pool = shuffleArray(backgroundImages);
    let pointer = 0;

    container.innerHTML = "";
    let remainingHeight = rect.height;

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
        const row = document.createElement("div");
        row.className = "bg-row";
        const rowHeight =
            rowIndex === rows - 1 ? remainingHeight : Math.ceil(rect.height / rows);
        remainingHeight -= rowHeight;
        row.style.height = `${rowHeight}px`;

        const widths = Array.from({ length: cols }, () => baseColWidth * (0.8 + Math.random() * 0.4));
        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        const scale = rect.width / totalWidth;

        widths.forEach((width) => {
            const item = document.createElement("div");
            item.className = "bg-item";
            item.style.width = `${width * scale}px`;

            const img = document.createElement("img");
            img.src = pool[pointer % pool.length];
            img.alt = "";
            img.loading = "lazy";
            img.decoding = "async";
            pointer += 1;

            item.appendChild(img);
            row.appendChild(item);
        });

        container.appendChild(row);
    }
};

export const initBackgroundCollage = () => {
    buildBackgroundCollage();
    window.addEventListener("resize", () => {
        if (window.__bgResizeTimer) {
            window.clearTimeout(window.__bgResizeTimer);
        }
        window.__bgResizeTimer = window.setTimeout(buildBackgroundCollage, 200);
    });
};
