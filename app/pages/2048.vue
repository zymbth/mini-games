<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const BLACK_VALUE = null

const status = ref('initial')
const loading = ref(false)
const data = ref(Array.from({ length: 4 }).map(_ =>
  Array.from({ length: 4 }).fill(BLACK_VALUE)
))

onMounted(() => {
  data.value[0][1] = 2
  data.value[1][3] = 2
  document.addEventListener('keyup', handleKeyup)
})
onBeforeUnmount(() => {
  document.removeEventListener('keyup', handleKeyup)
})

// 键盘事件处理
function handleKeyup(e) {
  // 忽略非方向按键事件
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) return
  e.stopPropagation()
  handleStep(e.code)
}

function handleStep(code) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) return
  if (status.value === 'failed') {
    alert('Game Over')
    return
  }
  if (loading.value) return
  loading.value = true
  moveAndMerge(code).catch((err) => {
    alert(err?.message || '未知错误')
  }).finally(() => {
    loading.value = false
  })
}

function moveAndMerge(code) {
  return new Promise((resolve, reject) => {
    // 转换成一个方向（ArrowLeft），方便统一处理
    let tmpData
    // 转置
    const needTransMatirx = ['ArrowUp', 'ArrowDown'].includes(code)
    if (needTransMatirx) {
      tmpData = transMatrix(data.value)
    } else {
      tmpData = data.value
    }
    // 横向翻转
    const needReserveRow = ['ArrowDown', 'ArrowRight'].includes(code)
    if (needReserveRow) {
      tmpData = reserveRow(tmpData)
    }

    // ArrowLeft统一处理：逐行移动、合并
    const changeFlag = stepToLeft(tmpData)
    // 检测是否还可移动
    if (!checkMovable(tmpData)) {
      status.value = 'failed'
      return reject(new Error('Game Over'))
    }
    // 本次操作未更改
    if (!changeFlag) return resolve()

    // 生成新块
    const { rowIdx, colIdx, blockValue } = createBlock(tmpData)
    let [rowIdx1, colIdx1] = [rowIdx, colIdx]
    // 撤回"转置"与"横向翻转",同步调整新块坐标
    if (needReserveRow) {
      tmpData = reserveRow(tmpData)
      colIdx1 = 3 - colIdx1
    }
    if (needTransMatirx) {
      tmpData = transMatrix(tmpData);
      [colIdx1, rowIdx1] = [rowIdx1, colIdx1]
    }
    // 更新数据
    data.value = copyMatrix(tmpData)
    data.value[rowIdx1][colIdx1] = blockValue
    // 新块出现特效
    appearTransition(rowIdx1, colIdx1).then(resolve, reject)
  })
}
/**
 * 向左行动
 * @param arr 向左方向的二维数组
 * @return changeFlag 本次操作是否有更改(移动、合并)
 */
function stepToLeft(arr) {
  let changeFlag = false // 更改标识
  // 逐行
  arr.forEach((row) => {
    const moveFlag = moveToLeft(row)
    const mergeFlag = row.filter(Boolean).length > 1 && mergeToLeft(row)
    changeFlag = changeFlag || moveFlag || mergeFlag
  })
  return changeFlag
}
// 移动，例如：[2,null,2,2] -> [2,2,2,null]
function moveToLeft(row) {
  let count = 0, moveFlag = false
  // 遍历数组，将有效值依次从头(count)开始赋值到原数组上
  row.forEach((cell, colIdx) => {
    if (!cell) return
    if (!moveFlag && colIdx !== count) moveFlag = true
    row[colIdx] = BLACK_VALUE
    row[count++] = cell
  })
  return moveFlag
}
// 合并，例如：[2,2,2,null] -> [4,2,null,null], [2,2,2,2] -> [4,4,null,null]
function mergeToLeft(row) {
  let count = 0, mergeFlag = false
  // 遍历数组，连续两个相同有效值合并。将合并值或原值依次从头(count)开始赋值到原数组上
  for (let i = 0; i < row.length; i++) {
    const cell = row[i]
    if (!cell) continue
    row[i] = BLACK_VALUE
    // 合并
    if (cell === row[i + 1]) {
      if (!mergeFlag) mergeFlag = true
      row[i + 1] = BLACK_VALUE
      const newCell = cell * 2
      row[count++] = newCell
      i++
    } else {
      row[count++] = cell
    }
  }
  return mergeFlag
}

