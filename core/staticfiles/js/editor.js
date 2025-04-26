function toggleTheme() {
    const htmlElement = document.documentElement;
    const isLight = htmlElement.classList.contains('light-mode');
    const newTheme = isLight ? 'dark' : 'light';

    htmlElement.classList.toggle('light-mode', newTheme === 'light');
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

    document.addEventListener('DOMContentLoaded', function () {
        const htmlElement = document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'dark';
    
        if (savedTheme === 'light') {
            htmlElement.classList.add('light-mode');
        } else {
            htmlElement.classList.remove('light-mode');
        }
    
        updateThemeIcon(savedTheme);
    });

});

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
    
    // Load a random default template
    loadRandomTemplate();
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
      const response = await fetch('https://api.imgflip.com/get_memes');
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error_message || 'API returned unsuccessful response');
      }
      
      templates = data.data.memes;
      renderTemplates(templates.slice(0, 4));
      
    } catch (error) {
      console.error('Error fetching memes:', error);
      showErrorToUser('Failed to load templates. Using default memes.');
      templates = defaultTemplates;
      renderTemplates(templates.slice(0, 4));
    }
  }



function renderTemplates(templates) {
    const gallery = document.getElementById('meme-gallery');
    gallery.innerHTML = '';
    
    templates.forEach(meme => {
        const imgElement = document.createElement('img');
        imgElement.src = meme.url;
        imgElement.alt = meme.name || 'Meme template';
        imgElement.classList.add('w-96', 'h-40', 'object-cover', 'cursor-pointer', 'rounded-lg', 'hover:ring-2', 'hover:ring-indigo-500');
        imgElement.onclick = () => loadMeme(meme.url);
        gallery.appendChild(imgElement);
    });
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

        // Reset the form (clears all inputs)
        if (textAdded) {
            form.reset();
            document.getElementById('text-color').value = '#ffffff';
            document.getElementById('text-size').value = '30';
        } else {
            alert('Please enter some text in either field');
        }
    } catch (error) {
        console.error('Error in addTextToMeme:', error);
        showErrorToUser(error.message || 'Failed to add text');
    }
}
  
  




