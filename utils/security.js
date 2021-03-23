import { spawn } from 'child_process'

/** @type import('./security').generateSelfSignedCert */
export function generateSelfSignedCert(options) {
  const {
    keyout = 'localhost.key',
    out = 'localhost.crt',
    domain = 'localhost',
    emailAddress = '',
    organization = '',
    organizationalUnit = '',
    countryCode = '',
    state = '',
    city = '',
    days = '365'
  } = options
  const cmd = 'openssl'
  const args = [
    'req',
    '-newkey',
    'rsa:2048',
    '-x509',
    '-nodes',
    '-keyout',
    keyout,
    '-new',
    '-out',
    out,
    '-subj',
    [
      `/CN=(${domain})`,
      `/emailAddress=${emailAddress}`,
      `/O=${organization}`,
      `/OU=${organizationalUnit}`,
      `/C=${countryCode}`,
      `/ST=${state}`,
      `/L=${city}`
    ].join(''),
    '-sha256',
    '-days',
    days
  ]

  if (options.extSection) {
    // Example: options.extSection = 'myExt'
    args.push('-extensions', options.extSection)
  }

  if (options.configFile) {
    // Example: options.configFile = './.ssl/openssl.cnf'
    args.push('-config', options.configFile)
  }

  return new Promise((resolve) => {
    spawn(cmd, args)
    .on('close', () => {
      console.log('created', { keyout, out })
      resolve({
        evt: 'createdSSLCert',
        data: { keyout, out }
      })
    })
  })
}

const SecurityUtils = {
  generateSelfSignedCert  
}

export default Object.freeze(SecurityUtils)
