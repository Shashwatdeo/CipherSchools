import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Sandpack } from "@codesandbox/sandpack-react";
import FileManager from "./components/FileManager";
import "./styles.css";

const App = () => {
  const [files, setFiles] = useState({
    "/App.js": { code: "export default function App(){ return <h1>Hello CipherStudio</h1> }" }
  });
  const [projectId, setProjectId] = useState("proj123");
  const [autoRender, setAutoRender] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("cipher:theme") || "light");
  const [autosave, setAutosave] = useState(() => localStorage.getItem("cipher:autosave") === "true");
  const autosaveTimer = useRef(null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("cipher:user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("cipher:token") || "");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [projectInput, setProjectInput] = useState("proj123");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [toasts, setToasts] = useState([]);

  const pushToast = ({ type = "success", text = "", timeout = 2500 }) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  };

  // Load project
  const loadProject = async () => {
    try {
      const local = localStorage.getItem(`cipher:project:${projectId}`);
      if (local) {
        const parsed = JSON.parse(local);
        const formatted = {};
        Object.entries(parsed.files || {}).forEach(([name, file]) => {
          formatted[name] = { code: file.code };
        });
        setFiles(formatted);
        return;
      }
      const res = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
      const data = res.data;
      const formatted = {};
      data.files.forEach((f) => (formatted[f.name] = { code: f.content }));
      setFiles(formatted);
    } catch (err) {
      console.log("No project found, using default");
    }
  };

  // Save project
  const saveProject = async () => {
    const projectFiles = Object.entries(files).map(([name, file]) => ({
      name,
      content: file.code
    }));

    try {
      localStorage.setItem(`cipher:project:${projectId}`, JSON.stringify({ projectId, files }));
      await axios.put(`http://localhost:5000/api/projects/${projectId}`, {
        name: "My CipherStudio Project",
        files: projectFiles
      });
      pushToast({ type: "success", text: "Project saved" });
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", text: "Save failed" });
    }
  };

  useEffect(() => {
    loadProject();
  }, []);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("cipher:theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("cipher:autosave", autosave);
  }, [autosave]);

  useEffect(() => {
    if (!autosave) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      localStorage.setItem(`cipher:project:${projectId}`, JSON.stringify({ projectId, files }));
    }, 800);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [files, projectId, autosave]);

  const handleRegister = async () => {
    try {
      if (!authUsername || !authEmail || !authPassword) {
        pushToast({ type: "error", text: "Please fill username, email and password" });
        return;
      }
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: authUsername,
        email: authEmail,
        password: authPassword,
      });
      const { user: u, token: t } = res.data;
      setUser(u);
      setToken(t);
      localStorage.setItem("cipher:user", JSON.stringify(u));
      localStorage.setItem("cipher:token", t);
      setAuthOpen(false);
      setAuthUsername("");
      setAuthEmail("");
      setAuthPassword("");
      pushToast({ type: "success", text: `Welcome, ${u.username}` });
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", text: "Register failed" });
    }
  };

  const handleLogin = async () => {
    try {
      if (!authUsername && !authEmail) {
        pushToast({ type: "error", text: "Enter username or email" });
        return;
      }
      if (!authPassword) {
        pushToast({ type: "error", text: "Enter password" });
        return;
      }
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: authUsername || undefined,
        email: authEmail || undefined,
        password: authPassword,
      });
      const { user: u, token: t } = res.data;
      setUser(u);
      setToken(t);
      localStorage.setItem("cipher:user", JSON.stringify(u));
      localStorage.setItem("cipher:token", t);
      setAuthOpen(false);
      setAuthUsername("");
      setAuthEmail("");
      setAuthPassword("");
      pushToast({ type: "success", text: `Logged in as ${u.username}` });
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", text: "Login failed" });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cipher:user");
    setToken("");
    localStorage.removeItem("cipher:token");
  };

  const downloadProject = () => {
    const blob = new Blob([JSON.stringify({ projectId, files }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}.cipher.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushToast({ type: "success", text: "Project downloaded" });
  };

  const sandpackFiles = useMemo(() => {
    const toPascal = (raw) => raw
      .split(/[^a-zA-Z0-9]/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");

    const entries = Object.entries(files);
    if (!autoRender) {
      return files;
    }
    
    const looksLikeComponent = (code = "") => {
      const hasDefault = /export\s+default/i.test(code);
      const isFn = /export\s+default\s+function/i.test(code) || /=>\s*\{/i.test(code);
      const hasJSX = /<\w+[^>]*>/i.test(code);
      return hasDefault && (isFn || hasJSX);
    };

    const componentFiles = entries
      .map(([name, file]) => ({ name, file }))
      .filter(({ name }) => name.endsWith(".js"))
      .filter(({ name }) => name !== "/App.js")
      .filter(({ name }) => !/\/index\.js$/i.test(name))
      .filter(({ file }) => looksLikeComponent(file?.code));

    const imports = componentFiles.map(({ name }) => {
      const base = name.replace(/^\//, "").replace(/\.js$/i, "");
      const comp = toPascal(base.split("/").pop() || base);
      return { comp, path: `./${base}` };
    });

    const importLines = imports.map(({ comp, path }) => `import ${comp} from "${path}";`).join("\n");
    const renderLines = imports.map(({ comp }) => `      <${comp} />`).join("\n");

    const generatedApp = `${importLines}

export default function App(){
  return (
    <div>
      <h1>Hello CipherStudio</h1>
${renderLines || ""}
    </div>
  );
}`;

    return {
      ...files,
      "/App.js": { code: generatedApp }
    };
  }, [files, autoRender]);

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("cipher:user", JSON.stringify(res.data.user));
        }
      } catch (e) {
        // token invalid
        setToken("");
        localStorage.removeItem("cipher:token");
      }
    };
    init();
  }, [token]);

  return (
    <div className="app-root" data-theme={theme}>
      <div className="topbar">
        <div className="brand">CipherStudio</div>
        <div className="top-actions">
          <label className="switch">
            <input type="checkbox" checked={theme === "dark"} onChange={(e) => setTheme(e.target.checked ? "dark" : "light")} />
            Theme
          </label>
          {user ? (
            <>
              <span className="switch">Hi, {user.username}</span>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => { setAuthOpen((v) => !v); setAuthMode("login"); }}>Login</button>
              <button className="btn" onClick={() => { setAuthOpen((v) => !v); setAuthMode("register"); }}>Register</button>
            </>
          )}
        </div>
      </div>

      <div className={`workspace ${windowWidth < 900 ? "stack" : ""}`}>
        <aside className="sidebar">
          <div className="panel-head">
            <h3>FILES</h3>
          </div>
          <div className="file-manager">
            <FileManager files={files} setFiles={setFiles} autoRender={autoRender} />
          </div>

          <div className="section-title">PROJECT</div>
          <div className="control-grid cols-4">
            <input className="input" value={projectInput} onChange={(e) => setProjectInput(e.target.value)} placeholder="projectId" />
            <button className="btn" onClick={() => setProjectId(projectInput)}>Set</button>
            <button className="btn" onClick={loadProject}>Load</button>
            <button className="btn btn-primary" onClick={saveProject}>Save</button>
          </div>

          <div className="control-row mt-8">
            <label className="switch">
              <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
              Autosave
            </label>
            <label className="switch">
              <input type="checkbox" checked={autoRender} onChange={(e) => setAutoRender(e.target.checked)} />
              Auto Render
            </label>
            <button className="btn" onClick={downloadProject}>Download</button>
          </div>

          {!user && authOpen && (
            <>
              <div className="section-title">ACCOUNT</div>
              <div className="control-grid">
                <input className="input" placeholder="username" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} />
                <input className="input" placeholder="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                <input className="input" placeholder="password" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
              </div>
              <div className="control-row mt-8">
                {authMode === "login" ? (
                  <button className="btn btn-primary" onClick={handleLogin} disabled={!((authUsername || authEmail) && authPassword)}>Login</button>
                ) : (
                  <button className="btn btn-primary" onClick={handleRegister} disabled={!(authUsername && authEmail && authPassword)}>Register</button>
                )}
                <button className="btn" onClick={() => setAuthOpen(false)}>Close</button>
              </div>
              {authMode === "register" && (
                <div className="error">All fields are required to register.</div>
              )}
              {authMode === "login" && (!authPassword || (!authUsername && !authEmail)) && (
                <div className="error">Provide username/email and password to login.</div>
              )}
            </>
          )}
        </aside>

        <main className="preview">
          <Sandpack
            template="react"
            files={sandpackFiles}
            theme={theme}
            options={{
              showTabs: true,
              showLineNumbers: true,
              editorHeight: 600,
            }}
          />
        </main>
      </div>
      <div className="toast">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>{t.text}</div>
        ))}
      </div>
    </div>
  );
};

export default App;
