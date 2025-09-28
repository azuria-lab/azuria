import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Activity,
  AlertTriangle,
  Bell,
  Edit3,
  Eye,
  MessageCircle,
  Mouse,
  Save,
  Share2,
  Users,
  Video,
  Wifi,
  WifiOff
} from 'lucide-react';

// Interfaces para Colaboração Real-time
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
  role: 'owner' | 'editor' | 'viewer';
}

interface Cursor {
  userId: string;
  x: number;
  y: number;
  timestamp: number;
}

interface CollaborativeEdit {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'insert' | 'delete' | 'update';
  position: number;
  content: string;
  field: string;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  position?: { x: number; y: number };
  resolved: boolean;
  replies: Comment[];
}

interface CollaborationState {
  users: User[];
  cursors: Cursor[];
  edits: CollaborativeEdit[];
  comments: Comment[];
  document: {
    id: string;
    title: string;
    content: string;
    lastModified: Date;
    version: number;
  };
  conflictResolution: {
    hasConflicts: boolean;
    conflicts: Array<{
      id: string;
      users: string[];
      position: number;
      versions: string[];
    }>;
  };
}

// Hook para Colaboração Real-time
const useRealTimeCollaboration = (documentId: string) => {
  const [state, setState] = useState<CollaborationState>({
    users: [],
    cursors: [],
    edits: [],
    comments: [],
    document: {
      id: documentId,
      title: 'Untitled Document',
      content: '',
      lastModified: new Date(),
      version: 1
    },
    conflictResolution: {
      hasConflicts: false,
      conflicts: []
    }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  // Gerar usuários mock
  const generateMockUsers = useCallback((): User[] => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    
    return [
      {
        id: 'user-1',
        name: 'Ana Silva',
        email: 'ana@azuria.com',
        color: colors[0],
        isOnline: true,
        lastSeen: new Date(),
        role: 'owner'
      },
      {
        id: 'user-2', 
        name: 'Carlos Santos',
        email: 'carlos@azuria.com',
        color: colors[1],
        isOnline: true,
        lastSeen: new Date(Date.now() - 60000),
        role: 'editor'
      },
      {
        id: 'user-3',
        name: 'Maria Costa',
        email: 'maria@azuria.com', 
        color: colors[2],
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000),
        role: 'editor'
      },
      {
        id: 'user-4',
        name: 'João Pereira',
        email: 'joao@azuria.com',
        color: colors[3],
        isOnline: true,
        lastSeen: new Date(),
        role: 'viewer'
      }
    ];
  }, []);

  // Simular conexão WebSocket
  const initializeConnection = useCallback(() => {
    setIsConnected(true);
    const mockUsers = generateMockUsers();
    setCurrentUser(mockUsers[0]); // Ana Silva como usuário atual
    
    setState(prev => ({
      ...prev,
      users: mockUsers,
      document: {
        ...prev.document,
        title: 'Projeto Azuria - Dashboard Analytics',
        content: 'Este é um documento colaborativo onde a equipe pode trabalhar simultaneamente no desenvolvimento do dashboard analytics do Azuria.',
        lastModified: new Date(),
        version: 1
      }
    }));

    // Simular cursors de outros usuários
    const mockCursors = mockUsers.slice(1, 3).map(user => ({
      userId: user.id,
      x: Math.random() * 800,
      y: Math.random() * 600,
      timestamp: Date.now()
    }));

    setState(prev => ({ ...prev, cursors: mockCursors }));

    // Simular atividade colaborativa
    setTimeout(() => {
      addMockActivity();
    }, 2000);
  }, [generateMockUsers]);

  // Adicionar atividade mock
  const addMockActivity = useCallback(() => {
    const activities = [
      { type: 'edit', user: 'user-2', content: 'Adicionou métricas de performance' },
      { type: 'comment', user: 'user-3', content: 'Ótima implementação!' },
      { type: 'edit', user: 'user-4', content: 'Corrigiu bug no dashboard' }
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    if (activity.type === 'edit') {
      const newEdit: CollaborativeEdit = {
        id: `edit-${Date.now()}`,
        userId: activity.user,
        timestamp: new Date(),
        type: 'update',
        position: Math.floor(Math.random() * 100),
        content: activity.content,
        field: 'document-content'
      };

      setState(prev => ({
        ...prev,
        edits: [...prev.edits, newEdit].slice(-10), // Manter apenas os 10 últimos
        document: {
          ...prev.document,
          version: prev.document.version + 1,
          lastModified: new Date()
        }
      }));
    }
  }, []);

  // Simular movimento de cursors
  useEffect(() => {
    if (!isConnected) {return;}

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        cursors: prev.cursors.map(cursor => ({
          ...cursor,
          x: Math.max(0, Math.min(800, cursor.x + (Math.random() - 0.5) * 50)),
          y: Math.max(0, Math.min(600, cursor.y + (Math.random() - 0.5) * 50)),
          timestamp: Date.now()
        }))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Conectar automaticamente
  useEffect(() => {
    const timeout = setTimeout(() => {
      initializeConnection();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [initializeConnection]);

  // Simular atividade adicional
  useEffect(() => {
    if (!isConnected) {return;}

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addMockActivity();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, addMockActivity]);

  // Métodos de colaboração
  const sendEdit = useCallback((edit: Omit<CollaborativeEdit, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) {return;}

    const newEdit: CollaborativeEdit = {
      ...edit,
      id: `edit-${Date.now()}`,
      userId: currentUser.id,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      edits: [...prev.edits, newEdit],
      document: {
        ...prev.document,
        version: prev.document.version + 1,
        lastModified: new Date()
      }
    }));
  }, [currentUser]);

  const addComment = useCallback((content: string, position?: { x: number; y: number }) => {
    if (!currentUser) {return;}

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: new Date(),
      position,
      resolved: false,
      replies: []
    };

    setState(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
  }, [currentUser]);

  const resolveComment = useCallback((commentId: string) => {
    setState(prev => ({
      ...prev,
      comments: prev.comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: true }
          : comment
      )
    }));
  }, []);

  return {
    ...state,
    isConnected,
    currentUser,
    sendEdit,
    addComment,
    resolveComment,
    reconnect: initializeConnection
  };
};

// Componente de Cursor de usuário
const UserCursor: React.FC<{ cursor: Cursor; user: User }> = ({ cursor, user }) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        x: cursor.x,
        y: cursor.y
      }}
      transition={{ 
        type: "spring",
        damping: 20,
        stiffness: 200
      }}
    >
      <div className="relative">
        <Mouse 
          className="h-4 w-4 transform -rotate-12" 
          style={{ color: user.color }}
        />
        <div 
          className="absolute top-4 left-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
          style={{ backgroundColor: user.color }}
        >
          {user.name}
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Comentário
const CommentBubble: React.FC<{ 
  comment: Comment; 
  user: User; 
  onResolve: (id: string) => void;
}> = ({ comment, user, onResolve }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-64 z-40"
      style={{
        left: comment.position?.x || 0,
        top: comment.position?.y || 0
      }}
    >
      <div className="flex items-start space-x-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.avatar} />
          <AvatarFallback style={{ backgroundColor: user.color }}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">
              {comment.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>
          {!comment.resolved && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-xs mt-1"
              onClick={() => onResolve(comment.id)}
            >
              Resolve
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Lista de Usuários Online
const OnlineUsersList: React.FC<{ users: User[] }> = ({ users }) => {
  const onlineUsers = users.filter(user => user.isOnline);
  
  return (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4" />
      <div className="flex -space-x-2">
        {onlineUsers.map((user) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs">Online</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <Badge variant="secondary" className="ml-2">
        {onlineUsers.length} online
      </Badge>
    </div>
  );
};

// Componente de Feed de Atividade
const ActivityFeed: React.FC<{ edits: CollaborativeEdit[]; users: User[] }> = ({ edits, users }) => {
  const getUserById = (id: string) => users.find(user => user.id === id);

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Recent Activity</h4>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        <AnimatePresence>
          {edits.slice(-5).reverse().map((edit) => {
            const user = getUserById(edit.userId);
            if (!user) {return null;}

            return (
              <motion.div
                key={edit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-2 text-sm p-2 rounded bg-gray-50"
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground"> {edit.content}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {edit.timestamp.toLocaleTimeString()}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Componente Principal de Colaboração Real-time
export const RealTimeCollaboration: React.FC = () => {
  const collaboration = useRealTimeCollaboration('doc-1');
  const [documentContent, setDocumentContent] = useState('');
  const [showComments, setShowComments] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sincronizar conteúdo do documento
  useEffect(() => {
    setDocumentContent(collaboration.document.content);
  }, [collaboration.document.content]);

  // Handlers
  const handleContentChange = (value: string) => {
    setDocumentContent(value);
    
    // Simular envio de edição
    collaboration.sendEdit({
      type: 'update',
      position: 0,
      content: 'Updated document content',
      field: 'document-content'
    });
  };

  const handleAddComment = () => {
    const content = prompt('Enter your comment:');
    if (content) {
      collaboration.addComment(content, {
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 100
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Real-Time Collaboration</h1>
          <p className="text-muted-foreground">
            Collaborative editing with live cursors and instant sync
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {collaboration.isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <Badge variant={collaboration.isConnected ? 'default' : 'destructive'}>
              {collaboration.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {/* Online Users */}
          <OnlineUsersList users={collaboration.users} />
        </div>
      </div>

      {/* Main Collaboration Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5" />
                    <span>{collaboration.document.title}</span>
                  </CardTitle>
                  <CardDescription>
                    Version {collaboration.document.version} • Last modified {collaboration.document.lastModified.toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={handleAddComment}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {/* Editor Area */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={documentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-96 resize-none"
                  placeholder="Start typing your document..."
                />
                
                {/* Live Cursors */}
                {collaboration.cursors.map((cursor) => {
                  const user = collaboration.users.find(u => u.id === cursor.userId);
                  if (!user) {return null;}
                  
                  return (
                    <UserCursor
                      key={cursor.userId}
                      cursor={cursor}
                      user={user}
                    />
                  );
                })}

                {/* Comments */}
                {showComments && collaboration.comments.map((comment) => {
                  const user = collaboration.users.find(u => u.id === comment.userId);
                  if (!user || comment.resolved) {return null;}
                  
                  return (
                    <CommentBubble
                      key={comment.id}
                      comment={comment}
                      user={user}
                      onResolve={collaboration.resolveComment}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed 
                edits={collaboration.edits} 
                users={collaboration.users} 
              />
            </CardContent>
          </Card>

          {/* Collaboration Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Collaboration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Comments</span>
                <Button
                  size="sm"
                  variant={showComments ? "default" : "outline"}
                  onClick={() => setShowComments(!showComments)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Live Notifications</span>
                <Badge variant="secondary">
                  <Bell className="h-3 w-3 mr-1" />
                  ON
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Video Call</span>
                <Button size="sm" variant="outline">
                  <Video className="h-3 w-3" />
                </Button>
              </div>

              {collaboration.conflictResolution.hasConflicts && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Conflicts Detected</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {collaboration.conflictResolution.conflicts.length} conflicts need resolution
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Resolve Conflicts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {collaboration.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback style={{ backgroundColor: user.color }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.isOnline ? 'default' : 'secondary'}>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealTimeCollaboration;