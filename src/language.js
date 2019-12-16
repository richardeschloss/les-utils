import { Svc as ibm } from '@/src/rexters/ibm'
import { Svc as yandex } from '@/src/rexters/yandex'

const rexters = {
  ibm,
  yandex
}

function LangUtils({ api = 'ibm' }) {
  if (!rexters[api]) {
    throw new Error(`svc ${api} not implemented`)
  }

  const out = rexters[api]
  /* Custom extensions could go here */
  return out
}

export { LangUtils }
