
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAddComment, useCalculationComments } from '@/hooks/useCollaboration';
import { CalculationComment } from '@/types/collaboration';
import { MessageCircle, Reply, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentsSectionProps {
  calculationId: string;
}

export default function CommentsSection({ calculationId }: CommentsSectionProps) {
  const { data: comments = [], isLoading } = useCalculationComments(calculationId);
  const addCommentMutation = useAddComment();
  const [newComment, setNewComment] = useState('');
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {return;}

    addCommentMutation.mutate({
      calculationId,
      content: newComment.trim()
    }, {
      onSuccess: () => {
        setNewComment('');
      }
    });
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) {return;}

    addCommentMutation.mutate({
      calculationId,
      content: replyContent.trim(),
      parentId
    }, {
      onSuccess: () => {
        setReplyContent('');
        setReplyToComment(null);
      }
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: CalculationComment; isReply?: boolean }) => (
    <div className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.avatar_url} />
          <AvatarFallback>
            {comment.user?.name?.charAt(0) || comment.user?.email?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              {comment.user?.name || comment.user?.email}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
          
          <p className="text-sm text-gray-700">{comment.content}</p>
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToComment(comment.id)}
              className="text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Responder
            </Button>
          )}
        </div>
      </div>

      {/* Respostas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}

      {/* Formulário de resposta */}
      {replyToComment === comment.id && (
        <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="ml-8 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escreva sua resposta..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyToComment(null);
                setReplyContent('');
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!replyContent.trim() || addCommentMutation.isPending}>
              <Send className="h-3 w-3 mr-1" />
              Responder
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Formulário para novo comentário */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
            <Button type="submit" disabled={!newComment.trim() || addCommentMutation.isPending}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {addCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
            </Button>
        </div>
      </form>

      {/* Lista de comentários */}
      {comments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhum comentário ainda</p>
          <p className="text-sm">Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={{
              ...comment,
              calculationId: comment.calculation_id || '',
              userId: comment.user_id || '',
              createdAt: comment.created_at || '',
              updatedAt: comment.updated_at || ''
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
