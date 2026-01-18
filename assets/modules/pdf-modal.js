let pdfjsLoader = null;
let activePdfModalToken = 0;

const loadPdfJs = () => {
    if (!pdfjsLoader) {
        pdfjsLoader = import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.min.mjs").then(
            (pdfjsLib) => {
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.worker.min.mjs";
                return pdfjsLib;
            },
        );
    }
    return pdfjsLoader;
};

export const openPdfModal = (elements, pdfUrl, title) => {
    if (!elements.pdfModal || !elements.pdfModalIframe) return;
    let currentPage = 1;
    let totalPages = null;
    activePdfModalToken += 1;
    const modalToken = activePdfModalToken;
    const setPage = (page) => {
        const maxPage = totalPages || page;
        currentPage = Math.max(1, Math.min(page, maxPage));
        const hasQuery = pdfUrl.includes("?");
        const cacheKey = `v=${Date.now()}`;
        const base = `${pdfUrl}${hasQuery ? "&" : "?"}${cacheKey}`;
        elements.pdfModalIframe.setAttribute(
            "src",
            `${base}#page=${currentPage}&view=FitH&toolbar=0`,
        );
        elements.pdfPageIndicator.textContent = totalPages
            ? `${currentPage} / ${totalPages}`
            : `${currentPage} / ?`;
        elements.pdfPagePrev.disabled = currentPage <= 1;
        elements.pdfPageNext.disabled = totalPages ? currentPage >= totalPages : false;
    };

    elements.pdfModal.querySelector("#pdf-modal-title").textContent = title || "PDFビューア";
    elements.pdfModal.classList.add("is-open");
    elements.pdfModal.setAttribute("aria-hidden", "false");
    elements.pdfPagePrev.onclick = () => setPage(currentPage - 1);
    elements.pdfPageNext.onclick = () => setPage(currentPage + 1);
    setPage(1);

    loadPdfJs()
        .then((pdfjsLib) => pdfjsLib.getDocument(pdfUrl).promise)
        .then((doc) => {
            if (!elements.pdfModal.classList.contains("is-open")) return;
            if (modalToken !== activePdfModalToken) return;
            totalPages = doc.numPages;
            setPage(currentPage);
        })
        .catch(() => {
            totalPages = null;
            setPage(currentPage);
        });
};
