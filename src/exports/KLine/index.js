import React, { useRef, useEffect } from 'react'
import './index.css';

const COLOR = {
  PRIMARY: '#365FAD',
  RED: '#EB5454',
  GREEN: '#46B262',
  LINE: '#FFF',
  TIP_LINE: '#727183',
  WHITE: '#FFF',
  BLACK: '#000',
}
const TEXT_COLOR = {
  PRIMARY: '#FDFDFD',
  SECOND: '#666',
}

const KLine = ({ initConfig , loadData }) => {
  // 配置项
  const config = {
    // y轴分段数量
    yAxisSplitNumber: 4,
    // 坐标轴与容器间的边距
    padding: {
      left: 50,
      right: 50,
      top: 30,
      bottom: 30
    },
    // 刻度线宽度
    tickWidth: 5,
    // 蜡烛宽度
    candleW: 20,
    // 曲线类型
    curveType: 'lowPrice',
    // 是否绘制辅助线
    showTips: false,
    // 是否可以拖拽
    canDrag: false,
    // 是否可缩放
    canScroll: false,
    // 最多一页展示多少条数据（最多20条）
    maxShowSize: 20,
    ...initConfig
  }

  const { yAxisSplitNumber, padding, tickWidth, candleW, curveType, showTips, canDrag, canScroll, maxShowSize } = config

  let myDataSource = useRef([])
  let myLeftDataSource = useRef([])
  let myRightDataSource = useRef([])

  // 初始变量
  let ctx = ''
  let canvasWidth = ''
  let canvasHeight = ''
  let yAxisOriginPointY = '' // y轴原点纵坐标
  let yAxisHeight = ''  // y轴高度
  let yAxisTickSpace = '' // y轴刻度间距
  let xAxisVertexX = '' // x轴顶点横坐标
  let xAxisWidth = '' // x轴宽度
  let init = true
  let pageSize = 10

  // 初始常量
  // y轴横坐标
  const yAxisPointX = padding.left
  // y轴顶点纵坐标
  const yAxisVertexY = padding.top
  const contentHeightRate = 0.9 || 1

  // 随画布元素数量变化而变化的属性
  let xAxisItemSpace = '' // // x轴元素间距
  let xAxisItemLength = pageSize

  // x轴刻度横坐标
  const xAxisTickPointX = (i) => {
    return yAxisPointX + i * xAxisItemSpace
  }

  /**
   * 绘制一串蜡烛（更新阶段）
   * @param {array} dataYAxisPoint 数据源
   * @param {number} candleW 蜡烛宽度
   */
  const renderCandles = (dataYAxisPoint, candleW) => {
    for (let i = 0, candleLength = dataYAxisPoint.length; i < candleLength; i++) {
      renderCandle(dataYAxisPoint[i], xAxisTickPointX(i), candleW)
    }
  }

  /**
   * 逐个渲染一串蜡烛（首次加载阶段）
   */
  const oneByOneRenderCandle = (dataYAxisPoint, candleW) => {
    for(let i = 0, candleLength = dataYAxisPoint.length; i < candleLength; i++) {
      (function(j) {
        setTimeout(() => {
          renderCandle(dataYAxisPoint[j], xAxisTickPointX(j), candleW)
        }, j * 100)
      }(i))
    }
  }

  /**
   * 绘制单个蜡烛
   * @param {number} xAxisItemPointX 蜡烛横坐标
   * @param {number} topPointY 顶点纵坐标
   * @param {number} secondPointY 第二个点的纵坐标（实体的顶点坐标）
   * @param {number} thirdPointY 第三个点的纵坐标（实体的底部坐标）
   * @param {number} bottomPointY 底部纵坐标
   * @param {number} candleW 蜡烛宽度
   * @param {string} candleColor 蜡烛颜色
   */
  const renderCandle = (dataItem, xAxisItemPointX, candleW) => {
    const halfCandleW = candleW / 2

    const { heightPrice, lowPrice, openingPrice, closingPice } = dataItem
    let secondPointY = undefined;
    let thirdPointY = undefined;
    let candleColor = undefined;

    if (closingPice < openingPrice) {
      // 涨
      candleColor = COLOR.RED
      secondPointY = closingPice
      thirdPointY = openingPrice
    } else {
      candleColor = COLOR.GREEN
      secondPointY = openingPrice
      thirdPointY = closingPice
    }

    // 绘制蜡烛上影线
    renderLine(xAxisItemPointX, heightPrice, xAxisItemPointX, secondPointY, COLOR.RED)

    // 绘制蜡烛下影线
    renderLine(xAxisItemPointX, lowPrice, xAxisItemPointX, thirdPointY, COLOR.GREEN)

    // 绘制蜡烛实体（绘制矩形）
    ctx.beginPath()
    ctx.moveTo(xAxisItemPointX - halfCandleW, secondPointY)
    ctx.rect(xAxisItemPointX - halfCandleW, secondPointY, candleW, thirdPointY - secondPointY)
    ctx.fillStyle = candleColor
    ctx.fill();
  }

  /**
   * 绘制线条
   * @param {number} sx 开始坐标点横坐标
   * @param {number} sy 开始坐标点纵坐标
   * @param {number} ex 结束坐标点横坐标
   * @param {number} ey 结束坐标点纵坐标
   * @param {string} lineColor 线条颜色
   * @param {number} lineWidth 线条宽度
   */
  const renderLine = (sx, sy, ex, ey, lineColor = COLOR.BLACK, lineWidth = 1) => {
    ctx.beginPath()
    //lineWidth = 1px时线条模糊的问题
    // 原理是canvas的路径中间有一条无限细的中心线，lineWidth 1px表示在中心线路径两边各绘制线宽的一半，也就是0.5，又因为浏览器的最小像素是1px，无法绘制0.5的像素，所以只好再往两边各扩展0.5px，所以导致看起来为2px
    // 参考https://www.cnblogs.com/star91/p/Canvas-zhong-ru-he-hua-yi-tiao-qing-xi-de-xian-kua.html
    ctx.moveTo(sx+0.5, sy+0.5)
    ctx.lineTo(ex+0.5, ey+0.5)
    // ctx.fillStyle = lineColor
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.closePath();

  }

  /**
   * 轴线文字
   * @param {object} ctx 上下文
   * @param {number} x 横坐标
   * @param {number} y 纵坐标
   * @param {string} text 文本
   * @param {string} align 文本对齐方式
   * @param {string} color 文本颜色
   */
  const renderText = (ctx, x, y, text, align = 'left', color = '#FFF') => {
    ctx.fillStyle = color;  // 文字颜色
    ctx.textBaseline = "middle";
    ctx.textAlign = align;

    ctx.font = "10px Arial";  // 高为10px的字体
    ctx.fillText(text, x, y)  // 描绘实体文字
  }

  /**
   * 绘制辅助线画布
   */
  const renderTipCanvas = () => {
    console.log('绘制辅助线画布');
    const tipCanvas = document.getElementById('tipCanvas');
    if (!tipCanvas.getContext) return
    const ctxTip = tipCanvas.getContext('2d');

    const maxPrice = Math.max(...myDataSource.current.map(x => x.heightPrice))
    const minPrice = Math.min(...myDataSource.current.map(x => x.lowPrice)) - 50

    // 提示框元素宽度
    let tipInfoElWidth = 100
    // 提示框内的日期元素
    let tipInfoElHeight = 80
    // x轴y轴上的提示背景框的宽、高
    const xyAxisTipBoxWidth = padding.left
    const xyAxisTipBoxHeight = 20

    // 判断鼠标是否在k线图内容区域
    const isContentArea = (e) => {
      const { offsetX, offsetY } = e
      return  offsetX > yAxisPointX &&
              offsetX < canvasWidth - padding.right - xAxisWidth / xAxisItemLength &&
              offsetY > padding.top &&
              offsetY < yAxisOriginPointY
    }

    // 监听鼠标移动事件并绘制辅助线
    tipCanvas.addEventListener('mousemove', function (e) {
      // 鼠标距目标节点左上角的X坐标、Y坐标
      const { offsetX, offsetY } = e
      // 清除画布
      ctxTip.clearRect(0, 0, canvasWidth, canvasHeight)
      // 不在内容区域则不进行绘制
      if (!isContentArea(e)) return


      // 绘制水平辅助线
      ctxTip.beginPath();
      ctxTip.setLineDash([4, 4]); // 设置虚线样式
      ctxTip.moveTo(yAxisPointX, offsetY);
      ctxTip.lineTo(canvasWidth - padding.right - xAxisWidth / xAxisItemLength, offsetY);
      ctxTip.strokeStyle = COLOR.LINE
      ctxTip.stroke();

      // 绘制垂直辅助线
      ctxTip.beginPath();
      ctxTip.setLineDash([4, 4]);
      ctxTip.moveTo(offsetX, padding.top);
      ctxTip.lineTo(offsetX, yAxisOriginPointY);
      ctxTip.stroke();

      // 绘制y轴tip文字背景框
      ctxTip.beginPath();
      ctxTip.rect(0, offsetY - xyAxisTipBoxHeight / 2, xyAxisTipBoxWidth, xyAxisTipBoxHeight);
      ctxTip.fillStyle = '#B9B8CE'
      ctxTip.fill();

      const yAxisLengthTranToPrice = len => {
          // 每个像素占多少钱
        const x = (maxPrice - minPrice) / yAxisHeight / contentHeightRate
        return (minPrice + len * x).toFixed(2)
      }
      // 绘制y轴tip文字
      renderText(ctxTip, yAxisPointX - 30, offsetY, yAxisLengthTranToPrice(yAxisOriginPointY - offsetY), 'center', COLOR.WHITE)

      // 绘制x轴tip文字背景框
      ctxTip.beginPath();
      ctxTip.rect(offsetX - xyAxisTipBoxWidth / 2, yAxisOriginPointY, xyAxisTipBoxWidth, xyAxisTipBoxHeight);
      ctxTip.fillStyle = '#B9B8CE'
      ctxTip.fill();

      // 绘制x轴tip文字
      // 获取x轴元素在x轴上的下标
      const xTipIndex = Math.round((offsetX - yAxisPointX) / xAxisWidth * xAxisItemLength)
      renderText(ctxTip, offsetX, yAxisOriginPointY + xyAxisTipBoxHeight / 2, myDataSource.current.map((x) => x.date)[xTipIndex] || '', 'center', COLOR.WHITE)

      // 绘制提示框
      let tipInfoPointX = padding.left + xAxisWidth - tipInfoElWidth  //  提示框的开始横坐标
      if (xTipIndex > xAxisItemLength / 2) {
        tipInfoPointX = padding.left
      }
      ctxTip.beginPath()
      ctxTip.rect(tipInfoPointX, yAxisVertexY, tipInfoElWidth, tipInfoElHeight)
      ctxTip.fillStyle = COLOR.WHITE
      ctxTip.fill();

      const { date, heightPrice, lowPrice, openingPrice, closingPice } = myDataSource.current[xTipIndex]

      const dataArr = [
        { label: 'open', value: openingPrice },
        { label: 'close', value: closingPice },
        { label: 'lowest', value: lowPrice },
        { label: 'highest', value: heightPrice },
      ]

      // 日期
      renderText(ctxTip, tipInfoPointX + 11, yAxisVertexY + 10, date, 'left', TEXT_COLOR.SECOND)
      // 当前数据
      dataArr.forEach(({ label, value }, i) => {
        // 设置提示框元素的样式和内容
        renderText(ctxTip, tipInfoPointX + 15, yAxisVertexY + 25 + i * 15, `${label}: ${value}`, 'left', TEXT_COLOR.SECOND)

        // 绘制小圆点
        ctxTip.beginPath();
        ctxTip.arc(tipInfoPointX + 10, yAxisVertexY + 25 + i * 15, 1, 0, 2 * Math.PI);
        ctxTip.fillStyle = COLOR.PRIMARY;
        ctxTip.fill()
      })
    }, false)

    // 处理拖拽
    // 鼠标按下时，显示拖拽元素在最上层
    tipCanvas.addEventListener('mousedown', function (e) {
      if (canDrag) {

        const kWrapNode = document.getElementById('kWrap')
        const draggableNode = document.getElementById('draggable')

        // 如果拖拽元素存在，则显示（避免重复创建）
        if (draggableNode) {
          draggableNode.style.display = 'block'
          draggableNode.style.cursor = 'grab'
          return
        }

        //创建拖拽元素
        const div = document.createElement('div')
        div.style.position = 'absolute'
        div.style.zIndex = '10'
        div.style.left = `${padding.left}px`
        div.style.top = `${padding.top}px`
        div.style.width = `${canvasWidth - padding.left - padding.right}px`
        div.style.height = `${canvasHeight - padding.top - padding.bottom}px`
        div.style.cursor = 'grab'
        div.setAttribute('id', 'draggable')
        div.setAttribute('draggable', 'true')

        kWrapNode.appendChild(div)

        // 处理“没有拖动时，单击拖拽元素后提示画布没有隐藏，表现为卡顿'的情况
        // 解决：mouseup 时，隐蔽自己，否则拖拽元素在最上层，提示画布将被遮挡无法显示
        // 因为拖拽元素在最上层，所以 mouseup 事件要绑定在拖拽元素上，绑在 tipCanvas 上无效
        div.addEventListener('mouseup', function(e) {
          div.style.display = 'none'
        })
      }
    }, false)
  }

  // 拖拽
  const getDrag = () => {
    // 水平拖动距离
    let horizontalDragDistance = 0
    // 插入数据时的光标位置
    let insertPosition = 0
    // 光标的上一个位置
    let lastPosition = ''

    /* 拖动目标元素时触发drag事件 */
    document.addEventListener("dragstart", function( event ) {
      // 清除提示画布
      const tipCanvas = document.getElementById('tipCanvas');
      if (!tipCanvas.getContext) return
      const ctxTip = tipCanvas.getContext('2d');

      // 清除提示画布
      ctxTip.clearRect(0, 0, canvasWidth, canvasHeight)

      insertPosition = event.offsetX
      lastPosition = event.offsetX
    }, false);

    /* 拖动目标元素时触发drag事件 */
    document.addEventListener("drag", function( event ) {
      const { offsetX } = event

      // TODO 不清楚小于0的场景,是被display: none的原因吗??
      if (offsetX < 0) return

      // 计算水平拖动距离
      horizontalDragDistance = Math.abs(offsetX - insertPosition)

      const draggableNode = document.getElementById('draggable')
      draggableNode.style.cursor = 'grabbing'


      // 如果拖动距离大于x轴元素间距，则插入
      if ( horizontalDragDistance > xAxisItemSpace) {
        // 根据上一刻的光标位置，判断鼠标拖动方向，更新画布
        if (lastPosition !== offsetX) {
          console.log('拖拽中....');
          // 往右拖动
          if (lastPosition < offsetX) {
            // 如果左侧数据全部显示完成，则不绘制
            if (myLeftDataSource.current.length === 0) return

            myDataSource.current.unshift(myLeftDataSource.current.pop())
            myRightDataSource.current.unshift(myDataSource.current.pop())
          } else {
            // 往左拖动
            if (myRightDataSource.current.length === 0) return

            myDataSource.current.push(myRightDataSource.current.shift())
            myLeftDataSource.current.push(myDataSource.current.shift())
          }
        }


        // 记录插入数据时的光标位置，用户判断下次的拖动方向
        insertPosition = offsetX

        // 清除画布并输入新数据重新绘制
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        // _dataSource = {
        //   leftData: myLeftDataSource.current,
        //   data: myDataSource.current,
        //   rightData: myRightDataSource.current

        // 注意：这种方式会存在闪屏问题（不能用setState）
        // 方法一：监听dataSource, dataSource发生改变时重新渲染renderKLineChart函数
        // setDataSource(_dataSource)


        // 方法二：重新执行renderKLineChart函数，那数据要什么时候保存？用什么方式保存？（用全局变量保存，直接赋值，不用useState）
        // renderKLineChart(myDataSource.current)

        renderKLineChart()
      }

      lastPosition = offsetX
    }, false);

    // 拖动结束时，隐藏draggable，否则辅助线出不来
    document.addEventListener("dragend", function() {
      console.log('-------拖拽结束');
      const draggableNode = document.getElementById('draggable')
      draggableNode.style.display = 'none'
      draggableNode.style.cursor = 'default'

      // 请求数据：如果左侧数据小于页数，请求接口数据
      if (myLeftDataSource.current.length < pageSize) {
        console.log('request: 左侧数据小于页数，请求左侧数据，并赋值给myLeftDataSource.current');

        // 请求数据
        loadData(pageSize, myLeftDataSource.current[0].date).then(res => {
          myLeftDataSource.current = [...res, ...myLeftDataSource.current]
        })
      }
    }, false);
  }

  // 缩放
  const getScroll = () => {
    const kWrapNode = document.getElementById('kWrap')

    // 监听滚轮事件（只考虑chrome）
    // 如需兼容火狐和ie，参考 https://blog.csdn.net/u014205965/article/details/46045099
    kWrapNode.addEventListener('wheel', function(e) {
      const { deltaX, deltaY } = e

      // 方向判断
      if (Math.abs(deltaX) !== 0 && Math.abs(deltaY) !== 0) return console.log('没有固定方向');
      if (deltaX < 0) return console.log('向右');
      if (deltaX > 0) return console.log('向左');

      if (deltaY > 0) {
        console.log('向上、放大');
        // 最小展示条数
        if (myDataSource.current.length <= pageSize) return

        // 处理数据
        myLeftDataSource.current.push(myDataSource.current.shift())
        myRightDataSource.current.unshift(myDataSource.current.pop())
      };
      if (deltaY < 0) {
        console.log('向下、缩小')
        if (myDataSource.current.length >= maxShowSize || myLeftDataSource.current.length === 0 || myLeftDataSource.current.length < pageSize) {
          console.log('request: 左侧数据为空，请求左侧数据，并赋值');
          // 请求数据
          loadData(pageSize, myDataSource.current[0].date).then(res => {
            myLeftDataSource.current = [...res, ...myLeftDataSource.current]
          })
        } else {
          myDataSource.current = [myLeftDataSource.current.pop(), ...myDataSource.current]
        }
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      renderKLineChart()
    }, false)
  }

  /**
   * 绘制k线图
   */
   const renderKLineChart = () => {
    if (myDataSource.current.length === 0) return
    console.log('myDataSource.current: ', myDataSource.current);

    xAxisItemLength = myDataSource.current.length
    xAxisItemSpace = xAxisWidth / xAxisItemLength

    const remainder = Math.ceil(xAxisItemLength / 5)
    const maxPrice = Math.max(...myDataSource.current.map(x => x.heightPrice))
    const minPrice = Math.min(...myDataSource.current.map(x => x.lowPrice)) - 50


    console.log('--------开始绘制k线图');

    // 实际价格转为canvas纵坐标
    const tranPriceToOrdinate = (price) => {
      // 每块钱占自定义坐标系的高度
      const rate = yAxisHeight / (maxPrice - minPrice) * contentHeightRate

      // 当前价格占自定义坐标系的高度
      const h = rate *  (price - minPrice)

      return yAxisOriginPointY - h
    }

    // 纵坐标集合
    const dataYAxisPoint = myDataSource.current.map(it => {
      const newIt = {}
      for (const key in it) {
        if (key === 'date') continue
        newIt[key] =  tranPriceToOrdinate(it[key])
      }
      return newIt
    })

    // Y轴刻度文字
    const yAxisTickText = (i) => {
        // 每个像素占多少钱
      const x = (maxPrice - minPrice) / yAxisHeight
      const num = (minPrice + yAxisTickSpace * i * x).toFixed(2)
      return num
    }

    // 绘制y轴文字与刻度
    for (let i = 0; i < yAxisSplitNumber; i++) {
      let sx = yAxisPointX
      let ex = yAxisPointX + tickWidth
      let y = yAxisOriginPointY - yAxisTickSpace * i * contentHeightRate
      renderText(ctx, sx - candleW / 2 - 1, y, yAxisTickText(i), 'right', TEXT_COLOR.PRIMARY)
    }

    // 绘制x轴
    renderLine(yAxisPointX, yAxisOriginPointY, xAxisVertexX, yAxisOriginPointY, COLOR.LINE)

    // 绘制x轴刻度与文字
    for (let i = 0; i < xAxisItemLength; i++) {
      const xAxisTickX = xAxisTickPointX(i)

      // 隔点展示
      if (i % remainder === 0 || i === xAxisItemLength - 1) {
        renderText(ctx, xAxisTickX, yAxisOriginPointY + tickWidth + 10, myDataSource.current.map((x) => x.date)[i], 'center', TEXT_COLOR.PRIMARY)
        renderLine(xAxisTickX, yAxisOriginPointY, xAxisTickX, yAxisOriginPointY + tickWidth, COLOR.LINE)
      }
    }

    /**
     * 获取当前点以及前后控制点坐集合
     * @param {string} curveType 曲线类型 { heightPrice, lowPrice, openingPrice, closingPice }
     * @param {array} dataYAxisPoint 数据源
     * @returns [array] 当前点以及前后控制点坐集合
     */
    const getControlPointInfo = (curveType = curveType, dataYAxisPoint) => {
      let controlPoint = []

      for (let i = 0; i < xAxisItemLength; i++) {
        const pricePointX = xAxisTickPointX(i)
        const pricePointY = dataYAxisPoint[i][curveType]
        let prevNode = {}
        let nextNode = {}

        // 边界处理：在首尾加入虚拟点，补全第一个元素没有前控制点，末尾元素没有后控制点的情况
        if (i === 0) {
          prevNode = { heightPrice: tranPriceToOrdinate(1000), lowPrice: tranPriceToOrdinate(600), openingPrice: tranPriceToOrdinate(780), closingPice: tranPriceToOrdinate(899) }
          nextNode = dataYAxisPoint[i + 1]
        } else if (i === xAxisItemLength - 1) {
          prevNode = dataYAxisPoint[i - 1]
          nextNode = { heightPrice: tranPriceToOrdinate(1021), lowPrice: tranPriceToOrdinate(720), openingPrice: tranPriceToOrdinate(782), closingPice: tranPriceToOrdinate(889) }
        } else {
          prevNode = dataYAxisPoint[i - 1]
          nextNode = dataYAxisPoint[i + 1]
        }
        // 前后点构成的三角形
        // b: 三角形的高
        const triangleHeight = Math.abs(nextNode[curveType] - prevNode[curveType])

        // a: 三角形底边
        const triangleBottomLine = xAxisItemSpace * 2
        // c: 三角形斜边 = (高的平方+底边的平方)的平方根
        const triangleHypotenuse = Math.sqrt(Math.pow(triangleHeight, 2) +  Math.pow(triangleBottomLine, 2))

        // 前后控制点为斜边的三角形
        // C: 控制点三角形斜边长度(自定义)
        const controlPointW = xAxisItemSpace * 0.5
        // A: 控制点三角形底边
        const controlPointBottomLine = controlPointW * triangleBottomLine / triangleHypotenuse
        // B: 控制点三角形的高
        const controlPointHeight = controlPointW * triangleHeight / triangleHypotenuse

        // 前一个控制点纵坐标
        let prevControlY = undefined
        // 后一个控制点纵坐标
        let nextControlY = undefined

        // 相对于canvas的坐标，如果前个控制点纵坐标小于下个控制点的纵坐标（相当于视觉上的左高右低）
        if (prevNode[curveType] < nextNode[curveType]) {
          // 左高右低
          prevControlY = pricePointY - controlPointHeight / 2
          nextControlY = pricePointY + controlPointHeight / 2
        } else {
          prevControlY = pricePointY + controlPointHeight / 2
          nextControlY = pricePointY - controlPointHeight / 2
        }

        controlPoint.push({
          curX: pricePointX,
          curY: pricePointY,
          prevControlX: pricePointX - controlPointBottomLine / 2,
          prevControlY,
          nextControlX: pricePointX + controlPointBottomLine / 2,
          nextControlY
        })
      }

      return controlPoint
    }

    /**
     * 绘制贝塞尔曲线
     * @param {array} controlPoint 控制点集合:  [{ curX: lowPricePointX, curY: lowPricePointY, prevControlX, prevControlY, nextControlX, nextControlY } ...]
     */
    const renderBezierCurve = (controlPoint) => {
      ctx.beginPath();
      for (let i = 0; i < controlPoint.length; i++) {
        const {
          curX,
          curY,
          prevControlX,
          prevControlY,
        } = controlPoint[i]

        if (i > 0 && i < controlPoint.length) {
          const prevNode = controlPoint[i - 1]
          ctx.bezierCurveTo(prevNode.nextControlX, prevNode.nextControlY, prevControlX, prevControlY, curX, curY);
          ctx.strokeStyle = COLOR.PRIMARY
        } else if ( i === 0) {
          ctx.moveTo(curX, curY);
        }
      }
      ctx.stroke();
    }

    // 绘制贝塞尔曲线
    renderBezierCurve(getControlPointInfo(curveType, dataYAxisPoint))

    if (init) {
      oneByOneRenderCandle(dataYAxisPoint, candleW)
      showTips && renderTipCanvas()
      canDrag && getDrag()
      canScroll && getScroll()
    } else {
      // 绘制一串蜡烛
      renderCandles(dataYAxisPoint, candleW)
    }

    console.log('绘制完成');
    init = false
  }


  // 得到上下文，开始初始化画布
  useEffect(() => {
    ctx = document.getElementById('canvas').getContext('2d')
    console.log('ctx: ', ctx);

    const { canvas: { width, height,  } } = ctx

    // 可知条件
    canvasWidth = width
    canvasHeight = height
    yAxisOriginPointY = height - padding.bottom
    yAxisHeight = height - (padding.top + padding.bottom)
    yAxisTickSpace = yAxisHeight / (yAxisSplitNumber - 1)
    xAxisVertexX = width - yAxisPointX
    xAxisWidth = width - yAxisPointX - padding.right
    xAxisItemSpace = xAxisWidth / xAxisItemLength

    // 请求数据
    loadData().then(res => {
      const data = res;
      pageSize = res.length / 2

      myDataSource.current = data.slice(pageSize)
      myLeftDataSource.current = data.slice(0, pageSize)
      renderKLineChart()
    })
  }, [])

  console.log('-------------------------');
  return (
    <div id="kWrap">
      <canvas id="canvas" width="600" height="300"></canvas>
      <canvas id="tipCanvas" width="600" height="300"></canvas>
    </div>
  )
}
export default React.memo(KLine)

