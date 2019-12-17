import test from 'ava'
import { StringUtils } from '@/src/string'

const tests = [
  { item: 'camelCase', str: 'Some Str', expected: 'someStr' },
  { item: 'startCase', str: 'Some Str', expected: 'Some Str' }
]

tests.forEach(({ item, str, expected }) => {
  test(item, (t) => {
    const actual = StringUtils[item](str)
    t.is(expected, actual)
  })
})

test('parseXML', async (t) => {
  const str = '<xml>Some Str</xml>'
  const expected = 'Some Str'
  const actual = await StringUtils['parseXML'](str)
  t.is(actual.xml, expected)
})

test('parseXML (invalid XML)', async (t) => {
  const str = 'Some str and not XML'
  await StringUtils['parseXML'](str).catch((err) => {
    t.true(err.message.includes('Non-whitespace before first tag.'))
  })
})
