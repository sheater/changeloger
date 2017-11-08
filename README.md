# Changelog generator

## Description

It is so boring when you have to write changelog on your own. Specially if you have git commit messages. So if you keep few simple rules for writing commit messages, you are able to generate amazing markdown changelog with this amazing tool.

## Synopsis
```
changelog-generator [--strict] [--version-count] [--all] [--output] [--git-tag] [--git-push] [--npm-version] [--ticket-url=<url>] [--git-url=<url>] [--stdout]
```

## Options:  
- *--all* - Write all versions
- *--git-tag* - Create git tag with current version
- *--git-url* - Gitlab/Github url with placeholder (ex: "https://github.com/user/repo/commit/{{hash}}")
- *--major* - Increase major version
- *--minor* - Increase minor version
- *--npm-version* - Update version in package.json
- *--output* - Output file (default is CHANGELOG.md). Cannot be used with *--stdout*
- *--stdout* - Output to stdout. Cannot be use with *--output*
- *--strict* - When parsing error is occured, changelog-generator will fail
- *--ticket-url* - Ticket url with placeholder for ticket id (ex: "https://myticketsystem.com/{{ticketId}}/view")
- *--version-count* - How many versions you want in your changelog. Starting at latest.
