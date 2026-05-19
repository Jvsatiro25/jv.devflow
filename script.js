/* ── LOADING SCREEN ── */
(function () {
    const screen  = document.getElementById('loading-screen');
    const logoImg = document.getElementById('loading-logo-img');
    if (!screen || !logoImg) return;

    document.body.style.overflow = 'hidden';

    // p: 0 → 100
    function applyProgress(p) {
        const t = p / 100;
        // grayscale: 1 (fully grey) → 0 (full color)
        const grey = 1 - t;
        // brightness: starts at 0.5 (dark/muted), reaches 1.0 at 100%
        const brightness = 0.5 + t * 0.5;
        // glow kicks in after 50%: 0 → 30px
        const glow = t > 0.5 ? ((t - 0.5) * 2) * 30 : 0;
        const glowAlpha = t > 0.5 ? ((t - 0.5) * 2) * 0.8 : 0;

        logoImg.style.filter = [
            `grayscale(${grey})`,
            `brightness(${brightness})`,
            glow > 0 ? `drop-shadow(0 0 ${glow.toFixed(1)}px rgba(102,0,255,${glowAlpha.toFixed(2)}))` : ''
        ].filter(Boolean).join(' ');
    }

    applyProgress(0);

    let sim = 0;
    const simInterval = setInterval(() => {
        const inc = sim < 40 ? 0.7
                  : sim < 65 ? 0.35
                  : sim < 80 ? 0.12
                  : 0;
        sim = Math.min(sim + inc, 80);
        applyProgress(sim);
    }, 80);

    function finish() {
        clearInterval(simInterval);
        let val = sim;
        const fillInterval = setInterval(() => {
            val += 1;
            applyProgress(val);
            if (val >= 100) {
                clearInterval(fillInterval);
                setTimeout(() => {
                    screen.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 600);
            }
        }, 22);
    }

    if (document.readyState === 'complete') {
        setTimeout(finish, 400);
    } else {
        window.addEventListener('load', () => setTimeout(finish, 400));
        setTimeout(finish, 7000);
    }
})();

/* ── HAMBURGER ── */
const menuToggle = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

/* ── PROJECTS DATA ── */
const projects = [
    {
        title: "__CHAT_CARD__",
        desc: "",
        tags: []
    },
    {
        title: "__FINANCE_CARD__",
        desc: "",
        tags: []
    },
    {
        title: "__FORM_CARD__",
        desc: "",
        tags: []
    }
];

/* ── CANVAS ── */
const canvas = document.getElementById("hero-lightpass");
const ctx = canvas.getContext("2d");
const frameCount = 99;
const getFrameSrc = i => `./IMG/img${i}.png`;

const images = [];
for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = getFrameSrc(i);
    images.push(img);
}

let currentFrameIndex = 1;

function drawFrame(idx) {
    const img = images[idx - 1];
    if (!img || !img.complete) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const ir = img.width / img.height;
    const cr = w / h;
    let rw, rh, x, y;
    if (cr > ir) { rw = w; rh = rw / ir; x = 0; y = (h - rh) / 2; }
    else { rh = h; rw = rh * ir; y = 0; x = (w - rw) / 2; }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, x, y, rw, rh);
    currentFrameIndex = idx;
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    drawFrame(currentFrameIndex);
}

window.addEventListener('resize', resizeCanvas);
if (images[0]) {
    images[0].onload = resizeCanvas;
}

function getTargetFrame(cardIndex) {
    const total = projects.length - 1;
    return Math.round(1 + (cardIndex / total) * (frameCount - 1));
}

function animateFrames(start, target, onDone) {
    const totalSteps = 18;
    let step = 0;
    const iv = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        const next = Math.round(start + (target - start) * progress);
        drawFrame(Math.min(Math.max(next, 1), frameCount));
        if (step >= totalSteps) {
            clearInterval(iv);
            if (onDone) onDone(target);
        }
    }, 30);
}

/* ── SLIDER ── */
let activeIndex = 0;
let isAnimating = false;

const cardContent = document.getElementById('card-content');
const cardTitle   = document.getElementById('card-title');
const cardDesc    = document.getElementById('card-desc');
const cardTagsEl  = document.getElementById('card-tags');
const dotsEl      = document.getElementById('dots');

