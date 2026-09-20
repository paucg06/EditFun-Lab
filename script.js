const pupilLeft = document.getElementById('yt-pupil-left');
    const pupilRight = document.getElementById('yt-pupil-right');
    const eyeLeft = document.getElementById('yt-eye-left');
    const eyeRight = document.getElementById('yt-eye-right');
    const eyelidLeft = document.getElementById('eyelid-left');
    const eyelidRight = document.getElementById('eyelid-right');
    const eyeBadge = document.getElementById('yt-eye-badge');

    document.addEventListener('mousemove', (e) => {
      const rect = eyeBadge.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const maxDistance = rect.height * 0.13;

      const dx = Math.cos(angle) * maxDistance;
      const dy = Math.sin(angle) * maxDistance;

      pupilLeft.style.transform = `translate(${dx}px, ${dy}px)`;
      pupilRight.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    function doBlink() {
      eyelidLeft.style.height = '100%';
      eyelidRight.style.height = '100%';
      setTimeout(() => {
        eyelidLeft.style.height = '0%';
        eyelidRight.style.height = '0%';
      }, 130);
    }

    function doHalfClose() {
      eyeLeft.classList.add('half-closed');
      eyeRight.classList.add('half-closed');
      setTimeout(() => {
        eyeLeft.classList.remove('half-closed');
        eyeRight.classList.remove('half-closed');
      }, 750 + Math.random() * 400);
    }

    function scheduleNextEyeAction() {
      const delay = 2200 + Math.random() * 3000;
      setTimeout(() => {
        const rand = Math.random();
        if (rand < 0.65) {
          doBlink();
        } else if (rand < 0.88) {
          doHalfClose();
        } else {
          doBlink();
          setTimeout(doBlink, 200);
        }
        scheduleNextEyeAction();
      }, delay);
    }
    scheduleNextEyeAction();

    eyeBadge.addEventListener('click', () => {
      doBlink();
      setTimeout(doHalfClose, 180);
    });

    let toastTimeout;
    function showToast(msg) {
      const toast = document.getElementById('toast-msg');
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    const homeWaTime = document.getElementById('home-wa-time');
    if (homeWaTime) {
      const now = new Date();
      homeWaTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
