document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================================================
    // 1. PUSAT PENGATURAN / STATE MANAGEMENT
    // =========================================================================
    const customizationOptions = {
        frame: { type: 'color', value: '#FFFFFF', image: null },
        photoShape: 'default',
        sticker: null,
        logo: { lang: 'ENG', text: 'pictlord', color: '#000000' },
        date: { show: false, showTime: false }
    };

    // =========================================================================
    // 2. SELEKTOR ELEMEN DOM & VARIABEL GLOBAL
    // =========================================================================
    const photoCustomPreview = document.getElementById('photoPreview');
    const controlsPanel = document.querySelector('.controls-panel');
    const storedImages = JSON.parse(sessionStorage.getItem('photoArray'));
    let currentCanvas = null; // Variabel untuk menyimpan kanvas aktif

    if (!storedImages) {
        console.error("Data foto tidak ditemukan di sessionStorage.");
        if (photoCustomPreview) photoCustomPreview.innerHTML = "<p>Error: Foto tidak ditemukan. Silakan kembali ke halaman sebelumnya.</p>";
        return;
    }

    // =========================================================================
    // 3. FUNGSI UTAMA UNTUK MENGGAMBAR CANVAS (REDRAW)
    // =========================================================================
    async function redrawCanvas() {
        const stackedCanvas = document.createElement('canvas');
        const ctx = stackedCanvas.getContext('2d');
        
        // --- Layout 2x3 untuk 6 foto ---
        const columns = 2, rows = 3; 
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

        // --- Langkah 1: Menggambar Frame ---
        if (customizationOptions.frame.type === 'color') {
            ctx.fillStyle = customizationOptions.frame.value;
            ctx.fillRect(0, 0, stackedCanvas.width, stackedCanvas.height);
        } else if (customizationOptions.frame.type === 'image' && customizationOptions.frame.image && customizationOptions.frame.image.complete) {
            ctx.drawImage(customizationOptions.frame.image, 0, 0, stackedCanvas.width, stackedCanvas.height);
        }
        
        // --- Langkah 2: Menggambar Foto-foto ---
        if (storedImages && storedImages.length === imageGridSize) {
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
                    clipAndDrawImage(ctx, img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight, customizationOptions.photoShape);
                });
            } catch (error) {
                console.error("Gagal memuat gambar:", error);
            }
        } else {
            console.warn(`Jumlah foto (${storedImages.length}) tidak sesuai, layout 2x3 membutuhkan ${imageGridSize} foto.`);
        }
        
        // --- Langkah 3: Menggambar Overlay (Teks, Tanggal, Stiker) ---
        drawTextAndDate(ctx, stackedCanvas);
        await drawSticker(ctx, stackedCanvas, customizationOptions.sticker);
        
        updatePreview(stackedCanvas);
        currentCanvas = stackedCanvas;
        return stackedCanvas;
    }

    // =========================================================================
    // 4. FUNGSI-FUNGSI HELPER
    // =========================================================================
    function updatePreview(canvas) {
        if (!photoCustomPreview) return;
        photoCustomPreview.innerHTML = '';
        photoCustomPreview.appendChild(canvas);
        canvas.style.width = window.innerWidth <= 768 ? "190px" : "230px";
        canvas.style.border = (customizationOptions.frame.type === 'color' && customizationOptions.frame.value.toLowerCase() === '#ffffff') ? '1px solid #ccc' : 'none';
    }

    function drawTextAndDate(ctx, canvas) {
        const textColor = customizationOptions.logo.color;
        if (customizationOptions.logo.text) {
            ctx.fillStyle = textColor;
            ctx.font = 'bold 32px Arial, Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(customizationOptions.logo.text, canvas.width / 2, canvas.height - 55);
        }
        if (customizationOptions.date.show || customizationOptions.date.showTime) {
            const currentDate = new Date();
            let displayText = '';
            if (customizationOptions.date.show) displayText += currentDate.toLocaleDateString('id-ID');
            if (customizationOptions.date.showTime) {
                const timeString = currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                displayText += (customizationOptions.date.show ? ' ' : '') + timeString;
            }
            ctx.fillStyle = textColor;
            ctx.font = '18px "DM Sans", Arial, Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(displayText, canvas.width / 2, canvas.height - 30);
        }
    }

    function drawSticker(ctx, stackedCanvas, stickerType) {
        return new Promise((resolve) => {
           if (!stickerType) return resolve();
           // DATA LENGKAP STIKER ANDA
           const stickerLayouts = { 'kiss': [{ src: 'assets/stickers/kiss1.png', x: 30, y: 300, size: 170 }], 'sweet': [ { src: 'assets/stickers/sweet1.png', x: 17, y: 80, size: 90 }, { src: 'assets/stickers/sweet2.png', x: stackedCanvas.width - 100, y: 390, size: 90 }, { src: 'assets/stickers/sweet3.png', x: 30, y: stackedCanvas.height - 200, size: 90 } ], 'ribbon': [ { src: 'assets/stickers/ribbon1.png', x: 17, y: 80, size: 90 }, { src: 'assets/stickers/ribbon3.png', x: stackedCanvas.width - 100, y: 550, size: 95 }, { src: 'assets/stickers/ribbon2.png', x: 15, y: stackedCanvas.height - 380, size: 90 } ], 'sparkle': [ { src: 'assets/stickers/sparkle1.png', x: stackedCanvas.width - 200, y: 150, size: 250 }, { src: 'assets/stickers/sparkle2.png', x: 2, y: stackedCanvas.height - 850, size: 200 }, { src: 'assets/stickers/sparkle2.png', x: stackedCanvas.width - 150, y: stackedCanvas.height - 180, size: 110 } ], 'pearl': [ { src: 'assets/stickers/pearl1.png', x: 35, y: 30, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 25, y: 50, size: 25 }, { src: 'assets/stickers/pearl1.png', x: 65, y: 40, size: 20 }, { src: 'assets/stickers/pearl1.png', x: 95, y: 40, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 75, y: 26, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 25, y: 65, size: 55 }, { src: 'assets/stickers/pearl1.png', x: 25, y: 120, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 825, y: stackedCanvas.height - 620, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 800, y: stackedCanvas.height - 690, size: 15 }, { src: 'assets/stickers/pearl1.png', x: 840, y: stackedCanvas.height - 650, size: 25 }, { src: 'assets/stickers/pearl1.png', x: 830, y: stackedCanvas.height - 700, size: 45 }, { src: 'assets/stickers/pearl1.png', x: 810, y: stackedCanvas.height - 670, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 810, y: stackedCanvas.height - 710, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 15, y: stackedCanvas.height - 200, size: 30 }, { src: 'assets/stickers/pearl1.png', x: 35, y: stackedCanvas.height - 220, size: 20 }, { src: 'assets/stickers/pearl1.png', x: 20, y: stackedCanvas.height - 240, size: 15 }, { src: 'assets/stickers/pearl2.png', x: 15, y: stackedCanvas.height - 180, size: 150 }, { src: 'assets/stickers/pearl2.png', x: stackedCanvas.width - 150, y: 270, size: 120 } ], 'classic': [{ src: 'assets/stickers/classic1.png', x: 1, y: 50, size: 32 }, { src: 'assets/stickers/classic1.png', x: 1, y: 450, size: 32 }, { src: 'assets/stickers/classic1.png', x: 1, y: 950, size: 32 }, { src: 'assets/stickers/classic2.png', x: 4, y: 80, size: 20 }, { src: 'assets/stickers/classic2.png', x: 4, y: 980, size: 20 }, { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 70, size: 120 }, { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 570, size: 120 }], classicbsticker: [{ src: 'assets/stickers/classic4.png', x: 1, y: 50, size: 32 }, { src: 'assets/stickers/classic4.png', x: 1, y: 450, size: 32 }, { src: 'assets/stickers/classic4.png', x: 1, y: 950, size: 32 }, { src: 'assets/stickers/classic5.png', x: 4, y: 80, size: 20 }, { src: 'assets/stickers/classic5.png', x: 4, y: 980, size: 20 }, { src: 'assets/stickers/classic6.png', x: stackedCanvas.width - 75, y: 70, size: 120 }, { src: 'assets/stickers/classic6.png', x: stackedCanvas.width - 75, y: 570, size: 120 }], 'soft': [{ src: 'assets/stickers/soft1.png', x: 5, y: 20, size: 145 }, { src: 'assets/stickers/soft2.png', x: stackedCanvas.width - 120, y: 30, size: 100 }, { src: 'assets/stickers/soft3.png', x: 10, y: 500, size: 120 }, { src: 'assets/stickers/soft4.png', x: 15, y: stackedCanvas.height - 200, size: 120 }, { src: 'assets/stickers/soft5.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 120 }, { src: 'assets/stickers/soft6.png', x: stackedCanvas.width - 130, y: 430, size: 120 }], 'bunny': [{ src: 'assets/stickers/bunny1.png', x: stackedCanvas.width - 170, y: 10, size: 150 }, { src: 'assets/stickers/bunny2.png', x: 15, y: 300, size: 95 }, { src: 'assets/stickers/bunny2.png', x: stackedCanvas.width - 100, y: 700, size: 75 }, { src: 'assets/stickers/bunny3.png', x: 15, y: stackedCanvas.height - 200, size: 135 }], 'lucky': [{ src: 'assets/stickers/lucky2.png', x: stackedCanvas.width - 170, y: 20, size: 150 }, { src: 'assets/stickers/lucky1.png', x: 15, y: stackedCanvas.height - 215, size: 170 }, { src: 'assets/stickers/lucky3.png', x: stackedCanvas.width - 120, y: 420, size: 90 }, { src: 'assets/stickers/lucky4.png', x: stackedCanvas.width - 120, y: 495, size: 90 }, { src: 'assets/stickers/lucky5.png', x: stackedCanvas.width - 128, y: 560, size: 110 }, { src: 'assets/stickers/lucky6.png', x: stackedCanvas.width - 120, y: 650, size: 100 }, { src: 'assets/stickers/lucky7.png', x: stackedCanvas.width - 120, y: 730, size: 95 }], 'confetti': [{ src: 'assets/stickers/confetti/star5.png', x: 100, y: 20, size: 40 }, { src: 'assets/stickers/confetti/circle2.png', x: stackedCanvas.width - 120, y: 45, size: 50 }, { src: 'assets/stickers/confetti/circle1.png', x: 30, y: 150, size: 35 }, { src: 'assets/stickers/confetti/circle1.png', x: stackedCanvas.width - 70, y: 180, size: 32 }, { src: 'assets/stickers/confetti/star2.png', x: stackedCanvas.width - 100, y: 320, size: 40 }, { src: 'assets/stickers/confetti/star1.png', x: 100, y: 450, size: 32 }, { src: 'assets/stickers/confetti/circle2.png', x: stackedCanvas.width - 30, y: 530, size: 27 }, { src: 'assets/stickers/confetti/star4.png', x: stackedCanvas.width - 70, y: 580, size: 27 }, { src: 'assets/stickers/confetti/star3.png', x: 22, y: 690, size: 47 }, { src: 'assets/stickers/confetti/circle1.png', x: stackedCanvas.width - 200, y: 800, size: 32 }, { src: 'assets/stickers/confetti/circle1.png', x: stackedCanvas.width - 200, y: 800, size: 32 }, { src: 'assets/stickers/confetti/star2.png', x: 100, y: 850, size: 49 }, { src: 'assets/stickers/confetti/circle2.png', x: 22, y: 990, size: 30 }, { src: 'assets/stickers/confetti/star1.png', x: stackedCanvas.width - 100, y: stackedCanvas.height - 200, size: 35 }], 'ribboncoquette': [{ src: 'assets/stickers/ribboncq2.png', x: 1, y: 0, size: 80 }, { src: 'assets/stickers/ribboncq3.png', x: 392, y: 15, size: 95 }, { src: 'assets/stickers/ribboncq1.png', x: stackedCanvas.width - 39, y: 25, size: 82 }, { src: 'assets/stickers/ribboncq1.png', x: -22, y: 290, size: 75 }, { src: 'assets/stickers/ribboncq2.png', x: stackedCanvas.width - 100, y: 240, size: 55 }, { src: 'assets/stickers/ribboncq3.png', x: 5, y: 640, size: 52 }, { src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 78, y: 520, size: 69 }, { src: 'assets/stickers/ribboncq1.png', x: 399, y: stackedCanvas.height - 200, size: 82 }, { src: 'assets/stickers/ribboncq2.png', x: stackedCanvas.width - 42, y: 760, size: 55 }, { src: 'assets/stickers/ribboncq1.png', x: -15, y: 890, size: 72 }, { src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 70, y: 1020, size: 55 }, { src: 'assets/stickers/ribboncq2.png', x: -8, y: stackedCanvas.height - 200, size: 80 }, { src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 70, y: stackedCanvas.height - 100, size: 55 }], 'blueribboncoquette': [{ src: 'assets/stickers/blueRibbon.png', x: 1, y: 0, size: 80 }, { src: 'assets/stickers/blueRibbon.png', x: 392, y: 15, size: 95 }, { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 39, y: 25, size: 82 }, { src: 'assets/stickers/blueRibbon.png', x: -22, y: 290, size: 75 }, { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 100, y: 240, size: 55 }, { src: 'assets/stickers/blueRibbon.png', x: 5, y: 640, size: 52 }, { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 78, y: 520, size: 69 }, { src: 'assets/stickers/blueRibbon.png', x: 399, y: stackedCanvas.height - 200, size: 82 }, { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 42, y: 760, size: 55 }, { src: 'assets/stickers/blueRibbon.png', x: -15, y: 890, size: 72 }, { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 70, y: 1020, size: 55 }, { src: 'assets/stickers/blueRibbon.png', x: -8, y: stackedCanvas.height - 200, size: 80 }, { src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 70, y: stackedCanvas.height - 100, size: 55 }], 'blackstar': [{ src: 'assets/stickers/blackStar1.png', x: 340, y: -90, size: 250 }, { src: 'assets/stickers/blackStar2.png', x: stackedCanvas.width - 90, y: -30, size: 110 }, { src: 'assets/stickers/blackStar3.png', x: 18, y: 130, size: 98 }, { src: 'assets/stickers/blackStar4.png', x: stackedCanvas.width - 120, y: 230, size: 115 }, { src: 'assets/stickers/blackStar2.png', x: -17, y: 390, size: 65 }, { src: 'assets/stickers/blackStar3.png', x: stackedCanvas.width - 190, y: 590, size: 145 }, { src: 'assets/stickers/blackStar2.png', x: 15, y: 750, size: 45 }, { src: 'assets/stickers/blackStar2.png', x: stackedCanvas.width - 80, y: 950, size: 55 }, { src: 'assets/stickers/blackStar4.png', x: -50, y: stackedCanvas.height - 150, size: 190 }], 'yellowchicken': [{ src: 'assets/stickers/yellowChicken1.png', x: 1, y: 2, size: 90 }, { src: 'assets/stickers/yellowChicken2.png', x: 220, y: -2, size: 66 }, { src: 'assets/stickers/yellowChicken1.png', x: stackedCanvas.width - 160, y: 25, size: 55 }, { src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 90, y: 145, size: 85 }, { src: 'assets/stickers/yellowChicken2.png', x: -20, y: 245, size: 95 }, { src: 'assets/stickers/yellowChicken1.png', x: 140, y: 360, size: 55 }, { src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 220, y: 660, size: 55 }, { src: 'assets/stickers/yellowChicken3.png', x: stackedCanvas.width - 70, y: 490, size: 85 }, { src: 'assets/stickers/yellowChicken1.png', x: -5, y: 630, size: 80 }, { src: 'assets/stickers/yellowChicken1.png', x: stackedCanvas.width - 70, y: 830, size: 75 }, { src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 120, y: stackedCanvas.height - 190, size: 65 }, { src: 'assets/stickers/yellowChicken4.png', x: 1, y: stackedCanvas.height - 230, size: 95 },], 'brownbear': [{ src: 'assets/stickers/brownyBear1.png', x: 1, y: 5, size: 120 }, { src: 'assets/stickers/brownyBear2.png', x: stackedCanvas.width - 100, y: 25, size: 80 }, { src: 'assets/stickers/brownyBear3.png', x: -8, y: 315, size: 82 }, { src: 'assets/stickers/brownyBear4.png', x: stackedCanvas.width - 100, y: 490, size: 91 }, { src: 'assets/stickers/brownyBear5.png', x: -2, y: 590, size: 91 }, { src: 'assets/stickers/brownyBear2.png', x: stackedCanvas.width - 70, y: 790, size: 87 }, { src: 'assets/stickers/brownyBear3.png', x: -1, y: stackedCanvas.height - 320, size: 82 }, { src: 'assets/stickers/brownyBear6.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 200, size: 92 }], 'lotsheart': [{ src: 'assets/stickers/lotsHeart1.png', x: 1, y: 15, size: 78 }, { src: 'assets/stickers/lotsHeart5.png', x: -18, y: 450, size: 78 }, { src: 'assets/stickers/lotsHeart7.png', x: -8, y: 860, size: 60 }, { src: 'assets/stickers/lotsHeart6.png', x: 25, y: stackedCanvas.height - 170, size: 70 }, { src: 'assets/stickers/lotsHeart2.png', x: stackedCanvas.width - 250, y: 20, size: 60 }, { src: 'assets/stickers/lotsHeart4.png', x: stackedCanvas.width - 70, y: 200, size: 57 }, { src: 'assets/stickers/lotsHeart6.png', x: stackedCanvas.width - 80, y: 650, size: 60 }, { src: 'assets/stickers/lotsHeart3.png', x: stackedCanvas.width - 50, y: 990, size: 50 }, { src: 'assets/stickers/lotsHeart8.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 140, size: 70 },], 'tabbycat': [{ src: 'assets/stickers/tabbyCat1.png', x: 1, y: 2, size: 95 }, { src: 'assets/stickers/tabbyCat2.png', x: 220, y: -2, size: 66 }, { src: 'assets/stickers/tabbyCat3.png', x: stackedCanvas.width - 160, y: 25, size: 60 }, { src: 'assets/stickers/tabbyCat4.png', x: stackedCanvas.width - 90, y: 145, size: 95 }, { src: 'assets/stickers/tabbyCat9.png', x: -20, y: 245, size: 100 }, { src: 'assets/stickers/tabbyCat2.png', x: 140, y: 360, size: 55 }, { src: 'assets/stickers/tabbyCat2.png', x: stackedCanvas.width - 220, y: 970, size: 65 }, { src: 'assets/stickers/tabbyCat5.png', x: stackedCanvas.width - 90, y: 490, size: 95 }, { src: 'assets/stickers/tabbyCat6.png', x: -5, y: 630, size: 84 }, { src: 'assets/stickers/tabbyCat9.png', x: stackedCanvas.width - 70, y: 830, size: 75 }, { src: 'assets/stickers/tabbyCat3.png', x: -5, y: 830, size: 75 }, { src: 'assets/stickers/tabbyCat3.png', x: stackedCanvas.width - 120, y: stackedCanvas.height - 190, size: 65 }, { src: 'assets/stickers/tabbyCat7.png', x: 1, y: stackedCanvas.height - 230, size: 120 }], 'ballerinacappuccino': [{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino1.png', x: 1, y: 2, size: 125 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino3.png', x: 402, y: -2, size: 90 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino4.png', x: stackedCanvas.width - 130, y: 25, size: 150 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino2.png', x: stackedCanvas.width - 120, y: 345, size: 129 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino5.png', x: -10, y: 695, size: 150 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino7.png', x: -10, y: 295, size: 100 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino6.png', x: stackedCanvas.width - 115, y: 750, size: 110 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino3.png', x: -5, y: stackedCanvas.height - 200, size: 145 }, { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino4.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 125 }], 'doggywhite': [{ src: 'assets/stickers/doggyWhite/doggyWhite3.png', x: 1, y: 230, size: 115 }, { src: 'assets/stickers/doggyWhite/doggyWhite1.png', x: stackedCanvas.width - 130, y: 25, size: 125 }, { src: 'assets/stickers/doggyWhite/doggyWhite4.png', x: stackedCanvas.width - 110, y: 545, size: 115 }, { src: 'assets/stickers/doggyWhite/doggyWhite2.png', x: -10, y: 695, size: 125 }, { src: 'assets/stickers/doggyWhite/doggyWhite3.png', x: -5, y: stackedCanvas.height - 200, size: 115 }, { src: 'assets/stickers/doggyWhite/doggyWhite1.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 125 }], 'mygirls': [{ src: 'assets/stickers/myGirls/myGirls4.png', x: -30, y: 15, size: 200 }, { src: 'assets/stickers/myGirls/myGirls7.png', x: 342, y: -25, size: 215 }, { src: 'assets/stickers/myGirls/myGirls8.png', x: stackedCanvas.width - 110, y: 25, size: 105 }, { src: 'assets/stickers/myGirls/myGirls10.png', x: stackedCanvas.width - 150, y: 95, size: 155 }, { src: 'assets/stickers/myGirls/myGirls11.png', x: stackedCanvas.width - 95, y: 185, size: 115 }, { src: 'assets/stickers/myGirls/myGirls6.png', x: stackedCanvas.width - 110, y: 395, size: 135 }, { src: 'assets/stickers/myGirls/myGirls4.png', x: stackedCanvas.width - 110, y: 545, size: 135 }, { src: 'assets/stickers/myGirls/myGirls1.png', x: stackedCanvas.width - 110, y: 695, size: 135 }, { src: 'assets/stickers/myGirls/myGirls2.png', x: -20, y: 305, size: 125 }, { src: 'assets/stickers/myGirls/myGirls4.png', x: -20, y: 450, size: 125 }, { src: 'assets/stickers/myGirls/myGirls6.png', x: -20, y: 580, size: 125 }, { src: 'assets/stickers/myGirls/myGirls10.png', x: -15, y: stackedCanvas.height - 370, size: 115 }, { src: 'assets/stickers/myGirls/myGirls11.png', x: 15, y: stackedCanvas.height - 300, size: 155 }, { src: 'assets/stickers/myGirls/myGirls9.png', x: -5, y: stackedCanvas.height - 200, size: 115 }, { src: 'assets/stickers/myGirls/myGirls5.png', x: stackedCanvas.width - 190, y: stackedCanvas.height - 290, size: 222 }], 'sakurablossom': [{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom1.png', x: 1, y: 5, size: 120 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 100, y: 25, size: 80 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 120, y: 95, size: 40 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -8, y: 315, size: 82 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom3.png', x: 35, y: 390, size: 50 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 100, y: 490, size: 91 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 140, y: 430, size: 35 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -2, y: 590, size: 91 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom3.png', x: -15, y: 700, size: 45 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 50, y: 900, size: 45 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom1.png', x: stackedCanvas.width - 70, y: 790, size: 87 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -1, y: stackedCanvas.height - 320, size: 82 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 30, y: stackedCanvas.height - 100, size: 48 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 90, y: stackedCanvas.height - 40, size: 44 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 200, size: 92 }, { src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 40, y: stackedCanvas.height - 290, size: 40 }]};
           const stickersToDraw = stickerLayouts[stickerType];
           if (!stickersToDraw) return resolve();
           const imagePromises = stickersToDraw.map(sticker => new Promise(res => {
               const img = new Image();
               img.src = sticker.src;
               img.onload = () => res({img, sticker});
               img.onerror = () => { console.error(`Gagal memuat stiker: ${sticker.src}`); res(null); };
           }));
           Promise.all(imagePromises).then(results => {
               results.forEach(result => {
                   if (result) {
                       const {img, sticker} = result;
                       ctx.drawImage(img, sticker.x, sticker.y, sticker.size, sticker.size);
                   }
               });
               resolve();
           });
       });
    }
    
    function clipAndDrawImage(ctx, img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, shapeType) { ctx.save(); ctx.beginPath(); if (shapeType === 'circle') { ctx.arc(dx + dWidth / 2, dy + dHeight / 2, Math.min(dWidth, dHeight) / 2, 0, Math.PI * 2); } else if (shapeType === 'rounded') { const r = 30; ctx.moveTo(dx + r, dy); ctx.lineTo(dx + dWidth - r, dy); ctx.quadraticCurveTo(dx + dWidth, dy, dx + dWidth, dy + r); ctx.lineTo(dx + dWidth, dy + dHeight - r); ctx.quadraticCurveTo(dx + dWidth, dy + dHeight, dx + dWidth - r, dy + dHeight); ctx.lineTo(dx + r, dy + dHeight); ctx.quadraticCurveTo(dx, dy + dHeight, dx, dy + dHeight - r); ctx.lineTo(dx, dy + r); ctx.quadraticCurveTo(dx, dy, dx + r, dy); } else if (shapeType === 'heart') { ctx.moveTo(dx + dWidth / 2, dy + dHeight); ctx.bezierCurveTo(dx + dWidth * 1.25, dy + dHeight * 0.7, dx + dWidth * 0.9, dy - dHeight * 0.1, dx + dWidth / 2, dy + dHeight * 0.25); ctx.bezierCurveTo(dx + dWidth * 0.1, dy - dHeight * 0.1, dx - dWidth * 0.25, dy + dHeight * 0.7, dx + dWidth / 2, dy + dHeight); ctx.closePath(); } else { ctx.rect(dx, dy, dWidth, dHeight); } ctx.clip(); ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight); ctx.restore(); }

    // [FIX iOS] Fungsi unduh yang sudah diperbaiki
    function downloadFinalImage() {
        console.log("Mempersiapkan gambar untuk diunduh...");
        if (!currentCanvas) {
            console.error("Canvas belum siap untuk diunduh.");
            alert("Terjadi kesalahan, gambar belum siap. Coba ubah salah satu opsi lalu unduh lagi.");
            return;
        }

        const imageData = currentCanvas.toDataURL('image/png');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS) {
            console.log("Perangkat iOS terdeteksi, membuka gambar di tab baru.");
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write('<html><head><title>Simpan Gambar Anda</title></head><body style="margin:0; background:#eee; text-align:center;"><p style="font-family:-apple-system, BlinkMacSystemFont, sans-serif; padding:1em;">Tekan dan tahan pada gambar, lalu pilih "Add to Photos" atau "Save Image".</p><img src="' + imageData + '" style="max-width:100%; box-shadow:0 0 10px rgba(0,0,0,0.2);"></body></html>');
                newWindow.document.close();
            } else {
                alert("Gagal membuka tab baru. Mohon izinkan pop-up untuk situs ini dan coba lagi.");
            }
        } else {
            console.log("Perangkat non-iOS, memulai unduhan langsung.");
            const link = document.createElement('a');
            link.href = imageData;
            link.download = 'pictlord_6_photos.png'; // Nama file untuk 6 foto
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    // =========================================================================
    // 5. EVENT LISTENERS UTAMA (EVENT DELEGATION)
    // =========================================================================
    if (controlsPanel) {
        controlsPanel.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
    
            let needsRedraw = true;
            const buttonId = button.id;
    
            if (button.classList.contains('buttonFrames') || button.classList.contains('buttonBgFrames')) {
                if (buttonId === 'colorPickerBtn') { needsRedraw = false; return; }
                const style = window.getComputedStyle(button);
                const bgImage = style.backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    const imageUrl = bgImage.slice(5, -2).replace(/"/g, "");
                    customizationOptions.frame.type = 'image';
                    customizationOptions.frame.value = imageUrl;
                    const img = new Image();
                    img.src = imageUrl;
                    img.onload = () => { customizationOptions.frame.image = img; redrawCanvas(); };
                    needsRedraw = false;
                } else {
                    customizationOptions.frame.type = 'color';
                    customizationOptions.frame.value = style.backgroundColor;
                }
            } else if (button.classList.contains('buttonShapes')) {
                const shape = buttonId.replace('FrameShape', '').toLowerCase();
                customizationOptions.photoShape = (shape === 'soft') ? 'rounded' : (shape === 'none') ? 'default' : shape;
            } else if (button.classList.contains('buttonStickers')) {
                const stickerName = buttonId.replace('Sticker', '').toLowerCase();
                const finalStickerName = (stickerName === 'classicb') ? 'classicbsticker' : stickerName;
                customizationOptions.sticker = (finalStickerName === 'none') ? null : ((customizationOptions.sticker === finalStickerName) ? null : finalStickerName);
            } else if (button.classList.contains('logoCustomBtn')) {
                const lang = buttonId.replace('Logo', '').toUpperCase();
                customizationOptions.logo.lang = lang;
                const textMap = { 'ENG': 'pictlord', 'KOR': 'ㅔㅑㅊ시ㅐㄱㅇ', 'CN': '照相亭' };
                customizationOptions.logo.text = textMap[lang] || '';
            } else if (buttonId === 'customBack') {
                window.location.href = 'canvas6.html'; // Arahkan ke halaman 6 foto
                needsRedraw = false;
            } else if (buttonId === 'downloadCopyBtn') {
                downloadFinalImage();
                needsRedraw = false;
            }
            else {
                needsRedraw = false;
            }
    
            if (needsRedraw) {
                redrawCanvas();
            }
        });
    }

    document.getElementById('logoColorPicker').addEventListener('input', (e) => { customizationOptions.logo.color = e.target.value; redrawCanvas(); });
    document.getElementById('dateCheckbox').addEventListener('change', (e) => { customizationOptions.date.show = e.target.checked; redrawCanvas(); });
    document.getElementById('dateTimeCheckbox').addEventListener('change', (e) => { customizationOptions.date.showTime = e.target.checked; redrawCanvas(); });

    new Picker({
        parent: document.getElementById('colorPickerBtn'),
        popup: 'bottom',
        color: '#FFFFFF',
        onChange: (color) => {
            customizationOptions.frame.type = 'color';
            customizationOptions.frame.value = color.hex;
            document.getElementById('colorPickerBtn').style.backgroundColor = color.hex;
            redrawCanvas();
        }
    });
    
    // =========================================================================
    // 6. INISIALISASI AWAL
    // =========================================================================
    redrawCanvas();
});