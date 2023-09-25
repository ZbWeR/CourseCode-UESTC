const gameStartBtn = document.getElementById("gameStartBtn");
const mapContainer = document.getElementById("mapContainer");
const reStartBtn = document.getElementById("reStartBtn");
const allGridArea = Array.from(mapContainer.children);

// 开始游戏,隐藏按钮并初始化
gameStartBtn.addEventListener("click", () => {
  gameStartBtn.style.display = "none";
  initGame();
});

// 等待玩家行动
mapContainer.addEventListener("click", (e) => {
  humanPlay(e);
});

/**
 * 将数组类型的地图绘制到网页上
 * @param {Array} mapState - 地图信息数组
 */
function mapInfoToHTML(mapState) {
  mapState.forEach((item, index) => {
    if (!item) allGridArea[index].innerHTML = "";
    else if (item === AI_SYMBOL) allGridArea[index].innerHTML = "✔️";
    else allGridArea[index].innerHTML = "⭕";
  });
}

let gameInstance;
let gameMapState;
/**
 * 初始化游戏
 */
function initGame() {
  // 清空画板
  gameMapState = new Array(9).fill("");
  gameInstance = null;
  mapInfoToHTML(gameMapState);
}

/**
 * 获取触发点击事件的方块下标
 * @param {Event} e - 点击事件
 */
function humanPlay(e) {
  // 人类玩家行动
  const clickOne = e.target;
  if (clickOne.innerHTML) return;
  const index = allGridArea.indexOf(clickOne);
  gameMapState[index] = HUMAN_SYMBOL;
  mapInfoToHTML(gameMapState);
  // AI行动
  gameInstance = new GameState(gameMapState, AI_SYMBOL, 0);

  // 记录行动时间
  let startTime = new Date().getTime();
  gameInstance.findBestStep();
  let endTime = new Date().getTime();
  console.log(`耗时:${endTime - startTime} ms`);

  gameInstance.move();
  gameMapState = gameInstance.mapState;
  mapInfoToHTML(gameMapState);

  gameOver();
}

const msgLose = document.getElementById("msgLose");
const msgDraw = document.getElementById("msgDraw");
const msgWin = document.getElementById("msgWin");
const gameOverMsg = document.getElementById("gameOverMsg");

/**
 *  判断游戏是否结束并绘制提示信息
 */
function gameOver() {
  const stateMsg = gameInstance.checkGameOver();
  if (stateMsg === "Running") return;
  gameOverMsg.style.display = "flex";
  if (stateMsg === AI_SYMBOL) msgLose.style.display = "flex";
  else if (stateMsg === "Draw") msgDraw.style.display = "flex";
  else msgWin.style.display = "flex";
}

// 重新开始
reStartBtn.addEventListener("click", () => {
  initGame();
  gameOverMsg.style.display = "none";
  [msgLose, msgDraw, msgWin].forEach((item) => {
    item.style.display = "none";
  });
});
