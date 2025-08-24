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

    const storedImages = JSON.parse(sessionStorage.getItem('photoArray'));
    if (!storedImages || storedImages.length === 0) {
        console.error("No valid images found in sessionStorage.");
        if(photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Foto tidak ditemukan.</p>';
        return;
    }

    async function drawSticker(ctx, stackedCanvas) {
        if (!selectedStickerLayout) return;
        const stickerLayouts = {
            'kiss': [{ src: 'assets/stickers/kiss1.png', x: 30, y: 300, size: 170 }],
            'sweet': [
                { src: 'assets/stickers/sweet1.png', x: 17, y: 80, size: 90 },
                { src: 'assets/stickers/sweet2.png', x: stackedCanvas.width - 100, y: 390, size: 90 },
                { src: 'assets/stickers/sweet3.png', x: 30, y: stackedCanvas.height - 200, size: 90 }
            ],
            'ribbon': [
                { src: 'assets/stickers/ribbon1.png', x: 17, y: 80, size: 90 },
                { src: 'assets/stickers/ribbon3.png', x: stackedCanvas.width - 100, y: 650, size: 95 },
                { src: 'assets/stickers/ribbon2.png', x: 15, y: stackedCanvas.height - 380, size: 90 }
            ],
            'sparkle': [
                { src: 'assets/stickers/sparkle1.png', x: stackedCanvas.width - 200, y: 150, size: 250 },
                { src: 'assets/stickers/sparkle2.png', x: 2, y: 680, size: 200 },
                { src: 'assets/stickers/sparkle2.png', x: stackedCanvas.width - 150, y: stackedCanvas.height - 180, size: 110 }
            ],
            'pearl': [ { src: 'assets/stickers/pearl1.png', x: 35, y: 30, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 25, y: 50, size: 25 }, { src: 'assets/stickers/pearl1.png', x: 65, y: 40, size: 20 }, { src: 'assets/stickers/pearl1.png', x: 95, y: 40, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 75, y: 26, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 25, y: 65, size: 55 }, { src: 'assets/stickers/pearl1.png', x: 25, y: 120, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 825, y: stackedCanvas.height - 620, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 800, y: stackedCanvas.height - 690, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 840, y: stackedCanvas.height - 650, size: 25 }, { src: 'assets/stickers/pearl1.png', x: 830, y: stackedCanvas.height - 700, size: 45 }, { src: 'assets/stickers/pearl1.png', x: 810, y: stackedCanvas.height - 670, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 810, y: stackedCanvas.height - 710, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 15, y: stackedCanvas.height - 200, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 35, y: stackedCanvas.height - 220, size: 20 }, { src: 'assets/stickers/pearl1.png', x: 20, y: stackedCanvas.height - 240, size: 15 }, { src: 'assets/stickers/pearl2.png', x: 15, y: stackedCanvas.height - 180, size: 150 }, { src: 'assets/stickers/pearl2.png', x: stackedCanvas.width - 150, y: 270, size: 120 } ],
            'classic': [
                { src: 'assets/stickers/classic1.png', x: 1, y: 50, size: 32 }, { src: 'assets/stickers/classic1.png', x: 1, y: 550, size: 32 },
                { src: 'assets/stickers/classic1.png', x: 1, y: 950, size: 32 }, { src: 'assets/stickers/classic2.png', x: 4, y: 80, size: 20 },
                { src: 'assets/stickers/classic2.png', x: 4, y: 980, size: 20 }, { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 70, size: 120 },
                { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 670, size: 120 }
            ],
            'classicB': [
                { src: 'assets/stickers/classic4.png', x: 1, y: 50, size: 32 }, { src: 'assets/stickers/classic4.png', x: 1, y: 550, size: 32 },
                { src: 'assets/stickers/classic4.png', x: 1, y: 950, size: 32 }, { src: 'assets/stickers/classic5.png', x: 4, y: 80, size: 20 },
                { src: 'assets/stickers/classic5.png', x: 4, y: 980, size: 20 }, { src: 'assets/stickers/classic6.png', x: stackedCanvas.width - 75, y: 70, size: 120 },
                { src: 'assets/stickers/classic6.png', x: stackedCanvas.width - 75, y: 670, size: 120 }
            ],
            'soft': [
                { src: 'assets/stickers/soft1.png', x: 5, y: 20, size: 145 }, { src: 'assets/stickers/soft2.png', x: stackedCanvas.width - 120, y: 30, size: 100 },
                { src: 'assets/stickers/soft3.png', x: 10, y: 600, size: 120 }, { src: 'assets/stickers/soft4.png', x: 15, y: stackedCanvas.height - 200, size: 120 },
                { src: 'assets/stickers/soft5.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 120 }, { src: 'assets/stickers/soft6.png', x: stackedCanvas.width - 130, y: 530, size: 120 }
            ],
            'bunny': [
                { src: 'assets/stickers/bunny1.png', x: stackedCanvas.width - 170, y: 10, size: 150 }, { src: 'assets/stickers/bunny2.png', x: 15, y: 300, size: 95 },
                { src: 'assets/stickers/bunny2.png', x: stackedCanvas.width - 100, y: 700, size: 75 }, { src: 'assets/stickers/bunny3.png', x: 15, y: stackedCanvas.height - 200, size: 135 }
            ],
            'lucky': [
                { src: 'assets/stickers/lucky2.png', x: stackedCanvas.width - 170, y: 20, size: 150 }, { src: 'assets/stickers/lucky1.png', x: 15, y: stackedCanvas.height - 215, size: 170 },
                { src: 'assets/stickers/lucky3.png', x: stackedCanvas.width - 120, y: 420, size: 90 }, { src: 'assets/stickers/lucky4.png', x: stackedCanvas.width - 120, y: 520, size: 90 },
                { src: 'assets/stickers/lucky5.png', x: stackedCanvas.width - 128, y: 620, size: 110 }, { src: 'assets/stickers/lucky6.png', x: stackedCanvas.width - 120, y: 720, size: 100 },
                { src: 'assets/stickers/lucky7.png', x: stackedCanvas.width - 120, y: 800, size: 95 }
            ],
            'confetti': [
                { src: 'assets/stickers/confetti/star5.png', x: 100, y: 20, size: 40 }, { src: 'assets/stickers/confetti/circle2.png', x: stackedCanvas.width - 120, y: 45, size: 50 },
                { src: 'assets/stickers/confetti/circle1.png', x: 30, y: 150, size: 35 }, { src: 'assets/stickers/confetti/circle1.png', x: stackedCanvas.width - 70, y: 180, size: 32 },
                { src: 'assets/stickers/confetti/star2.png', x: stackedCanvas.width - 100, y: 320, size: 40 }, { src: 'assets/stickers/confetti/star1.png', x: 100, y: 550, size: 32 },
                { src: 'assets/stickers/confetti/circle2.png', x: stackedCanvas.width - 30, y: 600, size: 27 }, { src: 'assets/stickers/confetti/star4.png', x: stackedCanvas.width - 70, y: 650, size: 27 },
                { src: 'assets/stickers/confetti/star3.png', x: 22, y: 750, size: 47 }, { src: 'assets/stickers/confetti/circle1.png', x: stackedCanvas.width - 200, y: 880, size: 32 },
                { src: 'assets/stickers/confetti/star2.png', x: 100, y: 950, size: 49 }, { src: 'assets/stickers/confetti/circle2.png', x: 22, y: 1050, size: 30 },
                { src: 'assets/stickers/confetti/star1.png', x: stackedCanvas.width - 100, y: stackedCanvas.height - 200, size: 35 }
            ],
            'ribboncoquette': [
                { src: 'assets/stickers/ribboncq2.png', x: 1, y: 0, size: 80 }, { src: 'assets/stickers/ribboncq3.png', x: 392, y: 15, size: 95 },
                { src: 'assets/stickers/ribboncq1.png', x: stackedCanvas.width - 39, y: 25, size: 82 }, { src: 'assets/stickers/ribboncq1.png', x: -22, y: 290, size: 75 },
                { src: 'assets/stickers/ribboncq2.png', x: stackedCanvas.width - 100, y: 240, size: 55 }, { src: 'assets/stickers/ribboncq3.png', x: 5, y: 700, size: 52 },
                { src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 78, y: 600, size: 69 }, { src: 'assets/stickers/ribboncq1.png', x: 399, y: stackedCanvas.height - 200, size: 82 },
                { src: 'assets/stickers/ribboncq2.png', x: stackedCanvas.width - 42, y: 850, size: 55 }, { src: 'assets/stickers/ribboncq1.png', x: -15, y: 980, size: 72 },
                { src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 70, y: 1100, size: 55 }, { src: 'assets/stickers/ribboncq2.png', x: -8, y: stackedCanvas.height - 200, size: 80 },
                { src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 70, y: stackedCanvas.height - 100, size: 55 }
            ],
            'blueribboncoquette': [
                { src: 'assets/stickers/blueRibbon.png', x: 1, y: 0, size: 80 }, { src: 'assets/stickers/blueRibbon.png', x: 392, y: 15, size: 95 },
                { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 39, y: 25, size: 82 }, { src: 'assets/stickers/blueRibbon.png', x: -22, y: 290, size: 75 },
                { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 100, y: 240, size: 55 }, { src: 'assets/stickers/blueRibbon.png', x: 5, y: 700, size: 52 },
                { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 78, y: 600, size: 69 }, { src: 'assets/stickers/blueRibbon.png', x: 399, y: stackedCanvas.height - 200, size: 82 },
                { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 42, y: 850, size: 55 }, { src: 'assets/stickers/blueRibbon.png', x: -15, y: 980, size: 72 },
                { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 70, y: 1100, size: 55 }, { src: 'assets/stickers/blueRibbon.png', x: -8, y: stackedCanvas.height - 200, size: 80 },
                { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 70, y: stackedCanvas.height - 100, size: 55 }
            ],
            'blackstar': [
                { src: 'assets/stickers/blackStar1.png', x: 340, y: -90, size: 250 }, { src: 'assets/stickers/blackStar2.png', x: stackedCanvas.width - 90, y: -30, size: 110 },
                { src: 'assets/stickers/blackStar3.png', x: 18, y: 130, size: 98 }, { src: 'assets/stickers/blackStar4.png', x: stackedCanvas.width - 120, y: 230, size: 115 },
                { src: 'assets/stickers/blackStar2.png', x: -17, y: 390, size: 65 }, { src: 'assets/stickers/blackStar3.png', x: stackedCanvas.width - 190, y: 650, size: 145 },
                { src: 'assets/stickers/blackStar2.png', x: 15, y: 850, size: 45 }, { src: 'assets/stickers/blackStar2.png', x: stackedCanvas.width - 80, y: 1050, size: 55 },
                { src: 'assets/stickers/blackStar4.png', x: -50, y: stackedCanvas.height - 150, size: 190 }
            ],
            'yellowchicken': [
                { src: 'assets/stickers/yellowChicken1.png', x: 1, y: 2, size: 90 }, { src: 'assets/stickers/yellowChicken2.png', x: 220, y: -2, size: 66 },
                { src: 'assets/stickers/yellowChicken1.png', x: stackedCanvas.width - 160, y: 25, size: 55 }, { src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 90, y: 145, size: 85 },
                { src: 'assets/stickers/yellowChicken2.png', x: -20, y: 245, size: 95 }, { src: 'assets/stickers/yellowChicken1.png', x: 140, y: 360, size: 55 },
                { src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 220, y: 750, size: 55 }, { src: 'assets/stickers/yellowChicken3.png', x: stackedCanvas.width - 70, y: 550, size: 85 },
                { src: 'assets/stickers/yellowChicken1.png', x: -5, y: 700, size: 80 }, { src: 'assets/stickers/yellowChicken1.png', x: stackedCanvas.width - 70, y: 900, size: 75 },
                { src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 120, y: stackedCanvas.height - 190, size: 65 }, { src: 'assets/stickers/yellowChicken4.png', x: 1, y: stackedCanvas.height - 230, size: 95 },
            ],
            'brownbear': [
                { src: 'assets/stickers/brownyBear1.png', x: 1, y: 5, size: 120 }, { src: 'assets/stickers/brownyBear2.png', x: stackedCanvas.width - 100, y: 25, size: 80 },
                { src: 'assets/stickers/brownyBear3.png', x: -8, y: 315, size: 82 }, { src: 'assets/stickers/brownyBear4.png', x: stackedCanvas.width - 100, y: 580, size: 91 },
                { src: 'assets/stickers/brownyBear5.png', x: -2, y: 680, size: 91 }, { src: 'assets/stickers/brownyBear2.png', x: stackedCanvas.width - 70, y: 880, size: 87 },
                { src: 'assets/stickers/brownyBear3.png', x: -1, y: stackedCanvas.height - 320, size: 82 }, { src: 'assets/stickers/brownyBear6.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 200, size: 92 }
            ],
            'lotsheart': [
                { src: 'assets/stickers/lotsHeart1.png', x: 1, y: 15, size: 78 }, { src: 'assets/stickers/lotsHeart5.png', x: -18, y: 550, size: 78 },
                { src: 'assets/stickers/lotsHeart7.png', x: -8, y: 950, size: 60 }, { src: 'assets/stickers/lotsHeart6.png', x: 25, y: stackedCanvas.height - 170, size: 70 },
                { src: 'assets/stickers/lotsHeart2.png', x: stackedCanvas.width - 250, y: 20, size: 60 }, { src: 'assets/stickers/lotsHeart4.png', x: stackedCanvas.width - 70, y: 200, size: 57 },
                { src: 'assets/stickers/lotsHeart6.png', x: stackedCanvas.width - 80, y: 750, size: 60 }, { src: 'assets/stickers/lotsHeart3.png', x: stackedCanvas.width - 50, y: 1080, size: 50 },
                { src: 'assets/stickers/lotsHeart8.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 140, size: 70 },
            ],
            'tabbycat': [
                { src: 'assets/stickers/tabbyCat1.png', x: 1, y: 2, size: 95 }, { src: 'assets/stickers/tabbyCat2.png', x: 220, y: -2, size: 66 },
                { src: 'assets/stickers/tabbyCat3.png', x: stackedCanvas.width - 160, y: 25, size: 60 }, { src: 'assets/stickers/tabbyCat4.png', x: stackedCanvas.width - 90, y: 145, size: 95 },
                { src: 'assets/stickers/tabbyCat9.png', x: -20, y: 245, size: 100 }, { src: 'assets/stickers/tabbyCat2.png', x: 140, y: 360, size: 55 },
                { src: 'assets/stickers/tabbyCat2.png', x: stackedCanvas.width - 220, y: 1050, size: 65 }, { src: 'assets/stickers/tabbyCat5.png', x: stackedCanvas.width - 90, y: 580, size: 95 },
                { src: 'assets/stickers/tabbyCat6.png', x: -5, y: 720, size: 84 }, { src: 'assets/stickers/tabbyCat9.png', x: stackedCanvas.width - 70, y: 900, size: 75 },
                { src: 'assets/stickers/tabbyCat3.png', x: -5, y: 830, size: 75 }, { src: 'assets/stickers/tabbyCat3.png', x: stackedCanvas.width - 120, y: stackedCanvas.height - 190, size: 65 },
                { src: 'assets/stickers/tabbyCat7.png', x: 1, y: stackedCanvas.height - 230, size: 120 }
            ],
            // Fixed sticker path for 'ballerinacappuccino'.
            'ballerinacappuccino': [
                { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino1.png', x: 1, y: 2, size: 125 }, { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino3.png', x: 402, y: -2, size: 90 },
                { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino4.png', x: stackedCanvas.width - 130, y: 25, size: 150 }, { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino2.png', x: stackedCanvas.width - 120, y: 345, size: 129 },
                { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino5.png', x: -10, y: 780, size: 150 }, { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino7.png', x: -10, y: 295, size: 100 },
                { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino6.png', x: stackedCanvas.width - 115, y: 850, size: 110 }, { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino3.png', x: -5, y: stackedCanvas.height - 200, size: 145 },
                { src: 'assets/stickers/ballerinaCappuccino/ballerinaCappuccino4.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 125 }
            ],
            'doggywhite': [
                { src: 'assets/stickers/doggyWhite/doggyWhite3.png', x: 1, y: 230, size: 115 }, { src: 'assets/stickers/doggyWhite/doggyWhite1.png', x: stackedCanvas.width - 130, y: 25, size: 125 },
                { src: 'assets/stickers/doggyWhite/doggyWhite4.png', x: stackedCanvas.width - 110, y: 650, size: 115 }, { src: 'assets/stickers/doggyWhite/doggyWhite2.png', x: -10, y: 780, size: 125 },
                { src: 'assets/stickers/doggyWhite/doggyWhite3.png', x: -5, y: stackedCanvas.height - 200, size: 115 }, { src: 'assets/stickers/doggyWhite/doggyWhite1.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 125 }
            ],
            'mygirls': [
                { src: 'assets/stickers/myGirls/myGirls4.png', x: -30, y: 15, size: 200 }, { src: 'assets/stickers/myGirls/myGirls7.png', x: 342, y: -25, size: 215 },
                { src: 'assets/stickers/myGirls/myGirls8.png', x: stackedCanvas.width - 110, y: 25, size: 105 }, { src: 'assets/stickers/myGirls/myGirls10.png', x: stackedCanvas.width - 150, y: 95, size: 155 },
                { src: 'assets/stickers/myGirls/myGirls11.png', x: stackedCanvas.width - 95, y: 185, size: 115 }, { src: 'assets/stickers/myGirls/myGirls6.png', x: stackedCanvas.width - 110, y: 450, size: 135 },
                { src: 'assets/stickers/myGirls/myGirls4.png', x: stackedCanvas.width - 110, y: 650, size: 135 }, { src: 'assets/stickers/myGirls/myGirls1.png', x: stackedCanvas.width - 110, y: 780, size: 135 },
                { src: 'assets/stickers/myGirls/myGirls2.png', x: -20, y: 305, size: 125 }, { src: 'assets/stickers/myGirls/myGirls4.png', x: -20, y: 550, size: 125 },
                { src: 'assets/stickers/myGirls/myGirls6.png', x: -20, y: 680, size: 125 }, { src: 'assets/stickers/myGirls/myGirls10.png', x: -15, y: stackedCanvas.height - 370, size: 115 },
                { src: 'assets/stickers/myGirls/myGirls11.png', x: 15, y: stackedCanvas.height - 300, size: 155 }, { src: 'assets/stickers/myGirls/myGirls9.png', x: -5, y: stackedCanvas.height - 200, size: 115 },
                { src: 'assets/stickers/myGirls/myGirls5.png', x: stackedCanvas.width - 190, y: stackedCanvas.height - 290, size: 222 }
            ],
            'sakurablossom': [
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom1.png', x: 1, y: 5, size: 120 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 100, y: 25, size: 80 },
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 120, y: 95, size: 40 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -8, y: 315, size: 82 },
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom3.png', x: 35, y: 390, size: 50 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 100, y: 580, size: 91 },
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 140, y: 430, size: 35 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -2, y: 680, size: 91 },
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom3.png', x: -15, y: 790, size: 45 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 50, y: 980, size: 45 },
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom1.png', x: stackedCanvas.width - 70, y: 880, size: 87 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -1, y: stackedCanvas.height - 320, size: 82 },
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 30, y: stackedCanvas.height - 100, size: 48 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 90, y: stackedCanvas.height - 40, size: 44 },
                { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 200, size: 92 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 40, y: stackedCanvas.height - 290, size: 40 }
            ]
        };

        const layout = stickerLayouts[selectedStickerLayout];
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
        if (!storedImages) return;

        const stackedCanvas = document.createElement('canvas');
        const ctx = stackedCanvas.getContext('2d');

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
        ctx.clearRect(0, 0, stackedCanvas.width, stackedCanvas.height);

        if (backgroundType === 'color') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, stackedCanvas.width, stackedCanvas.height);
        } else if (backgroundType === 'image' && backgroundImage && backgroundImage.complete) {
            ctx.drawImage(backgroundImage, 0, 0, stackedCanvas.width, stackedCanvas.height);
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
                    clipAndDrawImage(ctx, img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight, selectedShape);
                });
            } catch (error) {
                console.error("Gagal memuat gambar:", error);
            }
        }

        ctx.fillStyle = textColor;
        ctx.font = 'bold 32px Arial, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(selectedText, stackedCanvas.width / 2, stackedCanvas.height - 55);

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

        await drawSticker(ctx, stackedCanvas);

        updatePreview(stackedCanvas);
        return stackedCanvas;
    }

    function updatePreview(canvas) {
        if (!photoCustomPreview) return;
        photoCustomPreview.innerHTML = '';
        canvas.style.width = (window.innerWidth <= 768) ? "190px" : "230px";
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

    init();
});