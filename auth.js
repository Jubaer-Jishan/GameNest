document.addEventListener("DOMContentLoaded", () => {
  // ===== ELEMENT REFERENCES =====
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const rememberCheckbox = document.getElementById('rememberMe');

  const loginEmailInput = loginForm.querySelector('#loginEmail');
  const loginPasswordInput = loginForm.querySelector('#loginPassword');

  const signupNameInput = signupForm.querySelector('#fullName');
  const signupEmailInput = signupForm.querySelector('#signupEmail');
  const signupPasswordInput = signupForm.querySelector('#signupPassword');
  const signupConfirmPasswordInput = signupForm.querySelector('#signupConfirmPassword');
  const termsCheckbox = signupForm.querySelector('#terms');

  // ===== TAB SWITCH =====
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // ===== ERROR HELPERS =====
  function showError(input, message) {
    let error = input.parentElement.querySelector('.error-message');
    if (!error) {
      error = document.createElement('div');
      error.className = 'error-message';
      input.parentElement.appendChild(error);
    }
    error.textContent = message;
    input.classList.add('error');
  }

  function clearError(input) {
    const error = input.parentElement.querySelector('.error-message');
    if (error) error.textContent = '';
    input.classList.remove('error');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isStrongPassword(pass) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pass);
  }

  // ===== SUCCESS POPUP =====
  let redirectTimeout;
  function showSuccessPopup(message, redirectUrl) {
    let modal = document.querySelector('.login-success-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'login-success-modal';
      modal.innerHTML = `
        <div class="login-success-card">
          <div class="login-success-icon">✅</div>
          <h3>Login successful</h3>
          <p class="login-success-message"></p>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const messageEl = modal.querySelector('.login-success-message');
    if (messageEl) {
      messageEl.textContent = message;
    }

    modal.classList.add('show');

    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    redirectTimeout = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);
  }

  // ===== CUSTOM ALERT =====
  const ALERT_VISIBLE_CLASS = 'gamenest-alert-visible';
  let alertHideTimeout;

  function getOrCreateAlert() {
    let overlay = document.querySelector('.gamenest-alert-overlay');
    if (overlay) {
      return overlay;
    }

    overlay = document.createElement('div');
    overlay.className = 'gamenest-alert-overlay';
    overlay.innerHTML = `
      <div class="gamenest-alert-card" role="alertdialog" aria-modal="true" aria-labelledby="gamenest-alert-title" aria-describedby="gamenest-alert-message">
        <div class="gamenest-alert-header">
          <h3 id="gamenest-alert-title">GameNest says</h3>
          <button type="button" class="gamenest-alert-close" aria-label="Close alert">×</button>
        </div>
        <p id="gamenest-alert-message"></p>
        <div class="gamenest-alert-actions">
          <button type="button" class="gamenest-alert-ok">Okay</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

  const card = overlay.querySelector('.gamenest-alert-card');
  const closeButton = overlay.querySelector('.gamenest-alert-close');
  const okButton = overlay.querySelector('.gamenest-alert-ok');

  card?.setAttribute('tabindex', '-1');

    const closeHandler = () => closeGameNestAlert();
    closeButton.addEventListener('click', closeHandler);
    okButton.addEventListener('click', closeHandler);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeHandler();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeGameNestAlert();
      }
    });

    return overlay;
  }

  function closeGameNestAlert() {
    const overlay = document.querySelector('.gamenest-alert-overlay');
    if (overlay) {
      overlay.classList.remove(ALERT_VISIBLE_CLASS);
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (alertHideTimeout) {
      clearTimeout(alertHideTimeout);
      alertHideTimeout = undefined;
    }
  }

  function showGameNestAlert(message, { autoClose = false, duration = 3000, title = 'GameNest says' } = {}) {
    const overlay = getOrCreateAlert();
  const card = overlay.querySelector('.gamenest-alert-card');
    const messageEl = overlay.querySelector('#gamenest-alert-message');
    const titleEl = overlay.querySelector('#gamenest-alert-title');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    overlay.classList.add(ALERT_VISIBLE_CLASS);
    overlay.removeAttribute('aria-hidden');

    card.focus?.();

    if (alertHideTimeout) {
      clearTimeout(alertHideTimeout);
    }

    if (autoClose) {
      alertHideTimeout = setTimeout(() => {
        closeGameNestAlert();
      }, duration);
    }
  }

  // ===== REMEMBER ME =====
  async function updateRememberMe(email, remember, password = '') {
    if (!rememberCheckbox) return;

    try {
      const response = await fetch('http://localhost/GameNest/GameNest/set_cookie.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: remember ? email : '', remember, password: remember ? password : '' }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to update remember me preference');
      }
      // if server reports success but browser didn't apply cookie (common when
      // Set-Cookie is blocked), persist to localStorage as a fallback so
      // autofill still works.
      if (remember) {
        const cookieVal = getCookie('rememberMe');
        if (!cookieVal) {
          try {
            localStorage.setItem('rememberMe', JSON.stringify({ email, password }));
            console.debug('rememberMe saved to localStorage as fallback');
          } catch (e) {
            console.warn('Failed to save rememberMe to localStorage', e);
          }
        } else {
          // ensure no stale localStorage
          localStorage.removeItem('rememberMe');
        }
      } else {
        localStorage.removeItem('rememberMe');
      }
    } catch (error) {
      console.error('Remember me error:', error);
    }
  }

  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const idx = cookie.indexOf('=');
      if (idx === -1) continue;
      const key = cookie.slice(0, idx).trim();
      const value = cookie.slice(idx + 1);
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  function prefillRememberedUser() {
    if (!rememberCheckbox || !loginEmailInput) return;

    const rememberMeCookie = getCookie('rememberMe');
    let userData = null;
    if (rememberMeCookie) {
      try {
        userData = JSON.parse(rememberMeCookie);
      } catch (error) {
        console.error('Failed to parse remember me cookie:', error);
      }
    }

    // fallback to localStorage if cookie isn't available
    if (!userData) {
      try {
        const stored = localStorage.getItem('rememberMe');
        if (stored) userData = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to read rememberMe from localStorage:', e);
      }
    }

    if (userData?.email) {
      loginEmailInput.value = userData.email;
      rememberCheckbox.checked = true;
      if (userData?.password && loginPasswordInput) {
        loginPasswordInput.value = userData.password;
      }
    }
  }

  if (rememberCheckbox) {
    rememberCheckbox.addEventListener('change', () => {
      if (!rememberCheckbox.checked) {
        updateRememberMe('', false);
      }
    });
  }

  prefillRememberedUser();

  // ===== LOGIN SUBMIT =====
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!isValidEmail(email)) {
      showError(loginEmailInput, 'Enter a valid email address');
      valid = false;
    } else {
      clearError(loginEmailInput);
    }

    if (!password) {
      showError(loginPasswordInput, 'Password is required');
      valid = false;
    } else {
      clearError(loginPasswordInput);
    }

    if (!valid) return;

    const loginData = new FormData();
    loginData.append('email', email);
    loginData.append('password', password);

    try {
      const response = await fetch('http://localhost/GameNest/GameNest/login.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: loginData
      });


      const result = await response.json();

      if (response.ok && result.success) {
        const rememberSelected = rememberCheckbox ? rememberCheckbox.checked : false;

        // Save user data to localStorage for profile page
        if (result.user) {
          localStorage.setItem('currentUser', JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            fullName: result.user.full_name,
            loginTime: new Date().toISOString()
          }));
        }

        if (rememberCheckbox) {
          await updateRememberMe(email, rememberSelected, password);
        }

        loginForm.reset();
        if (rememberCheckbox) {
          rememberCheckbox.checked = rememberSelected;
        }

        clearError(loginEmailInput);
        clearError(loginPasswordInput);

        showSuccessPopup('You will be redirected to your profile.', 'profile.html');
      } else {
        showGameNestAlert(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      showGameNestAlert('An error occurred. Please try again later.');
    }
  });

  // ===== SIGNUP SUBMIT =====
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = signupNameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();
    const confirmPassword = signupConfirmPasswordInput.value.trim();

    if (fullName.length < 2) {
      showGameNestAlert('Enter your full name');
      return;
    }

    if (!isValidEmail(email)) {
      showGameNestAlert('Enter a valid email address');
      return;
    }

    if (password.length < 8) {
      showGameNestAlert('Password must be at least 8 characters');
      return;
    }

    if (!isStrongPassword(password)) {
      showGameNestAlert('Password must have A-Z, a-z, 0-9 and a special character');
      return;
    }

    if (password !== confirmPassword) {
      showGameNestAlert('Passwords do not match');
      return;
    }

    if (!termsCheckbox.checked) {
      showGameNestAlert('You must agree to the Terms & Privacy Policy');
      return;
    }

    const formData = new FormData(signupForm);
    const submitButton = signupForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = 'Creating account...';
    }

    try {
      const response = await fetch('http://localhost/GameNest/GameNest/signUp.php', {
        method: 'POST',
        body: formData
      });


      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse signup response:', parseError);
        data = null;
      }

      if (response.ok && data?.success) {
        showGameNestAlert(data.message || 'Registration successful! You can now log in.', {
          autoClose: true,
          duration: 2500,
        });

        signupForm.reset();
        termsCheckbox.checked = false;

        if (loginTab && signupTab) {
          loginTab.click();
        }
      } else {
        const message = data?.message || 'Registration failed. Please try again.';
        showGameNestAlert(message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showGameNestAlert('Network error. Please try again.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalText || 'Create Account';
        delete submitButton.dataset.originalText;
      }
    }
  });

  // ===== PASSWORD SHOW/HIDE =====
  document.querySelectorAll("input[type='password']").forEach((input) => {
    const toggle = document.createElement('span');
    toggle.innerHTML = `
      <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5
             c4.477 0 8.268 2.943 9.542 7
             -1.274 4.057-5.065 7-9.542 7
             -4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    `;

    toggle.style.position = 'absolute';
    toggle.style.right = '12px';
    toggle.style.top = '70%';
    toggle.style.transform = 'translateY(-50%)';
    toggle.style.cursor = 'pointer';
    toggle.style.display = 'flex';
    toggle.style.alignItems = 'center';
    toggle.style.color = '#94a3b8';

    toggle.querySelector('svg').setAttribute('stroke', 'currentColor');

    const wrapper = input.parentElement;
    wrapper.style.position = 'relative';
    wrapper.appendChild(toggle);

    let isVisible = false;
    toggle.addEventListener('click', () => {
      isVisible = !isVisible;
      input.type = isVisible ? 'text' : 'password';

      if (isVisible) {
        toggle.innerHTML = `
          <svg class="eye-slash" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19
                 c-4.477 0-8.268-2.943-9.542-7
                 a10.056 10.056 0 012.642-4.362m3.746-2.248
                 A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7
                 a9.96 9.96 0 01-4.043 5.411M15 12a3 3 0 11-6 0
                 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3l18 18" />
          </svg>
        `;
      } else {
        toggle.innerHTML = `
          <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5
                 c4.477 0 8.268 2.943 9.542 7
                 -1.274 4.057-5.065 7-9.542 7
                 -4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        `;
      }
    });
  });

  // ===== STRONG PASSWORD POPUP =====
  const passwordWrapper = signupPasswordInput.parentElement;
  passwordWrapper.style.position = 'relative';

  const popup = document.createElement('div');
  popup.className = 'password-popup';
  popup.style.display = 'none';
  passwordWrapper.appendChild(popup);

  let suggestedPass = '';

  function generateStrongPassword() {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = upper + lower + numbers + symbols;

    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 0; i < 4; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  signupPasswordInput.addEventListener('focus', () => {
    if (!signupPasswordInput.value) {
      suggestedPass = generateStrongPassword();
      popup.innerHTML = `
        Suggested strong password: <strong>${suggestedPass}</strong>
        <button type="button" id="usePasswordBtn" style="margin-left:5px;padding:2px 5px;">Use</button>
      `;
      popup.style.display = 'block';

      const useBtn = popup.querySelector('#usePasswordBtn');
      useBtn.addEventListener('click', () => {
        signupPasswordInput.value = suggestedPass;
        clearError(signupPasswordInput);
        popup.style.display = 'none';
      });
    }
  });

  signupPasswordInput.addEventListener('input', () => {
    if (signupPasswordInput.value !== suggestedPass) popup.style.display = 'none';
  });

  signupPasswordInput.addEventListener('blur', () => {
    setTimeout(() => {
      if (!popup.matches(':hover')) popup.style.display = 'none';
    }, 100);
  });
});
