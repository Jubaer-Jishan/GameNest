(function () {
  function resolveEndpoint(fileName) {
    const { protocol, origin, pathname } = window.location;

    if (protocol === 'file:') {
      const decodedPath = decodeURIComponent(pathname);
      const segments = decodedPath.split('/').filter(Boolean);
      const gamenestIndex = segments.findIndex(segment => segment.toLowerCase() === 'gamenest');
      let baseSegments = [];

      if (gamenestIndex !== -1) {
        baseSegments = segments.slice(gamenestIndex, -1);
      } else if (segments.length > 1) {
        baseSegments = segments.slice(0, -1);
      }

      const basePath = baseSegments.length ? `${baseSegments.join('/')}/` : '';
      return `http://localhost/${basePath}${fileName}`;
    }

    const basePath = pathname.replace(/[^/]*$/, '');
    return `${origin}${basePath}${fileName}`;
  }

  const sessionEndpoint = resolveEndpoint('session_status.php');
  const logoutEndpoint = resolveEndpoint('logout.php');

  function getCachedUser() {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.warn('GameNest Session: unable to parse cached user', error);
      return null;
    }
  }

  async function fetchSessionState() {
    try {
      const response = await fetch(sessionEndpoint, { 
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Session check failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Session fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Session fetch failed:', error);
      return { authenticated: false };
    }
  }

  let logoutModal;
  let logoutConfirmButton;
  let logoutCancelButton;
  let activeLogoutHandler;

  function ensureLogoutStyles() {
    if (document.getElementById('gamenest-logout-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'gamenest-logout-styles';
    style.textContent = `
      .logout-modal {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(7, 11, 24, 0.85);
        backdrop-filter: blur(12px);
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .logout-modal.show {
        opacity: 1;
        pointer-events: auto;
      }

      .logout-modal-content {
        background: linear-gradient(135deg, rgba(30, 34, 58, 0.95), rgba(14, 18, 40, 0.95));
        border: 1px solid rgba(99, 102, 241, 0.35);
        border-radius: 20px;
        padding: 36px;
        width: min(420px, 92vw);
        text-align: center;
        box-shadow: 0 24px 45px rgba(15, 23, 42, 0.55);
        transform: translateY(16px);
        transition: transform 0.3s ease;
      }

      .logout-modal.show .logout-modal-content {
        transform: translateY(0);
      }

      .logout-icon {
        width: 78px;
        height: 78px;
        margin: 0 auto 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
        color: #fff;
        font-size: 36px;
      }

      .logout-modal-content h2 {
        margin: 18px 0 10px;
        font-size: 24px;
        font-weight: 700;
        color: #f8fafc;
      }

      .logout-modal-content p {
        margin-bottom: 28px;
        font-size: 15px;
        line-height: 1.6;
        color: #cbd5f5;
      }

      .logout-buttons {
        display: flex;
        gap: 12px;
      }

      .logout-buttons button {
        flex: 1;
        padding: 12px 20px;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .logout-cancel-btn {
        background: rgba(241, 245, 249, 0.06);
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.25);
      }

      .logout-cancel-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(148, 163, 184, 0.18);
      }

      .logout-confirm-btn {
        background: linear-gradient(135deg, #f43f5e, #f97316);
        color: #0f172a;
      }

      .logout-confirm-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 16px 30px rgba(244, 63, 94, 0.35);
      }

      .logout-confirm-btn:disabled,
      .logout-cancel-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    `;

    document.head.appendChild(style);
  }

  function ensureLogoutModal() {
    if (logoutModal) {
      return logoutModal;
    }

    ensureLogoutStyles();

    logoutModal = document.createElement('div');
    logoutModal.className = 'logout-modal';
    logoutModal.innerHTML = `
      <div class="logout-modal-content glass-panel">
        <div class="logout-icon">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to sign out of GameNest?</p>
        <div class="logout-buttons">
          <button type="button" class="logout-cancel-btn">Cancel</button>
          <button type="button" class="logout-confirm-btn">Logout</button>
        </div>
      </div>
    `;

    document.body.appendChild(logoutModal);

    logoutConfirmButton = logoutModal.querySelector('.logout-confirm-btn');
    logoutCancelButton = logoutModal.querySelector('.logout-cancel-btn');

    if (logoutCancelButton) {
      logoutCancelButton.addEventListener('click', () => {
        closeLogoutModal();
      });
    }

    logoutModal.addEventListener('click', (event) => {
      if (event.target === logoutModal) {
        closeLogoutModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLogoutModal();
      }
    });

    if (logoutConfirmButton) {
      logoutConfirmButton.addEventListener('click', async () => {
        if (typeof activeLogoutHandler === 'function') {
          await activeLogoutHandler();
        }
      });
    }

    return logoutModal;
  }

  function openLogoutModal(onConfirm) {
    const modal = ensureLogoutModal();
    activeLogoutHandler = onConfirm;

    if (logoutConfirmButton) {
      logoutConfirmButton.disabled = false;
      logoutConfirmButton.textContent = 'Logout';
    }

    if (logoutCancelButton) {
      logoutCancelButton.disabled = false;
    }

    modal.classList.add('show');
  }

  function closeLogoutModal(force = false) {
    if (!logoutModal) {
      return;
    }

    logoutModal.classList.remove('show');
    activeLogoutHandler = null;

    const resetControls = () => {
      if (logoutConfirmButton) {
        logoutConfirmButton.disabled = false;
        logoutConfirmButton.textContent = 'Logout';
      }
      if (logoutCancelButton) {
        logoutCancelButton.disabled = false;
      }
    };

    if (force) {
      resetControls();
    } else {
      setTimeout(resetControls, 300);
    }
  }

  async function performLogout() {
    if (logoutConfirmButton) {
      logoutConfirmButton.disabled = true;
      logoutConfirmButton.textContent = 'Logging out...';
    }

    if (logoutCancelButton) {
      logoutCancelButton.disabled = true;
    }

    try {
      await fetch(logoutEndpoint, { 
        method: 'POST',
        credentials: 'include'
      });
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      closeLogoutModal(true);

      const currentPage = window.location.pathname.split('/').pop() || 'home.html';
      window.location.href = `auth.html?redirect=${currentPage}`;
    }
  }

  function toggleAuthVisibility(isLoggedIn) {
    const targetState = isLoggedIn ? 'logged-in' : 'logged-out';
    document.body.dataset.authState = targetState;
    document.querySelectorAll('[data-auth-visible]').forEach((element) => {
      const shouldShow = element.getAttribute('data-auth-visible') === targetState;
      element.hidden = !shouldShow;
      element.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    });
  }

  function updateGreeting(name) {
    const greeting = name ? `Hi, ${name}` : '';
    document.querySelectorAll('[data-auth-content="username"]').forEach((element) => {
      element.textContent = greeting;
    });
  }

  function attachLogoutHandler(button) {
    if (!button || button.dataset.logoutAttached === 'true') {
      return;
    }

    button.dataset.logoutAttached = 'true';

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLogoutModal(performLogout);
    });
  }

  function updateUIForLoggedIn(user) {
    console.log('🔐 UI: LOGGED IN -', user?.full_name || user?.email);

    const fullName = user?.full_name || user?.fullName || user?.username || '';
    const firstName = (fullName || user?.email || '').trim().split(' ')[0];
    toggleAuthVisibility(true);
    updateGreeting(firstName);

    document.querySelectorAll('[data-action="logout"]').forEach((button) => {
      attachLogoutHandler(button);
    });
  }

  function updateUIForLoggedOut() {
    console.log('🔓 UI: LOGGED OUT');

    toggleAuthVisibility(false);
    updateGreeting('');
  }

  // Main initialization
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 GameNest Session Manager Starting...');

    const cachedUser = getCachedUser();
    const hasClientLogin = cachedUser && sessionStorage.getItem('isLoggedIn') === 'true';

    if (hasClientLogin) {
      window.GameNestCachedUser = cachedUser;
      updateUIForLoggedIn({
        full_name: cachedUser.fullName,
        email: cachedUser.email
      });
    }
    
    // Fetch current session from server
    const sessionData = await fetchSessionState();
    
    // Store globally
    window.GameNestSession = sessionData;
    
    // Update UI based on authentication state
    if (sessionData?.authenticated && sessionData?.user) {
      // User is logged in
      localStorage.setItem('currentUser', JSON.stringify(sessionData.user));
      sessionStorage.setItem('isLoggedIn', 'true');
      updateUIForLoggedIn(sessionData.user);
    } else {
      if (hasClientLogin) {
        console.warn('GameNest Session: server session missing, retaining cached login UI.');
      } else {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('isLoggedIn');
        updateUIForLoggedOut();
      }
    }
    
    // Dispatch session event
    document.dispatchEvent(new CustomEvent('gamenest:session', {
      detail: { session: sessionData }
    }));
    
    console.log('✅ Session Manager Ready');
  });
})();
