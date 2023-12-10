fetch('/userDetails')
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + " " + data.lastName;
	});

// sample data
const documentData = {
	name: 'Document Name',
	id: 'Document ID'
  };
  
  const container = document.getElementById('approvals');
  
  for(var i = 0; i<documentData.length; i++){
	const radioInput = document.createElement('input');
	radioInput.setAttribute('type', 'radio');
	radioInput.setAttribute('id', 'radioButton' + i);
	radioInput.setAttribute('name', 'radioGroup');
	
	const labelElement = document.createElement('label');
	labelElement.setAttribute('for', 'radioButton' + i);
	
	const labelText = document.createElement('div');
	labelText.textContent = `${documentData.name}\n${documentData.id}`;
	
	labelElement.appendChild(labelText);
	
	container.appendChild(radioInput);
	container.appendChild(labelElement);
 }
  