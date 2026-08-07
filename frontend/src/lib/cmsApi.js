/** Public CMS client with static seed fallback (issue #17). */
import axios from "axios";
import { BLOG_POSTS as SEED_BLOGS } from "@/data/blogPosts";
import { CLIENT_PROJECTS as SEED_PROJECTS } from "@/data/clientProjects";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export async function fetchPublishedBlogs() {
  try {
    const { data } = await axios.get(`${API}/content/blog`, { timeout: 5000 });
    if (Array.isArray(data) && data.length) return data;
  } catch {
    /* fall through */
  }
  return SEED_BLOGS.filter((p) => p.published);
}

export async function fetchBlogBySlug(slug) {
  try {
    const { data } = await axios.get(`${API}/content/blog/${slug}`, { timeout: 5000 });
    if (data?.slug) return data;
  } catch {
    /* fall through */
  }
  return SEED_BLOGS.find((p) => p.published && p.slug === slug) || null;
}

export async function fetchPublishedProjects() {
  try {
    const { data } = await axios.get(`${API}/content/projects`, { timeout: 5000 });
    if (Array.isArray(data) && data.length) return data;
  } catch {
    /* fall through */
  }
  return SEED_PROJECTS.filter((p) => p.published);
}

const TOKEN_KEY = "softogram_admin_token";

export function getAdminToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function adminHeaders() {
  return { Authorization: `Bearer ${getAdminToken()}` };
}

export async function adminLogin(password) {
  const { data } = await axios.post(`${API}/admin/login`, { password });
  setAdminToken(data.token);
  return data.token;
}

export async function adminFetchBlogs() {
  const { data } = await axios.get(`${API}/admin/blog`, { headers: adminHeaders() });
  return data;
}

export async function adminSaveBlogs(items) {
  const { data } = await axios.put(`${API}/admin/blog`, items, { headers: adminHeaders() });
  return data;
}

export async function adminFetchProjects() {
  const { data } = await axios.get(`${API}/admin/projects`, { headers: adminHeaders() });
  return data;
}

export async function adminSaveProjects(items) {
  const { data } = await axios.put(`${API}/admin/projects`, items, { headers: adminHeaders() });
  return data;
}
