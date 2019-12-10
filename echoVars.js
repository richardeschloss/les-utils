console.log('ENV VARS', process.env)
console.log('argv', process.argv)

if (process.env.K8S_SECRET_VAR2) {
  console.log('K8S_SECRET_VAR2...it is set!')
} else {
  console.log('K8S_SECRET_VAR2 not set...')
}

if (process.env.SECRET_VAR) {
  console.log('SECRET_VAR...it is set!')
} else {
  console.log('SECRET_VAR not set...')
}
