# Security policy

## Reporting a vulnerability

Please do not open a public issue for a potential security problem. Report it privately through
[the security advisory form](https://github.com/jhipster/generator-jhipster/security/advisories/new), and we will work with you on a fix and a
coordinated disclosure.

## The trust model of `.yo-rc.json`

`.yo-rc.json` is **not inert configuration data — it is generator input, and almost every one of its properties can become part of the
generated application**: Java or TypeScript sources, build-script content, file and directory names, dependency coordinates, or the name of an
npm package that JHipster installs and executes on your machine.

The practical consequence is:

> **Running `jhipster` in a project you did not author is equivalent to running that project author's code on your machine, with your user's
> privileges.**

The same applies to every other file the generator reads as configuration: `.jhipster/*.json` entity files, `.yo-resolve`, JDL files, and any
blueprint referenced from them. The `.jhipster/*.json` entity configurations are less dangerous than `.yo-rc.json` — they only feed the entity
templates and do not reach the more sensitive build files such as `pom.xml`, `build.gradle` or `package.json` — but they are still generator
input and must be checked as well. `.yo-resolve` does not participate in the generation itself, but it controls conflict resolution and can
force the generator to overwrite existing files without prompting, so it too must be trusted.

### Why the configuration is trust-sensitive

**Blueprints are executable code.** The `blueprints` and `generators` entries name npm packages. During generation those packages are
resolved, possibly installed, and then **executed** in the generation process — before a single generated file has been reviewed. Their npm
lifecycle scripts (`preinstall`, `install`, `postinstall`) run as well. This is the highest-impact property of the file, and validating the
other properties does not compensate for it. Installing a package that is not already present prompts for confirmation, but a blueprint that is
already resolvable in the environment (globally installed, in `node_modules`, or on a lookup path) is composed and executed with no prompt — so
a pre-installed blueprint is enough. JDL is equivalent: an application block can declare `blueprints`, which end up in `.yo-rc.json`.

**Free-text values are embedded in generated files.** Values such as `baseName`, `packageName`, `jhipsterVersion`, `clientPackageManager`,
entity and field names, or validation patterns are interpolated into templates that produce Java sources, `pom.xml` / `build.gradle`,
`package.json`, `Dockerfile`s, shell scripts and CI pipeline definitions. A value that is harmless inside the generator process may be harmful
in the artifact it produces — for example a string that closes a build-file element and appends a plugin, or that terminates a line in a
generated shell script and appends a command. That code does not run during generation; it runs the first time the developer builds, tests or
starts the generated project, which is exactly what happens next.

**URLs and coordinates redirect the supply chain.** Registry URLs, repository URLs, service discovery endpoints and dependency versions coming
from the configuration decide where the generated project fetches artifacts from and what it fetches. A modified value can point the generated
build at an attacker-controlled registry, or pin a dependency to a malicious version, without touching a line of application code.

### What this means in practice

| Scenario                                                                              | Trust required                                                                                                |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| You wrote the `.yo-rc.json` yourself                                                  | Normal use, no additional risk.                                                                               |
| You cloned a repository from a source you already trust                               | Normal use — the same trust you already grant its build scripts.                                              |
| You cloned a public repository to try it, reproduce a bug report or review a proposal | **Untrusted.** Do not run the generator, `npm install` or the build outside a sandbox.                        |
| A pull request modifies `.yo-rc.json`, `.jhipster/*.json` or a JDL file               | **Review it as carefully as source code.** Adding a blueprint is a code-execution change, and it is one line. |

JHipster cannot tell these cases apart on its own — only the person running the command can.

This trust model is not specific to JHipster: a directory containing a `package.json` can already execute code through npm lifecycle scripts,
and the same holds for Maven and Gradle builds. `.yo-rc.json` belongs to that same family of files and deserves the same suspicion.

### Recommendations for users

- **Do not run the generator in a repository you would not be willing to build.** If you would hesitate to run `./mvnw` or `npm install`
  there, hesitate to run `jhipster`.
- **Read `.yo-rc.json` before the first run**, especially the `blueprints` and `generators` entries, and look up any blueprint you do not
  recognize.
- **Review configuration files in pull requests** with the same scrutiny as source code.
- **Use a sandbox for untrusted projects**: a container, a disposable VM, or a user account without access to your SSH keys, cloud credentials
  and shell profiles.
- **Do not run the generator as root**, and do not run it from your home directory.

### Recommendations for CI and hosted generation

**Running JHipster as a hosted service — exposing the generator to configurations supplied by other people — is not an officially supported
use case.** The generator is built to run on a developer's machine on input that developer trusts; a service that generates from
attacker-controlled input is outside that model. The guidance below is best-effort hardening for anyone who operates such a service anyway, not
a supported configuration.

- Run generation in an ephemeral, network-restricted container, and treat the checkout as untrusted input: never generate into a directory
  shared with credentials, caches or other jobs.
- Sandbox the generator process with the Node.js permission model (`node --permission`), granting filesystem read only to the generator
  installation and the generation directory and write only inside the generation directory. The generator can then neither read nor write
  outside those paths, whatever the configuration asks for; generation still needs a few capability flags for the child processes, worker
  threads and native addons it uses internally.
- A hosted service cannot trust its input, so it must rely on the technical boundaries below rather than on the configuration being benign: run
  with `--export-application` so nothing is committed to the host filesystem, and with `--disable-blueprints` so no blueprint is resolved or
  executed.

### What the generator does on its side

These are hardening measures, not a replacement for the trust decision described above:

- File writes are constrained to descendants of the destination root, so a configured path cannot escape the project directory.
- `--export-application` generates into an in-memory store and serializes the result without committing to the host filesystem, so a
  server-side consumer never writes attacker-controlled paths onto its own disk.
- `--disable-blueprints` prevents blueprints from being resolved, installed or executed.

None of this makes an untrusted `.yo-rc.json` safe to run, because blueprints are by design executable extensions. The trust decision is the
actual security boundary.

If you find a way to escape these boundaries — a write outside the destination root, or a configuration value that produces executable content
in a generated file — please report it privately as described above.
