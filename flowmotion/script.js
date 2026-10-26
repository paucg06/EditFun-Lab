/* ========================================================
   FLOWMOTION STUDIO — MOTOR DE DIAGRAMAS Y MAZMORRAS ANIMADAS
   ======================================================== */

(function () {
  'use strict';

  // --- Elementos del DOM ---
  const stage = document.getElementById('stage');
  const controlPanel = document.getElementById('control-panel');
  const welcomeHint = document.getElementById('welcome-hint');
  const menuBtn = document.getElementById('menu-btn');
  const stageSvg = document.getElementById('stage-connections-svg');
  const connectionsGroup = document.getElementById('connections-group');
  const dragConnectPath = document.getElementById('drag-connect-path');
  const nodesContainer = document.getElementById('nodes-container');
  const dungeonContainer = document.getElementById('dungeon-container');
  const dungeonGrid = document.getElementById('dungeon-grid');
  const dungeonControls = document.getElementById('dungeon-controls');

  // Listas de UI
  const blocksList = document.getElementById('blocks-list');
  const connectionsList = document.getElementById('connections-list');
  const nodesBadgeCount = document.getElementById('nodes-badge-count');
  const connectionsBadgeCount = document.getElementById('connections-badge-count');

  // Botones y Selectores
  const btnPlay = document.getElementById('btn-play');
  const playText = document.getElementById('play-text');
  const btnReset = document.getElementById('btn-reset');
  const btnAddBlock = document.getElementById('btn-add-block');
  const btnClearBlocks = document.getElementById('btn-clear-blocks');
  const btnToggleConnectMode = document.getElementById('btn-toggle-connect-mode');
  const connectModeLabel = document.getElementById('connect-mode-label');

  // Modales
  const modalAiCode = document.getElementById('modal-ai-code');
  const modalMasterPrompt = document.getElementById('modal-master-prompt');
  const btnOpenAiModal = document.getElementById('btn-open-ai-modal');
  const btnCloseAiModal = document.getElementById('btn-close-ai-modal');
  const btnOpenPromptModal = document.getElementById('btn-open-prompt-modal');
  const btnClosePromptModal = document.getElementById('btn-close-prompt-modal');
  const btnApplyAiCode = document.getElementById('btn-apply-ai-code');
  const btnFormatExample = document.getElementById('btn-format-example');
  const btnCopyPrompt = document.getElementById('btn-copy-prompt');
  const aiCodeInput = document.getElementById('ai-code-input');

  // Exportación
  const btnStartExport = document.getElementById('btn-start-export');
  const exportBanner = document.getElementById('export-banner');
  const exportStatusTitle = document.getElementById('export-status-title');
  const exportStatusSub = document.getElementById('export-status-sub');
  const exportProgressFill = document.getElementById('export-progress-fill');
  const btnCancelExport = document.getElementById('btn-cancel-export');
  const paramExportDuration = document.getElementById('param-export-duration');
  const valExportDuration = document.getElementById('val-export-duration');
  const summaryFramesCount = document.getElementById('summary-frames-count');

  // --- Estado Global ---
  let currentMode = 'diagram'; // 'diagram' | 'dungeon'
  let isPlaying = false;
  let isConnectingMode = false;
  let connectSourceNodeId = null;
  let isDraggingNode = false;
  let draggedNodeId = null;
  let dragOffset = { x: 0, y: 0 };
  let isDraggingPort = false;
  let portSourceNodeId = null;

  let nodes = [];
  let connections = [];
  let sequence = [];
  let animationStep = 0;
  let playbackTimer = null;

  // Parámetros de animación
  let stepSpeed = 0.5; // segundos por paso
  let animEffect = 'bounce';
  let blockScale = 1.0;
  let arrowWidth = 3;
  let soundEnabled = true;
  let loopEnabled = false;

  // Mazmorra 5x5
  const DUNGEON_SIZE = 5;
  let dungeonCells = []; // Array de 25 celdas
  let dungeonSelectedTool = 'good'; // 'good' | 'bad' | 'empty'
  let dungeonAnimationTimer = null;
  let dungeonCurrentStep = 0;

  // Exportación
  let isExporting = false;
  let exportZipInstance = null;
  let selectedExportFps = 30;
  let selectedExportBgMode = 'transparent';

  // Coordenadas base normalizadas (1920x1080)
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;

  /* ========================================================
     SÍNTESIS DE SONIDO (WEB AUDIO API - "PUPUPUP")
     ======================================================== */
  let audioCtx = null;
  let lastSoundTime = 0;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playPupSound(type = 'normal') {
    if (!soundEnabled) return;

    const nowPerf = performance.now();
    if (nowPerf - lastSoundTime < 28) return; // Anti-saturación
    lastSoundTime = nowPerf;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      let startFreq = 540 + (Math.random() * 80 - 40);
      let endFreq = 120;
      let duration = 0.055;

      if (type === 'good') {
        startFreq = 740 + (Math.random() * 60);
        endFreq = 260;
        duration = 0.065;
      } else if (type === 'bad') {
        startFreq = 260;
        endFreq = 75;
        duration = 0.08;
      } else if (type === 'arrow') {
        startFreq = 420;
        endFreq = 620;
        duration = 0.045;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  /* ========================================================
     SISTEMA DE COORDENADAS Y ESCALA
     ======================================================== */
  function getStageScale() {
    const stageWidth = stage.clientWidth || window.innerWidth;
    const stageHeight = stage.clientHeight || window.innerHeight;
    const scaleX = stageWidth / CANVAS_WIDTH;
    const scaleY = stageHeight / CANVAS_HEIGHT;
    return { scaleX, scaleY, stageWidth, stageHeight };
  }

  function canvasToScreen(x, y) {
    const { scaleX, scaleY } = getStageScale();
    return { x: x * scaleX, y: y * scaleY };
  }

  function screenToCanvas(screenX, screenY) {
    const { scaleX, scaleY } = getStageScale();
    return { x: screenX / scaleX, y: screenY / scaleY };
  }

  /* ========================================================
     GESTIÓN DE NODOS / BLOQUES
     ======================================================== */
  function addNode(data = {}) {
    const id = data.id || 'nodo_' + Math.random().toString(36).substring(2, 7);
    const title = data.title || 'NUEVO BLOQUE';
    const subtitle = data.subtitle || 'PROCESO';
    const color = data.color || '#38bdf8';
    const badge = data.badge || title.charAt(0).toUpperCase();
    const x = typeof data.x === 'number' ? data.x : 960;
    const y = typeof data.y === 'number' ? data.y : 540;

    const node = {
      id,
      title,
      subtitle,
      color,
      badge,
      x,
      y,
      visible: true
    };

    nodes.push(node);
    renderNodes();
    updateUILists();
    return node;
  }

  function removeNode(id) {
    nodes = nodes.filter(n => n.id !== id);
    connections = connections.filter(c => c.from !== id && c.to !== id);
    renderNodes();
    renderConnections();
    updateUILists();
  }

  function addConnection(fromId, toId, color = null, label = '') {
    if (fromId === toId) return;
    const exists = connections.some(c => c.from === fromId && c.to === toId);
    if (exists) return;

    const sourceNode = nodes.find(n => n.id === fromId);
    const connColor = color || (sourceNode ? sourceNode.color : '#38bdf8');

    connections.push({
      id: 'conn_' + fromId + '_' + toId,
      from: fromId,
      to: toId,
      color: connColor,
      label: label || '',
      visible: true
    });

    renderConnections();
    updateUILists();
  }

  function removeConnection(id) {
    connections = connections.filter(c => c.id !== id);
    renderConnections();
    updateUILists();
  }

  /* ========================================================
     RENDERIZADO DE NODOS EN EL DOM
     ======================================================== */
  function renderNodes() {
    nodesContainer.innerHTML = '';

    nodes.forEach(node => {
      const screenPos = canvasToScreen(node.x, node.y);

      const el = document.createElement('div');
      el.className = 'diagram-node';
      el.id = 'node-el-' + node.id;
      el.dataset.nodeId = node.id;
      el.style.borderColor = node.color;
      el.style.left = screenPos.x + 'px';
      el.style.top = screenPos.y + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${blockScale})`;

      if (!node.visible) {
        el.style.display = 'none';
      }

      // Cabecera con Badge y Título
      const header = document.createElement('div');
      header.className = 'node-header';

      const badgeEl = document.createElement('div');
      badgeEl.className = 'node-badge';
      badgeEl.style.backgroundColor = node.color;
      badgeEl.textContent = node.badge || node.title.charAt(0);

      const titleEl = document.createElement('div');
      titleEl.className = 'node-title';
      titleEl.textContent = node.title;

      header.appendChild(badgeEl);
      header.appendChild(titleEl);

      // Subtítulo
      const subEl = document.createElement('div');
      subEl.className = 'node-subtitle';
      subEl.textContent = node.subtitle;

      // Puertos de conexión punta a punta
      const portOut = document.createElement('div');
      portOut.className = 'node-port node-port-out';
      portOut.title = 'Arrastra para conectar con otro bloque';
      portOut.dataset.portType = 'out';
      portOut.dataset.nodeId = node.id;

      const portIn = document.createElement('div');
      portIn.className = 'node-port node-port-in';
      portIn.title = 'Punto de entrada';
      portIn.dataset.portType = 'in';
      portIn.dataset.nodeId = node.id;

      el.appendChild(header);
      el.appendChild(subEl);
      el.appendChild(portOut);
      el.appendChild(portIn);

      // Eventos Drag & Drop de Nodo
      el.addEventListener('mousedown', onNodeMouseDown);
      portOut.addEventListener('mousedown', onPortMouseDown);

      // Evento de clic en modo unión
      el.addEventListener('click', (e) => {
        if (isConnectingMode) {
          e.stopPropagation();
          handleNodeClickConnect(node.id);
        }
      });

      nodesContainer.appendChild(el);
    });

    renderConnections();
  }

  /* ========================================================
     RENDERIZADO DE FLECHAS Y CONEXIONES (SVG BEZIER)
     ======================================================== */
  function getArrowMarkerUrl(color) {
    if (color === '#38bdf8') return 'url(#arrowhead-sky)';
    if (color === '#f59e0b') return 'url(#arrowhead-amber)';
    if (color === '#10b981') return 'url(#arrowhead-emerald)';
    if (color === '#ef4444') return 'url(#arrowhead-rose)';
    if (color === '#a855f7') return 'url(#arrowhead-violet)';
    return 'url(#arrowhead-white)';
  }

  function renderConnections() {
    connectionsGroup.innerHTML = '';

    connections.forEach(conn => {
      const source = nodes.find(n => n.id === conn.from);
      const target = nodes.find(n => n.id === conn.to);
      if (!source || !target) return;
      if (!conn.visible || !source.visible || !target.visible) return;

      const sPos = canvasToScreen(source.x, source.y);
      const tPos = canvasToScreen(target.x, target.y);

      // Conexión de derecha a izquierda del nodo
      const halfW = (105) * (stage.clientWidth / CANVAS_WIDTH) * blockScale;
      const startX = sPos.x + (sPos.x < tPos.x ? halfW : -halfW);
      const startY = sPos.y;
      const endX = tPos.x + (sPos.x < tPos.x ? -halfW : halfW);
      const endY = tPos.y;

      const dx = endX - startX;
      const dy = endY - startY;
      const curvature = Math.max(Math.abs(dx) * 0.45, 40);

      const cp1X = startX + (dx >= 0 ? curvature : -curvature);
      const cp1Y = startY;
      const cp2X = endX - (dx >= 0 ? curvature : -curvature);
      const cp2Y = endY;

      const d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

      // Ruta SVG de la curva
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('class', 'connection-curve');
      pathEl.setAttribute('stroke', conn.color || '#38bdf8');
      pathEl.setAttribute('stroke-width', arrowWidth);
      pathEl.setAttribute('marker-end', getArrowMarkerUrl(conn.color));
      pathEl.id = 'conn-path-' + conn.id;

      connectionsGroup.appendChild(pathEl);

      // Etiqueta en el centro de la flecha
      if (conn.label) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 8;

        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', midX);
        textEl.setAttribute('y', midY);
        textEl.setAttribute('class', 'connection-label');
        textEl.textContent = conn.label;

        connectionsGroup.appendChild(textEl);
      }
    });
  }

  /* ========================================================
     INTERACCIÓN CON RATÓN (DRAG & DROP Y CONEXIONES PUNTA A PUNTA)
     ======================================================== */
  function onNodeMouseDown(e) {
    if (isConnectingMode || isDraggingPort) return;
    if (e.target.classList.contains('node-port')) return;

    isDraggingNode = true;
    draggedNodeId = this.dataset.nodeId;

    const node = nodes.find(n => n.id === draggedNodeId);
    if (!node) return;

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    dragOffset = {
      x: canvasPos.x - node.x,
      y: canvasPos.y - node.y
    };

    this.classList.add('is-dragging');
    window.addEventListener('mousemove', onNodeMouseMove);
    window.addEventListener('mouseup', onNodeMouseUp);
  }

  function onNodeMouseMove(e) {
    if (!isDraggingNode || !draggedNodeId) return;

    const node = nodes.find(n => n.id === draggedNodeId);
    if (!node) return;

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    node.x = Math.max(100, Math.min(CANVAS_WIDTH - 100, canvasPos.x - dragOffset.x));
    node.y = Math.max(80, Math.min(CANVAS_HEIGHT - 80, canvasPos.y - dragOffset.y));

    const screenPos = canvasToScreen(node.x, node.y);
    const nodeEl = document.getElementById('node-el-' + node.id);
    if (nodeEl) {
      nodeEl.style.left = screenPos.x + 'px';
      nodeEl.style.top = screenPos.y + 'px';
    }

    renderConnections();
  }

  function onNodeMouseUp() {
    if (isDraggingNode && draggedNodeId) {
      const nodeEl = document.getElementById('node-el-' + draggedNodeId);
      if (nodeEl) {
        nodeEl.classList.remove('is-dragging');
      }
    }
    isDraggingNode = false;
    draggedNodeId = null;
    window.removeEventListener('mousemove', onNodeMouseMove);
    window.removeEventListener('mouseup', onNodeMouseUp);
  }

  // Conectar arrastrando desde un puerto (punta a punta)
  function onPortMouseDown(e) {
    e.stopPropagation();
    isDraggingPort = true;
    portSourceNodeId = this.dataset.nodeId;

    dragConnectPath.style.display = 'block';
    window.addEventListener('mousemove', onPortMouseMove);
    window.addEventListener('mouseup', onPortMouseUp);
  }

  function onPortMouseMove(e) {
    if (!isDraggingPort || !portSourceNodeId) return;

    const sourceNode = nodes.find(n => n.id === portSourceNodeId);
    if (!sourceNode) return;

    const sPos = canvasToScreen(sourceNode.x, sourceNode.y);
    const startX = sPos.x + (105 * (stage.clientWidth / CANVAS_WIDTH) * blockScale);
    const startY = sPos.y;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const d = `M ${startX} ${startY} Q ${(startX + currentX) / 2} ${startY}, ${currentX} ${currentY}`;
    dragConnectPath.setAttribute('d', d);
  }

  function onPortMouseUp(e) {
    dragConnectPath.style.display = 'none';
    window.removeEventListener('mousemove', onPortMouseMove);
    window.removeEventListener('mouseup', onPortMouseUp);

    if (isDraggingPort && portSourceNodeId) {
      // Buscar si el ratón cayó sobre otro nodo
      const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      const targetNodeEl = elemBelow ? elemBelow.closest('.diagram-node') : null;

      if (targetNodeEl) {
        const targetId = targetNodeEl.dataset.nodeId;
        if (targetId && targetId !== portSourceNodeId) {
          addConnection(portSourceNodeId, targetId);
          playPupSound('arrow');
        }
      }
    }

    isDraggingPort = false;
    portSourceNodeId = null;
  }

  function handleNodeClickConnect(nodeId) {
    if (!connectSourceNodeId) {
      connectSourceNodeId = nodeId;
      const el = document.getElementById('node-el-' + nodeId);
      if (el) el.classList.add('is-active-pulse');
    } else {
      if (connectSourceNodeId !== nodeId) {
        addConnection(connectSourceNodeId, nodeId);
        playPupSound('arrow');
      }
      const prevEl = document.getElementById('node-el-' + connectSourceNodeId);
      if (prevEl) prevEl.classList.remove('is-active-pulse');
      connectSourceNodeId = null;
    }
  }

  // Doble clic en lienzo para crear bloque
  stage.addEventListener('dblclick', (e) => {
    if (e.target.closest('.diagram-node') || e.target.closest('.control-panel') || e.target.closest('.modal-overlay')) return;
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    addNode({
      title: 'PASO ' + (nodes.length + 1),
      subtitle: 'PROCESO',
      x: Math.round(canvasPos.x),
      y: Math.round(canvasPos.y)
    });
    playPupSound('normal');
  });

  /* ========================================================
     MODO MAZMORRA 5x5 PROCEDURAL
     ======================================================== */
  function initDungeonGrid() {
    dungeonCells = [];
    dungeonGrid.innerHTML = '';

    for (let r = 0; r < DUNGEON_SIZE; r++) {
      for (let c = 0; c < DUNGEON_SIZE; c++) {
        const index = r * DUNGEON_SIZE + c;
        const cell = {
          index,
          row: r,
          col: c,
          type: 'empty', // 'empty' | 'start' | 'good' | 'bad' | 'goal'
          elevated: false,
          visible: true
        };
        dungeonCells.push(cell);

        const cellEl = document.createElement('div');
        cellEl.className = 'dungeon-cell';
        cellEl.id = 'dungeon-cell-' + index;
        cellEl.dataset.index = index;
        cellEl.textContent = `${r},${c}`;

        cellEl.addEventListener('click', () => {
          toggleDungeonCell(index);
        });

        dungeonGrid.appendChild(cellEl);
      }
    }

    generateProceduralDungeon();
  }

  function toggleDungeonCell(index) {
    const cell = dungeonCells[index];
    if (!cell) return;

    if (cell.type === dungeonSelectedTool) {
      cell.type = 'empty';
    } else {
      cell.type = dungeonSelectedTool;
    }

    updateDungeonCellUI(index);
    playPupSound(cell.type === 'good' ? 'good' : (cell.type === 'bad' ? 'bad' : 'normal'));
  }

  function updateDungeonCellUI(index) {
    const cell = dungeonCells[index];
    const el = document.getElementById('dungeon-cell-' + index);
    if (!el || !cell) return;

    el.className = 'dungeon-cell';
    if (cell.type === 'start') el.classList.add('cell-start');
    if (cell.type === 'good') el.classList.add('cell-good');
    if (cell.type === 'bad') el.classList.add('cell-bad');
    if (cell.type === 'goal') el.classList.add('cell-goal');
    if (cell.elevated) el.classList.add('is-elevated');
  }

  function generateProceduralDungeon() {
    // Limpiar todas
    dungeonCells.forEach((c, idx) => {
      c.type = 'empty';
      c.elevated = false;
      updateDungeonCellUI(idx);
    });

    // 1. Inicio en (0, 0)
    dungeonCells[0].type = 'start';
    updateDungeonCellUI(0);

    // 2. Meta en (4, 4)
    dungeonCells[24].type = 'goal';
    updateDungeonCellUI(24);

    // 3. Crear camino principal válido (verde)
    let currR = 0, currC = 0;
    const goodPath = [0];

    while (currR < 4 || currC < 4) {
      if (currR === 4) {
        currC++;
      } else if (currC === 4) {
        currR++;
      } else {
        if (Math.random() > 0.5) {
          currC++;
        } else {
          currR++;
        }
      }
      const idx = currR * 5 + currC;
      if (idx !== 24) {
        dungeonCells[idx].type = 'good';
        goodPath.push(idx);
      }
    }

    // 4. Crear 3 a 5 trampas / caminos fallidos adyacentes (rojo)
    let badCount = 0;
    while (badCount < 4) {
      const randIdx = Math.floor(Math.random() * 25);
      if (dungeonCells[randIdx].type === 'empty') {
        dungeonCells[randIdx].type = 'bad';
        badCount++;
      }
    }

    dungeonCells.forEach((_, idx) => updateDungeonCellUI(idx));
  }

  function playDungeonStepAnimation() {
    if (dungeonCurrentStep >= 25) {
      if (loopEnabled) {
        resetDungeonAnimation();
        dungeonAnimationTimer = setTimeout(playDungeonStepAnimation, stepSpeed * 1000);
      } else {
        stopPlayback();
      }
      return;
    }

    const cell = dungeonCells[dungeonCurrentStep];
    if (cell) {
      cell.elevated = true;
      updateDungeonCellUI(dungeonCurrentStep);

      const soundType = cell.type === 'good' ? 'good' : (cell.type === 'bad' ? 'bad' : 'normal');
      playPupSound(soundType);

      const info = document.getElementById('dungeon-step-info');
      if (info) {
        info.textContent = `Paso ${dungeonCurrentStep + 1} / 25 (${cell.type.toUpperCase()})`;
      }
    }

    dungeonCurrentStep++;
    dungeonAnimationTimer = setTimeout(playDungeonStepAnimation, stepSpeed * 1000);
  }

  function resetDungeonAnimation() {
    if (dungeonAnimationTimer) {
      clearTimeout(dungeonAnimationTimer);
      dungeonAnimationTimer = null;
    }
    dungeonCurrentStep = 0;
    dungeonCells.forEach((c, idx) => {
      c.elevated = false;
      updateDungeonCellUI(idx);
    });
    const info = document.getElementById('dungeon-step-info');
    if (info) info.textContent = 'Paso 0 / 25';
  }

  /* ========================================================
     MOTOR DE ANIMACIÓN DIAGRAMA PASO A PASO
     ======================================================== */
  function buildTimelineSequence() {
    sequence = [];

    // Si no hay secuencia definida por IA, crear secuencia automática lógica
    nodes.forEach((node, idx) => {
      sequence.push({
        type: 'popup',
        target: node.id,
        duration: stepSpeed
      });

      // Flechas que parten de este nodo
      const outgoing = connections.filter(c => c.from === node.id);
      outgoing.forEach(conn => {
        sequence.push({
          type: 'arrow',
          from: conn.from,
          to: conn.to,
          connId: conn.id,
          duration: stepSpeed
        });
      });
    });
  }

  function playNextStep() {
    if (!isPlaying) return;

    if (currentMode === 'dungeon') {
      playDungeonStepAnimation();
      return;
    }

    if (animationStep >= sequence.length) {
      if (loopEnabled) {
        resetAnimation();
        playbackTimer = setTimeout(playNextStep, stepSpeed * 1000);
      } else {
        stopPlayback();
      }
      return;
    }

    const step = sequence[animationStep];

    if (step.type === 'popup') {
      const node = nodes.find(n => n.id === step.target);
      if (node) {
        node.visible = true;
        const el = document.getElementById('node-el-' + node.id);
        if (el) {
          el.style.display = 'flex';
          el.className = 'diagram-node ' + (animEffect ? 'anim-' + animEffect : 'anim-bounce');
          el.classList.add('is-active-pulse');
          setTimeout(() => el.classList.remove('is-active-pulse'), 500);
        }
        playPupSound('normal');
      }
    } else if (step.type === 'arrow') {
      const conn = connections.find(c => c.from === step.from && c.to === step.to);
      if (conn) {
        conn.visible = true;
        renderConnections();

        const pathEl = document.getElementById('conn-path-' + conn.id);
        if (pathEl) {
          pathEl.classList.add('animating');
          pathEl.style.animationDuration = stepSpeed + 's';
        }
        playPupSound('arrow');
      }
    }

    animationStep++;
    playbackTimer = setTimeout(playNextStep, stepSpeed * 1000);
  }

  function startPlayback() {
    isPlaying = true;
    btnPlay.classList.add('is-playing');
    playText.textContent = 'Pausar Animación';

    if (welcomeHint) welcomeHint.classList.add('dismissed');

    if (currentMode === 'dungeon') {
      if (dungeonCurrentStep === 0) resetDungeonAnimation();
      playDungeonStepAnimation();
    } else {
      if (animationStep === 0) {
        // Ocultar todos los nodos y flechas para la revelación progresiva
        nodes.forEach(n => {
          n.visible = false;
          const el = document.getElementById('node-el-' + n.id);
          if (el) el.style.display = 'none';
        });
        connections.forEach(c => {
          c.visible = false;
        });
        renderConnections();
        buildTimelineSequence();
      }
      playNextStep();
    }
  }

  function stopPlayback() {
    isPlaying = false;
    btnPlay.classList.remove('is-playing');
    playText.textContent = 'Iniciar Animación';

    if (playbackTimer) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
    if (dungeonAnimationTimer) {
      clearTimeout(dungeonAnimationTimer);
      dungeonAnimationTimer = null;
    }
  }

  function togglePlayback() {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function resetAnimation() {
    stopPlayback();
    animationStep = 0;

    if (currentMode === 'dungeon') {
      resetDungeonAnimation();
    } else {
      // Restaurar visibilidad completa
      nodes.forEach(n => {
        n.visible = true;
        const el = document.getElementById('node-el-' + n.id);
        if (el) {
          el.style.display = 'flex';
          el.className = 'diagram-node';
        }
      });
      connections.forEach(c => {
        c.visible = true;
      });
      renderConnections();
    }
  }

  /* ========================================================
     PRESETS INSTANTÁNEOS
     ======================================================== */
  function loadPresetCastleCat() {
    setMode('diagram');
    nodes = [];
    connections = [];

    addNode({ id: 'mapa', title: 'MAPA', subtitle: 'INICIO', color: '#38bdf8', x: 380, y: 540, badge: 'M' });
    addNode({ id: 'tesoro', title: 'TESORO', subtitle: 'RECOMPENSA', color: '#f59e0b', x: 960, y: 290, badge: 'T' });
    addNode({ id: 'enemigo', title: 'ENEMIGO', subtitle: 'COMBATE', color: '#ef4444', x: 960, y: 790, badge: 'E' });
    addNode({ id: 'inventario', title: 'INVENTARIO', subtitle: 'GESTIÓN', color: '#10b981', x: 1540, y: 540, badge: 'I' });

    addConnection('mapa', 'tesoro', '#f59e0b');
    addConnection('tesoro', 'inventario', '#10b981');
    addConnection('mapa', 'enemigo', '#ef4444');
    addConnection('enemigo', 'inventario', '#10b981');
    addConnection('inventario', 'mapa', '#38bdf8', 'REPETIR');

    resetAnimation();
  }

  function loadPresetServer() {
    setMode('diagram');
    nodes = [];
    connections = [];

    addNode({ id: 'cliente', title: 'CLIENTE', subtitle: 'WEB / JUEGO', color: '#38bdf8', x: 360, y: 540, badge: 'C' });
    addNode({ id: 'gateway', title: 'API GATEWAY', subtitle: 'PROXY & AUTH', color: '#a855f7', x: 760, y: 540, badge: 'G' });
    addNode({ id: 'servidor', title: 'SERVIDOR NODE', subtitle: 'LÓGICA DEL JUEGO', color: '#10b981', x: 1160, y: 380, badge: 'S' });
    addNode({ id: 'db', title: 'BASE DE DATOS', subtitle: 'POSTGRESQL', color: '#f59e0b', x: 1560, y: 380, badge: 'DB' });
    addNode({ id: 'cache', title: 'REDIS CACHE', subtitle: 'ESTADO RÁPIDO', color: '#ef4444', x: 1160, y: 700, badge: 'R' });

    addConnection('cliente', 'gateway', '#38bdf8', 'REQUEST');
    addConnection('gateway', 'servidor', '#a855f7');
    addConnection('servidor', 'db', '#f59e0b');
    addConnection('servidor', 'cache', '#ef4444');
    addConnection('gateway', 'cliente', '#10b981', 'RESPONSE');

    resetAnimation();
  }

  function loadPresetDungeon() {
    setMode('dungeon');
    generateProceduralDungeon();
    resetDungeonAnimation();
  }

  function loadPresetTree() {
    setMode('diagram');
    nodes = [];
    connections = [];

    addNode({ id: 'inicio', title: 'CLASE BASE', subtitle: 'NIVEL 1', color: '#38bdf8', x: 960, y: 220, badge: '1' });
    addNode({ id: 'guerrero', title: 'GUERRERO', subtitle: 'CUERPO A CUERPO', color: '#ef4444', x: 520, y: 540, badge: 'G' });
    addNode({ id: 'mago', title: 'MAGO', subtitle: 'CONJUROS', color: '#a855f7', x: 1400, y: 540, badge: 'M' });
    addNode({ id: 'paladin', title: 'PALADÍN', subtitle: 'DEFENSA SAGRADA', color: '#f59e0b', x: 340, y: 860, badge: 'P' });
    addNode({ id: 'barbaro', title: 'BÁRBARO', subtitle: 'FURIA TOTAL', color: '#ef4444', x: 700, y: 860, badge: 'B' });
    addNode({ id: 'nigro', title: 'NIGROMANTE', subtitle: 'ALMAS', color: '#10b981', x: 1220, y: 860, badge: 'N' });
    addNode({ id: 'archimago', title: 'ARCHIMAGO', subtitle: 'RAYO Y FUEGO', color: '#38bdf8', x: 1580, y: 860, badge: 'A' });

    addConnection('inicio', 'guerrero', '#ef4444');
    addConnection('inicio', 'mago', '#a855f7');
    addConnection('guerrero', 'paladin', '#f59e0b');
    addConnection('guerrero', 'barbaro', '#ef4444');
    addConnection('mago', 'nigro', '#10b981');
    addConnection('mago', 'archimago', '#38bdf8');

    resetAnimation();
  }

  /* ========================================================
     PARSER Y IMPORTADOR DE IA (JSON & FLOWSCRIPT)
     ======================================================== */
  function parseAndApplyAiCode(code) {
    try {
      let cleaned = code.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();

      // Intento 1: Parsear como JSON estándar
      if (cleaned.startsWith('{')) {
        const data = JSON.parse(cleaned);

        if (data.nodes && Array.isArray(data.nodes)) {
          setMode('diagram');
          nodes = [];
          connections = [];

          // Auto-distribución si faltan x/y
          const total = data.nodes.length;
          data.nodes.forEach((n, idx) => {
            const defaultX = Math.round(240 + (idx * ((CANVAS_WIDTH - 480) / Math.max(1, total - 1))));
            const defaultY = 540 + ((idx % 2 === 0 ? -1 : 1) * 80);

            addNode({
              id: n.id,
              title: n.title,
              subtitle: n.subtitle || 'PROCESO',
              color: n.color || '#38bdf8',
              badge: n.badge || n.title.charAt(0),
              x: typeof n.x === 'number' ? n.x : defaultX,
              y: typeof n.y === 'number' ? n.y : defaultY
            });
          });

          if (data.sequence && Array.isArray(data.sequence)) {
            data.sequence.forEach(step => {
              if (step.type === 'arrow' || step.type === 'loop') {
                addConnection(step.from, step.to, step.color, step.label || '');
              }
            });
            sequence = data.sequence;
          }

          resetAnimation();
          modalAiCode.classList.add('hidden');
          return true;
        }
      }

      // Intento 2: Parsear como FlowScript (Mermaid-style DSL)
      if (cleaned.includes('node ') || cleaned.includes('timeline:')) {
        setMode('diagram');
        nodes = [];
        connections = [];

        const lines = cleaned.split('\n');
        lines.forEach(line => {
          const l = line.trim();
          if (l.startsWith('node ')) {
            // Ejemplo: node mapa "MAPA" [sub="INICIO", color="#38bdf8", x=380, y=540]
            const match = l.match(/node\s+([a-zA-Z0-9_-]+)\s+"([^"]+)"(?:\s*\[(.*)\])?/);
            if (match) {
              const id = match[1];
              const title = match[2];
              const attrStr = match[3] || '';
              const subMatch = attrStr.match(/sub="([^"]+)"/);
              const colorMatch = attrStr.match(/color="([^"]+)"/);
              const xMatch = attrStr.match(/x=([0-9.]+)/);
              const yMatch = attrStr.match(/y=([0-9.]+)/);

              addNode({
                id,
                title,
                subtitle: subMatch ? subMatch[1] : 'PROCESO',
                color: colorMatch ? colorMatch[1] : '#38bdf8',
                x: xMatch ? parseFloat(xMatch[1]) : 960,
                y: yMatch ? parseFloat(yMatch[1]) : 540
              });
            }
          } else if (l.includes('->')) {
            // Flechas en FlowScript
            const arrowMatch = l.match(/([a-zA-Z0-9_-]+)\s*->\s*([a-zA-Z0-9_-]+)/);
            if (arrowMatch) {
              addConnection(arrowMatch[1], arrowMatch[2]);
            }
          }
        });

        resetAnimation();
        modalAiCode.classList.add('hidden');
        return true;
      }

      alert('El formato no coincide con JSON o FlowScript válido. Carga el ejemplo para ver la sintaxis exacta.');
      return false;
    } catch (err) {
      alert('Error al procesar el código: ' + err.message);
      return false;
    }
  }

  /* ========================================================
     MODOS DE VISUALIZACIÓN (DIAGRAMA VS MAZMORRA)
     ======================================================== */
  function setMode(mode) {
    currentMode = mode;
    stopPlayback();

    const btnDiag = document.getElementById('mode-diagram');
    const btnDung = document.getElementById('mode-dungeon');

    if (mode === 'diagram') {
      btnDiag.classList.add('active');
      btnDung.classList.remove('active');
      stageSvg.style.display = 'block';
      nodesContainer.style.display = 'block';
      dungeonContainer.style.display = 'none';
      dungeonControls.style.display = 'none';
      renderNodes();
    } else {
      btnDung.classList.add('active');
      btnDiag.classList.remove('active');
      stageSvg.style.display = 'none';
      nodesContainer.style.display = 'none';
      dungeonContainer.style.display = 'flex';
      dungeonControls.style.display = 'flex';
      resetDungeonAnimation();
    }
  }

  /* ========================================================
     EXPORTADOR DETERMINISTA A ZIP (SECUENCIA PNG)
     ======================================================== */
  function drawDungeonToCanvas(ctx, width, height) {
    const scale = width / CANVAS_WIDTH;
    const centerX = width / 2;
    const centerY = height / 2;
    const cellSize = 72 * scale;
    const gap = 12 * scale;
    const totalSize = (DUNGEON_SIZE * cellSize) + ((DUNGEON_SIZE - 1) * gap);
    const startX = centerX - totalSize / 2;
    const startY = centerY - totalSize / 2;

    dungeonCells.forEach(cell => {
      const x = startX + (cell.col * (cellSize + gap));
      let y = startY + (cell.row * (cellSize + gap));
      if (cell.elevated) y -= 12 * scale;

      let fill = '#27272a';
      let stroke = '#3f3f46';

      if (cell.type === 'start') { fill = '#0284c7'; stroke = '#38bdf8'; }
      if (cell.type === 'good') { fill = '#059669'; stroke = '#10b981'; }
      if (cell.type === 'bad') { fill = '#dc2626'; stroke = '#ef4444'; }
      if (cell.type === 'goal') { fill = '#d97706'; stroke = '#f59e0b'; }

      // Sombra si está elevado
      if (cell.elevated) {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(x, y + (12 * scale), cellSize, cellSize);
      }

      ctx.fillStyle = fill;
      ctx.fillRect(x, y, cellSize, cellSize);
      ctx.lineWidth = 2.5 * scale;
      ctx.strokeStyle = stroke;
      ctx.strokeRect(x, y, cellSize, cellSize);
    });
  }

  function drawStageToCanvas(ctx, width, height, isTransparent, bgColor) {
    ctx.clearRect(0, 0, width, height);

    if (!isTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    if (currentMode === 'dungeon') {
      drawDungeonToCanvas(ctx, width, height);
      return;
    }

    const scaleX = width / CANVAS_WIDTH;
    const scaleY = height / CANVAS_HEIGHT;

    // 1. Dibujar conexiones (Curvas Bezier y flechas)
    connections.forEach(conn => {
      if (!conn.visible) return;
      const s = nodes.find(n => n.id === conn.from);
      const t = nodes.find(n => n.id === conn.to);
      if (!s || !t || !s.visible || !t.visible) return;

      const sx = s.x * scaleX;
      const sy = s.y * scaleY;
      const tx = t.x * scaleX;
      const ty = t.y * scaleY;

      const halfW = 105 * scaleX * blockScale;
      const startX = sx + (sx < tx ? halfW : -halfW);
      const startY = sy;
      const endX = tx + (sx < tx ? -halfW : halfW);
      const endY = ty;

      const dx = endX - startX;
      const curvature = Math.max(Math.abs(dx) * 0.45, 40 * scaleX);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + (dx >= 0 ? curvature : -curvature), startY,
        endX - (dx >= 0 ? curvature : -curvature), endY,
        endX, endY
      );
      ctx.lineWidth = arrowWidth * scaleX;
      ctx.strokeStyle = conn.color || '#38bdf8';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Flecha triangular
      const angle = Math.atan2(endY - startY, endX - (endX - (dx >= 0 ? curvature : -curvature)));
      const headLen = 14 * scaleX;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 7), endY - headLen * Math.sin(angle - Math.PI / 7));
      ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 7), endY - headLen * Math.sin(angle + Math.PI / 7));
      ctx.closePath();
      ctx.fillStyle = conn.color || '#38bdf8';
      ctx.fill();
    });

    // 2. Dibujar Nodos
    nodes.forEach(node => {
      if (!node.visible) return;

      const nx = node.x * scaleX;
      const ny = node.y * scaleY;
      const nodeW = 210 * scaleX * blockScale;
      const nodeH = 84 * scaleY * blockScale;
      const x = nx - nodeW / 2;
      const y = ny - nodeH / 2;
      const r = 12 * scaleX;

      // Caja del nodo
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = node.color || '#38bdf8';
      ctx.lineWidth = 2.5 * scaleX;

      ctx.beginPath();
      ctx.roundRect(x, y, nodeW, nodeH, r);
      ctx.fill();
      ctx.stroke();

      // Badge
      const badgeSize = 28 * scaleX * blockScale;
      const bx = x + (14 * scaleX);
      const by = y + (16 * scaleY);
      ctx.fillStyle = node.color || '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeSize, badgeSize, 6 * scaleX);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = `800 ${14 * scaleX * blockScale}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.badge || node.title.charAt(0), bx + badgeSize / 2, by + badgeSize / 2);

      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${15 * scaleX * blockScale}px 'Outfit', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.title, bx + badgeSize + (10 * scaleX), by + badgeSize / 2);

      // Subtítulo
      ctx.fillStyle = '#9ca3af';
      ctx.font = `600 ${11 * scaleX * blockScale}px 'Roboto Mono', monospace`;
      ctx.fillText(node.subtitle, bx + badgeSize + (10 * scaleX), by + badgeSize + (12 * scaleY));
    });
  }

  async function startPngSequenceExport() {
    if (typeof JSZip === 'undefined') {
      alert('La biblioteca JSZip no está lista. Refresca la página.');
      return;
    }

    const durationSec = parseInt(paramExportDuration.value) || 5;
    const fps = selectedExportFps;
    const totalFrames = durationSec * fps;
    const isTransparent = selectedExportBgMode === 'transparent';

    let bgColor = '#0f172a';
    if (document.body.classList.contains('bg-croma-green')) bgColor = '#00ff00';
    if (document.body.classList.contains('bg-croma-blue')) bgColor = '#0033cc';
    if (document.body.classList.contains('bg-light')) bgColor = '#f8fafc';

    const resSelect = document.getElementById('param-export-res').value;
    let width = 1920, height = 1080;
    if (resSelect === '1080x1920') { width = 1080; height = 1920; }
    if (resSelect === '1280x720') { width = 1280; height = 720; }
    if (resSelect === 'screen') { width = window.innerWidth; height = window.innerHeight; }

    const shouldRestart = document.getElementById('param-export-restart').checked;
    const shouldMute = document.getElementById('param-export-mute').checked;

    isExporting = true;
    exportZipInstance = new JSZip();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });

    const prevSound = soundEnabled;
    if (shouldMute) soundEnabled = false;

    // Mostrar banner de progreso
    exportBanner.classList.remove('hidden');
    exportStatusTitle.textContent = 'Iniciando renderizado de fotogramas...';
    exportStatusSub.textContent = `Fotograma 0 / ${totalFrames} (0%)`;
    exportProgressFill.style.width = '0%';

    if (shouldRestart) {
      resetAnimation();
    }
    if (!isPlaying) {
      startPlayback();
    }

    const frameInterval = 1000 / fps;
    let captured = 0;

    for (let f = 1; f <= totalFrames; f++) {
      if (!isExporting) break;

      drawStageToCanvas(ctx, width, height, isTransparent, bgColor);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!isExporting) break;

      const numStr = String(f).padStart(4, '0');
      exportZipInstance.file(`frame_${numStr}.png`, blob);

      captured++;
      const pct = Math.round((captured / totalFrames) * 100);
      exportStatusTitle.textContent = `Capturando fotogramas (${fps} FPS)...`;
      exportStatusSub.textContent = `Fotograma ${captured} / ${totalFrames} (${pct}%)`;
      exportProgressFill.style.width = pct + '%';

      await new Promise(r => setTimeout(r, frameInterval));
    }

    soundEnabled = prevSound;

    if (!isExporting) {
      exportStatusTitle.textContent = 'Exportación cancelada';
      setTimeout(() => exportBanner.classList.add('hidden'), 1500);
      return;
    }

    exportStatusTitle.textContent = 'Empaquetando archivo ZIP...';
    exportStatusSub.textContent = 'Generando descarga...';

    try {
      const zipBlob = await exportZipInstance.generateAsync({
        type: 'blob',
        compression: 'STORE'
      }, meta => {
        const zipPct = Math.round(meta.percent);
        exportStatusSub.textContent = `Comprimiendo ZIP: ${zipPct}%`;
        exportProgressFill.style.width = zipPct + '%';
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowmotion_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      exportStatusTitle.textContent = 'Descarga completada';
      exportStatusSub.textContent = `${captured} fotogramas exportados con éxito`;
      setTimeout(() => exportBanner.classList.add('hidden'), 2500);
    } catch (err) {
      alert('Error al generar el ZIP: ' + err.message);
      exportBanner.classList.add('hidden');
    }

    isExporting = false;
  }

  /* ========================================================
     ACTUALIZACIÓN DE LISTAS EN EL PANEL DE CONTROL
     ======================================================== */
  function updateUILists() {
    nodesBadgeCount.textContent = nodes.length;
    connectionsBadgeCount.textContent = connections.length;

    // Lista de Bloques
    blocksList.innerHTML = '';
    nodes.forEach(node => {
      const row = document.createElement('div');
      row.className = 'block-item-row';

      const left = document.createElement('div');
      left.className = 'block-item-left';

      const dot = document.createElement('div');
      dot.className = 'block-color-dot';
      dot.style.backgroundColor = node.color;

      const title = document.createElement('span');
      title.className = 'block-item-title';
      title.textContent = node.title;

      left.appendChild(dot);
      left.appendChild(title);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-item-del';
      delBtn.title = 'Eliminar bloque';
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      delBtn.addEventListener('click', () => removeNode(node.id));

      row.appendChild(left);
      row.appendChild(delBtn);
      blocksList.appendChild(row);
    });

    // Lista de Conexiones
    connectionsList.innerHTML = '';
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      const fromTitle = fromNode ? fromNode.title : conn.from;
      const toTitle = toNode ? toNode.title : conn.to;

      const row = document.createElement('div');
      row.className = 'conn-item-row';

      const left = document.createElement('div');
      left.className = 'block-item-left';

      const text = document.createElement('span');
      text.className = 'block-item-title';
      text.textContent = `${fromTitle} → ${toTitle}`;

      left.appendChild(text);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-item-del';
      delBtn.title = 'Eliminar flecha';
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      delBtn.addEventListener('click', () => removeConnection(conn.id));

      row.appendChild(left);
      row.appendChild(delBtn);
      connectionsList.appendChild(row);
    });
  }

  /* ========================================================
     INICIALIZACIÓN Y EVENT LISTENERS
     ======================================================== */
  function initEvents() {
    // Menú flotante y bienvenida
    menuBtn.addEventListener('click', () => {
      controlPanel.classList.toggle('hidden');
      if (welcomeHint) welcomeHint.classList.add('dismissed');
    });

    welcomeHint.addEventListener('click', () => {
      controlPanel.classList.remove('hidden');
      welcomeHint.classList.add('dismissed');
    });

    // Pestañas del Panel
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.dataset.tab;
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    // Modos
    document.getElementById('mode-diagram').addEventListener('click', () => setMode('diagram'));
    document.getElementById('mode-dungeon').addEventListener('click', () => setMode('dungeon'));

    // Botones de acción principales
    btnPlay.addEventListener('click', togglePlayback);
    btnReset.addEventListener('click', resetAnimation);

    btnAddBlock.addEventListener('click', () => {
      addNode({
        title: 'NODO ' + (nodes.length + 1),
        subtitle: 'PROCESO'
      });
      playPupSound('normal');
    });

    btnClearBlocks.addEventListener('click', () => {
      nodes = [];
      connections = [];
      renderNodes();
      updateUILists();
    });

    btnToggleConnectMode.addEventListener('click', () => {
      isConnectingMode = !isConnectingMode;
      btnToggleConnectMode.classList.toggle('active-mode', isConnectingMode);
      connectModeLabel.textContent = isConnectingMode ? 'Haz clic en 2 nodos' : 'Unir Nodos';
      if (!isConnectingMode && connectSourceNodeId) {
        const el = document.getElementById('node-el-' + connectSourceNodeId);
        if (el) el.classList.remove('is-active-pulse');
        connectSourceNodeId = null;
      }
    });

    // Presets
    document.getElementById('btn-preset-castlecat').addEventListener('click', loadPresetCastleCat);
    document.getElementById('btn-preset-server').addEventListener('click', loadPresetServer);
    document.getElementById('btn-preset-dungeon').addEventListener('click', loadPresetDungeon);
    document.getElementById('btn-preset-tree').addEventListener('click', loadPresetTree);

    // Herramientas Mazmorra
    document.querySelectorAll('#dungeon-tool-selector .pill-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#dungeon-tool-selector .pill-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dungeonSelectedTool = btn.dataset.tool;
      });
    });

    document.getElementById('btn-regen-dungeon').addEventListener('click', () => {
      generateProceduralDungeon();
      resetDungeonAnimation();
    });

    // Sliders y Parámetros
    const paramStepSpeed = document.getElementById('param-step-speed');
    const valStepSpeed = document.getElementById('val-step-speed');
    paramStepSpeed.addEventListener('input', (e) => {
      stepSpeed = parseFloat(e.target.value);
      valStepSpeed.textContent = stepSpeed + ' seg';
    });

    const paramAnimEffect = document.getElementById('param-anim-effect');
    paramAnimEffect.addEventListener('change', (e) => {
      animEffect = e.target.value;
    });

    const paramBlockScale = document.getElementById('param-block-scale');
    const valBlockScale = document.getElementById('val-block-scale');
    paramBlockScale.addEventListener('input', (e) => {
      blockScale = parseFloat(e.target.value);
      valBlockScale.textContent = blockScale.toFixed(2) + 'x';
      renderNodes();
    });

    const paramArrowWidth = document.getElementById('param-arrow-width');
    const valArrowWidth = document.getElementById('val-arrow-width');
    paramArrowWidth.addEventListener('input', (e) => {
      arrowWidth = parseInt(e.target.value);
      valArrowWidth.textContent = arrowWidth + ' px';
      renderConnections();
    });

    const paramSound = document.getElementById('param-sound-enabled');
    paramSound.addEventListener('change', (e) => {
      soundEnabled = e.target.checked;
    });

    const paramLoop = document.getElementById('param-loop-enabled');
    paramLoop.addEventListener('change', (e) => {
      loopEnabled = e.target.checked;
    });

    // Fondos Croma
    document.querySelectorAll('.bg-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.bg-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        document.body.className = dot.dataset.bg;
      });
    });

    // Exportación
    paramExportDuration.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      valExportDuration.textContent = val + ' seg';
      updateSummaryFrames();
    });

    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        paramExportDuration.value = chip.dataset.duration;
        valExportDuration.textContent = chip.dataset.duration + ' seg';
        updateSummaryFrames();
      });
    });

    document.querySelectorAll('#fps-selector .pill-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#fps-selector .pill-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedExportFps = parseInt(btn.dataset.fps);
        updateSummaryFrames();
      });
    });

    document.querySelectorAll('#export-bg-selector .pill-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#export-bg-selector .pill-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedExportBgMode = btn.dataset.bgMode;
      });
    });

    function updateSummaryFrames() {
      const dur = parseInt(paramExportDuration.value) || 5;
      const total = dur * selectedExportFps;
      summaryFramesCount.textContent = total + ' PNGs';
    }

    btnStartExport.addEventListener('click', startPngSequenceExport);
    btnCancelExport.addEventListener('click', () => {
      isExporting = false;
    });

    // Modales IA
    btnOpenAiModal.addEventListener('click', () => modalAiCode.classList.remove('hidden'));
    btnCloseAiModal.addEventListener('click', () => modalAiCode.classList.add('hidden'));

    btnOpenPromptModal.addEventListener('click', () => modalMasterPrompt.classList.remove('hidden'));
    btnClosePromptModal.addEventListener('click', () => modalMasterPrompt.classList.add('hidden'));

    btnApplyAiCode.addEventListener('click', () => {
      const code = aiCodeInput.value;
      if (!code.trim()) {
        alert('Pega primero el código JSON o FlowScript generado por la IA.');
        return;
      }
      parseAndApplyAiCode(code);
    });

    btnFormatExample.addEventListener('click', () => {
      aiCodeInput.value = JSON.stringify({
        nodes: [
          { id: "jugador", title: "JUGADOR", subtitle: "ENTRADA", color: "#38bdf8", x: 380, y: 540, badge: "J" },
          { id: "servidor", title: "SERVIDOR", subtitle: "FÍSICAS", color: "#10b981", x: 960, y: 540, badge: "S" },
          { id: "enemigos", title: "ENEMIGOS", subtitle: "IA BOT", color: "#ef4444", x: 1540, y: 540, badge: "E" }
        ],
        sequence: [
          { type: "popup", target: "jugador" },
          { type: "arrow", from: "jugador", to: "servidor", color: "#38bdf8" },
          { type: "popup", target: "servidor" },
          { type: "arrow", from: "servidor", to: "enemigos", color: "#ef4444" },
          { type: "popup", target: "enemigos" }
        ]
      }, null, 2);
    });

    btnCopyPrompt.addEventListener('click', () => {
      const text = document.getElementById('master-prompt-text').value;
      navigator.clipboard.writeText(text).then(() => {
        alert('Prompt maestro copiado al portapapeles. Pégalo en ChatGPT, Claude o Gemini.');
        modalMasterPrompt.classList.add('hidden');
      });
    });

    // Atajos de Teclado
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'h' || e.key === 'H') {
        controlPanel.classList.toggle('hidden');
        if (welcomeHint) welcomeHint.classList.add('dismissed');
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === 'r' || e.key === 'R') {
        resetAnimation();
      }
    });

    // Redimensionamiento de ventana
    window.addEventListener('resize', () => {
      renderNodes();
    });
  }

  // Inicio de la aplicación
  function initApp() {
    initEvents();
    initDungeonGrid();
    loadPresetCastleCat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
