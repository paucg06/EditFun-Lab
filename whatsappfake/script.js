/**
 * WhatsApp Fake Simulator - Script Logic
 * Author: EditFun Suite
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================
  const state = {
    theme: 'dark',
    mode: 'desktop',
    mobileView: 'in-chat', // 'in-list' o 'in-chat'
    sender: 'me', // 'me' o 'contact'
    activeContactId: 'c1',
    autoReply: {
      enabled: true,
      delay: 2.0,
      scriptLines: [
        'Hola!',
        'No',
        'Llegaré a las 8',
        'El finde que viene si quieres vemos',
        'Vale venga va'
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
  // REFERENCIAS DOM
  // ==========================================
  const body = document.body;
  const layout = document.getElementById('wa-app-layout');
  const chatListContainer = document.getElementById('wa-chat-list');
  const messagesContainer = document.getElementById('wa-messages-container');
  const messagesViewport = document.getElementById('wa-messages-viewport');
  const textInput = document.getElementById('wa-text-input');
  const btnSend = document.getElementById('btn-send-message');
  const iconSendArrow = document.getElementById('icon-send-arrow');
  const iconSendMic = document.getElementById('icon-send-mic');
  
  // HUD Elements
  const btnDesktop = document.getElementById('hud-btn-desktop');
  const btnMobile = document.getElementById('hud-btn-mobile');
  const btnThemeDark = document.getElementById('hud-theme-dark');
  const btnThemeLight = document.getElementById('hud-theme-light');
  const btnConfig = document.getElementById('hud-btn-config');
  
  // Header Elements
  const headerContactName = document.getElementById('header-contact-name');
  const headerContactStatus = document.getElementById('header-contact-status');
  const headerAvatarImg = document.getElementById('header-avatar-img');
  const headerAvatarLetter = document.getElementById('header-avatar-letter');
  const btnBackToList = document.getElementById('btn-back-to-list');
  const btnEditActiveContact = document.getElementById('btn-edit-active-contact');
  
  // Sender Toggle
  const btnSenderMe = document.getElementById('btn-sender-me');
  const btnSenderContact = document.getElementById('btn-sender-contact');
  const btnTriggerAudio = document.getElementById('btn-trigger-audio-msg');
  const btnTriggerOneTime = document.getElementById('btn-trigger-onetime-msg');
  const btnTriggerImage = document.getElementById('btn-trigger-image-msg');
  const btnClipAttach = document.getElementById('btn-clip-attach');
  const chatImageInput = document.getElementById('chat-file-image-input');
  
  // Calls
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
  
  // Config Drawer
  const configOverlay = document.getElementById('config-drawer-overlay');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerTabs = document.querySelectorAll('.drawer-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const cfgContactName = document.getElementById('cfg-contact-name');
  const cfgContactStatus = document.getElementById('cfg-contact-status');
  const cfgContactStatusCustom = document.getElementById('cfg-contact-status-custom');
  const cfgAvatarFile = document.getElementById('cfg-avatar-file');
  const cfgAvatarImg = document.getElementById('cfg-avatar-img');
  const cfgAvatarLetter = document.getElementById('cfg-avatar-letter');
  const btnClearAvatar = document.getElementById('btn-clear-avatar');
  const btnSaveContactInfo = document.getElementById('btn-save-contact-info');
  const cfgAutoReply = document.getElementById('cfg-auto-reply-enabled');
  const cfgReplyDelay = document.getElementById('cfg-reply-delay');
  const cfgScriptReplies = document.getElementById('cfg-script-replies');
  const btnClearAllMessages = document.getElementById('btn-clear-all-messages');
  const btnLoadPresetChat = document.getElementById('btn-load-preset-chat');
  const btnAddContactTop = document.getElementById('btn-add-contact-top');
  const btnMobileFab = document.getElementById('btn-mobile-fab');
  
  // Search & Filters
  const searchInput = document.getElementById('wa-search-input');
  const filterPills = document.querySelectorAll('.wa-pill');
  let currentFilter = 'all';

  // Live Timer for Clock
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
  // AUDIO SYNTHESIZER (WEB AUDIO API)
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
  // GESTIÓN DE CHATS & CONTACTOS
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
      if (currentFilter === 'groups') return c.type === 'groups';
      if (currentFilter === 'personal') return c.type === 'personal';
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
            <span class="wa-chat-title">${contact.name}</span>
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
    
    // Si estamos en modo móvil, pasar a pantalla de chat
    if (state.mode === 'mobile') {
      state.mobileView = 'in-chat';
      updateMobileLayoutView();
    }

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

  // ==========================================
  // RENDERIZADO DE MENSAJES
  // ==========================================
  function renderMessages() {
    const contact = getActiveContact();
    if (!contact) return;

    // Mantener la fecha y el aviso cifrado
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
      const barsCount = 28;
      let barsHtml = '';
      for (let i = 0; i < barsCount; i++) {
        const height = Math.floor(Math.random() * 16) + 4;
        barsHtml += `<div class="audio-bar" style="height: ${height}px;"></div>`;
      }

      contentHtml = `
        <div class="wa-audio-player" data-duration="${msg.duration || '0:14'}">
          <button class="audio-play-btn" title="Reproducir nota de voz">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
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

    // Ticks de verificación
    let tickHtml = '';
    if (msg.sender === 'me') {
      if (msg.ticks === 'blue') {
        tickHtml = `<span class="tick-icon blue"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 3.316l-7.79 7.79a.75.75 0 0 1-1.06 0l-4.24-4.24a.75.75 0 0 1 1.06-1.06l3.71 3.71 7.26-7.26a.75.75 0 0 1 1.06 1.06zm-3.5 0l-5.69 5.69-1.59-1.59a.75.75 0 0 0-1.06 1.06l2.12 2.12a.75.75 0 0 0 1.06 0l6.22-6.22a.75.75 0 0 0-1.06-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'grey') {
        tickHtml = `<span class="tick-icon grey"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 3.316l-7.79 7.79a.75.75 0 0 1-1.06 0l-4.24-4.24a.75.75 0 0 1 1.06-1.06l3.71 3.71 7.26-7.26a.75.75 0 0 1 1.06 1.06zm-3.5 0l-5.69 5.69-1.59-1.59a.75.75 0 0 0-1.06 1.06l2.12 2.12a.75.75 0 0 0 1.06 0l6.22-6.22a.75.75 0 0 0-1.06-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'single') {
        tickHtml = `<span class="tick-icon grey"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.01 3.316l-6.79 6.79a.75.75 0 0 1-1.06 0l-2.24-2.24a.75.75 0 0 1 1.06-1.06l1.71 1.71 6.26-6.26a.75.75 0 0 1 1.06 1.06z"/></svg></span>`;
      }
    }

    bubble.innerHTML = `
      ${contentHtml}
      <div class="wa-msg-meta">
        <span class="wa-msg-time">${msg.time}</span>
        ${tickHtml}
      </div>
    `;

    // Asignar interacción si es reproductor de audio
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
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      } else {
        isPlaying = true;
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
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
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
            timer.textContent = '0:14';
          }
        }, 120);
      }
    });
  }

  function formatMessageText(text) {
    if (!text) return '';
    let escaped = escapeHTML(text);
    // Negrita *texto*
    escaped = escaped.replace(/\*([^\*]+)\*/g, '<strong>$1</strong>');
    // Cursiva _texto_
    escaped = escaped.replace(/_([^_]+)_/g, '<em>$1</em>');
    // Tachado ~texto~
    escaped = escaped.replace(/~([^~]+)~/g, '<del>$1</del>');
    // Enlaces
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
      ticks: state.sender === 'me' ? 'single' : 'none'
    };

    contact.messages.push(newMsg);
    renderMessages();
    renderChatList();

    if (state.sender === 'me') {
      playSentPopSound();

      // Transición progresiva de ticks: single -> grey -> blue
      setTimeout(() => {
        newMsg.ticks = 'grey';
        renderMessages();
      }, 300);

      setTimeout(() => {
        newMsg.ticks = 'blue';
        renderMessages();
      }, 700);

      // Desencadenar Automatización de Respuesta
      if (state.autoReply.enabled && state.autoReply.scriptLines.length > 0) {
        triggerAutomatedReply(contact);
      }
    } else {
      playReceivedPopSound();
    }
  }

  function triggerAutomatedReply(contact) {
    const script = state.autoReply.scriptLines;
    if (!script || script.length === 0) return;

    const replyText = script[state.autoReply.currentIndex % script.length];
    state.autoReply.currentIndex++;

    const delayMs = Math.max(500, state.autoReply.delay * 1000);

    // 1. Contacto pasa a "en línea"
    setTimeout(() => {
      contact.status = 'en línea';
      if (contact.id === state.activeContactId) renderActiveHeader();
      renderChatList();
    }, 400);

    // 2. Contacto pasa a "escribiendo..."
    setTimeout(() => {
      contact.status = 'escribiendo...';
      if (contact.id === state.activeContactId) renderActiveHeader();
      renderChatList();
    }, Math.min(delayMs - 600, 1000));

    // 3. Envía el mensaje y regresa a "en línea"
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

    // Transición a "00:00" y cuenta activa
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

  // ==========================================
  // CONFIGURACIÓN & MODAL
  // ==========================================
  function openConfigDrawer() {
    const contact = getActiveContact();
    if (!contact) return;

    cfgContactName.value = contact.name;
    cfgContactStatus.value = ['en línea', 'escribiendo...', 'grabando audio...', 'últ. vez hoy a las 15:08'].includes(contact.status) ? contact.status : 'custom';
    
    if (cfgContactStatus.value === 'custom') {
      cfgContactStatusCustom.style.display = 'block';
      cfgContactStatusCustom.value = contact.status;
    } else {
      cfgContactStatusCustom.style.display = 'none';
    }

    if (contact.avatar) {
      cfgAvatarImg.src = contact.avatar;
      cfgAvatarImg.style.display = 'block';
      cfgAvatarLetter.style.display = 'none';
    } else {
      cfgAvatarImg.style.display = 'none';
      cfgAvatarLetter.style.display = 'block';
      cfgAvatarLetter.textContent = contact.name.charAt(0).toUpperCase();
    }

    cfgAutoReply.checked = state.autoReply.enabled;
    cfgReplyDelay.value = state.autoReply.delay;
    cfgScriptReplies.value = state.autoReply.scriptLines.join('\n');

    configOverlay.style.display = 'flex';
  }

  function closeConfigDrawer() {
    configOverlay.style.display = 'none';
  }

  function saveContactSettings() {
    const contact = getActiveContact();
    if (!contact) return;

    contact.name = cfgContactName.value.trim() || 'Contacto';
    if (cfgContactStatus.value === 'custom') {
      contact.status = cfgContactStatusCustom.value.trim() || 'disponible';
    } else {
      contact.status = cfgContactStatus.value;
    }

    state.autoReply.enabled = cfgAutoReply.checked;
    state.autoReply.delay = parseFloat(cfgReplyDelay.value) || 2;
    state.autoReply.scriptLines = cfgScriptReplies.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    renderActiveHeader();
    renderChatList();
    closeConfigDrawer();
  }

  // ==========================================
  // LISTENERS DE EVENTOS
  // ==========================================

  // Enviar mensaje
  btnSend.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
      sendMessage(text, 'text');
      textInput.value = '';
      textInput.style.height = 'auto';
    }
  });

  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      btnSend.click();
    }
  });

  // Alternar emisor (Tú vs Contacto)
  btnSenderMe.addEventListener('click', () => {
    state.sender = 'me';
    btnSenderMe.classList.add('active');
    btnSenderContact.classList.remove('active');
  });

  btnSenderContact.addEventListener('click', () => {
    state.sender = 'contact';
    btnSenderContact.classList.add('active');
    btnSenderMe.classList.remove('active');
  });

  // Enviar Audio simulado
  btnTriggerAudio.addEventListener('click', () => {
    sendMessage('audio_note', 'audio');
  });

  // Enviar Foto de 1 sola visualización
  btnTriggerOneTime.addEventListener('click', () => {
    sendMessage('1_time_view', 'onetime');
  });

  // Adjuntar Foto
  btnTriggerImage.addEventListener('click', () => {
    chatImageInput.click();
  });

  btnClipAttach.addEventListener('click', () => {
    chatImageInput.click();
  });

  chatImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        sendMessage(event.target.result, 'image');
        chatImageInput.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  // Subir Avatar en Drawer
  cfgAvatarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const contact = getActiveContact();
        if (contact) {
          contact.avatar = event.target.result;
          cfgAvatarImg.src = event.target.result;
          cfgAvatarImg.style.display = 'block';
          cfgAvatarLetter.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    }
  });

  btnClearAvatar.addEventListener('click', () => {
    const contact = getActiveContact();
    if (contact) {
      contact.avatar = '';
      cfgAvatarImg.style.display = 'none';
      cfgAvatarLetter.style.display = 'block';
      cfgAvatarLetter.textContent = contact.name.charAt(0).toUpperCase();
    }
  });

  cfgContactStatus.addEventListener('change', () => {
    if (cfgContactStatus.value === 'custom') {
      cfgContactStatusCustom.style.display = 'block';
    } else {
      cfgContactStatusCustom.style.display = 'none';
    }
  });

  // HUD: Modo Dispositivo
  btnDesktop.addEventListener('click', () => {
    state.mode = 'desktop';
    body.classList.remove('mode-mobile');
    body.classList.add('mode-desktop');
    btnDesktop.classList.add('active');
    btnMobile.classList.remove('active');
    layout.className = 'wa-app-layout';
  });

  btnMobile.addEventListener('click', () => {
    state.mode = 'mobile';
    body.classList.remove('mode-desktop');
    body.classList.add('mode-mobile');
    btnMobile.classList.add('active');
    btnDesktop.classList.remove('active');
    updateMobileLayoutView();
  });

  function updateMobileLayoutView() {
    if (state.mode !== 'mobile') return;
    layout.className = `wa-app-layout mobile-${state.mobileView}`;
  }

  // Botón Volver (Móvil)
  btnBackToList.addEventListener('click', () => {
    if (state.mode === 'mobile') {
      state.mobileView = 'in-list';
      updateMobileLayoutView();
    }
  });

  // HUD: Tema Claro / Oscuro
  btnThemeDark.addEventListener('click', () => {
    state.theme = 'dark';
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    btnThemeDark.classList.add('active');
    btnThemeLight.classList.remove('active');
  });

  btnThemeLight.addEventListener('click', () => {
    state.theme = 'light';
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    btnThemeLight.classList.add('active');
    btnThemeDark.classList.remove('active');
  });

  // Drawer / Opciones
  btnConfig.addEventListener('click', openConfigDrawer);
  btnEditActiveContact.addEventListener('click', openConfigDrawer);
  btnCloseDrawer.addEventListener('click', closeConfigDrawer);
  btnSaveContactInfo.addEventListener('click', saveContactSettings);

  configOverlay.addEventListener('click', (e) => {
    if (e.target === configOverlay) closeConfigDrawer();
  });

  // Pestañas de Drawer
  drawerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      drawerTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Llamadas
  btnVoiceCall.addEventListener('click', startVoiceCall);
  btnCallHangup.addEventListener('click', hangupVoiceCall);
  btnVideoCall.addEventListener('click', startVideoCall);
  btnVideoHangup.addEventListener('click', hangupVideoCall);

  // Crear Nuevo Contacto
  function addNewContact() {
    const name = prompt('Nombre del nuevo contacto:', 'Nuevo Contacto');
    if (!name) return;
    const newId = 'c_' + Date.now();
    const newContact = {
      id: newId,
      name: name,
      avatar: '',
      status: 'en línea',
      unreadCount: 0,
      type: 'personal',
      messages: []
    };
    state.contacts.unshift(newContact);
    selectContact(newId);
  }

  btnAddContactTop.addEventListener('click', addNewContact);
  btnMobileFab.addEventListener('click', addNewContact);

  // Vaciar y Restablecer
  btnClearAllMessages.addEventListener('click', () => {
    const contact = getActiveContact();
    if (contact && confirm('¿Estás seguro de vaciar todos los mensajes de este chat?')) {
      contact.messages = [];
      renderMessages();
      renderChatList();
      closeConfigDrawer();
    }
  });

  btnLoadPresetChat.addEventListener('click', () => {
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
      closeConfigDrawer();
    }
  });

  // Búsqueda y Filtros
  searchInput.addEventListener('input', renderChatList);

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderChatList();
    });
  });

  // Atajos de Teclado
  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (state.sender === 'me') btnSenderContact.click();
      else btnSenderMe.click();
    }
    if ((e.key === 'h' || e.key === 'H') && document.activeElement !== textInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (configOverlay.style.display === 'flex') closeConfigDrawer();
      else openConfigDrawer();
    }
  });

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  selectContact(state.activeContactId);

});
