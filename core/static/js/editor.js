// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeToggleMobile = document.getElementById('dark-mode-toggle-mobile');
const body = document.body;

// Check for saved user preference, if any, on load of the website
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
} else {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
}

function toggleDarkMode() {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

darkModeToggle.addEventListener('click', toggleDarkMode);
darkModeToggleMobile.addEventListener('click', toggleDarkMode);

const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('block'); // Ensure the menu is displayed as a block element
});

// Meme Generator Script
let canvas = new fabric.Canvas('meme-canvas');
let templates = [];
let history = [];
let historyIndex = -1;















// Load a default template when the page loads
function loadDefaultTemplate() {
    // List of default meme templates
    const defaultTemplates = [
        "https://i.imgflip.com/1g8my4.jpg", // Two Buttons
        "https://i.imgflip.com/1ur9b0.jpg", // Drake Hotline Bling
        "https://i.imgflip.com/1h7in3.jpg", // Change My Mind
        "https://i.imgflip.com/1otk96.jpg", // Is This A Pigeon?
        "https://i.imgflip.com/1yxk7k.jpg", // Surprised Pikachu
        "https://i.imgflip.com/30b1gx.jpg", // Always Has Been
        "https://i.imgflip.com/1e7ql7.jpg", // Roll Safe Think About It
        "https://i.imgflip.com/1c1uej.jpg", // Mocking Spongebob
        "https://i.imgflip.com/1o00in.jpg", // Gru's Plan
    ];

    // Select a random meme URL from the list
    const randomIndex = Math.floor(Math.random() * defaultTemplates.length);
    const randomTemplateUrl = defaultTemplates[randomIndex];

    // Load the random meme
    loadMeme(randomTemplateUrl);
}

// Fetch memes from Imgflip API
function fetchMeme() {
    fetch('https://api.imgflip.com/get_memes')
        .then(response => response.json())
        .then(data => {
            templates = data.data.memes;
            renderTemplates(templates);
        });
}






function resizeCanvas() {
    const canvas = document.getElementById('meme-canvas');
    const container = canvas.parentElement;

    // Only resize on mobile (screen width less than 768px)
    if (window.innerWidth < 768) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    } else {
        // Reset canvas size on desktop
        canvas.width = 500; // Default width
        canvas.height = 400; // Default height
    }

    // Redraw canvas content if needed
    // Example: redrawMeme();
}

// Initial resize
resizeCanvas();

// Resize on window resize
window.addEventListener('resize', resizeCanvas);





// Render templates in the gallery
function renderTemplates(templates) {
    const gallery = document.getElementById('meme-gallery');
    gallery.innerHTML = '';
    templates.slice(0, 4).forEach(meme => {
        let imgElement = document.createElement('img');
        imgElement.src = meme.url;
        imgElement.classList.add('w-full', 'h-24', 'object-cover', 'cursor-pointer', 'rounded-lg', 'hover:ring-2', 'hover:ring-indigo-500');
        imgElement.onclick = () => loadMeme(meme.url);
        gallery.appendChild(imgElement);
    });
}

// Load a meme template onto the canvas
function loadMeme(url) {
    fabric.Image.fromURL(url, (img) => {
        canvas.clear(); // Clear the canvas before loading a new template

        // Scale the image to fit the canvas without cropping or leaving empty space
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        img.scale(scale);

        // Center the image on the canvas
        img.set({
            left: (canvas.width - img.width * scale) / 2,
            top: (canvas.height - img.height * scale) / 2,
            selectable: false, // Lock the template so it cannot be moved or edited
            evented: false, // Disable interactions with the template
        });

        canvas.add(img);
        canvas.renderAll();
        saveState(); // Save the current state to history
    });
}

// Open the template gallery modal
function openTemplateGallery() {
    const modal = document.getElementById('template-gallery');
  
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling of the main page
    }
    renderTemplateList(templates);
}

// Close the template gallery modal
function closeTemplateGallery() {
    const modal = document.getElementById('template-gallery');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore scrolling of the main page
    }
}

// Render the full template list in the modal
function renderTemplateList(templates) {
    const templateList = document.getElementById('template-list');
    templateList.innerHTML = '';
    templates.forEach(meme => {
        let imgElement = document.createElement('img');
        imgElement.src = meme.url;
        imgElement.classList.add('w-full', 'h-24', 'object-cover', 'cursor-pointer', 'rounded-lg', 'hover:ring-2', 'hover:ring-indigo-500');
        imgElement.onclick = () => {
            loadMeme(meme.url);
            closeTemplateGallery();
        };
        templateList.appendChild(imgElement);
    });
}

