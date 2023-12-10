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