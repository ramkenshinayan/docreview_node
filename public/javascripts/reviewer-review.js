const viewer = document.getElementById('viewer');
const updateA = document.getElementById('updateA');
const docList = document.getElementById('approvals');
const container = document.getElementById('approvals');
const approveBtn = document.getElementById('approveBtn');
const disapproveBtn = document.getElementById('disapproveBtn');
const disapproveWrap = document.getElementById('disapproveWrap');
const radioItem = document.getElementsByName('radioGroup');
var docId = 1;
var docBlob = '';
var docName = '';
var docType = '';
var reviewerName = '';
let webViewer;

approveBtn.disabled = true;
disapproveBtn.disabled = true;

fetch('/userDetails', { method: 'POST' })
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + ' ' + data.lastName;
		reviewerName = data.firstName + ' ' + data.lastName;
	});

fetch('/forapproval', { method: 'POST' })
	.then(res => res.json())
	.then(data => {
		for (let i = 0; i < data.length; i++) {
			const radioInput = document.createElement('input');
			radioInput.setAttribute('type', 'radio');
			radioInput.setAttribute('id', data[i].documentId);
			radioInput.setAttribute('name', 'radioGroup');
			radioInput.setAttribute('onCLick', 'selectDoc(this)');

			const labelElement = document.createElement('label');
			labelElement.setAttribute('for', data[i].documentId);

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
			approveBtn.disabled = false;
			disapproveBtn.disabled = false;
		}
	});
}

function selectDoc(radio) {
	docId = radio.id;
	let docBlob, docType;

	const fetchDocBlob = fetch(`/blobdoc/${docId}`, { method: 'POST' })
		.then(res => res.blob())
		.then(data => {
			docBlob = data;
		});

	const fetchDocType = fetch(`/typedoc/${docId}`, { method: 'POST' })
		.then(res => res.text())
		.then(data => {
			docType = data;
		});

	Promise.all([fetchDocBlob, fetchDocType]).then(() => {
		webViewer.setAnnotationUser(reviewerName);
		webViewer.loadDocument(docBlob, {
			filename: docName,
			extension: docType
		});
	});
	// selectAnnot();
}

approveBtn.addEventListener('click', () => {
	fetch(`/approve/${docId}`, {
		method: 'POST',
		body: documentBlob,
		headers: {
			'Content-Type': 'application/pdf'
		}
	})
		.then(response => {
			console.log('Document sent successfully:', response);
		})
		.catch(error => {
			console.error('Error sending document:', error);
		});
});

disapproveBtn.addEventListener('click', () => {
	// var annoBlob = new Blob([docViewer.getAnnotationManager().exportAnnotations()]);
	console.log(annoBlob)
	fetch(`/disapprove/${docId}`, { method: 'POST' })
		.then(response => {
			// console.log('Annotations sent successfully:', response);
			console.log('Denial sent successfully:', response);
		})
		.catch(error => {
			console.error('Error sending document:', error);
		});
});

document.addEventListener('DOMContentLoaded', function () {
	checkRadio();
});

WebViewer({
	path: '../lib'
}, viewer)
	.then(instance => {
		webViewer = instance;
		docViewer = instance.docViewer;
	});