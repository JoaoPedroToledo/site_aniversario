// app.js

// =================================================================
// 1. NAVEGAÇÃO SPA (Single Page Application)
// =================================================================

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

// =================================================================
// 2. CORREÇÃO: PLAYER DE MÚSICA (Lógica Antiga Removida)
// A nova lógica está no DOMContentLoaded abaixo.
// =================================================================


// =================================================================
// 3. ALTERNAR ÁLBUNS
// =================================================================

const albumButtons = document.querySelectorAll('.album-btn');
const albums = document.querySelectorAll('.album');

albumButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.album;

    albumButtons.forEach(b => b.classList.remove('active-album'));
    btn.classList.add('active-album');

    albums.forEach(a => {
      // Usa toggle com o segundo argumento para ser mais limpo
      a.classList.toggle('active-album', a.id === `album-${target}`);
    });
  });
});

// =================================================================
// 4. CARROSSEL COM AUTOPLAY
// =================================================================

const slidersState = {};      // índice atual
const slidersTimers = {};     // intervalo por álbum
const SLIDE_INTERVAL = 4000;  // 4 segundos

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

// =================================================================
// 5. INICIALIZAÇÃO E PLAYER DE MÚSICA (Novo Seletor)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const musicToggleBtn = document.getElementById('music-toggle');
    const musicListContainer = document.getElementById('music-list-container');
    const musicList = document.getElementById('music-list');

    // Inicialização do Carrossel/Autoplay
    // Nota: Os nomes 'familia', 'namorado', 'aurorinha' devem bater com os data-album-slides no HTML
    showSlideForAlbum('familia', 0);
    showSlideForAlbum('namorado', 0);
    showSlideForAlbum('aurorinha', 0);
    startAutoplay('familia');
    startAutoplay('namorado');
    startAutoplay('aurorinha');

    // Verifica se os elementos do player de música existem
    if (!musicToggleBtn || !musicListContainer || !audioPlayer) {
      console.error("ERRO: Elementos do player de música (botão, lista ou áudio) não encontrados no HTML. Verifique os IDs.");
      return; // Interrompe o script do player se os elementos não existirem
    }

    // SUA LISTA DE MÚSICAS INTEGRADA
    const playlist = [
        { name: "Luan Santana - Te Vivo", src: "assets/Luan Santana-Te Vivo.mp3" },
        { name: "Ilha", src: "assets/Ilha.mp3" },
        { name: "Água com Açúcar", src: "assets/Agua com acucar.mp3" },
        { name: "Te Esperando", src: "assets/Te esperando.mp3" },
        { name: "Meteoro", src: "assets/Meteoro.mp3" }
    ];
    
    // Define o texto inicial do botão
    musicToggleBtn.textContent = 'Escolher Música';

    // Popular a lista de músicas e adicionar listeners
    playlist.forEach((song, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${song.name}`;
        listItem.dataset.src = song.src; // Armazena o caminho do arquivo no elemento
        musicList.appendChild(listItem);

        // Lógica ao clicar na música (Tocar/Pausar/Trocar)
        listItem.addEventListener('click', function() {
            const newSrc = this.dataset.src;
            
            // Pega apenas o nome do arquivo para comparação (para evitar problemas de caminho absoluto vs relativo)
            const newFileName = newSrc.split('/').pop(); 
            const currentFileName = audioPlayer.src.split('/').pop();

            // Verifica se a música atual é a mesma que está tocando
            if (currentFileName === newFileName) { 
                if (!audioPlayer.paused) {
                    audioPlayer.pause();
                    musicToggleBtn.textContent = `Pausado: ${song.name}`;
                } else {
                    audioPlayer.play();
                    musicToggleBtn.textContent = `Tocando: ${song.name}`;
                }
            } else {
                // Toca uma nova música
                audioPlayer.src = newSrc;
                audioPlayer.play()
                    .then(() => {
                        musicToggleBtn.textContent = `Tocando: ${song.name}`;
                    })
                    .catch(error => {
                        console.error("Erro ao tentar tocar a música. Verifique o caminho:", error);
                        alert(`Erro ao tocar a música: ${song.name}. Verifique a pasta 'assets'.`);
                    });
            }
            // Esconde a lista após a seleção/ação
            musicListContainer.classList.add('hidden'); 
        });
    });

    // Alternar a visibilidade da lista ao clicar no botão
    musicToggleBtn.addEventListener('click', () => {
        musicListContainer.classList.toggle('hidden');
    });

    // Lógica opcional: se a música terminar, volta o botão para o texto inicial
    audioPlayer.addEventListener('ended', () => {
      musicToggleBtn.textContent = 'Escolher Música'; 
    });

});

// VARIÁVEL DE SENHA (MUITO IMPORTANTE: esta senha fica visível no código fonte!)
const CORRECT_PASSWORD = 'sua-senha-secreta'; 

const lockScreen = document.getElementById('lock-screen');
const passwordInput = document.getElementById('password-input');
const accessButton = document.getElementById('access-button');
const errorMessage = document.getElementById('error-message');

function attemptAccess() {
  const CORRECT_PASSWORD = '070820';
    const enteredPassword = passwordInput.value;

    if (enteredPassword === CORRECT_PASSWORD) {
        // Senha correta: Esconde a tela de bloqueio
        lockScreen.style.display = 'none'; 
        // Opcional: Salvar no localStorage para não pedir a senha novamente na mesma sessão
        localStorage.setItem('hasAccess', 'true');
    } else {
        // Senha incorreta: Mostra mensagem de erro
        errorMessage.classList.remove('hidden-error');
        passwordInput.value = ''; // Limpa o campo
        passwordInput.focus();
    }
}

// Verifica se o usuário já tem acesso (se salvou no localStorage)
if (localStorage.getItem('hasAccess') === 'true') {
    lockScreen.style.display = 'none';
}

// Adiciona listener ao botão
accessButton.addEventListener('click', attemptAccess);

// Permite acessar com a tecla Enter
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        attemptAccess();
    }
});