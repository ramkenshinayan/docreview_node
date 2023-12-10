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

		// add icon
		const iconSpan = document.createElement('span');
		iconSpan.className = 'icon';

		const expandImg = document.createElement('ion-icon');
		expandImg.name = "chevron-up-outline";

		iconSpan.appendChild(expandImg);
		sortBtn.appendChild(iconSpan);
	}

	//filtered
	filterItems.forEach(item => {
        item.addEventListener("click", () => {
			item.classList.toggle("selected");
			document.querySelectorAll(" .filter-items.selected");
        });
    });

	function applyFilter() {
		const selectedFilter = document.querySelector(".filter-select .filter-items.selected");
		const filterValue = selectedFilter ? selectedFilter.innerText : null;
	
		if (filterValue) {
			fetch(`/data?filter=${encodeURIComponent(filterValue)}`)
				.then(response => response.json())
				.then(data => {
					updateReviews(data.reviews);
				})
				.catch(error => console.error('Error fetching data:', error));
		}
	}


	//sorted
	sortItems.forEach(item => {
		item.addEventListener("click", () => {
			sortItems.forEach(otherItem => {
				if (otherItem !== item) {
					otherItem.classList.remove("selected");
				}
			});
	
			item.classList.toggle("selected");
	
			const selectedItem = document.querySelector(".sort-select .sort-items.selected");
	
			if (selectedItem) {
				changeIcon(selectedItem, sortBtn);
			}
	
			document.querySelectorAll(".sort-select .sort-items.selected");

		});
	});

	function applySort() {
		const selectedSort = document.querySelector(".sort-select .sort-items.selected");
		const sortValue = selectedSort ? selectedSort.innerText : null;
	
		if (sortValue) {
			fetch(`/data?sort=${encodeURIComponent(sortValue)}`)
				.then(response => response.json())
				.then(data => {
					updateReviews(data.reviews);
				})
				.catch(error => console.error('Error fetching data:', error));
		}
	}	

	//update content
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
	
