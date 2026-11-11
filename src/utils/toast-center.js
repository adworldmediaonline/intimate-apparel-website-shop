// Toast centering utility to override inline styles
export const forceToastCenter = () => {
  // Function to center toast containers
  const centerToastContainers = () => {
    const containers = document.querySelectorAll(
      '[class*="Toastify__toast-container"]'
    );

    containers.forEach(container => {
      if (container) {
        // Override inline styles
        container.style.setProperty('position', 'fixed', 'important');
        container.style.setProperty('top', '50%', 'important');
        container.style.setProperty('left', '50%', 'important');
        container.style.setProperty('right', 'auto', 'important');
        container.style.setProperty('bottom', 'auto', 'important');
        container.style.setProperty(
          'transform',
          'translate(-50%, -50%)',
          'important'
        );
        container.style.setProperty('width', 'auto', 'important');
        container.style.setProperty('max-width', '400px', 'important');
        container.style.setProperty('min-width', '300px', 'important');
        container.style.setProperty('z-index', '2147483647', 'important');
        container.style.setProperty('margin', '0', 'important');
        container.style.setProperty('padding', '0', 'important');
        container.style.setProperty('display', 'flex', 'important');
        container.style.setProperty('flex-direction', 'column', 'important');
        container.style.setProperty('align-items', 'center', 'important');
        container.style.setProperty('justify-content', 'center', 'important');
      }
    });
  };

  // Run immediately
  centerToastContainers();

  // Set up observer to watch for new toast containers
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a toast container
            if (
              node.classList &&
              node.classList.toString().includes('Toastify__toast-container')
            ) {
              setTimeout(() => centerToastContainers(), 0);
            }
            // Check if the added node contains toast containers
            const containers = node.querySelectorAll
              ? node.querySelectorAll('[class*="Toastify__toast-container"]')
              : [];
            if (containers.length > 0) {
              setTimeout(() => centerToastContainers(), 0);
            }
          }
        });
      }

      // Also check for attribute changes that might affect positioning
      if (
        mutation.type === 'attributes' &&
        mutation.target.classList &&
        mutation.target.classList
          .toString()
          .includes('Toastify__toast-container')
      ) {
        setTimeout(() => centerToastContainers(), 0);
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  // Also run on window resize
  window.addEventListener('resize', centerToastContainers);

  // Return cleanup function
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', centerToastContainers);
  };
};

// Auto-start when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceToastCenter);
  } else {
    forceToastCenter();
  }
}
