/**
 * Collection Checker Module
 * Handles checking deck lists against the collection
 */

// Global variable to store results
let lastCheckResults = null;

function checkCollection() {
	const fileInput = document.getElementById('csvFile');
	const deckListText = document.getElementById('deckList').value;
	const resultsDiv = document.getElementById('results');
	const loadingDiv = document.getElementById('loading');

	// Save the deck list for later use
	localStorage.setItem('lastUsedDeckList', deckListText);

	// Extract deck name if first line doesn't match card pattern
	const lines = deckListText.trim().split('\n');
	if (lines.length > 0 && !lines[0].match(/^\d+\s+/)) {
		document.getElementById('deckNameInput').value = lines[0].trim();
	}

	// Show loading indicator
	loadingDiv.style.display = 'block';
	resultsDiv.innerHTML = '<p>Processing your collection and deck list...</p>';

	if (!deckListText.trim()) {
		resultsDiv.innerHTML = '<p>Please paste your deck list.</p>';
		loadingDiv.style.display = 'none';
		return;
	}

	const deckList = parseDeckList(deckListText);

	if (deckList.length === 0) {
		resultsDiv.innerHTML = '<p>Could not parse any cards from the deck list. Please check the format.</p>';
		loadingDiv.style.display = 'none';
		return;
	}

	// Try loading the collection from localStorage first
	let useSavedCollection = false;

	if (!fileInput.files[0]) {
		const savedCollection = loadCollectionFromStorage();
		if (savedCollection) {
			useSavedCollection = true;
			displayResults(deckList, savedCollection.data);
			loadingDiv.style.display = 'none';
		} else {
			resultsDiv.innerHTML = '<p>Please upload your collection CSV first.</p>';
			loadingDiv.style.display = 'none';
			return;
		}
	}

	// If we're not using the saved collection, parse the uploaded file
	if (!useSavedCollection) {
		Papa.parse(fileInput.files[0], {
			header: true,
			skipEmptyLines: true,
			dynamicTyping: true,
			complete: function (results) {
				console.log("CSV parsing complete");

				if (results.errors && results.errors.length > 0) {
					console.warn("CSV parsing errors:", results.errors);
				}

				const collection = results.data;

				// Save the collection to localStorage for future use
				saveCollectionToStorage(collection, fileInput.files[0].name);
				updateSavedCollectionInfo();

				displayResults(deckList, collection);
				loadingDiv.style.display = 'none';
			},
			error: function (error) {
				resultsDiv.innerHTML = `<p>Error parsing CSV: ${error}</p>`;
				loadingDiv.style.display = 'none';
			}
		});
	}
}

