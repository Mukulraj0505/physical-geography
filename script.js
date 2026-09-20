/* =========================================================
   UPSC Physical Geography Notes — Master JavaScript Controller
   Shared functionality across all chapters and dashboard
   ========================================================= */

(function () {
  'use strict';

  // --- 1. THEME CONTROLLER ---
  const THEMES = ['light', 'dark', 'sepia'];
  const STORAGE_KEY_THEME = 'geo_reading_theme';
  const STORAGE_KEY_FONT = 'geo_font_size';

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
    applyTheme(savedTheme);

    const themeBtn = document.getElementById('btn-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    updateThemeButtonText(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const nextIdx = (THEMES.indexOf(current) + 1) % THEMES.length;
    applyTheme(THEMES[nextIdx]);
  }

  function updateThemeButtonText(theme) {
    const themeBtn = document.getElementById('btn-theme');
    if (!themeBtn) return;
    const icons = { light: '☀️ Light', dark: '🌙 Dark', sepia: '📜 Sepia' };
    themeBtn.textContent = icons[theme] || '🌓 Theme';
  }

  // --- 2. FONT SIZE CONTROLLER ---
  let currentFontSize = 16;

  function initFontSize() {
    const saved = localStorage.getItem(STORAGE_KEY_FONT);
    if (saved) {
      currentFontSize = parseFloat(saved);
      document.documentElement.style.setProperty('--font-base', currentFontSize + 'px');
    }

    const decBtn = document.getElementById('btn-font-dec');
    const incBtn = document.getElementById('btn-font-inc');

    if (decBtn) {
      decBtn.addEventListener('click', () => {
        if (currentFontSize > 13) {
          currentFontSize -= 1.5;
          document.documentElement.style.setProperty('--font-base', currentFontSize + 'px');
          localStorage.setItem(STORAGE_KEY_FONT, currentFontSize);
        }
      });
    }

    if (incBtn) {
      incBtn.addEventListener('click', () => {
        if (currentFontSize < 24) {
          currentFontSize += 1.5;
          document.documentElement.style.setProperty('--font-base', currentFontSize + 'px');
          localStorage.setItem(STORAGE_KEY_FONT, currentFontSize);
        }
      });
    }
  }

  // --- 3. READING PROGRESS BAR ---
  function initProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = percent + '%';
    }, { passive: true });
  }

  // --- 4. DYNAMIC TABLE OF CONTENTS & SCROLLSPY ---
  function initTableOfContents() {
    const tocList = document.getElementById('toc-list');
    const tocDrawer = document.getElementById('toc-drawer');
    const tocBtn = document.getElementById('btn-toc');
    const tocClose = document.getElementById('toc-close');
    const mainPage = document.querySelector('main.page');

    if (!tocList || !mainPage) return;

    const headings = mainPage.querySelectorAll('h2, h3');
    if (headings.length === 0) {
      if (tocBtn) tocBtn.style.display = 'none';
      return;
    }

    headings.forEach((h, idx) => {
      if (!h.id) {
        h.id = 'sec-' + idx + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 30);
      }

      const li = document.createElement('li');
      li.className = 'toc-item ' + h.tagName.toLowerCase();

      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.className = 'toc-link';
      a.textContent = h.textContent.trim();

      a.addEventListener('click', () => {
        if (tocDrawer) tocDrawer.classList.remove('open');
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    if (tocBtn && tocDrawer) {
      tocBtn.addEventListener('click', () => {
        tocDrawer.classList.toggle('open');
      });
    }

    if (tocClose && tocDrawer) {
      tocClose.addEventListener('click', () => {
        tocDrawer.classList.remove('open');
      });
    }

    // Close TOC when clicking outside
    document.addEventListener('click', (e) => {
      if (tocDrawer && tocDrawer.classList.contains('open')) {
        if (!tocDrawer.contains(e.target) && (!tocBtn || !tocBtn.contains(e.target))) {
          tocDrawer.classList.remove('open');
        }
      }
    });

    // ScrollSpy active link
    const links = tocList.querySelectorAll('.toc-link');
    window.addEventListener('scroll', () => {
      let currentId = '';
      headings.forEach((h) => {
        const top = h.getBoundingClientRect().top;
        if (top <= 100) {
          currentId = h.id;
        }
      });

      links.forEach((l) => {
        if (currentId && l.getAttribute('href') === '#' + currentId) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });
    }, { passive: true });
  }

  // --- 5. CHAPTER SELECTOR & KEYBOARD NAVIGATION ---
  function initNavigation() {
    const select = document.getElementById('chapter-select');
    if (select) {
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          window.location.href = e.target.value;
        }
      });
    }

    // Keyboard Arrow navigation
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        const prev = document.querySelector('.chapter-nav-btn.prev');
        if (prev) prev.click();
      } else if (e.key === 'ArrowRight') {
        const next = document.querySelector('.chapter-nav-btn.next');
        if (next) next.click();
      }
    });
  }

  // --- 6. BACK TO TOP ---
  function initBackToTop() {
    const btt = document.getElementById('back-to-top');
    if (!btt) return;

    window.addEventListener('scroll', () => {
      if ((window.scrollY || document.documentElement.scrollTop) > 350) {
        btt.style.display = 'flex';
      } else {
        btt.style.display = 'none';
      }
    }, { passive: true });

    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initialize all components once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFontSize();
    initProgressBar();
    initTableOfContents();
    initNavigation();
    initBackToTop();
  });
})();
