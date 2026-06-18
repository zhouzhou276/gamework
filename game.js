// ======================= 游戏数据 =======================
let gold = 200;
let potion = 0, bigPotion = 0, magicPotion = 0, couragePotion = 0;
let awakePotion = 0, sleepPotion = 0, strongSleepPotion = 0, cursePotion = 0;
let lightParalysis = 0, strongParalysis = 0, blessPotion = 0;

let mintLeaf = 3, chamomile = 3, rosemary = 2, lavender = 2, sweetRoot = 2;
let holyFlower = 1, poisonMushroom = 0, redOre = 0, blueOre = 0, blackOre = 0, magicCrystal = 0;

let herb = 0, rareFlower = 0;
function syncLegacyMaterials() { herb = mintLeaf + chamomile + rosemary + lavender + sweetRoot; rareFlower = holyFlower + poisonMushroom; }

let day = 1, maxDay = 60, dailyIncome = 0, dailyExpense = 0, shopLevel = 1;
let craftCount = { smallPotion:0, bigPotion:0, blessPotion:0, cursePotion:0 }, totalCrafts = 0;
let reputation = 20, deliveryBonus = 1.0, isEventActive = false, consecutiveNoDebtDays = 0, lastDayHadDebt = false, debtDays = 0;
let firstDeliveryBonusMap = {}, reputationBonusPrice = 1.0, reputationBonusRent = 0, reputationEventUsedToday = false;
let gardenYieldModifier = 1.0, extraQueueSize = 0, adventurerInjuryModifier = 1.0, potionQualityModifier = 1.0, residentOrderModifier = 0;
let dailyDemandTags = []; // 当天事件带来的订单需求标签，例如 healing/magic/sleep/holy/forbidden

const SEASONS = { 
  HARVEST: { id:0, name:"归仓季", emoji:"🌾", days:[1,15] }, 
  NIGHT: { id:1, name:"持夜季", emoji:"🌙", days:[16,30] }, 
  CRYSTAL: { id:2, name:"结晶季", emoji:"❄️", days:[31,45] }, 
  RAINBOW: { id:3, name:"虹光季", emoji:"🌈", days:[46,60] } 
};
function getCurrentSeason() {
  if(day>=1 && day<=15) return SEASONS.HARVEST;
  if(day>=16 && day<=30) return SEASONS.NIGHT;
  if(day>=31 && day<=45) return SEASONS.CRYSTAL;
  if(day>=46 && day<=60) return SEASONS.RAINBOW;
  return SEASONS.HARVEST;
}

const SEASON_ICON_MAP = {
  "归仓季":"Assets/按钮button/主页面按钮/右侧栏/归仓季.png",
  "持夜季":"Assets/按钮button/主页面按钮/右侧栏/持夜季.png",
  "结晶季":"Assets/按钮button/主页面按钮/右侧栏/结晶季.png",
  "虹光季":"Assets/按钮button/主页面按钮/右侧栏/虹光季.png"
};

function getExpandedReputationTier(){
  if(reputation<=-500) return {index:0, name:"万人唾弃"};
  if(reputation<=-400) return {index:1, name:"恶名昭著"};
  if(reputation<=-300) return {index:2, name:"声名狼藉"};
  if(reputation<=-200) return {index:3, name:"颇有微词"};
  if(reputation<=-100) return {index:4, name:"口碑不佳"};
  if(reputation<100) return {index:5, name:"默默无闻"};
  if(reputation<200) return {index:6, name:"热心肠"};
  if(reputation<300) return {index:7, name:"口碑不错"};
  if(reputation<400) return {index:8, name:"小镇知名"};
  if(reputation<500) return {index:9, name:"金字招牌"};
  return {index:10, name:"闻名遐迩"};
}

function getSeasonEndingStory(seasonName){
  const tier=getExpandedReputationTier();
  const byTier=[
    "没有任何顾客愿意靠近你的店铺，愤怒和戒备像冷风一样贴着门缝钻进来。你看着空荡荡的柜台，第一次认真思考这间店还能撑多久。",
    "恶名已经传遍小镇。偶尔有人推门，也多半是质问药剂的来历，连熟客都开始绕路。",
    "关于你药水的糟糕传闻越传越广，收入一天比一天少，炼金炉边的材料也显得格外沉默。",
    "负面流言悄悄扩散，顾客买药前总要反复盘问。你没有彻底失去机会，但每笔生意都变得艰难。",
    "大家对你的店铺没什么好印象。偶尔有人上门，也常常只问两句价格就离开。",
    "日子平淡地过去。没有特别的麻烦，也看不到明显的转机，你仍坐在柜台后等待下一位顾客。",
    "之前的善意开始回报你，不少被你帮过的居民特意来照顾生意，还带来了新的客人。",
    "你的口碑明显好转。居民提起你时会说一句‘那个炼金师人不错’，冒险者也开始找你定制药剂。",
    "店铺成了小镇里的热门去处，甚至有外镇冒险者绕路前来。你炼制的药剂常常供不应求。",
    "你的招牌已经成了小镇保证。重要活动和远征队伍都会先想到你，金币和订单一起堆满账本。",
    "你的名声传到了更远的地方。慕名而来的顾客挤满店铺，富商甚至派人专门收购你的药剂。"
  ];
  const seasonFlavor={
    "结晶季":"冰雪消融，新芽从石缝里探出头，冒险者们准备开春后的第一次远征。",
    "虹光季":"阳光充足，草药在后山疯长，避暑、抗毒和森林探险的订单变得格外热闹。",
    "归仓季":"作物收获，秋风渐重，居民和冒险者都在筹备入冬前的最后一批物资。",
    "持夜季":"风雪交加，道路结冰，冒险活动减少，但御寒、疗伤和安眠药剂成了救命的需求。"
  }[seasonName] || "一个季节结束了。";
  return `${seasonFlavor}<br>${byTier[tier.index]}`;
}
function getReputationTier() {
  if(reputation>=400) return { name:"传奇炼金师", level:10 };
  if(reputation>=300) return { name:"仁慈圣者", level:9 };
  if(reputation>=200) return { name:"受人尊敬", level:8 };
  if(reputation>=100) return { name:"小有名气", level:7 };
  if(reputation>=50) return { name:"普通商人", level:6 };
  if(reputation>=0) return { name:"默默无闻", level:5 };
  if(reputation>=-50) return { name:"略有恶名", level:4 };
  if(reputation>=-100) return { name:"黑心商人", level:3 };
  if(reputation>=-200) return { name:"臭名昭著", level:2 };
  if(reputation>=-300) return { name:"邪恶术士", level:1 };
  return { name:"贪婪的恶魔", level:0 };
}
let gardenLevel = 1, gardenTodayCollected = false, dailyDeliverySuccess = 0, totalDeliverySuccess = 0;
let endingTriggered30 = false, gameCompleted = false, unlockedEndless = false;
let orders = [], nextOrderId = 1, queue = [], residents = [];

const residentScenarios = [
  { id:0, name:"熬夜讲故事的父亲", emoji:"👨📖", need:"昨晚给孩子讲睡前故事讲到半夜，再不清醒就要把晚饭煮成黑暗料理了。", acceptablePotions:["清醒露","小红药水","轻微麻痹致幻剂"], payment:18 },
  { id:1, name:"养鸡的农妇", emoji:"👩🐔", need:"家里的老母鸡最近不下蛋了，想用温和药水拌谷糠安抚一下。", acceptablePotions:["安眠茶","轻微麻痹致幻剂","强力麻痹致幻剂"], payment:18 },
  { id:2, name:"带孩子的母亲", emoji:"👩‍👦", need:"捣蛋孩子总半夜乱窜，吵得全家睡不好。", acceptablePotions:["安眠茶","强力安眠茶","强力麻痹致幻剂"], payment:22 },
  { id:3, name:"赶早集的商贩", emoji:"🧑‍💼", need:"要走三个时辰山路去赶早集，走到一半可不能坐在路边喂蚊子。", acceptablePotions:["清醒露","小红药水","魔力药水"], payment:20 },
  { id:4, name:"紧张的祖父", emoji:"👴", need:"小孙子要参加演讲比赛，他紧张得直冒冷汗，想买瓶定心的药水。", acceptablePotions:["安眠茶","勇气药水","清醒露"], payment:20 },
  { id:5, name:"闪了腰的工人", emoji:"👷", need:"昨天帮邻居搬柴火闪了腰，连抬手做饭都费劲。", acceptablePotions:["小红药水","大生命药水","安眠茶"], payment:22 },
  { id:6, name:"菜园主人", emoji:"🧑‍🌾", need:"菜园蚜虫怎么都杀不干净，想买一小瓶兑水浇菜。", acceptablePotions:["安眠茶","强力安眠茶","诅咒毒药","轻微麻痹致幻剂","强力麻痹致幻剂"], payment:28 },
  { id:7, name:"烘焙师傅", emoji:"🧑‍🍳", need:"今晚要烤生日蛋糕，怕盯烤箱时打瞌睡翻车。", acceptablePotions:["清醒露","小红药水","魔力药水"], payment:20 },
  { id:8, name:"后院园丁", emoji:"👨‍🌾", need:"后院藤蔓长得太疯，缠得连路都走不了。", acceptablePotions:["轻微麻痹致幻剂","强力麻痹致幻剂","安眠茶"], payment:26 },
  { id:9, name:"失眠的邻居", emoji:"😫", need:"那只讨厌的青蛙天天练歌到半夜，再睡不着线都要穿成麻花了。", acceptablePotions:["安眠茶","强力安眠茶","诅咒毒药","轻微麻痹致幻剂","强力麻痹致幻剂"], payment:24 },
  { id:10, name:"巡夜人", emoji:"🦉", need:"今晚轮到他守夜，需要保持警觉又不能太亢奋。", acceptablePotions:["清醒露","勇气药水","魔力药水"], payment:24 },
  { id:11, name:"病弱的老人", emoji:"🐢", need:"旧伤复发，希望恢复体力，也想要一份安心。", acceptablePotions:["小红药水","大生命药水","祝福药水"], payment:28 },
  { id:12, name:"河边洗衣妇", emoji:"🧺", need:"河雾里飘来怪味，洗完衣服总头晕，想买瓶净化用的药水。", acceptablePotions:["祝福药水","清醒露","魔力药水"], payment:24 },
  { id:13, name:"木匠学徒", emoji:"🪚", need:"赶工修屋顶，手抖得厉害，想要能稳住精神的药。", acceptablePotions:["清醒露","勇气药水","安眠茶"], payment:22 },
  { id:14, name:"酒馆老板", emoji:"🍺", need:"今晚客人爆满，需要有人帮忙熬夜看账。", acceptablePotions:["清醒露","魔力药水","小红药水"], payment:26 },
  { id:15, name:"迷信的裁缝", emoji:"🧵", need:"她说针线盒被小诅咒缠上了，想买点能压住坏运气的东西。", acceptablePotions:["祝福药水","勇气药水","诅咒毒药"], payment:28 }
];
// =================== 事件文档扩展：居民求购池 V2 ===================
const EVENT_DOC_RESIDENT_SCENARIOS = [
  { id:100, name:"深夜偷鸡的村民", emoji:"🐔", weight:9, need:"鸡舍半夜被偷鸡贼光顾，村民想买一瓶能让贼人手脚发软的药水。", acceptablePotions:["轻微麻痹致幻剂","强力麻痹致幻剂","安眠茶"], payment:34 },
  { id:101, name:"走失爱猫的老奶奶", emoji:"👵🐈", weight:9, need:"相伴多年的橘猫一夜未归，老奶奶想买点能安神提气的药水，撑着去街巷里找猫。", acceptablePotions:["清醒露","安眠茶","祝福药水"], payment:24 },
  { id:102, name:"婚礼筹备的新人", emoji:"💍", weight:7, need:"镇上一对新人想为婚礼宾客准备祝福药剂，求一份喜庆又不会出岔子的药。", acceptablePotions:["祝福药水","勇气药水","清醒露"], payment:46 },
  { id:103, name:"酒馆掌柜", emoji:"🍺", weight:8, need:"酒馆深夜闹事，醉汉已经掀翻两张桌子，掌柜急需能让场面安静下来的药水。", acceptablePotions:["安眠茶","强力安眠茶","轻微麻痹致幻剂"], payment:36 },
  { id:104, name:"丰收庆典管事", emoji:"🌾", weight:6, need:"归仓季丰收节将至，管事想采购安神舒缓类药水，让忙碌一天的村民睡个好觉。", acceptablePotions:["安眠茶","强力安眠茶","祝福药水"], payment:38 },
  { id:105, name:"误食毒草的孩童家长", emoji:"👨‍👧🌿", weight:8, need:"孩子进山玩耍误食毒草，家长满头大汗地冲进店里求救。", acceptablePotions:["祝福药水","清醒露","小红药水"], payment:30 },
  { id:106, name:"铁匠铺学徒", emoji:"🛠️", weight:7, need:"铁匠被高温铁块烫伤，学徒急着寻找疗伤药，手里还攥着没冷透的铁钳。", acceptablePotions:["小红药水","大生命药水","祝福药水"], payment:42 },
  { id:107, name:"赶考书生", emoji:"📜", weight:6, need:"书生明日要去王都赶考，紧张得握笔发抖，想买一瓶静心祈福的药。", acceptablePotions:["清醒露","勇气药水","祝福药水"], payment:32 },
  { id:108, name:"驱蚊的村民代表", emoji:"🦟", weight:7, need:"虹光季毒蚊成灾，村民夜里睡不着，代表来求驱蚊安神的药剂。", acceptablePotions:["安眠茶","轻微麻痹致幻剂","强力麻痹致幻剂"], payment:34 },
  { id:109, name:"寒冬求助的孤寡老人", emoji:"🧣", weight:6, need:"持夜季寒风刺骨，孤寡老人身体发冷，希望买一瓶能暖身安神的药。", acceptablePotions:["小红药水","大生命药水","安眠茶"], payment:28 },
  { id:110, name:"迷路受伤的采药人", emoji:"🦔🌿", weight:7, need:"采药人迷路摔伤，被路人搀扶进店，身上还挂着湿漉漉的草叶。", acceptablePotions:["小红药水","大生命药水","清醒露"], payment:32 },
  { id:111, name:"面包坊伙计", emoji:"🥖", weight:6, need:"面包坊烤炉起火，伙计扑救时被烫伤，急需药水处理伤口。", acceptablePotions:["小红药水","大生命药水","祝福药水"], payment:36 },
  { id:112, name:"耕牛染病的农户", emoji:"🐄", weight:6, need:"家里的耕牛突然不吃不喝，农户希望用药水救回入冬前最重要的劳力。", acceptablePotions:["祝福药水","清醒露","小红药水"], payment:34 },
  { id:113, name:"小镇守夜人", emoji:"🌙🛡️", weight:7, need:"守夜人连续值夜，眼皮沉得像石头，急需醒神药防止夜间出事。", acceptablePotions:["清醒露","魔力药水","勇气药水"], payment:30 },
  { id:114, name:"教堂修女", emoji:"⛪", weight:5, need:"教堂要照看孤儿与老人，修女希望采购温和的祝福药水备用。", acceptablePotions:["祝福药水","安眠茶","清醒露"], payment:35 },
  { id:115, name:"流浪旅人", emoji:"🎒", weight:5, need:"外地旅人在店门口晕倒，路人请你帮忙，他身上只有一些远方小物件。", acceptablePotions:["小红药水","清醒露","大生命药水"], payment:26 },
  { id:116, name:"赶工的裁缝", emoji:"🧵", weight:5, need:"裁缝连日赶工熬坏眼睛，想买能稳住精神与手劲的药。", acceptablePotions:["清醒露","魔力药水","安眠茶"], payment:30 },
  { id:117, name:"磨坊主", emoji:"🌽", weight:5, need:"磨坊工人搬粮摔伤，磨坊主希望尽快让人恢复，不耽误明日开磨。", acceptablePotions:["小红药水","大生命药水","勇气药水"], payment:38 },
  { id:118, name:"水井管理员", emoji:"💧", weight:6, need:"镇上水井疑似被污染，居民肚子疼成一片，管理员急需净化类药剂。", acceptablePotions:["祝福药水","清醒露","魔力药水"], payment:40 },
  { id:119, name:"被藤蔓困住的园丁", emoji:"🌿", weight:5, need:"后院藤蔓疯长，园丁被缠得寸步难行，想买点能让藤蔓安静下来的东西。", acceptablePotions:["轻微麻痹致幻剂","强力麻痹致幻剂","安眠茶"], payment:34 },
  { id:120, name:"婴儿夜哭的母亲", emoji:"👶", weight:6, need:"婴儿整夜哭闹，母亲疲惫得快站不住，希望有温和安神药帮全家休息。", acceptablePotions:["安眠茶","清醒露","祝福药水"], payment:26 },
  { id:121, name:"码头搬运工", emoji:"⚓", weight:4, need:"远洋货船进港，搬运工肩膀酸痛，希望买能撑过今晚卸货的药水。", acceptablePotions:["小红药水","勇气药水","魔力药水"], payment:36 },
  { id:122, name:"镇长秘书", emoji:"📋", weight:4, need:"镇长要接待王都客人，秘书担心仪式出错，来买祈福与醒神药。", acceptablePotions:["祝福药水","清醒露","勇气药水"], payment:48 },
  { id:123, name:"被乌鸦吓坏的农妇", emoji:"🐦‍⬛", weight:5, need:"田地里乌鸦异常聚集，农妇怕是不祥预兆，想买一瓶压住坏运气的药。", acceptablePotions:["祝福药水","勇气药水","诅咒毒药"], payment:34 },
  { id:124, name:"鱼贩", emoji:"🐟", weight:5, need:"鱼贩说河面浮起怪泡，鱼群躁动，想买能净化水桶的药水。", acceptablePotions:["祝福药水","魔力药水","清醒露"], payment:32 },
  { id:125, name:"失眠的钟楼匠", emoji:"🕰️", weight:4, need:"钟楼齿轮半夜自鸣，匠人已经三天没睡好，担心自己把钟修成倒着走。", acceptablePotions:["安眠茶","强力安眠茶","清醒露"], payment:30 }
];
residentScenarios.push(...EVENT_DOC_RESIDENT_SCENARIOS);


let achievements = {
  "first_potion": { unlocked:false, name:"初试锋芒", desc:"首次炼制一瓶药水", reward:{ gold:20 } },
  "first_delivery": { unlocked:false, name:"第一桶金", desc:"首次交付药水", reward:{ gold:20 } },
  "first_upgrade": { unlocked:false, name:"崭露头角", desc:"首次升级店铺", reward:{ gold:50 } },
  "reputation_500": { unlocked:false, name:"不只是生意", desc:"声望值达到500", reward:{ gold:100, herb:2, rare:1 } },
  "gold_1000": { unlocked:false, name:"富甲一方", desc:"累积金币达到1000", reward:{ gold:100, crystal:1 } },
  "craft_10": { unlocked:false, name:"量产大师", desc:"累计炼制10瓶药水", reward:{ herb:3 } },
  "delivery_10": { unlocked:false, name:"热心店主", desc:"累计交付10次药水", reward:{ gold:50 } },
  "all_recipes": { unlocked:false, name:"博闻强识", desc:"解锁所有配方", reward:{ gold:200, rare:2 } },
  "all_favor": { unlocked:false, name:"万人迷", desc:"所有冒险者好感度满值", reward:{ gold:300, crystal:2 } },
  "lv5_shop": { unlocked:false, name:"商业帝国", desc:"店铺升到Lv.5", reward:{ gold:500 } },
  "endless_mode": { unlocked:false, name:"无尽征途", desc:"通关后解锁无尽模式", reward:{ gold:100 } },
  "rich_5000": { unlocked:false, name:"富可敌国", desc:"累积金币达到5000", reward:{ gold:500, herb:5, rare:3 } }
};
let unlockedEndings = [];

function getDailyRent() { return 10 + shopLevel*2; }
function getUpgradeCost() { if(shopLevel===1) return 200; if(shopLevel===2) return 500; if(shopLevel===3) return 1000; if(shopLevel===4) return 1500; return 2000; }
function updateReputationBonus() { reputationBonusPrice = (reputation>=100)?1.05:1.0; reputationBonusRent = (reputation>=200)?2:0; }
function getGardenUpgradeCost() { const costs=[100,300,600,1000,1500]; return costs[gardenLevel-1]||2000; }
function getGardenOutput() { let commonHerbs = Math.floor(Math.random()*4)+2; let rareHerbs=0; if(gardenLevel>=2) commonHerbs+=1; if(gardenLevel>=3 && Math.random()<0.3) rareHerbs+=1; if(gardenLevel>=4) commonHerbs+=1; if(gardenLevel>=5 && Math.random()<0.5) rareHerbs+=1; let herbTypes=['mintLeaf','chamomile','rosemary','lavender','sweetRoot']; let distribution={}; for(let i=0;i<commonHerbs;i++){ let type=herbTypes[Math.floor(Math.random()*herbTypes.length)]; distribution[type]=(distribution[type]||0)+1; } return { common:distribution, rare:rareHerbs, rareType:(Math.random()<0.5?'holyFlower':'poisonMushroom'), herb:commonHerbs }; }

