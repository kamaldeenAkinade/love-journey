/**************
 * QUICK PERSONALIZATION (EDIT THESE)
 **************/
const WIFE_NAME = "Arike mi";          // e.g. "Aisha"
const YOUR_NAME = "Kamaldeen";     // e.g. "Kamaldeen"
const ANNIVERSARY_LABEL = "24th";     // what you want to show in the top right

// Scenes content (EDIT THESE to your real words)
const INTRO_LINES = [
    `Assalamu alaikum ${WIFE_NAME}…`,
    `If you’re reading this, it means you’ve entered the little world I made for you.`,
    `I wanted you to feel something deeper than “Happy Anniversary”.`,
    `So I built you a journey—`,
    `A journey of love, reassurance, duas, and surprises.`,
    ``,
    `Whenever life feels noisy, come back to this page…`,
    `And remember: you are safe with me. Always.`,
    ``,
    `— ${YOUR_NAME}`
];

const MEMORY_FLASHBACK = `I still remember the softness of that day…
The way everything felt new—and yet, like destiny.
Allah wrote you into my life and it became brighter.`;

const DUA_TEXT = `Ya Allah, bless her in every way.
Put sakinah in her heart, light in her path, and barakah in our home.
Make our love a means of mercy and Jannah. Ameen.`;

const REASSURANCES = [
    "You don’t have to carry everything alone. I’m with you.",
    "Even on hard days, you are still my favorite blessing.",
    "You are loved for who you are — not just what you do.",
    "I choose you with patience, softness, and loyalty.",
    "Your feelings matter. Your heart matters. You matter.",
    "Gem, If the world gets loud, I’ll be your quiet place."
];

// Hidden word to unlock secret key card (clue: what makes a marriage feel safe)
const HIDDEN_WORD = "gem"; // you can change to "sakinah" or something meaningful

const CARD_TEXTS = {
    card1: `Remember whenever we are playing and you start laughing?
That laughter is still my favorite sound.`,
    card2: `I’m grateful for your effort in taking care of the home.
The unseen things you do… Allah sees them. And I see them.`,
    card4: `I admire your heart —
the way you try, the way you care, the way you keep going.`
};

const SECRET_KEY_TEXT = `You unlocked the Secret Key…
So here is the truth:

When you feel weak, I will be gentle.
When you feel strong, I will be proud.
When you feel unsure, I will remind you.

You are home to me.`;

const BONUS_LETTER = `BONUS LETTER (because you found all secrets):

My love, you are the answered dua I didn’t know how to word.
I pray we grow older with mercy between us,
and that our love becomes a witness for us on the Day we meet Allah.

— ${YOUR_NAME}`;

const FINALE_TITLE = "I choose you — again. 💜";
const FINALE_TEXT = `On this anniversary, I want you to know:

I’m proud of you.
I’m grateful for you.
I’m committed to you.

May Allah keep our home filled with sakinah, mercy, and barakah.
And may our love lead us to Jannah… together.

Happy Anniversary, ${WIFE_NAME}.
— ${YOUR_NAME}`;

/**************
 * STATE
 **************/
let scene = 1;
let secrets = 0;
let unlocked = false;
let quizOk = false;
let typedDone = false;

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function setProgress() {
    $("#progressText").textContent = `Chapter ${Math.min(scene, 6)} of 6`;
    $("#dateLabel").textContent = ANNIVERSARY_LABEL;
    $("#secretCount").textContent = `Secrets found: ${secrets}/3`;
    $("#secretGate").textContent = `Secrets: ${secrets}/3`;
    $("#bonusStatus").textContent = unlocked ? "Unlocked" : "Not unlocked";
    $("#unlockHint").textContent = unlocked ? "Secret Key is unlocked ✅" : "Tip: it’s what I call you that later became a brand.";
}

function go(to) {
    scene = to;
    $$(".scene").forEach(s => s.classList.remove("active"));
    document.querySelector(`.scene[data-scene="${to}"]`).classList.add("active");

    // Fix for mobile: scroll back to top when switching scenes
    if (window.innerWidth <= 880) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setProgress();
}

