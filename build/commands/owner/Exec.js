"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
class Executor extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'exec',
            category: 'Owner',
            description: 'Run shell commands',
            ownerOnly: true,
            args: true,
            usage: ['exec <command>']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { channel } = msg;
        const { execAsync } = client.Utils;
        // * ------------------ Usage Logic --------------------
        const regex = new RegExp(client.config.token
            .replace(/\./g, '\\.')
            .split('')
            .join('.?'), 'g');
        const input = `📥 **Input:**\n\`\`\`sh\n${args.join(' ')}\n\`\`\``;
        const error = (err) => `🚫 **Error:**\n\`\`\`sh\n${err.toString().replace(regex, '[Token]')}\n\`\`\``;
        const { stdout, stderr } = (await execAsync(args.join(' '), { silent: false }));
        if (stderr) {
            try {
                return channel.send(`${input}\n${error(stderr)}`);
            }
            catch (err) {
                return channel.send(`${input}\n${error(err)}`);
            }
        }
        const response = `📤 **Output:**\n\`\`\`sh\n${stdout.replace(regex, '[Token]')}\n\`\`\``;
        try {
            return channel.send(`${input}\n${response}`, { split: true });
        }
        catch (err) {
            return channel.send(`${input}\n${error(err)}`);
        }
    }
}
exports.default = Executor;