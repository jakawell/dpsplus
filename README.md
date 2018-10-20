# DPS+

A progressive web app for deeper analysis of Pokémon moves in [Pokémon GO](https://www.pokemongo.com/). The published deployment is available at https://dpsplus.app

[![Build Status](https://travis-ci.org/jakawell/dpsplus.svg?branch=master)](https://travis-ci.org/jakawell/dpsplus)

## Development 

Install the latest LTS version of [NodeJS](https://nodejs.org/en/download/) on your environment, clone the repository locally, and run `npm install` in the clone to install all the necessary dependencies.

For general development, run `npm run develop` which will start a local server in memory on port 42001 that watches any file changes and automatically refreshes your browser with them (open http://localhost:42001).

To test the [service worker](https://developers.google.com/web/fundamentals/primers/service-workers/) and [progressive web app](https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp/) components, you'll need to serve a built version of the code by running `npm run pwa`. This loads a local server at http://localhost:42002 that includes the PWA components, but does not watch for changes. Service worker development is slightly different from normal web app development (for example, in how it handles page refreshes), so familiarize yourself with them in advance (tutorials like [this one](https://developers.google.com/web/fundamentals/codelabs/debugging-service-workers/) are recommended).

To run a production-style build, run `npm run start`, which hosts a local server at http://localhost:42003.

## Build

Builds are run on [Travis CI](https://travis-ci.org/jakawell/dpsplus) [![Build Status](https://travis-ci.org/jakawell/dpsplus.svg?branch=master)](https://travis-ci.org/jakawell/dpsplus) and can be run locally with `npm run build`.

_This project is not affiliated in any way with Niantic, Inc., The Pokémon Company, Nintendo Co. Ltd., Creatures Inc., or GAME FREAK Inc._
