import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen, 
  ExternalLink,
  Target,
  Clock
} from "lucide-react";

const skillCategories = [
  {
    category: "Technical Skills",
    skills: [
      { name: "React.js", current: 85, required: 90, status: "good" },
      { name: "Node.js", current: 75, required: 85, status: "needs-improvement" },
      { name: "TypeScript", current: 60, required: 85, status: "critical" },
      { name: "AWS", current: 40, required: 80, status: "critical" },
      { name: "Docker", current: 30, required: 75, status: "critical" }
    ]
  },
  {
    category: "Soft Skills",
    skills: [
      { name: "Leadership", current: 70, required: 80, status: "needs-improvement" },
      { name: "Communication", current: 85, required: 85, status: "good" },
      { name: "Project Management", current: 60, required: 75, status: "needs-improvement" },
      { name: "Problem Solving", current: 90, required: 85, status: "excellent" },
      { name: "Team Collaboration", current: 80, required: 80, status: "good" }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent": return "text-accent";
    case "good": return "text-primary";
    case "needs-improvement": return "text-warning";
    case "critical": return "text-destructive";
    default: return "text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "excellent": 
    case "good": 
      return CheckCircle;
    case "needs-improvement": 
    case "critical": 
      return AlertTriangle;
    default: 
      return Target;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "excellent": return { variant: "default" as const, text: "Excellent", className: "bg-accent/10 text-accent border-accent/20" };
    case "good": return { variant: "default" as const, text: "Good", className: "bg-primary/10 text-primary border-primary/20" };
    case "needs-improvement": return { variant: "outline" as const, text: "Needs Work", className: "bg-warning/10 text-warning border-warning/20" };
    case "critical": return { variant: "destructive" as const, text: "Critical Gap", className: "bg-destructive/10 text-destructive border-destructive/20" };
    default: return { variant: "outline" as const, text: "Unknown", className: "" };
  }
};

export function SkillGapAnalysis() {
  const allSkills = skillCategories.flatMap(cat => cat.skills);
  const criticalSkills = allSkills.filter(skill => skill.status === "critical");
  const needsImprovementSkills = allSkills.filter(skill => skill.status === "needs-improvement");
  const overallProgress = Math.round(allSkills.reduce((acc, skill) => acc + (skill.current / skill.required * 100), 0) / allSkills.length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Skill Gap Analysis</h1>
        <p className="text-muted-foreground">
          Identify skill gaps and get personalized recommendations to advance your career.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Overall Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                <span className="text-sm text-muted-foreground">Complete</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Critical Skills</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalSkills.length}</div>
            <p className="text-sm text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <span>To Improve</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{needsImprovementSkills.length}</div>
            <p className="text-sm text-muted-foreground">Skills to develop</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Categories */}
      <div className="space-y-6">
        {skillCategories.map((category) => (
          <Card key={category.category} className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">{category.category}</CardTitle>
              <CardDescription>
                Skills assessment for {category.category.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.skills.map((skill) => {
                  const StatusIcon = getStatusIcon(skill.status);
                  const statusBadge = getStatusBadge(skill.status);
                  const gap = skill.required - skill.current;
                  
                  return (
                    <div key={skill.name} className="space-y-3 p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(skill.status)}`} />
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Current: {skill.current}% | Required: {skill.required}%
                            </p>
                          </div>
                        </div>
                        <Badge className={statusBadge.className}>
                          {statusBadge.text}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round((skill.current / skill.required) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(skill.current / skill.required) * 100} 
                          className="h-2" 
                        />
                        {gap > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Gap: {gap} points to reach target level
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Recommendations */}
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Recommended Learning Path</h3>
            </div>
            <p className="opacity-90">
              Based on your skill gaps, we recommend focusing on these areas first:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Priority 1: Critical Skills</h4>
                <ul className="space-y-1 text-sm opacity-90">
                  {criticalSkills.slice(0, 3).map(skill => (
                    <li key={skill.name}>• {skill.name}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Priority 2: Improvement Areas</h4>
                <ul className="space-y-1 text-sm opacity-90">
                  {needsImprovementSkills.slice(0, 3).map(skill => (
                    <li key={skill.name}>• {skill.name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <BookOpen className="mr-2 h-4 w-4" />
                Create Learning Plan
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <ExternalLink className="mr-2 h-4 w-4" />
                Find Courses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}