// 二维矩阵转置
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
// 横向翻转矩阵
function reserveRow(arr) {
  return arr.reduce((prev, curr) => {
    prev.push(curr.slice().reverse())
    return prev
  }, [])
}
// 判断是否还可移动
function checkMovable(arr) {
  return (
    !arr.every(p => p.every(Boolean))
    || arr.some(p => p.some((p1, idx) => p1 === p[idx + 1]))
    || transMatrix(arr).some(p => p.some((p1, idx) => p1 === p[idx + 1]))
  )
}
function copyMatrix(val) {
  return val.map(p => [...p])
}

/**
 * 生成块
 *
 * 在当前空位根据位置权重随机生成，ArrowLeft方向下越靠右的权重越大
 * @param arr ArrowLeft方向下的二维数组
 * @return block {rowIdx, colIdx}
 */
function createBlock(arr) {
  const w = [1, 4, 10, 100] // 位置权重
  const candidates = [] // 候选空块列表
  let start = 0, end = 0

  // 遍历二维数组，对于每个空块，按位置权重生成其取值区间 [start, start + w[i])。取整后调整为 [start, start + w[i] - 1]
  arr.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell) return
      end = start + w[colIdx]
      candidates.push({ rowIdx, colIdx, range: [start, end - 1] })
      start = end
    })
  })
  // if (end === 0) return { err: 'Game Over' }
  // 生成随机数，命中取值区间的块为目标块
  const randomIdx = Math.floor(Math.random() * end)
  const { rowIdx, colIdx } = candidates.find(
    p => p.range[0] <= randomIdx && randomIdx <= p.range[1]
  )
  return { rowIdx, colIdx, blockValue: generateBlockValue() }
}
function generateBlockValue() {
  return Math.random() < 0.9 ? 2 : 4
}

// 新增块的位置
const appear = ref([-1, -1])
// 新增块，并添加一个150ms的出现特效
function appearTransition(rowIdx, colIdx) {
  return new Promise((resolve) => {
    appear.value = [rowIdx, colIdx]
    setTimeout(() => {
      appear.value = [-1, -1]
      resolve()
    }, 150)
  })
}

// 块颜色
const colors = [
  '#cef4f5',
  '#91f3f2',
  '#01dcf2',
  '#00a7f5',
  '#749ffb',
  '#0177e1',
  '#315091',
  '#0442e3',
  '#6156d9',
  '#a580e9',
  '#b063ff',
  '#9d00e5',
  '#8a01ed'
]
function getBlockBg(value) {
  return colors[value ? Math.log2(value) : 0] ?? colors.at(-1)
}
</script>

<template>
  <div class="full-height bg-white box-border p-4">
    <h1 class="text-center text-2.4em">2048</h1>
    <div flex="~ justify-center items-center">
      <div id="panel">
        <template v-for="(row, rowIdx) in data" :key="rowIdx">
          <template v-for="(cell, colIdx) in row" :key="colIdx">
            <div class="cell-wrap">
              <div
                class="cell"
                :class="{ appear: rowIdx === appear[0] && colIdx === appear[1] }"
                :style="{ 'background-color': getBlockBg(cell) }">
                {{ cell }}
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
    <p class="text-center">使用方向键开始游戏</p>
  </div>
</template>
<style scoped>
#panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 10px;
  background-color: #d5fffe;
  width: 300px;
  height: 300px;
}

.cell-wrap {
  color: #fff;
  font-weight: bold;
  font-size: 24px;
  aspect-ratio: 1;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 255, 0.1);
  background-color: #cef4f5;
  cursor: default;
  user-select: none;
}

.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.appear {
  animation-name: appear;
  animation-duration: 0.15s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: unset;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: scale(0.3);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>