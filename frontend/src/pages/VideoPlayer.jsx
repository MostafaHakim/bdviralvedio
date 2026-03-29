import { useState, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";

const VideoPlayer = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  console.log(video);
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVideoData();
    fetchRelatedVideos();
  }, [id]);

  const fetchVideoData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/videos/${id}`);
      const data = await res.json();
      setVideo(data.video);
      setComments(data.comments);
      setLikeCount(data.video.likes.length);
      if (user && data.video.likes.includes(user.id)) {
        setLiked(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const res = await fetch(`${baseURL}/api/videos`);
      const data = await res.json();
      setRelatedVideos(data.filter((v) => v._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${baseURL}/api/videos/${id}/like`, {
        method: "POST",
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      setLiked(!liked);
      setLikeCount(data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${baseURL}/api/videos/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      setComments([data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
            <span className="text-red-600 text-2xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              BDViralClip
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  {user.name}
                </span>
                <img
                  src={
                    user.image ||
                    "https://ui-avatars.com/api/?name=" + user.name
                  }
                  className="w-9 h-9 rounded-full object-cover"
                  alt="profile"
                />
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-red-600">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
            {video.url.includes("youtube.com") ||
            video.url.includes("youtu.be") ? (
              <iframe
                className="w-full h-full"
                src={
                  video.url.includes("embed")
                    ? video.url
                    : video.url.replace("watch?v=", "embed/")
                }
                title={video.title}
                allowFullScreen
              />
            ) : video.url.includes("drive.google.com") ? (
              <iframe
                className="w-full h-full"
                src={video.url}
                title={video.title}
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full"
                src={video.url}
                controls
                autoPlay
              />
            )}
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div>
                  <p className="font-bold">BDViral Official</p>
                  <p className="text-xs text-gray-500">1.2M subscribers</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition ${liked ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  <span>{liked ? "❤️" : "🤍"}</span>
                  <span>{likeCount} Likes</span>
                </button>
                <button className="bg-gray-100 px-5 py-2 rounded-full text-sm font-medium">
                  Share
                </button>
              </div>
            </div>

            {/* Comment Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-6">
                {comments.length} Comments
              </h3>
              {user ? (
                <form onSubmit={handleComment} className="flex space-x-4 mb-8">
                  <img
                    src={
                      user.image ||
                      "https://ui-avatars.com/api/?name=" + user.name
                    }
                    className="w-10 h-10 rounded-full object-cover"
                    alt=""
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full border-b border-gray-300 focus:border-black outline-none py-2 bg-transparent transition"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-100 p-4 rounded-xl text-center mb-8">
                  <p className="text-sm text-gray-600">
                    Please{" "}
                    <Link to="/login" className="text-red-600 font-bold">
                      Login
                    </Link>{" "}
                    to post a comment
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-4">
                    <img
                      src={
                        comment.user.image ||
                        "https://ui-avatars.com/api/?name=" + comment.user.name
                      }
                      className="w-10 h-10 rounded-full object-cover"
                      alt=""
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[400px] space-y-4">
          <h2 className="font-bold text-sm uppercase text-gray-500">Up next</h2>
          {relatedVideos.map((rv) => (
            <Link
              key={rv._id}
              to={`/video/${rv._id}`}
              className="flex space-x-3 group"
            >
              <img
                src={rv.thumbnail}
                className="w-40 h-24 object-cover rounded-xl shadow-sm"
                alt=""
              />
              <div className="flex-1">
                <h3 className="text-sm font-bold line-clamp-2 group-hover:text-red-600 transition">
                  {rv.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{rv.category}</p>
                <p className="text-xs text-gray-400">{rv.views} views</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;
