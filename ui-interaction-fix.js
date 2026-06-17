/* ===== 右侧三栏最终修复版：默认材料 / 药剂 / 冒险者图鉴 ===== */

let activeRightTab = "materials";

function getGrid(){
  return document.getElementById("inventoryGrid");
}

function safeValue(varName){
  try{
    const value = eval(varName);
    return Number(value) || 0;
  }catch(e){
    return 0;
  }
}

function safePotionCount(potionName, varName){
  try{
    if(typeof inventory !== "undefined" && inventory && inventory[potionName] !== undefined){
      return Number(inventory[potionName]) || 0;
    }
  }catch(e){}

  return safeValue(varName);
}

function renderGrid(items, type){
  const grid = getGrid();
  if(!grid) return;

  grid.classList.remove("material-grid-mode", "potion-grid-mode", "bestiary-grid-mode");
  grid.classList.add(type + "-grid-mode");

  grid.innerHTML = items.map(item => `
    <div class="inventory-item">
      <img class="inventory-img" src="${item.img}" alt="${item.name}">
      <div class="inventory-item-count">${item.prefix || "×"}${item.count}</div>
    </div>
  `).join("");
}

function renderMaterialGridOnly(){
  activeRightTab = "materials";

  renderGrid([
    {name:"野薄荷叶", count:safeValue("mintLeaf"), img:"Assets/图标icon/材料/yebohe野薄荷叶.png"},
    {name:"微光洋甘菊", count:safeValue("chamomile"), img:"Assets/图标icon/材料/yangganju微光洋甘菊.png"},
    {name:"尖刺迷迭香", count:safeValue("rosemary"), img:"Assets/图标icon/材料/midiexiang尖刺迷迭香.png"},
    {name:"绒絮薰衣草", count:safeValue("lavender"), img:"Assets/图标icon/材料/xyicao薰衣草.png"},
    {name:"甜根草", count:safeValue("sweetRoot"), img:"Assets/图标icon/材料/tiangcao甜根草.png"},
    {name:"圣露花", count:safeValue("holyFlower"), img:"Assets/图标icon/材料/shengluhua圣露花.png"},
    {name:"毒腺菇", count:safeValue("poisonMushroom"), img:"Assets/图标icon/材料/duxiangu毒腺菇.png"},
    {name:"赤铁髓", count:safeValue("redOre"), img:"Assets/图标icon/材料/chitiesui赤铁髓.png"},
    {name:"蓝萤石", count:safeValue("blueOre"), img:"Assets/图标icon/材料/lanyinshi蓝萤石.png"},
    {name:"黑银矿", count:safeValue("blackOre"), img:"Assets/图标icon/材料/heiyinkuang黑银矿.png"}
  ], "material");
}

function renderPotionGridOnly(){
  activeRightTab = "potions";

  renderGrid([
    {name:"小红药水", count:safePotionCount("小红药水", "potion"), img:"Assets/图标icon/Potion药剂/xiaohong小红药水.png"},
    {name:"大生命药水", count:safePotionCount("大生命药水", "bigPotion"), img:"Assets/图标icon/Potion药剂/dashnegm大生命药水.png"},
    {name:"勇气药水", count:safePotionCount("勇气药水", "couragePotion"), img:"Assets/图标icon/Potion药剂/yongqiyaoshui勇气药水.png"},
    {name:"安眠茶", count:safePotionCount("安眠茶", "sleepPotion"), img:"Assets/图标icon/Potion药剂/anmianca安眠茶.png"},
    {name:"清醒露", count:safePotionCount("清醒露", "awakePotion"), img:"Assets/图标icon/Potion药剂/qingxilu清醒露.png"},
    {name:"祝福药水", count:safePotionCount("祝福药水", "blessPotion"), img:"Assets/图标icon/Potion药剂/zhufu祝福药水.png"},
    {name:"魔力药水", count:safePotionCount("魔力药水", "magicPotion"), img:"Assets/图标icon/Potion药剂/moli魔力药水.png"},
    {name:"强力安眠茶", count:safePotionCount("强力安眠茶", "strongSleepPotion"), img:"Assets/图标icon/Potion药剂/qianglianm强力安眠茶.png"},
    {name:"强力魔力药水", count:safePotionCount("强力魔力药水", "strongMagicPotion"), img:"Assets/图标icon/Potion药剂/qianglimoli强力魔力药水.png"},
    {name:"斑幻剂", count:safePotionCount("斑幻剂", "lightParalysis"), img:"Assets/图标icon/Potion药剂/qianglizhihj强力致幻剂.png"},
    {name:"诅咒毒药", count:safePotionCount("诅咒毒药", "cursePotion"), img:"Assets/图标icon/Potion药剂/zhuzuo诅咒毒药.png"},
    {name:"致幻剂", count:safePotionCount("致幻剂", "strongParalysis"), img:"Assets/图标icon/Potion药剂/zihuanji致幻剂.png"}
  ], "potion");
}

