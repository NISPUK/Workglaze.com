document.addEventListener("DOMContentLoaded", () => {
  // === DARK MODE TOGGLE ===
  const darkModeToggle = document.querySelector(".dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      // Toggle .dark-mode on <body>
      document.body.classList.toggle("dark-mode");

      // Swap icon paths for "sun" vs "moon"
      const svgPath = darkModeToggle.querySelector("svg path");
      if (document.body.classList.contains("dark-mode")) {
        // Sun icon (improved path for better appearance)
        svgPath.setAttribute(
          "d",
          "M12 3v1.5M12 19.5V21M4.93 4.93l1.06 1.06M18.01 18.01l1.06 1.06M3 12h1.5M19.5 12H21M4.93 19.07l1.06-1.06M18.01 5.99l1.06-1.06M12 6a6 6 0 100 12 6 6 0 000-12z"
        );
      } else {
        // Moon icon (single-line path)
        svgPath.setAttribute(
          "d",
          "M21.75 14.47A9.53 9.53 0 0110.53 3.25a.75.75 0 01-.69-1 10.5 10.5 0 1011.91 12.68.75.75 0 01-1-.69z"
        );
      }
    });
  }

  // === YOUTUBE VIDEO PREVIEW ===
  const videoContainer = document.querySelector(".video-container");
  const preview = document.getElementById("youtubePreview");
  const video = document.getElementById("demoVideo");
  if (videoContainer && preview && video) {
    // Click on container => load real 'src' into iframe, fade out preview
    videoContainer.addEventListener("click", () => {
      video.src = video.getAttribute("data-src");
      preview.style.opacity = "0";
      setTimeout(() => {
        preview.style.display = "none";
      }, 300);
    });
  }
});
