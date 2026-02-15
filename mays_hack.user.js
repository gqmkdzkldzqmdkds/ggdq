// ==UserScript==
// @name         RPG Maker MZ Ultimate Mobile Hack v7.0
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  النسخة النهائية المدمجة: دوران + موارد + سرعة المحرك + تفاعل عن بعد
// @author       Gemini
// @match        https://api.erogames.to/game/mays-summer-vacation-v0042/web*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // المتغيرات العالمية للتحكم
    window._geminiGlobalSpeed = 1;
    window._remoteActive = false;

    // --- 1. نظام الأبعاد والدوران الذكي (CSS) ---
    const applyGlobalStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            #gemini-toggle {
                position: fixed; top: 40%; right: 10px; width: 70px; height: 70px;
                background: radial-gradient(circle, #ffd700, #ff8c00); border-radius: 50%; 
                display: flex; align-items: center; justify-content: center;
                font-size: 40px; z-index: 1000000; cursor: pointer; border: 4px solid #fff;
                box-shadow: 0 0 25px rgba(255, 215, 0, 0.7); touch-action: none;
            }
            #gemini-menu {
                position: fixed; top: 0; right: -300px; width: 280px; height: 100%;
                background: rgba(10, 10, 10, 0.95); border-left: 3px solid #ffd700;
                z-index: 1000001; transition: right 0.3s ease;
                padding: 20px; color: white; overflow-y: auto; font-family: sans-serif;
            }
            #gemini-menu.open { right: 0; }
            .h-btn { width: 100%; padding: 12px; margin: 5px 0; border: none; border-radius: 10px;
                    background: #252525; color: gold; font-weight: bold; font-size: 13px; cursor: pointer; }
            .active { background: #4caf50 !important; color: white; box-shadow: 0 0 8px #4caf50; }
            .h-section { border-bottom: 1px solid #333; margin-bottom: 10px; padding-bottom: 10px; }
            .h-label { display: block; font-size: 12px; color: #aaa; margin-bottom: 5px; text-align: center; }
            #speed-val-display { color: gold; font-weight: bold; font-size: 18px; }
            input[type=range] { width: 100%; margin: 10px 0; }
        `;
        document.head.appendChild(style);
    };

    // دالة تدوير الهاتف
    async function forceRotate() {
        try {
            if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
            if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
        } catch (err) {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.style.transform = "rotate(90deg)";
                canvas.style.width = "100vh"; canvas.style.height = "100vw";
            }
        }
    }

    // --- 2. بناء الواجهة ---
    function initUI() {
        applyGlobalStyles();
        const menu = document.createElement('div');
        menu.id = 'gemini-menu';
        const toggle = document.createElement('div');
        toggle.id = 'gemini-toggle';
        toggle.innerHTML = '⚙️';

        menu.innerHTML = `
            <h3 style="text-align:center; color:gold; margin-top:0;">GEMINI ULTIMATE</h3>
            
            <div class="h-section">
                <button class="h-btn" id="full-rotate">📳 تدوير الهاتف كاملاً</button>
            </div>

            <div class="h-section">
                <span class="h-label">⚡ سرعة المحرك الكلية: <span id="speed-val-display">1x</span></span>
                <div style="display:flex; justify-content:center; align-items:center; gap:10px;">
                    <button class="h-btn" style="width:50px;" id="g-speed-down">-</button>
                    <button class="h-btn" style="width:50px;" id="g-speed-up">+</button>
                </div>
            </div>

            <div class="h-section">
                <span class="h-label">🏃 سرعة مشي اللاعب</span>
                <input type="range" min="1" max="10" value="4" id="speed-slider">
            </div>

            <div class="h-section">
                <button class="h-btn" id="btn-remote">🖱️ التفاعل عن بُعد: OFF</button>
                <button class="h-btn" id="btn-gold">💰 مال لا نهائي</button>
                <button class="h-btn" id="btn-items">🎒 كل الأدوات (x99)</button>
            </div>

            <div class="h-section">
                <button class="h-btn" id="btn-god">🛡️ وضع الخلود</button>
                <button class="h-btn" id="btn-noclip">👻 اختراق الجدران</button>
            </div>

            <button class="h-btn" style="background:#441111;" onclick="location.reload()">🔄 إعادة تحميل</button>
        `;

        document.body.appendChild(menu);
        document.body.appendChild(toggle);

        // --- الأحداث (Events) ---
        toggle.onclick = () => menu.classList.toggle('open');

        document.getElementById('full-rotate').onclick = function() { forceRotate(); this.classList.add('active'); };

        // سرعة المحرك
        document.getElementById('g-speed-up').onclick = () => {
            if (window._geminiGlobalSpeed < 10) {
                window._geminiGlobalSpeed++;
                document.getElementById('speed-val-display').innerText = window._geminiGlobalSpeed + "x";
            }
        };
        document.getElementById('g-speed-down').onclick = () => {
            if (window._geminiGlobalSpeed > 1) {
                window._geminiGlobalSpeed--;
                document.getElementById('speed-val-display').innerText = window._geminiGlobalSpeed + "x";
            }
        };

        // سرعة اللاعب
        document.getElementById('speed-slider').oninput = function() {
            if (window.$gamePlayer) $gamePlayer.setMoveSpeed(parseInt(this.value));
        };

        // الموارد
        document.getElementById('btn-gold').onclick = () => { if(window.$gameParty) $gameParty.gainGold(99999999); };
        document.getElementById('btn-items').onclick = () => {
            if(window.$dataItems) [$dataItems, $dataWeapons, $dataArmors].forEach(c => c.forEach(i => i && $gameParty.gainItem(i, 99)));
        };

        // التفاعل عن بعد
        document.getElementById('btn-remote').onclick = function() {
            window._remoteActive = !window._remoteActive;
            this.classList.toggle('active', window._remoteActive);
            this.innerText = window._remoteActive ? "🖱️ التفاعل عن بُعد: ON" : "🖱️ التفاعل عن بُعد: OFF";
        };

        // الخلود
        let god = false;
        document.getElementById('btn-god').onclick = function() {
            god = !god; this.classList.toggle('active', god);
            if(god) Game_Battler.prototype.executeDamage = function(v) { if(!this.isActor()) this._hp=0; };
            else location.reload();
        };

        // اختراق الجدران
        let clip = false;
        document.getElementById('btn-noclip').onclick = function() {
            clip = !clip; this.classList.toggle('active', clip);
            if(window.$gamePlayer) $gamePlayer.setThrough(clip);
        };

        // السحب
        toggle.ontouchmove = (e) => {
            let touch = e.touches[0];
            toggle.style.top = touch.clientY - 35 + 'px';
            toggle.style.right = (window.innerWidth - touch.clientX - 35) + 'px';
        };
    }

    // --- 3. نظام الحقن الأساسي (Injections) ---
    function injectCore() {
        if (typeof SceneManager !== 'undefined' && typeof Game_Player !== 'undefined') {
            // حقن سرعة المحرك
            const _SceneManager_updateMain = SceneManager.updateMain;
            SceneManager.updateMain = function() {
                for (let i = 0; i < window._geminiGlobalSpeed; i++) { _SceneManager_updateMain.call(this); }
            };

            // حقن التفاعل عن بعد
            const _Game_Player_triggerTouchAction = Game_Player.prototype.triggerTouchAction;
            Game_Player.prototype.triggerTouchAction = function() {
                if (window._remoteActive) {
                    const x = $gameMap.canvasToMapX(TouchInput.x);
                    const y = $gameMap.canvasToMapY(TouchInput.y);
                    const events = $gameMap.eventsXy(x, y);
                    if (events.length > 0) { events.forEach(e => e.start()); return true; }
                }
                return _Game_Player_triggerTouchAction.call(this);
            };
        } else {
            setTimeout(injectCore, 500);
        }
    }

    // التشغيل عند الجاهزية
    if (document.readyState === 'complete') { initUI(); injectCore(); }
    else { window.addEventListener('load', () => { initUI(); injectCore(); }); }

})();
