/* ========================================================
   FLOWMOTION STUDIO — MOTOR DE DIAGRAMAS ANIMADOS
   ======================================================== */

(function () {
  'use strict';

  // --- Paleta de colores planos para bloques nuevos ---
  const FLAT_COLORS = [
    '#38bdf8', // Celeste / Sky
    '#10b981', // Verde esmeralda
    '#f59e0b', // Ámbar / Dorado
    '#ef4444', // Rojo
    '#a855f7', // Púrpura
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

  // Botones y Selectores
  const btnPlay = document.getElementById('btn-play');
  const playText = document.getElementById('play-text');
  const btnReset = document.getElementById('btn-reset');
  const btnAddBlock = document.getElementById('btn-add-block');
  const btnClearBlocks = document.getElementById('btn-clear-blocks');
  const btnClearConnections = document.getElementById('btn-clear-connections');
  const btnToggleConnectMode = document.getElementById('btn-toggle-connect-mode');
  const connectModeLabel = document.getElementById('connect-mode-label');
  const btnRebuildTimeline = document.getElementById('btn-rebuild-timeline');

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

  // --- Dimensiones fijas de nodo en píxeles ---
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 80;

  // --- Estado Global de Datos ---
  let nodes = [];
  let connections = [];
  let sequence = []; // Lista ordenada de pasos de animación
  let isPlaying = false;
  let currentStepIndex = 0;
  let playbackTimer = null;

  // Modos de interacción
  let isConnectingMode = false;
  let connectSourceNodeId = null;
  let isDraggingNode = false;
  let draggedNodeId = null;
  let dragOffset = { x: 0, y: 0 };

  // Arrastre desde puerto (punta a punta)
  let isDraggingPort = false;
  let portSource = { nodeId: null, port: null };

  // Parámetros de animación
  let stepSpeed = 0.5; // segundos por paso
  let animEffect = 'bounce';
  let arrowWidth = 3;
  let soundEnabled = true;
  let loopEnabled = false;

  // Parámetros de exportación
  let isExporting = false;
  let exportZipInstance = null;
  let selectedExportFps = 30;
  let selectedExportBgMode = 'transparent';

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

  function playPopSound(type = 'normal') {
    if (!soundEnabled) return;

    const nowPerf = performance.now();
    if (nowPerf - lastSoundTime < 30) return;
    lastSoundTime = nowPerf;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      let startFreq = 520 + (Math.random() * 80 - 40);
      let endFreq = 120;
      let duration = 0.055;

      if (type === 'arrow') {
        startFreq = 380;
        endFreq = 640;
        duration = 0.045;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(0.25, now);
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
     CÁLCULO EXACTO DE COORDENADAS DE PUERTOS
     ======================================================== */
  function getNodePortCoords(node, port) {
    const halfW = NODE_WIDTH / 2;
    const halfH = NODE_HEIGHT / 2;

    switch (port) {
      case 'left':
        return { x: node.x - halfW, y: node.y };
      case 'right':
        return { x: node.x + halfW, y: node.y };
      case 'top':
        return { x: node.x, y: node.y - halfH };
      case 'bottom':
        return { x: node.x, y: node.y + halfH };
      default:
        return { x: node.x + halfW, y: node.y };
    }
  }

  // Si no se especifica puerto, elige el más natural entre dos nodos
  function getBestNaturalPorts(sourceNode, targetNode) {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      return {
        fromPort: dx >= 0 ? 'right' : 'left',
        toPort: dx >= 0 ? 'left' : 'right'
      };
    } else {
      return {
        fromPort: dy >= 0 ? 'bottom' : 'top',
        toPort: dy >= 0 ? 'top' : 'bottom'
      };
    }
  }

  /* ========================================================
     CÁLCULO DE CURVAS BEZIER Y TANGENTES
     ======================================================== */
  function getBezierPath(p1, fromPort, p2, toPort) {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;

    const dist = Math.hypot(x2 - x1, y2 - y1);
    const offset = Math.max(dist * 0.4, 40);

    let cp1x = x1, cp1y = y1;
    let cp2x = x2, cp2y = y2;

    switch (fromPort) {
      case 'right':  cp1x = x1 + offset; break;
      case 'left':   cp1x = x1 - offset; break;
      case 'bottom': cp1y = y1 + offset; break;
      case 'top':    cp1y = y1 - offset; break;
    }

    switch (toPort) {
      case 'left':   cp2x = x2 - offset; break;
      case 'right':  cp2x = x2 + offset; break;
      case 'top':    cp2y = y2 - offset; break;
      case 'bottom': cp2y = y2 + offset; break;
    }

    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }

  /* ========================================================
     GESTIÓN DE NODOS / BLOQUES
     ======================================================== */
  function addNode(data = {}) {
    const id = data.id || 'nodo_' + Math.random().toString(36).substring(2, 7);
    const title = data.title || ('NODO ' + (nodes.length + 1));
    const subtitle = data.subtitle || 'PROCESO';
    const color = data.color || getNextColor();
    const badge = data.badge || title.charAt(0).toUpperCase();

    // Posición centrada o aleatoria dispersa si no se especifica
    let x = typeof data.x === 'number' ? data.x : (window.innerWidth / 2 + (Math.random() * 200 - 100));
    let y = typeof data.y === 'number' ? data.y : (window.innerHeight / 2 + (Math.random() * 160 - 80));

    // Asegurar márgenes de pantalla
    x = Math.max(130, Math.min(window.innerWidth - 130, x));
    y = Math.max(60, Math.min(window.innerHeight - 60, y));

    const node = {
      id,
      title,
      subtitle,
      color,
      badge,
      x: Math.round(x),
      y: Math.round(y),
      visible: true
    };

    nodes.push(node);
    renderNodes();
    rebuildTimelineAuto();
    updateUILists();
    return node;
  }

  function duplicateNode(id) {
    const original = nodes.find(n => n.id === id);
    if (!original) return;

    addNode({
      title: original.title + ' (COPIA)',
      subtitle: original.subtitle,
      color: original.color,
      badge: original.badge,
      x: original.x + 40,
      y: original.y + 40
    });
    playPopSound('normal');
  }

  function removeNode(id) {
    nodes = nodes.filter(n => n.id !== id);
    connections = connections.filter(c => c.from !== id && c.to !== id);
    renderNodes();
    renderConnections();
    rebuildTimelineAuto();
    updateUILists();
  }

  /* ========================================================
     GESTIÓN DE FLECHAS Y CONEXIONES
     ======================================================== */
  function addConnection(fromId, toId, fromPort = null, toPort = null, color = null, label = '') {
    if (fromId === toId) return;

    const source = nodes.find(n => n.id === fromId);
    const target = nodes.find(n => n.id === toId);
    if (!source || !target) return;

    // Determinar puertos si no vienen dados
    let fPort = fromPort;
    let tPort = toPort;
    if (!fPort || !tPort) {
      const best = getBestNaturalPorts(source, target);
      if (!fPort) fPort = best.fromPort;
      if (!tPort) tPort = best.toPort;
    }

    // Comprobar si ya existe una conexión idéntica
    const exists = connections.some(c => c.from === fromId && c.to === toId && c.fromPort === fPort && c.toPort === tPort);
    if (exists) return;

    const connColor = color || source.color || '#38bdf8';

    const conn = {
      id: 'conn_' + Math.random().toString(36).substring(2, 7),
      from: fromId,
      fromPort: fPort,
      to: toId,
      toPort: tPort,
      color: connColor,
      label: label || '',
      visible: true
    };

    connections.push(conn);
    renderConnections();
    rebuildTimelineAuto();
    updateUILists();
    return conn;
  }

  function removeConnection(id) {
    connections = connections.filter(c => c.id !== id);
    renderConnections();
    rebuildTimelineAuto();
    updateUILists();
  }

  /* ========================================================
     RENDERIZADO DE NODOS EN EL DOM
     ======================================================== */
  function renderNodes() {
    nodesContainer.innerHTML = '';

    nodes.forEach(node => {
      const el = document.createElement('div');
      el.className = 'diagram-node';
      el.id = 'node-el-' + node.id;
      el.dataset.nodeId = node.id;
      el.style.borderColor = node.color;
      el.style.left = node.x + 'px';
      el.style.top = node.y + 'px';

      if (!node.visible) {
        el.style.display = 'none';
      }

      // Header con Badge y Título
      const header = document.createElement('div');
      header.className = 'node-header';

      const badgeEl = document.createElement('div');
      badgeEl.className = 'node-badge';
      badgeEl.style.backgroundColor = node.color;
      badgeEl.textContent = node.badge || node.title.charAt(0);

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

      // 4 Puertos de Conexión: Derecha, Izquierda, Arriba, Abajo
      const portR = createPortElement(node.id, 'right');
      const portL = createPortElement(node.id, 'left');
      const portT = createPortElement(node.id, 'top');
      const portB = createPortElement(node.id, 'bottom');

      el.appendChild(header);
      el.appendChild(subEl);
      el.appendChild(portR);
      el.appendChild(portL);
      el.appendChild(portT);
      el.appendChild(portB);

      // Eventos Drag & Drop del nodo
      el.addEventListener('mousedown', onNodeMouseDown);

      // Evento de doble clic para editar título y subtítulo inline
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        enableNodeInlineEdit(node, el, titleEl, subEl, badgeEl);
      });

      // Evento de clic en modo "Unir Nodos"
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

  function createPortElement(nodeId, portName) {
    const p = document.createElement('div');
    p.className = `node-port port-${portName}`;
    p.title = `Conectar puerto ${portName.toUpperCase()}`;
    p.dataset.nodeId = nodeId;
    p.dataset.port = portName;
    p.addEventListener('mousedown', onPortMouseDown);
    return p;
  }

  // Doble clic: edición directa de textos
  function enableNodeInlineEdit(node, nodeEl, titleEl, subEl, badgeEl) {
    const currentTitle = node.title;
    const currentSub = node.subtitle;

    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.className = 'node-inline-input';
    inputTitle.value = currentTitle;

    const inputSub = document.createElement('input');
    inputSub.type = 'text';
    inputSub.className = 'node-inline-input';
    inputSub.style.marginTop = '4px';
    inputSub.style.fontSize = '11px';
    inputSub.value = currentSub;

    titleEl.replaceWith(inputTitle);
    subEl.replaceWith(inputSub);
    inputTitle.focus();
    inputTitle.select();

    function saveChanges() {
      const newTitle = inputTitle.value.trim() || 'NODO';
      const newSub = inputSub.value.trim() || 'PROCESO';

      node.title = newTitle;
      node.subtitle = newSub;
      node.badge = newTitle.charAt(0).toUpperCase();

      badgeEl.textContent = node.badge;
      titleEl.textContent = newTitle;
      subEl.textContent = newSub;

      if (inputTitle.parentNode) inputTitle.replaceWith(titleEl);
      if (inputSub.parentNode) inputSub.replaceWith(subEl);

      rebuildTimelineAuto();
      updateUILists();
    }

    inputTitle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') inputSub.focus();
    });

    inputSub.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveChanges();
    });

    // Guardar al perder el foco
    let blurTimeout;
    const onBlur = () => {
      blurTimeout = setTimeout(saveChanges, 150);
    };
    inputTitle.addEventListener('blur', onBlur);
    inputSub.addEventListener('blur', onBlur);
  }

  /* ========================================================
     RENDERIZADO DE FLECHAS Y CONEXIONES (SVG)
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

      // Flecha SVG
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('class', 'connection-curve');
      pathEl.setAttribute('stroke', conn.color || '#38bdf8');
      pathEl.setAttribute('stroke-width', arrowWidth);
      pathEl.setAttribute('marker-end', 'url(#arrowhead-dyn)');
      pathEl.id = 'conn-path-' + conn.id;

      // Color de punta de flecha sincronizado
      const markerDef = document.querySelector('#arrowhead-dyn path');
      if (markerDef) markerDef.setAttribute('fill', conn.color || '#38bdf8');

      connectionsGroup.appendChild(pathEl);

      // Etiqueta en el centro de la flecha
      if (conn.label) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 8;

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
     INTERACCIÓN CON RATÓN (DRAG NODOS Y PUERTOS PUNTA A PUNTA)
     ======================================================== */
  function onNodeMouseDown(e) {
    if (isConnectingMode || isDraggingPort) return;
    if (e.target.classList.contains('node-port')) return;
    if (e.target.classList.contains('node-inline-input')) return;

    isDraggingNode = true;
    draggedNodeId = this.dataset.nodeId;

    const node = nodes.find(n => n.id === draggedNodeId);
    if (!node) return;

    dragOffset = {
      x: e.clientX - node.x,
      y: e.clientY - node.y
    };

    this.classList.add('is-dragging');
    window.addEventListener('mousemove', onNodeMouseMove);
    window.addEventListener('mouseup', onNodeMouseUp);
  }

  function onNodeMouseMove(e) {
    if (!isDraggingNode || !draggedNodeId) return;

    const node = nodes.find(n => n.id === draggedNodeId);
    if (!node) return;

    node.x = Math.max(110, Math.min(window.innerWidth - 110, e.clientX - dragOffset.x));
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
    }
    isDraggingNode = false;
    draggedNodeId = null;
    window.removeEventListener('mousemove', onNodeMouseMove);
    window.removeEventListener('mouseup', onNodeMouseUp);
  }

  // Conexión arrastrando desde un puerto (punta a punta)
  function onPortMouseDown(e) {
    e.stopPropagation();
    isDraggingPort = true;
    portSource = {
      nodeId: this.dataset.nodeId,
      port: this.dataset.port
    };

    dragConnectPath.style.display = 'block';
    window.addEventListener('mousemove', onPortMouseMove);
    window.addEventListener('mouseup', onPortMouseUp);
  }

  function onPortMouseMove(e) {
    if (!isDraggingPort || !portSource.nodeId) return;

    const sourceNode = nodes.find(n => n.id === portSource.nodeId);
    if (!sourceNode) return;

    const p1 = getNodePortCoords(sourceNode, portSource.port);
    const p2 = { x: e.clientX, y: e.clientY };

    // Buscar si el ratón sobrevuela un puerto destino
    let targetPort = 'left';
    if (p2.x < p1.x) targetPort = 'right';

    const d = getBezierPath(p1, portSource.port, p2, targetPort);
    dragConnectPath.setAttribute('d', d);
  }

  function onPortMouseUp(e) {
    dragConnectPath.style.display = 'none';
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
        addConnection(portSource.nodeId, nodeTargetEl.dataset.nodeId, portSource.port, null);
        playPopSound('arrow');
      }
    }

    isDraggingPort = false;
    portSource = { nodeId: null, port: null };
  }

  // Conectar haciendo clic de bloque a bloque
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
     ORDEN Y SECUENCIA DE ANIMACIÓN (TIMELINE)
     ======================================================== */
  function rebuildTimelineAuto() {
    sequence = [];

    // Generar orden por defecto: cada nodo y luego sus flechas salientes
    nodes.forEach(node => {
      sequence.push({
        id: 'step_node_' + node.id,
        type: 'popup',
        targetId: node.id,
        label: `Aparece nodo: ${node.title}`
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

    renderTimelineList();
  }

  function moveTimelineStep(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sequence.length) return;

    const temp = sequence[index];
    sequence[index] = sequence[targetIdx];
    sequence[targetIdx] = temp;

    renderTimelineList();
  }

  function renderTimelineList() {
    timelineList.innerHTML = '';

    if (sequence.length === 0) {
      const empty = document.createElement('div');
      empty.style.fontSize = '11.5px';
      empty.style.color = '#71717a';
      empty.style.padding = '8px';
      empty.style.textAlign = 'center';
      empty.textContent = 'Añade bloques o flechas para ver la secuencia';
      timelineList.appendChild(empty);
      return;
    }

    sequence.forEach((step, idx) => {
      const row = document.createElement('div');
      row.className = 'timeline-step-row';
      if (isPlaying && currentStepIndex === idx) {
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

      actions.appendChild(btnUp);
      actions.appendChild(btnDown);

      row.appendChild(left);
      row.appendChild(actions);
      timelineList.appendChild(row);
    });
  }

  /* ========================================================
     REPRODUCCIÓN DE LA ANIMACIÓN
     ======================================================== */
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

    renderTimelineList();
    const step = sequence[currentStepIndex];

    if (step.type === 'popup') {
      const node = nodes.find(n => n.id === step.targetId);
      if (node) {
        node.visible = true;
        const el = document.getElementById('node-el-' + node.id);
        if (el) {
          el.style.display = 'flex';
          el.className = 'diagram-node anim-' + animEffect;
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
    }

    currentStepIndex++;
    playbackTimer = setTimeout(executeCurrentStep, stepSpeed * 1000);
  }

  function startPlayback() {
    isPlaying = true;
    btnPlay.classList.add('playing');
    playText.textContent = 'Pausar Animación';

    if (welcomeHint) welcomeHint.classList.add('hidden');

    if (currentStepIndex === 0) {
      // Ocultar elementos para la revelación progresiva
      nodes.forEach(n => {
        n.visible = false;
        const el = document.getElementById('node-el-' + n.id);
        if (el) el.style.display = 'none';
      });
      connections.forEach(c => {
        c.visible = false;
      });
      renderConnections();
    }

    executeCurrentStep();
  }

  function stopPlayback() {
    isPlaying = false;
    btnPlay.classList.remove('playing');
    playText.textContent = 'Iniciar Animación';

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

    // Restaurar visibilidad de todos los elementos
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
    renderTimelineList();
  }

  /* ========================================================
     PARSER E IMPORTADOR DE CÓDIGO IA (JSON)
     ======================================================== */
  function parseAndApplyAiCode(codeStr) {
    try {
      let cleaned = codeStr.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();

      const data = JSON.parse(cleaned);

      if (!data.nodes || !Array.isArray(data.nodes)) {
        alert('El JSON debe incluir un array "nodes".');
        return false;
      }

      nodes = [];
      connections = [];

      // Escala de coordenadas (adaptar a pantalla)
      const stageW = window.innerWidth;
      const stageH = window.innerHeight;

      data.nodes.forEach((n, idx) => {
        let x = n.x;
        let y = n.y;
        if (typeof x !== 'number') x = 200 + (idx * 220);
        if (typeof y !== 'number') y = stageH / 2;

        addNode({
          id: n.id || ('nodo_' + idx),
          title: n.title || 'NODO',
          subtitle: n.subtitle || 'PROCESO',
          color: n.color || getNextColor(),
          badge: n.badge || n.title.charAt(0),
          x,
          y
        });
      });

      if (data.connections && Array.isArray(data.connections)) {
        data.connections.forEach(c => {
          addConnection(c.from, c.to, c.fromPort, c.toPort, c.color, c.label || '');
        });
      }

      if (data.sequence && Array.isArray(data.sequence)) {
        sequence = [];
        data.sequence.forEach((st, idx) => {
          if (st.type === 'popup') {
            const nd = nodes.find(n => n.id === st.target);
            sequence.push({
              id: 'ai_step_' + idx,
              type: 'popup',
              targetId: st.target,
              label: `Aparece nodo: ${nd ? nd.title : st.target}`
            });
          } else if (st.type === 'arrow') {
            const conn = connections.find(c => c.from === st.from && c.to === st.to);
            sequence.push({
              id: 'ai_step_' + idx,
              type: 'arrow',
              connId: conn ? conn.id : null,
              label: `Flecha: ${st.from} → ${st.to}`
            });
          }
        });
        renderTimelineList();
      } else {
        rebuildTimelineAuto();
      }

      resetAnimation();
      modalAiCode.classList.add('hidden');
      return true;
    } catch (err) {
      alert('Error en formato JSON: ' + err.message);
      return false;
    }
  }

  /* ========================================================
     EXPORTADOR DETERMINISTA A ZIP (SECUENCIA PNG)
     ======================================================== */
  function drawStageToCanvas(ctx, width, height, isTransparent, bgColor) {
    ctx.clearRect(0, 0, width, height);

    if (!isTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    const scaleX = width / window.innerWidth;
    const scaleY = height / window.innerHeight;

    // 1. Dibujar Flechas
    connections.forEach(conn => {
      if (!conn.visible) return;
      const s = nodes.find(n => n.id === conn.from);
      const t = nodes.find(n => n.id === conn.to);
      if (!s || !t || !s.visible || !t.visible) return;

      const p1Raw = getNodePortCoords(s, conn.fromPort || 'right');
      const p2Raw = getNodePortCoords(t, conn.toPort || 'left');

      const p1 = { x: p1Raw.x * scaleX, y: p1Raw.y * scaleY };
      const p2 = { x: p2Raw.x * scaleX, y: p2Raw.y * scaleY };

      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const offset = Math.max(dist * 0.4, 40 * scaleX);

      let cp1x = p1.x, cp1y = p1.y;
      let cp2x = p2.x, cp2y = p2.y;

      switch (conn.fromPort) {
        case 'right':  cp1x = p1.x + offset; break;
        case 'left':   cp1x = p1.x - offset; break;
        case 'bottom': cp1y = p1.y + offset; break;
        case 'top':    cp1y = p1.y - offset; break;
        default:       cp1x = p1.x + offset; break;
      }

      switch (conn.toPort) {
        case 'left':   cp2x = p2.x - offset; break;
        case 'right':  cp2x = p2.x + offset; break;
        case 'top':    cp2y = p2.y - offset; break;
        case 'bottom': cp2y = p2.y + offset; break;
        default:       cp2x = p2.x - offset; break;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      ctx.lineWidth = arrowWidth * scaleX;
      ctx.strokeStyle = conn.color || '#38bdf8';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Flecha triangular
      const angle = Math.atan2(p2.y - cp2y, p2.x - cp2x);
      const headLen = 14 * scaleX;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 7), p2.y - headLen * Math.sin(angle - Math.PI / 7));
      ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 7), p2.y - headLen * Math.sin(angle + Math.PI / 7));
      ctx.closePath();
      ctx.fillStyle = conn.color || '#38bdf8';
      ctx.fill();

      // Etiqueta
      if (conn.label) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - (8 * scaleY);
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${11 * scaleX}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(conn.label, midX, midY);
      }
    });

    // 2. Dibujar Nodos
    nodes.forEach(node => {
      if (!node.visible) return;

      const nx = node.x * scaleX;
      const ny = node.y * scaleY;
      const nodeW = NODE_WIDTH * scaleX;
      const nodeH = NODE_HEIGHT * scaleY;
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
      const badgeSize = 28 * scaleX;
      const bx = x + (14 * scaleX);
      const by = y + (16 * scaleY);
      ctx.fillStyle = node.color || '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeSize, badgeSize, 6 * scaleX);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = `800 ${13 * scaleX}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.badge || node.title.charAt(0), bx + badgeSize / 2, by + badgeSize / 2);

      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${15 * scaleX}px 'Outfit', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.title, bx + badgeSize + (10 * scaleX), by + badgeSize / 2);

      // Subtítulo
      ctx.fillStyle = '#9ca3af';
      ctx.font = `600 ${11 * scaleX}px monospace`;
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

    exportBanner.classList.remove('hidden');
    exportStatusTitle.textContent = 'Iniciando captura de fotogramas...';
    exportStatusSub.textContent = `Fotograma 0 / ${totalFrames} (0%)`;
    exportProgressFill.style.width = '0%';

    if (shouldRestart) resetAnimation();
    if (!isPlaying) startPlayback();

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

    exportStatusTitle.textContent = 'Generando archivo ZIP...';
    exportStatusSub.textContent = 'Empaquetando secuencia PNG...';

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

    // 1. Lista de Bloques
    blocksList.innerHTML = '';
    nodes.forEach(node => {
      const row = document.createElement('div');
      row.className = 'block-row-card';

      const left = document.createElement('div');
      left.className = 'block-row-left';

      // Selector de color
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'block-color-picker-input';
      colorInput.value = node.color;
      colorInput.title = 'Cambiar color del bloque';
      colorInput.addEventListener('input', (e) => {
        node.color = e.target.value;
        renderNodes();
      });

      // Entrada de nombre
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'block-name-input';
      nameInput.value = node.title;
      nameInput.title = 'Editar nombre del bloque';
      nameInput.addEventListener('change', (e) => {
        const val = e.target.value.trim();
        if (val) {
          node.title = val;
          node.badge = val.charAt(0).toUpperCase();
          renderNodes();
          rebuildTimelineAuto();
        }
      });

      left.appendChild(colorInput);
      left.appendChild(nameInput);

      const actions = document.createElement('div');
      actions.className = 'block-row-actions';

      // Botón Duplicar
      const btnDup = document.createElement('button');
      btnDup.type = 'button';
      btnDup.className = 'btn-mini-icon';
      btnDup.title = 'Duplicar bloque';
      btnDup.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      btnDup.addEventListener('click', () => duplicateNode(node.id));

      // Botón Eliminar
      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn-mini-icon del';
      btnDel.title = 'Eliminar bloque';
      btnDel.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      btnDel.addEventListener('click', () => removeNode(node.id));

      actions.appendChild(btnDup);
      actions.appendChild(btnDel);

      row.appendChild(left);
      row.appendChild(actions);
      blocksList.appendChild(row);
    });

    // 2. Lista de Conexiones / Flechas
    connectionsList.innerHTML = '';
    connections.forEach(conn => {
      const s = nodes.find(n => n.id === conn.from);
      const t = nodes.find(n => n.id === conn.to);
      const sTitle = s ? s.title : conn.from;
      const tTitle = t ? t.title : conn.to;

      const row = document.createElement('div');
      row.className = 'block-row-card';

      const left = document.createElement('div');
      left.className = 'block-row-left';

      // Selector de color de flecha
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'block-color-picker-input';
      colorInput.value = conn.color || '#38bdf8';
      colorInput.title = 'Cambiar color de flecha';
      colorInput.addEventListener('input', (e) => {
        conn.color = e.target.value;
        renderConnections();
      });

      // Input de etiqueta / descripción
      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.className = 'block-name-input';
      labelInput.placeholder = `${sTitle} → ${tTitle}`;
      labelInput.value = conn.label || '';
      labelInput.title = 'Descripción de la flecha';
      labelInput.addEventListener('change', (e) => {
        conn.label = e.target.value.trim();
        renderConnections();
        rebuildTimelineAuto();
      });

      left.appendChild(colorInput);
      left.appendChild(labelInput);

      const actions = document.createElement('div');
      actions.className = 'block-row-actions';

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn-mini-icon del';
      btnDel.title = 'Eliminar flecha';
      btnDel.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      btnDel.addEventListener('click', () => removeConnection(conn.id));

      actions.appendChild(btnDel);

      row.appendChild(left);
      row.appendChild(actions);
      connectionsList.appendChild(row);
    });

    renderTimelineList();
  }

  /* ========================================================
     INICIALIZACIÓN DE EVENTOS
     ======================================================== */
  function initEvents() {
    // Abrir/Cerrar Panel
    menuBtn.addEventListener('click', () => {
      controlPanel.classList.toggle('hidden');
      if (welcomeHint) welcomeHint.classList.add('hidden');
    });

    welcomeHint.addEventListener('click', () => {
      controlPanel.classList.remove('hidden');
      welcomeHint.classList.add('hidden');
    });

    // Pestañas
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

    // Añadir Bloque
    btnAddBlock.addEventListener('click', () => {
      addNode();
      playPopSound('normal');
    });

    // Unir Nodos
    btnToggleConnectMode.addEventListener('click', () => {
      isConnectingMode = !isConnectingMode;
      btnToggleConnectMode.classList.toggle('active', isConnectingMode);
      connectModeLabel.textContent = isConnectingMode ? 'Selecciona 2 nodos' : 'Unir Nodos';
      if (!isConnectingMode && connectSourceNodeId) {
        const el = document.getElementById('node-el-' + connectSourceNodeId);
        if (el) el.classList.remove('is-connect-source');
        connectSourceNodeId = null;
      }
    });

    // Limpiar bloques / flechas
    btnClearBlocks.addEventListener('click', () => {
      nodes = [];
      connections = [];
      sequence = [];
      renderNodes();
      updateUILists();
    });

    btnClearConnections.addEventListener('click', () => {
      connections = [];
      renderConnections();
      rebuildTimelineAuto();
      updateUILists();
    });

    btnRebuildTimeline.addEventListener('click', () => {
      rebuildTimelineAuto();
    });

    // Controles de Animación
    btnPlay.addEventListener('click', togglePlayback);
    btnReset.addEventListener('click', resetAnimation);

    const paramStepSpeed = document.getElementById('param-step-speed');
    const valStepSpeed = document.getElementById('val-step-speed');
    paramStepSpeed.addEventListener('input', (e) => {
      stepSpeed = parseFloat(e.target.value);
      valStepSpeed.textContent = stepSpeed.toFixed(2) + ' s';
    });

    const paramAnimEffect = document.getElementById('param-anim-effect');
    paramAnimEffect.addEventListener('change', (e) => {
      animEffect = e.target.value;
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
        alert('Pega primero el código JSON generado por la IA.');
        return;
      }
      parseAndApplyAiCode(code);
    });

    btnFormatExample.addEventListener('click', () => {
      aiCodeInput.value = JSON.stringify({
        nodes: [
          { id: "cliente", title: "CLIENTE", subtitle: "NAVEGADOR", color: "#38bdf8", x: 380, y: 540 },
          { id: "servidor", title: "SERVIDOR", subtitle: "API REST", color: "#10b981", x: 960, y: 540 },
          { id: "db", title: "BASE DE DATOS", subtitle: "POSTGRESQL", color: "#f59e0b", x: 1540, y: 540 }
        ],
        connections: [
          { from: "cliente", fromPort: "right", to: "servidor", toPort: "left", color: "#38bdf8", label: "REQUEST" },
          { from: "servidor", fromPort: "right", to: "db", toPort: "left", color: "#10b981", label: "QUERY" },
          { from: "servidor", fromPort: "bottom", to: "cliente", toPort: "bottom", color: "#38bdf8", label: "RESPONSE" }
        ],
        sequence: [
          { type: "popup", target: "cliente" },
          { type: "arrow", from: "cliente", to: "servidor" },
          { type: "popup", target: "servidor" },
          { type: "arrow", from: "servidor", to: "db" },
          { type: "popup", target: "db" },
          { type: "arrow", from: "servidor", to: "cliente" }
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
        if (welcomeHint) welcomeHint.classList.add('hidden');
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === 'r' || e.key === 'R') {
        resetAnimation();
      }
    });

    window.addEventListener('resize', () => {
      renderConnections();
    });
  }

  // Carga inicial limpia con 3 bloques conectados como base lista para usar
  function initApp() {
    initEvents();

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const n1 = addNode({ id: 'inicio', title: 'INICIO', subtitle: 'ORIGEN', color: '#38bdf8', x: cx - 360, y: cy });
    const n2 = addNode({ id: 'proceso', title: 'PROCESO', subtitle: 'LÓGICA', color: '#10b981', x: cx, y: cy });
    const n3 = addNode({ id: 'salida', title: 'SALIDA', subtitle: 'RESULTADO', color: '#f59e0b', x: cx + 360, y: cy });

    addConnection(n1.id, n2.id, 'right', 'left', '#38bdf8', 'PASO 1');
    addConnection(n2.id, n3.id, 'right', 'left', '#10b981', 'PASO 2');

    resetAnimation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
