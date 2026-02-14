import React, { useState, useRef } from "react";
import {
  UploadSimple,
  Trash,
  Copy,
  CheckCircle,
  DownloadSimple,
  File,
  FilePdf,
  FileImage,
  FileVideo,
  FileAudio,
  FileZip,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

const API = "https://vercel-backend-refined-7o4h.vercel.app";

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusText, setStatusText] = useState("");

  const inputRef = useRef();
  const navigate = useNavigate();

  /* ================= HELPERS ================= */

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes > 1e9) return (bytes / 1e9).toFixed(2) + " GB";
    if (bytes > 1e6) return (bytes / 1e6).toFixed(2) + " MB";
    return (bytes / 1e3).toFixed(2) + " KB";
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return <FileImage size={20} />;

    if (["mp4", "mov", "avi", "mkv"].includes(ext))
      return <FileVideo size={20} />;

    if (["mp3", "wav", "aac"].includes(ext)) return <FileAudio size={20} />;

    if (ext === "pdf") return <FilePdf size={20} />;

    if (["zip", "rar", "7z"].includes(ext)) return <FileZip size={20} />;

    return <File size={20} />;
  };

  const handleFiles = (selected) => {
    const newFiles = Array.from(selected);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  /* ================= UPLOAD LOGIC ================= */

  const uploadFiles = async () => {
    if (!files.length) return;

    try {
      setUploading(true);
      setProgress(0);
      setStatusText("Preparing upload...");

      // Generate ONE token from first file
      const createRes = await fetch(`${API}/api/create-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: files[0].name,
          fileSize: files[0].size,
          fileType: files[0].type,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) throw new Error(createData.error);

      const token = createData.token;
      let uploadedBytes = 0;

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        setStatusText(`Uploading ${files[i].name}...`);

        const res = await fetch(`${API}/api/create-upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            fileName: files[i].name,
            fileSize: files[i].size,
            fileType: files[i].type,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        await fetch(data.uploadUrl, {
          method: "PUT",
          body: files[i],
        });

        uploadedBytes += files[i].size;
        const pct = Math.round((uploadedBytes / totalSize) * 100);
        setProgress(pct);
      }

      setStatusText("Finalizing...");
      setGeneratedLink(`${window.location.origin}/share/${token}`);
      setUploading(false);
      setStatusText("");
    } catch (err) {
      alert("Upload failed: " + err.message);
      setUploading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  /* ================= UI ================= */

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Eastape Share" />
        </div>
      </header>

      <div className="main">
        <div className="hero">
          <h1>
            Share Files <br />
            <span>Securely & Instantly</span>
          </h1>
          <p>Fast, encrypted transfers. No limits. No friction.</p>
        </div>

        <div className="upload-box">
          <div className="drop-area" onClick={() => inputRef.current.click()}>
            <UploadSimple size={28} />
            <p>Drag & Drop files</p>
            <span>or click to browse</span>

            <input
              type="file"
              multiple
              hidden
              ref={inputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <>
              <div className="file-section">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-left">
                      {getFileIcon(file.name)}
                      <div className="file-text">
                        <span>{file.name}</span>
                        <small>{formatSize(file.size)}</small>
                      </div>
                    </div>

                    <Trash
                      size={18}
                      style={{ cursor: "pointer" }}
                      onClick={() => removeFile(index)}
                    />
                  </div>
                ))}

                <div className="file-meta">
                  Total size: {formatSize(totalSize)}
                </div>
              </div>

              {uploading && (
                <>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="progress-info">
                    {statusText} • {progress}%
                  </div>
                </>
              )}

              {!uploading && !generatedLink && (
                <button className="primary-btn full-btn" onClick={uploadFiles}>
                  Transfer Files
                </button>
              )}

              {generatedLink && (
                <div className="success-link">
                  <CheckCircle size={22} />
                  <input value={generatedLink} readOnly />
                  <button className="primary-btn" onClick={copyLink}>
                    {copied ? "Copied" : <Copy size={18} />}
                  </button>
                  <button
                    className="ghost-btn"
                    onClick={() =>
                      navigate(
                        generatedLink.replace(window.location.origin, "")
                      )
                    }
                  >
                    <DownloadSimple size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="footer">
        <span>© 2026 Eastape Films. All rights reserved.</span>
        <span>Currently for Private use only</span>
      </footer>
    </div>
  );
}
