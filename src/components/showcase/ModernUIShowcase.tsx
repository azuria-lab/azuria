import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, Layers, Palette, Sparkles, TrendingUp, Zap } from 'lucide-react';

/**
 * Showcase component demonstrating the modern design system
 */
export const ModernUIShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4 fade-in-up">
          <Badge className="bg-gradient-primary text-white px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Novo Design System
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Azuria+ Modernizado
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Interface moderna com gradientes, micro-animações e efeitos glass para uma experiência premium
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid-responsive stagger-children">
          
          {/* Glass Card Example */}
          <Card className="glass-card hover-lift border-0 overflow-hidden group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Glass Effect</CardTitle>
                  <CardDescription>Efeito glassmorphism moderno</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Cards com backdrop blur e transparência para um visual contemporâneo.
              </p>
              <div className="flex gap-2">
                <div className="status-indicator status-online"></div>
                <span className="text-xs text-muted-foreground">Ativo</span>
              </div>
            </CardContent>
          </Card>

          {/* Gradient Card */}
          <Card className="bg-gradient-primary text-white hover-glow border-0 overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Gradientes</CardTitle>
                  <CardDescription className="text-white/80">
                    Cores vibrantes e modernas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/90 mb-4">
                Sistema de cores expandido com gradientes e variações de glow.
              </p>
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-accent rounded-full shadow-accent"></div>
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <div className="w-4 h-4 bg-warning rounded-full"></div>
                <div className="w-4 h-4 bg-info rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          {/* Animation Card */}
          <Card className="hover-scale shadow-elegant border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Zap className="w-5 h-5 text-accent animate-pulse-glow" />
                </div>
                <div>
                  <CardTitle className="text-lg">Micro-animações</CardTitle>
                  <CardDescription>Transições fluidas e naturais</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Animações suaves que melhoram a experiência do usuário.
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="btn-modern">
                  Hover me
                </Button>
                <Button size="sm" variant="outline" className="hover-lift">
                  Float effect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid System Card */}
          <Card className="shadow-soft hover-glow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Grid className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">Grid Responsivo</CardTitle>
                  <CardDescription>Layout flexível e adaptativo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sistema de grid avançado com auto-fit e auto-fill.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-gradient-subtle rounded"></div>
                <div className="h-8 bg-gradient-accent rounded"></div>
                <div className="h-8 bg-gradient-success rounded"></div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="bg-gradient-accent text-white shadow-accent border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 animate-float" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Performance</CardTitle>
                  <CardDescription className="text-white/80">
                    Otimizado para velocidade
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/90 mb-4">
                CSS otimizado com variáveis nativas e animações GPU.
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-white/20 rounded-full flex-1">
                  <div className="h-2 bg-white rounded-full w-[95%]"></div>
                </div>
                <span className="text-xs text-white/80">95%</span>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Elements Card */}
          <Card className="overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Elementos Interativos</CardTitle>
              <CardDescription>Componentes com feedback visual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button className="bg-gradient-primary hover:shadow-glow">
                  Primary
                </Button>
                <Button variant="outline" className="hover-scale">
                  Outline
                </Button>
                <Button className="bg-gradient-accent">
                  Accent
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Badge className="bg-success text-success-foreground">Success</Badge>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
                <Badge className="bg-info text-info-foreground">Info</Badge>
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full w-3/4 animate-shimmer"></div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-accent rounded-full w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center fade-in-up">
          <p className="text-muted-foreground">
            Design system modernizado com foco em performance e acessibilidade
          </p>
        </div>
      </div>
    </div>
  );
};