
[![issues](https://img.shields.io/github/issues/Amijakan/mochatto)](https://github.com/Amijakan/mochatto/issues)
[![PRs](https://img.shields.io/github/issues-pr/amijakan/mochatto)](https://github.com/Amijakan/mochatto/pulls)
![language](https://img.shields.io/github/languages/top/amijakan/mochatto)

<img src="https://user-images.githubusercontent.com/34047281/133655323-715f4c16-368b-4266-947a-485e2bd3b211.png" width="70%">

# mochatto

Mochatto is an open-source proximity voice chat application for virtual meetings.

## Requirements
- `docker-compose` > 1.28
- `docker`

### Dev Requirements
- `yarn`
- `node` ~14.17.3

![screenshot](https://user-images.githubusercontent.com/34047281/134995048-cab908f2-7f4a-4d64-b585-a06057dec834.PNG)

## Try it out

### Dev
1. `make dev`
1. `make dev-up`

### Prod
1. `make prod-up`

### Beta
1. `make beta-up`

## Features

- [x] Choose Audio Input
- [x] P2P Voice chat
- [x] Mute (m)
- [x] Audio Processing toggles (`Echo Cancellation` / `Auto Gain Control` / `Noise Suppression`)
- [x] Status (Active / Inactive)
- [x] Separate rooms `/[room-id]`
- [ ] Mobile Support
- [ ] User Lists
- [ ] Change Username
- [ ] Place Images in the space
- [ ] Place Videos in the space
- [ ] Password protection for rooms
- [ ] Screenshares
- [ ] Audio Recording

## Jenkins pipeline


### Creating dev environment
Whent pull request is created, it will run beta-up, which hosts the branch content to

```
https://[PR_NUMBER].dev.mochatto.com
```

### Stopping dev environment
I could not find a good way to bring the container down, so I am using a crontab with `check-down`
NOTE: `check-down` uses `gh` command, so make sure to check your token is not expired.

e.g.
```cron
30 * * * * sh -c "cd /path/to/repo && ./check-down"
```

