import { Routes, Route } from "react-router-dom";
import UploadPage from "./UploadPage";
import SharePage from "./SharePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/share/:token" element={<SharePage />} />
    </Routes>
  );
}