// 冒险者
let adventurers = [
  { id:0, name:"老鼠矿工", emoji:"🐭⛏️", profession:"矿工", skill:"即便只剩1点血也不愿撤退", level:1, exp:0, expToNext:100, status:"健康", traits:"节俭，固执，不服输", favoritePotion:"小红药水、大生命药水、勇气药水", commonEnding:"他最终学会在塌方前撤退，也会在深矿里替你留下矿石记号。", favor:50, alignment:"neutral" },
  { id:1, name:"青蛙吟游诗人", emoji:"🐸🎶", profession:"吟游诗人", skill:"会主动帮玩家宣传店铺，偶尔带来额外客人", level:1, exp:10, expToNext:100, status:"健康", traits:"乐观，话很多，不靠谱", favoritePotion:"清醒露、安眠茶、魔力药水", commonEnding:"他的歌谣会随声望改变，可能把你唱成圣者，也可能唱成黑心药贩。", favor:50, alignment:"neutral" },
  { id:2, name:"仓鼠炼金学徒", emoji:"🐹🧪", profession:"炼金学徒", skill:"会偷偷模仿玩家炼药，有概率复制配方", level:1, exp:5, expToNext:100, status:"健康", traits:"好奇，冒失，崇拜炼金术", favoritePotion:"魔力药水、清醒露、强力安眠茶", commonEnding:"他把你的店铺当成课堂，学会的第一课是不要把蓝萤石放进茶壶。", favor:50, alignment:"neutral" },
  { id:3, name:"狐狸赏金猎人", emoji:"🦊🗡️", profession:"赏金猎人", skill:"只信任高品质药剂，低品质药会降低好感", level:2, exp:30, expToNext:100, status:"健康", traits:"冷静，现实，多疑", favoritePotion:"大生命药水、勇气药水、轻微麻痹致幻剂", commonEnding:"她会记住每一次交易的价格，也会记住谁在危险时没有背叛她。", favor:50, alignment:"evil" },
  { id:4, name:"野猪圣骑士", emoji:"🐗🛡️", profession:"圣骑士", skill:"会替队友承担伤害，受伤概率高于普通角色", level:2, exp:20, expToNext:100, status:"轻伤", traits:"正义感强，固执，不怕死", favoritePotion:"大生命药水、祝福药水、勇气药水", commonEnding:"若得到足够支援，他会成为小镇城门上的盾徽。", favor:50, alignment:"good" },
  { id:5, name:"黑猫诅咒术士", emoji:"🐈⬛🔮", profession:"诅咒术士", skill:"会主动传播诅咒，可能解锁禁忌炼金路线", level:3, exp:80, expToNext:120, status:"诅咒", traits:"神秘，危险，喜怒无常", favoritePotion:"诅咒毒药、强力麻痹致幻剂、魔力药水", commonEnding:"她会把你的选择写进黑书，善意或贪婪都会变成咒文。", favor:50, alignment:"evil" },
  { id:6, name:"盘羊圣殿牧师", emoji:"🐏⛪", profession:"圣殿牧师", skill:"高声望时更容易访问", level:1, exp:0, expToNext:100, status:"健康", traits:"虔诚，温和，守序", favoritePotion:"祝福药水、清醒露、勇气药水", commonEnding:"圣殿的钟声会为你的善名响起，也会为你的罪名沉默。", favor:50, alignment:"good" },
  { id:7, name:"白隼斥候游侠", emoji:"🦅🏹", profession:"斥候游侠", skill:"需求简单，访问频率高", level:1, exp:0, expToNext:100, status:"健康", traits:"敏捷，警觉，独来独往", favoritePotion:"清醒露、小红药水、魔力药水", commonEnding:"他总能第一个带回森林里的风声。", favor:50, alignment:"good" },
  { id:8, name:"白象高阶守护骑士", emoji:"🐘🛡️", profession:"守护骑士", skill:"高声望+高店铺等级解锁", level:3, exp:50, expToNext:150, status:"健康", traits:"高贵，坚毅，荣誉至上", favoritePotion:"大生命药水、祝福药水、勇气药水", commonEnding:"当你成为传说时，他会把你的店名刻进骑士团的誓词。", favor:50, alignment:"good" },
  { id:9, name:"蜥蜴黑市毒师", emoji:"🦎💀", profession:"黑市毒师", skill:"低声望时更容易访问", level:1, exp:0, expToNext:100, status:"健康", traits:"狡诈，贪婪，不择手段", favoritePotion:"诅咒毒药、轻微麻痹致幻剂、强力麻痹致幻剂", commonEnding:"他出售的每一瓶毒药，都会把你的名字推向更暗的巷子。", favor:50, alignment:"evil" },
  { id:10, name:"巨蜥黑魔法使徒", emoji:"🐊🔮", profession:"黑魔法使徒", skill:"低声望+高店铺等级解锁", level:3, exp:60, expToNext:150, status:"健康", traits:"邪恶，强大，危险", favoritePotion:"诅咒毒药、强力麻痹致幻剂、魔力药水", commonEnding:"黑暗会记住供货者的名字。", favor:50, alignment:"evil" },
  { id:11, name:"刺猬采药人", emoji:"🦔🌿", profession:"采药人", skill:"偶尔赠送草药材料", level:1, exp:0, expToNext:100, status:"健康", traits:"温顺，勤劳，知足", favoritePotion:"安眠茶、清醒露、祝福药水", commonEnding:"他会在森林深处替你留下一条安全的小路。", favor:50, alignment:"neutral" },
  { id:12, name:"鸬鹚远洋商人", emoji:"🐦📦", profession:"远洋商人", skill:"高金币收入时访问", level:2, exp:20, expToNext:120, status:"健康", traits:"精明，健谈，见多识广", favoritePotion:"魔力药水、清醒露、大生命药水", commonEnding:"他的船会把你的药水带到更远的港口。", favor:50, alignment:"neutral" },
  { id:13, name:"陆龟古籍学者", emoji:"🐢📚", profession:"古籍学者", skill:"店铺等级高时访问", level:2, exp:30, expToNext:120, status:"健康", traits:"博学，迟缓，执着", favoritePotion:"魔力药水、清醒露、祝福药水", commonEnding:"他会在书页边角写下你的配方注释。", favor:50, alignment:"neutral" },
  { id:14, name:"雪鸮星象占卜师", emoji:"🦉🔮", profession:"星象占卜师", skill:"声望绝对值高时访问", level:2, exp:40, expToNext:130, status:"健康", traits:"神秘，智慧，超然", favoritePotion:"魔力药水、勇气药水、安眠茶", commonEnding:"她预见的不是结局，而是你每一次选择后的分岔路。", favor:50, alignment:"neutral" },
  { id:15, name:"棕熊兵器锻造师", emoji:"🐻🔨", profession:"兵器锻造师", skill:"店铺等级≥3时访问", level:2, exp:25, expToNext:120, status:"健康", traits:"粗犷，专注，守信", favoritePotion:"大生命药水、魔力药水、勇气药水", commonEnding:"他会把你的药瓶尺寸做成剑柄标准。", favor:50, alignment:"neutral" }
];
let currentAdventurerId = null;

let recipes = [
  { id:0, name:"小红药水", effect:"恢复 20 HP", unlocked:true, stars:3, cost:{ mintLeaf:1 }, produce:(qty=1)=>{ potion+=qty; } },
  { id:1, name:"大生命药水", effect:"恢复 50 HP", unlocked:true, stars:3, cost:{ holyFlower:1, redOre:1 }, produce:(qty=1)=>{ bigPotion+=qty; } },
  { id:2, name:"魔力药水", effect:"恢复 30 MP", unlocked:false, lockCondition:"店铺等级 ≥ 2", stars:3, cost:{ chamomile:1 }, produce:(qty=1)=>{ magicPotion+=qty; showMessage(`✅ 炼制魔力药水 x${qty}`, false); } },
  { id:3, name:"强力魔力药水", effect:"恢复 80 MP", unlocked:false, lockCondition:"店铺等级 ≥ 3", stars:3, cost:{ chamomile:1, blueOre:1 }, produce:(qty=1)=>{ showMessage(`✅ 炼制强力魔力药水 x${qty}`, false); } },
  { id:4, name:"清醒露", effect:"保持清醒", unlocked:true, stars:3, cost:{ rosemary:1 }, produce:(qty=1)=>{ awakePotion+=qty; showMessage(`✅ 炼制清醒露 x${qty}`, false); } },
  { id:5, name:"安眠茶", effect:"引入睡眠", unlocked:true, stars:3, cost:{ lavender:1 }, produce:(qty=1)=>{ sleepPotion+=qty; showMessage(`✅ 炼制安眠茶 x${qty}`, false); } },
  { id:6, name:"强力安眠茶", effect:"强效安眠", unlocked:false, lockCondition:"店铺等级 ≥ 3", stars:2, cost:{ lavender:1, holyFlower:1, redOre:1 }, produce:(qty=1)=>{ strongSleepPotion+=qty; showMessage(`✅ 炼制强力安眠茶 x${qty}`, false); } },
  { id:7, name:"勇气药水", effect:"解除诅咒", unlocked:false, lockCondition:"炼制任意药水 ≥ 5 次", stars:3, cost:{ holyFlower:1, blackOre:1 }, produce:(qty=1)=>{ couragePotion+=qty; showMessage(`✅ 炼制勇气药水 x${qty}`, false); } },
  { id:8, name:"祝福药水", effect:"恢复全体状态", unlocked:false, lockCondition:"声望值 ≥ 150", stars:3, cost:{ magicCrystal:1, holyFlower:1, blackOre:1 }, produce:(qty=1)=>{ blessPotion+=qty; adventurers.forEach(a=>a.status="健康"); showMessage(`✨ 炼制祝福药水 x${qty}，全体恢复健康`, false); } },
  { id:9, name:"诅咒毒药", effect:"声望-20", unlocked:false, lockCondition:"声望值 ≤ -50", stars:2, cost:{ poisonMushroom:1 }, produce:(qty=1)=>{ cursePotion+=qty; gold+=80*qty; addIncome(80*qty); reputation=Math.max(-500, reputation-20*qty); showMessage(`💀 炼制诅咒毒药 x${qty}，获得 ${80*qty} 金，声望-${20*qty}`, true); } },
  { id:10, name:"轻微麻痹致幻剂", effect:"麻痹幻觉", unlocked:false, lockCondition:"声望值 ≤ 0", stars:2, cost:{ poisonMushroom:1 }, produce:(qty=1)=>{ lightParalysis+=qty; showMessage(`⚗️ 炼制轻微麻痹致幻剂 x${qty}`, false); } },
  { id:11, name:"强力麻痹致幻剂", effect:"强效麻痹", unlocked:false, lockCondition:"声望值 ≤ -100", stars:3, cost:{ poisonMushroom:1, blueOre:1, chamomile:1 }, produce:(qty=1)=>{ strongParalysis+=qty; showMessage(`⚗️ 炼制强力麻痹致幻剂 x${qty}`, false); } }
];

// =================== 订单与药水需求权重系统 ===================
const POTION_ORDER_META = {
  "小红药水": { baseReward:20, tier:"normal", tags:["healing"], minShop:1 },
  "大生命药水": { baseReward:46, tier:"advanced", tags:["healing","advanced"], minShop:1 },
  "魔力药水": { baseReward:32, tier:"normal", tags:["magic"], minShop:2 },
  "清醒露": { baseReward:26, tier:"normal", tags:["focus"], minShop:1 },
  "安眠茶": { baseReward:28, tier:"normal", tags:["sleep"], minShop:1 },
  "强力安眠茶": { baseReward:58, tier:"advanced", tags:["sleep","advanced"], minShop:3 },
  "勇气药水": { baseReward:60, tier:"advanced", tags:["courage","curse"], minShop:2 },
  "祝福药水": { baseReward:92, tier:"rare", tags:["holy","healing","curse"], minShop:4 },
  "诅咒毒药": { baseReward:88, tier:"forbidden", tags:["forbidden","curse"], minShop:3 },
  "轻微麻痹致幻剂": { baseReward:64, tier:"forbidden", tags:["forbidden","control"], minShop:3 },
  "强力麻痹致幻剂": { baseReward:112, tier:"forbidden", tags:["forbidden","control","advanced"], minShop:4 }
};
const ADVENTURER_POTION_WEIGHTS = {
  0:{"小红药水":60,"大生命药水":18,"勇气药水":22}, 1:{"清醒露":38,"安眠茶":32,"魔力药水":30},
  2:{"魔力药水":48,"清醒露":28,"强力安眠茶":24}, 3:{"大生命药水":34,"勇气药水":26,"轻微麻痹致幻剂":25,"强力麻痹致幻剂":15},
  4:{"大生命药水":44,"祝福药水":30,"勇气药水":26}, 5:{"诅咒毒药":42,"强力麻痹致幻剂":34,"魔力药水":24},
  6:{"祝福药水":46,"清醒露":30,"勇气药水":24}, 7:{"清醒露":42,"小红药水":34,"魔力药水":24},
  8:{"大生命药水":42,"祝福药水":34,"勇气药水":24}, 9:{"诅咒毒药":38,"轻微麻痹致幻剂":36,"强力麻痹致幻剂":26},
  10:{"诅咒毒药":42,"强力麻痹致幻剂":34,"魔力药水":24}, 11:{"安眠茶":40,"清醒露":34,"祝福药水":26},
  12:{"魔力药水":42,"清醒露":36,"大生命药水":22}, 13:{"魔力药水":45,"清醒露":32,"祝福药水":23},
  14:{"魔力药水":38,"勇气药水":32,"安眠茶":30}, 15:{"大生命药水":40,"魔力药水":32,"勇气药水":28}
};
function weightedChoice(items){ if(!items||items.length===0) return null; let total=items.reduce((s,i)=>s+Math.max(0,i.weight||0),0); if(total<=0) return items[0].value; let roll=Math.random()*total; for(let item of items){ roll-=Math.max(0,item.weight||0); if(roll<=0) return item.value; } return items[items.length-1].value; }
function getRecipeByPotionName(name){ return recipes.find(r=>r.name===name); }
function isPotionAvailableForOrders(name){ const meta=POTION_ORDER_META[name]; if(!meta || shopLevel<(meta.minShop||1)) return false; const recipe=getRecipeByPotionName(name); return !!(recipe && recipe.unlocked); }
function getPotionTierWeightMultiplier(name){ const meta=POTION_ORDER_META[name]||{tier:"normal"}; const table={1:{normal:1,advanced:.18,rare:0,forbidden:(reputation<0?.04:0)},2:{normal:.95,advanced:.35,rare:.04,forbidden:(reputation<0?.10:.02)},3:{normal:.78,advanced:.72,rare:.16,forbidden:(reputation<=0?.35:.10)},4:{normal:.60,advanced:.95,rare:.38,forbidden:(reputation<=0?.70:.18)},5:{normal:.42,advanced:1.05,rare:.60,forbidden:(reputation<=0?.95:.25)}}[Math.min(5,shopLevel)] || {normal:1,advanced:.5,rare:.2,forbidden:.1}; return table[meta.tier] || 1; }
function getDemandTagMultiplier(name){ const meta=POTION_ORDER_META[name]; if(!meta || !Array.isArray(dailyDemandTags)) return 1; let mul=1; for(let tag of dailyDemandTags){ if(meta.tags.includes(tag)) mul*=2.2; if(tag==="war" && (meta.tags.includes("healing") || meta.tags.includes("courage"))) mul*=1.6; if(tag==="exam" && (meta.tags.includes("magic") || meta.tags.includes("focus"))) mul*=1.8; if(tag==="insomnia" && meta.tags.includes("sleep")) mul*=2.4; if(tag==="curse" && (meta.tags.includes("holy") || meta.tags.includes("curse"))) mul*=1.9; if(tag==="blackmarket" && meta.tags.includes("forbidden")) mul*=2.1; } return mul; }
function pickPotionForAdventurer(adv){ const weights=ADVENTURER_POTION_WEIGHTS[adv.id] || {"小红药水":40,"清醒露":25,"安眠茶":20,"魔力药水":15}; let options=[]; for(let [name,base] of Object.entries(weights)){ if(!isPotionAvailableForOrders(name)) continue; let weight=base*getPotionTierWeightMultiplier(name)*getDemandTagMultiplier(name); if(adv.alignment==="good" && POTION_ORDER_META[name]?.tier==="forbidden") weight*=.25; if(adv.alignment==="evil" && POTION_ORDER_META[name]?.tier==="forbidden") weight*=1.6; if(adv.status==="中毒" && (name==="祝福药水" || name.includes("麻痹"))) weight*=1.5; if(adv.status==="诅咒" && (name==="祝福药水" || name==="勇气药水" || name==="诅咒毒药")) weight*=1.8; if((adv.status==="轻伤"||adv.status==="重伤") && POTION_ORDER_META[name]?.tags.includes("healing")) weight*=1.8; options.push({value:name,weight}); } if(options.length===0) options.push({value:"小红药水",weight:1}); return weightedChoice(options); }
function getOrderQuantityByPotion(name){ const tier=POTION_ORDER_META[name]?.tier||"normal"; if(tier==="normal") return 1+Math.floor(Math.random()*2)+(shopLevel>=4&&Math.random()<.25?1:0); if(tier==="advanced") return 1+(Math.random()<.35?1:0); return 1; }
function buildAdventurerOrder(adv){ const requiredPotion=pickPotionForAdventurer(adv); const quantity=getOrderQuantityByPotion(requiredPotion); const tier=POTION_ORDER_META[requiredPotion]?.tier||"normal"; const daysLeft=(tier==="rare"||tier==="forbidden")?3:(2+Math.floor(Math.random()*2)); const baseReward=POTION_ORDER_META[requiredPotion]?.baseReward||25; const rewardGold=Math.floor(baseReward*quantity*(daysLeft<=2?1.12:1)*(0.9+Math.random()*0.35)); return {id:nextOrderId++,adventurerId:adv.id,requiredPotion,quantity,daysLeft,rewardGold,status:"pending"}; }
function getPotionStock(name){ if(name==="小红药水") return potion; if(name==="大生命药水") return bigPotion; if(name==="魔力药水") return magicPotion; if(name==="清醒露") return awakePotion; if(name==="安眠茶") return sleepPotion; if(name==="强力安眠茶") return strongSleepPotion; if(name==="勇气药水") return couragePotion; if(name==="祝福药水") return blessPotion; if(name==="诅咒毒药") return cursePotion; if(name==="轻微麻痹致幻剂"||name==="轻微麻痹剂") return lightParalysis; if(name==="强力麻痹致幻剂"||name==="强力麻痹剂") return strongParalysis; return 0; }
function consumePotionAmount(name,qty=1){ if(name==="小红药水") potion-=qty; else if(name==="大生命药水") bigPotion-=qty; else if(name==="魔力药水") magicPotion-=qty; else if(name==="清醒露") awakePotion-=qty; else if(name==="安眠茶") sleepPotion-=qty; else if(name==="强力安眠茶") strongSleepPotion-=qty; else if(name==="勇气药水") couragePotion-=qty; else if(name==="祝福药水") blessPotion-=qty; else if(name==="诅咒毒药") cursePotion-=qty; else if(name==="轻微麻痹致幻剂"||name==="轻微麻痹剂") lightParalysis-=qty; else if(name==="强力麻痹致幻剂"||name==="强力麻痹剂") strongParalysis-=qty; }
function addRandomCommonHerbs(count){ let herbTypes=['mintLeaf','chamomile','rosemary','lavender','sweetRoot']; for(let i=0;i<count;i++){ let type=herbTypes[Math.floor(Math.random()*herbTypes.length)]; if(type==='mintLeaf') mintLeaf++; else if(type==='chamomile') chamomile++; else if(type==='rosemary') rosemary++; else if(type==='lavender') lavender++; else if(type==='sweetRoot') sweetRoot++; } }
function addRandomRareMaterial(count=1){ for(let i=0;i<count;i++){ let roll=Math.random(); if(roll<.28) holyFlower++; else if(roll<.52) poisonMushroom++; else if(roll<.70) redOre++; else if(roll<.88) blueOre++; else if(roll<.97) blackOre++; else magicCrystal++; } }
function addDemandTag(tag){ if(!dailyDemandTags.includes(tag)) dailyDemandTags.push(tag); }


