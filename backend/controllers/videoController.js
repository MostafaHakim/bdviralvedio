const Video = require('../models/Video');
const Comment = require('../models/Comment');

exports.getVideos = async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 }).populate('user', 'name image');
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('user', 'name image');
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        // Increment views
        video.views += 1;
        await video.save();

        const comments = await Comment.find({ video: req.params.id }).populate('user', 'name image');
        res.json({ video, comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createVideo = async (req, res) => {
    try {
        const { title, category, url, thumbnail } = req.body;
        const newVideo = new Video({ title, category, url, thumbnail, user: req.user.id });
        await newVideo.save();
        res.json(newVideo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Check if user is owner or admin
        if (video.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.likeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const index = video.likes.indexOf(req.user.id);
        if (index === -1) {
            video.likes.push(req.user.id);
        } else {
            video.likes.splice(index, 1);
        }

        await video.save();
        res.json(video.likes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const comment = new Comment({
            user: req.user.id,
            video: req.params.id,
            text
        });
        await comment.save();
        const populatedComment = await comment.populate('user', 'name image');
        res.json(populatedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
