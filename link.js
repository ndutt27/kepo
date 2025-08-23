// Standalone script for custom link management in xlord.html

document.addEventListener('DOMContentLoaded', () => {
    
    // Config for the SECONDARY Firebase app (for links)
    const linksAppConfig = {
        apiKey: "AIzaSyD3xoMfpgP-NpReXRtNde1iLYFTscS5MrI",
        authDomain: "pictlord-c5d89.firebaseapp.com",
        databaseURL: "https://pictlord-c5d89-default-rtdb.firebaseio.com",
        projectId: "pictlord-c5d89",
        storageBucket: "pictlord-c5d89.appspot.com",
        messagingSenderId: "212916312487",
        appId: "1:212916312487:web:f6b035a9e37faf4384fe82",
        measurementId: "G-SD0CGHYVR7"
    };

    // Initialize the secondary app with a unique name
    const linksApp = firebase.initializeApp(linksAppConfig, 'linksApp');
    
    // --- Script-specific variables from the secondary app ---
    const linksDatabase = linksApp.database();
    const imagesRef = linksDatabase.ref('images');
    const customLinkTableBody = document.getElementById('custom-link-table-body');
    const linkSearchInput = document.getElementById('link-search-input');
    let allLinks = []; // To store the master list of links

    /**
     * Renders a given array of link objects into the table.
     * @param {Array<Object>} linksToRender - The array of link objects to display.
     */
    const renderCustomLinks = (linksToRender) => {
        if (!customLinkTableBody) return;
        customLinkTableBody.innerHTML = '';

        if (linksToRender.length === 0) {
            const message = linkSearchInput && linkSearchInput.value 
                ? "Tidak ada link yang cocok dengan pencarian Anda."
                : "Belum ada link kustom yang dibuat.";
            customLinkTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 4rem; color: var(--text-light);">${message}</td></tr>`;
            return;
        }

        linksToRender.forEach(link => {
            const tr = document.createElement('tr');
            const expiresDate = new Date(link.expiresAt);
            const formattedDate = expiresDate.toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const isExpired = link.expiresAt < Date.now();
            const previewImgHTML = link.strip
                ? `<img src="${link.strip}" class="link-preview-img" alt="Preview ${link.id}" loading="lazy">`
                : `<div class="link-preview-img" style="display: flex; align-items: center; justify-content: center; text-align: center; font-size: 1.1rem; line-height: 1.2;">No Preview</div>`;

            tr.innerHTML = `
                <td>${previewImgHTML}</td>
                <td><code>${link.id}</code></td>
                <td style="${isExpired ? 'color: var(--danger); opacity: 0.7;' : ''}">
                    ${formattedDate} ${isExpired ? ' <strong>(Expired)</strong>' : ''}
                </td>
                <td class="action-buttons">
                    <a href="https://www.pictlord.me/soft-file?id=${link.id}" target="_blank" class="btn-icon btn-view" title="Lihat Halaman"><i class="fas fa-eye"></i></a>
                    <button class="btn-icon btn-edit" data-id="${link.id}" title="Edit Tanggal Kadaluarsa"><i class="fas fa-calendar-alt"></i></button>
                    <button class="btn-icon btn-delete" data-id="${link.id}" title="Hapus Link"><i class="fas fa-trash"></i></button>
                </td>
            `;
            customLinkTableBody.appendChild(tr);
        });
    };

    /**
     * Fetches all links from Firebase and triggers the initial render.
     */
    const loadCustomLinks = () => {
        if (!customLinkTableBody) return;
        customLinkTableBody.innerHTML = `<tr><td colspan="4" class="loader-container"><div class="loader"></div></td></tr>`;

        imagesRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const linksData = snapshot.val();
                allLinks = Object.entries(linksData)
                    .map(([id, data]) => ({ id, ...data }))
                    .sort((a, b) => (b.expiresAt || 0) - (a.expiresAt || 0));
                
                const searchTerm = linkSearchInput ? linkSearchInput.value.toLowerCase().trim() : '';
                const linksToRender = searchTerm
                    ? allLinks.filter(link => link.id.toLowerCase().includes(searchTerm))
                    : allLinks;
                renderCustomLinks(linksToRender);

            } else {
                allLinks = [];
                renderCustomLinks([]);
            }
        }, (error) => {
            console.error("Firebase read failed for custom links: " + error.code);
            if(customLinkTableBody) customLinkTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--danger);">Gagal memuat data link.</td></tr>';
        });
    };

    // --- Event Listeners ---

    if (customLinkTableBody) {
        customLinkTableBody.addEventListener('click', (e) => {
            const target = e.target.closest('button.btn-icon');
            if (!target) return;
            const id = target.dataset.id;
            if (!id) return;

            if (target.classList.contains('btn-delete')) {
                const modalFunc = typeof showModal === 'function' ? showModal : (msg, cb) => { if(confirm(msg)) cb(); };
                modalFunc(`Anda yakin ingin menghapus link dengan ID "${id}"? Tindakan ini tidak dapat dibatalkan.`, () => {
                    imagesRef.child(id).remove()
                        .then(() => console.log(`Link ${id} berhasil dihapus.`))
                        .catch(err => alert(`Gagal menghapus link: ${err.message}`));
                });
            }

            if (target.classList.contains('btn-edit')) {
                const daysStr = prompt(`Link ID: ${id}\n\nMasukkan jumlah HARI dari sekarang hingga link akan kadaluarsa (contoh: 7 untuk 7 hari).`, '7');
                if (daysStr === null) return;
                const days = parseInt(daysStr, 10);
                if (isNaN(days) || days < 0) {
                    alert('Harap masukkan angka yang valid (0 atau lebih).');
                    return;
                }
                const newExpirationTime = Date.now() + (days * 24 * 60 * 60 * 1000);
                imagesRef.child(id).update({ expiresAt: newExpirationTime })
                    .then(() => console.log(`Tanggal kadaluarsa untuk link ${id} berhasil diperbarui.`))
                    .catch(err => alert(`Gagal memperbarui link: ${err.message}`));
            }
        });
    }

    if (linkSearchInput) {
        linkSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredLinks = allLinks.filter(link => link.id.toLowerCase().includes(searchTerm));
            renderCustomLinks(filteredLinks);
        });
    }

    // --- Initial Load ---
    if (document.getElementById('custom-link-management')) {
        loadCustomLinks();
    }
});
