export type User = {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt?: string;
};

export type Page = {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type Slide = {
  id: number;
  kind: "image" | "jft";
  alt: string;
  position: number;
  src: string | null;
};

export type Deck = {
  slug: string;
  title: string;
  updatedAt: string;
  slides: Slide[];
};

export type Script = {
  slug: string;
  title: string;
  hasFile: boolean;
  updatedAt: string | null;
  fileUrl: string | null;
};

export type Settings = {
  site_title: string;
  zoom_url: string;
  meeting_start: string;
  meeting_end: string;
  meeting_tz: string;
  calendar_embed_src: string;
  qrUrl: string | null;
  seventhTraditionUrl: string | null;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...init,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message =
      (isJson && (data as { error?: string })?.error) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

function jsonBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const api = {
  // Auth
  me: () => request<{ user: User | null }>("/auth/me"),
  login: (email: string) =>
    request<{ ok: true }>("/auth/login", jsonBody("POST", { email })),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),

  // Pages
  getPage: (slug: string) => request<Page>(`/api/pages/${slug}`),
  savePage: (slug: string, title: string, body: string) =>
    request<Page>(`/api/pages/${slug}`, jsonBody("PUT", { title, body })),

  // Decks + slides
  listDecks: () => request<Deck[]>("/api/decks"),
  getDeck: (slug: string) => request<Deck>(`/api/decks/${slug}`),
  createDeck: (title: string) =>
    request<Deck>("/api/decks", jsonBody("POST", { title })),
  renameDeck: (slug: string, title: string) =>
    request<Deck>(`/api/decks/${slug}`, jsonBody("PATCH", { title })),
  deleteDeck: (slug: string) =>
    request<{ ok: true }>(`/api/decks/${slug}`, { method: "DELETE" }),
  addSlide: (slug: string, file: File, alt: string) => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("alt", alt);
    return request<Slide>(`/api/decks/${slug}/slides`, {
      method: "POST",
      body: fd,
    });
  },
  addJftSlide: (slug: string) =>
    request<Slide>(`/api/decks/${slug}/jft-slide`, { method: "POST" }),
  reorderSlides: (slug: string, order: number[]) =>
    request<{ slides: Slide[] }>(
      `/api/decks/${slug}/order`,
      jsonBody("PUT", { order }),
    ),
  updateSlide: (id: number, alt: string) =>
    request<Slide>(`/api/slides/${id}`, jsonBody("PATCH", { alt })),
  deleteSlide: (id: number) =>
    request<{ ok: true }>(`/api/slides/${id}`, { method: "DELETE" }),

  // Scripts
  listScripts: () => request<Script[]>("/api/scripts"),
  getScript: (slug: string) => request<Script>(`/api/scripts/${slug}`),
  createScript: (title: string, file?: File | null) => {
    const fd = new FormData();
    fd.append("title", title);
    if (file) fd.append("pdf", file);
    return request<Script>("/api/scripts", { method: "POST", body: fd });
  },
  renameScript: (slug: string, title: string) =>
    request<Script>(`/api/scripts/${slug}`, jsonBody("PATCH", { title })),
  deleteScript: (slug: string) =>
    request<{ ok: true }>(`/api/scripts/${slug}`, { method: "DELETE" }),
  replaceScript: (slug: string, file: File) => {
    const fd = new FormData();
    fd.append("pdf", file);
    return request<Script>(`/api/scripts/${slug}`, { method: "PUT", body: fd });
  },

  // Settings
  getSettings: () => request<Settings>("/api/settings"),
  saveSettings: (values: Partial<Settings>) =>
    request<Settings>("/api/settings", jsonBody("PUT", values)),
  replaceQr: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return request<Settings>("/api/settings/qr", { method: "PUT", body: fd });
  },
  replaceSeventhTradition: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return request<Settings>("/api/settings/seventh-tradition", {
      method: "PUT",
      body: fd,
    });
  },
  removeSeventhTradition: () =>
    request<Settings>("/api/settings/seventh-tradition", { method: "DELETE" }),

  // Users
  listUsers: () => request<User[]>("/api/users"),
  createUser: (email: string, name: string, isAdmin: boolean) =>
    request<User>("/api/users", jsonBody("POST", { email, name, isAdmin })),
  setUserAdmin: (id: number, isAdmin: boolean) =>
    request<User>(`/api/users/${id}`, jsonBody("PATCH", { isAdmin })),
  setUserName: (id: number, name: string) =>
    request<User>(`/api/users/${id}`, jsonBody("PATCH", { name })),
  deleteUser: (id: number) =>
    request<{ ok: true }>(`/api/users/${id}`, { method: "DELETE" }),
};
