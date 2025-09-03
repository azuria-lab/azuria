
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Video
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export default function TrainingCertification() {
  const [selectedCourse, setSelectedCourse] = useState("foundation");

  const courses = [
    {
      id: "foundation",
      name: "Fundamentos de Precificação",
      level: "Iniciante",
      duration: "8 horas",
      price: "R$ 297",
      description: "Base sólida para entender e aplicar estratégias de precificação",
      modules: 6,
      certificate: "Certificado Digital",
      color: "bg-green-100 text-green-800",
      features: [
        "6 módulos interativos",
        "Casos práticos reais",
        "Templates e planilhas",
        "Suporte durante o curso",
        "Certificado reconhecido",
        "Acesso vitalício"
      ]
    },
    {
      id: "advanced",
      name: "Precificação Avançada",
      level: "Intermediário",
      duration: "12 horas",
      price: "R$ 497",
      description: "Estratégias avançadas para maximizar lucros e posicionamento de mercado",
      modules: 8,
      certificate: "Certificado Profissional",
      color: "bg-blue-100 text-blue-800",
      features: [
        "8 módulos especializados",
        "Análise de concorrência",
        "Precificação psicológica",
        "Casos de empresas grandes",
        "Mentoria em grupo",
        "Certificado profissional"
      ]
    },
    {
      id: "expert",
      name: "Especialista em Precificação",
      level: "Avançado",
      duration: "20 horas",
      price: "R$ 997",
      description: "Formação completa para se tornar um especialista em precificação",
      modules: 12,
      certificate: "Certificação Especialista",
      color: "bg-purple-100 text-purple-800",
      features: [
        "12 módulos completos",
        "Projeto final prático",
        "Mentoria individual",
        "Acesso ao grupo VIP",
        "Certificação especialista",
        "Oportunidades de trabalho"
      ]
    }
  ];

  const learningPath = [
    {
      phase: "Fundamentos",
      description: "Aprenda os conceitos básicos",
      duration: "2-3 semanas",
      topics: ["Custos", "Margem", "Concorrência", "Posicionamento"]
    },
    {
      phase: "Aplicação",
      description: "Pratique com casos reais",
      duration: "3-4 semanas",
      topics: ["Análise de mercado", "Estratégias avançadas", "Precificação dinâmica"]
    },
    {
      phase: "Especialização",
      description: "Domine técnicas avançadas",
      duration: "4-6 semanas",
      topics: ["Psicologia de preços", "Modelos complexos", "Consultoria"]
    },
    {
      phase: "Certificação",
      description: "Comprove sua expertise",
      duration: "1-2 semanas",
      topics: ["Projeto final", "Avaliação", "Certificado"]
    }
  ];

  const instructors = [
    {
      name: "Dr. Carlos Mendes",
      title: "PhD em Economia",
      experience: "15+ anos",
      specialization: "Estratégias de Precificação B2B",
      image: "/placeholder.svg",
      rating: 4.9
    },
    {
      name: "Ana Paula Santos",
      title: "MBA em Marketing",
      experience: "12+ anos",
      specialization: "Precificação para E-commerce",
      image: "/placeholder.svg",
      rating: 4.8
    },
    {
      name: "Roberto Silva",
      title: "Consultor Senior",
      experience: "20+ anos",
      specialization: "Grandes Corporações",
      image: "/placeholder.svg",
      rating: 5.0
    }
  ];

  const studentStats = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Alunos Formados",
      value: "2.847",
      growth: "+23% este mês"
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Taxa de Conclusão",
      value: "94%",
      growth: "Acima da média"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Aumento Médio de Renda",
      value: "67%",
      growth: "Após certificação"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Satisfação",
      value: "4.9/5",
      growth: "1.247 avaliações"
    }
  ];

  const testimonials = [
    {
      name: "Maria Fernanda",
      course: "Especialista em Precificação",
      text: "O curso mudou completamente minha visão sobre precificação. Hoje sou consultora e minha renda triplicou.",
      result: "Renda +300%",
      image: "/placeholder.svg"
    },
    {
      name: "João Carlos",
      course: "Precificação Avançada",
      text: "Aplicei as técnicas no meu restaurante e a margem de lucro aumentou 45% em 3 meses.",
      result: "Margem +45%",
      image: "/placeholder.svg"
    }
  ];

  const handleEnrollCourse = (courseId: string) => {
    toast.success(`Matriculando no curso: ${courseId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Treinamento e Certificação</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transforme sua carreira com nossos cursos especializados em precificação. 
          Certificação reconhecida pelo mercado e metodologia comprovada.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.growth}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="learning-path">Trilha</TabsTrigger>
          <TabsTrigger value="instructors">Instrutores</TabsTrigger>
          <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={course.color}>{course.level}</Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{course.price}</div>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{course.modules} módulos</span>
                        <span>{course.duration}</span>
                      </div>
                      
                      <ul className="space-y-2">
                        {course.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{course.certificate}</span>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => handleEnrollCourse(course.id)}
                        >
                          Matricular-se
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Learning Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Por que Escolher Nossa Certificação?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Metodologia Comprovada</h4>
                  <p className="text-gray-600 text-sm">
                    Baseada em casos reais e resultados mensuráveis de mais de 1000 empresas.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Reconhecimento de Mercado</h4>
                  <p className="text-gray-600 text-sm">
                    Certificação reconhecida por empresas líderes e consultores especializados.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Resultados Práticos</h4>
                  <p className="text-gray-600 text-sm">
                    Aumento médio de 67% na renda dos nossos alunos certificados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Aprendizado</CardTitle>
              <CardDescription>
                Caminho estruturado para se tornar um especialista em precificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {learningPath.map((phase, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{phase.phase}</h4>
                        <Badge variant="outline">{phase.duration}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{phase.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.topics.map((topic, topicIndex) => (
                          <Badge key={topicIndex} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso Atual</CardTitle>
              <CardDescription>Acompanhe sua evolução na trilha de certificação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Fundamentos de Precificação</span>
                    <span>100% Concluído</span>
                  </div>
                  <Progress value={100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Precificação Avançada</span>
                    <span>65% Concluído</span>
                  </div>
                  <Progress value={65} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Especialista em Precificação</span>
                    <span>Não Iniciado</span>
                  </div>
                  <Progress value={0} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {instructors.map((instructor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6 text-center">
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h4 className="font-semibold text-lg mb-1">{instructor.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{instructor.title}</p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{instructor.rating}</span>
                    </div>
                    <Badge variant="outline" className="mb-3">
                      {instructor.experience} experiência
                    </Badge>
                    <p className="text-sm text-gray-600">{instructor.specialization}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metodologia de Ensino</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Video className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">Vídeo Aulas Interativas</h4>
                    <p className="text-gray-600 text-sm">
                      Conteúdo em alta qualidade com exemplos práticos e exercícios.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">Material Complementar</h4>
                    <p className="text-gray-600 text-sm">
                      E-books, planilhas e templates para aplicação imediata.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">Comunidade Ativa</h4>
                    <p className="text-gray-600 text-sm">
                      Fórum exclusivo para networking e troca de experiências.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">Projetos Práticos</h4>
                    <p className="text-gray-600 text-sm">
                      Desenvolva um portfólio real durante a certificação.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.course}</p>
                      </div>
                      <Badge className="ml-auto bg-green-100 text-green-800">
                        {testimonial.result}
                      </Badge>
                    </div>
                    <blockquote className="text-gray-600">
                      "{testimonial.text}"
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Oportunidades de Carreira</CardTitle>
              <CardDescription>
                Nossos alunos certificados têm acesso a oportunidades exclusivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Posições Disponíveis</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Consultor de Precificação Sênior
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Analista de Pricing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Especialista em Revenue Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Freelancer Especializado
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Faixas Salariais</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Júnior:</span>
                      <span className="font-medium">R$ 4.500 - R$ 7.000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Pleno:</span>
                      <span className="font-medium">R$ 7.000 - R$ 12.000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sênior:</span>
                      <span className="font-medium">R$ 12.000 - R$ 20.000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Freelancer:</span>
                      <span className="font-medium">R$ 150 - R$ 500/hora</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
