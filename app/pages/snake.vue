<script setup type="ts">
useHead({
  title: '贪吃蛇',
  meta: [
    { name: 'description', content: '贪吃蛇小游戏网页版' },
    { name: 'keywords', content: '贪吃蛇,游戏,在线,单机' }
  ],
  link: [{ rel: 'icon', type: 'image/svg', href: '/tanchishe.svg' }]
})

const GRID_SIZE = 24
const visible = ref(false)

let addArrowListener, removeArrowListener

onMounted(() => {
  ;({ addArrowListener, removeArrowListener } = useArrow(recodeDirectives, 'body'))
  visible.value = true
})
onUnmounted(() => {
  removeArrowListener?.()
})


const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
const status = ref('init')
const matrix = ref(Array.from({ length: GRID_SIZE }).map(() => Array.from({ length: GRID_SIZE }).fill(0)))
const snake = ref([]) // 蛇头在最后

/**
 * 自动步进
 * @param e 
 */
let stepInterval
const prevArrow = ref()
const currArrows = ref([])
function recodeDirectives(code) {
  if(status.value !== 'playing') return
  // 忽略非方向按键事件
  if (!directions.includes(code)) return
  currArrows.value.push(code)
  if(currArrows.value.length > 2) currArrows.value.shift()
}
function startInterval() {
  if(stepInterval) return
  stepInterval = setInterval(() => {
    if(status.value !== 'playing') {
      clearInterval(stepInterval)
      stepInterval = null
      return
    }
    step(currArrows.value.shift() || prevArrow.value)
  }, 1000)
}
function stopInterval() {
  if(!stepInterval) return
  clearInterval(stepInterval)
  stepInterval = null
}

function initSnake(d) {
  if(!d) d = directions[Math.floor(Math.random() * directions.length)]
  prevArrow.value = d
  currArrows.value = [d]
  const midIdx = Math.floor(GRID_SIZE / 2 - 1)
  let list = [] // 蛇头在最后
  switch (d) {
    case 'ArrowDown':
      list = [[midIdx - 1, midIdx], [midIdx, midIdx], [midIdx + 1, midIdx]]
      break
    case 'ArrowUp':
      list = [[midIdx + 1, midIdx], [midIdx, midIdx], [midIdx - 1, midIdx]]
      break
    case 'ArrowRight':
      list = [[midIdx, midIdx - 1], [midIdx, midIdx], [midIdx, midIdx + 1]]
      break
    case 'ArrowLeft':
      list = [[midIdx, midIdx + 1], [midIdx, midIdx], [midIdx, midIdx - 1]]
      break
    default: throw new Error('Invalid direction')
  }
  snake.value = []
  list.forEach(([x, y]) => {
    matrix.value[x][y] = 1
    snake.value.push([x, y])
  })
}

