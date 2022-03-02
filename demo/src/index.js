import React, {Component} from 'react'
import {render} from 'react-dom'

import { Test, KLine } from '../../src'

export default class Demo extends Component {
  render() {
    return <div>
      <h1>echarts-for-abc Demo</h1>
      <Test />
      <KLine />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