function unlockAchievement(achId) { if(achievements[achId] && !achievements[achId].unlocked) { achievements[achId].unlocked=true; let r=achievements[achId].reward; let msg=`🏆 成就解锁：${achievements[achId].name}！奖励：`; if(r.gold){ gold+=r.gold; addIncome(r.gold); msg+=`${r.gold}金币 `; } if(r.herb){ let types=['mintLeaf','chamomile','rosemary','lavender','sweetRoot']; for(let i=0;i<r.herb;i++){ let t=types[Math.floor(Math.random()*types.length)]; if(t==='mintLeaf') mintLeaf++; else if(t==='chamomile') chamomile++; else if(t==='rosemary') rosemary++; else if(t==='lavender') lavender++; else if(t==='sweetRoot') sweetRoot++; } msg+=`${r.herb}草药 `; } if(r.rare){ holyFlower+=r.rare; msg+=`${r.rare}圣露花 `; } if(r.crystal){ magicCrystal+=r.crystal; msg+=`${r.crystal}魔力结晶 `; } showMessage(msg,false); updateUI(); refreshAchievementUI(); } }
function checkAchievements() { if(totalCrafts>=1) unlockAchievement("first_potion"); if(totalDeliverySuccess>=1) unlockAchievement("first_delivery"); if(shopLevel>=2) unlockAchievement("first_upgrade"); if(reputation>=500) unlockAchievement("reputation_500"); if(gold>=1000) unlockAchievement("gold_1000"); if(totalCrafts>=10) unlockAchievement("craft_10"); if(totalDeliverySuccess>=10) unlockAchievement("delivery_10"); let unlockedCount=recipes.filter(r=>r.unlocked).length; if(unlockedCount>=recipes.length) unlockAchievement("all_recipes"); let allFavor=adventurers.every(a=>a.favor>=100); if(allFavor) unlockAchievement("all_favor"); if(shopLevel>=5) unlockAchievement("lv5_shop"); if(unlockedEndless) unlockAchievement("endless_mode"); if(gold>=5000) unlockAchievement("rich_5000"); }
function refreshAchievementUI() { let container=document.getElementById("achievementsList"); if(!container) return; container.innerHTML=""; for(let [id,ach] of Object.entries(achievements)){ let card=document.createElement("div"); card.className=`achievement-card ${ach.unlocked?"":"locked"}`; card.innerHTML=`<div class="achievement-name">${ach.name}</div><div class="achievement-desc">${ach.desc}</div><div class="achievement-reward">奖励: ${Object.entries(ach.reward).map(([k,v])=>`${v}${k==='gold'?'金币':k==='herb'?'草药':k==='rare'?'稀有花':'魔力结晶'}`).join(', ')}</div>`; container.appendChild(card); } let unlockedRecipes=recipes.filter(r=>r.unlocked).length; document.getElementById("questRecipeStatus").innerText=`${unlockedRecipes}/6`; let fullFavorCount=adventurers.filter(a=>a.favor>=100).length; document.getElementById("questFavorStatus").innerText=`${fullFavorCount}/6`; let endingContainer=document.getElementById("endingGalleryList"); if(endingContainer){ endingContainer.innerHTML=""; let endings=["黑暗结局","邪恶结局","普通结局","善良结局","神圣结局"]; endings.forEach(e=>{ if(unlockedEndings.includes(e)){ let badge=document.createElement("div"); badge.style.background="#d48806"; badge.style.padding="8px 16px"; badge.style.borderRadius="30px"; badge.style.color="white"; badge.innerText=e; endingContainer.appendChild(badge); } }); } }
function updateMainQuestProgress() { let progress=0; if(shopLevel>=5 && reputation>=100) progress=100; else if(shopLevel>=5) progress=80; else if(reputation>=100) progress=70; else progress=Math.min(70, Math.floor((shopLevel-1)/4*70)+Math.floor(reputation/100*30)); document.getElementById("mainQuestProgress").style.width=`${progress}%`; let statusSpan=document.getElementById("questMainStatus"); if(statusSpan) statusSpan.innerText=(shopLevel>=5&&reputation>=100)?"已完成":"未完成"; }
function triggerEnding() {
  if(gameCompleted) return;
  let endingType="";
  if(shopLevel>=5 && reputation>=100){ endingType="神圣结局"; gameCompleted=true; unlockedEndless=true; showMessage("🎉 恭喜通关！解锁无尽模式，可以继续游玩！",false); }
  else if(shopLevel>=5 && reputation>=0) endingType="善良结局";
  else if(reputation>=200) endingType="善良结局";
  else if(reputation>=50) endingType="普通结局";
  else if(reputation>=-100) endingType="灰色结局";
  else if(reputation>=-250) endingType="邪恶结局";
  else endingType="黑暗结局";
  if(!unlockedEndings.includes(endingType)) unlockedEndings.push(endingType);
  const totalPotions=Object.values(craftCount).reduce((a,b)=>a+b,0);
  const trusted=adventurers.filter(a=>a.favor>=80 && a.status!=="死亡").length;
  const dead=adventurers.filter(a=>a.status==="死亡").length;
  const endingMap={"神圣结局":"你的店铺不再只是商店，而成为小镇的疗愈所。圣殿牧师把你的名字写进祈祷词，守护骑士为你立下誓约。冒险者们称这里为归途的灯。","善良结局":"你没有拯救所有人，但很多人在最危险的时候想起了你的药瓶。小镇居民会主动为你留草药，冒险者也愿意带回稀有矿石。","普通结局":"炼金炉的火稳定燃烧，账本有亏有盈。你成为小镇里可靠但不耀眼的店主，故事还会继续。","灰色结局":"你学会了在善意与利润之间保持沉默。有人感谢你，也有人避开你的橱窗；你的药水有效，但价格总让人犹豫。","邪恶结局":"黑市巷口开始流传你的瓶标。你赚到了钱，也得到畏惧；夜里敲门的客人越来越多，白天进店的居民越来越少。","黑暗结局":"炼金炉的火焰变成幽蓝色。你拥有许多秘密配方，却很少再听见感谢。有人说你的店铺仍在营业，只是不再开给活人。"};
  document.getElementById("endingText").innerHTML=`<strong>${endingType}</strong><br>${endingMap[endingType]}<br><br><div style="background:#f5f5f5;padding:12px;border-radius:12px;text-align:left;line-height:1.7;"><div>店铺等级：Lv.${shopLevel}</div><div>最终声望：${reputation}（${getReputationTier().name}）</div><div>可信赖冒险者：${trusted} 人</div><div>死亡冒险者：${dead} 人</div><div>累计炼制：${totalPotions} 瓶</div></div><br>${gameCompleted?"无尽模式已解锁，可以继续经营！":"这不是终点，只是这段经营留下的传闻。"}`;
  document.getElementById("endingModal").style.display="flex";
  refreshAchievementUI(); updateMainQuestProgress();
}

function getMaterialPrice(material) { let basePrices={ mintLeaf:8, chamomile:8, rosemary:9, lavender:9, sweetRoot:7, holyFlower:25, poisonMushroom:25, redOre:35, blueOre:35, blackOre:40, crystal:50 }; let base=basePrices[material]||10; let reputationFactor=1.2-(Math.max(-500,Math.min(500,reputation))+500)/1000*0.6; return Math.floor(base*reputationFactor); }
function buyMaterial(material, amount) { let price=getMaterialPrice(material)*amount; if(gold>=price){ gold-=price; addExpense(price); if(material==='mintLeaf') mintLeaf+=amount; else if(material==='chamomile') chamomile+=amount; else if(material==='rosemary') rosemary+=amount; else if(material==='lavender') lavender+=amount; else if(material==='sweetRoot') sweetRoot+=amount; else if(material==='holyFlower') holyFlower+=amount; else if(material==='poisonMushroom') poisonMushroom+=amount; else if(material==='redOre') redOre+=amount; else if(material==='blueOre') blueOre+=amount; else if(material==='blackOre') blackOre+=amount; else if(material==='crystal') magicCrystal+=amount; updateUI(); showMessage(`购买了 ${amount} 个材料`,false); refreshMaterialUI(); } else showMessage("金币不足！",true); }
function refreshMaterialUI() { if(document.getElementById("matMintLeaf")){ document.getElementById("matMintLeaf").innerText=mintLeaf; document.getElementById("matChamomile").innerText=chamomile; document.getElementById("matRosemary").innerText=rosemary; document.getElementById("matLavender").innerText=lavender; document.getElementById("matSweetRoot").innerText=sweetRoot; document.getElementById("matHolyFlower").innerText=holyFlower; document.getElementById("matPoisonMushroom").innerText=poisonMushroom; document.getElementById("matRedOre").innerText=redOre; document.getElementById("matBlueOre").innerText=blueOre; document.getElementById("matBlackOre").innerText=blackOre; document.getElementById("matCrystal").innerText=magicCrystal; } let priceHtml=`声望值: ${reputation}<br><small>野薄荷叶:${getMaterialPrice('mintLeaf')}金 微光洋甘菊:${getMaterialPrice('chamomile')}金<br>尖刺迷迭香:${getMaterialPrice('rosemary')}金 绒絮薰衣草:${getMaterialPrice('lavender')}金<br>甜根草:${getMaterialPrice('sweetRoot')}金 圣露花:${getMaterialPrice('holyFlower')}金<br>毒腺菇:${getMaterialPrice('poisonMushroom')}金 赤铁髓:${getMaterialPrice('redOre')}金<br>蓝萤石:${getMaterialPrice('blueOre')}金 黑银矿:${getMaterialPrice('blackOre')}金</small>`; document.getElementById("exchangePrices").innerHTML=priceHtml; }
function getAlchemyRecipeButtonImage(recipe){
  const map = {
    0:"Assets/按钮button/炼金台/hongyaoshui 小红药水.png",
    1:"Assets/按钮button/炼金台/大生命药水.png",
    2:"Assets/按钮button/炼金台/moli 魔力药水.png",
    3:"Assets/按钮button/炼金台/强力魔力药水.png",
    4:"Assets/按钮button/炼金台/qingxing 清醒露.png",
    5:"Assets/按钮button/炼金台/anmian 安眠茶.png",
    6:"Assets/按钮button/炼金台/强力安眠茶.png",
    7:"Assets/按钮button/炼金台/勇气药水.png",
    8:"Assets/按钮button/炼金台/祝福药水.png",
    9:"Assets/按钮button/炼金台/诅咒药水.png",
    10:"Assets/按钮button/炼金台/轻微麻痹致幻剂.png",
    11:"Assets/按钮button/炼金台/强力麻痹致幻剂.png"
  };
  return map[recipe.id] || "";
}

let selectedAlchemyRecipeId = null;

function hasEnoughMaterials(recipe, qty=1){
  const matVars={ mintLeaf, chamomile, rosemary, lavender, sweetRoot, holyFlower, poisonMushroom, redOre, blueOre, blackOre, magicCrystal };
  for(let [mat,count] of Object.entries(recipe.cost || {})){
    if((matVars[mat] || 0) < count * qty) return false;
  }
  return true;
}

function consumeRecipeMaterials(recipe, qty=1){
  for(let [mat,count] of Object.entries(recipe.cost || {})){
    const totalNeed = count * qty;
    if(mat==='mintLeaf') mintLeaf-=totalNeed;
    else if(mat==='chamomile') chamomile-=totalNeed;
    else if(mat==='rosemary') rosemary-=totalNeed;
    else if(mat==='lavender') lavender-=totalNeed;
    else if(mat==='sweetRoot') sweetRoot-=totalNeed;
    else if(mat==='holyFlower') holyFlower-=totalNeed;
    else if(mat==='poisonMushroom') poisonMushroom-=totalNeed;
    else if(mat==='redOre') redOre-=totalNeed;
    else if(mat==='blueOre') blueOre-=totalNeed;
    else if(mat==='blackOre') blackOre-=totalNeed;
    else if(mat==='magicCrystal') magicCrystal-=totalNeed;
  }
  syncLegacyMaterials();
}

function recordCraftCount(recipe, qty=1){
  if(recipe.name==="小红药水") craftCount.smallPotion+=qty;
  else if(recipe.name==="大生命药水") craftCount.bigPotion+=qty;
  else if(recipe.name==="祝福药水") craftCount.blessPotion+=qty;
  else if(recipe.name==="诅咒毒药") craftCount.cursePotion+=qty;
  totalCrafts+=qty;
}

function craftSingleRecipe(recipe){
  if(!recipe || !recipe.unlocked) return;
  if(!hasEnoughMaterials(recipe, 1)){
    showMessage("材料不足！", true);
    return;
  }
  selectedAlchemyRecipeId = recipe.id;
  consumeRecipeMaterials(recipe, 1);
  recipe.produce(1);
  recordCraftCount(recipe, 1);
  updateUI();
  renderDynamicRecipes();
  updateBatchSelect();
  showMessage(`✅ 成功炼制 ${recipe.name}！`, false);
  checkAchievements();
}

function renderDynamicRecipes(){
  const container=document.getElementById("dynamicRecipeList");
  if(!container) return;
  container.innerHTML="";

  const unlockedRecipes = recipes.filter(recipe => recipe.unlocked);
  unlockedRecipes.forEach(recipe=>{
    const btn=document.createElement("button");
    const enough = hasEnoughMaterials(recipe, 1);
    btn.type="button";
    btn.className=`recipe-btn alchemy-recipe-btn recipe-${recipe.id}${selectedAlchemyRecipeId===recipe.id?" selected":""}${enough?"":" disabled"}`;
    btn.setAttribute("aria-label", recipe.name);
    btn.dataset.recipeId = String(recipe.id);
    const imgPath = getAlchemyRecipeButtonImage(recipe);
    if(imgPath) btn.style.backgroundImage=`url("${imgPath}")`;
    if(!enough) btn.disabled=true;
    btn.addEventListener("click",()=>craftSingleRecipe(recipe));
    container.appendChild(btn);
  });

  if(container.children.length===0){
    container.innerHTML="<div class='alchemy-empty'>暂无可用配方</div>";
  }
}
function updateBatchSelect() {
  let select=document.getElementById("batchRecipeSelect");
  if(!select) return;
  const previous = select.value || (selectedAlchemyRecipeId !== null ? String(selectedAlchemyRecipeId) : "");
  select.innerHTML="";
  recipes.forEach(recipe=>{ if(recipe.unlocked) select.add(new Option(recipe.name, recipe.id)); });
  if(previous && Array.from(select.options).some(opt=>opt.value===previous)) select.value = previous;
  if(select.options.length>0) updateBatchMaxByRecipe();
}
function updateBatchMaxByRecipe() { let select=document.getElementById("batchRecipeSelect"); let slider=document.getElementById("batchQuantity"); let valueSpan=document.getElementById("batchQuantityValue"); let maxSpan=document.getElementById("batchMaxValue"); if(!select||!slider) return; let recipeId=parseInt(select.value); let recipe=recipes.find(r=>r.id===recipeId); if(!recipe) return; let maxQty=999; for(let [mat,need] of Object.entries(recipe.cost)) { if(need>0){ let have=0; if(mat==='mintLeaf') have=mintLeaf; else if(mat==='chamomile') have=chamomile; else if(mat==='rosemary') have=rosemary; else if(mat==='lavender') have=lavender; else if(mat==='sweetRoot') have=sweetRoot; else if(mat==='holyFlower') have=holyFlower; else if(mat==='poisonMushroom') have=poisonMushroom; else if(mat==='redOre') have=redOre; else if(mat==='blueOre') have=blueOre; else if(mat==='blackOre') have=blackOre; else if(mat==='magicCrystal') have=magicCrystal; maxQty=Math.min(maxQty, Math.floor(have/need)); } } maxQty=Math.min(maxQty,99); maxQty=Math.max(maxQty,1); slider.max=maxQty; slider.value=Math.min(slider.value,maxQty); valueSpan.innerText=slider.value; if(maxSpan) maxSpan.innerText=maxQty; }
function craftBatch() {
  if(shopLevel<2){ showMessage("店铺等级不足，无法批量炼制！",true); return; }
  let recipeId=parseInt(document.getElementById("batchRecipeSelect").value);
  let recipe=recipes.find(r=>r.id===recipeId);
  if(!recipe || !recipe.unlocked) return;
  let qty=parseInt(document.getElementById("batchQuantity").value);
  if(isNaN(qty)||qty<1) qty=1;
  if(!hasEnoughMaterials(recipe, qty)){
    showMessage("材料不足！",true);
    return;
  }
  selectedAlchemyRecipeId = recipe.id;
  consumeRecipeMaterials(recipe, qty);
  recipe.produce(qty);
  recordCraftCount(recipe, qty);
  updateUI();
  renderDynamicRecipes();
  updateBatchSelect();
  updateBatchMaxByRecipe();
  showMessage(`⚡ 批量炼制 ${qty} 瓶 ${recipe.name} 成功！`,false);
  checkAchievements();
}

