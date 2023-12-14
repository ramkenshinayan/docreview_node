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
	fetch('/login', { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			if (data.type == 'invalid') {
				console.log(data.message + "client")
				alert(data.message);
			} else if (data.type == 'logged') {
				alert(data.message);
			} else {
				alert(data.message);
			}
		});
}