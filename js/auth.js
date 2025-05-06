// Handle registration form submission
document.getElementById('registrationForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate passwords match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Show OTP verification (in a real app, you would send OTP to email/phone)
    window.location.href = 'otp-verification.html';
});

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get user type (business or customer) - in a real app, this would come from backend
    const loginId = document.getElementById('loginId').value;
    const isBusiness = loginId.includes('business'); // Simple mock check
    
    if (isBusiness) {
        window.location.href = '../business/dashboard.html';
    } else {
        window.location.href = '../user/dashboard.html';
    }
});

// Show/hide business type field based on user selection
document.querySelectorAll('input[name="userType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const businessFields = document.getElementById('businessFields');
        if (this.value === 'business') {
            businessFields.classList.remove('d-none');
            document.getElementById('businessType').required = true;
        } else {
            businessFields.classList.add('d-none');
            document.getElementById('businessType').required = false;
        }
    });
});