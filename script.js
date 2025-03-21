document.addEventListener("DOMContentLoaded", () => {
  // === DARK MODE TOGGLE ===
  const darkModeToggle = document.querySelector(".dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");

      // Grab the path in the <svg> of the toggle button
      const svgPath = darkModeToggle.querySelector("svg path");
      // If we're in dark mode => show a nice "sun" icon
      if (document.body.classList.contains("dark-mode")) {
        svgPath.setAttribute(
          "d",
          // Prettier "sun" icon from heroicons:
          "M12 2a1 1 0 011 1v2a1 1 0 01-2 0V3a1 1 0 011-1zm4.95 3.05l1.414-1.414a1 1 0 011.415 1.414L18.364 4.464A1 1 0 0116.95 3.05zM22 11a1 1 0 010 2h-2a1 1 0 010-2h2zM4 12a1 1 0 110 2H2a1 1 0 110-2h2zm2.636 7.536l-1.414 1.414a1 1 0 101.414 1.414l1.414-1.414a1 1 0 10-1.414-1.414zM13 19a1 1 0 11-2 0v-2a1 1 0 112 0v2zm4.95-3.05a1 1 0 011.414 1.414l-1.414 1.414a1 1 0 01-1.415-1.414l1.415-1.414zM12 6a6 6 0 110 12 6 6 0 010-12z"
        );
      } else {
        // Otherwise show a nicer "moon" path
        svgPath.setAttribute(
          "d",
          "M20.354 15.354A9 9 0 0112.646 3.646 8 8 0 1020.354 15.354z"
        );
      }
    });
  }

  // === YOUTUBE VIDEO PREVIEW ===
  const videoContainer = document.querySelector(".video-container");
  const preview = document.getElementById("youtubePreview");
  const video = document.getElementById("demoVideo");
  if (videoContainer && preview && video) {
    videoContainer.addEventListener("click", () => {
      // Load the real src (with autoplay=1), fade out thumbnail
      video.src = video.getAttribute("data-src");
      preview.style.opacity = "0";
      setTimeout(() => {
        preview.style.display = "none";
      }, 300);
    });
  }
});