if (dotsEl) {
    projects.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
    });
}

function renderCard(idx) {
    if (!cardTitle || !cardDesc || !cardTagsEl) return;
    const p = projects[idx];

    if (p.title === "__CHAT_CARD__") {
        const cardBody = document.querySelector('.card-body');
        if (!cardBody) return;
        cardBody.innerHTML = `<div class="chat-card-ui" id="chat-card-ui"></div>`;
        initChatCard();
        return;
    }

    if (p.title === "__FINANCE_CARD__") {
        const cardBody = document.querySelector('.card-body');
        if (!cardBody) return;
        cardBody.innerHTML = `<div class="chat-card-ui" id="chat-card-ui"></div>`;
        initFinanceCard();
        return;
    }

    if (p.title === "__FORM_CARD__") {
        const cardBody = document.querySelector('.card-body');
        if (!cardBody) return;
        cardBody.innerHTML = `<div class="chat-card-ui" id="form-card-ui"></div>`;
        initFormCard();
        return;
    }

    // Cleanup any active card UI
    ['chat-card-ui', 'form-card-ui'].forEach(id => {
        const prevUi = document.getElementById(id);
        if (prevUi && prevUi._cleanup) prevUi._cleanup();
    });

    // Restore normal card layout if switching away from chat card
    const cardBody = document.querySelector('.card-body');
    if (cardBody && !cardBody.querySelector('#card-content')) {
        cardBody.innerHTML = `
            <div class="card-content" id="card-content">
                <div class="card-title-text" id="card-title"></div>
                <div class="card-desc-text" id="card-desc"></div>
                <div class="card-tags-wrap" id="card-tags"></div>
            </div>`;
    }
    const t = document.getElementById('card-title');
    const d = document.getElementById('card-desc');
    const tg = document.getElementById('card-tags');
    if (t) t.textContent = p.title;
    if (d) d.textContent = p.desc;
    if (tg) tg.innerHTML = p.tags.map(t => `<span>${t}</span>`).join(' ');
}

