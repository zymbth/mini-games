<script setup type="ts">
const GRID_SIZE = 24
const visible = ref(false)

/**
 * 网格宽度计算
 */

const cellLen = ref('18px')

onMounted(() => {
  handleResize()
  visible.value = true
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  try {
    const tmp = Math.round(Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) / GRID_SIZE) + 'px'
    cellLen.value = tmp
  } catch (error) {
    console.error(error)
  }
}

const status = ref('init')

const matrix = ref(Array.from({ length: GRID_SIZE }).map(() => Array.from({ length: GRID_SIZE }).fill(0)))
const snake = ref([])
const header = ref([])
const prevArrow = ref()

function initSnake(d) {
  const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  if(!d) d = directions[Math.floor(Math.random() * directions.length)]
  prevArrow.value = d
  const midIdx = Math.floor(GRID_SIZE / 2 - 1)
  let initSnake = []
  switch (d) {
    case 'ArrowRight':
      initSnake = [[midIdx - 1, midIdx], [midIdx, midIdx], [midIdx + 1, midIdx]]
      break
    case 'ArrowLeft':
      initSnake = [[midIdx + 1, midIdx], [midIdx, midIdx], [midIdx - 1, midIdx]]
      break
    case 'ArrowUp':
      initSnake = [[midIdx, midIdx - 1], [midIdx, midIdx], [midIdx, midIdx + 1]]
      break
    case 'ArrowDown':
      initSnake = [[midIdx, midIdx + 1], [midIdx, midIdx], [midIdx, midIdx - 1]]
      break
    default: throw new Error('Invalid direction')
  }
  initSnake.forEach(([x, y]) => {
    matrix.value[x][y] = 1
    // 头在最后
    snake.value.push([x, y])
  })
  header.value = initSnake[initSnake.length - 1]
}

function init() {
  if(status.value !== 'init') return
  try {
    matrix.value = Array.from({ length: GRID_SIZE }).map(() => Array.from({ length: GRID_SIZE }).fill(0))
    initSnake()
    status.value = 'playing'
    // 初始食物位置
    const [rowIdx, colIdx] = generateFood()
    matrix.value[rowIdx][colIdx] = 2
    window.addEventListener('keyup', handleKeyup)
  } catch (error) {
    console.error(error)
  }
}
function stop() {
  if(status.value !== 'playing') return
  status.value = 'init'
  window.removeEventListener('keyup', handleKeyup)
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
    alert('Game Over!')
    stop()
    return
  }
  const eated = matrix.value[newHead[0]][newHead[1]] === 2
  matrix.value[newHead[0]][newHead[1]] = 1
  snake.value.push(newHead)
  if(GRID_SIZE * GRID_SIZE === snake.value.length) {
    alert('You Win!')
    stop()
    return
  }
  // 进食则生成新食物，否则尾巴前进一格
  if(eated) {
    try {
      const [rowIdx, colIdx] = generateFood()
      matrix.value[rowIdx][colIdx] = 2
    } catch (error) {
      alert('Game Error: ' + (error.message || 'Unknown Error'))
      stop()
      return
    }
  } else {
    const tail = snake.value.shift()
    matrix.value[tail[0]][tail[1]] = 0
  }
}
// 生成食物，排除snake占据的位置，随机从其余位置选择一个，若不存在空余坐标，则游戏成功，返回空数组
function generateFood() {
  let randomNum = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE - snake.value.length)
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

function handleKeyup(e) {
  if(status.value !== 'playing') return
  // 忽略非方向按键事件
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) return
  e.stopPropagation()
  step(e.code)
}
</script>

<template>
  <div class="full-height bg-white box-border p-4">
    <!-- <h1 class="text-center text-2.4em">贪吃蛇</h1> -->
    <div v-show="visible" flex="~ justify-center items-center">
      <div id="panel">
        <template v-for="(row, rowIdx) in matrix">
          <div v-for="(cell, colIdx) in row" :key="colIdx" class="cell-wrap">
            <div v-if="cell" class="cell" :class="{ body: cell === 1, food: cell === 2 }"/>
          </div>
        </template>
      </div>
    </div>
    <div class="text-center mt-4">
      <button @click="init">开始</button>
      <button @click="stop">结束</button>
    </div>
  </div>
</template>

<style scoped>
#panel {
  --cellLen: v-bind(cellLen);
  position: relative;
  display: grid;
  grid-template-columns: repeat(v-bind(GRID_SIZE), var(--cellLen));
  border: 1px solid rgba(0,0,0,0.4);
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
.cell.body {
  background-color: #1e1e1e;
  box-shadow: 0 0 4px 2px rgba(0,0,0,0.4);
}
.cell.food {
  background-color: #0ff;
  box-shadow: 0 0 4px 2px rgba(0,0,0,0.4);
}
</style>