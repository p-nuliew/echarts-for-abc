import moment from 'moment'

/**
 *
 * @param {Object} param 接口数据
 * @returns
 */
const request = function (param) {
  console.log('------------------param: ', param);
  const { pageSize = 10, endTime = '' } = param
  return new Promise((resolved, rejected) => {
    setTimeout(resolved, 500, new Array(pageSize).fill({}).map((item, index) => {
      return {
        id: Math.random().toString().slice(2, 7),
        date: moment(endTime).subtract(pageSize - index - 1, 'days').format('MM-DD'),
        heightPrice: +('10' + Math.random().toString().slice(2, 4)),
        lowPrice: +('7' + Math.random().toString().slice(2, 4)),
        openingPrice: +('8' + Math.random().toString().slice(2, 4)),
        closingPice: +('8' + Math.random().toString().slice(2, 4)),
      }
    }))
  }).catch(err => {
    throw new Error(err)
  })
}

export {
  request
}