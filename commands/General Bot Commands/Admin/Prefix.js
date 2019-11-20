const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class Prefix extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      category: 'Admin',
      description: "Set your server's prefix",
      aliases: ['setprefix'],
      permsNeeded: ['MANAGE_GUILD'],
      guildOnly: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client

    msg.delete(10000)
    const db = await Database.Models.serverConfig.findOne({ where: { id: msg.guild.id } })

    if (!db) {
      const m = await msg.channel.send(
        Utils.embed(msg, 'red').setDescription(
          "your server doesn't exist in the database! This is most likely an internal error. Run the command again, and if it fails again, please contact <@302306624284917760>."
        )
      )
      return m.delete(10000)
    }

    if (args.length === 0) {
      const m = await msg.channel.send(
        Utils.embed(msg).setDescription(`the prefix for this server is: **${db.prefix}**`)
      )
      return m.delete(10000)
    }

    if (args.length > 1) {
      const m = await msg.channel.send(
        Utils.embed(msg, 'yellow').setDescription('only 1 argument is accepted for this command.')
      )
      return m.delete(10000)
    }

    await db.update({ prefix: args[0] })
    const m = await msg.channel.send(
      Utils.embed(msg).setDescription(`prefix successfully changed to **${args[0]}**`)
    )
    return m.delete(10000)
  }
}

module.exports = Prefix
