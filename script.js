document.addEventListener("DOMContentLoaded", () => {

  // === ACCORDION FUNCTIONALITY (Wurde entfernt) ===


  // === TABS FUNCTIONALITY (Bleibt bestehen) ===
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanels = document.querySelectorAll(".tab-panel");

  if (tabButtons.length > 0 && tabPanels.length > 0) { // Prüfen ob Elemente existieren
      tabButtons.forEach(button => {
        button.addEventListener("click", () => {
          const targetTabId = button.getAttribute("data-tab");
          const targetPanel = document.getElementById(targetTabId);

          if (targetPanel) {
            // Remove active state from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabPanels.forEach(panel => panel.classList.remove("active"));

            // Add active state to the clicked button and corresponding panel
            button.classList.add("active");
            targetPanel.classList.add("active");
          }
        });
      });
  }


  // === SMOOTH SCROLLING FOR CTA BUTTONS (Optional, bleibt bestehen) ===
  const ctaLinks = document.querySelectorAll('a.cta-button[href^="#"], a.resource-button[href^="#"]');

  if (ctaLinks.length > 0) { // Prüfen ob Elemente existieren
      ctaLinks.forEach(link => {
        link.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          // Check if it's really an internal link
          if (targetId && targetId.startsWith('#') && targetId.length > 1) {
              try { // Error Handling falls Element nicht existiert
                  const targetElement = document.getElementById(targetId.substring(1));
                  if (targetElement) {
                      e.preventDefault(); // Prevent default anchor jump
                      const offsetTop = targetElement.offsetTop;
                      // Optional: Adjust offset if you have a fixed header
                      // const headerOffset = 60; // example offset value
                      // window.scrollTo({ top: offsetTop - headerOffset, behavior: 'smooth' });
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                  }
              } catch (error) {
                  console.error("Smooth scroll target element not found:", targetId);
              }
          }
        });
      });
  }


}); // End DOMContentLoaded
