fetch('/userDetails')
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + ' ' + data.lastName;
		document.getElementById('welcome').innerHTML = 'Welcome Back, ' + data.firstName + ' ' + data.lastName + ' !';
		console.log('Fetched user details...');
	});

fetch('/total')
	.then(res => res.text())
	.then(data => {
		document.getElementById('total').innerHTML = data;
		console.log('Fetched total documents...');
	});

fetch('/toreview')
	.then(res => res.text())
	.then(data => {
		document.getElementById('toreview').innerHTML = data;
		console.log('Fetched to-review documents...');
	});

fetch('/overdue')
	.then(res => res.text())
	.then(data => {
		document.getElementById('overdue').innerHTML = data;
		console.log('Fetched overdue documents...');
	});
