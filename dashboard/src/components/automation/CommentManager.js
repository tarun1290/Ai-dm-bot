"use client";

import React, { useState, useCallback } from "react";
import { Loader2, Eye, EyeOff, Trash2, MessageCircle, ToggleLeft, ToggleRight, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  hideCommentAction,
  deleteCommentAction,
  toggleMediaCommentsAction,
  getMediaCommentsAction,
} from "@/app/dashboard/comment-actions";

// ── Post card in the horizontal scroller ────────────────────────────────────
function PostCard({ post, isSelected, onClick }) {
  const thumb = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-36 rounded-xl overflow-hidden transition-all text-left"
      style={{
        border: isSelected ? "2px solid #4F46E5" : "1px solid #E4E4E7",
        backgroundColor: "#FFFFFF",
        opacity: isSelected ? 1 : 0.75,
      }}
    >
      <div className="relative aspect-square w-full" style={{ backgroundColor: "#F4F4F5" }}>
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImageIcon size={24} style={{ color: "#A1A1AA" }} />
          </div>
        )}
      </div>
      <div className="p-2 space-y-1">
        <p
          className="text-xs leading-tight line-clamp-2"
          style={{ color: "#18181B" }}
        >
          {post.caption || "No caption"}
        </p>
        <div className="flex items-center gap-1">
          <MessageCircle size={10} style={{ color: "#A1A1AA" }} />
          <span className="text-[10px]" style={{ color: "#A1A1AA" }}>
            {post.comments_count ?? 0}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Single comment row ──────────────────────────────────────────────────────
function CommentRow({ comment, accountId, onUpdate }) {
  const [hiding, setHiding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isHidden = comment.hidden;

  const handleToggleHide = async () => {
    setHiding(true);
    try {
      const res = await hideCommentAction(accountId, comment.id, !isHidden);
      if (res.success) {
        toast.success(isHidden ? "Comment unhidden" : "Comment hidden");
        onUpdate(comment.id, { hidden: !isHidden });
      } else {
        toast.error(res.error || "Failed to update comment");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setHiding(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteCommentAction(accountId, comment.id);
      if (res.success) {
        toast.success("Comment deleted");
        onUpdate(comment.id, null); // null = remove
      } else {
        toast.error(res.error || "Failed to delete comment");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div
      className="flex items-start gap-3 rounded-lg p-3 transition-opacity"
      style={{
        backgroundColor: "#FAFAFA",
        opacity: isHidden ? 0.5 : 1,
      }}
    >
      {/* Comment content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium" style={{ color: "#18181B" }}>
            {comment.from?.username || "Unknown"}
          </span>
          {isHidden && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
            >
              Hidden
            </span>
          )}
          <span className="text-[10px]" style={{ color: "#A1A1AA" }}>
            {comment.timestamp
              ? new Date(comment.timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        <p className="text-sm" style={{ color: "#52525B" }}>
          {comment.text}
        </p>
        {comment.like_count > 0 && (
          <span className="text-[10px]" style={{ color: "#A1A1AA" }}>
            {comment.like_count} {comment.like_count === 1 ? "like" : "likes"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleToggleHide}
          disabled={hiding}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "#71717A" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F4F4F5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          title={isHidden ? "Unhide comment" : "Hide comment"}
        >
          {hiding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isHidden ? (
            <EyeOff size={14} />
          ) : (
            <Eye size={14} />
          )}
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1 rounded-md text-[11px] font-medium text-white"
              style={{ backgroundColor: "#DC2626" }}
            >
              {deleting ? <Loader2 size={12} className="animate-spin" /> : "Delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 rounded-md text-[11px] font-medium"
              style={{ color: "#71717A", backgroundColor: "#F4F4F5" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "#71717A" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#71717A"; }}
            title="Delete comment"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Comment Manager ────────────────────────────────────────────────────
export default function CommentManager({ media = [], accountId }) {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [togglingComments, setTogglingComments] = useState(false);

  const selectedPost = media.find((p) => p.id === selectedPostId);

  const loadComments = useCallback(
    async (postId) => {
      setSelectedPostId(postId);
      setLoadingComments(true);
      setComments([]);
      setCommentsEnabled(true);
      try {
        const res = await getMediaCommentsAction(accountId, postId);
        if (res.success) {
          setComments(res.comments || []);
        } else {
          toast.error(res.error || "Failed to load comments");
        }
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoadingComments(false);
      }
    },
    [accountId]
  );

  const handleToggleComments = async () => {
    if (!selectedPostId) return;
    setTogglingComments(true);
    const newVal = !commentsEnabled;
    try {
      const res = await toggleMediaCommentsAction(accountId, selectedPostId, newVal);
      if (res.success) {
        setCommentsEnabled(newVal);
        toast.success(newVal ? "Comments enabled" : "Comments disabled");
      } else {
        toast.error(res.error || "Failed to toggle comments");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTogglingComments(false);
    }
  };

  const handleCommentUpdate = (commentId, update) => {
    if (update === null) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, ...update } : c))
      );
    }
  };

  // ── No posts empty state ──────────────────────────────────────────────
  if (!media.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "#F4F4F5" }}
        >
          <MessageCircle size={24} style={{ color: "#A1A1AA" }} />
        </div>
        <h3 className="text-lg font-semibold mb-1" style={{ color: "#18181B" }}>
          No posts found
        </h3>
        <p className="text-sm max-w-sm" style={{ color: "#71717A" }}>
          Publish content on Instagram to manage comments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Post selector ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "#A1A1AA" }}
        >
          Select a post
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {media.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isSelected={selectedPostId === post.id}
              onClick={() => loadComments(post.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Selected post controls + comments ──────────────────────────── */}
      {selectedPostId && (
        <div className="space-y-4">
          {/* Post-level controls */}
          <div
            className="rounded-lg p-4 flex items-center justify-between gap-4"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "#18181B" }}
              >
                {selectedPost?.caption || "No caption"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#A1A1AA" }}>
                {selectedPost?.comments_count ?? 0} comments
              </p>
            </div>
            <button
              onClick={handleToggleComments}
              disabled={togglingComments}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
              style={
                commentsEnabled
                  ? { backgroundColor: "#ECFDF5", color: "#059669" }
                  : { backgroundColor: "#F4F4F5", color: "#A1A1AA" }
              }
            >
              {togglingComments ? (
                <Loader2 size={14} className="animate-spin" />
              ) : commentsEnabled ? (
                <ToggleRight size={14} />
              ) : (
                <ToggleLeft size={14} />
              )}
              {commentsEnabled ? "Comments enabled" : "Comments disabled"}
            </button>
          </div>

          {/* Comments list */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                className="animate-spin"
                size={20}
                style={{ color: "#4F46E5" }}
              />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle
                size={20}
                style={{ color: "#A1A1AA" }}
                className="mb-2"
              />
              <p className="text-sm" style={{ color: "#71717A" }}>
                No comments on this post yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  accountId={accountId}
                  onUpdate={handleCommentUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
