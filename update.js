document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Theme Manager Script ---
    const themeToggle = document.getElementById('theme-toggle');
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
    };
    themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    
    // --- 2. Script untuk Active Button States ---
    const buttonContainers = document.querySelectorAll('.custom-buttons-container, .logo-container');
    buttonContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('button');
            if (!clickedButton) return;
            
            if (!clickedButton.closest('.stickers-container')) { 
                 const buttonsInGroup = container.querySelectorAll('button');
                 buttonsInGroup.forEach(btn => btn.classList.remove('active'));
                 clickedButton.classList.add('active');
            } else {
                if(clickedButton.id === 'noneSticker') {
                    const stickerButtons = container.querySelectorAll('button');
                    stickerButtons.forEach(btn => btn.classList.remove('active'));
                    clickedButton.classList.add('active');
                } else {
                    document.getElementById('noneSticker')?.classList.remove('active');
                    clickedButton.classList.toggle('active');
                }
            }
        });
    });

    // --- 3. Logika Modal Preview ---
    const previewModal = document.getElementById('previewModal');
    const previewBtn = document.getElementById('previewBtn');
    const modalImage = document.getElementById('modalImagePreview');
    const closeModalBtn = document.querySelector('.modal-close-btn');

    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            const finalCanvas = document.querySelector('#photoPreview canvas'); 
            if (finalCanvas) {
                modalImage.src = finalCanvas.toDataURL('image/png');
                previewModal.style.display = 'block';
            } else {
                alert('Silakan buat gambar terlebih dahulu!');
            }
        });
    }
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (event) => {
        if (event.target == previewModal) {
            previewModal.style.display = 'none';
        }
    });

    // --- 4. Logika QR Code & Download ---
    const downloadBtn = document.getElementById('downloadCopyBtn');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcodeDiv = document.getElementById('qrcode');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const finalCanvas = document.querySelector('#photoPreview canvas');
            if (finalCanvas) {
                if (qrCodeContainer.style.display === 'none') {
                    qrcodeDiv.innerHTML = '';
                    new QRCode(qrcodeDiv, {
                        text: finalCanvas.toDataURL('image/png'),
                        width: 128,
                        height: 128,
                        correctLevel: QRCode.CorrectLevel.H
                    });
                    qrCodeContainer.style.display = 'block';
                }
                // Anda tetap bisa menjalankan fungsi download asli dari customize6.js di sini
            } else {
                alert('Silakan buat gambar terlebih dahulu!');
            }
        });
    }

    // --- 5. Logika Tombol Share ---
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Pictlord Photobooth',
                text: 'bingung nyari? photobooth online free dimana dan kapan aja tenang pictlord 📸solusinya 😎',
                url: window.location.origin // Menggunakan URL domain utama situs
            };
    
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    alert('Browser Anda tidak mendukung fitur share. Silakan salin link secara manual.');
                }
            } catch (err) {
                console.error('Error saat sharing:', err);
            }
        });
    }

    // --- 6. Logika untuk Kustomisasi Warna Logo ---
    const logoColorPicker = document.getElementById('logoColorPicker');
    if (logoColorPicker) {
        logoColorPicker.addEventListener('input', () => {
            // Panggil fungsi redraw canvas Anda dari customize6.js/canvas.js di sini
            // Ini akan memastikan canvas diperbarui setiap kali warna diubah
            // Contoh:
            // if (typeof redrawCanvasWithOptions === 'function') {
            //     redrawCanvasWithOptions(); 
            // }
            console.log('Warna logo baru dipilih:', logoColorPicker.value);
        });
    }
});