function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

function modal(title, body) {
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = body.replaceAll("\n", "<br/>");
    $("#modalBack").classList.add("show");
}

$("#modalClose")?.addEventListener("click", () => $("#modalBack").classList.remove("show"));
$("#modalBack")?.addEventListener("click", (e) => { if (e.target.id === "modalBack") $("#modalBack").classList.remove("show"); });

/**************
 * TYPEWRITER
 **************/
async function typeLines(el, lines, speed = 20) {
    el.innerHTML = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(caret);

    let text = "";
    for (const line of lines) {
        const target = (text ? "\n" : "") + line;
        for (let i = 0; i < target.length; i++) {
            if (typedDone) break;
            text += target[i];
            el.textContent = text;
            el.appendChild(caret);
            await new Promise(r => setTimeout(r, speed));
        }
        if (typedDone) {
            el.textContent = lines.join("\n");
            el.appendChild(caret);
            break;
        }
        // small pause between lines
        await new Promise(r => setTimeout(r, 220));
    }
    // stop caret blinking after finishing (optional)
    setTimeout(() => caret.style.opacity = ".7", 300);
}

/**************
 * AUDIO AMBIENCE (WebAudio)
 **************/
let audioOn = false;
let audioCtx, noiseNode, gainNode, lfo, lfoGain;

function startAmbience() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Pink-ish noise
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.12;
    }
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;

    // soft gain
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.0;

    // LFO for gentle breathing
    lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.015;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    lfo.start();

    // fade in
    gainNode.gain.setTargetAtTime(0.05, audioCtx.currentTime, 0.6);
}

function stopAmbience() {
    try {
        gainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.2);
        setTimeout(() => {
            noiseNode?.stop();
            lfo?.stop();
            audioCtx?.close();
        }, 400);
    } catch (e) { }
}

$("#musicBtn")?.addEventListener("click", async () => {
    audioOn = !audioOn;
    $("#musicBtn").textContent = audioOn ? "🔊 Soft ambience: On" : "🔊 Soft ambience: Off";
    if (audioOn) {
        // must be user gesture
        startAmbience();
        toast("Ambience on ✨");
    } else {
        stopAmbience();
        toast("Ambience off");
    }
});

/**************
 * NAVIGATION
 **************/
document.addEventListener("click", (e) => {
    const next = e.target?.getAttribute?.("data-next");
    const back = e.target?.getAttribute?.("data-back");
    if (next) go(Number(next));
    if (back) go(Number(back));
});

$("#startBtn")?.addEventListener("click", () => go(2));
$("#skipType")?.addEventListener("click", () => {
    typedDone = true;
    toast("Typing skipped ✅");
});

/**************
 * DOORS (Scene 2 & 4)
 **************/
document.addEventListener("click", (e) => {
    const door = e.target.closest?.(".door");
    if (!door) return;
    const key = door.getAttribute("data-door");

    // Scene 2
    if (key === "memory") {
        modal("Memory ✨", MEMORY_FLASHBACK);
        burst(1);
    }
    if (key === "dua") {
        modal("A Dua 🤲", DUA_TEXT);
        burst(1);
    }

    // Scene 4 cards
    if (key === "card1") { modal("Memory Card", CARD_TEXTS.card1); burst(1); }
    if (key === "card2") { modal("Memory Card", CARD_TEXTS.card2); burst(1); }
    if (key === "card4") { modal("Memory Card", CARD_TEXTS.card4); burst(1); }

    if (key === "card3") {
        if (!unlocked) {
            toast("Locked 🔒 Enter the hidden word first.");
            burst(0);
        } else {
            modal("Secret Key 🔑", SECRET_KEY_TEXT);
            burst(2);
        }
    }
});

/**************
 * RING INTERACTIONS + SECRETS
 **************/
function addSecret() {
    secrets = Math.min(3, secrets + 1);
    setProgress();
    if (secrets === 3) {
        toast("All secrets found… bonus ending unlocked 🔮");
        burst(2);
    } else {
        toast("Secret found ✨");
        burst(1);
    }
}

