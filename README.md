# Welcome Chats

![Welcome Chats](webui/thumbnail.webp)

Your conversations, folders, and message search on the Agent Zero welcome screen. The panel pairs with another half-width block and expands automatically when its neighbor is hidden.

## Install

In Agent Zero, open **Plugins → Plugin Hub → Install from Git** and use:

```text
https://github.com/3clyp50/welcome_chats
```

Enable the plugin and reload the WebUI. Requires the current bundled **Sidebar Folders** plugin and chat components. No API key, model calls, paid service, or extra dependency is needed. Older welcome layouts with the lower grid show a full-width panel without customization controls.

## Use

- Search conversation names and message text. Results include a matching excerpt; click it to open that conversation, including a matching child thread. Clear the search with its close button or Escape.
- Use the filter icon for Folders/Flat mode, sorting, project, working/idle status, and last activity.
- **View and filter preferences are shared with the sidebar.** Search text applies only to this panel. Existing pinning, project grouping, child threads, and row actions are reused.
- On the movable welcome layout, choose half/full width, drag the panel, or dismiss it. **Show all dismissed** restores it. Width and ordering persist in this browser.

Search is case-insensitive literal text over live conversations available to the sidebar, including their loaded message logs. It does not search deleted/archived chats or perform semantic search. Results stay inside the authenticated Agent Zero UI and are rendered as plain text.

## Remove

Disable or uninstall through Plugins. Conversations, project assignments, pins, and sidebar filters remain untouched. No background service or search index is created. Small browser-local width, dismissal, and layout preferences are retained; clear site storage to remove them.

## Develop

The panel contributes the block `welcome_chats.list` through `welcome-actions-end`. It reuses core chat rows and Sidebar Folders filtering/grouping without registering another sidebar view. Its API keeps normal authentication/CSRF checks and validates query text before searching.

Run `python -m unittest discover -s tests` and `node --test tests/*.test.mjs`. Smoke-test title/message search, filters, nested threads, row actions, hide/restore, half/full widths, and narrow touch layouts.

MIT license. Thumbnail generated with OpenAI imagegen and exported as a 256×256 WebP under20kB.
