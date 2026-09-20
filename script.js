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
    
    // Create mobile backdrop if not existing
    let backdrop = document.querySelector('.drawer-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'drawer-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', () => {
        if (tocDrawer) tocDrawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        backdrop.classList.remove('active');
      });
    }
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
        if (backdrop) backdrop.classList.remove('active');
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    if (tocBtn && tocDrawer) {
      tocBtn.addEventListener('click', () => {
        tocDrawer.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('active', tocDrawer.classList.contains('open'));
      });
    }

    if (tocClose && tocDrawer) {
      tocClose.addEventListener('click', () => {
        tocDrawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
      });
    }

    // Close TOC when clicking outside
    document.addEventListener('click', (e) => {
      if (tocDrawer && tocDrawer.classList.contains('open')) {
        if (!tocDrawer.contains(e.target) && (!tocBtn || !tocBtn.contains(e.target))) {
          tocDrawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
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
    initPyqFeatures();
    initNavigation();
    initBackToTop();
  });

  // --- 5. INTERACTIVE PYQ CONTROLLER (Prelims & Mains) ---
  function initPyqFeatures() {
    // A. Prelims Interactive MCQ Testing
    const optionLists = document.querySelectorAll('.pyq-options');
    optionLists.forEach(ul => {
      const correctAns = (ul.getAttribute('data-correct') || '').toLowerCase().trim();
      const options = ul.querySelectorAll('li[data-opt]');
      const card = ul.closest('.pyq-card');
      const details = card ? card.querySelector('details.pyq-solution') : null;

      options.forEach(li => {
        li.addEventListener('click', () => {
          // If already checked via opened solution, do not re-select
          options.forEach(opt => opt.classList.remove('selected'));
          li.classList.add('selected');

          // If solution is already open, show feedback immediately
          if (details && details.open) {
            evaluateOption(li, correctAns);
          }
        });
      });

      if (details) {
        details.addEventListener('toggle', () => {
          if (details.open) {
            // Highlight correct option and check selected
            options.forEach(opt => {
              const optLetter = (opt.getAttribute('data-opt') || '').toLowerCase().trim();
              if (optLetter === correctAns) {
                opt.classList.add('correct-pick');
              } else if (opt.classList.contains('selected')) {
                opt.classList.add('wrong-pick');
              }
            });
          }
        });
      }
    });

    function evaluateOption(selectedLi, correctAns) {
      const optLetter = (selectedLi.getAttribute('data-opt') || '').toLowerCase().trim();
      if (optLetter === correctAns) {
        selectedLi.classList.add('correct-pick');
      } else {
        selectedLi.classList.add('wrong-pick');
      }
    }

    // B. Filter Toolbar (Prelims)
    const filterBtns = document.querySelectorAll('.pyq-filters .filter-btn');
    const pyqCards = document.querySelectorAll('.pyq-card[data-theme]');
    const themeHeadings = document.querySelectorAll('#prelims-pyqs h2');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterVal = btn.getAttribute('data-filter');

        pyqCards.forEach(card => {
          const cardTheme = card.getAttribute('data-theme');
          if (filterVal === 'all' || cardTheme === filterVal) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });

        // Hide/show headings appropriately
        if (filterVal === 'all') {
          themeHeadings.forEach(h => h.style.display = '');
        } else {
          themeHeadings.forEach(h => {
            const hText = h.textContent.toLowerCase();
            if (filterVal === 'predictive' && hText.includes('predictive')) {
              h.style.display = '';
            } else if (filterVal === 'theme-1' && hText.includes('theme 1')) {
              h.style.display = '';
            } else if (filterVal === 'theme-2' && hText.includes('theme 2')) {
              h.style.display = '';
            } else if (filterVal === 'theme-3' && hText.includes('theme 3')) {
              h.style.display = '';
            } else if (filterVal === 'theme-4' && hText.includes('theme 4')) {
              h.style.display = '';
            } else {
              h.style.display = 'none';
            }
          });
        }
      });
    });

    // C. Expand / Collapse All (Prelims)
    const expandBtn = document.getElementById('btn-expand-all');
    const collapseBtn = document.getElementById('btn-collapse-all');

    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        document.querySelectorAll('.pyq-solution').forEach(d => d.open = true);
      });
    }

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        document.querySelectorAll('.pyq-solution').forEach(d => d.open = false);
      });
    }

    // D. Smooth Jump Links with Pulse Animation (Mains)
    const jumpLinks = document.querySelectorAll('.mains-jump-bar a[href^="#"]');
    jumpLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetEl.classList.remove('highlight-pulse');
          void targetEl.offsetWidth; // trigger reflow
          targetEl.classList.add('highlight-pulse');
        }
      });
    });
  }

})();
