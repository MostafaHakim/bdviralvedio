import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Trending");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMyVideos();
  }, [token, navigate]);

  const fetchMyVideos = async () => {
    try {
      const res = await fetch(`${baseURL}/api/videos`);
      const data = await res.json();
      // Filter videos by current user
      const myVideos = data.filter((v) => v.user === user.id || v.user?._id === user.id);
      setVideos(myVideos);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
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
          url: uploadData.videoUrl,
          thumbnail: uploadData.thumbnailUrl,
        }),
      });

      if (videoRes.ok) {
        setTitle("");
        setVideoFile(null);
        setThumbnailFile(null);
        fetchMyVideos();
        alert("Video uploaded successfully!");
      } else {
        const data = await videoRes.json();
        alert(data.message || "Failed to save video info");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
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
      if (res.ok) fetchMyVideos();
    } catch (err) {
      alert("Error deleting video");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
          <span className="text-red-600 text-2xl font-black tracking-tighter">
            BDViralClip
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 hidden md:inline">
              {user.name}
            </span>
            <img
              src={user.image || "https://ui-avatars.com/api/?name=" + user.name}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
              alt="profile"
            />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info & Upload Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="text-center mb-6">
                <img
                  src={user.image || "https://ui-avatars.com/api/?name=" + user.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-red-50"
                  alt="profile"
                />
                <h2 className="text-xl font-bold mt-4">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-xs text-red-600 font-bold mt-1 uppercase tracking-wider">{user.role}</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Upload New Video</h2>
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
                {uploading ? "Uploading..." : "Upload Video"}
              </button>
            </form>
          </div>
        </div>

        {/* My Videos List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">My Videos</h2>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600">{videos.length} Videos</span>
            </div>
            <div className="divide-y divide-gray-100">
              {videos.length > 0 ? (
                videos.map((video) => (
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
                          {video.category} • {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                         <Link to={`/video/${video._id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                            👁️
                         </Link>
                        <button
                        onClick={() => handleDelete(video._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                        🗑️
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                   <p className="mb-2 text-4xl">🎬</p>
                   <p>You haven't uploaded any videos yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
