export function showLoading() {
    document.getElementById('loading-spinner').style.display = 'flex';
  }
  
  export function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
  }
  
  export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
  
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  
  export function validateForm(data) {
    const errors = [];
    Object.entries(data).forEach(([key, value]) => {
      if (!value || value.trim() === '') errors.push(`${key} wajib diisi`);
    });
    return errors;
  }
  
  export function showFormErrors(errors) {
    errors.forEach(err => showToast(err, 'error'));
  }