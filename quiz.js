// ============================================================
// КВИЗ: всплывающая плашка-приглашение + полноэкранный режим теста
// ============================================================

(function () {
  const STORAGE_DISMISS_KEY = 'quiz_banner_dismissed_at';
  const QUESTIONS_PER_RUN = 8;

  // ---------- DOM: строим всю разметку квиза ----------
  const root = document.createElement('div');
  root.id = 'quiz-root';
  root.innerHTML = `
    <style>
      #quiz-root{
        font-family: var(--sans);
      }

      /* ---------- Плашка-приглашение (cookie-style toast) ---------- */
      #quiz-banner{
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 40;
        width: 340px;
        max-width: calc(100vw - 32px);
        background: var(--panel-bg);
        border: 1px solid var(--line);
        border-radius: 14px;
        backdrop-filter: blur(12px);
        padding: 20px 20px 18px;
        box-shadow: 0 18px 40px rgba(0,0,0,0.35);
        transform: translateY(16px) scale(0.97);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease;
      }
      #quiz-banner.visible{
        transform: translateY(0) scale(1);
        opacity: 1;
        pointer-events: auto;
      }
      #quiz-banner .qb-eyebrow{
        font-family: var(--mono);
        font-size: 10px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent);
        display: block;
        margin-bottom: 8px;
      }
      #quiz-banner h3{
        font-size: 16px;
        font-weight: 600;
        line-height: 1.3;
        margin-bottom: 8px;
      }
      #quiz-banner p{
        font-size: 13px;
        line-height: 1.55;
        color: var(--text-dim);
        margin-bottom: 16px;
      }
      #quiz-banner .qb-actions{
        display: flex;
        gap: 8px;
      }
      #quiz-banner .qb-btn{
        font-family: var(--sans);
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        padding: 9px 14px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: opacity 0.2s, border-color 0.2s, background 0.2s;
      }
      #quiz-banner .qb-btn-primary{
        background: var(--accent);
        color: #fff;
        flex: 1;
      }
      #quiz-banner .qb-btn-primary:hover{ opacity: 0.88; }
      #quiz-banner .qb-btn-secondary{
        background: transparent;
        color: var(--text-dim);
        border-color: var(--line);
      }
      #quiz-banner .qb-btn-secondary:hover{
        border-color: var(--line-strong);
        color: var(--text);
      }
      #quiz-banner .qb-close{
        position: absolute;
        top: 12px; right: 12px;
        width: 24px; height: 24px;
        border: none;
        background: transparent;
        color: var(--text-dim);
        cursor: pointer;
        font-size: 14px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s, color 0.2s;
      }
      #quiz-banner .qb-close:hover{
        background: rgba(255,255,255,0.08);
        color: var(--text);
      }

      /* ---------- Маленькая кнопка-напоминание после закрытия ---------- */
      #quiz-fab{
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 39;
        width: 52px; height: 52px;
        border-radius: 50%;
        background: var(--accent);
        color: #fff;
        border: none;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-family: var(--mono);
        font-size: 18px;
        font-weight: 600;
        box-shadow: 0 10px 26px rgba(123,127,255,0.4);
        transition: transform 0.2s ease;
      }
      #quiz-fab.visible{ display: flex; }
      #quiz-fab:hover{ transform: scale(1.07); }

      /* ---------- Полноэкранный режим теста ---------- */
      #quiz-overlay{
        position: fixed;
        inset: 0;
        z-index: 50;
        background: rgba(8,9,13,0.78);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        padding: 20px;
      }
      #quiz-overlay.visible{
        opacity: 1;
        pointer-events: auto;
      }
      #quiz-card{
        width: 100%;
        max-width: 520px;
        background: var(--panel-bg);
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 32px 32px 28px;
        position: relative;
        transform: translateY(10px);
        transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        max-height: 86vh;
        overflow-y: auto;
      }
      #quiz-overlay.visible #quiz-card{
        transform: translateY(0);
      }
      #quiz-card .quiz-close-btn{
        position: absolute;
        top: 20px; right: 20px;
        width: 32px; height: 32px;
        border: 1px solid var(--line);
        border-radius: 50%;
        background: transparent;
        color: var(--text-dim);
        cursor: pointer;
        font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: border-color 0.2s, color 0.2s;
      }
      #quiz-card .quiz-close-btn:hover{
        border-color: var(--accent);
        color: var(--text);
      }

      .quiz-progress-wrap{
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 22px;
      }
      .quiz-progress-track{
        flex: 1;
        height: 4px;
        border-radius: 4px;
        background: rgba(255,255,255,0.08);
        overflow: hidden;
      }
      .quiz-progress-fill{
        height: 100%;
        background: var(--accent);
        border-radius: 4px;
        width: 0%;
        transition: width 0.35s ease;
      }
      .quiz-progress-label{
        font-family: var(--mono);
        font-size: 11px;
        color: var(--text-dim);
        white-space: nowrap;
      }

      .quiz-eyebrow{
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
        display: block;
        margin-bottom: 10px;
      }

      #quiz-question-text{
        font-size: 19px;
        font-weight: 600;
        line-height: 1.4;
        margin-bottom: 22px;
      }

      #quiz-options{
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 8px;
      }
      .quiz-option{
        text-align: left;
        font-family: var(--sans);
        font-size: 14px;
        color: var(--text);
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 13px 16px;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        line-height: 1.4;
      }
      .quiz-option:hover:not(:disabled){
        border-color: var(--line-strong);
        background: rgba(255,255,255,0.06);
      }
      .quiz-option:disabled{
        cursor: default;
      }
      .quiz-option.correct{
        border-color: #4ade80;
        background: rgba(74,222,128,0.12);
        color: #c8f5d6;
      }
      .quiz-option.incorrect{
        border-color: #f87171;
        background: rgba(248,113,113,0.12);
        color: #fcd4d4;
      }

      #quiz-feedback{
        font-size: 13px;
        line-height: 1.6;
        color: var(--text-dim);
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--line);
        display: none;
      }
      #quiz-feedback.visible{ display: block; }

      #quiz-next-btn{
        margin-top: 20px;
        width: 100%;
        font-family: var(--sans);
        font-size: 14px;
        font-weight: 600;
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 13px 16px;
        cursor: pointer;
        display: none;
        transition: opacity 0.2s;
      }
      #quiz-next-btn:hover{ opacity: 0.88; }
      #quiz-next-btn.visible{ display: block; }

      /* ---------- Результат ---------- */
      #quiz-result{
        display: none;
        text-align: center;
        padding: 12px 0 4px;
      }
      #quiz-result.visible{ display: block; }
      #quiz-result .qr-score{
        font-family: var(--mono);
        font-size: 44px;
        font-weight: 600;
        color: var(--accent);
        margin-bottom: 6px;
      }
      #quiz-result .qr-label{
        font-size: 14px;
        color: var(--text-dim);
        margin-bottom: 24px;
      }
      #quiz-result .qr-actions{
        display: flex;
        gap: 10px;
      }
      #quiz-result .qr-btn{
        flex: 1;
        font-family: var(--sans);
        font-size: 14px;
        font-weight: 600;
        border-radius: 10px;
        padding: 12px 16px;
        cursor: pointer;
        transition: opacity 0.2s, border-color 0.2s;
      }
      #quiz-result .qr-btn-primary{
        background: var(--accent);
        color: #fff;
        border: none;
      }
      #quiz-result .qr-btn-primary:hover{ opacity: 0.88; }
      #quiz-result .qr-btn-secondary{
        background: transparent;
        color: var(--text-dim);
        border: 1px solid var(--line);
      }
      #quiz-result .qr-btn-secondary:hover{ border-color: var(--line-strong); color: var(--text); }

      @media (max-width: 480px){
        #quiz-banner{ left: 16px; right: 16px; width: auto; bottom: 16px; }
        #quiz-fab{ right: 16px; bottom: 16px; }
        #quiz-card{ padding: 26px 20px 22px; }
      }
    </style>

    <div id="quiz-banner" role="dialog" aria-label="Приглашение пройти тест">
      <button class="qb-close" id="quiz-banner-close" aria-label="Закрыть">✕</button>
      <span class="qb-eyebrow">Проверь себя</span>
      <h3>Готов пройти тест по карте?</h3>
      <p>Несколько вопросов по узлам графа — площади, периметры, свойства и связи между фигурами.</p>
      <div class="qb-actions">
        <button class="qb-btn qb-btn-primary" id="quiz-banner-start">Пройти тест</button>
        <button class="qb-btn qb-btn-secondary" id="quiz-banner-later">Позже</button>
      </div>
    </div>

    <button id="quiz-fab" aria-label="Открыть тест" title="Пройти тест">?</button>

    <div id="quiz-overlay">
      <div id="quiz-card" role="dialog" aria-modal="true" aria-label="Тест по карте фигур">
        <button class="quiz-close-btn" id="quiz-card-close" aria-label="Закрыть тест">✕</button>

        <div id="quiz-play-area">
          <div class="quiz-progress-wrap">
            <div class="quiz-progress-track"><div class="quiz-progress-fill" id="quiz-progress-fill"></div></div>
            <span class="quiz-progress-label" id="quiz-progress-label">1 / 8</span>
          </div>
          <span class="quiz-eyebrow">Вопрос</span>
          <div id="quiz-question-text"></div>
          <div id="quiz-options"></div>
          <div id="quiz-feedback"></div>
          <button id="quiz-next-btn">Дальше</button>
        </div>

        <div id="quiz-result">
          <div class="qr-score" id="quiz-score"></div>
          <div class="qr-label" id="quiz-score-label"></div>
          <div class="qr-actions">
            <button class="qr-btn qr-btn-secondary" id="quiz-retry-btn">Пройти ещё раз</button>
            <button class="qr-btn qr-btn-primary" id="quiz-close-result-btn">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // ---------- Элементы ----------
  const banner = document.getElementById('quiz-banner');
  const fab = document.getElementById('quiz-fab');
  const overlay = document.getElementById('quiz-overlay');
  const playArea = document.getElementById('quiz-play-area');
  const resultArea = document.getElementById('quiz-result');

  const progressFill = document.getElementById('quiz-progress-fill');
  const progressLabel = document.getElementById('quiz-progress-label');
  const questionText = document.getElementById('quiz-question-text');
  const optionsWrap = document.getElementById('quiz-options');
  const feedbackBox = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next-btn');

  const scoreEl = document.getElementById('quiz-score');
  const scoreLabelEl = document.getElementById('quiz-score-label');

  // ---------- Состояние теста ----------
  let currentSet = [];
  let currentIndex = 0;
  let correctCount = 0;
  let answered = false;

  function startQuiz() {
    currentSet = (typeof getQuizSet === 'function') ? getQuizSet(QUESTIONS_PER_RUN) : [];
    currentIndex = 0;
    correctCount = 0;
    answered = false;

    if (!currentSet.length) {
      questionText.textContent = 'Вопросы пока не готовы — добавь данных в граф.';
      optionsWrap.innerHTML = '';
      return;
    }

    playArea.style.display = 'block';
    resultArea.classList.remove('visible');
    openOverlay();
    renderQuestion();
  }

  function renderQuestion() {
    const q = currentSet[currentIndex];
    answered = false;
    feedbackBox.classList.remove('visible');
    feedbackBox.textContent = '';
    nextBtn.classList.remove('visible');

    progressLabel.textContent = `${currentIndex + 1} / ${currentSet.length}`;
    progressFill.style.width = `${((currentIndex) / currentSet.length) * 100}%`;

    questionText.textContent = q.question;
    optionsWrap.innerHTML = '';

    q.options.forEach((optionText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = optionText;
      btn.addEventListener('click', () => handleAnswer(idx, btn));
      optionsWrap.appendChild(btn);
    });
  }

  function handleAnswer(selectedIdx, btnEl) {
    if (answered) return;
    answered = true;

    const q = currentSet[currentIndex];
    const allBtns = Array.from(optionsWrap.querySelectorAll('.quiz-option'));
    allBtns.forEach(b => b.disabled = true);

    const isCorrect = selectedIdx === q.correctIndex;
    if (isCorrect) {
      correctCount++;
      btnEl.classList.add('correct');
    } else {
      btnEl.classList.add('incorrect');
      allBtns[q.correctIndex].classList.add('correct');
    }

    progressFill.style.width = `${((currentIndex + 1) / currentSet.length) * 100}%`;

    if (q.explanation) {
      feedbackBox.textContent = q.explanation;
      feedbackBox.classList.add('visible');
    }

    nextBtn.textContent = (currentIndex === currentSet.length - 1) ? 'Показать результат' : 'Дальше';
    nextBtn.classList.add('visible');
  }

  nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= currentSet.length) {
      showResult();
    } else {
      renderQuestion();
    }
  });

  function showResult() {
    playArea.style.display = 'none';
    resultArea.classList.add('visible');

    const total = currentSet.length;
    scoreEl.textContent = `${correctCount} / ${total}`;

    let label;
    const ratio = correctCount / total;
    if (ratio === 1) label = 'Все верно — отличное знание карты.';
    else if (ratio >= 0.7) label = 'Хороший результат, почти всё точно.';
    else if (ratio >= 0.4) label = 'Неплохо, но есть что подучить.';
    else label = 'Стоит пройтись по карте ещё раз.';
    scoreLabelEl.textContent = label;
  }

  document.getElementById('quiz-retry-btn').addEventListener('click', () => {
    startQuiz();
  });
  document.getElementById('quiz-close-result-btn').addEventListener('click', closeOverlay);

  // ---------- Управление плашкой / FAB / overlay ----------
  function openOverlay() {
    overlay.classList.add('visible');
  }
  function closeOverlay() {
    overlay.classList.remove('visible');
  }

  function showBanner() {
    banner.classList.add('visible');
  }
  function hideBanner() {
    banner.classList.remove('visible');
  }
  function showFab() {
    fab.classList.add('visible');
  }
  function hideFab() {
    fab.classList.remove('visible');
  }

  document.getElementById('quiz-banner-start').addEventListener('click', () => {
    hideBanner();
    hideFab();
    startQuiz();
  });

  document.getElementById('quiz-banner-later').addEventListener('click', () => {
    hideBanner();
    showFab();
    try { sessionStorage.setItem(STORAGE_DISMISS_KEY, String(Date.now())); } catch (e) {}
  });

  document.getElementById('quiz-banner-close').addEventListener('click', () => {
    hideBanner();
    showFab();
    try { sessionStorage.setItem(STORAGE_DISMISS_KEY, String(Date.now())); } catch (e) {}
  });

  fab.addEventListener('click', () => {
    hideFab();
    startQuiz();
  });

  document.getElementById('quiz-card-close').addEventListener('click', () => {
    closeOverlay();
    showFab();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay();
      showFab();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      closeOverlay();
      showFab();
    }
  });

  // ---------- Показ плашки при загрузке страницы ----------
  // Появляется сразу (с небольшой задержкой ради плавности), один раз за сессию.
  let alreadyDismissedThisSession = false;
  try {
    alreadyDismissedThisSession = !!sessionStorage.getItem(STORAGE_DISMISS_KEY);
  } catch (e) {}

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (alreadyDismissedThisSession) {
        showFab();
      } else {
        showBanner();
      }
    }, 900);
  });

  // На случай если DOMContentLoaded уже прошёл к моменту выполнения скрипта
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
      if (alreadyDismissedThisSession) {
        showFab();
      } else {
        showBanner();
      }
    }, 900);
  }

})();