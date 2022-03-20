import React, {Component} from 'react'
import {render} from 'react-dom'

import { Test, KLine } from '../../src'

const propsConfig = {
  yAxisSplitNumber: 6,
  showTips: true,
  canDrag: true,
  canScroll: true
}

export default class Demo extends Component {
  render() {
    return <div>
      <h1>echarts-for-abc Demo</h1>
      <Test />
      <KLine propsConfig={propsConfig} />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
