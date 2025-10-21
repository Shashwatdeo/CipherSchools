import React, { useState } from "react";

const FileManager = ({ files, setFiles, autoRender }) => {
  const [newFileName, setNewFileName] = useState("");
  const [renaming, setRenaming] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [folderOld, setFolderOld] = useState("");
  const [folderNew, setFolderNew] = useState("");

  const addFile = () => {
    if (!newFileName) return alert("Enter a file name!");

    // Ensure file ends with .js
    let fileName = newFileName.endsWith(".js") ? newFileName : newFileName + ".js";
    fileName = "/" + fileName; // Sandpack requires leading /

    if (files[fileName]) return alert("File already exists!");

    // Default React component template
    const rawName = fileName.replace("/", "").replace(".js", "");
    const componentName = rawName
      .split(/[^a-zA-Z0-9]/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
    const defaultCode = `export default function ${componentName}() {
  return (
    <div>
      <h2>${componentName} Component</h2>
    </div>
  );
}`;

    setFiles({ ...files, [fileName]: { code: defaultCode } });
    setNewFileName("");
  };

  const renameFolder = () => {
    if (!folderOld || !folderNew) {
      alert("Enter both old and new folder names");
      return;
    }
    const oldClean = folderOld.trim();
    const newClean = folderNew.trim();
    const normalizeFolder = (n) => {
      const trimmed = n.trim().replace(/^\/+|\/+$/g, "");
      if (!trimmed) return "";
      const parts = trimmed.split("/").filter(Boolean);
      // Remove an accidental file extension from the last segment only
      parts[parts.length - 1] = parts[parts.length - 1].replace(/\.(js|jsx|ts|tsx)$/i, "");
      return parts.join("/");
    };
    const oldBase = normalizeFolder(oldClean);
    const newBase = normalizeFolder(newClean);
    if (!oldBase || !newBase) {
      alert("Folder names cannot be empty");
      return;
    }
    if (oldBase === newBase) {
      alert("Old and new folder names are the same");
      return;
    }
    const oldPrefix = "/" + oldBase.replace(/^\/+|\/+$/g, "") + "/";
    const newPrefix = "/" + newBase.replace(/^\/+|\/+$/g, "") + "/";

    if (!autoRender && Object.keys(files).some((f) => f === "/App.js" && f.startsWith(oldPrefix))) {
      alert("Cannot move /App.js when Auto Render is off");
      return;
    }

    const updated = { ...files };
    const names = Object.keys(files);
    const toRename = names.filter((n) => n.startsWith(oldPrefix));
    if (toRename.length === 0) {
      alert(`No files found under ${oldPrefix}. Create files like \"${oldBase}/Header\" first.`);
      return;
    }

    for (const oldName of toRename) {
      const newName = oldName.replace(oldPrefix, newPrefix);
      if (updated[newName]) {
        alert(`Conflict: ${newName} already exists`);
        return;
      }
    }

    for (const oldName of toRename) {
      const newName = oldName.replace(oldPrefix, newPrefix);
      updated[newName] = updated[oldName];
      delete updated[oldName];
    }
    setFiles(updated);
    setFolderOld("");
    setFolderNew("");
  };

  const deleteFile = (name) => {
    const updated = { ...files };
    delete updated[name];
    setFiles(updated);
  };

  const startRename = (name) => {
    setRenaming(name);
    const base = name.startsWith("/") ? name.slice(1) : name;
    setRenameValue(base);
  };

  const applyRename = (name) => {
    if (!renameValue) return;
    if (name === "/App.js" && !autoRender) {
      alert("Cannot rename /App.js when Auto Render is off");
      return;
    }
    let target = renameValue.endsWith(".js") ? renameValue : renameValue + ".js";
    target = "/" + target;
    if (files[target]) {
      alert("A file with this name already exists");
      return;
    }
    const updated = { ...files };
    updated[target] = updated[name];
    delete updated[name];
    setFiles(updated);
    setRenaming("");
    setRenameValue("");
  };

  return (
    <div>
      {Object.keys(files).map((name) => (
        <div key={name} className="file-row">
          {renaming === name ? (
            <div className="rename-row">
              <input
                className="input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyRename(name); if (e.key === "Escape") setRenaming(""); }}
              />
              <button className="btn btn-icon" onClick={() => applyRename(name)}>✅</button>
              <button className="btn btn-icon" onClick={() => setRenaming("")}>↩️</button>
            </div>
          ) : (
            <>
              <span className="file-name">{name}</span>
              <div className="file-actions">
                <button className="btn btn-icon" onClick={() => startRename(name)}>✏️</button>
                <button className="btn btn-icon" onClick={() => deleteFile(name)}>❌</button>
              </div>
            </>
          )}
        </div>
      ))}

      <div className="control-grid cols-3 mt-8">
        <input
          className="input"
          placeholder="New file (e.g., Header)"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addFile(); }}
        />
        <div></div>
        <button className="btn" onClick={addFile}>Add File</button>
      </div>

      <div className="section-title">FOLDER TOOLS</div>
      <div className="control-grid cols-2-1">
        <input className="input" placeholder="old folder (e.g., components)" value={folderOld} onChange={(e) => setFolderOld(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") renameFolder(); }} />
        <input className="input" placeholder="new folder (e.g., ui)" value={folderNew} onChange={(e) => setFolderNew(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") renameFolder(); }} />
        <button className="btn" onClick={renameFolder}>Rename Folder</button>
      </div>
    </div>
  );
}

export default FileManager;
