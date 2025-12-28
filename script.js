/* script.js - Versão atualizada: vídeos tocam fora do fullscreen e sem autoplay de fotos */
const START_DATE = new Date('2025-04-21T00:00:00');

// Elementos do timer
const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

// Elementos da galeria
const bigImg = document.getElementById('bigImg'); // <img> existente
const thumbs = document.getElementById('thumbs');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentImgEl = document.getElementById('current-img');
const totalImgEl = document.getElementById('total-img');
const imageDateEl = document.getElementById('image-date');
const imageDescEl = document.getElementById('image-desc');
const playSlideshowBtn = document.getElementById('playSlideshow');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const refreshBtn = document.getElementById('refreshBtn');
const loadingEl = document.getElementById('loading');
const imageOverlay = document.querySelector('.image-overlay');

// Elementos do modal
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage'); // <img> existente no modal
const modalDateEl = document.getElementById('modalDate');
const modalDescEl = document.getElementById('modalDesc');
const closeModal = document.querySelector('.close-modal');

// Criar elementos de vídeo dinamicamente (para exibir vídeos no lugar da imagem)
const bigVideo = document.createElement('video');
bigVideo.id = 'bigVideo';
bigVideo.className = 'main-video';
bigVideo.style.display = 'none';
bigVideo.style.width = '100%';
bigVideo.style.height = 'auto';
bigVideo.style.objectFit = 'contain';
bigVideo.controls = true;
bigVideo.playsInline = true;
bigVideo.preload = 'metadata';
bigImg.parentNode.insertBefore(bigVideo, bigImg.nextSibling);

const modalVideo = document.createElement('video');
modalVideo.id = 'modalVideo';
modalVideo.className = 'modal-video';
modalVideo.style.display = 'none';
modalVideo.style.width = '100%';
modalVideo.style.height = 'auto';
modalVideo.style.objectFit = 'contain';
modalVideo.controls = true;
modalVideo.playsInline = true;
modalVideo.preload = 'metadata';
modalImage.parentNode.insertBefore(modalVideo, modalImage.nextSibling);

// Citações românticas para rotacionar
const quotes = [
  "O amor é a única realidade e não é apenas um sentimento, é a verdade suprema que reside no coração de toda a criação.",
  "Amar não é olhar um para o outro, é olhar juntos na mesma direção.",
  "O verdadeiro amor não é algo que vem até você por acaso; é um trabalho árduo e uma decisão consciente.",
  "O amor é quando a felicidade da outra pessoa é mais importante que a sua.",
  "Amar é encontrar na felicidade de outrem a própria felicidade.",
  "O amor é a chave que abre as portas da felicidade.",
  "Não existe um caminho para a felicidade. A felicidade é o caminho. E o amor é o que torna esse caminho especial."
];

// Array para armazenar as fotos da pasta com descrições fixas
let photos = [];
let index = 0;
let slideshowInterval = null;
let isPlaying = false;

/* UTIL */
function isVideoFile(filename) {
  return /\.(mp4|webm|ogg|mov)$/i.test(filename);
}

/* TIMER */
function updateTimer() {
  const now = new Date();

  let years = now.getFullYear() - START_DATE.getFullYear();
  let months = now.getMonth() - START_DATE.getMonth();
  let days = now.getDate() - START_DATE.getDate();

  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const temp = new Date(START_DATE.getFullYear() + years, START_DATE.getMonth() + months, START_DATE.getDate());
  const diff = now - temp;

  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  yearsEl.textContent = String(years).padStart(2, '0');
  monthsEl.textContent = String(months).padStart(2, '0');
  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hrs).padStart(2, '0');
  minutesEl.textContent = String(mins).padStart(2, '0');
  secondsEl.textContent = String(secs).padStart(2, '0');
}

// Atualizar citação periodicamente
function updateQuote() {
  const quoteText = document.getElementById('quote-text');
  if (!quoteText) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteText.style.opacity = 0;

  setTimeout(() => {
    quoteText.textContent = quotes[randomIndex];
    quoteText.style.opacity = 1;
  }, 300);
}

