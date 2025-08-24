document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const photoCustomPreview = document.getElementById('photoPreview');
    const customStickerButtonsContainer = document.getElementById('custom-sticker-buttons-container');
    const dynamicFrameButtonsContainer = document.getElementById('dynamic-frame-buttons-container');
    const filterButtonsContainer = document.getElementById('filter-buttons-container');

    // --- State Variables ---
    let assetsData = null;
    let selectedFilter = 'none';
    let backgroundType = 'color';
    let backgroundColor = '#FFFFFF';
    let backgroundImage = null;
    let fabricCanvas = null;

    // --- Pose-dependent variables ---
    let canvasWidth, canvasHeight;

    const poseCount = parseInt(sessionStorage.getItem('poseCount'), 10) || 4;
    const storedImages = JSON.parse(sessionStorage.getItem('photoArray'));

    if (!storedImages || storedImages.length === 0) {
        console.error("No valid images found in sessionStorage.");
        if (photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Foto tidak ditemukan. Silakan kembali dan ambil foto baru.</p>';
        return;
    }

    // --- Set canvas dimensions based on poseCount ---
    if (poseCount === 3) {
        canvasWidth = 592;
        canvasHeight = 1352;
    } else { // pose 4 or 6
        canvasWidth = 900;
        canvasHeight = 1352;
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
        ctx.moveTo(-size / 4, -size / 4);
        ctx.lineTo(size / 4, size / 4);
        ctx.moveTo(size / 4, -size / 4);
        ctx.lineTo(-size / 4, size / 4);
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
            photoCustomPreview.innerHTML = '';
            photoCustomPreview.appendChild(canvasEl);

            fabricCanvas = new fabric.Canvas('photo-canvas', {
                width: canvasWidth,
                height: canvasHeight
            });

            const previewWidth = (window.innerWidth <= 768) ? 190 : 230;
            const scale = previewWidth / canvasWidth;
            fabricCanvas.setDimensions({
                width: previewWidth,
                height: canvasHeight * scale
            });
            fabricCanvas.setZoom(scale);

            renderDynamicFrameButtons();
            renderCustomStickerButtons();
            await renderFilterButtons();

            setupEventListeners();
            await redrawCanvas();

        } catch (error) {
            console.error("Initialization failed:", error);
            if (photoCustomPreview) photoCustomPreview.innerHTML = '<p>Error: Gagal memuat aset kustomisasi.</p>';
        }
    };

    // --- Rendering Functions ---

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
        filterButtonsContainer.innerHTML = '';
        const firstPhoto = storedImages[0];
        if (!firstPhoto) return;

        const filters = [
            { name: 'None', type: 'none' }, { name: 'Sepia', type: 'sepia' }, { name: 'Grayscale', type: 'grayscale' },
            { name: 'Invert', type: 'invert' }, { name: 'Black & White', type: 'blackwhite' }, { name: 'Brownie', type: 'brownie' },
            { name: 'Vintage', type: 'vintage' }, { name: 'Technicolor', type: 'technicolor' }, { name: 'Polaroid', type: 'polaroid' },
            { name: 'Sharpen', type: 'sharpen' }, { name: 'Emboss', type: 'emboss' }
        ];

        const baseImage = new Image();
        baseImage.crossOrigin = "anonymous";
        baseImage.src = firstPhoto;
        await new Promise(r => baseImage.onload = r);

        for (const filter of filters) {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonStickers filter-btn';
            btn.dataset.filter = filter.type;

            const thumbnailCanvas = document.createElement('canvas');
            thumbnailCanvas.width = 50; thumbnailCanvas.height = 50;
            const thumbCtx = thumbnailCanvas.getContext('2d');
            thumbCtx.drawImage(baseImage, 0, 0, 50, 50);
            const filteredThumb = await getFilteredImage(thumbnailCanvas, filter.type);

            const img = new Image();
            img.src = filteredThumb.toDataURL ? filteredThumb.toDataURL() : filteredThumb.src;
            img.className = 'stickerIconSize';
            img.alt = filter.name;

            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip-text';
            tooltip.textContent = filter.name;

            btn.appendChild(img);
            btn.appendChild(tooltip);
            if (filter.type === 'none') btn.classList.add('active');
            filterButtonsContainer.appendChild(btn);
        }
    };

    // --- Event Handling ---
    const setupEventListeners = () => {
        dynamicFrameButtonsContainer.addEventListener('click', handleDynamicFrameClick);
        customStickerButtonsContainer.addEventListener('click', handleCustomStickerClick);
        filterButtonsContainer.addEventListener('click', handleFilterClick);
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
                borderColor: '#E28585', cornerColor: '#E28585', cornerSize: 24,
                transparentCorners: false, cornerStyle: 'circle'
            });
            img.controls.deleteControl = new fabric.Control({ x: 0.5, y: -0.5, cursorStyle: 'pointer', mouseUpHandler: deleteObject, render: renderDeleteIcon, cornerSize: 24 });
            img.controls.mirrorControl = new fabric.Control({ x: -0.5, y: -0.5, cursorStyle: 'pointer', mouseUpHandler: flipObject, render: renderMirrorIcon, cornerSize: 24 });
            fabricCanvas.add(img);
            img.bringToFront();
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    const renderDynamicFrameButtons = () => {
        if (!assetsData.dynamicFrames || !dynamicFrameButtonsContainer) return;
        dynamicFrameButtonsContainer.innerHTML = '';
        const pose = `pose${poseCount}`;
        const filteredFrames = assetsData.dynamicFrames.filter(frame => frame.pose === pose);
        filteredFrames.forEach(frame => {
            const btn = document.createElement('button');
            btn.className = 'neumorphic-btn buttonStickers';
            btn.dataset.src = frame.src;
            btn.innerHTML = `<img src="${frame.src}" alt="Dynamic Frame" class="stickerIconSize">`;
            dynamicFrameButtonsContainer.appendChild(btn);
        });
    };

    function handleDynamicFrameClick(e) {
        const btn = e.target.closest('.neumorphic-btn');
        if (!btn) return;

        // Remove existing frame first
        fabricCanvas.getObjects().forEach(obj => {
            if (obj.isFrame) {
                fabricCanvas.remove(obj);
            }
        });

        const frameSrc = btn.dataset.src;
        fabric.Image.fromURL(frameSrc, (img) => {
            img.scaleToWidth(canvasWidth);
            img.scaleToHeight(canvasHeight);
            img.set({
                left: 0,
                top: 0,
                selectable: false,
                evented: false,
                isFrame: true // Add a custom property to identify the frame
            });
            fabricCanvas.add(img);

            const photoCount = fabricCanvas.getObjects().filter(o => o.isPhoto).length;
            img.moveTo(photoCount);

            fabricCanvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    function handleFilterClick(e) {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        selectedFilter = btn.dataset.filter;
        filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const photoObjects = fabricCanvas.getObjects().filter(obj => obj.isPhoto);

        photoObjects.forEach(async (photoObj) => {
            const originalImageEl = photoObj.originalImage;
            const filteredCanvasEl = await getFilteredImage(originalImageEl, selectedFilter);
            
            photoObj.setSrc(filteredCanvasEl.toDataURL(), () => {
                fabricCanvas.renderAll();
            }, { crossOrigin: 'anonymous' });
        });
    }

    function setBackground(option) {
        backgroundType = option.type;
        if (option.type === 'color') {
            backgroundColor = option.value;
            backgroundImage = null;
            redrawCanvas();
        } else if (option.type === 'image') {
            backgroundImage = new Image();
            backgroundImage.src = option.src;
            backgroundImage.onload = redrawCanvas;
            backgroundImage.onerror = () => console.error(`Failed to load background image: ${option.src}`);
        }
    }


    async function getFilteredImage(imageElement, filterType) {
        if (filterType === 'none' || !filterType) return imageElement;
        return new Promise(resolve => {
            const fabricImage = new fabric.Image(imageElement, { crossOrigin: 'anonymous' });
            let filter;
            switch (filterType) {
                case 'grayscale': filter = new fabric.Image.filters.Grayscale(); break;
                case 'sepia': filter = new fabric.Image.filters.Sepia(); break;
                case 'invert': filter = new fabric.Image.filters.Invert(); break;
                case 'brownie': filter = new fabric.Image.filters.Brownie(); break;
                case 'vintage': filter = new fabric.Image.filters.Vintage(); break;
                case 'technicolor': filter = new fabric.Image.filters.Technicolor(); break;
                case 'polaroid': filter = new fabric.Image.filters.Polaroid(); break;
                case 'blackwhite': filter = new fabric.Image.filters.BlackWhite(); break;
                case 'sharpen': filter = new fabric.Image.filters.Convolute({ matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0] }); break;
                case 'emboss': filter = new fabric.Image.filters.Convolute({ matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1] }); break;
                default: resolve(imageElement); return;
            }
            fabricImage.filters.push(filter);
            fabricImage.applyFilters();
            resolve(fabricImage.toCanvasElement());
        });
    }

    async function redrawCanvas() {
        if (!storedImages || !fabricCanvas) return;

        fabricCanvas.clear();

        if (backgroundType === 'color') {
            fabricCanvas.backgroundColor = backgroundColor;
        } else if (backgroundType === 'image' && backgroundImage && backgroundImage.complete) {
            fabricCanvas.setBackgroundImage(new fabric.Image(backgroundImage), fabricCanvas.renderAll.bind(fabricCanvas), {
                scaleX: canvasWidth / backgroundImage.width,
                scaleY: canvasHeight / backgroundImage.height,
            });
        }

        const otherObjects = fabricCanvas.getObjects().filter(o => !o.isPhoto);
        fabricCanvas.clear();
        fabricCanvas.add(...otherObjects);


        const imageElements = await Promise.all(storedImages.map(imgData => new Promise(resolve => {
            fabric.Image.fromURL(imgData, (img) => {
                if (img) {
                    img.originalImage = img.getElement();
                    img.isPhoto = true;
                    resolve(img);
                } else {
                    resolve(null);
                }
            }, { crossOrigin: 'anonymous' });
        })));

        // --- POSE-BASED LAYOUT LOGIC ---
        if (poseCount === 3) {
            const borderWidth = 30, spacing = 12, bottomPadding = 250;
            const availableHeight = canvasHeight - (borderWidth * 2) - (spacing * (imageElements.length - 1)) - bottomPadding;
            const photoHeight = availableHeight / imageElements.length;
            const photoWidth = canvasWidth - (borderWidth * 2);

            for (let i = 0; i < imageElements.length; i++) {
                const img = imageElements[i];
                if (!img) continue;
                const fImg = new fabric.Image(img.originalImage);

                fImg.scaleToWidth(photoWidth);
                fImg.set({
                    left: borderWidth,
                    top: borderWidth + i * (photoHeight + spacing),
                    isPhoto: true
                });
                fabricCanvas.add(fImg);
            }
        } else { // For 4 and 6 poses
            const columns = 2;
            const rows = (poseCount === 6) ? 3 : 2;
            const borderWidth = 30, spacing = 12, bottomPadding = (poseCount === 6) ? 100 : 250;
            const availableWidth = canvasWidth - (borderWidth * 2) - (spacing * (columns - 1));
            const availableHeight = canvasHeight - (borderWidth * 2) - (spacing * (rows - 1)) - bottomPadding;
            const photoWidth = availableWidth / columns;
            const photoHeight = availableHeight / rows;

            for (let i = 0; i < imageElements.length; i++) {
                const img = imageElements[i];
                if (!img) continue;
                const fImg = new fabric.Image(img.originalImage);

                fImg.scaleToWidth(photoWidth);
                const col = i % columns, row = Math.floor(i / columns);
                fImg.set({
                    left: borderWidth + col * (photoWidth + spacing),
                    top: borderWidth + row * (photoHeight + spacing),
                });
                fabricCanvas.add(fImg);
                fImg.sendToBack();
            }
        }
        fabricCanvas.getObjects().forEach(obj => {
            if (obj.isPhoto) {
                obj.sendToBack();
            }
        });

        const frame = fabricCanvas.getObjects().find(o => o.isFrame);
        if (frame) {
            const photoCount = fabricCanvas.getObjects().filter(o => o.isPhoto).length;
            frame.moveTo(photoCount);
        }

        fabricCanvas.renderAll();
    }

    window.drawFinalImage = async () => {
        if (!fabricCanvas) return null;
        fabricCanvas.discardActiveObject().renderAll();
        const zoom = fabricCanvas.getZoom();
        const dataURL = fabricCanvas.toDataURL({
            format: 'png', quality: 1.0, multiplier: 1 / zoom
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