function generateDailyQueue() {
  // 基础顾客数量 3~6 个
  let baseSize = 3 + Math.floor(Math.random() * 4);
  let extra = (typeof extraQueueSize === 'number' && extraQueueSize > 0) ? extraQueueSize : 0;
  let queueSize = Math.min(baseSize + extra, 9);  // 最多 9 个（避免无限）
  
  let available = adventurers.filter(a => a.status !== "死亡");
  if (available.length === 0) return;

  // 过滤掉已经有未完成订单的冒险者（防止重复接单）
  const busyIds = new Set(
    orders.filter(o => o.status === "pending").map(o => o.adventurerId)
  );
  let candidates = available.filter(adv => !busyIds.has(adv.id));
  if (candidates.length === 0) {
    queue = [];
    return;
  }

  // 权重计算
  let weighted = candidates.map(adv => {
    let weight = 1.0;
    if (adv.alignment === 'good') {
      if (reputation >= 200) weight *= 3;
      else if (reputation >= 100) weight *= 2;
      else if (reputation >= 0) weight *= 1.5;
      else if (reputation < -100) weight *= 0.3;
    } else if (adv.alignment === 'evil') {
      if (reputation <= -200) weight *= 3;
      else if (reputation <= -100) weight *= 2;
      else if (reputation <= 0) weight *= 1.5;
      else if (reputation > 100) weight *= 0.3;
    } else if (adv.alignment === 'neutral') {
      let absRep = Math.abs(reputation);
      if (absRep >= 200) weight *= 2;
      else if (absRep >= 100) weight *= 1.5;
    }
    if (adv.level >= 3 && shopLevel < 3) weight *= 0.5;
    if (adv.level >= 3 && shopLevel >= 3) weight *= 1.5;
    if (adv.id === 8 && (reputation < 150 || shopLevel < 4)) weight *= 0.2;
    if (adv.id === 10 && (reputation > -150 || shopLevel < 4)) weight *= 0.2;
    if (adv.id === 15 && shopLevel < 3) weight *= 0.3;
    return { adv, weight };
  });

  let newQueue = [];
  let usedIds = new Set();
  for (let i = 0; i < queueSize; i++) {
    let availableWeighted = weighted.filter(item => !usedIds.has(item.adv.id));
    if (availableWeighted.length === 0) break;
    let totalWeight = availableWeighted.reduce((s, item) => s + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let cum = 0;
    for (let item of availableWeighted) {
      cum += item.weight;
      if (rand <= cum) {
        newQueue.push({ adventurerId: item.adv.id });
        usedIds.add(item.adv.id);
        break;
      }
    }
  }
  // 最终限制队列长度不超过 9
  if (newQueue.length > 9) newQueue.length = 9;
  queue = newQueue;
  renderQueue();
}
function generateDailyResidents() {
  let baseCount = Math.floor(Math.random() * 4);  // 0~3
  let modifier = (typeof residentOrderModifier === 'number') ? residentOrderModifier : 0;
  // 高声望与季节事件会让居民更愿意上门；低声望保留最低活跃度。
  if(reputation >= 200 && Math.random() < 0.35) modifier += 1;
  if(reputation <= -150 && Math.random() < 0.25) modifier -= 1;
  let count = baseCount + modifier;
  if (count < 0) count = 0;
  if (count > 5) count = 5;   // 扩展后上限 5 个，避免居民事件池浪费
  residents = [];
  let usedScenarioIds = new Set();
  for (let i = 0; i < count; i++) {
    let season = getCurrentSeason().name;
    let candidates = residentScenarios
      .filter(s => !usedScenarioIds.has(s.id))
      .map(s => {
        let w = Number(s.weight || 5);
        const text = `${s.name || ""}${s.need || ""}`;
        if(season === "归仓季" && /(丰收|农|耕牛|粮|磨坊|藤蔓|园丁)/.test(text)) w *= 1.35;
        if(season === "持夜季" && /(寒|夜|守夜|失眠|安眠|老人|婴儿)/.test(text)) w *= 1.35;
        if(season === "虹光季" && /(毒|蚊|水井|鱼|草|采药|虫)/.test(text)) w *= 1.35;
        if(season === "结晶季" && /(考|旅人|婚礼|祝福|猫|醒神)/.test(text)) w *= 1.25;
        return { value:s, weight:w };
      });
    let scenario = weightedChoice(candidates) || residentScenarios[Math.floor(Math.random() * residentScenarios.length)];
    usedScenarioIds.add(scenario.id);
    residents.push({ id: `resident_${day}_${i}`, scenario });
  }
  renderResidents();
}
function updateResidentVisibility() {
  const residentArea = document.querySelector(".resident-area");
  const hasResidentOrder = Array.isArray(residents) && residents.length > 0;

  document.body.classList.toggle("resident-available", hasResidentOrder);

  if (residentArea) {
    residentArea.style.display = hasResidentOrder ? "block" : "none";
    residentArea.style.pointerEvents = hasResidentOrder ? "auto" : "none";
    residentArea.style.cursor = hasResidentOrder ? "pointer" : "default";
  }
}

function renderResidents() {
  let container=document.getElementById("residentsList");
  if(!container){
    updateResidentVisibility();
    return;
  }

  if(!Array.isArray(residents) || residents.length===0){
    // 没有居民订单时不显示“今日没有小镇居民来访”，并隐藏小镇居民立绘。
    container.innerHTML="";
    updateResidentVisibility();
    return;
  }

  container.innerHTML="";
  residents.forEach(res=>{
    let s=res.scenario;
    let card=document.createElement("div");
    card.className="queue-item resident-order-card";
    card.style.background="#f0f8ff";
    card.style.borderColor="#87ceeb";
    card.innerHTML=`<div class="queue-emoji">${s.emoji}</div><div class="queue-info"><div class="queue-name">${s.name}</div><div style="font-size:14px;color:#666;">${s.need}</div><div style="font-size:12px;color:#2196F3;margin-top:4px;">💰 收购价: ${s.payment}金币</div></div>`;
    card.onclick=()=>openResidentTrade(res);
    container.appendChild(card);
  });

  updateResidentVisibility();
}
function checkPotionStock(potionName) { return getPotionStock(potionName)>0; }
function consumePotion(potionName) { consumePotionAmount(potionName,1); }
function openResidentTrade(resident) {
  if(!resident || !resident.scenario) return;
  let scenario=resident.scenario;
  let modalContent=`<h2>🏘️ 居民需求</h2><div style="font-size:20px;margin:20px 0;"><div style="font-size:48px;">${scenario.emoji}</div><div style="font-weight:bold;margin:10px 0;">${scenario.name}</div><div style="color:#666;">${scenario.need}</div><div style="color:#2196F3;margin-top:10px;">💰 收购价: ${scenario.payment}金币</div></div><div style="background:#f5f5f5;padding:15px;border-radius:12px;margin:15px 0;"><div style="font-weight:bold;margin-bottom:10px;">可接受的药剂：</div><div id="residentPotionOptions" style="display:grid;gap:8px;"></div></div><button id="closeResidentTradeBtn" class="secondary">取消</button>`;
  const eventModal = document.getElementById("eventModal");
  if(!eventModal) return;
  eventModal.innerHTML=`<div class="modal-content">${modalContent}</div>`;
  eventModal.style.display="flex";
  let optionsContainer=document.getElementById("residentPotionOptions");
  scenario.acceptablePotions.forEach(potionName=>{
    let btn=document.createElement("button");
    btn.textContent=`出售 ${potionName}`;
    btn.style.background="#4caf50";
    btn.style.width="100%";
    if(!checkPotionStock(potionName)){
      btn.disabled=true;
      btn.style.background="#999";
      btn.textContent+=" (缺货)";
    }
    btn.onclick=()=>sellToResident(resident,potionName);
    optionsContainer.appendChild(btn);
  });
  document.getElementById("closeResidentTradeBtn").onclick=()=>{ eventModal.style.display="none"; };
}
function sellToResident(resident,potionName) { if(!checkPotionStock(potionName)){ showMessage("库存不足",true); return; } consumePotion(potionName); let tier=POTION_ORDER_META[potionName]?.tier || "normal"; let tierBonus=(tier==="advanced")?8:(tier==="rare"?18:(tier==="forbidden"?12:0)); let payment=resident.scenario.payment + tierBonus; gold+=payment; addIncome(payment); if(tier==="forbidden") reputation=Math.max(-500,reputation-2); else reputation=Math.min(500,reputation+1); residents=residents.filter(r=>r.id!==resident.id); document.getElementById("eventModal").style.display="none"; showMessage(`✅ 成功出售 ${potionName}，获得 ${payment} 金币！`,false); updateUI(); renderResidents(); updateResidentVisibility(); }
function renderQueue() {
  let container=document.getElementById("queueList"); if(!container) return;
  if(queue.length===0){ container.innerHTML="<div style='text-align:center;color:gray;'>今日没有更多顾客</div>"; return; }
  container.innerHTML="";
  for(let i=0;i<queue.length;i++){
    let adv=adventurers.find(a=>a.id===queue[i].adventurerId); if(!adv) continue;
    let card=document.createElement("div"); card.className="queue-item";
    card.innerHTML=`<div class="queue-emoji">${adv.emoji}</div><div class="queue-info"><div class="queue-name">${adv.name}</div><div>状态: ${adv.status}</div></div>`;
    card.addEventListener("click",()=>{
      let hasOrder=orders.some(o=>o.adventurerId===adv.id && o.status==="pending");
      if(hasOrder){ showMessage(`${adv.name} 已有未完成订单，请先交付后再接新订单。`,true); return; }
      let newOrder=buildAdventurerOrder(adv);
      orders.push(newOrder);
      showMessage(`📜 收到订单：${adv.name} 需要 ${newOrder.requiredPotion} x${newOrder.quantity}，请在 ${newOrder.daysLeft} 天内交付，报酬 ${newOrder.rewardGold} 金。`,false);
      queue.splice(i,1); renderQueue();
      document.getElementById("visitorEmoji").innerHTML=adv.emoji;
      document.getElementById("visitorName").innerHTML=adv.name;
      document.getElementById("visitorStatus").innerHTML=`状态：${adv.status}<br>已发布订单，请在订单列表中交付`;
      renderOrdersList();
    });
    container.appendChild(card);
  }
}
function renderOrdersList() { let container=document.getElementById("ordersList"); if(!container) return; let pending=orders.filter(o=>o.status==="pending"); if(pending.length===0){ container.innerHTML="暂无待交付订单"; return; } container.innerHTML=""; for(let order of pending){ let adv=adventurers.find(a=>a.id===order.adventurerId); if(!adv) continue; let orderDiv=document.createElement("div"); orderDiv.className="order-card"; orderDiv.innerHTML=`<div class="order-info"><div>${adv.emoji} ${adv.name}</div><div>📦 ${order.requiredPotion} x${order.quantity} | 剩余${order.daysLeft}天 | 报酬${order.rewardGold}金</div></div><div class="order-buttons"><button class="deliver-order-btn" data-order-id="${order.id}">交付</button></div>`; container.appendChild(orderDiv); } document.querySelectorAll('.deliver-order-btn').forEach(btn=>{ btn.addEventListener('click',(e)=>{ let orderId=parseInt(btn.getAttribute('data-order-id')); deliverOrderById(orderId); }); }); }
let pendingOrderId=null;
function deliverOrderById(orderId) {
  let order=orders.find(o=>o.id===orderId && o.status==="pending"); if(!order){ showMessage("订单不存在或已完成",true); return; }
  let adv=adventurers.find(a=>a.id===order.adventurerId); if(!adv){ showMessage("冒险者不存在",true); return; }
  let stock=getPotionStock(order.requiredPotion);
  if(stock<order.quantity){ pendingOrderId=orderId; document.getElementById("shortageMessage").innerHTML=`您缺少 ${order.quantity} 瓶 ${order.requiredPotion}，无法交付给 ${adv.name}。请选择：`; document.getElementById("shortageModal").style.display="flex"; return; }
  consumePotionAmount(order.requiredPotion,order.quantity);
  let finalReward=Math.floor(order.rewardGold*deliveryBonus*reputationBonusPrice*potionQualityModifier);
  gold+=finalReward; addIncome(finalReward);
  let tier=POTION_ORDER_META[order.requiredPotion]?.tier || "normal";
  let favorGain=Math.floor(Math.random()*6)+5+(tier==="rare"?4:(tier==="advanced"?2:0));
  adv.favor=Math.min(100,adv.favor+favorGain); adv.exp+=10+(tier==="rare"?8:(tier==="advanced"?4:0));
  let leveled=false; while(adv.exp>=adv.expToNext){ adv.exp-=adv.expToNext; adv.level++; adv.expToNext=Math.floor(adv.expToNext*1.2); leveled=true; }
  if(leveled) showMessage(`🎉 ${adv.name} 升到 Lv.${adv.level}！`,false);
  showMessage(`✅ 交付 ${order.quantity} 瓶 ${order.requiredPotion} 给 ${adv.name}，获得 ${finalReward} 金币！好感+${favorGain}`,false);
  if(!firstDeliveryBonusMap[adv.id]){ firstDeliveryBonusMap[adv.id]=true; gold+=30; addIncome(30); showMessage(`🎁 首次交付额外30金币！`,false); }
  order.status="completed"; dailyDeliverySuccess++; totalDeliverySuccess++; updateUI(); renderOrdersList(); checkAchievements(); tryGiftFromAdventurer(adv);
}
function tryGiftFromAdventurer(adv) { if(Math.random()>0.3) return; let msg=""; if(adv.id===0){ let g=Math.floor(Math.random()*2)+1; mintLeaf+=g; msg=`${adv.name}赠送${g}野薄荷叶`; } else if(adv.id===3){ let g=Math.random()<0.5?1:0; if(g){ holyFlower+=g; msg=`${adv.name}赠送${g}圣露花`; } } else if(adv.id===4){ let g=Math.floor(Math.random()*15)+10; gold+=g; addIncome(g); msg=`${adv.name}捐赠${g}金币`; } else if(adv.id===1){ let g=10; gold+=g; addIncome(g); msg=`${adv.name}宣传得${g}金币`; } else if(adv.id===2){ let p=Math.random()<0.5?"小红药水":"大生命药水"; if(p==="小红药水") potion++; else bigPotion++; msg=`${adv.name}帮你炼制了${p}`; } else if(adv.id===5){ let g=Math.random()<0.7?1:0; if(g){ poisonMushroom+=g; msg=`${adv.name}赠送${g}毒腺菇`; } } if(msg) showMessage(msg,false); updateUI(); }
function handleShortageInform() { if(pendingOrderId){ let order=orders.find(o=>o.id===pendingOrderId); if(order){ let adv=adventurers.find(a=>a.id===order.adventurerId); if(adv){ adv.favor=Math.max(0,adv.favor-10); showMessage(`😢 您告知 ${adv.name} 缺货，他失望地离开了，好感度-10。`,true); } order.status="failed"; } renderOrdersList(); } document.getElementById("shortageModal").style.display="none"; pendingOrderId=null; }
function handleShortageGet() { document.getElementById("shortageModal").style.display="none"; pendingOrderId=null; showMessage("快去炼制药水吧！",false); }

function updateUI() {
  document.getElementById("gold").innerText=gold;
  document.getElementById("dayCount").innerText=day;
  document.getElementById("maxDay").innerText=maxDay;
  document.getElementById("shopLevel").innerText=shopLevel;
  document.getElementById("reputationValue").innerText=reputation;
  let season=getCurrentSeason();
  let seasonDisplay=document.getElementById("seasonDisplay");
  if(seasonDisplay) seasonDisplay.innerText=`${season.emoji} ${season.name}`;
  let seasonIcon=document.querySelector(".season-icon");
  if(seasonIcon && SEASON_ICON_MAP[season.name]){
    const seasonIconUrl = `url("${SEASON_ICON_MAP[season.name]}")`;
    seasonIcon.style.setProperty("--season-icon-url", seasonIconUrl);
    seasonIcon.style.setProperty("background-image", seasonIconUrl, "important");
  }
  if(document.getElementById("mintLeafCount")){
    document.getElementById("mintLeafCount").innerText=mintLeaf;
    document.getElementById("chamomileCount").innerText=chamomile;
    document.getElementById("rosemaryCount").innerText=rosemary;
    document.getElementById("lavenderCount").innerText=lavender;
    document.getElementById("sweetRootCount").innerText=sweetRoot;
    document.getElementById("holyFlowerCount").innerText=holyFlower;
    document.getElementById("poisonMushroomCount").innerText=poisonMushroom;
    document.getElementById("redOreCount").innerText=redOre;
    document.getElementById("blueOreCount").innerText=blueOre;
    document.getElementById("blackOreCount").innerText=blackOre;
    document.getElementById("crystalCount").innerText=magicCrystal;
  }
  if(document.getElementById("materialModal") && document.getElementById("materialModal").style.display==="flex") refreshMaterialUI();
  updateMainQuestProgress();
  updateInventoryDisplay();
  syncLegacyMaterials();
}
function updateInventoryDisplay() {
  const inventoryGrid=document.getElementById("inventoryGrid");
  if(!inventoryGrid) return;
  if(typeof rightInventoryMode !== "undefined" && rightInventoryMode === "bestiary"){
    renderRightAdventurerGrid();
    return;
  }
  inventoryGrid.classList.remove("bestiary-grid-mode");
  const potions=[
    { name:"小红药水", icon:"💊", count:potion, desc:"恢复20HP" },
    { name:"大生命药水", icon:"❤️", count:bigPotion, desc:"恢复50HP" },
    { name:"魔力药水", icon:"💙", count:magicPotion, desc:"恢复30MP" },
    { name:"清醒露", icon:"☕", count:awakePotion, desc:"保持清醒" },
    { name:"安眠茶", icon:"🌙", count:sleepPotion, desc:"引入睡眠" },
    { name:"强力安眠茶", icon:"😴", count:strongSleepPotion, desc:"强效安眠" },
    { name:"勇气药水", icon:"🦁", count:couragePotion, desc:"解除诅咒" },
    { name:"祝福药水", icon:"✨", count:blessPotion, desc:"恢复全体状态" },
    { name:"诅咒毒药", icon:"💀", count:cursePotion, desc:"邪恶之力" },
    { name:"轻微麻痹剂", icon:"😵", count:lightParalysis, desc:"麻痹幻觉" },
    { name:"强力麻痹剂", icon:"💫", count:strongParalysis, desc:"强效麻痹" }
  ];
  inventoryGrid.innerHTML="";
  potions.forEach(p=>{
    const item=document.createElement("div");
    item.className="inventory-item";
    if(p.count===0) item.style.opacity="0.5";
    item.innerHTML=`<div class="inventory-item-icon">${p.icon}</div><div class="inventory-item-name">${p.name}</div><div class="inventory-item-count">×${p.count}</div><div class="inventory-item-desc">${p.desc}</div>`;
    inventoryGrid.appendChild(item);
  });
}
function addIncome(amount){ dailyIncome+=amount; }
function addExpense(amount){ dailyExpense+=amount; }
function resetDailyStats(){ dailyIncome=0; dailyExpense=0; dailyDeliverySuccess=0; }
function resetDailyBuff(){ deliveryBonus=1.0; dailyDemandTags=[]; }
function getReputationModifiers() { if(reputation<=-200) return {priceMul:1.3,visitBonus:-0.4,eventEvilBonus:0.3}; if(reputation<=0) return {priceMul:1.1,visitBonus:-0.1,eventEvilBonus:0.1}; if(reputation<=100) return {priceMul:1.0,visitBonus:0,eventEvilBonus:0}; if(reputation<=200) return {priceMul:0.9,visitBonus:0.2,eventEvilBonus:-0.2}; return {priceMul:0.8,visitBonus:0.4,eventEvilBonus:-0.4}; }
function updateRecipeUnlockStatus() {
  if(shopLevel>=2) recipes[2].unlocked=true;
  if(shopLevel>=3) { recipes[3].unlocked=true; recipes[6].unlocked=true; }
  if(totalCrafts>=5) recipes[7].unlocked=true;
  if(reputation>=150) recipes[8].unlocked=true;
  if(reputation<=-50) recipes[9].unlocked=true;
  if(reputation<=0) recipes[10].unlocked=true;
  if(reputation<=-100) recipes[11].unlocked=true;
  const recipeBookPage = document.getElementById("recipeBookPage"); if(recipeBookPage && !recipeBookPage.classList.contains("hidden-page")) renderRecipeBook();
  if(document.body.classList.contains("alchemy-open")){ renderDynamicRecipes(); updateBatchSelect(); updateBatchAreaVisibility(); }
  checkAchievements();
}
function updateBatchAreaVisibility(){ let area=document.getElementById("batchCraftArea"); if(area) area.style.display=(shopLevel>=2)?"block":"none"; }

// =================== 增强版突发事件系统 ===================
const EVENT_POOL_POSITIVE = [
  { id:"weather_good", name:"天气影响收成", type:"positive", weight:7, effect:()=>{ gardenYieldModifier=1.5; showMessage("昨夜异常天气反而让迷雾森林魔力沉降，今日后花园材料收成+50%。",false); updateUI(); } },
  { id:"magic_crystal_field", name:"田地里的魔力结晶", type:"positive", weight:3.5, effect:()=>{ let add=1+Math.floor(Math.random()*2); magicCrystal+=add; addDemandTag("magic"); showMessage(`清晨整理后花园时发现魔力结晶×${add}，今日魔力类需求上升。`,false); updateUI(); } },
  { id:"adventurer_team", name:"强力冒险者队伍路过", type:"positive", weight:7, effect:()=>{ extraQueueSize=1+Math.floor(Math.random()*3); addDemandTag("war"); generateDailyQueue(); if(typeof showNextAutoVisitor==='function') setTimeout(showNextAutoVisitor,200); showMessage(`强力队伍途经小镇，今日订单上限+${extraQueueSize}，恢复/勇气需求上升。`,false); updateUI(); } },
  { id:"herb_gift", name:"祖母旧友来访", type:"positive", weight:7, effect:()=>{ if(Math.random()<0.75){ addRandomCommonHerbs(4); showMessage("祖母旧友留下普通草药×4。",false); } else { addRandomRareMaterial(1); showMessage("祖母旧友留下稀有材料×1。",false); } updateUI(); } },
  { id:"magic_wind", name:"魔法风过境", type:"positive", weight:6, effect:()=>{ potionQualityModifier=1.15; addDemandTag("magic"); showMessage("温和的魔法风吹过小店，今日交付报酬+15%，魔力需求上升。",false); updateUI(); } },
  { id:"little_imp", name:"迷路小魔怪报恩", type:"positive", weight:6, effect:()=>{ let add=1+Math.floor(Math.random()*2); addRandomCommonHerbs(add); showMessage(`迷路小魔怪在门口放下普通草药×${add}。`,false); updateUI(); } },
  { id:"tasting_party", name:"药剂品鉴会", type:"positive", weight:6, effect:()=>{ deliveryBonus=1.1+Math.random()*0.1; showMessage(`常客组织药剂品鉴会，今日所有交付报酬上浮${Math.round((deliveryBonus-1)*100)}%。`,false); updateUI(); } },
  { id:"mine_collapse", name:"矿洞塌方余波", type:"positive", weight:5, effect:()=>{ if(Math.random()<0.1){ magicCrystal++; showMessage("矿洞余波带来魔力结晶×1。",false); } else { addRandomRareMaterial(1+Math.floor(Math.random()*2)); showMessage("矿洞余波带来魔法矿石/稀有材料。",false); } addDemandTag("healing"); updateUI(); } },
  { id:"pilgrim_day", name:"朝圣者经过", type:"positive", weight:5, effect:()=>{ addDemandTag("holy"); residentOrderModifier+=1; generateDailyResidents(); reputation=Math.min(500,reputation+3); showMessage("朝圣者经过，祝福/勇气需求上升，居民订单+1，声望+3。",false); updateUI(); } }
];
const EVENT_POOL_NEGATIVE = [
  { id:"weather_bad", name:"天气影响收成", type:"negative", weight:7, effect:()=>{ gardenYieldModifier=0.5; showMessage("昨夜魔力波动紊乱，今日后花园材料收成-50%。",true); updateUI(); } },
  { id:"forest_danger", name:"迷雾森林异动", type:"negative", weight:7, effect:()=>{ adventurerInjuryModifier=1.25; addDemandTag("war"); showMessage("迷雾森林深处传来低吼，冒险者伤亡率提升，恢复/勇气需求上升。",true); updateUI(); } },
  { id:"evil_goat", name:"山羊邪恶术士", type:"negative", weight:6, effect:()=>{ adventurerInjuryModifier=1.35; extraQueueSize+=1+Math.floor(Math.random()*2); addDemandTag("curse"); generateDailyQueue(); showMessage("邪恶山羊术士在附近徘徊，冒险者伤亡率提升，但订单数量+1~2。",true); updateUI(); } },
  { id:"potion_evaporate", name:"药剂挥发", type:"negative", weight:6, effect:()=>{ potionQualityModifier=0.9; showMessage("气温异常升高，今日交付报酬-10%。",true); updateUI(); } },
  { id:"forest_miasma", name:"森林瘴气扩散", type:"negative", weight:7, effect:()=>{ residentOrderModifier=-1; addDemandTag("curse"); generateDailyResidents(); showMessage("森林瘴气向小镇蔓延，居民订单-1，祝福/诅咒需求上升。",true); updateUI(); } },
  { id:"tool_damage", name:"工具损坏", type:"negative", weight:6, effect:()=>{ potionQualityModifier=0.9; showMessage("炼金勺和坩埚出现裂痕，今日交付报酬-10%。",true); updateUI(); } },
  { id:"rumor", name:"谣言四起", type:"negative", weight:6, effect:()=>{ residentOrderModifier=-1; reputation=Math.max(-500,reputation-3); generateDailyResidents(); showMessage("有人散布药剂副作用的谣言，居民订单-1，声望-3。",true); updateUI(); } },
  { id:"material_damp", name:"材料受潮", type:"negative", weight:6, effect:()=>{ let loss=2+Math.floor(Math.random()*3); for(let i=0;i<loss;i++){ let herbTypes=['mintLeaf','chamomile','rosemary','lavender','sweetRoot']; let type=herbTypes[Math.floor(Math.random()*herbTypes.length)]; if(type==='mintLeaf' && mintLeaf>0) mintLeaf--; else if(type==='chamomile' && chamomile>0) chamomile--; else if(type==='rosemary' && rosemary>0) rosemary--; else if(type==='lavender' && lavender>0) lavender--; else if(type==='sweetRoot' && sweetRoot>0) sweetRoot--; } showMessage(`昨夜湿气太重，普通草药损失${loss}株。`,true); updateUI(); } }
];
const EVENT_POOL_CHOICE = [
  { id:"forest_clear", name:"森林雾气变淡", type:"choice", weight:8, description:"今日迷雾森林的雾气淡了不少，外围区域变得安全，可以趁机去采集材料。", options:[ { text:"只在外围捡拾", effect:()=>{ let add=3+Math.floor(Math.random()*3); addRandomCommonHerbs(add); showMessage(`稳定获得普通草药×${add}。`,false); updateUI(); } }, { text:"深入一些冒险", effect:()=>{ if(Math.random()<0.7){ addRandomRareMaterial(2); addDemandTag("healing"); showMessage("深入成功！获得稀有草药/魔法矿石×2，恢复药需求上升。",false); } else{ let loss=1+Math.floor(Math.random()*50); gold=Math.max(0,gold-loss); adventurerInjuryModifier=1.25; showMessage(`触发小危险，损失${loss}金币，今日冒险者更容易受伤。`,true); } updateUI(); } }, { text:"不去", effect:()=>{ showMessage("你选择留在店里整理货架。",false); } } ] },
  { id:"herb_merchant", name:"流浪草药商求助", type:"choice", weight:7, description:"一位流浪草药商被迷雾森林的魔怪袭击，希望能在你店门口暂避并低价出售剩余草药。", options:[ { text:"帮助他", effect:()=>{ if(gold>=20){ gold-=20; addExpense(20); addRandomCommonHerbs(4); reputation=Math.min(500,reputation+3); showMessage("花费20金币低价购入普通草药×4，声望+3。",false); } else showMessage("金币不足。",true); updateUI(); } }, { text:"拒绝", effect:()=>{ showMessage("你没有插手。",false); } } ] },
  { id:"spirit_whisper", name:"森林精灵低语", type:"choice", weight:7, description:"耳边传来精灵的低语，它们愿意用魔力滋养材料，但要求你今日不得制作任何负面药剂。", options:[ { text:"接受", effect:()=>{ gardenYieldModifier=1.4; addDemandTag("holy"); showMessage("今日后花园收成+40%，祝福需求上升。请尽量避开禁忌药剂。",false); updateUI(); } }, { text:"拒绝", effect:()=>{ showMessage("你拒绝了精灵的条件。",false); } } ] },
  { id:"old_box", name:"旧木箱浮现", type:"choice", weight:7, description:"河边冲上来一个刻有炼金纹路的旧木箱，好像是你祖母当年留下的。", options:[ { text:"打开", effect:()=>{ if(Math.random()<0.78){ addRandomRareMaterial(1); addRandomCommonHerbs(2); showMessage("木箱里装着稀有材料×1和普通草药×2。",false); } else { let loss=1+Math.floor(Math.random()*50); gold=Math.max(0,gold-loss); showMessage(`木箱机关弹开，损失${loss}金币。`,true); } updateUI(); } }, { text:"不打开", effect:()=>{ showMessage("你决定暂时不碰它。",false); } } ] },
  { id:"festival", name:"节日祭典", type:"choice", weight:8, description:"今天是小镇传统祭日，附近居民都在筹备庆典。", options:[ { text:"摆摊宣传", effect:()=>{ let goldAdd=40+Math.floor(Math.random()*121); let repAdd=6+Math.floor(Math.random()*8); gold+=goldAdd; addIncome(goldAdd); reputation=Math.min(500,reputation+repAdd); addDemandTag("focus"); showMessage(`摆摊成功！获得${goldAdd}金币，声望+${repAdd}，清醒露需求上升。`,false); updateUI(); } }, { text:"留店接待", effect:()=>{ extraQueueSize+=2; generateDailyQueue(); if(typeof showNextAutoVisitor==='function') setTimeout(showNextAutoVisitor,200); showMessage("你留在店里，今日顾客+2。",false); updateUI(); } } ] },
  { id:"exam_week", name:"魔法考试周", type:"choice", weight:7, description:"学院考试临近，学生和学者都在寻找提神与补充魔力的药剂。", options:[ { text:"推出考前套装", effect:()=>{ addDemandTag("exam"); extraQueueSize+=1; generateDailyQueue(); showMessage("魔力药水与清醒露需求大幅上升，顾客+1。",false); updateUI(); } }, { text:"拒绝焦虑营销", effect:()=>{ reputation=Math.min(500,reputation+8); showMessage("你拒绝焦虑营销，声望+8。",false); updateUI(); } } ] },
  { id:"insomnia_wave", name:"失眠潮", type:"choice", weight:7, description:"整条街的居民都睡不好，连冒险者也抱怨夜里听见奇怪钟声。", options:[ { text:"调配安眠特供", effect:()=>{ addDemandTag("insomnia"); residentOrderModifier+=2; generateDailyResidents(); showMessage("安眠茶与强力安眠茶需求大幅上升，居民订单+2。",false); updateUI(); } }, { text:"调查钟声", effect:()=>{ if(Math.random()<0.55){ magicCrystal++; reputation=Math.min(500,reputation+10); showMessage("你找到钟声源头，获得魔力结晶×1，声望+10。",false); } else{ addDemandTag("curse"); showMessage("调查无果，诅咒相关订单上升。",true); } updateUI(); } } ] }
];


// =================== 事件文档扩展：突发事件 V2 ===================
function addGoldAmount(amount){ gold += amount; if(amount>=0) addIncome(amount); else addExpense(Math.abs(amount)); }
function spendGoldAmount(amount){ gold -= amount; addExpense(amount); }
function eventDocBoostResidents(add){ residentOrderModifier += add; generateDailyResidents(); updateResidentVisibility(); }
function eventDocBoostQueue(add){ extraQueueSize += add; generateDailyQueue(); if(typeof showNextAutoVisitor==='function') setTimeout(showNextAutoVisitor,200); }

EVENT_POOL_POSITIVE.push(
  { id:"doc_village_banquet", name:"村民答谢宴", type:"positive", weight:8, effect:()=>{ addRandomCommonHerbs(4); reputation=Math.min(500,reputation+8); eventDocBoostResidents(1); showMessage("村民摆了一桌答谢宴，送来普通草药×4，声望+8，今日居民求购+1。",false); updateUI(); } },
  { id:"doc_old_lady_gift", name:"老奶奶日常赠礼", type:"positive", weight:7, effect:()=>{ addRandomCommonHerbs(2+Math.floor(Math.random()*3)); if(Math.random()<0.25) holyFlower++; reputation=Math.min(500,reputation+5); showMessage("走失爱猫事件后，老奶奶送来一篮草药，声望+5。",false); updateUI(); } },
  { id:"doc_wedding_feast", name:"婚礼喜宴", type:"positive", weight:5, effect:()=>{ reputation=Math.min(500,reputation+18); addDemandTag("holy"); eventDocBoostResidents(2); showMessage("婚礼喜宴让祝福药水口碑大涨，声望+18，居民订单+2，祝福类需求上升。",false); updateUI(); } },
  { id:"doc_blacksmith_contract", name:"铁匠长期合作", type:"positive", weight:5, effect:()=>{ redOre++; if(Math.random()<0.5) blackOre++; addDemandTag("healing"); showMessage("铁匠铺送来谢礼：赤铁髓×1，并可能附带黑银矿。疗伤类需求上升。",false); updateUI(); } },
  { id:"doc_scholar_success", name:"金榜题名回馈", type:"positive", weight:3, effect:()=>{ gold+=200; addIncome(200); addRandomRareMaterial(2); reputation=Math.min(500,reputation+15); showMessage("你曾帮助的书生金榜题名，回赠200金币与稀有材料×2，声望+15。",false); updateUI(); } },
  { id:"doc_guard_route_safe", name:"守夜路线变安全", type:"positive", weight:6, effect:()=>{ reputation=Math.min(500,reputation+8); residentOrderModifier+=1; showMessage("守夜人加强巡逻，小镇失窃减少，声望+8，居民更愿意上门。",false); updateUI(); } },
  { id:"doc_far_traveler", name:"远方旅人报恩", type:"positive", weight:4, effect:()=>{ magicCrystal++; addRandomCommonHerbs(3); showMessage("远方旅人寄来谢礼：魔力结晶×1，普通草药×3。",false); updateUI(); } }
);

EVENT_POOL_NEGATIVE.push(
  { id:"doc_thief_revenge", name:"贼人报复", type:"negative", weight:5, effect:()=>{ let loss=20+Math.floor(Math.random()*61); gold=Math.max(0,gold-loss); addExpense(loss); reputation=Math.max(-500,reputation-6); showMessage(`你曾出售麻痹药激怒贼人，夜里遭到小额骚扰，损失${loss}金币，声望-6。`,true); updateUI(); } },
  { id:"doc_public_doubt", name:"居民非议", type:"negative", weight:6, effect:()=>{ reputation=Math.max(-500,reputation-12); residentOrderModifier-=1; showMessage("小镇开始议论你滥用危险药剂，声望-12，今日居民订单-1。",true); generateDailyResidents(); updateUI(); } },
  { id:"doc_water_panic", name:"水井污染恐慌", type:"negative", weight:6, effect:()=>{ addDemandTag("holy"); residentOrderModifier+=1; potionQualityModifier*=0.95; showMessage("水井污染造成恐慌，净化类需求上升，居民订单+1，但今日药剂报酬略降。",true); generateDailyResidents(); updateUI(); } },
  { id:"doc_mosquito_plague", name:"毒蚊灾潮", type:"negative", weight:7, effect:()=>{ addDemandTag("sleep"); residentOrderModifier+=2; showMessage("虹光季毒蚊成灾，安眠与麻痹类居民求购增加，居民订单+2。",true); generateDailyResidents(); updateUI(); } },
  { id:"doc_crow_omen", name:"乌鸦不祥预兆", type:"negative", weight:4, effect:()=>{ addDemandTag("curse"); if(Math.random()<0.5) poisonMushroom++; reputation=Math.max(-500,reputation-4); showMessage("乌鸦盘旋在田地上空，诅咒类需求上升，声望-4。",true); updateUI(); } },
  { id:"doc_competitor_rumor", name:"竞争店铺散布流言", type:"negative", weight:5, effect:()=>{ reputation=Math.max(-500,reputation-15); deliveryBonus*=0.9; showMessage("竞争店铺散布药剂副作用流言，声望-15，今日交付收益-10%。",true); updateUI(); } }
);

EVENT_POOL_CHOICE.push(
  { id:"doc_chicken_thief", name:"深夜偷鸡贼", type:"choice", weight:9, description:"深夜村民慌张拍门，说鸡舍里有黑影偷鸡。你可以亲自帮忙，也可以借机卖出危险药剂。", options:[
    { text:"放下活计帮忙抓贼", effect:()=>{ reputation=Math.min(500,reputation+10); addRandomCommonHerbs(3); residentOrderModifier+=1; showMessage("你帮村民抓住偷鸡贼，声望+10，获得普通草药×3，居民订单+1。",false); generateDailyResidents(); updateUI(); } },
    { text:"出售麻痹药给村民", effect:()=>{ gold+=40; addIncome(40); reputation=Math.max(-500,reputation-8); addDemandTag("control"); showMessage("你卖出麻痹药获得40金币，但声望-8，麻痹类需求上升。",true); updateUI(); } },
    { text:"关门不管", effect:()=>{ reputation=Math.max(-500,reputation-3); showMessage("你没有插手，村民有些失望，声望-3。",true); updateUI(); } }
  ]},
  { id:"doc_lost_cat", name:"老奶奶走失爱猫", type:"choice", weight:9, description:"独居老奶奶的橘猫一夜未归，她颤巍巍地来到店里，请你帮她找找。", options:[
    { text:"关店进山寻猫", effect:()=>{ holyFlower++; reputation=Math.min(500,reputation+5); addRandomCommonHerbs(2); showMessage("你找回橘猫，获得圣露花×1、草药×2，声望+5。",false); updateUI(); } },
    { text:"给她一杯安神茶", effect:()=>{ if(sleepPotion>0){ sleepPotion--; reputation=Math.min(500,reputation+8); showMessage("你送出安眠茶安抚老人，声望+8。",false); } else showMessage("你没有安眠茶，老人失望地离开。",true); updateUI(); } },
    { text:"店铺繁忙婉拒", effect:()=>{ reputation=Math.max(-500,reputation-5); residentOrderModifier-=1; showMessage("你婉拒了请求，声望-5，今日居民订单-1。",true); generateDailyResidents(); updateUI(); } }
  ]},
  { id:"doc_child_poison", name:"孩童误食毒草", type:"choice", weight:8, description:"农户家的孩子误食毒草，上吐下泻。家长抱着孩子冲进店里，几乎说不出完整的话。", options:[
    { text:"免费提供净化药剂", effect:()=>{ let use=blessPotion>0?"祝福药水":(awakePotion>0?"清醒露":null); if(use){ consumePotionAmount(use,1); reputation=Math.min(500,reputation+22); addRandomCommonHerbs(5); showMessage(`你用${use}救下孩子，声望+22，农户赠送草药×5。`,false); } else showMessage("你没有合适药剂，只能让他们去教堂求助。",true); updateUI(); } },
    { text:"正常售价售卖", effect:()=>{ let use=blessPotion>0?"祝福药水":(awakePotion>0?"清醒露":null); if(use){ consumePotionAmount(use,1); gold+=30; addIncome(30); reputation=Math.min(500,reputation+5); showMessage(`卖出${use}，获得30金币，声望+5。`,false); } else showMessage("没有合适药剂。",true); updateUI(); } },
    { text:"药剂紧缺婉拒", effect:()=>{ reputation=Math.max(-500,reputation-18); showMessage("孩子家长绝望离开，声望-18。",true); updateUI(); } }
  ]},
  { id:"doc_tavern_brawl", name:"酒馆深夜闹事", type:"choice", weight:7, description:"酒馆掌柜匆匆上门，醉汉聚众斗殴，杯盘飞得到处都是。", options:[
    { text:"提供安眠茶温和平息", effect:()=>{ if(sleepPotion>0){ sleepPotion--; reputation=Math.min(500,reputation+18); deliveryBonus*=1.05; showMessage("酒馆恢复安静，声望+18，今日订单收益+5%。",false); } else showMessage("没有安眠茶。",true); updateUI(); } },
    { text:"提供勇气药安抚", effect:()=>{ if(couragePotion>0){ couragePotion--; reputation=Math.min(500,reputation+12); showMessage("醉汉清醒后惭愧道歉，声望+12。",false); } else showMessage("没有勇气药水。",true); updateUI(); } },
    { text:"提供麻痹剂强力制服", effect:()=>{ let use=lightParalysis>0?"轻微麻痹致幻剂":(strongParalysis>0?"强力麻痹致幻剂":null); if(use){ consumePotionAmount(use,1); gold+=45; addIncome(45); reputation=Math.max(-500,reputation-10); showMessage(`使用${use}制服闹事者，获得45金币，声望-10。`,true); } else showMessage("没有麻痹类药剂。",true); updateUI(); } }
  ]},
  { id:"doc_tax_officer", name:"税务官检查", type:"choice", weight:6, description:"王都税务官推门进来，仔细翻看你的账本。他的羽毛笔停在租金支出一栏。", options:[
    { text:"老实配合检查", effect:()=>{ if(reputation>=100){ reputation=Math.min(500,reputation+6); showMessage("税务官认可你的口碑，声望+6。",false); } else { spendGoldAmount(40); showMessage("你补交了40金币的小额税款。",true); } updateUI(); } },
    { text:"请他喝茶并暗示好处", effect:()=>{ if(gold>=60){ spendGoldAmount(60); reputation=Math.max(-500,reputation-8); showMessage("你花60金币摆平检查，但声望-8。",true); } else showMessage("金币不足，税务官记下了你的名字。",true); updateUI(); } },
    { text:"公开账本争取信任", effect:()=>{ reputation=Math.min(500,reputation+12); deliveryBonus*=0.95; showMessage("你公开账本，声望+12，但今日议价空间下降，收益-5%。",false); updateUI(); } }
  ]},
  { id:"doc_royal_purchase", name:"王都采购团", type:"choice", weight:4, description:"王都采购团来到小镇，想大量采购药水。他们开价公道，但要求优先供货。", options:[
    { text:"优先供应王都", effect:()=>{ extraQueueSize+=3; deliveryBonus*=1.15; addDemandTag("royal"); generateDailyQueue(); showMessage("今日冒险者订单+3，交付收益+15%，皇家需求上升。",false); updateUI(); } },
    { text:"兼顾本地居民", effect:()=>{ residentOrderModifier+=2; extraQueueSize+=1; generateDailyResidents(); generateDailyQueue(); reputation=Math.min(500,reputation+10); showMessage("你兼顾双方，居民订单+2，冒险者订单+1，声望+10。",false); updateUI(); } },
    { text:"抬价出售", effect:()=>{ deliveryBonus*=1.35; reputation=Math.max(-500,reputation-15); showMessage("今日交付收益+35%，但声望-15。",true); updateUI(); } }
  ]},
  { id:"doc_dragon_omen", name:"龙灾前兆", type:"choice", weight:2, description:"北方山脉传来震动，牧民说看见巨大的黑影掠过云层。冒险者们开始囤积补给。", options:[
    { text:"资助讨伐队", effect:()=>{ if(gold>=300){ spendGoldAmount(300); reputation=Math.min(500,reputation+35); addDemandTag("war"); extraQueueSize+=2; generateDailyQueue(); showMessage("你资助讨伐队，声望+35，冒险者订单+2，战争类需求上升。",false); } else showMessage("金币不足，无法资助。",true); updateUI(); } },
    { text:"囤积并公开售药", effect:()=>{ deliveryBonus*=1.25; addDemandTag("healing"); reputation=Math.min(500,reputation+8); showMessage("你公开供应补给，今日收益+25%，声望+8，恢复需求上升。",false); updateUI(); } },
    { text:"趁乱涨价", effect:()=>{ deliveryBonus*=1.6; reputation=Math.max(-500,reputation-35); addDemandTag("war"); showMessage("你趁乱涨价，收益+60%，声望-35。",true); updateUI(); } }
  ]},
  { id:"doc_plague_spread", name:"黑死病蔓延", type:"choice", weight:2, description:"持夜季的寒风里出现了奇怪疫病，教堂门口排起长队。大家都看向你的炼金店。", options:[
    { text:"免费发药", effect:()=>{ reputation=Math.min(500,reputation+80); let loss=Math.min(potion,3); potion-=loss; addDemandTag("holy"); showMessage(`你免费发放药剂，声望+80，消耗小红药水×${loss}，祝福需求上升。`,false); updateUI(); } },
    { text:"成本价供应", effect:()=>{ gold+=150; addIncome(150); reputation=Math.min(500,reputation+20); addDemandTag("holy"); showMessage("你成本价供应药剂，获得150金币，声望+20。",false); updateUI(); } },
    { text:"高价出售救命药", effect:()=>{ gold+=400; addIncome(400); reputation=Math.max(-500,reputation-60); addDemandTag("blackmarket"); showMessage("你高价出售救命药，获得400金币，声望-60。",true); updateUI(); } }
  ]}
);

// 突发事件出现概率提升，增强每日变化感
const EVENT_DOC_DAILY_EVENT_CHANCE = 0.70;
function triggerDailyEvent() {
  if(Math.random() > (typeof EVENT_DOC_DAILY_EVENT_CHANCE==='number' ? EVENT_DOC_DAILY_EVENT_CHANCE : 0.70)) return;
  let pool = [];
  const pushWeighted=(event, groupMul)=>{
    let w=event.weight*groupMul;
    if(event.id && (event.id.includes("crystal") || event.id==="old_box")) w*=0.5;
    for(let i=0;i<Math.max(1,Math.round(w));i++) pool.push(event);
  };
  EVENT_POOL_POSITIVE.forEach(e=>pushWeighted(e, 0.35));
  EVENT_POOL_NEGATIVE.forEach(e=>pushWeighted(e, 0.30));
  EVENT_POOL_CHOICE.forEach(e=>pushWeighted(e, 0.35));
  if(pool.length===0) return;
  let event = pool[Math.floor(Math.random()*pool.length)];
  if(event.type === 'choice') {
    showEventChoiceModal(event);
  } else {
    event.effect();
    updateUI();
    showToast(`突发事件：${event.name}`, false);
  }
}
function showEventChoiceModal(event) {
  document.getElementById("settlementModal").style.display = "none";
  document.getElementById("confirmEndModal").style.display = "none";
  document.getElementById("eventDescription").innerHTML = `<strong>${event.name}</strong><br><br>${event.description}`;
  let optDiv = document.getElementById("eventOptions");
  optDiv.innerHTML = "";
  event.options.forEach(opt => {
    let btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.className = "event-option-btn";
    btn.onclick = () => {
      opt.effect();
      document.getElementById("eventModal").style.display = "none";
      updateUI();
      if(document.getElementById("alchemyModal").style.display === "flex") {
        renderDynamicRecipes();
        updateBatchSelect();
      }
    };
    optDiv.appendChild(btn);
  });
  document.getElementById("eventModal").style.display = "flex";
}

const reputationEvents=[
  { id:1, weight:9, title:"受伤的冒险者", description:"一位重伤的冒险者倒在店门口，急需恢复药。他只有5枚金币，但如果耽误，可能再也走不出森林。", good:{ text:"免费救治", effect:()=>{ let use=bigPotion>0?"大生命药水":(potion>0?"小红药水":null); if(use){consumePotionAmount(use,1); reputation=Math.min(500,reputation+12); showMessage(`你用${use}救治了冒险者，声望+12。`); } else showMessage("你没有恢复药，无法救治。", true); } }, evil:{ text:"收急救费（25金币）", effect:()=>{ let use=bigPotion>0?"大生命药水":(potion>0?"小红药水":null); if(use){consumePotionAmount(use,1); gold+=25; addIncome(25); reputation=Math.max(-500,reputation-12); showMessage("你收了高额急救费，获得25金币，声望-12。"); } else showMessage("你没有恢复药可卖。", true); } } },
  { id:2, weight:8, title:"迷路的学徒", description:"年轻炼金学徒想借阅你的配方笔记。他可能真心求学，也可能把你的独门技巧带去竞争店铺。", good:{ text:"指导他一天", effect:()=>{ reputation=Math.min(500,reputation+10); addRandomCommonHerbs(2); if(Math.random()<0.35){ let locked=recipes.filter(r=>!r.unlocked); if(locked.length){ locked[Math.floor(Math.random()*locked.length)].unlocked=true; showMessage("声望+10，获得2个草药，并随机解锁一个配方。",false); return; } } showMessage("声望+10，学徒回赠2个草药。",false); } }, evil:{ text:"收取高额学费", effect:()=>{ gold+=60; addIncome(60); reputation=Math.max(-500,reputation-8); showMessage("获得60金币，声望-8。",false); } } },
  { id:3, weight:8, title:"黑市商人的诱惑", description:"戴兜帽的商人愿意高价收购禁忌药剂，并承诺带来更多黑市客人。", good:{ text:"严词拒绝", effect:()=>{ reputation=Math.min(500,reputation+18); addDemandTag("holy"); showMessage("声望+18，祝福/勇气需求上升。",false); } }, evil:{ text:"暗中合作", effect:()=>{ gold+=90; addIncome(90); reputation=Math.max(-500,reputation-24); addDemandTag("blackmarket"); showMessage("获得90金币，声望-24，禁忌订单上升。",true); } } },
  { id:4, weight:6, title:"富商的订单", description:"富商想包下高级药剂。如果拒绝，他会威胁让供应商涨价；如果妥协，你能迅速获得现金。", good:{ text:"按正常价交易", effect:()=>{ if(bigPotion>=2){bigPotion-=2; gold+=120; addIncome(120); reputation=Math.min(500,reputation+6); showMessage("交付2瓶大生命药水，获得120金币，声望+6。",false); } else showMessage("大生命药水不足2瓶。",true); } }, evil:{ text:"稀释后高价出售", effect:()=>{ if(bigPotion>=1){bigPotion--; gold+=220; addIncome(220); reputation=Math.max(-500,reputation-28); showMessage("获得220金币，声望-28。",true); } else showMessage("大生命药水不足。",true); } } },
  { id:5, weight:7, title:"被诅咒的遗物", description:"老妇人想卖掉祖传戒指。你能感觉到它被诅咒，但它也可能成为强大的炼金材料。", good:{ text:"净化戒指（50金）", effect:()=>{ if(gold>=50){gold-=50; addExpense(50); reputation=Math.min(500,reputation+22); holyFlower++; showMessage("花费50金币，声望+22，获得圣露花×1。",false); } else showMessage("金币不足。",true); } }, evil:{ text:"低价收购用于禁忌炼金", effect:()=>{ if(gold>=10){gold-=10; addExpense(10); poisonMushroom+=2; reputation=Math.max(-500,reputation-18); addDemandTag("blackmarket"); showMessage("获得毒腺菇×2，声望-18，禁忌订单上升。",true); } else showMessage("金币不足。",true); } } },
  { id:6, weight:8, title:"偷药水的小孩", description:"瘦弱的小孩偷走药水，说是为了救母亲。你可以原谅，也可以维护店铺规则。", good:{ text:"原谅并送药", effect:()=>{ let use=potion>0?"小红药水":(awakePotion>0?"清醒露":null); if(use){consumePotionAmount(use,1); reputation=Math.min(500,reputation+18); residentOrderModifier+=1; showMessage("声望+18，居民更信任你，今日居民订单+1。",false); generateDailyResidents(); } else showMessage("没有合适药水。",true); } }, evil:{ text:"索要赔偿", effect:()=>{ reputation=Math.max(-500,reputation-10); gold+=15; addIncome(15); showMessage("声望-10，获得15金币赔偿。",true); } } },
  { id:7, weight:7, title:"竞争对手的阴谋", description:"对面药剂店开始低价竞争，还散布你的药水不稳定的谣言。", good:{ text:"公开配方检测", effect:()=>{ reputation=Math.min(500,reputation+16); deliveryBonus=1.1; showMessage("声望+16，今日交付报酬+10%。",false); } }, evil:{ text:"买通酒馆散播反谣言", effect:()=>{ if(gold>=40){gold-=40; addExpense(40); extraQueueSize+=2; reputation=Math.max(-500,reputation-8); generateDailyQueue(); showMessage("花费40金币，顾客+2，声望-8。",true); } else showMessage("金币不足。",true); } } },
  { id:8, weight:7, title:"德鲁伊的警告", description:"森林德鲁伊指责你过度采集稀有草药，要求你减少圣露花和毒腺菇的使用。", good:{ text:"承诺轮作采集", effect:()=>{ reputation=Math.min(500,reputation+18); gardenYieldModifier=1.25; showMessage("声望+18，今日花园产出+25%。",false); } }, evil:{ text:"无视警告，连夜采集", effect:()=>{ reputation=Math.max(-500,reputation-24); addRandomRareMaterial(3); showMessage("声望-24，立即获得3份稀有材料。",true); } } },
  { id:9, weight:5, title:"赎罪的恶徒", description:"曾经抢劫商队的强盗想用祝福药水弥补过错。", good:{ text:"免费给他祝福", effect:()=>{ if(blessPotion>=1){blessPotion--; reputation=Math.min(500,reputation+35); showMessage("声望+35，他发誓守护你的店。",false); } else showMessage("没有祝福药水。",true); } }, evil:{ text:"收钱给假希望", effect:()=>{ gold+=80; addIncome(80); reputation=Math.max(-500,reputation-45); showMessage("获得80金币，声望-45。",true); } } },
  { id:10, weight:5, title:"时光沙漏", description:"时光法师愿用沙漏换取你一周经营权。拒绝可得到指导，接受则会改变店铺命运。", good:{ text:"拒绝交易，请他指点", effect:()=>{ reputation=Math.min(500,reputation+10); let locked=recipes.filter(r=>!r.unlocked); if(locked.length>0){ locked[Math.floor(Math.random()*locked.length)].unlocked=true; showMessage("声望+10，随机解锁一个配方。",false); } else showMessage("声望+10。",false); } }, evil:{ text:"接受交易", effect:()=>{ gold=Math.floor(gold*0.8)+180; reputation=Math.floor(reputation*0.75); if(shopLevel>1 && Math.random()<0.5) shopLevel--; showMessage("获得180金币，但声望被扭曲，店铺可能降级。",true); } } }
];

// =================== 事件文档扩展：声望抉择 V2 ===================
reputationEvents.push(
  { id:101, weight:8, title:"教堂修女募捐", description:"教堂修女上门募捐，想为孤寡老人和流浪孩童准备过冬补给。", good:{ text:"捐赠50金币", effect:()=>{ if(gold>=50){ spendGoldAmount(50); reputation=Math.min(500,reputation+25); addDemandTag("holy"); showMessage("捐赠50金币，声望+25，祝福类需求上升。",false); } else showMessage("金币不足。",true); } }, evil:{ text:"拒绝并推销药水", effect:()=>{ gold+=35; addIncome(35); reputation=Math.max(-500,reputation-8); showMessage("你借机推销药水，获得35金币，声望-8。",true); } } },
  { id:102, weight:7, title:"富商垄断药材", description:"富商想低价买断你的普通草药库存，再高价转卖给冒险者。", good:{ text:"拒绝垄断", effect:()=>{ reputation=Math.min(500,reputation+16); residentOrderModifier+=1; showMessage("你拒绝垄断，声望+16，居民订单+1。",false); generateDailyResidents(); } }, evil:{ text:"高价卖给富商", effect:()=>{ let sell=Math.min(herb,6); mintLeaf=Math.max(0,mintLeaf-2); chamomile=Math.max(0,chamomile-2); rosemary=Math.max(0,rosemary-1); lavender=Math.max(0,lavender-1); gold+=180; addIncome(180); reputation=Math.max(-500,reputation-18); showMessage("你把一批草药卖给富商，获得180金币，声望-18。",true); } } },
  { id:103, weight:7, title:"被诬陷的采药人", description:"采药人被指控偷了别人的稀有草药。他说那是自己冒险采来的，请你作证。", good:{ text:"为他作证", effect:()=>{ reputation=Math.min(500,reputation+14); addRandomCommonHerbs(3); showMessage("采药人洗清冤屈，声望+14，并送来草药×3。",false); } }, evil:{ text:"索要封口费", effect:()=>{ gold+=70; addIncome(70); reputation=Math.max(-500,reputation-16); poisonMushroom++; showMessage("你收了封口费，获得70金币和毒腺菇×1，声望-16。",true); } } },
  { id:104, weight:6, title:"王都采购回扣", description:"王都采购官暗示，只要给他一点回扣，就会优先采购你的药剂。", good:{ text:"拒绝回扣，凭品质交易", effect:()=>{ reputation=Math.min(500,reputation+18); deliveryBonus*=1.05; showMessage("你拒绝回扣，声望+18，今日收益+5%。",false); } }, evil:{ text:"支付回扣换大单", effect:()=>{ if(gold>=80){ spendGoldAmount(80); extraQueueSize+=3; deliveryBonus*=1.25; reputation=Math.max(-500,reputation-12); generateDailyQueue(); showMessage("支付80金币回扣，冒险者订单+3，收益+25%，声望-12。",true); } else showMessage("金币不足，无法支付回扣。",true); } } },
  { id:105, weight:6, title:"黑市禁药试用", description:"黑市客人要求你提供一瓶麻痹药试用，若效果好，未来会介绍更多客户。", good:{ text:"拒绝危险交易", effect:()=>{ reputation=Math.min(500,reputation+20); addDemandTag("holy"); showMessage("你拒绝危险交易，声望+20，圣洁类需求上升。",false); } }, evil:{ text:"提供试用品", effect:()=>{ let use=lightParalysis>0?"轻微麻痹致幻剂":(strongParalysis>0?"强力麻痹致幻剂":null); if(use){ consumePotionAmount(use,1); gold+=120; addIncome(120); reputation=Math.max(-500,reputation-30); addDemandTag("blackmarket"); showMessage(`交出${use}，获得120金币，声望-30，禁忌订单上升。`,true); } else showMessage("没有麻痹类药剂。",true); } } },
  { id:106, weight:8, title:"孤儿偷药", description:"一个孤儿偷走药水，说是为了救病倒的妹妹。围观居民都在等你表态。", good:{ text:"原谅并补送一瓶", effect:()=>{ if(potion>0){ potion--; reputation=Math.min(500,reputation+28); showMessage("你原谅了孩子并送出药水，声望+28。",false); } else showMessage("你没有小红药水可送。",true); } }, evil:{ text:"追回药水并罚款", effect:()=>{ gold+=20; addIncome(20); reputation=Math.max(-500,reputation-20); showMessage("你追回药水并收下20金币罚款，声望-20。",true); } } },
  { id:107, weight:5, title:"圣殿试炼邀请", description:"圣殿牧师邀请你参加一次公开义诊，这会耽误一天生意，但能让全镇看见你的善意。", good:{ text:"参加公开义诊", effect:()=>{ reputation=Math.min(500,reputation+50); deliveryBonus*=0.85; residentOrderModifier+=2; showMessage("公开义诊让声望+50，居民订单+2，但今日收益-15%。",false); generateDailyResidents(); } }, evil:{ text:"借义诊宣传高价药", effect:()=>{ gold+=160; addIncome(160); reputation=Math.max(-500,reputation-22); showMessage("你借义诊宣传高价药，获得160金币，声望-22。",true); } } },
  { id:108, weight:5, title:"冒险者遗物", description:"一位冒险者没能归来，他的同伴把遗物交给你，希望你转交家人。里面有一颗魔力结晶。", good:{ text:"完整转交家人", effect:()=>{ reputation=Math.min(500,reputation+24); addRandomRareMaterial(1); showMessage("你完整转交遗物，家属赠送稀有材料×1，声望+24。",false); } }, evil:{ text:"留下魔力结晶", effect:()=>{ magicCrystal++; reputation=Math.max(-500,reputation-28); showMessage("你私下留下魔力结晶×1，声望-28。",true); } } },
  { id:109, weight:6, title:"竞争店铺求和", description:"竞争炼金店老板提出合作，双方互不压价；但他要求你减少给居民的免费援助。", good:{ text:"拒绝牺牲居民", effect:()=>{ reputation=Math.min(500,reputation+18); residentOrderModifier+=1; showMessage("你拒绝牺牲居民，声望+18，居民订单+1。",false); generateDailyResidents(); } }, evil:{ text:"达成价格同盟", effect:()=>{ deliveryBonus*=1.25; reputation=Math.max(-500,reputation-15); showMessage("你达成价格同盟，今日收益+25%，声望-15。",true); } } },
  { id:110, weight:4, title:"龙灾避难名单", description:"若龙灾真的到来，镇长要求你优先供应避难队伍。黑市则愿意高价买断补给。", good:{ text:"登记避难补给", effect:()=>{ reputation=Math.min(500,reputation+35); addDemandTag("war"); extraQueueSize+=1; generateDailyQueue(); showMessage("你登记避难补给，声望+35，战争类订单上升。",false); } }, evil:{ text:"卖给黑市囤货商", effect:()=>{ gold+=260; addIncome(260); reputation=Math.max(-500,reputation-45); addDemandTag("blackmarket"); showMessage("你把补给卖给黑市囤货商，获得260金币，声望-45。",true); } } }
);
function showRandomReputationEvent(){
  if(reputationEventUsedToday) { showMessage("今日已抉择过，明天再来吧！",true); return; }
  let ev=weightedChoice(reputationEvents.map(e=>({value:e,weight:e.weight||1})));
  document.getElementById("reputationDescription").innerHTML=`<strong>${ev.title}</strong><br><br>${ev.description}`;
  let optDiv=document.getElementById("reputationOptions");
  optDiv.innerHTML="";
  let goodBtn=document.createElement("button");
  goodBtn.textContent=ev.good.text;
  goodBtn.style.background="#2e7d32";
  goodBtn.onclick=()=>{ ev.good.effect(); reputationEventUsedToday=true; document.getElementById("reputationModal").style.display="none"; updateUI(); renderBestiary(); renderRecipeBook(); if(document.getElementById("alchemyModal").style.display==="flex"){ renderDynamicRecipes(); updateBatchSelect(); } updateReputationBonus(); checkAchievements(); };
  let evilBtn=document.createElement("button");
  evilBtn.textContent=ev.evil.text;
  evilBtn.style.background="#8b0000";
  evilBtn.onclick=()=>{ ev.evil.effect(); reputationEventUsedToday=true; document.getElementById("reputationModal").style.display="none"; updateUI(); renderBestiary(); renderRecipeBook(); if(document.getElementById("alchemyModal").style.display==="flex"){ renderDynamicRecipes(); updateBatchSelect(); } updateReputationBonus(); checkAchievements(); };
  optDiv.appendChild(goodBtn);
  optDiv.appendChild(evilBtn);
  document.getElementById("reputationModal").style.display="flex";
}

let messageTimeout=null; let toastTimeout=null; let msgDuration=2;
let shopName="炼金店铺";
function getGlobalMessagePopup(){
  let div=document.getElementById("globalMessagePopup");
  if(!div){
    div=document.createElement("div");
    div.id="globalMessagePopup";
    div.setAttribute("aria-live","polite");
    document.body.appendChild(div);
  }
  return div;
}
function showMessage(msg, isError=false) {
  const oldMsg=document.getElementById("message");
  if(oldMsg) oldMsg.innerText="";
  const oldToast=document.getElementById("toastMsg");
  if(oldToast){ oldToast.innerText=""; oldToast.classList.remove("show","error","success"); }
  let div=getGlobalMessagePopup();
  if(messageTimeout) clearTimeout(messageTimeout);
  div.innerText=msg;
  div.className=isError ? "error" : "success";
  div.style.display="block";
  messageTimeout=setTimeout(()=>{ div.innerText=""; div.style.display="none"; }, msgDuration*1000);
}
function showToast(msg, isError=false) {
  showMessage(msg, isError);
}

let dayEndedFlag=false;
function requestEndDay(){ if(dayEndedFlag){ showMessage("今日已结束",true); return; } let msg=`<strong>今日概况</strong><br>交付成功: ${dailyDeliverySuccess} 次<br>当前未完成订单: ${orders.filter(o=>o.status==="pending").length}<br>预估利润: ${dailyIncome-dailyExpense} 金币<br>确认结束？`; document.getElementById("confirmEndMessage").innerHTML=msg; document.getElementById("confirmEndModal").style.display="flex"; }
function performEndDay(){
  if(dayEndedFlag) return;
  dayEndedFlag=true;
  // 清除当天遗留的自动顾客显示（避免第二天残留）
  if (typeof clearCurrentVisitor === 'function') clearCurrentVisitor();
  let rent=getDailyRent()-reputationBonusRent;
  if(rent<0) rent=0;
  if(gold>=rent){ gold-=rent; addExpense(rent); showMessage(`🏠 扣除租金 ${rent} 金币`,false); debtDays=0; } else{ gold-=rent; addExpense(rent); debtDays++; showMessage(`⚠️ 租金不足，负债 ${-gold} 金币！已连续负债 ${debtDays} 天`,true); if(debtDays>=3) { showMessage("💀 连续负债3天，店铺破产！",true); setTimeout(()=>{ document.getElementById("endingText").innerHTML=`<strong>破产结局</strong><br>由于连续负债，你的店铺被迫关门。债主们收走了所有财产，你只能黯然离开小镇...<br><br>游戏结束`; document.getElementById("endingModal").style.display="flex"; }, 1000); return; } }
  let pendingOrders=orders.filter(o=>o.status==="pending");
  for(let order of pendingOrders){
    order.daysLeft--;
    if(order.daysLeft<=0){
      let adv=adventurers.find(a=>a.id===order.adventurerId);
      if(adv){ showMessage(`💀 订单逾期！${adv.name} 因为没有得到 ${order.requiredPotion} 而受伤严重。`,true); adv.status="重伤"; reputation=Math.max(-500,reputation-15); if(Math.random()<0.3){ adv.status="死亡"; showMessage(`⚰️ ${adv.name} 不幸死亡... 声望值 -25`,true); reputation=Math.max(-500,reputation-25); } }
      order.status="failed";
    }
  }
  orders=orders.filter(o=>o.status!=="failed");
  let profit=dailyIncome-dailyExpense;
  if(gold>=0 && !lastDayHadDebt) consecutiveNoDebtDays++; else if(gold<0){ consecutiveNoDebtDays=0; lastDayHadDebt=true; } else lastDayHadDebt=false;
  if(consecutiveNoDebtDays>=5){ gold+=50; addIncome(50); showMessage("🏆 经营能手奖50金币！",false); consecutiveNoDebtDays=0; }
  let debtWarning = gold < 0 ? `<br><span style="color:red;">⚠️ 当前负债：${-gold} 金币（${debtDays}/3天）</span>` : '';
  document.getElementById("settlementDetails").innerHTML=`今日收入+${dailyIncome}，支出-${dailyExpense}，租金-${rent}<br><strong>利润：${profit>=0?'+':''}${profit}金币</strong><br>当前金币：${gold}${debtWarning}`;
  document.getElementById("settlementModal").style.display="flex";
}
function confirmSettlement(){
  document.getElementById("settlementModal").style.display="none";
  if(day===15||day===30||day===45||day===60){ showSeasonEnding(); return; }
  if(day>=60){ showFinalEnding(); return; }
  day++;
    // 每天重置顾客显示
  if (typeof resetDailyVisitor === 'function') resetDailyVisitor();
  resetDailyStats();
  resetDailyBuff();
  dayEndedFlag=false;
  gardenTodayCollected=false;
  reputationEventUsedToday=false;
  gardenYieldModifier=1.0; extraQueueSize=0; adventurerInjuryModifier=1.0; potionQualityModifier=1.0; residentOrderModifier=0;
  updateReputationBonus();
  updateUI();
  let herbG=0,rareG=0;
  if(shopLevel===1) herbG=1; else if(shopLevel===2) herbG=2; else if(shopLevel===3){ herbG=2; rareG=1; } else if(shopLevel>=4){ herbG=3; rareG=1; }
  let msg="🌿 自动采集：";
  if(herbG>0){ let herbTypes=['mintLeaf','chamomile','rosemary','lavender','sweetRoot']; for(let i=0;i<herbG;i++){ let type=herbTypes[Math.floor(Math.random()*herbTypes.length)]; if(type==='mintLeaf'){ mintLeaf++; msg+="野薄荷叶 "; } else if(type==='chamomile'){ chamomile++; msg+="微光洋甘菊 "; } else if(type==='rosemary'){ rosemary++; msg+="尖刺迷迭香 "; } else if(type==='lavender'){ lavender++; msg+="绒絮薰衣草 "; } else if(type==='sweetRoot'){ sweetRoot++; msg+="甜根草 "; } } }
  if(rareG>0){ if(Math.random()<0.5){ holyFlower+=rareG; msg+=`圣露花×${rareG}`; } else{ poisonMushroom+=rareG; msg+=`毒腺菇×${rareG}`; } }
  showMessage(msg,false);
  adventurers.forEach(a=>{ a.exp=Math.min(a.exp+5,a.expToNext*2); if(Math.random()<0.2*adventurerInjuryModifier){ let states=["健康","轻伤","中毒","诅咒"]; a.status=states[Math.floor(Math.random()*states.length)]; showMessage(`📅 ${a.name}状态变为${a.status}`,false); } });
  updateRecipeUnlockStatus();
  generateDailyQueue();
  generateDailyResidents();
  renderQueue();  // 新一天自动显示冒险者
  triggerDailyEvent();  // 每日必定触发事件
  showMessage(`🌞 第 ${day} 天开始了！有 ${queue.length} 位顾客来访，现有 ${orders.filter(o=>o.status==="pending").length} 个未完成订单。`,false);
  renderBestiary();
  renderRecipeBook();
  checkAndTriggerEnding();
  renderOrdersList();
}
function showSeasonEnding(){
  let season=getCurrentSeason();
  let tier=getExpandedReputationTier();
  let trusted=adventurers.filter(a=>a.favor>=80 && a.status!=="死亡").length;
  let story=getSeasonEndingStory(season.name);
  document.getElementById("endingText").innerHTML=`<div style="font-size:44px;margin-bottom:8px;">${season.emoji}</div><h2>${season.name}小结</h2><div style="margin:18px 0;font-size:20px;line-height:1.75;text-align:left;">${story}</div><div style="background:#f5ead0;padding:16px;border-radius:12px;margin:15px 0;text-align:left;"><div><strong>声望段位：</strong>${tier.name} (${reputation})</div><div><strong>店铺等级：</strong>Lv.${shopLevel}</div><div><strong>当前金币：</strong>${gold}</div><div><strong>本季可靠伙伴：</strong>${trusted} 人</div><div><strong>已解锁配方：</strong>${recipes.filter(r=>r.unlocked).length}/${recipes.length}</div></div>`;
  document.getElementById("endingModal").style.display="flex";
  document.getElementById("closeEndingBtn").onclick=()=>{
    document.getElementById("endingModal").style.display="none";
    day++;
    if (typeof resetDailyVisitor === 'function') resetDailyVisitor();
    resetDailyStats(); resetDailyBuff(); dayEndedFlag=false; gardenTodayCollected=false; reputationEventUsedToday=false;
    gardenYieldModifier=1.0; extraQueueSize=0; adventurerInjuryModifier=1.0; potionQualityModifier=1.0; residentOrderModifier=0;
    updateReputationBonus(); updateUI(); generateDailyQueue(); generateDailyResidents(); triggerDailyEvent();
    showMessage(`第 ${day} 天开始了！${getCurrentSeason().name}的第一天。`,false);
  };
}
function showFinalEnding(){
  let tier=getExpandedReputationTier(); let trusted=adventurers.filter(a=>a.favor>=80 && a.status!=="死亡").length; let dead=adventurers.filter(a=>a.status==="死亡").length; let unlocked=recipes.filter(r=>r.unlocked).length;
  let finalTitle="60天周目结束"; let finalText="六十天过去，炼金炉仍有余温，下一周目会留下新的故事。";
  if(shopLevel>=5 && reputation>=300){ finalTitle="闻名遐迩的炼金名店"; finalText="你的药剂被大家当成珍宝，富商、骑士团和远方冒险者都派人来订购。小镇因你的店铺而热闹起来。"; }
  else if(shopLevel>=5 && reputation>=100){ finalTitle="小镇金字招牌"; finalText="你完成了主线目标。居民们提起你的炼金术都会竖起大拇指，店铺也真正站稳了脚跟。"; }
  else if(reputation<=-300){ finalTitle="声名狼藉的禁忌药铺"; finalText="金币或许还在增长，但你的名字已经和毒药、诅咒、失踪的冒险者绑在一起。不是每个人都敢走进你的店。"; }
  else if(trusted>=8){ finalTitle="伙伴之店"; finalText="店铺规模也许不是最大，但许多冒险者把这里当作回家的地方。有人带来草药，有人替你宣传，有人在远征前先来看看你。"; }
  else if(gold<0){ finalTitle="负债的炉火"; finalText="账本上的赤字像灰尘一样堆满柜台。你还没有放弃，但下一次开炉前必须先想办法活下去。"; }
  document.getElementById("endingText").innerHTML=`<div style="font-size:44px;margin-bottom:8px;">🎭</div><h2>${finalTitle}</h2><div style="margin:18px 0;font-size:20px;line-height:1.75;text-align:left;">${finalText}</div><div style="background:#f5ead0;padding:16px;border-radius:12px;margin:15px 0;text-align:left;"><div><strong>最终声望：</strong>${tier.name} (${reputation})</div><div><strong>店铺等级：</strong>Lv.${shopLevel}</div><div><strong>总金币：</strong>${gold}</div><div><strong>炼制总数：</strong>${Object.values(craftCount).reduce((a,b)=>a+b,0)} 瓶</div><div><strong>解锁配方：</strong>${unlocked}/${recipes.length}</div><div><strong>高好感伙伴：</strong>${trusted} 人</div><div><strong>死亡冒险者：</strong>${dead} 人</div></div><div style="color:#8a6a4a;font-size:16px;margin-top:16px;">感谢游玩！可以继续经营或开启新周目。</div>`;
  document.getElementById("endingModal").style.display="flex";
  document.getElementById("closeEndingBtn").onclick=()=>{ document.getElementById("endingModal").style.display="none"; showMessage("周目已完成！可以继续自由经营。",false); };
}
function checkAndTriggerEnding(){ if(day>=30 && !endingTriggered30){ endingTriggered30=true; triggerEnding(); } }

function makePotion(){ if(gold>=8){ gold-=8; potion++; addExpense(8); craftCount.smallPotion++; totalCrafts++; updateRecipeUnlockStatus(); showMessage("🧪 炼制小红药水（8金币）"); updateUI(); checkAchievements(); } else showMessage("❌ 金币不足",true); }
function openUpgradeModal(){ let cost=getUpgradeCost(); document.getElementById("upgradeInfo").innerHTML=`当前Lv.${shopLevel}<br>下一级Lv.${shopLevel+1}<br>需${cost}金币<br>效果：新配方、批量炼制、租金优化`; document.getElementById("upgradeModal").style.display="flex"; }
function doUpgrade(){ let cost=getUpgradeCost(); if(gold>=cost){ gold-=cost; shopLevel++; addExpense(cost); updateUI(); updateRecipeUnlockStatus(); showMessage(`🏆 店铺升至Lv.${shopLevel}！`,false); document.getElementById("upgradeModal").style.display="none"; checkAchievements(); } else alert(`金币不足，需${cost}`); }
function closeUpgradeModal(){ document.getElementById("upgradeModal").style.display="none"; }
function openModal(recipeId){
  const page=document.getElementById("alchemyModal");
  if(!page) return;

  // 先进入目标页面状态，避免关闭旧页面时闪回主页面。
  document.body.classList.add("alchemy-open");
  try{ closeAdventurerInfoPopup(); }catch(e){}
  page.classList.remove("hidden-page");

  try{ closeSettings(); }catch(e){}
  try{ closeRecipeBookPage(); }catch(e){}
  try{ closeGarden(); }catch(e){}
  try{ closeAchievementPage(); }catch(e){}
  try{ closeMaterial(); }catch(e){}

  if(typeof recipeId === "number") selectedAlchemyRecipeId = recipeId;
  renderDynamicRecipes();
  updateBatchSelect();
  updateBatchAreaVisibility();
  if(typeof recipeId === "number"){
    const select=document.getElementById("batchRecipeSelect");
    if(select){ select.value=String(recipeId); updateBatchMaxByRecipe(); }
  }
}
function closeModal(){
  const page=document.getElementById("alchemyModal");
  if(page) page.classList.add("hidden-page");
  document.body.classList.remove("alchemy-open");
}

// ======================= 交易所页面 =======================
const EXCHANGE_MATERIALS = [
  { key:"mintLeaf", name:"野薄荷叶", image:"Assets/按钮button/交易所按钮/bohe 野薄荷.png" },
  { key:"chamomile", name:"微光洋甘菊", image:"Assets/按钮button/交易所按钮/ganju 微光洋甘菊.png" },
  { key:"rosemary", name:"尖刺迷迭香", image:"Assets/按钮button/交易所按钮/midiexiang 尖刺迷迭香.png" },
  { key:"lavender", name:"绒絮薰衣草", image:"Assets/按钮button/交易所按钮/xunyicao 绒絮薰衣草.png" },
  { key:"sweetRoot", name:"甜根草", image:"Assets/按钮button/交易所按钮/tiangengcao 甜根草.png" },
  { key:"holyFlower", name:"圣露花", image:"Assets/按钮button/交易所按钮/shengluhua 圣露花.png" },
  { key:"poisonMushroom", name:"毒腺菇", image:"Assets/按钮button/交易所按钮/duxiangu 毒腺菇.png" },
  { key:"redOre", name:"赤铁髓", image:"Assets/按钮button/交易所按钮/chitie 赤铁髓.png" },
  { key:"blueOre", name:"蓝萤石", image:"Assets/按钮button/交易所按钮/lanyingshi蓝萤石头.png" },
  { key:"blackOre", name:"黑银矿", image:"Assets/按钮button/交易所按钮/heiyinkuang 黑银矿.png" }
];

let selectedExchangeMaterial = "mintLeaf";

function getExchangeMaterialLabel(key){
  const item = EXCHANGE_MATERIALS.find(mat => mat.key === key);
  return item ? item.name : key;
}

function getExchangeMaxBuy(key){
  const price = getMaterialPrice(key);
  if(!price || price <= 0) return 1;
  return Math.max(1, Math.floor(gold / price));
}

function clampExchangeQty(){
  const input = document.getElementById("exchangeBuyQty");
  if(!input) return 1;
  const max = getExchangeMaxBuy(selectedExchangeMaterial);
  let value = parseInt(input.value, 10);
  if(!Number.isFinite(value) || value < 1) value = 1;
  if(value > max) value = max;
  input.max = String(max);
  input.value = String(value);
  return value;
}

function renderExchangePriceText(){
  const box = document.getElementById("exchangePrices");
  if(!box) return;

  const left = EXCHANGE_MATERIALS.slice(0, 5);
  const right = EXCHANGE_MATERIALS.slice(5, 10);
  const makeLine = item => {
    const selectedClass = item.key === selectedExchangeMaterial ? " selected-price" : "";
    return `<div class="exchange-price-line${selectedClass}"><span>${item.name}</span><span>${getMaterialPrice(item.key)}金</span></div>`;
  };

  box.innerHTML = `
    <div class="exchange-price-reputation">声望值:${reputation}</div>
    <div class="exchange-price-columns">
      <div>${left.map(makeLine).join("")}</div>
      <div>${right.map(makeLine).join("")}</div>
    </div>
  `;
}

function renderExchangeProducts(){
  const container = document.getElementById("exchangeProducts");
  if(!container) return;
  container.innerHTML = "";

  EXCHANGE_MATERIALS.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `exchange-product-btn exchange-product-${index + 1}${item.key === selectedExchangeMaterial ? " selected" : ""}`;
    btn.dataset.material = item.key;
    btn.setAttribute("aria-label", item.name);
    btn.style.backgroundImage = `url("${item.image}")`;
    btn.addEventListener("click", () => {
      selectedExchangeMaterial = item.key;
      renderExchangeProducts();
      renderExchangePriceText();
      clampExchangeQty();
    });
    container.appendChild(btn);
  });
}

