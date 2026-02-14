import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./UploadPage";
import SharePage from "./SharePage";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app dark apple">
        <header className="header apple-header"></header>

        <main className="center">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/share/:token" element={<SharePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
