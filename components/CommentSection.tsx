"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Comment } from "@/types"

interface CommentSectionProps {
  comments: Comment[];
  newComment: string;
  setNewComment: (comment: string) => void;
  commentAuthor: string;
  setCommentAuthor: (author: string) => void;
  onCommentSubmit: () => void;
}

export default function CommentSection({
  comments,
  newComment,
  setNewComment,
  commentAuthor,
  setCommentAuthor,
  onCommentSubmit
}: CommentSectionProps) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="font-medium text-gray-900 mb-3">댓글</h4>
      
      {/* 기존 댓글 목록 */}
      <div className="space-y-2 mb-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </p>
        )}
      </div>

      {/* 새 댓글 작성 */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="이름"
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            className="text-sm w-20 flex-shrink-0"
          />
          <Input
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onCommentSubmit()}
            className="text-sm flex-1"
          />
        </div>
        <Button
          onClick={onCommentSubmit}
          disabled={!commentAuthor.trim() || !newComment.trim()}
          size="sm"
          className="w-full"
        >
          댓글 작성
        </Button>
      </div>
    </div>
  )
} 