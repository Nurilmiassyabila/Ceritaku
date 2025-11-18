const createStoryItemTemplate = (story, options = {}) => {
    const isFavoritePage = options.isFavoritePage || false;
    
    const imageUrl = story.photoUrl || (story.photoBase64 ? story.photoBase64 : 'default-image.jpg');
  
    return `
      <div class="story-item fade-in" id="story-${story.id}">
        <div class="story-header">
          <h3 class="story-title">${story.description.substring(0, 50)}...</h3>
          <p class="story-date">${new Date(story.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        <div class="story-image-container">
          <img class="story-image" 
               src="${imageUrl}" 
               alt="Gambar cerita yang diunggah" 
               loading="lazy">
        </div>
        
        <div class="story-footer">
          ${(() => {
            const lat = typeof story.lat === 'number' ? story.lat : (story.lat ? Number(story.lat) : null);
            const lon = typeof story.lon === 'number' ? story.lon : (story.lon ? Number(story.lon) : null);
            if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
              return `<p class="story-location">📍 Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}</p>`;
            }
            return `<p class="story-location">Lokasi Tidak Tersedia</p>`;
          })()}
          
          <div class="story-actions">
            
            ${isFavoritePage 
              ? `
                <button 
                  class="delete-favorite-button button secondary" 
                  data-id="${story.id}" 
                  aria-label="Hapus cerita dari daftar favorite">
                  🗑️ Hapus dari Favorite
                </button>
              `
              : `
                <button 
                  class="add-favorite-button button primary" 
                  data-id="${story.id}" 
                  aria-label="Simpan cerita ke favorite">
                  💖 Simpan ke Favorite
                </button>
              `
            }
            
            <a href="#/stories/${story.id}" class="button tertiary">Lihat Detail</a>
          </div>
        </div>
      </div>
    `;
  };
  
  /**
   * Template untuk menampilkan header setelah user login.
   * @param {string} userName - Nama pengguna yang sedang login.
   * @returns {string} String HTML.
   */
  const createNavigationTemplate = (userName) => `
    <ul class="nav-list">
      <li><a href="#/home">Beranda</a></li>
      <li><a href="#/add">Tambah Cerita</a></li>
      <li><a href="#/favorites">Cerita Tersimpan</a></li> <li><span class="user-info" aria-label="Pengguna saat ini">${userName}</span></li>
      <li><button id="logout-button" class="button-nav secondary">Keluar</button></li>
    </ul>
  `;
  
  export { 
    createStoryItemTemplate,
    createNavigationTemplate
  };