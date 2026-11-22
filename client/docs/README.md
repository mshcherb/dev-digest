# client — docs

Deep dives on how `client` works **today**, one flow per file, with `path:LINE` (`symbol`) links
into the code. The route map and stack stay in [`../README.md`](../README.md); the design-system
layers in [`../src/vendor/ui/README.md`](../src/vendor/ui/README.md); plans in [`../specs/`](../specs/).

| Topic | What it covers | Read when… |
|---|---|---|
| [pr-page-data-flow.md](pr-page-data-flow.md) | PR page queries, live runs (polling + SSE), FindingsTab → ReviewRunAccordion → FindingsPanel, filters, mutations | you change the PR detail page, the Agent runs tab, or a finding doesn't refresh |
| [i18n-and-severity.md](i18n-and-severity.md) | how next-intl messages load (app and tests), how severity becomes colour/icon/label, `_components/<Name>/` anatomy | you add strings, a severity display, or a new component folder |
