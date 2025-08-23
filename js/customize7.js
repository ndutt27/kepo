document.addEventListener('DOMContentLoaded', function() {

    // --- Element References ---
    const photoCustomPreview = document.getElementById('photoPreview');
    const frameButtonsContainer = document.getElementById('frame-buttons-container');
    const shapeButtonsContainer = document.getElementById('shape-buttons-container');
    const stickerButtonsContainer = document.getElementById('sticker-buttons-container');
    const customStickerButtonsContainer = document.getElementById('custom-sticker-buttons-container');
    const logoButtonsContainer = document.getElementById('logo-buttons-container');
    const dateCheckbox = document.getElementById('dateCheckbox');
    const dateTimeCheckbox = document.getElementById('dateTimeCheckbox');
    const logoColorPicker = document.getElementById('logoColorPicker');

    // --- State Variables ---
    let assetsData = null;
    let selectedShape = 'default';
    let selectedStickerLayout = null; // Single sticker selection
    let selectedText = 'pictlord';
    let backgroundType = 'color';
    let backgroundColor = '#FFFFFF';
    let backgroundImage = null;
    let textColor = '#E28585';
    let fabricCanvas = null; // Will hold the fabric.js canvas instance
    const canvasWidth = 900;
    const canvasHeight = 1352;

    // --- Custom Fabric.js Controls ---
    const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3CsvG version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='0 0 595.275 595.275' enable-background='new 0 0 595.275 595.275' xml:space='preserve'%3E%3Cg%3E%3Cpath d='M355.067,297.641l215.59-215.59c15.025-15.025,15.025-39.384,0-54.409c-15.025-15.025-39.384-15.025-54.409,0L300.658,243.232L85.067,27.641c-15.025-15.025-39.384-15.025-54.409,0c-15.025,15.025-15.025,39.384,0,54.409l215.59,215.59l-215.59,215.59c-15.025,15.025-15.025,39.384,0,54.409c15.025,15.025,39.384,15.025,54.409,0l215.59-215.59l215.59,215.59c15.025,15.025,39.384,15.025,54.409,0c15.025-15.025,15.025-39.384,0-54.409L355.067,297.641z'/%3E%3C/g%3E%3C/svg%3E";
    const mirrorIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='490.655px' height='490.655px' viewBox='0 0 490.655 490.655' style='enable-background:new 0 0 490.655 490.655;' xml:space='preserve'%3E%3Cg%3E%3Cpath d='M487.524,232.051c-2.3-3.2-5.4-5.2-9.2-5.2h-220.3c-3.8,0-7,2-9.2,5.2c-2.3,3.2-2.8,7.2-1.5,10.8l105.7,309.9c2.3,6.7,8.8,11.1,15.9,11.1c7.1,0,13.6-4.4,15.9-11.1l105.7-309.9C490.324,239.251,489.824,235.251,487.524,232.051z'/%3E%3Cpath d='M245.324,0.051c-7.1,0-13.6,4.4-15.9,11.1L123.724,321.05c-1.3,3.6-0.8,7.6,1.5,10.8c2.3,3.2,5.4,5.2,9.2,5.2h220.3c3.8,0,7-2,9.2-5.2c-2.3-3.2-2.8-7.2-1.5-10.8L261.224,11.151C258.924,4.451,252.424,0.051,245.324,0.051z M245.324,277.851l-44.2-129.5h88.3L245.324,277.851z'/%3E%3C/g%3E%3C/svg%3E%0A";

    const deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    const mirrorImg = document.createElement('img');
    mirrorImg.src = mirrorIcon;

    function renderIcon(icon) {
        return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
            const size = this.cornerSize;
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
            ctx.drawImage(icon, -size / 2, -size / 2, size, size);
            ctx.restore();
        }
    }

    function deleteObject(eventData, transform) {
        const target = transform.target;
        const canvas = target.canvas;
        canvas.remove(target);
        canvas.requestRenderAll();
    }

    function flipObject(eventData, transform) {
        const target = transform.target;
        target.toggle('flipX');
        target.canvas.requestRenderAll();
    }

    // --- Main Initialization ---
    const init = async () => {
        try {
            const response = await fetch('../assets.json?v=' + Date.now());
            if (!response.ok) throw new Error('Failed to load assets.json');
            assetsData = await response.json();

            // Create the canvas element
            const canvasEl = document.createElement('canvas');
            canvasEl.id = 'photo-canvas';
            canvasEl.width = canvasWidth;
            canvasEl.height = canvasHeight;

            photoCustomPreview.innerHTML = ''; // Clear previous content
            photoCustomPreview.appendChild(canvasEl);

            // Initialize Fabric.js canvas
            fabricCanvas = new fabric.Canvas('photo-canvas');

            // Set display size
            const previewWidth = (window.innerWidth <= 768) ? 190 : 230;
            const scale = previewWidth / canvasWidth;
            fabricCanvas.setDimensions({
                width: previewWidth,
                height: canvasHeight * scale
            });
            fabricCanvas.setZoom(scale);

            renderFrameButtons();
            renderShapeButtons();
            renderStickerButtons();
            renderCustomStickerButtons();
            renderLogoButtons();

            setupEventListeners();

            await redrawCanvas();

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
        const picker = new Picker({
            parent: colorPickerBtn,
            popup: 'bottom',
            color: '#FFFFFF',
            onChange: (color) => setBackground({ type: 'color', value: color.hex }),
            onDone: (color) => { colorPickerBtn.style.backgroundColor = color.hex; }
        });
        colorPickerBtn.addEventListener('click', () => picker.show());

        assetsData.frames.colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonFrames';
            btn.style.backgroundColor = color.value;
            btn.dataset.type = 'color';
            btn.dataset.value = color.value;
            frameButtonsContainer.appendChild(btn);
        });

        assetsData.frames.images.forEach(frame => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonBgFrames';
            btn.style.backgroundImage = `url(../${frame.path})`;
            btn.dataset.type = 'image';
            btn.dataset.src = `../${frame.path}`;
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
            btn.innerHTML = `<img src="../${shape.icon}" alt="${shape.name}" class="btnShapeSize"><span class="tooltip-text">${shape.name}</span>`;
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
            btn.innerHTML = `<img src="../${sticker.icon}" alt="${sticker.name}" class="stickerIconSize">`;
            if(sticker.id === 'noneSticker') btn.classList.add('active');
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
            btn.textContent = logo.name;
            logoButtonsContainer.appendChild(btn);
        });
    };

    const renderCustomStickerButtons = () => {
        if (!assetsData.customStickers || !customStickerButtonsContainer) return;
        customStickerButtonsContainer.innerHTML = '';
        assetsData.customStickers.forEach(sticker => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonStickers';
            btn.dataset.src = `../${sticker.src}`;
            btn.innerHTML = `<img src="../${sticker.src}" alt="Custom Sticker" class="stickerIconSize">`;
            customStickerButtonsContainer.appendChild(btn);
        });
    };

    // --- Event Handling ---
    const setupEventListeners = () => {
        frameButtonsContainer.addEventListener('click', handleFrameClick);
        shapeButtonsContainer.addEventListener('click', handleShapeClick);
        stickerButtonsContainer.addEventListener('click', handleStickerClick);
        customStickerButtonsContainer.addEventListener('click', handleCustomStickerClick);
        logoButtonsContainer.addEventListener('click', handleLogoClick);

        dateCheckbox.addEventListener('change', redrawCanvas);
        dateTimeCheckbox.addEventListener('change', redrawCanvas);
        logoColorPicker.addEventListener('input', (e) => {
            textColor = e.target.value;
            redrawCanvas();
        });
    };

    function handleCustomStickerClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn) return;

        const stickerSrc = btn.dataset.src;
        fabric.Image.fromURL(stickerSrc, (img) => {
            img.scaleToWidth(150); // Initial size
            img.set({
                left: (canvasWidth - img.getScaledWidth()) / 2,
                top: (canvasHeight - img.getScaledHeight()) / 2,
                borderColor: '#E28585',
                cornerColor: '#E28585',
                cornerSize: 12,
                transparentCorners: false
            });
            img.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: -16,
                offsetX: 16,
                cursorStyle: 'pointer',
                mouseUpHandler: deleteObject,
                render: renderIcon(deleteImg),
                cornerSize: 24
            });
            img.controls.mirrorControl = new fabric.Control({
                x: -0.5,
                y: -0.5,
                offsetY: -16,
                offsetX: -16,
                cursorStyle: 'pointer',
                mouseUpHandler: flipObject,
                render: renderIcon(mirrorImg),
                cornerSize: 24
            });
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

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

        const stickerLayout = btn.dataset.sticker;

        stickerButtonsContainer.querySelectorAll('.neumorphic-btn').forEach(b => b.classList.remove('active'));

        if (selectedStickerLayout === stickerLayout || stickerLayout === 'null') {
            selectedStickerLayout = null;
            const noneStickerBtn = stickerButtonsContainer.querySelector('[data-sticker="null"]');
            if (noneStickerBtn) noneStickerBtn.classList.add('active');
        } else {
            selectedStickerLayout = stickerLayout;
            btn.classList.add('active');
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
        if(photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Foto tidak ditemukan.</p>';
        return;
    }

    async function drawSticker(ctx, stackedCanvas) {
        if (!selectedStickerLayout) return;

        const stickerLayouts = assetsData.stickerLayouts;
        const layout = stickerLayouts[selectedStickerLayout];
        if (!layout) return;

        await Promise.all(layout.map(({ src, x, y, size }) => {
            return new Promise((resolve) => {
                const stickerImg = new Image();
                stickerImg.src = `../${src}`;
                stickerImg.onload = () => {
                    ctx.drawImage(stickerImg, x, y, size, size);
                    resolve();
                };
                stickerImg.onerror = () => {
                    console.error(`Failed to load sticker: ../${src}`);
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
            ctx.moveTo(dx + r, dy);
            ctx.lineTo(dx + dWidth - r, dy);
            ctx.quadraticCurveTo(dx + dWidth, dy, dx + dWidth, dy + r);
            ctx.lineTo(dx + dWidth, dy + dHeight - r);
            ctx.quadraticCurveTo(dx + dWidth, dy + dHeight, dx + dWidth - r, dy + dHeight);
            ctx.lineTo(dx + r, dy + dHeight);
            ctx.quadraticCurveTo(dx, dy + dHeight, dx, dy + dHeight - r);
            ctx.lineTo(dx, dy + r);
            ctx.quadraticCurveTo(dx, dy, dx + r, dy);
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
        if (!storedImages || !fabricCanvas) return;

        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        bgCanvas.width = canvasWidth;
        bgCanvas.height = canvasHeight;

        const columns = 2, rows = 2;
        const imageGridSize = rows * columns;
        const borderWidth = 30, spacing = 12, bottomPadding = 100;

        const availableWidth = canvasWidth - (borderWidth * 2) - (spacing * (columns - 1));
        const availableHeight = canvasHeight - (borderWidth * 2) - (spacing * (rows - 1)) - bottomPadding;
        const photoWidth = availableWidth / columns;
        const photoHeight = availableHeight / rows;

        if (backgroundType === 'color') {
            bgCtx.fillStyle = backgroundColor;
            bgCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (backgroundType === 'image' && backgroundImage && backgroundImage.complete) {
            bgCtx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
        }

        if (storedImages.length === imageGridSize) {
            const imagePromises = storedImages.map(imgData => new Promise((resolve, reject) => {
                const img = new Image();
                img.src = imgData;
                img.onload = () => resolve(img);
                img.onerror = reject;
            }));

            try {
                const images = await Promise.all(imagePromises);
                images.forEach((img, index) => {
                    const imgAspect = img.width / img.height, targetAspect = photoWidth / photoHeight;
                    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
                    if (imgAspect > targetAspect) { sWidth = img.height * targetAspect; sx = (img.width - sWidth) / 2; }
                    else { sHeight = img.width / targetAspect; sy = (img.height - sHeight) / 2; }
                    const col = index % columns, row = Math.floor(index / columns);
                    const x = borderWidth + col * (photoWidth + spacing), y = borderWidth + row * (photoHeight + spacing);
                    clipAndDrawImage(bgCtx, img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight, selectedShape);
                });
            } catch (error) {
                console.error("Gagal memuat gambar:", error);
            }
        }

        bgCtx.fillStyle = textColor;
        bgCtx.font = 'bold 32px Arial, Roboto, sans-serif';
        bgCtx.textAlign = 'center';
        bgCtx.fillText(selectedText, canvasWidth / 2, canvasHeight - 55);

        if (dateCheckbox.checked || dateTimeCheckbox.checked) {
            const currentDate = new Date();
            let displayText = '';
            if (dateCheckbox.checked) displayText += currentDate.toLocaleDateString();
            if (dateTimeCheckbox.checked) {
                const timeString = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                displayText += (dateCheckbox.checked ? ' ' : '') + timeString;
            }
            bgCtx.fillStyle = textColor;
            bgCtx.font = '18px "DM Sans", Arial, Roboto, sans-serif';
            bgCtx.fillText(displayText, canvasWidth / 2, canvasHeight - 30);
        }

        await drawSticker(bgCtx, bgCanvas);

        fabricCanvas.setBackgroundImage(new fabric.Image(bgCanvas), fabricCanvas.renderAll.bind(fabricCanvas));
    }

    function updatePreview() {
        // This function is now handled by the fabric.js setup in init()
    }

    // --- Expose the drawing function to the global window object ---
    window.drawFinalImage = async () => {
        if (!fabricCanvas) return null;

        // Deselect any active object to hide controls before exporting
        fabricCanvas.discardActiveObject().renderAll();

        const zoom = fabricCanvas.getZoom();
        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 1 / zoom
        });

        // The modal requires a canvas element to be returned, so we draw the full-size image onto a new canvas
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvasWidth;
        finalCanvas.height = canvasHeight;
        const ctx = finalCanvas.getContext('2d');
        const img = new Image();

        return new Promise(resolve => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                resolve(finalCanvas);
            };
            img.src = dataURL;
        });
    };

    init();
});
