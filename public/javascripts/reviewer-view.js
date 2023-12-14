const sort = document.querySelector(".sort-box"),
	sortBtn = sort.querySelector(".sort-btn"),
	sortAll = sort.querySelectorAll(".sort"),
	sortCol = document.getElementsByClassName("sort-btn"),

	filter = document.querySelector(".filter-box"),
	filterBtn = filter.querySelector(".filter-btn"),
	filterAll = filter.querySelectorAll(".filter"),
	filterCol = document.getElementsByClassName("filter-btn"),
	sortItems = document.querySelectorAll(".sort-items"),
	filterItems = document.querySelectorAll(".filter-items"),

	documentName = document.querySelector(".name");

fetch('/userDetails')
	.then(res => res.json())
	.then(data => {
		document.getElementById('username').innerHTML = data.firstName + " " + data.lastName;
	});

fetch('/history')
	.then(response => {
	if (!response.ok) {
		throw new Error(`Network response was not ok (Status: ${response.status}, ${response.statusText})`);
	}

	const contentType = response.headers.get('content-type');
	if (!contentType || !contentType.includes('application/json')) {
		throw new Error('Response is not in JSON format');
	}

	return response.clone().json();
	})
	.then(data => {
		updateReviews(data);
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});

//EXPAND SORT
for (let i = 0; i < sortCol.length; i++) {
	sortCol[i].addEventListener("click", toggleActive);
}

for (let j = 0; j < filterCol.length; j++) {
	filterCol[j].addEventListener("click", toggleActive);
}

function toggleActive() {
	this.classList.toggle("active");
	const content = this.nextElementSibling;
	if (content.style.display === "block") {
		content.style.display = "none";
	} else {
		content.style.display = "block";
	}
}

//SORT CHANGE
sortBtn.addEventListener("click", () => {
	sortBtn.classList.toggle("open");
	applySort();
});
filterBtn.addEventListener("click", () => {
	filterBtn.classList.toggle("open");
	applyFilter();
});

//SORT SELECTION
sortAll.forEach(option => {
	option.addEventListener("click", () => {changeIcon(option, sortBtn)})
});

//FILTER SELECTION
filterAll.forEach(option => {
	option.addEventListener("click", () => {changeIcon(option, filterBtn)})
});

//Function for 
function changeIcon(option, button){
	let selected = option.innerText;
	button.innerText = selected;

	const existingIcon = button.querySelector('.icon');
	if (existingIcon) {
		existingIcon.remove();
	}

	const iconSpan = document.createElement('span');
	iconSpan.className = 'icon';

	const expandImg = document.createElement('ion-icon');
	expandImg.name = "chevron-up-outline";

	iconSpan.appendChild(expandImg);
	sortBtn.appendChild(iconSpan);
}

function fetchDataFromUrl() {
	const queryParams = new URLSearchParams(window.location.search);
	const filterParams = queryParams.getAll('filter');
	const sortParam = queryParams.get('sort');

	applyFilterAndSort(filterParams, sortParam);
}

//filtered
filterItems.forEach(item => {
	item.addEventListener("click", () => {
		item.classList.toggle("selected");

		const selectedFilters = document.querySelectorAll(".filter-items.selected");
		const selectedFilterValues = Array.from(selectedFilters).map(filter => filter.innerText);

		const selectedSort = document.querySelector(".sort-select .sort-items.selected");
		const selectedSortValue = selectedSort ? selectedSort.innerText : null;

		applyFilterAndSort(selectedFilterValues, selectedSortValue);
	});
});

//sorted
sortItems.forEach(item => {
	item.addEventListener("click", () => {
		sortItems.forEach(otherItem => {
			if (otherItem !== item) {
				otherItem.classList.remove("selected");
			}
		});

		item.classList.toggle("selected");
		const selectedSortValue = item.textContent.trim();

		const selectedFilters = document.querySelectorAll(".filter-items.selected");
		const selectedFilterValues = Array.from(selectedFilters).map(filter => filter.innerText);

		applyFilterAndSort(selectedFilterValues, selectedSortValue);
	});
});

function applyFilterAndSort(selectedFilterValues, selectedSortValue) {
	const filterParams = selectedFilterValues.map(value => `filter=${encodeURIComponent(value)}`).join('&');
	const sortParam = selectedSortValue ? `sort=${encodeURIComponent(selectedSortValue)}` : '';

	const queryParams = [filterParams, sortParam].filter(Boolean).join('&');
	const newUrl = `${window.location.pathname}?${queryParams}`;

	history.pushState(null, null, newUrl);

	fetch(`/and?${queryParams}`)
		.then(response => response.json())
		.then(data => {
			updateReviews(data);
		})
		.catch(error => console.error('Error fetching data:', error));
}
document.addEventListener('DOMContentLoaded', () => {
	fetchDataFromUrl();
});

function updateReviews(reviews) {
	const reviewsContainer = document.querySelector('.history');
	reviewsContainer.innerHTML = ''; 

	if (reviews && reviews.length > 0) {
		reviews.forEach(review => {
			const reviewBox = document.createElement('div');
			reviewBox.classList.add('box');
			reviewBox.id = `box-${review.id}`;

			const content = document.createElement('div');
			content.classList.add('content');

			const nameHeader = document.createElement('h1');
			nameHeader.classList.add('name');
			nameHeader.textContent = review.DocumentName;

			const uploadDateParagraph = document.createElement('p');
			uploadDateParagraph.textContent = 'Upload Date: ';

			const uploadDateSpan = document.createElement('span');
			uploadDateSpan.textContent = new Date(review.UploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

			uploadDateParagraph.appendChild(uploadDateSpan);

			const reviewDateParagraph = document.createElement('p');
			reviewDateParagraph.textContent = 'Review Date: ';

			const reviewDateSpan = document.createElement('span');
			reviewDateSpan.textContent = new Date(review.ReviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

			reviewDateParagraph.appendChild(reviewDateSpan);

			content.appendChild(nameHeader);
			content.appendChild(uploadDateParagraph);
			content.appendChild(reviewDateParagraph);

			const statusHeader = document.createElement('h3');
			statusHeader.classList.add('status');
			statusHeader.textContent = review.ApprovalStatus;

			reviewBox.appendChild(content);
			reviewBox.appendChild(statusHeader);

			reviewsContainer.appendChild(reviewBox);
		});
	} else {
		reviewsContainer.innerHTML = '<p>No reviews available</p>';
	}
}