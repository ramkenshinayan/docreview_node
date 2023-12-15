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
let webViewer;

approveBtn.disabled = true;
disapproveBtn.disabled = true;

fetch('/userDetails', { method: 'POST' })
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + ' ' + data.lastName;
	});

fetch('/forapproval', { method: 'POST' })
	.then(res => res.json())
	.then(data => {
		for (let i = 0; i < data.length; i++) {
			const radioInput = document.createElement('input');
			radioInput.setAttribute('type', 'radio');
			radioInput.setAttribute('id', data[i].documentId);
			radioInput.setAttribute('name', 'radioGroup');
			radioInput.setAttribute('onCLick', 'getId(this)');

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

function getId(radio) {
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
		webViewer.loadDocument(docBlob, {
			filename: docName,
			extension: docType
		});
	});
}

function setAnnot() {
	const { annotManager } = webViewer;
	const xfdfData = annotManager.exportAnnotations({ links: false, widgets: false });
	console.log('XFDF data:', JSON.parse(xfdfData));
	fetch('/setAnnot', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ xfdfData, docId }),
	})
		.then(response => {
			if (response.ok) {
				console.log('XFDF data sent successfully');
			} else {
				console.error('Failed to send XFDF data');
			}
		})
}

approveBtn.addEventListener('click', () => {
	// approveWrap.classList.toggle('hidden');
	setAnnot();
});

approveBtn.addEventListener('click', () => {
	fetch(`/approve/${docId}`, {method: 'POST'})
});

disapproveBtn.addEventListener('click', () => {
	// disapproveWrap.classList.toggle('hidden');
});

disapproveBtn.addEventListener('click', () => {
	fetch(`/disapprove/${docId}/${docBlob}`, {method: 'POST'})
});

document.addEventListener('DOMContentLoaded', function () {
	checkRadio();
});

WebViewer({
	path: '../lib'
}, viewer)
	.then(instance => {
		webViewer = instance;
		const { annotManager } = instance;

		fetch('/getAnnot')
			.then(response => response.json())
			.then(data => {
				const xfdfData = data.xfdf;
				annotManager.importAnnotations(xfdfData)
					.then(() => {
						console.log('XFDF data loaded successfully');
					})
					.catch(error => {
						console.error('Error loading XFDF data:', error);
					});
			})
			.catch(error => {
				console.error('Error fetching XFDF data:', error);
			});
	});