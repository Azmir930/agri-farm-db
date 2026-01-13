/**
 * Agriculture Product Marketplace
 * Authentication Functions
 */

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize auth forms
  initLoginForm();
  initRegisterForm();
  initForgotPasswordForm();
  initResetPasswordForm();
  
  // Check protected pages
  checkAuth();
  
  // Update UI based on auth state
  updateAuthUI();
});

// ============================================
// LOGIN FORM
// ============================================
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    // Validation
    if (!validateEmail(email)) {
      showAlert('Please enter a valid email address', 'danger');
      return;
    }
    
    if (!password) {
      showAlert('Please enter your password', 'danger');
      return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
    submitBtn.disabled = true;
    
    try {
      const response = await AuthAPI.login(email, password);
      
      if (response.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        
        showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect based on role
        setTimeout(() => {
          const user = response.user;
          redirectToDashboard(user.role);
        }, 1000);
      }
    } catch (error) {
      showAlert(error.message || 'Invalid email or password', 'danger');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
  
  // Auto-fill remembered email
  const rememberedEmail = localStorage.getItem('remembered_email');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }
}

// ============================================
// REGISTRATION FORM
// ============================================
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  // Password strength indicator
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      updatePasswordStrength(this.value);
    });
  }
  
  // Password visibility toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.closest('.input-group').querySelector('input');
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye', 'bi-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('bi-eye-slash', 'bi-eye');
      }
    });
  });
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Collect form data
    const userData = {
      first_name: document.getElementById('firstName').value.trim(),
      last_name: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      password: document.getElementById('password').value,
      confirm_password: document.getElementById('confirmPassword').value,
      role: document.querySelector('input[name="role"]:checked')?.value || 'buyer'
    };
    
    // Validation
    const errors = validateRegistration(userData);
    if (errors.length > 0) {
      showAlert(errors.join('<br>'), 'danger');
      return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating account...';
    submitBtn.disabled = true;
    
    try {
      const response = await AuthAPI.register(userData);
      
      if (response.success) {
        showAlert('Account created successfully! Redirecting to login...', 'success');
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }
    } catch (error) {
      showAlert(error.message || 'Registration failed. Please try again.', 'danger');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ============================================
// FORGOT PASSWORD FORM
// ============================================
function initForgotPasswordForm() {
  const form = document.getElementById('forgotPasswordForm');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    if (!validateEmail(email)) {
      showAlert('Please enter a valid email address', 'danger');
      return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
    submitBtn.disabled = true;
    
    try {
      const response = await AuthAPI.forgotPassword(email);
      
      // Always show success to prevent email enumeration
      document.getElementById('forgotPasswordForm').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
    } catch (error) {
      // Still show success to prevent email enumeration
      document.getElementById('forgotPasswordForm').style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ============================================
// RESET PASSWORD FORM
// ============================================
function initResetPasswordForm() {
  const form = document.getElementById('resetPasswordForm');
  if (!form) return;
  
  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (!token) {
    showAlert('Invalid or missing reset token', 'danger');
    form.style.display = 'none';
    return;
  }
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password.length < 8) {
      showAlert('Password must be at least 8 characters', 'danger');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'danger');
      return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Resetting...';
    submitBtn.disabled = true;
    
    try {
      const response = await AuthAPI.resetPassword(token, password);
      
      if (response.success) {
        showAlert('Password reset successful! Redirecting to login...', 'success');
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }
    } catch (error) {
      showAlert(error.message || 'Password reset failed. Please try again.', 'danger');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ============================================
// VALIDATION HELPERS
// ============================================
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, ''));
}

function validateRegistration(data) {
  const errors = [];
  
  if (!data.first_name || data.first_name.length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  
  if (!data.last_name || data.last_name.length < 2) {
    errors.push('Last name must be at least 2 characters');
  }
  
  if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!validatePhone(data.phone)) {
    errors.push('Please enter a valid 10-digit phone number');
  }
  
  if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(data.password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(data.password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(data.password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (data.password !== data.confirm_password) {
    errors.push('Passwords do not match');
  }
  
  return errors;
}

// ============================================
// PASSWORD STRENGTH
// ============================================
function updatePasswordStrength(password) {
  const strengthBar = document.getElementById('passwordStrength');
  const strengthText = document.getElementById('passwordStrengthText');
  
  if (!strengthBar || !strengthText) return;
  
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  
  strengthBar.style.width = strength + '%';
  
  if (strength < 25) {
    strengthBar.className = 'progress-bar bg-danger';
    strengthText.textContent = 'Weak';
    strengthText.className = 'text-danger';
  } else if (strength < 50) {
    strengthBar.className = 'progress-bar bg-warning';
    strengthText.textContent = 'Fair';
    strengthText.className = 'text-warning';
  } else if (strength < 75) {
    strengthBar.className = 'progress-bar bg-info';
    strengthText.textContent = 'Good';
    strengthText.className = 'text-info';
  } else {
    strengthBar.className = 'progress-bar bg-success';
    strengthText.textContent = 'Strong';
    strengthText.className = 'text-success';
  }
}

// ============================================
// AUTH CHECKS & REDIRECTS
// ============================================
function checkAuth() {
  const protectedPages = [
    '/buyer/',
    '/farmer/',
    '/admin/',
    '/common/profile.html'
  ];
  
  const currentPath = window.location.pathname;
  const isProtected = protectedPages.some(page => currentPath.includes(page));
  
  if (isProtected && !AuthAPI.isLoggedIn()) {
    window.location.href = '/common/login.html?redirect=' + encodeURIComponent(currentPath);
    return;
  }
  
  // Check role-based access
  if (AuthAPI.isLoggedIn()) {
    const user = AuthAPI.getUser();
    
    if (currentPath.includes('/farmer/') && user.role !== 'farmer') {
      redirectToDashboard(user.role);
    } else if (currentPath.includes('/admin/') && user.role !== 'admin') {
      redirectToDashboard(user.role);
    } else if (currentPath.includes('/buyer/') && user.role !== 'buyer') {
      redirectToDashboard(user.role);
    }
  }
}

function redirectToDashboard(role) {
  switch (role) {
    case 'admin':
      window.location.href = '/admin/dashboard.html';
      break;
    case 'farmer':
      window.location.href = '/farmer/dashboard.html';
      break;
    case 'buyer':
    default:
      window.location.href = '/buyer/dashboard.html';
      break;
  }
}

// ============================================
// UPDATE AUTH UI
// ============================================
function updateAuthUI() {
  const user = AuthAPI.getUser();
  
  // Update user name in navbar
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => {
    if (user) {
      el.textContent = `${user.first_name} ${user.last_name}`;
    }
  });
  
  // Update user avatar
  const avatarElements = document.querySelectorAll('.user-avatar');
  avatarElements.forEach(el => {
    if (user && user.avatar) {
      el.src = user.avatar;
    }
  });
  
  // Show/hide login/logout buttons
  if (AuthAPI.isLoggedIn()) {
    document.querySelectorAll('.auth-logged-in').forEach(el => el.style.display = '');
    document.querySelectorAll('.auth-logged-out').forEach(el => el.style.display = 'none');
  } else {
    document.querySelectorAll('.auth-logged-in').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.auth-logged-out').forEach(el => el.style.display = '');
  }
}

// ============================================
// LOGOUT
// ============================================
async function logout() {
  await AuthAPI.logout();
}
