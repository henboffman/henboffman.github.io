
/**
 * Deck Manager Module
 * Handles saving, loading, and managing deck lists
 */

// Deck list functionality
function saveDeckList() {
	const deckList = document.getElementById('deckList').value.trim();
	if (!deckList) {
		alert('Please enter a deck list first');
		return;
	}

	const lines = deckList.split('\n');
	let deckName = document.getElementById('deckNameInput').value.trim();

	// If deckNameInput is empty, try to extract from first line
	if (!deckName && lines.length > 0 && !lines[0].match(/^\d+\s+/)) {
		deckName = lines[0].trim();
		document.getElementById('deckNameInput').value = deckName;
	}

	if (!deckName) {
		alert('Please enter a deck name');
		return;
	}

	// Save to localStorage
	const savedDecks = JSON.parse(localStorage.getItem('savedDecks') || '{}');
	savedDecks[deckName] = deckList;
	localStorage.setItem('savedDecks', JSON.stringify(savedDecks));
	localStorage.setItem('lastUsedDeckList', deckList);

	// Refresh the list
	loadSavedDecks();

	alert(`Deck "${deckName}" saved!`);
}

function loadSavedDecks() {
	const savedDecksContainer = document.getElementById('savedDecks');
	const savedDecks = JSON.parse(localStorage.getItem('savedDecks') || '{}');

	if (Object.keys(savedDecks).length === 0) {
		savedDecksContainer.innerHTML = '<p>No saved decks yet</p>';
		return;
	}

	let html = '';
	for (const deckName in savedDecks) {
		html += `
            <div class="saved-deck-item">
                <span onclick="loadDeck('${deckName}')">${deckName}</span>
                <div>
                    <button onclick="deleteDeck('${deckName}', event)">Delete</button>
                </div>
            </div>
        `;
	}

	savedDecksContainer.innerHTML = html;
}

function loadDeck(deckName) {
	const savedDecks = JSON.parse(localStorage.getItem('savedDecks') || '{}');
	const deckList = savedDecks[deckName];

	if (deckList) {
		document.getElementById('deckList').value = deckList;
		document.getElementById('deckNameInput').value = deckName;
		alert(`Loaded deck: ${deckName}`);
	}
}

function deleteDeck(deckName, event) {
	event.stopPropagation();

	if (confirm(`Are you sure you want to delete "${deckName}"?`)) {
		const savedDecks = JSON.parse(localStorage.getItem('savedDecks') || '{}');
		delete savedDecks[deckName];
		localStorage.setItem('savedDecks', JSON.stringify(savedDecks));

		// Refresh the list
		loadSavedDecks();
	}
}

function clearDeckList() {
	document.getElementById('deckList').value = '';
	document.getElementById('deckNameInput').value = '';
}

function parseDeckList(deckListText) {
	const lines = deckListText.trim().split('\n');
	const deckList = [];

	// Skip the first line if it doesn't match the card pattern (assuming it's a deck name)
	let startIdx = 0;
	if (lines.length > 0 && !lines[0].match(/^\d+\s+/)) {
		startIdx = 1;
	}

	for (let i = startIdx; i < lines.length; i++) {
		const line = lines[i];
		const match = line.match(/^(\d+)\s+(.+)$/);
		if (match) {
			const quantity = parseInt(match[1]);
			const cardName = match[2].trim();
			const isBasicLand = ['Plains', 'Island', 'Mountain', 'Swamp', 'Forest']
				.includes(cardName.trim());
			deckList.push({
				name: cardName,
				quantity: quantity,
				isBasicLand: isBasicLand
			});
		}
	}

	return deckList;
}