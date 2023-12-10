fetch('/userDetails')
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + ' ' + data.lastName;
		document.getElementById('welcome').innerHTML = 'Welcome Back, ' + data.firstName + ' !';
	});

fetch('/total')
	.then(res => res.text())
	.then(data => {
		document.getElementById('total').innerHTML = data;
	});

// fetch('/toreview')
// 	.then(res => res.text())
// 	.then(data => {
// 		document.getElementById('toreview').innerHTML = data;
// 	});

// fetch('/overdue')
// 	.then(res => res.text())
// 	.then(data => {
// 		document.getElementById('overdue').innerHTML = data;
// 	});