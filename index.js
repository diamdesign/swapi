document.addEventListener("DOMContentLoaded", function () {
	function capFirst(str) {
		if (str.length === 0) {
			return str;
		}
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	let allArray = [];
	let allPeople = [];
	let swapiArray = [];
	let currentId = 0;
	let orderId = 0;

	async function fetchAllPeople() {
		allArray = JSON.parse(localStorage.getItem("SWAPI")) || []; // Provide default value if null

		// Check if allArray is not set in localStorage or is an empty array
		if (!allArray || !allArray.length) {
			allArray = [];
			let url = "https://swapi.dev/api/people/";

			// Fetch all pages until there are no more next pages
			while (url) {
				const response = await fetch(url);
				const data = await response.json();
				allArray = allArray.concat(data.results);
				url = data.next;
			}

			localStorage.setItem("SWAPI", JSON.stringify(allArray));
		}

		allPeople = [...allArray];
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

		swapiArray = [];
		swapiArray = [...allPeople];

		return swapiArray; // Return swapiArray
	}

	fetchAllPeople()
		.then((swapiArray) => {
			// Use swapiArray returned from fetchAllPeople
			console.log(allArray);
			populateList(allArray);
			setActive(currentId);
		})
		.catch((error) => {
			console.error("Error fetching people:", error);
		});

	async function getExtra(name, from) {
		let nameinput = name.replace(/ /g, "%20");
		let homeworld = allArray[currentId].homeworld;
		console.log(currentId);
		const characterHTML = document.querySelector(".character-info");
		characterHTML.innerHTML = '<div class="loader"></div>';
		let nameurl =
			"https://starwars-databank-server.vercel.app/api/v1/characters/name/" + nameinput;

		try {
			const response = await fetch(nameurl);
			const data = await response.json();
			const response2 = await fetch(from);
			const data2 = await response2.json();
			let fromurl =
				"https://starwars-databank-server.vercel.app/api/v1/locations/name/" + data2.name;

			const response3 = await fetch(fromurl);
			const data3 = await response3.json();

			console.log(data, data2, data3);

			const backgroundImage = data3[0]?.image; // Using optional chaining to safely access image property
			if (backgroundImage && backgroundImage !== "") {
				document.getElementById(
					"backimage"
				).style.backgroundImage = `url('${backgroundImage}')`;
			} else {
				document.getElementById("backimage").style.backgroundImage = "none";
			}

			let html = `<div class="img">
        <img
            src="${data[0]?.image || ""}" // Using optional chaining to safely access image property
            alt=""
        />
    </div>
    <div class="content">
        <h3 class="name">${name}</h3>
        <ul class="info">
            <li><span>${data[0]?.description || ""}</span></li>
            <li>Height: <span>${allArray[currentId].height}cm</span></li>
            <li>Mass: <span>${allArray[currentId].mass}kg</span></li>
            <li>Hair color: <span>${capFirst(allArray[currentId].hair_color)}</span></li>
            <li>Skin color: <span>${capFirst(allArray[currentId].skin_color)}</span></li>
            <li>Eye color: <span>${capFirst(allArray[currentId].eye_color)}</span></li>
            <li>Birth year: <span>${allArray[currentId].birth_year}</span></li>
            <li>Gender: <span>${capFirst(allArray[currentId].gender)}</span></li>
        </ul>
        <div class="from">
            <h3 class="planet"><span>From:</span> ${data2.name}</h3>
            <ul class="planetinfo">
                <li>Rotation period: <span>${data2.rotation_period}</span></li>
                <li>Orbital period: <span>${data2.orbital_period}</span></li>
                <li>Diameter: <span>${data2.diameter}</span></li>
                <li>Climate: <span>${capFirst(data2.climate)}</span></li>
                <li>Gravity: <span>${data2.gravity}</span></li>
                <li>Population: <span>${data2.population}</span></li>
                <li>Terrain: <span>${capFirst(data2.terrain)}</span></li>
            </ul>
        </div>`;
			const characterInfo = document.querySelector(".character-info");
			characterInfo.innerHTML = html;
			/*
			const container = document.querySelector(".img");
			const image = container.querySelector("img");

			container.addEventListener("mousemove", function (event) {
				// Calculate the position of the mouse relative to the container
				const mouseX = event.clientX - container.getBoundingClientRect().left;
				const containerWidth = container.offsetWidth;

				// Calculate the percentage position of the mouse within the container
				const percentageX = (mouseX / containerWidth) * 100;

				// Set the left position of the image based on the mouse position
				image.style.left = `${percentageX}%`; // Set the left position directly based on the mouse position
			});

			// Reset image position when mouse leaves the container
			container.addEventListener("mouseleave", function () {
				image.style.left = "50%"; // Reset to the initial left position
			});
            */
		} catch (error) {
			console.error("Error fetching extra:", error);
		}
	}

	const list = document.querySelector(".list-container");

	function populateList(allArray) {
		list.innerHTML = "";
		// Accept swapiArray as an argument
		for (let i = 0; i < allArray.length; i++) {
			const dataIdUrl = allArray[i].url;
			const dataIdMatch = dataIdUrl.match(/\/(\d+)\/$/);
			const dataId = dataIdMatch ? dataIdMatch[1] : null;
			// Creating the list item with the extracted data-id
			const listItem = `
            <div class="list-item" data-order="${i}" data-id="${dataId - 1}">${allArray[
				i
			].name.trim()}</div>`;
			list.insertAdjacentHTML("beforeend", listItem);
		}
		const fullList = document.querySelectorAll(".list-item");
		fullList.forEach((item) => {
			item.addEventListener("click", (event) => {
				const clickId = event.currentTarget.dataset.id;
				currentId = clickId;
				console.log(currentId);
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
		swapiArray = [...allArray];

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
		console.log(dataId - 1);

		getExtra(name, person.homeworld);
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
		const activeItem = document.querySelector(".list-item.active");
		if (activeItem) {
			const nextItem = activeItem.nextElementSibling;
			if (nextItem) {
				currentId = nextItem.dataset.id;
				setActive(currentId);
			} else {
				setActive(document.querySelector(".list-item:first-child").dataset.id);
			}
		}
	}

	function prevBtn() {
		const activeItem = document.querySelector(".list-item.active");
		if (activeItem) {
			const prevItem = activeItem.previousElementSibling;
			if (prevItem) {
				currentId = prevItem.dataset.id;
				setActive(currentId);
			} else {
				setActive(document.querySelector(".list-item:last-child").dataset.id);
			}
		}
	}
});
