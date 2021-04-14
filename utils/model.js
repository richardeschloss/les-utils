import FormatUtils from './format.js'

/** @type {import('./model').Model} */
function Model(schema, populate = {}) {
  return (input, fieldMaps = {}) => {
    if (typeof schema !== 'object') {
      return input
    }
    const fieldMap = fieldMaps[schema._field] || {}
    const out = {}
    Object.entries(schema).forEach(([field, fieldDef]) => {
      const type = fieldDef.type || fieldDef
      const prop = fieldMap[field] || field
      if (prop === '_field') return      

      if (typeof type === 'object') {
        if (!input[prop]) {
          return
        }
        
        if (Array.isArray(type)) {
          out[field] = input[prop].map(
            /** @param {any} entry */
            (entry) => {
            const subType = type[0].type || type[0]
            const model = Model(subType)
            return model(entry, fieldMaps)
          })
        } else {
          const model = Model(type)
          out[field] = model(input[prop], fieldMaps)
        }
        return
      }

      const { type: _, default: dflt, ...castOpts } = fieldDef
      const cast = FormatUtils[type]
      
      if (input[prop] !== undefined && input[prop] !== null) {
        out[field] = cast 
          ? cast(input[prop], castOpts) 
          : input[prop]
      }

      if (dflt && !input[prop]) {
        out[field] = typeof dflt === 'function' 
          ? dflt() 
          : FormatUtils[_](dflt, castOpts)
      }
    })
    Object.entries(populate).forEach(([field, fn]) => {
      const { val, opts = {} } = fn(out) || {}
      if (val) {
        const type = schema[field].type || schema[field]
        const cast = FormatUtils[type]
        out[field] = cast 
          ? cast(val, opts[field]) 
          : val
      }
    })

    return out
  }
}

export default Model