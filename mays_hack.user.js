// ==UserScript==
// @name         RPG Maker MZ Ultimate Mobile Hack v5.0
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  دوران حقيقي للهاتف + أبعاد مرنة + تحكم كامل
// @author       Gemini
// @match        https://api.erogames.to/game/mays-summer-vacation-v0042/web*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. نظام الأبعاد والدوران الذكي ---
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
                background: rgba(5, 5, 5, 0.95); border-left: 3px solid #ffd700;
                z-index: 999999; transition: right 0.3s ease;
                padding: 20px; color: white; overflow-y: auto; font-family: sans-serif;
            }
            #gemini-menu.open { right: 0; }
            .h-btn { width: 100%; padding: 15px; margin: 8px 0; border: none; border-radius: 12px;
                    background: #252525; color: gold; font-weight: bold; font-size: 14px; }
            .active { background: #4caf50 !important; color: white; }
            input[type=range] { width: 100%; margin: 15px 0; }
        `;
        document.head.appendChild(style);
    };

    // دالة تدوير الهاتف (الطلب من النظام)
    async function forceRotate() {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            // طلب قفل الشاشة بوضع العرض
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
            }
        } catch (err) {
            console.log("Orientation Lock requires user interaction or isn't supported");
            // حل بديل باستخدام CSS إذا رفض النظام القفل التلقائي
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.style.transform = "rotate(90deg)";
                canvas.style.width = "100vh";
                canvas.style.height = "100vw";
            }
        }
    }

    // --- 2. بناء الواجهة ---
    applyGlobalStyles();
    const menu = document.createElement('div');
    menu.id = 'gemini-menu';
    const toggle = document.createElement('div');
    toggle.id = 'gemini-toggle';
    toggle.innerHTML = '⚙️';

    menu.innerHTML = `
        <h3 style="text-align:center; color:gold;">MOBILE OPTIMIZER</h3>
        <button class="h-btn" id="full-rotate">📳 تدوير الهاتف كاملاً</button>
        <hr>
        <label>🏃 السرعة: <span id="speed-val">4</span></label>
        <input type="range" min="1" max="10" value="4" id="speed-slider">
        <button class="h-btn" id="btn-gold">💰 مال لا نهائي</button>
        <button class="h-btn" id="btn-items">🎒 كل الأدوات</button>
        <button class="h-btn" id="btn-god">🛡️ وضع الخلود</button>
        <button class="h-btn" id="btn-noclip">👻 اختراق الجدران</button>
    `;

    document.body.appendChild(menu);
    document.body.appendChild(toggle);

    // --- 3. الوظائف ---

    toggle.onclick = () => menu.classList.toggle('open');

    // زر التدوير الكامل
    document.getElementById('full-rotate').onclick = function() {
        forceRotate();
        this.classList.add('active');
    };

    // متحكم السرعة
    document.getElementById('speed-slider').oninput = function() {
        const s = parseInt(this.value);
        document.getElementById('speed-val').innerText = s;
        if (window.$gamePlayer) $gamePlayer.setMoveSpeed(s);
    };

    // إضافة الموارد
    document.getElementById('btn-gold').onclick = () => $gameParty.gainGold(99999999);
    document.getElementById('btn-items').onclick = () => {
        [$dataItems, $dataWeapons, $dataArmors].forEach(c => c.forEach(i => i && $gameParty.gainItem(i, 99)));
    };

    // وضع الخلود
    let god = false;
    document.getElementById('btn-god').onclick = function() {
        god = !god;
        this.classList.toggle('active', god);
        if(god) {
            Game_Battler.prototype.executeDamage = function(v) { if(!this.isActor()) this._hp=0; };
        } else {
            location.reload(); 
        }
    };

    // اختراق الجدران
    let clip = false;
    document.getElementById('btn-noclip').onclick = function() {
        clip = !clip;
        this.classList.toggle('active', clip);
        if(window.$gamePlayer) $gamePlayer.setThrough(clip);
    };

    // ميزة السحب للزر (Drag)
    toggle.ontouchmove = (e) => {
        e.preventDefault();
        let touch = e.touches[0];
        toggle.style.top = touch.clientY - 35 + 'px';
        toggle.style.right = (window.innerWidth - touch.clientX - 35) + 'px';
    };

})();