function init() {
  if(!['init', 'gameover', 'win'].includes(status.value)) return
  try {
    matrix.value = Array.from({ length: GRID_SIZE }).map(() => Array.from({ length: GRID_SIZE }).fill(0))
    initSnake()
    // 初始食物位置
    const [rowIdx, colIdx] = generateFood()
    matrix.value[rowIdx][colIdx] = 2
    status.value = 'init'
    start()
  } catch (error) {
    console.error(error)
  }
}
function start() {
  if(!['init', 'paused'].includes(status.value)) return
  status.value = 'playing'
  addArrowListener?.()
  // 恢复自动步进
  startInterval()
}
function pause() {
  if(status.value !== 'playing') return
  status.value = 'paused'
  removeArrowListener?.()
  // 停止自动步进
  stopInterval()
}
function stop(s) {
  if(!['paused', 'playing'].includes(status.value) || !['gameover', 'win'].includes(s)) return
  status.value = s
  removeArrowListener?.()
}
function step(direction) {
  if(status.value !== 'playing') return
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(direction)) return
  if (direction === reverseDirection(prevArrow.value)) direction = prevArrow.value
  else prevArrow.value = direction
  // debugger
  const headMove = {
    ArrowRight: [0, 1],
    ArrowLeft: [0, -1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
  }[direction]
  const head = snake.value[snake.value.length - 1]
  const newHead = [head[0] + headMove[0], head[1] + headMove[1]]
  if(newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE || matrix.value[newHead[0]][newHead[1]] === 1) {
    stop('gameover')
    shining('Game Over!', 'red')
    return
  }
  const eated = matrix.value[newHead[0]][newHead[1]] === 2
  matrix.value[newHead[0]][newHead[1]] = 1
  snake.value.push(newHead)
  if(GRID_SIZE * GRID_SIZE === snake.value.length) {
    stop('win')
    shining('You Win!')
    return
  }
  // 进食则生成新食物，否则尾巴前进一格
  if(eated) {
    try {
      const [rowIdx, colIdx] = generateFood()
      matrix.value[rowIdx][colIdx] = 2
    } catch (error) {
      stop('gameover')
      shining('Game Error: ' + (error.message || 'Unknown Error'), 'red', 'large')
      return
    }
  } else {
    const tail = snake.value.shift()
    matrix.value[tail[0]][tail[1]] = 0
  }
}
// 生成食物，排除snake占据的位置，随机从其余位置选择一个，若不存在空余坐标，则游戏成功，返回空数组
function generateFood() {
  let randomNum = Math.ceil(Math.random() * GRID_SIZE * GRID_SIZE - snake.value.length)
  if(randomNum <= 0) throw new Error('Process Error!')
  for(let rowIdx in matrix.value) {
    const row = matrix.value[rowIdx]
    for(let colIdx in row) {
      const col = row[colIdx]
      if(col > 0) continue
      if(--randomNum === 0) return [rowIdx, colIdx]
    }
  }
}
function reverseDirection(direction) {
  return {
    ArrowRight: 'ArrowLeft',
    ArrowLeft: 'ArrowRight',
    ArrowUp: 'ArrowDown',
    ArrowDown: 'ArrowUp',
  }[direction]
}
</script>

<template>
  <div class="full-height bg-white box-border p-4">
    <h1 class="text-center text-2.4em">贪吃蛇</h1>
    <div v-show="visible" flex="~ justify-center items-center">
      <div id="panel" :class="[status]">
        <div v-if="['init', 'paused', 'gameover', 'win'].includes(status)" class="overlay">
          <button v-if="status === 'init'" @click="init">开始</button>
          <button v-if="status === 'paused'" @click="start">继续</button>
          <button v-if="status === 'gameover'" @click="init">重新开始</button>
          <button v-if="status === 'win'" @click="init">重新开始</button>
        </div>
        <template v-for="(row, rowIdx) in matrix">
          <div v-for="(cell, colIdx) in row" :key="colIdx" class="cell-wrap">
            <div
              v-if="cell"
              class="cell"
              :class="{
                body: cell === 1,
                head: cell === 1 && snake[snake.length - 1][0] === rowIdx && snake[snake.length - 1][1] === colIdx,
                food: cell === 2
              }"
            />
          </div>
        </template>
      </div>
    </div>
    <div class="text-center mt-4">
      <div>currArrows: {{ currArrows }}</div>
      <button v-if="status === 'playing'" @click="pause">暂停</button>
      <button v-if="['paused', 'playing'].includes(status)" @click="stop('gameover')">结束</button>
    </div>
  </div>
</template>

<style scoped>
#panel {
  --cellLen: clamp(10px, calc(min(90vw, 70vh) / 24), 36px);
  position: relative;
  display: grid;
  grid-template-columns: repeat(v-bind(GRID_SIZE), var(--cellLen));
  border: 1px solid rgba(0,0,0,0.4);
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.3);
  z-index: 10;
}
/* #panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--cellLen) * v-bind(GRID_SIZE) + 1px);
  height: calc(var(--cellLen) * v-bind(GRID_SIZE) + 1px);
  background-image: linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px);
  background-size: var(--cellLen) var(--cellLen);
  z-index: 1;
} */

.cell-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--cellLen);
  width: var(--cellLen);
  min-width: 0;
  min-height: 0;
  z-index: 2;
}
.cell {
  height: 70%;
  width: 70%;
  cursor: pointer;
  user-select: none;
}
.cell.body, .cell.head {
  background-color: #1e1e1e;
  box-shadow: 0 0 2px 1px rgba(0,0,0,0.4);
}
.cell.head {
  height: 90%;
  width: 90%;
  border-radius: 2px;
}
.cell.food {
  background-color: #0ff;
  box-shadow: 0 0 2px 1px rgba(0,255,255,0.4);
}
</style>