function initChatCard() {
    const ui = document.getElementById('chat-card-ui');
    if (!ui) return;

    // Conversation script: right = user, left = professor
    const conversation = [
        { side: 'right', text: 'Olá! Pode me ajudar hoje?' },
        { side: 'left',  text: 'Claro, João! O que você precisa?📚✍' },
        { side: 'right', text: 'Resuma o capítulo 5 do livro desse semestre' },
        { side: 'left',  text: 'O capítulo 5 do livro aborda os mecanismos... Ler mais' },
        { side: 'right', text: 'Obrigado professor!' },
        { side: 'left',  text: 'Fico feliz em ajudar! 😊' },
    ];

    const keyRows = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['z','x','c','v','b','n','m','⌫'],
        ['espaço']
    ];

    // Build keyboard HTML
    function buildKeyboard() {
        return `<div class="chat-keyboard" id="chat-keyboard">
            ${keyRows.map(row => `
                <div class="kb-row">
                    ${row.map(k => `<button class="kb-key${k==='espaço'?' kb-space':k==='⌫'?' kb-back':''}" data-key="${k}">${k}</button>`).join('')}
                </div>`).join('')}
        </div>`;
    }

    ui.innerHTML = `
      <div class="chat-header-bar">
        <div class="chat-avatar"></div>
        <div class="chat-header-info">
          <span class="chat-name">Professor Virtual</span>
          <span class="chat-status" id="chat-status-txt">online</span>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-row">
        <div class="chat-input-field" id="chat-input-field"><span class="chat-cursor">|</span></div>
        <button class="chat-send-btn" id="chat-send-btn">➤</button>
      </div>
      ${buildKeyboard()}`;

    const messagesEl  = document.getElementById('chat-messages');
    const inputField  = document.getElementById('chat-input-field');
    const statusTxt   = document.getElementById('chat-status-txt');
    let msgIndex = 0;
    let chatTimer = null;

    function getTime() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    }

    function scrollBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addBubble(side, text) {
        const b = document.createElement('div');
        b.className = `chat-bubble ${side}`;
        b.style.opacity = '0';
        b.style.transform = 'translateY(6px)';
        b.innerHTML = `<span class="bubble-text">${text}</span><span class="bubble-time">${getTime()}</span>`;
        messagesEl.appendChild(b);
        scrollBottom();
        requestAnimationFrame(() => {
            b.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            b.style.opacity = '1';
            b.style.transform = 'translateY(0)';
        });
    }

    function showTypingIndicator() {
        const t = document.createElement('div');
        t.className = 'chat-bubble left typing-indicator';
        t.id = 'typing-ind';
        t.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span>`;
        messagesEl.appendChild(t);
        scrollBottom();
        return t;
    }

    function setInputText(txt) {
        inputField.innerHTML = `${txt}<span class="chat-cursor">|</span>`;
    }

    function highlightKey(key) {
        const kb = document.getElementById('chat-keyboard');
        if (!kb) return;
        kb.querySelectorAll('.kb-key').forEach(btn => {
            const k = btn.dataset.key;
            const match = key === ' ' ? k === 'espaço' : k === key.toLowerCase();
            btn.classList.toggle('kb-active', match);
        });
        setTimeout(() => {
            kb.querySelectorAll('.kb-key').forEach(b => b.classList.remove('kb-active'));
        }, 120);
    }

    // Type a message letter by letter, then trigger send
    function typeMessage(text, onDone) {
        let i = 0;
        let current = '';
        function typeNext() {
            if (i >= text.length) {
                onDone();
                return;
            }
            const ch = text[i];
            current += ch;
            setInputText(current);
            highlightKey(ch === ' ' ? ' ' : ch);
            i++;
            chatTimer = setTimeout(typeNext, 80 + Math.random() * 60);
        }
        typeNext();
    }

    // Clear input with backspace animation then send
    function sendMessage(text, onDone) {
        const b = document.getElementById('chat-keyboard');
        if (b) b.querySelectorAll('.kb-key').forEach(k => k.classList.remove('kb-active'));
        // Flash send button
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) { sendBtn.classList.add('kb-active'); setTimeout(() => sendBtn.classList.remove('kb-active'), 200); }
        addBubble('right', text);
        setInputText('');
        chatTimer = setTimeout(onDone, 400);
    }

    // Professor typing then replies
    function professorReply(text, onDone) {
        statusTxt.textContent = 'digitando...';
        const ind = showTypingIndicator();
        const delay = 600 + text.length * 30;
        chatTimer = setTimeout(() => {
            ind.remove();
            statusTxt.textContent = 'online';
            addBubble('left', text);
            chatTimer = setTimeout(onDone, 600);
        }, delay);
    }

    // Main loop — runs through conversation pairs
    function runStep(idx) {
        if (idx >= conversation.length) {
            // Loop after pause
            chatTimer = setTimeout(() => {
                messagesEl.innerHTML = '';
                runStep(0);
            }, 2500);
            return;
        }

        const msg = conversation[idx];

        if (msg.side === 'right') {
            // User types
            chatTimer = setTimeout(() => {
                typeMessage(msg.text, () => {
                    chatTimer = setTimeout(() => {
                        sendMessage(msg.text, () => runStep(idx + 1));
                    }, 350);
                });
            }, 400);
        } else {
            // Professor replies
            professorReply(msg.text, () => runStep(idx + 1));
        }
    }

    runStep(0);

    // Cleanup on card change
    ui._cleanup = () => {
        if (chatTimer) clearTimeout(chatTimer);
    };
}

/* ── FINANCE CARD (Work Slide 2) ── */
function initFinanceCard() {
    const ui = document.getElementById('chat-card-ui');
    if (!ui) return;

    // conversation: right = church member, left = financial assistant bot
    const conversation = [
        { side: 'right', type: 'image', text: '🧾', label: 'comprovante_pix.jpg' },
        { side: 'left',  type: 'text',  text: 'Para o registro, informe a categoria da contribuição 😊🤖' },
        { side: 'right', type: 'text',  text: 'Oferta' },
        { side: 'left',  type: 'text',  text: '✅ Pix confirmado! Obrigado!' },
    ];

    const keyRows = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['z','x','c','v','b','n','m','⌫'],
        ['espaço']
    ];

    function buildKeyboard() {
        return `<div class="chat-keyboard" id="chat-keyboard">
            ${keyRows.map(row => `
                <div class="kb-row">
                    ${row.map(k => `<button class="kb-key${k==='espaço'?' kb-space':k==='⌫'?' kb-back':''}" data-key="${k}">${k}</button>`).join('')}
                </div>`).join('')}
        </div>`;
    }

    ui.innerHTML = `
      <div class="chat-header-bar">
        <div class="chat-avatar fin-avatar"></div>
        <div class="chat-header-info">
          <span class="chat-name">Assistente Financeiro</span>
          <span class="chat-status" id="chat-status-txt">online</span>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-row">
        <div class="chat-input-field" id="chat-input-field"><span class="chat-cursor">|</span></div>
        <button class="chat-send-btn" id="chat-send-btn">➤</button>
      </div>
      ${buildKeyboard()}`;

    const messagesEl = document.getElementById('chat-messages');
    const inputField = document.getElementById('chat-input-field');
    const statusTxt  = document.getElementById('chat-status-txt');
    let chatTimer = null;

    function getTime() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    }
    function scrollBottom() { messagesEl.scrollTop = messagesEl.scrollHeight; }

    function addBubble(side, msg) {
        const b = document.createElement('div');
        b.className = `chat-bubble ${side}`;
        b.style.opacity = '0';
        b.style.transform = 'translateY(6px)';
        if (msg.type === 'image') {
            b.innerHTML = `<div class="fin-pix-thumb">
                <div class="fin-pix-icon">📄</div>
                <div class="fin-pix-info"><span class="fin-pix-name">${msg.label}</span><span class="fin-pix-size">32 KB · Imagem</span></div>
            </div><span class="bubble-time">${getTime()}</span>`;
        } else {
            b.innerHTML = `<span class="bubble-text">${msg.text}</span><span class="bubble-time">${getTime()}</span>`;
        }
        messagesEl.appendChild(b);
        scrollBottom();
        requestAnimationFrame(() => {
            b.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            b.style.opacity = '1';
            b.style.transform = 'translateY(0)';
        });
    }

    function showTypingIndicator() {
        const t = document.createElement('div');
        t.className = 'chat-bubble left typing-indicator';
        t.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span>`;
        messagesEl.appendChild(t);
        scrollBottom();
        return t;
    }

    function setInputText(txt) {
        inputField.innerHTML = `${txt}<span class="chat-cursor">|</span>`;
    }

    function highlightKey(key) {
        const kb = document.getElementById('chat-keyboard');
        if (!kb) return;
        kb.querySelectorAll('.kb-key').forEach(btn => {
            const k = btn.dataset.key;
            const match = key === ' ' ? k === 'espaço' : k === key.toLowerCase();
            btn.classList.toggle('kb-active', match);
        });
        setTimeout(() => {
            kb.querySelectorAll('.kb-key').forEach(b => b.classList.remove('kb-active'));
        }, 120);
    }

    function typeMessage(text, onDone) {
        let i = 0; let current = '';
        function typeNext() {
            if (i >= text.length) { onDone(); return; }
            const ch = text[i]; current += ch;
            setInputText(current);
            highlightKey(ch === ' ' ? ' ' : ch);
            i++;
            chatTimer = setTimeout(typeNext, 80 + Math.random() * 60);
        }
        typeNext();
    }

    function sendMessage(msg, onDone) {
        const kb = document.getElementById('chat-keyboard');
        if (kb) kb.querySelectorAll('.kb-key').forEach(k => k.classList.remove('kb-active'));
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) { sendBtn.classList.add('kb-active'); setTimeout(() => sendBtn.classList.remove('kb-active'), 200); }
        addBubble('right', msg);
        setInputText('');
        chatTimer = setTimeout(onDone, 400);
    }

    function botReply(msg, onDone) {
        statusTxt.textContent = 'digitando...';
        const ind = showTypingIndicator();
        const delay = 700 + msg.text.length * 28;
        chatTimer = setTimeout(() => {
            ind.remove();
            statusTxt.textContent = 'online';
            addBubble('left', msg);
            chatTimer = setTimeout(onDone, 600);
        }, delay);
    }

    function runStep(idx) {
        if (idx >= conversation.length) {
            chatTimer = setTimeout(() => { messagesEl.innerHTML = ''; runStep(0); }, 2500);
            return;
        }
        const msg = conversation[idx];
        if (msg.side === 'right') {
            if (msg.type === 'image') {
                // show image bubble directly (no typing)
                chatTimer = setTimeout(() => {
                    sendMessage(msg, () => runStep(idx + 1));
                }, 600);
            } else {
                chatTimer = setTimeout(() => {
                    typeMessage(msg.text, () => {
                        chatTimer = setTimeout(() => {
                            sendMessage(msg, () => runStep(idx + 1));
                        }, 350);
                    });
                }, 400);
            }
        } else {
            botReply(msg, () => runStep(idx + 1));
        }
    }

    runStep(0);
    ui._cleanup = () => { if (chatTimer) clearTimeout(chatTimer); };
}

