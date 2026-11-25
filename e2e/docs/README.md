# e2e — docs

Deep dives on how `e2e` works **today**, with `path:LINE` (`symbol`) links into the code. The flow
format, run modes, env knobs and coverage table stay in [`../README.md`](../README.md).

| Topic | What it covers | Read when… |
|---|---|---|
| [how-e2e-works.md](how-e2e-works.md) | `scripts/e2e.sh` internals, CI differences, the runner, which seed lines each flow depends on, adding a flow | you add or debug a flow, change the seed, or the hermetic stack won't start or stop |

e2e has no feature specs of its own: `../specs/` holds the test flows, and a feature's acceptance flow
is described in its spec under `../../client/specs/` or `../../server/specs/`.
