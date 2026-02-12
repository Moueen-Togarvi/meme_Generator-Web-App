function toggleTheme() {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';

    htmlElement.classList.toggle('dark-mode', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}











let canvas;
let templates = [];
let history = [];
let historyIndex = -1;
let currentTemplateUrl = '';
let itemsPerPage = 12;
let displayedCount = 0;
let defaultTemplates = [
    { url: "https://i.imgflip.com/1g8my4.jpg", name: "Two Buttons" },
    { url: "https://i.imgflip.com/1ur9b0.jpg", name: "Drake Hotline Bling" },
    { url: "https://i.imgflip.com/1h7in3.jpg", name: "Change My Mind" },
    { url: "https://i.imgflip.com/1otk96.jpg", name: "Is This A Pigeon?" },
    { url: "https://i.imgflip.com/1yxk7k.jpg", name: "Surprised Pikachu" },
    { url: "https://i.imgflip.com/30b1gx.jpg", name: "Always Has Been" },
    { url: "https://i.imgflip.com/1e7ql7.jpg", name: "Roll Safe" },
    { url: "https://i.imgflip.com/1c1uej.jpg", name: "Mocking Spongebob" },
    { url: "https://i.imgflip.com/1o00in.jpg", name: "Gru's Plan" }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    fetchMeme();
    initTheme();

    // Initialize live preview after canvas is ready
    setTimeout(() => {
        initLivePreview();
    }, 2000);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Only delete if not currently typing in an input or IText element
            const activeEl = document.activeElement;
            const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
            const isEditingIText = canvas.getActiveObject() && canvas.getActiveObject().isEditing;

            if (!isInput && !isEditingIText) {
                removeText();
            }
        }
    });
});

// Initialize theme
function initTheme() {
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark-mode');
    } else {
        htmlElement.classList.remove('dark-mode');
    }

    updateThemeIcon(savedTheme);
}

function initCanvas() {
    const canvasEl = document.getElementById('meme-canvas');
    const container = canvasEl.parentElement;

    // Set responsive dimensions
    canvasEl.width = container.clientWidth;
    canvasEl.height = container.clientHeight;

    // Initialize Fabric.js canvas
    canvas = new fabric.Canvas('meme-canvas', {
        preserveObjectStacking: true,
        backgroundColor: '#f3f4f6'
    });

    // Store initial dimensions for scaling
    canvas.prevWidth = canvas.width;
    canvas.prevHeight = canvas.height;

    // Handle window resizing
    window.addEventListener('resize', handleResize);

    // Selection listeners for interactive editing
    canvas.on('selection:created', onObjectSelected);
    canvas.on('selection:updated', onObjectSelected);
    canvas.on('selection:cleared', onSelectionCleared);

    // Initial load
    loadRandomTemplate();
}

function onObjectSelected(options) {
    const selectedObject = options.selected ? options.selected[0] : options.target;
    if (selectedObject && (selectedObject.type === 'text' || selectedObject.type === 'i-text')) {
        // Sync UI with selected object properties
        const colorInput = document.getElementById('text-color');
        const sizeInput = document.getElementById('text-size');
        const sizeValue = document.getElementById('size-value');

        if (colorInput) colorInput.value = selectedObject.fill;
        if (sizeInput) sizeInput.value = selectedObject.fontSize;
        if (sizeValue) sizeValue.textContent = selectedObject.fontSize + 'px';
    }
}

function onSelectionCleared() {
    // Optional: Reset UI to defaults if needed
}

function handleResize() {
    const canvasEl = document.getElementById('meme-canvas');
    const container = canvasEl.parentElement;

    const objects = canvas.getObjects();
    const activeObject = canvas.getActiveObject();

    canvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight
    });

    const scaleX = canvas.width / canvas.prevWidth;
    const scaleY = canvas.height / canvas.prevHeight;

    objects.forEach(obj => {
        obj.scaleX *= scaleX;
        obj.scaleY *= scaleY;
        obj.left *= scaleX;
        obj.top *= scaleY;
        obj.setCoords();
    });

    if (activeObject) {
        canvas.setActiveObject(activeObject);
    }

    canvas.prevWidth = canvas.width;
    canvas.prevHeight = canvas.height;

    canvas.renderAll();
}

function loadRandomTemplate() {
    const randomIndex = Math.floor(Math.random() * defaultTemplates.length);
    loadMeme(defaultTemplates[randomIndex].url);
}



