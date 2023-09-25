# 【课程设计】井字棋游戏

双击 `index.html` 即可开始游戏. 

本项目使用 TailwindCss 快速编写样式，开发过程中建议先使用 CDN 开发，然后借助 `npm run build` 命令构建 css 文件，随后引入该文件即可。

## 📚 结构描述

```js
.
│  alpha-beta.js		// 核心代码：alpha-beta剪枝
│  game.js			    // 游戏主体
│  index.html			// 游戏界面绘制
└──output.css			// 游戏样式文件
```

## 🎯效果预览

初始界面:

![image-20230923134410227](C:\Users\zbwer\AppData\Roaming\Typora\typora-user-images\image-20230923134410227.png)

游戏进行中:

![image-20230925164041729](C:\Users\zbwer\AppData\Roaming\Typora\typora-user-images\image-20230925164041729.png)

游戏结束界面:

![image-20230923134850299](C:\Users\zbwer\AppData\Roaming\Typora\typora-user-images\image-20230923134850299.png)

## ⚙️ 算法设计

首先是 DFS 算法，DFS 在本题中的核心应用是遍历所有能够落子的空格，再从当前位置递归遍历其他的空格，如果存在能够获胜的状态，则选择该空格落子。显然该算法并不能获得最优的落字选择，因为 DFS 算法本身只能判定某一个状态是否可达，而无法根据对手的行为判断该状态是否最优。此时我们就需要在 DFS 的过程中进行额外的处理，去分析对手的行为并作出相应的选择，这就是 MinMax 算法的核心思想。在算法的具体实现上，我们首先需要区分 Min 节点和 Max 节点，假设当前回合是 AI 的回合，则为 Max 节点。判断节点后，我们仍按照 DFS 的算法思想去递归遍历每一种情况，并且当此时处于人类玩家的回合时，一定会选择最差的状态。那么在井字棋游戏中如何评估游戏的状态呢，这一点会在后文讲到。随后是 Alpha-Beta 剪枝，可以简单地认为，$$\alpha$$ 是当前状态的得分下界（由Max节点决定），$$\beta$$ 是当前状态的得分上界（由Min节点决定），当得分下界比上界还高时，那么当前状态显然没必要去处理，因为无论如何都不会改变我们的最优情形。具体实现上来讲：我们只需要维护 $$\alpha$$ 和 $$\beta$$ 的值，并在遍历时进行判断即可，初始时分别为负无穷与正无穷，且子节点继承父节点的值。

核心代码如下：

```js
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
```

1. **游戏状态评估：** `findBestStep()`函数首先检查游戏是否结束（`this.checkGameOver()`）。如果游戏结束，它会根据游戏结果返回一个分数。这个分数基于游戏的结果和搜索的深度，深度越小，分数越高，意味着AI越早达到胜利。

2. **获取可能的行动：** 如果游戏还没有结束，函数会获取所有可能的行动（`this.getAllValidArea()`）。这些可能的行动是游戏中还没有被占据的区域。

3. **搜索可能的行动：** 对于每一个可能的行动，函数会创建一个新的游戏状态（`new GameState()`），并递归地调用`findBestStep()`来评估这个状态。这就是 MiniMax 搜索的核心：AI假设对手会采取最优的行动，然后根据这个假设来选择自己的行动。

4. **Max和Min节点：** 在搜索树中，有两种类型的节点：Max节点和Min节点。对于Max节点，AI会选择能使得评估分数最大化的行动；对于Min节点，AI会假设对手会选择能使得评估分数最小化的行动。

5. **Alpha-Beta剪枝：** 在搜索过程中，如果AI发现有一些行动无论如何都不会被选择（因为已经找到了更好的行动），那么AI就会停止评估这些行动，从而节省计算资源。

在这段代码中，`this.alpha`和`this.beta`分别代表当前搜索的最大和最小分数。如果`alpha`大于或等于`beta`，那么就可以停止搜索，因为已经找到了至少和当前最好的行动一样好的行动。

6. **返回最佳行动的评估分数：** 函数最后会返回最佳行动的评估分数。这个分数会被用于上一层搜索来决定最佳的行动。