/* FUNÇÃO PARA CARREGAR FOTOS DA PASTA COM DESCRIÇÕES FIXAS */
async function loadPhotosFromFolder() {
  try {
    // Mostrar loading
    loadingEl.style.display = 'flex';
    bigImg.style.display = 'none';
    bigVideo.style.display = 'none';

    // Garantir que slideshow esteja desligado (nenhum autoplay)
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = null;
    isPlaying = false;
    if (playSlideshowBtn) playSlideshowBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';

    // Nomes dos arquivos de foto/video
    const photoFiles = [
      'Imagem 5.jpeg','Imagem 3.jpeg','Imagem 2.jpeg','Imagem 4.jpeg','Imagem 1.jpeg'
    ];

    // DESCRIÇÕES FIXAS PARA CADA FOTO
    const fixedDescriptions = [
      'Nosso primeiro encontro', 'Nossa Primeira Vez...','Sentados na Rua', 'Festa Fantasia', 'Alianças'
      // adicione outras descrições seguindo a ordem dos arquivos, se quiser
    ];

    // Tentar carregar cada foto
    const loadedPhotos = [];

    for (let i = 0; i < photoFiles.length; i++) {
      const fileName = photoFiles[i];
      const filePath = `Fotos/${fileName}`;

      // Usar descrição fixa se disponível, caso contrário usar padrão
      const description = fixedDescriptions[i] || 'Momento especial juntos';

      // Criar objeto de foto/video
      const photoObj = {
        src: filePath,
        desc: description,
        isVideo: isVideoFile(fileName)
      };

      loadedPhotos.push(photoObj);
    }

    // Atualizar array de fotos
    photos = loadedPhotos;

    // Esconder loading e mostrar galeria
    setTimeout(() => {
      loadingEl.style.display = 'none';
      bigImg.style.display = 'block';
      renderGallery();
    }, 400);

  } catch (error) {
    console.error('Erro ao carregar fotos:', error);
    loadingEl.innerHTML = `
      <div>
        <i class="fas fa-exclamation-triangle" style="color: var(--secondary); font-size: 3rem;"></i>
        <p>Erro ao carregar fotos</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">Verifique se a pasta "Fotos" existe</p>
        <button onclick="loadPhotosFromFolder()" style="margin-top: 15px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
          Tentar novamente
        </button>
      </div>
    `;
  }
}

