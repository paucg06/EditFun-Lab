/* ========================================================
   YOUTUBE FAKE - SCRIPT PRINCIPAL
   Simulador realista de YouTube
   ======================================================== */

(function() {
  'use strict';

  // ========================================================
  // VÍDEOS OFICIALES DE ETERNODEV (4 VÍDEOS)
  // Miniaturas HD maxresdefault con respaldo a hqdefault
  // ========================================================
  const ETERNO_VIDEOS = [
    {
      title: '¡REHICE el Juego de mis SUEÑOS! - DevBlog 2',
      channel: 'EternoDev',
      verified: true,
      stats: '3,8 K visualizaciones • hace 3 semanas',
      duration: '14:25',
      thumb: 'https://i.ytimg.com/vi/wjoGjOxCTCQ/maxresdefault.jpg',
      avatar: '/youtubefake/assets/img/eternodev_channel.jpg'
    },
    {
      title: 'Sobreviví a mi PRIMERA GameJam',
      channel: 'EternoDev',
      verified: true,
      stats: '4,2 K visualizaciones • hace 1 mes',
      duration: '11:18',
      thumb: 'https://i.ytimg.com/vi/DFR5UtAuHTw/maxresdefault.jpg',
      avatar: '/youtubefake/assets/img/eternodev_channel.jpg'
    },
    {
      title: 'Hice un VTUBER en 48 HORAS',
      channel: 'EternoDev',
      verified: true,
      stats: '5,9 K visualizaciones • hace 2 meses',
      duration: '9:45',
      thumb: 'https://i.ytimg.com/vi/bRbhRWQvqs8/maxresdefault.jpg',
      avatar: '/youtubefake/assets/img/eternodev_channel.jpg'
    },
    {
      title: '¡Creando Mi Propio JUEGO Desde CERO! - DevBlog 1',
      channel: 'EternoDev',
      verified: true,
      stats: '6,5 K visualizaciones • hace 3 meses',
      duration: '12:50',
      thumb: 'https://i.ytimg.com/vi/F1-R5hIjGLM/maxresdefault.jpg',
      avatar: '/youtubefake/assets/img/eternodev_channel.jpg'
    }
  ];

  // ========================================================
  // VÍDEOS EXTERNOS (15 VÍDEOS DE CANALES CONOCIDOS)
  // Se han eliminado los 3 vídeos solicitados por el usuario
  // ========================================================
  const OTHER_VIDEOS = [
    {
      title: 'Probé Cada Comida Exclusiva de Japón',
      channel: 'TheWillyrex',
      verified: true,
      stats: '1,2 M de visualizaciones • hace 9 meses',
      duration: '17:34',
      thumb: 'https://i.ytimg.com/vi/8GOEdWOaX28/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@Willyrex'
    },
    {
      title: '$456,000 Squid Game In Real Life!',
      channel: 'MrBeast',
      verified: true,
      stats: '640 M de visualizaciones • hace 2 años',
      duration: '25:41',
      thumb: 'https://i.ytimg.com/vi/0e3GPea1Tyg/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@MrBeast'
    },
    {
      title: "Using Apple Vision Pro: What It's Actually Like!",
      channel: 'Marques Brownlee',
      verified: true,
      stats: '12 M de visualizaciones • hace 1 año',
      duration: '18:24',
      thumb: 'https://i.ytimg.com/vi/dtp6b76pMak/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@mkbhd'
    },
    {
      title: 'The Simplest Math Problem No One Can Solve',
      channel: 'Veritasium',
      verified: true,
      stats: '34 M de visualizaciones • hace 3 años',
      duration: '22:04',
      thumb: 'https://i.ytimg.com/vi/094y1Z2wpJg/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@veritasium'
    },
    {
      title: 'Water Bottle Flip 2',
      channel: 'Dude Perfect',
      verified: true,
      stats: '385 M de visualizaciones • hace 7 años',
      duration: '5:36',
      thumb: 'https://i.ytimg.com/vi/VJwoSfTOhyM/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@DudePerfect'
    },
    {
      title: "DO WHAT YOU CAN'T",
      channel: 'CaseyNeistat',
      verified: true,
      stats: '18 M de visualizaciones • hace 6 años',
      duration: '3:59',
      thumb: 'https://i.ytimg.com/vi/jG7dSXcfVqE/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@casey'
    },
    {
      title: 'How to Survive a Grenade Blast',
      channel: 'Mark Rober',
      verified: true,
      stats: '45 M de visualizaciones • hace 2 años',
      duration: '13:12',
      thumb: 'https://i.ytimg.com/vi/W4DnuQOtA8E/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@MarkRober'
    },
    {
      title: 'REACCIONANDO A YOUTUBERS ENSEÑANDO SU CARA POR PRIMERA VEZ',
      channel: 'Ibai',
      verified: true,
      stats: '3,5 M de visualizaciones • hace 1 año',
      duration: '24:15',
      thumb: 'https://i.ytimg.com/vi/ku0TYgR3NTw/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@ibaillanos'
    },
    {
      title: 'ME GASTO 100.000 MONEDAS EN MINECRAFT!',
      channel: 'VEGETTA777',
      verified: true,
      stats: '2,8 M de visualizaciones • hace 4 años',
      duration: '35:40',
      thumb: 'https://i.ytimg.com/vi/RzAR_8-2EEs/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@vegetta777'
    },
    {
      title: 'Escondite con Pintura VS 10 Artistas Profesionales!',
      channel: 'TheWillyrex',
      verified: true,
      stats: '950 K visualizaciones • hace 1 año',
      duration: '21:05',
      thumb: 'https://i.ytimg.com/vi/JblW4OoLN6k/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@Willyrex'
    },
    {
      title: 'Would You Sit In Snakes For $10,000?',
      channel: 'MrBeast',
      verified: true,
      stats: '145 M de visualizaciones • hace 3 años',
      duration: '15:10',
      thumb: 'https://i.ytimg.com/vi/fMfipiV_17o/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@MrBeast'
    },
    {
      title: "World's Roundest Object!",
      channel: 'Veritasium',
      verified: true,
      stats: '29 M de visualizaciones • hace 7 años',
      duration: '8:42',
      thumb: 'https://i.ytimg.com/vi/ZMByI4s-D-Y/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@veritasium'
    },
    {
      title: 'LA VELADA DEL AÑO V - LA PELÍCULA',
      channel: 'Ibai',
      verified: true,
      stats: '6,1 M de visualizaciones • hace 4 meses',
      duration: '1:45:20',
      thumb: 'https://i.ytimg.com/vi/4of8JFbOyP4/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@ibaillanos'
    },
    {
      title: 'Abrimos CAJAS de LUJO (+25.000$)',
      channel: 'TheWillyrex',
      verified: true,
      stats: '1,4 M de visualizaciones • hace 8 meses',
      duration: '16:48',
      thumb: 'https://i.ytimg.com/vi/w-MbMozuexA/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@Willyrex'
    },
    {
      title: 'Last To Leave Circle Wins $500,000',
      channel: 'MrBeast',
      verified: true,
      stats: '310 M de visualizaciones • hace 2 años',
      duration: '19:22',
      thumb: 'https://i.ytimg.com/vi/zxYjTTXc-J8/maxresdefault.jpg',
      avatar: 'https://unavatar.io/youtube/@MrBeast'
    }
  ];

  // Chips oficiales de Inicio (Screenshot 1)
  const HOME_CHIPS = [
    'Todo', 'Pódcasts', 'Videojuegos', 'Noticias', 'Cartera de valores',
    'Precios', 'Inteligencia', 'En directo', 'Programación', 'Juego de naipes',
    'Hardware informático', 'Juegos de acción y aventuras'
  ];

  // Chips oficiales de Búsqueda (Screenshot 2)
  const SEARCH_CHIPS = [
    'Todo', 'Shorts', 'No visto', 'Vídeos', 'Subidas recientes', 'En directo'
  ];

  // ========================================================
  // PERSISTENCIA
  // ========================================================
  let currentSearchItems = loadSavedItems();
  let draftItems = [];

  function compressImage(fileOrDataUrl, maxWidth = 320, maxHeight = 320, quality = 0.82) {
    return new Promise((resolve) => {
      const processImg = (src) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth || h > maxHeight) {
            const ratio = Math.min(maxWidth / w, maxHeight / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(src);
        img.src = src;
      };

      if (typeof fileOrDataUrl === 'string') {
        processImg(fileOrDataUrl);
      } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => processImg(e.target.result);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(fileOrDataUrl);
      } else {
        resolve('');
      }
    });
  }

  function loadSavedItems() {
    try {
      const keys = ['yt_fake_items_v4', 'yt_fake_items_backup', 'yt_fake_items_v3', 'yt_fake_items_v2', 'yt_fake_items'];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error loading items:', e);
    }
    return [];
  }

  function saveItems(items) {
    try {
      const serialized = JSON.stringify(items);
      localStorage.setItem('yt_fake_items_v4', serialized);
      localStorage.setItem('yt_fake_items_backup', serialized);
    } catch (e) {
      console.error('Error saving items to localStorage:', e);
      alert('Aviso: El almacenamiento local está lleno. Intenta usar imágenes más ligeras o enlaces directos.');
    }
  }

  // ========================================================
  // ALGORITMO OFICIAL DE EXTRACCIÓN DE AVATAR DE YOUTUBE (@TAG)
  // ========================================================
  async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function extractYouTubeAvatar(tag) {
    const clean = tag.replace(/^@+/, '').trim();
    if (!clean) throw new Error('Ingresa un tag válido');

    try {
      const unavatarUrl = `https://unavatar.io/youtube/@${encodeURIComponent(clean)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(unavatarUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 500 && blob.type.includes('image')) {
          const base64 = await blobToBase64(blob);
          return { tag: `@${clean}`, avatarUrl: base64 };
        }
      }
    } catch (e) {
      console.warn('Unavatar.io fallback:', e);
    }

    const instances = [
      `https://inv.nadeko.net/api/v1/channels/@${encodeURIComponent(clean)}`,
      `https://yewtu.be/api/v1/channels/@${encodeURIComponent(clean)}`
    ];

    for (const inst of instances) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const r = await fetch(inst, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (r.ok) {
          const data = await r.json();
          if (data.authorThumbnails && data.authorThumbnails.length > 0) {
            let imgUrl = data.authorThumbnails[data.authorThumbnails.length - 1].url;
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            const imgRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(imgUrl)}`);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const base64 = await blobToBase64(blob);
              return { tag: `@${clean}`, avatarUrl: base64 };
            }
          }
        }
      } catch (e) {
        console.warn('Invidious fallback:', e);
      }
    }

    try {
      const targetUrl = `https://www.youtube.com/@${encodeURIComponent(clean)}`;
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
      if (r.ok) {
        const data = await r.json();
        const pageHtml = data.contents || '';
        const match = pageHtml.match(/property="og:image"\s+content="([^"]+)"/) ||
                      pageHtml.match(/og:image"\s+content="([^"]+)"/) ||
                      pageHtml.match(/https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+/);
        if (match) {
          let directUrl = match[1] || match[0];
          if (directUrl.includes('=s')) {
            directUrl = directUrl.replace(/=s\d+[^"]*/, '=s800-c-k-c0x00ffffff-no-rj');
          }
          const imgRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`);
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            const base64 = await blobToBase64(blob);
            return { tag: `@${clean}`, avatarUrl: base64 };
          }
        }
      }
    } catch (e) {
      console.warn('AllOrigins fallback:', e);
    }

    return { tag: `@${clean}`, avatarUrl: `https://unavatar.io/youtube/@${encodeURIComponent(clean)}` };
  }

  // ========================================================
  // EXTRACCIÓN AUTOMÁTICA DE VÍDEO DE YOUTUBE
  // ========================================================
  function extractYouTubeVideoId(url) {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
  }

  async function fetchVideoDetailsFromUrl(videoUrl) {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) return null;

    const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    let title = '';
    let author = '';

    try {
      const oembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (oembedRes.ok) {
        const odata = await oembedRes.json();
        if (odata.title) title = odata.title;
        if (odata.author_name) author = odata.author_name;
      }
    } catch (e) {
      console.warn('oEmbed fetch error:', e);
    }

    return { videoId, thumb, title, author };
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  // ========================================================
  // GENERACIÓN DE LA MATRIZ DE INICIO
  // REGLAS ESTRICTAS DE POSICIONAMIENTO DE ETERNODEV:
  // - 1 vídeo en Fila 1 (Row 0), 1 en Fila 2, 1 en Fila 3, 1 en Fila 4.
  // - Dos bloques de distancia en diagonal; NUNCA uno debajo del otro.
  // - Patrones válidos en cuadrícula de 3 columnas (0, 1, 2):
  //   P1: [Fila 1: Col 0 (0), Fila 2: Col 2 (5), Fila 3: Col 1 (7), Fila 4: Col 0 (9)]
  //   P2: [Fila 1: Col 0 (0), Fila 2: Col 2 (5), Fila 3: Col 1 (7), Fila 4: Col 2 (11)]
  //   P3: [Fila 1: Col 2 (2), Fila 2: Col 0 (3), Fila 3: Col 1 (7), Fila 4: Col 2 (11)]
  //   P4: [Fila 1: Col 2 (2), Fila 2: Col 0 (3), Fila 3: Col 1 (7), Fila 4: Col 0 (9)]
  // ========================================================
  function generateFeedVideos() {
    const patterns = [
      [0, 5, 7, 9],
      [0, 5, 7, 11],
      [2, 3, 7, 11],
      [2, 3, 7, 9]
    ];
    const chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];

    const shuffledEterno = shuffleArray(ETERNO_VIDEOS);
    const shuffledOthers = shuffleArray(OTHER_VIDEOS);

    const totalCount = ETERNO_VIDEOS.length + OTHER_VIDEOS.length; // 4 + 15 = 19
    const grid = new Array(totalCount);

    // Asignar los 4 vídeos de EternoDev en las 4 filas garantizadas
    chosenPattern.forEach((gridIndex, i) => {
      grid[gridIndex] = shuffledEterno[i];
    });

    // Rellenar las demás posiciones con los vídeos externos barajados
    let otherIdx = 0;
    for (let i = 0; i < totalCount; i++) {
      if (!grid[i]) {
        grid[i] = shuffledOthers[otherIdx++];
      }
    }

    return grid;
  }

  // Feed generado para la sesión actual
  const randomizedHomeVideos = generateFeedVideos();
  const INITIAL_FEED_LIMIT = 18;
  let currentFeedLimit = INITIAL_FEED_LIMIT;

  // ========================================================
  // ELEMENTOS DEL DOM
  // ========================================================
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const btnToggleGuide = document.getElementById('btn-toggle-guide');
  const guideSidebar = document.getElementById('guide-sidebar');
  const guideMobileBackdrop = document.getElementById('guide-mobile-backdrop');
  const ytHomeLogo = document.getElementById('yt-home-logo');
  const guideHomeBtn = document.getElementById('guide-home-btn');
  const chipsScrollRow = document.getElementById('chips-scroll-row');
  const searchTopTools = document.getElementById('search-top-tools');
  const homeView = document.getElementById('home-view');
  const searchView = document.getElementById('search-view');
  const homeVideoGrid = document.getElementById('home-video-grid');
  const homeShowMoreWrap = document.getElementById('home-show-more-wrap');
  const btnShowMore = document.getElementById('btn-show-more');
  const searchResultsFlow = document.getElementById('search-results-flow');

  // Menú de usuario y popover
  const btnUserMenu = document.getElementById('btn-user-menu');
  const userPopover = document.getElementById('user-popover');
  const menuItemTheme = document.getElementById('menu-item-theme');
  const themeToggleLabel = document.getElementById('theme-toggle-label');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const menuItemFullscreen = document.getElementById('menu-item-fullscreen');
  const menuItemEditor = document.getElementById('menu-item-editor');
  const menuItemUserProfile = document.getElementById('menu-item-user-profile');
  const btnEditUserIcon = document.getElementById('btn-edit-user-icon');

  // Modal Editor de Búsquedas
  const editorModal = document.getElementById('editor-modal');
  const btnCloseEditor = document.getElementById('btn-close-editor');
  const btnSaveEditor = document.getElementById('btn-save-editor');
  const btnAddVideoCard = document.getElementById('btn-add-video-card');
  const btnAddChannelCard = document.getElementById('btn-add-channel-card');
  const editorCardsList = document.getElementById('editor-cards-list');
  const btnExportYt = document.getElementById('btn-export-yt');
  const btnImportYt = document.getElementById('btn-import-yt');
  const fileImportYt = document.getElementById('file-import-yt');

  // Modal Personalizar Usuario
  const userProfileModal = document.getElementById('user-profile-modal');
  const btnCloseUserModal = document.getElementById('btn-close-user-modal');
  const btnSaveUserProfile = document.getElementById('btn-save-user-profile');
  const userEditNameInp = document.getElementById('user-edit-name-inp');
  const userEditTagInp = document.getElementById('user-edit-tag-inp');
  const btnUserFetchTag = document.getElementById('btn-user-fetch-tag');
  const userFileInput = document.getElementById('user-file-input');
  const btnUserPickFile = document.getElementById('btn-user-pick-file');
  const userEditAvatarPreview = document.getElementById('user-edit-avatar-preview');
  const btnUserResetCircle = document.getElementById('btn-user-reset-circle');

  // ========================================================
  // INICIALIZACIÓN
  // ========================================================
  function init() {
    initUserProfile();
    renderHomeVideos();
    renderChips('home');
    setupEventListeners();
    setupTheme();
  }

  // ========================================================
  // PERFIL DE USUARIO (PERSONALIZACIÓN Y PERSISTENCIA)
  // ========================================================
  let currentUserProfile = loadUserProfile();
  let draftUserProfile = { ...currentUserProfile };

  function loadUserProfile() {
    try {
      const raw = localStorage.getItem('yt_fake_user_profile') || localStorage.getItem('yt_fake_user_profile_backup');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error loading user profile:', e);
    }
    return { name: 'Usuario', handle: '@usuario_editfun', avatarUrl: null };
  }

  function saveUserProfile(profile) {
    try {
      const serialized = JSON.stringify(profile);
      localStorage.setItem('yt_fake_user_profile', serialized);
      localStorage.setItem('yt_fake_user_profile_backup', serialized);
    } catch (e) {
      console.error('Error saving user profile:', e);
      alert('Aviso: No se pudo guardar el avatar del usuario por límite de almacenamiento.');
    }
  }

  function applyUserProfile(profile) {
    currentUserProfile = profile;
    const mastheadAvatar = document.getElementById('masthead-user-avatar');
    const popoverAvatar = document.getElementById('popover-user-avatar');
    const popoverName = document.getElementById('popover-user-name');
    const popoverHandle = document.getElementById('popover-user-handle');

    if (popoverName) popoverName.textContent = profile.name || 'Usuario';
    if (popoverHandle) popoverHandle.textContent = profile.handle || '@usuario';

    [mastheadAvatar, popoverAvatar].forEach(el => {
      if (!el) return;
      if (profile.avatarUrl) {
        el.innerHTML = `<img src="${profile.avatarUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;" alt="${escapeHtml(profile.name)}">`;
        el.style.backgroundColor = 'transparent';
        el.style.border = 'none';
      } else {
        el.innerHTML = '';
        el.style.backgroundColor = '#ffffff';
        el.style.border = '1px solid rgba(0, 0, 0, 0.2)';
      }
    });
  }

  function initUserProfile() {
    applyUserProfile(currentUserProfile);
  }

  function openUserProfileModal() {
    draftUserProfile = { ...currentUserProfile };
    if (userEditNameInp) userEditNameInp.value = draftUserProfile.name || 'Usuario';
    if (userEditTagInp) userEditTagInp.value = draftUserProfile.handle || '';
    updateUserPreview();
    if (userProfileModal) userProfileModal.classList.remove('hidden');
    if (userPopover) userPopover.classList.add('hidden');
  }

  function closeUserProfileModal() {
    if (userProfileModal) userProfileModal.classList.add('hidden');
  }

  function updateUserPreview() {
    if (!userEditAvatarPreview) return;
    if (draftUserProfile.avatarUrl) {
      userEditAvatarPreview.innerHTML = `<img src="${draftUserProfile.avatarUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
      userEditAvatarPreview.style.backgroundColor = 'transparent';
      userEditAvatarPreview.style.border = 'none';
    } else {
      userEditAvatarPreview.innerHTML = '';
      userEditAvatarPreview.style.backgroundColor = '#ffffff';
      userEditAvatarPreview.style.border = '1px solid rgba(0, 0, 0, 0.2)';
    }
  }

  // ========================================================
  // RENDER: PANTALLA PRINCIPAL (HOME FEED)
  // ========================================================
  function renderHomeVideos() {
    homeVideoGrid.innerHTML = '';
    const slice = randomizedHomeVideos.slice(0, currentFeedLimit);

    slice.forEach((video, index) => {
      // Inserción de secciones con separadores limpios (estilo estanterías de YouTube)
      if (index === 6) {
        const shelf = document.createElement('div');
        shelf.className = 'feed-shelf-header';
        shelf.innerHTML = `
          <div class="feed-shelf-title-wrap">
            <h2 class="feed-shelf-title">Vídeos en tendencia</h2>
          </div>
        `;
        homeVideoGrid.appendChild(shelf);
      } else if (index === 12) {
        const shelf = document.createElement('div');
        shelf.className = 'feed-shelf-header';
        shelf.innerHTML = `
          <div class="feed-shelf-title-wrap">
            <h2 class="feed-shelf-title">Últimos vídeos</h2>
          </div>
        `;
        homeVideoGrid.appendChild(shelf);
      }

      const card = document.createElement('article');
      card.className = 'video-card';

      const fallbackUrl = video.thumb.includes('maxresdefault') 
        ? video.thumb.replace('maxresdefault', 'hqdefault') 
        : video.thumb;

      card.innerHTML = `
        <div class="video-thumb-wrap">
          <img class="video-thumb-img" src="${video.thumb}" alt="${escapeHtml(video.title)}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';">
          <span class="video-duration-badge">${video.duration}</span>
        </div>
        <div class="video-info-row">
          <img class="video-channel-avatar" src="${video.avatar}" alt="${escapeHtml(video.channel)}" loading="lazy">
          <div class="video-meta-col">
            <h3 class="video-title" title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</h3>
            <div class="video-meta-inline">
              <span class="video-channel-name">${escapeHtml(video.channel)}</span>
              ${video.verified ? `
                <svg class="verified-badge-svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" title="Verificado">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1 1.4-1.4 2.8 2.7 7.4-7.4 1.4 1.4-8.8 8.8z"/>
                </svg>
              ` : ''}
              <span class="video-meta-dot">•</span>
              <span class="video-stats-inline">${escapeHtml(video.stats)}</span>
            </div>
          </div>
          <button class="video-card-menu-btn" title="Acciones">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      `;

      homeVideoGrid.appendChild(card);
    });

    // Control del botón "Mostrar más"
    if (homeShowMoreWrap && btnShowMore) {
      if (currentFeedLimit < randomizedHomeVideos.length) {
        homeShowMoreWrap.style.display = 'flex';
      } else {
        homeShowMoreWrap.style.display = 'none';
      }
    }
  }

  if (btnShowMore) {
    btnShowMore.addEventListener('click', () => {
      currentFeedLimit = randomizedHomeVideos.length;
      renderHomeVideos();
    });
  }

  // ========================================================
  // RENDER: BARRA DE FILTROS (CHIPS)
  // ========================================================
  function renderChips(mode = 'home') {
    chipsScrollRow.innerHTML = '';
    const list = mode === 'search' ? SEARCH_CHIPS : HOME_CHIPS;

    list.forEach((name, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${idx === 0 ? 'active' : ''}`;
      btn.textContent = name;
      btn.addEventListener('click', () => {
        chipsScrollRow.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      chipsScrollRow.appendChild(btn);
    });

    if (mode === 'search') {
      searchTopTools.classList.remove('hidden');
    } else {
      searchTopTools.classList.add('hidden');
    }
  }

  // ========================================================
  // RENDER: RESULTADOS DE BÚSQUEDA DINÁMICOS
  // ========================================================
  function renderSearchResults() {
    searchResultsFlow.innerHTML = '';

    if (!currentSearchItems || currentSearchItems.length === 0) {
      searchResultsFlow.innerHTML = `
        <div class="empty-search-state">
          <svg class="empty-search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="m20.87 20.17-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
          </svg>
          <div class="empty-search-title">No aparecen ni vídeos ni canales en la búsqueda</div>
          <div class="empty-search-desc">Abre el menú de usuario arriba a la derecha y pulsa en "Personalizar búsquedas" para añadir los vídeos que quieras simular.</div>
        </div>
      `;
      return;
    }

    currentSearchItems.forEach(item => {
      if (item.type === 'channel') {
        const chCard = document.createElement('div');
        chCard.className = 'channel-card';
        chCard.innerHTML = `
          <div class="channel-card-avatar-wrap">
            <img src="${item.avatar || '/youtubefake/assets/img/eternodev_channel.jpg'}" alt="${escapeHtml(item.name)}" class="channel-card-avatar">
          </div>
          <div class="channel-card-info">
            <div class="channel-card-title-row">
              <h2 class="channel-card-name">${escapeHtml(item.name || 'Canal')}</h2>
              ${item.verified !== false ? `
                <svg class="verified-badge-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" title="Verificado">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1 1.4-1.4 2.8 2.7 7.4-7.4 1.4 1.4-8.8 8.8z"/>
                </svg>
              ` : ''}
            </div>
            <div class="channel-card-meta">${item.tag ? escapeHtml(item.tag) + ' • ' : ''}${escapeHtml(item.subs || '0 suscriptores')}</div>
            ${item.desc ? `<div class="channel-card-desc">${escapeHtml(item.desc)}</div>` : ''}
          </div>
          <div class="channel-card-action">
            <button type="button" class="btn-subscribe">Suscribirse</button>
          </div>
        `;

        const subBtn = chCard.querySelector('.btn-subscribe');
        subBtn.addEventListener('click', () => {
          if (subBtn.classList.contains('subscribed')) {
            subBtn.classList.remove('subscribed');
            subBtn.textContent = 'Suscribirse';
          } else {
            subBtn.classList.add('subscribed');
            subBtn.textContent = 'Suscrito';
          }
        });

        searchResultsFlow.appendChild(chCard);

      } else if (item.type === 'video') {
        const vidItem = document.createElement('article');
        vidItem.className = 'search-video-item';

        vidItem.innerHTML = `
          <div class="search-thumb-box">
            <img class="search-thumb-img" src="${item.thumb || 'https://i.ytimg.com/vi/wjoGjOxCTCQ/maxresdefault.jpg'}" alt="${escapeHtml(item.title)}">
            <span class="video-duration-badge">${escapeHtml(item.duration || '0:00')}</span>
          </div>
          <div class="search-info-col">
            <h3 class="search-video-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
            <div class="search-video-stats">${escapeHtml(item.stats || '')}</div>
            <div class="search-channel-badge-row">
              <img src="${item.avatar || '/youtubefake/assets/img/eternodev_channel.jpg'}" alt="Canal" class="search-small-avatar">
              <span class="search-channel-title">
                ${escapeHtml(item.channel || 'Canal')}
                <svg class="verified-badge-svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1 1.4-1.4 2.8 2.7 7.4-7.4 1.4 1.4-8.8 8.8z"/>
                </svg>
              </span>
            </div>
            ${item.snippet ? `<p class="search-video-desc">${escapeHtml(item.snippet)}</p>` : ''}
            ${item.summary ? `
              <div class="search-summary-box">
                <div style="display:flex; align-items:center; gap:6px; min-width:0; overflow:hidden;">
                  <span style="color:var(--yt-text-primary); font-weight:600; flex-shrink:0;">✦ Resumen</span>
                  <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.summary)}</span>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="flex-shrink:0;">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </div>
            ` : ''}
          </div>
          <button class="video-card-menu-btn" title="Acciones" style="margin-left:auto;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        `;

        searchResultsFlow.appendChild(vidItem);
      }
    });
  }

  // ========================================================
  // CONTROL DE VISTAS (INICIO vs BÚSQUEDA)
  // ========================================================
  function showHomeView() {
    homeView.classList.remove('hidden');
    searchView.classList.add('hidden');
    renderChips('home');
    guideHomeBtn.classList.add('active');
    searchInput.value = '';
    btnClearSearch.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showSearchView(query) {
    homeView.classList.add('hidden');
    searchView.classList.remove('hidden');
    renderChips('search');
    guideHomeBtn.classList.remove('active');
    renderSearchResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function executeSearch(query) {
    const qClean = (query || '').trim();
    searchInput.value = qClean;
    if (qClean) {
      btnClearSearch.classList.remove('hidden');
    }
    showSearchView(qClean);
  }

  // ========================================================
  // MODAL: PERSONALIZAR BÚSQUEDAS (DRAG & DROP LIMPIO)
  // ========================================================
  function openEditorModal() {
    draftItems = JSON.parse(JSON.stringify(currentSearchItems));
    renderEditorCardsList();
    editorModal.classList.remove('hidden');
    userPopover.classList.add('hidden');
  }

  function closeEditorModal() {
    editorModal.classList.add('hidden');
  }

  function renderEditorCardsList() {
    editorCardsList.innerHTML = '';

    if (draftItems.length === 0) {
      editorCardsList.innerHTML = '<div style="color:#71717a; font-size:12px; text-align:center; padding:24px;">No hay ningún vídeo o canal configurado.<br>Pulsa en los botones de arriba para añadir los vídeos que quieras simular en las búsquedas.</div>';
      return;
    }

    draftItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'editor-item-card';
      card.draggable = true;
      card.dataset.index = index;

      const isVideo = item.type === 'video';

      if (isVideo) {
        if (!item.views && !item.published && item.stats) {
          if (item.stats.includes('•')) {
            const parts = item.stats.split('•');
            item.views = parts[0].trim();
            item.published = parts.slice(1).join('•').trim();
          } else {
            item.views = item.stats;
            item.published = '';
          }
        }
      }

      card.innerHTML = `
        <div class="editor-item-top">
          <span class="item-drag-handle" title="Arrastrar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </span>
          <span class="item-type-pill ${isVideo ? 'pill-video' : 'pill-channel'}">${isVideo ? 'Vídeo' : 'Canal'}</span>
          <div class="item-top-actions">
            <button type="button" class="btn-item-tool btn-item-delete" title="Eliminar">✕</button>
          </div>
        </div>

        <div class="editor-item-fields">
          ${isVideo ? `
            <div class="form-group">
              <label class="form-label">Título</label>
              <input type="text" class="form-input field-video-title" value="${escapeHtml(item.title || '')}" placeholder="Título">
            </div>

            <div class="form-group">
              <label class="form-label">Portada</label>
              <div class="editor-item-row">
                <img src="${item.thumb || ''}" class="thumb-preview-box preview-thumb" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22360%22%20height%3D%22202%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%2327272a%22%2F%3E%3C%2Fsvg%3E'">
                <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                  <input type="text" class="form-input field-video-thumb-url" value="${escapeHtml(item.thumb || '')}" placeholder="https://youtube.com/...">
                  <div style="display:flex; gap:6px;">
                    <input type="file" accept="image/*" class="file-video-thumb" style="display:none;">
                    <button type="button" class="file-picker-btn btn-pick-thumb">Subir</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-row" style="display:flex; gap:8px; align-items:flex-end;">
              <div class="form-group" style="flex:1;">
                <label class="form-label">Duración</label>
                <input type="text" class="form-input field-video-duration" value="${escapeHtml(item.duration || '')}" placeholder="10:43">
              </div>
              <div class="form-group" style="flex:1.4;">
                <label class="form-label">Visualizaciones</label>
                <input type="text" class="form-input field-video-views" value="${escapeHtml(item.views || '')}" placeholder="100 K visualizaciones">
              </div>
              <div style="padding-bottom:10px; font-weight:700; color:var(--yt-text-secondary); font-size:16px; user-select:none;">•</div>
              <div class="form-group" style="flex:1.1;">
                <label class="form-label">Fecha / Tiempo</label>
                <input type="text" class="form-input field-video-date" value="${escapeHtml(item.published || '')}" placeholder="hace 1 año">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Canal</label>
              <input type="text" class="form-input field-video-channel" value="${escapeHtml(item.channel || '')}" placeholder="Nombre del canal">
            </div>

            <div class="form-group">
              <label class="form-label">Icono del Canal</label>
              <div class="editor-item-row">
                <img src="${item.avatar || ''}" class="avatar-preview-box preview-video-avatar" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2236%22%20height%3D%2236%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%2218%22%20r%3D%2218%22%20fill%3D%22%23ffffff%22%2F%3E%3C%2Fsvg%3E'">
                <div style="flex:1; display:flex; gap:6px;">
                  <input type="text" class="form-input field-video-avatar-tag" value="${escapeHtml(item.avatarTag || '')}" placeholder="@canal" style="flex:1;">
                  <button type="button" class="btn-tag-fetch btn-fetch-video-avatar">Obtener</button>
                  <input type="file" accept="image/*" class="file-video-avatar" style="display:none;">
                  <button type="button" class="file-picker-btn btn-pick-video-avatar">Subir</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <input type="text" class="form-input field-video-snippet" value="${escapeHtml(item.snippet || '')}" placeholder="Descripción del vídeo">
            </div>
          ` : `
            <div class="form-row">
              <div class="form-group" style="flex:2;">
                <label class="form-label">Canal</label>
                <input type="text" class="form-input field-channel-name" value="${escapeHtml(item.name || '')}" placeholder="Nombre del canal">
              </div>
              <div class="form-group" style="flex:1;">
                <label class="form-label">Suscriptores</label>
                <input type="text" class="form-input field-channel-subs" value="${escapeHtml(item.subs || '')}" placeholder="500 K suscriptores">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Icono del Canal</label>
              <div class="editor-item-row">
                <img src="${item.avatar || ''}" class="avatar-preview-box preview-avatar" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2236%22%20height%3D%2236%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%2218%22%20r%3D%2218%22%20fill%3D%22%23ffffff%22%2F%3E%3C%2Fsvg%3E'">
                <div style="flex:1; display:flex; gap:6px;">
                  <input type="text" class="form-input field-channel-tag" value="${escapeHtml(item.tag || '')}" placeholder="@canal" style="flex:1;">
                  <button type="button" class="btn-tag-fetch btn-fetch-avatar">Obtener</button>
                  <input type="file" accept="image/*" class="file-channel-avatar" style="display:none;">
                  <button type="button" class="file-picker-btn btn-pick-channel-avatar">Subir</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <input type="text" class="form-input field-channel-desc" value="${escapeHtml(item.desc || '')}" placeholder="Descripción del canal">
            </div>
          `}
        </div>
      `;

      // Evento de eliminar
      const btnDel = card.querySelector('.btn-item-delete');
      if (btnDel) {
        btnDel.addEventListener('click', () => {
          draftItems.splice(index, 1);
          renderEditorCardsList();
        });
      }

      // Eventos de vídeo
      if (isVideo) {
        const titleInp = card.querySelector('.field-video-title');
        titleInp.addEventListener('input', () => { item.title = titleInp.value; });

        const durInp = card.querySelector('.field-video-duration');
        durInp.addEventListener('input', () => { item.duration = durInp.value; });

        const viewsInp = card.querySelector('.field-video-views');
        const dateInp = card.querySelector('.field-video-date');
        function syncStats() {
          item.views = viewsInp.value.trim();
          item.published = dateInp.value.trim();
          if (item.views && item.published) {
            item.stats = `${item.views} • ${item.published}`;
          } else {
            item.stats = item.views || item.published || '';
          }
        }
        viewsInp.addEventListener('input', syncStats);
        dateInp.addEventListener('input', syncStats);

        const channelInp = card.querySelector('.field-video-channel');
        channelInp.addEventListener('input', () => { item.channel = channelInp.value; });

        const snippetInp = card.querySelector('.field-video-snippet');
        if (snippetInp) {
          snippetInp.addEventListener('input', () => { item.snippet = snippetInp.value; });
        }

        const thumbInp = card.querySelector('.field-video-thumb-url');
        const previewThumb = card.querySelector('.preview-thumb');
        const fileInp = card.querySelector('.file-video-thumb');
        const btnPick = card.querySelector('.btn-pick-thumb');

        thumbInp.addEventListener('change', async () => {
          const val = thumbInp.value.trim();
          if (extractYouTubeVideoId(val)) {
            thumbInp.style.opacity = '0.6';
            const details = await fetchVideoDetailsFromUrl(val);
            thumbInp.style.opacity = '1';
            if (details) {
              item.thumb = details.thumb;
              thumbInp.value = details.thumb;
              previewThumb.src = details.thumb;
              if (!item.title && details.title) {
                item.title = details.title;
                titleInp.value = details.title;
              }
              if (!item.channel && details.author) {
                item.channel = details.author;
                channelInp.value = details.author;
              }
            }
          } else if (val) {
            item.thumb = val;
            previewThumb.src = val;
          }
        });

        btnPick.addEventListener('click', () => fileInp.click());
        fileInp.addEventListener('change', async () => {
          const file = fileInp.files[0];
          if (file) {
            btnPick.textContent = '...';
            const compressed = await compressImage(file, 640, 360, 0.82);
            item.thumb = compressed;
            previewThumb.src = compressed;
            thumbInp.value = compressed;
            btnPick.textContent = 'Subir';
          }
        });

        const avatarTagInp = card.querySelector('.field-video-avatar-tag');
        const btnFetchVidAvatar = card.querySelector('.btn-fetch-video-avatar');
        const previewVidAvatar = card.querySelector('.preview-video-avatar');
        const fileVidAvatar = card.querySelector('.file-video-avatar');
        const btnPickVidAvatar = card.querySelector('.btn-pick-video-avatar');

        async function fetchVidAvatarLogic() {
          const tag = avatarTagInp.value.trim();
          if (!tag) return;
          btnFetchVidAvatar.textContent = '...';
          btnFetchVidAvatar.disabled = true;
          try {
            const res = await extractYouTubeAvatar(tag);
            if (res && res.avatarUrl) {
              item.avatar = res.avatarUrl;
              previewVidAvatar.src = res.avatarUrl;
            }
          } catch (e) {
            console.warn(e);
          } finally {
            btnFetchVidAvatar.textContent = 'Obtener';
            btnFetchVidAvatar.disabled = false;
          }
        }

        btnFetchVidAvatar.addEventListener('click', fetchVidAvatarLogic);
        avatarTagInp.addEventListener('change', () => {
          item.avatarTag = avatarTagInp.value;
          fetchVidAvatarLogic();
        });

        btnPickVidAvatar.addEventListener('click', () => fileVidAvatar.click());
        fileVidAvatar.addEventListener('change', async () => {
          const file = fileVidAvatar.files[0];
          if (file) {
            btnPickVidAvatar.textContent = '...';
            const compressed = await compressImage(file, 160, 160, 0.85);
            item.avatar = compressed;
            previewVidAvatar.src = compressed;
            btnPickVidAvatar.textContent = 'Subir';
          }
        });

      } else {
        // Eventos de canal
        const nameInp = card.querySelector('.field-channel-name');
        nameInp.addEventListener('input', () => { item.name = nameInp.value; });

        const subsInp = card.querySelector('.field-channel-subs');
        subsInp.addEventListener('input', () => { item.subs = subsInp.value; });

        const descInp = card.querySelector('.field-channel-desc');
        descInp.addEventListener('input', () => { item.desc = descInp.value; });

        const tagInp = card.querySelector('.field-channel-tag');
        const btnFetch = card.querySelector('.btn-fetch-avatar');
        const previewAvatar = card.querySelector('.preview-avatar');
        const fileChAvatar = card.querySelector('.file-channel-avatar');
        const btnPickChAvatar = card.querySelector('.btn-pick-channel-avatar');

        async function fetchAvatarLogic() {
          const tag = tagInp.value.trim();
          if (!tag) return;
          btnFetch.textContent = '...';
          btnFetch.disabled = true;
          try {
            const res = await extractYouTubeAvatar(tag);
            if (res && res.avatarUrl) {
              item.avatar = res.avatarUrl;
              previewAvatar.src = res.avatarUrl;
            }
            if (!item.name) {
              const cleanName = tag.replace(/^@+/, '');
              item.name = cleanName;
              nameInp.value = cleanName;
            }
          } catch (err) {
            console.error(err);
          } finally {
            btnFetch.textContent = 'Obtener';
            btnFetch.disabled = false;
          }
        }

        btnFetch.addEventListener('click', fetchAvatarLogic);
        tagInp.addEventListener('change', () => {
          item.tag = tagInp.value;
          fetchAvatarLogic();
        });

        btnPickChAvatar.addEventListener('click', () => fileChAvatar.click());
        fileChAvatar.addEventListener('change', async () => {
          const file = fileChAvatar.files[0];
          if (file) {
            btnPickChAvatar.textContent = '...';
            const compressed = await compressImage(file, 180, 180, 0.85);
            item.avatar = compressed;
            previewAvatar.src = compressed;
            btnPickChAvatar.textContent = 'Subir';
          }
        });
      }

      // Drag & Drop HTML5
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        editorCardsList.querySelectorAll('.editor-item-card').forEach(c => c.classList.remove('drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const toIdx = index;
        if (!isNaN(fromIdx) && fromIdx !== toIdx) {
          const moved = draftItems.splice(fromIdx, 1)[0];
          draftItems.splice(toIdx, 0, moved);
          renderEditorCardsList();
        }
      });

      editorCardsList.appendChild(card);
    });
  }

  // ========================================================
  // EVENT LISTENERS GENERALES
  // ========================================================
  function setupEventListeners() {
    ytHomeLogo.addEventListener('click', (e) => {
      e.preventDefault();
      showHomeView();
    });

    guideHomeBtn.addEventListener('click', () => {
      showHomeView();
    });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch(searchInput.value);
    });

    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      btnClearSearch.classList.add('hidden');
      searchInput.focus();
    });

    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim().length > 0) {
        btnClearSearch.classList.remove('hidden');
      } else {
        btnClearSearch.classList.add('hidden');
      }
    });

    btnToggleGuide.addEventListener('click', () => {
      if (window.innerWidth <= 960) {
        guideSidebar.classList.toggle('mobile-open');
        if (guideMobileBackdrop) guideMobileBackdrop.classList.toggle('hidden');
      } else {
        guideSidebar.classList.toggle('collapsed');
      }
    });

    if (guideMobileBackdrop) {
      guideMobileBackdrop.addEventListener('click', () => {
        guideSidebar.classList.remove('mobile-open');
        guideMobileBackdrop.classList.add('hidden');
      });
    }

    guideSidebar.querySelectorAll('.guide-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 960) {
          guideSidebar.classList.remove('mobile-open');
          if (guideMobileBackdrop) guideMobileBackdrop.classList.add('hidden');
        }
      });
    });

    btnUserMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      userPopover.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!userPopover.contains(e.target) && e.target !== btnUserMenu) {
        userPopover.classList.add('hidden');
      }
    });

    // Editor de Búsquedas Modal
    menuItemEditor.addEventListener('click', openEditorModal);
    btnCloseEditor.addEventListener('click', closeEditorModal);
    editorModal.addEventListener('click', (e) => {
      if (e.target === editorModal) closeEditorModal();
    });

    btnAddVideoCard.addEventListener('click', () => {
      draftItems.push({
        id: 'vid_' + Date.now(),
        type: 'video',
        title: '',
        duration: '',
        views: '',
        published: '',
        stats: '',
        channel: '',
        avatar: '',
        thumb: ''
      });
      renderEditorCardsList();
      editorCardsList.scrollTop = editorCardsList.scrollHeight;
    });

    btnAddChannelCard.addEventListener('click', () => {
      draftItems.push({
        id: 'ch_' + Date.now(),
        type: 'channel',
        name: '',
        tag: '',
        subs: '',
        desc: '',
        avatar: '',
        verified: true
      });
      renderEditorCardsList();
      editorCardsList.scrollTop = editorCardsList.scrollHeight;
    });

    // Exportar configuración .yt
    if (btnExportYt) {
      btnExportYt.addEventListener('click', () => {
        const payload = JSON.stringify(draftItems, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'youtube_search_backup.yt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Importar configuración .yt
    if (btnImportYt && fileImportYt) {
      btnImportYt.addEventListener('click', () => {
        fileImportYt.click();
      });

      fileImportYt.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target.result);
            if (Array.isArray(data)) {
              draftItems = data;
              renderEditorCardsList();
            } else {
              alert('El archivo no contiene un formato de búsqueda válido.');
            }
          } catch (err) {
            console.error(err);
            alert('Error al leer el archivo .yt o .json');
          }
          fileImportYt.value = '';
        };
        reader.readAsText(file);
      });
    }

    btnSaveEditor.addEventListener('click', () => {
      currentSearchItems = JSON.parse(JSON.stringify(draftItems));
      saveItems(currentSearchItems);
      closeEditorModal();

      if (!searchView.classList.contains('hidden')) {
        renderSearchResults();
      }
    });

    // Modal Perfil de Usuario
    if (btnEditUserIcon) {
      btnEditUserIcon.addEventListener('click', openUserProfileModal);
    }

    if (menuItemUserProfile) {
      menuItemUserProfile.addEventListener('click', () => {
        userPopover.classList.add('hidden');
        openUserProfileModal();
      });
    }

    if (btnCloseUserModal) {
      btnCloseUserModal.addEventListener('click', closeUserProfileModal);
    }

    if (userProfileModal) {
      userProfileModal.addEventListener('click', (e) => {
        if (e.target === userProfileModal) closeUserProfileModal();
      });
    }

    if (btnUserFetchTag && userEditTagInp) {
      btnUserFetchTag.addEventListener('click', async () => {
        const tag = userEditTagInp.value.trim();
        if (!tag) return;
        btnUserFetchTag.textContent = '...';
        btnUserFetchTag.disabled = true;
        try {
          const res = await extractYouTubeAvatar(tag);
          if (res && res.avatarUrl) {
            draftUserProfile.avatarUrl = res.avatarUrl;
            if (!userEditNameInp.value.trim() || userEditNameInp.value === 'Usuario') {
              const clean = tag.replace(/^@+/, '');
              userEditNameInp.value = clean;
              draftUserProfile.name = clean;
            }
            updateUserPreview();
          }
        } catch (err) {
          console.warn('Error fetching user avatar:', err);
        } finally {
          btnUserFetchTag.textContent = 'Obtener';
          btnUserFetchTag.disabled = false;
        }
      });
    }

    if (btnUserPickFile && userFileInput) {
      btnUserPickFile.addEventListener('click', () => userFileInput.click());
      userFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          btnUserPickFile.textContent = '...';
          const compressed = await compressImage(file, 180, 180, 0.85);
          draftUserProfile.avatarUrl = compressed;
          updateUserPreview();
          btnUserPickFile.textContent = 'Subir foto';
        }
      });
    }

    if (btnUserResetCircle) {
      btnUserResetCircle.addEventListener('click', () => {
        draftUserProfile.avatarUrl = null;
        updateUserPreview();
      });
    }

    if (btnSaveUserProfile) {
      btnSaveUserProfile.addEventListener('click', () => {
        draftUserProfile.name = userEditNameInp.value.trim() || 'Usuario';
        draftUserProfile.handle = userEditTagInp.value.trim() || '@usuario';
        saveUserProfile(draftUserProfile);
        applyUserProfile(draftUserProfile);
        closeUserProfileModal();
      });
    }

    menuItemFullscreen.addEventListener('click', () => {
      userPopover.classList.add('hidden');
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen().catch(err => {
          console.warn('Exit fullscreen error:', err);
        });
      }
    });

    menuItemTheme.addEventListener('click', toggleTheme);
  }

  // ========================================================
  // SISTEMA DE TEMAS (CLARO / OSCURO)
  // ========================================================
  function setupTheme() {
    const savedTheme = localStorage.getItem('yt_fake_theme') || 'dark';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      themeToggleLabel.textContent = 'Tema oscuro';
      themeIconSun.classList.add('hidden');
      themeIconMoon.classList.remove('hidden');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      themeToggleLabel.textContent = 'Tema claro';
      themeIconMoon.classList.add('hidden');
      themeIconSun.classList.remove('hidden');
    }
    localStorage.setItem('yt_fake_theme', theme);
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    applyTheme(isDark ? 'light' : 'dark');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  init();

})();
