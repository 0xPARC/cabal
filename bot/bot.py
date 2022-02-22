# bot.py
import os
import random

import discord
import discord.ui
from dotenv import load_dotenv

load_dotenv()
token = os.getenv('DISCORD_TOKEN')

client = discord.Client()

@client.event
async def on_ready():
    print(f'{client.user.name} has connected to Discord!')

@client.event
async def on_member_join(member):
    await member.create_dm()
    await member.dm_channel.send(
        f'Hi {member.name}, welcome to my Discord server!'
    )

@client.event
async def on_guild_join(guild):
    created_channel = await guild.create_text_channel("cabal-join")
    await created_channel.send("Reply `!join` to join your cabal.")


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    brooklyn_99_quotes = [
        'I\'m the human form of the 💯 emoji.',
        'Bingpot!',
        (
            'Cool. Cool cool cool cool cool cool cool, '
            'no doubt no doubt no doubt no doubt.'
        ),
    ]

    if message.content == '99!':
        print("sending response")
        print(message.guild)
        # <Guild id=944758641934880779 name='test bot server' shard_id=None chunked=False member_count=3>
        # message.author
        # <Member id=854166265512984577 name='pumatheuma' discriminator='9412' bot=False nick=None guild=<Guild id=944758641934880779 name='test bot server' shard_id=None chunked=False member_count=3>>
        # message.guild.roles
        # [<Role id=944758641934880779 name='@everyone'>, <Role id=944775544233410621 name='verified'>, <Role id=944769060422422582 name='zk_collab_test_bot'>, <Role id=944777135590092822 name='new role'>, <Role id=944776746283200555 name='Collab.Land'>]
        import pdb; pdb.set_trace();
        response = random.choice(brooklyn_99_quotes)
        await message.channel.send(response)
        # await message.author.dm_channel.send(f'Hi {member.name}, welcome to my Discord server!')
    if message.channel.name == "cabal-join":
        if message.content == 'join-cabal':
            await message.channel.send("Go to this URL to join: <url_here>")
            embed = discord.Embed(title="This is an embed")
            embed.add_field(name="field1", value="value1")
            embed.add_field(name="field2", value="value2", inline=False)
            await message.channel.send(embed=embed)
            button = discord.ui.Button(custom_id="my_button", label="Button1")

            view = discord.ui.View()
            view.add_item(button)

            await message.channel.send(view=view)



client.run(token)