/* GALERIA */
function renderGallery() {
  thumbs.innerHTML = '';

  // Pausar vídeos existentes sempre que trocar
  try { bigVideo.pause(); bigVideo.currentTime = 0; } catch(e) {}
  try { modalVideo.pause(); modalVideo.currentTime = 0; } catch(e) {}

  if (!photos || photos.length === 0) {
    bigImg.style.display = 'none';
    bigVideo.style.display = 'none';
    loadingEl.style.display = 'flex';
    loadingEl.innerHTML = `
      <div>
        <i class="fas fa-camera" style="color: var(--primary-light); font-size: 3rem;"></i>
        <p>Nenhuma foto encontrada</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">Adicione fotos na pasta "Fotos"</p>
      </div>
    `;
    return;
  }

  if (index < 0) index = photos.length - 1;
  if (index >= photos.length) index = 0;

  const currentPhoto = photos[index];

  // Mostrar imagem ou vídeo conforme o tipo
  if (currentPhoto.isVideo) {
    // Exibir elemento de vídeo grande
    bigImg.style.display = 'none';
    bigVideo.style.display = 'block';
    bigVideo.src = currentPhoto.src;
    bigVideo.alt = currentPhoto.desc || '';
    bigVideo.load();

    // permitir cliques passarem para o vídeo (overlay não bloqueia)
    if (imageOverlay) {
      imageOverlay.style.pointerEvents = 'none';
    }
  } else {
    // Exibir imagem
    bigVideo.style.display = 'none';
    bigVideo.src = '';
    bigImg.style.display = 'block';

    // overlay volta a interceptar eventos (para permitir copiar/selecionar ou outros)
    if (imageOverlay) {
      imageOverlay.style.pointerEvents = 'auto';
    }

    // verificar se a imagem existe antes de setar (opcional)
    const img = new Image();
    img.onload = function() {
      bigImg.src = currentPhoto.src;
      bigImg.alt = currentPhoto.desc;
    };
    img.onerror = function() {
      bigImg.src = ''; // ou um placeholder
      bigImg.alt = 'Imagem não encontrada';
    };
    img.src = currentPhoto.src;
  }

  // Atualizar infos
  currentImgEl.textContent = index + 1;
  totalImgEl.textContent = photos.length;
  imageDateEl.textContent = currentPhoto.date;
  imageDescEl.textContent = currentPhoto.desc;

  // Renderizar miniaturas (imagem ou bloco de vídeo)
  photos.forEach((photo, i) => {
    const div = document.createElement('div');
    div.className = 'thumb' + (i === index ? ' active' : '');
    div.style.cursor = 'pointer';

    if (photo.isVideo) {
      // miniatura para vídeo: mostra label e ícone
      div.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;padding:6px;">
          <i class="fas fa-play" style="font-size:1.1rem;"></i>
          <small style="font-size:0.7rem; text-align:center; margin-top:6px;">Vídeo</small>
        </div>
      `;
    } else {
      const thumbImg = document.createElement('img');
      thumbImg.src = photo.src;
      thumbImg.alt = photo.desc;
      div.appendChild(thumbImg);
    }

    div.onclick = () => {
      index = i;
      renderGallery();
    };
    thumbs.appendChild(div);
  });
}

// Controles de slideshow
function toggleSlideshow() {
  if (photos.length === 0) return;

  if (isPlaying) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
    playSlideshowBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';
    isPlaying = false;
  } else {
    slideshowInterval = setInterval(() => {
      index = (index + 1) % photos.length;
      renderGallery();
    }, 3000);
    playSlideshowBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
    isPlaying = true;
  }
}

// Modal de tela cheia (suporta imagem e vídeo)
function openFullscreen() {
  if (photos.length === 0) return;

  const currentPhoto = photos[index];
  modalDateEl.textContent = currentPhoto.date;
  modalDescEl.textContent = currentPhoto.desc;
  imageModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (currentPhoto.isVideo) {
    modalImage.style.display = 'none';
    modalVideo.style.display = 'block';
    modalVideo.src = currentPhoto.src;
    modalVideo.load();
    // não forçamos autoplay aqui – usuário pode tocar
  } else {
    modalVideo.style.display = 'none';
    modalVideo.src = '';
    modalImage.style.display = 'block';
    modalImage.src = currentPhoto.src;
    modalImage.alt = currentPhoto.desc;
  }
}

function closeFullscreen() {
  imageModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  try { modalVideo.pause(); modalVideo.currentTime = 0; } catch(e) {}
}

// Recarregar fotos
function refreshPhotos() {
  loadPhotosFromFolder();
}

// Event Listeners
prevBtn.addEventListener('click', () => {
  if (photos.length === 0) return;
  index--;
  renderGallery();
});

nextBtn.addEventListener('click', () => {
  if (photos.length === 0) return;
  index++;
  renderGallery();
});

playSlideshowBtn.addEventListener('click', toggleSlideshow);
fullscreenBtn.addEventListener('click', openFullscreen);
refreshBtn.addEventListener('click', refreshPhotos);
closeModal.addEventListener('click', closeFullscreen);

// Fechar modal clicando fora da imagem
imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) {
    closeFullscreen();
  }
});

// Avançar ao clicar na imagem grande (se for imagem). Se for vídeo, clica para dar play/pause
bigImg.addEventListener('click', (e) => {
  if (photos.length === 0) return;
  // só avança se o modal não estiver aberto
  if (imageModal.style.display !== 'flex') {
    index = (index + 1) % photos.length;
    renderGallery();
  }
});

// Click no vídeo grande: toggle play/pause; se começar a tocar, garante que slideshow pare
bigVideo.addEventListener('click', (e) => {
  if (bigVideo.paused) {
    bigVideo.play().catch(() => {
      // alguns navegadores podem bloquear play sem interação; neste caso, nada
    });
    // Se o slideshow estava rodando, pare-o
    if (isPlaying) toggleSlideshow();
  } else {
    bigVideo.pause();
  }
});

// Navegação por teclado
document.addEventListener('keydown', (e) => {
  if (photos.length === 0) return;

  if (e.key === 'ArrowLeft') {
    index--;
    renderGallery();
  }
  if (e.key === 'ArrowRight') {
    index++;
    renderGallery();
  }
  if (e.key === 'Escape') {
    closeFullscreen();
  }
  if (e.key === ' ') {
    e.preventDefault();
    toggleSlideshow();
  }
});

// Quando modal estiver aberto e for vídeo, permitir clique para play/pause
modalVideo.addEventListener('click', () => {
  if (modalVideo.paused) modalVideo.play();
  else modalVideo.pause();
});

// Inicialização
setInterval(updateTimer, 1000);
updateTimer();

// Atualizar citação a cada 10 segundos
setInterval(updateQuote, 10000);

// Carregar fotos da pasta ao iniciar
loadPhotosFromFolder();
