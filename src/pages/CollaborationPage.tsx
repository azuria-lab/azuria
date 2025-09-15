import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShareCalculationDialog from '@/components/collaboration/ShareCalculationDialog';
import CommentsSystem from '@/components/collaboration/CommentsSystem';
import ApprovalSystem from '@/components/collaboration/ApprovalSystem';
import CollaborationNotifications from '@/components/collaboration/CollaborationNotifications';
import { useSharedCalculations } from '@/hooks/useCollaboration';
import { 
  Bell, 
  Calculator, 
  Edit3, 
  Eye,
  MessageSquare,
  Share2,
  UserCheck,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CollaborationPage() {
  const { data: sharedCalculations = [], isLoading } = useSharedCalculations();

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'edit': return <Edit3 className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (level: string) => {
    switch (level) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'comment': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-8 px-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sistema de Colaboração</h1>
          <p className="text-muted-foreground">
            Compartilhe, comente e colabore em cálculos com sua equipe
          </p>
        </motion.div>

        <Tabs defaultValue="shared" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhados
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentários
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Aprovações
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Aba de Cálculos Compartilhados */}
          <TabsContent value="shared" className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Cálculos Compartilhados
                    </CardTitle>
                    <ShareCalculationDialog 
                      calculationId="demo-calc-1"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : sharedCalculations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-2">Nenhum cálculo compartilhado</h3>
                      <p className="text-sm mb-4">
                        Comece compartilhando um cálculo com sua equipe
                      </p>
                      <ShareCalculationDialog 
                        calculationId="demo-calc-1"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Mock data para demonstração */}
                      {[
                        {
                          id: '1',
                          calculation: {
                            id: 'calc-1',
                            cost: '150.00',
                            margin: 25,
                            result: { salePrice: 200.00, profit: 50.00 },
                            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                          },
                          shared_with: 'joao@empresa.com',
                          permission_level: 'comment',
                          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                        },
                        {
                          id: '2',
                          calculation: {
                            id: 'calc-2', 
                            cost: '75.50',
                            margin: 30,
                            result: { salePrice: 107.86, profit: 32.36 },
                            date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
                          },
                          shared_with: 'maria@empresa.com',
                          permission_level: 'edit',
                          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
                        }
                      ].map((share) => (
                        <div key={share.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Calculator className="h-5 w-5 text-brand-600" />
                              <div>
                                <h4 className="font-medium">
                                  Cálculo - Custo R$ {share.calculation.cost}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Margem: {share.calculation.margin}% | 
                                  Preço: R$ {share.calculation.result.salePrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <Badge className={getPermissionColor(share.permission_level)}>
                              {getPermissionIcon(share.permission_level)}
                              <span className="ml-1 capitalize">{share.permission_level}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                              Compartilhado com: {share.shared_with}
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(share.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Cálculo
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Comentários
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Aba de Comentários */}
          <TabsContent value="comments" className="space-y-6">
            <motion.div variants={itemVariants}>
              <CommentsSystem calculationId="demo-calc-1" />
            </motion.div>
          </TabsContent>

          {/* Aba de Aprovações */}
          <TabsContent value="approvals" className="space-y-6">
            <motion.div variants={itemVariants}>
              <ApprovalSystem 
                calculationId="demo-calc-1" 
                currentUserId="current-user-id"
              />
            </motion.div>
          </TabsContent>

          {/* Aba de Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div variants={itemVariants}>
              <CollaborationNotifications />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
}