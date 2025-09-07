import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Clock, 
  Star,
  ExternalLink,
  Briefcase
} from "lucide-react";

const careerRecommendations = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Tech Industry",
    match: 95,
    salaryRange: "$120k - $180k",
    location: "Remote / San Francisco",
    description: "Lead development of scalable web applications using modern technologies. Perfect match for your technical skills and problem-solving abilities.",
    skills: ["React", "Node.js", "TypeScript", "AWS", "System Design"],
    pros: [
      "High demand in market",
      "Excellent growth opportunities",
      "Remote work options",
      "Competitive compensation"
    ],
    timeToTransition: "3-6 months",
    rating: 4.8
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Technology",
    match: 87,
    salaryRange: "$130k - $200k",
    location: "New York / Remote",
    description: "Drive product strategy and work with cross-functional teams. Ideal for your strategic thinking and leadership qualities.",
    skills: ["Product Strategy", "Data Analysis", "User Research", "Agile", "Leadership"],
    pros: [
      "Strategic impact on business",
      "Cross-functional collaboration",
      "High earning potential",
      "Career advancement opportunities"
    ],
    timeToTransition: "6-12 months",
    rating: 4.6
  },
  {
    id: 3,
    title: "Technical Architect",
    company: "Enterprise",
    match: 82,
    salaryRange: "$150k - $220k",
    location: "Various locations",
    description: "Design and implement large-scale technical solutions. Great fit for your technical expertise and system thinking.",
    skills: ["System Architecture", "Cloud Platforms", "Microservices", "DevOps", "Technical Leadership"],
    pros: [
      "Technical leadership role",
      "High-level problem solving",
      "Mentorship opportunities",
      "Significant impact on projects"
    ],
    timeToTransition: "6-9 months",
    rating: 4.7
  }
];

export function CareerRecommendations() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Career Recommendations</h1>
        <p className="text-muted-foreground">
          AI-powered career suggestions based on your profile, skills, and market trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {careerRecommendations.map((career) => (
          <Card key={career.id} className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{career.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <span>{career.company}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-warning fill-current" />
                          <span className="text-sm">{career.rating}</span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="secondary" 
                    className="bg-accent/10 text-accent border-accent/20 font-semibold"
                  >
                    {career.match}% Match
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Match Score</span>
                  <span className="font-medium">{career.match}%</span>
                </div>
                <Progress value={career.match} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{career.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Salary Range</p>
                    <p className="text-sm text-muted-foreground">{career.salaryRange}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{career.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Transition Time</p>
                    <p className="text-sm text-muted-foreground">{career.timeToTransition}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {career.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Key Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {career.pros.map((pro, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-accent flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button variant="default" className="flex-1">
                  <Target className="mr-2 h-4 w-4" />
                  Create Learning Path
                </Button>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Get More Personalized Recommendations</h3>
            <p className="opacity-90 mb-4">
              Complete your skill assessment and upload more detailed preferences for better matches.
            </p>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              Complete Profile Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}