/* ── FORM CARD (Work Slide 3) ── */
function initFormCard() {
    const ui = document.getElementById('form-card-ui');
    if (!ui) return;

    const formFields = [
        { label: 'Assessor',  value: 'João Victor' },
        { label: 'Nome',      value: 'Maria Silva' },
        { label: 'Endereço',  value: 'Rua das Flores, 42' },
        { label: 'Assunto',   value: 'Iluminção' },
    ];

    const sheetRows = [
        { assessor: 'Carlos Mendes', nome: 'Maria Silva', endereco: 'Rua das Flores, 42', assunto: 'Iluminação', status: 'pendente' },
        { assessor: 'Ana Costa',     nome: 'João Pereira', endereco: 'Av. Central, 100',   assunto: 'Instalação elétrica', status: 'concluido' },
        { assessor: 'Pedro Lima',    nome: 'Lucia Ramos',  endereco: 'Trav. Verde, 8',      assunto: 'Pintura de fachada',  status: 'concluido' },
    ];

    const keyRows = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['z','x','c','v','b','n','m','⌫'],
        ['espaço']
    ];

    function buildKeyboard() {
        return `<div class="form-keyboard" id="form-keyboard">
            ${keyRows.map(row => `
                <div class="kb-row">
                    ${row.map(k => `<button class="kb-key${k==='espaço'?' kb-space':k==='⌫'?' kb-back':''}" data-key="${k}">${k}</button>`).join('')}
                </div>`).join('')}
        </div>`;
    }

    function buildForm() {
        return `
        <div class="fcard-form" id="fcard-form">
          <div class="fcard-form-header">
            <span class="fcard-form-icon">📋</span>
            <span class="fcard-form-title">Formulário de Demanda</span>
          </div>
          <div class="fcard-fields" id="fcard-fields">
            ${formFields.map((f, i) => `
              <div class="fcard-field" id="fcard-field-${i}">
                <label class="fcard-label">${f.label}</label>
                <div class="fcard-input ${i === 0 ? 'fcard-input-active' : ''}" id="fcard-input-${i}"><span class="chat-cursor">|</span></div>
              </div>`).join('')}
          </div>
          <button class="fcard-submit" id="fcard-submit">Enviar →</button>
        </div>
        ${buildKeyboard()}`;
    }

    function buildSheet() {
        return `
        <div class="fcard-sheet" id="fcard-sheet">
          <div class="fcard-sheet-header">
            <span class="fcard-form-icon">📊</span>
            <span class="fcard-form-title">Planilha de Demandas</span>
          </div>
          <div class="fcard-table-wrap">
            <table class="fcard-table">
              <thead>
                <tr>
                  <th>Assessor</th><th>Nome</th><th>Assunto</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${sheetRows.map((r, i) => `
                  <tr class="${i === 0 ? 'fcard-row-new' : ''}">
                    <td>${r.assessor}</td>
                    <td>${r.nome}</td>
                    <td>${r.assunto}</td>
                    <td><button class="fcard-status-btn ${r.status === 'concluido' ? 'fcard-status-done' : 'fcard-status-pending'}" data-row="${i}">
                      ${r.status === 'concluido' ? '✓' : '●'}
                    </button></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="fcard-legend">
            <span class="fcard-legend-dot fcard-status-pending">●</span> Em andamento
            <span class="fcard-legend-dot fcard-status-done" style="margin-left:10px">✓</span> Concluído
          </div>
        </div>`;
    }

    ui.innerHTML = buildForm();

    let formTimer = null;
    let currentField = 0;
    let currentChar = 0;
    let phase = 'form'; // 'form' | 'sheet'

    function highlightKey(key) {
        const kb = document.getElementById('form-keyboard');
        if (!kb) return;
        kb.querySelectorAll('.kb-key').forEach(btn => {
            const k = btn.dataset.key;
            const match = key === ' ' ? k === 'espaço' : k === key.toLowerCase();
            btn.classList.toggle('kb-active', match);
        });
        setTimeout(() => {
            if (kb) kb.querySelectorAll('.kb-key').forEach(b => b.classList.remove('kb-active'));
        }, 120);
    }

    function setFieldText(fieldIdx, txt) {
        const inp = document.getElementById(`fcard-input-${fieldIdx}`);
        if (inp) inp.innerHTML = `${txt}<span class="chat-cursor">|</span>`;
    }

    function typeField(fieldIdx, onDone) {
        const text = formFields[fieldIdx].value;
        let i = 0;
        function typeNext() {
            if (i >= text.length) { onDone(); return; }
            const ch = text[i];
            setFieldText(fieldIdx, text.slice(0, i + 1));
            highlightKey(ch === ' ' ? ' ' : ch);
            i++;
            formTimer = setTimeout(typeNext, 75 + Math.random() * 55);
        }
        typeNext();
    }

    function activateField(idx) {
        document.querySelectorAll('.fcard-input').forEach((el, i) => {
            el.classList.toggle('fcard-input-active', i === idx);
        });
        // scroll the card so the active field is visible
        const cardUi = document.getElementById('form-card-ui');
        const field  = document.getElementById(`fcard-field-${idx}`);
        if (cardUi && field) {
            const fieldBottom = field.offsetTop + field.offsetHeight;
            cardUi.scrollTo({ top: fieldBottom - cardUi.clientHeight + 10, behavior: 'smooth' });
        }
    }

    function runFormStep(idx) {
        if (idx >= formFields.length) {
            // flash submit button then switch to sheet
            const btn = document.getElementById('fcard-submit');
            if (btn) { btn.classList.add('fcard-submit-active'); }
            formTimer = setTimeout(() => {
                phase = 'sheet';
                ui.innerHTML = buildSheet();
                attachSheetListeners();
                formTimer = setTimeout(() => {
                    ui.innerHTML = buildForm();
                    phase = 'form';
                    currentField = 0;
                    currentChar = 0;
                    formTimer = setTimeout(() => runFormStep(0), 600);
                }, 4000);
            }, 700);
            return;
        }
        activateField(idx);
        formTimer = setTimeout(() => {
            typeField(idx, () => {
                formTimer = setTimeout(() => runFormStep(idx + 1), 400);
            });
        }, idx === 0 ? 400 : 200);
    }

    function attachSheetListeners() {
        document.querySelectorAll('.fcard-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('fcard-status-done');
                btn.classList.toggle('fcard-status-pending');
                btn.textContent = btn.classList.contains('fcard-status-done') ? '✓' : '●';
            });
        });
        // auto-toggle the first (new) row after 1.2s to demo the interaction
        formTimer = setTimeout(() => {
            const firstBtn = document.querySelector('.fcard-row-new .fcard-status-btn');
            if (firstBtn && firstBtn.classList.contains('fcard-status-pending')) {
                firstBtn.classList.remove('fcard-status-pending');
                firstBtn.classList.add('fcard-status-done');
                firstBtn.textContent = '✓';
            }
        }, 1200);
    }

    runFormStep(0);
    ui._cleanup = () => { if (formTimer) clearTimeout(formTimer); };
}


function updateDots() {
    document.querySelectorAll('.dot').forEach((d, i) =>
        d.classList.toggle('active', i === activeIndex));
}

function goTo(newIndex) {
    if (isAnimating || newIndex === activeIndex) return;
    isAnimating = true;

    const targetFrame = getTargetFrame(newIndex);
    if (cardContent) cardContent.classList.add('leaving');

    setTimeout(() => {
        activeIndex = newIndex;
        renderCard(activeIndex);
        updateDots();
        animateFrames(currentFrameIndex, targetFrame, () => {
            if (cardContent) {
                cardContent.classList.remove('leaving');
                cardContent.classList.add('entering');
                void cardContent.offsetWidth;
                cardContent.classList.remove('entering');
            }
            isAnimating = false;
        });
    }, 250);
}

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

if (btnPrev) {
    btnPrev.addEventListener('click', () =>
        goTo((activeIndex - 1 + projects.length) % projects.length));
}

if (btnNext) {
    btnNext.addEventListener('click', () =>
        goTo((activeIndex + 1) % projects.length));
}

renderCard(0);

/* ── STACK SECTION — Peek Stacking Cards on Scroll ── */
(function () {
    const section    = document.getElementById('section-stack');
    const cards      = Array.from(document.querySelectorAll('.sk-card'));
    const totalCards = cards.length;

    if (!section || totalCards === 0) return;

    // Add peek strip to each card
    const peekTitles = ['IA', 'Automação', 'Front-End', 'Back-End'];
    cards.forEach((card, i) => {
        const peek = document.createElement('div');
        peek.className = 'sk-peek';
        peek.innerHTML = `<span class="sk-peek-title">${peekTitles[i] || ''}</span>`;
        card.insertBefore(peek, card.firstChild);
    });

    const PEEK_HEIGHT = 48; // px shown of each card behind

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function updateStack() {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrolled = -rect.top;
        const maxScroll = section.offsetHeight - windowHeight;

        let progress = Math.min(Math.max(scrolled / maxScroll, 0), 1);

        // Each card gets an equal share of scroll progress
        const step = 1 / totalCards;

        cards.forEach((card, i) => {
            // How far this card has come in (0 = not started, 1 = fully in)
            const rawP = (progress - i * step) / step;
            const p = Math.min(Math.max(rawP, 0), 1);
            const ease = easeOut(p);

            // Cards behind sit offset by PEEK_HEIGHT * their position in stack
            // Card 0: sits at top. Card 1: peeks PEEK_HEIGHT below card 0 top. Etc.
            // When fully arrived, each card sits at its peek offset from top
            const peekOffset = i * PEEK_HEIGHT;
            // translateY: starts below viewport (100%), lands at peekOffset
            const cardH = card.offsetHeight || 300;
            const finalY = peekOffset;
            const startY = cardH + peekOffset;
            const translateY = startY - ease * (startY - finalY);

            // Cards get slightly scaled down as more stack on top
            const cardsOnTop = Math.max(0, totalCards - 1 - i);
            const baseScale = 1 - cardsOnTop * 0.025;
            // As next card arrives, scale this card down a tiny bit more
            const nextRaw = (progress - (i + 1) * step) / step;
            const nextP = Math.min(Math.max(nextRaw, 0), 1);
            const scale = baseScale - easeOut(nextP) * 0.025;

            card.style.transform = `translateY(${translateY}px) scale(${scale})`;
            card.style.opacity = p > 0 ? 1 : 0;
            card.style.zIndex = i + 1;
        });
    }

    // Footer reveal: no mobile aparece mais cedo (75%), no desktop mais tarde (92%)
    const footer = document.getElementById('footer');
    function updateFooter() {
        if (!footer) return;
        const rect = section.getBoundingClientRect();
        const scrolled = -rect.top;
        const maxScroll = section.offsetHeight - window.innerHeight;
        const progress = Math.min(Math.max(scrolled / maxScroll, 0), 1);
        const isMobile = window.innerWidth <= 767;
        const threshold = isMobile ? 0.92 : 0.92;
        if (progress >= threshold) {
            footer.classList.add('footer-visible');
        } else {
            footer.classList.remove('footer-visible');
        }
    }

    window.addEventListener('scroll', () => { updateStack(); updateFooter(); }, { passive: true });
    window.addEventListener('resize', () => { updateStack(); updateFooter(); }, { passive: true });
    updateStack();
    updateFooter();
})();
