const viewer = document.getElementById('viewer');
const updateA = document.getElementById('updateA');
const docList = document.getElementById('approvals');
const container = document.getElementById('approvals');
const approveBtn = document.getElementById('approveBtn');
const approveWrap = document.getElementById('approveWrap');
const disapproveBtn = document.getElementById('disapproveBtn');
const disapproveWrap = document.getElementById('disapproveWrap');
const radioItem = document.getElementsByName('radioGroup');
var docId = 1;
let docBlob = '';
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

approveBtn.addEventListener('click', () => {
	approveWrap.classList.toggle('hidden');
});

disapproveBtn.addEventListener('click', () => {
	disapproveWrap.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', function () {
	updateA.action = window.location.href + '/approve';
});

document.addEventListener('DOMContentLoaded', function () {
	checkRadio();
});

function getId(radio) {
    const docId = radio.id;
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
        // Ensure both fetches have completed before loading the document
        webViewer.loadDocument(docBlob, {
            filename: docName, // Assuming docName is defined somewhere
            extension: docType
        });
    });
}

WebViewer({
	path: '../lib'
}, viewer)
	.then(instance => {
		webViewer = instance;
		var annotManager = instance.docViewer.getAnnotationManager();

		// Add a save button on header
		instance.setHeaderItems((header) => {
			header.push({
				type: 'actionButton',
				img: '<svg id="annobtn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
				onClick: () => {
					// Save annotations when button is clicked
					// widgets and links will remain in the document without changing so it isn't necessary to export them
					annotManager.exportAnnotations({ links: false, widgets: false }).then(function (xfdfString) {
						console.log(xfdfString);
					});
				}
			});
		});
	});