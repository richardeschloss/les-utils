import test from 'ava'
import Model from '../utils/model.js'

test('Model (bad schema)', (t) => {
  const myModel = Model(111)
  const inst = myModel({
    someNum: 100
  })
  t.is(inst.someNum, 100)
})

test('Unsupported type', (t) => {
  const myModel = Model({
    val: 'noType',
    val2: 'noType2'
  }, {
    val2() {
      return { val: '321' }
    }
  })
  const inst = myModel({
    val: '123'
  })
  t.is(inst.val, '123')
})

test('Model (no fieldMap)', (t) => {
  const myModel = Model({
    someNum: 'number',
    cost: 'currency',
    humidity: 'percentage'
  })

  const inst = myModel({
    someNum: 100
  })

  t.is(inst.someNum.fmt, '100')
})

test('Model (fieldMap exists)', (t) => {
  const myModel = Model({
    _field: 'dataset',
    someNum: 'number',
    cost: 'currency',
    humidity: 'percentage',
    someInfo: { 
      firstName: 'string',
      lastName: 'string'
    },
    prices: [{
      day: 'currency'
    }],
    moreInfo: { 
      type: 'currency', 
      default: 123
    },
    more: {
      type: 'number', 
      default() {
        return 'x222'
      }
    },
    noProp: {
      someVal: 'number'
    },
    auto2: 'currency',
    auto3: 'string'
  }, {
    /** @param {any} obj */
    auto1(obj) {
      obj.auto1 = 111222
    },
    auto2() {
      return { val: 22 }
    },
    auto3() {
      return { val: 'somestr' }
    }
  })

  const inst = myModel({
    someNum: 100,
    cost: 22,
    hmdty: 0.24,
    someInfo: {
      firstName: 'John',
      lastName: 'Gumby'
    },
    prices: [{ day: 11 }, { day: 22 }]
  }, {
    dataset: {
      humidity: 'hmdty'
    }
  })
  
  t.is(inst.someNum.fmt, '100')
  t.is(inst.cost.fmt, '$22.00')
  t.is(inst.humidity.fmt, '24.00%')
  t.is(inst.someInfo.firstName, 'John')
  t.is(inst.someInfo.lastName, 'Gumby')
  t.is(inst.prices[0].day.fmt, '$11.00')
  t.is(inst.prices[1].day.fmt, '$22.00')
  t.is(inst.moreInfo.fmt, '$123.00')
  t.is(inst.more, 'x222')
  t.is(inst.auto1, 111222)
  t.is(inst.auto2.fmt, '$22.00')
  t.is(inst.auto3, 'somestr')
})