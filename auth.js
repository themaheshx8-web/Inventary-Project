/**
 * Supabase Authentication Handler
 */

// Global utility to render Toast alerts
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Check session on load
async function checkAuthSession(isLoginPage = false) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && !isLoginPage) {
    window.location.href = 'index.html';
  } else if (session && isLoginPage) {
    window.location.href = 'dashboard.html';
  }

  return session;
}

// Handle Login Form Submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
  checkAuthSession(true);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const submitBtn = document.getElementById('login-btn');

    try {
      submitBtn.disabled = true;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      showToast('Logged in successfully!');
      window.location.href = 'dashboard.html';
    } catch (err) {
      showToast(err.message || 'Failed to authenticate', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Logout Action
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
}
