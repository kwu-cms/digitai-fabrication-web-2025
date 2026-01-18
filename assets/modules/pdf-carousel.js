const buildPdfItems = (items) =>
    items
        .filter((item) => item.pdf)
        .map((item) => ({
            title: item.title,
            pdf: item.pdf,
            thumb: (() => {
                if (!item.pdf) return "assets/images/placeholder.svg";
                const filename = item.pdf.split("/").pop() || "";
                const base = filename.replace(/\.pdf$/i, "");
                return base ? `thumbnails/${base}.png` : "assets/images/placeholder.svg";
            })(),
        }));

export const buildPdfViewer = ({ items, elements, openPdfModal }) => {
    const pdfItems = buildPdfItems(items);

    if (pdfItems.length === 0) {
        elements.pdfTitle.textContent = "PDFがありません";
        elements.pdfImage.removeAttribute("src");
        elements.pdfImagePrev.removeAttribute("src");
        elements.pdfImageNext.removeAttribute("src");
        elements.pdfImagePrev2.removeAttribute("src");
        elements.pdfImageNext2.removeAttribute("src");
        elements.pdfList.innerHTML = "";
        elements.pdfPrev.disabled = true;
        elements.pdfNext.disabled = true;
        return;
    }

    let currentIndex = 0;
    let idleTimer = null;
    let autoTimer = null;
    let isAnimating = false;

    const renderDots = () => {
        elements.pdfList.innerHTML = pdfItems
            .map(
                (_, index) =>
                    `<button class="pdf-dot${index === currentIndex ? " is-active" : ""}" type="button" data-index="${index}" aria-label="PDF ${index + 1}"></button>`,
            )
            .join("");
    };

    const setPdf = (nextIndex) => {
        currentIndex = (nextIndex + pdfItems.length) % pdfItems.length;
        const current = pdfItems[currentIndex];
        const prev = pdfItems[(currentIndex - 1 + pdfItems.length) % pdfItems.length];
        const next = pdfItems[(currentIndex + 1) % pdfItems.length];
        const prev2 = pdfItems[(currentIndex - 2 + pdfItems.length) % pdfItems.length];
        const next2 = pdfItems[(currentIndex + 2) % pdfItems.length];
        elements.pdfTitle.textContent = current.title;
        elements.pdfImage.setAttribute("src", current.thumb);
        elements.pdfImagePrev.setAttribute("src", prev.thumb);
        elements.pdfImageNext.setAttribute("src", next.thumb);
        elements.pdfImagePrev2.setAttribute("src", prev2.thumb);
        elements.pdfImageNext2.setAttribute("src", next2.thumb);
        elements.pdfImage.onclick = () => openPdfModal(elements, current.pdf, current.title);
        elements.pdfImagePrev.onclick = () => openPdfModal(elements, prev.pdf, prev.title);
        elements.pdfImageNext.onclick = () => openPdfModal(elements, next.pdf, next.title);
        elements.pdfImagePrev2.onclick = () => openPdfModal(elements, prev2.pdf, prev2.title);
        elements.pdfImageNext2.onclick = () => openPdfModal(elements, next2.pdf, next2.title);
        renderDots();
    };

    const animateCarousel = (direction) => {
        if (!elements.pdfCarousel || isAnimating) return Promise.resolve();
        const currentEl = elements.pdfCarousel.querySelector(".pdf-item.pdf-current");
        const targetEl = elements.pdfCarousel.querySelector(
            direction === "prev" ? ".pdf-item.pdf-prev" : ".pdf-item.pdf-next",
        );
        if (!currentEl || !targetEl) return Promise.resolve();

        const currentRect = currentEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const distance = targetRect.left - currentRect.left;
        if (!distance) return Promise.resolve();

        isAnimating = true;
        const translateX = -distance;
        const carousel = elements.pdfCarousel;
        const duration = 700;

        return new Promise((resolve) => {
            const cleanup = () => {
                carousel.removeEventListener("transitionend", onEnd);
                carousel.style.transition = "none";
                carousel.style.transform = "translateX(0)";
                isAnimating = false;
                resolve();
            };

            const onEnd = (event) => {
                if (event.propertyName === "transform") {
                    cleanup();
                }
            };

            carousel.addEventListener("transitionend", onEnd);
            carousel.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            carousel.style.transform = `translateX(${translateX}px)`;

            window.setTimeout(cleanup, duration + 50);
        });
    };

    const userAction = (direction) => {
        animateCarousel(direction).then(() => {
            setPdf(direction === "prev" ? currentIndex - 1 : currentIndex + 1);
        });
        resetIdleTimer();
    };

    const startAuto = () => {
        if (autoTimer) return;
        autoTimer = window.setInterval(() => {
            animateCarousel("next").then(() => {
                setPdf(currentIndex + 1);
            });
        }, 6000);
    };

    const stopAuto = () => {
        if (autoTimer) {
            window.clearInterval(autoTimer);
            autoTimer = null;
        }
    };

    const resetIdleTimer = () => {
        if (idleTimer) window.clearTimeout(idleTimer);
        stopAuto();
        idleTimer = window.setTimeout(() => {
            startAuto();
        }, 10000);
    };

    elements.pdfPrev.addEventListener("click", () => userAction("prev"));
    elements.pdfNext.addEventListener("click", () => userAction("next"));
    elements.pdfList.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof HTMLButtonElement && target.dataset.index) {
            const nextIndex = Number(target.dataset.index);
            const direction = nextIndex === currentIndex ? "next" : nextIndex > currentIndex ? "next" : "prev";
            animateCarousel(direction).then(() => {
                setPdf(nextIndex);
            });
            resetIdleTimer();
        }
    });

    setPdf(0);
    resetIdleTimer();
};
