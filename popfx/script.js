/* ========================================================
       ESTADO GLOBAL Y VARIABLES
       ======================================================== */
    const stage = document.getElementById('stage');
    const controlPanel = document.getElementById('control-panel');

    const MAX_STAGE_ELEMENTS = 500;

    // Inserción segura en el DOM con límite FIFO de 500 elementos
    function appendToStage(elem) {
      while (stage.childElementCount >= MAX_STAGE_ELEMENTS) {
        const oldest = stage.firstElementChild;
        if (oldest) {
          oldest.remove();
        } else {
          break;
        }
      }
      stage.appendChild(elem);
    }

    let imagesList = []; // Array de DataURLs o URLs de imágenes
    let isPlaying = false;
    let currentMode = 'cascade'; // 'cascade' | 'popups' | 'rain'
    let soundEnabled = true;

    // Gestión de sonido personalizado y limitación de frecuencia (Anti-saturation / Petardeo)
    let customAudioBuffer = null;
    let customAudioFileName = '';
    let lastSoundPlayTime = 0;

    // Timers de motores
    let cascadeIntervalId = null;
    let popupIntervalId = null;
    let rainAnimationFrameId = null;
    let activeRainParticles = [];

    // Web Audio API para síntesis y reproducción de sonido con variación de pitch
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playPopSound(low = false) {
      if (!soundEnabled) return;
      const cascadeSound = document.getElementById('param-cascade-sound');
      const popupSound = document.getElementById('param-play-sound');
      const isEnabled = (currentMode === 'cascade' && cascadeSound && cascadeSound.checked) ||
                        (currentMode === 'popups' && popupSound && popupSound.checked) ||
                        (currentMode === 'rain' && soundEnabled);

      if (!isEnabled) return;

      const nowPerf = performance.now();
      // Protección contra petardeo/saturación de audio: mínimo 32ms entre disparos simultáneos
      if (nowPerf - lastSoundPlayTime < 32) return;
      lastSoundPlayTime = nowPerf;

      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        if (customAudioBuffer) {
          // Reproducir archivo de audio personalizado del usuario con sutil variación orgánica de pitch
          const src = ctx.createBufferSource();
          src.buffer = customAudioBuffer;
          // Variación leve de pitch entre 0.95x y 1.05x para que no suene robótico
          const pitchVariation = 0.95 + (Math.random() * 0.10);
          src.playbackRate.setValueAtTime(pitchVariation, ctx.currentTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.4, ctx.currentTime);

          src.connect(gain);
          gain.connect(ctx.destination);
          src.start(0);
        } else {
          // Sonido sintetizado por defecto
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          const now = ctx.currentTime;
          const freq = low ? 360 + Math.random() * 80 : 540 + Math.random() * 160;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.07);
        }
      } catch (err) {
        console.warn('AudioContext error:', err);
      }
    }

    function showToast(msg) {
      // Modo grabación: no mostrar carteles superpuestos
    }

    /* ========================================================
       PRESETS VECTORIALES INTEGRADOS (SVG DATA URIS)
       ======================================================== */
    
    // 1. Errores Windows XP / Python Freeze (Exacto al pantallazo adjunto)
    function createWindowsErrorSVG(title, msg, type = 'error') {
      const icon = type === 'error' 
        ? `<circle cx="28" cy="48" r="14" fill="#d32f2f"/><path d="M22 42 L34 54 M34 42 L22 54" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`
        : `<path d="M28 32 L44 60 L12 60 Z" fill="#fbc02d" stroke="#f57f17" stroke-width="2"/><text x="28" y="56" font-family="Arial Black" font-size="16" fill="#000" text-anchor="middle">!</text>`;

      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 120" width="340" height="120">
          <rect x="0" y="0" width="340" height="120" fill="#ece9d8" stroke="#0055ea" stroke-width="3" rx="4"/>
          <rect x="0" y="0" width="340" height="24" fill="#0a246a"/>
          <text x="8" y="16" font-family="'Tahoma', 'Segoe UI', sans-serif" font-size="11.5" font-weight="bold" fill="#ffffff">${title || 'Error'}</text>
          <!-- Close button -->
          <rect x="318" y="4" width="16" height="16" rx="2" fill="#d94b38" stroke="#ffffff" stroke-width="1"/>
          <text x="326" y="15" font-family="Arial" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">✕</text>
          <!-- Icon -->
          ${icon}
          <!-- Message -->
          <text x="54" y="48" font-family="'Tahoma', 'Segoe UI', sans-serif" font-size="11" fill="#000000" font-weight="500">${msg || 'cx_Freeze: Python error in main script.'}</text>
          <!-- OK Button -->
          <rect x="135" y="82" width="70" height="23" rx="3" fill="#ece9d8" stroke="#003c74" stroke-width="1"/>
          <text x="170" y="97" font-family="'Tahoma', 'Segoe UI', sans-serif" font-size="11" fill="#000000" text-anchor="middle" font-weight="500">Aceptar</text>
        </svg>
      `);
    }

    // 2. Billete de $100 Dólares
    function createMoneySVG(number) {
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" width="320" height="140">
          <defs>
            <linearGradient id="billGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#b8e3c4" />
              <stop offset="100%" stop-color="#8bb798" />
            </linearGradient>
            <filter id="billShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
            </filter>
          </defs>
          <rect x="5" y="5" width="310" height="130" rx="6" fill="url(#billGrad)" stroke="#235c36" stroke-width="4" filter="url(#billShadow)"/>
          <rect x="12" y="12" width="296" height="116" rx="4" fill="none" stroke="#235c36" stroke-width="1.5" stroke-dasharray="6,4"/>
          <!-- Oval central retrato -->
          <ellipse cx="160" cy="70" rx="38" ry="46" fill="#cbebd3" stroke="#235c36" stroke-width="2"/>
          <circle cx="160" cy="58" r="18" fill="#588566"/>
          <path d="M136 94 Q160 82 184 94" fill="#588566" stroke="#235c36" stroke-width="1.5"/>
          <!-- 100 en esquinas -->
          <text x="24" y="36" font-family="Arial Black, Impact, sans-serif" font-size="22" font-weight="900" fill="#1b4d2c">100</text>
          <text x="296" y="36" font-family="Arial Black, Impact, sans-serif" font-size="22" font-weight="900" fill="#1b4d2c" text-anchor="end">100</text>
          <text x="24" y="118" font-family="Arial Black, Impact, sans-serif" font-size="22" font-weight="900" fill="#1b4d2c">100</text>
          <text x="296" y="118" font-family="Arial Black, Impact, sans-serif" font-size="22" font-weight="900" fill="#1b4d2c" text-anchor="end">100</text>
          <!-- Texto central -->
          <text x="160" y="26" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#194829" text-anchor="middle" letter-spacing="2">THE UNITED STATES OF AMERICA</text>
          <text x="160" y="126" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#194829" text-anchor="middle" letter-spacing="1.5">ONE HUNDRED DOLLARS</text>
          <text x="68" y="75" font-family="monospace" font-size="10" font-weight="bold" fill="#1b4d2c">${number || 'B8429107'}</text>
        </svg>
      `);
    }

    // 3. Comentario de YouTube realista
    function createCommentSVG(author, text, likes) {
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 96" width="380" height="96">
          <rect x="0" y="0" width="380" height="96" rx="12" fill="#0f0f0f" stroke="#2b2b2b" stroke-width="1.5"/>
          <!-- Avatar -->
          <circle cx="34" cy="36" r="18" fill="#e11d48"/>
          <text x="34" y="42" font-family="'Roboto', sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${author.charAt(1).toUpperCase()}</text>
          <!-- Header -->
          <text x="64" y="32" font-family="'Roboto', sans-serif" font-size="13" font-weight="700" fill="#ffffff">${author}</text>
          <text x="175" y="32" font-family="'Roboto', sans-serif" font-size="11" fill="#aaaaaa">hace 2 horas</text>
          <!-- Contenido -->
          <text x="64" y="55" font-family="'Roboto', sans-serif" font-size="13.5" font-weight="500" fill="#f1f1f1">${text}</text>
          <!-- Likes -->
          <path d="M64 74 L68 74 L71 78 L78 78 L80 73 L78 68 L70 68" fill="none" stroke="#aaaaaa" stroke-width="1.5"/>
          <text x="86" y="76" font-family="'Roboto', sans-serif" font-size="11" font-weight="600" fill="#aaaaaa">${likes}</text>
        </svg>
      `);
    }

    // 4. Likes y Reacciones
    function createLikeBadgeSVG(text, color = '#2563eb') {
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 52" width="160" height="52">
          <rect x="0" y="0" width="160" height="52" rx="26" fill="${color}" stroke="#ffffff" stroke-width="2"/>
          <path d="M26 34 L26 22 L32 22 L36 14 L39 14 L39 20 L48 20 L48 26 L44 34 Z" fill="#ffffff"/>
          <text x="56" y="32" font-family="'Roboto', sans-serif" font-size="15" font-weight="bold" fill="#ffffff">${text || '+1 Like'}</text>
        </svg>
      `);
    }

    // 5. Monedas de Oro
    function createCoinSVG() {
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="54" fill="#fbbf24" stroke="#d97706" stroke-width="6"/>
          <circle cx="60" cy="60" r="44" fill="#f59e0b" stroke="#b45309" stroke-width="2" stroke-dasharray="5,4"/>
          <text x="60" y="76" font-family="Arial Black, Impact, sans-serif" font-size="46" font-weight="900" fill="#78350f" text-anchor="middle">$</text>
        </svg>
      `);
    }

    /* ========================================================
       GESTIÓN DE ARCHIVOS Y MINIATURAS
       ======================================================== */
    const fileInput = document.getElementById('file-input');
    const dropzone = document.getElementById('dropzone');
    const thumbnailStrip = document.getElementById('thumbnail-strip');
    const tabCount = document.getElementById('tab-count');
    const galleryBadgeCount = document.getElementById('gallery-badge-count');

    function updateGalleryUI() {
      if (tabCount) tabCount.textContent = imagesList.length;
      if (galleryBadgeCount) galleryBadgeCount.textContent = imagesList.length;
      thumbnailStrip.innerHTML = '';

      if (imagesList.length === 0) {
        thumbnailStrip.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: #71717a; font-size: 11.5px; padding: 18px 0;">
            Sin imágenes. Arrastra archivos o pulsa un preset arriba.
          </div>
        `;
        return;
      }

      imagesList.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'thumb-item';
        thumb.innerHTML = `
          <img src="${src}" alt="img-${idx}">
          <button class="thumb-remove" title="Eliminar">&times;</button>
        `;

        thumb.querySelector('.thumb-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          imagesList.splice(idx, 1);
          updateGalleryUI();
        });

        thumbnailStrip.appendChild(thumb);
      });
    }

    function addImagesToPool(files) {
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const blobUrl = URL.createObjectURL(file);
        imagesList.push(blobUrl);
      });
      updateGalleryUI();
      showToast(`Añadidas imágenes a la biblioteca`);
    }

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        addImagesToPool(e.target.files);
      }
    });

    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput.click();
      }
    });

    // Drag & Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length) {
        addImagesToPool(e.dataTransfer.files);
      }
    });

    document.getElementById('btn-clear-images').addEventListener('click', () => {
      imagesList = [];
      updateGalleryUI();
      showToast('Biblioteca vaciada');
    });

    /* Presets listeners */
    document.getElementById('btn-preset-windows-errors').addEventListener('click', () => {
      const errorPresets = [
        { t: 'cx_Freeze: Python error in main script', m: 'Traceback (most recent call last):\nFile "src/Engine.py", line 79', type: 'error' },
        { t: 'Error', m: 'Click "Fix" to fix error.', type: 'error' },
        { t: 'Virus Detected - Microsoft Windows XP', m: 'Your computer has detected a virus of unknown origin.', type: 'warn' },
        { t: 'InstallShield Wizard', m: 'Setup has experienced an unrecoverable error (6005).', type: 'error' },
        { t: 'Microsoft Windows', m: 'Crasher.exe has stopped working. Close the program.', type: 'error' }
      ];
      errorPresets.forEach(err => imagesList.push(createWindowsErrorSVG(err.t, err.m, err.type)));
      updateGalleryUI();
      showToast('Cargadas ventanas de error de Windows');
    });

    document.getElementById('btn-preset-money').addEventListener('click', () => {
      for (let i = 0; i < 8; i++) {
        imagesList.push(createMoneySVG('K' + (281900 + i * 42)));
      }
      updateGalleryUI();
      showToast('Cargados 8 billetes de $100');
    });

    document.getElementById('btn-preset-comments').addEventListener('click', () => {
      const demoComments = [
        { u: '@auronplay', t: 'JAJAJA esto es increíble', l: '4.2K' },
        { u: '@ibai', t: 'Simplemente una obra de arte', l: '12K' },
        { u: '@rubius', t: 'Pero qué acaba de pasar aquí xD', l: '8.7K' },
        { u: '@mrbeast', t: 'I subscribed! Awesome video!', l: '45K' },
        { u: '@eternodev', t: 'EditFun salvando el día como siempre', l: '1.9K' },
        { u: '@editor_pro', t: 'El mejor overlay para Premiere sin duda', l: '850' }
      ];
      demoComments.forEach(c => imagesList.push(createCommentSVG(c.u, c.t, c.l)));
      updateGalleryUI();
      showToast('Cargados 6 comentarios de YouTube');
    });

    document.getElementById('btn-preset-likes').addEventListener('click', () => {
      imagesList.push(createLikeBadgeSVG('+1 Like', '#2563eb'));
      imagesList.push(createLikeBadgeSVG('+100 Suscriptores', '#dc2626'));
      imagesList.push(createLikeBadgeSVG('Favorito', '#f59e0b'));
      imagesList.push(createLikeBadgeSVG('Compartido', '#10b981'));
      imagesList.push(createLikeBadgeSVG('+500 Visitas', '#9333ea'));
      updateGalleryUI();
      showToast('Cargados badges de likes');
    });

    document.getElementById('btn-preset-coins').addEventListener('click', () => {
      for (let i = 0; i < 6; i++) {
        imagesList.push(createCoinSVG());
      }
      updateGalleryUI();
      showToast('Cargadas monedas doradas');
    });

    // Cargar errores de Windows por defecto
    document.getElementById('btn-preset-windows-errors').click();

    /* ========================================================
       PESTAÑAS Y SELECTORES DE MODO (3 MODOS)
       ======================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    // Selector de modo Cascada vs Pop-ups vs Lluvia
    const btnModeCascade = document.getElementById('mode-cascade');
    const btnModePopups = document.getElementById('mode-popups');
    const btnModeRain = document.getElementById('mode-rain');

    const cascadeOptions = document.getElementById('cascade-options');
    const popupsOptions = document.getElementById('popups-options');
    const rainOptions = document.getElementById('rain-options');

    function switchMode(mode) {
      currentMode = mode;
      btnModeCascade.classList.toggle('active', mode === 'cascade');
      btnModePopups.classList.toggle('active', mode === 'popups');
      btnModeRain.classList.toggle('active', mode === 'rain');

      cascadeOptions.style.display = mode === 'cascade' ? 'flex' : 'none';
      popupsOptions.style.display = mode === 'popups' ? 'flex' : 'none';
      rainOptions.style.display = mode === 'rain' ? 'flex' : 'none';

      closeCurveEditor();
      resetStage();
    }

    btnModeCascade.addEventListener('click', () => switchMode('cascade'));
    btnModePopups.addEventListener('click', () => switchMode('popups'));
    btnModeRain.addEventListener('click', () => switchMode('rain'));

    /* ========================================================
       SISTEMA DE LÍNEA DE RITMO / VELOCIDAD (CURVA SVG INTERACTIVA)
       ======================================================== */
    const defaultSpeedPoints = () => [
      { x: 0.25, y: 0.5 },
      { x: 0.50, y: 0.5 },
      { x: 0.75, y: 0.5 }
    ];

    const speedCurves = {
      'cascade-speed': { isCustom: false, points: defaultSpeedPoints() },
      'cascade-size': { isCustom: false, points: defaultSpeedPoints() },
      'popups-speed': { isCustom: false, points: defaultSpeedPoints() },
      'popups-size': { isCustom: false, points: defaultSpeedPoints() },
      'rain-speed': { isCustom: false, points: defaultSpeedPoints() },
      'rain-density': { isCustom: false, points: defaultSpeedPoints() }
    };

    const attrTitles = {
      'cascade-speed': 'Velocidad de rastro',
      'cascade-size': 'Tamaño de ventana',
      'popups-speed': 'Intervalo de aparición',
      'popups-size': 'Tamaño de imagen',
      'rain-speed': 'Velocidad de caída',
      'rain-density': 'Densidad de lluvia'
    };

    let activeCurveAttr = null;
    let animationStartTime = 0;

    const curveSection = document.getElementById('curve-section');
    const curveTargetTitle = document.getElementById('curve-target-title');
    const curveSvgElem = document.getElementById('curve-svg-elem');
    const curveCanvasWrapper = document.getElementById('curve-canvas-wrapper');
    const curvePath = document.getElementById('curve-path');
    const curveGuidePoly = document.getElementById('curve-guide-poly');
    const controlPointsElements = [
      document.getElementById('cp-1'),
      document.getElementById('cp-2'),
      document.getElementById('cp-3')
    ];
    const pencilButtons = document.querySelectorAll('.btn-curve-pencil');

    function openCurveForAttr(attrKey) {
      if (activeCurveAttr === attrKey && curveSection.style.display !== 'none') {
        closeCurveEditor();
        return;
      }
      activeCurveAttr = attrKey;
      pencilButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.curveAttr === attrKey);
      });
      curveTargetTitle.textContent = 'Ritmo: ' + (attrTitles[attrKey] || attrKey);
      curveSection.style.display = 'flex';
      updateCurveEditorView();
    }

    function closeCurveEditor() {
      activeCurveAttr = null;
      pencilButtons.forEach(btn => btn.classList.remove('active'));
      curveSection.style.display = 'none';
    }

    document.getElementById('btn-close-curve').addEventListener('click', closeCurveEditor);

    pencilButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCurveForAttr(btn.dataset.curveAttr);
      });
    });

    document.getElementById('btn-reset-curve').addEventListener('click', () => {
      if (!activeCurveAttr) return;
      speedCurves[activeCurveAttr].isCustom = false;
      speedCurves[activeCurveAttr].points = defaultSpeedPoints();
      updatePencilBadges();
      updateCurveEditorView();
      showToast('Ritmo restablecido a constante (1.0x)');
    });

    function updatePencilBadges() {
      pencilButtons.forEach(btn => {
        const key = btn.dataset.curveAttr;
        btn.classList.toggle('has-custom', !!(speedCurves[key] && speedCurves[key].isCustom));
      });
    }

    // Coordenadas SVG: Width 280, Height 80 (y=0.5 -> 40px, y=1.0 -> 10px, y=0.0 -> 70px)
    function normToSvg(nx, ny) {
      return {
        x: nx * 280,
        y: 70 - ny * 60
      };
    }

    function svgToNorm(sx, sy) {
      const nx = Math.max(0.05, Math.min(0.95, sx / 280));
      const ny = Math.max(0.0, Math.min(1.0, (70 - sy) / 60));
      return { x: nx, y: ny };
    }

    // Evaluación instantánea de velocidad v(t) a lo largo del tiempo
    function evaluateSpeedAtTime(pts, t) {
      t = Math.max(0, Math.min(1, t));
      const allPts = [
        { x: 0, y: pts[0].y },
        ...pts,
        { x: 1, y: pts[2].y }
      ];
      const n = allPts.length;

      let i = 0;
      while (i < n - 2 && allPts[i + 1].x < t) {
        i++;
      }

      const p0 = allPts[Math.max(0, i - 1)];
      const p1 = allPts[i];
      const p2 = allPts[i + 1];
      const p3 = allPts[Math.min(n - 1, i + 2)];

      const dx = Math.max(0.0001, p2.x - p1.x);
      const frac = Math.max(0, Math.min(1, (t - p1.x) / dx));

      const m1 = (p2.y - p0.y) / Math.max(0.0001, p2.x - p0.x);
      const m2 = (p3.y - p1.y) / Math.max(0.0001, p3.x - p1.x);

      const f2 = frac * frac;
      const f3 = f2 * frac;
      const h00 = 2 * f3 - 3 * f2 + 1;
      const h10 = f3 - 2 * f2 + frac;
      const h01 = -2 * f3 + 3 * f2;
      const h11 = f3 - f2;

      const normSpeed = h00 * p1.y + h10 * dx * m1 + h01 * p2.y + h11 * dx * m2;
      const clampedNorm = Math.max(0.0, Math.min(1.0, normSpeed));
      
      // Mapeo: y=0.5 -> 1.0x; y=1.0 -> 2.5x; y=0.0 -> 0.25x
      return Math.max(0.2, 0.25 + clampedNorm * 1.5);
    }

    // Evaluación de multiplicador con soporte para infinito (mantiene último punto al final)
    function evaluateCurveMultiplier(attrKey, progress, isInfinite) {
      const curveData = speedCurves[attrKey];
      if (!curveData || !curveData.isCustom) return 1.0;

      const pts = curveData.points;
      if (isInfinite && progress >= 1.0) {
        const lastNormY = pts[2].y;
        return Math.max(0.2, 0.25 + lastNormY * 1.5);
      }

      return evaluateSpeedAtTime(pts, Math.min(1.0, Math.max(0, progress)));
    }

    function updateCurveEditorView() {
      if (!activeCurveAttr) return;
      const curveData = speedCurves[activeCurveAttr];
      const isCustom = !!curveData.isCustom;
      const pts = curveData.points || defaultSpeedPoints();

      // Posicionar los 3 puntos
      pts.forEach((p, idx) => {
        const svgP = normToSvg(p.x, p.y);
        controlPointsElements[idx].setAttribute('cx', svgP.x.toFixed(1));
        controlPointsElements[idx].setAttribute('cy', svgP.y.toFixed(1));
      });

      if (!isCustom) {
        curvePath.setAttribute('d', 'M 0 40 L 280 40');
        curveGuidePoly.style.display = 'none';
      } else {
        const p0Svg = normToSvg(0, pts[0].y);
        const p4Svg = normToSvg(1, pts[2].y);
        const polyPoints = [`0,${p0Svg.y.toFixed(1)}`];
        pts.forEach(p => {
          const svgP = normToSvg(p.x, p.y);
          polyPoints.push(`${svgP.x.toFixed(1)},${svgP.y.toFixed(1)}`);
        });
        polyPoints.push(`280,${p4Svg.y.toFixed(1)}`);
        curveGuidePoly.setAttribute('points', polyPoints.join(' '));
        curveGuidePoly.style.display = 'block';

        // Muestrear curva continua
        let d = `M 0 ${p0Svg.y.toFixed(1)}`;
        const samples = 32;
        for (let s = 1; s <= samples; s++) {
          const t = s / samples;
          const v = evaluateSpeedAtTime(pts, t);
          const normY = Math.max(0, Math.min(1, (v - 0.25) / 1.5));
          const svgCoord = normToSvg(t, normY);
          d += ` L ${svgCoord.x.toFixed(1)} ${svgCoord.y.toFixed(1)}`;
        }
        curvePath.setAttribute('d', d);
      }

      updatePencilBadges();
    }

    // Arrastre interactivo de puntos
    let activeDragIndex = -1;

    function getClosestPointIndex(normX, normY, pts) {
      let closestIdx = 0;
      let minD = 999999;
      pts.forEach((p, idx) => {
        const dx = p.x - normX;
        const dy = p.y - normY;
        const d = dx * dx * 0.4 + dy * dy;
        if (d < minD) {
          minD = d;
          closestIdx = idx;
        }
      });
      return closestIdx;
    }

    function handleDragPointer(e) {
      if (activeDragIndex < 0 || !activeCurveAttr) return;
      const rect = curveSvgElem.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
      if (clientX === undefined) return;

      const sx = ((clientX - rect.left) / rect.width) * 280;
      const sy = ((clientY - rect.top) / rect.height) * 80;
      const norm = svgToNorm(sx, sy);

      // Límites horizontales
      let minX = 0.05, maxX = 0.95;
      if (activeDragIndex === 0) {
        minX = 0.05;
        maxX = speedCurves[activeCurveAttr].points[1].x - 0.05;
      } else if (activeDragIndex === 1) {
        minX = speedCurves[activeCurveAttr].points[0].x + 0.05;
        maxX = speedCurves[activeCurveAttr].points[2].x - 0.05;
      } else if (activeDragIndex === 2) {
        minX = speedCurves[activeCurveAttr].points[1].x + 0.05;
        maxX = 0.95;
      }

      const clampedX = Math.max(minX, Math.min(maxX, norm.x));
      const clampedY = Math.max(0.0, Math.min(1.0, norm.y));

      speedCurves[activeCurveAttr].isCustom = true;
      speedCurves[activeCurveAttr].points[activeDragIndex] = { x: clampedX, y: clampedY };
      updateCurveEditorView();
    }

    curveCanvasWrapper.addEventListener('mousedown', (e) => {
      if (!activeCurveAttr) return;
      const rect = curveSvgElem.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * 280;
      const sy = ((e.clientY - rect.top) / rect.height) * 80;
      const norm = svgToNorm(sx, sy);
      activeDragIndex = getClosestPointIndex(norm.x, norm.y, speedCurves[activeCurveAttr].points);
      controlPointsElements[activeDragIndex].classList.add('dragging');
      handleDragPointer(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (activeDragIndex >= 0) {
        handleDragPointer(e);
      }
    });

    window.addEventListener('mouseup', () => {
      if (activeDragIndex >= 0) {
        controlPointsElements[activeDragIndex].classList.remove('dragging');
        activeDragIndex = -1;
      }
    });

    curveCanvasWrapper.addEventListener('touchstart', (e) => {
      if (!activeCurveAttr) return;
      const rect = curveSvgElem.getBoundingClientRect();
      const touch = e.touches[0];
      const sx = ((touch.clientX - rect.left) / rect.width) * 280;
      const sy = ((touch.clientY - rect.top) / rect.height) * 80;
      const norm = svgToNorm(sx, sy);
      activeDragIndex = getClosestPointIndex(norm.x, norm.y, speedCurves[activeCurveAttr].points);
      controlPointsElements[activeDragIndex].classList.add('dragging');
      handleDragPointer(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (activeDragIndex >= 0) {
        handleDragPointer(e);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (activeDragIndex >= 0) {
        controlPointsElements[activeDragIndex].classList.remove('dragging');
        activeDragIndex = -1;
      }
    });

    // Inputs dinámicos y sus valores en tiempo real
    const bindSlider = (sliderId, labelId, suffix = '') => {
      const slider = document.getElementById(sliderId);
      const label = document.getElementById(labelId);
      slider.addEventListener('input', () => {
        label.textContent = slider.value + suffix;
      });
    };

    bindSlider('param-cascade-speed', 'val-cascade-speed', ' ms');
    bindSlider('param-cascade-size', 'val-cascade-size', ' px');
    bindSlider('param-cascade-spacing', 'val-cascade-spacing', ' px');
    bindSlider('param-cascade-streams', 'val-cascade-streams', '');
    bindSlider('param-cascade-len', 'val-cascade-len', ' pasos');

    bindSlider('param-spawn-speed', 'val-spawn-speed', ' ms');
    bindSlider('param-item-size', 'val-item-size', ' px');
    bindSlider('param-rotation', 'val-rotation', '°');
    document.getElementById('param-max-items').addEventListener('input', (e) => {
      document.getElementById('val-max-items').textContent = e.target.value >= 500 ? 'Infinito' : e.target.value;
    });

    bindSlider('param-rain-speed', 'val-rain-speed', ' px/frame');
    bindSlider('param-rain-density', 'val-rain-density', ' / seg');
    bindSlider('param-rain-size', 'val-rain-size', ' px');
    document.getElementById('param-rain-wobble').addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      document.getElementById('val-rain-wobble').textContent = v === 0 ? 'Sin giro' : v < 8 ? 'Suave' : 'Alto';
    });

    /* Selectores de Fondo Croma */
    const bgDots = document.querySelectorAll('.bg-color-dot');
    bgDots.forEach(dot => {
      dot.addEventListener('click', () => {
        bgDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        document.body.className = dot.dataset.bg;
      });
    });

    /* ========================================================
       MOTOR DE ANIMACIÓN 1: CASCADA DIAGONAL / RASTRO (WINDOWS GLITCH)
       ======================================================== */
    let cascadeStreams = [];
    let cascadeTimeoutId = null;

    function initCascadeStream() {
      if (imagesList.length === 0) return null;
      const img = imagesList[Math.floor(Math.random() * imagesList.length)];
      const baseItemSize = parseInt(document.getElementById('param-cascade-size').value);
      const spacing = parseInt(document.getElementById('param-cascade-spacing').value);
      const dirMode = document.getElementById('param-cascade-direction').value;
      const maxSteps = parseInt(document.getElementById('param-cascade-len').value);

      let startX = 0;
      let startY = 0;
      let dx = spacing;
      let dy = spacing;

      if (dirMode === 'diagonal-down-right') {
        dx = spacing;
        dy = spacing;
        startX = Math.random() * (window.innerWidth * 0.5);
        startY = Math.random() * (window.innerHeight * 0.35);
      } else if (dirMode === 'diagonal-down-left') {
        dx = -spacing;
        dy = spacing;
        startX = window.innerWidth * 0.5 + Math.random() * (window.innerWidth * 0.45);
        startY = Math.random() * (window.innerHeight * 0.35);
      } else if (dirMode === 'bounce') {
        const signs = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
        const pick = signs[Math.floor(Math.random() * signs.length)];
        dx = pick[0] * spacing;
        dy = pick[1] * spacing;
        startX = Math.random() * (window.innerWidth - baseItemSize);
        startY = Math.random() * (window.innerHeight - baseItemSize);
      } else if (dirMode === 'random') {
        const dirs = [[1, 1], [-1, 1], [1, 0.7], [-1, 0.7]];
        const pick = dirs[Math.floor(Math.random() * dirs.length)];
        dx = pick[0] * spacing;
        dy = pick[1] * spacing;
        startX = Math.random() * (window.innerWidth - baseItemSize);
        startY = Math.random() * (window.innerHeight - baseItemSize * 1.5);
      }

      return {
        img,
        x: startX,
        y: startY,
        dx,
        dy,
        baseItemSize,
        stepsTotal: maxSteps,
        stepsLeft: maxSteps,
        dirMode
      };
    }

    function stepCascadeEngine() {
      if (!isPlaying || imagesList.length === 0) return;

      const numStreams = parseInt(document.getElementById('param-cascade-streams').value);
      const soundCheck = document.getElementById('param-cascade-sound').checked;

      while (cascadeStreams.length < numStreams) {
        const s = initCascadeStream();
        if (s) cascadeStreams.push(s);
      }
      while (cascadeStreams.length > numStreams) {
        cascadeStreams.pop();
      }

      let spawnedAny = false;

      cascadeStreams.forEach((stream, idx) => {
        const progress = (stream.stepsTotal - stream.stepsLeft) / Math.max(1, stream.stepsTotal);
        const sizeMult = evaluateCurveMultiplier('cascade-size', progress, false);
        const currentSize = Math.round(stream.baseItemSize * sizeMult);

        const elem = document.createElement('div');
        elem.className = 'cascade-item';
        elem.style.left = `${stream.x}px`;
        elem.style.top = `${stream.y}px`;
        elem.style.width = `${currentSize}px`;

        const img = document.createElement('img');
        img.src = stream.img;
        elem.appendChild(img);
        appendToStage(elem);
        spawnedAny = true;

        stream.x += stream.dx;
        stream.y += stream.dy;
        stream.stepsLeft--;

        const outX = stream.x < -currentSize * 0.2 || stream.x > window.innerWidth - currentSize * 0.8;
        const outY = stream.y < -currentSize * 0.2 || stream.y > window.innerHeight - currentSize * 0.8;

        if (stream.dirMode === 'bounce') {
          if (stream.x < 0 || stream.x > window.innerWidth - currentSize) {
            stream.dx = -stream.dx;
          }
          if (stream.y < 0 || stream.y > window.innerHeight - currentSize) {
            stream.dy = -stream.dy;
          }
          if (stream.stepsLeft <= 0) {
            stream.img = imagesList[Math.floor(Math.random() * imagesList.length)];
            stream.stepsLeft = stream.stepsTotal;
          }
        } else {
          if (outX || outY || stream.stepsLeft <= 0) {
            cascadeStreams[idx] = initCascadeStream();
          }
        }
      });

      if (spawnedAny && soundCheck) {
        playPopSound(true);
      }
    }

    function scheduleNextCascadeStep() {
      if (!isPlaying || currentMode !== 'cascade') return;
      const baseSpeed = parseInt(document.getElementById('param-cascade-speed').value);
      
      const progress = cascadeStreams.length > 0 && cascadeStreams[0].stepsTotal > 0
        ? (cascadeStreams[0].stepsTotal - cascadeStreams[0].stepsLeft) / cascadeStreams[0].stepsTotal
        : 0;
      
      const speedMult = evaluateCurveMultiplier('cascade-speed', progress, false);
      const nextInterval = Math.max(12, Math.round(baseSpeed / speedMult));

      cascadeTimeoutId = setTimeout(() => {
        stepCascadeEngine();
        scheduleNextCascadeStep();
      }, nextInterval);
    }

    function startCascadeEngine() {
      stopCascadeEngine();
      cascadeStreams = [];
      const numStreams = parseInt(document.getElementById('param-cascade-streams').value);
      for (let i = 0; i < numStreams; i++) {
        const s = initCascadeStream();
        if (s) cascadeStreams.push(s);
      }

      stepCascadeEngine();
      scheduleNextCascadeStep();
    }

    function stopCascadeEngine() {
      if (cascadeTimeoutId) {
        clearTimeout(cascadeTimeoutId);
        cascadeTimeoutId = null;
      }
      cascadeStreams = [];
    }

    /* ========================================================
       MOTOR DE ANIMACIÓN 2: POP-UPS (APARICIÓN DISPERSA)
       ======================================================== */
    let currentPopCount = 0;
    let popupSpawnIndex = 0;
    let popupTimeoutId = null;

    function spawnSinglePopup() {
      if (imagesList.length === 0) return;

      const maxLimit = parseInt(document.getElementById('param-max-items').value);
      const isInfinite = maxLimit >= 500;
      const effectiveLimit = isInfinite ? MAX_STAGE_ELEMENTS : maxLimit;

      // Limpieza preventiva FIFO para evitar saturación de pantalla y mantener 60fps
      while (currentPopCount >= effectiveLimit) {
        const first = stage.querySelector('.spawn-item');
        if (first) {
          first.remove();
          currentPopCount--;
        } else {
          break;
        }
      }

      const progress = isInfinite
        ? (Date.now() - animationStartTime) / 6000
        : currentPopCount / Math.max(1, maxLimit);

      const sizeMult = evaluateCurveMultiplier('popups-size', progress, isInfinite);
      const baseItemSize = parseInt(document.getElementById('param-item-size').value);
      const itemSize = Math.round(baseItemSize * sizeMult);

      // Selección en orden estricto de la lista primero, luego aleatorio
      let chosenImg;
      if (popupSpawnIndex < imagesList.length) {
        chosenImg = imagesList[popupSpawnIndex];
      } else {
        chosenImg = imagesList[Math.floor(Math.random() * imagesList.length)];
      }

      const maxRot = parseInt(document.getElementById('param-rotation').value);
      const animEffect = document.getElementById('param-anim-effect').value;
      const soundCheck = document.getElementById('param-play-sound').checked;

      const margin = itemSize / 2 + 10;
      const cX = window.innerWidth / 2;
      const cY = window.innerHeight / 2;

      let posX, posY, rot;

      if (popupSpawnIndex === 0) {
        // 1er popup: 100% centrado en medio de la pantalla
        posX = cX;
        posY = cY;
        rot = 0;
      } else if (popupSpawnIndex === 1) {
        // 2º popup: Muy cerca del centro con ligero offset orgánico
        const angle = (Math.PI / 4) + (Math.random() * 0.4 - 0.2);
        const dist = Math.min(cX - margin, cY - margin, itemSize * 0.28);
        posX = cX + Math.cos(angle) * dist;
        posY = cY + Math.sin(angle) * dist;
        rot = (Math.random() * 2 - 1) * Math.min(3, maxRot);
      } else if (popupSpawnIndex === 2) {
        // 3er popup: Alrededor del centro
        const angle = (-3 * Math.PI / 4) + (Math.random() * 0.4 - 0.2);
        const dist = Math.min(cX - margin, cY - margin, itemSize * 0.38);
        posX = cX + Math.cos(angle) * dist;
        posY = cY + Math.sin(angle) * dist;
        rot = (Math.random() * 2 - 1) * Math.min(5, maxRot);
      } else if (popupSpawnIndex === 3) {
        // 4º popup: Alrededor del centro
        const angle = (-Math.PI / 4) + (Math.random() * 0.4 - 0.2);
        const dist = Math.min(cX - margin, cY - margin, itemSize * 0.52);
        posX = cX + Math.cos(angle) * dist;
        posY = cY + Math.sin(angle) * dist;
        rot = (Math.random() * 2 - 1) * Math.min(8, maxRot);
      } else if (popupSpawnIndex <= 5) {
        // 5º y 6º popup: Expandiendo desde el centro
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.min(cX - margin, cY - margin, itemSize * 0.75);
        posX = Math.max(margin, Math.min(window.innerWidth - margin, cX + Math.cos(angle) * dist));
        posY = Math.max(margin, Math.min(window.innerHeight - margin, cY + Math.sin(angle) * dist));
        rot = (Math.random() * 2 - 1) * maxRot;
      } else {
        // A partir de 6 en adelante: cubriendo toda la pantalla
        posX = margin + Math.random() * (window.innerWidth - margin * 2);
        posY = margin + Math.random() * (window.innerHeight - margin * 2);
        rot = (Math.random() * 2 - 1) * maxRot;
      }

      const elem = document.createElement('div');
      elem.className = `spawn-item ${animEffect}`;
      elem.style.left = `${posX}px`;
      elem.style.top = `${posY}px`;
      elem.style.width = `${itemSize}px`;
      elem.style.setProperty('--rot', `${rot}deg`);

      const img = document.createElement('img');
      img.src = chosenImg;
      elem.appendChild(img);

      appendToStage(elem);
      currentPopCount++;
      popupSpawnIndex++;

      if (soundCheck) {
        playPopSound();
      }
    }

    function scheduleNextPopup() {
      if (!isPlaying || currentMode !== 'popups') return;
      const baseSpeed = parseInt(document.getElementById('param-spawn-speed').value);
      const maxLimit = parseInt(document.getElementById('param-max-items').value);
      const isInfinite = maxLimit >= 500;

      const progress = isInfinite
        ? (Date.now() - animationStartTime) / 6000
        : currentPopCount / Math.max(1, maxLimit);

      const speedMult = evaluateCurveMultiplier('popups-speed', progress, isInfinite);
      const nextInterval = Math.max(25, Math.round(baseSpeed / speedMult));

      popupTimeoutId = setTimeout(() => {
        spawnSinglePopup();
        scheduleNextPopup();
      }, nextInterval);
    }

    function startPopupsEngine() {
      stopPopupsEngine();
      spawnSinglePopup();
      scheduleNextPopup();
    }

    function stopPopupsEngine() {
      if (popupTimeoutId) {
        clearTimeout(popupTimeoutId);
        popupTimeoutId = null;
      }
    }

    /* ========================================================
       MOTOR DE ANIMACIÓN 3: LLUVIA DE PARTÍCULAS (3D WOBBLE)
       ======================================================== */
    let lastRainSpawnTime = 0;

    function createRainParticle() {
      if (imagesList.length === 0) return null;

      const randomImg = imagesList[Math.floor(Math.random() * imagesList.length)];
      const baseSize = parseInt(document.getElementById('param-rain-size').value);
      const direction = document.getElementById('param-rain-direction').value;
      const wobbleIntensity = parseInt(document.getElementById('param-rain-wobble').value);

      const depthScale = 0.75 + Math.random() * 0.45;
      const finalWidth = baseSize * depthScale;

      const elem = document.createElement('div');
      elem.className = 'spawn-item';
      elem.style.width = `${finalWidth}px`;

      const img = document.createElement('img');
      img.src = randomImg;
      elem.appendChild(img);
      appendToStage(elem);

      const posX = Math.random() * (window.innerWidth - finalWidth);
      const startY = direction === 'down' ? -finalWidth - 40 : window.innerHeight + 40;
      const baseFallSpeed = (parseInt(document.getElementById('param-rain-speed').value) + (Math.random() * 2 - 1)) * (depthScale * 0.9);

      return {
        elem,
        x: posX,
        y: startY,
        baseX: posX,
        baseFallSpeed,
        direction,
        wobbleIntensity,
        wobbleSpeed: 0.03 + Math.random() * 0.04,
        wobbleAngle: Math.random() * Math.PI * 2,
        rotZ: (Math.random() * 2 - 1) * 15,
        rotZSpeed: (Math.random() * 2 - 1) * 0.5,
        depthScale
      };
    }

    function updateRainPhysics(timestamp) {
      if (!isPlaying || currentMode !== 'rain') return;

      const baseDensity = parseInt(document.getElementById('param-rain-density').value);
      const progress = (Date.now() - animationStartTime) / 6000;
      const densityMult = evaluateCurveMultiplier('rain-density', progress, true);
      const speedMult = evaluateCurveMultiplier('rain-speed', progress, true);

      const effectiveDensity = Math.max(1, baseDensity * densityMult);
      const spawnInterval = 1000 / effectiveDensity;

      if (timestamp - lastRainSpawnTime > spawnInterval) {
        const p = createRainParticle();
        if (p) activeRainParticles.push(p);
        lastRainSpawnTime = timestamp;
      }

      for (let i = activeRainParticles.length - 1; i >= 0; i--) {
        const p = activeRainParticles[i];
        const currentSpeedY = p.baseFallSpeed * speedMult;

        if (p.direction === 'down') {
          p.y += currentSpeedY;
        } else {
          p.y -= currentSpeedY;
        }

        p.wobbleAngle += p.wobbleSpeed;
        p.rotZ += p.rotZSpeed;

        const lateralOffset = Math.sin(p.wobbleAngle) * (p.wobbleIntensity * 3.5);
        const rotY = Math.sin(p.wobbleAngle) * (p.wobbleIntensity * 4);
        const rotX = Math.cos(p.wobbleAngle * 0.7) * (p.wobbleIntensity * 1.5);

        p.elem.style.transform = `
          translate3d(${p.baseX + lateralOffset}px, ${p.y}px, 0)
          rotateY(${rotY}deg)
          rotateX(${rotX}deg)
          rotateZ(${p.rotZ}deg)
        `;

        const outOfBounds = (p.direction === 'down' && p.y > window.innerHeight + 100) ||
                            (p.direction === 'up' && p.y < -300);

        if (outOfBounds) {
          p.elem.remove();
          activeRainParticles.splice(i, 1);
        }
      }

      rainAnimationFrameId = requestAnimationFrame(updateRainPhysics);
    }

    function startRainEngine() {
      stopRainEngine();
      lastRainSpawnTime = performance.now();
      rainAnimationFrameId = requestAnimationFrame(updateRainPhysics);
    }

    function stopRainEngine() {
      if (rainAnimationFrameId) {
        cancelAnimationFrame(rainAnimationFrameId);
        rainAnimationFrameId = null;
      }
    }

    /* ========================================================
       CONTROLES DE REPRODUCCIÓN (PLAY / PAUSE / RESET)
       ======================================================== */
    const btnPlay = document.getElementById('btn-play');
    const playText = document.getElementById('play-text');
    const btnReset = document.getElementById('btn-reset');

    /* Descartar mensaje inicial de bienvenida */
    function dismissWelcomeHint() {
      const hint = document.getElementById('welcome-hint');
      if (hint && !hint.classList.contains('hidden')) {
        hint.classList.add('hidden');
        setTimeout(() => hint.remove(), 400);
      }
    }

    const welcomeHint = document.getElementById('welcome-hint');
    if (welcomeHint) {
      welcomeHint.addEventListener('click', () => {
        dismissWelcomeHint();
        showPanel();
      });
    }

    function togglePlayback() {
      dismissWelcomeHint();
      if (imagesList.length === 0) {
        showToast('Añade al menos una imagen antes de empezar');
        return;
      }

      isPlaying = !isPlaying;

      if (isPlaying) {
        getAudioContext();
        animationStartTime = Date.now();
        btnPlay.classList.add('playing');
        playText.textContent = 'Pausar';
        btnPlay.querySelector('svg').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

        if (currentMode === 'cascade') {
          startCascadeEngine();
        } else if (currentMode === 'popups') {
          startPopupsEngine();
        } else {
          startRainEngine();
        }
      } else {
        btnPlay.classList.remove('playing');
        playText.textContent = 'Reanudar';
        btnPlay.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';

        stopCascadeEngine();
        stopPopupsEngine();
        stopRainEngine();
      }
    }

    function resetStage() {
      stopCascadeEngine();
      stopPopupsEngine();
      stopRainEngine();
      stage.innerHTML = '';
      activeRainParticles = [];
      cascadeStreams = [];
      currentPopCount = 0;
      popupSpawnIndex = 0;
      isPlaying = false;
      btnPlay.classList.remove('playing');
      playText.textContent = 'Iniciar Animación';
      btnPlay.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
    }

    btnPlay.addEventListener('click', togglePlayback);
    btnReset.addEventListener('click', resetStage);

    /* ========================================================
       MENÚ 3 PUNTOS Y OCULTAR/MOSTRAR PANEL
       ======================================================== */
    const menuBtn = document.getElementById('menu-btn');

    function hidePanel() {
      controlPanel.classList.add('hidden');
    }

    function showPanel() {
      dismissWelcomeHint();
      controlPanel.classList.remove('hidden');
    }

    function togglePanel() {
      if (controlPanel.classList.contains('hidden')) {
        showPanel();
      } else {
        hidePanel();
      }
    }

    if (menuBtn) menuBtn.addEventListener('click', togglePanel);

    /* Atajos de teclado para grabación (S, Q, Espacio, R, H) */
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;

      if (e.code === 'Space' || e.code === 'KeyS' || e.code === 'KeyQ') {
        e.preventDefault();
        togglePlayback();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetStage();
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        togglePanel();
      }
    });

    /* ========================================================
       SONIDO CUSTOMIZADO (SUBIDA, REPRODUCCIÓN Y VARIACIÓN)
       ======================================================== */
    const soundFileInput = document.getElementById('sound-file-input');

    function updateCustomSoundUI() {
      const containers = document.querySelectorAll('.custom-sound-container');
      containers.forEach(container => {
        if (customAudioBuffer && customAudioFileName) {
          container.innerHTML = `
            <div class="custom-sound-active-wrap" title="${customAudioFileName}">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              <span class="custom-sound-name">${customAudioFileName}</span>
              <button type="button" class="btn-remove-sound" title="Quitar sonido y volver al predeterminado">&times;</button>
            </div>
          `;
          const btnRemove = container.querySelector('.btn-remove-sound');
          if (btnRemove) {
            btnRemove.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              customAudioBuffer = null;
              customAudioFileName = '';
              if (soundFileInput) soundFileInput.value = '';
              updateCustomSoundUI();
            });
          }
        } else {
          container.innerHTML = `
            <button type="button" class="btn-upload-sound" title="Subir archivo de audio propio (.mp3, .wav, .ogg)">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              <span>Subir sonido customizado</span>
            </button>
          `;
          const btnUpload = container.querySelector('.btn-upload-sound');
          if (btnUpload) {
            btnUpload.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (soundFileInput) soundFileInput.click();
            });
          }
        }
      });
    }

    if (soundFileInput) {
      soundFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          const arrayBuffer = ev.target.result;
          const ctx = getAudioContext();
          if (!ctx) return;
          ctx.decodeAudioData(arrayBuffer.slice(0), (decoded) => {
            customAudioBuffer = decoded;
            customAudioFileName = file.name;
            updateCustomSoundUI();
            playPopSound();
          }, (err) => {
            console.error('Error decodificando audio:', err);
          });
        };
        reader.readAsArrayBuffer(file);
      });
    }

    // Sincronizar selectores de sonido entre pestañas
    document.querySelectorAll('.sound-toggle-sync').forEach(chk => {
      chk.addEventListener('change', (e) => {
        document.querySelectorAll('.sound-toggle-sync').forEach(other => {
          other.checked = e.target.checked;
        });
      });
    });

    // Inicializar UI de sonido customizado
    updateCustomSoundUI();

    /* ========================================================
       SISTEMA DE EXPORTACIÓN SECUENCIA PNG (.ZIP)
       ======================================================== */
    let selectedExportFps = 30;
    let selectedExportBgMode = 'transparent';
    let isExporting = false;
    let exportZipInstance = null;

    const durationSlider = document.getElementById('param-export-duration');
    const durationLabel = document.getElementById('val-export-duration');
    const summaryFramesLabel = document.getElementById('summary-frames-count');
    const durationChips = document.querySelectorAll('.chip-btn');
    const fpsButtons = document.querySelectorAll('#fps-selector .pill-opt');
    const exportBgButtons = document.querySelectorAll('#export-bg-selector .pill-opt');
    const btnStartExport = document.getElementById('btn-start-export');
    const btnCancelExport = document.getElementById('btn-cancel-export');

    function updateExportSummary() {
      const dur = parseInt(durationSlider.value) || 5;
      const total = dur * selectedExportFps;
      if (summaryFramesLabel) {
        summaryFramesLabel.textContent = total + ' PNGs';
      }
    }

    if (durationSlider) {
      durationSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (durationLabel) durationLabel.textContent = val + ' seg';
        durationChips.forEach(chip => {
          chip.classList.toggle('active', chip.dataset.duration === val);
        });
        updateExportSummary();
      });
    }

    durationChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.duration;
        durationSlider.value = val;
        if (durationLabel) durationLabel.textContent = val + ' seg';
        durationChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updateExportSummary();
      });
    });

    fpsButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        fpsButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedExportFps = parseInt(btn.dataset.fps) || 30;
        updateExportSummary();
      });
    });

    exportBgButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        exportBgButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedExportBgMode = btn.dataset.bgMode;
      });
    });

    function getExportBgColor() {
      if (selectedExportBgMode === 'transparent') return null;
      if (document.body.classList.contains('bg-croma-green')) return '#00ff00';
      if (document.body.classList.contains('bg-croma-blue')) return '#0033cc';
      if (document.body.classList.contains('bg-dark')) return '#0f0f11';
      if (document.body.classList.contains('bg-light')) return '#f4f4f6';
      return null;
    }

    function getTargetResolution(choice) {
      if (choice === '1920x1080') return { width: 1920, height: 1080 };
      if (choice === '1080x1920') return { width: 1080, height: 1920 };
      if (choice === '1280x720') return { width: 1280, height: 720 };
      return { width: window.innerWidth, height: window.innerHeight };
    }

    function drawStageToCanvas(ctx, targetW, targetH, isTransparent, bgColor) {
      ctx.clearRect(0, 0, targetW, targetH);

      if (!isTransparent && bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      const scaleX = targetW / Math.max(1, window.innerWidth);
      const scaleY = targetH / Math.max(1, window.innerHeight);

      const items = Array.from(stage.children);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const img = item.querySelector('img');
        if (!img) continue;

        const style = window.getComputedStyle(item);
        const opacity = parseFloat(style.opacity || '1');
        if (opacity <= 0.001) continue;

        ctx.save();
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = opacity;

        // Filtro de sombra
        const imgStyle = window.getComputedStyle(img);
        if (imgStyle.filter && imgStyle.filter !== 'none') {
          try {
            ctx.filter = imgStyle.filter;
          } catch (e) {}
        }

        const itemLeft = item.offsetLeft;
        const itemTop = item.offsetTop;
        let itemWidth = item.offsetWidth;
        let itemHeight = item.offsetHeight;

        if (!itemHeight && img.naturalWidth && img.naturalHeight) {
          itemHeight = itemWidth * (img.naturalHeight / img.naturalWidth);
        }
        if (!itemWidth) itemWidth = 300;
        if (!itemHeight) itemHeight = itemWidth * 0.7;

        const transformStr = style.transform;
        if (transformStr && transformStr !== 'none') {
          try {
            const domMatrix = new DOMMatrix(transformStr);
            ctx.translate(itemLeft, itemTop);
            ctx.transform(domMatrix.a, domMatrix.b, domMatrix.c, domMatrix.d, domMatrix.e, domMatrix.f);
            ctx.drawImage(img, 0, 0, itemWidth, itemHeight);
          } catch (e) {
            ctx.drawImage(img, itemLeft, itemTop, itemWidth, itemHeight);
          }
        } else {
          ctx.drawImage(img, itemLeft, itemTop, itemWidth, itemHeight);
        }

        ctx.restore();
      }
    }

    async function startPngSequenceExport() {
      if (imagesList.length === 0) {
        showToast('Añade al menos una imagen antes de exportar');
        return;
      }

      if (typeof JSZip === 'undefined') {
        alert('La librería JSZip no se ha cargado. Por favor, refresca la página.');
        return;
      }

      const durationSec = parseInt(durationSlider.value) || 5;
      const fps = selectedExportFps;
      const totalFrames = durationSec * fps;
      const isTransparent = selectedExportBgMode === 'transparent';
      const bgColor = getExportBgColor();
      const resSelect = document.getElementById('param-export-res');
      const { width, height } = getTargetResolution(resSelect ? resSelect.value : 'screen');
      const shouldRestart = document.getElementById('param-export-restart').checked;
      const shouldMute = document.getElementById('param-export-mute').checked;

      isExporting = true;
      exportZipInstance = new JSZip();

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true });

      const prevSoundState = soundEnabled;
      if (shouldMute) {
        soundEnabled = false;
      }

      hidePanel();

      const banner = document.getElementById('export-banner');
      const bannerTitle = document.getElementById('export-status-title');
      const bannerSub = document.getElementById('export-status-sub');
      const bannerFill = document.getElementById('export-progress-fill');
      const bannerSpinner = document.getElementById('export-spinner');
      const btnCancelText = document.getElementById('btn-cancel-export-text');

      bannerTitle.textContent = 'Iniciando captura de pantalla...';
      bannerSub.textContent = `Fotograma 0 / ${totalFrames} (0%)`;
      bannerFill.style.width = '0%';
      bannerSpinner.className = 'export-spinner';
      bannerSpinner.innerHTML = '';
      btnCancelText.textContent = 'Cancelar';
      banner.classList.remove('hidden');

      if (shouldRestart) {
        resetStage();
      }

      if (!isPlaying) {
        togglePlayback();
      }

      const frameDelayMs = 1000 / fps;
      let capturedFrames = 0;

      // Breve margen para que el navegador monte los elementos iniciales
      await new Promise(r => setTimeout(r, 60));

      for (let f = 1; f <= totalFrames; f++) {
        if (!isExporting) break;

        drawStageToCanvas(ctx, width, height, isTransparent, bgColor);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!isExporting) break;

        const frameNum = String(f).padStart(4, '0');
        exportZipInstance.file(`frame_${frameNum}.png`, blob);

        capturedFrames++;
        const pct = Math.round((capturedFrames / totalFrames) * 100);
        bannerTitle.textContent = `Capturando fotogramas (${fps} FPS)...`;
        bannerSub.textContent = `Fotograma ${capturedFrames} / ${totalFrames} (${pct}%)`;
        bannerFill.style.width = `${pct}%`;

        await new Promise(r => setTimeout(r, frameDelayMs));
      }

      soundEnabled = prevSoundState;

      if (!isExporting) {
        bannerTitle.textContent = 'Exportación cancelada';
        bannerSub.textContent = 'Proceso interrumpido por el usuario';
        setTimeout(() => {
          banner.classList.add('hidden');
        }, 1800);
        return;
      }

      if (isPlaying) {
        togglePlayback();
      }

      bannerTitle.textContent = 'Generando archivo ZIP...';
      bannerSub.textContent = `Empaquetando ${capturedFrames} fotogramas PNG...`;

      try {
        const zipBlob = await exportZipInstance.generateAsync({
          type: 'blob',
          compression: 'STORE'
        }, (meta) => {
          const zipPct = Math.round(meta.percent);
          bannerSub.textContent = `Comprimiendo ZIP: ${zipPct}%`;
          bannerFill.style.width = `${zipPct}%`;
        });

        const filename = `popfx_${currentMode}_${fps}fps_${capturedFrames}frames.zip`;
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }, 1500);

        bannerTitle.textContent = '¡Descarga completada!';
        bannerSub.textContent = `Guardado ${filename}`;
        bannerFill.style.width = '100%';
        bannerSpinner.className = 'export-spinner success';
        bannerSpinner.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        btnCancelText.textContent = 'Cerrar';

        setTimeout(() => {
          banner.classList.add('hidden');
          isExporting = false;
        }, 4000);
      } catch (err) {
        console.error('Error generando zip:', err);
        bannerTitle.textContent = 'Error al empaquetar';
        bannerSub.textContent = err.message || 'Error desconocido';
        isExporting = false;
      }
    }

    if (btnStartExport) {
      btnStartExport.addEventListener('click', startPngSequenceExport);
    }

    if (btnCancelExport) {
      btnCancelExport.addEventListener('click', () => {
        isExporting = false;
        const banner = document.getElementById('export-banner');
        if (banner) banner.classList.add('hidden');
      });
    }

    // Inicializar resumen de fotogramas
    updateExportSummary();
