import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAddComment, useCalculationComments } from '@/hooks/useCollaboration';
import { Flag, Heart, MessageSquare, Reply, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

interface CommentsSystemProps {
  calculationId: string;
}

interface CommentModel {
  id: string;
  calculation_id: string | null;
  user_id: string | null;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  parent_id?: string | null;
}

interface CommentItemProps {
  comment: CommentModel;
  onReply?: (parentId: string) => void;
  isReply?: boolean;
}

function CommentItem({ comment, onReply: _onReply, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [liked, setLiked] = useState(false);

  const addComment = useAddComment();

  const handleReply = async () => {
    if (!replyContent.trim()) {return;}

    try {
      await addComment.mutateAsync({
        calculationId: comment.calculation_id ?? '',
        content: replyContent,
        parentId: comment.id
      });
      
      setReplyContent('');
      setShowReplyForm(false);
      toast.success('Resposta adicionada!');
  } catch (_error) {
      toast.error('Erro ao adicionar resposta');
    }
  };

  const getUserInitials = (userId: string | null) => {
    if (!userId) {return 'US';}
    return userId.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getUserInitials(comment.user_id)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Usuário {(comment.user_id ?? 'user').slice(-4)}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at || Date.now()), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
            {comment.updated_at !== comment.created_at && (
              <Badge variant="secondary" className="text-xs">
                editado
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 text-xs ${liked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`h-3 w-3 mr-1 ${liked ? 'fill-current' : ''}`} />
              {liked ? '1' : '0'}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Responder
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground"
            >
              <Flag className="h-3 w-3" />
            </Button>
          </div>
          
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Escreva uma resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || addComment.isPending}
                >
                  {addComment.isPending ? 'Enviando...' : 'Responder'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsSystem({ calculationId }: CommentsSystemProps) {
  const [newComment, setNewComment] = useState('');
  
  const { data: comments = [], isLoading } = useCalculationComments(calculationId);
  const addComment = useAddComment();

  const handleAddComment = async () => {
    if (!newComment.trim()) {return;}

    try {
      await addComment.mutateAsync({
        calculationId,
        content: newComment
      });
      
      setNewComment('');
      toast.success('Comentário adicionado!');
  } catch (_error) {
      toast.error('Erro ao adicionar comentário');
    }
  };

  // Organizar comentários em threads
  const organizeComments = (comments: CommentModel[]) => {
    const topLevel = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    
    return topLevel.map(comment => ({
      ...comment,
      replies: replies.filter(r => r.parent_id === comment.id)
    }));
  };

  const organizedComments = organizeComments(comments);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentários ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para novo comentário */}
        <div className="space-y-3">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Use @ para mencionar alguém
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || addComment.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {addComment.isPending ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </div>

        {/* Lista de comentários */}
        <div className="space-y-6">
          {organizedComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Nenhum comentário ainda.</p>
              <p className="text-sm">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            organizedComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <CommentItem comment={comment} />
                
                {/* Respostas */}
                {comment.replies?.map((reply: CommentModel) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}