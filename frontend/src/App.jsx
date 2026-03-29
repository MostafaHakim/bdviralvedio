import { Routes, Route } from "react-router-dom";
import Videos from "./pages/Videos";
import VideoPlayer from "./pages/VideoPlayer";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<Videos />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
