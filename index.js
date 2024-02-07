document.addEventListener("DOMContentLoaded", function () {
	function capFirst(str) {
		if (str.length === 0) {
			return str;
		}
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	let allPeople = [];
	let swapiArray = [];
	let currentId = 11;
	let orderId = 2;

	async function fetchAllPeople() {
		allPeople = JSON.parse(localStorage.getItem("SWAPI"));
		swapiArray = [];
		swapiArray = [...allPeople];
		// Define swapiArray within the function scope

		// Check if allPeople is not set in localStorage or is an empty array
		if (!allPeople || !allPeople.length) {
			allPeople = [];
			let url = "https://swapi.dev/api/people/";

			// Fetch all pages until there are no more next pages
			while (url) {
				const response = await fetch(url);
				const data = await response.json();
				allPeople = allPeople.concat(data.results);
				url = data.next;
			}

			// Sort the array by the name property
			allPeople.sort((a, b) => {
				// Convert names to lowercase for case-insensitive sorting
				const nameA = a.name.toLowerCase();
				const nameB = b.name.toLowerCase();
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0;
			});

			localStorage.setItem("SWAPI", JSON.stringify(allPeople));
			swapiArray = [...allPeople];
		}

		return swapiArray; // Return swapiArray
	}

	fetchAllPeople()
		.then((swapiArray) => {
			// Use swapiArray returned from fetchAllPeople
			console.log(swapiArray);
			populateList(swapiArray);
			setActive(currentId);
		})
		.catch((error) => {
			console.error("Error fetching people:", error);
		});

	async function getExtra(name, from) {
		let nameinput = name.replace(/ /g, "%20");

		let nameurl =
			"https://starwars-databank-server.vercel.app/api/v1/characters/name/" + nameinput;

		try {
			const response = await fetch(nameurl);
			const data = await response.json();
			const response2 = await fetch(from);
			const data2 = await response2.json();
			let fromurl =
				"https://starwars-databank-server.vercel.app/api/v1/locations/name/" + data2.name;

			const response3 = await fetch(fromurl); // Corrected: Use fromurl instead of data.url
			const data3 = await response3.json();
			console.log(data, data2, data3);

			if (data3.length > 0 && data3[0].image !== "") {
				document.getElementById(
					"backimage"
				).style.backgroundImage = `url('${data3[0].image}')`;
			} else {
				document.getElementById("backimage").style.backgroundImage = "none";
			}
		} catch (error) {
			console.error("Error fetching extra:", error);
		}
	}

	const list = document.querySelector(".list-container");

	function populateList(swapiArray) {
		list.innerHTML = "";
		// Accept swapiArray as an argument
		for (let i = 0; i < swapiArray.length; i++) {
			const dataIdUrl = swapiArray[i].url;
			const dataIdMatch = dataIdUrl.match(/\/(\d+)\/$/);
			const dataId = dataIdMatch ? dataIdMatch[1] : null;
			// Creating the list item with the extracted data-id
			const listItem = `
            <div class="list-item" data-order="${i}" data-id="${dataId}">
                ${swapiArray[i].name}
            </div>`;
			list.insertAdjacentHTML("beforeend", listItem);
		}
		const fullList = document.querySelectorAll(".list-item");
		fullList.forEach((item) => {
			item.addEventListener("click", (event) => {
				const clickId = event.currentTarget.dataset.id;
				currentId = clickId;
				setActive(currentId);
			});
		});
	}

	const searchbar = document.querySelector("#searchinput");

	searchbar.focus();

	searchbar.addEventListener("keyup", () => {
		// Get the value of the search input
		let search = searchbar.value;

		// Empty the swapiArray
		swapiArray = [];

		// Copy allPeople into swapiArray
		swapiArray = [...allPeople];

		// Filter swapiArray based on the search variable
		swapiArray = swapiArray.filter((person) => {
			// Convert names to lowercase for case-insensitive comparison
			const name = person.name.toLowerCase();
			const searchTerm = search.toLowerCase();
			return name.includes(searchTerm);
		});

		// Update the list with the filtered data
		populateList(swapiArray);
	});

	function setActive(clickId) {
		const allItems = document.querySelectorAll(".list-item");
		allItems.forEach((item) => {
			item.classList.remove("active");
		});
		const currentItem = document.querySelector(`.list-item[data-id="${clickId}"]`);

		currentItem.classList.add("active");
		const name = currentItem.textContent.trim();
		console.log(name);
		const person = allPeople.find(
			(item) => item.name.trim().toLowerCase() === name.toLowerCase()
		);
		console.log(person);
		// Extract the last digits from the URL

		const dataIdUrl = person.url;
		const dataIdMatch = dataIdUrl.match(/\/(\d+)\/$/);

		const dataId = dataIdMatch[1];
		console.log(dataId);

		getExtra(person.name, person.homeworld);
	}

	const nextButton = document.querySelector(".nextbtn");
	const prevButton = document.querySelector(".prevbtn");

	nextButton.addEventListener("click", () => {
		nextBtn();
	});

	prevButton.addEventListener("click", () => {
		prevBtn();
	});

	function nextBtn() {
		if (currentId < allPeople.length - 1) {
			// Check if currentId is within the valid range
			orderId++;
		} else {
			orderId = 0; // Wrap around to the beginning if currentId exceeds the length of allPeople
		}
		setActive(currentId);
	}

	function prevBtn() {
		if (currentId > 0) {
			// Check if currentId is within the valid range
			orderId--;
		} else {
			orderId = allPeople.length - 1; // Set currentId to the last index if it's less than 0
		}
		setActive(currentId);
	}
});
