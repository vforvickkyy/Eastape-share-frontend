import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DownloadSimple,
  File,
  FilePdf,
  FileImage,
  FileVideo,
  FileAudio,
  FileZip,
} from "@phosphor-icons/react";
import logo from "./assets/logo.png";

const API = "https://vercel-backend-refined-7o4h.vercel.app";

export default function SharePage() {
  const { token } = useParams(); // 🔥 FIXED
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchFiles = async () => {
      try {
        const res = await fetch(`${API}/api/share/${token}`);

        if (!res.ok) {
          setInvalid(true);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setInvalid(true);
          setLoading(false);
          return;
        }

        // expiry check
        const expired = new Date(data[0].expires_at) < new Date();

        if (expired) {
          setInvalid(true);
          setLoading(false);
          return;
        }

        setFiles(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setInvalid(true);
        setLoading(false);
      }
    };

    fetchFiles();
  }, [token]);

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
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

  const totalSize = files.reduce((acc, file) => acc + file.file_size, 0);

  if (loading) {
    return (
      <div className="page center">
        <div className="upload-box">
          <h3>Loading files...</h3>
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="page center">
        <div className="upload-box">
          <h3>Link expired or invalid</h3>
          <button
            className="primary-btn"
            style={{ marginTop: 20 }}
            onClick={() => navigate("/")}
          >
            Upload New Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Eastape Studio" />
        </div>

        <button className="ghost-btn" onClick={() => navigate("/")}>
          ← Upload More
        </button>
      </header>

      <div className="main">
        <div className="hero">
          <h1>
            Files Ready <br />
            <span>For Download</span>
          </h1>
        </div>

        <div className="upload-box">
          <h3>Your files are ready</h3>

          <div className="file-section">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-left">
                  {getFileIcon(file.file_name)}
                  <div className="file-text">
                    <span>{file.file_name}</span>
                    <small>{formatSize(file.file_size)}</small>
                  </div>
                </div>

                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn"
                >
                  <DownloadSimple size={18} weight="bold" />
                </a>
              </div>
            ))}
          </div>

          <div className="file-meta">Total size: {formatSize(totalSize)}</div>
        </div>
      </div>

      <footer className="footer">
        <span>© 2026 Eastape Films. All rights reserved.</span>
      </footer>
    </div>
  );
}
