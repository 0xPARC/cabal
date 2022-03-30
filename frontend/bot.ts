import 'dotenv/config'
import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Client,
  Intents,
  Message,
  IntegrationApplication,
} from 'discord.js'

import { PrismaClient } from '@prisma/client'
import {
  Guild,
  Role,
  User,
  ConfiguredConnection,
  AuthToken,
} from '@prisma/client/index'

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
})
const prisma = new PrismaClient()

const HOSTNAME = 'cabal.xyz'

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('guildCreate', async (guild) => {
  console.log(guild)
  // if (!guild.available()) return
  const createdChannel = await guild.channels.create('cabal-join', {
    reason: 'A channel where users can get verified with cabal.',
  })
  // await createdChannel.send('Type /verify (slash-command) to get started!')
  const configureChannel = await guild.channels.create('cabal-configure', {
    reason: 'A channel where the admins can configure the cabal-bot.',
  })
  // await configureChannel.send('Type /configure (slash-command) to get started!')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  if (interaction.commandName === 'verify') {
    await interaction.reply({
      ephemeral: true,
      content: 'Generating link...wait a few moments...',
    })
    if (false) {
      // interaction.channel?.name !== 'cabal-join') {
      // await interaction.reply({
      //   content: 'Go to the cabal-join channel and type /verify again.',
      //   ephemeral: true,
      // })
      // return
    }

    if (!interaction.guild || !interaction.member) {
      await interaction.followUp({
        ephemeral: true,
        content: 'There was an error in retrieving the server or member.',
      })
      return
    }

    const guildId = interaction.guild.id
    const guild = await prisma.guild.findUnique({
      where: { guildId: guildId },
      include: { configuredConnections: true },
    })
    if (!guild) {
      await interaction.followUp({
        ephemeral: true,
        content: 'There was an error in retrieving the server.',
      })
      return
    }
    const validConnections = guild.configuredConnections.filter(
      (c) => !c.deleted
    )
    if (validConnections.length == 0) {
      await interaction.followUp({
        ephemeral: true,
        content:
          'There are no configured roles in this server. Ask your admin to set up one!',
      })
      return
    }

    if (validConnections.length > 1) {
      await interaction.followUp({
        ephemeral: true,
        content:
          'There are multiple configured roles in this server. We do not support that for now',
      })
      return
    }

    const configuredConnection = validConnections[0]

    const interactionUser = interaction.member.user
    const user = await prisma.user.upsert({
      where: { userId: interactionUser.id },
      update: { userName: interactionUser.username },
      create: {
        userId: interactionUser.id,
        userName: interactionUser.username,
      },
    })

    const authToken = await prisma.authToken.create({
      data: {
        userId: user.userId,
        configuredConnectionId: configuredConnection.id,
      },
    })

    const authTokenString = authToken.authTokenString

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL(`http://${HOSTNAME}/verify/${authTokenString}`)
        .setLabel('Generate ZK Proof')
        .setStyle('LINK')
    )

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${HOSTNAME}`)
      .setURL(`http://${HOSTNAME}/verify/${authTokenString}`)
      .setDescription(
        'Use this custom link to create a ZK proof for verification.'
      )

    await interaction.followUp({
      ephemeral: true,
      embeds: [embed],
      components: [row],
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
  } else if (interaction.commandName === 'configure') {
    await interaction.reply('Working on configuration.')

    console.log('Start of configuration  method')
    // TODO only make this work in the cabal-configure channel & only for admins
    if (!interaction.guild || !interaction.member) {
      await interaction.editReply(
        'There was an error in retrieving the server or member.'
      )
      return
    }
    /*
      interaction.options.get('merkle_root')
      { name: 'merkle_root', type: 'STRING', value: 'asdf' }
      interaction.options.get('verified_role')
      { role: { name: 'roleName', id: 'roleId' }, value: 'roleId'}
    */
    const selectedMerkleRoot = interaction.options.get('merkle_root')
      ?.value as string
    const selectedRole = interaction.options.get('verified_role')?.role
    if (!selectedMerkleRoot || !selectedRole) {
      await interaction.editReply(
        'An invalid merkle root or role was provided!'
      )
      return
    }

    const guild = await prisma.guild.upsert({
      where: { guildId: interaction.guild.id },
      update: { guildName: interaction.guild.name },
      create: {
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
      },
      include: { configuredConnections: true },
    })

    let existingConnection = false

    if (guild.configuredConnections.length > 1) {
      existingConnection = true
      // Delete all the existing ones, since we only allow 1
      for (let i = 0; i < guild.configuredConnections.length; i++) {
        await prisma.configuredConnection.update({
          where: { id: guild.configuredConnections[i].id },
          data: { deleted: true },
        })
      }
    }

    const createdRole = await prisma.role.upsert({
      where: { roleId: selectedRole.id },
      update: { roleName: selectedRole.name },
      create: { roleId: selectedRole.id, roleName: selectedRole.name },
    })

    await prisma.configuredConnection.create({
      data: {
        roleId: createdRole.roleId,
        guildId: guild.guildId,
        merkleRoot: selectedMerkleRoot,
        prettyName: '',
      },
    })
    let successMessage = `Successfully configured verification of inclusion in Merkle root "${selectedMerkleRoot}" to be assigned role "${selectedRole.name}."`
    if (existingConnection) {
      successMessage = successMessage.concat(
        `\n\n(P.S. we had to replace an existing configuration. For now we only allow 1 configuration per server.)`
      )
    }
    await interaction.editReply({
      content: successMessage,
    })
  }
})

client.login(process.env.DISCORD_TOKEN)
