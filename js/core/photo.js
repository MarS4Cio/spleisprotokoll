let attachedLocationPhotos = [];
let attachedSplicePhotos = [];

function handlePhotoUpload(input, category) {
  if (!input.files || input.files.length === 0) return;

  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_DIM = 1200;
        let w = img.width, h = img.height;

        if (w > h && w > MAX_DIM) {
          h *= MAX_DIM / w;
          w = MAX_DIM;
        } else if (h > MAX_DIM) {
          w *= MAX_DIM / h;
          h = MAX_DIM;
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const compressedData = canvas.toDataURL('image/jpeg', 0.75);
        const defaultDesc = category === 'location' ? 'Standort / Schachtansicht' : 'Kassettenansicht / Muffe';

        if (category === 'location') {
          attachedLocationPhotos.push({ src: compressedData, desc: defaultDesc });
        } else {
          attachedSplicePhotos.push({ src: compressedData, desc: defaultDesc });
        }
        renderPhotoGalleries();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  // Input zurücksetzen, damit dasselbe Bild erneut gewählt werden kann
  input.value = '';
}

function renderPhotoGalleries() {
  // 1. Standort-Fotos rendern
  const locContainer = document.getElementById('locPhotoContainer');
  if (locContainer) {
    locContainer.innerHTML = '';
    attachedLocationPhotos.forEach((photo, idx) => {
      const div = document.createElement('div');
      div.className = 'photo-card';
      div.innerHTML = `
        <img src="${photo.src}" alt="Standortfoto">
        <button type="button" class="delete-btn" onclick="attachedLocationPhotos.splice(${idx},1); renderPhotoGalleries();">✕</button>
        <div class="photo-card-body">
          <input type="text" value="${photo.desc}" onchange="attachedLocationPhotos[${idx}].desc = this.value">
        </div>
      `;
      locContainer.appendChild(div);
    });
  }

  // 2. Spleiß-Fotos rendern
  const spliceContainer = document.getElementById('splicePhotoContainer');
  if (spliceContainer) {
    spliceContainer.innerHTML = '';
    attachedSplicePhotos.forEach((photo, idx) => {
      const div = document.createElement('div');
      div.className = 'photo-card';
      div.innerHTML = `
        <img src="${photo.src}" alt="Spleißfoto">
        <button type="button" class="delete-btn" onclick="attachedSplicePhotos.splice(${idx},1); renderPhotoGalleries();">✕</button>
        <div class="photo-card-body">
          <input type="text" value="${photo.desc}" onchange="attachedSplicePhotos[${idx}].desc = this.value">
        </div>
      `;
      spliceContainer.appendChild(div);
    });
  }
}
