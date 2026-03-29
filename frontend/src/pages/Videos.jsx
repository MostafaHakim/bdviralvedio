import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    fetch(`${baseURL}/api/videos`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching videos:", err);
        setLoading(false);
      });
  }, []);

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M";
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K";
    }
    return views;
  };

  const categories = [
    "All",
    "Trending",
    "Music",
    "Comedy",
    "News",
    "Sports",
    "Entertainment",
  ];

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-3 border-red-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-red-600 animate-ping"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading amazing videos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
            <span className="text-red-600 text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              BDViralClip
            </span>
          </Link>
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm pl-12 transition-all duration-200"
              />
              <svg
                className="absolute left-4 top-3 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {localStorage.getItem("user") ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-3 hover:opacity-80 transition">
                  <span className="text-sm font-medium text-gray-700 hidden md:inline">
                    {JSON.parse(localStorage.getItem("user")).name}
                  </span>
                  <img
                    src={
                      JSON.parse(localStorage.getItem("user")).image ||
                      "https://ui-avatars.com/api/?name=" +
                        JSON.parse(localStorage.getItem("user")).name
                    }
                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    alt="profile"
                  />
                </Link>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-red-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-red-700 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="sticky top-16 z-40 bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-black text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {filteredVideos.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === "All"
                    ? "Recommended for you"
                    : `${selectedCategory} Videos`}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredVideos.length}{" "}
                  {filteredVideos.length === 1 ? "video" : "videos"} found
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Latest ↓
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <Link
                  key={video._id}
                  to={`/video/${video._id}`}
                  state={video}
                  className="group flex flex-col space-y-2 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={
                        video.thumbnail ||
                        `https://picsum.photos/320/180?random=${index}`
                      }
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
                      12:34
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                      B
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors text-sm">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                        {video.category || "Trending"}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>
                          {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              Clear filters →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 rounded-lg transform rotate-12"></div>
              <span className="text-red-600 font-bold">BDViralClip</span>
              <span className="text-xs text-gray-400 ml-2">© 2024</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">
                About
              </a>
              <a href="#" className="hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Videos;
