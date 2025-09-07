import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Route, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Award, 
  Target,
  Play,
  Calendar,
  Users
} from "lucide-react";

const roadmapPhases = [
  {
    id: 1,
    title: "Foundation Phase",
    duration: "3 months",
    status: "completed",
    progress: 100,
    description: "Build core technical skills and understanding",
    milestones: [
      {
        title: "Complete TypeScript Fundamentals",
        type: "course",
        duration: "4 weeks",
        status: "completed",
        provider: "TypeScript Academy"
      },
      {
        title: "Build First React Project",
        type: "project",
        duration: "2 weeks", 
        status: "completed",
        provider: "Self-directed"
      },
      {
        title: "AWS Cloud Practitioner Certification",
        type: "certification",
        duration: "6 weeks",
        status: "completed",
        provider: "AWS"
      }
    ]
  },
  {
    id: 2,
    title: "Development Phase",
    duration: "4 months",
    status: "in-progress",
    progress: 65,
    description: "Advanced development skills and real-world experience",
    milestones: [
      {
        title: "Advanced React & State Management",
        type: "course",
        duration: "6 weeks",
        status: "completed",
        provider: "React Mastery"
      },
      {
        title: "Full-Stack E-commerce Project",
        type: "project",
        duration: "8 weeks",
        status: "in-progress",
        provider: "Portfolio Project"
      },
      {
        title: "System Design Fundamentals",
        type: "course",
        duration: "4 weeks",
        status: "pending",
        provider: "Tech Interview Pro"
      }
    ]
  },
  {
    id: 3,
    title: "Specialization Phase",
    duration: "3 months",
    status: "pending",
    progress: 0,
    description: "Focus on senior-level skills and leadership",
    milestones: [
      {
        title: "Microservices Architecture",
        type: "course",
        duration: "6 weeks",
        status: "pending",
        provider: "Cloud Native Academy"
      },
      {
        title: "Lead Team Project",
        type: "project",
        duration: "10 weeks",
        status: "pending",
        provider: "Open Source Contribution"
      },
      {
        title: "Technical Leadership Certificate",
        type: "certification",
        duration: "4 weeks",
        status: "pending",
        provider: "Leadership Institute"
      }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "text-accent";
    case "in-progress": return "text-primary";
    case "pending": return "text-muted-foreground";
    default: return "text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return CheckCircle;
    case "in-progress": return Play;
    case "pending": return Clock;
    default: return Clock;
  }
};

const getMilestoneIcon = (type: string) => {
  switch (type) {
    case "course": return BookOpen;
    case "project": return Target;
    case "certification": return Award;
    default: return BookOpen;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed": return { text: "Completed", className: "bg-accent/10 text-accent border-accent/20" };
    case "in-progress": return { text: "In Progress", className: "bg-primary/10 text-primary border-primary/20" };
    case "pending": return { text: "Pending", className: "bg-muted/10 text-muted-foreground border-muted/20" };
    default: return { text: "Unknown", className: "" };
  }
};

export function PersonalizedRoadmap() {
  const totalMilestones = roadmapPhases.reduce((acc, phase) => acc + phase.milestones.length, 0);
  const completedMilestones = roadmapPhases.reduce((acc, phase) => 
    acc + phase.milestones.filter(m => m.status === "completed").length, 0
  );
  const overallProgress = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Personalized Learning Roadmap</h1>
        <p className="text-muted-foreground">
          Your customized path to becoming a Senior Software Engineer with timeline and milestones.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-primary" />
            <span>Roadmap Progress</span>
          </CardTitle>
          <CardDescription>
            {completedMilestones} of {totalMilestones} milestones completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
              <span className="text-sm text-muted-foreground">Overall Progress</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium text-accent">{completedMilestones}</div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="font-medium text-primary">
                  {roadmapPhases.reduce((acc, phase) => 
                    acc + phase.milestones.filter(m => m.status === "in-progress").length, 0
                  )}
                </div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">
                  {roadmapPhases.reduce((acc, phase) => 
                    acc + phase.milestones.filter(m => m.status === "pending").length, 0
                  )}
                </div>
                <div className="text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Phases */}
      <div className="space-y-6">
        {roadmapPhases.map((phase) => {
          const StatusIcon = getStatusIcon(phase.status);
          const statusBadge = getStatusBadge(phase.status);

          return (
            <Card key={phase.id} className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        phase.status === "completed" ? "bg-accent/10" :
                        phase.status === "in-progress" ? "bg-primary/10" : "bg-muted/10"
                      }`}>
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(phase.status)}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{phase.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{phase.duration}</span>
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{phase.description}</p>
                  </div>
                  <Badge className={statusBadge.className}>
                    {statusBadge.text}
                  </Badge>
                </div>

                {phase.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Phase Progress</span>
                      <span>{phase.progress}%</span>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Milestones</h4>
                  <div className="grid gap-4">
                    {phase.milestones.map((milestone, idx) => {
                      const MilestoneIcon = getMilestoneIcon(milestone.type);
                      const milestoneStatusBadge = getStatusBadge(milestone.status);

                      return (
                        <div 
                          key={idx} 
                          className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-smooth"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            milestone.status === "completed" ? "bg-accent/10" :
                            milestone.status === "in-progress" ? "bg-primary/10" : "bg-muted/10"
                          }`}>
                            <MilestoneIcon className={`h-4 w-4 ${getStatusColor(milestone.status)}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium">{milestone.title}</h5>
                              <Badge variant="outline" className={milestoneStatusBadge.className}>
                                {milestoneStatusBadge.text}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{milestone.duration}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{milestone.provider}</span>
                              </span>
                            </div>
                          </div>

                          {milestone.status === "pending" && (
                            <Button size="sm" variant="outline">
                              Start
                            </Button>
                          )}
                          {milestone.status === "in-progress" && (
                            <Button size="sm" variant="default">
                              Continue
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to Accelerate Your Progress?</h3>
            <p className="opacity-90">
              Get personalized mentoring and additional resources to fast-track your career growth.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Users className="mr-2 h-4 w-4" />
                Find Mentor
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Courses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}