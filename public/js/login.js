(function () {
	'use strict';
  
	// Fetch the form
	const form = document.querySelector('.needs-validation');
  
	// Function to validate email format
	function validateEmail(email) {
	  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	  return re.test(String(email).toLowerCase());
	}
  
	// Function to validate password length
	function validatePassword(password) {
	  return password.length >= 6;
	}
  
	// Function to validate phone number
	function validatePhone(phone) {
		const re = /^\d{10}$/; // Matches exactly 10 digits
		return re.test(phone);
	  }
  
	// Add event listener to form submission
	form.addEventListener('submit', (event) => {
	  const emailInput = document.getElementById('email');
	  const passwordInput = document.getElementById('password');   
  
	  const phoneInput = document.getElementById('phone');   
  
  
	  // Check email validity
	  if (!validateEmail(emailInput.value)) {
		emailInput.setCustomValidity('Invalid email format');
		event.preventDefault();
		event.stopPropagation();
	  } else {
		emailInput.setCustomValidity('');
	  }
  
	  // Check password validity
	  if (!validatePassword(passwordInput.value)) {
		passwordInput.setCustomValidity('Password must be at least 6 characters long');
		event.preventDefault();
		event.stopPropagation();
	  } else {
		passwordInput.setCustomValidity('');
	  }
  
	  // Check phone number validity (adjust the validation function if needed)
	  if (!validatePhone(phoneInput.value)) {
		phoneInput.setCustomValidity('Invalid phone number format');
		event.preventDefault();
		event.stopPropagation();
	  } else {
		phoneInput.setCustomValidity('');
	  }
  
	  form.classList.add('was-validated');
	});
  })();