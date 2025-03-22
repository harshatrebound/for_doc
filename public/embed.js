// Trebound Booking Widget Embed Script
(() => {
  // Create and inject styles
  const style = document.createElement('style');
  style.textContent = `
    .booking-button button {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
      outline: none;
    }
    .booking-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .booking-modal iframe {
      width: 100%;
      max-width: 600px;
      height: 80vh;
      max-height: 800px;
      border: none;
      border-radius: 12px;
      background: white;
    }
    @media (max-width: 640px) {
      .booking-modal iframe {
        width: 90%;
        height: 90vh;
      }
    }
  `;
  document.head.appendChild(style);

  // Find all booking buttons
  const buttons = document.querySelectorAll('.booking-button');
  buttons.forEach(container => {
    // Get settings from data attribute
    const settings = JSON.parse(decodeURIComponent(container.dataset.settings || '{}'));
    const {
      styling = {
        primaryColor: '#8B5C9E',
        buttonText: 'Book Appointment',
        buttonStyle: 'rounded',
      }
    } = settings;

    // Create button
    const button = document.createElement('button');
    button.textContent = styling.buttonText;
    button.style.backgroundColor = styling.primaryColor;
    button.style.color = '#ffffff';
    button.style.borderRadius = styling.buttonStyle === 'rounded' ? '0.5rem' : '0';

    // Add hover effect
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = adjustBrightness(styling.primaryColor, -10);
    });
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = styling.primaryColor;
    });

    // Handle click
    button.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'booking-modal';
      
      const iframe = document.createElement('iframe');
      iframe.src = `${window.location.origin}/book?embed=true&settings=${encodeURIComponent(JSON.stringify(settings))}`;
      
      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });

      // Handle messages from iframe
      window.addEventListener('message', (event) => {
        if (event.data === 'close-booking-modal') {
          document.body.removeChild(modal);
        }
      });

      modal.appendChild(iframe);
      document.body.appendChild(modal);
    });

    container.appendChild(button);
  });

  // Helper function to adjust color brightness
  function adjustBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
})(); 