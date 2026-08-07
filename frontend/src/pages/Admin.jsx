/**
 * /admin CMS — password-gated blog + case-study editor (issue #17).
 * Source of truth: FastAPI JSON persistence under backend/data/.
 */
import React, { useEffect, useState } from "react";
import SeoHead from "@/components/redesign/SeoHead";
import {
  adminLogin,
  adminFetchBlogs,
  adminSaveBlogs,
  adminFetchProjects,
  adminSaveProjects,
  getAdminToken,
  setAdminToken,
} from "@/lib/cmsApi";

const G = "#4ade80";
const DIM = "#8b949e";
const CARD = "#161b22";
const BORDER = "rgba(255,255,255,0.08)";

const emptyPost = () => ({
  id: `post-${Date.now()}`,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "Softogram Team",
  date: new Date().toISOString().slice(0, 10),
  tags: [],
  coverImage: "",
  published: true,
  readTime: 5,
});

const emptyProject = () => ({
  id: `proj-${Date.now()}`,
  client: "",
  title: "",
  desc: "",
  industry: "Other",
  services: [],
  outcome: "",
  metrics: [],
  img: "",
  year: `${new Date().getFullYear()}`,
  published: true,
  url: "",
});

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(!!getAdminToken());
  const [tab, setTab] = useState("blog");
  const [blogs, setBlogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const [b, p] = await Promise.all([adminFetchBlogs(), adminFetchProjects()]);
      setBlogs(b);
      setProjects(p);
    } catch (e) {
      setAuthed(false);
      setAdminToken("");
      setError(e.response?.data?.detail || "Session expired — log in again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await adminLogin(password);
      setPassword("");
      setAuthed(true);
    } catch {
      setError("Invalid password");
    }
  };

  const saveAll = async () => {
    setBusy(true);
    setStatus("");
    setError("");
    try {
      if (tab === "blog") {
        const saved = await adminSaveBlogs(blogs);
        setBlogs(saved);
      } else {
        const saved = await adminSaveProjects(projects);
        setProjects(saved);
      }
      setStatus("saved");
    } catch (e) {
      setError(e.response?.data?.detail || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const list = tab === "blog" ? blogs : projects;
  const setList = tab === "blog" ? setBlogs : setProjects;

  const updateSelected = (patch) => {
    if (!selected) return;
    setList((prev) => prev.map((item) => (item.id === selected.id ? { ...item, ...patch } : item)));
    setSelected((s) => ({ ...s, ...patch }));
  };

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0d1117" }}
        data-testid="admin-login"
      >
        <SeoHead title="Admin | Softogram" description="Softogram content admin" />
        <form
          onSubmit={onLogin}
          className="w-full max-w-sm rounded-sm p-6"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          <h1 className="text-lg font-bold mb-4" style={{ color: "#e2e8f0", fontFamily: "var(--font-mono)" }}>
            Softogram CMS
          </h1>
          <input
            type="password"
            data-testid="admin-password"
            placeholder="ADMIN_PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-sm mb-3"
            style={{ background: "#0d1117", border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
          />
          {error && (
            <p className="text-xs mb-2" style={{ color: "#f85149" }} data-testid="admin-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            data-testid="admin-login-button"
            className="w-full py-2 text-sm font-semibold rounded-sm"
            style={{ background: G, color: "#0d1117", fontFamily: "var(--font-mono)" }}
          >
            unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0d1117", color: "#e2e8f0" }} data-testid="admin-page">
      <SeoHead title="Admin | Softogram" />
      <header
        className="px-6 py-4 flex flex-wrap gap-3 items-center justify-between"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex gap-2 items-center">
          <span style={{ color: G, fontFamily: "var(--font-mono)" }}>cms</span>
          <button
            type="button"
            data-testid="admin-tab-blog"
            onClick={() => {
              setTab("blog");
              setSelected(null);
            }}
            className="px-3 py-1 text-xs rounded-sm"
            style={{
              background: tab === "blog" ? `${G}22` : "transparent",
              border: `1px solid ${BORDER}`,
              color: tab === "blog" ? G : DIM,
            }}
          >
            blogs
          </button>
          <button
            type="button"
            data-testid="admin-tab-projects"
            onClick={() => {
              setTab("projects");
              setSelected(null);
            }}
            className="px-3 py-1 text-xs rounded-sm"
            style={{
              background: tab === "projects" ? `${G}22` : "transparent",
              border: `1px solid ${BORDER}`,
              color: tab === "projects" ? G : DIM,
            }}
          >
            case studies
          </button>
        </div>
        <div className="flex gap-2 items-center">
          {status && (
            <span className="text-xs" style={{ color: G }} data-testid="admin-status">
              {status}
            </span>
          )}
          {error && (
            <span className="text-xs" style={{ color: "#f85149" }}>
              {error}
            </span>
          )}
          <button
            type="button"
            data-testid="admin-new"
            className="px-3 py-1 text-xs rounded-sm"
            style={{ border: `1px solid ${BORDER}`, color: DIM }}
            onClick={() => {
              const item = tab === "blog" ? emptyPost() : emptyProject();
              setList((prev) => [item, ...prev]);
              setSelected(item);
            }}
          >
            + new
          </button>
          <button
            type="button"
            data-testid="admin-save"
            disabled={busy}
            className="px-3 py-1 text-xs font-semibold rounded-sm"
            style={{ background: G, color: "#0d1117" }}
            onClick={saveAll}
          >
            {busy ? "…" : "save all"}
          </button>
          <button
            type="button"
            data-testid="admin-logout"
            className="px-3 py-1 text-xs rounded-sm"
            style={{ border: `1px solid ${BORDER}`, color: DIM }}
            onClick={() => {
              setAdminToken("");
              setAuthed(false);
            }}
          >
            logout
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-[280px_1fr] min-h-[calc(100vh-64px)]">
        <aside className="p-4 overflow-auto" style={{ borderRight: `1px solid ${BORDER}` }}>
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid="admin-list-item"
              onClick={() => setSelected(item)}
              className="w-full text-left px-3 py-2 mb-2 rounded-sm text-xs"
              style={{
                background: selected?.id === item.id ? `${G}14` : CARD,
                border: `1px solid ${BORDER}`,
                color: "#e2e8f0",
                fontFamily: "var(--font-mono)",
              }}
            >
              {tab === "blog" ? item.title || item.slug || item.id : item.client || item.title || item.id}
              {!item.published && <span style={{ color: DIM }}> · draft</span>}
            </button>
          ))}
        </aside>
        <main className="p-6 overflow-auto">
          {!selected && (
            <p className="text-sm" style={{ color: DIM }}>
              Select an item or create a new one.
            </p>
          )}
          {selected && tab === "blog" && (
            <div className="space-y-3 max-w-3xl" data-testid="admin-blog-editor">
              {["title", "slug", "excerpt", "author", "date", "coverImage"].map((field) => (
                <label key={field} className="block text-xs" style={{ color: DIM }}>
                  {field}
                  <input
                    className="mt-1 w-full px-3 py-2 text-sm rounded-sm"
                    style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
                    value={selected[field] || ""}
                    onChange={(e) => updateSelected({ [field]: e.target.value })}
                    data-testid={`admin-blog-${field}`}
                  />
                </label>
              ))}
              <label className="block text-xs" style={{ color: DIM }}>
                tags (comma-separated)
                <input
                  className="mt-1 w-full px-3 py-2 text-sm rounded-sm"
                  style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
                  value={(selected.tags || []).join(", ")}
                  onChange={(e) =>
                    updateSelected({
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label className="block text-xs" style={{ color: DIM }}>
                content (markdown-ish)
                <textarea
                  rows={16}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-sm font-mono"
                  style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
                  value={selected.content || ""}
                  onChange={(e) => updateSelected({ content: e.target.value })}
                  data-testid="admin-blog-content"
                />
              </label>
              <label className="flex items-center gap-2 text-xs" style={{ color: DIM }}>
                <input
                  type="checkbox"
                  checked={!!selected.published}
                  onChange={(e) => updateSelected({ published: e.target.checked })}
                />
                published
              </label>
            </div>
          )}
          {selected && tab === "projects" && (
            <div className="space-y-3 max-w-3xl" data-testid="admin-project-editor">
              {["client", "title", "desc", "industry", "outcome", "img", "year", "url"].map((field) => (
                <label key={field} className="block text-xs" style={{ color: DIM }}>
                  {field}
                  <input
                    className="mt-1 w-full px-3 py-2 text-sm rounded-sm"
                    style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
                    value={selected[field] || ""}
                    onChange={(e) => updateSelected({ [field]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block text-xs" style={{ color: DIM }}>
                services (comma-separated)
                <input
                  className="mt-1 w-full px-3 py-2 text-sm rounded-sm"
                  style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
                  value={(selected.services || []).join(", ")}
                  onChange={(e) =>
                    updateSelected({
                      services: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-xs" style={{ color: DIM }}>
                <input
                  type="checkbox"
                  checked={!!selected.published}
                  onChange={(e) => updateSelected({ published: e.target.checked })}
                />
                published
              </label>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
