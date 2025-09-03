
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calculator, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward?: string;
  category: 'calculator' | 'pro' | 'engagement' | 'milestone';
}

interface GamificationSystemProps {
  compact?: boolean;
}

export default function GamificationSystem({ compact = false }: GamificationSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    // Simular conquistas baseadas no uso
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'Primeiro Cálculo',
        description: 'Complete seu primeiro cálculo de preço',
        icon: Calculator,
        progress: 1,
        maxProgress: 1,
        completed: true,
        reward: '+10 pontos',
        category: 'calculator'
      },
      {
        id: '2',
        title: 'Calculador Expert',
        description: 'Faça 50 cálculos',
        icon: Target,
        progress: 27,
        maxProgress: 50,
        completed: false,
        reward: '+50 pontos',
        category: 'calculator'
      },
      {
        id: '3',
        title: 'Usuário PRO',
        description: 'Upgrade para o plano PRO',
        icon: Star,
        progress: 0,
        maxProgress: 1,
        completed: false,
        reward: '+100 pontos + Badge Especial',
        category: 'pro'
      },
      {
        id: '4',
        title: 'Especialista IA',
        description: 'Use 10 vezes a calculadora com IA',
        icon: Zap,
        progress: 3,
        maxProgress: 10,
        completed: false,
        reward: '+30 pontos',
        category: 'calculator'
      },
      {
        id: '5',
        title: 'Analista de Sucesso',
        description: 'Acesse o Analytics 5 vezes',
        icon: TrendingUp,
        progress: 2,
        maxProgress: 5,
        completed: false,
        reward: '+25 pontos',
        category: 'engagement'
      }
    ];

    setAchievements(mockAchievements);
    
    // Calcular pontos totais e nível
    const completedAchievements = mockAchievements.filter(a => a.completed);
    const points = completedAchievements.length * 25; // 25 pontos por conquista
    setTotalPoints(points);
    setLevel(Math.floor(points / 100) + 1);
  }, []);

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'calculator':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pro':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'engagement':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'milestone':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (compact) {
    const recentAchievements = achievements.filter(a => a.completed).slice(0, 3);
    const inProgress = achievements.filter(a => !a.completed && a.progress > 0).slice(0, 2);
    
    return (
      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Nível {level}
            </CardTitle>
            <Badge className="bg-yellow-500 text-white">
              {totalPoints} pontos
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Conquistas recentes */}
          {recentAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Conquistas Recentes</h4>
              <div className="space-y-2">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-2">
                    <achievement.icon className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">{achievement.title}</span>
                    <Trophy className="h-3 w-3 text-yellow-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progresso atual */}
          {inProgress.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Em Progresso</h4>
              <div className="space-y-2">
                {inProgress.map((achievement) => (
                  <div key={achievement.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{achievement.title}</span>
                      <span className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700">Nível {level}</div>
            <div className="text-sm text-yellow-600">{totalPoints} pontos</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">
              {achievements.filter(a => a.completed).length}
            </div>
            <div className="text-sm text-green-600">Conquistas</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">
              {Math.round(
                (achievements.filter(a => a.completed).length / achievements.length) * 100
              )}%
            </div>
            <div className="text-sm text-blue-600">Progresso</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de conquistas */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Conquistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 ${
                  achievement.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <achievement.icon className={`h-5 w-5 ${
                      achievement.completed ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.completed && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    
                    {!achievement.completed && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progresso</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    {achievement.reward && (
                      <Badge 
                        variant="outline" 
                        className={`mt-2 text-xs ${getCategoryColor(achievement.category)}`}
                      >
                        {achievement.reward}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificação de nova conquista */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6" />
                  <div>
                    <h4 className="font-bold">Nova Conquista!</h4>
                    <p className="text-sm opacity-90">{newAchievement.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