// Filter templates by category
function filterTemplates(category) {
    const filteredTemplates = templates.filter(meme => {
        if (category === 'all') return true;
        return meme.name.toLowerCase().includes(category);
    });
    renderTemplateList(filteredTemplates);
}

// Search templates
document.getElementById('search-templates').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredTemplates = templates.filter(meme => meme.name.toLowerCase().includes(searchTerm));
    renderTemplateList(filteredTemplates);
});

// Add text to the meme
function addTextToMeme() {
    const topText = document.getElementById('top-text').value;
    const bottomText = document.getElementById('bottom-text').value;
    const color = document.getElementById('text-color').value;
    const size = document.getElementById('text-size').value;

    if (topText) {
        const textTop = new fabric.Text(topText, {
            left: 50,
            top: 20,
            fill: color,
            fontSize: parseInt(size),
            fontFamily: 'Impact',
            fontWeight: 'bold',
            stroke: 'black',
            strokeWidth: 2,
            editable: true,
        });
        canvas.add(textTop);

        // Bring the text to the front
        textTop.bringToFront();
    }

    if (bottomText) {
        const textBottom = new fabric.Text(bottomText, {
            left: 50,
            top: 350, // Adjusted for bottom text
            fill: color,
            fontSize: parseInt(size),
            fontFamily: 'Impact',
            fontWeight: 'bold',
            stroke: 'black',
            strokeWidth: 2,
            editable: true,
        });
        canvas.add(textBottom);

        // Bring the text to the front
        textBottom.bringToFront();
    }

    canvas.renderAll();
    saveState(); // Save the current state to history
}

// Remove selected text or object
function removeText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
        saveState(); // Save the current state to history
    }
}

// Add a sticker to the meme
function addSticker(sticker) {
    const text = new fabric.Text(sticker, {
        left: 100,
        top: 100,
        fontSize: 50,
        fill: '#ffffff',
        fontFamily: 'Arial',
        editable: true,
    });
    canvas.add(text);

    // Bring the sticker to the front
    text.bringToFront();

    canvas.renderAll();
    saveState(); // Save the current state to history
}

// Save the current canvas state to history
function saveState() {
    if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
    }
    history.push(JSON.stringify(canvas.toJSON()));
    historyIndex = history.length - 1;
}

// Undo the last action
function undoAction() {
    if (historyIndex > 0) {
        historyIndex--;
        canvas.loadFromJSON(history[historyIndex], () => {
            canvas.renderAll();
        });
    }
}

// Redo the last action
function redoAction() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        canvas.loadFromJSON(history[historyIndex], () => {
            canvas.renderAll();
        });
    }
}

// Download the meme as a PNG image
function downloadMeme() {
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
    });
    document.body.appendChild(
        link
    ); // Required for Firefox
    link.click();
    document.body.removeChild(); // Clean up
}

// Share meme on Twitter
function shareOnTwitter() {
    const memeDataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
    });
    const shareText = "Check out this meme I created using MemeGen!";
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(memeDataURL)}`;
    window.open(shareUrl, '_blank');
}

// Share meme on Facebook
function shareOnFacebook() {
    const memeDataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
    });
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memeDataURL)}`;
    window.open(shareUrl, '_blank');
}

// Share meme on WhatsApp
function shareOnWhatsApp() {
    const memeDataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
    });
    const shareText = "Check out this meme I created using MemeGen!";
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + memeDataURL)}`;
    window.open(shareUrl, '_blank');
}

document.getElementById('upload-image').addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const fabricImg = new fabric.Image(img, {
                        left: 100 + i * 20,
                        top: 100 + i * 20,
                        scaleX: 0.5,
                        scaleY: 0.5,
                        selectable: true,
                        hasControls: true,
                    });

                    canvas.add(fabricImg);
                    fabricImg.bringToFront(); // Ensure uploaded image appears on top of the template
                    canvas.renderAll();
                    saveState(); // Save the current state to history
                };
            };

            reader.readAsDataURL(file);
        }
    }
});

// Initialize the meme generator
document.addEventListener('DOMContentLoaded', () => {
    fetchMeme();
    loadDefaultTemplate(); // Load a default template
});