function refreshExchangeUI(){
  renderExchangeProducts();
  renderExchangePriceText();
  clampExchangeQty();
}

function openMaterialManage(){
  const page = document.getElementById("exchangePage");
  if(!page) return;

  // 先进入目标页面状态，避免关闭旧页面时闪回主页面。
  document.body.classList.add("exchange-open");
  try{ closeAdventurerInfoPopup(); }catch(e){}
  page.classList.remove("hidden-page");

  try{ closeSettings(); }catch(e){}
  try{ closeRecipeBookPage(); }catch(e){}
  try{ closeGarden(); }catch(e){}
  try{ closeAchievementPage(); }catch(e){}
  try{ closeModal(); }catch(e){}

  refreshExchangeUI();
}

function closeMaterial(){
  const page = document.getElementById("exchangePage");
  if(page) page.classList.add("hidden-page");
  document.body.classList.remove("exchange-open");
}

function buySelectedExchangeMaterial(){
  if(!selectedExchangeMaterial) return;
  const qty = clampExchangeQty();
  buyMaterial(selectedExchangeMaterial, qty);
  refreshExchangeUI();
}

function renderBestiary(){ let grid=document.getElementById("adventurerGrid"); if(!grid) return; grid.innerHTML=""; adventurers.forEach(adv=>{ let card=document.createElement("div"); card.className="adventurer-card"; card.innerHTML=`<div class="adventurer-emoji">${adv.emoji}</div><div class="adventurer-name">${adv.name}</div><div class="level-badge">Lv.${adv.level}</div><div style="margin-top:12px;color:${adv.status==='健康'?'green':'red'}">${adv.status}</div><div>❤️ 好感：${adv.favor}</div>`; card.addEventListener("click",()=>{ currentAdventurerId=adv.id; showReportPage(); }); grid.appendChild(card); }); }
function showReportPage(){ let adv=adventurers.find(a=>a.id===currentAdventurerId); if(!adv) return; let container=document.getElementById("reportContent"); let expPercent=(adv.exp/adv.expToNext)*100; container.innerHTML=`<div style="text-align:center;"><div style="font-size:90px;">${adv.emoji}</div><div style="font-size:44px;">${adv.name}</div><div class="detail-row">职业：${adv.profession}</div><div class="detail-row">特殊机制：${adv.skill}</div><div class="detail-row">性格：${adv.traits}</div><div class="detail-row">偏好药水：${adv.favoritePotion}</div><div class="detail-row">常见结局：${adv.commonEnding}</div><div class="detail-row">等级Lv.${adv.level}</div><div class="detail-row">好感：${adv.favor}</div><div class="detail-row">状态：${adv.status}</div><div class="detail-row">经验 ${adv.exp}/${adv.expToNext}<div class="exp-bar"><div class="exp-fill" style="width:${expPercent}%;"></div></div></div><button id="upgradeAdvBtn" class="upgrade-btn">消耗100经验升级</button></div>`; let btn=document.getElementById("upgradeAdvBtn"); if(btn) btn.addEventListener("click",()=>{ if(adv.exp>=100){ adv.exp-=100; adv.level++; adv.expToNext=Math.floor(adv.expToNext*1.2); showMessage(`${adv.name}升到Lv.${adv.level}！`,false); showReportPage(); renderBestiary(); checkAchievements(); } else alert("经验不足"); }); document.getElementById("bestiaryPage").classList.add("hidden-page"); document.getElementById("reportPage").classList.remove("hidden-page"); }
function backToBestiary(){ document.getElementById("reportPage").classList.add("hidden-page"); document.getElementById("bestiaryPage").classList.remove("hidden-page"); renderBestiary(); }