async function fetchMeme() {
    try {
        // Check if templates are already loaded
        if (templates.length > 0) {
            renderTemplates(templates.slice(0, 4));
            return;
        }

        const response = await fetch('/fetch-memes/', {
            timeout: 5000
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error_message || 'API returned unsuccessful response');
        }

        templates = data.data.memes;
        renderTemplates(templates);

    } catch (error) {
        console.error('Error fetching memes:', error);
        showNotification('Using offline templates (API error)', 'info');
        templates = defaultTemplates;
        renderTemplates(templates);
    }
}

function renderTemplates(templatesToRender) {
    const gallery = document.getElementById('meme-gallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    templatesToRender.forEach(meme => {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative group cursor-pointer aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 hover:border-brand-primary transition-all';
        wrapper.onclick = () => loadMeme(meme.url);

        const imgElement = document.createElement('img');
        imgElement.src = meme.url;
        imgElement.alt = meme.name || 'Meme template';
        imgElement.loading = 'lazy';
        imgElement.className = 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-500';

        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2';
        overlay.innerHTML = `<span class="text-[10px] text-white font-bold text-center leading-tight">${meme.name}</span>`;

        wrapper.appendChild(imgElement);
        wrapper.appendChild(overlay);
        gallery.appendChild(wrapper);
    });
}

function filterByTag(tag) {
    const query = tag.toLowerCase();
    const filtered = templates.filter(meme =>
        meme.name.toLowerCase().includes(query) ||
        (query === 'viral' && templates.indexOf(meme) < 20) // Heuristic for viral
    );
    renderTemplates(filtered);

    // Update search input to reflect tag
    const searchInput = document.getElementById('search-templates');
    if (searchInput) searchInput.value = '#' + tag;
}

function renderMoreTemplates() {
    renderTemplates();
}

function loadMeme(url) {
    fabric.Image.fromURL(url, img => {
        canvas.clear();

        // Calculate scale to fit canvas
        const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
        );

        img.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvas.width - img.width * scale) / 2,
            top: (canvas.height - img.height * scale) / 2,
            selectable: false,
            evented: false,
            name: 'background-image'
        });

        canvas.add(img);
        canvas.renderAll();
        currentTemplateUrl = url;
        saveState();
    }, { crossOrigin: 'anonymous' });
}





async function addTextToMeme() {
    try {
        const form = document.getElementById('meme-form');
        const topTextInput = document.getElementById('top-text');
        const bottomTextInput = document.getElementById('bottom-text');
        const color = document.getElementById('text-color').value;
        const size = parseInt(document.getElementById('text-size').value);

        if (!topTextInput) throw new Error('Top text input not found');
        if (!bottomTextInput) throw new Error('Bottom text input not found');

        let textAdded = false;

        // Add top text if it exists
        if (topTextInput.value.trim()) {
            addTextElement(topTextInput.value.trim(), {
                top: size * 0.5,
                fill: color,
                fontSize: size,
                originY: 'top'
            });
            textAdded = true;
        }

        // Add bottom text if it exists
        if (bottomTextInput.value.trim()) {
            addTextElement(bottomTextInput.value.trim(), {
                top: canvas.height - size * 1.5,
                fill: color,
                fontSize: size,
                originY: 'bottom'
            });
            textAdded = true;
        }

        // Reset inputs manually for better reliability
        if (textAdded) {
            topTextInput.value = '';
            bottomTextInput.value = '';
            // Clear live preview when adding permanent text
            clearLivePreview();
            saveState();
        } else {
            showNotification('Please enter some text', 'info');
        }
    } catch (error) {
        console.error('Error in addTextToMeme:', error);
        showErrorToUser(error.message || 'Failed to add text');
    }
}

// Live Preview System
let livePreviewEnabled = true;
let previewTexts = {
    top: null,
    bottom: null
};

