let currentAutoVisitor = null;
let currentAutoOrder = null;
let acceptingAutoOrder = false;  // 移到顶部，确保在函数调用前定义

function createAutoOrder(adv){
  if(typeof buildAdventurerOrder === "function"){
    return buildAdventurerOrder(adv);
  }
  return {
    id: nextOrderId++,
    adventurerId: adv.id,
    requiredPotion: "小红药水",
    quantity: 1 + Math.floor(Math.random() * 2),
    daysLeft: 2,
    rewardGold: 20 + Math.floor(Math.random() * 15),
    status: "pending"
  };
}

function getPortraitPath(adv){
  if(typeof PORTRAITS !== "undefined" && PORTRAITS[adv.name]){
    return "Assets/" + PORTRAITS[adv.name];
  }
  return `Assets/人物立绘character/正面front/${adv.name}半身.png`;
}

function ensureVisitorPortrait(){
  const area = document.getElementById("currentVisitorArea");
  if(!area) return null;

  let img = document.getElementById("visitorPortrait");
  if(!img){
    img = document.createElement("img");
    img.id = "visitorPortrait";
    img.alt = "当前冒险者";
    area.appendChild(img);
  }
  return img;
}

function showNextAutoVisitor(){
  console.log("🔍 showNextAutoVisitor 被调用");
  console.log("  - currentAutoVisitor:", currentAutoVisitor);
  console.log("  - acceptingAutoOrder:", acceptingAutoOrder);

  if(currentAutoVisitor || acceptingAutoOrder) {
    console.log("  ⚠️ 已有冒险者或正在接单，跳过");
    return;
  }

  // 移除自动重新生成队列的逻辑，防止无限生成冒险者
  if(!queue || queue.length === 0){
    console.log("  ⚠️ 队列为空");
    document.getElementById("visitorName").innerHTML = "今日没有更多顾客";
    const img = ensureVisitorPortrait();
    if(img) img.style.display = "none";
    return;
  }

  const visitorData = queue[0];
  console.log("  - visitorData:", visitorData);
  if(!visitorData) {
    console.log("  ⚠️ visitorData 为空");
    return;
  }

  const adv = adventurers.find(a => a.id === visitorData.adventurerId);
  console.log("  - 找到冒险者:", adv ? adv.name : "未找到");
  if(!adv){
    queue.shift();
    showNextAutoVisitor();
    return;
  }

  currentAutoVisitor = adv;
  currentAutoOrder = createAutoOrder(adv);
  currentAdventurerId = adv.id;

  console.log("  ✅ 设置冒险者名字:", adv.name);
  document.getElementById("visitorName").innerHTML = adv.name;
  document.getElementById("visitorStatus").innerHTML = "等待玩家决定是否接单";

  const img = ensureVisitorPortrait();
  console.log("  - 立绘元素:", img ? "已找到" : "未找到");
  if(img){
    img.style.display = "none";

    img.onload = function(){
      console.log("  ✅ 立绘加载成功，显示图片");
      img.style.display = "block";
    };

    img.onerror = function(){
      img.style.display = "none";
      console.warn("  ❌ 冒险者立绘加载失败：", img.src);
    };

    const portraitPath = getPortraitPath(adv);
    console.log("  - 立绘路径:", portraitPath);
    img.src = portraitPath;
  }

  console.log("  - 调用 showAutoBubble");
  showAutoBubble();
  console.log("  - 调用 updateUI");
  updateUI();
  console.log("  ✅ showNextAutoVisitor 完成");
}

function showAutoBubble(){
  const old = document.getElementById("visitorBubble");
  if(old) old.remove();

  if(!currentAutoOrder) return;

  const bubble = document.createElement("div");
  bubble.id = "visitorBubble";

  bubble.innerHTML = `
  <div class="bubble-text">
    <span class="bubble-want">我要</span>
    <span class="bubble-potion">${currentAutoOrder.requiredPotion}</span>
    <span class="bubble-count">× ${currentAutoOrder.quantity}</span>
  </div>

  <div class="bubble-buttons">
    <button id="acceptAutoOrderBtn" type="button"></button>
    <button id="rejectAutoOrderBtn" type="button"></button>
  </div>
`;

  document.querySelector("#gameMainPage .main-ui").appendChild(bubble);

  const acceptBtn = document.getElementById("acceptAutoOrderBtn");
  const rejectBtn = document.getElementById("rejectAutoOrderBtn");

  acceptBtn.onclick = acceptAutoOrder;
  rejectBtn.onclick = rejectAutoOrder;
}

function clearCurrentVisitor(){
  currentAutoVisitor = null;
  currentAutoOrder = null;
  currentAdventurerId = null;

  const bubble = document.getElementById("visitorBubble");
  if(bubble) bubble.remove();

  const img = document.getElementById("visitorPortrait");
  if(img) img.style.display = "none";

  document.getElementById("visitorName").innerHTML = "已离开";
  document.getElementById("visitorStatus").innerHTML = "等待顾客到来";
}

