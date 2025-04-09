/**
 * Collection Storage Module
 * Handles saving and loading the collection CSV data
 */

// Function to save the parsed collection data to localStorage
function saveCollectionToStorage(parsedCollection, fileName) {
	try {
		// First, let's try to save the data directly to localStorage
		const collectionString = JSON.stringify(parsedCollection);

		// Save the data
		localStorage.setItem('mtgCollection', collectionString);
		localStorage.setItem('mtgCollectionFileName', fileName);
		localStorage.setItem('mtgCollectionTimestamp', new Date().toISOString());

		console.log(`Collection saved: ${parsedCollection.length} cards from ${fileName}`);
		return true;
	} catch (error) {
		// Check if the error is due to quota exceeded
		if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
			console.error('Collection too large for localStorage. Consider indexedDB implementation for larger collections.');
			alert('Your collection is too large to be saved in the browser. Only this session will be preserved.');
		} else {
			console.error('Error saving collection:', error);
		}
		return false;
	}
}

// Function to load the saved collection data
function loadCollectionFromStorage() {
	try {
		const collectionString = localStorage.getItem('mtgCollection');
		const fileName = localStorage.getItem('mtgCollectionFileName');
		const timestamp = localStorage.getItem('mtgCollectionTimestamp');

		if (!collectionString || !fileName) {
			return null;
		}

		const parsedCollection = JSON.parse(collectionString);

		console.log(`Loaded saved collection: ${parsedCollection.length} cards from ${fileName}`);
		return {
			data: parsedCollection,
			fileName: fileName,
			timestamp: timestamp
		};
	} catch (error) {
		console.error('Error loading saved collection:', error);
		return null;
	}
}

// Function to clear the saved collection
function clearSavedCollection() {
	localStorage.removeItem('mtgCollection');
	localStorage.removeItem('mtgCollectionFileName');
	localStorage.removeItem('mtgCollectionTimestamp');
	console.log('Saved collection cleared');
}