function initLivePreview() {
    console.log('Initializing live preview...');

    // Check if canvas is ready
    if (!canvas) {
        console.log('Canvas not ready, retrying...');
        setTimeout(initLivePreview, 1000);
        return;
    }

    console.log('Canvas is ready, setting up live preview...');

    // Add event listeners for live preview
    const topTextInput = document.getElementById('top-text');
    const bottomTextInput = document.getElementById('bottom-text');
    const textColorInput = document.getElementById('text-color');
    const textSizeInput = document.getElementById('text-size');

    if (topTextInput) {
        topTextInput.addEventListener('input', () => updateLivePreview('top'));
        topTextInput.addEventListener('keyup', () => updateLivePreview('top'));
    }

    if (bottomTextInput) {
        bottomTextInput.addEventListener('input', () => updateLivePreview('bottom'));
        bottomTextInput.addEventListener('keyup', () => updateLivePreview('bottom'));
    }

    if (textColorInput) {
        textColorInput.addEventListener('input', () => updateLivePreviewColor());
        textColorInput.addEventListener('change', () => updateLivePreviewColor());
    }

    if (textSizeInput) {
        textSizeInput.addEventListener('input', () => updateLivePreviewSize());
        textSizeInput.addEventListener('change', () => updateLivePreviewSize());
    }

    console.log('Live preview initialized successfully');
}

// Test function for live preview
function testLivePreview() {
    console.log('Testing live preview...');
    console.log('Canvas available:', !!canvas);
    console.log('Live preview enabled:', livePreviewEnabled);

    // Add some test text
    document.getElementById('top-text').value = 'Test Top Text';
    document.getElementById('bottom-text').value = 'Test Bottom Text';

    // Trigger live preview
    updateLivePreview('top');
    updateLivePreview('bottom');
}

function updateLivePreview(type) {
    if (!livePreviewEnabled || !canvas) return;

    const textInput = document.getElementById(`${type}-text`);
    const textColor = document.getElementById('text-color').value;
    const textSize = parseInt(document.getElementById('text-size').value);

    if (!textInput || !textInput.value.trim()) {
        // Remove existing preview text if input is empty
        if (previewTexts[type]) {
            canvas.remove(previewTexts[type]);
            previewTexts[type] = null;
        }
        return;
    }

    // Remove existing preview text
    if (previewTexts[type]) {
        canvas.remove(previewTexts[type]);
    }

    // Create new preview text
    const textObj = new fabric.IText(textInput.value.trim(), {
        left: canvas.width / 2,
        top: type === 'top' ? textSize * 0.5 : canvas.height - textSize * 1.5,
        fill: textColor,
        fontSize: textSize,
        fontFamily: 'Impact, sans-serif',
        fontWeight: 'bold',
        originX: 'center',
        originY: type === 'top' ? 'top' : 'bottom',
        textAlign: 'center',
        editable: false,
        padding: 5,
        shadow: 'rgba(0,0,0,0.5) 2px 2px 2px',
        name: `preview-${type}`,
        opacity: 0.8
    });

    canvas.add(textObj);
    textObj.bringToFront();
    previewTexts[type] = textObj;
    canvas.renderAll();
}

function updateLivePreviewColor() {
    if (!livePreviewEnabled || !canvas) return;

    const textColor = document.getElementById('text-color').value;

    // Update existing preview texts
    Object.keys(previewTexts).forEach(type => {
        if (previewTexts[type]) {
            previewTexts[type].set('fill', textColor);
        }
    });

    // Apply to active object if it's text
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text')) {
        activeObject.set('fill', textColor);
        saveState();
    }

    canvas.renderAll();
}

function updateLivePreviewSize() {
    if (!livePreviewEnabled || !canvas) return;

    const textSize = parseInt(document.getElementById('text-size').value);

    // Update existing preview texts
    Object.keys(previewTexts).forEach(type => {
        if (previewTexts[type]) {
            previewTexts[type].set('fontSize', textSize);
            // Update position based on type
            if (type === 'top') {
                previewTexts[type].set('top', textSize * 0.5);
            } else {
                previewTexts[type].set('top', canvas.height - textSize * 1.5);
            }
        }
    });

    // Apply to active object if it's text
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text')) {
        activeObject.set('fontSize', textSize);
        saveState();
    }

    canvas.renderAll();
}

function clearLivePreview() {
    Object.keys(previewTexts).forEach(type => {
        if (previewTexts[type]) {
            canvas.remove(previewTexts[type]);
            previewTexts[type] = null;
        }
    });
    canvas.renderAll();
}

