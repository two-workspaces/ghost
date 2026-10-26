# Deploy and Host Ghost on Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/ghost-publishing?referralCode=sLjDXb&utm_medium=integration&utm_source=button&utm_campaign=ghost-publishing)

[Ghost](https://ghost.org/) is an open-source publishing platform for blogs, newsletters and paid memberships. You write in a clean editor, publish to a fast themeable site, send posts as email newsletters, and sell subscriptions through Stripe, all from one admin. This template runs Ghost 6.72.0 from the official image on its own MySQL 8.4. The owner account is created on first boot, so the `/ghost` setup page is never left open on a public URL.

## About Hosting Ghost

The stack is two services: Ghost and MySQL.

- **Upstream's image, pinned.** Ghost runs the official `ghost` image at a fixed release (6.72.0), not `latest`. A thin wrapper ([source](https://github.com/two-workspaces/ghost)) adds three small scripts and changes nothing else in Ghost. Upgrading means bumping the tag.
- **Owner account ready on first boot.** A fresh Ghost hands its setup page to whoever opens `/ghost` first, and on a public Railway domain that could be anyone. Here a small script waits for Ghost to start and creates the owner account from `GHOST_ADMIN_EMAIL` and the generated `GHOST_ADMIN_PASSWORD`. On later boots it does nothing.
- **MySQL 8.4, the database Ghost supports in production.** Posts, members, settings and newsletters live in MySQL on a volume. Ghost waits for MySQL to accept connections before it starts, so the first deploy doesn't crash-loop while the database initializes, and it runs its migrations on every start.
- **Images and themes on a volume.** Uploaded images, files and themes are kept in Ghost's content directory on its own volume, so they survive redeploys.
- **Lean by default.** MySQL runs with a 64 MB buffer pool and without the performance schema or binary log. Both services fit in Railway's smaller plans.
- **Healthchecked.** Railway's healthcheck calls Ghost's admin site endpoint, which only answers once Ghost has started and connected to MySQL.

## Common Use Cases

- A company blog, changelog or knowledge hub on your own domain
- An email newsletter with free and paid tiers, without per-subscriber fees to a newsletter platform
- Paid memberships and premium content with Stripe, where you keep your member list
- A publication with several authors and editors, scheduled posts and SEO built in

## Dependencies for Ghost Hosting

- MySQL 8.4 (included, private network only)
- A volume for images, files and themes (included)
- An email provider for member sign-in links and staff invites (SMTP), and Mailgun for sending newsletters (optional, see below)

### Deployment Dependencies

- [Ghost documentation](https://ghost.org/docs/)
- [Ghost configuration options](https://ghost.org/docs/config/)
- [Ghost on GitHub](https://github.com/TryGhost/Ghost)
- [Template source on GitHub](https://github.com/two-workspaces/ghost)

### Implementation Details

**Sign in.** Enter your email in `GHOST_ADMIN_EMAIL` when you deploy. When the deploy is green, open `https://<your domain>/ghost` and sign in with that email and the password in the Ghost service's `GHOST_ADMIN_PASSWORD` variable. Change it in Ghost afterwards (your avatar, Your profile, Change password); the variable isn't used again. The deploy logs show `[railway-setup] owner account created` once the account exists.

**Email.** Ghost sends two kinds of email:

- *Transactional*: member sign-in links, staff invites and password resets, over SMTP. Railway allows outbound SMTP only on the Pro plan. Configure it with the Ghost service variables `mail__transport=SMTP`, `mail__from`, `mail__options__host`, `mail__options__port`, `mail__options__secure`, `mail__options__auth__user` and `mail__options__auth__pass`.
- *Newsletters*: bulk sends go through Mailgun's HTTPS API, which works on every Railway plan. Add your Mailgun domain and key in Ghost under Settings, Newsletters, Mailgun.

**New-device sign-in codes.** Ghost normally emails staff a code when they sign in from a new device. Without email that would lock you out, so this template sets `security__staffDeviceVerification=false`. Once SMTP works, set it to `true` and redeploy.

**Custom domains.** Add the domain to the Ghost service in Railway, then set `url` to `https://<your domain>` and redeploy. Ghost builds every link from `url`.

**Themes.** Ghost starts with its default theme. Upload others under Settings, Design, Change theme; they're stored on the volume.

**Social web and built-in analytics.** Ghost 6's ActivityPub network and Tinybird-based web analytics are separate services in Ghost's own Docker setup and aren't part of this template. Members, newsletters, paid subscriptions and the rest of Ghost work without them.

**Upgrading.** Bump the image tag in the Dockerfile of your fork and redeploy. Ghost migrates the database on start and can't be downgraded, so back up MySQL first.

**Back up.** MySQL holds posts, members and settings, and the Ghost volume holds images and themes. Ghost can also export content and members as JSON and CSV under Settings, Advanced.

**Resources.** A fresh deploy uses about 200 MB of RAM for Ghost and about 400 MB for MySQL. The first boot takes a minute or two while MySQL initializes and Ghost creates its tables.

## Why Deploy Ghost on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Ghost on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
