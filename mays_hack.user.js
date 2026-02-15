// ==UserScript==
// @name         RPG Maker MZ Ultimate Mobile Controller & Hack v4.0
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  نظام التحكم المتطور: تدوير + سرعة متغيرة + تهكير كامل
// @author       Gemini
// @match        https://api.erogames.to/game/mays-summer-vacation-v0042/web*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. إعدادات التصميم المتطورة (Advanced CSS) ---
    const style = document.createElement('style');
    style.innerHTML = `
        #gemini-menu {
            position: fixed; top: 5%; right: -280px; width: 260px; height: 90vh;
            background: rgba(10, 10, 10, 0.98); border: 3px solid #ffd700; border-radius: 20px 0 0 20px;
            z-index: 999999; transition: right 0.4s ease-in-out;
            padding: 20px; color: #fff; font-family: 'Segoe UI', sans-serif; overflow-y: auto;
            box-shadow: -10px 0 30px rgba(0,0,0,0.8);
        }
        #gemini-menu.open { right: 0; }
        #gemini-toggle {
            position: fixed; top: 40%; right: 10px; width: 65px; height: 65px; /* تكبير الترس */
            background: linear-gradient(45deg, #ffd700, #ff8c00); border-radius: 50%; 
            display: flex; align-items: center; justify-content: center;
            font-size: 35px; z-index: 1000000; cursor: pointer; border: 3px solid #fff;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); transform: translateY(-50%);
            user-select: none; transition: transform 0.2s;
        }
        .h-section { border-bottom: 1px solid #333; margin-bottom: 15px; padding-bottom: 15px; }
        .h-title { color: #ffd700; font-size: 14px; font-weight: bold; margin-bottom: 10px; display: block; }
        .h-btn {
            width: 100%; padding: 12px; margin: 5px 0; border: none; border-radius: 10px;
            background: #222; color: #fff; font-weight: bold; cursor: pointer;
        }
        .active-feature { background: #4caf50 !important; border: 1px solid #fff; }
        
        /* تصميم شريط السرعة (Slider) */
        .slider-container { margin: 10px 0; text-align: center; }
        .h-slider {
            width: 100%; height: 10px; border-radius: 5px; background: #444;
            outline: none; -webkit-appearance: none;
        }
        .h-slider::-webkit-slider-thumb {
            -webkit-appearance: none; width: 20px; height: 20px;
            background: #ffd700; border-radius: 50%; cursor: pointer;
        }
        #speed-val { font-size: 18px; color: #ffd700; font-weight: bold; }
    `;
    document.head.appendChild(style);

    // --- 2. بناء الواجهة ---
    const menu = document.createElement('div');
    menu.id = 'gemini-menu';
    const toggle = document.createElement('div');
    toggle.id = 'gemini-toggle';
    toggle.innerHTML = '⚙️';

    menu.innerHTML = `
        <h2 style="text-align:center; color:#ffd700; margin-bottom:20px;">GEMINI PANEL</h2>
        
        <div class="h-section">
            <span class="h-title">⚙️ التحكم بالسرعة</span>
            <div class="slider-container">
                <input type="range" min="1" max="10" value="4" class="h-slider" id="speed-range">
                <p>السرعة الحالية: <span id="speed-val">4</span></p>
            </div>
        </div>

        <div class="h-section">
            <span class="h-title">🔃 العرض والشاشة</span>
            <button class="h-btn" id="btn-rotate">تدوير الشاشة 90°</button>
        </div>

        <div class="h-section">
            <span class="h-title">💰 الموارد السريعة</span>
            <button class="h-btn" id="btn-gold">إضافة المال الأقصى</button>
            <button class="h-btn" id="btn-items">إضافة كل الحقيبة</button>
        </div>

        <div class="h-section">
            <span class="h-title">🛡️ أوضاع الغش (On/Off)</span>
            <button class="h-btn" id="btn-god">وضع الخلود: معطل</button>
            <button class="h-btn" id="btn-noclip">اختراق الجدران: معطل</button>
        </div>

        <button class="h-btn" style="background:#d32f2f" onclick="location.reload()">إعادة تحميل اللعبة</button>
    `;

    document.body.appendChild(menu);
    document.body.appendChild(toggle);

    // --- 3. المنطق البرمجي (Logic) ---

    toggle.onclick = () => menu.classList.toggle('open');

    // التحكم بالسرعة المتغيرة
    const speedRange = document.getElementById('speed-range');
    const speedVal = document.getElementById('speed-val');
    speedRange.oninput = function() {
        const val = parseInt(this.value);
        speedVal.innerText = val;
        if (typeof $gamePlayer !== 'undefined') {
            $gamePlayer.setMoveSpeed(val);
        }
    };

    // تدوير الشاشة
    let isRotated = false;
    document.getElementById('btn-rotate').onclick = function() {
        const canvas = document.querySelector('canvas') || document.body;
        isRotated = !isRotated;
        if (isRotated) {
            canvas.style.transform = "rotate(90deg)";
            canvas.style.width = "100vh";
            canvas.style.height = "100vw";
            canvas.style.position = "fixed";
            canvas.style.top = "0"; canvas.style.left = "0";
            this.classList.add('active-feature');
        } else {
            canvas.style.transform = "none";
            canvas.style.width = ""; canvas.style.height = "";
            canvas.style.position = "";
            this.classList.remove('active-feature');
        }
    };

    // إضافة المال والأدوات
    document.getElementById('btn-gold').onclick = () => {
        $gameParty.gainGold(99999999);
        showNotify("تم إضافة الذهب!");
    };

    document.getElementById('btn-items').onclick = () => {
        [$dataItems, $dataWeapons, $dataArmors].forEach(cat => {
            cat.forEach(i => { if(i && i.name) $gameParty.gainItem(i, 99); });
        });
        showNotify("تم ملء الحقيبة!");
    };

    // تفعيل/تعطيل وضع الخلود
    let godActive = false;
    const originalDamage = Game_Battler.prototype.executeDamage;
    document.getElementById('btn-god').onclick = function() {
        godActive = !godActive;
        if (godActive) {
            Game_Battler.prototype.executeDamage = function(v) { if (!this.isActor()) this._hp = 0; };
            this.innerText = "وضع الخلود: مفعّل";
            this.classList.add('active-feature');
        } else {
            Game_Battler.prototype.executeDamage = originalDamage;
            this.innerText = "وضع الخلود: معطل";
            this.classList.remove('active-feature');
        }
    };

    // تفعيل/تعطيل الاختراق
    let noclipActive = false;
    document.getElementById('btn-noclip').onclick = function() {
        noclipActive = !noclipActive;
        $gamePlayer.setThrough(noclipActive);
        this.innerText = noclipActive ? "اختراق الجدران: مفعّل" : "اختراق الجدران: معطل";
        if (noclipActive) this.classList.add('active-feature');
        else this.classList.remove('active-feature');
    };

    function showNotify(msg) {
        const n = document.createElement('div');
        n.style = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:gold; color:black; padding:10px 20px; border-radius:30px; z-index:2000000; font-weight:bold;";
        n.innerText = msg;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 2000);
    }

    // دعم سحب زر الترس باللمس
    toggle.ontouchmove = (e) => {
        const touch = e.touches[0];
        toggle.style.top = touch.clientY + 'px';
        toggle.style.right = (window.innerWidth - touch.clientX) + 'px';
    };

})();
