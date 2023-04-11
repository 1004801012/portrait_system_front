const { FtpDeployer } = require('@windraxb/ftp-deploy')
const path = require('path')

const ftpDeploy = new FtpDeployer()

const config = {
  user: 'root',
  password: '',
  host: '',
  port: 22,
  localPath: path.join(__dirname, '../dist'),
  remotePath: '',
  include: ['*'],
  exclude: ['dist/**/*.map', 'node_modules/**', 'node_modules/**/.*', '.git/**'],
  deleteRemote: false,
  sftp: true
}

ftpDeploy
  .deploy(config)
  .then(res => console.log('finished:', res))
  .catch(err => console.log(err))
