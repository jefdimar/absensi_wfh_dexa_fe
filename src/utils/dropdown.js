// Simple dropdown utility without Bootstrap JS
export const initializeDropdowns = () => {
  // Close dropdowns when clicking outside
  document.addEventListener('click', (event) => {
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    dropdowns.forEach(dropdown => {
      const dropdownButton = dropdown.previousElementSibling;
      if (!dropdown.contains(event.target) && !dropdownButton.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    });
  });

  // Handle dropdown button clicks
  document.addEventListener('click', (event) => {
    if (event.target.closest('.dropdown button')) {
      event.preventDefault();
      const button = event.target.closest('.dropdown button');
      const menu = button.nextElementSibling;

      // Close other dropdowns
      document.querySelectorAll('.dropdown-menu.show').forEach(otherMenu => {
        if (otherMenu !== menu) {
          otherMenu.classList.remove('show');
        }
      });

      // Toggle current dropdown
      menu.classList.toggle('show');
    }
  });
};

// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDropdowns);
  } else {
    initializeDropdowns();
  }
}