// ======================= 右侧冒险者图鉴详情弹窗 =======================
let rightInventoryMode = "normal";

function getAdventurerPortraitPath(adv){
  return `Assets/人物立绘character/正面front/${adv.name}半身.png`;
}

function buildAdventurerDetailText(adv){
  return [
    `职业：${adv.profession}`,
    `特殊机制：${adv.skill}`,
    `性格：${adv.traits}`,
    `偏好药水：${adv.favoritePotion}`,
    `常见结局：${adv.commonEnding}`,
    ``,
    `等级 LV.${adv.level}`,
    `好感：${adv.favor}`,
    `状态：${adv.status}`,
    `经验 ${adv.exp}/${adv.expToNext}`
  ].join("<br>");
}

function openAdventurerInfoPopup(adventurerId){
  const adv = adventurers.find(a => a.id === adventurerId);
  if(!adv) return;

  currentAdventurerId = adv.id;

  const popup = document.getElementById("adventurerInfoPopup");
  const nameBox = document.getElementById("adventurerInfoName");
  const textBox = document.getElementById("adventurerInfoText");
  const expFill = document.getElementById("adventurerInfoExpFill");
  if(!popup || !nameBox || !textBox) return;

  nameBox.textContent = adv.name;
  textBox.innerHTML = buildAdventurerDetailText(adv);
  if(expFill){
    const percent = adv.expToNext ? Math.max(0, Math.min(100, (adv.exp / adv.expToNext) * 100)) : 0;
    expFill.style.width = `${percent}%`;
  }

  popup.classList.remove("hidden-page");
  popup.setAttribute("aria-hidden", "false");
}

