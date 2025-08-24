document.addEventListener('DOMContentLoaded', function() {

    // --- Element References ---
    const photoCustomPreview = document.getElementById('photoPreview');
    const frameButtonsContainer = document.getElementById('frame-buttons-container');
    const shapeButtonsContainer = document.getElementById('shape-buttons-container');
    const stickerButtonsContainer = document.getElementById('sticker-buttons-container');
    const customStickerButtonsContainer = document.getElementById('custom-sticker-buttons-container');
    const logoButtonsContainer = document.getElementById('logo-buttons-container');
    const filterButtonsContainer = document.getElementById('filter-buttons-container');
    const logoColorPicker = document.getElementById('logoColorPicker');

    // --- State Variables ---
    let assetsData = null;
    let selectedShape = 'default';
    let selectedStickerLayout = null;
    let selectedFilter = 'none';
    let selectedText = 'pictlord';
    let backgroundType = 'color';
    let backgroundColor = '#FFFFFF';
    let backgroundImage = null;
    let textColor = '#E28585';
    let logoObject = null;
    let fabricCanvas = null;
    const canvasWidth = 592;
    const canvasHeight = 1352;

    const storedImages = JSON.parse(sessionStorage.getItem('photoArray'));
    if (!storedImages || storedImages.length === 0) {
        console.error("No valid images found in sessionStorage.");
        if(photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Foto tidak ditemukan. Silakan kembali dan ambil foto baru.</p>';
        return;
    }

    // --- Custom Fabric.js Controls ---
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

    function renderDeleteIcon(ctx, left, top, styleOverride, fabricObject) {
        const size = 24;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.fillStyle = 'rgba(239, 83, 80, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size/4, -size/4);
        ctx.lineTo(size/4, size/4);
        ctx.moveTo(size/4, -size/4);
        ctx.lineTo(-size/4, size/4);
        ctx.stroke();
        ctx.restore();
    }

    function renderMirrorIcon(ctx, left, top, styleOverride, fabricObject) {
        const size = 24;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.fillStyle = 'rgba(66, 133, 244, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⟷', 0, 1);
        ctx.restore();
    }

    // --- Main Initialization ---
    const init = async () => {
        try {
            const response = await fetch('assets.json?v=' + Date.now());
            if (!response.ok) throw new Error('Failed to load assets.json');
            assetsData = await response.json();

            const canvasEl = document.createElement('canvas');
            canvasEl.id = 'photo-canvas';
            canvasEl.width = canvasWidth;
            canvasEl.height = canvasHeight;

            photoCustomPreview.innerHTML = '';
            photoCustomPreview.appendChild(canvasEl);

            fabricCanvas = new fabric.Canvas('photo-canvas');

            const previewWidth = (window.innerWidth <= 768) ? 150 : 230;
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
            await renderFilterButtons();
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
            btn.style.backgroundImage = `url(${frame.path})`;
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
            if(sticker.layout === null) btn.classList.add('active');
            stickerButtonsContainer.appendChild(btn);
        });
    };
    
    const renderLogoButtons = () => {
        if (!assetsData.logos || !logoButtonsContainer) return;
        logoButtonsContainer.innerHTML = '';

        const noneBtn = document.createElement('button');
        noneBtn.className = 'neumorphic-btn logoCustomBtn';
        noneBtn.dataset.text = 'none';
        noneBtn.textContent = 'None';
        logoButtonsContainer.appendChild(noneBtn);

        assetsData.logos.forEach((logo, index) => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn logoCustomBtn';
            if(index === 0) {
                btn.classList.add('active');
                // Programmatically click the first logo to set the initial state
                setTimeout(() => handleLogoClick({ target: btn }), 0);
            }
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
            btn.dataset.src = sticker.src;
            btn.innerHTML = `<img src="${sticker.src}" alt="Custom Sticker" class="stickerIconSize">`;
            customStickerButtonsContainer.appendChild(btn);
        });
    };

    const renderFilterButtons = async () => {
        if (!filterButtonsContainer) return;
        filterButtonsContainer.innerHTML = ''; // Clear existing
        const firstPhoto = storedImages[0];
        if (!firstPhoto) return;

        const filters = [
            { name: 'None', type: 'none' },
            { name: 'Sepia', type: 'sepia' },
            { name: 'Grayscale', type: 'grayscale' },
            { name: 'Invert', type: 'invert' },
            { name: 'Black & White', type: 'blackwhite' },
            { name: 'Brownie', type: 'brownie' },
            { name: 'Vintage', type: 'vintage' },
            { name: 'Technicolor', type: 'technicolor' },
            { name: 'Polaroid', type: 'polaroid' },
            { name: 'Sharpen', type: 'sharpen' },
            { name: 'Emboss', type: 'emboss' }
        ];

        const baseImage = new Image();
        baseImage.crossOrigin = "anonymous";
        baseImage.src = firstPhoto;
        await new Promise(r => baseImage.onload = r);

        for (const filter of filters) {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonStickers filter-btn'; // Use same style as sticker buttons
            btn.dataset.filter = filter.type;

            const thumbnailCanvas = document.createElement('canvas');
            thumbnailCanvas.width = 50;
            thumbnailCanvas.height = 50;
            const thumbCtx = thumbnailCanvas.getContext('2d');
            thumbCtx.drawImage(baseImage, 0, 0, 50, 50);

            const filteredThumb = await getFilteredImage(thumbnailCanvas, filter.type);

            const img = new Image();
            img.src = filteredThumb.toDataURL ? filteredThumb.toDataURL() : filteredThumb.src;
            img.className = 'stickerIconSize'; // Reuse styling
            img.alt = filter.name;

            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip-text';
            tooltip.textContent = filter.name;

            btn.appendChild(img);
            btn.appendChild(tooltip);

            if (filter.type === 'none') {
                btn.classList.add('active');
            }
            filterButtonsContainer.appendChild(btn);
        }
    };

    // --- Event Handling ---
    const setupEventListeners = () => {
        frameButtonsContainer.addEventListener('click', handleFrameClick);
        shapeButtonsContainer.addEventListener('click', handleShapeClick);
        stickerButtonsContainer.addEventListener('click', handleStickerClick);
        customStickerButtonsContainer.addEventListener('click', handleCustomStickerClick);
        logoButtonsContainer.addEventListener('click', handleLogoClick);
        filterButtonsContainer.addEventListener('click', handleFilterClick);
        logoColorPicker.addEventListener('input', (e) => {
            textColor = e.target.value;
            if (logoObject) {
                logoObject.set('fill', textColor);
                fabricCanvas.requestRenderAll();
            }
        });
    };

    function handleCustomStickerClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn) return;
        const stickerSrc = btn.dataset.src;
        fabric.Image.fromURL(stickerSrc, (img) => {
            img.scaleToWidth(150);
            img.set({
                left: (canvasWidth - img.getScaledWidth()) / 2,
                top: (canvasHeight - img.getScaledHeight()) / 2,
                borderColor: '#E28585',
                cornerColor: '#E28585',
                cornerSize: 24,
                transparentCorners: false,
                cornerStyle: 'circle'
            });
            img.controls.deleteControl = new fabric.Control({ x: 0.5, y: -0.5, cursorStyle: 'pointer', mouseUpHandler: deleteObject, render: renderDeleteIcon, cornerSize: 24 });
            img.controls.mirrorControl = new fabric.Control({ x: -0.5, y: -0.5, cursorStyle: 'pointer', mouseUpHandler: flipObject, render: renderMirrorIcon, cornerSize: 24 });
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

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
        if (selectedStickerLayout === clickedStickerLayout) selectedStickerLayout = null;
        else selectedStickerLayout = clickedStickerLayout;
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

        if (fabricCanvas && logoObject) {
            fabricCanvas.remove(logoObject);
        }

        selectedText = btn.dataset.text;

        if (selectedText !== 'none') {
            logoObject = new fabric.Text(selectedText, {
                left: canvasWidth / 2,
                top: canvasHeight - 65,
                originX: 'center',
                originY: 'center',
                fontFamily: 'Arial, Roboto, sans-serif',
                fontWeight: 'bold',
                fontSize: 32,
                fill: textColor,
                borderColor: '#E28585',
                cornerColor: '#E28585',
                cornerSize: 12,
                transparentCorners: false
            });
            fabricCanvas.add(logoObject);
            fabricCanvas.setActiveObject(logoObject);
        } else {
            logoObject = null;
        }

        logoButtonsContainer.querySelectorAll('.neumorphic-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fabricCanvas.requestRenderAll();
    }

    function handleFilterClick(e) {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        selectedFilter = btn.dataset.filter;

        // Update active button
        filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Redraw the canvas to apply the filter to individual images
        redrawCanvas();
    }

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

    async function drawSticker(ctx) {
        if (!selectedStickerLayout || !assetsData.stickerLayouts) return;
        const layout = assetsData.stickerLayouts[selectedStickerLayout];
        if (!layout) return;
        await Promise.all(layout.map(({ src, x, y, size }) => {
            return new Promise((resolve) => {
                const stickerImg = new Image();
                stickerImg.src = src;
                stickerImg.onload = () => { ctx.drawImage(stickerImg, x, y, size, size); resolve(); };
                stickerImg.onerror = () => { console.error(`Failed to load sticker: ${src}`); resolve(); };
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
            ctx.roundRect(dx, dy, dWidth, dHeight, [30]);
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

    async function getFilteredImage(imageElement, filterType) {
        if (filterType === 'none' || !filterType) {
            return imageElement;
        }

        return new Promise(resolve => {
            const fabricImage = new fabric.Image(imageElement, { crossOrigin: 'anonymous' });
            let filter = null;

            switch (filterType) {
                case 'grayscale': filter = new fabric.Image.filters.Grayscale(); break;
                case 'sepia': filter = new fabric.Image.filters.Sepia(); break;
                case 'invert': filter = new fabric.Image.filters.Invert(); break;
                case 'brownie': filter = new fabric.Image.filters.Brownie(); break;
                case 'vintage': filter = new fabric.Image.filters.Vintage(); break;
                case 'technicolor': filter = new fabric.Image.filters.Technicolor(); break;
                case 'polaroid': filter = new fabric.Image.filters.Polaroid(); break;
                case 'blackwhite': filter = new fabric.Image.filters.BlackWhite(); break;
                case 'sharpen': filter = new fabric.Image.filters.Sharpen(); break;
                case 'emboss': filter = new fabric.Image.filters.Emboss(); break;
                default:
                    resolve(imageElement); // No filter found, return original
                    return;
            }

            fabricImage.filters.push(filter);
            fabricImage.applyFilters();

            resolve(fabricImage.toCanvasElement());
        });
    }

    async function redrawCanvas() {
        if (!storedImages || !fabricCanvas) return null;
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        bgCanvas.width = canvasWidth;
        bgCanvas.height = canvasHeight;
        const imageArrayLength = storedImages.length;
        const borderWidth = 30;
        const spacing = 12;
        const bottomPadding = 250;
        const availableHeight = canvasHeight - (borderWidth * 2) - (spacing * (imageArrayLength - 1)) - bottomPadding;
        const photoHeight = availableHeight / imageArrayLength;
        const photoWidth = canvasWidth - (borderWidth * 2);

        if (backgroundType === 'color') {
            bgCtx.fillStyle = backgroundColor;
            bgCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (backgroundType === 'image' && backgroundImage && backgroundImage.complete) {
            bgCtx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
        }
        
        const imageElements = await Promise.all(storedImages.map(async (imgData) => {
            return new Promise(resolve => {
                const img = new Image();
                img.crossOrigin = "anonymous"; // Important for canvas operations
                img.src = imgData;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });
        }));

        for (let i = 0; i < imageElements.length; i++) {
            const img = imageElements[i];
            if (!img) continue;

            const filteredImage = await getFilteredImage(img, selectedFilter);

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
            const y = borderWidth + i * (photoHeight + spacing);
            clipAndDrawImage(bgCtx, filteredImage, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight, selectedShape);
        }

        await drawSticker(bgCtx);
        fabricCanvas.setBackgroundImage(new fabric.Image(bgCanvas), fabricCanvas.renderAll.bind(fabricCanvas));
    }
    
    window.drawFinalImage = async () => {
        if (!fabricCanvas) return null;
        fabricCanvas.discardActiveObject().renderAll();
        const zoom = fabricCanvas.getZoom();
        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 1 / zoom
        });
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