function displayResults(deckList, collection) {
	const resultsDiv = document.getElementById('results');

	let totalCardsNeeded = 0;
	let totalCardsFound = 0;
	let cardsWithPartialMatch = 0;
	let completelyMissingCards = 0;

	const results = deckList.map(deckCard => {
		const matchingCards = collection.filter(collectionCard =>
			collectionCard.Name &&
			collectionCard.Name.toLowerCase() === deckCard.name.toLowerCase()
		);

		totalCardsNeeded += deckCard.quantity;

		// For basic lands, don't check the collection
		if (deckCard.isBasicLand) {
			return {
				card: deckCard.name,
				needQuantity: deckCard.quantity,
				haveQuantity: "∞", // infinity symbol for basic lands
				status: 'found',
				binderGroups: {},
				isBasicLand: true
			};
		}

		if (matchingCards.length > 0) {
			// Group by binder
			const binderGroups = {};
			matchingCards.forEach(card => {
				const binderName = card['Binder Name'] || 'Unknown Binder';
				if (!binderGroups[binderName]) {
					binderGroups[binderName] = [];
				}
				binderGroups[binderName].push(card);
			});

			let totalQuantity = 0;
			matchingCards.forEach(card => {
				// Convert to number if it's a string
				let quantity = card.Quantity;
				if (typeof quantity === 'string') {
					quantity = parseInt(quantity);
				}
				totalQuantity += quantity || 0;
			});

			totalCardsFound += Math.min(totalQuantity, deckCard.quantity);

			if (totalQuantity >= deckCard.quantity) {
				return {
					card: deckCard.name,
					needQuantity: deckCard.quantity,
					haveQuantity: totalQuantity,
					status: 'found',
					binderGroups,
					isBasicLand: deckCard.isBasicLand
				};
			} else {
				cardsWithPartialMatch++;
				return {
					card: deckCard.name,
					needQuantity: deckCard.quantity,
					haveQuantity: totalQuantity,
					status: 'partial',
					binderGroups,
					isBasicLand: deckCard.isBasicLand
				};
			}
		} else {
			completelyMissingCards++;
			return {
				card: deckCard.name,
				needQuantity: deckCard.quantity,
				haveQuantity: 0,
				status: 'missing',
				binderGroups: {},
				isBasicLand: deckCard.isBasicLand
			};
		}
	});

	// Store results for later use
	lastCheckResults = results;

	// Sort results: found cards first, then partial, then missing
	// Within each status, put non-basic lands first
	results.sort((a, b) => {
		const statusOrder = { 'found': 0, 'partial': 1, 'missing': 2 };
		const statusDiff = statusOrder[a.status] - statusOrder[b.status];

		if (statusDiff !== 0) {
			return statusDiff;
		}

		// If same status, sort basic lands to the bottom
		if (a.isBasicLand && !b.isBasicLand) {
			return 1;
		}
		if (!a.isBasicLand && b.isBasicLand) {
			return -1;
		}

		// Otherwise sort alphabetically
		return a.card.localeCompare(b.card);
	});

	// Count non-basic lands for summary
	const nonBasicLands = deckList.filter(card => !card.isBasicLand);
	const nonBasicCardsNeeded = nonBasicLands.reduce((sum, card) => sum + card.quantity, 0);

	// Create a more compact summary
	const summary = `
        <div class="summary">
            <p>Cards: ${deckList.length} unique (${totalCardsNeeded} total)</p>
            <p>Non-basic: ${nonBasicCardsNeeded}</p>
            <p>Have: ${totalCardsFound}/${nonBasicCardsNeeded} (${Math.round(totalCardsFound / nonBasicCardsNeeded * 100)}%)</p>
            <p>
                <span class="card-status found">${results.filter(r => r.status === 'found' && !r.isBasicLand).length} Complete</span>
                <span class="card-status partial">${cardsWithPartialMatch} Partial</span>
                <span class="card-status missing">${completelyMissingCards} Missing</span>
            </p>
        </div>
    `;

	// Create results table with add to shopping list checkboxes
	let tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Add</th>
                    <th>Card</th>
                    <th>Need</th>
                    <th>Have</th>
                    <th>Status</th>
                    <th>Location Details</th>
                    <th>Scryfall</th>
                </tr>
            </thead>
            <tbody>
    `;

	results.forEach((result, index) => {
		const statusClass = result.status;
		const statusText =
			result.status === 'found' ? 'Complete' :
				result.status === 'partial' ? 'Partial' : 'Missing';

		let locationDetails = '';
		if (result.isBasicLand) {
			locationDetails = 'Basic land - no location needed';
		} else if (result.status !== 'missing') {
			for (const binderName in result.binderGroups) {
				const cards = result.binderGroups[binderName];
				let totalInBinder = 0;
				cards.forEach(card => {
					// Convert to number if it's a string
					let quantity = card.Quantity;
					if (typeof quantity === 'string') {
						quantity = parseInt(quantity);
					}
					totalInBinder += quantity || 0;
				});
				locationDetails += `<div><strong>${binderName}</strong>: ${totalInBinder} copies</div>`;
			}
		} else {
			locationDetails = 'Not in collection';
		}

		// Create Scryfall search URL
		const scryfallSearchUrl = `https://scryfall.com/search?q=${encodeURIComponent(result.card)}&unique=cards&as=grid&order=name`;

		// Only add checkbox for non-basic lands that need to be acquired
		const checkboxVisible = (result.status === 'partial' || result.status === 'missing') && !result.isBasicLand;

		tableHtml += `
            <tr>
                <td class="checkbox-cell">
                    ${checkboxVisible ? `<input type="checkbox" id="add-to-shopping-${index}" data-card="${encodeURIComponent(JSON.stringify(result))}" ${result.status === 'missing' ? 'checked' : ''}>` : ''}
                </td>
                <td>${result.card}</td>
                <td>${result.needQuantity}</td>
                <td>${result.haveQuantity}</td>
                <td><span class="card-status ${statusClass}">${statusText}</span></td>
                <td>${locationDetails}</td>
                <td><a href="${scryfallSearchUrl}" target="_blank">View</a></td>
            </tr>
        `;
	});

	tableHtml += `
            </tbody>
        </table>
    `;

	resultsDiv.innerHTML = summary + tableHtml;
}