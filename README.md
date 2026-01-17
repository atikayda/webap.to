# WebAP.to

<img src="https://raw.githubusercontent.com/atikayda/webap.to/refs/heads/main/static/images/webap.webp" width="280">
One-click Fediverse interactions from anywhere.

## So what's the deal?

Right, so you know how following someone on a different Fediverse instance is a whole bloody rigmarole? Copy their handle, open your instance, paste it, search, wait, *then* finally hit follow. It's cooked!

Traditionally people have been be trying to solve the whole thing by creating redirector sites that you go to and set your home instance and then give out a link like `https://fediredirector.link/sourceinstanceinfo.whatever`.

**Sure, but what's wrong with that?**

Glad you asked. It has a few problems.

Firstly it makes me use your redirector site, this creates a single point of failure. Not great for a federated network, as well as removing my ability to choose who can see my traffic/activity/collect stats on me.

Secondly we don't know what the future holds; What if that site decides to up and go down? Link-rot, that's what. Blech.

Happily a bunch of smart punkins have been mulling over this whole problem for a bit now, and they came up with the `web+ap://` URI scheme (over [here](https://github.com/tuskyapp/Tusky/issues/5027), which is based on the older web+activitypub proposal [fep-07d7](https://codeberg.org/fediverse/fep/src/branch/main/fep/07d7/fep-07d7.md)).

It's like `mailto:` but for the Fediverse. Click a link, land on your home instance, get on with your day.

**So why am I just hearing about it?**

It's the old chook and goog thing. While there's support out there for it, not many people use it because there's not much support for it and not many people add support for it because there's not many people using it.

What we need is a bridge to allow it to work while it's ramping to UBIQUITOUS levels of support.

And that's what webap.to is... it's a bridge and a useful tool in its own right.

Check out our main instance at https://webap.to to get the goods.

**What makes you different to all the other redirector sites then?**

Right-o, here we go.

So the deal is: We actually want to become obsolete.

In our perfect future, your home instance/app of choice would have its own support for a web+ap handler, and when you click a link, it just goes straight there first go. And we think we can get there... a bunch of software is already implementing or thinking about implementing support. It's just a numbers thing.

By producing this website, and encouraging adoption of the protocol in a way that supports all the users who don't currently have access, we can bridge the gap and make it so that people can begin linking using web+ap while having a fallback for people who don't have a handler of their own. It allows the idea to bootstrap.

## How's it work?

1. Set your home instance (like `aus.social` or wherever you hang out)
2. Sites use `web+ap://` links for Fediverse stuff
3. Click, redirect, interact from home - easy af

The flow looks like this:
```
web+ap://pixelfed.social/p/abc123
    ↓
WebAP.to (remembers where you live)
    ↓
https://your-instance.social/authorize_interaction?uri=https://pixelfed.social/p/abc123
    ↓
Follow, boost, reply - all from your home instance
```

## Getting started

### Docker (the no wukkas option)

SQLite - dead simple, perfect for most setups

```bash
docker run -p 9847:9847 -v webap_data:/data docker.atikayda.com/webap/webap.to:latest
```

Or with docker compose if that's your thing

```bash
src=https://raw.githubusercontent.com/atikayda/webap.to/refs/heads/main
curl $src/docker-compose.yml.prod -o docker-compose.yml
curl $src/.env.example -o .env
docker compose --profile sqlite up -d
```

Pop your reverse proxy of choice in front and Jane's your aunt.

e.g. Caddyserver:
```
my-ap.link {
  reverse_proxy :9847
}
```

### From source (for the keen beans)

```bash
git clone https://github.com/user/webap.to
cd webap.to
go build -o webap .
./webap
```

Head over to http://localhost:9847 and you're laughin'.

## Config

Everything's done through environment variables - nice and simple, rite? Look, most of the time the defaults'll get you going, and you only really need to set `DOMAIN` and `SITE_NAME`.

| Variable | Default | What it does |
|----------|---------|--------------|
| `PORT` | `9847` | HTTP server port |
| `DOMAIN` | `localhost` | Your public domain |
| `SITE_NAME` | `WebAP.to` | Display name |
| `DATABASE_URL` | `./webap_cache.db` | Database connection string |
| `DATA_DIR` | `.` | Where to stick the SQLite file |

### Database options

WebAP.to figures out which database you want from the connection string:

```bash
# SQLite (she'll be right for most people)
DATABASE_URL=/data/cache.db
DATABASE_URL=:memory:

# PostgreSQL (if you're running something bigger)
DATABASE_URL=postgres://user:pass@localhost/webap

# MySQL for those who don't need a real DB :p
DATABASE_URL=mysql://user:pass@localhost/webap

# MongoDB - no comment
DATABASE_URL=mongodb://user:pass@localhost/webap
```

## For site owners

Want Fediverse links on your site? Just use `web+ap://` URLs:

```html
<a href="web+ap://mastodon.social/@user">Follow @user</a>
<a href="web+ap://pixelfed.social/p/12345">View on Fediverse</a>
```

Some browsers are a bit behind on protocol handlers, so chuck in the fallback script just before the `</body>` (it'll catch everyone who falls through the cracks):

```html
<script src="https://webap.to/dist/webap-links.js" defer></script>
```

## For instance admins

Let your users set your instance as home with one click:

```html
<script src="https://webap.to/dist/webap-instance.js"></script>
<div id="webap-button"></div>
<script>
  WebAP.createHomeButton({
    container: '#webap-button',
    instanceDomain: 'your-instance.social'
  });
</script>
```

## For fedi software / PWA app developers

Implement your own protocol handlers for your users for heck's sakes!

Look, go here and check it out, it's dead simple: [navigator.registerProtocolHandler](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler)

If you're building iOS / Android apps, they each have ways of registering your app as the handler too. Go forth and conquer!

## Dev stuff

```bash
# Run locally
go run .

# Linter
make lint

# Build for prod
make build

# Docker image
make docker
```

### Project layout

```
webap.to/
├── main.go                 # Entry point
├── internal/
│   ├── api/                # HTTP handlers
│   ├── cache/              # Caching (SQLite, Postgres, MySQL, MongoDB)
│   ├── config/             # Environment config
│   └── server/             # HTTP server bits
└── static/                 # Frontend (baked into the binary)
    ├── components/         # Lit web components
    ├── css/                # Styles (Open Props)
    └── dist/               # Embeddable scripts
```

## API

### GET /api/software

Returns what software a Fediverse instance is running. Cached for 30 days because hitting up remote servers constantly would be rude.

```bash
curl "https://webap.to/api/software?instance=mastodon.social"
```

```json
{
  "software": "mastodon",
  "version": "4.2.0",
  "cached": true
}
```

## FAQ:

**What's the logo?** It's 2 screw-type carabiners linked together.

**Are you scraping our information?**<br/>
**What if I don't want you to see where I'm visiting?**<br/>
**What if I don't trust you?** Good! You shouldn't trust anyone. Setup your own instance. Be my guest. Check out the code. It's all there. Make changes if you don't like how it works. I double-dog dare ya!

## License

AGPL-3.0-only - Buy it, use it, break it, fix it, trash it, change it, mail – upgrade it... just make sure you provide your changes back to the community if they want it.

Built by [Atikayda](https://atikayda.com) in Brizzy. The people who brought you Blåhaj zone.
