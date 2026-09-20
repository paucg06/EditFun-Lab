/**
 * WhatsApp Fake Simulator - Script Logic
 * Multi-user Groups linked to Real Contacts, Step Builder & Interactive Read Status
 * Author: EditFun Suite
 */

document.addEventListener('DOMContentLoaded', () => {

  const WA_COLORS = ['#e542a3', '#02a698', '#dfa62a', '#35cd96', '#6bcbef', '#e56456', '#a58cf0', '#ec78a9'];

  // ==========================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================
  const state = {
    theme: 'dark', // 'dark' | 'light'
    mode: 'auto', // 'auto' | 'forced-mobile'
    mobileView: 'in-chat', // 'in-list' | 'in-chat'
    sendTickMode: 'blue', // 'blue' | 'grey' | 'single'
    activeChatId: 'g1',
    editingChatId: null,
    tempGroupMemberIds: [], // IDs de contactos individuales seleccionados
    
    // Lista de Chats (Contactos Individuales y Grupos) - SIN EMOJIS
    chats: [
      {
        id: 'g1',
        name: 'Los Panas del Gym',
        avatar: '',
        type: 'group',
        isPinned: true,
        unreadCount: 0,
        participantContactIds: ['c_fede', 'c_pedro', 'c_jose'],
        messages: [
          {
            id: 'mg1',
            sender: 'c_fede',
            type: 'text',
            content: 'Buenas chavales, quien va hoy a entrenar?',
            time: '15:30',
            ticks: 'none'
          },
          {
            id: 'mg2',
            sender: 'c_pedro',
            type: 'text',
            content: 'Yo voy a las 18:30 con Jose',
            time: '15:32',
            ticks: 'none'
          },
          {
            id: 'mg3',
            sender: 'me',
            type: 'text',
            content: 'Me apunto, nos vemos en recepcion!',
            time: '15:34',
            ticks: 'blue'
          }
        ],
        autoReply: {
          enabled: true,
          steps: [
            {
              senderContactId: 'c_fede',
              type: 'text',
              content: 'Perfecto, traigo la rutina de espalda nueva!',
              delaySec: 2
            },
            {
              senderContactId: 'c_pedro',
              type: 'audio',
              duration: '0:12',
              delaySec: 2.5
            },
            {
              senderContactId: 'c_jose',
              type: 'text',
              content: 'Llegare puntual chavales',
              delaySec: 2
            }
          ],
          currentStepIndex: 0
        }
      },
      {
        id: 'c_fede',
        name: 'Federico',
        avatar: '',
        type: 'personal',
        isPinned: false,
        status: 'en línea',
        unreadCount: 0,
        messages: [
          {
            id: 'mf1',
            sender: 'contact',
            type: 'text',
            content: 'Bro, tienes la clave de la taquilla?',
            time: '12:20',
            ticks: 'none'
          },
          {
            id: 'mf2',
            sender: 'me',
            type: 'text',
            content: 'Si, es 4820!',
            time: '12:22',
            ticks: 'blue'
          }
        ],
        autoReply: {
          enabled: true,
          steps: [
            { senderContactId: 'contact', type: 'text', content: 'De locos, gracias bro!', delaySec: 2 }
          ],
          currentStepIndex: 0
        }
      },
      {
        id: 'c_pedro',
        name: 'Pedro',
        avatar: '',
        type: 'personal',
        isPinned: false,
        status: 'en línea',
        unreadCount: 0,
        messages: [
          {
            id: 'mp1',
            sender: 'contact',
            type: 'text',
            content: 'Que tal la sesion de hoy?',
            time: '13:00',
            ticks: 'none'
          },
          {
            id: 'mp2',
            sender: 'me',
            type: 'text',
            content: 'Bastante bien, manana repetimos',
            time: '13:02',
            ticks: 'blue'
          }
        ],
        autoReply: {
          enabled: true,
          steps: [
            { senderContactId: 'contact', type: 'text', content: 'Manana mas y mejor!', delaySec: 2 }
          ],
          currentStepIndex: 0
        }
      },
      {
        id: 'c_jose',
        name: 'Jose',
        avatar: '',
        type: 'personal',
        isPinned: false,
        status: 'últ. vez hoy a las 15:00',
        unreadCount: 0,
        messages: [
          {
            id: 'mj1',
            sender: 'contact',
            type: 'text',
            content: 'Nos vemos en el gym luego!',
            time: '14:50',
            ticks: 'none'
          },
          {
            id: 'mj2',
            sender: 'me',
            type: 'text',
            content: 'Ahi estaremos',
            time: '14:52',
            ticks: 'blue'
          }
        ],
        autoReply: {
          enabled: true,
          steps: [
            { senderContactId: 'contact', type: 'text', content: 'Alli nos vemos!', delaySec: 2 }
          ],
          currentStepIndex: 0
        }
      },
      {
        id: 'c1',
        name: 'Aanano',
        avatar: '',
        type: 'personal',
        isPinned: true,
        status: 'en línea',
        unreadCount: 0,
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
            content: 'Si, dime que paso',
            time: '15:39',
            ticks: 'blue'
          },
          {
            id: 'm3',
            sender: 'contact',
            type: 'text',
            content: 'Viste lo que subieron al grupo de la uni?',
            time: '15:40',
            ticks: 'none'
          },
          {
            id: 'm4',
            sender: 'me',
            type: 'text',
            content: 'No todavia, pasamelo',
            time: '15:41',
            ticks: 'blue'
          }
        ],
        autoReply: {
          enabled: true,
          steps: [
            {
              senderContactId: 'contact',
              type: 'text',
              content: 'Es un video muy bueno, te lo acabo de mandar',
              delaySec: 2
            },
            {
              senderContactId: 'contact',
              type: 'audio',
              duration: '0:09',
              delaySec: 2.5
            }
          ],
          currentStepIndex: 0
        }
      },
      {
        id: 'c2',
        name: 'Mama',
        avatar: '',
        type: 'personal',
        isPinned: false,
        status: 'últ. vez hoy a las 14:15',
        unreadCount: 2,
        messages: [
          {
            id: 'm21',
            sender: 'contact',
            type: 'text',
            content: 'Hijo, acuerdate de comprar pan al volver',
            time: '14:10',
            ticks: 'none'
          },
          {
            id: 'm22',
            sender: 'contact',
            type: 'text',
            content: 'Llamame cuando puedas',
            time: '14:15',
            ticks: 'none'
          }
        ],
        autoReply: {
          enabled: true,
          steps: [
            { senderContactId: 'contact', type: 'text', content: 'Vale hijo, un beso!', delaySec: 2 }
          ],
          currentStepIndex: 0
        }
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
  const btnToggleSendTicks = document.getElementById('btn-toggle-send-ticks');
  const sendTickPreview = document.getElementById('send-tick-preview');
  
  // Header Activo
  const headerContactName = document.getElementById('header-contact-name');
  const headerContactStatus = document.getElementById('header-contact-status');
  const headerAvatarImg = document.getElementById('header-avatar-img');
  const headerAvatarLetter = document.getElementById('header-avatar-letter');
  const btnBackToList = document.getElementById('btn-back-to-list');
  const btnOpenChatInfoModal = document.getElementById('btn-open-chat-info-modal');
  const noChatScreen = document.getElementById('wa-no-chat-screen');
  const activeChatWrapper = document.getElementById('wa-active-chat-wrapper');
  
  // Dropdown Menús
  const btnAddMenuTrigger = document.getElementById('btn-add-menu-trigger');
  const addDropdown = document.getElementById('add-dropdown-menu');
  const btnSidebarMenu = document.getElementById('btn-sidebar-menu');
  const sidebarDropdown = document.getElementById('sidebar-dropdown-menu');
  const btnChatMenu = document.getElementById('btn-chat-menu');
  const chatDropdown = document.getElementById('chat-dropdown-menu');
  const btnClipAttach = document.getElementById('btn-clip-attach');
  const clipDropdown = document.getElementById('clip-dropdown-menu');
  
  // Sidebar Menú Actions
  const btnMenuAddContact = document.getElementById('btn-menu-add-contact');
  const btnMenuAddGroup = document.getElementById('btn-menu-add-group');
  const btnMenuToggleTheme = document.getElementById('menu-btn-toggle-theme');
  const themeToggleLabel = document.getElementById('theme-toggle-label');
  const btnMenuToggleView = document.getElementById('menu-btn-toggle-view');
  const viewToggleLabel = document.getElementById('view-toggle-label');
  const btnMenuExportChats = document.getElementById('menu-btn-export-chats');
  const btnMenuImportChats = document.getElementById('menu-btn-import-chats');
  const fileImportJson = document.getElementById('chat-import-json-input');
  
  // Chat Menú Actions
  const btnChatAutoReply = document.getElementById('chat-menu-btn-auto-reply');
  const btnChatEditChat = document.getElementById('chat-menu-btn-edit-chat');
  const chatMenuEditLabel = document.getElementById('chat-menu-edit-label');
  const btnChatTogglePin = document.getElementById('chat-menu-btn-toggle-pin');
  const chatMenuPinLabel = document.getElementById('chat-menu-pin-label');
  const btnChatMarkAllRead = document.getElementById('chat-menu-btn-mark-all-read');
  const btnChatMarkAllUnread = document.getElementById('chat-menu-btn-mark-all-unread');
  const btnChatClearMsgs = document.getElementById('chat-menu-btn-clear-msgs');
  const btnChatDeleteChat = document.getElementById('chat-menu-btn-delete-chat');
  const chatMenuDeleteLabel = document.getElementById('chat-menu-delete-label');
  
  // Adjuntar
  const btnMenuAttachPhoto = document.getElementById('btn-menu-attach-photo');
  const btnMenuAttachAudio = document.getElementById('btn-menu-attach-audio');
  const btnMenuAttachOneTime = document.getElementById('btn-menu-attach-onetime');
  const fileAttachInput = document.getElementById('chat-attach-file-input');
  const fileAudioInput = document.getElementById('chat-audio-file-input');
  const btnInputCamera = document.getElementById('btn-input-camera');
  const btnSidebarCamera = document.getElementById('btn-sidebar-camera');
  const btnMobileFab = document.getElementById('btn-mobile-fab');

  // Modal Audio
  const audioModalOverlay = document.getElementById('audio-modal-overlay');
  const btnCloseAudioModal = document.getElementById('btn-close-audio-modal');
  const btnCancelAudioModal = document.getElementById('btn-cancel-audio-modal');
  const btnConfirmAudioSend = document.getElementById('btn-confirm-audio-send');
  const audioUploadBtnText = document.getElementById('audio-upload-btn-text');
  const audioSimSeconds = document.getElementById('audio-sim-seconds');
  let tempAudioUrl = '';
  let tempAudioDuration = '0:14';

  // Modal Contacto
  const contactModalOverlay = document.getElementById('contact-modal-overlay');
  const contactModalTitle = document.getElementById('contact-modal-title');
  const btnCloseContactModal = document.getElementById('btn-close-contact-modal');
  const btnCancelContactModal = document.getElementById('btn-cancel-contact-modal');
  const btnSaveContactModal = document.getElementById('btn-save-contact-modal');
  const btnDeleteContactModal = document.getElementById('btn-delete-contact-modal');
  const modalContactName = document.getElementById('modal-contact-name-input');
  const modalContactStatus = document.getElementById('modal-contact-status-select');
  const modalContactStatusCustom = document.getElementById('modal-contact-status-custom');
  const modalAvatarPreviewImg = document.getElementById('modal-avatar-img');
  const modalAvatarPreviewLetter = document.getElementById('modal-avatar-letter');
  const modalAvatarFileInput = document.getElementById('modal-avatar-file-input');
  const btnModalRemoveAvatar = document.getElementById('btn-modal-remove-avatar');
  let tempAvatarBase64 = '';

  // Modal Grupo
  const groupModalOverlay = document.getElementById('group-modal-overlay');
  const groupModalTitle = document.getElementById('group-modal-title');
  const btnCloseGroupModal = document.getElementById('btn-close-group-modal');
  const btnCancelGroupModal = document.getElementById('btn-cancel-group-modal');
  const btnSaveGroupModal = document.getElementById('btn-save-group-modal');
  const btnDeleteGroupModal = document.getElementById('btn-delete-group-modal');
  const groupNameInput = document.getElementById('group-name-input');
  const groupMembersContainer = document.getElementById('group-members-container');
  const groupSelectExistingContact = document.getElementById('group-select-existing-contact');
  const btnAddMemberToGroup = document.getElementById('btn-add-member-to-group');
  const groupNoContactsTip = document.getElementById('group-no-contacts-tip');
  const groupAvatarPreviewImg = document.getElementById('group-avatar-img');
  const groupAvatarPreviewLetter = document.getElementById('group-avatar-letter');
  const groupAvatarFileInput = document.getElementById('group-avatar-file-input');
  const btnGroupRemoveAvatar = document.getElementById('btn-group-remove-avatar');
  let tempGroupAvatarBase64 = '';

  // Modal Automatización
  const autoModalOverlay = document.getElementById('automation-modal-overlay');
  const btnCloseAutoModal = document.getElementById('btn-close-automation-modal');
  const btnCancelAutoModal = document.getElementById('btn-cancel-automation-modal');
  const btnSaveAutoModal = document.getElementById('btn-save-automation-modal');
  const autoReplyCheckbox = document.getElementById('auto-reply-checkbox');
  const autoStepsContainer = document.getElementById('auto-steps-container');
  const stepSenderSelect = document.getElementById('step-sender-select');
  const stepTypeSelect = document.getElementById('step-type-select');
  const stepInputTextWrap = document.getElementById('step-input-text-wrap');
  const stepInputImageWrap = document.getElementById('step-input-image-wrap');
  const stepInputAudioWrap = document.getElementById('step-input-audio-wrap');
  const stepTextInput = document.getElementById('step-text-input');
  const stepImageFileInput = document.getElementById('step-image-file-input');
  const stepImageBtnText = document.getElementById('step-image-btn-text');
  const stepAudioFileInput = document.getElementById('step-audio-file-input');
  const stepAudioBtnText = document.getElementById('step-audio-btn-text');
  const stepAudioDurationInput = document.getElementById('step-audio-duration-input');
  const stepDelayInput = document.getElementById('step-delay-input');
  const btnAddStepToList = document.getElementById('btn-add-step-to-list');
  let tempStepImageBase64 = '';
  let tempStepAudioUrl = '';
  let tempWorkingSteps = [];

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

  // Reloj
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
  sidebarResizer.addEventListener('mousedown', () => {
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
  // TICKS SVG OFICIALES WHATSAPP WEB
  // ==========================================
  function getDoubleTickSVG() {
    return `<svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.07 1.05a.75.75 0 0 0-1.06 0L5.3 5.76 3.18 3.64a.75.75 0 0 0-1.06 1.06l2.65 2.65a.75.75 0 0 0 1.06 0l5.24-5.24a.75.75 0 0 0 0-1.06zm4 0a.75.75 0 0 0-1.06 0l-5.24 5.24-.53-.53a.75.75 0 0 0-1.06 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l5.77-5.77a.75.75 0 0 0 0-1.06z"/></svg>`;
  }

  function getSingleTickSVG() {
    return `<svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 1.05a.75.75 0 0 0-1.06 0L5.3 9.76 2.18 6.64a.75.75 0 0 0-1.06 1.06l3.65 3.65a.75.75 0 0 0 1.06 0l9.18-9.18a.75.75 0 0 0 0-1.06z"/></svg>`;
  }

  function updateSendTickButtonUI() {
    if (state.sendTickMode === 'blue') {
      sendTickPreview.className = 'tick-icon blue';
      sendTickPreview.innerHTML = getDoubleTickSVG();
      btnToggleSendTicks.title = 'Modo al enviar: 2 ticks azules (Leído). Clic para cambiar';
    } else if (state.sendTickMode === 'grey') {
      sendTickPreview.className = 'tick-icon grey';
      sendTickPreview.innerHTML = getDoubleTickSVG();
      btnToggleSendTicks.title = 'Modo al enviar: 2 ticks grises (Entregado / Sin leer). Clic para cambiar';
    } else if (state.sendTickMode === 'single') {
      sendTickPreview.className = 'tick-icon grey';
      sendTickPreview.innerHTML = getSingleTickSVG();
      btnToggleSendTicks.title = 'Modo al enviar: 1 tick gris (Enviado). Clic para cambiar';
    }
  }

  btnToggleSendTicks.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.sendTickMode === 'blue') {
      state.sendTickMode = 'grey';
    } else if (state.sendTickMode === 'grey') {
      state.sendTickMode = 'single';
    } else {
      state.sendTickMode = 'blue';
    }
    updateSendTickButtonUI();
  });
  updateSendTickButtonUI();

  // Helper para buscar contacto individual por ID
  function getContactById(id) {
    return state.chats.find(c => c.id === id && c.type === 'personal') || null;
  }

  function getActiveChat() {
    return state.chats.find(c => c.id === state.activeChatId) || (state.chats.length > 0 ? state.chats[0] : null);
  }

  function getSortedChats() {
    return [...state.chats].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }

  function renderChatList() {
    chatListContainer.innerHTML = '';
    const query = (searchInput.value || '').trim().toLowerCase();
    const sorted = getSortedChats();

    const filtered = sorted.filter(c => {
      const matchesQuery = c.name.toLowerCase().includes(query) ||
        (c.messages.length && c.messages[c.messages.length - 1].content && c.messages[c.messages.length - 1].content.toLowerCase().includes(query));
      
      if (!matchesQuery) return false;
      if (currentFilter === 'all') return true;
      if (currentFilter === 'unread') return c.unreadCount > 0;
      if (currentFilter === 'favorites') return c.isPinned;
      if (currentFilter === 'groups') return c.type === 'group';
      return true;
    });

    filtered.forEach(chat => {
      const item = document.createElement('div');
      item.className = `wa-chat-item ${chat.id === state.activeChatId ? 'active' : ''}`;
      item.dataset.id = chat.id;

      const lastMsg = chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
      let lastText = 'Toca para chatear';
      let lastTime = '';
      if (lastMsg) {
        lastTime = lastMsg.time;
        if (lastMsg.type === 'audio') lastText = 'Audio (' + (lastMsg.duration || '0:14') + ')';
        else if (lastMsg.type === 'onetime') lastText = 'Foto';
        else if (lastMsg.type === 'image') lastText = 'Foto';
        else {
          if (chat.type === 'group' && lastMsg.sender !== 'me') {
            const senderContact = getContactById(lastMsg.sender);
            const senderName = senderContact ? senderContact.name : (lastMsg.senderName || 'Contacto');
            lastText = `${senderName}: ${lastMsg.content}`;
          } else {
            lastText = lastMsg.content;
          }
        }
      }

      let avatarMarkup = '';
      if (chat.avatar) {
        avatarMarkup = `<img src="${chat.avatar}" alt="${chat.name}">`;
      } else {
        if (chat.type === 'group') {
          avatarMarkup = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
        } else {
          avatarMarkup = `<span>${chat.name.charAt(0).toUpperCase()}</span>`;
        }
      }

      // Icono Chincheta / Pin
      const pinMarkup = chat.isPinned
        ? `<span class="wa-chat-pin-icon" title="Chat fijado">
             <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
           </span>`
        : '';

      item.innerHTML = `
        <div class="wa-chat-avatar">
          ${avatarMarkup}
        </div>
        <div class="wa-chat-info">
          <div class="wa-chat-info-top">
            <span class="wa-chat-title">${escapeHTML(chat.name)}</span>
            <div class="wa-chat-time-wrap">
              <span class="wa-chat-time ${chat.unreadCount > 0 ? 'unread' : ''}">${lastTime}</span>
              ${pinMarkup}
            </div>
          </div>
          <div class="wa-chat-info-bottom">
            <div class="wa-chat-snippet ${chat.typingStatus ? 'typing-text' : ''}">
              ${chat.typingStatus ? `<em>${chat.typingStatus}</em>` : escapeHTML(lastText)}
            </div>
            ${chat.unreadCount > 0 ? `<span class="wa-chat-badge">${chat.unreadCount}</span>` : ''}
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        selectChat(chat.id);
      });

      chatListContainer.appendChild(item);
    });
  }

  function selectChat(chatId) {
    state.activeChatId = chatId;
    const chat = getActiveChat();
    if (chat) {
      chat.unreadCount = 0;
      noChatScreen.style.display = 'none';
      activeChatWrapper.style.display = 'flex';
      renderActiveHeader();
      renderMessages();
    } else {
      noChatScreen.style.display = 'flex';
      activeChatWrapper.style.display = 'none';
    }
    
    state.mobileView = 'in-chat';
    updateMobileLayoutView();
    renderChatList();
  }

  function renderActiveHeader() {
    const chat = getActiveChat();
    if (!chat) {
      noChatScreen.style.display = 'flex';
      activeChatWrapper.style.display = 'none';
      return;
    }

    noChatScreen.style.display = 'none';
    activeChatWrapper.style.display = 'flex';

    headerContactName.textContent = chat.name;

    if (chat.typingStatus) {
      headerContactStatus.textContent = chat.typingStatus;
    } else if (chat.type === 'group') {
      const memberNames = (chat.participantContactIds || []).map(cid => {
        const contact = getContactById(cid);
        return contact ? contact.name : 'Contacto';
      }).join(', ');
      headerContactStatus.textContent = memberNames ? `Tú, ${memberNames}` : 'Tú';
    } else {
      headerContactStatus.textContent = chat.status || 'en línea';
    }

    if (chat.avatar) {
      headerAvatarImg.src = chat.avatar;
      headerAvatarImg.style.display = 'block';
      headerAvatarLetter.style.display = 'none';
    } else {
      headerAvatarImg.style.display = 'none';
      headerAvatarLetter.style.display = 'flex';
      if (chat.type === 'group') {
        headerAvatarLetter.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
      } else {
        headerAvatarLetter.textContent = chat.name.charAt(0).toUpperCase();
      }
    }

    chatMenuEditLabel.textContent = chat.type === 'group' ? 'Info / Editar Grupo' : 'Info / Editar Contacto';
    chatMenuPinLabel.textContent = chat.isPinned ? 'Desfijar chat' : 'Fijar chat';
    chatMenuDeleteLabel.textContent = chat.type === 'group' ? 'Eliminar grupo' : 'Eliminar contacto';
  }

  function updateMobileLayoutView() {
    layout.className = `wa-app-layout mobile-${state.mobileView}`;
  }

  // ==========================================
  // RENDERIZADO DE MENSAJES
  // ==========================================
  function renderMessages() {
    const chat = getActiveChat();
    if (!chat) return;

    const dateDivider = messagesContainer.querySelector('.wa-date-divider');
    const encryptionNotice = messagesContainer.querySelector('.wa-encryption-notice');
    
    messagesContainer.innerHTML = '';
    if (dateDivider) messagesContainer.appendChild(dateDivider);
    if (encryptionNotice) messagesContainer.appendChild(encryptionNotice);

    chat.messages.forEach(msg => {
      const msgRow = createMessageElement(msg, chat);
      messagesContainer.appendChild(msgRow);
    });

    scrollToBottom();
  }

  function createMessageElement(msg, chat) {
    const row = document.createElement('div');
    row.className = `wa-msg-row ${msg.sender === 'me' ? 'sent' : 'received'}`;
    row.id = `msg-${msg.id}`;

    const bubble = document.createElement('div');
    bubble.className = 'wa-bubble';

    // Cabecera con Nombre del Autor en Grupos
    let authorHtml = '';
    if (chat.type === 'group' && msg.sender !== 'me') {
      const senderContact = getContactById(msg.sender);
      const senderName = senderContact ? senderContact.name : (msg.senderName || 'Contacto');
      const senderIdx = (chat.participantContactIds || []).indexOf(msg.sender);
      const senderColor = senderIdx >= 0 ? WA_COLORS[senderIdx % WA_COLORS.length] : '#02a698';
      authorHtml = `<div class="wa-msg-author" style="color: ${senderColor};">${escapeHTML(senderName)}</div>`;
    }

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
        <div class="wa-audio-player" data-audio-url="${msg.audioUrl || ''}" data-duration="${msg.duration || '0:14'}">
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

    // Ticks SVG oficiales interactivos (clic para cambiar leído/no leído)
    let tickHtml = '';
    if (msg.sender === 'me') {
      if (msg.ticks === 'blue') {
        tickHtml = `<span class="tick-icon blue" title="Leído (clic para cambiar)"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.07 1.05a.75.75 0 0 0-1.06 0L5.3 5.76 3.18 3.64a.75.75 0 0 0-1.06 1.06l2.65 2.65a.75.75 0 0 0 1.06 0l5.24-5.24a.75.75 0 0 0 0-1.06zm4 0a.75.75 0 0 0-1.06 0l-5.24 5.24-.53-.53a.75.75 0 0 0-1.06 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l5.77-5.77a.75.75 0 0 0 0-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'grey') {
        tickHtml = `<span class="tick-icon grey" title="Entregado (clic para cambiar)"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.07 1.05a.75.75 0 0 0-1.06 0L5.3 5.76 3.18 3.64a.75.75 0 0 0-1.06 1.06l2.65 2.65a.75.75 0 0 0 1.06 0l5.24-5.24a.75.75 0 0 0 0-1.06zm4 0a.75.75 0 0 0-1.06 0l-5.24 5.24-.53-.53a.75.75 0 0 0-1.06 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l5.77-5.77a.75.75 0 0 0 0-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'single') {
        tickHtml = `<span class="tick-icon grey" title="Enviado (clic para cambiar)"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 1.05a.75.75 0 0 0-1.06 0L5.3 9.76 2.18 6.64a.75.75 0 0 0-1.06 1.06l3.65 3.65a.75.75 0 0 0 1.06 0l9.18-9.18a.75.75 0 0 0 0-1.06z"/></svg></span>`;
      }
    }

    bubble.innerHTML = `
      ${authorHtml}
      ${contentHtml}
      <div class="wa-msg-meta">
        <span class="wa-msg-time">${msg.time}</span>
        ${tickHtml}
      </div>
    `;

    // Hacer que el tick sea clickeable para alternar su estado: single -> grey -> blue -> single
    if (msg.sender === 'me') {
      const tickEl = bubble.querySelector('.tick-icon');
      if (tickEl) {
        tickEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (msg.ticks === 'blue') {
            msg.ticks = 'grey';
          } else if (msg.ticks === 'grey') {
            msg.ticks = 'single';
          } else {
            msg.ticks = 'blue';
          }
          renderMessages();
        });
      }
    }

    if (msg.type === 'audio') {
      setupAudioPlayer(bubble, msg.audioUrl, msg.duration);
    }

    row.appendChild(bubble);
    return row;
  }

  function setupAudioPlayer(bubble, audioUrl, durationText) {
    const playBtn = bubble.querySelector('.audio-play-btn');
    const bars = bubble.querySelectorAll('.audio-bar');
    const timer = bubble.querySelector('.audio-timer');
    let isPlaying = false;
    let audioElement = null;
    let animInterval = null;

    if (audioUrl) {
      audioElement = new Audio(audioUrl);
      audioElement.addEventListener('ended', () => {
        stopPlayback();
      });
    }

    function stopPlayback() {
      isPlaying = false;
      if (audioElement) audioElement.pause();
      if (animInterval) clearInterval(animInterval);
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      timer.textContent = durationText || '0:14';
      bars.forEach(b => b.classList.remove('played'));
    }

    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopPlayback();
      } else {
        isPlaying = true;
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        
        let progress = 0;
        bars.forEach(b => b.classList.remove('played'));

        if (audioElement) {
          audioElement.currentTime = 0;
          audioElement.play().catch(() => {});
          
          animInterval = setInterval(() => {
            if (audioElement && audioElement.duration) {
              const currentSec = Math.floor(audioElement.currentTime);
              const m = Math.floor(currentSec / 60);
              const s = currentSec % 60;
              timer.textContent = `${m}:${s < 10 ? '0' + s : s}`;

              const pct = audioElement.currentTime / audioElement.duration;
              const playedCount = Math.floor(pct * bars.length);
              bars.forEach((b, i) => {
                if (i <= playedCount) b.classList.add('played');
                else b.classList.remove('played');
              });
            }
          }, 100);

        } else {
          const totalSecs = parseDurationToSeconds(durationText || '0:14');
          const stepMs = (totalSecs * 1000) / bars.length;

          animInterval = setInterval(() => {
            if (progress < bars.length) {
              bars[progress].classList.add('played');
              progress++;
              const cur = Math.floor((progress / bars.length) * totalSecs);
              const m = Math.floor(cur / 60);
              const s = cur % 60;
              timer.textContent = `${m}:${s < 10 ? '0' + s : s}`;
            } else {
              stopPlayback();
            }
          }, stepMs);
        }
      }
    });
  }

  function parseDurationToSeconds(str) {
    const parts = str.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 14;
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
  // ENVÍO DE MENSAJES & AUTOMATIZACIÓN MULTI-USUARIO
  // ==========================================
  function sendMessage(content, type = 'text', customProps = {}) {
    if (!content && type === 'text') return;
    const chat = getActiveChat();
    if (!chat) return;

    const time = getCurrentTimeString();
    const tickState = state.sendTickMode || 'blue';

    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      type: type,
      content: content,
      time: time,
      ticks: tickState,
      ...customProps
    };

    chat.messages.push(newMsg);
    renderMessages();
    renderChatList();
    playSentPopSound();

    if (chat.autoReply && chat.autoReply.enabled && chat.autoReply.steps && chat.autoReply.steps.length > 0) {
      triggerStepAutomatedReply(chat);
    }
  }

  function triggerStepAutomatedReply(chat) {
    const auto = chat.autoReply;
    if (!auto || !auto.steps || auto.steps.length === 0) return;

    const step = auto.steps[auto.currentStepIndex % auto.steps.length];
    auto.currentStepIndex++;

    const senderContact = getContactById(step.senderContactId);
    const senderName = senderContact ? senderContact.name : (chat.name || 'Contacto');

    const delayMs = Math.max(800, (step.delaySec || 2) * 1000);
    const typingText = step.type === 'audio'
      ? `${senderName} está grabando audio...`
      : `${senderName} está escribiendo...`;

    // 1. A los 400ms: Si los mensajes enviados estaban en gris o single, marcarlos leídos (ticks azules) porque el contacto responderá
    setTimeout(() => {
      chat.messages.forEach(m => {
        if (m.sender === 'me') m.ticks = 'blue';
      });
      renderMessages();
    }, 400);

    // 2. A mitad del tiempo: Estado "escribiendo..."
    setTimeout(() => {
      chat.typingStatus = typingText;
      if (chat.id === state.activeChatId) renderActiveHeader();
      renderChatList();
    }, Math.max(500, delayMs - 900));

    // 3. Al completarse el delay: Entregar el mensaje
    setTimeout(() => {
      chat.typingStatus = '';
      if (chat.id === state.activeChatId) renderActiveHeader();

      const time = getCurrentTimeString();
      const replyMsg = {
        id: 'm_' + Date.now(),
        sender: step.senderContactId || 'contact',
        type: step.type || 'text',
        content: step.content || '',
        audioUrl: step.audioUrl || '',
        duration: step.duration || '0:12',
        time: time,
        ticks: 'none'
      };

      chat.messages.push(replyMsg);
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
      openAudioModal();
    }
  });

  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      btnSend.click();
    }
  });

  // ==========================================
  // MODAL DE NOTA DE VOZ & AUDIO REAL
  // ==========================================
  function openAudioModal() {
    tempAudioUrl = '';
    tempAudioDuration = '0:14';
    audioUploadBtnText.textContent = 'Seleccionar archivo de audio';
    audioSimSeconds.value = '14';
    audioModalOverlay.style.display = 'flex';
  }

  btnCloseAudioModal.addEventListener('click', () => audioModalOverlay.style.display = 'none');
  btnCancelAudioModal.addEventListener('click', () => audioModalOverlay.style.display = 'none');

  fileAudioInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      audioUploadBtnText.textContent = `Archivo: ${file.name}`;
      tempAudioUrl = URL.createObjectURL(file);

      const tempAudio = new Audio(tempAudioUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        const sec = Math.round(tempAudio.duration);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        tempAudioDuration = `${m}:${s < 10 ? '0' + s : s}`;
        audioSimSeconds.value = sec;
      });
    }
  });

  btnConfirmAudioSend.addEventListener('click', () => {
    let dur = tempAudioDuration;
    if (!tempAudioUrl) {
      const sec = parseInt(audioSimSeconds.value) || 14;
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      dur = `${m}:${s < 10 ? '0' + s : s}`;
    }

    sendMessage('audio_note', 'audio', {
      audioUrl: tempAudioUrl,
      duration: dur
    });

    audioModalOverlay.style.display = 'none';
  });

  btnMenuAttachAudio.addEventListener('click', () => {
    closeAllDropdowns();
    openAudioModal();
  });

  // ==========================================
  // DROPDOWN MENÚS NATIVOS
  // ==========================================
  function closeAllDropdowns() {
    addDropdown.classList.remove('show');
    sidebarDropdown.classList.remove('show');
    chatDropdown.classList.remove('show');
    clipDropdown.classList.remove('show');
  }

  btnAddMenuTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = addDropdown.classList.contains('show');
    closeAllDropdowns();
    if (!isShown) addDropdown.classList.add('show');
  });

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

  btnMenuExportChats.addEventListener('click', () => {
    closeAllDropdowns();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.chats, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "whatsapp_chats_backup.json");
    dlAnchorElem.click();
  });

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
            state.chats = imported;
            selectChat(imported[0].id);
            alert('¡Chats importados correctamente!');
          }
        } catch (err) {
          alert('El archivo no tiene un formato JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  });

  // ==========================================
  // ACCIONES DEL MENÚ DEL CHAT ACTIVO
  // ==========================================

  // Fijar / Desfijar Chat (Chincheta)
  btnChatTogglePin.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (chat) {
      chat.isPinned = !chat.isPinned;
      renderActiveHeader();
      renderChatList();
    }
  });

  // Marcar todos como leídos (ticks azules)
  btnChatMarkAllRead.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (chat) {
      chat.messages.forEach(m => {
        if (m.sender === 'me') m.ticks = 'blue';
      });
      renderMessages();
    }
  });

  // Marcar todos como no leídos (ticks grises)
  btnChatMarkAllUnread.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (chat) {
      chat.messages.forEach(m => {
        if (m.sender === 'me') m.ticks = 'grey';
      });
      renderMessages();
    }
  });

  // Vaciar Mensajes
  btnChatClearMsgs.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (chat && confirm('¿Estás seguro de vaciar todos los mensajes de este chat?')) {
      chat.messages = [];
      renderMessages();
      renderChatList();
    }
  });

  // Eliminar Chat / Contacto / Grupo
  btnChatDeleteChat.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (!chat) return;

    const label = chat.type === 'group' ? 'este grupo' : `al contacto "${chat.name}"`;
    if (confirm(`¿Estás seguro de eliminar ${label}? Se borrará por completo.`)) {
      deleteChatOrContact(chat.id);
    }
  });

  function deleteChatOrContact(idToDelete) {
    const deletedChat = state.chats.find(c => c.id === idToDelete);
    if (!deletedChat) return;

    // 1. Quitar de la lista principal
    state.chats = state.chats.filter(c => c.id !== idToDelete);

    // 2. Si era contacto, quitar de los grupos que lo tuvieran como participante
    if (deletedChat.type === 'personal') {
      state.chats.forEach(c => {
        if (c.type === 'group' && c.participantContactIds) {
          c.participantContactIds = c.participantContactIds.filter(cid => cid !== idToDelete);
          if (c.autoReply && c.autoReply.steps) {
            c.autoReply.steps = c.autoReply.steps.filter(s => s.senderContactId !== idToDelete);
          }
        }
      });
    }

    // 3. Seleccionar otro chat
    if (state.chats.length > 0) {
      selectChat(state.chats[0].id);
    } else {
      state.activeChatId = null;
      renderActiveHeader();
      renderChatList();
    }
  }

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

  btnInputCamera.addEventListener('click', () => fileAttachInput.click());
  btnSidebarCamera.addEventListener('click', () => fileAttachInput.click());

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
  // MODAL CREAR / EDITAR CONTACTO INDIVIDUAL
  // ==========================================
  function openContactModal(chat = null) {
    if (chat && chat.type === 'personal') {
      state.editingChatId = chat.id;
      contactModalTitle.textContent = 'Editar Contacto';
      modalContactName.value = chat.name;
      tempAvatarBase64 = chat.avatar || '';
      btnDeleteContactModal.style.display = 'inline-block';

      if (['en línea', 'escribiendo...', 'grabando audio...', 'últ. vez hoy a las 15:08'].includes(chat.status)) {
        modalContactStatus.value = chat.status;
        modalContactStatusCustom.style.display = 'none';
      } else {
        modalContactStatus.value = 'custom';
        modalContactStatusCustom.style.display = 'block';
        modalContactStatusCustom.value = chat.status || '';
      }
    } else {
      state.editingChatId = null;
      contactModalTitle.textContent = 'Nuevo Contacto';
      modalContactName.value = '';
      tempAvatarBase64 = '';
      btnDeleteContactModal.style.display = 'none';
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

  modalContactName.addEventListener('input', () => updateModalAvatarPreview(modalContactName.value));
  modalContactStatus.addEventListener('change', () => {
    modalContactStatusCustom.style.display = modalContactStatus.value === 'custom' ? 'block' : 'none';
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

  btnDeleteContactModal.addEventListener('click', () => {
    if (state.editingChatId && confirm('¿Estás seguro de eliminar este contacto?')) {
      deleteChatOrContact(state.editingChatId);
      contactModalOverlay.style.display = 'none';
    }
  });

  btnSaveContactModal.addEventListener('click', () => {
    const name = modalContactName.value.trim() || 'Contacto';
    let status = modalContactStatus.value;
    if (status === 'custom') {
      status = modalContactStatusCustom.value.trim() || 'disponible';
    }

    if (state.editingChatId) {
      const chat = state.chats.find(c => c.id === state.editingChatId);
      if (chat) {
        chat.name = name;
        chat.avatar = tempAvatarBase64;
        chat.status = status;
      }
    } else {
      const newId = 'c_' + Date.now();
      const newChat = {
        id: newId,
        name: name,
        avatar: tempAvatarBase64,
        type: 'personal',
        isPinned: false,
        status: status,
        unreadCount: 0,
        messages: [],
        autoReply: {
          enabled: true,
          steps: [
            { senderContactId: 'contact', type: 'text', content: 'Hola! Que tal?', delaySec: 2 }
          ],
          currentStepIndex: 0
        }
      };
      state.chats.unshift(newChat);
      state.activeChatId = newId;
    }

    contactModalOverlay.style.display = 'none';
    renderActiveHeader();
    renderChatList();
    renderMessages();
  });

  // ==========================================
  // MODAL CREAR / EDITAR GRUPO CON CONTACTOS EXISTENTES
  // ==========================================
  function openGroupModal(chat = null) {
    if (chat && chat.type === 'group') {
      state.editingChatId = chat.id;
      groupModalTitle.textContent = 'Editar Grupo';
      groupNameInput.value = chat.name;
      tempGroupAvatarBase64 = chat.avatar || '';
      btnDeleteGroupModal.style.display = 'inline-block';
      state.tempGroupMemberIds = [...(chat.participantContactIds || [])];
    } else {
      state.editingChatId = null;
      groupModalTitle.textContent = 'Nuevo Grupo';
      groupNameInput.value = '';
      tempGroupAvatarBase64 = '';
      btnDeleteGroupModal.style.display = 'none';
      // Seleccionar por defecto hasta 2 contactos existentes si los hay
      const existingContacts = state.chats.filter(c => c.type === 'personal');
      state.tempGroupMemberIds = existingContacts.slice(0, 2).map(c => c.id);
    }

    renderGroupMembersList();
    populateGroupContactSelect();
    updateGroupAvatarPreview();
    groupModalOverlay.style.display = 'flex';
  }

  function populateGroupContactSelect() {
    groupSelectExistingContact.innerHTML = '';
    const availableContacts = state.chats.filter(c => c.type === 'personal' && !state.tempGroupMemberIds.includes(c.id));

    if (availableContacts.length === 0) {
      groupNoContactsTip.style.display = 'block';
      groupSelectExistingContact.style.display = 'none';
      btnAddMemberToGroup.style.display = 'none';
    } else {
      groupNoContactsTip.style.display = 'none';
      groupSelectExistingContact.style.display = 'block';
      btnAddMemberToGroup.style.display = 'inline-flex';

      availableContacts.forEach(contact => {
        const opt = document.createElement('option');
        opt.value = contact.id;
        opt.textContent = contact.name;
        groupSelectExistingContact.appendChild(opt);
      });
    }
  }

  function renderGroupMembersList() {
    groupMembersContainer.innerHTML = '';
    state.tempGroupMemberIds.forEach((contactId, idx) => {
      const contact = getContactById(contactId);
      const name = contact ? contact.name : 'Contacto';
      const color = WA_COLORS[idx % WA_COLORS.length];

      const chip = document.createElement('div');
      chip.className = 'group-member-chip';
      chip.innerHTML = `
        <span class="member-chip-color" style="background-color: ${color};"></span>
        <span>${escapeHTML(name)}</span>
        <button type="button" class="member-chip-remove" data-id="${contactId}">&times;</button>
      `;

      chip.querySelector('.member-chip-remove').addEventListener('click', () => {
        state.tempGroupMemberIds = state.tempGroupMemberIds.filter(id => id !== contactId);
        renderGroupMembersList();
        populateGroupContactSelect();
      });

      groupMembersContainer.appendChild(chip);
    });
  }

  btnAddMemberToGroup.addEventListener('click', () => {
    const selectedId = groupSelectExistingContact.value;
    if (selectedId && !state.tempGroupMemberIds.includes(selectedId)) {
      state.tempGroupMemberIds.push(selectedId);
      renderGroupMembersList();
      populateGroupContactSelect();
    }
  });

  function updateGroupAvatarPreview() {
    if (tempGroupAvatarBase64) {
      groupAvatarPreviewImg.src = tempGroupAvatarBase64;
      groupAvatarPreviewImg.style.display = 'block';
      groupAvatarPreviewLetter.style.display = 'none';
    } else {
      groupAvatarPreviewImg.style.display = 'none';
      groupAvatarPreviewLetter.style.display = 'flex';
      groupAvatarPreviewLetter.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
    }
  }

  groupAvatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        tempGroupAvatarBase64 = event.target.result;
        updateGroupAvatarPreview();
      };
      reader.readAsDataURL(file);
    }
  });

  btnGroupRemoveAvatar.addEventListener('click', () => {
    tempGroupAvatarBase64 = '';
    updateGroupAvatarPreview();
  });

  btnCloseGroupModal.addEventListener('click', () => groupModalOverlay.style.display = 'none');
  btnCancelGroupModal.addEventListener('click', () => groupModalOverlay.style.display = 'none');

  btnDeleteGroupModal.addEventListener('click', () => {
    if (state.editingChatId && confirm('¿Estás seguro de eliminar este grupo?')) {
      deleteChatOrContact(state.editingChatId);
      groupModalOverlay.style.display = 'none';
    }
  });

  btnSaveGroupModal.addEventListener('click', () => {
    const name = groupNameInput.value.trim() || 'Nuevo Grupo';

    if (state.editingChatId) {
      const chat = state.chats.find(c => c.id === state.editingChatId);
      if (chat) {
        chat.name = name;
        chat.avatar = tempGroupAvatarBase64;
        chat.participantContactIds = [...state.tempGroupMemberIds];
      }
    } else {
      const newId = 'g_' + Date.now();
      const newGroup = {
        id: newId,
        name: name,
        avatar: tempGroupAvatarBase64,
        type: 'group',
        isPinned: false,
        unreadCount: 0,
        participantContactIds: [...state.tempGroupMemberIds],
        messages: [],
        autoReply: {
          enabled: true,
          steps: state.tempGroupMemberIds.map(cid => {
            const c = getContactById(cid);
            return {
              senderContactId: cid,
              type: 'text',
              content: `Hola a todos desde ${c ? c.name : 'Contacto'}!`,
              delaySec: 2
            };
          }),
          currentStepIndex: 0
        }
      };
      state.chats.unshift(newGroup);
      state.activeChatId = newId;
    }

    groupModalOverlay.style.display = 'none';
    renderActiveHeader();
    renderChatList();
    renderMessages();
  });

  // Triggers de Apertura de Modales
  btnMenuAddContact.addEventListener('click', () => {
    closeAllDropdowns();
    openContactModal(null);
  });

  btnMenuAddGroup.addEventListener('click', () => {
    closeAllDropdowns();
    openGroupModal(null);
  });

  btnMobileFab.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = addDropdown.classList.contains('show');
    closeAllDropdowns();
    if (!isShown) addDropdown.classList.add('show');
  });

  btnOpenChatInfoModal.addEventListener('click', () => {
    const chat = getActiveChat();
    if (chat) {
      if (chat.type === 'group') openGroupModal(chat);
      else openContactModal(chat);
    }
  });

  btnChatEditChat.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (chat) {
      if (chat.type === 'group') openGroupModal(chat);
      else openContactModal(chat);
    }
  });

  // ==========================================
  // MODAL RESPUESTAS AUTOMÁTICAS & STEP BUILDER
  // ==========================================
  btnChatAutoReply.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (!chat) return;

    if (!chat.autoReply) {
      chat.autoReply = { enabled: true, steps: [], currentStepIndex: 0 };
    }

    autoReplyCheckbox.checked = chat.autoReply.enabled;
    tempWorkingSteps = JSON.parse(JSON.stringify(chat.autoReply.steps || []));

    populateStepSenderOptions(chat);
    renderAutoStepsList();

    // Reset Formulario
    stepTypeSelect.value = 'text';
    stepInputTextWrap.style.display = 'block';
    stepInputImageWrap.style.display = 'none';
    stepInputAudioWrap.style.display = 'none';
    stepTextInput.value = '';
    tempStepImageBase64 = '';
    tempStepAudioUrl = '';
    stepImageBtnText.textContent = 'Subir imagen';
    stepAudioBtnText.textContent = 'Subir .mp3/.wav';
    stepDelayInput.value = '2';

    autoModalOverlay.style.display = 'flex';
  });

  function populateStepSenderOptions(chat) {
    stepSenderSelect.innerHTML = '';
    if (chat.type === 'group' && chat.participantContactIds && chat.participantContactIds.length > 0) {
      chat.participantContactIds.forEach(cid => {
        const contact = getContactById(cid);
        if (contact) {
          const opt = document.createElement('option');
          opt.value = contact.id;
          opt.textContent = contact.name;
          stepSenderSelect.appendChild(opt);
        }
      });
    } else {
      const opt = document.createElement('option');
      opt.value = 'contact';
      opt.textContent = chat.name;
      stepSenderSelect.appendChild(opt);
    }
  }

  stepTypeSelect.addEventListener('change', () => {
    const t = stepTypeSelect.value;
    stepInputTextWrap.style.display = t === 'text' ? 'block' : 'none';
    stepInputImageWrap.style.display = t === 'image' ? 'block' : 'none';
    stepInputAudioWrap.style.display = t === 'audio' ? 'block' : 'none';
  });

  stepImageFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      stepImageBtnText.textContent = `Foto: ${file.name}`;
      const reader = new FileReader();
      reader.onload = (event) => {
        tempStepImageBase64 = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  stepAudioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      stepAudioBtnText.textContent = `Audio: ${file.name}`;
      tempStepAudioUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(tempStepAudioUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        const sec = Math.round(tempAudio.duration);
        stepAudioDurationInput.value = sec;
      });
    }
  });

  function renderAutoStepsList() {
    autoStepsContainer.innerHTML = '';
    if (tempWorkingSteps.length === 0) {
      autoStepsContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 13px; font-style: italic;">No hay respuestas programadas en este guion. Añade una debajo.</div>`;
      return;
    }

    tempWorkingSteps.forEach((step, idx) => {
      const item = document.createElement('div');
      item.className = 'auto-step-item';

      const contact = getContactById(step.senderContactId);
      const senderName = contact ? contact.name : 'Contacto';

      let detailText = '';
      if (step.type === 'text') detailText = `Texto: "${step.content}"`;
      else if (step.type === 'image') detailText = `Imagen / Foto`;
      else if (step.type === 'audio') detailText = `Nota de voz (${step.duration || '0:12'})`;

      item.innerHTML = `
        <div class="auto-step-meta">
          <span class="step-sender-name" style="color: var(--wa-green-deep);">${idx + 1}. [${escapeHTML(senderName)}]</span>
          <span class="step-detail-text">${escapeHTML(detailText)} (${step.delaySec || 2}s de espera)</span>
        </div>
        <button type="button" class="step-remove-btn" data-idx="${idx}">&times;</button>
      `;

      item.querySelector('.step-remove-btn').addEventListener('click', () => {
        tempWorkingSteps.splice(idx, 1);
        renderAutoStepsList();
      });

      autoStepsContainer.appendChild(item);
    });
  }

  btnAddStepToList.addEventListener('click', () => {
    const chat = getActiveChat();
    if (!chat) return;

    const senderContactId = stepSenderSelect.value;
    const type = stepTypeSelect.value;
    const delaySec = parseFloat(stepDelayInput.value) || 2;
    let content = '';
    let audioUrl = '';
    let duration = '0:12';

    if (type === 'text') {
      content = stepTextInput.value.trim();
      if (!content) {
        alert('Por favor introduce el texto del mensaje.');
        return;
      }
    } else if (type === 'image') {
      content = tempStepImageBase64 || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400';
    } else if (type === 'audio') {
      audioUrl = tempStepAudioUrl;
      const sec = parseInt(stepAudioDurationInput.value) || 12;
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      duration = `${m}:${s < 10 ? '0' + s : s}`;
    }

    tempWorkingSteps.push({
      senderContactId,
      type,
      content,
      audioUrl,
      duration,
      delaySec
    });

    renderAutoStepsList();

    // Resetear campos
    stepTextInput.value = '';
    stepImageBtnText.textContent = 'Subir imagen';
    stepAudioBtnText.textContent = 'Subir .mp3/.wav';
    tempStepImageBase64 = '';
    tempStepAudioUrl = '';
  });

  btnCloseAutoModal.addEventListener('click', () => autoModalOverlay.style.display = 'none');
  btnCancelAutoModal.addEventListener('click', () => autoModalOverlay.style.display = 'none');

  btnSaveAutoModal.addEventListener('click', () => {
    const chat = getActiveChat();
    if (chat) {
      if (!chat.autoReply) chat.autoReply = { currentStepIndex: 0 };
      chat.autoReply.enabled = autoReplyCheckbox.checked;
      chat.autoReply.steps = tempWorkingSteps;
    }
    autoModalOverlay.style.display = 'none';
  });

  // ==========================================
  // LLAMADAS Y VIDEOLLAMADAS SIMULADAS
  // ==========================================
  let callTimerInterval = null;
  let callSeconds = 0;

  function startVoiceCall() {
    const chat = getActiveChat();
    if (!chat) return;

    callNameDisplay.textContent = chat.name;
    callStatusText.textContent = 'Llamando...';
    
    const letterEl = document.getElementById('call-avatar-letter');
    const imgEl = document.getElementById('call-avatar-img');
    if (chat.avatar) {
      imgEl.src = chat.avatar;
      imgEl.style.display = 'block';
      letterEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      letterEl.style.display = 'flex';
      if (chat.type === 'group') {
        letterEl.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
      } else {
        letterEl.textContent = chat.name.charAt(0).toUpperCase();
      }
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
    const chat = getActiveChat();
    if (!chat) return;

    videoNameDisplay.textContent = chat.name;
    videoStatusText.textContent = 'Conectando...';

    const letterEl = document.getElementById('videocall-avatar-letter');
    const imgEl = document.getElementById('videocall-avatar-img');
    if (chat.avatar) {
      imgEl.src = chat.avatar;
      imgEl.style.display = 'block';
      letterEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      letterEl.style.display = 'flex';
      if (chat.type === 'group') {
        letterEl.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
      } else {
        letterEl.textContent = chat.name.charAt(0).toUpperCase();
      }
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

  // Botón Volver Móvil
  btnBackToList.addEventListener('click', () => {
    state.mobileView = 'in-list';
    updateMobileLayoutView();
  });

  // Búsqueda & Filtros
  searchInput.addEventListener('input', renderChatList);

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderChatList();
    });
  });

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  selectChat(state.activeChatId);

});
