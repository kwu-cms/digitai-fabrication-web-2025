export const buildImageCarousel = (images, title) => {
    if (!images || images.length === 0) {
        return "";
    }
    const safeImages = images;
    const dots = safeImages
        .map(
            (_, index) =>
                `<button class="slide-dot${index === 0 ? " is-active" : ""}" type="button" data-index="${index}" aria-label="画像${index + 1}"></button>`,
        )
        .join("");

    return `
    <div class="slideshow" data-count="${safeImages.length}">
      <button class="slide-nav prev" type="button" aria-label="前へ">‹</button>
      <div class="modal-carousel" aria-live="polite">
        <div class="modal-item modal-prev2"><img alt="${title}" /></div>
        <div class="modal-item modal-prev"><img alt="${title}" /></div>
        <div class="modal-item modal-current"><img alt="${title}" /></div>
        <div class="modal-item modal-next"><img alt="${title}" /></div>
        <div class="modal-item modal-next2"><img alt="${title}" /></div>
      </div>
      <button class="slide-nav next" type="button" aria-label="次へ">›</button>
      <div class="slide-dots">${dots}</div>
    </div>
  `;
};

export const setupImageCarousel = (root, images) => {
    const slideshow = root.querySelector(".slideshow");
    if (!slideshow) return;
    if (!images || images.length === 0) {
        return;
    }
    const safeImages = images;
    const prev = slideshow.querySelector(".slide-nav.prev");
    const next = slideshow.querySelector(".slide-nav.next");
    const dots = Array.from(slideshow.querySelectorAll(".slide-dot"));
    const carousel = slideshow.querySelector(".modal-carousel");

    const imgPrev2 = carousel.querySelector(".modal-prev2 img");
    const imgPrev = carousel.querySelector(".modal-prev img");
    const imgCurrent = carousel.querySelector(".modal-current img");
    const imgNext = carousel.querySelector(".modal-next img");
    const imgNext2 = carousel.querySelector(".modal-next2 img");

    let index = 0;
    let isAnimating = false;

    const setImages = (nextIndex) => {
        index = (nextIndex + safeImages.length) % safeImages.length;
        const prevIndex = (index - 1 + safeImages.length) % safeImages.length;
        const nextIndex1 = (index + 1) % safeImages.length;
        const prev2Index = (index - 2 + safeImages.length) % safeImages.length;
        const next2Index = (index + 2) % safeImages.length;

        imgCurrent.src = safeImages[index];
        imgPrev.src = safeImages[prevIndex];
        imgNext.src = safeImages[nextIndex1];
        imgPrev2.src = safeImages[prev2Index];
        imgNext2.src = safeImages[next2Index];

        dots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === index);
        });
    };

    const animate = (direction) => {
        if (isAnimating || !carousel) return Promise.resolve();
        const currentEl = carousel.querySelector(".modal-current");
        const targetEl = carousel.querySelector(direction === "prev" ? ".modal-prev" : ".modal-next");
        if (!currentEl || !targetEl) return Promise.resolve();
        const currentRect = currentEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const distance = targetRect.left - currentRect.left;
        if (!distance) return Promise.resolve();
        isAnimating = true;
        const translateX = -distance;
        const duration = 500;

        return new Promise((resolve) => {
            const cleanup = () => {
                carousel.removeEventListener("transitionend", onEnd);
                carousel.style.transition = "none";
                carousel.style.transform = "translateX(0)";
                isAnimating = false;
                resolve();
            };
            const onEnd = (event) => {
                if (event.propertyName === "transform") cleanup();
            };
            carousel.addEventListener("transitionend", onEnd);
            carousel.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            carousel.style.transform = `translateX(${translateX}px)`;
            window.setTimeout(cleanup, duration + 50);
        });
    };

    const go = (direction) => {
        animate(direction).then(() => {
            setImages(direction === "prev" ? index - 1 : index + 1);
        });
    };

    prev.addEventListener("click", () => go("prev"));
    next.addEventListener("click", () => go("next"));
    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const targetIndex = Number(dot.dataset.index);
            const direction = targetIndex >= index ? "next" : "prev";
            animate(direction).then(() => {
                setImages(targetIndex);
            });
        });
    });

    setImages(0);
};