function toggleLivePreview() {
    livePreviewEnabled = !livePreviewEnabled;
    const toggle = document.getElementById('live-preview-toggle');

    if (livePreviewEnabled) {
        // Enable live preview
        toggle.classList.remove('bg-gray-300');
        toggle.classList.add('bg-indigo-600');
        toggle.querySelector('span').classList.remove('translate-x-0');
        toggle.querySelector('span').classList.add('translate-x-6');
        // Update existing previews
        updateLivePreview('top');
        updateLivePreview('bottom');
    } else {
        // Disable live preview
        toggle.classList.remove('bg-indigo-600');
        toggle.classList.add('bg-gray-300');
        toggle.querySelector('span').classList.remove('translate-x-6');
        toggle.querySelector('span').classList.add('translate-x-0');
        clearLivePreview();
    }
}






function addTextElement(text, options) {
    const textObj = new fabric.IText(text, {
        left: canvas.width / 2,
        top: options.top,
        fill: options.fill,
        fontSize: options.fontSize,
        fontFamily: 'Impact, sans-serif',
        fontWeight: 'bold',
        // stroke: '#000000',
        // strokeWidth: 2,
        originX: 'center',
        originY: options.originY,
        textAlign: 'center',
        editable: true,
        padding: 5,
        shadow: 'rgba(0,0,0,0.5) 2px 2px 2px',
        name: 'meme-text'
    });

    canvas.add(textObj);
    textObj.bringToFront();
    saveState();
}



function removeText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Don't allow deleting the background image if we want to be safe
        if (activeObject.name === 'background-image') return;

        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        saveState();
    }
}

function addSticker(emoji) {
    const sticker = new fabric.Text(emoji, {
        left: canvas.width / 2,
        top: canvas.height / 2,
        fontSize: 50,
        fill: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        padding: 5,
        shadow: 'rgba(0,0,0,0.3) 2px 2px 5px',
        name: 'sticker'
    });

    canvas.add(sticker);
    sticker.bringToFront();
    canvas.setActiveObject(sticker);
    saveState();
}

function saveState() {
    // Limit history to 20 states
    if (history.length >= 20) {
        history.shift();
        historyIndex = Math.max(historyIndex - 1, 0);
    }

    // If we're not at the end of history, remove future states
    if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
    }

    history.push(JSON.stringify(canvas.toJSON()));
    historyIndex = history.length - 1;
}

function undoAction() {
    if (historyIndex > 0) {
        historyIndex--;
        loadStateFromHistory();
    }
}

function redoAction() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadStateFromHistory();
    }
}

function loadStateFromHistory() {
    canvas.loadFromJSON(history[historyIndex], () => {
        canvas.renderAll();
    });
}

function downloadMeme() {
    // Temporarily disable selection on background
    const bg = canvas.getObjects().find(obj => obj.name === 'background-image');
    if (bg) {
        bg.selectable = false;
        bg.evented = false;
    }

    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2 // Higher resolution
    });

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Restore background properties
    if (bg) {
        bg.selectable = false;
        bg.evented = false;
    }
}


function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const notification = document.createElement('div');

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-indigo-500'
    };

    notification.className = `${bgColors[type] || bgColors.info} text-white px-6 py-3 rounded-xl shadow-xl mb-4 transform translate-y-10 opacity-0 transition-all duration-300 flex items-center space-x-2`;

    const icon = {
        success: 'check_circle',
        error: 'error',
        info: 'info'
    }[type] || 'info';

    notification.innerHTML = `
        <span class="material-symbols-outlined text-sm font-bold">${icon}</span>
        <span class="font-bold text-sm">${message}</span>
    `;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center';
    document.body.appendChild(container);
    return container;
}

// Template Gallery Functions
function openTemplateGallery() {
    const modal = document.getElementById('template-gallery');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderTemplateList(templates.length ? templates : defaultTemplates);
}

function closeTemplateGallery() {
    const modal = document.getElementById('template-gallery');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function renderTemplateList(templates) {
    const list = document.getElementById('template-list');
    list.innerHTML = '';

    templates.forEach(meme => {
        const item = document.createElement('div');
        item.classList.add('cursor-pointer');
        item.onclick = () => {
            loadMeme(meme.url);
            closeTemplateGallery();
        };

        const img = document.createElement('img');
        img.src = meme.url;
        img.alt = meme.name || 'Meme template';
        img.classList.add('w-full', 'h-32', 'object-cover', 'rounded-lg', 'hover:ring-2', 'hover:ring-indigo-500');

        const name = document.createElement('p');
        name.textContent = meme.name || 'Meme template';
        name.classList.add('text-sm', 'text-center', 'mt-2', 'truncate');

        item.appendChild(img);
        item.appendChild(name);
        list.appendChild(item);
    });
}

function filterTemplates(category) {
    if (category === 'all') {
        renderTemplateList(templates.length ? templates : defaultTemplates);
        return;
    }

    const filtered = (templates.length ? templates : defaultTemplates).filter(meme =>
        meme.name.toLowerCase().includes(category.toLowerCase())
    );
    renderTemplateList(filtered);
}

document.getElementById('search-templates').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().replace('#', '');
    const filtered = templates.filter(meme =>
        meme.name.toLowerCase().includes(query)
    );
    renderTemplates(filtered);
});