function renderBestiaryGridOnly(){
  activeRightTab = "bestiary";

  renderGrid([
    {name:"白隼斥候游侠", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/白隼斥候游侠（头像）.png"},
    {name:"白象高阶守护骑士", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/白象高阶守护骑士（头像）.png"},
    {name:"仓鼠炼金学徒", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/仓鼠炼金学徒（头像）.png"},
    {name:"刺猬采药人", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/刺猬采药人（头像）.png"},
    {name:"黑猫诅咒术士", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/黑猫诅咒术士（头像）.png"},
    {name:"狐狸赏金猎人", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/狐狸赏金猎人（头像）.png"},
    {name:"巨蜥黑魔法使徒", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/巨蜥黑魔法使徒（头像）.png"},
    {name:"老鼠矿工", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/老鼠矿工（头像）.png"},
    {name:"鸬鹚远洋商人", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/鸬鹚远洋商人（头像）.png"},
    {name:"陆龟古籍学者", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/陆龟古籍学者（头像）.png"},
    {name:"盘羊圣殿牧师", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/盘羊圣殿牧师（头像）.png"},
    {name:"青蛙吟游诗人", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/青蛙吟游诗人（头像）.png"},
    {name:"蜥蜴黑市毒师", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/蜥蜴黑市毒师（头像）.png"},
    {name:"小镇居民1", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/小镇居民1（头像）.png"},
    {name:"小镇居民2", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/小镇居民2（头像）.png"},
    {name:"雪鸮星象占卜师", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/雪鸮星象占卜师（头像）.png"},
    {name:"野猪圣骑士", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/野猪圣骑士（头像）.png"},
    {name:"棕熊兵器锻造师", count:"♡", prefix:"", img:"Assets/图标icon/冒险者图鉴头像/棕熊兵器锻造师（头像）.png"}
  ], "bestiary");
}

function switchRightTab(type){
  const m = document.getElementById("tabMaterialsImg");
  const p = document.getElementById("tabPotionsImg");
  const b = document.getElementById("tabBestiaryImg");

  if(m) m.src = "Assets/按钮button/主页面按钮/右侧栏/右侧栏-材料（未点击）.png";
  if(p) p.src = "Assets/按钮button/主页面按钮/右侧栏/右侧栏-药剂 （未点击）.png";
  if(b) b.src = "Assets/按钮button/主页面按钮/右侧栏/右侧栏-冒险者图鉴 （未点击）.png";

  if(type === "materials"){
    if(m) m.src = "Assets/按钮button/主页面按钮/右侧栏/右侧栏-材料.png";
    renderMaterialGridOnly();
  }

  if(type === "potions"){
    if(p) p.src = "Assets/按钮button/主页面按钮/右侧栏/右侧栏-药剂.png";
    renderPotionGridOnly();
  }

  if(type === "bestiary"){
    if(b) b.src = "Assets/按钮button/主页面按钮/右侧栏/右侧栏-冒险者图鉴.png";
    renderBestiaryGridOnly();
  }
}

function bindRightTabs(){
  const tabMaterials = document.getElementById("tabMaterials");
  const tabPotions = document.getElementById("tabPotions");
  const tabBestiary = document.getElementById("tabBestiary");

  if(tabMaterials){
    tabMaterials.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      switchRightTab("materials");
    };
  }

  if(tabPotions){
    tabPotions.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      switchRightTab("potions");
    };
  }

  if(tabBestiary){
    tabBestiary.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      switchRightTab("bestiary");
    };
  }
}

function fixResidentPortrait(){
  const img = document.querySelector(".resident-area .role-img");
  if(img){
    img.src = "Assets/人物立绘character/正面front/小镇居民1半身.png";
  }
}

/* 捕获点击，防止原程序覆盖 */
document.addEventListener("click", function(e){
  if(e.target.closest("#tabMaterials")){
    e.preventDefault();
    e.stopPropagation();
    switchRightTab("materials");
  }

  if(e.target.closest("#tabPotions")){
    e.preventDefault();
    e.stopPropagation();
    switchRightTab("potions");
  }

  if(e.target.closest("#tabBestiary")){
    e.preventDefault();
    e.stopPropagation();
    switchRightTab("bestiary");
  }
}, true);

/* 默认显示材料 */
let defaultMaterialDone = false;

function showDefaultMaterials(){
  const game = document.getElementById("gameMainPage");
  const grid = getGrid();

  if(defaultMaterialDone) return;

  if(game && grid && !game.classList.contains("hidden-page")){
    defaultMaterialDone = true;
    switchRightTab("materials");
  }
}

window.addEventListener("DOMContentLoaded", function(){
  bindRightTabs();
  fixResidentPortrait();

  const startBtn = document.getElementById("startBtn");
  if(startBtn){
    startBtn.addEventListener("click", function(){
      setTimeout(showDefaultMaterials, 300);
      setTimeout(showDefaultMaterials, 800);
      setTimeout(showDefaultMaterials, 1500);
    });
  }

  setTimeout(showDefaultMaterials, 500);
  setTimeout(showDefaultMaterials, 1200);
});

setTimeout(function(){
  bindRightTabs();
  fixResidentPortrait();
  showDefaultMaterials();
}, 1000);
/* ===== 阻止原程序把右侧栏刷回旧背包 ===== */

const oldUpdateUIForRightTabs = window.updateUI;

window.updateUI = function(){
  if(typeof oldUpdateUIForRightTabs === "function"){
    oldUpdateUIForRightTabs();
  }

  setTimeout(function(){
    if(activeRightTab === "materials"){
      renderMaterialGridOnly();
    }

    if(activeRightTab === "potions"){
      renderPotionGridOnly();
    }

    if(activeRightTab === "bestiary"){
      renderBestiaryGridOnly();
    }
  }, 0);
};
/* ===== 固定比例缩放 ===== */

function resizeGameUI(){
  const scaleX = window.innerWidth / 1920;
  const scaleY = window.innerHeight / 1080;
  const scale = Math.min(scaleX, scaleY);
  document.documentElement.style.setProperty("--ui-scale", scale);
}

window.addEventListener("resize", resizeGameUI);
window.addEventListener("DOMContentLoaded", resizeGameUI);
setTimeout(resizeGameUI, 300);
window.addEventListener("DOMContentLoaded", function(){
  const fakeAchievement = document.getElementById("achievementBtnFake");
  const realAchievement = document.getElementById("achievementBtn");

  if(fakeAchievement && realAchievement){
    fakeAchievement.onclick = function(e){
      e.preventDefault();
      realAchievement.click();
    };
  }
});
window.addEventListener("DOMContentLoaded", function(){
  requestAnimationFrame(function(){
    switchRightTab("materials");
  });
});
