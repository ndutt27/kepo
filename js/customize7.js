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
    const customBackButton = document.getElementById('customBack');

    // --- State Variables ---
    let assetsData = null;
    let selectedShape = 'default';
    let selectedStickerLayout = null;
    let selectedText = 'pictlord';
    let backgroundType = 'color';
    let backgroundColor = '#FFFFFF';
    let backgroundImage = null;
    let textColor = '#E28585';
    let currentCanvas = null;

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
            
            setTimeout(redrawCanvas, 100);

        } catch (error) {
            console.error("Initialization failed:", error);
            if(photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Gagal memuat aset kustomisasi.</p>';
        }
    };

    // --- Rendering Functions ---
    const renderFrameButtons = () => {
        if (!assetsData.frames || !frameButtonsContainer) return;
        frameButtonsContainer.innerHTML = '';

        const colorPickerBtn = document.createElement('button');
        colorPickerBtn.id = 'colorPickerBtn';
        colorPickerBtn.className = 'neumorphic-btn buttonFrames';
        frameButtonsContainer.appendChild(colorPickerBtn);
        
        if (typeof Picker !== 'undefined') {
            const picker = new Picker({
                parent: colorPickerBtn, popup: 'bottom', color: '#FFFFFF',
                onChange: (color) => setBackground({ type: 'color', value: color.hex }),
                onDone: (color) => { colorPickerBtn.style.backgroundColor = color.hex; }
            });
            colorPickerBtn.addEventListener('click', () => picker.show());
        } else { console.error("Vanilla Picker library not loaded."); }

        assetsData.frames.colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonFrames';
            btn.id = color.id;
            btn.dataset.type = 'color';
            btn.dataset.value = color.value;
            frameButtonsContainer.appendChild(btn);
        });

        assetsData.frames.images.forEach(frame => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonBgFrames';
            btn.id = frame.id;
            btn.dataset.type = 'image';
            btn.dataset.src = frame.path;
            frameButtonsContainer.appendChild(btn);
        });
    };

    const renderShapeButtons = () => {
        if (!assetsData.shapes || !shapeButtonsContainer) return;
        shapeButtonsContainer.innerHTML = '';
        assetsData.shapes.forEach(shape => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonShapes';
            btn.dataset.shape = shape.value;
            btn.id = shape.id;
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
            btn.id = sticker.id;
            btn.innerHTML = `<img src="${sticker.icon}" alt="${sticker.name}" class="stickerIconSize"><span class="tooltip-text">${sticker.name}</span>`;
            if(sticker.layout === null) btn.classList.add('active');
            stickerButtonsContainer.appendChild(btn);
        });
    };
    
    const renderLogoButtons = () => {
        if (!assetsData.logos || !logoButtonsContainer) return;
        logoButtonsContainer.innerHTML = '';
        assetsData.logos.forEach((logo, index) => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn logoCustomBtn';
            if(index === 0) btn.classList.add('active');
            btn.dataset.text = logo.value;
            btn.id = logo.id;
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

        if (customBackButton) {
            customBackButton.addEventListener('click', () => {
                window.location.href = 'canvas7.html';
            });
        }
    };

    function handleFrameClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn || btn.id === 'colorPickerBtn') return;
        const type = btn.dataset.type;
        if (type === 'color') setBackground({ type: 'color', value: btn.dataset.value });
        else if (type === 'image') setBackground({ type: 'image', src: btn.dataset.src });
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
        if (selectedStickerLayout === clickedStickerLayout) {
            selectedStickerLayout = null;
        } else {
            selectedStickerLayout = clickedStickerLayout;
        }
        stickerButtonsContainer.querySelectorAll('.neumorphic-btn').forEach(b => {
            const layout = b.dataset.sticker === 'null' ? null : b.dataset.sticker;
            b.classList.toggle('active', selectedStickerLayout === layout);
        });
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
    
        let layoutData = assetsData.stickerLayouts[selectedStickerLayout];
        if (!layoutData) {
            console.error(`Sticker layout "${selectedStickerLayout}" not found in assets.json.`);
            return;
        }

        // [FIX] Corrects the typo in the path for the 'ballerinacp' sticker set
        if (selectedStickerLayout === 'ballerinacp') {
            layoutData = layoutData.map(sticker => ({
                ...sticker,
                src: sticker.src.replace('/balerinaCappuccino/', '/ballerinaCappuccino/')
            }));
        }

        await Promise.all(layoutData.map(({ src, x, y, size }) => {
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
        if (shapeType === 'circle') {
            ctx.arc(dx + dWidth / 2, dy + dHeight / 2, Math.min(dWidth, dHeight) / 2, 0, Math.PI * 2);
        } else if (shapeType === 'rounded') {
            const r = 30;
            ctx.moveTo(dx + r, dy); ctx.lineTo(dx + dWidth - r, dy); ctx.quadraticCurveTo(dx + dWidth, dy, dx + dWidth, dy + r);
            ctx.lineTo(dx + dWidth, dy + dHeight - r); ctx.quadraticCurveTo(dx + dWidth, dy + dHeight, dx + dWidth - r, dy + dHeight);
            ctx.lineTo(dx + r, dy + dHeight); ctx.quadraticCurveTo(dx, dy + dHeight, dx, dy + dHeight - r);
            ctx.lineTo(dx, dy + r); ctx.quadraticCurveTo(dx, dy, dx + r, dy);
        } else if (shapeType === 'heart') {
            ctx.moveTo(dx + dWidth / 2, dy + dHeight);
            ctx.bezierCurveTo(dx + dWidth * 1.25, dy + dHeight * 0.7, dx + dWidth * 0.9, dy - dHeight * 0.1, dx + dWidth / 2, dy + dHeight * 0.25);
            ctx.bezierCurveTo(dx + dWidth * 0.1, dy - dHeight * 0.1, dx - dWidth * 0.25, dy + dHeight * 0.7, dx + dWidth / 2, dy + dHeight);
        } else {
            ctx.rect(dx, dy, dWidth, dHeight);
        }
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        ctx.restore();
    }

    async function redrawCanvas() {
        return new Promise(async (resolve) => {
            if (!storedImages) return resolve(null);

            const stackedCanvas = document.createElement('canvas');
            const ctx = stackedCanvas.getContext('2d');

            // [CORRECTED] Using 2x2 Grid Layout Calculations
            const columns = 2, rows = 2;
            const imageGridSize = rows * columns;
            const canvasWidth = 900, canvasHeight = 1352;
            const borderWidth = 30, spacing = 12, bottomPadding = 100;

            const availableWidth = canvasWidth - (borderWidth * 2) - (spacing * (columns - 1));
            const availableHeight = canvasHeight - (borderWidth * 2) - (spacing * (rows - 1)) - bottomPadding;
            const photoWidth = availableWidth / columns;
            const photoHeight = availableHeight / rows;

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

            // 2. Draw Photos
            if (storedImages.length === imageGridSize) {
                const imageElements = await Promise.all(storedImages.map(imgData => new Promise(resolve => {
                    const img = new Image();
                    img.src = imgData;
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                })));

                imageElements.forEach((img, index) => {
                    if (!img) return;
                    const imgAspect = img.width / img.height, targetAspect = photoWidth / photoHeight;
                    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
                    if (imgAspect > targetAspect) { sWidth = img.height * targetAspect; sx = (img.width - sWidth) / 2; } 
                    else { sHeight = img.width / targetAspect; sy = (img.height - sHeight) / 2; }
                    const col = index % columns, row = Math.floor(index / columns);
                    const x = borderWidth + col * (photoWidth + spacing);
                    const y = borderWidth + row * (photoHeight + spacing);
                    clipAndDrawImage(ctx, img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight, selectedShape);
                });
            }

            // 3. Draw Stickers on top
            await drawSticker(ctx);
            
            // 4. Draw Logo and Date Text
            ctx.fillStyle = textColor;
            ctx.font = 'bold 32px Arial, Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(selectedText, stackedCanvas.width / 2, stackedCanvas.height - 55);

            if (dateCheckbox.checked || dateTimeCheckbox.checked) {
                const currentDate = new Date();
                let displayText = '';
                if (dateCheckbox.checked) displayText += currentDate.toLocaleDateString('id-ID');
                if (dateTimeCheckbox.checked) {
                    const timeString = currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    displayText += (dateCheckbox.checked ? ' ' : '') + timeString;
                }
                ctx.font = '18px "Poppins", Arial, Roboto, sans-serif';
                ctx.fillText(displayText, stackedCanvas.width / 2, stackedCanvas.height - 30);
            }
            
            updatePreview(stackedCanvas);
            currentCanvas = stackedCanvas;
            resolve(stackedCanvas);
        });
    }
    
    function updatePreview(canvas) {
        if (!photoCustomPreview || !canvas) return;
        photoCustomPreview.innerHTML = '';
        photoCustomPreview.appendChild(canvas);
    }

    // Expose the drawing function to the global window object for other scripts
    window.redrawCanvas = redrawCanvas;

    init();
});