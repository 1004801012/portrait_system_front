const { notEmpty } = require('../utils.ts')

module.exports = {
  description: 'generate vue component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'component name please',
      validate: notEmpty('name')
    },
    {
      type: 'checkbox',
      name: 'blocks',
      message: 'Blocks:',
      choices: [
        {
          name: '<template>',
          value: 'template',
          checked: true
        }, {
          name: '<script>',
          value: 'script',
          checked: true
        }, {
          name: 'style',
          value: 'style',
          checked: 'true'
        }
      ],
      validate (value) {
        if (value.indexOf('script') === -1 && value.indexOf('template') === -1) {
          return `Components require at last a <script> or <template> tag.`
        }
        return true;
      }
    }
  ],
  actions (data) {
    const name = '{{properCase name}}'
    const actions = [
      {
        type: 'add',
        path: `src/components/${name}/index.vue`,
        templateFile: 'plop-templates/component/index.hbs',
        data: {
          name,
          template: data.blocks.includes('template'),
          script: data.blocks.includes('script'),
          style: data.blocks.includes('style')
        }
      },
      {
        type: 'add',
        path: `src/components/${name}/style.less`,
        templateFile: 'plop-templates/style/index.hbs',
        data: {
          name: name,
          templateType: 'component'
        }
      }
    ]

    return actions
  }
}
