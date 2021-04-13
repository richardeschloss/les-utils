import test from 'ava'
import { writeFileSync, unlinkSync, readFileSync } from 'fs'
import { gentlyCopy } from '../utils/files.js'

test('gentlyCopy', (t) => {
  writeFileSync('./server/downloads/somefile.txt', 'somedata1')
  gentlyCopy(['./server/downloads/somefile.txt'], './server/downloads/somedest1.txt')
  const r1 = readFileSync('./server/downloads/somedest1.txt', { encoding: 'utf-8' })
  t.is(r1, 'somedata1')

  writeFileSync('./server/downloads/somefile.txt', 'somedata2')
  gentlyCopy(['./server/downloads/somefile.txt'], './server/downloads/somedest1.txt')
  const r2 = readFileSync('./server/downloads/somedest1.txt', { encoding: 'utf-8' })
  t.is(r2, 'somedata1')

  writeFileSync('./server/downloads/somefile.txt', 'somedata3')
  gentlyCopy('./server/downloads/somefile.txt', './server/downloads/somedest1.txt', { overwrite: true })
  const r3 = readFileSync('./server/downloads/somedest1.txt', { encoding: 'utf-8' })
  t.is(r3, 'somedata3')

  unlinkSync('./server/downloads/somedest1.txt')
  unlinkSync('./server/downloads/somefile.txt')
})