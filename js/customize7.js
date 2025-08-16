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
    let selectedStickerLayout = null; // Single sticker selection
    let selectedText = 'pictlord';
    let backgroundType = 'color';
    let backgroundColor = '#FFFFFF';
    let backgroundImage = null;
    let textColor = '#E28585';
    let currentCanvas = null; // To hold the current canvas for download

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

            redrawCanvas();

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
        
        // CATATAN: Posisi stiker di bawah ini mungkin perlu penyesuaian manual
        // karena tinggi canvas berubah dari 1352px menjadi 1212px.
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
                { src: 'assets/stickers/classic2.png', x: 4, y: 80, size: 20 },
                { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 70, size: 120 },
                { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 670, size: 120 }
            ],
            'classicbsticker': [
                { src: 'assets/stickers/classic4.png', x: 1, y: 50, size: 32 }, { src: 'assets/stickers/classic4.png', x: 1, y: 550, size: 32 },
                { src: 'assets/stickers/classic5.png', x: 4, y: 80, size: 20 },
                { src: 'assets/stickers/classic6.png', x: stackedCanvas.width - 75, y: 70, size: 120 },
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
            // More layouts...
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
        
        // DIUBAH: Mengganti layout dari 2x3 menjadi 2x2
        const columns = 2, rows = 2;
        const imageGridSize = rows * columns;

        // DIUBAH: Menyesuaikan tinggi canvas agar proporsional untuk 4 foto dengan gaya "panjang"
        const canvasWidth = 900, canvasHeight = 1212;
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
        
        // DIUBAH: Logika dibuat lebih aman jika jumlah foto lebih dari 4
        if (storedImages.length >= imageGridSize) {
            const imagePromises = storedImages.slice(0, imageGridSize).map(imgData => new Promise((resolve, reject) => {
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
        currentCanvas = stackedCanvas;
    }

    function updatePreview(canvas) {
        if (!photoCustomPreview) return;
        photoCustomPreview.innerHTML = '';
        // DIUBAH: Ukuran preview diperbesar agar tidak terlihat "mini"
        canvas.style.width = (window.innerWidth <= 768) ? "280px" : "340px";
        if (backgroundColor === '#FFFFFF' && backgroundType === 'color') {
            canvas.style.border = '1px solid #ccc';
        } else {
            canvas.style.border = 'none';
        }
        photoCustomPreview.appendChild(canvas);
    }

    init();
});
