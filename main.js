/**
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