const { get, post } = require('unirest')
const urljoin = require('url-join')
const Command = require('../../core/Command')

module.exports = class PioneerAVR extends Command {
  constructor(client) {
    super(client, {
      name: 'avr',
      category: 'Smart Home',
      description: 'Pioneer AVR controller',
      usage: [`avr vol <1-100>`, `avr <off/on>`, `avr <mute>`],
      aliases: ['vol'],
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { sleep } = client.Utils
    const { p, Utils } = client
    const { missingConfig, warningMessage, validOptions, standardMessage, capitalize } = Utils

    // * ------------------ Config --------------------

    const { host } = client.db.config.pioneerAVR

    // * ------------------ Check Config --------------------

    if (!host) {
      const settings = [`${p}config set pioneerAVR host <http://ip>`]
      return missingConfig(msg, 'pioneerAVR', settings)
    }

    // * ------------------ Logic --------------------

    const getStatus = async () => {
      const response = await get(urljoin(host, '/StatusHandler.asp')).headers({
        accept: 'application/json'
      })

      return JSON.parse(response.body)
    }

    const getVolume = async () => {
      const stats = await getStatus()
      const currentVolume = stats.Z[0].V
      const value = (currentVolume / 185) * 100
      return Math.round(value)
    }

    const setVolume = async (number) => {
      const currentVol = await getVolume()
      if (number >= currentVol) {
        // setting the volume higher
        const raiseVal = (number - currentVol) * 2
        for (let i = 0; i < raiseVal; i++) {
          await get(urljoin(host, '/EventHandler.asp?WebToHostItem=VU')).headers({
            accept: 'application/json'
          })
        }
      } else if (number <= currentVol) {
        // setting the volume lower
        const lowerVal = Math.abs((number - currentVol) * 2)

        for (let i = 0; i < lowerVal; i++) {
          await get(urljoin(host, '/EventHandler.asp?WebToHostItem=VD')).headers({
            accept: 'application/json'
          })
        }
      }
    }

    const setPower = async (onoff) => {
      const state = onoff === 'on' ? 'PO' : 'PF'
      await get(urljoin(host, `/EventHandler.asp?WebToHostItem=${state}`)).headers({
        accept: 'application/json'
      })
      if (api) return `AVR turned [ ${capitalize(onoff)} ]`
      return standardMessage(msg, `:radio: AVR turned [ ${capitalize(onoff)} ]`)
    }

    const toggleMute = async () => {
      const status = await getStatus()
      const state = status.Z[0].M === 0 ? 'MO' : 'MF'
      await get(urljoin(host, `/EventHandler.asp?WebToHostItem=${state}`)).headers({
        accept: 'application/json'
      })
      const muteStatus = status.Z[0].M === 0 ? ':mute:' : ':speaker:'
      if (api) return `AVR [ ${muteStatus} ]`
      return standardMessage(msg, `${muteStatus} AVR [ ${muteStatus} ]`)
    }

    // * ------------------ Usage Logic --------------------

    // use first argument as our command
    const command = args[0]
    const level = args[1]

    switch (command) {
      case 'on':
      case 'off':
        return setPower(command)

      case 'mute':
        return toggleMute()

      case 'vol': // set volume
        // set volume
        if (!level) {
          const currentVol = await getVolume()
          if (api) return `Current volume is [ ${currentVol} / 100 ]`
          return standardMessage(msg, `:speaker: Current volume is [ ${currentVol} / 100 ]`)
        }
        if (isNaN(level)) {
          if (api) return `Volume should be a number between 1-100`
          return warningMessage(msg, `Volume should be a number between 1-100`)
        }
        for (let i = 0; i < 3; i++) {
          await setVolume(level)
          await sleep(600)
        }

        if (api) return `Volume set to ${level}`
        return standardMessage(msg, `:speaker: Volume set to [ ${level} ]`)

      default:
        return validOptions(msg, ['on', 'off', 'vol', 'mute'])
    }
  }
}
