/**
 * /admin CMS — password-gated blog + case-study editor (issue #17).
 * Source of truth: FastAPI JSON persistence under backend/data/.
 */
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, EyeOff } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SeoHead from "@/components/redesign/SeoHead";
import {
  adminLogin,
  adminFetchBlogs,
  adminSaveBlogs,
  adminFetchProjects,
  adminSaveProjects,
  adminFetchLeads,
  adminUpdateLeadStatus,
  adminFetchComments,
  adminModerateComment,
  adminUploadImage,
  adminFetchAnalytics,
  getAdminToken,
  setAdminToken,
} from "@/lib/cmsApi";

const G = "#4ade80";
const A = "#fb923c";
const DIM = "#8b949e";
const CARD = "#161b22";
const BORDER = "rgba(255,255,255,0.08)";
const LEAD_STATUSES = ["new", "contacted", "won", "lost"];

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authed, setAuthed] = useState(!!getAdminToken());
  const [tab, setTab] = useState("blog");
  const [blogs, setBlogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadsLoaded, setLeadsLoaded] = useState(false);
  const [leadFilter, setLeadFilter] = useState("all");
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (!authed) return;
    if (tab === "leads" && !leadsLoaded) {
      setBusy(true);
      adminFetchLeads()
        .then((data) => {
          setLeads(data);
          setLeadsLoaded(true);
        })
        .catch((e) => setError(e.response?.data?.detail || "Failed to load leads"))
        .finally(() => setBusy(false));
    }
    if (tab === "comments") {
      setBusy(true);
      adminFetchComments()
        .then((data) => {
          setComments(data);
          setCommentsLoaded(true);
        })
        .catch((e) => setError(e.response?.data?.detail || "Failed to load comments"))
        .finally(() => setBusy(false));
    }
    if (tab === "analytics" && !analytics) {
      setBusy(true);
      adminFetchAnalytics()
        .then(setAnalytics)
        .catch((e) => setError(e.response?.data?.detail || "Failed to load analytics"))
        .finally(() => setBusy(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authed]);

  const updateLeadStatus = async (id, newStatus) => {
    const prevLeads = leads;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    try {
      await adminUpdateLeadStatus(id, newStatus);
    } catch (e) {
      setLeads(prevLeads);
      setError(e.response?.data?.detail || "Failed to update status");
    }
  };

  const moderateComment = async (id, approved) => {
    const prev = comments;
    setComments((c) => c.filter((row) => row.id !== id));
    try {
      await adminModerateComment(id, approved);
    } catch (e) {
      setComments(prev);
      setError(e.response?.data?.detail || "Failed to moderate comment");
    }
  };

  const exportLeadsCsv = () => {
    const filtered = leadFilter === "all" ? leads : leads.filter((l) => l.status === leadFilter);
    const headers = ["name", "email", "phone", "service", "status", "createdAt", "message"];
    const escapeCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...filtered.map((l) => headers.map((h) => escapeCell(l[h])).join(","))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${leadFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadImage = async (file, onUrl) => {
    setUploading(true);
    setError("");
    try {
      const url = await adminUploadImage(file);
      onUrl(url);
    } catch (e) {
      setError(e.response?.data?.detail || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await adminLogin(email, password);
      setPassword("");
      setAuthed(true);
    } catch {
      setError("Invalid email or password");
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

  const isContentTab = tab === "blog" || tab === "projects";
  const list = tab === "blog" ? blogs : tab === "projects" ? projects : [];
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
        style={{ background: "#0d1117", paddingTop: 80 }}
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
            type="email"
            data-testid="admin-email"
            placeholder="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-sm mb-3"
            style={{ background: "#0d1117", border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
          />
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              data-testid="admin-password"
              placeholder="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-9 text-sm rounded-sm"
              style={{ background: "#0d1117", border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
            />
            <button
              type="button"
              data-testid="admin-password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: DIM }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
    <div
      className="min-h-screen"
      style={{ background: "#0d1117", color: "#e2e8f0", paddingTop: 80 }}
      data-testid="admin-page"
    >
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
          <button
            type="button"
            data-testid="admin-tab-leads"
            onClick={() => setTab("leads")}
            className="px-3 py-1 text-xs rounded-sm"
            style={{
              background: tab === "leads" ? `${G}22` : "transparent",
              border: `1px solid ${BORDER}`,
              color: tab === "leads" ? G : DIM,
            }}
          >
            leads
          </button>
          <button
            type="button"
            data-testid="admin-tab-comments"
            onClick={() => setTab("comments")}
            className="px-3 py-1 text-xs rounded-sm"
            style={{
              background: tab === "comments" ? `${G}22` : "transparent",
              border: `1px solid ${BORDER}`,
              color: tab === "comments" ? G : DIM,
            }}
          >
            comments
          </button>
          <button
            type="button"
            data-testid="admin-tab-analytics"
            onClick={() => setTab("analytics")}
            className="px-3 py-1 text-xs rounded-sm"
            style={{
              background: tab === "analytics" ? `${G}22` : "transparent",
              border: `1px solid ${BORDER}`,
              color: tab === "analytics" ? G : DIM,
            }}
          >
            analytics
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
          {isContentTab && (
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
          )}
          {isContentTab && (
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
          )}
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

      {isContentTab && (
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
              <div className="space-y-3 max-w-5xl" data-testid="admin-blog-editor">
                {["title", "slug", "excerpt", "author", "date"].map((field) => (
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
                  coverImage
                  <div className="mt-1 flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 text-sm rounded-sm"
                      style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
                      value={selected.coverImage || ""}
                      onChange={(e) => updateSelected({ coverImage: e.target.value })}
                      data-testid="admin-blog-coverImage"
                    />
                    <label
                      className="px-3 py-2 text-xs rounded-sm cursor-pointer whitespace-nowrap"
                      style={{ border: `1px solid ${BORDER}`, color: DIM }}
                    >
                      {uploading ? "…" : "upload"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        data-testid="admin-blog-cover-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file, (url) => updateSelected({ coverImage: url }));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </label>
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
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: DIM }}>
                      content (markdown)
                    </span>
                    <label
                      className="px-2 py-1 text-xs rounded-sm cursor-pointer"
                      style={{ border: `1px solid ${BORDER}`, color: DIM }}
                    >
                      {uploading ? "uploading…" : "+ insert image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        data-testid="admin-blog-content-image-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImage(file, (url) =>
                              updateSelected({ content: `${selected.content || ""}\n\n![](${url})\n` }),
                            );
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <div className="mt-1 grid md:grid-cols-2 gap-3">
                    <textarea
                      rows={18}
                      className="w-full px-3 py-2 text-sm rounded-sm font-mono"
                      style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e2e8f0" }}
                      value={selected.content || ""}
                      onChange={(e) => updateSelected({ content: e.target.value })}
                      data-testid="admin-blog-content"
                    />
                    <div
                      className="px-4 py-3 text-sm rounded-sm overflow-auto"
                      style={{ background: "#0d1117", border: `1px solid ${BORDER}`, maxHeight: 420 }}
                      data-testid="admin-blog-preview"
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h2 className="text-xl font-bold pt-2" style={{ color: "#e2e8f0" }}>
                              {children}
                            </h2>
                          ),
                          h2: ({ children }) => (
                            <h3 className="text-lg font-semibold pt-2" style={{ color: "#e2e8f0" }}>
                              {children}
                            </h3>
                          ),
                          h3: ({ children }) => (
                            <h4 className="text-base font-semibold pt-1" style={{ color: G }}>
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-xs leading-relaxed pt-1" style={{ color: "#cbd5e1" }}>
                              {children}
                            </p>
                          ),
                          li: ({ children }) => (
                            <li className="text-xs" style={{ color: DIM }}>
                              {children}
                            </li>
                          ),
                          img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-sm max-w-full my-2" />,
                          code: ({ children }) => (
                            <code className="text-xs px-1 rounded-sm" style={{ background: CARD, color: G }}>
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {selected.content || "*Nothing to preview yet.*"}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
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
      )}

      {tab === "leads" && (
        <div className="p-6" data-testid="admin-leads">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {["all", ...LEAD_STATUSES].map((s) => (
                <button
                  key={s}
                  type="button"
                  data-testid={`admin-lead-filter-${s}`}
                  onClick={() => setLeadFilter(s)}
                  className="px-3 py-1 text-xs rounded-sm"
                  style={{
                    background: leadFilter === s ? `${G}22` : "transparent",
                    border: `1px solid ${BORDER}`,
                    color: leadFilter === s ? G : DIM,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              data-testid="admin-leads-export"
              onClick={exportLeadsCsv}
              className="px-3 py-1 text-xs rounded-sm"
              style={{ border: `1px solid ${BORDER}`, color: DIM }}
            >
              export csv
            </button>
          </div>

          {busy && leads.length === 0 && (
            <p className="text-sm" style={{ color: DIM }}>
              loading…
            </p>
          )}

          <div className="overflow-auto rounded-sm" style={{ border: `1px solid ${BORDER}` }}>
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: CARD, color: DIM }}>
                  {["name", "email", "phone", "service", "message", "status", "created"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads
                  .filter((l) => leadFilter === "all" || l.status === leadFilter)
                  .map((l) => (
                    <tr key={l.id} data-testid="admin-lead-row" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td className="px-3 py-2" style={{ color: "#e2e8f0" }}>
                        {l.name}
                      </td>
                      <td className="px-3 py-2" style={{ color: DIM }}>
                        {l.email}
                      </td>
                      <td className="px-3 py-2" style={{ color: DIM }}>
                        {l.phone}
                      </td>
                      <td className="px-3 py-2" style={{ color: DIM }}>
                        {l.service}
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate" style={{ color: DIM }} title={l.message}>
                        {l.message}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          data-testid="admin-lead-status"
                          value={l.status}
                          onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                          className="px-2 py-1 rounded-sm text-xs"
                          style={{ background: "#0d1117", border: `1px solid ${BORDER}`, color: G }}
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                        {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {leadsLoaded && leads.filter((l) => leadFilter === "all" || l.status === leadFilter).length === 0 && (
              <p className="text-sm p-4" style={{ color: DIM }}>
                No leads{leadFilter !== "all" ? ` with status "${leadFilter}"` : ""} yet.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "comments" && (
        <div className="p-6" data-testid="admin-comments">
          <p className="text-xs mb-4" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
            Pending moderation queue — approve to publish, reject to delete.
          </p>
          {busy && !commentsLoaded && (
            <p className="text-sm" style={{ color: DIM }}>
              loading…
            </p>
          )}
          {commentsLoaded && comments.length === 0 && (
            <p className="text-sm" style={{ color: DIM }} data-testid="admin-comments-empty">
              No pending comments.
            </p>
          )}
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-sm p-4"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                data-testid="admin-comment-row"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs mb-1" style={{ color: G, fontFamily: "var(--font-mono)" }}>
                      {c.name}
                      {c.postSlug ? ` · /blog/${c.postSlug}` : ""}
                      {c.createdAt ? ` · ${new Date(c.createdAt).toLocaleString()}` : ""}
                    </div>
                    {c.postTitle && (
                      <div className="text-xs mb-2" style={{ color: DIM }}>
                        on “{c.postTitle}”
                      </div>
                    )}
                    <p className="text-sm" style={{ color: "#e2e8f0" }}>
                      {c.comment}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid="admin-comment-approve"
                      onClick={() => moderateComment(c.id, true)}
                      className="px-3 py-1 text-xs font-semibold rounded-sm"
                      style={{ background: G, color: "#0d1117" }}
                    >
                      approve
                    </button>
                    <button
                      type="button"
                      data-testid="admin-comment-reject"
                      onClick={() => moderateComment(c.id, false)}
                      className="px-3 py-1 text-xs rounded-sm"
                      style={{ border: `1px solid ${BORDER}`, color: "#f85149" }}
                    >
                      reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "analytics" && (
        <div className="p-6 space-y-6" data-testid="admin-analytics">
          {busy && !analytics && (
            <p className="text-sm" style={{ color: DIM }}>
              loading…
            </p>
          )}
          {analytics && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-sm" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <h2 className="text-xs mb-3" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                    leads over time (30d)
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={analytics.leadsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                      <XAxis dataKey="date" tick={{ fill: DIM, fontSize: 10 }} />
                      <YAxis tick={{ fill: DIM, fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#0d1117", border: `1px solid ${BORDER}` }} />
                      <Line type="monotone" dataKey="count" stroke={G} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 rounded-sm" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <h2 className="text-xs mb-3" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                    leads by status
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.leadsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                      <XAxis dataKey="status" tick={{ fill: DIM, fontSize: 10 }} />
                      <YAxis tick={{ fill: DIM, fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#0d1117", border: `1px solid ${BORDER}` }} />
                      <Bar dataKey="count" fill={G} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-4 rounded-sm" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <h2 className="text-xs mb-3" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                  top posts by views
                </h2>
                {analytics.topPosts.length === 0 ? (
                  <p className="text-xs" style={{ color: DIM }}>
                    No posts yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.topPosts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                      <XAxis type="number" tick={{ fill: DIM, fontSize: 10 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="title"
                        width={200}
                        tick={{ fill: DIM, fontSize: 10 }}
                      />
                      <Tooltip contentStyle={{ background: "#0d1117", border: `1px solid ${BORDER}` }} />
                      <Bar dataKey="viewCount" fill={A} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="p-4 rounded-sm" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <h2 className="text-xs mb-3" style={{ color: DIM, fontFamily: "var(--font-mono)" }}>
                  traffic and funnel (PostHog)
                </h2>
                {!analytics.posthogConnected ? (
                  <p className="text-xs" style={{ color: DIM }} data-testid="admin-posthog-not-connected">
                    PostHog isn't connected yet. Set POSTHOG_API_KEY, POSTHOG_PROJECT_ID, and POSTHOG_HOST in
                    backend/.env to see traffic and funnel data here.
                  </p>
                ) : (
                  <div data-testid="admin-posthog-data">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {[
                        ["pageviews", analytics.posthog.pageviews_total],
                        ["contact viewed", analytics.posthog.contact_form_viewed],
                        ["contact submitted", analytics.posthog.contact_form_submitted],
                        [
                          "conversion",
                          analytics.posthog.contact_form_conversion_rate != null
                            ? `${analytics.posthog.contact_form_conversion_rate}%`
                            : "—",
                        ],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="text-xl font-bold" style={{ color: G, fontFamily: "var(--font-mono)" }}>
                            {value}
                          </div>
                          <div className="text-xs" style={{ color: DIM }}>
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={analytics.posthog.pageviews_by_day}>
                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                        <XAxis dataKey="date" tick={{ fill: DIM, fontSize: 10 }} />
                        <YAxis tick={{ fill: DIM, fontSize: 10 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#0d1117", border: `1px solid ${BORDER}` }} />
                        <Line type="monotone" dataKey="count" stroke={A} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
