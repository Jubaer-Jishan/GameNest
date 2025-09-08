document.addEventListener("DOMContentLoaded", () => {
    // ===== TAB SWITCH =====
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
  
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
  
    // ===== ERROR FUNCTIONS =====
    function showError(input, message) {
      let error = input.parentElement.querySelector(".error-message");
      if (!error) {
        error = document.createElement("div");
        error.className = "error-message";
        error.style.color = "red";
        input.parentElement.appendChild(error);
      }
      error.textContent = message;
      input.classList.add("error");
    }
  
    function clearError(input) {
      const error = input.parentElement.querySelector(".error-message");
      if (error) error.textContent = "";
      input.classList.remove("error");
    }
  
    // ===== EMAIL & PASSWORD CHECK =====
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  
    function isStrongPassword(pass) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pass);
    }
  
    // ===== LOGIN VALIDATION =====
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
  
      const emailInput = loginForm.querySelector("input[type='email']");
      const passInput = loginForm.querySelector("input[type='password']");
  
      if (!isValidEmail(emailInput.value.trim())) {
        showError(emailInput, "Enter a valid email address");
        valid = false;
      } else clearError(emailInput);
  
      if (!isStrongPassword(passInput.value.trim())) {
        showError(passInput, "Password must be 8+ chars, include upper, lower, number & symbol");
        toggle.style.top = "40%";
        valid = false;
      } else clearError(passInput);
  
      if (valid) {
        alert("Login successful ✅");
        loginForm.reset();
      }
    });
  
    // ===== SIGNUP VALIDATION =====
    const nameInput = signupForm.querySelector("#fullName");
    const emailInput = signupForm.querySelector("#email");
    const passInput = signupForm.querySelector("#password");
    const confirmPassInput = signupForm.querySelector("#confirmPassword");
    const termsCheckbox = signupForm.querySelector("#terms");
  
    // ===== PASSWORD POPUP =====
    const wrapperPass = passInput.parentElement;
    wrapperPass.style.position = "relative";
  
    const popup = document.createElement("div");
    popup.className = "password-popup";
    popup.style.position = "absolute";
    popup.style.top = "100%";
    popup.style.left = "0";
    popup.style.background = "#f3f4f6";
    popup.style.border = "1px solid rgba(0,0,0,0.2)";
    popup.style.padding = "8px";
    popup.style.borderRadius = "5px";
    popup.style.display = "none";
    popup.style.zIndex = "100";
    popup.style.color = "#0f172a";
    wrapperPass.appendChild(popup);
  
    let suggestedPass = "";
  
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
  
      // Name
      if (nameInput.value.trim().length < 2) {
        showError(nameInput, "Enter your full name");
        valid = false;
      } else clearError(nameInput);
  
      // Email
      if (!isValidEmail(emailInput.value.trim())) {
        showError(emailInput, "Enter a valid email address");
        valid = false;
      } else clearError(emailInput);
  
      // Password
      if (!isStrongPassword(passInput.value.trim())) {
        showError(passInput, "Password must be 8+ chars, include upper, lower, number & symbol");
        const toggleNow = passInput.parentElement.querySelector("span");
            toggleNow.style.top = "40%";          
        valid = false;
      } else clearError(passInput);
  
      // Confirm password
      if (confirmPassInput.value.trim() === "") {
        showError(confirmPassInput, "Please confirm your password");
        valid = false;
      } else if (confirmPassInput.value.trim() !== passInput.value.trim()) {
        showError(confirmPassInput, "Passwords do not match");
        valid = false;
      } else clearError(confirmPassInput);
  
      // Terms checkbox
      const termsErrorDiv = termsCheckbox.parentElement.querySelector(".error-message");
      if (!termsCheckbox.checked) {
        if (!termsErrorDiv) {
          const div = document.createElement("div");
          div.className = "error-message";
          div.style.color = "red";
          div.textContent = "You must agree to the Terms & Privacy Policy ❗";
          termsCheckbox.parentElement.appendChild(div);
        }
        valid = false;
      } else if (termsErrorDiv) {
        termsErrorDiv.remove();
      }
  
      if (valid) {
        alert("Account created successfully 🎉");
        signupForm.reset();
        popup.style.display = "none";
      }
    });
  
    // ===== PASSWORD SHOW/HIDE =====
    document.querySelectorAll("input[type='password']").forEach(input => {
      const toggle = document.createElement("span");
      toggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7
               -1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      `;
      toggle.style.position = "absolute";
      toggle.style.right = "12px";
      toggle.style.top = "70%";
      toggle.style.transform = "translateY(-50%)";
      toggle.style.cursor = "pointer";
      toggle.style.display = "flex";
      toggle.style.alignItems = "center";
      toggle.style.color = "#94a3b8";
  
      const wrapper = input.parentElement;
      wrapper.style.position = "relative";
      wrapper.appendChild(toggle);
  
      let isVisible = false;
      toggle.addEventListener("click", () => {
        isVisible = !isVisible;
        input.type = isVisible ? "text" : "password";
      });
    });
  
    // ===== STRONG PASSWORD POPUP =====
    passInput.addEventListener("focus", () => {
      if (!passInput.value) {
        suggestedPass = generateStrongPassword();
        popup.innerHTML = `
          Suggested strong password: <strong>${suggestedPass}</strong>
          <button id="usePasswordBtn" style="margin-left:5px;padding:2px 5px;">Use</button>
        `;
        popup.style.display = "block";
  
        const useBtn = popup.querySelector("#usePasswordBtn");
        useBtn.addEventListener("click", () => {
          passInput.value = suggestedPass;
          clearError(passInput);
          popup.style.display = "none";
        });
      }
    });
  
    passInput.addEventListener("input", () => {
      if (passInput.value !== suggestedPass) popup.style.display = "none";
    });
  
    passInput.addEventListener("blur", () => {
      setTimeout(() => {
        if (!popup.matches(":hover")) popup.style.display = "none";
      }, 100);
    });
  
    // ===== STRONG PASSWORD GENERATOR =====
    function generateStrongPassword() {
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const all = upper + lower + numbers + symbols;
  
      let password = "";
      password += upper[Math.floor(Math.random() * upper.length)];
      password += lower[Math.floor(Math.random() * lower.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];
  
      for (let i = 0; i < 4; i++) {
        password += all[Math.floor(Math.random() * all.length)];
      }
  
      return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
  });
  