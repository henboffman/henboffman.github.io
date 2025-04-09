// Function to update the saved collection info display
function updateSavedCollectionInfo() {
	const savedCollectionInfo = document.getElementById('savedCollectionInfo');
	const clearCollectionButton = document.getElementById('clearCollectionButton');

	const savedCollection = loadCollectionFromStorage();

	if (savedCollection) {
		const date = new Date(savedCollection.timestamp);
		const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

		savedCollectionInfo.innerHTML = `
            <div>Using saved collection: <strong>${savedCollection.fileName}</strong></div>
            <div>Last updated: ${formattedDate}</div>
            <div>${savedCollection.data.length} cards in collection</div>
        `;
		clearCollectionButton.style.display = 'inline-block';
	} else {
		savedCollectionInfo.innerHTML = '';
		clearCollectionButton.style.display = 'none';
	}
}/**
 * Main Application Module
 * Initializes the application and sets up event listeners
 */

// Initialize app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	// Set up event listeners
	document.getElementById('saveButton').addEventListener('click', saveDeckList);
	document.getElementById('clearButton').addEventListener('click', clearDeckList);
	document.getElementById('checkButton').addEventListener('click', checkCollection);
	document.getElementById('addToShoppingListButton').addEventListener('click', addMissingToShoppingList);
	document.getElementById('clearShoppingList').addEventListener('click', clearShoppingList);
	document.getElementById('clearCollectionButton').addEventListener('click', function () {
		if (confirm('Are you sure you want to clear your saved collection?')) {
			clearSavedCollection();
			updateSavedCollectionInfo();
		}
	});

	// Check for saved collection and update info
	updateSavedCollectionInfo();

	// Set up dark mode toggle
	const darkModeToggle = document.getElementById('darkModeToggle');

	// Check for saved theme preference or prefer-color-scheme
	const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	const savedTheme = localStorage.getItem('darkMode');

	// Apply the dark mode if saved preference exists or user prefers dark mode
	if (savedTheme === 'true' || (savedTheme === null && prefersDarkMode)) {
		document.body.classList.add('dark-mode');
		darkModeToggle.checked = true;
	}

	// Add event listener for theme switches (keep both in sync)
	darkModeToggle.addEventListener('change', function () {
		toggleDarkMode(this.checked);
	});

	function toggleDarkMode(isDark) {
		if (isDark) {
			document.body.classList.add('dark-mode');
			darkModeToggle.checked = true;
			localStorage.setItem('darkMode', 'true');
		} else {
			document.body.classList.remove('dark-mode');
			darkModeToggle.checked = false;
			localStorage.setItem('darkMode', 'false');
		}
	}

	// Load saved decks
	loadSavedDecks();

	// Load shopping list
	loadShoppingList();

	// Set up the default deck list
	const defaultDeckList = localStorage.getItem('lastUsedDeckList');
	if (defaultDeckList) {
		document.getElementById('deckList').value = defaultDeckList;

		// Extract deck name if available
		const lines = defaultDeckList.trim().split('\n');
		if (lines.length > 0) {
			document.getElementById('deckNameInput').value = lines[0];
		}
	}
});

// Tab functionality
function openTab(evt, tabName) {
	const tabcontent = document.getElementsByClassName("tabcontent");
	for (let i = 0; i < tabcontent.length; i++) {
		tabcontent[i].classList.remove('active');
	}

	const tablinks = document.getElementsByClassName("tablinks");
	for (let i = 0; i < tablinks.length; i++) {
		tablinks[i].classList.remove('active');
	}

	document.getElementById(tabName).classList.add('active');
	evt.currentTarget.classList.add('active');

	// Special handling for shopping list tab
	if (tabName === 'shoppingTab') {
		loadShoppingList();
	}
}