'use strict'
// Recursive WHERE processor
module.exports = function (expr, opts) {
  // If AND or OR, recurse
  if (expr.type === 'binary_expr' && (expr.operator === 'AND' || expr.operator === 'OR')) {
    expr.left = module.exports(expr.left)
    expr.right = module.exports(expr.right)
  } else if (expr.type === 'function') {
    // within_box()
    if (expr.name === 'within_box') {
      const field = expr.args.value.shift().column
      const points = expr.args.value.map((item) => item.value)
      expr = {
        type: 'raw',
        value: field + ' && ST_MakeEnvelope(' + points.join(', ') + ', 4326)'
      }
    } else if (expr.name === 'within_circle') {
      // within_circle()
      expr.name = 'ST_Point_Inside_Circle'
      expr.args.value[expr.args.value.length - 1].value *= 0.00001 // convert degrees to meters
    } else if (expr.name === 'within_polygon') {
      // within_polygon()
      expr = {
        type: 'raw',
        value: 'ST_Within(' + expr.args.value[0].column + ', ST_GeometryFromText(\'' + expr.args.value[1].value + '\'))'
      }
    }
  }
  return expr
}
