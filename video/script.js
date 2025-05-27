document.addEventListener("DOMContentLoaded", () => {
  // === DARK MODE TOGGLE ===
  const darkModeToggle = document.querySelector(".dark-mode-toggle");
  if (darkModeToggle) {
    // Initialize the toggle state based on current mode
    if (document.body.classList.contains("dark-mode")) {
      // Set to sun icon if already in dark mode
      updateToggleIcon(darkModeToggle, true);
    } else {
      // Otherwise set to moon icon
      darkModeToggle.classList.add("moon-mode");
    }
    
    darkModeToggle.addEventListener("click", () => {
      // Toggle .dark-mode on <body>
      document.body.classList.toggle("dark-mode");
      
      // Update icon based on dark mode state
      const isDarkMode = document.body.classList.contains("dark-mode");
      updateToggleIcon(darkModeToggle, isDarkMode);
      
      // Toggle moon-mode class for white glow effect
      darkModeToggle.classList.toggle("moon-mode", !isDarkMode);
    });
  }
  
  // Function to update the toggle icon
  function updateToggleIcon(toggleButton, isDarkMode) {
    const svgPath = toggleButton.querySelector("svg path");
    if (isDarkMode) {
      // Sun icon (improved path for better appearance)
      svgPath.setAttribute(
        "d",
        "M12 3v2M12 19v2M4.93 4.93l1.41 1.41M18.36 18.36l1.41 1.41M3 12h2M19 12h2M4.93 19.07l1.41-1.41M18.36 5.64l1.41-1.41M12 8a4 4 0 100 8 4 4 0 000-8z"
      );
    } else {
      // Moon icon (single-line path)
      svgPath.setAttribute(
        "d",
        "M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
      );
    }
  }
  
});
