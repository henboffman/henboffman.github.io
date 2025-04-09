/**
 * Shopping List Module
 * Handles managing the shopping list functionality
 */

function addMissingToShoppingList() {
	if (!lastCheckResults) {
		alert('Please check your collection first');
		return;
	}

	const checkboxes = document.querySelectorAll('input[id^="add-to-shopping-"]:checked');
	if (checkboxes.length === 0) {
		alert('No cards selected to add to shopping list');
		return;
	}

	// Get existing shopping list
	const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
	const existingCards = new Set(shoppingList.map(item => item.card));

	// Add selected cards
	let addedCount = 0;
	checkboxes.forEach(checkbox => {
		const cardData = JSON.parse(decodeURIComponent(checkbox.getAttribute('data-card')));

		// Skip basic lands
		if (cardData.isBasicLand) return;

		// Calculate how many we need to get
		const needToGet = cardData.needQuantity - (cardData.haveQuantity || 0);
		if (needToGet <= 0) return;

		// Only add if not already in list
		if (!existingCards.has(cardData.card)) {
			shoppingList.push({
				card: cardData.card,
				quantity: needToGet,
				found: false,
				dateAdded: new Date().toISOString()
			});
			existingCards.add(cardData.card);
			addedCount++;
		}
	});

	// Save updated list
	localStorage.setItem('shoppingList', JSON.stringify(shoppingList));

	// Show confirmation
	alert(`Added ${addedCount} cards to your shopping list`);

	// If we're on the shopping list tab, refresh it
	if (document.getElementById('shoppingTab').classList.contains('active')) {
		loadShoppingList();
	}
}

function loadShoppingList() {
	const container = document.getElementById('shoppingListContainer');
	const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');

	if (shoppingList.length === 0) {
		container.innerHTML = '<p>Your shopping list is empty. Add cards from the Check Collection tab.</p>';
		return;
	}

	// Sort by found status (not found first), then by date added (newest first)
	shoppingList.sort((a, b) => {
		if (a.found !== b.found) {
			return a.found ? 1 : -1;
		}
		return new Date(b.dateAdded) - new Date(a.dateAdded);
	});

	let html = '';
	shoppingList.forEach((item, index) => {
		const scryfallUrl = `https://scryfall.com/search?q=${encodeURIComponent(item.card)}&unique=cards&as=grid&order=name`;

		html += `
            <div class="shopping-item ${item.found ? 'found' : ''}">
                <input type="checkbox" id="shopping-item-${index}" 
                    ${item.found ? 'checked' : ''} 
                    onchange="updateShoppingItem(${index}, this.checked)">
                <span class="shopping-item-quantity">${item.quantity}x</span>
                <span class="shopping-item-card">${item.card}</span>
                <div class="shopping-item-actions">
                    <a href="${scryfallUrl}" target="_blank">View</a>
                    <button onclick="removeShoppingItem(${index})">Remove</button>
                </div>
            </div>
        `;
	});

	container.innerHTML = html;
}

function updateShoppingItem(index, found) {
	const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');

	if (index >= 0 && index < shoppingList.length) {
		shoppingList[index].found = found;
		localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
		loadShoppingList();
	}
}

function removeShoppingItem(index) {
	const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');

	if (index >= 0 && index < shoppingList.length) {
		if (confirm(`Remove ${shoppingList[index].card} from your shopping list?`)) {
			shoppingList.splice(index, 1);
			localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
			loadShoppingList();
		}
	}
}

function clearShoppingList() {
	if (confirm('Are you sure you want to clear your entire shopping list?')) {
		localStorage.setItem('shoppingList', '[]');
		loadShoppingList();
	}
}