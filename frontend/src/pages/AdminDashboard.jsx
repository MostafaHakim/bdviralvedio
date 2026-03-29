import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Trending");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("file"); // "file" or "url"
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchVideos();
  }, [token, navigate]);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${baseURL}/api/videos`);
      const data = await res.json();
      setVideos(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    
    let finalVideoUrl = "";
    let finalThumbnailUrl = "";

    if (uploadMethod === "file") {
      if (!videoFile || !thumbnailFile) {
        alert("Please select both video and thumbnail files");
        return;
      }

      setUploading(true);
      try {
        // 1. Upload to Cloudinary via Backend
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("thumbnail", thumbnailFile);

        const uploadRes = await fetch(`${baseURL}/api/videos/upload`, {
          method: "POST",
          headers: {
            "x-auth-token": token,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message);
        
        finalVideoUrl = uploadData.videoUrl;
        finalThumbnailUrl = uploadData.thumbnailUrl;
      } catch (err) {
        console.error(err);
        alert("Upload failed: " + err.message);
        setUploading(false);
        return;
      }
    } else {
      if (!videoUrl || !thumbnailUrl) {
        alert("Please provide both video and thumbnail URLs");
        return;
      }
      finalVideoUrl = videoUrl;
      finalThumbnailUrl = thumbnailUrl;
    }

    try {
      // 2. Save Video Info to MongoDB
      const videoRes = await fetch(`${baseURL}/api/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          title,
          category,
          url: finalVideoUrl,
          thumbnail: finalThumbnailUrl,
        }),
      });

      if (videoRes.ok) {
        setTitle("");
        setVideoFile(null);
        setThumbnailFile(null);
        setVideoUrl("");
        setThumbnailUrl("");
        fetchVideos();
        alert("Video added successfully!");
      } else {
        const data = await videoRes.json();
        alert(data.message || "Failed to save video info");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving video");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      const res = await fetch(`${baseURL}/api/videos/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) fetchVideos();
    } catch (err) {
      alert("Error deleting video");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-600">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-black"
          >
            View Site
          </button>
          <button onClick={handleLogout} className="text-red-600 font-medium">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Video Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Upload New Video</h2>
            
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => setUploadMethod("file")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${uploadMethod === "file" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                File Upload
              </button>
              <button
                onClick={() => setUploadMethod("url")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${uploadMethod === "url" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                External URL
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Video Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {uploadMethod === "file" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Thumbnail Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files[0])}
                      className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Video URL (YouTube or Google Drive)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option>Trending</option>
                  <option>Music</option>
                  <option>Comedy</option>
                  <option>News</option>
                  <option>Sports</option>
                  <option>Entertainment</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className={`w-full font-bold py-3 rounded-lg transition ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
              >
                {uploading ? "Processing..." : uploadMethod === "file" ? "Upload Video" : "Add Video"}
              </button>
            </form>
          </div>
        </div>

        {/* Video List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold">Manage Videos</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={video.thumbnail}
                      alt=""
                      className="w-24 h-14 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {video.category} • {video.views} views • By {video.user?.name || "Admin"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
