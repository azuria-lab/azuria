import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AtSign,
  Clock,
  Edit,
  Eye,
  Filter,
  Flag,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Users
} from 'lucide-react';

interface ReportCollaborationProps {
  reportId: string;
  reportName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  lastSeen: Date;
  isOnline: boolean;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  elementId?: string; // ID do elemento do relatório comentado
  elementType?: 'chart' | 'table' | 'metric' | 'text';
  createdAt: Date;
  updatedAt?: Date;
  isResolved: boolean;
  mentions: string[];
  reactions: {
    userId: string;
    type: 'like' | 'dislike' | 'flag';
  }[];
  replies: Comment[];
}

interface ShareSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowExport: boolean;
  expiresAt?: Date;
  password?: string;
}

export function ReportCollaboration({ reportId, reportName }: ReportCollaborationProps) {
  const [activeUsers] = useState<User[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@company.com',
      avatar: '/api/placeholder/32/32',
      role: 'owner',
      lastSeen: new Date(),
      isOnline: true
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@company.com',
      role: 'editor',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      isOnline: true
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@company.com',
      role: 'viewer',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      isOnline: false
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: 'Os números de vendas no Q4 parecem estar inconsistentes com os dados do dashboard principal. Alguém pode verificar?',
      authorId: '2',
      author: activeUsers[1],
      elementId: 'chart_sales_q4',
      elementType: 'chart',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isResolved: false,
      mentions: ['1'],
      reactions: [
        { userId: '1', type: 'like' },
        { userId: '3', type: 'like' }
      ],
      replies: [
        {
          id: '1_1',
          content: 'Concordo, vou verificar os dados de origem e atualizar.',
          authorId: '1',
          author: activeUsers[0],
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isResolved: false,
          mentions: [],
          reactions: [],
          replies: []
        }
      ]
    },
    {
      id: '2',
      content: 'Seria interessante adicionar uma tabela com o breakdown por região nesta seção.',
      authorId: '3',
      author: activeUsers[2],
      elementId: 'section_regional',
      elementType: 'text',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isResolved: true,
      mentions: [],
      reactions: [
        { userId: '1', type: 'like' }
      ],
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'unresolved' | 'mentions'>('all');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    allowComments: true,
    allowExport: false
  });

  const roles = [
    { value: 'owner', label: 'Proprietário', description: 'Controle total' },
    { value: 'editor', label: 'Editor', description: 'Pode editar relatório' },
    { value: 'commenter', label: 'Comentarista', description: 'Pode apenas comentar' },
    { value: 'viewer', label: 'Visualizador', description: 'Apenas visualização' }
  ];

  const addComment = () => {
    if (!newComment.trim()) {return;}

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      authorId: '1', // Current user
      author: activeUsers[0],
      createdAt: new Date(),
      isResolved: false,
      mentions: extractMentions(newComment),
      reactions: [],
      replies: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@\w+/g);
    return mentions ? mentions.map(m => m.substring(1)) : [];
  };

  const toggleReaction = (commentId: string, type: 'like' | 'dislike' | 'flag') => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions.find(r => r.userId === '1');
        let newReactions = [...comment.reactions];
        
        if (existingReaction) {
          if (existingReaction.type === type) {
            // Remove reaction
            newReactions = newReactions.filter(r => r.userId !== '1');
          } else {
            // Update reaction
            newReactions = newReactions.map(r => 
              r.userId === '1' ? { ...r, type } : r
            );
          }
        } else {
          // Add new reaction
          newReactions.push({ userId: '1', type });
        }
        
        return { ...comment, reactions: newReactions };
      }
      return comment;
    }));
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, isResolved: !comment.isResolved }
        : comment
    ));
  };

  const filteredComments = comments.filter(comment => {
    if (filterBy === 'unresolved') {return !comment.isResolved;}
    if (filterBy === 'mentions') {return comment.mentions.includes('current_user');}
    return true;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {return 'Agora há pouco';}
    if (diffHours < 24) {return `${diffHours}h atrás`;}
    return `${diffDays}d atrás`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'commenter': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Colaboração</h2>
          <p className="text-gray-600">Trabalhe em equipe no relatório "{reportName}"</p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Colaboradores</DialogTitle>
                <DialogDescription>
                  Adicione pessoas para colaborar neste relatório
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input placeholder="usuario@empresa.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Função</label>
                  <Select defaultValue="viewer">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => r.value !== 'owner').map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Mensagem (opcional)</label>
                  <Textarea 
                    placeholder="Adicione uma mensagem ao convite..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancelar
                </Button>
                <Button>Enviar Convite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de Compartilhamento</DialogTitle>
                <DialogDescription>
                  Configure como este relatório pode ser compartilhado
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Link público</div>
                    <div className="text-sm text-gray-600">Qualquer pessoa com o link pode visualizar</div>
                  </div>
                  <Button variant="outline" size="sm">
                    {shareSettings.isPublic ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
                
                {shareSettings.isPublic && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Permitir comentários</span>
                      <Button variant="outline" size="sm">
                        {shareSettings.allowComments ? 'Sim' : 'Não'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Permitir exportação</span>
                      <Button variant="outline" size="sm">
                        {shareSettings.allowExport ? 'Sim' : 'Não'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                  Fechar
                </Button>
                <Button>Salvar Configurações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usuários Ativos */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Colaboradores ({activeUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{formatTimeAgo(user.lastSeen)}</div>
                    </div>
                  </div>
                  <Badge className={getRoleColor(user.role)} variant="outline">
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Comentários */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentários ({comments.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="unresolved">Não resolvidos</SelectItem>
                      <SelectItem value="mentions">Menções</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Novo comentário */}
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <Textarea
                  placeholder="Adicione um comentário... Use @nome para mencionar alguém"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setNewComment('')}>
                      Cancelar
                    </Button>
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Comentar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de comentários */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredComments.map(comment => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 border rounded-lg ${
                        comment.isResolved ? 'bg-green-50 border-green-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback>
                            {comment.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            {comment.elementType && (
                              <Badge variant="outline" className="text-xs">
                                {comment.elementType}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                            {comment.isResolved && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Resolvido
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReaction(comment.id, 'like')}
                                className={`h-7 px-2 ${
                                  comment.reactions.find(r => r.userId === '1' && r.type === 'like')
                                    ? 'bg-blue-100 text-blue-600'
                                    : ''
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {comment.reactions.filter(r => r.type === 'like').length}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReaction(comment.id, 'dislike')}
                                className="h-7 px-2"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReaction(comment.id, 'flag')}
                                className="h-7 px-2"
                              >
                                <Flag className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resolveComment(comment.id)}
                                className="h-7 text-xs"
                              >
                                {comment.isResolved ? 'Reabrir' : 'Resolver'}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="flex items-start gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={reply.author.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {reply.author.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-xs">{reply.author.name}</span>
                                      <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-gray-700">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredComments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum comentário encontrado</p>
                  {filterBy !== 'all' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setFilterBy('all')}
                    >
                      Ver todos os comentários
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}