function closeAdventurerInfoPopup(){
  const popup = document.getElementById("adventurerInfoPopup");
  if(!popup) return;
  popup.classList.add("hidden-page");
  popup.setAttribute("aria-hidden", "true");
}

function renderRightAdventurerGrid(){
  const inventoryGrid = document.getElementById("inventoryGrid");
  if(!inventoryGrid) return;

  inventoryGrid.innerHTML = "";
  inventoryGrid.classList.add("bestiary-grid-mode");

  adventurers.forEach(adv => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "inventory-item adventurer-inventory-item";
    item.dataset.adventurerId = String(adv.id);
    item.setAttribute("aria-label", adv.name);

    item.innerHTML = `
      <img class="inventory-img adventurer-avatar-img" src="${getAdventurerPortraitPath(adv)}" alt="${adv.name}">
      <div class="inventory-item-count">×♡</div>
    `;

    const img = item.querySelector("img");
    if(img){
      img.addEventListener("error", () => {
        img.remove();
        const fallback = document.createElement("div");
        fallback.className = "adventurer-avatar-fallback";
        fallback.textContent = adv.emoji || "？";
        item.insertBefore(fallback, item.firstChild);
      }, { once:true });
    }

    item.addEventListener("click", () => openAdventurerInfoPopup(adv.id));
    inventoryGrid.appendChild(item);
  });
}

function setRightInventoryMode(mode){
  rightInventoryMode = mode || "normal";
  const inventoryGrid = document.getElementById("inventoryGrid");
  if(inventoryGrid) inventoryGrid.classList.remove("bestiary-grid-mode");
  if(rightInventoryMode === "bestiary"){
    renderRightAdventurerGrid();
  }else{
    closeAdventurerInfoPopup();
    updateInventoryDisplay();
  }
}

const RECIPE_BOOK_BUTTON_IMAGES = {
  0:{ unlocked:"Assets/按钮button/配方书/hongyaoshuiPF 红药水配方.png" },
  1:{ unlocked:"Assets/按钮button/配方书/shengmingPF 大生命药水配方.png" },
  2:{ unlocked:"Assets/按钮button/配方书/moliPF 魔力药水配方.png" },
  3:{ unlocked:"Assets/按钮button/配方书/qiangmoPF 强力魔力配方.png", locked:"Assets/按钮button/配方书/qinagmoWJS 强力魔力未解锁.png" },
  4:{ unlocked:"Assets/按钮button/配方书/qingxingPF 清醒露配方.png" },
  5:{ unlocked:"Assets/按钮button/配方书/anmianPF 安眠茶配方.png" },
  6:{ unlocked:"Assets/按钮button/配方书/qiangmianPF 强力安眠配方.png", locked:"Assets/按钮button/配方书/qiangmianWJS 强力安眠未解锁.png" },
  7:{ unlocked:"Assets/按钮button/配方书/yongqiPF 勇气药水配方.png", locked:"Assets/按钮button/配方书/yongqiWJS 勇气药水未解锁.png" },
  8:{ unlocked:"Assets/按钮button/配方书/zhufuPF 祝福药水配方.png", locked:"Assets/按钮button/配方书/zhufuWJS 祝福药水未解锁.png" },
  9:{ unlocked:"Assets/按钮button/配方书/zuzhouPF 诅咒药水配方.png", locked:"Assets/按钮button/配方书/zuzhouWJS 诅咒未解锁.png" },
  10:{ unlocked:"Assets/按钮button/配方书/qingmaPF 轻微麻痹配方.png", locked:"Assets/按钮button/配方书/mabiWJS 轻微麻痹未解锁.png" },
  11:{ unlocked:"Assets/按钮button/配方书/qiangmaPF 强力麻痹配方.png", locked:"Assets/按钮button/配方书/qiangmaWJS 强力麻痹未解锁.png" }
};

function openRecipeBookPage(){
  // 先添加目标页面状态，再关闭其它左侧覆盖页，避免中间闪回主页面
  const page = document.getElementById("recipeBookPage");
  if(!page) return;

  document.body.classList.add("recipe-book-open");
  try{ closeAdventurerInfoPopup(); }catch(e){}
  page.classList.remove("hidden-page");

  try{ closeSettings(); }catch(e){}
  try{ closeModal(); }catch(e){}
  try{ closeGarden(); }catch(e){}
  try{ closeAchievementPage(); }catch(e){}
  try{ closeMaterial(); }catch(e){}

  renderRecipeBook();
}

function closeRecipeBookPage(){
  const page = document.getElementById("recipeBookPage");
  if(page) page.classList.add("hidden-page");
  document.body.classList.remove("recipe-book-open");
}

function openAchievementPage(){
  // 成就页改为主画布内的左侧覆盖页，右侧背包栏保持可见。
  const mainPage = document.getElementById("gameMainPage");
  const mainUi = document.querySelector("#gameMainPage .main-ui");
  const achievementPage = document.getElementById("achievementGalleryPage");
  const rightPanel = document.querySelector("#gameMainPage .right-ui-panel");
  if(!achievementPage || !mainUi) return;

  // 先进入目标页面状态，避免关闭旧页面时闪回主页面。
  document.body.classList.add("achievement-page-open");
  try{ closeAdventurerInfoPopup(); }catch(e){}

  try{ closeSettings(); }catch(e){}
  try{ closeModal(); }catch(e){}
  try{ closeRecipeBookPage(); }catch(e){}
  try{ closeGarden(); }catch(e){}
  try{ closeMaterial(); }catch(e){}

  // 首次打开时把原本独立页面移动进 1920x1080 主画布中，避免单独页面拉伸。
  if(achievementPage.parentElement !== mainUi){
    mainUi.insertBefore(achievementPage, rightPanel || null);
  }

  if(mainPage) mainPage.classList.remove("hidden-page");
  achievementPage.classList.remove("hidden-page");

  if(typeof refreshAchievementUI === "function") refreshAchievementUI();
}

function closeAchievementPage(){
  const achievementPage = document.getElementById("achievementGalleryPage");
  if(achievementPage) achievementPage.classList.add("hidden-page");
  document.body.classList.remove("achievement-page-open");
}

function closeLeftOverlayPages(){
  try{ closeAdventurerInfoPopup(); }catch(e){}
  try{ closeRecipeBookPage(); }catch(e){}
  try{ closeGarden(); }catch(e){}
  try{ closeAchievementPage(); }catch(e){}
  try{ closeModal(); }catch(e){}
  try{ closeMaterial(); }catch(e){}
  try{ closeSettings(); }catch(e){}
}

function openAlchemyFromRecipe(recipeId){
  const recipe = recipes.find(r => r.id === recipeId);
  if(!recipe || !recipe.unlocked){
    showMessage("该配方尚未解锁", true);
    return;
  }

  closeRecipeBookPage();
  openModal(recipeId);
}

