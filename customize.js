document.addEventListener('DOMContentLoaded', function() {
    
    // --- Element References ---
    const photoCustomPreview = document.getElementById('photoPreview')
    const pinkBtn = document.getElementById('pinkBtnFrame')
    const blueBtn = document.getElementById('blueBtnFrame')
    const yellowBtn = document.getElementById('yellowBtnFrame')
    const brownBtn = document.getElementById('brownBtnFrame')
    const redBtn = document.getElementById('redBtnFrame')
    const matchaBtn = document.getElementById('matchaBtnFrame')
    const purpleBtn = document.getElementById('purpleBtnFrame')
    const whiteBtn = document.getElementById('whiteBtnFrame')
    const blackBtn = document.getElementById('blackBtnFrame')
    const pinkGlitter = document.getElementById('pinkGlitter');
    const pinkPlaid = document.getElementById('pinkPlaid');
    const bluePlaid = document.getElementById('bluePlaid');
    const brownLeopard = document.getElementById('brownLeopard');
    const cowPrint = document.getElementById('cowPrint');
    const redLeather = document.getElementById('redLeather');
    const pinkGumamela = document.getElementById('pinkGumamela');
    const whiteKnitted = document.getElementById('whiteKnitted');
    const blackCq = document.getElementById('black-cq');
    const whiteCq = document.getElementById('white-cq');
    const pinkLeather = document.getElementById('pinkLeather');
    const ribbonDenim = document.getElementById('ribbonDenim');
    const blackPinkRibbon = document.getElementById('blackPinkRibbon');
    const blueYellowSquares = document.getElementById('blueYellowSquares');
    const blueWhiteSquares = document.getElementById('blueWhiteSquares');
    const fourLockers = document.getElementById('fourLockers');
    const crumpledPaper = document.getElementById('crumpledPaper');
    const blueBackdrop = document.getElementById('blueBackdrop');
    const greenHills = document.getElementById('greenHills');
    const sandShells = document.getElementById('sandShells');
    const waterBeach = document.getElementById('waterBeach');
    const cocoTrees = document.getElementById('cocoTrees');
    const pinkLiliesFrame = document.getElementById('pinkLiliesFrame');
    const roseCardFrame = document.getElementById('roseCardFrame');
    const princessVintageFrame = document.getElementById('princessVintageFrame');
    const gridPaperFrame = document.getElementById('gridPaperFrame');
    const stardustFrame = document.getElementById('stardustFrame');
    const roughTextureFrame = document.getElementById('roughTextureFrame');
    const ribbonSweaterFrame = document.getElementById('ribbonSweaterFrame');
    const vsPinkFrame = document.getElementById('vsPinkFrame');
    const vsYellowFrame = document.getElementById('vsYellowFrame');
    const redRosesPaintFrame = document.getElementById('redRosesPaintFrame');
    const grayTrashFrame = document.getElementById('grayTrashFrame');
    const blackTrashFrame = document.getElementById('blackTrashFrame');
    const whiteTrashFrame = document.getElementById('whiteTrashFrame');
    const brownKnittedFrame = document.getElementById('brownKnittedFrame');
    const hotPinkKnittedFrame = document.getElementById('hotPinkKnittedFrame');
    const redKnittedFrame = document.getElementById('redKnittedFrame');
    const pinkKnittedFrame = document.getElementById('pinkKnittedFrame');
    const redStripesFrame = document.getElementById('redStripesFrame');
    const greenStripesFrame = document.getElementById('greenStripesFrame');
    const blueStripesFrame = document.getElementById('blueStripesFrame');
    const partyDrapeFrame = document.getElementById('partyDrapeFrame');
    const partyDotsFrame = document.getElementById('partyDotsFrame');
    const blingDenimFrame = document.getElementById('blingDenimFrame');
    const customBack = document.getElementById('customBack');
    const downloadCopyBtn = document.getElementById('downloadCopyBtn');
    const noneSticker = document.getElementById('noneSticker')
    const kissSticker = document.getElementById('kissSticker')
    const ribbonSticker = document.getElementById('ribbonSticker')
    const sweetSticker = document.getElementById('sweetSticker')
    const sparkleSticker = document.getElementById('sparkleSticker')
    const pearlSticker = document.getElementById('pearlSticker')
    const softSticker = document.getElementById('softSticker');
    const bunnySticker = document.getElementById('bunnySticker');
    const classicSticker = document.getElementById('classicSticker');
    const classicBSticker = document.getElementById('classicBSticker');
    const luckySticker = document.getElementById('luckySticker');
    const confettiSticker = document.getElementById('confettiSticker');
    const ribbonCoquetteSticker = document.getElementById('ribbonCoquetteSticker');
    const blueRibbonCoquetteSticker = document.getElementById('blueRibbonCoquetteSticker');
    const blackStarSticker = document.getElementById('blackStarSticker');
    const yellowChickenSticker = document.getElementById('yellowChickenSticker');
    const brownBearSticker = document.getElementById('brownBearSticker');
    const lotsHeartSticker = document.getElementById('lotsHeartSticker');
    const tabbyCatSticker = document.getElementById('tabbyCatSticker');
    const ballerinaCappuccinoSticker = document.getElementById('ballerinaCappuccinoSticker');
    const doggyWhiteSticker = document.getElementById('doggyWhiteSticker');
    const sakuraBlossomSticker = document.getElementById('sakuraBlossomSticker');
    const myGirlsSticker = document.getElementById('myGirlsSticker');
    const engLogo = document.getElementById('engLogo');
    const korLogo = document.getElementById('korLogo');
    const cnLogo = document.getElementById('cnLogo');
    const normalFrameBtn = document.getElementById('noneFrameShape');
    const roundEdgeFrameBtn = document.getElementById('softFrameShape');
    const circleFrameBtn = document.getElementById('circleFrameShape');
    const heartFrameBtn = document.getElementById('heartFrameShape');
    const dateCheckbox = document.getElementById('dateCheckbox');
    const dateTimeCheckbox = document.getElementById('dateTimeCheckbox');
    const colorPickerBtn = document.getElementById("colorPickerBtn");
    const logoColorPicker = document.getElementById('logoColorPicker'); // NEW: Get the color picker input

    // --- State Variables ---
    let selectedShape = 'default';
    let selectedSticker = null;
    let selectedText = 'pictlord';
    let backgroundType = 'color';
    let backgroundColor = '#FFFFFF';
    let backgroundImage = null;
    let textColor = '#E28585'; // NEW: State variable for logo/date color, default to pink

    if (customBack) {
        customBack.addEventListener('click', () => {
            const imageArrayLength = JSON.parse(sessionStorage.getItem('photoArray')).length;
            if (imageArrayLength === 3) {
                window.location.href = 'canvas.html'
            } else if (imageArrayLength === 4) {
                window.location.href = 'canvas4.html'
            } else {
                window.location.href = 'canvas2.html'
            }
        })
    }
    
    // --- Event Listeners for Customization ---

    if (dateCheckbox) {
        dateCheckbox.addEventListener('change', redrawCanvas);
    }

    if (dateTimeCheckbox) {
        dateTimeCheckbox.addEventListener('change', redrawCanvas);
    }
    
    // NEW: Add event listener for the logo/text color picker
    if (logoColorPicker) {
        logoColorPicker.addEventListener('input', (event) => {
            textColor = event.target.value; // Update the text color state
            redrawCanvas(); // Redraw the canvas to show the change
        });
    }

    // Retrieve stored images array from sessionStorage
    const storedImages = JSON.parse(sessionStorage.getItem('photoArray'));
    if (!storedImages || storedImages.length === 0) {
        console.error("No valid images found in sessionStorage. Cannot draw canvas.");
        // Optionally, display a message to the user
        if(photoCustomPreview) {
            photoCustomPreview.innerHTML = '<p>Error: Foto tidak ditemukan. Silakan kembali ke halaman sebelumnya.</p>';
        }
    } else {
        console.log("Loaded images:", storedImages);
    }

    function setBackground(option) {
        console.log('Setting background:', option);
        if (option.type === 'color') {
            backgroundType = 'color';
            backgroundColor = option.value;
            backgroundImage = null; // Ensure image is cleared
            redrawCanvas();
        } else if (option.type === 'image') {
            backgroundType = 'image';
            backgroundImage = new Image();
            backgroundImage.src = option.src;
            backgroundImage.onload = redrawCanvas;
            backgroundImage.onerror = () => console.error(`Failed to load background image: ${option.src}`);
        }
    }
    
    const picker = new Picker({
        parent: colorPickerBtn,
        popup: 'bottom',
        color: '#FFFFFF',
        onChange: (color) => {
            setBackground({ type: 'color', value: color.hex });
        },
        onDone: (color) => {
            colorPickerBtn.style.backgroundColor = color.hex;
        }
    });

    colorPickerBtn.addEventListener("click", () => picker.show());

    function setSticker(type) {
        if (selectedSticker === type) {
            selectedSticker = null; 
            console.log(`Removed sticker: ${type}`);
        } else {
            selectedSticker = type;
            console.log(`Selected sticker: ${type}`);
        }
        redrawCanvas();
    }
    
    // Simplified Sticker Event Listeners
    const stickerButtons = {
        kissSticker: 'kiss', sweetSticker: 'sweet', ribbonSticker: 'ribbon', sparkleSticker: 'sparkle',
        pearlSticker: 'pearl', classicSticker: 'classic', classicBSticker: 'classicB', softSticker: 'soft',
        bunnySticker: 'bunny', luckySticker: 'lucky', confettiSticker: 'confetti', ribbonCoquetteSticker: 'ribboncoquette',
        blueRibbonCoquetteSticker: 'blueribboncoquette', blackStarSticker: 'blackstar', yellowChickenSticker: 'yellowchicken',
        brownBearSticker: 'brownbear', lotsHeartSticker: 'lotsheart', tabbyCatSticker: 'tabbycat',
        ballerinaCappuccinoSticker: 'ballerinacp', doggyWhiteSticker: 'doggywhite', sakuraBlossomSticker: 'sakurablossom',
        myGirlsSticker: 'mygirls'
    };

    Object.keys(stickerButtons).forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => setSticker(stickerButtons[id]));
        }
    });

    if (noneSticker) {
        noneSticker.addEventListener('click', () => {
            selectedSticker = null;
            redrawCanvas();
        });
    }

    // Background Color Buttons
    if (pinkBtn) pinkBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#FFC2D1' }));
    if (blueBtn) blueBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#CAF0F8' }));
    if (yellowBtn) yellowBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#FFF8A5' }));
    if (matchaBtn) matchaBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#90a955' }));
    if (purpleBtn) purpleBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#c19ee0' }));
    if (brownBtn) brownBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#DDBEA9' }));
    if (redBtn) redBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#780000' }));
    if (whiteBtn) whiteBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#FFFFFF' }));
    if (blackBtn) blackBtn.addEventListener('click', () => setBackground({ type: 'color', value: '#000000' }));
    
    // Background Image Buttons
    const bgImageButtons = {
        pinkPlaid: 'pink-plaid.jpg', pinkGlitter: 'pink-glitter.jpg', bluePlaid: 'blue-plaid.jpg', brownLeopard: 'brown-leopard.jpg',
        cowPrint: 'cow-print.jpg', redLeather: 'red-leather.jpg', pinkGumamela: 'pink-gumamela.jpg', whiteKnitted: 'white-knitted-cloth.jpg',
        'black-cq': 'black-couqutte.jpg', 'white-cq': 'white-couquette.jpg', pinkLeather: 'pink-diamond-leather.jpg',
        ribbonDenim: 'ribbon-denim.jpg', blackPinkRibbon: 'black-pink-ribbon.jpg', blueYellowSquares: 'blue-yellow-squares.jpg',
        blueWhiteSquares: 'blue-white-squares.jpg', fourLockers: '4-lockers.jpg', crumpledPaper: 'crumpled-paper.jpg',
        blueBackdrop: 'blue-backdrop.jpg', greenHills: 'green-hills.jpg', sandShells: 'sand-shells.jpg', waterBeach: 'water.jpg',
        cocoTrees: 'coco-trees.jpg', pinkLiliesFrame: 'pink-lilies.jpg', roseCardFrame: 'rose-card.jpg',
        princessVintageFrame: 'princess-vintage.jpg', gridPaperFrame: 'grid-paper.jpg', stardustFrame: 'stardust.jpg',
        roughTextureFrame: 'rough-texture.jpg', ribbonSweaterFrame: 'ribbon-sweater.jpg', vsPinkFrame: 'vs-pink.jpg',
        vsYellowFrame: 'vs-yellow.jpg', redRosesPaintFrame: 'red-roses-paint.jpg', grayTrashFrame: 'gray-trash.jpg',
        blackTrashFrame: 'black-trash.jpg', whiteTrashFrame: 'white-trash.jpg', brownKnittedFrame: 'brown-knitted.jpg',
        hotPinkKnittedFrame: 'hot-pink-knitted.jpg', redKnittedFrame: 'red-knitted.jpg', pinkKnittedFrame: 'pink-knitted.jpg',
        redStripesFrame: 'red-stripes.jpg', greenStripesFrame: 'green-stripes.jpg', blueStripesFrame: 'blue-stripes.jpg',
        partyDrapeFrame: 'party-drape.jpg', partyDotsFrame: 'party-dots.jpg', blingDenimFrame: 'bling-denim.jpg'
    };

    Object.keys(bgImageButtons).forEach(id => {
        const button = document.getElementById(id);
        if(button) {
            button.addEventListener('click', () => setBackground({ type: 'image', src: `assets/frame-backgrounds/${bgImageButtons[id]}` }));
        }
    });

    // Logo Buttons
    if (engLogo) engLogo.addEventListener('click', () => updateText('pictlord'));
    if (korLogo) korLogo.addEventListener('click', () => updateText('ㅔㅑㅊ시ㅐㄱㅇ'));
    if (cnLogo) cnLogo.addEventListener('click', () => updateText('照相亭'));

    function updateText(text) {
        selectedText = text;
        redrawCanvas();
    }
    
    // Frame Shape Buttons
    if (heartFrameBtn) heartFrameBtn.addEventListener('click', () => { selectedShape = 'heart'; redrawCanvas(); });
    if (circleFrameBtn) circleFrameBtn.addEventListener('click', () => { selectedShape = 'circle'; redrawCanvas(); });
    if (roundEdgeFrameBtn) roundEdgeFrameBtn.addEventListener('click', () => { selectedShape = 'rounded'; redrawCanvas(); });
    if (normalFrameBtn) normalFrameBtn.addEventListener('click', () => { selectedShape = 'default'; redrawCanvas(); });


    function drawSticker(ctx, stackedCanvas) {
        // ... This function is very long, so it's omitted for brevity.
        // The original code for drawSticker is correct and doesn't need changes.
        // I will just paste it back in.
        return new Promise((resolve) => {
            if (!selectedSticker) {
                resolve(); // No sticker selected, resolve immediately
                return;
            }
    
            const stickerLayouts = {
                'kiss': [{ src: 'assets/stickers/kiss1.png', x: 30, y: 300, size: 170 }],
                'sweet': [
                    { src: 'assets/stickers/sweet1.png', x: 17, y: 80, size: 90 },
                    { src: 'assets/stickers/sweet2.png', x: stackedCanvas.width - 100, y: 390, size: 90 },
                    { src: 'assets/stickers/sweet3.png', x: 30, y: stackedCanvas.height - 200, size: 90 }
                ],
                'ribbon': [
                    { src: 'assets/stickers/ribbon1.png', x: 17, y: 80, size: 90 },
                    { src: 'assets/stickers/ribbon3.png', x: stackedCanvas.width - 100, y: 550, size: 95 },
                    { src: 'assets/stickers/ribbon2.png', x: 15, y: stackedCanvas.height - 380, size: 90 }
                ],
                'sparkle': [    
                    { src: 'assets/stickers/sparkle1.png', x: stackedCanvas.width - 200, y: 150, size: 250 },
                    { src: 'assets/stickers/sparkle2.png', x: 2, y: stackedCanvas.height - 850, size: 200 },
                    { src: 'assets/stickers/sparkle2.png', x: stackedCanvas.width - 150, y: stackedCanvas.height - 180, size: 110 }
                ],
                'pearl': [    
                    { src: 'assets/stickers/pearl1.png', x: 35, y: 30, size: 30 },
                    { src: 'assets/stickers/pearl1.png', x: 25, y: 50, size: 25 },
                    { src: 'assets/stickers/pearl1.png', x: 65, y: 40, size: 20 },
                    { src: 'assets/stickers/pearl1.png', x: 95, y: 40, size: 15 },
                    { src: 'assets/stickers/pearl1.png', x: 75, y: 26, size: 15 },
                    { src: 'assets/stickers/pearl1.png', x: 25, y: 65, size: 55 },
                    { src: 'assets/stickers/pearl1.png', x: 25, y: 120, size: 15 },
                    { src: 'assets/stickers/pearl1.png', x: 525, y: stackedCanvas.height - 620, size: 15 },
                    { src: 'assets/stickers/pearl1.png', x: 500, y: stackedCanvas.height - 690, size: 15 },
                    { src: 'assets/stickers/pearl1.png', x: 540, y: stackedCanvas.height - 650, size: 25 },
                    { src: 'assets/stickers/pearl1.png', x: 530, y: stackedCanvas.height - 700, size: 45 },
                    { src: 'assets/stickers/pearl1.png', x: 510, y: stackedCanvas.height - 670, size: 30 },
                    { src: 'assets/stickers/pearl1.png', x: 510, y: stackedCanvas.height - 710, size: 30 },
                    { src: 'assets/stickers/pearl2.png', x: stackedCanvas.width - 570, y: stackedCanvas.height - 180, size: 150 },
                    { src: 'assets/stickers/pearl2.png', x: stackedCanvas.width - 150, y: 270, size: 120 }
                ],
                'classic': [
                    { src: 'assets/stickers/classic1.png', x: 1, y: 50, size: 32},
                    { src: 'assets/stickers/classic1.png', x: 1, y: 450, size: 32},
                    { src: 'assets/stickers/classic1.png', x: 1, y: 950, size: 32},
                    { src: 'assets/stickers/classic2.png', x: 4, y: 80, size: 20},
                    { src: 'assets/stickers/classic2.png', x: 4, y: 980, size: 20},
                    { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 70, size: 120},
                    { src: 'assets/stickers/classic3.png', x: stackedCanvas.width - 75, y: 570, size: 120}
                ],
                'classicB': [
                    { src: 'assets/stickers/classic4.png', x: 1, y: 50, size: 32},
                    { src: 'assets/stickers/classic4.png', x: 1, y: 450, size: 32},
                    { src: 'assets/stickers/classic4.png', x: 1, y: 950, size: 32},
                    { src: 'assets/stickers/classic5.png', x: 4, y: 80, size: 20},
                    { src: 'assets/stickers/classic5.png', x: 4, y: 980, size: 20},
                    { src: 'assets/stickers/classic6.png', x: stackedCanvas.width - 75, y: 70, size: 120},
                    { src: 'assets/stickers/classic6.png', x: stackedCanvas.width - 75, y: 570, size: 120}
                ],
                'soft': [
                    { src: 'assets/stickers/soft1.png', x: 5, y: 20, size: 145},
                    { src: 'assets/stickers/soft2.png', x: stackedCanvas.width - 120, y: 30, size: 100},
                    { src: 'assets/stickers/soft3.png', x: 10, y: 500, size: 120},
                    { src: 'assets/stickers/soft4.png', x: 15, y: stackedCanvas.height - 200, size: 120},
                    { src: 'assets/stickers/soft5.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 120},
                    { src: 'assets/stickers/soft6.png', x: stackedCanvas.width - 130, y: 430, size: 120}
                ],
                'bunny': [
                    { src: 'assets/stickers/bunny1.png', x: stackedCanvas.width - 170, y: 10, size: 150},
                    { src: 'assets/stickers/bunny2.png', x: 15, y: 300, size: 95},
                    { src: 'assets/stickers/bunny2.png', x: stackedCanvas.width - 100, y: 700, size: 75},
                    { src: 'assets/stickers/bunny3.png', x: 15, y: stackedCanvas.height - 200, size: 135}
                ],
                'lucky' : [
                    { src: 'assets/stickers/lucky2.png', x: stackedCanvas.width - 170, y: 20, size: 150},
                    { src: 'assets/stickers/lucky1.png', x: 15, y: stackedCanvas.height - 215, size: 170},
                    { src: 'assets/stickers/lucky3.png', x: stackedCanvas.width - 120, y: 420, size: 90},
                    { src: 'assets/stickers/lucky4.png', x: stackedCanvas.width - 120, y: 495, size: 90},
                    { src: 'assets/stickers/lucky5.png', x: stackedCanvas.width - 128, y: 560, size: 110},
                    { src: 'assets/stickers/lucky6.png', x: stackedCanvas.width - 120, y: 650, size: 100},
                    { src: 'assets/stickers/lucky7.png', x: stackedCanvas.width - 120, y: 730, size: 95}
                ],
                'confetti' : [
                    { src: 'assets/stickers/confetti/star5.png', x: 100, y: 20, size: 40},
                    { src: 'assets/stickers/confetti/circle2.png', x: stackedCanvas.width - 120, y: 45, size: 50},
                    { src: 'assets/stickers/confetti/circle1.png', x: 30, y: 150, size: 35},
                    { src: 'assets/stickers/confetti/circle1.png', x: stackedCanvas.width - 70, y: 180, size: 32},
                    { src: 'assets/stickers/confetti/star2.png', x: stackedCanvas.width - 100, y: 320, size: 40},
                    { src: 'assets/stickers/confetti/star1.png', x: 100, y: 450, size: 32},
                    { src: 'assets/stickers/confetti/circle2.png', x: stackedCanvas.width - 30, y: 530, size: 27},
                    { src: 'assets/stickers/confetti/star4.png', x: stackedCanvas.width - 70, y: 580, size: 27},
                    { src: 'assets/stickers/confetti/star3.png', x: 22, y: 690, size: 47},
                    { src: 'assets/stickers/confetti/circle1.png', x: stackedCanvas.width - 200, y: 800, size: 32},
                    { src: 'assets/stickers/confetti/star2.png', x: 100, y: 850, size: 49},
                    { src: 'assets/stickers/confetti/circle2.png', x: 22, y: 990, size: 30},
                    { src: 'assets/stickers/confetti/star1.png', x: stackedCanvas.width - 100, y: stackedCanvas.height - 200, size: 35}
                ],
                'ribboncoquette' : [
                    { src: 'assets/stickers/ribboncq2.png', x: 1, y: 0, size: 80},{ src: 'assets/stickers/ribboncq3.png', x: 295, y: 15, size: 95},{ src: 'assets/stickers/ribboncq1.png', x: stackedCanvas.width - 39, y: 25, size: 82},{ src: 'assets/stickers/ribboncq1.png', x: -22, y: 290, size: 75},{ src: 'assets/stickers/ribboncq2.png', x: stackedCanvas.width - 100, y: 240, size: 55},{ src: 'assets/stickers/ribboncq3.png', x: 5, y: 640, size: 52},{ src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 78, y: 520, size: 69},{ src: 'assets/stickers/ribboncq1.png', x: 140, y: 570, size: 82},{ src: 'assets/stickers/ribboncq2.png', x: stackedCanvas.width - 42, y: 760, size: 55},{ src: 'assets/stickers/ribboncq1.png', x: -15, y: 890, size: 72},{ src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 70, y: 1020, size: 55},{ src: 'assets/stickers/ribboncq2.png', x: -8, y: stackedCanvas.height - 200, size: 80},{ src: 'assets/stickers/ribboncq3.png', x: stackedCanvas.width - 70, y: stackedCanvas.height - 100, size: 55}
                ],
                'blueribboncoquette' : [
                    { src: 'assets/stickers/blueRibbon.png', x: 1, y: 0, size: 80},{ src: 'assets/stickers/blueRibbon.png', x: 295, y: 15, size: 95},{ src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 39, y: 25, size: 82},{ src: 'assets/stickers/blueRibbon.png', x: -22, y: 290, size: 75},{ src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 100, y: 240, size: 55},{ src: 'assets/stickers/blueRibbon.png', x: 5, y: 640, size: 52},{ src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 78, y: 520, size: 69},{ src: 'assets/stickers/blueRibbon.png', x: 140, y: 570, size: 82},{ src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 42, y: 760, size: 55},{ src: 'assets/stickers/blueRibbon.png', x: -15, y: 890, size: 72},{ src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 70, y: 1020, size: 55},{ src: 'assets/stickers/blueRibbon.png', x: -8, y: stackedCanvas.height - 200, size: 80},{ src: 'assets/stickers/blueRibbon.png', x: stackedCanvas.width - 70, y: stackedCanvas.height - 100, size: 55}
                ],
                'blackstar' : [
                    { src: 'assets/stickers/blackStar1.png', x: 180, y: -90, size: 250},{ src: 'assets/stickers/blackStar2.png', x: stackedCanvas.width - 90, y: -30, size: 110},{ src: 'assets/stickers/blackStar3.png', x: 18, y: 130, size: 98},{ src: 'assets/stickers/blackStar4.png', x: stackedCanvas.width - 120, y: 230, size: 115},{ src: 'assets/stickers/blackStar2.png', x: -17, y: 390, size: 65},{ src: 'assets/stickers/blackStar3.png', x: stackedCanvas.width - 190, y: 590, size: 145},{ src: 'assets/stickers/blackStar2.png', x: 15, y: 750, size: 45},{ src: 'assets/stickers/blackStar2.png', x: stackedCanvas.width - 80, y: 950, size: 55},{ src: 'assets/stickers/blackStar4.png', x: -50, y: stackedCanvas.height - 150, size: 190}
                ],
                'yellowchicken' : [
                    { src: 'assets/stickers/yellowChicken1.png', x: 1, y: 2, size: 90},{ src: 'assets/stickers/yellowChicken2.png', x: 220, y: -2, size: 66},{ src: 'assets/stickers/yellowChicken1.png', x: stackedCanvas.width - 160, y: 25, size: 55},{ src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 90, y: 145, size: 85},{ src: 'assets/stickers/yellowChicken2.png', x: -20, y: 245, size: 95},{ src: 'assets/stickers/yellowChicken2.png', x: 140, y: 360, size: 55},{ src: 'assets/stickers/yellowChicken3.png', x: stackedCanvas.width - 70, y: 490, size: 85},{ src: 'assets/stickers/yellowChicken1.png', x: -5, y: 630, size: 80},{ src: 'assets/stickers/yellowChicken1.png', x: stackedCanvas.width - 70, y: 830, size: 75},{ src: 'assets/stickers/yellowChicken2.png', x: stackedCanvas.width - 120, y: stackedCanvas.height - 190, size: 65},{ src: 'assets/stickers/yellowChicken4.png', x: 1, y: stackedCanvas.height - 230, size: 95}
                ],
                'brownbear' : [
                    { src: 'assets/stickers/brownyBear1.png', x: 1, y: 5, size: 120},{ src: 'assets/stickers/brownyBear2.png', x: stackedCanvas.width - 100, y: 25, size: 80},{ src: 'assets/stickers/brownyBear3.png', x: -8, y: 315, size: 82},{ src: 'assets/stickers/brownyBear4.png', x: stackedCanvas.width - 100, y: 490, size: 91},{ src: 'assets/stickers/brownyBear5.png', x: -2, y: 590, size: 91},{ src: 'assets/stickers/brownyBear2.png', x: stackedCanvas.width - 70, y: 790, size: 87},{ src: 'assets/stickers/brownyBear3.png', x: -1, y: stackedCanvas.height - 320, size: 82},{ src: 'assets/stickers/brownyBear6.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 200, size: 92}
                ],
                'lotsheart' : [
                    { src: 'assets/stickers/lotsHeart1.png', x: 1, y: 15, size: 78},{ src: 'assets/stickers/lotsHeart5.png', x: -18, y: 450, size: 78},{ src: 'assets/stickers/lotsHeart7.png', x: -8, y: 860, size: 60},{ src: 'assets/stickers/lotsHeart6.png', x: 25, y: stackedCanvas.height - 170, size: 70},{ src: 'assets/stickers/lotsHeart2.png', x: stackedCanvas.width - 250, y: 20, size: 60},{ src: 'assets/stickers/lotsHeart4.png', x: stackedCanvas.width - 70, y: 200, size: 57},{ src: 'assets/stickers/lotsHeart6.png', x: stackedCanvas.width - 80, y: 650, size: 60},{ src: 'assets/stickers/lotsHeart3.png', x: stackedCanvas.width - 50, y: 990, size: 50},{ src: 'assets/stickers/lotsHeart8.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 140, size: 70},
                ],
                'tabbycat' : [
                    { src: 'assets/stickers/tabbyCat1.png', x: 1, y: 2, size: 95},{ src: 'assets/stickers/tabbyCat2.png', x: 220, y: -2, size: 66},{ src: 'assets/stickers/tabbyCat3.png', x: stackedCanvas.width - 160, y: 25, size: 60},{ src: 'assets/stickers/tabbyCat4.png', x: stackedCanvas.width - 90, y: 145, size: 95},{ src: 'assets/stickers/tabbyCat9.png', x: -20, y: 245, size: 100},{ src: 'assets/stickers/tabbyCat2.png', x: 140, y: 360, size: 55},{ src: 'assets/stickers/tabbyCat5.png', x: stackedCanvas.width - 90, y: 490, size: 95},{ src: 'assets/stickers/tabbyCat6.png', x: -5, y: 630, size: 84},{ src: 'assets/stickers/tabbyCat9.png', x: stackedCanvas.width - 70, y: 830, size: 75},{ src: 'assets/stickers/tabbyCat3.png', x: -5, y: 830, size: 75},{ src: 'assets/stickers/tabbyCat3.png', x: stackedCanvas.width - 120, y: stackedCanvas.height - 190, size: 65},{ src: 'assets/stickers/tabbyCat7.png', x: 1, y: stackedCanvas.height - 230, size: 120}
                ],
                'ballerinacp' : [
                    { src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino1.png', x: 1, y: 2, size: 125},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino3.png', x: 250, y: -2, size: 90},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino4.png', x: stackedCanvas.width - 130, y: 25, size: 150},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino2.png', x: stackedCanvas.width - 120, y: 345, size: 129},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino5.png', x: -10, y: 595, size: 150},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino7.png', x: -10, y: 295, size: 100},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino6.png', x: stackedCanvas.width - 115, y: 750, size: 110},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino3.png', x: -5, y: stackedCanvas.height - 200, size: 145},{ src: 'assets/stickers/ballerinaCappuccino/balerinaCappuccino4.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 200, size: 95}
                ],
                'doggywhite' : [
                    { src: 'assets/stickers/doggyWhite/doggyWhite3.png', x: 1, y: 230, size: 115},{ src: 'assets/stickers/doggyWhite/doggyWhite1.png', x: stackedCanvas.width - 130, y: 25, size: 125},{ src: 'assets/stickers/doggyWhite/doggyWhite4.png', x: stackedCanvas.width - 110, y: 545, size: 115},{ src: 'assets/stickers/doggyWhite/doggyWhite2.png', x: -10, y: 695, size: 125},{ src: 'assets/stickers/doggyWhite/doggyWhite3.png', x: -5, y: stackedCanvas.height - 200, size: 115},{ src: 'assets/stickers/doggyWhite/doggyWhite1.png', x: stackedCanvas.width - 130, y: stackedCanvas.height - 200, size: 125}
                ],
                'mygirls' : [
                    { src: 'assets/stickers/myGirls/myGirls4.png', x: -30, y: 15, size: 200},{ src: 'assets/stickers/myGirls/myGirls7.png', x: 200, y: -25, size: 215},{ src: 'assets/stickers/myGirls/myGirls8.png', x: stackedCanvas.width - 110, y: 25, size: 105},{ src: 'assets/stickers/myGirls/myGirls10.png', x: stackedCanvas.width - 150, y: 95, size: 155},{ src: 'assets/stickers/myGirls/myGirls11.png', x: stackedCanvas.width - 95, y: 185, size: 115},{ src: 'assets/stickers/myGirls/myGirls6.png', x: stackedCanvas.width - 110, y: 395, size: 135},{ src: 'assets/stickers/myGirls/myGirls4.png', x: stackedCanvas.width - 110, y: 545, size: 135},{ src: 'assets/stickers/myGirls/myGirls1.png', x: stackedCanvas.width - 110, y: 695, size: 135},{ src: 'assets/stickers/myGirls/myGirls2.png', x: -20, y: 305, size: 125},{ src: 'assets/stickers/myGirls/myGirls4.png', x: -20, y: 450, size: 125},{ src: 'assets/stickers/myGirls/myGirls6.png', x: -20, y: 580, size: 125},{ src: 'assets/stickers/myGirls/myGirls10.png', x: -15, y: stackedCanvas.height - 370, size: 115},{ src: 'assets/stickers/myGirls/myGirls11.png', x: 15, y: stackedCanvas.height - 300, size: 155},{ src: 'assets/stickers/myGirls/myGirls9.png', x: -5, y: stackedCanvas.height - 200, size: 115},{ src: 'assets/stickers/myGirls/myGirls5.png', x: stackedCanvas.width - 190, y: stackedCanvas.height - 290, size: 222}
                ],
                'sakurablossom' : [
                    { src: 'assets/stickers/sakuraBlossom/sakuraBlossom1.png', x: 1, y: 5, size: 120},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 100, y: 25, size: 80},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 120, y: 95, size: 40},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -8, y: 315, size: 82},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom3.png', x: 35, y: 390, size: 50},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 100, y: 490, size: 91},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 140, y: 430, size: 35},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -2, y: 590, size: 91},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom3.png', x: -15, y: 700, size: 45},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 50, y: 900, size: 45},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom1.png', x: stackedCanvas.width - 70, y: 790, size: 87},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: -1, y: stackedCanvas.height - 320, size: 82},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 30, y: stackedCanvas.height - 100, size: 48},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom5.png', x: 90, y: stackedCanvas.height - 40, size: 44},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom2.png', x: stackedCanvas.width - 90, y: stackedCanvas.height - 200, size: 92},{ src: 'assets/stickers/sakuraBlossom/sakuraBlossom4.png', x: stackedCanvas.width - 40, y: stackedCanvas.height - 290, size: 40}
                ]
            };
            const stickersToDraw = stickerLayouts[selectedSticker];
            if (!stickersToDraw) {
                resolve(); return;
            }
            let loadedCount = 0;
            stickersToDraw.forEach(({ src, x, y, size }) => {
                const stickerImg = new Image();
                stickerImg.src = src;
                stickerImg.onload = function () {
                    ctx.drawImage(stickerImg, x, y, size, size);
                    loadedCount++;
                    if (loadedCount === stickersToDraw.length) resolve();
                };
                stickerImg.onerror = function () {
                    console.error(`Failed to load sticker: ${src}`);
                    loadedCount++;
                    if (loadedCount === stickersToDraw.length) resolve();
                };
            });
        });
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

    // --- Main Canvas Drawing Function ---
    async function redrawCanvas() {
        if (!storedImages) return; // Don't draw if there are no images

        const imageArrayLength = storedImages.length;
        console.log(`Redrawing canvas with background: ${backgroundType}`);

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
        // MODIFIED: Use the 'textColor' variable from the color picker
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

            // MODIFIED: Use the 'textColor' variable from the color picker
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
                img.onerror = () => resolve(null); // Resolve with null on error
            });
        }));

        imageElements.forEach((img, index) => {
            if (!img) return; // Skip if image failed to load

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
        await drawSticker(ctx, stackedCanvas);
        
        // 6. Update the preview on the page
        updatePreview(stackedCanvas);
    }
    
    function updatePreview(canvas) {
        if (!photoCustomPreview) return;
        photoCustomPreview.innerHTML = ''; // Clear old content
        
        // Style and append new canvas
        canvas.style.width = (window.innerWidth <= 768) ? "150px" : "230px";
        if (backgroundColor === '#FFFFFF' && backgroundType === 'color') {
            canvas.style.border = '1px solid #ccc';
        } else {
            canvas.style.border = 'none';
        }
        photoCustomPreview.appendChild(canvas);
    }

    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    async function downloadCanvasCopy() {
        // This function creates the final canvas for download.
        // It's a bit redundant, but we need to ensure it uses the final 'textColor'.
        // Let's just call redrawCanvas and grab its result.
        const previewCanvas = photoCustomPreview.querySelector('canvas');
        if (!previewCanvas) {
            alert("Preview not available to download.");
            return;
        }

        const imageData = previewCanvas.toDataURL('image/png');
        const filename = 'pictlord.png';
        
        if (isIOS()) {
            const blob = await (await fetch(imageData)).blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            const link = document.createElement('a');
            link.href = imageData;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    if (downloadCopyBtn) {
        downloadCopyBtn.addEventListener('click', downloadCanvasCopy);
    }

    // Initial draw when the page loads
    redrawCanvas();
});
