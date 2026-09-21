/**
 * WhatsApp Fake Simulator - Script Logic
 * Multi-user Groups linked to Real Contacts, Message Context Menu, Selection Mode, Custom Separators & Read State
 * Author: EditFun Suite
 */

document.addEventListener('DOMContentLoaded', () => {

  const WA_COLORS = ['#e542a3', '#02a698', '#dfa62a', '#35cd96', '#6bcbef', '#e56456', '#a58cf0', '#ec78a9'];

  // ==========================================
  // CONFIGURACIÓN Y CHATS POR DEFECTO
  // ==========================================
  const STORAGE_KEY = 'wa_fake_chats_v4';

  const DEFAULT_CHATS = [];

  // ==========================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================
  const state = {
    theme: 'dark', // 'dark' | 'light'
    mode: 'auto', // 'auto' | 'forced-mobile'
    mobileView: 'in-list', // 'in-list' | 'in-chat'
    activeChatId: null,
    editingChatId: null,
    isSelectionMode: false,
    selectedMessageIds: new Set(),
    tempGroupMemberIds: [], // IDs de contactos individuales seleccionados
    chats: []
  };

  // Guardado y Carga en LocalStorage
  function saveState() {
    try {
      const dataToSave = {
        chats: state.chats,
        theme: state.theme,
        mode: state.mode,
        activeChatId: state.activeChatId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && Array.isArray(data.chats)) {
          state.chats = data.chats;
        }
        if (data && data.theme) {
          state.theme = data.theme;
        }
        if (data && data.mode) {
          state.mode = data.mode;
        }
        if (data && data.activeChatId) {
          const chatExists = state.chats.some(c => c.id === data.activeChatId);
          state.activeChatId = chatExists ? data.activeChatId : (state.chats[0]?.id || null);
        } else {
          state.activeChatId = state.chats[0]?.id || null;
        }
      } else {
        state.chats = [];
        state.activeChatId = null;
      }
    } catch (e) {
      console.error('Error al cargar estado desde localStorage:', e);
    }
  }

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
  const btnOpenChatInfoModal = document.getElementById('btn-open-chat-info-modal');
  const noChatScreen = document.getElementById('wa-no-chat-screen');
  const activeChatWrapper = document.getElementById('wa-active-chat-wrapper');
  
  // Barra de Selección
  const selectionTopBar = document.getElementById('wa-selection-topbar');
  const selectionCountText = document.getElementById('selection-count-text');
  const btnCancelSelection = document.getElementById('btn-cancel-selection');
  const btnDeleteSelected = document.getElementById('btn-delete-selected');
  
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
  const btnMenuFullscreen = document.getElementById('menu-btn-fullscreen');
  const fullscreenToggleLabel = document.getElementById('fullscreen-toggle-label');
  const btnMenuExportChats = document.getElementById('menu-btn-export-chats');
  const btnMenuImportChats = document.getElementById('menu-btn-import-chats');
  const btnMenuResetChats = document.getElementById('menu-btn-reset-chats');
  const fileImportJson = document.getElementById('chat-import-json-input');
  
  // Chat Menú Actions
  const btnChatAutoReply = document.getElementById('chat-menu-btn-auto-reply');
  const btnChatAddSeparator = document.getElementById('chat-menu-btn-add-separator');
  const btnChatSelectMode = document.getElementById('chat-menu-btn-select-mode');
  const btnChatMarkChatUnread = document.getElementById('chat-menu-btn-mark-chat-unread');
  const btnChatEditChat = document.getElementById('chat-menu-btn-edit-chat');
  const chatMenuEditLabel = document.getElementById('chat-menu-edit-label');
  const btnChatTogglePin = document.getElementById('chat-menu-btn-toggle-pin');
  const chatMenuPinLabel = document.getElementById('chat-menu-pin-label');
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

  // Modal Separador
  const separatorModalOverlay = document.getElementById('separator-modal-overlay');
  const btnCloseSeparatorModal = document.getElementById('btn-close-separator-modal');
  const btnCancelSeparatorModal = document.getElementById('btn-cancel-separator-modal');
  const btnConfirmAddSeparator = document.getElementById('btn-confirm-add-separator');
  const separatorTypeSelect = document.getElementById('separator-type-select');
  const separatorTextInput = document.getElementById('separator-text-input');
  const separatorTextGroup = document.getElementById('separator-text-group');
  const separatorPositionSelect = document.getElementById('separator-position-select');

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

  // Modal de Diálogo Personalizado (Reemplazo de alert, confirm, prompt)
  const customDialogOverlay = document.getElementById('custom-dialog-overlay');
  const customDialogTitle = document.getElementById('custom-dialog-title');
  const customDialogMessage = document.getElementById('custom-dialog-message');
  const customDialogCloseBtn = document.getElementById('custom-dialog-close-btn');
  const customDialogCancelBtn = document.getElementById('custom-dialog-cancel-btn');
  const customDialogConfirmBtn = document.getElementById('custom-dialog-confirm-btn');
  const customDialogPromptWrap = document.getElementById('custom-dialog-prompt-wrap');
  const customDialogInput = document.getElementById('custom-dialog-input');

  let currentDialogResolver = null;

  function closeCustomDialog(result) {
    if (customDialogOverlay) customDialogOverlay.style.display = 'none';
    if (currentDialogResolver) {
      const resolve = currentDialogResolver;
      currentDialogResolver = null;
      resolve(result);
    }
  }

  if (customDialogCloseBtn) customDialogCloseBtn.addEventListener('click', () => closeCustomDialog(null));
  if (customDialogCancelBtn) customDialogCancelBtn.addEventListener('click', () => closeCustomDialog(false));

  function showCustomAlert(title, message) {
    return new Promise(resolve => {
      customDialogTitle.textContent = title || 'Información';
      customDialogMessage.textContent = message || '';
      customDialogPromptWrap.style.display = 'none';
      customDialogCancelBtn.style.display = 'none';
      customDialogConfirmBtn.textContent = 'Aceptar';
      customDialogConfirmBtn.className = 'btn-wa-save';
      customDialogOverlay.style.display = 'flex';

      currentDialogResolver = () => resolve();
      customDialogConfirmBtn.onclick = () => closeCustomDialog(true);
    });
  }

  function showCustomConfirm(title, message, confirmText = 'Aceptar', isDanger = false) {
    return new Promise(resolve => {
      customDialogTitle.textContent = title || '¿Estás seguro?';
      customDialogMessage.textContent = message || '';
      customDialogPromptWrap.style.display = 'none';
      customDialogCancelBtn.style.display = 'inline-block';
      customDialogConfirmBtn.textContent = confirmText;
      customDialogConfirmBtn.className = isDanger ? 'btn-wa-danger-action' : 'btn-wa-save';
      customDialogOverlay.style.display = 'flex';

      currentDialogResolver = (res) => resolve(res === true);
      customDialogConfirmBtn.onclick = () => closeCustomDialog(true);
    });
  }

  function showCustomPrompt(title, message, defaultValue = '', inputType = 'text') {
    return new Promise(resolve => {
      customDialogTitle.textContent = title || 'Ingresar valor';
      customDialogMessage.textContent = message || '';
      customDialogPromptWrap.style.display = 'block';
      customDialogInput.type = inputType;
      customDialogInput.value = defaultValue;
      customDialogCancelBtn.style.display = 'inline-block';
      customDialogConfirmBtn.textContent = 'Aceptar';
      customDialogConfirmBtn.className = 'btn-wa-save';
      customDialogOverlay.style.display = 'flex';
      setTimeout(() => customDialogInput.focus(), 50);

      currentDialogResolver = (res) => {
        if (res === null || res === false) resolve(null);
        else resolve(customDialogInput.value);
      };
      customDialogConfirmBtn.onclick = () => closeCustomDialog(true);
      customDialogInput.onkeydown = (e) => {
        if (e.key === 'Enter') closeCustomDialog(true);
      };
    });
  }

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

  // Helper para buscar contacto individual por ID
  function getContactById(id) {
    return state.chats.find(c => c.id === id && c.type === 'personal') || null;
  }

  function getActiveChat() {
    return state.chats.find(c => c.id === state.activeChatId) || null;
  }

  function getSortedChats() {
    const pinned = state.chats.filter(c => c.isPinned);
    const nonPinned = state.chats.filter(c => !c.isPinned);
    return [...pinned, ...nonPinned];
  }

  let draggedChatId = null;
  let touchDragItem = null;
  let touchDragTimer = null;
  let touchStartY = 0;
  let touchCurrentTarget = null;

  function setupChatDragAndDrop(item, chat) {
    if (chat.isPinned) {
      item.setAttribute('draggable', 'false');
      return;
    }

    item.setAttribute('draggable', 'true');

    // Desktop Drag & Drop
    item.addEventListener('dragstart', (e) => {
      draggedChatId = chat.id;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', chat.id);
    });

    item.addEventListener('dragend', () => {
      draggedChatId = null;
      item.classList.remove('dragging');
      document.querySelectorAll('.wa-chat-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedChatId || draggedChatId === chat.id || chat.isPinned) return;
      e.dataTransfer.dropEffect = 'move';

      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        item.classList.add('drag-over-top');
        item.classList.remove('drag-over-bottom');
      } else {
        item.classList.add('drag-over-bottom');
        item.classList.remove('drag-over-top');
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over-top', 'drag-over-bottom');
      if (!draggedChatId || draggedChatId === chat.id) return;

      const rect = item.getBoundingClientRect();
      const isBefore = e.clientY < (rect.top + rect.height / 2);
      reorderChats(draggedChatId, chat.id, isBefore);
    });

    // Mobile Touch Long-Press Drag
    item.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartY = touch.clientY;
      draggedChatId = null;

      touchDragTimer = setTimeout(() => {
        draggedChatId = chat.id;
        touchDragItem = item;
        item.classList.add('dragging-touch');
        if (navigator.vibrate) navigator.vibrate(30);
      }, 300);
    }, { passive: true });

    item.addEventListener('touchmove', (e) => {
      if (!draggedChatId) {
        if (Math.abs(e.touches[0].clientY - touchStartY) > 10) {
          clearTimeout(touchDragTimer);
        }
        return;
      }
      e.preventDefault();

      const touch = e.touches[0];
      const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
      const chatItemTarget = targetEl ? targetEl.closest('.wa-chat-item') : null;

      document.querySelectorAll('.wa-chat-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      if (chatItemTarget && chatItemTarget !== item && chatItemTarget.dataset.id) {
        const targetChat = state.chats.find(c => c.id === chatItemTarget.dataset.id);
        if (targetChat && !targetChat.isPinned) {
          touchCurrentTarget = chatItemTarget;
          const rect = chatItemTarget.getBoundingClientRect();
          if (touch.clientY < rect.top + rect.height / 2) {
            chatItemTarget.classList.add('drag-over-top');
          } else {
            chatItemTarget.classList.add('drag-over-bottom');
          }
        }
      }
    }, { passive: false });

    item.addEventListener('touchend', (e) => {
      clearTimeout(touchDragTimer);
      if (draggedChatId && touchCurrentTarget) {
        const targetId = touchCurrentTarget.dataset.id;
        const rect = touchCurrentTarget.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const isBefore = touch.clientY < (rect.top + rect.height / 2);
        reorderChats(draggedChatId, targetId, isBefore);
      }
      item.classList.remove('dragging-touch');
      document.querySelectorAll('.wa-chat-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      draggedChatId = null;
      touchDragItem = null;
      touchCurrentTarget = null;
    });

    item.addEventListener('touchcancel', () => {
      clearTimeout(touchDragTimer);
      item.classList.remove('dragging-touch');
      document.querySelectorAll('.wa-chat-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      draggedChatId = null;
      touchDragItem = null;
      touchCurrentTarget = null;
    });
  }

  function reorderChats(sourceId, targetId, isBefore) {
    const srcIdx = state.chats.findIndex(c => c.id === sourceId);
    const tgtIdx = state.chats.findIndex(c => c.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const [srcChat] = state.chats.splice(srcIdx, 1);
    let newTgtIdx = state.chats.findIndex(c => c.id === targetId);
    let insertIdx = isBefore ? newTgtIdx : newTgtIdx + 1;

    // Never place before pinned items
    const firstNonPinnedIndex = state.chats.findIndex(c => !c.isPinned);
    if (firstNonPinnedIndex !== -1 && insertIdx < firstNonPinnedIndex) {
      insertIdx = firstNonPinnedIndex;
    }

    state.chats.splice(insertIdx, 0, srcChat);
    saveState();
    renderChatList();
  }

  function bringChatToTop(chatId) {
    const chatIndex = state.chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;
    const [chat] = state.chats.splice(chatIndex, 1);
    if (chat.isPinned) {
      state.chats.unshift(chat);
    } else {
      const firstNonPinnedIndex = state.chats.findIndex(c => !c.isPinned);
      if (firstNonPinnedIndex === -1) {
        state.chats.push(chat);
      } else {
        state.chats.splice(firstNonPinnedIndex, 0, chat);
      }
    }
  }

  function renderChatList() {
    chatListContainer.innerHTML = '';
    const query = (searchInput.value || '').trim().toLowerCase();
    const sorted = getSortedChats();

    const filtered = sorted.filter(c => {
      const msgs = c.messages.filter(m => m.type !== 'date_divider' && m.type !== 'encryption_notice');
      const matchesQuery = c.name.toLowerCase().includes(query) ||
        (msgs.length && msgs[msgs.length - 1].content && msgs[msgs.length - 1].content.toLowerCase().includes(query));
      
      if (!matchesQuery) return false;
      if (currentFilter === 'all') return true;
      if (currentFilter === 'unread') return c.unreadCount > 0;
      if (currentFilter === 'favorites') return c.isPinned;
      if (currentFilter === 'groups') return c.type === 'group';
      return true;
    });

    if (filtered.length === 0) {
      const emptyTip = document.createElement('div');
      emptyTip.className = 'wa-empty-chatlist-tip';
      emptyTip.style.padding = '36px 20px';
      emptyTip.style.textAlign = 'center';
      emptyTip.style.color = 'var(--text-muted)';
      emptyTip.style.fontSize = '13.5px';
      emptyTip.style.lineHeight = '1.5';
      emptyTip.innerHTML = `
        <div style="margin-bottom: 12px; display: flex; justify-content: center;">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); opacity: 0.65;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </div>
        <div style="font-weight: 500; color: var(--text-secondary); margin-bottom: 4px;">No hay chats</div>
        <div>Toca el botón <strong>+</strong> para añadir un nuevo contacto o grupo.</div>
      `;
      chatListContainer.appendChild(emptyTip);
      return;
    }

    filtered.forEach(chat => {
      const item = document.createElement('div');
      item.className = `wa-chat-item ${chat.id === state.activeChatId ? 'active' : ''}`;
      item.dataset.id = chat.id;

      const msgs = chat.messages.filter(m => m.type !== 'date_divider' && m.type !== 'encryption_notice');
      const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;
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

      setupChatDragAndDrop(item, chat);

      chatListContainer.appendChild(item);
    });
  }

  function selectChat(chatId) {
    state.activeChatId = chatId;
    exitSelectionMode();

    const chat = getActiveChat();
    if (chat) {
      chat.unreadCount = 0;
      noChatScreen.style.display = 'none';
      activeChatWrapper.style.display = 'flex';
      renderActiveHeader();
      renderMessages();
      state.mobileView = 'in-chat';
    } else {
      noChatScreen.style.display = 'flex';
      activeChatWrapper.style.display = 'none';
      state.mobileView = 'in-list';
    }
    
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
  // RENDERIZADO DE MENSAJES Y ELEMENTOS DE CHAT
  // ==========================================
  function renderMessages() {
    const chat = getActiveChat();
    if (!chat) return;

    messagesContainer.innerHTML = '';

    chat.messages.forEach(item => {
      if (item.type === 'date_divider') {
        const div = document.createElement('div');
        div.className = 'wa-date-divider';
        div.innerHTML = `<span>${escapeHTML(item.content)}</span>`;
        messagesContainer.appendChild(div);
      } else if (item.type === 'encryption_notice') {
        const notice = document.createElement('div');
        notice.className = 'wa-encryption-notice';
        notice.innerHTML = `
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          <span>${escapeHTML(item.content)}</span>
        `;
        messagesContainer.appendChild(notice);
      } else {
        const msgRow = createMessageElement(item, chat);
        messagesContainer.appendChild(msgRow);
      }
    });

    scrollToBottom();
  }

  function createMessageElement(msg, chat) {
    const row = document.createElement('div');
    const isSent = msg.sender === 'me';
    const isSelected = state.selectedMessageIds.has(msg.id);

    row.className = `wa-msg-row ${isSent ? 'sent' : 'received'} ${state.isSelectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`;
    row.id = `msg-${msg.id}`;

    // Checkbox de Selección
    const checkWrap = document.createElement('div');
    checkWrap.className = 'msg-select-checkbox-wrap';
    checkWrap.innerHTML = '<div class="msg-select-checkbox"></div>';
    checkWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMessageSelection(msg.id);
    });

    const bubble = document.createElement('div');
    bubble.className = 'wa-bubble';

    // Botón Chevron Flecha hacia abajo (aparece en hover como en WhatsApp Web)
    const chevronBtn = document.createElement('button');
    chevronBtn.className = 'wa-bubble-chevron-btn';
    chevronBtn.title = 'Opciones del mensaje';
    chevronBtn.innerHTML = `<svg viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M3.3 5.3a1 1 0 0 1 1.4 0L9 9.6l4.3-4.3a1 1 0 0 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4z"/></svg>`;
    chevronBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMessageContextMenu(e, msg, chat);
    });
    bubble.appendChild(chevronBtn);

    // Cabecera con Nombre del Autor en Grupos
    let authorHtml = '';
    if (chat.type === 'group' && !isSent) {
      const senderContact = getContactById(msg.sender);
      const senderName = senderContact ? senderContact.name : (msg.senderName || 'Contacto');
      const senderIdx = (chat.participantContactIds || []).indexOf(msg.sender);
      const senderColor = senderIdx >= 0 ? WA_COLORS[senderIdx % WA_COLORS.length] : '#02a698';
      authorHtml = `<div class="wa-msg-author" style="color: ${senderColor};">${escapeHTML(senderName)}</div>`;
    }

    // Ticks SVG oficiales (SOLO en mensajes enviados por 'me')
    let tickHtml = '';
    if (isSent) {
      if (msg.ticks === 'blue') {
        tickHtml = `<span class="tick-icon blue" title="Leído"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.07 1.05a.75.75 0 0 0-1.06 0L5.3 5.76 3.18 3.64a.75.75 0 0 0-1.06 1.06l2.65 2.65a.75.75 0 0 0 1.06 0l5.24-5.24a.75.75 0 0 0 0-1.06zm4 0a.75.75 0 0 0-1.06 0l-5.24 5.24-.53-.53a.75.75 0 0 0-1.06 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l5.77-5.77a.75.75 0 0 0 0-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'grey') {
        tickHtml = `<span class="tick-icon grey" title="Entregado"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.07 1.05a.75.75 0 0 0-1.06 0L5.3 5.76 3.18 3.64a.75.75 0 0 0-1.06 1.06l2.65 2.65a.75.75 0 0 0 1.06 0l5.24-5.24a.75.75 0 0 0 0-1.06zm4 0a.75.75 0 0 0-1.06 0l-5.24 5.24-.53-.53a.75.75 0 0 0-1.06 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l5.77-5.77a.75.75 0 0 0 0-1.06z"/></svg></span>`;
      } else if (msg.ticks === 'single') {
        tickHtml = `<span class="tick-icon grey" title="Enviado"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 1.05a.75.75 0 0 0-1.06 0L5.3 9.76 2.18 6.64a.75.75 0 0 0-1.06 1.06l3.65 3.65a.75.75 0 0 0 1.06 0l9.18-9.18a.75.75 0 0 0 0-1.06z"/></svg></span>`;
      }
    }

    let contentHtml = '';

    if (msg.type === 'text') {
      contentHtml = `<span class="wa-bubble-text">${formatMessageText(msg.content)}</span>`;
    } else if (msg.type === 'image') {
      contentHtml = `
        <div class="wa-msg-image-wrap">
          <img src="${msg.content}" alt="Foto adjunta">
        </div>
        ${msg.caption ? `<span class="wa-bubble-text">${formatMessageText(msg.caption)}</span>` : ''}
      `;
    } else if (msg.type === 'onetime') {
      contentHtml = `
        <div class="wa-onetime-card">
          <div class="onetime-badge-circle">1</div>
          <span class="onetime-text">Foto</span>
        </div>
      `;
    } else if (msg.type === 'audio') {
      let audioAvatarHtml = '';
      if (isSent) {
        if (state.myAvatar) {
          audioAvatarHtml = `<img src="${state.myAvatar}" alt="Avatar">`;
        } else {
          audioAvatarHtml = `<span>T</span>`;
        }
      } else {
        if (chat.type === 'group') {
          const senderContact = getContactById(msg.sender);
          if (senderContact && senderContact.avatar) {
            audioAvatarHtml = `<img src="${senderContact.avatar}" alt="${senderContact.name}">`;
          } else {
            const initial = (senderContact ? senderContact.name : (msg.senderName || 'C')).charAt(0).toUpperCase();
            audioAvatarHtml = `<span>${initial}</span>`;
          }
        } else {
          if (chat.avatar) {
            audioAvatarHtml = `<img src="${chat.avatar}" alt="${chat.name}">`;
          } else {
            audioAvatarHtml = `<span>${chat.name.charAt(0).toUpperCase()}</span>`;
          }
        }
      }

      const waveformHeights = [8, 14, 20, 16, 10, 6, 12, 18, 24, 18, 12, 6, 10, 16, 22, 26, 20, 14, 8, 12, 18, 22, 16, 10, 6, 12, 18, 22, 16, 10, 6, 14, 18];
      let barsHtml = '';
      waveformHeights.forEach(h => {
        barsHtml += `<div class="audio-bar" style="height: ${h}px;"></div>`;
      });

      contentHtml = `
        <div class="wa-audio-bubble-content">
          <div class="wa-audio-avatar-wrap">
            <div class="wa-audio-avatar">
              ${audioAvatarHtml}
            </div>
          </div>
          <div class="wa-audio-body">
            <div class="wa-audio-top-row">
              <button class="audio-play-btn" title="Reproducir nota de voz">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div class="audio-waveform-track">
                <div class="audio-bars-container">
                  ${barsHtml}
                </div>
                <div class="audio-scrubber-dot" style="left: 0%;"></div>
              </div>
            </div>
            <div class="wa-audio-bottom-row">
              <span class="audio-timer">${msg.duration || '0:14'}</span>
              <div class="wa-audio-meta">
                <span class="wa-msg-time">${msg.time}</span>
                ${tickHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const metaHtml = `
      <span class="wa-msg-meta">
        <span class="wa-msg-time">${msg.time}</span>
        ${tickHtml}
      </span>
    `;

    if (msg.type === 'audio') {
      bubble.innerHTML = `
        ${authorHtml}
        ${contentHtml}
      `;
    } else {
      bubble.innerHTML = `
        ${authorHtml}
        ${contentHtml}
        ${metaHtml}
      `;
    }
    bubble.appendChild(chevronBtn);

    // Clic en la fila si estamos en modo selección
    row.addEventListener('click', () => {
      if (state.isSelectionMode) {
        toggleMessageSelection(msg.id);
      }
    });

    if (msg.type === 'audio') {
      setupAudioPlayer(bubble, msg.audioUrl, msg.duration);
    }

    if (!isSent) {
      row.appendChild(checkWrap);
      row.appendChild(bubble);
    } else {
      row.appendChild(bubble);
      row.appendChild(checkWrap);
    }

    return row;
  }

  // ==========================================
  // MENÚ CONTEXTUAL POP-UP DEL MENSAJE (AUTÉNTICO)
  // ==========================================
  let activeContextMenu = null;

  function closeMessageContextMenu() {
    if (activeContextMenu) {
      activeContextMenu.remove();
      activeContextMenu = null;
    }
  }

  document.addEventListener('click', closeMessageContextMenu);

  function openMessageContextMenu(e, msg, chat) {
    closeMessageContextMenu();
    closeAllDropdowns();

    const menu = document.createElement('div');
    menu.className = 'wa-msg-context-menu';

    const isSent = msg.sender === 'me';
    let tickOptionsHtml = '';
    if (isSent) {
      tickOptionsHtml = `
        <button class="dropdown-item" data-action="toggle-ticks">
          <svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M11.07 1.05a.75.75 0 0 0-1.06 0L5.3 5.76 3.18 3.64a.75.75 0 0 0-1.06 1.06l2.65 2.65a.75.75 0 0 0 1.06 0l5.24-5.24a.75.75 0 0 0 0-1.06zm4 0a.75.75 0 0 0-1.06 0l-5.24 5.24-.53-.53a.75.75 0 0 0-1.06 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l5.77-5.77a.75.75 0 0 0 0-1.06z"/></svg>
          <span>Cambiar ticks (${msg.ticks === 'blue' ? 'Azul' : msg.ticks === 'grey' ? '2 Grises' : '1 Gris'})</span>
        </button>
      `;
    }

    menu.innerHTML = `
      <button class="dropdown-item" data-action="copy">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>Copiar</span>
      </button>
      ${tickOptionsHtml}
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" data-action="select">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <span>Seleccionar</span>
      </button>
      <button class="dropdown-item dropdown-exit-item" data-action="delete">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        <span>Eliminar</span>
      </button>
    `;

    // Posicionamiento inteligente del pop-up
    document.body.appendChild(menu);
    const rect = e.target.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left - 140;

    if (top + menu.offsetHeight > window.innerHeight) {
      top = rect.top - menu.offsetHeight - 4;
    }
    if (left < 10) left = 10;
    if (left + menu.offsetWidth > window.innerWidth) left = window.innerWidth - menu.offsetWidth - 10;

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    activeContextMenu = menu;

    menu.querySelectorAll('.dropdown-item').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const action = btn.dataset.action;
        closeMessageContextMenu();

        if (action === 'delete') {
          deleteSingleMessage(msg.id, chat);
        } else if (action === 'select') {
          enterSelectionMode(msg.id);
        } else if (action === 'copy') {
          if (msg.content) navigator.clipboard.writeText(msg.content);
        } else if (action === 'toggle-ticks') {
          if (msg.ticks === 'blue') msg.ticks = 'grey';
          else if (msg.ticks === 'grey') msg.ticks = 'single';
          else msg.ticks = 'blue';
          saveState();
          renderMessages();
        }
      });
    });
  }

  function deleteSingleMessage(msgId, chat) {
    chat.messages = chat.messages.filter(m => m.id !== msgId);
    saveState();
    renderMessages();
    renderChatList();
  }

  // ==========================================
  // MODO SELECCIÓN MÚLTIPLE DE MENSAJES
  // ==========================================
  function enterSelectionMode(initialMsgId = null) {
    state.isSelectionMode = true;
    state.selectedMessageIds.clear();
    if (initialMsgId) state.selectedMessageIds.add(initialMsgId);

    selectionTopBar.style.display = 'flex';
    updateSelectionCounter();
    renderMessages();
  }

  function exitSelectionMode() {
    state.isSelectionMode = false;
    state.selectedMessageIds.clear();
    selectionTopBar.style.display = 'none';
    renderMessages();
  }

  function toggleMessageSelection(msgId) {
    if (state.selectedMessageIds.has(msgId)) {
      state.selectedMessageIds.delete(msgId);
    } else {
      state.selectedMessageIds.add(msgId);
    }

    if (state.selectedMessageIds.size === 0) {
      exitSelectionMode();
    } else {
      updateSelectionCounter();
      renderMessages();
    }
  }

  function updateSelectionCounter() {
    selectionCountText.textContent = `${state.selectedMessageIds.size} seleccionado${state.selectedMessageIds.size === 1 ? '' : 's'}`;
  }

  btnCancelSelection.addEventListener('click', exitSelectionMode);

  btnDeleteSelected.addEventListener('click', async () => {
    const chat = getActiveChat();
    if (!chat || state.selectedMessageIds.size === 0) return;

    const count = state.selectedMessageIds.size;
    const ok = await showCustomConfirm(
      'Eliminar mensajes',
      `¿Deseas eliminar los ${count} mensaje${count === 1 ? '' : 's'} seleccionado${count === 1 ? '' : 's'}?`,
      'Eliminar',
      true
    );
    if (ok) {
      chat.messages = chat.messages.filter(m => !state.selectedMessageIds.has(m.id));
      saveState();
      exitSelectionMode();
      renderChatList();
    }
  });

  btnChatSelectMode.addEventListener('click', () => {
    closeAllDropdowns();
    enterSelectionMode();
  });

  // ==========================================
  // MODAL INSERTAR SEPARADOR / AVISO
  // ==========================================
  btnChatAddSeparator.addEventListener('click', () => {
    closeAllDropdowns();
    separatorModalOverlay.style.display = 'flex';
  });

  btnCloseSeparatorModal.addEventListener('click', () => separatorModalOverlay.style.display = 'none');
  btnCancelSeparatorModal.addEventListener('click', () => separatorModalOverlay.style.display = 'none');

  separatorTypeSelect.addEventListener('change', () => {
    if (separatorTypeSelect.value === 'date') {
      separatorTextGroup.style.display = 'block';
      separatorTextInput.value = 'AYER';
      separatorTextInput.placeholder = 'Ej. AYER, HOY, 10 DE SEPTIEMBRE';
    } else {
      separatorTextGroup.style.display = 'block';
      separatorTextInput.value = 'Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.';
      separatorTextInput.placeholder = 'Texto del aviso de sistema / cifrado';
    }
  });

  btnConfirmAddSeparator.addEventListener('click', () => {
    const chat = getActiveChat();
    if (!chat) return;

    const type = separatorTypeSelect.value === 'date' ? 'date_divider' : 'encryption_notice';
    const content = separatorTextInput.value.trim() || (type === 'date_divider' ? 'HOY' : 'Aviso');
    const position = separatorPositionSelect.value;

    const newItem = {
      id: 'sep_' + Date.now(),
      type: type,
      content: content
    };

    if (position === 'start') {
      chat.messages.unshift(newItem);
    } else {
      chat.messages.push(newItem);
    }

    separatorModalOverlay.style.display = 'none';
    renderMessages();
  });

  // ==========================================
  // REPRODUCTOR DE NOTA DE VOZ
  // ==========================================
  function setupAudioPlayer(bubble, audioUrl, durationText) {
    const playBtn = bubble.querySelector('.audio-play-btn');
    const bars = bubble.querySelectorAll('.audio-bar');
    const scrubber = bubble.querySelector('.audio-scrubber-dot');
    const track = bubble.querySelector('.audio-waveform-track');
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
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      timer.textContent = durationText || '0:14';
      bars.forEach(b => b.classList.remove('played'));
      if (scrubber) scrubber.style.left = '0%';
    }

    function setProgress(pct) {
      pct = Math.max(0, Math.min(1, pct));
      if (scrubber) scrubber.style.left = `${pct * 100}%`;
      const playedCount = Math.floor(pct * bars.length);
      bars.forEach((b, i) => {
        if (i <= playedCount) b.classList.add('played');
        else b.classList.remove('played');
      });
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        stopPlayback();
      } else {
        isPlaying = true;
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        
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
              setProgress(pct);
            }
          }, 60);

        } else {
          const totalSecs = parseDurationToSeconds(durationText || '0:14');
          const stepMs = (totalSecs * 1000) / bars.length;

          animInterval = setInterval(() => {
            if (progress < bars.length) {
              progress++;
              const pct = progress / bars.length;
              setProgress(pct);
              const cur = Math.floor(pct * totalSecs);
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

    if (track) {
      track.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        setProgress(pct);

        const totalSecs = parseDurationToSeconds(durationText || '0:14');
        const cur = Math.floor(pct * totalSecs);
        const m = Math.floor(cur / 60);
        const s = cur % 60;
        timer.textContent = `${m}:${s < 10 ? '0' + s : s}`;

        if (audioElement && audioElement.duration) {
          audioElement.currentTime = pct * audioElement.duration;
        }
      });
    }
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

    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      type: type,
      content: content,
      time: time,
      ticks: 'blue',
      ...customProps
    };

    chat.messages.push(newMsg);
    bringChatToTop(chat.id);
    saveState();
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
    saveState();

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
      saveState();
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
      bringChatToTop(chat.id);
      saveState();
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
    closeMessageContextMenu();
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
  // HELPERS DE TEMA Y MODO DE VISTA
  // ==========================================
  const SUN_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const CLOUD_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;

  function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'light') {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      if (btnMenuToggleTheme) {
        btnMenuToggleTheme.innerHTML = `${CLOUD_SVG}<span id="theme-toggle-label">Modo oscuro</span>`;
      }
    } else {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      if (btnMenuToggleTheme) {
        btnMenuToggleTheme.innerHTML = `${SUN_SVG}<span id="theme-toggle-label">Modo claro</span>`;
      }
    }
  }

  function applyMode(mode) {
    state.mode = mode;
    if (mode === 'forced-mobile') {
      body.classList.remove('mode-auto');
      body.classList.add('mode-forced-mobile');
      if (viewToggleLabel) viewToggleLabel.textContent = 'Restablecer Vista Automática';
    } else {
      body.classList.remove('mode-forced-mobile');
      body.classList.add('mode-auto');
      if (viewToggleLabel) viewToggleLabel.textContent = 'Forzar Marco Móvil';
    }
  }

  // ==========================================
  // ACCIONES DEL MENÚ GENERAL (SIDEBAR)
  // ==========================================
  btnMenuToggleTheme.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    saveState();
    closeAllDropdowns();
  });

  if (btnMenuToggleView) {
    btnMenuToggleView.addEventListener('click', () => {
      applyMode(state.mode === 'auto' ? 'forced-mobile' : 'auto');
      saveState();
      closeAllDropdowns();
    });
  }

  // ==========================================
  // PANTALLA COMPLETA
  // ==========================================
  function isFullscreenActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }

  function toggleFullscreen() {
    if (!isFullscreenActive()) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  if (btnMenuFullscreen) {
    btnMenuFullscreen.addEventListener('click', () => {
      closeAllDropdowns();
      toggleFullscreen();
    });
  }

  function updateFullscreenUI() {
    if (fullscreenToggleLabel) {
      fullscreenToggleLabel.textContent = isFullscreenActive() ? 'Salir de pantalla completa' : 'Pantalla completa';
    }
  }

  document.addEventListener('fullscreenchange', updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
  document.addEventListener('mozfullscreenchange', updateFullscreenUI);
  document.addEventListener('MSFullscreenChange', updateFullscreenUI);

  btnMenuExportChats.addEventListener('click', () => {
    closeAllDropdowns();
    const dataToExport = {
      chats: state.chats,
      theme: state.theme,
      mode: state.mode
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "whatsapp_chats_backup.whts");
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
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            state.chats = imported;
            saveState();
            selectChat(imported[0].id);
            await showCustomAlert('Importación completada', '¡Chats importados correctamente!');
          } else if (imported && Array.isArray(imported.chats) && imported.chats.length > 0) {
            state.chats = imported.chats;
            if (imported.theme) applyTheme(imported.theme);
            if (imported.mode) applyMode(imported.mode);
            saveState();
            selectChat(imported.chats[0].id);
            await showCustomAlert('Importación completada', '¡Chats importados correctamente!');
          } else {
            await showCustomAlert('Error al importar', 'El archivo no contiene un formato de chats válido.');
          }
        } catch (err) {
          await showCustomAlert('Error al importar', 'El archivo no tiene un formato válido (.whts o JSON).');
        }
        fileImportJson.value = '';
      };
      reader.readAsText(file);
    }
  });

  if (btnMenuResetChats) {
    btnMenuResetChats.addEventListener('click', async () => {
      closeAllDropdowns();
      const ok = await showCustomConfirm(
        'Restablecer por defecto',
        '¿Estás seguro de que quieres restablecer por defecto? Se borrarán todos los chats y contactos.',
        'Restablecer',
        true
      );
      if (ok) {
        state.chats = [];
        state.activeChatId = null;
        saveState();
        selectChat(null);
      }
    });
  }

  // ==========================================
  // ACCIONES DEL MENÚ DEL CHAT ACTIVO
  // ==========================================

  // Fijar / Desfijar Chat (Chincheta)
  btnChatTogglePin.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (chat) {
      chat.isPinned = !chat.isPinned;
      saveState();
      renderActiveHeader();
      renderChatList();
    }
  });

  // Modo selección desde menú del chat
  btnChatSelectMode.addEventListener('click', () => {
    closeAllDropdowns();
    enterSelectionMode();
  });

  // Marcar mensajes sin leer (contador configurable)
  btnChatMarkChatUnread.addEventListener('click', async () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (chat) {
      const input = await showCustomPrompt(
        'Mensajes sin leer',
        'Introduce el número de mensajes sin leer (o 0 para quitar):',
        chat.unreadCount > 0 ? String(chat.unreadCount) : '3',
        'number'
      );
      if (input !== null) {
        const count = parseInt(input.trim(), 10);
        chat.unreadCount = isNaN(count) ? 0 : Math.max(0, count);
        saveState();
        renderChatList();
      }
    }
  });

  // Modal Añadir Separador (Aviso del sistema o Separador de fecha)
  btnChatAddSeparator.addEventListener('click', () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (!chat) return;
    separatorTypeSelect.value = 'encryption';
    separatorTextInput.value = 'Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.';
    separatorPositionSelect.value = 'end';
    separatorModalOverlay.style.display = 'flex';
  });

  separatorTypeSelect.addEventListener('change', () => {
    if (separatorTypeSelect.value === 'encryption') {
      separatorTextInput.value = 'Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.';
    } else {
      separatorTextInput.value = 'HOY';
    }
  });

  btnCloseSeparatorModal.addEventListener('click', () => {
    separatorModalOverlay.style.display = 'none';
  });

  btnCancelSeparatorModal.addEventListener('click', () => {
    separatorModalOverlay.style.display = 'none';
  });

  btnConfirmAddSeparator.addEventListener('click', () => {
    const chat = getActiveChat();
    if (!chat) return;

    const type = separatorTypeSelect.value;
    const text = separatorTextInput.value.trim();
    const position = separatorPositionSelect.value;

    const sepItem = {
      id: (type === 'encryption' ? 'enc-' : 'sep-') + Date.now(),
      type: type === 'encryption' ? 'encryption_notice' : 'date_divider',
      content: text || (type === 'encryption' ? 'Los mensajes y las llamadas están cifrados de extremo a extremo.' : 'HOY')
    };

    if (position === 'start') {
      chat.messages.unshift(sepItem);
    } else {
      chat.messages.push(sepItem);
    }

    saveState();
    separatorModalOverlay.style.display = 'none';
    renderMessages();
  });

  // Vaciar Mensajes
  btnChatClearMsgs.addEventListener('click', async () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (!chat) return;
    const ok = await showCustomConfirm(
      'Vaciar mensajes',
      '¿Estás seguro de que deseas vaciar todos los mensajes de este chat?',
      'Vaciar',
      true
    );
    if (ok) {
      chat.messages = [];
      saveState();
      renderMessages();
      renderChatList();
    }
  });

  // Eliminar Chat / Contacto / Grupo
  btnChatDeleteChat.addEventListener('click', async () => {
    closeAllDropdowns();
    const chat = getActiveChat();
    if (!chat) return;

    const label = chat.type === 'group' ? 'este grupo' : `al contacto "${chat.name}"`;
    const ok = await showCustomConfirm(
      chat.type === 'group' ? 'Eliminar grupo' : 'Eliminar contacto',
      `¿Estás seguro de que deseas eliminar ${label}? Se borrará por completo de la lista.`,
      'Eliminar',
      true
    );
    if (ok) {
      deleteChatOrContact(chat.id);
    }
  });

  function deleteChatOrContact(idToDelete) {
    const deletedChat = state.chats.find(c => c.id === idToDelete);
    if (!deletedChat) return;

    state.chats = state.chats.filter(c => c.id !== idToDelete);

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

    saveState();

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

  btnDeleteContactModal.addEventListener('click', async () => {
    if (state.editingChatId) {
      const ok = await showCustomConfirm(
        'Eliminar contacto',
        '¿Estás seguro de que deseas eliminar este contacto?',
        'Eliminar',
        true
      );
      if (ok) {
        deleteChatOrContact(state.editingChatId);
        contactModalOverlay.style.display = 'none';
      }
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
        messages: [
          {
            id: 'df_' + Date.now(),
            type: 'date_divider',
            content: 'HOY'
          },
          {
            id: 'ef_' + Date.now(),
            type: 'encryption_notice',
            content: 'Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.'
          }
        ],
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

    saveState();
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
    state.tempGroupMemberIds.forEach((contactId) => {
      const contact = getContactById(contactId);
      const name = contact ? contact.name : 'Contacto';

      const chip = document.createElement('div');
      chip.className = 'group-member-chip';
      chip.innerHTML = `
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

  btnDeleteGroupModal.addEventListener('click', async () => {
    if (state.editingChatId) {
      const ok = await showCustomConfirm(
        'Eliminar grupo',
        '¿Estás seguro de que deseas eliminar este grupo?',
        'Eliminar',
        true
      );
      if (ok) {
        deleteChatOrContact(state.editingChatId);
        groupModalOverlay.style.display = 'none';
      }
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
        messages: [
          {
            id: 'dg_' + Date.now(),
            type: 'date_divider',
            content: 'HOY'
          },
          {
            id: 'eg_' + Date.now(),
            type: 'encryption_notice',
            content: 'Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.'
          }
        ],
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

    saveState();
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
        showCustomAlert('Texto requerido', 'Por favor introduce el texto del mensaje de respuesta.');
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
      saveState();
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
  // MOBILE KEYBOARD & VISUAL VIEWPORT RESIZING
  // ==========================================
  function updateViewportHeight() {
    if (window.visualViewport) {
      document.documentElement.style.setProperty('--visual-viewport-height', `${window.visualViewport.height}px`);
    }
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      updateViewportHeight();
      if (document.activeElement === textInput) {
        setTimeout(() => {
          messagesArea.scrollTop = messagesArea.scrollHeight;
          textInput.scrollIntoView({ block: 'nearest' });
        }, 80);
      }
    });
    window.visualViewport.addEventListener('scroll', updateViewportHeight);
  }
  updateViewportHeight();

  textInput.addEventListener('focus', () => {
    setTimeout(() => {
      updateViewportHeight();
      messagesArea.scrollTop = messagesArea.scrollHeight;
      textInput.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 250);
  });

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  loadState();
  applyTheme(state.theme);
  applyMode(state.mode);
  selectChat(state.activeChatId);

});

