const viewGenerator = require('./plop-templates/view/prompt.ts')
const componentGenerator = require('./plop-templates/component/prompt.ts')

module.exports = function (plop) {
  plop.setHelper('formatClassPrefix', function (templateType) {
    if (templateType === 'view') {
      return 'page'
    }
    return 'comp'
  })

  plop.setGenerator('view', viewGenerator)
  plop.setGenerator('component', componentGenerator)
}
