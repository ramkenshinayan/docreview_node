const viewer = document.getElementById('viewer');
const updateA = document.getElementById('updateA');
const docList = document.getElementById('approvals');
const container = document.getElementById('approvals');
const approveBtn = document.getElementById('approveBtn');
const disapproveBtn = document.getElementById('disapproveBtn');
const disapproveWrap = document.getElementById('disapproveWrap');
const radioItem = document.getElementsByName('radioGroup');
var docId = 0;
var docBlob = '';
var docName = '';
var docType = '';
var reviewerName = '';

approveBtn.disabled = true;
disapproveBtn.disabled = true;

fetch('/userDetails', { method: 'POST' })
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + ' ' + data.lastName;
		reviewerName = data.firstName + ' ' + data.lastName;
		console.log('Fetched user details...');
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
		console.log('Fetched documents for approval...');
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
	console.log('Fetched document id: ' + docId + '...')
}

approveBtn.addEventListener('click', () => {
	fetch(`/approve/${docId}`, {
		method: 'POST'
	})
		.then(response => {
			alert('Approval sent successfully');
		})
		.catch(error => {
			alert('Error sending approval');
		});
		location.reload();
});

document.addEventListener('DOMContentLoaded', function () {
	checkRadio();
});

WebViewer({
	path: '../lib'
}, viewer)
	.then(instance => {
		webViewer = instance;

		const { docViewer, annotManager } = instance;

		disapproveBtn.addEventListener('click', async () => {
			const doc = docViewer.getDocument();
			const xfdfString = await annotManager.exportAnnotations();
			const data = await doc.getFileData({ xfdfString });
			const arr = new Uint8Array(data);
			const newDocBlob = new Blob([arr], { type: 'application/pdf' });
			console.log("Xfdf String:", xfdfString);
			console.log("Data:", data);
			console.log("Uint8Array:", arr);
			console.log("Blob:", newDocBlob);

			fetch(`/disapprove/${docId}`, {
				method: 'POST',
				body: newDocBlob,
				headers: {
					'Content-Type': 'application/pdf',
				},
			})
				.then(response => {
					alert('Disapproval sent successfully');
					console.log('Status:', response);
				})
				.catch(error => {
					console.error('Error sending disapproval');
				});
			location.reload();
		});
	});