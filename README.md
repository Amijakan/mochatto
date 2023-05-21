
[![issues](https://img.shields.io/github/issues/Amijakan/mochatto)](https://github.com/Amijakan/mochatto/issues)
[![PRs](https://img.shields.io/github/issues-pr/amijakan/mochatto)](https://github.com/Amijakan/mochatto/pulls)
![language](https://img.shields.io/github/languages/top/amijakan/mochatto)

<img src="https://user-images.githubusercontent.com/34047281/133655323-715f4c16-368b-4266-947a-485e2bd3b211.png" width="70%">

# mochatto

[Mochatto](https://mochatto.com/) is an open-source proximity voice chat application for virtual meetings.

## Requirements
- `docker-compose` > 1.28
- `docker`

### Dev Requirements
- `yarn`
- `node` ^18.16

![image](https://user-images.githubusercontent.com/34047281/197360016-db9e242a-61ca-4975-937a-0008ea3a7449.png)

## Try it out

### Dev
1. `make dev`
1. `make dev-up`


#### Debugging Server

Requires VSCode
1. `make dev-up`
2. open `mochatto/server` in VSCode
3. Go to Debug tab
4. Run with `Docker: Attach to node`

### Prod
1. `make prod-up`

### Beta
1. `make beta-up`

### Test
*Make sure that the server is up*

Without visual check
- `make test`

With browser running
- `make test-headed`

Debugging with browser
- `make test-debug`

## Features

- [x] Choose Audio Input
- [x] P2P Voice chat
- [x] Mute (m)
- [x] Audio Processing toggles (`Echo Cancellation` / `Auto Gain Control` / `Noise Suppression`)
- [x] Status (Active / Inactive)
- [x] Separate rooms `/[room-id]`
- [x] Screenshares
- [x] Password protection for rooms
- [x] User Lists
- [x] Change Username
- [ ] Mobile Support
  - [x] Disable Sleep Toggle
  - [x] Disable Share screen
  - [ ] Mobile Detection: Fails iPad
  - [ ] UI Support
    - [ ] In screen scroll
- [ ] Place Images in the space
- [ ] Place Videos in the space
- [ ] Audio Recording

## Running own iceServer

```
docker run -d --network=host coturn/coturn
```

*This will run at port 3478. Make sure that your firewall for port 3478 is not blocked.*


## Jenkins pipeline

Currently using
- Jenkins Multibranch Pipeline with [Github Plugin](https://github.com/jenkinsci/pipeline-github-plugin)

### Creating dev environment
Whent pull request is created, it will run beta-up, which hosts the branch content to

```
https://[PR_NUMBER].dev.mochatto.com
```

### Stopping dev environment
We couldn't find a good way to bring the container down, so we're using a crontab with `check-for-closed-pr`.

*NOTE: `check-for-closed-pr` uses `gh` command, so make sure to check your token is not expired.*

e.g.
```cron
0 * * * * sh -c "cd /path/to/repo && ./check-for-closed-pr"
```