// Image Upload
document.getElementById('upload-image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, img => {
            // Calculate scale to fit within canvas
            const maxWidth = canvas.width * 0.8;
            const maxHeight = canvas.height * 0.8;
            let scale = Math.min(
                maxWidth / img.width,
                maxHeight / img.height
            );

            img.set({
                left: (canvas.width - img.width * scale) / 2,
                top: (canvas.height - img.height * scale) / 2,
                scaleX: scale,
                scaleY: scale,
                selectable: true,
                hasControls: true,
                name: 'uploaded-image'
            });

            canvas.add(img);
            img.bringToFront();
            canvas.setActiveObject(img);
            saveState();
        });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
});

// Social Sharing (simplified)
function shareOnTwitter() {
    const text = "Check out this meme I created!";
    const url = canvas.toDataURL('png');
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnFacebook() {
    const url = canvas.toDataURL('png');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnWhatsApp() {
    const text = "Check out this meme I created!";
    const url = canvas.toDataURL('png');
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
}

//  error handling by moeen

function createErrorDisplay() {
    const div = document.createElement('div');
    div.id = 'error-message';
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.padding = '15px';
    div.style.backgroundColor = '#ff4444';
    div.style.color = 'white';
    div.style.borderRadius = '5px';
    div.style.zIndex = '1000';
    div.style.display = 'none';
    document.body.appendChild(div);
    return div;
}





// Professional icon data using Material Symbols
const iconData = {
    "Popular": [
        { name: "mood", text: "😊" },
        { name: "sentiment_very_satisfied", text: "😄" },
        { name: "mood_bad", text: "😞" },
        { name: "sentiment_dissatisfied", text: "😒" },
        { name: "mood_happy", text: "😀" },
        { name: "sentiment_neutral", text: "😐" },
        { name: "mood_sad", text: "😢" },
        { name: "sentiment_very_dissatisfied", text: "😡" },
        { name: "mood_angry", text: "😠" },
        { name: "mood_surprised", text: "😮" }
    ],
    "Actions": [
        { name: "thumb_up", text: "👍" },
        { name: "thumb_down", text: "👎" },
        { name: "favorite", text: "❤️" },
        { name: "favorite_border", text: "🤍" },
        { name: "star", text: "⭐" },
        { name: "star_border", text: "☆" },
        { name: "check_circle", text: "✅" },
        { name: "cancel", text: "❌" },
        { name: "add_circle", text: "➕" },
        { name: "remove_circle", text: "➖" }
    ],
    "Objects": [
        { name: "home", text: "🏠" },
        { name: "work", text: "💼" },
        { name: "school", text: "🎓" },
        { name: "phone", text: "📱" },
        { name: "computer", text: "💻" },
        { name: "camera", text: "📷" },
        { name: "music_note", text: "🎵" },
        { name: "sports", text: "⚽" },
        { name: "restaurant", text: "🍽️" },
        { name: "local_cafe", text: "☕" }
    ],
    "Symbols": [
        { name: "favorite", text: "❤️" },
        { name: "star", text: "⭐" },
        { name: "check_circle", text: "✅" },
        { name: "cancel", text: "❌" },
        { name: "warning", text: "⚠️" },
        { name: "info", text: "ℹ️" },
        { name: "lightbulb", text: "💡" },
        { name: "flash_on", text: "⚡" },
        { name: "fire", text: "🔥" },
        { name: "water_drop", text: "💧" }
    ]
};

// Sticker data - using OpenMoji (no API key needed)
const stickerData = {
    "Objects": ["1F4A1", "1F4BB", "1F4F7", "1F4F1", "1F4FA"].map(code =>
        `https://openmoji.org/data/color/svg/${code}.svg`
    ),
    "Nature": ["1F338", "1F332", "1F33B", "1F341", "1F343"].map(code =>
        `https://openmoji.org/data/color/svg/${code}.svg`
    ),
    "Symbols": ["1F535", "1F7E2", "2B55", "1F534", "1F7E0"].map(code =>
        `https://openmoji.org/data/color/svg/${code}.svg`
    )
};
//   function getStickerUrl(code) {
//     return `https://openmoji.org/data/color/svg/${code}.svg`;
//   }

// Initialize picker
function initPicker() {
    document.getElementById('picker-search').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        if (currentPickerType === 'emoji') searchEmojis(query);
        else searchStickers(query);
    });
}

