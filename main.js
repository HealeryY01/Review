document.addEventListener("DOMContentLoaded", function () {
  const reviewModalEl = document.getElementById("reviewModal");
  const infoBox = document.getElementById("infoBox");
  const infoDetailsModal = document.getElementById("infoDetailsModal");

  const modalImgContainer = document.getElementById("modalImgContainer");
  const modalThumbContainer = document.getElementById("modalThumbContainer");
  const prevImgBtn = document.getElementById("prevImg");
  const nextImgBtn = document.getElementById("nextImg");

  let currentIndex = 0;
  let images = [];

  if (!reviewModalEl._bsModal)
    reviewModalEl._bsModal = new bootstrap.Modal(reviewModalEl);

  // Hiển thị badge số ảnh
  document.querySelectorAll(".review-card").forEach((card) => {
    const imgs = JSON.parse(card.dataset.images || "[]");
    const badge = card.querySelector(".multi-photo-badge");

    if (badge) {
      if (imgs.length > 1) {
        badge.style.display = "block";
        badge.innerHTML = `<i class="fa-solid fa-images"></i> +${
          imgs.length - 1
        }`;
      } else {
        badge.style.display = "none";
      }
    }
  });

  // ================================
  // UPDATE GALLERY
  // ================================
  function updateGallery(index) {
    const imgs = modalImgContainer.querySelectorAll(".modal-gallery-img");
    const thumbs = modalThumbContainer.querySelectorAll(".thumbnail-img");

    imgs.forEach((img) => img.classList.remove("active"));
    if (imgs[index]) imgs[index].classList.add("active");

    thumbs.forEach((thumb) => thumb.classList.remove("active"));
    if (thumbs[index]) thumbs[index].classList.add("active");

    currentIndex = index;

    // Hide prev/next if only one img
    if (images.length <= 1) {
      prevImgBtn.style.display = "none";
      nextImgBtn.style.display = "none";
    } else {
      prevImgBtn.style.display = "block";
      nextImgBtn.style.display = "block";

      prevImgBtn.disabled = index === 0;
      prevImgBtn.style.opacity = index === 0 ? 0.4 : 1;

      nextImgBtn.disabled = index === images.length - 1;
      nextImgBtn.style.opacity = index === images.length - 1 ? 0.4 : 1;
    }

    // Scroll thumbnail active
    if (thumbs[index]) {
      const thumb = thumbs[index];
      const container = modalThumbContainer;

      const scrollLeft =
        thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2;

      container.scroll({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }

  // ================================
  // CREATE GALLERY
  // ================================
  function createGallery(imgs, bgColors = []) {
    images = imgs;

    // Main images
    modalImgContainer.innerHTML = images
      .map(
        (src, idx) => `
        <img
          src="${src}"
          class="modal-gallery-img ${idx === 0 ? "active" : ""}"
          data-index="${idx}"
        >
      `
      )
      .join("");

    // Set background + default style
    modalImgContainer
      .querySelectorAll(".modal-gallery-img")
      .forEach((img, idx) => {
        img.style.background = bgColors[idx] || "#f0f0f0";
        img.style.objectFit = "contain";
        img.style.border = "none";
      });

    // Thumbnails
    if (images.length > 1) {
      modalThumbContainer.style.display = "flex";
      modalThumbContainer.innerHTML = images
        .map(
          (src, idx) => `
          <img
            src="${src}"
            class="thumbnail-img ${idx === 0 ? "active" : ""}"
            data-index="${idx}"
          >
        `
        )
        .join("");
    } else {
      modalThumbContainer.style.display = "none";
      modalThumbContainer.innerHTML = "";
    }

    // Click vào thumbnail
    modalThumbContainer.querySelectorAll(".thumbnail-img").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const idx = parseInt(thumb.dataset.index);
        if (!isNaN(idx)) updateGallery(idx);
      });
    });

    // ================================
    // AUTO DETECT Ngang / Dọc
    // ================================
    const mainImgs = modalImgContainer.querySelectorAll(".modal-gallery-img");

    mainImgs.forEach((img, idx) => {
      const temp = new Image();
      temp.onload = function () {
        // Gán màu nền nếu có
        img.style.background = bgColors[idx] || "#f0f0f0";

        if (this.width > this.height || this.width < 350) {
          // Ảnh ngang hoặc ảnh nhỏ → contain
          img.classList.remove("fit-cover");
          img.classList.add("fit-contain");
          img.style.objectFit = "contain";
        } else {
          // Ảnh dọc lớn
          img.classList.remove("fit-contain");
          img.classList.add("fit-cover");
          img.style.objectFit = "cover";
        }
      };
      temp.src = img.src;
    });

    updateGallery(0);
  }

  // ================================
  // OPEN MODAL
  // ================================
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".review-card");
    if (!card) return;

    document.querySelector("#modalName").textContent =
      card.querySelector(".name")?.textContent || "";

    document.querySelector("#modalVerified").innerHTML = card.querySelector(
      ".verified"
    )?.textContent
      ? `<i class="fa-solid fa-circle-check verified-icon"></i>
         <span>${card.querySelector(".verified")?.textContent}</span>
         <span class="divider">|</span>
         <i class="fa-solid fa-circle-info info-icon"></i>`
      : `<i class="fa-solid fa-circle-info info-icon"></i>`;

    document.querySelector("#modalDate").textContent =
      card.querySelector(".date")?.textContent || "";

    document.querySelector("#modalStars").innerHTML =
      card.querySelector(".stars")?.innerHTML || "";

    document.querySelector("#modalText").textContent =
      card.querySelector(".text")?.textContent || "";

    document.querySelector("#modalProductImg").src =
      card.querySelector(".product img")?.src || "";

    document.querySelector("#modalProductName").textContent =
      card.querySelector(".product span")?.textContent || "";

    // Images + bgColors
    let imgs = [];
    try {
      imgs = JSON.parse(card.dataset.images || "[]");
    } catch {
      imgs = [];
    }

    if (imgs.length === 0) {
      const mainImg = card.querySelector(".review-img")?.src;
      if (mainImg) imgs.push(mainImg);
    }

    const bgColors = (card.dataset.bg || "").split(",");

    createGallery(imgs, bgColors);

    infoBox.style.display = "none";
    infoDetailsModal.style.display = "none";
    reviewModalEl._bsModal.show();
  });

  // ================================
  // INFO BUTTON
  // ================================
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("info-icon")) {
      e.stopPropagation();
      infoBox.style.display = "block";
      document.querySelector(".info-text").textContent =
        "This review was written by a site visitor.";
    } else if (reviewModalEl.contains(e.target)) {
      infoBox.style.display = "none";
    }
  });

  document.getElementById("learnMoreLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    infoDetailsModal.style.display = "block";
    infoBox.style.display = "none";
  });

  document
    .querySelector(".close-info-details")
    ?.addEventListener("click", () => {
      infoDetailsModal.style.display = "none";
    });

  // ================================
  // PREV / NEXT
  // ================================
  prevImgBtn.addEventListener("click", () => {
    if (currentIndex > 0) updateGallery(currentIndex - 1);
  });

  nextImgBtn.addEventListener("click", () => {
    if (currentIndex < images.length - 1) updateGallery(currentIndex + 1);
  });

  // ================================
  // LOAD MORE
  // ================================
  document.querySelector(".load-more button")?.addEventListener("click", () => {
    const hiddenCards = Array.from(
      document.querySelectorAll(".review-card.hidden")
    ).slice(0, 20);

    hiddenCards.forEach((card) => {
      card.classList.remove("hidden");
      card.offsetHeight;
      card.classList.add("show");
    });

    if (!document.querySelector(".review-card.hidden"))
      document.querySelector(".load-more").style.display = "none";
  });

  // ================================
  // REVIEW CARD IMG AUTO FIT
  // ================================
  document.querySelectorAll(".review-img").forEach((img) => {
    img.onload = () => {
      if (img.naturalWidth > img.naturalHeight) {
        img.classList.add("landscape");
      } else {
        img.classList.add("portrait");
        img.style.height = img.naturalWidth > 350 ? "320px" : "480px";
      }
    };
  });
});
