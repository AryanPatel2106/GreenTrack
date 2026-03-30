import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, CheckCircle2, Clock, ThumbsUp, MessageCircle, MoreHorizontal, Trash2, Scan } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';

const formatDate = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue === 'object' && dateValue.seconds !== undefined) {
        return new Date(dateValue.seconds * 1000);
    }
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
};

const PostCard = ({ post }) => {
    const { currentUser } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.upvotes_count || 0);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const fetchComments = async () => {
        try {
            const { default: api } = await import('../utils/api');
            const response = await api.get(`/posts/${post.id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };
    React.useEffect(() => {
        if (post.id) {
            fetchComments();
            setLikeCount(post.upvotes_count || 0);
            const intervalId = setInterval(fetchComments, 10000); // 10 seconds
            return () => clearInterval(intervalId);
        }
    }, [post.id, post.upvotes_count]);
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const { default: api } = await import('../utils/api');
            await api.post(`/posts/${post.id}/comments`, { text: commentText });
            setCommentText('');
            fetchComments();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };
    const handleLike = async () => {
        if (isLiked) return;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        try {
            const { default: api } = await import('../utils/api');
            await api.post(`/posts/${post.id}/like`);
        } catch (error) {
            console.error("Error liking post:", error);
            setIsLiked(false);
            setLikeCount(prev => prev - 1);
        }
    };
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                const { default: api } = await import('../utils/api');
                await api.delete(`/posts/${post.id}`);
                window.location.reload();
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post");
            }
        }
    };
    const handleVerify = async () => {
        if (window.confirm("Verify this post? This will award points to the user.")) {
            try {
                const { default: api } = await import('../utils/api');
                await api.patch(`/posts/${post.id}/verify`);
                window.location.reload();
            } catch (error) {
                console.error("Error verifying post:", error);
            }
        }
    };
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden transform transition-all duration-300 hover:shadow-md h-fit animate-slide-up">
            {}
            <div className="p-4 flex items-center justify-between">
                <Link to={`/profile/user/${post.user_id}`} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                        {post.user_photo ? (
                            <img src={post.user_photo} alt={post.user_name} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow-sm transition-transform group-hover:scale-105" />
                        ) : (
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                                {post.user_name?.charAt(0)}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                            {post.user_name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                            {post.created_at && formatDate(post.created_at) ? formatDistanceToNow(formatDate(post.created_at), { addSuffix: true }) : 'Just now'}
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-emerald-500 font-bold">
                                Guardian Lvl 1
                            </span>
                        </p>
                    </div>
                </Link>
                <div className="flex items-center gap-1">
                    {}
                    {post.status === 'pending' && (
                        <button
                            onClick={handleVerify}
                            className="text-amber-500 hover:text-emerald-600 p-2 rounded-xl hover:bg-emerald-50 transition border border-amber-100 bg-amber-50/30 nature-btn"
                            title="Verify (Admin)"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                    )}
                    {currentUser && currentUser.uid === post.user_id ? (
                        <button
                            onClick={handleDelete}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition nature-btn"
                            title="Delete Post"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="text-slate-300 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            {}
            <div className="px-4 pb-3">
                <p className="text-slate-700 leading-snug text-sm font-medium">
                    {post.caption}
                </p>
            </div>
            {}
            {post.image_url && (
                <div className="relative aspect-[16/10] bg-slate-50 border-y border-slate-100 group">
                    <img src={post.image_url} alt="Care proof" className="w-full h-full object-cover" />
                    {}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col items-end gap-1.5 animate-slide-up">
                        {post.status === 'verified' && (
                            <div className="flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl bg-white/90 backdrop-blur-md text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-xl border border-emerald-500/20">
                                <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 md:mr-1.5 text-emerald-600" />
                                Verified Impact
                            </div>
                        )}
                        {post.status === 'pending' && !post.is_ai_verified && (
                            <div className="flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl bg-white/90 backdrop-blur-md text-[8px] md:text-[10px] font-black uppercase tracking-widest text-amber-600 shadow-xl border border-amber-500/20">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 md:mr-1.5" />
                                Review Pending
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Leaf Image & Health Status */}
            {(post.leaf_image_url || post.leaf_health_status) && (
                <div className="px-4 pb-2 pt-2 animate-fade-in">
                    <div className={`flex items-center gap-3 p-3 rounded-2xl border ${post.is_leaf_healthy ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                        {post.leaf_image_url && (
                            <img src={post.leaf_image_url} alt="Scanned Leaf" className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Scan className={`w-3.5 h-3.5 ${post.is_leaf_healthy ? 'text-emerald-500' : 'text-amber-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${post.is_leaf_healthy ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    Leaf Health Scan
                                </span>
                            </div>
                            {post.leaf_health_status && (
                                <p className={`text-xs font-bold leading-tight ${post.is_leaf_healthy ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {post.leaf_health_status}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {}
            <div className="px-4 pt-4 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <MapPin className="w-3 h-3 mr-1 text-emerald-500" />
                    {post.location_lat && post.location_lng ?
                        `${Number(post.location_lat).toFixed(3)}, ${Number(post.location_lng).toFixed(3)}` :
                        'Earth'
                    }
                </div>
                {!post.image_url && (
                    <div className="animate-fade-in">
                        {post.status === 'verified' && (
                            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                Verified Post
                            </div>
                        )}
                    </div>
                )}
            </div>
            {}
            <div className="p-3 md:p-4 flex items-center gap-4 md:gap-6">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 group transition-all nature-btn ${isLiked ? 'text-emerald-600 scale-105' : 'text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-50'}`}
                >
                    <div className={`p-1.5 rounded-lg transition-all ${isLiked ? 'bg-emerald-50 shadow-sm' : 'bg-transparent group-hover:bg-emerald-50'}`}>
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-xs font-black tracking-tight">{likeCount}</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 group text-slate-500 hover:text-slate-900 py-1.5 rounded-xl transition-all nature-btn"
                >
                    <div className="p-1.5 rounded-lg bg-transparent group-hover:bg-blue-50 transition-all">
                        <MessageCircle className="w-4 h-4 group-hover:text-blue-500" />
                    </div>
                    <span className="text-xs font-black tracking-tight">{comments.length}</span>
                </button>
            </div>
            {}
            {showComments && (
                <div className="bg-slate-50 border-t border-slate-100 p-4 animate-slide-up">
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <div className="flex-shrink-0">
                                    {comment.user_photo ? (
                                        <img src={comment.user_photo} className="w-8 h-8 rounded-lg object-cover border border-white shadow-sm" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                            {comment.user_name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white p-2.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex-1 relative">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{comment.user_name}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{comment.created_at && formatDate(comment.created_at) ? formatDistanceToNow(formatDate(comment.created_at), { addSuffix: true }) : 'now'}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-normal">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <div className="text-center py-4">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No comments yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="flex gap-2 relative group italic">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95 nature-btn"
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
export default PostCard;
