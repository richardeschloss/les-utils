import { spawn } from 'child_process'
const SecurityUtils = {
  generateSelfSignedCert(options) {
    /*
    Basing off openssl's template /etc/ssl/openssl.cnf (copied to ./.ssl)
    The following was added to the end of that (i.e., myExt)
      [ myExt ]
      basicConstraints = critical,CA:true
      subjectKeyIdentifier = hash
      authorityKeyIdentifier = keyid:always,issuer
      subjectAltName = @alt_names
  
      [alt_names]
      DNS.1 = localhost
      DNS.2 = les
    */

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
      days = 365
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
      spawn(cmd, args).on('close', () => {
        console.log('created', { keyout, out })
        resolve({
          evt: 'createdSSLCert',
          data: { keyout, out }
        })
      })
    })
  }
}

export { SecurityUtils }
