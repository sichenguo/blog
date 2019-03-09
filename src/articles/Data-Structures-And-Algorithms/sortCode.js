/**
 * 生成长度为 n 的 0 ~ n 随机数组
 *
 * @param { Numer} n 数组长度
 * @returns
 */
function randomRange(n) {
  return new Array(n).fill(0).map(_ => (Math.random() * n) | 0)
}

/**
 * 交换数组项 正序
 *
 * @param {Array} ary
 * @param {*} x
 * @param {*} y
 */
function swap(ary, x, y) {
  if (x === y) return
  var temp = ary[x]
  ary[x] = ary[y]
  ary[y] = temp
}

/**
 * 测试排序算法的耗时
 *
 * @param {*} count
 * @param {*} l
 * @param {*} sortFnArr
 */
function testPerformance(count, l, sortFnArr) {
  let unSortArr, sortArr
  new Array(count).fill(0).forEach(it => {
    unSortArr = randomRange(l)

    sortFnArr.forEach((fn, i) => {
      console.time(fn.name + i)
      sortArr = sortFn(unSortArr)
      console.timeEnd(fn.name + i)
    })

    console.log(`未排序数组：${unSortArr}
    已排序数组：${sortArr}`)
  })
}

function selectSort(ary) {
  var l = ary.length
  var minPos
  for (var i = 0; i < l - 1; i++) {
    minPos = i
    for (var j = i + 1; j < l; j++) {
      if (ary[j] - ary[minPos] < 0) {
        minPos = j
      }
    }
    swap(ary, i, minPos)
  }
  return ary
}


