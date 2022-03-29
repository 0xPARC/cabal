# Cabal server + frontend + discord bot

To install dependencies, please use

```
yarn
```

You also must create a `.env` file locally and ensure it has the discord token populated

```
DISCORD_TOKEN=XXXXXXXXXXXXXXXXX
```

To get the frontend + server started, please use

```
yarn dev
```

To start the discord bot, please use

```
yarn bot
```

Notes
* make sure that the role granted to the bot is above all of the roles it is managing for it to be able to grant roles

TODOs
* change to express server so that we can create prisma client and the discord client once, instead of having to instantiate them on every request
* programatically make sure that our discord role is above all of the other roles we're managing
* make frontend nicer
