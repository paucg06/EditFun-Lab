/**
 * WhatsApp Fake Simulator - Script Logic
 * Author: EditFun Suite
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================
  const state = {
    theme: 'dark', // 'dark' | 'light'
    mode: 'auto', // 'auto' | 'forced-mobile'
    mobileView: 'in-chat', // 'in-list' | 'in-chat'
    sender: 'me', // 'me' | 'contact'
    activeContactId: 'c1',
    editingContactId: null, // id cuando se abre el modal de edición
    autoReply: {
      enabled: true,
      delay: 2.0,
      scriptLines: [
        'Hola!',
        'No',
        'Llegaré a las 8',
        'El finde que viene si quieres vemos',
        'Vale venga va 👍'
      ],
      currentIndex: 0
    },
    contacts: [
      {
        id: 'c1',
        name: 'Aanano 💎',
        avatar: '',
        status: 'en línea',
        unreadCount: 0,
        type: 'personal',
        messages: [
          {
            id: 'm1',
            sender: 'contact',
            type: 'text',
            content: 'Hola! Sigues despierto?',
            time: '15:38',
            ticks: 'none'
          },
          {
            id: 'm2',
            sender: 'me',
            type: 'text',
            content: 'Sí, dime qué pasó',
            time: '15:39',
            ticks: 'blue'
          },
          {
            id: 'm3',
            sender: 'contact',
            type: 'text',
            content: 'Viste lo que subieron al grupo de la uni? 😱',
            time: '15:40',
            ticks: 'none'
          },
          {
            id: 'm4',
            sender: 'me',
            type: 'text',
            content: 'No todavía, pásamelo',
            time: '15:41',
            ticks: 'blue'
          }
        ]
      },
      {
        id: 'c2',
        name: 'Mamá ❤️',
        avatar: '',
        status: 'últ. vez hoy a las 14:15',
        unreadCount: 2,
        type: 'personal',
        messages: [
          {
            id: 'm21',
            sender: 'contact',
            type: 'text',
            content: 'Hijo, acuérdate de comprar pan al volver a casa',
            time: '14:10',
            ticks: 'none'
          },
          {
            id: 'm22',
            sender: 'contact',
            type: 'text',
            content: 'Llámame cuando puedas',
            time: '14:15',
            ticks: 'none'
          }
        ]
      },
      {
        id: 'c3',
        name: 'Proyecto Trabajo 💼',
        avatar: '',
        status: 'últ. vez hoy a las 11:20',
        unreadCount: 0,
        type: 'groups',
        messages: [
          {
            id: 'm31',
            sender: 'contact',
            type: 'text',
            content: 'Por favor revisad los cambios de la v2.0 en GitHub',
            time: 'Ayer',
            ticks: 'none'
          }
        ]
      },
      {
        id: 'c4',
        name: 'Carlos Gym 💪',
        avatar: '',
        status: 'en línea',
        unreadCount: 0,
        type: 'personal',
        messages: [
          {
            id: 'm41',
            sender: 'contact',
            type: 'text',
            content: 'Mañana toca pierna no te olvides 🏋️‍♂️',
            time: '10/9/2026',
            ticks: 'none'
          }
        ]
      }
    ]
  };

  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================
  const body = document.body;
  const layout = document.getElementById('wa-app-layout');
  const sidebar = document.getElementById('wa-sidebar');
  const sidebarResizer = document.getElementById('sidebar-resizer');
  const chatListContainer = document.getElementById('wa-chat-list');
  const messagesContainer = document.getElementById('wa-messages-container');
  const messagesViewport = document.getElementById('wa-messages-viewport');
  const textInput = document.getElementById('wa-text-input');
  const btnSend = document.getElementById('btn-send-message');
  const iconSendArrow = document.getElementById('icon-send-arrow');
  const iconSendMic = document.getElementById('icon-send-mic');
  
  // Header Activo
  const headerContactName = document.getElementById('header-contact-name');
  const headerContactStatus = document.getElementById('header-contact-status');
  const headerAvatarImg = document.getElementById('header-avatar-img');
  const headerAvatarLetter = document.getElementById('header-avatar-letter');
  const btnBackToList = document.getElementById('btn-back-to-list');
  const btnOpenContactModal = document.getElementById('btn-open-contact-modal');
  
  // Dropdown Menús
  const btnSidebarMenu = document.getElementById('btn-sidebar-menu');
  const sidebarDropdown = document.getElementById('sidebar-dropdown-menu');
  const btnChatMenu = document.getElementById('btn-chat-menu');
  const chatDropdown = document.getElementById('chat-dropdown-menu');
  const btnClipAttach = document.getElementById('btn-clip-attach');
  const clipDropdown = document.getElementById('clip-dropdown-menu');
  
  // Opciones del Menú de Sidebar
  const btnMenuToggleTheme = document.getElementById('menu-btn-toggle-theme');
  const themeToggleLabel = document.getElementById('theme-toggle-label');
  const btnMenuToggleView = document.getElementById('menu-btn-toggle-view');
  const viewToggleLabel = document.getElementById('view-toggle-label');
  const btnMenuExportChats = document.getElementById('menu-btn-export-chats');
  const btnMenuImportChats = document.getElementById('menu-btn-import-chats');
  const fileImportJson = document.getElementById('chat-import-json-input');
  
  // Opciones del Menú de Chat
  const btnChatAutoReply = document.getElementById('chat-menu-btn-auto-reply');
  const btnChatEditContact = document.getElementById('chat-menu-btn-edit-contact');
  const btnChatToggleSender = document.getElementById('chat-menu-btn-toggle-sender');
  const chatSenderToggleLabel = document.getElementById('chat-sender-toggle-label');
  const btnChatClearMsgs = document.getElementById('chat-menu-btn-clear-msgs');
  const btnChatResetDemo = document.getElementById('chat-menu-btn-reset-demo');
  
  // Adjuntar
  const btnMenuAttachPhoto = document.getElementById('btn-menu-attach-photo');
  const btnMenuAttachOneTime = document.getElementById('btn-menu-attach-onetime');
  const fileAttachInput = document.getElementById('chat-attach-file-input');
  const btnInputCamera = document.getElementById('btn-input-camera');
  const btnSidebarCamera = document.getElementById('btn-sidebar-camera');
  
  // Modal Contacto
  const contactModalOverlay = document.getElementById('contact-modal-overlay');
  const contactModalTitle = document.getElementById('contact-modal-title');
  const btnCloseContactModal = document.getElementById('btn-close-contact-modal');
  const btnCancelContactModal = document.getElementById('btn-cancel-contact-modal');
  const btnSaveContactModal = document.getElementById('btn-save-contact-modal');
  const modalContactName = document.getElementById('modal-contact-name-input');
  const modalContactStatus = document.getElementById('modal-contact-status-select');
  const modalContactStatusCustom = document.getElementById('modal-contact-status-custom');
  const modalAvatarPreviewImg = document.getElementById('modal-avatar-img');
  const modalAvatarPreviewLetter = document.getElementById('modal-avatar-letter');
  const modalAvatarFileInput = document.getElementById('modal-avatar-file-input');
  const btnModalRemoveAvatar = document.getElementById('btn-modal-remove-avatar');
  const btnAddContactTop = document.getElementById('btn-add-contact-top');
  const btnMobileFab = document.getElementById('btn-mobile-fab');
  let tempAvatarBase64 = '';
  
  // Modal Automatización
  const autoModalOverlay = document.getElementById('automation-modal-overlay');
  const btnCloseAutoModal = document.getElementById('btn-close-automation-modal');
  const btnCancelAutoModal = document.getElementById('btn-cancel-automation-modal');
  const btnSaveAutoModal = document.getElementById('btn-save-automation-modal');
  const autoReplyCheckbox = document.getElementById('auto-reply-checkbox');
  const autoReplyDelayInput = document.getElementById('auto-reply-delay-input');
  const autoReplyScriptTextarea = document.getElementById('auto-reply-script-textarea');
  
  // Llamadas
  const btnVoiceCall = document.getElementById('btn-trigger-voicecall');
  const btnVideoCall = document.getElementById('btn-trigger-videocall');
  const voiceOverlay = document.getElementById('voicecall-overlay');
  const videoOverlay = document.getElementById('videocall-overlay');
  const btnCallHangup = document.getElementById('btn-call-hangup');
  const btnVideoHangup = document.getElementById('btn-videocall-hangup');
  const callNameDisplay = document.getElementById('call-name-display');
  const callStatusText = document.getElementById('call-status-text');
  const videoNameDisplay = document.getElementById('videocall-name-display');
  const videoStatusText = document.getElementById('videocall-status-text');
  
  // Búsqueda & Filtros
  const searchInput = document.getElementById('wa-search-input');
  const filterPills = document.querySelectorAll('.wa-pill');
  let currentFilter = 'all';

  // Actualización del Reloj
  function updateClock() {
    const clockEl = document.getElementById('status-clock');
    if (clockEl) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}`;
    }
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ==========================================
  // RESIZER DE LA BARRA LATERAL (DESKTOP)
  // ==========================================
  let isResizing = false;
  sidebarResizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    sidebarResizer.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const offsetLeft = layout.getBoundingClientRect().left;
    const newWidth = e.clientX - offsetLeft;
    if (newWidth >= 260 && newWidth <= 600) {
      sidebar.style.width = `${newWidth}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      sidebarResizer.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // ==========================================
  // WEB AUDIO SINTETIZADOR
  // ==========================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    return audioCtx;
  }

  function playSentPopSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  function playReceivedPopSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // ==========================================
  // GESTIÓN DE CONTACTOS Y SELECCIÓN
  // ==========================================
  function getActiveContact() {
    return state.contacts.find(c => c.id === state.activeContactId) || state.contacts[0];
  }

  function renderChatList() {
    chatListContainer.innerHTML = '';
    const query = (searchInput.value || '').trim().toLowerCase();

    const filtered = state.contacts.filter(c => {
      const matchesQuery = c.name.toLowerCase().includes(query) ||
        (c.messages.length && c.messages[c.messages.length - 1].content.toLowerCase().includes(query));
      
      if (!matchesQuery) return false;
      if (currentFilter === 'all') return true;
      if (currentFilter === 'unread') return c.unreadCount > 0;
      if (currentFilter === 'favorites') return c.isFavorite;
      if (currentFilter === 'groups') return c.type === 'groups';
      return true;
    });

    filtered.forEach(contact => {
      const item = document.createElement('div');
      item.className = `wa-chat-item ${contact.id === state.activeContactId ? 'active' : ''}`;
      item.dataset.id = contact.id;

      const lastMsg = contact.messages.length ? contact.messages[contact.messages.length - 1] : null;
      let lastText = 'Toca para chatear';
      let lastTime = '';
      if (lastMsg) {
        lastTime = lastMsg.time;
        if (lastMsg.type === 'audio') lastText = '🎤 Audio (' + (lastMsg.duration || '0:14') + ')';
        else if (lastMsg.type === 'onetime') lastText = '📷 Foto';
        else if (lastMsg.type === 'image') lastText = '📷 Foto';
        else lastText = lastMsg.content;
      }

      const avatarMarkup = contact.avatar
        ? `<img src="${contact.avatar}" alt="${contact.name}">`
        : `<span>${contact.name.charAt(0).toUpperCase()}</span>`;

      item.innerHTML = `
        <div class="wa-chat-avatar">
          ${avatarMarkup}
        </div>
        <div class="wa-chat-info">
          <div class="wa-chat-info-top">
            <span class="wa-chat-title">${escapeHTML(contact.name)}</span>
            <span class="wa-chat-time ${contact.unreadCount > 0 ? 'unread' : ''}">${lastTime}</span>
          </div>
          <div class="wa-chat-info-bottom">
            <div class="wa-chat-snippet ${contact.status === 'escribiendo...' ? 'typing-text' : ''}">
              ${contact.status === 'escribiendo...' ? '<em>escribiendo...</em>' : escapeHTML(lastText)}
            </div>
            ${contact.unreadCount > 0 ? `<span class="wa-chat-badge">${contact.unreadCount}</span>` : ''}
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        selectContact(contact.id);
      });

      chatListContainer.appendChild(item);
    });
  }

  function selectContact(contactId) {
    state.activeContactId = contactId;
    const contact = getActiveContact();
    if (contact) {
      contact.unreadCount = 0;
    }
    
    state.mobileView = 'in-chat';
    updateMobileLayoutView();

    renderActiveHeader();
    renderMessages();
    renderChatList();
  }

  function renderActiveHeader() {
    const contact = getActiveContact();
    if (!contact) return;

    headerContactName.textContent = contact.name;
    headerContactStatus.textContent = contact.status;

    if (contact.avatar) {
      headerAvatarImg.src = contact.avatar;
      headerAvatarImg.style.display = 'block';
      headerAvatarLetter.style.display = 'none';
    } else {
      headerAvatarImg.style.display = 'none';
      headerAvatarLetter.style.display = 'block';
      headerAvatarLetter.textContent = contact.name.charAt(0).toUpperCase();
    }
  }

  function updateMobileLayoutView() {
    layout.className = `wa-app-layout mobile-${state.mobileView}`;
  }

  // ==========================================
  // RENDERIZADO DE MENSAJES
  // ==========================================
  function renderMessages() {
    const contact = getActiveContact();
    if (!contact) return;

    const dateDivider = messagesContainer.querySelector('.wa-date-divider');
    const encryptionNotice = messagesContainer.querySelector('.wa-encryption-notice');
    
    messagesContainer.innerHTML = '';
    if (dateDivider) messagesContainer.appendChild(dateDivider);
    if (encryptionNotice) messagesContainer.appendChild(encryptionNotice);

    contact.messages.forEach(msg => {
      const msgRow = createMessageElement(msg);
      messagesContainer.appendChild(msgRow);
    });

    scrollToBottom();
  }

  function createMessageElement(msg) {
    const row = document.createElement('div');
    row.className = `wa-msg-row ${msg.sender === 'me' ? 'sent' : 'received'}`;
    row.id = `msg-${msg.id}`;

    const bubble = document.createElement('div');
    bubble.className = 'wa-bubble';

    let contentHtml = '';

    if (msg.type === 'text') {
      contentHtml = `<div class="wa-msg-text">${formatMessageText(msg.content)}</div>`;
    } else if (msg.type === 'image') {
      contentHtml = `
        <div class="wa-msg-image-wrap">
          <img src="${msg.content}" alt="Foto adjunta">
        </div>
        ${msg.caption ? `<div class="wa-msg-text">${formatMessageText(msg.caption)}</div>` : ''}
      `;
    } else if (msg.type === 'onetime') {
      contentHtml = `
        <div class="wa-onetime-card">
          <div class="onetime-badge-circle">1</div>
          <span class="onetime-text">Foto</span>
        </div>
      `;
    } else if (msg.type === 'audio') {
      const barsCount = 30;
      let barsHtml = '';
      for (let i = 0; i < barsCount; i++) {
        const height = Math.floor(Math.random() * 20) + 6;
        barsHtml += `<div class="audio-bar" style="height: ${height}px;"></div>`;
      }

      contentHtml = `
        <div class="wa-audio-player" data-duration="${msg.duration || '0:14'}">
          <button class="audio-play-btn" title="Reproducir nota de voz">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="audio-waveform-wrap">
            <div class="audio-bars-container">
              ${barsHtml}
            </div>
            <div class="audio-info-row">
              <span class="audio-timer">${msg.duration || '0:14'}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Ticks SVG oficiales
    let tickHtml = '';
    if (msg.sender === 'me') {
      if (msg.ticks === 'blue') {
        tickHtml = `<span class="tick-icon blue" title="Leído"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 3.316l-7.79 7.79a.75.75 0 0 1-1.06 0l-4.24-4.24a.75.75 0 0 1 1.06-1.06l3.71 3.71 7.26-7.26a.75.75 0 0 1 1.06 1.06zm-3.5 0l-5.69 5.69-1.59-1.59a.75.75 0 0 0-1.06 1.06l2.12 2.12a.75.75 0 0 0 1.06 0l6.22-6.22a.75.75 0 0 0-1.06-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'grey') {
        tickHtml = `<span class="tick-icon grey" title="Entregado"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 3.316l-7.79 7.79a.75.75 0 0 1-1.06 0l-4.24-4.24a.75.75 0 0 1 1.06-1.06l3.71 3.71 7.26-7.26a.75.75 0 0 1 1.06 1.06zm-3.5 0l-5.69 5.69-1.59-1.59a.75.75 0 0 0-1.06 1.06l2.12 2.12a.75.75 0 0 0 1.06 0l6.22-6.22a.75.75 0 0 0-1.06-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'single') {
        tickHtml = `<span class="tick-icon grey" title="Enviado"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.01 3.316l-6.79 6.79a.75.75 0 0 1-1.06 0l-2.24-2.24a.75.75 0 0 1 1.06-1.06l1.71 1.71 6.26-6.26a.75.75 0 0 1 1.06 1.06z"/></svg></span>`;
      }
    }

    bubble.innerHTML = `
      ${contentHtml}
      <div class="wa-msg-meta">
        <span class="wa-msg-time">${msg.time}</span>
        ${tickHtml}
      </div>
    `;

    if (msg.type === 'audio') {
      setupAudioPlayer(bubble);
    }

    row.appendChild(bubble);
    return row;
  }

  function setupAudioPlayer(bubble) {
    const playBtn = bubble.querySelector('.audio-play-btn');
    const bars = bubble.querySelectorAll('.audio-bar');
    const timer = bubble.querySelector('.audio-timer');
    let isPlaying = false;
    let progress = 0;
    let interval = null;

    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        clearInterval(interval);
        isPlaying = false;
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      } else {
        isPlaying = true;
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        progress = 0;
        bars.forEach(b => b.classList.remove('played'));

        interval = setInterval(() => {
          if (progress < bars.length) {
            bars[progress].classList.add('played');
            progress++;
            const secs = Math.floor((progress / bars.length) * 14);
            timer.textContent = `0:${secs < 10 ? '0' + secs : secs}`;
          } else {
            clearInterval(interval);
            isPlaying = false;
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
            timer.textContent = '0:14';
          }
        }, 110);
      }
    });
  }

  function formatMessageText(text) {
    if (!text) return '';
    let escaped = escapeHTML(text);
    escaped = escaped.replace(/\*([^\*]+)\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/_([^_]+)_/g, '<em>$1</em>');
    escaped = escaped.replace(/~([^~]+)~/g, '<del>$1</del>');
    escaped = escaped.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--text-link); text-decoration:underline;">$1</a>');
    return escaped;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesViewport.scrollTop = messagesViewport.scrollHeight;
    }, 20);
  }

  function getCurrentTimeString() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // ==========================================
  // ENVÍO DE MENSAJES & AUTOMATIZACIÓN
  // ==========================================
  function sendMessage(content, type = 'text') {
    if (!content && type === 'text') return;
    const contact = getActiveContact();
    if (!contact) return;

    const time = getCurrentTimeString();
    const newMsg = {
      id: 'm_' + Date.now(),
      sender: state.sender,
      type: type,
      content: content,
      time: time,
      ticks: state.sender === 'me' ? (state.autoReply.enabled ? 'grey' : 'single') : 'none'
    };

    contact.messages.push(newMsg);
    renderMessages();
    renderChatList();

    if (state.sender === 'me') {
      playSentPopSound();

      // Si la automatización está activada:
      if (state.autoReply.enabled && state.autoReply.scriptLines.length > 0) {
        triggerAutomatedReply(contact, newMsg);
      }
    } else {
      playReceivedPopSound();
    }
  }

  function triggerAutomatedReply(contact, lastSentMsg) {
    const script = state.autoReply.scriptLines;
    if (!script || script.length === 0) return;

    const replyText = script[state.autoReply.currentIndex % script.length];
    state.autoReply.currentIndex++;

    const delayMs = Math.max(500, state.autoReply.delay * 1000);

    // 1. A los 400ms: El contacto entra "en línea" y lee el mensaje (doble tick azul)
    setTimeout(() => {
      lastSentMsg.ticks = 'blue';
      contact.status = 'en línea';
      if (contact.id === state.activeContactId) renderActiveHeader();
      renderMessages();
      renderChatList();
    }, 400);

    // 2. A mitad de tiempo: El contacto pasa a "escribiendo..."
    setTimeout(() => {
      contact.status = 'escribiendo...';
      if (contact.id === state.activeContactId) renderActiveHeader();
      renderChatList();
    }, Math.max(600, delayMs - 800));

    // 3. Al cumplirse el delay: Envía la respuesta y vuelve a "en línea"
    setTimeout(() => {
      contact.status = 'en línea';
      if (contact.id === state.activeContactId) renderActiveHeader();

      const time = getCurrentTimeString();
      contact.messages.push({
        id: 'm_' + Date.now(),
        sender: 'contact',
        type: 'text',
        content: replyText,
        time: time,
        ticks: 'none'
      });

      renderMessages();
      renderChatList();
      playReceivedPopSound();
    }, delayMs);
  }

  // ==========================================
  // INPUT TEXTAREA & MORPHING MIC/SEND BUTTON
  // ==========================================
  textInput.addEventListener('input', () => {
    const val = textInput.value.trim();
    if (val.length > 0) {
      iconSendMic.style.display = 'none';
      iconSendArrow.style.display = 'block';
      btnSend.title = 'Enviar mensaje';
    } else {
      iconSendMic.style.display = 'block';
      iconSendArrow.style.display = 'none';
      btnSend.title = 'Grabar nota de voz';
    }
  });

  btnSend.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text.length > 0) {
      sendMessage(text, 'text');
      textInput.value = '';
      textInput.style.height = 'auto';
      iconSendMic.style.display = 'block';
      iconSendArrow.style.display = 'none';
    } else {
      // Enviar nota de voz simulada
      sendMessage('audio_note', 'audio');
    }
  });

  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      btnSend.click();
    }
  });

  // ==========================================
  // DROPDOWN MENÚS NATIVOS
  // ==========================================
  function closeAllDropdowns() {
    sidebarDropdown.classList.remove('show');
    chatDropdown.classList.remove('show');
    clipDropdown.classList.remove('show');
  }

  btnSidebarMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = sidebarDropdown.classList.contains('show');
    closeAllDropdowns();
    if (!isShown) sidebarDropdown.classList.add('show');
  });

  btnChatMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = chatDropdown.classList.contains('show');
    closeAllDropdowns();
    if (!isShown) chatDropdown.classList.add('show');
  });

  btnClipAttach.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = clipDropdown.classList.contains('show');
    closeAllDropdowns();
    if (!isShown) clipDropdown.classList.add('show');
  });

  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  // ==========================================
  // ACCIONES DEL MENÚ GENERAL (SIDEBAR)
  // ==========================================

  // Alternar Tema
  btnMenuToggleTheme.addEventListener('click', () => {
    if (state.theme === 'dark') {
      state.theme = 'light';
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      themeToggleLabel.textContent = 'Cambiar a Tema Oscuro';
    } else {
      state.theme = 'dark';
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      themeToggleLabel.textContent = 'Cambiar a Tema Claro';
    }
    closeAllDropdowns();
  });

  // Alternar Vista (Forzar Móvil o Automático)
  btnMenuToggleView.addEventListener('click', () => {
    if (state.mode === 'auto') {
      state.mode = 'forced-mobile';
      body.classList.remove('mode-auto');
      body.classList.add('mode-forced-mobile');
      viewToggleLabel.textContent = 'Restablecer Vista Automática';
    } else {
      state.mode = 'auto';
      body.classList.remove('mode-forced-mobile');
      body.classList.add('mode-auto');
      viewToggleLabel.textContent = 'Forzar Marco Móvil';
    }
    closeAllDropdowns();
  });

  // Exportar Chats (JSON)
  btnMenuExportChats.addEventListener('click', () => {
    closeAllDropdowns();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.contacts, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "whatsapp_chats_backup.json");
    dlAnchorElem.click();
  });

  // Importar Chats (JSON)
  btnMenuImportChats.addEventListener('click', () => {
    closeAllDropdowns();
    fileImportJson.click();
  });

  fileImportJson.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            state.contacts = imported;
            selectContact(imported[0].id);
            alert('¡Chats importados correctamente!');
          }
        } catch (err) {
          alert('El archivo seleccionado no tiene un formato JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  });

  // ==========================================
  // ACCIONES DEL MENÚ DEL CHAT ACTIVO
  // ==========================================

  // Abrir Modal de Respuestas Automáticas
  btnChatAutoReply.addEventListener('click', () => {
    closeAllDropdowns();
    autoReplyCheckbox.checked = state.autoReply.enabled;
    autoReplyDelayInput.value = state.autoReply.delay;
    autoReplyScriptTextarea.value = state.autoReply.scriptLines.join('\n');
    autoModalOverlay.style.display = 'flex';
  });

  btnCloseAutoModal.addEventListener('click', () => autoModalOverlay.style.display = 'none');
  btnCancelAutoModal.addEventListener('click', () => autoModalOverlay.style.display = 'none');

  btnSaveAutoModal.addEventListener('click', () => {
    state.autoReply.enabled = autoReplyCheckbox.checked;
    state.autoReply.delay = parseFloat(autoReplyDelayInput.value) || 2;
    state.autoReply.scriptLines = autoReplyScriptTextarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    autoModalOverlay.style.display = 'none';
  });

  // Alternar Emisor (Tú / Contacto)
  btnChatToggleSender.addEventListener('click', () => {
    closeAllDropdowns();
    if (state.sender === 'me') {
      state.sender = 'contact';
      chatSenderToggleLabel.textContent = 'Enviar como: Contacto (Gris)';
    } else {
      state.sender = 'me';
      chatSenderToggleLabel.textContent = 'Enviar como: Tú (Verde)';
    }
  });

  // Vaciar Mensajes
  btnChatClearMsgs.addEventListener('click', () => {
    closeAllDropdowns();
    const contact = getActiveContact();
    if (contact && confirm('¿Estás seguro de vaciar todos los mensajes de este chat?')) {
      contact.messages = [];
      renderMessages();
      renderChatList();
    }
  });

  // Restablecer Demo
  btnChatResetDemo.addEventListener('click', () => {
    closeAllDropdowns();
    const contact = getActiveContact();
    if (contact) {
      contact.messages = [
        { id: 'p1', sender: 'contact', type: 'text', content: 'Hola! Sigues despierto?', time: '15:38', ticks: 'none' },
        { id: 'p2', sender: 'me', type: 'text', content: 'Sí, dime qué pasó', time: '15:39', ticks: 'blue' },
        { id: 'p3', sender: 'contact', type: 'text', content: 'Viste lo que subieron al grupo de la uni? 😱', time: '15:40', ticks: 'none' },
        { id: 'p4', sender: 'me', type: 'text', content: 'No todavía, pásamelo', time: '15:41', ticks: 'blue' }
      ];
      renderMessages();
      renderChatList();
    }
  });

  // ==========================================
  // ADJUNTAR ARCHIVOS & FOTOS
  // ==========================================
  btnMenuAttachPhoto.addEventListener('click', () => {
    closeAllDropdowns();
    fileAttachInput.click();
  });

  btnMenuAttachOneTime.addEventListener('click', () => {
    closeAllDropdowns();
    sendMessage('1_time_view', 'onetime');
  });

  btnInputCamera.addEventListener('click', () => {
    fileAttachInput.click();
  });

  btnSidebarCamera.addEventListener('click', () => {
    fileAttachInput.click();
  });

  fileAttachInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        sendMessage(event.target.result, 'image');
        fileAttachInput.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  // ==========================================
  // MODAL CREAR / EDITAR CONTACTO NATIVO
  // ==========================================
  function openContactModal(contact = null) {
    if (contact) {
      state.editingContactId = contact.id;
      contactModalTitle.textContent = 'Editar Contacto';
      modalContactName.value = contact.name;
      tempAvatarBase64 = contact.avatar || '';

      if (['en línea', 'escribiendo...', 'grabando audio...', 'últ. vez hoy a las 15:08'].includes(contact.status)) {
        modalContactStatus.value = contact.status;
        modalContactStatusCustom.style.display = 'none';
      } else {
        modalContactStatus.value = 'custom';
        modalContactStatusCustom.style.display = 'block';
        modalContactStatusCustom.value = contact.status;
      }
    } else {
      state.editingContactId = null;
      contactModalTitle.textContent = 'Nuevo Contacto';
      modalContactName.value = '';
      tempAvatarBase64 = '';
      modalContactStatus.value = 'en línea';
      modalContactStatusCustom.style.display = 'none';
      modalContactStatusCustom.value = '';
    }

    updateModalAvatarPreview(modalContactName.value);
    contactModalOverlay.style.display = 'flex';
  }

  function updateModalAvatarPreview(name) {
    if (tempAvatarBase64) {
      modalAvatarPreviewImg.src = tempAvatarBase64;
      modalAvatarPreviewImg.style.display = 'block';
      modalAvatarPreviewLetter.style.display = 'none';
    } else {
      modalAvatarPreviewImg.style.display = 'none';
      modalAvatarPreviewLetter.style.display = 'block';
      modalAvatarPreviewLetter.textContent = (name && name.charAt(0).toUpperCase()) || 'N';
    }
  }

  modalContactName.addEventListener('input', () => {
    updateModalAvatarPreview(modalContactName.value);
  });

  modalContactStatus.addEventListener('change', () => {
    if (modalContactStatus.value === 'custom') {
      modalContactStatusCustom.style.display = 'block';
    } else {
      modalContactStatusCustom.style.display = 'none';
    }
  });

  modalAvatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        tempAvatarBase64 = event.target.result;
        updateModalAvatarPreview(modalContactName.value);
      };
      reader.readAsDataURL(file);
    }
  });

  btnModalRemoveAvatar.addEventListener('click', () => {
    tempAvatarBase64 = '';
    updateModalAvatarPreview(modalContactName.value);
  });

  btnCloseContactModal.addEventListener('click', () => contactModalOverlay.style.display = 'none');
  btnCancelContactModal.addEventListener('click', () => contactModalOverlay.style.display = 'none');

  btnSaveContactModal.addEventListener('click', () => {
    const name = modalContactName.value.trim() || 'Contacto';
    let status = modalContactStatus.value;
    if (status === 'custom') {
      status = modalContactStatusCustom.value.trim() || 'disponible';
    }

    if (state.editingContactId) {
      const contact = state.contacts.find(c => c.id === state.editingContactId);
      if (contact) {
        contact.name = name;
        contact.avatar = tempAvatarBase64;
        contact.status = status;
      }
    } else {
      const newId = 'c_' + Date.now();
      const newContact = {
        id: newId,
        name: name,
        avatar: tempAvatarBase64,
        status: status,
        unreadCount: 0,
        type: 'personal',
        messages: []
      };
      state.contacts.unshift(newContact);
      state.activeContactId = newId;
    }

    contactModalOverlay.style.display = 'none';
    renderActiveHeader();
    renderChatList();
    renderMessages();
  });

  // Triggers para abrir modal
  btnAddContactTop.addEventListener('click', () => openContactModal(null));
  btnMobileFab.addEventListener('click', () => openContactModal(null));
  btnOpenContactModal.addEventListener('click', () => openContactModal(getActiveContact()));
  btnChatEditContact.addEventListener('click', () => {
    closeAllDropdowns();
    openContactModal(getActiveContact());
  });

  // Botón Volver (Móvil)
  btnBackToList.addEventListener('click', () => {
    state.mobileView = 'in-list';
    updateMobileLayoutView();
  });

  // ==========================================
  // LLAMADAS Y VIDEOLLAMADAS SIMULADAS
  // ==========================================
  let callTimerInterval = null;
  let callSeconds = 0;

  function startVoiceCall() {
    const contact = getActiveContact();
    if (!contact) return;

    callNameDisplay.textContent = contact.name;
    callStatusText.textContent = 'Llamando...';
    
    const letterEl = document.getElementById('call-avatar-letter');
    const imgEl = document.getElementById('call-avatar-img');
    if (contact.avatar) {
      imgEl.src = contact.avatar;
      imgEl.style.display = 'block';
      letterEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      letterEl.style.display = 'block';
      letterEl.textContent = contact.name.charAt(0).toUpperCase();
    }

    voiceOverlay.style.display = 'flex';
    callSeconds = 0;

    setTimeout(() => {
      callStatusText.textContent = '00:00';
      callTimerInterval = setInterval(() => {
        callSeconds++;
        const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
        const secs = String(callSeconds % 60).padStart(2, '0');
        callStatusText.textContent = `${mins}:${secs}`;
      }, 1000);
    }, 2000);
  }

  function hangupVoiceCall() {
    if (callTimerInterval) clearInterval(callTimerInterval);
    voiceOverlay.style.display = 'none';
  }

  function startVideoCall() {
    const contact = getActiveContact();
    if (!contact) return;

    videoNameDisplay.textContent = contact.name;
    videoStatusText.textContent = 'Conectando...';

    const letterEl = document.getElementById('videocall-avatar-letter');
    const imgEl = document.getElementById('videocall-avatar-img');
    if (contact.avatar) {
      imgEl.src = contact.avatar;
      imgEl.style.display = 'block';
      letterEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      letterEl.style.display = 'block';
      letterEl.textContent = contact.name.charAt(0).toUpperCase();
    }

    videoOverlay.style.display = 'flex';
    callSeconds = 0;

    setTimeout(() => {
      videoStatusText.textContent = '00:00';
      callTimerInterval = setInterval(() => {
        callSeconds++;
        const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
        const secs = String(callSeconds % 60).padStart(2, '0');
        videoStatusText.textContent = `${mins}:${secs}`;
      }, 1000);
    }, 1800);
  }

  function hangupVideoCall() {
    if (callTimerInterval) clearInterval(callTimerInterval);
    videoOverlay.style.display = 'none';
  }

  btnVoiceCall.addEventListener('click', startVoiceCall);
  btnCallHangup.addEventListener('click', hangupVoiceCall);
  btnVideoCall.addEventListener('click', startVideoCall);
  btnVideoHangup.addEventListener('click', hangupVideoCall);

  // ==========================================
  // BÚSQUEDA Y FILTROS
  // ==========================================
  searchInput.addEventListener('input', renderChatList);

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderChatList();
    });
  });

  // Atajo de Teclado Alt+S para alternar emisor
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      btnChatToggleSender.click();
    }
  });

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  selectContact(state.activeContactId);

});
