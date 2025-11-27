// app.js
const links = document.querySelectorAll('.navbar a');
const pages = document.querySelectorAll('.page');

function showPage(pageName) {
  pages.forEach(page => {
    page.classList.remove('active');
  });

  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.classList.add('active');
  }

  links.forEach(link => {
    link.classList.remove('active-link');
    if (link.dataset.page === pageName) {
      link.classList.add('active-link');
    }
  });
}

// navegação por clique
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    showPage(page);
    // opcional: sincronizar hash na URL
    window.location.hash = page;
  });
});

// carregar página inicial a partir da hash (ex: #fotos)
window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    showPage(hash);
  } else {
    showPage('inicio');
  }
});

// após o código da SPA
const audio = document.getElementById('bg-music');
const playBtn = document.getElementById('play-toggle');

let isPlaying = false;

playBtn.addEventListener('click', () => {
  if (!isPlaying) {
    audio.play();
    playBtn.textContent = '⏸️'; // ícone de pausa
    isPlaying = true;
  } else {
    audio.pause();
    playBtn.textContent = '▶️'; // ícone de play
    isPlaying = false;
  }
});

// opcional: se a música terminar, volta o botão para play
audio.addEventListener('ended', () => {
  playBtn.textContent = '▶️';
  isPlaying = false;
});

// --- alternar álbuns (igual antes) ---
const albumButtons = document.querySelectorAll('.album-btn');
const albums = document.querySelectorAll('.album');

albumButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.album;

    albumButtons.forEach(b => b.classList.remove('active-album'));
    btn.classList.add('active-album');

    albums.forEach(a => {
      a.classList.toggle('active-album', a.id === `album-${target}`);
    });
  });
});

// --- carrossel com autoplay por álbum ---
const slidersState = {};      // índice atual
const slidersTimers = {};     // intervalo por álbum
const SLIDE_INTERVAL = 4000;  // 4 segundos

function showSlideForAlbum(albumName, index) {
  const slidesContainer = document.querySelector(
    `.slides[data-album-slides="${albumName}"]`
  );
  if (!slidesContainer) return;

  const slides = slidesContainer.querySelectorAll('.slide');
  if (!slidersState[albumName]) slidersState[albumName] = 0;

  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;

  slidersState[albumName] = index;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

function nextSlide(albumName) {
  const slidesContainer = document.querySelector(
    `.slides[data-album-slides="${albumName}"]`
  );
  if (!slidesContainer) return;

  const total = slidesContainer.querySelectorAll('.slide').length;
  const current = slidersState[albumName] || 0;
  const newIndex = (current + 1) % total;
  showSlideForAlbum(albumName, newIndex);
}

function startAutoplay(albumName) {
  stopAutoplay(albumName);
  slidersTimers[albumName] = setInterval(() => {
    nextSlide(albumName);
  }, SLIDE_INTERVAL);
}

function stopAutoplay(albumName) {
  if (slidersTimers[albumName]) {
    clearInterval(slidersTimers[albumName]);
    slidersTimers[albumName] = null;
  }
}

// botões prev/next continuam funcionando
const slideButtons = document.querySelectorAll('.slide-btn');

slideButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const albumName = btn.dataset.target;
    const isNext = btn.classList.contains('next');

    const slidesContainer = document.querySelector(
      `.slides[data-album-slides="${albumName}"]`
    );
    const total = slidesContainer.querySelectorAll('.slide').length;

    if (!slidersState[albumName]) slidersState[albumName] = 0;
    const current = slidersState[albumName];

    const newIndex = isNext
      ? (current + 1) % total
      : (current - 1 + total) % total;

    showSlideForAlbum(albumName, newIndex);
    startAutoplay(albumName); // reseta o timer depois do clique
  });
});

document.querySelectorAll('.slider').forEach(slider => {
  const albumName = slider
    .querySelector('.slides')
    .dataset.albumSlides;

  slider.addEventListener('mouseenter', () => stopAutoplay(albumName));
  slider.addEventListener('mouseleave', () => startAutoplay(albumName));
});


// inicializa slides + autoplay
showSlideForAlbum('familia', 0);
showSlideForAlbum('namorado', 0);
startAutoplay('familia');
startAutoplay('namorado');

