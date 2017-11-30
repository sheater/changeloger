# Changeloger

## Description

It is so boring when you have to write changelog on your own. Specially if you have git commit messages. So if you keep few simple rules for writing commit messages, you are able to generate amazing markdown changelog with this amazing tool.
Next advantage and side effect at the same time is fact that your git repository commit history will be more readable and descriptive.

So commit message pattern should like like this:
```
type(scope): subject (ticket)
```

Let's take a look at these particular fragments:
- **type**: describes kind of change (ie: feat, fix, refactor) - it is recommended to use present tense
- **scope** (optional): place (context) of changes (ie: MyAwesomeComponent, utils)
- **subject**: description of commit (ie: add new button)
- **ticket** (optional): ID of your ticket in your tracking system

In specific situations you can modify commit message pattern with regular expressions in configuration file.

## Usage
```
# Create changelog.config.js file with default settings
$ changeloger init

# Generates changelog for one last version
$ changeloger generate

# Generates changelog for all commits
$ changeloger generate --all

# Generates changelog for N last commits
$ changeloger generate --num <N>

# Generates changelog for another path
$ changeloger generate --path <path>

# And as expected, this will print help
$ changeloger help
```

## Configuration

Configuration file _changelog.config.js_ have to be in root of your project and it may look like this:

```js
const config = {
  // match type and optionally scope from commit body (ie: feat, fix, chore, refactor without scope
  // or feat(MyAwesomeComponent), fix(util) with scope)
  // accepts regular expression only; if is omitted, default is used
  typeMatchPattern: /^([^(^:]+)(?:\(([^)]+)\))?:/,

  // match ticket from commit body (ie: MNT-123 as ticket identifier)
  // accepts regular expression only; if is omitted, default is used
  ticketMatchPattern: /\(?#?(\w+-\d+)\)?/,

  // changelog generator can automatically generate link to your versioning service
  // placeholder "{{hash}}" will be replaced with commit hash
  // accepts url only; if is omitted, no commit links are generated
  cvsTrackerUrl: 'https://gitlab.kancelar.seznam.cz/sklik-frontend/userweb/commit/{{hash}}',

  // similar to "gitTrackerUrl", placeholder "{{ticket}}" will be replaced with matched ticket id
  // accepts url only; is is omitted, no ticket links are generated
  ticketTrackerUrl: 'https://youtrack.kancelar.seznam.cz/issue/{{ticket}}',

  // length of visible part of hash in changelog, 0 = no hash
  hashVisibleLength: 6,

  // groups object represent patterns which will be included to generated changelog
  groups: {
    // each key of groups object represents one commit group's name in your changelog
    // each value of groups object describes which commits will be included
    'Dependencies': {
      // each group may have these attributes: type, scope, subject
      // for each of those attributes, you can use string or regular expression
      // if some attribute in array item is omitted, this attribute will be ignored in matching
      type: 'dep' // string or regular expression
    },

    'New features': {
      type: 'feat',
      // you can also exclude some type of commits via regular expressions
      subject: /(\scr\s){0}|^cr{0}|cr${0}/i // skip CR commits
    },

    'Bug fixes': {
      type: 'fix',
      subject: /(\scr\s){0}|^cr{0}|cr${0}/i // skip CR commits
    },

    'Refactoring': {
      type: 'refactor'
    }
  }
};

module.exports = config;
```

You can create on your own or use `changelog init` command in folder where you wish to place it.
