# Developing

This project is structured as a Yarn v2 monorepo. It utilizes [Project Essex's build tooling](https://github.com/microsoft/essex-alpha-build-infra), which includes our
configurations for prettier, eslint, and documentation linting.

# Prerequisites

> Node >= 14
> yarn v1 global installation (e.g. `npm i -g yarn`)

# Yarn 2 Notes

Yarn 2 is a break in some ways that using npm or even Yarn 1. Key items include:

- The yarn v2 binary and plugins are installed locally under `.yarn/releases` and `.yarn/plugins`.
- We use a zeroinstall configuration, meaning that dependencies in `.yarn/cache` are _checked into the repository_. This dramatically improves CI speeds by skipping the network
  latency of a traditional `npm install` phase.
- We use yarn 2's PnP mode, meaning that there is no need to create and node_modules folder. Dependency bundles are used directly using a tool called `zipfs` and overriding node's require() hook. This all happens under the hood, there's no need to deal with zipfs or the require hook directly.
- Some tools require custom SDK support to work well with Yarn PnP. The [PnPify tool](https://yarnpkg.com/pnpify/cli/--sdk) was used to import SDKs we currently use (eslint, prettier, typescript)

# Development Workflow

The first thing you should run is `yarn install`, which should be a quick operation that wires up your dependencies locally.

Packages generally adhere to the following top-level scripts:

`clean` - removes generated build artifact folders
`build` - assembles local assets, transpiles source
`start` - start up web servers (libraries are generally not started, as we use [publishConfig](https://yarnpkg.com/configuration/manifest/#publishConfig) to reference TS sources directly during development instead of transpiled variants in the dist/folder)
`test` - any local, non-unit-testing, testing that needs to occur per file. In our state plans this is validating rule validity, JSON schema adherence, etc..

The top level monorepo uses the following top-level scripts:
`ci` - this is used during the CI process to execute the full suite of transpilation, package testing, unit testing, and linting
`lint` - runs prettier, eslint, and documentation linting across the entire monorepo
`unit_test` - runs jest in one sweep across the entire monorepo (we do this at the monorepo level for accurate coverage reporting)
`prettify` - apply prettier rules when files have not been changed in precommit hooks.
`clean_all` - cleans all packages
`start_all` - starts up all local web applications, storybooks, and services

## Precommit Hooks

When committing code, various precommit hooks are applied depending on the type of source file. These may include `prettier`, `eslint`, and documentation linting for Markdown files.

## TypeScript transpilation targets

Our build workflow executes in two phases. These tasks are executed with `essex build`.

1.  TypeScript transpilation using `target: esnext`. Output is piped to the `lib/` folder.
2.  Target-environment transpilation using Babel and @babel/preset-env. Output is piped to `dist/esm` and `dist/cjs`.

For code that will run on Node specifically, using `target: es2015` (or whatever target will work on 14+) and bypassing the essex build is appropriate.

## Documentation Linting

We utilize some documentation checking tools including spellchecking and tonal linting to ensure our language is sensitive to various audiences. These may be configured via `.docsrc`, `.docsignore`, and `.spelling`
