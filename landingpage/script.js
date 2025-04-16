document.addEventListener("DOMContentLoaded", () => {
  // === YOUTUBE VIDEO PREVIEW ===
  const videoContainer = document.querySelector(".video-container");
  const preview = document.getElementById("youtubePreview");
  const video = document.getElementById("demoVideo");

  if (videoContainer && preview && video) {
    // On container click, load iframe src and autoplay
    videoContainer.addEventListener("click", () => {
      const videoSrc = video.getAttribute("data-src");
      video.src = videoSrc + (videoSrc.includes('?') ? '&' : '?') + 'autoplay=1';

      // Fade out preview
      preview.style.opacity = "0";
      setTimeout(() => {
        preview.style.display = "none";
      }, 300);
    });
  }
});
