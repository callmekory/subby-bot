const Sequelize = require('sequelize')
const Database = require('../Database')

const generalConfig = Database.db.define('generalConfig', {
  username: Sequelize.STRING,
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  pihole: Sequelize.STRING,
  rclone: Sequelize.STRING,
  emby: Sequelize.STRING,
  docker: Sequelize.STRING,
  sengled: Sequelize.STRING,
  googleHome: Sequelize.STRING,
  transmission: Sequelize.STRING,
  sabnzbd: Sequelize.STRING,
  ombi: Sequelize.STRING,
  meraki: Sequelize.STRING,
  pioneerAVR: Sequelize.STRING,
  systemPowerControl: Sequelize.STRING,
  tuyaPlugControl: Sequelize.STRING
})

generalConfig.sync()
module.exports = generalConfig
