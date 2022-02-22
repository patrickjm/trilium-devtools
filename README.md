trilium-devtools
================

[![Version](https://img.shields.io/npm/v/trilium-devtools.svg)](https://npmjs.org/package/trilium-devtools)
[![License](https://img.shields.io/npm/l/trilium-devtools.svg)](https://github.com/patrickjm/trilium-devtools/blob/master/package.json)

A CLI tool for faster script-note development on [Trilium Notes](https://github.com/zadam/trilium). It does the following:

1. Installs a fresh trilium server with custom config
2. Reads your webpack config at `trilium-devtools.config.js`
3. Starts webpack in your project directory in watch mode
4. Pushes webpack's output into a code note on Trilium and refreshes the page

In other words, you get webpack hot-reload on your Trilium code note. That means you could use React, Typescript, NPM modules, etc...

# Usage

Installation:
```sh-session
$ npm install trilium-devtools
```

In your project directory (or added to an NPM script):
```sh-session
$ trilium-devtools start

# OR

$ yarn trilium-devtools start
```

Then, add `./trilium` to your project's `.gitignore` file.

Finally, you will need a `trilium-devtools.config.js` file. You can find an [example in the Typescript example folder](packages/example-typescript/trilium-devtools.config.js).

# Known issues/annoyances

- You may need to save a couple times before the code makes it to Trilium the first time
- Doesn't use ETAPI as this was written before it existed
- Limited params; pegged to a single hard-coded trilium version, no directory control, etc...
- Limited to only 1 code note output. You can't have multiple outputs (like a mixture of frontend/server notes)

# How it works
1. On Trilium installation, replaces the tutorial notes with [custom notes](packages/trilium-devtools/scripts/Devtools.zip) that:
   - Server: Starts express and listens on port 3001
   - Frontend: Polls the http server periodically for updates
2. Starts webpack in your project directory. You supply most of this webpack config in `trilium-devtools.config.js`. It starts webpack in watch mode.
3. When you save a project file, webpack automatically recompiles and emits an event. The event pushes the output to an endpoint on the server.
4. UI refreshes the page after poll and receives the new note