function addTextElement(text, options) {
    const textObj = new fabric.Text(text, {
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


// function addTextElement(text, options) {
//     const textObj = new fabric.Text(text, {
//         left: canvas.width / 2,
//         top: options.top,
//         fill: options.fill || '#ffffff',
//         fontSize: options.fontSize || 30,
//         fontFamily: 'Impact, sans-serif',
//         fontWeight: 'bold',
//         stroke: '#000000',
//         strokeWidth: 2,
//         originX: 'center',
//         originY: options.originY || 'top',
//         textAlign: 'center',
//         editable: true,
//         padding: 5,
//         shadow: 'rgba(0,0,0,0.5) 2px 2px 2px',
//         name: 'meme-text'
//     });

//     canvas.add(textObj);
//     textObj.bringToFront();
//     saveState();
// }

function removeText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
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
    const term = e.target.value.toLowerCase();
    const filtered = (templates.length ? templates : defaultTemplates).filter(meme => 
        meme.name.toLowerCase().includes(term)
    );
    renderTemplateList(filtered);
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





// emojis 

const emojiData = {
    "Smileys & Emotion": ["😀","😃","😄","😁","😆","😅","😂","🤣","🥲","🥹","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🫣","🤗","🫡","🤔","🫢","🤭","🤫","🤥","😶","😶‍🌫️","😐","😑","😬","🫠","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","😵‍💫","🫥","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾"],
    "People & Body": ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","🫵","🫱","🫲","🫳","🫴","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🫶","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","🫦","👶","🧒","👦","👧","🧑","👱","👨","🧔","👨‍🦰","👨‍🦱","👨‍🦳","👨‍🦲","👩","👩‍🦰","👩‍🦱","👩‍🦳","👩‍🦲","🧓","👴","👵","🙍","🙍‍♂️","🙍‍♀️","🙎","🙎‍♂️","🙎‍♀️","🙅","🙅‍♂️","🙅‍♀️","🙆","🙆‍♂️","🙆‍♀️","💁","💁‍♂️","💁‍♀️","🙋","🙋‍♂️","🙋‍♀️","🧏","🧏‍♂️","🧏‍♀️","🙇","🙇‍♂️","🙇‍♀️","🤦","🤦‍♂️","🤦‍♀️","🤷","🤷‍♂️","🤷‍♀️","👮","👮‍♂️","👮‍♀️","🕵️","🕵️‍♂️","🕵️‍♀️","💂","💂‍♂️","💂‍♀️","🥷","👷","👷‍♂️","👷‍♀️","🫅","🤴","👸","👳","👳‍♂️","👳‍♀️","👲","🧕","🤵","🤵‍♂️","🤵‍♀️","👰","👰‍♂️","👰‍♀️","🫃","🫄","🤰","🤱","👩‍🍼","👨‍🍼","🧑‍🍼","👼","🎅","🤶","🧑‍🎄","🦸","🦸‍♂️","🦸‍♀️","🦹","🦹‍♂️","🦹‍♀️","🧙","🧙‍♂️","🧙‍♀️","🧚","🧚‍♂️","🧚‍♀️","🧛","🧛‍♂️","🧛‍♀️","🧜","🧜‍♂️","🧜‍♀️","🧝","🧝‍♂️","🧝‍♀️","🧞","🧞‍♂️","🧞‍♀️","🧟","🧟‍♂️","🧟‍♀️","🧌","💆","💆‍♂️","💆‍♀️","💇","💇‍♂️","💇‍♀️","🚶","🚶‍♂️","🚶‍♀️","🧍","🧍‍♂️","🧍‍♀️","🧎","🧎‍♂️","🧎‍♀️","🏃","🏃‍♂️","🏃‍♀️","💃","🕺","🕴️","👯","👯‍♂️","👯‍♀️","🧖","🧖‍♂️","🧖‍♀️","🧗","🧗‍♂️","🧗‍♀️","🤺","🏇","⛷️","🏂","🪂","🏌️","🏌️‍♂️","🏌️‍♀️","🏄","🏄‍♂️","🏄‍♀️","🚣","🚣‍♂️","🚣‍♀️","🏊","🏊‍♂️","🏊‍♀️","⛹️","⛹️‍♂️","⛹️‍♀️","🏋️","🏋️‍♂️","🏋️‍♀️","🚴","🚴‍♂️","🚴‍♀️","🚵","🚵‍♂️","🚵‍♀️","🤸","🤸‍♂️","🤸‍♀️","🤼","🤼‍♂️","🤼‍♀️","🤽","🤽‍♂️","🤽‍♀️","🤾","🤾‍♂️","🤾‍♀️","🤹","🤹‍♂️","🤹‍♀️","🧘","🧘‍♂️","🧘‍♀️","🛀","🛌","🧑‍🤝‍🧑","👭","👫","👬","💏","👩‍❤️‍💋‍👨","👨‍❤️‍💋‍👨","👩‍❤️‍💋‍👩","💑","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩","👪","👨‍👩‍👦","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👨‍👨‍👦","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👨‍👨‍👧‍👧","👩‍👩‍👦","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👩‍👩‍👧‍👧","👨‍👦","👨‍👦‍👦","👨‍👧","👨‍👧‍👦","👨‍👧‍👧","👩‍👦","👩‍👦‍👦","👩‍👧","👩‍👧‍👦","👩‍👧‍👧","🪢","🪮","🧶","🧵","🪡","🧥","🥼","🦺","👚","👕","👖","🩲","🩳","👔","👗","👙","🩱","👘","🥻","🩴","👠","👡","👢","👞","👟","🥾","🥿","🧦","🧤","🧣","🎩","🧢","👒","🎓","⛑️","🪖","👑","💍","👝","👛","👜","💼","🎒","🩴","👓","🕶️","🥽","🦯","🧳","🌂","🪄","💊","🩹","🩺","🧬","🦠","🧴","🧷","🪒","🧹","🧺","🧻","🪣","🧼","🪥","🧽","🧯","🛒","🛁","🪤","🪒","🔪","🏺"],
    "Animals & Nature": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🦟","🦗","🕷️","🕸️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔","🌵","🎄","🌲","🌳","🌴","🪵","🌱","🌿","☘️","🍀","🎍","🪴","🎋","🍃","🍂","🍁","🍄","🐚","🪨","🌾","💐","🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌎","🌍","🌏","🪐","💫","⭐","🌟","✨","⚡","☄️","💥","🔥","🌪️","🌈","☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","💧","💦","🫧","☔","☂️","🌊","🌫️"],
    "Food & Drink": ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🫘","🍯","🥛","🍼","🫖","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🫗","🍸","🍹","🍾","🧊","🥄","🍴","🍽️","🥣","🥡","🥢","🫙","🧂"],
    "Travel & Places": ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🦯","🦽","🦼","🛴","🚲","🛵","🏍️","🛺","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️","🛫","🛬","🛩️","💺","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢","⚓","🪝","⛽","🚧","🚦","🚥","🛑","🚏","🗺️","🗿","🗽","🗼","🏰","🏯","🏟️","🎡","🎢","🎠","⛲","⛱️","🏖️","🏝️","🏜️","🌋","⛰️","🏔️","🗻","🏕️","⛺","🛖","🏠","🏡","🏘️","🏚️","🏗️","🏭","🏢","🏬","🏣","🏤","🏥","🏦","🏨","🏪","🏫","🏩","💒","🏛️","⛪","🕌","🛕","🕍","🗾","🎑","🏞️","🌅","🌄","🌠","🎇","🎆","🌇","🌆","🏙️","🌃","🌌","🌉","🛣️","🛤️","🪨","🛢️","⛲","🎪","🎭","🖼️","🎨","🧵","🪡","🧶","🪢","👓","🕶️","🥽","🥼","🦺","👔","👕","👖","🧣","🧤","🧥","🧦","👗","👘","🥻","🩱","🩲","🩳","👙","👚","👛","👜","👝","🛍️","🎒","🩴","👞","👟","🥾","🥿","👠","👡","🩰","👢","👑","👒","🎩","🎓","🧢","🪖","⛑️","💄","💍","💼"],
    "Activities": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎯","🪀","🪂","🎱","🎮","🕹️","🎰","🎲","🧩","🪅","🪆","♟️","🀄","🎴","🎭","🖼️","🎨","🧵","🪡","🧶","🪢","🧵","🪡","🧶","🪢","🧵","🪡","🧶","🪢","🧵","🪡","🧶","🪢"],
    "Objects": ["⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","⏳","📡","🔋","🔌","💡","🔦","🕯️","🪔","🧯","🛢️","💸","💵","💴","💶","💷","💰","💳","🧾","✉️","📧","📨","📩","📤","📥","📦","📫","📪","📬","📭","📮","🗳️","✏️","✒️","🖋️","🖊️","🖌️","🖍️","📝","💼","📁","📂","🗂️","📅","📆","🗒️","🗓️","📇","📈","📉","📊","📋","📌","📍","📎","🖇️","📏","📐","✂️","🗃️","🗄️","🗑️","🔒","🔓","🔏","🔐","🔑","🗝️","🔨","🪓","⛏️","⚒️","🛠️","🗡️","⚔️","🔫","🪃","🏹","🛡️","🪚","🔧","🪛","🔩","⚙️","🗜️","⚖️","🦯","🔗","⛓️","🪝","🧰","🧲","🪜","⚗️","🧪","🧫","🧬","🔬","🔭","📡","💉","🩸","💊","🩹","🩺","🚪","🛏️","🛋️","🪑","🚽","🪠","🚿","🛁","🪤","🪒","🧴","🧷","🧹","🧺","🧻","🪣","🧼","🪥","🧽","🧯","🛒"],
    "Symbols": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🪯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭","❗","❕","❓","❔","‼️","⁉️","🔅","🔆","〽️","⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯","💹","❇️","✳️","❎","🌐","💠","Ⓜ️","🌀","💤","🏧","🚾","♿","🅿️","🈳","🈂️","🛂","🛃","🛄","🛅","🚹","🚺","🚼","🚻","🚮","🎦","📶","🈁","🔣","ℹ️","🔤","🔡","🔠","🆖","🆗","🆙","🆒","🆕","🆓","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","#️⃣","*️⃣","⏏️","▶️","⏸","⏯","⏹","⏺","⏭","⏮","⏩","⏪","⏫","⏬","◀️","🔼","🔽","➡️","⬅️","⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","↪️","↩️","⤴️","⤵️","🔀","🔁","🔂","🔄","🔃","🎵","🎶","➕","➖","➗","✖️","♾","💲","💱","™️","©️","®️","〰️","➰","➿","🔚","🔙","🔛","🔝","🔜","✔️","☑️","🔘","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔺","🔻","🔸","🔹","🔶","🔷","🔳","🔲","▪️","▫️","◾","◽","◼️","◻️","🟥","🟧","🟨","🟩","🟦","🟪","🟫","⬛","⬜","🔈","🔇","🔉","🔊","🔔","🔕","📣","📢","💬","💭","🗯","♠️","♣️","♥️","♦️","🃏","🎴","🀄","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛","🕜","🕝","🕞","🕟","🕠","🕡","🕢","🕣","🕤","🕥","🕦","🕧"]
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
    document.getElementById('picker-search').addEventListener('input', function() {
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
  
  function renderEmojis(category = 'Smileys') {
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
      const text = new fabric.Text(content, {
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


