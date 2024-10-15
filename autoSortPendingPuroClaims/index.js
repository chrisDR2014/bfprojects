const form = document.getElementById('uploadForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const sheetName = document.getElementById('sheetName').value.trim(); // Trim whitespace
    const data = document.getElementById('data').value.trim(); // Trim whitespace

    console.log('Submitting with sheetName:', sheetName, 'and data:', data);
    
    // Make sure that the data variable has a value before sending the request
    if (!sheetName || !data) {
        alert('Please enter data before submitting.');
        return;
    }

    const response = await fetch('/project1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetName, data })  // Ensure this is correct
    });

    if (response.ok) {
        alert('Data successfully uploaded!');
    } else {
        const errorText = await response.text();
        console.log('Error:', errorText);
        alert('Error uploading data.');
    }
});