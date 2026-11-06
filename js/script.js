// Get the modal elements
const modal = document.getElementById('imageModal');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const closeModal = document.getElementById('closeModal');
// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button that starts the search and the gallery where results appear.
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// DEMO_KEY is NASA's public key for trying the API; it has request limits.
const apiKey = 'DEMO_KEY';

// Run this code when the user clicks the Get Space Images button.
getImagesButton.addEventListener('click', async () => {
	// Read the dates currently selected in the date inputs.
	const startDate = startInput.value;
	const endDate = endInput.value;

	// Do not send a request if a date is missing or the range is backwards.
	if (!startDate || !endDate || startDate > endDate) {
		gallery.textContent = 'Choose a valid date range to continue.';
		return;
	}

	// Add the API key and selected dates to the NASA request URL.
	const query = new URLSearchParams({
    api_key: apiKey,
    date_from: startDate.slice(2).replaceAll('-', ''),
    date_to: endDate.slice(2).replaceAll('-', '')
});

	// Show progress and prevent another click while the request is running.
	gallery.textContent = 'Loading space images...';
	getImagesButton.disabled = true;

	try {
		// Ask NASA for APOD entries between the selected start and end dates.
    const response = await fetch(`https://science.nasa.gov/wp-json/wp/v2/apod-basic?${query}`);
		// Turn an unsuccessful HTTP response into an error handled below.
		if (!response.ok) {
			throw new Error(`NASA APOD request failed (${response.status}). Check your API key or try again later.`);
		}

		// Convert NASA's JSON response into JavaScript data, then clear old results.
		const images = await response.json();

		// Confirm NASA returned a non-empty list of APOD entries.
		if (!Array.isArray(images) || images.length === 0) {
			throw new Error('NASA did not return any APOD entries for these dates.');
		}

		// NASA may return a generic logo placeholder instead of the daily APOD data.
		const hasPlaceholderData = images.every((image) =>
			image.title === 'NASA Science' && image.explanation.startsWith('Discover the cosmos! Each day a different image')
		);
		if (hasPlaceholderData) {
			throw new Error('NASA returned placeholder data instead of APOD entries. Try again later or replace DEMO_KEY with your own NASA API key.');
		}

		gallery.replaceChildren();

		// Build one gallery item for each APOD entry returned by NASA.
		// Build a gallery item only if the APOD entry is an image.
images.forEach((image) => {

    // Skip videos
    if (image.media_type !== 'image') {
        return;
    }

    const item = document.createElement('article');
    item.className = 'gallery-item';

    // Display the title
    const title = document.createElement('h2');
    title.textContent = image.title;
    item.appendChild(title);

    // Display the astronomy picture
    const picture = document.createElement('img');
    picture.src = image.hdurl;
    picture.alt = image.title;
    item.appendChild(picture);

    // Display the date
    const date = document.createElement('p');
    date.textContent = image.date;
    item.appendChild(date);

    // Display the description
    const description = document.createElement('p');
  description.innerHTML = image.explanation;
  item.appendChild(description);


    // Open the modal when a gallery card is clicked
// Open the modal when a gallery card is clicked
item.addEventListener('click', (event) => {

    // Don't open the modal when clicking a link
    if (event.target.closest('a')) {
        return;
    }

    // Display the title and date
    modalTitle.textContent = image.title;
    modalDate.textContent = image.date;

    // Display the larger image
    modalImage.src = image.hdurl || image.url;
    modalImage.alt = image.title;

    // Remove HTML tags from NASA's explanation
    const temp = document.createElement('div');
    temp.innerHTML = image.explanation;

    // Display only the clean text
    modalDescription.textContent = temp.textContent;

    // Open the modal
    modal.style.display = 'flex';
});
    gallery.appendChild(item);
});

	} catch (error) {
		// Show a helpful message if the request or response processing fails.
		gallery.textContent = error.message;
	} finally {
		// Re-enable the button whether the request succeeded or failed.
		getImagesButton.disabled = false;
	}
});

  // Close the modal when the X button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close the modal when clicking outside the white box
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Close the modal when pressing Escape
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        modal.style.display = 'none';
    }
});
