/* =========== 小镇居民需求交互系统：稳定版 ===========
   目标：
   1. 没有居民订单时隐藏左侧小镇居民。
   2. 有居民订单时显示小镇居民，点击打开居民需求弹窗。
   3. 不依赖 resident-modal.css；如果 index.html 没有 residentModal，会自动创建。
*/
(function(){
  "use strict";

  function getResidentList(){
    try{
      return Array.isArray(residents) ? residents : [];
    }catch(e){
      return [];
    }
  }

  function setResidentList(next){
    try{
      residents = Array.isArray(next) ? next : [];
    }catch(e){}
  }

  function getResidentArea(){
    return document.querySelector(".resident-area");
  }

  function hasResidentOrder(){
    return getResidentList().length > 0;
  }

  function updateResidentVisibility(){
    const residentArea = getResidentArea();
    const available = hasResidentOrder();

    document.body.classList.toggle("resident-available", available);

    if(residentArea){
      residentArea.style.display = available ? "block" : "none";
      residentArea.style.visibility = available ? "visible" : "hidden";
      residentArea.style.pointerEvents = available ? "auto" : "none";
      residentArea.style.cursor = available ? "pointer" : "default";
      residentArea.setAttribute("aria-hidden", available ? "false" : "true");
    }
  }

  function ensureResidentModal(){
    let modal = document.getElementById("residentModal");
    if(modal) return modal;

    modal = document.createElement("div");
    modal.id = "residentModal";
    modal.className = "resident-modal";
    modal.style.display = "none";
    modal.innerHTML = `
      <div class="resident-modal-panel">
        <button id="residentCloseBtn" class="resident-close-btn" type="button" aria-label="关闭">关闭</button>
        <div class="resident-modal-title">居民需求</div>
        <div class="resident-info-card">
          <div id="residentEmojiLarge" class="resident-emoji-large"></div>
          <div id="residentNameLarge" class="resident-name-large"></div>
          <div id="residentNeedText" class="resident-need-text"></div>
          <div id="residentPaymentText" class="resident-payment-text"></div>
        </div>
        <div id="residentPotionOptions" class="resident-potion-options"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener("click", function(e){
      if(e.target === modal) closeResidentModal();
    });

    const closeBtn = modal.querySelector("#residentCloseBtn");
    if(closeBtn){
      closeBtn.addEventListener("click", closeResidentModal);
    }

    return modal;
  }

  function potionInStock(potionName){
    try{
      if(typeof checkPotionStock === "function") return checkPotionStock(potionName);
    }catch(e){}
    return false;
  }

  function openResidentModal(){
    const list = getResidentList();
    if(list.length === 0){
      updateResidentVisibility();
      return;
    }

    const resident = list[0];
    if(!resident || !resident.scenario){
      updateResidentVisibility();
      return;
    }

    const scenario = resident.scenario;
    const modal = ensureResidentModal();

    const emoji = document.getElementById("residentEmojiLarge");
    const name = document.getElementById("residentNameLarge");
    const need = document.getElementById("residentNeedText");
    const payment = document.getElementById("residentPaymentText");
    const options = document.getElementById("residentPotionOptions");

    if(emoji) emoji.textContent = scenario.emoji || "";
    if(name) name.textContent = scenario.name || "小镇居民";
    if(need) need.textContent = scenario.need || "";
    if(payment) payment.textContent = `收购价：${scenario.payment || 0} 金币`;

    if(options){
      options.innerHTML = "";
      (scenario.acceptablePotions || []).forEach(function(potionName){
        const wrapper = document.createElement("div");
        wrapper.className = "resident-potion-option";

        const label = document.createElement("div");
        label.className = "resident-potion-label";
        label.textContent = potionName;

        const btn = document.createElement("button");
        btn.className = "resident-sell-btn";
        btn.type = "button";
        btn.textContent = potionInStock(potionName) ? "出售" : "缺货";

        if(!potionInStock(potionName)){
          btn.disabled = true;
          btn.classList.add("out-of-stock");
        }else{
          btn.addEventListener("click", function(e){
            e.preventDefault();
            e.stopPropagation();
            sellPotionToResident(resident, potionName);
          });
        }

        wrapper.appendChild(label);
        wrapper.appendChild(btn);
        options.appendChild(wrapper);
      });
    }

    modal.style.display = "flex";
  }

  function closeResidentModal(){
    const modal = document.getElementById("residentModal");
    if(modal) modal.style.display = "none";
  }

  function sellPotionToResident(resident, potionName){
    if(!resident || !resident.scenario) return;

    if(!potionInStock(potionName)){
      if(typeof showMessage === "function") showMessage("库存不足", true);
      return;
    }

    try{ if(typeof consumePotion === "function") consumePotion(potionName); }catch(e){}

    const payment = Number(resident.scenario.payment) || 0;
    try{ gold += payment; }catch(e){}
    try{ if(typeof addIncome === "function") addIncome(payment); }catch(e){}

    const next = getResidentList().filter(function(r){ return r.id !== resident.id; });
    setResidentList(next);

    closeResidentModal();
    if(typeof showMessage === "function") showMessage(`✅ 成功出售 ${potionName}，获得 ${payment} 金币！`, false);

    try{ if(typeof updateUI === "function") updateUI(); }catch(e){}
    try{ if(typeof renderResidents === "function") renderResidents(); }catch(e){}
    updateResidentVisibility();
  }

  function bindResidentAreaClick(){
    const residentArea = getResidentArea();
    if(!residentArea || residentArea.dataset.residentClickBound === "1") return;

    residentArea.dataset.residentClickBound = "1";
    residentArea.addEventListener("click", function(e){
      if(!hasResidentOrder()){
        updateResidentVisibility();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      openResidentModal();
    });
  }

  /* 覆盖/补强 game.js 的居民渲染：隐藏旧系统列表，只保留左侧居民入口 */
  window.updateResidentVisibility = updateResidentVisibility;
  window.openResidentModal = openResidentModal;
  window.closeResidentModal = closeResidentModal;

  const originalRenderResidents = window.renderResidents;
  window.renderResidents = function(){
    const container = document.getElementById("residentsList");
    if(container) container.innerHTML = "";
    updateResidentVisibility();
  };

  const originalUpdateUI = window.updateUI;
  if(typeof originalUpdateUI === "function"){
    window.updateUI = function(){
      const result = originalUpdateUI.apply(this, arguments);
      updateResidentVisibility();
      return result;
    };
  }

  window.addEventListener("DOMContentLoaded", function(){
    ensureResidentModal();
    bindResidentAreaClick();
    updateResidentVisibility();
  });

  /* 如果脚本在 DOMContentLoaded 之后加载，也立即执行一次 */
  if(document.readyState !== "loading"){
    ensureResidentModal();
    bindResidentAreaClick();
    updateResidentVisibility();
  }
})();
