# Me

An API for your online presence.

https://me.xetera.dev/graphiql

## Providers

Supported services, implemented in the order of what's applicable to me in https://xetera.dev

- [x] Amazon Kindle
  - Book title, cover image, author, etc
  - Last read date including device
- [x] Spotify
  - [x] Liked songs
  - [ ] Playlists
- [x] Simkl (Plex, Netflix, Crunchyroll, etc)
- [ ] Discord
- [ ] Anilist
- [ ] Osu

## Setting up

1. `pnpm i`
2. Copy `.env.example` to `.env` and fill in the relevant fields. Make sure to also get a planetscale db set up for convenience. You can also use a local db if you want.
3. Copy `config.example.toml` to `config.toml` and fill in the relevant fields.
4. `pnpm dev`

## Deploying

I personally use [Dokku](https://dokku.com/docs/getting-started/installation/) for deployment, but you can use whatever you want.

In case you want to deploy my way:

1. Run `pnpm encrypt` to move your encrypted configuration file to `.dokku/ansible/config.toml.enc`
2. Add `IP` and `PRIVATE_KEY` in github secrets corresponding to the private key you use to deploy in Dokku.
3. Change the `domains` and `database_url` `.dokku/ansible/playbook.yml` to your own.

Now, whenever you push to `main`, it will automatically deploy.

## Can you make this a service?

Maybe, but it would only be available for services with publicly accessible data. You'd need to give me access to your entire amazon account to get your Kindle data, which you shouldn't be doing.
