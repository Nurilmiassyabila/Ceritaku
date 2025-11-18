class AddStoryView {
  constructor() {
    this.stream = null;
    this.hashListener = null;
  }

  render() {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
      <section class="add-story-section fade-in" aria-labelledby="add-story-heading">
        <h2 id="add-story-heading">Tambah Cerita Baru</h2>
        <form id="add-story-form" aria-describedby="add-story-desc">
          <p id="add-story-desc" class="visually-hidden">Isi judul, deskripsi, tambahkan foto, dan pilih lokasi pada peta.</p>
          
          <label for="title" class="visually-hidden">Judul Cerita</label>
          <input type="text" id="title" placeholder="Judul Cerita" required aria-label="Judul cerita" />

          <label for="description" class="visually-hidden">Deskripsi Cerita</label>
          <textarea id="description" placeholder="Deskripsi Cerita" required aria-label="Deskripsi cerita"></textarea>

          <div class="photo-section">
            <h3>Foto Cerita</h3>
            <div class="photo-choice">
              <button type="button" id="use-camera-btn" class="btn" aria-label="Gunakan kamera">Gunakan Kamera</button>
              <input type="file" id="upload-file" accept="image/*" style="display:none" aria-label="Unggah foto dari galeri" />
              <button type="button" id="upload-btn" class="btn" aria-label="Unggah foto dari file">Upload file</button>
            </div>

            <div class="camera-section" style="display:none;">
              <video id="camera" autoplay playsinline></video>
              <button type="button" id="capture-btn" class="btn">Ambil Foto</button>
              <canvas id="preview" style="display:none;"></canvas>
            </div>
          </div>

          <div class="map-section">
            <h3>Pilih Lokasi</h3>
            <div id="map" style="height: 250px; border-radius: 10px; margin-top: 10px;"></div>
          </div>

          <button type="submit" class="btn-primary">Simpan Cerita</button>
        </form>
      </section>
    `;

    const titleInput = main.querySelector('#title');
    if (titleInput) titleInput.focus();

    this.bindPhotoOptions();
    this.initMap();

    if (this.hashListener) {
      window.removeEventListener('hashchange', this.hashListener);
    }
    this.hashListener = () => {
      if (!location.hash.includes('/add')) this.stopCamera();
    };
    window.addEventListener('hashchange', this.hashListener);
  }

  bindPhotoOptions() {
    const useCameraBtn = document.getElementById('use-camera-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadInput = document.getElementById('upload-file');
    const cameraSection = document.querySelector('.camera-section');

    if (useCameraBtn) {
      useCameraBtn.addEventListener('click', async () => {
        cameraSection.style.display = 'block';
        await this.initCamera();
      });
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => uploadInput.click());
    }

    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem('lastCapturedPhoto', reader.result);
          this.stopCamera();
          alert('📸 Foto dari galeri berhasil diunggah!');
        };
        reader.readAsDataURL(file);
      });
    }
  }

  async initCamera() {
    const video = document.getElementById('camera');
    if (!video) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = this.stream;

      const captureBtn = document.getElementById('capture-btn');
      if (captureBtn) {
        captureBtn.onclick = () => this.capturePhoto();
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  }

  capturePhoto() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('preview');
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';

    const imageData = canvas.toDataURL('image/png');
    localStorage.setItem('lastCapturedPhoto', imageData);

    this.stopCamera();
    alert('📷 Foto berhasil diambil dan kamera dimatikan.');
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('📷 Kamera dimatikan otomatis.');
    }
  }

  async initMap() {
    if (typeof L === 'undefined') {
      console.error('Leaflet belum dimuat.');
      return;
    }

    const map = L.map('map').setView([-5.1477, 119.4327], 13); // Makassar default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    let marker;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
      localStorage.setItem('selectedLocation', JSON.stringify({ lat, lng }));
    });
  }
}

export default AddStoryView;