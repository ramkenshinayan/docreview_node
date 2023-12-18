const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const loginButton = document.querySelector('.cta-button');
const closeButton = document.querySelector('.icon-close');
const submitLogin = document.getElementById('submit');

loginButton.addEventListener('click', () => {
	wrapper.classList.add('active-popup');
});

closeButton.addEventListener('click', () => {
	wrapper.classList.remove('active-popup');
});

function loginResult() {
	fetch('/loginresult')
		.then(res => res.text())
		.then(data => {
			result = data;
			if (result == 'invalid') {
				alert('Invalid email or password');
			} else if (result == 'logged') {
				alert('User is already logged in.')
			} else {
				alert('Login successful')
			}
		})
}