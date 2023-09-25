const AI_SYMBOL = "A";
const HUMAN_SYMBOL = "H";

class GameState {
  /**
   * 构造函数，用于创建游戏状态快照
   * @param {Array} mapState - 地图状态
   * @param {String} player - 目前是谁的回合
   * @param {Number} depth - 递归深度,用于最优得分的判断
   */
  constructor(mapState, player, depth, alpha, beta) {
    this.mapState = mapState;
    this.player = player;
    this.depth = depth;
    // 初始化
    this.nextBestStep = null; // 最优步骤的状态
    this.alpha = alpha || -Infinity; // 得分下界
    this.beta = beta || Infinity; // 得分上界
  }

  /**
   * 找到最优的下一步
   */
  findBestStep() {
    const stateMsg = this.checkGameOver();
    // 最终状态得分判断,借助深度找到最优解中最少步骤的
    if (stateMsg !== "Running") {
      if (stateMsg === AI_SYMBOL) return 20 - this.depth;
      else if (stateMsg === "Draw") return 0;
      else return -20 + this.depth;
    }
    // 获取所有可以走的方块
    const validAreas = this.getAllValidArea();
    let childrenMinScore = Infinity;
    let childrenMaxScore = -Infinity;
    // 枚举落点
    for (let area of validAreas) {
      const nextMapState = JSON.parse(JSON.stringify(this.mapState));
      nextMapState[area] = this.player;
      // 递归计算本次落点的得分
      const childState = new GameState(
        nextMapState,
        this.changeTurn(),
        this.depth + 1,
        this.alpha,
        this.beta
      );
      const score = childState.findBestStep();
      // 如果是 MAX 点就获取最高的分数.并记录当前走法
      if (this.player === AI_SYMBOL && score >= childrenMaxScore) {
        childrenMaxScore = score;
        this.alpha = score;
        this.nextBestStep = childState;
      }
      // 如果是 MIN 点就获取最低的分数
      else if (this.player === HUMAN_SYMBOL && score < childrenMinScore) {
        childrenMinScore = score;
        this.beta = score;
        this.nextBestStep = childState;
      }
      // 剪枝操作
      if (this.alpha >= this.beta) break;
    }
    return this.player === AI_SYMBOL ? childrenMaxScore : childrenMinScore;
  }

  // 切换到下一个状态
  move() {
    if (this.nextBestStep === null) return;
    this.mapState = JSON.parse(JSON.stringify(this.nextBestStep.mapState));
  }

  /**
   * 交换玩家操作权
   * @returns {String} 玩家标识符
   */
  changeTurn() {
    return this.player === AI_SYMBOL ? HUMAN_SYMBOL : AI_SYMBOL;
  }

  /**
   * 检查游戏是否结束,获胜/失败/平局/进行中
   * @returns {string}获胜/失败返回玩家标识,平局返回"Draw",还未结束返回"Running"
   */
  checkGameOver() {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        this.mapState[a] &&
        this.mapState[a] === this.mapState[b] &&
        this.mapState[a] === this.mapState[c]
      ) {
        return this.mapState[a];
      }
    }

    // 判断是否平局
    if (!this.getAllValidArea().length) return "Draw";
    else return "Running";
  }

  /**
   * 获取所有可以落子的位置下标
   * @returns {Array} - 包含可用下标的数组
   */
  getAllValidArea() {
    return this.mapState
      .map((item, index) => (item ? null : index))
      .filter((item) => item !== null);
  }
}
