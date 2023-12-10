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

function login() {
	fetch('/loginresult')
		.then(res => res.text())
		.then(data => {
			if (data.text = 'logged') {
				alert('User is already logged in.');
				window.location.href = '/';
			} else if (data.text = 'invalid') {
				alert('Invalid email or password.');
				window.location.href = '/';
			}
		});
}

// function redirect() {
// 	fetch('/')
// 		.then(res => res.text())
// 		.then(data => {
// 			console.log('Redirecting to index...')
// 		});
// };