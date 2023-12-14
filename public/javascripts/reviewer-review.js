const docList = document.getElementById('approvals');
const viewer = document.getElementById('viewer');
const container = document.getElementById('approvals');
var userEmail = '';
var docId = 7;
var docBlob = '';
var docName = '';
var docType = 'pdf';

fetch('/userDetails',  {method: 'POST'})
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + " " + data.lastName;
		userEmail = data.email;
	});

// TODO
fetch('/forapproval', {method: 'POST'})
	.then(res => res.json())
	.then(data => {
		for (let i = 0; i < data.length; i++) {
			const radioInput = document.createElement('input');
			radioInput.setAttribute('type', 'radio');
			radioInput.setAttribute('id', 'radioButton' + i);
			radioInput.setAttribute('name', 'radioGroup');

			const labelElement = document.createElement('label');
			labelElement.setAttribute('for', 'radioButton' + i);

			const labelText = document.createElement('div');
			labelText.appendChild(document.createTextNode(data[i].fileName));
			labelText.appendChild(document.createElement('br'));
			labelText.appendChild(document.createTextNode(data[i].documentId));

			labelElement.appendChild(labelText);

			container.appendChild(radioInput);
			container.appendChild(labelElement);
		}
	});


function checkRadio() {
	container.addEventListener('change', function (event) {
		const selectedRadioButton = event.target;
		if (selectedRadioButton.type === 'radio' && selectedRadioButton.checked) {
			const labelContent = document.querySelector(`label[for="${selectedRadioButton.id}"]`).innerText;
			
			const documentName = labelContent.split('\n')[0].trim();

			let queryString = `${encodeURIComponent(documentName)}&`;
			history.pushState({}, null, `?${queryString}`);
		}
	});
}

document.addEventListener("DOMContentLoaded", function () {
	checkRadio();
});


fetch(`/blobdoc/${docId}`, {method: 'POST'})
	.then(res => res.blob())
	.then(data => {
		console.log(data)
		docBlob = data;
	})

WebViewer({
	path: '../lib'
}, viewer)
	.then(instance => {
		var annotManager = instance.docViewer.getAnnotationManager();
		// Load the document blob
		if (docType == 'docx') {
			instance.loadDocument(docBlob, {
				filename: docName,
				extension: 'docx'
			});
		} else if (docType == 'pdf') {
			instance.loadDocument(docBlob, {
				filename: docName,
				extension: 'pdf'
			});
		}

		// Add a save button on header
		instance.setHeaderItems(function (header) {
			header.push({
				type: 'actionButton',
				img: '<svg id="annobtn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
				onClick: function () {
					// Save annotations when button is clicked
					// widgets and links will remain in the document without changing so it isn't necessary to export them
					annotManager.exportAnnotations({ links: false, widgets: false }).then(function (xfdfString) {
						saveXfdfString(DOCUMENT_ID, xfdfString).then(function () {
							alert('Annotations saved successfully.');
						});
					});
				}
			});
		});
	});
