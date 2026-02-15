// ==UserScript==
// @name         RPG Maker MZ Ultimate Mobile Controller & Hack
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  نظام التحكم الكامل: تدوير الشاشة + تهكير الموارد + أدوات المطور
// @author       Gemini
// @match        https://api.erogames.to/game/mays-summer-vacation-v0042/web*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. إعدادات التصميم (Styles) ---
    const style = document.createElement('style');
    style.innerHTML = `
        #gemini-menu {
            position: fixed; top: 10%; right: -260px; width: 250px; height: 80vh;
            background: rgba(15, 15, 15, 0.95); border: 2px solid gold; border-radius: 15px 0 0 15px;
            z-index: 999999; transition: right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            padding: 15px; color: white; font-family: sans-serif; overflow-y: auto; box-shadow: -5px 0 15px rgba(0,0,0,0.5);
        }
        #gemini-menu.open { right: 0; }
        #gemini-toggle {
            position: fixed; top: 50%; right: 10px; width: 45px; height: 45px;
            background: gold; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 24px; z-index: 1000000; cursor: pointer; border: 2px solid #333;
            box-shadow: 0 0 10px gold; transform: translateY(-50%);
        }
        .h-btn {
            width: 100%; padding: 10px; margin: 5px 0; border: none; border-radius: 8px;
            background: #333; color: gold; font-weight: bold; cursor: pointer; transition: 0.2s;
        }
        .h-btn:active { transform: scale(0.95); background: gold; color: black; }
        .h-section { border-bottom: 1px solid #444; margin-bottom: 10px; padding-bottom: 10px; }
        .h-title { color: #aaa; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .rotate-90 { transform: rotate(90deg); transform-origin: center; width: 100vh !important; height: 100vw !important; }
    `;
    document.head.appendChild(style);

    // --- 2. بناء واجهة المستخدم ---
    const menu = document.createElement('div');
    menu.id = 'gemini-menu';
    const toggle = document.createElement('div');
    toggle.id = 'gemini-toggle';
    toggle.innerHTML = '⚙️';

    menu.innerHTML = `
        <h2 style="text-align:center; color:gold; margin-top:0;">MAYS HACK v3.0</h2>
        
        <div class="h-section">
            <div class="h-title">عرض الشاشة (Display)</div>
            <button class="h-btn" id="btn-rotate">🔄 تدوير الشاشة (Force Landscape)</button>
            <button class="h-btn" id="btn-fullscreen">🖥️ ملء الشاشة</button>
        </div>

        <div class="h-section">
            <div class="h-title">الموارد (Economy)</div>
            <button class="h-btn" id="btn-gold">💰 إضافة 99,999,999 ذهب</button>
            <button class="h-btn" id="btn-items">🎒 إضافة كل الأدوات (x99)</button>
        </div>

        <div class="h-section">
            <div class="h-title">اللاعب (Player)</div>
            <button class="h-btn" id="btn-god">🛡️ وضع الخلود (God Mode)</button>
            <button class="h-btn" id="btn-speed">🏃 سرعة البرق</button>
            <button class="h-btn" id="btn-noclip">👻 اختراق الجدران</button>
        </div>

        <div class="h-section">
            <div class="h-title">أدوات المطور (Dev)</div>
            <button class="h-btn" id="btn-debug">🐞 فتح قائمة الـ Debug</button>
            <button class="h-btn" id="btn-save">💾 حفظ إجباري</button>
        </div>
        <p style="font-size:10px; text-align:center; color:#666;">تم التصميم للهواتف - Gemini 2026</p>
    `;

    document.body.appendChild(menu);
    document.body.appendChild(toggle);

    // --- 3. وظائف التحكم (Logic) ---

    // فتح وإغلاق القائمة
    toggle.onclick = () => menu.classList.toggle('open');

    // وظيفة تدوير الشاشة
    let rotated = false;
    document.getElementById('btn-rotate').onclick = () => {
        const gameCanvas = document.getElementById('gameCanvas') || document.body;
        if (!rotated) {
            gameCanvas.style.transform = "rotate(90deg)";
            gameCanvas.style.width = "100vh";
            gameCanvas.style.height = "100vw";
            gameCanvas.style.position = "fixed";
            gameCanvas.style.top = "0";
            gameCanvas.style.left = "0";
            rotated = true;
        } else {
            gameCanvas.style.transform = "none";
            gameCanvas.style.width = "100%";
            gameCanvas.style.height = "100%";
            gameCanvas.style.position = "static";
            rotated = false;
        }
    };

    // وظيفة إضافة المال
    document.getElementById('btn-gold').onclick = () => {
        if (typeof $gameParty !== 'undefined') {
            $gameParty.gainGold(99999999);
            notify("تم شحن الرصيد!");
        } else alert("ادخل اللعبة أولاً!");
    };

    // إضافة كل شيء (أدوات، أسلحة، دروع)
    document.getElementById('btn-items').onclick = () => {
        if (typeof $gameParty !== 'undefined') {
            [$dataItems, $dataWeapons, $dataArmors].forEach(category => {
                category.forEach(item => { if(item && item.name) $gameParty.gainItem(item, 99); });
            });
            notify("تمت إضافة جميع الموارد!");
        }
    };

    // وضع الخلود
    let godMode = false;
    document.getElementById('btn-god').onclick = function() {
        godMode = !godMode;
        if (godMode) {
            Game_Battler.prototype.executeDamage = function(v) { 
                if (this.isActor()) return; // لا ضرر للاعب
                this._hp = 0; // قتل العدو فوراً
            };
            this.style.background = "green";
            notify("وضع الخلود مفعل!");
        } else {
            location.reload(); // أسهل طريقة لإلغاء تعديل الـ prototype
        }
    };

    // سرعة المشي
    document.getElementById('btn-speed').onclick = () => {
        if (typeof $gamePlayer !== 'undefined') {
            $gamePlayer.setMoveSpeed(6);
            notify("السرعة: 6");
        }
    };

    // اختراق الجدران
    let noclip = false;
    document.getElementById('btn-noclip').onclick = function() {
        noclip = !noclip;
        $gamePlayer.setThrough(noclip);
        this.style.background = noclip ? "green" : "#333";
        notify(noclip ? "تم تفعيل الاختراق" : "تم التعطيل");
    };

    // فتح قائمة الـ Debug الأصلية في المحرك
    document.getElementById('btn-debug').onclick = () => {
        SceneManager.push(Scene_Debug);
    };

    // نظام التنبيهات الصغير
    function notify(text) {
        const n = document.createElement('div');
        n.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:gold; color:black; padding:8px 20px; border-radius:20px; z-index:1000001; font-weight:bold;";
        n.innerHTML = text;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 2000);
    }

    // دعم السحب (Drag) للزر على الهاتف
    toggle.ontouchmove = (e) => {
        const touch = e.touches[0];
        toggle.style.top = touch.clientY + 'px';
        toggle.style.right = (window.innerWidth - touch.clientX) + 'px';
    };

})();