// Secret hotspots (invisible easter eggs)
$("#secretHotspot1")?.addEventListener("click", () => {
    if (secrets >= 1) return;
    addSecret();
    modal("Secret #1", `I love you in the quiet moments.\nThe small moments.\nThe everyday moments.`);
});

$("#secretHotspot2")?.addEventListener("click", () => {
    if (secrets >= 2) return;
    addSecret();
    modal("Secret #2", `If you ever forget your worth,\nborrow my eyes for a second.\nYou are incredible.`);
});

$("#secretHotspot3")?.addEventListener("click", () => {
    if (secrets >= 3) return;
    addSecret();
    modal("Secret #3", `This love is not temporary.\nIt’s intention.\nIt’s commitment.\nIt’s dua.`);
    toast("Clue unlocked: try “sakina” / “sakinah”");
});

// Ring touches
document.addEventListener("click", (e) => {
    if (e.target.id === "ring2") {
        modal("A Soft Note", `I’m grateful for your heart.\nAnd I’m honored to love you.`);
        burst(1);
    }
    if (e.target.id === "ring6") {
        burst(3);
    }
    // scene 1 ring
    if (e.target.classList.contains("ring") && scene === 1) {
        modal("A Whisper", `May our love always be gentle.\nMay our home always feel safe.\nAmeen.`);
        burst(1);
    }
});

/**************
 * REASSURANCE BUTTON
 **************/
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function setReassurance(text) {
    const el = $("#reassuranceBox");
    if (el) el.textContent = text;
}

$("#reassureBtn")?.addEventListener("click", () => {
    const msg = randomItem(REASSURANCES);
    setReassurance(msg);
    burst(1);
});

$("#saveNoteBtn")?.addEventListener("click", () => {
    const text = $("#reassuranceBox")?.textContent?.trim() || "";
    if (!text || text.includes("Press the button")) { toast("Press reassurance first 💗"); return; }
    localStorage.setItem("savedLoveNote", text);
    const hint = $("#savedHint");
    if (hint) hint.textContent = "Saved ✅ (it will stay on this device)";
    toast("Saved ✅");
    burst(1);
});

/**************
 * UNLOCK HIDDEN WORD
 **************/
$("#unlockBtn")?.addEventListener("click", () => {
    const val = ($("#unlockInput").value || "").trim().toLowerCase();
    const clean = val.replace(/[^a-z]/g, "");
    const target = HIDDEN_WORD.toLowerCase().replace(/[^a-z]/g, "");

    if (clean === target || clean === (target + "h")) { // allow sakinah variation
        unlocked = true;
        const hint = $("#unlockHint");
        if (hint) hint.textContent = "Unlocked ✅ Tap the Secret Key card now.";
        const lockTag = document.querySelector('.door[data-door="card3"] .lockTag');
        if (lockTag) {
            lockTag.textContent = "UNLOCKED";
            lockTag.classList.add("unlocked");
        }
        toast("Secret Key unlocked 🔑");
        burst(2);
    } else {
        const hint = $("#unlockHint");
        if (hint) hint.textContent = "Not quite… Clue: it’s the peace in a home.";
        toast("Try again ✨");
        burst(0);
    }
    setProgress();
});

/**************
 * QUIZ
 **************/
$$(".quiz").forEach(q => {
    q.addEventListener("click", () => {
        const ok = q.getAttribute("data-answer") === "yes";
        if (ok) {
            quizOk = true;
            const hint = $("#quizHint");
            if (hint) hint.textContent = "Correct ✅ Finale unlocked.";
            const btn = $("#toFinale");
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
            }
            toast("Finale unlocked ✨");
            burst(2);
        } else {
            const hint = $("#quizHint");
            if (hint) hint.textContent = "Nice try 😄 But there’s a deeper answer…";
            toast("Try again");
            burst(0);
        }
    });
});

$("#toFinale")?.addEventListener("click", () => {
    if (!quizOk) return;
    go(6);
});

/**************
 * FINALE
 **************/
