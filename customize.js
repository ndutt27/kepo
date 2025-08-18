document.addEventListener('DOMContentLoaded', function() {
    
    // --- Element References ---
    const photoCustomPreview = document.getElementById('photoPreview');
    const frameButtonsContainer = document.getElementById('frame-buttons-container');
    const shapeButtonsContainer = document.getElementById('shape-buttons-container');
    const stickerButtonsContainer = document.getElementById('sticker-buttons-container');
    const logoButtonsContainer = document.getElementById('logo-buttons-container');
    const dateCheckbox = document.getElementById('dateCheckbox');
    const dateTimeCheckbox = document.getElementById('dateTimeCheckbox');
    const logoColorPicker = document.getElementById('logoColorPicker');

    // --- State Variables ---
    let assetsData = null;
    let selectedShape = 'default';
    let selectedStickerLayout = null;
    let selectedText = 'pictlord';
    let backgroundType = 'color';
    let backgroundColor = '#FFFFFF';
    let backgroundImage = null;
    let textColor = '#E28585';

    // --- Main Initialization ---
    const init = async () => {
        try {
            const response = await fetch('assets.json?v=' + Date.now());
            if (!response.ok) throw new Error('Failed to load assets.json');
            assetsData = await response.json();

            renderFrameButtons();
            renderShapeButtons();
            renderStickerButtons();
            renderLogoButtons();

            setupEventListeners();

            // Initial draw after a short delay to ensure everything is ready
            setTimeout(redrawCanvas, 100);

        } catch (error) {
            console.error("Initialization failed:", error);
            if(photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Gagal memuat aset kustomisasi.</p>';
        }
    };

    // --- Rendering Functions ---
    const renderFrameButtons = () => {
        if (!assetsData.frames || !frameButtonsContainer) return;

        // Color Picker
        const colorPickerBtn = document.createElement('button');
        colorPickerBtn.id = 'colorPickerBtn';
        colorPickerBtn.className = 'neumorphic-btn buttonFrames';
        frameButtonsContainer.appendChild(colorPickerBtn);
        const picker = new Picker({
            parent: colorPickerBtn,
            popup: 'bottom',
            color: '#FFFFFF',
            onChange: (color) => setBackground({ type: 'color', value: color.hex }),
            onDone: (color) => { colorPickerBtn.style.backgroundColor = color.hex; }
        });
        colorPickerBtn.addEventListener('click', () => picker.show());

        // Color Buttons
        assetsData.frames.colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonFrames';
            btn.style.backgroundColor = color.value;
            btn.dataset.type = 'color';
            btn.dataset.value = color.value;
            frameButtonsContainer.appendChild(btn);
        });

        // Image Buttons
        assetsData.frames.images.forEach(frame => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonBgFrames';
            btn.style.backgroundImage = `url(${frame.path})`;
            btn.dataset.type = 'image';
            btn.dataset.src = frame.path;
            frameButtonsContainer.appendChild(btn);
        });
    };

    const renderShapeButtons = () => {
        if (!assetsData.shapes || !shapeButtonsContainer) return;
        assetsData.shapes.forEach(shape => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonShapes';
            btn.dataset.shape = shape.value;
            btn.innerHTML = `<img src="${shape.icon}" alt="${shape.name}" class="btnShapeSize"><span class="tooltip-text">${shape.name}</span>`;
            shapeButtonsContainer.appendChild(btn);
        });
    };

    const renderStickerButtons = () => {
        if (!assetsData.stickers || !stickerButtonsContainer) return;
        stickerButtonsContainer.innerHTML = '';
        assetsData.stickers.forEach(sticker => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonStickers';
            btn.dataset.sticker = sticker.layout;
            btn.innerHTML = `<img src="${sticker.icon}" alt="${sticker.name}" class="stickerIconSize">`;
            if(sticker.layout === null) btn.classList.add('active'); // Activate 'none' sticker
            stickerButtonsContainer.appendChild(btn);
        });
    };
    
    const renderLogoButtons = () => {
        if (!assetsData.logos || !logoButtonsContainer) return;
        assetsData.logos.forEach((logo, index) => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn logoCustomBtn';
            if(index === 0) btn.classList.add('active'); // Activate first logo by default
            btn.dataset.text = logo.value;
            btn.textContent = logo.name;
            logoButtonsContainer.appendChild(btn);
        });
    };

    // --- Event Handling ---
    const setupEventListeners = () => {
        frameButtonsContainer.addEventListener('click', handleFrameClick);
        shapeButtonsContainer.addEventListener('click', handleShapeClick);
        stickerButtonsContainer.addEventListener('click', handleStickerClick);
        logoButtonsContainer.addEventListener('click', handleLogoClick);

        dateCheckbox.addEventListener('change', redrawCanvas);
        dateTimeCheckbox.addEventListener('change', redrawCanvas);
        logoColorPicker.addEventListener('input', (e) => {
            textColor = e.target.value;
            redrawCanvas();
        });
    };

    function handleFrameClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn || btn.id === 'colorPickerBtn') return;

        const type = btn.dataset.type;
        if (type === 'color') {
            setBackground({ type: 'color', value: btn.dataset.value });
        } else if (type === 'image') {
            setBackground({ type: 'image', src: btn.dataset.src });
        }

        frameButtonsContainer.querySelectorAll('.neumorphic-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    function handleShapeClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn) return;
        selectedShape = btn.dataset.shape;
        shapeButtonsContainer.querySelectorAll('.neumorphic-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        redrawCanvas();
    }

    function handleStickerClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn) return;

        const clickedStickerLayout = btn.dataset.sticker === 'null' ? null : btn.dataset.sticker;

        // If the same sticker is clicked, deselect it. Otherwise, select the new one.
        if (selectedStickerLayout === clickedStickerLayout) {
            selectedStickerLayout = null;
        } else {
            selectedStickerLayout = clickedStickerLayout;
        }

        // Update active states
        stickerButtonsContainer.querySelectorAll('.neumorphic-btn').forEach(b => {
            const layout = b.dataset.sticker === 'null' ? null : b.dataset.sticker;
            b.classList.toggle('active', selectedStickerLayout === layout);
        });
        
        // Ensure 'none' is active if nothing is selected
        if (selectedStickerLayout === null) {
             const noneBtn = stickerButtonsContainer.querySelector('[data-sticker="null"]');
             if(noneBtn) noneBtn.classList.add('active');
        }

        redrawCanvas();
    }

    function handleLogoClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn) return;
        selectedText = btn.dataset.text;
        logoButtonsContainer.querySelectorAll('.neumorphic-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        redrawCanvas();
    }

    // --- State Update Functions ---
    function setBackground(option) {
        if (option.type === 'color') {
            backgroundType = 'color';
            backgroundColor = option.value;
            backgroundImage = null;
            redrawCanvas();
        } else if (option.type === 'image') {
            backgroundType = 'image';
            backgroundImage = new Image();
            backgroundImage.src = option.src;
            backgroundImage.onload = redrawCanvas;
            backgroundImage.onerror = () => console.error(`Failed to load background image: ${option.src}`);
        }
    }

    // --- Canvas Drawing ---
    const storedImages = JSON.parse(sessionStorage.getItem('photoArray'));
    if (!storedImages || storedImages.length === 0) {
        console.error("No valid images found in sessionStorage.");
        if(photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Foto tidak ditemukan. Silakan kembali dan ambil foto baru.</p>';
        return;
    }

    async function drawSticker(ctx) {
        if (!selectedStickerLayout || !assetsData.stickerLayouts) {
            return;
        }
    
        const layout = assetsData.stickerLayouts[selectedStickerLayout];
        if (!layout) return;

        await Promise.all(layout.map(({ src, x, y, size }) => {
            return new Promise((resolve) => {
                const stickerImg = new Image();
                stickerImg.src = src;
                stickerImg.onload = () => {
                    ctx.drawImage(stickerImg, x, y, size, size);
                    resolve();
                };
                stickerImg.onerror = () => {
                    console.error(`Failed to load sticker: ${src}`);
                    resolve();
                };
            });
        }));
    }

    function clipAndDrawImage(ctx, img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, shapeType) {
        ctx.save();
        ctx.beginPath();
        const centerX = dx + dWidth / 2;
        const centerY = dy + dHeight / 2;
    
        if (shapeType === 'circle') {
            const radius = Math.min(dWidth, dHeight) / 2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else if (shapeType === 'rounded') {
            const radius = 30;
            ctx.moveTo(dx + radius, dy);
            ctx.lineTo(dx + dWidth - radius, dy);
            ctx.quadraticCurveTo(dx + dWidth, dy, dx + dWidth, dy + radius);
            ctx.lineTo(dx + dWidth, dy + dHeight - radius);
            ctx.quadraticCurveTo(dx + dWidth, dy + dHeight, dx + dWidth - radius, dy + dHeight);
            ctx.lineTo(dx + radius, dy + dHeight);
            ctx.quadraticCurveTo(dx, dy + dHeight, dx, dy + dHeight - radius);
            ctx.lineTo(dx, dy + radius);
            ctx.quadraticCurveTo(dx, dy, dx + radius, dy);
        } else if (shapeType === 'heart') {
            ctx.moveTo(dx + dWidth / 2, dy + dHeight);
            ctx.bezierCurveTo(dx + dWidth * 1.25, dy + dHeight * 0.7, dx + dWidth * 0.9, dy - dHeight * 0.1, dx + dWidth / 2, dy + dHeight * 0.25);
            ctx.bezierCurveTo(dx + dWidth * 0.1, dy - dHeight * 0.1, dx - dWidth * 0.25, dy + dHeight * 0.7, dx + dWidth / 2, dy + dHeight);
        } else {
            ctx.rect(dx, dy, dWidth, dHeight); // default rectangle
        }
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        ctx.restore();
    }

    async function redrawCanvas() {
        if (!storedImages) return null;

        const imageArrayLength = storedImages.length;
        const stackedCanvas = document.createElement('canvas');
        const ctx = stackedCanvas.getContext('2d');

        const canvasWidth = 592;
        const canvasHeight = 1352;
        const borderWidth = 30;
        const spacing = 12;
        const bottomPadding = 100;

        const availableHeight = canvasHeight - (borderWidth * 2) - (spacing * (imageArrayLength - 1)) - bottomPadding;
        const photoHeight = availableHeight / imageArrayLength;
        const photoWidth = canvasWidth - (borderWidth * 2);

        stackedCanvas.width = canvasWidth;
        stackedCanvas.height = canvasHeight;

        // 1. Draw Background
        ctx.clearRect(0, 0, stackedCanvas.width, stackedCanvas.height);
        if (backgroundType === 'color') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, stackedCanvas.width, stackedCanvas.height);
        } else if (backgroundType === 'image' && backgroundImage && backgroundImage.complete) {
            ctx.drawImage(backgroundImage, 0, 0, stackedCanvas.width, stackedCanvas.height);
        }
        
        // 2. Draw Logo Text
        ctx.fillStyle = textColor;
        ctx.font = 'bold 32px Arial, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(selectedText, stackedCanvas.width / 2, stackedCanvas.height - 55);

        // 3. Draw Date and Time Text
        if (dateCheckbox.checked || dateTimeCheckbox.checked) {
            const currentDate = new Date();
            let displayText = '';
            if (dateCheckbox.checked) displayText += currentDate.toLocaleDateString();
            if (dateTimeCheckbox.checked) {
                const timeString = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                displayText += (dateCheckbox.checked ? ' ' : '') + timeString;
            }
            ctx.fillStyle = textColor; 
            ctx.font = '18px "DM Sans", Arial, Roboto, sans-serif';
            ctx.fillText(displayText, stackedCanvas.width / 2, stackedCanvas.height - 30);
        }

        // 4. Draw Photos
        const imageElements = await Promise.all(storedImages.map(imgData => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = imgData;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });
        }));

        imageElements.forEach((img, index) => {
            if (!img) return;
            const imgAspect = img.width / img.height;
            const targetAspect = photoWidth / photoHeight;
            let sx, sy, sWidth, sHeight;
            if (imgAspect > targetAspect) {
                sHeight = img.height;
                sWidth = img.height * targetAspect;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = img.width;
                sHeight = img.width / targetAspect;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }
            const x = borderWidth;
            const y = borderWidth + index * (photoHeight + spacing);
            clipAndDrawImage(ctx, img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight, selectedShape);
        });

        // 5. Draw Stickers on top
        await drawSticker(ctx);
        
        // 6. Update the preview on the page
        updatePreview(stackedCanvas);

        // 7. Return the canvas element so other scripts can use it
        return stackedCanvas;
    }
    
    function updatePreview(canvas) {
        if (!photoCustomPreview) return;
        photoCustomPreview.innerHTML = '';
        canvas.style.width = (window.innerWidth <= 768) ? "150px" : "230px";
        if (backgroundColor === '#FFFFFF' && backgroundType === 'color') {
            canvas.style.border = '1px solid #ccc';
        } else {
            canvas.style.border = 'none';
        }
        photoCustomPreview.appendChild(canvas);
    }

    // --- Expose the drawing function to the global window object ---
    // This allows the script in customize.html to call it.
    window.drawFinalImage = redrawCanvas;

    // --- Start the app ---
    init();
});