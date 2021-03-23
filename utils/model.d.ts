/**
 * For a given input, loop through each of the properties
 * and for each property, format the value based on the specified type.
 * 
 * If the input has property names that are different from the 
 * schema property names, for example, different sources may provide
 * the same data and use different names, then fieldMaps can specify
 * the field mapping. For the fieldMaps to work, the schema must
 * specify a "_field" property, and then the fieldMap for that will be used.
 * 
 * So, if the schema is: 
 * const schema = {
 *   _field: 'weather',
 *   humidity: 'percentage'
 *   ...
 * }
 * 
 * Then the fieldMaps might be something like:
 * 
 * const fieldMaps = {
 *   weather: { // <-- corresponds to "_field == 'weather'"
 *     humidity: 'hdty' // for example, if the weather provider abbreviated it.
 *   }
 * }
 */
export function ModelInst(input: any, fieldMaps?: any): any;
export type ModelInst = typeof ModelInst;

/**
 * For a given schema, which maps property names to types, will
 * return a model instance. If custom type names are provided and
 * understood by the format utils, those custom types will be returned.
 * For example, if the type is 'currency' and the input is 2.33,
 * the output for that type will be { val: 2.33, fmt: $2.33 }
 * 
 * `populate` is a map of property names to functions. Those functions
 * will be given the model instance so that they can calculate the new 
 * property based on other property values.
 * 
 * For example, if schema is:
 * const mySchema = {
 *   someNum: 'number'  
 * }
 * 
 * Then we'd define a model like:
 * const myModel = Model(schema, {
 *   doubled: (obj) => obj.someNum * 2
 * })
 * 
 * const myInst = myModel({ someNum: 100 })
 * 
 * --> result: 
 * myInst = {
 *   // From input provided: 
 *   someNum: { val: 100, fmt: '100' },
 *   // Calculated:
 *   doubled: { val: 200, fmt: '200' }
 * 
 * }
 * 
 */
export function Model(schema: any, populate?: any): ModelInst;
export type Model = typeof Model;

export default Model;