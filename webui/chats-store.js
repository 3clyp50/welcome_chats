import { createStore } from "/js/AlpineStore.js";
import { callJsonApi } from "/js/api.js";
import { store as chats } from "/components/sidebar/chats/chats-store.js";
import { store as folders } from "/plugins/_sidebar_folders/webui/sidebar-folders-store.js";
import { store as welcome } from "/components/welcome/welcome-store.js";
import { toastFrontendError } from "/components/notifications/notification-store.js";

const ID = "welcome_chats.list";
export const store = createStore("welcomeChats", {
  query: "", matches: [], searching: false, wide: false, request: 0,
  mount() {
    welcome.init();
    try {
      this.wide = localStorage.getItem("welcomeChats.wide") === "true";
      if (this.canDismiss && localStorage.getItem(`welcome_hidden_${ID}`) === "true") welcome.dismissSection(ID);
    } catch (error) { console.warn("Could not restore Welcome Chats preferences", error); }
    void folders.refresh();
    if (this.query.trim()) void this.search();
  },
  cleanup() { this.request++; this.searching = false; },
  get canDismiss() { return typeof welcome.dismissSection === "function"; },
  get hidden() { return welcome.hiddenSections?.includes(ID) || false; },
  dismiss() { welcome.dismissSection(ID); },
  toggleWidth() {
    this.wide = !this.wide;
    try { localStorage.setItem("welcomeChats.wide", String(this.wide)); } catch (error) { console.warn(error); }
  },
  async search() {
    const request = ++this.request;
    const query = this.query.trim();
    this.matches = [];
    this.searching = Boolean(query);
    if (!query) return;
    try {
      const data = await callJsonApi("/plugins/welcome_chats/search", { query });
      if (request === this.request && query === this.query.trim()) this.matches = data.matches || [];
    } catch (error) {
      if (request === this.request) toastFrontendError(error.message, "Welcome Chats");
    } finally { if (request === this.request) this.searching = false; }
  },
  groups() {
    const children = folders.childIndex();
    const matching = new Set(this.matches.map(match => match.id));
    const source = folders.config.folder_view ? folders.sections("chat") : [{ id: "flat", rows: chats.topLevelContexts() }];
    return source.map(group => ({ ...group, rows: folders.sortRows("chat", group.rows).filter(row =>
      !this.query.trim() || folders.family(row, "chat", children).some(member => matching.has(member.id))
    ) })).filter(group => group.rows.length);
  },
  match(row) {
    if (!this.query.trim()) return null;
    const ids = new Set(folders.family(row, "chat").map(member => member.id));
    return this.matches.find(match => ids.has(match.id));
  },
});