let currentPickerType = 'emoji';

function openPicker(type) {
    currentPickerType = type;
    const modal = document.getElementById('picker-modal');
    const title = document.getElementById('picker-title');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (type === 'emoji') {
        title.textContent = 'Select Emoji';
        renderEmojiCategories();
        renderEmojis();
    } else {
        title.textContent = 'Select Sticker';
        renderStickerCategories();
        renderStickers();
    }
}

function closePicker() {
    document.getElementById('picker-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function renderEmojiCategories() {
    const container = document.getElementById('picker-categories');
    container.innerHTML = '';

    Object.keys(emojiData).forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category;
        btn.className = 'px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full';
        btn.onclick = () => renderEmojis(category);
        container.appendChild(btn);
    });
}

function renderStickerCategories() {
    const container = document.getElementById('picker-categories');
    container.innerHTML = '';

    Object.keys(stickerData).forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category;
        btn.className = 'px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full';
        btn.onclick = () => renderStickers(category);
        container.appendChild(btn);
    });
}

function renderEmojis(category = 'Popular') {
    const container = document.getElementById('picker-content');
    container.innerHTML = '';

    emojiData[category].forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.className = 'text-2xl p-2 hover:bg-gray-100 rounded-lg';
        btn.onclick = () => {
            addToCanvas(emoji, false);
            closePicker();
        };
        container.appendChild(btn);
    });
}

function renderStickers(category = 'Objects') {
    const container = document.getElementById('picker-content');
    container.innerHTML = '';

    stickerData[category].forEach(code => {
        const url = getStickerUrl(code);
        const btn = document.createElement('button');
        btn.className = 'p-1 hover:bg-gray-100 rounded-lg';

        const img = document.createElement('img');
        img.src = url;
        img.className = 'w-8 h-8';
        img.crossOrigin = 'anonymous';

        btn.appendChild(img);
        btn.onclick = () => {
            addToCanvas(url, true);
            closePicker();
        };
        container.appendChild(btn);
    });
}

function searchEmojis(query) {
    const container = document.getElementById('picker-content');
    container.innerHTML = '';

    if (!query) {
        renderEmojis();
        return;
    }

    Object.values(emojiData).flat().forEach(emoji => {
        if (emoji.includes(query)) {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.className = 'text-2xl p-2 hover:bg-gray-100 rounded-lg';
            btn.onclick = () => {
                addToCanvas(emoji, false);
                closePicker();
            };
            container.appendChild(btn);
        }
    });
}

function searchStickers(query) {
    const container = document.getElementById('picker-content');
    container.innerHTML = '';

    if (!query) {
        renderStickers();
        return;
    }

    Object.values(stickerData).flat().forEach(code => {
        if (code.toLowerCase().includes(query)) {
            const url = getStickerUrl(code);
            const btn = document.createElement('button');
            btn.className = 'p-1 hover:bg-gray-100 rounded-lg';

            const img = document.createElement('img');
            img.src = url;
            img.className = 'w-8 h-8';
            img.crossOrigin = 'anonymous';

            btn.appendChild(img);
            btn.onclick = () => {
                addToCanvas(url, true);
                closePicker();
            };
            container.appendChild(btn);
        }
    });
}

// Add to canvas - WORKING SOLUTION
function addToCanvas(content, isImage) {
    if (isImage) {
        fabric.Image.fromURL(content, img => {
            // Set maximum size to 30% of canvas
            const maxSize = Math.min(canvas.width, canvas.height) * 0.3;
            const scale = maxSize / Math.max(img.width, img.height);

            img.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: true
            });
            canvas.add(img);
            canvas.setActiveObject(img);
        }, {
            crossOrigin: 'anonymous' // Important for CDN images
        });
    } else {
        // For emojis
        const text = new fabric.IText(content, {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontSize: 40,
            fontFamily: 'Arial, sans-serif',
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    }
    saveState();
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initPicker);


