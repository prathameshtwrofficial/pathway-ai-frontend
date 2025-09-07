import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  ClipboardList, 
  Target, 
  TrendingUp, 
  Route, 
  FileText, 
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardOverview() {
  const completedSteps = 3;
  const totalSteps = 7;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const quickActions = [
    {
      title: "Upload Resume",
      description: "Start by uploading your resume for AI analysis",
      icon: Upload,
      link: "/dashboard/upload-resume",
      completed: true,
    },
    {
      title: "Take Career Quiz",
      description: "Discover your interests and personality traits",
      icon: ClipboardList,
      link: "/dashboard/career-quiz",
      completed: true,
    },
    {
      title: "View Recommendations",
      description: "See AI-powered career suggestions",
      icon: Target,
      link: "/dashboard/recommendations",
      completed: true,
    },
    {
      title: "Analyze Skill Gaps",
      description: "Identify areas for improvement",
      icon: TrendingUp,
      link: "/dashboard/skill-analysis",
      completed: false,
    },
    {
      title: "Create Roadmap",
      description: "Build your personalized learning path",
      icon: Route,
      link: "/dashboard/roadmap",
      completed: false,
    },
    {
      title: "Resume Analysis",
      description: "Optimize for ATS systems",
      icon: FileText,
      link: "/dashboard/resume-analyzer",
      completed: false,
    },
    {
      title: "Interview Practice",
      description: "Chat with AI interview coach",
      icon: MessageCircle,
      link: "/dashboard/interview-coach",
      completed: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Your Career Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and continue building your career with AI-powered guidance.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Your Progress</span>
          </CardTitle>
          <CardDescription>
            You've completed {completedSteps} out of {totalSteps} key steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-smooth group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      action.completed 
                        ? "bg-accent/10" 
                        : "bg-primary/10"
                    }`}>
                      {action.completed ? (
                        <CheckCircle className="h-6 w-6 text-accent" />
                      ) : (
                        <action.icon className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                  {action.completed && (
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  asChild 
                  variant={action.completed ? "outline" : "default"}
                  className="w-full group-hover:shadow-glow transition-smooth"
                >
                  <Link to={action.link}>
                    {action.completed ? "Review" : "Start"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium">Career quiz completed</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium">Resume uploaded successfully</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Career recommendations generated</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}