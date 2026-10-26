/* ========================================================
   FLOWMOTION STUDIO — MOTOR DE DIAGRAMAS ANIMADOS
   EternoDev Standard — Pure Vanilla JS, No Emojis, Flat Colors
   ======================================================== */

(function () {
  'use strict';

  // --- Paleta de colores planos ---
  const FLAT_COLORS = [
    '#38bdf8', // Celeste / Sky
    '#10b981', // Verde esmeralda (Éxito / Válido)
    '#f59e0b', // Ámbar / Dorado (Advertencia / Condición)
    '#ef4444', // Rojo (Error / Bloqueo)
    '#a855f7', // Púrpura (Bucle / Algoritmo)
    '#ec4899', // Rosa
    '#06b6d4', // Cian
    '#84cc16'  // Lima
  ];
  let colorIndex = 0;
  function getNextColor() {
    const c = FLAT_COLORS[colorIndex % FLAT_COLORS.length];
    colorIndex++;
    return c;
  }

  // --- Dimensiones por defecto de nodos ---
  const DEFAULT_NODE_WIDTH = 220;
  const DEFAULT_NODE_HEIGHT = 80;

  // --- Estado Global ---
  let nodes = [];
  let connections = [];
  let sequence = []; // Pasos del timeline { id, type: 'popup'|'arrow'|'color', targetId, color, connId, label }

  let selectedNodeId = null;
  let selectedConnId = null;
  let clipboardNode = null;

  // Modos de interacción
  let isConnectingMode = false;
  let connectSourceNodeId = null;

  // Dragging de nodo
  let isDraggingNode = false;
  let draggedNodeId = null;
  let dragOffset = { x: 0, y: 0 };

  // Resizing de nodo
  let isResizingNode = false;
  let resizingNodeId = null;
  let resizeStart = { x: 0, y: 0, w: 0, h: 0 };

  // Dragging de puerto (punta a punta)
  let isDraggingPort = false;
  let portSource = { nodeId: null, port: null, startX: 0, startY: 0 };

  // Historial (Undo / Redo)
  const historyStack = [];
  let historyIndex = -1;
  const MAX_HISTORY = 40;

  // Reproducción
  let isPlaying = false;
  let currentStepIndex = 0;
  let playbackTimer = null;
  let stepSpeed = 0.5; // segundos
  let animEffect = 'bounce';
  let arrowWidth = 3;
  let soundEnabled = true;
  let loopEnabled = false;

  // Exportación
  let isExporting = false;
  let cancelExportFlag = false;

  // Audio Context (Web Audio API)
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playPopSound(type = 'normal') {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'arrow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.09);
        gain.gain.setValueAtTime(0.20, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'color') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else {
        // Bloque popup
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      // Audio no disponible
    }
  }

  // --- Elementos del DOM ---
  const stage = document.getElementById('stage');
  const controlPanel = document.getElementById('control-panel');
  const welcomeHint = document.getElementById('welcome-hint');
  const menuBtn = document.getElementById('menu-btn');
  const stageSvg = document.getElementById('stage-connections-svg');
  const connectionsGroup = document.getElementById('connections-group');
  const dragConnectPath = document.getElementById('drag-connect-path');
  const nodesContainer = document.getElementById('nodes-container');

  // Listas de UI en el panel
  const blocksList = document.getElementById('blocks-list');
  const connectionsList = document.getElementById('connections-list');
  const timelineList = document.getElementById('timeline-list');
  const nodesBadgeCount = document.getElementById('nodes-badge-count');
  const connectionsBadgeCount = document.getElementById('connections-badge-count');

  // Subtabs Bloques vs Flechas
  const subtabNodesBtn = document.querySelector('[data-subtab="subtab-nodes"]');
  const subtabConnsBtn = document.querySelector('[data-subtab="subtab-conns"]');
  const subtabNodesView = document.getElementById('subtab-nodes');
  const subtabConnsView = document.getElementById('subtab-conns');

  // Botones y Selectores
  const btnPlay = document.getElementById('btn-play');
  const playText = document.getElementById('play-text');
  const btnPlayInline = document.getElementById('btn-play-inline');
  const playTextInline = document.getElementById('play-text-inline');
  const btnStepPrev = document.getElementById('btn-step-prev');
  const btnStepNext = document.getElementById('btn-step-next');
  const animScrubber = document.getElementById('param-anim-scrubber');
  const valAnimScrubber = document.getElementById('val-anim-scrubber');

  const btnReset = document.getElementById('btn-reset');
  const btnAddBlock = document.getElementById('btn-add-block');
  const btnClearBlocks = document.getElementById('btn-clear-blocks');
  const btnClearConnections = document.getElementById('btn-clear-connections');
  const btnToggleConnectMode = document.getElementById('btn-toggle-connect-mode');
  const connectModeLabel = document.getElementById('connect-mode-label');

  const btnAddColorStep = document.getElementById('btn-add-color-step');
  const btnRebuildTimeline = document.getElementById('btn-rebuild-timeline');

  // Parámetros de Animación
  const paramStepSpeed = document.getElementById('param-step-speed');
  const valStepSpeed = document.getElementById('val-step-speed');
  const paramAnimEffect = document.getElementById('param-anim-effect');
  const paramArrowWidth = document.getElementById('param-arrow-width');
  const valArrowWidth = document.getElementById('val-arrow-width');
  const paramSoundEnabled = document.getElementById('param-sound-enabled');
  const paramLoopEnabled = document.getElementById('param-loop-enabled');

  // Modales
  const modalAiCode = document.getElementById('modal-ai-code');
  const btnOpenAiModal = document.getElementById('btn-open-ai-modal');
  const btnCloseAiModal = document.getElementById('btn-close-ai-modal');
  const btnApplyAiCode = document.getElementById('btn-apply-ai-code');
  const btnFormatExample = document.getElementById('btn-format-example');
  const aiCodeInput = document.getElementById('ai-code-input');

  const modalMasterPrompt = document.getElementById('modal-master-prompt');
  const btnOpenPromptModal = document.getElementById('btn-open-prompt-modal');
  const btnClosePromptModal = document.getElementById('btn-close-prompt-modal');
  const btnCopyPrompt = document.getElementById('btn-copy-prompt');

  // Exportación
  const paramExportDuration = document.getElementById('param-export-duration');
  const valExportDuration = document.getElementById('val-export-duration');
  const fpsSelector = document.getElementById('fps-selector');
  const exportBgSelector = document.getElementById('export-bg-selector');
  const paramExportRes = document.getElementById('param-export-res');
  const paramExportRestart = document.getElementById('param-export-restart');
  const paramExportMute = document.getElementById('param-export-mute');
  const summaryFramesCount = document.getElementById('summary-frames-count');
  const btnStartExport = document.getElementById('btn-start-export');
  const exportBanner = document.getElementById('export-banner');
  const exportProgressFill = document.getElementById('export-progress-fill');
  const exportStatusTitle = document.getElementById('export-status-title');
  const exportStatusSub = document.getElementById('export-status-sub');
  const btnCancelExport = document.getElementById('btn-cancel-export');

  /* ========================================================
     SISTEMA DE HISTORIAL (UNDO / REDO)
     ======================================================== */
  function pushHistory() {
    if (historyIndex < historyStack.length - 1) {
      historyStack.splice(historyIndex + 1);
    }
    const state = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
      sequence: JSON.parse(JSON.stringify(sequence))
    };
    historyStack.push(state);
    if (historyStack.length > MAX_HISTORY) {
      historyStack.shift();
    } else {
      historyIndex++;
    }
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      applyHistoryState(historyStack[historyIndex]);
    }
  }

  function redo() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      applyHistoryState(historyStack[historyIndex]);
    }
  }

  function applyHistoryState(state) {
    if (!state) return;
    nodes = JSON.parse(JSON.stringify(state.nodes));
    connections = JSON.parse(JSON.stringify(state.connections));
    sequence = JSON.parse(JSON.stringify(state.sequence));
    selectedNodeId = null;
    selectedConnId = null;

    renderNodes();
    renderConnections();
    renderTimelineList();
    updateUILists();
  }

  /* ========================================================
     GEOMETRÍA Y CÁLCULO DE PUERTOS
     ======================================================== */
  function getNodeDimensions(node) {
    const w = node.width || (node.shape === 'square' ? 120 : DEFAULT_NODE_WIDTH);
    const h = node.height || (node.shape === 'square' ? 120 : DEFAULT_NODE_HEIGHT);
    return { w, h };
  }

  function getNodePortCoords(node, port) {
    const { w, h } = getNodeDimensions(node);
    const halfW = w / 2;
    const halfH = h / 2;

    switch (port) {
      case 'left':   return { x: node.x - halfW, y: node.y };
      case 'right':  return { x: node.x + halfW, y: node.y };
      case 'top':    return { x: node.x, y: node.y - halfH };
      case 'bottom': return { x: node.x, y: node.y + halfH };
      default:       return { x: node.x + halfW, y: node.y };
    }
  }

  function isPortConnected(nodeId, portName) {
    return connections.some(c =>
      (c.from === nodeId && (c.fromPort || 'right') === portName) ||
      (c.to === nodeId && (c.toPort || 'left') === portName)
    );
  }

  /* ========================================================
     CURVAS BÉZIER ROBUSTAS PARA CUALQUIER COMBINACIÓN DE PUERTOS
     ======================================================== */
  function getBezierPath(p1, fromPort, p2, toPort) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);

    let cp1x = x1, cp1y = y1;
    let cp2x = x2, cp2y = y2;

    // Conexión básica lateral hacia adelante
    if (fromPort === 'right' && toPort === 'left') {
      if (dx > 40) {
        const offset = Math.max(dx * 0.5, 40);
        return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
      } else {
        // Bucle hacia atrás (loop de retorno)
        const loopH = Math.max(Math.abs(dy) * 0.4, 70);
        const yDir = dy >= 0 ? -loopH : loopH;
        return `M ${x1} ${y1} C ${x1 + 80} ${y1 + yDir}, ${x2 - 80} ${y2 + yDir}, ${x2} ${y2}`;
      }
    }

    if (fromPort === 'left' && toPort === 'right') {
      if (dx < -40) {
        const offset = Math.max(Math.abs(dx) * 0.5, 40);
        return `M ${x1} ${y1} C ${x1 - offset} ${y1}, ${x2 + offset} ${y2}, ${x2} ${y2}`;
      } else {
        const loopH = Math.max(Math.abs(dy) * 0.4, 70);
        const yDir = dy >= 0 ? -loopH : loopH;
        return `M ${x1} ${y1} C ${x1 - 80} ${y1 + yDir}, ${x2 + 80} ${y2 + yDir}, ${x2} ${y2}`;
      }
    }

    // Conexión vertical
    if (fromPort === 'bottom' && toPort === 'top') {
      if (dy > 30) {
        const offset = Math.max(dy * 0.5, 30);
        return `M ${x1} ${y1} C ${x1} ${y1 + offset}, ${x2} ${y2 - offset}, ${x2} ${y2}`;
      } else {
        const xOffset = Math.max(Math.abs(dx) * 0.5, 70);
        const xDir = dx >= 0 ? xOffset : -xOffset;
        return `M ${x1} ${y1} C ${x1 + xDir} ${y1 + 60}, ${x2 + xDir} ${y2 - 60}, ${x2} ${y2}`;
      }
    }

    if (fromPort === 'top' && toPort === 'bottom') {
      if (dy < -30) {
        const offset = Math.max(Math.abs(dy) * 0.5, 30);
        return `M ${x1} ${y1} C ${x1} ${y1 - offset}, ${x2} ${y2 + offset}, ${x2} ${y2}`;
      } else {
        const xOffset = Math.max(Math.abs(dx) * 0.5, 70);
        const xDir = dx >= 0 ? xOffset : -xOffset;
        return `M ${x1} ${y1} C ${x1 + xDir} ${y1 - 60}, ${x2 + xDir} ${y2 + 60}, ${x2} ${y2}`;
      }
    }

    // Mismo puerto: bottom-to-bottom o top-to-top (bucles de reintento / salto)
    if (fromPort === 'bottom' && toPort === 'bottom') {
      const drop = Math.max(Math.abs(dx) * 0.25, 60);
      return `M ${x1} ${y1} C ${x1} ${y1 + drop}, ${x2} ${y2 + drop}, ${x2} ${y2}`;
    }

    if (fromPort === 'top' && toPort === 'top') {
      const rise = Math.max(Math.abs(dx) * 0.25, 60);
      return `M ${x1} ${y1} C ${x1} ${y1 - rise}, ${x2} ${y2 - rise}, ${x2} ${y2}`;
    }

    // Regla general con vectores ortogonales según puerto
    const normalOffset = Math.min(Math.max(dist * 0.45, 45), 140);

    switch (fromPort) {
      case 'right':  cp1x = x1 + normalOffset; cp1y = y1; break;
      case 'left':   cp1x = x1 - normalOffset; cp1y = y1; break;
      case 'bottom': cp1x = x1; cp1y = y1 + normalOffset; break;
      case 'top':    cp1x = x1; cp1y = y1 - normalOffset; break;
    }

    switch (toPort) {
      case 'left':   cp2x = x2 - normalOffset; cp2y = y2; break;
      case 'right':  cp2x = x2 + normalOffset; cp2y = y2; break;
      case 'top':    cp2x = x2; cp2y = y2 - normalOffset; break;
      case 'bottom': cp2x = x2; cp2y = y2 + normalOffset; break;
    }

    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }

  // Generador dinámico de marcador de punta de flecha con color exacto
  function getMarkerUrlForColor(color) {
    const defs = stageSvg.querySelector('defs');
    if (!defs) return '';

    const safeId = 'arrowhead-' + color.replace(/[^a-zA-Z0-9]/g, '');
    let marker = document.getElementById(safeId);

    if (!marker) {
      marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', safeId);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '7');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '6');
      marker.setAttribute('markerHeight', '6');
      marker.setAttribute('orient', 'auto-start-reverse');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M 0 1.5 L 8 5 L 0 8.5 z');
      path.setAttribute('fill', color);
      marker.appendChild(path);
      defs.appendChild(marker);
    }

    return `url(#${safeId})`;
  }

  /* ========================================================
     GESTIÓN DE NODOS Y BLOQUES
     ======================================================== */
  function addNode(data = {}) {
    pushHistory();

    const id = data.id || 'node_' + Math.random().toString(36).substr(2, 6);
    const color = data.color || getNextColor();
    const type = data.type || 'process';
    const shape = data.shape || (type === 'decision' ? 'square' : 'rect');

    let defaultTitle = 'NODO';
    let defaultSub = 'PROCESO';

    if (type === 'loop') {
      defaultTitle = 'FOR I = 0..N';
      defaultSub = 'BUCLE 60 TICKS';
    } else if (type === 'decision') {
      defaultTitle = '¿COLISIÓN?';
      defaultSub = 'CONDICIÓN IF';
    } else if (type === 'code') {
      defaultTitle = 'EJECUTAR';
      defaultSub = 'socket.emit()';
    }

    const title = data.title || defaultTitle;
    const subtitle = data.subtitle || defaultSub;

    const newNode = {
      id,
      type,
      shape,
      title,
      subtitle,
      color,
      activeColor: color, // Para animaciones de cambio de color
      x: data.x || (window.innerWidth / 2 - 100 + (Math.random() * 80 - 40)),
      y: data.y || (window.innerHeight / 2 - 40 + (Math.random() * 60 - 30)),
      width: data.width || (shape === 'square' ? 120 : DEFAULT_NODE_WIDTH),
      height: data.height || (shape === 'square' ? 120 : DEFAULT_NODE_HEIGHT),
      badge: data.badge || (type === 'loop' ? 'FOR' : (type === 'decision' ? 'IF' : title.charAt(0).toUpperCase())),
      visible: true
    };

    nodes.push(newNode);
    selectNode(newNode.id);
    renderNodes();
    rebuildTimelineAuto();
    updateUILists();

    if (welcomeHint) welcomeHint.classList.add('hidden');
    return newNode;
  }

  function duplicateNode(nodeId) {
    const original = nodes.find(n => n.id === nodeId);
    if (!original) return;

    addNode({
      type: original.type,
      shape: original.shape,
      title: original.title,
      subtitle: original.subtitle,
      color: original.color,
      badge: original.badge,
      width: original.width,
      height: original.height,
      x: original.x + 50,
      y: original.y + 50
    });
    playPopSound('normal');
  }

  function removeNode(id) {
    pushHistory();
    nodes = nodes.filter(n => n.id !== id);
    connections = connections.filter(c => c.from !== id && c.to !== id);
    sequence = sequence.filter(s => s.targetId !== id && s.from !== id && s.to !== id);

    if (selectedNodeId === id) selectedNodeId = null;

    renderNodes();
    renderConnections();
    rebuildTimelineAuto();
    updateUILists();
  }

  /* ========================================================
     GESTIÓN DE FLECHAS Y CONEXIONES
     ======================================================== */
  function addConnection(fromId, toId, fromPort = null, toPort = null, color = null, label = '') {
    if (fromId === toId) return null;

    const source = nodes.find(n => n.id === fromId);
    const target = nodes.find(n => n.id === toId);
    if (!source || !target) return null;

    // Si ya existe la conexión exacta entre los mismos puertos, ignorar
    const exists = connections.some(c =>
      c.from === fromId && c.to === toId &&
      c.fromPort === (fromPort || 'right') &&
      c.toPort === (toPort || 'left')
    );
    if (exists) return null;

    pushHistory();

    const id = 'conn_' + Math.random().toString(36).substr(2, 6);
    const connColor = color || source.color || '#38bdf8';

    const newConn = {
      id,
      from: fromId,
      fromPort: fromPort || 'right',
      to: toId,
      toPort: toPort || 'left',
      color: connColor,
      label: label || '',
      visible: true
    };

    connections.push(newConn);
    selectConnection(newConn.id);

    renderNodes(); // Actualiza visibilidad de punchitos
    renderConnections();
    rebuildTimelineAuto();
    updateUILists();
    return newConn;
  }

  function removeConnection(id) {
    pushHistory();
    connections = connections.filter(c => c.id !== id);
    sequence = sequence.filter(s => s.connId !== id);

    if (selectedConnId === id) selectedConnId = null;

    const badge = document.getElementById('disconnect-badge');
    if (badge) badge.remove();

    renderNodes(); // Ocultar punchitos huérfanos
    renderConnections();
    rebuildTimelineAuto();
    updateUILists();
  }

  /* ========================================================
     SELECCIÓN DE ELEMENTOS
     ======================================================== */
  function selectNode(nodeId) {
    selectedNodeId = nodeId;
    selectedConnId = null;

    document.querySelectorAll('.diagram-node').forEach(el => {
      el.classList.toggle('is-selected', el.dataset.nodeId === nodeId);
    });

    document.querySelectorAll('.connection-curve').forEach(el => {
      el.classList.remove('is-selected');
    });

    const badge = document.getElementById('disconnect-badge');
    if (badge) badge.remove();

    updateUILists();
  }

  function selectConnection(connId) {
    selectedConnId = connId;
    selectedNodeId = null;

    document.querySelectorAll('.diagram-node').forEach(el => {
      el.classList.remove('is-selected');
    });

    document.querySelectorAll('.connection-curve').forEach(el => {
      el.classList.toggle('is-selected', el.id === 'conn-path-' + connId);
    });

    showDisconnectBadge(connId);
    updateUILists();

    // Cambiar a subtab de flechas si no está activo
    if (subtabConnsView.style.display === 'none') {
      switchSubtab('subtab-conns');
    }
  }

  function clearSelection() {
    selectedNodeId = null;
    selectedConnId = null;

    document.querySelectorAll('.diagram-node').forEach(el => el.classList.remove('is-selected'));
    document.querySelectorAll('.connection-curve').forEach(el => el.classList.remove('is-selected'));

    const badge = document.getElementById('disconnect-badge');
    if (badge) badge.remove();

    updateUILists();
  }

  function showDisconnectBadge(connId) {
    let badge = document.getElementById('disconnect-badge');
    if (badge) badge.remove();

    const conn = connections.find(c => c.id === connId);
    if (!conn) return;

    const s = nodes.find(n => n.id === conn.from);
    const t = nodes.find(n => n.id === conn.to);
    if (!s || !t) return;

    const p1 = getNodePortCoords(s, conn.fromPort || 'right');
    const p2 = getNodePortCoords(t, conn.toPort || 'left');

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    badge = document.createElement('button');
    badge.id = 'disconnect-badge';
    badge.className = 'disconnect-badge';
    badge.style.left = midX + 'px';
    badge.style.top = midY + 'px';
    badge.innerHTML = '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg><span>Desconectar</span>';

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      removeConnection(connId);
    });

    stage.appendChild(badge);
  }

  /* ========================================================
     RENDERIZADO DEL LIENZO: NODOS Y FORMAS
     ======================================================== */
  function renderNodes() {
    nodesContainer.innerHTML = '';

    nodes.forEach(node => {
      const el = document.createElement('div');
      const shapeClass = `shape-${node.shape || 'rect'}`;
      el.className = `diagram-node type-${node.type || 'process'} ${shapeClass}`;
      el.id = 'node-el-' + node.id;
      el.dataset.nodeId = node.id;

      const displayColor = node.activeColor || node.color;
      el.style.borderColor = displayColor;
      el.style.left = node.x + 'px';
      el.style.top = node.y + 'px';

      const { w, h } = getNodeDimensions(node);
      el.style.width = w + 'px';
      el.style.height = h + 'px';

      if (selectedNodeId === node.id) {
        el.classList.add('is-selected');
      }

      if (!node.visible) {
        el.style.display = 'none';
      }

      // Header con Badge y Título
      const header = document.createElement('div');
      header.className = 'node-header';

      const badgeEl = document.createElement('div');
      badgeEl.className = 'node-badge';
      badgeEl.style.backgroundColor = displayColor;
      badgeEl.textContent = node.badge || (node.type === 'loop' ? 'FOR' : (node.type === 'decision' ? 'IF' : node.title.charAt(0)));

      const titleEl = document.createElement('div');
      titleEl.className = 'node-title-display';
      titleEl.textContent = node.title;
      titleEl.title = 'Doble clic para editar texto';

      header.appendChild(badgeEl);
      header.appendChild(titleEl);

      // Subtítulo
      const subEl = document.createElement('div');
      subEl.className = 'node-sub-display';
      subEl.textContent = node.subtitle;
      subEl.title = 'Doble clic para editar texto';

      // 4 Puertos de Conexión (Arriba, Abajo, Izquierda, Derecha)
      const portR = createPortElement(node.id, 'right');
      const portL = createPortElement(node.id, 'left');
      const portT = createPortElement(node.id, 'top');
      const portB = createPortElement(node.id, 'bottom');

      // Resize Handle (Esquina inferior derecha)
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'node-resize-handle';
      resizeHandle.title = 'Arrastra para redimensionar';
      resizeHandle.addEventListener('mousedown', (e) => onResizeMouseDown(e, node.id));

      el.appendChild(header);
      el.appendChild(subEl);
      el.appendChild(portR);
      el.appendChild(portL);
      el.appendChild(portT);
      el.appendChild(portB);
      el.appendChild(resizeHandle);

      // Drag & Drop
      el.addEventListener('mousedown', onNodeMouseDown);

      // Selección al hacer clic
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isConnectingMode) {
          handleNodeClickConnect(node.id);
        } else {
          selectNode(node.id);
        }
      });

      // Doble clic para edición inline (ROBUSTA: sin cierre al cambiar de campo)
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        enableNodeInlineEdit(node, el, titleEl, subEl, badgeEl);
      });

      nodesContainer.appendChild(el);
    });

    renderConnections();
  }

  function createPortElement(nodeId, portName) {
    const p = document.createElement('div');
    p.className = `node-port port-${portName}`;
    p.title = `Puerto ${portName.toUpperCase()}`;
    p.dataset.nodeId = nodeId;
    p.dataset.port = portName;

    // Regla: Solo se muestra de forma fija si tiene una flecha conectada
    if (isPortConnected(nodeId, portName)) {
      p.classList.add('has-connection');
    }

    p.addEventListener('mousedown', onPortMouseDown);
    return p;
  }

  /* ========================================================
     EDICIÓN INLINE CORREGIDA (NO SE CIERRA AL TOCAR SUBTITLE)
     ======================================================== */
  function enableNodeInlineEdit(node, nodeEl, titleEl, subEl, badgeEl) {
    // Si ya está editando, no duplicar
    if (nodeEl.querySelector('.node-edit-box')) return;

    const currentTitle = node.title;
    const currentSub = node.subtitle;

    const editBox = document.createElement('div');
    editBox.className = 'node-edit-box';

    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.className = 'node-inline-input';
    inputTitle.value = currentTitle;
    inputTitle.placeholder = 'Título...';

    const inputSub = document.createElement('input');
    inputSub.type = 'text';
    inputSub.className = 'node-inline-input';
    inputSub.style.marginTop = '4px';
    inputSub.style.fontSize = '11px';
    inputSub.value = currentSub;
    inputSub.placeholder = 'Subtítulo...';

    editBox.appendChild(inputTitle);
    editBox.appendChild(inputSub);

    titleEl.style.display = 'none';
    subEl.style.display = 'none';
    nodeEl.appendChild(editBox);

    inputTitle.focus();
    inputTitle.select();

    let isSaved = false;

    function saveChanges() {
      if (isSaved) return;
      isSaved = true;

      const newTitle = inputTitle.value.trim() || 'NODO';
      const newSub = inputSub.value.trim() || 'PROCESO';

      if (node.title !== newTitle || node.subtitle !== newSub) {
        pushHistory();
        node.title = newTitle;
        node.subtitle = newSub;
        if (node.type === 'process') {
          node.badge = newTitle.charAt(0).toUpperCase();
        }
      }

      badgeEl.textContent = node.badge;
      titleEl.textContent = node.title;
      subEl.textContent = node.subtitle;

      titleEl.style.display = '';
      subEl.style.display = '';
      editBox.remove();

      document.removeEventListener('mousedown', onOutsideClick);
      rebuildTimelineAuto();
      updateUILists();
    }

    // Al pulsar Enter en título -> pasa el foco al subtítulo
    inputTitle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputSub.focus();
        inputSub.select();
      } else if (e.key === 'Escape') {
        saveChanges();
      }
    });

    // Al pulsar Enter en subtítulo -> guarda todo
    inputSub.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        saveChanges();
      }
    });

    // Cierre solo si el usuario hace clic fuera de este nodo
    const onOutsideClick = (e) => {
      if (!nodeEl.contains(e.target)) {
        saveChanges();
      }
    };
    setTimeout(() => {
      document.addEventListener('mousedown', onOutsideClick);
    }, 50);
  }

  /* ========================================================
     RENDERIZADO DE FLECHAS Y CONEXIONES (SVG CON HITBOX)
     ======================================================== */
  function renderConnections() {
    connectionsGroup.innerHTML = '';

    connections.forEach(conn => {
      const s = nodes.find(n => n.id === conn.from);
      const t = nodes.find(n => n.id === conn.to);
      if (!s || !t) return;
      if (!conn.visible || !s.visible || !t.visible) return;

      const p1 = getNodePortCoords(s, conn.fromPort || 'right');
      const p2 = getNodePortCoords(t, conn.toPort || 'left');

      const d = getBezierPath(p1, conn.fromPort || 'right', p2, conn.toPort || 'left');
      const isSelected = selectedConnId === conn.id;

      // 1. HITBOX TRANSPARENTE DE 20px (FACILITA LA SELECCIÓN POR CLIC)
      const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hitbox.setAttribute('d', d);
      hitbox.setAttribute('stroke', 'transparent');
      hitbox.setAttribute('stroke-width', '22');
      hitbox.setAttribute('fill', 'none');
      hitbox.setAttribute('style', 'cursor: pointer;');
      hitbox.id = 'conn-hitbox-' + conn.id;

      hitbox.addEventListener('click', (e) => {
        e.stopPropagation();
        selectConnection(conn.id);
      });

      // 2. CURVA VISUAL CON COLOR EXACTO
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('class', 'connection-curve' + (isSelected ? ' is-selected' : ''));
      pathEl.setAttribute('stroke', conn.color || '#38bdf8');
      pathEl.setAttribute('stroke-width', arrowWidth);
      pathEl.setAttribute('marker-end', getMarkerUrlForColor(conn.color || '#38bdf8'));
      pathEl.id = 'conn-path-' + conn.id;

      pathEl.addEventListener('click', (e) => {
        e.stopPropagation();
        selectConnection(conn.id);
      });

      connectionsGroup.appendChild(hitbox);
      connectionsGroup.appendChild(pathEl);

      // 3. ETIQUETA TEXTUAL EN EL CENTRO DE LA FLECHA
      if (conn.label) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 8;

        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', midX);
        textEl.setAttribute('y', midY);
        textEl.setAttribute('class', 'connection-label');
        textEl.textContent = conn.label;

        textEl.addEventListener('click', (e) => {
          e.stopPropagation();
          selectConnection(conn.id);
        });

        connectionsGroup.appendChild(textEl);
      }
    });

    if (selectedConnId) {
      showDisconnectBadge(selectedConnId);
    }
  }

  /* ========================================================
     INTERACCIÓN CON RATÓN (DRAG, RESIZE Y PUERTOS)
     ======================================================== */
  function onNodeMouseDown(e) {
    if (isConnectingMode || isDraggingPort || isResizingNode) return;
    if (e.target.classList.contains('node-port')) return;
    if (e.target.classList.contains('node-resize-handle')) return;
    if (e.target.classList.contains('node-inline-input')) return;

    isDraggingNode = true;
    draggedNodeId = this.dataset.nodeId;

    const node = nodes.find(n => n.id === draggedNodeId);
    if (!node) return;

    dragOffset = {
      x: e.clientX - node.x,
      y: e.clientY - node.y
    };

    selectNode(node.id);
    this.classList.add('is-dragging');
    window.addEventListener('mousemove', onNodeMouseMove);
    window.addEventListener('mouseup', onNodeMouseUp);
  }

  function onNodeMouseMove(e) {
    if (!isDraggingNode || !draggedNodeId) return;

    const node = nodes.find(n => n.id === draggedNodeId);
    if (!node) return;

    node.x = Math.max(80, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x));
    node.y = Math.max(50, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));

    const nodeEl = document.getElementById('node-el-' + node.id);
    if (nodeEl) {
      nodeEl.style.left = node.x + 'px';
      nodeEl.style.top = node.y + 'px';
    }

    renderConnections();
  }

  function onNodeMouseUp() {
    if (isDraggingNode && draggedNodeId) {
      const nodeEl = document.getElementById('node-el-' + draggedNodeId);
      if (nodeEl) nodeEl.classList.remove('is-dragging');
      pushHistory();
    }
    isDraggingNode = false;
    draggedNodeId = null;
    window.removeEventListener('mousemove', onNodeMouseMove);
    window.removeEventListener('mouseup', onNodeMouseUp);
  }

  // --- Resizing de Bloques ---
  function onResizeMouseDown(e, nodeId) {
    e.stopPropagation();
    e.preventDefault();

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    isResizingNode = true;
    resizingNodeId = nodeId;
    const { w, h } = getNodeDimensions(node);
    resizeStart = {
      x: e.clientX,
      y: e.clientY,
      w,
      h
    };

    selectNode(nodeId);
    window.addEventListener('mousemove', onResizeMouseMove);
    window.addEventListener('mouseup', onResizeMouseUp);
  }

  function onResizeMouseMove(e) {
    if (!isResizingNode || !resizingNodeId) return;
    const node = nodes.find(n => n.id === resizingNodeId);
    if (!node) return;

    const dx = e.clientX - resizeStart.x;
    const dy = e.clientY - resizeStart.y;

    if (node.shape === 'square') {
      const newDim = Math.max(80, Math.min(400, Math.round(resizeStart.w + (dx + dy) / 2)));
      node.width = newDim;
      node.height = newDim;
    } else {
      node.width = Math.max(120, Math.min(600, Math.round(resizeStart.w + dx)));
      node.height = Math.max(60, Math.min(400, Math.round(resizeStart.h + dy)));
    }

    const nodeEl = document.getElementById('node-el-' + node.id);
    if (nodeEl) {
      nodeEl.style.width = node.width + 'px';
      nodeEl.style.height = node.height + 'px';
    }

    renderConnections();
  }

  function onResizeMouseUp() {
    if (isResizingNode) {
      pushHistory();
    }
    isResizingNode = false;
    resizingNodeId = null;
    window.removeEventListener('mousemove', onResizeMouseMove);
    window.removeEventListener('mouseup', onResizeMouseUp);
  }

  // --- Conexión Punta a Punta desde Puertos ---
  function onPortMouseDown(e) {
    e.stopPropagation();
    const portEl = this;
    const nodeId = portEl.dataset.nodeId;
    const portName = portEl.dataset.port;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    isDraggingPort = true;
    const pCoords = getNodePortCoords(node, portName);
    portSource = {
      nodeId,
      port: portName,
      startX: pCoords.x,
      startY: pCoords.y
    };

    dragConnectPath.setAttribute('stroke', node.color || '#38bdf8');
    dragConnectPath.style.display = 'block';
    document.body.classList.add('is-dragging-port');

    window.addEventListener('mousemove', onPortMouseMove);
    window.addEventListener('mouseup', onPortMouseUp);
  }

  function onPortMouseMove(e) {
    if (!isDraggingPort) return;
    const currentX = e.clientX;
    const currentY = e.clientY;

    const d = getBezierPath(
      { x: portSource.startX, y: portSource.startY },
      portSource.port,
      { x: currentX, y: currentY },
      'left'
    );
    dragConnectPath.setAttribute('d', d);
  }

  function onPortMouseUp(e) {
    dragConnectPath.style.display = 'none';
    document.body.classList.remove('is-dragging-port');
    window.removeEventListener('mousemove', onPortMouseMove);
    window.removeEventListener('mouseup', onPortMouseUp);

    if (isDraggingPort && portSource.nodeId) {
      const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      const portTargetEl = elemBelow ? elemBelow.closest('.node-port') : null;
      const nodeTargetEl = elemBelow ? elemBelow.closest('.diagram-node') : null;

      if (portTargetEl && portTargetEl.dataset.nodeId !== portSource.nodeId) {
        addConnection(portSource.nodeId, portTargetEl.dataset.nodeId, portSource.port, portTargetEl.dataset.port);
        playPopSound('arrow');
      } else if (nodeTargetEl && nodeTargetEl.dataset.nodeId !== portSource.nodeId) {
        addConnection(portSource.nodeId, nodeTargetEl.dataset.nodeId, portSource.port, 'left');
        playPopSound('arrow');
      }
    }

    isDraggingPort = false;
    portSource = { nodeId: null, port: null, startX: 0, startY: 0 };
  }

  // --- Modo Unir Nodos por Clic ---
  function handleNodeClickConnect(nodeId) {
    if (!connectSourceNodeId) {
      connectSourceNodeId = nodeId;
      const el = document.getElementById('node-el-' + nodeId);
      if (el) el.classList.add('is-connect-source');
    } else {
      if (connectSourceNodeId !== nodeId) {
        addConnection(connectSourceNodeId, nodeId);
        playPopSound('arrow');
      }
      const prevEl = document.getElementById('node-el-' + connectSourceNodeId);
      if (prevEl) prevEl.classList.remove('is-connect-source');
      connectSourceNodeId = null;
    }
  }

  // Clic en escenario deselecciona
  stage.addEventListener('click', (e) => {
    if (e.target.closest('.diagram-node') || e.target.closest('.connection-curve') || e.target.closest('.connection-hitbox') || e.target.closest('.control-panel') || e.target.closest('.modal-overlay')) return;
    clearSelection();
  });

  // Doble clic en espacio vacío para crear un bloque
  stage.addEventListener('dblclick', (e) => {
    if (e.target.closest('.diagram-node') || e.target.closest('.control-panel') || e.target.closest('.modal-overlay')) return;
    addNode({
      x: e.clientX,
      y: e.clientY
    });
    playPopSound('normal');
  });

  /* ========================================================
     ORDEN Y SECUENCIA DE ANIMACIÓN (TIMELINE & STORYBOARD)
     ======================================================== */
  function rebuildTimelineAuto() {
    sequence = [];

    nodes.forEach(node => {
      sequence.push({
        id: 'step_node_' + node.id,
        type: 'popup',
        targetId: node.id,
        label: `Aparece: ${node.title}`
      });

      const outgoing = connections.filter(c => c.from === node.id);
      outgoing.forEach(conn => {
        const target = nodes.find(n => n.id === conn.to);
        const tTitle = target ? target.title : conn.to;
        sequence.push({
          id: 'step_conn_' + conn.id,
          type: 'arrow',
          connId: conn.id,
          label: `Flecha: ${node.title} → ${tTitle} ${conn.label ? '(' + conn.label + ')' : ''}`
        });
      });
    });

    updateScrubberLimits();
    renderTimelineList();
  }

  function addColorStep() {
    if (nodes.length === 0) return;
    pushHistory();

    const targetNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : nodes[0];
    const targetId = targetNode.id;

    // Alternar color llamativo (verde éxito o rojo alerta)
    const nextColor = targetNode.color === '#10b981' ? '#ef4444' : '#10b981';

    sequence.push({
      id: 'step_color_' + Math.random().toString(36).substr(2, 6),
      type: 'color',
      targetId: targetId,
      color: nextColor,
      label: `Color ${targetNode.title} → ${nextColor === '#10b981' ? 'Verde Éxito' : 'Rojo Alerta'}`
    });

    updateScrubberLimits();
    renderTimelineList();
  }

  function moveTimelineStep(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sequence.length) return;

    pushHistory();
    const temp = sequence[index];
    sequence[index] = sequence[targetIdx];
    sequence[targetIdx] = temp;

    renderTimelineList();
  }

  function removeTimelineStep(index) {
    pushHistory();
    sequence.splice(index, 1);
    updateScrubberLimits();
    renderTimelineList();
  }

  function updateScrubberLimits() {
    const max = Math.max(0, sequence.length);
    if (animScrubber) {
      animScrubber.max = max;
      animScrubber.value = currentStepIndex;
    }
    if (valAnimScrubber) {
      valAnimScrubber.textContent = `${currentStepIndex} / ${max}`;
    }
  }

  function renderTimelineList() {
    timelineList.innerHTML = '';

    if (sequence.length === 0) {
      const empty = document.createElement('div');
      empty.style.fontSize = '11.5px';
      empty.style.color = '#71717a';
      empty.style.padding = '12px 8px';
      empty.style.textAlign = 'center';
      empty.textContent = 'Añade bloques o flechas para ver la secuencia';
      timelineList.appendChild(empty);
      return;
    }

    sequence.forEach((step, idx) => {
      const row = document.createElement('div');
      row.className = 'timeline-step-row';
      if (currentStepIndex === idx + 1) {
        row.classList.add('is-current');
      }

      const left = document.createElement('div');
      left.className = 'step-row-left';

      const num = document.createElement('span');
      num.className = 'step-num-badge';
      num.textContent = `${idx + 1}.`;

      const txt = document.createElement('span');
      txt.className = 'step-label-text';
      txt.textContent = step.label;

      left.appendChild(num);
      left.appendChild(txt);

      // Si es paso de color, mostrar selector de color rápido
      if (step.type === 'color') {
        const cPicker = document.createElement('input');
        cPicker.type = 'color';
        cPicker.className = 'block-color-picker-input';
        cPicker.value = step.color || '#10b981';
        cPicker.title = 'Cambiar color de este paso';
        cPicker.addEventListener('input', (e) => {
          step.color = e.target.value;
          const node = nodes.find(n => n.id === step.targetId);
          step.label = `Color ${node ? node.title : ''} → ${step.color}`;
          txt.textContent = step.label;
        });
        left.appendChild(cPicker);
      }

      const actions = document.createElement('div');
      actions.className = 'step-row-actions';

      const btnUp = document.createElement('button');
      btnUp.type = 'button';
      btnUp.className = 'btn-mini-icon';
      btnUp.title = 'Mover arriba';
      btnUp.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      btnUp.addEventListener('click', () => moveTimelineStep(idx, -1));

      const btnDown = document.createElement('button');
      btnDown.type = 'button';
      btnDown.className = 'btn-mini-icon';
      btnDown.title = 'Mover abajo';
      btnDown.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      btnDown.addEventListener('click', () => moveTimelineStep(idx, 1));

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn-mini-icon';
      btnDel.title = 'Eliminar paso';
      btnDel.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      btnDel.addEventListener('click', () => removeTimelineStep(idx));

      actions.appendChild(btnUp);
      actions.appendChild(btnDown);
      actions.appendChild(btnDel);

      row.appendChild(left);
      row.appendChild(actions);
      timelineList.appendChild(row);
    });
  }

  /* ========================================================
     REPRODUCCIÓN Y NAVEGACIÓN PASO A PASO (SCRUBBER)
     ======================================================== */
  function applyStateUpToStep(stepCount) {
    currentStepIndex = Math.max(0, Math.min(stepCount, sequence.length));

    // Resetear colores base y visibilidad
    nodes.forEach(n => {
      n.visible = false;
      n.activeColor = n.color;
      const el = document.getElementById('node-el-' + n.id);
      if (el) {
        el.style.display = 'none';
        el.style.borderColor = n.color;
        const badge = el.querySelector('.node-badge');
        if (badge) badge.style.backgroundColor = n.color;
      }
    });

    connections.forEach(c => {
      c.visible = false;
    });

    // Aplicar secuencialmente hasta el paso actual
    for (let i = 0; i < currentStepIndex; i++) {
      const step = sequence[i];
      if (step.type === 'popup') {
        const node = nodes.find(n => n.id === step.targetId);
        if (node) {
          node.visible = true;
          const el = document.getElementById('node-el-' + node.id);
          if (el) el.style.display = 'flex';
        }
      } else if (step.type === 'arrow') {
        const conn = connections.find(c => c.id === step.connId);
        if (conn) conn.visible = true;
      } else if (step.type === 'color') {
        const node = nodes.find(n => n.id === step.targetId);
        if (node) {
          node.activeColor = step.color;
          const el = document.getElementById('node-el-' + node.id);
          if (el) {
            el.style.borderColor = step.color;
            const badge = el.querySelector('.node-badge');
            if (badge) badge.style.backgroundColor = step.color;
          }
        }
      }
    }

    renderConnections();
    updateScrubberLimits();
    renderTimelineList();
  }

  function stepForward() {
    stopPlayback();
    if (currentStepIndex < sequence.length) {
      applyStateUpToStep(currentStepIndex + 1);
      const step = sequence[currentStepIndex - 1];
      if (step.type === 'arrow') playPopSound('arrow');
      else if (step.type === 'color') playPopSound('color');
      else playPopSound('normal');
    }
  }

  function stepBackward() {
    stopPlayback();
    if (currentStepIndex > 0) {
      applyStateUpToStep(currentStepIndex - 1);
    }
  }

  function executeCurrentStep() {
    if (!isPlaying) return;

    if (currentStepIndex >= sequence.length) {
      if (loopEnabled) {
        resetAnimation();
        playbackTimer = setTimeout(executeCurrentStep, stepSpeed * 1000);
      } else {
        stopPlayback();
      }
      return;
    }

    const step = sequence[currentStepIndex];

    if (step.type === 'popup') {
      const node = nodes.find(n => n.id === step.targetId);
      if (node) {
        node.visible = true;
        const el = document.getElementById('node-el-' + node.id);
        if (el) {
          el.style.display = 'flex';
          el.className = `diagram-node type-${node.type || 'process'} shape-${node.shape || 'rect'} anim-${animEffect}`;
          el.classList.add('is-active-pulse');
          setTimeout(() => el.classList.remove('is-active-pulse'), 500);
        }
        playPopSound('normal');
      }
    } else if (step.type === 'arrow') {
      const conn = connections.find(c => c.id === step.connId);
      if (conn) {
        conn.visible = true;
        renderConnections();

        const pathEl = document.getElementById('conn-path-' + conn.id);
        if (pathEl) {
          pathEl.classList.add('animating');
          pathEl.style.animationDuration = stepSpeed + 's';
        }
        playPopSound('arrow');
      }
    } else if (step.type === 'color') {
      const node = nodes.find(n => n.id === step.targetId);
      if (node) {
        node.activeColor = step.color;
        const el = document.getElementById('node-el-' + node.id);
        if (el) {
          el.style.borderColor = step.color;
          const badge = el.querySelector('.node-badge');
          if (badge) badge.style.backgroundColor = step.color;
          el.classList.add('is-active-pulse');
          setTimeout(() => el.classList.remove('is-active-pulse'), 500);
        }
        playPopSound('color');
      }
    }

    currentStepIndex++;
    updateScrubberLimits();
    renderTimelineList();
    playbackTimer = setTimeout(executeCurrentStep, stepSpeed * 1000);
  }

  function startPlayback() {
    isPlaying = true;
    btnPlay.classList.add('playing');
    playText.textContent = 'Pausar Animación';
    if (playTextInline) playTextInline.textContent = 'Pausar';

    if (welcomeHint) welcomeHint.classList.add('hidden');

    if (currentStepIndex === 0 || currentStepIndex >= sequence.length) {
      applyStateUpToStep(0);
    }

    executeCurrentStep();
  }

  function stopPlayback() {
    isPlaying = false;
    btnPlay.classList.remove('playing');
    playText.textContent = 'Iniciar Animación';
    if (playTextInline) playTextInline.textContent = 'Reproducir';

    if (playbackTimer) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
    renderTimelineList();
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
    currentStepIndex = 0;

    nodes.forEach(n => {
      n.visible = true;
      n.activeColor = n.color;
      const el = document.getElementById('node-el-' + n.id);
      if (el) {
        el.style.display = 'flex';
        el.style.borderColor = n.color;
        const badge = el.querySelector('.node-badge');
        if (badge) badge.style.backgroundColor = n.color;
        el.className = `diagram-node type-${n.type || 'process'} shape-${n.shape || 'rect'}` + (selectedNodeId === n.id ? ' is-selected' : '');
      }
    });

    connections.forEach(c => {
      c.visible = true;
    });

    renderConnections();
    updateScrubberLimits();
    renderTimelineList();
  }

  /* ========================================================
     IMPORTADOR Y EXPORTADOR JSON
     ======================================================== */
  function loadFromJSON(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      pushHistory();

      nodes = [];
      connections = [];
      sequence = [];

      if (Array.isArray(data.nodes)) {
        data.nodes.forEach(n => {
          nodes.push({
            id: n.id,
            type: n.type || 'process',
            shape: n.shape || 'rect',
            title: n.title || 'NODO',
            subtitle: n.subtitle || 'PROCESO',
            color: n.color || getNextColor(),
            activeColor: n.color || '#38bdf8',
            x: n.x || (window.innerWidth / 2),
            y: n.y || (window.innerHeight / 2),
            width: n.width || (n.shape === 'square' ? 120 : DEFAULT_NODE_WIDTH),
            height: n.height || (n.shape === 'square' ? 120 : DEFAULT_NODE_HEIGHT),
            badge: n.badge || (n.title ? n.title.charAt(0).toUpperCase() : 'N'),
            visible: true
          });
        });
      }

      if (Array.isArray(data.connections)) {
        data.connections.forEach(c => {
          addConnection(c.from, c.to, c.fromPort, c.toPort, c.color, c.label || '');
        });
      }

      if (Array.isArray(data.sequence) && data.sequence.length > 0) {
        sequence = data.sequence.map((s, idx) => {
          if (s.type === 'color') {
            const node = nodes.find(n => n.id === s.target);
            return {
              id: 'step_' + idx,
              type: 'color',
              targetId: s.target,
              color: s.color || '#10b981',
              label: `Color ${node ? node.title : ''} → ${s.color}`
            };
          } else if (s.type === 'arrow') {
            const conn = connections.find(c => c.from === s.from && c.to === s.to);
            return {
              id: 'step_' + idx,
              type: 'arrow',
              connId: conn ? conn.id : null,
              label: `Flecha: ${s.from} → ${s.to}`
            };
          } else {
            const node = nodes.find(n => n.id === s.target);
            return {
              id: 'step_' + idx,
              type: 'popup',
              targetId: s.target,
              label: `Aparece: ${node ? node.title : s.target}`
            };
          }
        });
      } else {
        rebuildTimelineAuto();
      }

      clearSelection();
      renderNodes();
      renderConnections();
      renderTimelineList();
      updateUILists();
      updateScrubberLimits();
      return true;
    } catch (err) {
      alert('Error en el formato JSON: ' + err.message);
      return false;
    }
  }

  /* ========================================================
     MOTOR DE RENDERIZADO CANVAS DETERMINISTA PARA EXPORTAR
     ======================================================== */
  function drawStageToCanvas(ctx, width, height, isTransparent, bgColor) {
    ctx.clearRect(0, 0, width, height);

    if (!isTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    const scaleX = width / window.innerWidth;
    const scaleY = height / window.innerHeight;
    const scale = Math.min(scaleX, scaleY);

    ctx.save();
    ctx.scale(scale, scale);

    // 1. Dibujar Flechas
    connections.forEach(conn => {
      if (!conn.visible) return;
      const s = nodes.find(n => n.id === conn.from);
      const t = nodes.find(n => n.id === conn.to);
      if (!s || !t || !s.visible || !t.visible) return;

      const p1 = getNodePortCoords(s, conn.fromPort || 'right');
      const p2 = getNodePortCoords(t, conn.toPort || 'left');

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const normalOffset = Math.min(Math.max(dist * 0.45, 45), 140);

      let cp1x = p1.x, cp1y = p1.y;
      let cp2x = p2.x, cp2y = p2.y;

      switch (conn.fromPort || 'right') {
        case 'right':  cp1x = p1.x + normalOffset; break;
        case 'left':   cp1x = p1.x - normalOffset; break;
        case 'bottom': cp1y = p1.y + normalOffset; break;
        case 'top':    cp1y = p1.y - normalOffset; break;
      }

      switch (conn.toPort || 'left') {
        case 'left':   cp2x = p2.x - normalOffset; break;
        case 'right':  cp2x = p2.x + normalOffset; break;
        case 'top':    cp2y = p2.y - normalOffset; break;
        case 'bottom': cp2y = p2.y + normalOffset; break;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      ctx.strokeStyle = conn.color || '#38bdf8';
      ctx.lineWidth = arrowWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Flecha triangular con su color exacto
      const angle = Math.atan2(p2.y - cp2y, p2.x - cp2x);
      const arrowLen = 12;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - arrowLen * Math.cos(angle - Math.PI / 6), p2.y - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(p2.x - arrowLen * Math.cos(angle + Math.PI / 6), p2.y - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = conn.color || '#38bdf8';
      ctx.fill();

      // Label en canvas
      if (conn.label) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 8;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(conn.label, midX, midY);
      }
    });

    // 2. Dibujar Bloques
    nodes.forEach(node => {
      if (!node.visible) return;
      const { w, h } = getNodeDimensions(node);
      const x = node.x - w / 2;
      const y = node.y - h / 2;
      const radius = node.shape === 'pill' ? h / 2 : 12;

      // Fondo de la caja
      ctx.fillStyle = node.type === 'code' ? '#0d1117' : '#18181b';
      ctx.strokeStyle = node.activeColor || node.color || '#38bdf8';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.fill();
      ctx.stroke();

      // Badge
      const displayColor = node.activeColor || node.color || '#38bdf8';
      const badgeSize = 28;
      const badgeX = x + 16;
      const badgeY = y + (h - badgeSize) / 2 - 6;

      ctx.fillStyle = displayColor;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 7);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.badge || 'N', badgeX + badgeSize / 2, badgeY + badgeSize / 2);

      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(node.title, x + 54, y + 28);

      // Subtítulo
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 11px monospace';
      ctx.fillText(node.subtitle, x + 54, y + 46);
    });

    ctx.restore();
  }

  /* ========================================================
     DESCARGA SECUENCIA PNG (.ZIP) OFFLINE
     ======================================================== */
  async function startExport() {
    if (isExporting) return;
    if (typeof JSZip === 'undefined') {
      alert('Error: La librería JSZip local no se ha cargado correctamente.');
      return;
    }

    isExporting = true;
    cancelExportFlag = false;

    exportBanner.classList.remove('hidden');
    exportProgressFill.style.width = '0%';
    exportStatusTitle.textContent = 'Preparando fotogramas...';

    const duration = parseInt(paramExportDuration.value, 10) || 5;
    const activeFpsBtn = fpsSelector.querySelector('.pill-opt.active');
    const fps = activeFpsBtn ? parseInt(activeFpsBtn.dataset.fps, 10) : 30;
    const totalFrames = duration * fps;

    const activeBgMode = exportBgSelector.querySelector('.pill-opt.active').dataset.bgMode;
    const isTransparent = activeBgMode === 'transparent';

    let bgColor = '#0f172a';
    if (document.body.classList.contains('bg-croma-green')) bgColor = '#00ff00';
    if (document.body.classList.contains('bg-croma-blue')) bgColor = '#0033cc';
    if (document.body.classList.contains('bg-light')) bgColor = '#f8fafc';

    // Dimensiones
    let width = 1920;
    let height = 1080;
    const resValue = paramExportRes.value;
    if (resValue === '1080x1920') {
      width = 1080;
      height = 1920;
    } else if (resValue === '1280x720') {
      width = 1280;
      height = 720;
    } else if (resValue === 'screen') {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const zip = new JSZip();
    const folder = zip.folder('flowmotion_frames');

    // Estado inicial de exportación
    applyStateUpToStep(0);

    const stepIntervalFrames = Math.max(1, Math.floor(totalFrames / Math.max(1, sequence.length)));
    let currentExportStep = 0;

    for (let f = 0; f < totalFrames; f++) {
      if (cancelExportFlag) {
        exportBanner.classList.add('hidden');
        isExporting = false;
        resetAnimation();
        return;
      }

      if (f % stepIntervalFrames === 0 && currentExportStep <= sequence.length) {
        applyStateUpToStep(currentExportStep);
        currentExportStep++;
      }

      drawStageToCanvas(ctx, width, height, isTransparent, bgColor);

      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const frameFileName = `frame_${String(f + 1).padStart(5, '0')}.png`;
      folder.file(frameFileName, base64Data, { base64: true });

      const pct = Math.round(((f + 1) / totalFrames) * 100);
      exportProgressFill.style.width = pct + '%';
      exportStatusTitle.textContent = `Capturando fotogramas (${pct}%)...`;
      exportStatusSub.textContent = `Fotograma ${f + 1} / ${totalFrames}`;

      // Ceder el hilo para no congelar la UI
      await new Promise(r => setTimeout(r, 0));
    }

    exportStatusTitle.textContent = 'Comprimiendo archivo .zip...';
    exportStatusSub.textContent = 'Generando descarga de secuencia PNG...';

    const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      exportProgressFill.style.width = metadata.percent.toFixed(0) + '%';
    });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = `flowmotion_${width}x${height}_${duration}s_${fps}fps.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    exportBanner.classList.add('hidden');
    isExporting = false;
    resetAnimation();
  }

  /* ========================================================
     UI: ACTUALIZACIÓN DE LISTADOS EN EL PANEL
     ======================================================== */
  function updateUILists() {
    nodesBadgeCount.textContent = nodes.length;
    connectionsBadgeCount.textContent = connections.length;

    // --- Subtab 1: Listado de Bloques ---
    blocksList.innerHTML = '';
    if (nodes.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state-card';
      empty.textContent = 'No hay bloques creados. Pulsa "Añadir Bloque" arriba.';
      blocksList.appendChild(empty);
    } else {
      nodes.forEach(node => {
        const item = document.createElement('div');
        item.className = 'block-list-item' + (selectedNodeId === node.id ? ' is-selected' : '');

        const left = document.createElement('div');
        left.className = 'block-item-left';

        // Selector de color
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'block-color-picker-input';
        colorInput.value = node.color;
        colorInput.title = 'Cambiar color del bloque';
        colorInput.addEventListener('click', (e) => e.stopPropagation());
        colorInput.addEventListener('input', (e) => {
          pushHistory();
          node.color = e.target.value;
          node.activeColor = e.target.value;
          renderNodes();
        });

        // Contenedor de Textos
        const info = document.createElement('div');
        info.className = 'block-item-info';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'block-item-title-input';
        titleInput.value = node.title;
        titleInput.addEventListener('click', (e) => e.stopPropagation());
        titleInput.addEventListener('change', (e) => {
          pushHistory();
          node.title = e.target.value.trim() || 'NODO';
          if (node.type === 'process') node.badge = node.title.charAt(0).toUpperCase();
          renderNodes();
          rebuildTimelineAuto();
        });

        // Selector de Forma (Rect, Cuadrado, Píldora)
        const shapeSelect = document.createElement('select');
        shapeSelect.className = 'custom-select';
        shapeSelect.style.padding = '2px 6px';
        shapeSelect.style.fontSize = '10.5px';
        shapeSelect.style.marginTop = '3px';
        shapeSelect.innerHTML = `
          <option value="rect"${node.shape === 'rect' ? ' selected' : ''}>Rectángulo</option>
          <option value="square"${node.shape === 'square' ? ' selected' : ''}>Cuadrado</option>
          <option value="pill"${node.shape === 'pill' ? ' selected' : ''}>Píldora</option>
        `;
        shapeSelect.addEventListener('click', (e) => e.stopPropagation());
        shapeSelect.addEventListener('change', (e) => {
          pushHistory();
          node.shape = e.target.value;
          if (node.shape === 'square') {
            node.width = 120;
            node.height = 120;
          } else {
            node.width = DEFAULT_NODE_WIDTH;
            node.height = DEFAULT_NODE_HEIGHT;
          }
          renderNodes();
        });

        info.appendChild(titleInput);
        info.appendChild(shapeSelect);

        left.appendChild(colorInput);
        left.appendChild(info);

        // Botones Duplicar y Eliminar
        const actions = document.createElement('div');
        actions.className = 'block-item-actions';

        const btnDup = document.createElement('button');
        btnDup.type = 'button';
        btnDup.className = 'btn-mini-icon';
        btnDup.title = 'Duplicar bloque (Ctrl+D)';
        btnDup.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        btnDup.addEventListener('click', (e) => {
          e.stopPropagation();
          duplicateNode(node.id);
        });

        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.className = 'btn-mini-icon';
        btnDel.title = 'Eliminar bloque (Supr)';
        btnDel.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        btnDel.addEventListener('click', (e) => {
          e.stopPropagation();
          removeNode(node.id);
        });

        actions.appendChild(btnDup);
        actions.appendChild(btnDel);

        item.appendChild(left);
        item.appendChild(actions);

        item.addEventListener('click', () => selectNode(node.id));
        blocksList.appendChild(item);
      });
    }

    // --- Subtab 2: Listado de Flechas ---
    connectionsList.innerHTML = '';
    if (connections.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state-card';
      empty.textContent = 'No hay conexiones. Une nodos arrastrando desde sus puertos circulares.';
      connectionsList.appendChild(empty);
    } else {
      connections.forEach(conn => {
        const s = nodes.find(n => n.id === conn.from);
        const t = nodes.find(n => n.id === conn.to);
        if (!s || !t) return;

        const item = document.createElement('div');
        item.className = 'block-list-item' + (selectedConnId === conn.id ? ' is-selected' : '');

        const left = document.createElement('div');
        left.className = 'block-item-left';

        // Selector de color de la flecha
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'block-color-picker-input';
        colorInput.value = conn.color || '#38bdf8';
        colorInput.title = 'Cambiar color de flecha';
        colorInput.addEventListener('click', (e) => e.stopPropagation());
        colorInput.addEventListener('input', (e) => {
          pushHistory();
          conn.color = e.target.value;
          renderConnections();
        });

        const info = document.createElement('div');
        info.className = 'block-item-info';

        const labelText = document.createElement('div');
        labelText.style.fontSize = '12px';
        labelText.style.fontWeight = '600';
        labelText.style.color = '#ffffff';
        labelText.textContent = `${s.title} → ${t.title}`;

        const inputDesc = document.createElement('input');
        inputDesc.type = 'text';
        inputDesc.className = 'block-item-title-input';
        inputDesc.style.fontSize = '10.5px';
        inputDesc.style.marginTop = '2px';
        inputDesc.placeholder = 'Etiqueta opcional (ej: SI / NO)...';
        inputDesc.value = conn.label || '';
        inputDesc.addEventListener('click', (e) => e.stopPropagation());
        inputDesc.addEventListener('change', (e) => {
          pushHistory();
          conn.label = e.target.value.trim();
          renderConnections();
          rebuildTimelineAuto();
        });

        info.appendChild(labelText);
        info.appendChild(inputDesc);

        left.appendChild(colorInput);
        left.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'block-item-actions';

        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.className = 'btn-mini-icon';
        btnDel.title = 'Desconectar flecha (Supr)';
        btnDel.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        btnDel.addEventListener('click', (e) => {
          e.stopPropagation();
          removeConnection(conn.id);
        });

        actions.appendChild(btnDel);

        item.appendChild(left);
        item.appendChild(actions);

        item.addEventListener('click', () => selectConnection(conn.id));
        connectionsList.appendChild(item);
      });
    }
  }

  function switchSubtab(subtabId) {
    if (subtabId === 'subtab-nodes') {
      subtabNodesBtn.classList.add('active');
      subtabConnsBtn.classList.remove('active');
      subtabNodesView.style.display = 'block';
      subtabConnsView.style.display = 'none';
    } else {
      subtabConnsBtn.classList.add('active');
      subtabNodesBtn.classList.remove('active');
      subtabConnsView.style.display = 'block';
      subtabNodesView.style.display = 'none';
    }
  }

  /* ========================================================
     INICIALIZACIÓN DE EVENTOS Y ATRIBUTOS DE POPFX
     ======================================================== */
  function setupUIEvents() {
    // 1. Botón 3 Puntos Arriba a la Derecha (Abrir/Cerrar Panel)
    menuBtn.addEventListener('click', () => {
      controlPanel.classList.toggle('hidden');
      if (welcomeHint) welcomeHint.classList.add('hidden');
    });

    if (welcomeHint) {
      welcomeHint.addEventListener('click', () => {
        controlPanel.classList.remove('hidden');
        welcomeHint.classList.add('hidden');
      });
    }

    // 2. Navegación por pestañas principales
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

    // 3. Subtabs Bloques vs Flechas
    subtabNodesBtn.addEventListener('click', () => switchSubtab('subtab-nodes'));
    subtabConnsBtn.addEventListener('click', () => switchSubtab('subtab-conns'));

    // 4. Añadir Bloque
    btnAddBlock.addEventListener('click', () => {
      addNode();
      playPopSound('normal');
    });

    // 5. Modo Unir Nodos
    btnToggleConnectMode.addEventListener('click', () => {
      isConnectingMode = !isConnectingMode;
      document.body.classList.toggle('is-connecting-mode', isConnectingMode);
      btnToggleConnectMode.classList.toggle('active', isConnectingMode);
      connectModeLabel.textContent = isConnectingMode ? 'Selecciona 2 Bloques' : 'Unir Nodos';
      if (!isConnectingMode && connectSourceNodeId) {
        const prevEl = document.getElementById('node-el-' + connectSourceNodeId);
        if (prevEl) prevEl.classList.remove('is-connect-source');
        connectSourceNodeId = null;
      }
    });

    // 6. Limpiar Bloques y Flechas
    btnClearBlocks.addEventListener('click', () => {
      if (nodes.length === 0) return;
      if (confirm('¿Eliminar todos los bloques del diagrama?')) {
        pushHistory();
        nodes = [];
        connections = [];
        sequence = [];
        clearSelection();
        renderNodes();
        renderConnections();
        rebuildTimelineAuto();
        updateUILists();
      }
    });

    btnClearConnections.addEventListener('click', () => {
      if (connections.length === 0) return;
      if (confirm('¿Eliminar todas las flechas de conexión?')) {
        pushHistory();
        connections = [];
        sequence = [];
        clearSelection();
        renderNodes();
        renderConnections();
        rebuildTimelineAuto();
        updateUILists();
      }
    });

    // 7. Controles de Reproducción y Scrubber
    btnPlay.addEventListener('click', togglePlayback);
    if (btnPlayInline) btnPlayInline.addEventListener('click', togglePlayback);
    if (btnStepPrev) btnStepPrev.addEventListener('click', stepBackward);
    if (btnStepNext) btnStepNext.addEventListener('click', stepForward);

    if (animScrubber) {
      animScrubber.addEventListener('input', (e) => {
        stopPlayback();
        applyStateUpToStep(parseInt(e.target.value, 10));
      });
    }

    if (btnAddColorStep) btnAddColorStep.addEventListener('click', addColorStep);
    if (btnRebuildTimeline) btnRebuildTimeline.addEventListener('click', rebuildTimelineAuto);

    btnReset.addEventListener('click', () => {
      if (confirm('¿Limpiar todo el escenario?')) {
        pushHistory();
        nodes = [];
        connections = [];
        sequence = [];
        clearSelection();
        renderNodes();
        renderConnections();
        rebuildTimelineAuto();
        updateUILists();
      }
    });

    // 8. Parámetros de animación
    paramStepSpeed.addEventListener('input', (e) => {
      stepSpeed = parseFloat(e.target.value);
      valStepSpeed.textContent = stepSpeed.toFixed(2) + ' s';
    });

    paramAnimEffect.addEventListener('change', (e) => {
      animEffect = e.target.value;
    });

    paramArrowWidth.addEventListener('input', (e) => {
      arrowWidth = parseInt(e.target.value, 10);
      valArrowWidth.textContent = arrowWidth + ' px';
      renderConnections();
    });

    paramSoundEnabled.addEventListener('change', (e) => {
      soundEnabled = e.target.checked;
    });

    paramLoopEnabled.addEventListener('change', (e) => {
      loopEnabled = e.target.checked;
    });

    // 9. Colores de Fondo (Chroma Key)
    document.querySelectorAll('.bg-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.bg-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const bgClass = dot.dataset.bg;
        document.body.className = bgClass;
      });
    });

    // 10. Modales de IA
    btnOpenAiModal.addEventListener('click', () => modalAiCode.classList.remove('hidden'));
    btnCloseAiModal.addEventListener('click', () => modalAiCode.classList.add('hidden'));

    btnOpenPromptModal.addEventListener('click', () => modalMasterPrompt.classList.remove('hidden'));
    btnClosePromptModal.addEventListener('click', () => modalMasterPrompt.classList.add('hidden'));

    btnApplyAiCode.addEventListener('click', () => {
      const code = aiCodeInput.value.trim();
      if (!code) return;
      const cleanJson = code.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      if (loadFromJSON(cleanJson)) {
        modalAiCode.classList.add('hidden');
      }
    });

    btnFormatExample.addEventListener('click', () => {
      const example = {
        nodes: [
          { id: "inicio", type: "process", shape: "rect", title: "INICIO", subtitle: "PROCESO", color: "#38bdf8", x: 380, y: 540 },
          { id: "loop1", type: "loop", shape: "rect", title: "FOR I = 0..5", subtitle: "BUCLE", color: "#a855f7", x: 780, y: 540 },
          { id: "cond1", type: "decision", shape: "square", title: "¿ES VÁLIDO?", subtitle: "CONDICIÓN", color: "#f59e0b", x: 1180, y: 540 },
          { id: "code1", type: "code", shape: "rect", title: "EJECUTAR", subtitle: "socket.emit()", color: "#10b981", x: 1580, y: 540 }
        ],
        connections: [
          { from: "inicio", fromPort: "right", to: "loop1", toPort: "left", color: "#38bdf8", label: "START" },
          { from: "loop1", fromPort: "right", to: "cond1", toPort: "left", color: "#a855f7", label: "TICK" },
          { from: "cond1", fromPort: "right", to: "code1", toPort: "left", color: "#10b981", label: "SI" },
          { from: "cond1", fromPort: "bottom", to: "loop1", toPort: "bottom", color: "#ef4444", label: "REINTENTAR" }
        ],
        sequence: [
          { type: "popup", target: "inicio" },
          { type: "arrow", from: "inicio", to: "loop1" },
          { type: "popup", target: "loop1" },
          { type: "color", target: "loop1", color: "#10b981" },
          { type: "arrow", from: "loop1", to: "cond1" },
          { type: "popup", target: "cond1" },
          { type: "arrow", from: "cond1", to: "code1" },
          { type: "popup", target: "code1" }
        ]
      };
      aiCodeInput.value = JSON.stringify(example, null, 2);
    });

    btnCopyPrompt.addEventListener('click', () => {
      const promptText = document.getElementById('master-prompt-text').value;
      navigator.clipboard.writeText(promptText).then(() => {
        btnCopyPrompt.textContent = '¡Copiado con Éxito!';
        setTimeout(() => {
          btnCopyPrompt.textContent = 'Copiar Prompt al Portapapeles';
        }, 2000);
      });
    });

    // 11. Exportación
    paramExportDuration.addEventListener('input', (e) => {
      valExportDuration.textContent = e.target.value + ' seg';
      updateExportSummary();
    });

    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        paramExportDuration.value = chip.dataset.duration;
        valExportDuration.textContent = chip.dataset.duration + ' seg';
        updateExportSummary();
      });
    });

    fpsSelector.querySelectorAll('.pill-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        fpsSelector.querySelectorAll('.pill-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        updateExportSummary();
      });
    });

    exportBgSelector.querySelectorAll('.pill-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        exportBgSelector.querySelectorAll('.pill-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });

    btnStartExport.addEventListener('click', startExport);
    btnCancelExport.addEventListener('click', () => {
      cancelExportFlag = true;
    });

    function updateExportSummary() {
      const duration = parseInt(paramExportDuration.value, 10) || 5;
      const activeFpsBtn = fpsSelector.querySelector('.pill-opt.active');
      const fps = activeFpsBtn ? parseInt(activeFpsBtn.dataset.fps, 10) : 30;
      const total = duration * fps;
      summaryFramesCount.textContent = `${total} PNGs`;
    }
    updateExportSummary();

    // 12. Atajos de Teclado Globales
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      // Copiar (Ctrl+C)
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (selectedNodeId) {
          const n = nodes.find(node => node.id === selectedNodeId);
          if (n) {
            clipboardNode = JSON.parse(JSON.stringify(n));
          }
        }
      }

      // Pegar (Ctrl+V)
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        if (clipboardNode) {
          addNode({
            type: clipboardNode.type,
            shape: clipboardNode.shape,
            title: clipboardNode.title,
            subtitle: clipboardNode.subtitle,
            color: clipboardNode.color,
            width: clipboardNode.width,
            height: clipboardNode.height,
            x: clipboardNode.x + 40,
            y: clipboardNode.y + 40
          });
          playPopSound('normal');
        }
      }

      // Duplicar (Ctrl+D)
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedNodeId) {
          duplicateNode(selectedNodeId);
        }
      }

      // Deshacer (Ctrl+Z)
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }

      // Rehacer (Ctrl+Y o Ctrl+Shift+Z)
      if ((e.ctrlKey && e.key.toLowerCase() === 'y') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        redo();
      }

      // Eliminar (Supr / Delete / Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          removeNode(selectedNodeId);
        } else if (selectedConnId) {
          removeConnection(selectedConnId);
        }
      }

      // Reproducir / Pausa (Espacio)
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      }

      // Ocultar / Mostrar Panel (H)
      if (e.key.toLowerCase() === 'h') {
        controlPanel.classList.toggle('hidden');
        if (welcomeHint) welcomeHint.classList.add('hidden');
      }

      // Limpiar (R)
      if (e.key.toLowerCase() === 'r') {
        resetAnimation();
      }

      // Esc: deseleccionar / cancelar
      if (e.key === 'Escape') {
        clearSelection();
        if (isConnectingMode) {
          isConnectingMode = false;
          document.body.classList.remove('is-connecting-mode');
          btnToggleConnectMode.classList.remove('active');
          connectModeLabel.textContent = 'Unir Nodos';
        }
      }
    });

    // Redimensionado de ventana
    window.addEventListener('resize', () => {
      renderConnections();
    });
  }

  /* ========================================================
     INICIALIZACIÓN POR DEFECTO DEL DIAGRAMA
     ======================================================== */
  function initDefaultDiagram() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const n1 = addNode({ id: 'inicio', type: 'process', shape: 'rect', title: 'INICIO', subtitle: 'ORIGEN', color: '#38bdf8', x: cx - 380, y: cy });
    const n2 = addNode({ id: 'loop1', type: 'loop', shape: 'rect', title: 'FOR I = 0..5', subtitle: 'BUCLE TICK', color: '#a855f7', x: cx, y: cy });
    const n3 = addNode({ id: 'cond1', type: 'decision', shape: 'square', title: '¿ES VÁLIDO?', subtitle: 'CONDICIÓN', color: '#f59e0b', x: cx + 380, y: cy });

    addConnection(n1.id, n2.id, 'right', 'left', '#38bdf8', 'START');
    addConnection(n2.id, n3.id, 'right', 'left', '#a855f7', 'TICK');
    addConnection(n3.id, n2.id, 'bottom', 'bottom', '#ef4444', 'REINTENTAR');

    clearSelection();
    pushHistory();
  }

  // --- ARRANQUE ---
  setupUIEvents();
  initDefaultDiagram();

})();