function renderRecipeBook(){
  const container = document.getElementById("recipeGrid");
  if(!container) return;

  container.innerHTML = "";

  recipes.forEach((recipe, index) => {
    const asset = RECIPE_BOOK_BUTTON_IMAGES[recipe.id] || {};
    const imgPath = recipe.unlocked ? asset.unlocked : (asset.locked || asset.unlocked);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `recipe-book-card recipe-slot-${index + 1} ${recipe.unlocked ? "unlocked" : "locked"}`;
    btn.setAttribute("aria-label", recipe.name);
    btn.dataset.recipeId = recipe.id;

    if(imgPath){
      btn.style.backgroundImage = `url("${imgPath}")`;
    }

    if(recipe.unlocked){
      btn.addEventListener("click", () => openAlchemyFromRecipe(recipe.id));
    }else{
      btn.addEventListener("click", () => {
        showMessage(`🔒 ${recipe.name}尚未解锁：${recipe.lockCondition || "条件未达成"}`, true);
      });
    }

    container.appendChild(btn);
  });
}

function openGarden(){
    // 先进入目标页面状态，避免关闭旧页面时闪回主页面
    document.body.classList.add("garden-open");
  try{ closeAdventurerInfoPopup(); }catch(e){}

    try{ closeSettings(); }catch(e){}
    try{ closeModal(); }catch(e){}
    try{ closeRecipeBookPage(); }catch(e){}
    try{ closeAchievementPage(); }catch(e){}
    try{ closeMaterial(); }catch(e){}

    updateGardenUI();
    const gardenModal = document.getElementById("gardenModal");
    if(gardenModal) gardenModal.style.display = "flex";
}
function closeGarden(){
    const gardenModal = document.getElementById("gardenModal");
    if(gardenModal) gardenModal.style.display = "none";
    document.body.classList.remove("garden-open");
}
function getGardenOutputPreview(level){
    const safeLevel = Math.min(Math.max(Number(level) || 1, 1), 5);
    const previews = {
        1:{ common:"2-5份", rare:"低概率" },
        2:{ common:"3-6份", rare:"15%" },
        3:{ common:"4-7份", rare:"30%" },
        4:{ common:"5-8份", rare:"40%" },
        5:{ common:"6-10份", rare:"50%" }
    };
    return previews[safeLevel] || previews[5];
}

function getGardenBackgroundPath(level){
    const safeLevel = Math.min(Math.max(Number(level) || 1, 1), 5);
    const names = {
        1:"BackyardLv1后花园一级.png",
        2:"BackyardLv2后花园二级.png",
        3:"BackyardLv3后花园三级.png",
        4:"BackyardLv4后花园四级.png",
        5:"BackyardLv5后花园五级.png"
    };
    return `Assets/背景Background/后花园Backyard/${names[safeLevel]}`;
}

function applyGardenBackground(path){
    const gardenModal = document.getElementById("gardenModal");
    const gardenScene = document.querySelector("#gardenModal .garden-scene");
    const bgValue = `url("${path}")`;

    if(gardenModal){
        gardenModal.setAttribute("data-garden-level", String(gardenLevel));
        gardenModal.style.setProperty("--garden-bg", bgValue);
    }

    if(gardenScene){
        gardenScene.style.setProperty("--garden-bg", bgValue);
        gardenScene.style.backgroundImage = bgValue;
        gardenScene.style.backgroundSize = "100% 100%";
        gardenScene.style.backgroundPosition = "center";
        gardenScene.style.backgroundRepeat = "no-repeat";
    }
}

function updateGardenBackground(){
    const path = getGardenBackgroundPath(gardenLevel);
    const gardenScene = document.querySelector("#gardenModal .garden-scene");
    const current = gardenScene ? gardenScene.getAttribute("data-bg-path") : "";

    if(current === path){
        applyGardenBackground(path);
        return;
    }

    // 先预加载，再替换背景，避免升级时闪回主页面或出现空白。
    const img = new Image();
    img.onload = () => {
        if(gardenScene) gardenScene.setAttribute("data-bg-path", path);
        applyGardenBackground(path);
    };
    img.onerror = () => {
        // 即使图片路径临时加载失败，也保持 CSS 变量更新，便于控制台定位路径问题。
        if(gardenScene) gardenScene.setAttribute("data-bg-path", path);
        applyGardenBackground(path);
    };
    img.src = path;
}

function ensureGardenTextNodes(){
    const panel = document.getElementById("gardenInfoPanel");
    if(!panel) return;

    // 不再动态创建标题，避免出现“后花园 LV.后花园 LV.2”的重复标题。
    let info = document.getElementById("gardenInfo");
    if(!info){
        info = document.createElement("div");
        info.id = "gardenInfo";
        panel.appendChild(info);
    }

    if(!document.getElementById("gardenOutputText")){
        info.innerHTML = `
            <div id="gardenOutputText"></div>
            <div id="gardenRareText"></div>
            <div id="gardenUpgradeText"></div>
        `;
    }
}

function updateGardenUI(){
    ensureGardenTextNodes();
    updateGardenBackground();

    const levelText = document.getElementById("gardenLevelText");
    const title = document.querySelector("#gardenInfoPanel .garden-title");
    const outputText = document.getElementById("gardenOutputText");
    const rareText = document.getElementById("gardenRareText");
    const upgradeText = document.getElementById("gardenUpgradeText");
    const upgradeBtn = document.getElementById("upgradeGardenBtn");
    const closeBtn = document.getElementById("closeGardenBtn");

    // 兼容两种 HTML：
    // 1) <div class="garden-title">后花园 LV.<span id="gardenLevelText">1</span></div>
    // 2) <div id="gardenLevelText" class="garden-title"></div>
    if(levelText){
        if(title && title !== levelText && title.contains(levelText)){
            levelText.textContent = String(gardenLevel);
        }else{
            levelText.textContent = `后花园 LV.${gardenLevel}`;
        }
    }else if(title){
        title.textContent = `后花园 LV.${gardenLevel}`;
    }

    const preview = getGardenOutputPreview(gardenLevel);

    if(outputText){
        outputText.textContent = `预计产出：普通草药 ${preview.common}`;
    }

    if(rareText){
        rareText.textContent = `稀有草药：${preview.rare}`;
    }

    if(upgradeText){
        upgradeText.textContent = gardenLevel >= 5
            ? "升级条件：已达到最高等级"
            : `升级条件：消耗 ${getGardenUpgradeCost()} 金币`;
    }

    if(upgradeBtn){
        upgradeBtn.disabled = gardenLevel >= 5;
        upgradeBtn.title = gardenLevel >= 5 ? "已达到最高等级" : `升级花园：消耗 ${getGardenUpgradeCost()} 金币`;
    }

    if(closeBtn){
        closeBtn.textContent = "关闭";
        closeBtn.setAttribute("aria-label", "关闭后花园");
    }
}

function upgradeGarden(){
    if(gardenLevel >= 5){
        showMessage("后花园已达到最高等级");
        updateGardenUI();
        return;
    }

    const cost = getGardenUpgradeCost();

    if(gold < cost){
        showMessage("金币不足");
        return;
    }

    gold -= cost;
    gardenLevel++;

    // 保持后花园页面打开，只替换背景与文字，不让页面闪回主界面。
    const gardenModal = document.getElementById("gardenModal");
    if(gardenModal) gardenModal.style.display = "flex";

    updateGardenUI();
    updateUI();
    updateGardenUI();

    showMessage(`后花园升级成功！当前 Lv.${gardenLevel}`);
}
function collectGarden(){ if(gardenTodayCollected){ showMessage("今日已经采集过了！",true); return; } let output=getGardenOutput(); let detailMsg="🌿 后花园采集成功！\n\n"; let hasItems=false; let finalCommon={}; for(let [type,count] of Object.entries(output.common)){ let finalCount=Math.floor(count*gardenYieldModifier); if(finalCount>0) finalCommon[type]=finalCount; } let finalRare=Math.floor(output.rare*gardenYieldModifier); const herbNames={ mintLeaf:'🌿 野薄荷叶', chamomile:'🌼 微光洋甘菊', rosemary:'🌿 尖刺迷迭香', lavender:'💜 绒絮薰衣草', sweetRoot:'🌾 甜根草' }; let commonList=[]; for(let [type,count] of Object.entries(finalCommon)){ if(type==='mintLeaf') mintLeaf+=count; else if(type==='chamomile') chamomile+=count; else if(type==='rosemary') rosemary+=count; else if(type==='lavender') lavender+=count; else if(type==='sweetRoot') sweetRoot+=count; commonList.push(`${herbNames[type]} ×${count}`); hasItems=true; } if(commonList.length>0) detailMsg+="【普通草药】\n"+commonList.join('\n')+"\n\n"; if(finalRare>0){ if(output.rareType==='holyFlower'){ holyFlower+=finalRare; detailMsg+=`【稀有草药】\n✨ 圣露花 ×${finalRare}\n\n`; } else{ poisonMushroom+=finalRare; detailMsg+=`【稀有草药】\n🍄 毒腺菇 ×${finalRare}\n\n`; } hasItems=true; } detailMsg+=`🏡 花园等级：Lv.${gardenLevel}`; if(gardenYieldModifier!==1.0) detailMsg+=`\n🌟 今日产出修正：${(gardenYieldModifier*100).toFixed(0)}%`; gardenTodayCollected=true; showMessage(detailMsg,false); updateUI(); updateGardenUI(); }
function upgradeGarden(){

    if(gardenLevel >= 5){

        showMessage("后花园已达到最高等级");
        return;
    }

    const cost =
        getGardenUpgradeCost();

    if(gold < cost){

        showMessage("金币不足");
        return;
    }

    gold -= cost;

    gardenLevel++;

    updateGardenUI();

    updateUI();

    showMessage(
        `后花园升级成功！当前 Lv.${gardenLevel}`
    );
}
function startGame(){

  generateDailyQueue();
  generateDailyResidents();

  renderQueue();

  updateUI();

}
  function startGame(){
  document.getElementById("startScreen").classList.add("hidden-page");
  document.getElementById("gameMainPage").classList.remove("hidden-page");
  gold=200; potion=0; bigPotion=0; magicPotion=0; couragePotion=0; awakePotion=0; sleepPotion=0; strongSleepPotion=0; cursePotion=0; lightParalysis=0; strongParalysis=0; blessPotion=0;
  mintLeaf=3; chamomile=3; rosemary=2; lavender=2; sweetRoot=2; holyFlower=1; poisonMushroom=0; redOre=0; blueOre=0; blackOre=0; magicCrystal=0;
  day=1; maxDay=60; shopLevel=1; reputation=20; craftCount={ smallPotion:0, bigPotion:0, blessPotion:0, cursePotion:0 };
  dailyIncome=0; dailyExpense=0; dailyDeliverySuccess=0; totalDeliverySuccess=0; consecutiveNoDebtDays=0; lastDayHadDebt=false;
  firstDeliveryBonusMap={}; deliveryBonus=1.0; dailyDemandTags=[]; isEventActive=false; gameCompleted=false; unlockedEndless=false;
  endingTriggered30=false; gardenLevel=1; gardenTodayCollected=false;
  orders=[]; nextOrderId=1; queue=[]; residents=[];
  adventurers.forEach(a=>{ a.favor=50; a.status="健康"; a.exp=0; a.level=1; a.expToNext=100; });
  recipes.forEach(r=>{ if(r.id===0||r.id===1||r.id===4||r.id===5) r.unlocked=true; else r.unlocked=false; });
  syncLegacyMaterials();
  updateReputationBonus();
  updateUI();
  generateDailyQueue();
  generateDailyResidents();

  renderOrdersList();
  renderBestiary();
  renderRecipeBook();
  refreshAchievementUI();
  updateMainQuestProgress();
  updateUI();

  setTimeout(function(){
  if(typeof showNextAutoVisitor === "function"){
    showNextAutoVisitor();
  }else{
    renderQueue();
  }
}, 300);

showMessage("欢迎来到炼金店铺！点击顾客接取订单，炼制并交付药水。", false);
}
function openSettings() {
  const modal = document.getElementById("settingsModal");
  if(!modal) return;

  // 先进入设置页状态，避免关闭其它左侧页面时闪回主页面。
  document.body.classList.add("settings-open");
  try{ closeAdventurerInfoPopup(); }catch(e){}
  modal.style.display = "block";

  try{ closeRecipeBookPage(); }catch(e){}
  try{ closeGarden(); }catch(e){}
  try{ closeAchievementPage(); }catch(e){}
  try{ closeModal(); }catch(e){}
  try{ closeMaterial(); }catch(e){}

  const nameInput=document.getElementById("shopNameInput");
  if(nameInput) nameInput.value=shopName;
  const slider=document.getElementById("msgDuration");
  const value=document.getElementById("msgDurationValue");
  if(slider) slider.value=String(msgDuration);
  if(value) value.innerText=String(msgDuration);
}
function closeSettings() {
  const modal = document.getElementById("settingsModal");
  if(modal) modal.style.display = "none";
  document.body.classList.remove("settings-open");
}
function saveGame() { showMessage("存档功能演示",false); }
function loadGame() { showMessage("读档功能演示",false); }
function exportSave() { showMessage("导出存档",false); }
function importSave(file) { showMessage("导入存档",false); }

updateResidentVisibility();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("makePotionBtn").addEventListener("click", makePotion);
  document.getElementById("openAlchemyBtn").addEventListener("click", ()=>{ openModal(); });
  document.getElementById("openBestiaryBtn").addEventListener("click", ()=>{ document.getElementById("bestiaryPage").classList.remove("hidden-page"); document.getElementById("gameMainPage").classList.add("hidden-page"); renderBestiary(); });
  document.getElementById("openRecipeBookBtn").addEventListener("click", openRecipeBookPage);
  document.getElementById("upgradeShopBtn").addEventListener("click", openUpgradeModal);
  document.getElementById("endDayBtn").addEventListener("click", requestEndDay);
  document.getElementById("reputationChoiceBtn").addEventListener("click", showRandomReputationEvent);
  document.getElementById("settingsBtn").addEventListener("click", openSettings);
  document.getElementById("gardenBtn").addEventListener("click", openGarden);
  document.getElementById("materialManageBtn").addEventListener("click", ()=>{ openMaterialManage(); });
  document.getElementById("achievementBtn").addEventListener("click", openAchievementPage);
  document.getElementById("achievementBtnFake").addEventListener("click", openAchievementPage);
  document.getElementById("backToGameFromBestiary").addEventListener("click", ()=>{ document.getElementById("bestiaryPage").classList.add("hidden-page"); document.getElementById("gameMainPage").classList.remove("hidden-page"); });
  document.getElementById("backToGameFromRecipe").addEventListener("click", closeRecipeBookPage);
  document.getElementById("backToGameFromAchievement").addEventListener("click", closeAchievementPage);
  document.getElementById("backToBestiary").addEventListener("click", backToBestiary);
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  const closeMaterialBtn=document.getElementById("closeMaterialBtn"); if(closeMaterialBtn) closeMaterialBtn.addEventListener("click", closeMaterial);
  const exchangeCloseBtn=document.getElementById("exchangeCloseBtn"); if(exchangeCloseBtn) exchangeCloseBtn.addEventListener("click", closeMaterial);
  const exchangeBuyBtn=document.getElementById("exchangeBuyBtn"); if(exchangeBuyBtn) exchangeBuyBtn.addEventListener("click", buySelectedExchangeMaterial);
  const exchangeQtyInput=document.getElementById("exchangeBuyQty"); if(exchangeQtyInput) exchangeQtyInput.addEventListener("input", clampExchangeQty);
  const exchangeQtyMinus=document.getElementById("exchangeQtyMinus"); if(exchangeQtyMinus) exchangeQtyMinus.addEventListener("click", ()=>{ const input=document.getElementById("exchangeBuyQty"); if(input){ input.value=String((parseInt(input.value,10)||1)-1); clampExchangeQty(); } });
  const exchangeQtyPlus=document.getElementById("exchangeQtyPlus"); if(exchangeQtyPlus) exchangeQtyPlus.addEventListener("click", ()=>{ const input=document.getElementById("exchangeBuyQty"); if(input){ input.value=String((parseInt(input.value,10)||1)+1); clampExchangeQty(); } });
  document.getElementById("closeGardenBtn").addEventListener("click", closeGarden);
  const collectGardenButton =
  document.getElementById("collectGardenBtn") ||
  document.getElementById("collectBtn");

  if (collectGardenButton) {
    collectGardenButton.addEventListener("click", collectGarden);
  }
  document.getElementById("upgradeGardenBtn").addEventListener("click", upgradeGarden);
  document.getElementById("confirmSettlementBtn").addEventListener("click", confirmSettlement);
  document.getElementById("confirmEndYesBtn").addEventListener("click", ()=>{ document.getElementById("confirmEndModal").style.display="none"; performEndDay(); });
  document.getElementById("confirmEndNoBtn").addEventListener("click", ()=>{ document.getElementById("confirmEndModal").style.display="none"; });
  document.getElementById("doUpgradeBtn").addEventListener("click", doUpgrade);
  document.getElementById("closeUpgradeModal").addEventListener("click", closeUpgradeModal);
  document.getElementById("shortageInformBtn").addEventListener("click", handleShortageInform);
  document.getElementById("shortageGetBtn").addEventListener("click", handleShortageGet);
  document.getElementById("closeSettingsBtn").addEventListener("click", closeSettings);
  document.getElementById("saveGameBtn").addEventListener("click", saveGame);
  document.getElementById("loadGameBtn").addEventListener("click", loadGame);
  document.getElementById("exportSaveBtn").addEventListener("click", exportSave);
  document.getElementById("importFile").addEventListener("change", (e)=>{ if(e.target.files.length) importSave(e.target.files[0]); });
  document.getElementById("craftBatchBtn").addEventListener("click", craftBatch);
  const shopNameInput=document.getElementById("shopNameInput");
  if(shopNameInput){
    shopNameInput.addEventListener("input",(e)=>{
      shopName=(e.target.value || "").trim() || "炼金店铺";
    });
    shopNameInput.addEventListener("change",(e)=>{
      shopName=(e.target.value || "").trim() || "炼金店铺";
      e.target.value=shopName;
      showMessage(`店铺名称已修改为：${shopName}`, false);
    });
  }
  let msgSlider=document.getElementById("msgDuration");
  if(msgSlider) msgSlider.addEventListener("input",(e)=>{
    msgDuration=parseFloat(e.target.value) || 2;
    const value=document.getElementById("msgDurationValue");
    if(value) value.innerText=String(msgDuration);
  });
  let batchQty=document.getElementById("batchQuantity");
  if(batchQty) batchQty.addEventListener("input",(e)=>{ document.getElementById("batchQuantityValue").innerText=e.target.value; });
  let batchRecipeSelect=document.getElementById("batchRecipeSelect");
  if(batchRecipeSelect) batchRecipeSelect.addEventListener("change", updateBatchMaxByRecipe);
  document.querySelectorAll(".buy-material-btn").forEach(btn=>{ btn.addEventListener("click",(e)=>{ let mat=btn.getAttribute("data-material"); let qtyInput=document.getElementById("batchBuyQty"); let amount=qtyInput?parseInt(qtyInput.value)||1:1; buyMaterial(mat,amount); }); });

  const tabMaterialsBtn=document.getElementById("tabMaterials");
  if(tabMaterialsBtn) tabMaterialsBtn.addEventListener("click", ()=>setRightInventoryMode("normal"));
  const tabPotionsBtn=document.getElementById("tabPotions");
  if(tabPotionsBtn) tabPotionsBtn.addEventListener("click", ()=>setRightInventoryMode("normal"));
  const tabBestiaryBtn=document.getElementById("tabBestiary");
  if(tabBestiaryBtn) tabBestiaryBtn.addEventListener("click", ()=>setRightInventoryMode("bestiary"));
  const adventurerInfoCloseBtn=document.getElementById("adventurerInfoCloseBtn");
  if(adventurerInfoCloseBtn) adventurerInfoCloseBtn.addEventListener("click", closeAdventurerInfoPopup);
  document.getElementById("testEventBtn").addEventListener("click", ()=>{ triggerDailyEvent(); });
});

/* =========================================================
   冒险者图鉴头像点击 + 弹窗固定比例最终修复
   说明：不改动原有业务逻辑，只补充事件代理与固定比例变量。
   ========================================================= */
(function(){
  function updateFixedUIScale(){
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    if(!isFinite(scale) || scale <= 0) scale = 1;
    document.documentElement.style.setProperty('--ui-scale', String(scale));
  }

  function openAdventurerFromTarget(target){
    if(!target) return false;
    var item = target.closest && target.closest('.adventurer-inventory-item, [data-adventurer-id]');
    if(!item) return false;
    var grid = item.closest && item.closest('#inventoryGrid');
    if(!grid || !grid.classList.contains('bestiary-grid-mode')) return false;
    var id = parseInt(item.dataset.adventurerId, 10);
    if(Number.isNaN(id)) return false;
    if(typeof openAdventurerInfoPopup === 'function'){
      openAdventurerInfoPopup(id);
      return true;
    }
    return false;
  }

  function initAdventurerAvatarClickFix(){
    updateFixedUIScale();
    window.addEventListener('resize', updateFixedUIScale);

    var grid = document.getElementById('inventoryGrid');
    if(grid && !grid.__adventurerClickFixBound){
      grid.__adventurerClickFixBound = true;
      grid.addEventListener('click', function(e){
        if(openAdventurerFromTarget(e.target)){
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
      grid.addEventListener('pointerup', function(e){
        if(openAdventurerFromTarget(e.target)){
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    }

    if(!document.__adventurerGlobalClickFixBound){
      document.__adventurerGlobalClickFixBound = true;
      document.addEventListener('click', function(e){
        if(openAdventurerFromTarget(e.target)){
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
      document.addEventListener('pointerup', function(e){
        if(openAdventurerFromTarget(e.target)){
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAdventurerAvatarClickFix);
  }else{
    initAdventurerAvatarClickFix();
  }
})();
