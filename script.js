// Menu Elements
const mainMenu = document.getElementById("main-menu");
const hideMenu = document.getElementById("hide-menu");
const hideMenuFinal = document.getElementById("hide-menu-final");
const revealMenu = document.getElementById("reveal-menu");
const revealMenuFinal = document.getElementById("reveal-menu-final");

// Buttons
const hideButton = document.getElementById("hide");
const revealButton = document.getElementById("reveal");
const exitButtons = document.querySelectorAll(".btn-exit");

// Image and Message Elements
const hideForm = document.getElementById('hideForm');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const outputImage = document.getElementById('outputImage');
const revealForm = document.getElementById('revealForm');
const extractedMessage = document.getElementById('extractedMessage');

// Event Listeners for Main Buttons
// Event Listeners for Main Buttons
hideButton.addEventListener("click", () => {
    showMenu(hideMenu);
});

revealButton.addEventListener("click", () => {
    showMenu(revealMenu);
});

// Event Listeners for Exit Buttons
exitButtons.forEach(button => {
    button.addEventListener("click", () => {
        resetForms();
        showMenu(mainMenu);
    });
});

// Function for Menu Handling
function showMenu(menu) {
    mainMenu.style.display = "none";
    hideMenu.style.display = "none";
    hideMenuFinal.style.display = "none";
    revealMenu.style.display = "none";
    revealMenuFinal.style.display = "none";
    menu.style.display = "flex"; 
}
// Event Listeners for Hide and Reveal message
hideForm.addEventListener('submit', handleHideSubmit);
revealForm.addEventListener('submit', handleRevealSubmit);

// Functions for Form Handling - Hide and Reveal message
function handleHideSubmit(event) {
    event.preventDefault(); 
    const file = getFileInput('imageHide'); 
    const message = getMessageInput('message'); 
    
    if (file) {
        readImageFile(file, (imageSrc) => {
            processImage(imageSrc, message); // Process image to hide message
        });
    }
    
    showMenu(hideMenuFinal); 
}

function handleRevealSubmit(event) {
    event.preventDefault(); 
    const file = getFileInput('imageReveal'); 
    
    if (file) {
        readImageFile(file, processRevealedImage); // Process image to reveal hidden message
    }
    
    showMenu(revealMenuFinal); 
}

// Helper Functions
function getFileInput(inputId) {
    const fileInput = document.getElementById(inputId);
    return fileInput.files[0]; 
}

function getMessageInput(inputId) {
    const messageInput = document.getElementById(inputId);
    return messageInput.value; 
}

function readImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result); 
    reader.readAsDataURL(file); 
}

// Functions for Image Processing
function processImage(imageSrc, message) {
    const img = new Image();
    img.src = imageSrc;
    
    img.onload = () => {
        drawImageToCanvas(img); 
        hideMessageInImage(message); 
        outputImage.src = canvas.toDataURL(); 
    };
    
    img.onerror = () => {
        console.error('Error loading the image. Ensure it is a valid image.'); 
    };
}

function processRevealedImage(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    
    img.onload = function() {
        drawImageToCanvas(img); 
        const binaryMessage = extractBinaryMessage(); 
        const decodedMessage = fromBinary(binaryMessage); 
        extractedMessage.textContent = decodedMessage || 'No message found.'; 
    };
    
    img.onerror = function() {
        console.error('Error loading the image. Ensure it is a valid image.'); 
        extractedMessage.textContent = 'Error loading the image.'; 
    };
}

// Functions for Drawing and Hiding Messages
function drawImageToCanvas(img) {
    canvas.width = img.width; 
    canvas.height = img.height; 
    ctx.drawImage(img, 0, 0); 
}

function hideMessageInImage(message) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Convert message to binary and add null byte
    let binaryMessage = convertMessageToBinary(message);
    binaryMessage += '00000000'; 
    
    // Hide message in least significant bits (LSB)
    for (let i = 0; i < binaryMessage.length; i++) {
        if (i >= pixels.length / 4) break; // Stop if processed all pixels
        pixels[i * 4 + 2] = (pixels[i * 4 + 2] & 0xFE) | parseInt(binaryMessage[i]); // Hide in blue channel
    }
    ctx.putImageData(imageData, 0, 0); // Update canvas
}

// Functions for Message Conversion
function convertMessageToBinary(message) {
    return [...message].map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(''); 
}

function extractBinaryMessage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let binaryMessage = '';
    
    for (let i = 0; i < pixels.length; i += 4) {
        binaryMessage += (pixels[i + 2] & 1).toString(); // Get LSB of blue channel
    }
    
    return binaryMessage; 
}

// Decode binary message to text
function fromBinary(binaryMessage) {
    let text = '';
    
    for (let i = 0; i < binaryMessage.length; i += 8) {
        const byte = binaryMessage.slice(i, i + 8);
        if (byte.length < 8) break; 
        const charCode = parseInt(byte, 2); 
        if (charCode === 0) break; 
        text += String.fromCharCode(charCode); 
    }
 
    return text; 
}

// Display name of the selected image file
function updateFileName(inputId, displayId) {
    const fileInput = document.getElementById(inputId);
    const fileName = fileInput.files[0] ? fileInput.files[0].name : ''; 
    const fileNameDisplay = document.getElementById(displayId); 

    if (fileNameDisplay) {
        fileNameDisplay.textContent = fileName;
        console.log("heerre")
    }
}

// Event listeners for file input changes
document.getElementById('imageHide').addEventListener('change', () => updateFileName('imageHide', 'file-name-hide')); // Update file name for hiding
document.getElementById('imageReveal').addEventListener('change', () => updateFileName('imageReveal', 'file-name-reveal')); // Update file name for revealing


// Function to reset all forms in the application
function resetForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    document.getElementById('file-name-hide').textContent=''
    document.getElementById('file-name-reveal').textContent=''
}







