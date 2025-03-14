# Deploy

This is my setup for automatically deploying to my kubernetes cluster using [flux](https://fluxcd.io/). Every push to the `main` branch triggers a webhook at `deploy.xetera.dev`.

It's probably not going to be very useful for you if you don't have [my infrastructure setup](https://github.com/xetera/cloud).

## Secrets

I use onepassword to manage secrets and the setup expects these to exist.

- `me-config` with a `config.toml` field. Use `config.example.toml` for the format.
- `me-db-url` with a `DATABASE_URL` field.
