import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Reply, 
  Heart, 
  ThumbsUp, 
  ThumbsDown,
  Edit2,
  Trash2,
  MoreHorizontal,
  AtSign,
  Paperclip,
  Eye,
  EyeOff,
  Flag,
  Clock,
  User
} from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
    role?: string;
  };
  created_at: string;
  updated_at?: string;
  is_edited: boolean;
  is_internal: boolean;
  parent_id?: number;
  replies?: Comment[];
  reactions: {
    like: number;
    love: number;
    dislike: number;
    user_reaction?: 'like' | 'love' | 'dislike' | null;
  };
  attachments?: {
    id: number;
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  mentions?: {
    id: number;
    name: string;
  }[];
}

interface CommentsSystemProps {
  entityType: 'audit' | 'task' | 'evidence' | 'review';
  entityId: number;
  currentUser: {
    id: number;
    name: string;
    avatar?: string;
    role?: string;
  };
  onCommentAdded?: (comment: Comment) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: number) => void;
  allowInternal?: boolean;
  allowAttachments?: boolean;
  allowMentions?: boolean;
  allowReactions?: boolean;
  maxDepth?: number;
  className?: string;
}

const CommentsSystem: React.FC<CommentsSystemProps> = ({
  entityType,
  entityId,
  currentUser,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  allowInternal = true,
  allowAttachments = true,
  allowMentions = true,
  allowReactions = true,
  maxDepth = 3,
  className = ''
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [isInternal, setIsInternal] = useState(false);
  const [showInternal, setShowInternal] = useState(true);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Handle mention detection
  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    if (allowMentions) {
      const mentionMatch = value.match(/@(\w*)$/);
      if (mentionMatch) {
        setShowMentions(true);
        // Fetch mention suggestions (mock implementation)
        setMentionSuggestions([
          { id: 1, name: 'John Doe', role: 'Auditor' },
          { id: 2, name: 'Jane Smith', role: 'Manager' },
          { id: 3, name: 'Mike Johnson', role: 'Reviewer' }
        ]);
      } else {
        setShowMentions(false);
      }
    }
  };

  // Handle file attachment
  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newAttachments = Array.from(files).slice(0, 5); // Limit to 5 files
      setAttachments(prev => [...prev, ...newAttachments].slice(0, 5));
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Submit comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() && attachments.length === 0) return;

    const commentData = {
      content: newComment,
      is_internal: isInternal,
      parent_id: replyingTo,
      attachments: attachments,
      entity_type: entityType,
      entity_id: entityId
    };

    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/comments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(commentData)
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [...prev, newCommentData]);
        setNewComment('');
        setAttachments([]);
        setReplyingTo(null);
        setIsInternal(false);
        onCommentAdded?.(newCommentData);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Handle reaction
  const handleReaction = async (commentId: number, reaction: 'like' | 'love' | 'dislike') => {
    try {
      // Mock API call
      const response = await fetch(`/api/comments/${commentId}/react/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reaction })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Render comment
  const renderComment = (comment: Comment, depth: number = 0) => {
    const isOwner = comment.author.id === currentUser.id;
    const canReply = depth < maxDepth;

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? 'ml-8 mt-4' : 'mb-6'} ${
          comment.is_internal ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 pl-4' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.author.name}
              </span>
              {comment.author.role && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  {comment.author.role}
                </span>
              )}
              {comment.is_internal && (
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Internal
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(comment.created_at)}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (edited)
                </span>
              )}
            </div>

            {/* Content */}
            <div className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
              {comment.content}
            </div>

            {/* Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {comment.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex-1 truncate"
                    >
                      {attachment.name}
                    </a>
                    <span className="text-xs text-gray-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-sm">
              {/* Reactions */}
              {allowReactions && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReaction(comment.id, 'like')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                      comment.reactions.user_reaction === 'like'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {comment.reactions.like > 0 && comment.reactions.like}
                  </button>
                  
                  <button
                    onClick={() => handleReaction(comment.id, 'love')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                      comment.reactions.user_reaction === 'love'
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Heart className="w-3 h-3" />
                    {comment.reactions.love > 0 && comment.reactions.love}
                  </button>
                </div>
              )}

              {/* Reply */}
              {canReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}

              {/* Edit/Delete for owner */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingComment(comment.id)}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {/* Handle delete */}}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h3>
        </div>
        
        {allowInternal && (
          <button
            onClick={() => setShowInternal(!showInternal)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
              showInternal
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {showInternal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showInternal ? 'Hide Internal' : 'Show Internal'}
          </button>
        )}
      </div>

      {/* Comment Input */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          {/* Current user avatar */}
          <div className="flex-shrink-0">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => {
                  handleInputChange(e.target.value);
                  adjustTextareaHeight(e.target);
                }}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none min-h-[80px]"
                rows={3}
              />

              {/* Mention suggestions */}
              {showMentions && mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                  {mentionSuggestions.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        const mentionText = `@${user.name} `;
                        const currentText = newComment.replace(/@\w*$/, mentionText);
                        setNewComment(currentText);
                        setShowMentions(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                {allowAttachments && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach
                    </button>
                  </>
                )}

                {allowMentions && (
                  <button
                    onClick={() => {
                      setNewComment(prev => prev + '@');
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <AtSign className="w-4 h-4" />
                    Mention
                  </button>
                )}

                {allowInternal && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-gray-600 dark:text-gray-400">Internal only</span>
                  </label>
                )}
              </div>

              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() && attachments.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {replyingTo ? 'Reply' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments
            .filter(comment => showInternal || !comment.is_internal)
            .map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentsSystem; 