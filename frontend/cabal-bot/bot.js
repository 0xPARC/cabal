"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require("dotenv/config");
var discord_js_1 = require("discord.js");
var client_1 = require("@prisma/client");
var client = new discord_js_1.Client({
    intents: [discord_js_1.Intents.FLAGS.GUILDS]
});
var prisma = new client_1.PrismaClient();
var HOSTNAME = 'cabal.xyz';
client.on('ready', function () {
    var _a;
    console.log("Logged in as ".concat((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag, "!"));
});
client.on('guildCreate', function (guild) { return __awaiter(void 0, void 0, void 0, function () {
    var createdChannel, configureChannel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(guild);
                return [4 /*yield*/, guild.channels.create('cabal-join', {
                        reason: 'A channel where users can get verified with cabal.'
                    })
                    // await createdChannel.send('Type /verify (slash-command) to get started!')
                ];
            case 1:
                createdChannel = _a.sent();
                return [4 /*yield*/, guild.channels.create('cabal-configure', {
                        reason: 'A channel where the admins can configure the cabal-bot.'
                    })
                    // await configureChannel.send('Type /configure (slash-command) to get started!')
                ];
            case 2:
                configureChannel = _a.sent();
                return [2 /*return*/];
        }
    });
}); });
client.on('interactionCreate', function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var guildId, guild, validConnections, configuredConnection, interactionUser, user, authToken, authTokenString, row, embed, selectedMerkleRoot, selectedRole, guild, existingConnection, i, createdRole, successMessage;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!interaction.isCommand())
                    return [2 /*return*/];
                if (!(interaction.commandName === 'verify')) return [3 /*break*/, 14];
                return [4 /*yield*/, interaction.reply({
                        ephemeral: true,
                        content: 'Generating link...wait a few moments...'
                    })];
            case 1:
                _c.sent();
                if (false) {
                    // interaction.channel?.name !== 'cabal-join') {
                    // await interaction.reply({
                    //   content: 'Go to the cabal-join channel and type /verify again.',
                    //   ephemeral: true,
                    // })
                    // return
                }
                if (!(!interaction.guild || !interaction.member)) return [3 /*break*/, 3];
                return [4 /*yield*/, interaction.followUp({
                        ephemeral: true,
                        content: 'There was an error in retrieving the server or member.'
                    })];
            case 2:
                _c.sent();
                return [2 /*return*/];
            case 3:
                guildId = interaction.guild.id;
                return [4 /*yield*/, prisma.guild.findUnique({
                        where: { guildId: guildId },
                        include: { configuredConnections: true }
                    })];
            case 4:
                guild = _c.sent();
                if (!!guild) return [3 /*break*/, 6];
                return [4 /*yield*/, interaction.followUp({
                        ephemeral: true,
                        content: 'There was an error in retrieving the server.'
                    })];
            case 5:
                _c.sent();
                return [2 /*return*/];
            case 6:
                validConnections = guild.configuredConnections.filter(function (c) { return !c.deleted; });
                if (!(validConnections.length == 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, interaction.followUp({
                        ephemeral: true,
                        content: 'There are no configured roles in this server. Ask your admin to set up one!'
                    })];
            case 7:
                _c.sent();
                return [2 /*return*/];
            case 8:
                if (!(validConnections.length > 1)) return [3 /*break*/, 10];
                return [4 /*yield*/, interaction.followUp({
                        ephemeral: true,
                        content: 'There are multiple configured roles in this server. We do not support that for now'
                    })];
            case 9:
                _c.sent();
                return [2 /*return*/];
            case 10:
                configuredConnection = validConnections[0];
                interactionUser = interaction.member.user;
                return [4 /*yield*/, prisma.user.upsert({
                        where: { userId: interactionUser.id },
                        update: { userName: interactionUser.username },
                        create: {
                            userId: interactionUser.id,
                            userName: interactionUser.username
                        }
                    })];
            case 11:
                user = _c.sent();
                return [4 /*yield*/, prisma.authToken.create({
                        data: {
                            userId: user.userId,
                            configuredConnectionId: configuredConnection.id
                        }
                    })];
            case 12:
                authToken = _c.sent();
                authTokenString = authToken.authTokenString;
                row = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
                    .setURL("http://".concat(HOSTNAME, "/verify/").concat(authTokenString))
                    .setLabel('Generate ZK Proof')
                    .setStyle('LINK'));
                embed = new discord_js_1.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle("".concat(HOSTNAME))
                    .setURL("http://".concat(HOSTNAME, "/verify/").concat(authTokenString))
                    .setDescription('Use this custom link to create a ZK proof for verification.');
                return [4 /*yield*/, interaction.followUp({
                        ephemeral: true,
                        embeds: [embed],
                        components: [row]
                    })
                    // This commented out code is for testing that the discord bot can set roles.
                    /*
                    async function assignRole(configuredConnection: ConfiguredConnection) {
                      const guildId = configuredConnection.guildId
                      const guild = await client.guilds.fetch(guildId)
                      if (!guild) {
                        return
                      }
                      const userId = user.userId
                      const member = await guild.members.fetch(userId)
                      if (!member) {
                        return
                      }
                      const roleId = configuredConnection.roleId
                      await member.roles.add([roleId])
                      console.log('done setting roleId')
                    }
                    await assignRole(configuredConnection)
                    */
                ];
            case 13:
                _c.sent();
                return [3 /*break*/, 28];
            case 14:
                if (!(interaction.commandName === 'configure')) return [3 /*break*/, 28];
                return [4 /*yield*/, interaction.reply('Working on configuration.')];
            case 15:
                _c.sent();
                console.log('Start of configuration  method');
                if (!(!interaction.guild || !interaction.member)) return [3 /*break*/, 17];
                return [4 /*yield*/, interaction.editReply('There was an error in retrieving the server or member.')];
            case 16:
                _c.sent();
                return [2 /*return*/];
            case 17:
                selectedMerkleRoot = (_a = interaction.options.get('merkle_root')) === null || _a === void 0 ? void 0 : _a.value;
                selectedRole = (_b = interaction.options.get('verified_role')) === null || _b === void 0 ? void 0 : _b.role;
                if (!(!selectedMerkleRoot || !selectedRole)) return [3 /*break*/, 19];
                return [4 /*yield*/, interaction.editReply('An invalid merkle root or role was provided!')];
            case 18:
                _c.sent();
                return [2 /*return*/];
            case 19: return [4 /*yield*/, prisma.guild.upsert({
                    where: { guildId: interaction.guild.id },
                    update: { guildName: interaction.guild.name },
                    create: {
                        guildId: interaction.guild.id,
                        guildName: interaction.guild.name
                    },
                    include: { configuredConnections: true }
                })];
            case 20:
                guild = _c.sent();
                existingConnection = false;
                if (!(guild.configuredConnections.length > 1)) return [3 /*break*/, 24];
                existingConnection = true;
                i = 0;
                _c.label = 21;
            case 21:
                if (!(i < guild.configuredConnections.length)) return [3 /*break*/, 24];
                return [4 /*yield*/, prisma.configuredConnection.update({
                        where: { id: guild.configuredConnections[i].id },
                        data: { deleted: true }
                    })];
            case 22:
                _c.sent();
                _c.label = 23;
            case 23:
                i++;
                return [3 /*break*/, 21];
            case 24: return [4 /*yield*/, prisma.role.upsert({
                    where: { roleId: selectedRole.id },
                    update: { roleName: selectedRole.name },
                    create: { roleId: selectedRole.id, roleName: selectedRole.name }
                })];
            case 25:
                createdRole = _c.sent();
                return [4 /*yield*/, prisma.configuredConnection.create({
                        data: {
                            roleId: createdRole.roleId,
                            guildId: guild.guildId,
                            merkleRoot: selectedMerkleRoot,
                            prettyName: ''
                        }
                    })];
            case 26:
                _c.sent();
                successMessage = "Successfully configured verification of inclusion in Merkle root \"".concat(selectedMerkleRoot, "\" to be assigned role \"").concat(selectedRole.name, ".\"");
                if (existingConnection) {
                    successMessage = successMessage.concat("\n\n(P.S. we had to replace an existing configuration. For now we only allow 1 configuration per server.)");
                }
                return [4 /*yield*/, interaction.editReply({
                        content: successMessage
                    })];
            case 27:
                _c.sent();
                _c.label = 28;
            case 28: return [2 /*return*/];
        }
    });
}); });
client.login(process.env.DISCORD_TOKEN);
