import React, { useEffect, useState } from 'react'
import {render} from 'react-dom'
import moment from 'moment';
import { request } from '../../src/utils';

import { Test, KLine } from '../../src'

const initConfig = {
  yAxisSplitNumber: 6,
  showTips: true,
  canDrag: true,
  canScroll: true
}

const Demo = () => {
  /**
   * 请求K线图数据
   * @param {number} pageSize 页数
   * @param {string} endTime 结束时间
   */
  const onRequestData = (pageSize = 20, endTime = moment().format('MM-DD') ) => {
    console.log('endTime: ', endTime);
    console.log('pageSize: ', pageSize);
    return request({ pageSize, endTime })
  }

  // new KLine(initConfig,)

  return (
    <div>
      <h1>echarts-for-abc Demo</h1>
      <Test />
      <KLine
        initConfig={initConfig}
        loadData={onRequestData}
      />
    </div>
  )
}

export default Demo

render(<Demo/>, document.querySelector('#demo'))