function showFinale() {
    $("#finaleTitle").textContent = FINALE_TITLE;
    $("#finaleText").innerHTML = FINALE_TEXT.replaceAll("\n", "<br/>");

    if (secrets === 3) {
        $("#finaleTiny").textContent = "Bonus unlocked: tap the message to open your letter 💌";
        $(".finaleMessage").style.cursor = "pointer";
        $(".finaleMessage").onclick = () => modal("Bonus Letter 💌", BONUS_LETTER);
    } else {
        $("#finaleTiny").textContent = "Tap anywhere for more fireworks ✨";
        $(".finaleMessage").onclick = null;
        $(".finaleMessage").style.cursor = "default";
    }

    $("#finaleOverlay").classList.add("show");
    burst(4);
    fireworks(1);
}

$("#finaleBtn")?.addEventListener("click", showFinale);
$("#finaleOverlay")?.addEventListener("click", (e) => {
    if (e.target.closest('.finaleMessage')) return;
    fireworks(1);
    burst(3);
});

/**************
 * INIT
 **************/
function init() {
    setProgress();
    const introEl = $("#typeIntro");
    if (introEl) typeLines(introEl, INTRO_LINES, 18);

    const saved = localStorage.getItem("savedLoveNote");
    if (saved) {
        setReassurance(saved);
        const hint = $("#savedHint");
        if (hint) hint.textContent = "Loaded your saved note ✅";
    } else {
        setReassurance("Press the button… and it will answer you. 💗");
    }
}

document.addEventListener('DOMContentLoaded', init);

/**************
 * PARTICLES + CONFETTI + FIREWORKS (Canvas)
 **************/
const canvas = document.getElementById("fx");
if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    window.addEventListener("resize", resize); resize();

    const stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + .2,
        v: Math.random() * 0.35 + .05,
        a: Math.random() * 0.5 + 0.2
    }));

    const pops = [];
    window.burst = function (level = 1) {
        const count = [12, 30, 55, 90, 140][level] || 30;
        const cx = W * 0.5 + (Math.random() * 140 - 70);
        const cy = H * 0.55 + (Math.random() * 90 - 45);
        for (let i = 0; i < count; i++) {
            pops.push({
                x: cx,
                y: cy,
                vx: (Math.random() * 2 - 1) * (2.5 + level * 1.4),
                vy: (Math.random() * 2 - 1) * (2.6 + level * 1.6) - (1.6 + level * .4),
                life: 90 + Math.random() * 40,
                size: 2 + Math.random() * 3,
                hue: Math.random() * 360
            });
        }
    }

    const boom = [];
    window.fireworks = function (times = 1) {
        for (let t = 0; t < times; t++) {
            const fx = Math.random() * W * 0.8 + W * 0.1;
            const fy = Math.random() * H * 0.35 + H * 0.10;
            const n = 80 + Math.floor(Math.random() * 60);
            for (let i = 0; i < n; i++) {
                const ang = Math.random() * Math.PI * 2;
                const sp = 1.2 + Math.random() * 3.6;
                boom.push({
                    x: fx, y: fy,
                    vx: Math.cos(ang) * sp,
                    vy: Math.sin(ang) * sp,
                    life: 120 + Math.random() * 50,
                    hue: 260 + Math.random() * 120
                });
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        ctx.save();
        for (const s of stars) {
            s.y += s.v;
            if (s.y > H + 20) { s.y = -20; s.x = Math.random() * W; }
            ctx.globalAlpha = s.a;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fill();
        }
        ctx.restore();

        for (let i = pops.length - 1; i >= 0; i--) {
            const p = pops[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03;
            p.life -= 1;
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));
            ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 1)`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            if (p.life <= 0) pops.splice(i, 1);
        }

        for (let i = boom.length - 1; i >= 0; i--) {
            const p = boom[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.01;
            p.vx *= 0.995;
            p.vy *= 0.995;
            p.life -= 1;

            ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 130));
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, 1)`;
            ctx.fill();

            if (p.life <= 0) boom.splice(i, 1);
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
}
