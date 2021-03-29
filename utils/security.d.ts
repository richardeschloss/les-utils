/** 
 * Basing off openssl's template /etc/ssl/openssl.cnf (copied to ./.ssl) 
  
  The following was added to the end of that (i.e., myExt)
  
  [ myExt ]
  
  basicConstraints = critical,CA:true
  
  subjectKeyIdentifier = hash
  
  authorityKeyIdentifier = keyid:always,issuer
  
  subjectAltName = @alt_names

  [alt_names]

  DNS.1 = localhost

  DNS.2 = les

  Defaults:
  - keyout?: 'localhost.key',
  - out = 'localhost.crt',
  - domain = 'localhost',
  - emailAddress = '',
  - organization = '',
  - organizationalUnit = '',
  - countryCode = '',
  - state = '',
  - city = '',
  - days = '365'
*/
export function generateSelfSignedCert(options: {
  keyout?: string,
  out?: string,
  domain?: string,
  emailAddress?: string,
  organization?: string,
  organizationalUnit?: string,
  countryCode?: string,
  state?: string,
  city?: string,
  days?: string,
  extSection?: string,
  configFile?: string
}): Promise<{
  evt: string,
  data: {
    keyout: string,
    out: string
  }
}>;

export type generateSelfSignedCert = typeof generateSelfSignedCert;

export default Readonly<{
  generateSelfSignedCert: generateSelfSignedCert;  
}>;