// acceptingAutoOrder 已在文件顶部定义

function acceptAutoOrder(){
  if(acceptingAutoOrder) return;
  if(!currentAutoVisitor || !currentAutoOrder) return;

  // 防止重复接单
  const alreadyExists = orders.some(o =>
    o.adventurerId === currentAutoVisitor.id && o.status === "pending"
  );
  if (alreadyExists) {
    showMessage(`${currentAutoVisitor.name} 已经有未完成的订单，请先交付后再接新单。`, true);
    queue.shift();
    clearCurrentVisitor();
    acceptingAutoOrder = false;
    setTimeout(showNextAutoVisitor, 600);
    return;
  }

  acceptingAutoOrder = true;

  const acceptBtn = document.getElementById("acceptAutoOrderBtn");
  const rejectBtn = document.getElementById("rejectAutoOrderBtn");
  if(acceptBtn) acceptBtn.disabled = true;
  if(rejectBtn) rejectBtn.disabled = true;

  const orderToAdd = currentAutoOrder;
  const visitorName = currentAutoVisitor.name;
  const visitorId = currentAutoVisitor.id;

  // 再次检查防止并发
  if(!orders.some(o => o.adventurerId === visitorId && o.status === "pending")){
    orders.push(orderToAdd);
  }

  queue.shift();  // 移除当前顾客

  showMessage(`已接受订单：${visitorName}`, false);

  const bubble = document.getElementById("visitorBubble");
  if(bubble) bubble.remove();

  const portrait = document.getElementById("visitorPortrait");
  if(portrait) portrait.style.display = "none";

  currentAutoVisitor = null;
  currentAutoOrder = null;
  currentAdventurerId = null;

  document.getElementById("visitorName").innerHTML = "已离开";
  document.getElementById("visitorStatus").innerHTML = "等待顾客到来";

  renderOrdersList();
  updateUI();

  setTimeout(function(){
    acceptingAutoOrder = false;
    showNextAutoVisitor();
  }, 600);
}

function rejectAutoOrder(){
  if(acceptingAutoOrder) return;
  if(!currentAutoVisitor) return;

  acceptingAutoOrder = true;

  queue.shift();

  showMessage(`${currentAutoVisitor.name} 离开了。`, true);

  const bubble = document.getElementById("visitorBubble");
  if(bubble) bubble.remove();

  const portrait = document.getElementById("visitorPortrait");
  if(portrait) portrait.style.display = "none";

  currentAutoVisitor = null;
  currentAutoOrder = null;
  currentAdventurerId = null;

  document.getElementById("visitorName").innerHTML = "已离开";
  document.getElementById("visitorStatus").innerHTML = "等待顾客到来";

  updateUI();

  setTimeout(function(){
    acceptingAutoOrder = false;
    showNextAutoVisitor();
  }, 600);
}

// 覆盖 renderQueue 函数，改为显示冒险者而不是队列列表
const originalRenderQueue = typeof renderQueue !== 'undefined' ? renderQueue : function(){};

renderQueue = function(){
  console.log("🎯 visitor-auto.js renderQueue 被调用");
  console.log("  - 队列长度:", queue ? queue.length : "队列未定义");
  console.log("  - 队列内容:", queue);

  // 调用原始函数（如果存在）
  if (typeof originalRenderQueue === 'function' && originalRenderQueue !== renderQueue) {
    try {
      originalRenderQueue();
    } catch(e) {
      console.log("  - 原始renderQueue调用失败:", e);
    }
  }

  // 立即显示第一个顾客
  if (typeof queue !== 'undefined' && queue && queue.length > 0) {
    console.log("  ✅ 队列有效，调用 showNextAutoVisitor");
    showNextAutoVisitor();
  } else {
    console.log("  ⚠️ 队列为空或未定义");
    document.getElementById("visitorName").innerHTML = "已离开";
    const img = ensureVisitorPortrait();
    if(img) img.style.display = "none";
  }
};

function restartVisitorAfterNewDay(){
  clearCurrentVisitor();
  setTimeout(showNextAutoVisitor, 300);
}

window.addEventListener("DOMContentLoaded", function(){
  const startBtn = document.getElementById("startBtn");

  if(startBtn){
    startBtn.addEventListener("click", function(){
      setTimeout(function(){
        if((!queue || queue.length === 0) && typeof generateDailyQueue === "function"){
          generateDailyQueue();
        }

        showNextAutoVisitor();
      }, 500);
    });
  }
});

// 暴露清除函数给 game.js 使用
window.clearCurrentVisitor = clearCurrentVisitor;

// 每天开始时重置顾客显示，并自动刷新队列
window.resetDailyVisitor = function() {
  clearCurrentVisitor();
  setTimeout(showNextAutoVisitor, 300);
};
