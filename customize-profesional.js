document.addEventListener('DOMContentLoaded', () => {
    // --- CANVAS & CONTEXT SETUP ---
    const photoCanvas = document.getElementById('photo-canvas');
    const frameCanvas = document.getElementById('frame-canvas');
    const pCtx = photoCanvas.getContext('2d'); // Photo Context
    const fCtx = frameCanvas.getContext('2d'); // Frame Context
    const canvasWrapper = document.getElementById('canvas-wrapper');

    // --- DOM ELEMENT SELECTION ---
    const frameSelectionContainer = document.getElementById('frame-selection');
    const downloadBtn = document.getElementById('downloadCopyBtn');

    // --- STATE MANAGEMENT ---
    const state = {
        images: [], // Will hold image objects with position, scale, etc.
        frames: [], // Holds paths to frame images
        poseCount: 4, // Default, will be updated
        activeFrameSrc: null,
        activeImageIndex: -1, // -1 means no image is selected/active
        isDragging: false,
        isResizing: false,
        activeHandle: null, // e.g., 'topLeft', 'bottomRight'
        dragStart: { x: 0, y: 0 }, // To calculate drag offset
    };

    // --- INITIALIZATION ---
    function initialize() {
        // The initialization flow is now driven by loading frames first
        // to get the correct canvas dimensions.
        loadFrameOptions();
        addEventListeners();
    }

    function setupCanvasDimensions(width, height) {
        photoCanvas.width = frameCanvas.width = width;
        photoCanvas.height = frameCanvas.height = height;

        // Make the on-screen wrapper adapt to the canvas aspect ratio
        canvasWrapper.style.aspectRatio = width / height;
    }

    function loadDataFromSession() {
        const storedImages = JSON.parse(sessionStorage.getItem('photoArray'));
        const storedPoseCount = parseInt(sessionStorage.getItem('poseCount'), 10);

        if (!storedImages || !storedPoseCount) {
            canvasWrapper.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Error: Data sesi tidak ditemukan. Silakan kembali dan coba lagi.</p>';
            return;
        }

        state.poseCount = storedPoseCount;
        const imagePromises = storedImages.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
        });

        Promise.all(imagePromises).then(loadedImages => {
            // Distribute photos evenly in the canvas for a start
            const positions = distributePhotos(loadedImages.length, photoCanvas.width, photoCanvas.height);
            state.images = loadedImages.map((img, i) => ({
                element: img,
                x: positions[i].x,
                y: positions[i].y,
                scale: positions[i].scale,
                width: img.width,
                height: img.height
            }));
            redrawPhotos();
        });
    }

    function distributePhotos(count, canvasWidth, canvasHeight) {
        const positions = [];
        const cols = (count === 6 || count === 4) ? 2 : 1; // 2 columns for 4 or 6 photos
        const rows = Math.ceil(count / cols);
        const boxWidth = canvasWidth / cols;
        const boxHeight = canvasHeight / rows;
        const padding = 20; // Padding inside each box

        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            // Calculate initial scale to fit the image within the box (minus padding)
            // This is a placeholder scale; actual image dimensions are needed for perfect fit
            const initialScale = Math.min(
                (boxWidth - padding * 2) / 1000, // Assuming avg image width
                (boxHeight - padding * 2) / 1000  // Assuming avg image height
            );

            positions.push({
                x: col * boxWidth + boxWidth / 2,
                y: row * boxHeight + boxHeight / 2,
                scale: 0.4 // Start with a smaller, consistent scale
            });
        }
        return positions;
    }


    function loadFrameOptions() {
        state.poseCount = parseInt(sessionStorage.getItem('poseCount'), 10) || 4;
        const frameDir = `bingkai/pose${state.poseCount}/`;

        // There are 3 frames for each pose count, named poseX-1.png, poseX-2.png, etc.
        for (let i = 1; i <= 3; i++) {
            const frameSrc = `${frameDir}pose${state.poseCount}-${i}.png`;
            state.frames.push(frameSrc);

            const thumb = document.createElement('div');
            thumb.classList.add('frame-thumbnail');
            thumb.setAttribute('aria-label', `Pilihan Bingkai Foto ${i}`);
            thumb.style.backgroundImage = `url(${frameSrc})`;
            thumb.dataset.src = frameSrc;

            // Load the first frame to determine canvas size
            if (i === 1) {
                const firstFrameImg = new Image();
                firstFrameImg.src = frameSrc;
                firstFrameImg.onload = () => {
                    // Set canvas dimensions based on the frame's original size
                    setupCanvasDimensions(firstFrameImg.naturalWidth, firstFrameImg.naturalHeight);

                    // Now that canvas is sized, load user photos
                    loadDataFromSession();

                    // And draw the first frame
                    thumb.classList.add('active');
                    state.activeFrameSrc = frameSrc;
                    drawFrame(frameSrc);
                };
                firstFrameImg.onerror = () => {
                    console.error(`Failed to load the primary frame: ${frameSrc}`);
                    // Fallback to a default size if frame fails to load
                    setupCanvasDimensions(800, 1200);
                    loadDataFromSession();
                }
            }

            thumb.addEventListener('click', () => {
                document.querySelectorAll('.frame-thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                state.activeFrameSrc = frameSrc;
                drawFrame(frameSrc);
            });
            frameSelectionContainer.appendChild(thumb);
        }
    }

    // --- DRAWING FUNCTIONS ---
    function redrawPhotos() {
        pCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
        state.images.forEach((imgObj, index) => {
            pCtx.save();
            pCtx.translate(imgObj.x, imgObj.y);
            // pCtx.rotate(imgObj.rotation || 0); // Future-proofing for rotation
            pCtx.scale(imgObj.scale, imgObj.scale);
            pCtx.drawImage(imgObj.element, -imgObj.width / 2, -imgObj.height / 2);
            pCtx.restore();

            // Draw handles if this is the active image
            if (index === state.activeImageIndex) {
                drawHandles(imgObj);
            }
        });
    }

    function getHandlePositions(imgObj) {
        const halfW = (imgObj.width * imgObj.scale) / 2;
        const halfH = (imgObj.height * imgObj.scale) / 2;
        return {
            topLeft: { x: imgObj.x - halfW, y: imgObj.y - halfH },
            topRight: { x: imgObj.x + halfW, y: imgObj.y - halfH },
            bottomLeft: { x: imgObj.x - halfW, y: imgObj.y + halfH },
            bottomRight: { x: imgObj.x + halfW, y: imgObj.y + halfH },
        };
    }

    function drawHandles(imgObj) {
        const handles = getHandlePositions(imgObj);
        pCtx.fillStyle = '#0D9488'; // Teal color for handles
        pCtx.strokeStyle = 'white';
        pCtx.lineWidth = 2;
        const handleSize = 10;

        for (const key in handles) {
            const pos = handles[key];
            pCtx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
            pCtx.strokeRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
        }
    }

    function drawFrame(src) {
        const frameImg = new Image();
        frameImg.src = src;
        frameImg.onload = () => {
            fCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
            fCtx.drawImage(frameImg, 0, 0, frameCanvas.width, frameCanvas.height);
        };
    }

    // --- EVENT LISTENERS & INTERACTIVITY ---
    function addEventListeners() {
        photoCanvas.addEventListener('mousedown', onMouseDown);
        photoCanvas.addEventListener('mousemove', onMouseMove);
        photoCanvas.addEventListener('mouseup', onMouseUp);
        photoCanvas.addEventListener('mouseleave', onMouseUp); // End drag if mouse leaves canvas
        photoCanvas.addEventListener('wheel', onWheelScroll);
        downloadBtn.addEventListener('click', downloadImage);
    }

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function onMouseDown(e) {
        const pos = getMousePos(photoCanvas, e);
        state.isDragging = false;
        state.isResizing = false;

        // Check if a handle on the active image was clicked
        if (state.activeImageIndex !== -1) {
            const activeImg = state.images[state.activeImageIndex];
            const handles = getHandlePositions(activeImg);
            const handleSize = 10;
            for (const key in handles) {
                const handlePos = handles[key];
                if (pos.x >= handlePos.x - handleSize && pos.x <= handlePos.x + handleSize &&
                    pos.y >= handlePos.y - handleSize && pos.y <= handlePos.y + handleSize) {
                    state.isResizing = true;
                    state.activeHandle = key;
                    redrawPhotos();
                    return;
                }
            }
        }

        // If not resizing, check for dragging
        for (let i = state.images.length - 1; i >= 0; i--) {
            const img = state.images[i];
            const halfW = (img.width * img.scale) / 2;
            const halfH = (img.height * img.scale) / 2;

            if (pos.x >= img.x - halfW && pos.x <= img.x + halfW &&
                pos.y >= img.y - halfH && pos.y <= img.y + halfH) {

                // Move the clicked image to the end of the array to draw it on top
                const clickedImage = state.images.splice(i, 1)[0];
                state.images.push(clickedImage);

                // The active image is now the last one
                state.activeImageIndex = state.images.length - 1;
                state.isDragging = true;
                state.dragStart.x = pos.x - clickedImage.x;
                state.dragStart.y = pos.y - clickedImage.y;

                redrawPhotos();
                return;
            }
        }

        // If clicked outside, deselect
        state.activeImageIndex = -1;
        redrawPhotos();
    }

    function onMouseMove(e) {
        const pos = getMousePos(photoCanvas, e);
        if (state.isDragging && state.activeImageIndex !== -1) {
            const activeImg = state.images[state.activeImageIndex];
            activeImg.x = pos.x - state.dragStart.x;
            activeImg.y = pos.y - state.dragStart.y;
            redrawPhotos();
        } else if (state.isResizing && state.activeImageIndex !== -1) {
            const img = state.images[state.activeImageIndex];
            const handle = state.activeHandle;

            const aspect = img.width / img.height;
            let newWidth, newHeight, newScale;

            // Determine the stationary anchor point (opposite corner)
            const handles = getHandlePositions(img);
            let anchorX, anchorY;

            if (handle.includes('bottom')) { anchorY = handles.topLeft.y; } else { anchorY = handles.bottomLeft.y; }
            if (handle.includes('Right')) { anchorX = handles.topLeft.x; } else { anchorX = handles.topRight.x; }

            // Calculate new width and height based on mouse distance from anchor
            newWidth = Math.abs(pos.x - anchorX);
            newHeight = Math.abs(pos.y - anchorY);

            // Maintain aspect ratio
            if (newWidth / newHeight > aspect) {
                newWidth = newHeight * aspect;
            } else {
                newHeight = newWidth / aspect;
            }

            newScale = newWidth / img.width;

            if (newScale > 0.05 && newScale < 5) { // Clamp scale
                img.scale = newScale;

                // Recalculate center position (x, y) based on the new scale and fixed anchor
                const newHalfW = newWidth / 2;
                const newHalfH = newHeight / 2;

                if (handle.includes('bottom')) { img.y = anchorY + newHalfH; } else { img.y = anchorY - newHalfH; }
                if (handle.includes('Right')) { img.x = anchorX + newHalfW; } else { img.x = anchorX - newHalfW; }
            }

            redrawPhotos();
        }
    }

    function onMouseUp() {
        state.isDragging = false;
        state.isResizing = false;
        state.activeHandle = null;
    }

    function onWheelScroll(e) {
        e.preventDefault(); // Prevent page scrolling
        const pos = getMousePos(photoCanvas, e);

        // Find which image is being scrolled over, starting from the top
        let targetImageIndex = -1;
        for (let i = state.images.length - 1; i >= 0; i--) {
            const img = state.images[i];
            const halfW = (img.width * img.scale) / 2;
            const halfH = (img.height * img.scale) / 2;
            if (pos.x >= img.x - halfW && pos.x <= img.x + halfW &&
                pos.y >= img.y - halfH && pos.y <= img.y + halfH) {
                targetImageIndex = i;
                break;
            }
        }

        if (targetImageIndex !== -1) {
            const img = state.images[targetImageIndex];
            const zoomIntensity = 0.05;
            const wheel = e.deltaY < 0 ? 1 : -1;
            const zoom = 1 + wheel * zoomIntensity;

            img.scale *= zoom;
            // Add clamping to prevent extreme zoom
            img.scale = Math.max(0.05, Math.min(img.scale, 4.0));

            redrawPhotos();
        }
    }

    // --- FINAL ACTIONS & MODAL LOGIC ---
    const previewModal = document.getElementById('previewModal');
    const qrModal = document.getElementById('qrModal');
    const previewBtn = document.getElementById('previewBtn');
    const shareBtn = document.getElementById('shareBtn'); // Assuming share uses the same QR logic
    const customBackBtn = document.getElementById('customBack');

    const firebaseConfig = {
        apiKey: "AIzaSyCCaLXoaHFOuXRnHAvQzg9R0c1tfsTsTBU",
        authDomain: "project-xlord.firebaseapp.com",
        databaseURL: "https://project-xlord-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "project-xlord",
        storageBucket: "project-xlord.appspot.com",
        messagingSenderId: "847461816867",
        appId: "1:847461816867:web:17071ba14ffe6a6099ef96",
        measurementId: "G-344KX3B197"
    };

    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const database = firebase.database();

    let currentQrLink = '';
    let currentImageData = '';
    let qrTimerInterval = null;

    function getFinalImageB64() {
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = photoCanvas.width;
        finalCanvas.height = photoCanvas.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(photoCanvas, 0, 0);
        finalCtx.drawImage(frameCanvas, 0, 0);
        return finalCanvas.toDataURL('image/png', 1.0);
    }

    function showModal(modal) { modal.style.display = 'block'; }
    function hideModal(modal) {
        modal.style.display = 'none';
        if (modal.id === 'qrModal' && qrTimerInterval) {
            clearInterval(qrTimerInterval);
        }
    }

    previewBtn.addEventListener('click', () => {
        document.getElementById('modalImagePreview').src = getFinalImageB64();
        showModal(previewModal);
    });

    // Wire up all close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(previewModal);
            hideModal(qrModal);
        });
    });

    customBackBtn.addEventListener('click', () => {
        window.location.href = 'profesional-mode.html';
    });

    function generateShortId(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); }
        return result;
    }

    async function generateTemporaryLink(base64ImageData) {
        const expirationTime = Date.now() + (5 * 60 * 1000); // 5 minutes
        const dataToStore = { imageData: base64ImageData, expiresAt: expirationTime };
        const shortId = generateShortId(6);
        await database.ref('images/' + shortId).set(dataToStore);
        return `${window.location.origin}/hasil.html?id=${shortId}`;
    }

    async function showQrCode() {
        showModal(qrModal);
        const qrCodePopupContainer = document.getElementById('qrCodePopupContainer');
        qrCodePopupContainer.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 4rem;"></i>';

        if (qrTimerInterval) clearInterval(qrTimerInterval);

        try {
            currentImageData = getFinalImageB64();
            currentQrLink = await generateTemporaryLink(currentImageData);

            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentQrLink)}`;
            qrCodePopupContainer.innerHTML = `<img src="${qrApiUrl}" alt="Scan to download">`;

            // Setup modal buttons
            document.getElementById('copyLinkBtn').onclick = () => {
                navigator.clipboard.writeText(currentQrLink).then(() => alert('Link disalin!'));
            };
            document.getElementById('downloadFromModalBtn').onclick = () => {
                const link = document.createElement('a');
                link.download = `pictlord-profesional-${Date.now()}.png`;
                link.href = currentImageData;
                link.click();
            };

        } catch (error) {
            console.error('Firebase/QR Error:', error);
            qrCodePopupContainer.innerHTML = '<strong>Gagal membuat QR Code.</strong>';
        }
    }

    downloadBtn.addEventListener('click', showQrCode);

    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Pictlord Photobooth',
                text: 'bingung nyari? photobooth online free dimana dan kapan aja tenang pictlord 📸solusinya 😎',
                url: window.location.origin,
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
        } else {
            alert('Fitur Share tidak didukung di browser ini. Coba salin link dari Tombol QR.');
        }
    });

    initialize();
});
