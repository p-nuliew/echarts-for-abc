import React, {Component} from 'react'
import {render} from 'react-dom'

import { Test } from '../../src'

export default class Demo extends Component {
  render() {
    return <div>
      <h1>echarts-for-abc Demo</h1>
      <Test />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
