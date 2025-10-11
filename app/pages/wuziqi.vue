<script setup>
const visible = ref(false)

/**
 * 网格宽度计算
 */

const cellLen = ref('30px')

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
    const tmp = Math.round(Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) / 15) + 'px'
    cellLen.value = tmp
  } catch (error) {
    console.error(error)
  }
}

const data = ref([])
initData()

const player = ref(1)
function trigglePlayer() {
  player.value = player.value === 1 ? 2 : 1
}

function handlePlay(rowIdx, colIdx) {
  if (data.value[rowIdx][colIdx]) return
  data.value[rowIdx][colIdx] = player.value
  if (checkWin()) {
    handleGameOver()
    return
  }
  trigglePlayer()
}

function handleGameOver() {
  setTimeout(() => {
    alert(`Player ${player.value} win!`)
    initData()
  }, 50)
}

function initData() {
  data.value = Array.from({ length: 15 }).map(() => Array.from({ length: 15 }).fill(0))
}

function checkWin() {
  if (data.value.some(checkRow)) return true
  if (transMatrix(data.value).some(checkRow)) return true
  if (checkDiagonal()) return true
  return false
}

function checkRow(row) {
  let count = 0
  for (let i = 0; i < row.length; i++) {
    const cell = row[i]
    if (cell === player.value) {
      count++
      if (count === 5) return true
    } else {
      count = 0
    }
  }
  return false
}
function transMatrix(arr) {
  const res = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (!res[j]) res[j] = []
      res[j][i] = arr[i][j]
    }
  }
  return res
}

function checkDiagonal() {
  // 右上 -> 左下
  for (let i = 4; i < 15; i++) {
    const row = []
    let rowIdx = 0, colIdx = i
    while(colIdx >= 0) {
      row.push(data.value[rowIdx++][colIdx--])
    }
    if (checkRow(row)) return true
  }
  for (let i = 1; i < 11; i++) {
    const row = []
    let rowIdx = i, colIdx = 14
    while(rowIdx < 15) {
      row.push(data.value[rowIdx++][colIdx--])
    }
    if (checkRow(row)) return true
  }
  // 左上 -> 右下
  for (let i = 10; i >= 0; i--) {
    const row = []
    let rowIdx = 0, colIdx = i
    while(colIdx < 15) {
      row.push(data.value[rowIdx++][colIdx++])
    }
    if (checkRow(row)) return true
  }
  for (let i = 1; i < 11; i++) {
    const row = []
    let rowIdx = i, colIdx = 0
    while(rowIdx < 15) {
      row.push(data.value[rowIdx++][colIdx++])
    }
    if (checkRow(row)) return true
  }
  return false
}
</script>

<template>
  <div class="full-height bg-white box-border p-4">
    <h1 class="text-center text-2.4em">五子棋</h1>
    <div v-show="visible" flex="~ justify-center items-center">
      <div id="panel">
        <template v-for="(row, rowIdx) in data">
          <div v-for="(cell, colIdx) in row" :key="colIdx" class="cell-wrap" @click="handlePlay(rowIdx, colIdx)">
            <div class="cell" :class="{ black: cell === 2, white: cell === 1 }"/>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
#panel {
  --cellLen: v-bind(cellLen);
  /* --cellLen: calc(min(100vw, 500px) / 15 * 0.8); */
  position: relative;
  display: grid;
  grid-template-columns: repeat(15, var(--cellLen));
}
#panel::before {
  content: '';
  position: absolute;
  top: calc(var(--cellLen) / 2);
  left: calc(var(--cellLen) / 2);
  width: calc(var(--cellLen) * 14 + 1px);
  height: calc(var(--cellLen) * 14 + 1px);
  background-image: linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px);
  background-size: var(--cellLen) var(--cellLen);
  z-index: 1;
}

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
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
}
.cell.black {
  background-color: #1e1e1e;
  box-shadow: 0 0 4px 2px rgba(0,0,0,0.4);
}
.cell.white {
  background-color: #fff;
  box-shadow: 0 0 4px 2px rgba(0,0,0,0.4);
}
</style>