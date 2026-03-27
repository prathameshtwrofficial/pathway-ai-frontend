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
  Briefcase,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

// Indian market salary data (in INR)
const indianSalaries: Record<string, { min: number; max: number; level: string }> = {
  "Full Stack Developer": { min: 600000, max: 2500000, level: "Mid-Senior" },
  "Data Scientist": { min: 800000, max: 3000000, level: "Senior" },
  "Product Manager": { min: 1000000, max: 3500000, level: "Senior" },
  "UX Designer": { min: 500000, max: 1800000, level: "Mid" },
  "DevOps Engineer": { min: 700000, max: 2200000, level: "Mid-Senior" },
  "Machine Learning Engineer": { min: 900000, max: 3500000, level: "Senior" },
  "Software Engineer": { min: 400000, max: 1500000, level: "Junior-Mid" },
  "Backend Developer": { min: 500000, max: 1800000, level: "Mid" },
  "Frontend Developer": { min: 400000, max: 1500000, level: "Mid" },
  "Cloud Architect": { min: 1500000, max: 4000000, level: "Principal" },
  "Data Engineer": { min: 700000, max: 2000000, level: "Mid-Senior" },
  "Cybersecurity Analyst": { min: 600000, max: 1800000, level: "Mid" },
  "Business Analyst": { min: 450000, max: 1400000, level: "Mid" },
  "Project Manager": { min: 700000, max: 2000000, level: "Senior" },
  "QA Engineer": { min: 350000, max: 1200000, level: "Junior-Mid" }
};

// Indian job locations
const indianLocations = [
  "Bangalore, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Chennai, Tamil Nadu",
  "Delhi NCR",
  "Mumbai, Maharashtra",
  "Gurgaon, Haryana",
  "Noida, Uttar Pradesh",
  "Remote (India)",
  "Kolkata, West Bengal"
];

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
  const [matchedOccupations, setMatchedOccupations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch matched occupations from Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    // Check for assessment in user document (version 3.0 format)
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Check for new assessment version (3.0) stored directly in user document
        if (data.aiAssessment?.matchedOccupations && Array.isArray(data.aiAssessment.matchedOccupations)) {
          setMatchedOccupations(data.aiAssessment.matchedOccupations);
        } else if (data.aiAssessment?.recommendations) {
          // Also check for recommendations if no matched occupations
          setMatchedOccupations(data.aiAssessment.recommendations.map((rec: any, index: number) => ({
            title: rec.title,
            matchScore: (rec.match || 0) / 100,
            requiredSkills: rec.requiredSkills || [],
            description: rec.description,
            salaryRange: rec.salaryRange,
            growthPotential: rec.growthPotential
          })));
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Generate dynamic recommendations based on matched occupations
  const recommendations = matchedOccupations.map((occupation, index) => {
    const salaryData = indianSalaries[occupation.title] || { min: 500000, max: 1500000, level: "Mid" };
    const location = indianLocations[Math.floor(Math.random() * indianLocations.length)];
    
    return {
      id: index + 1,
      title: occupation.title,
      company: "Indian Tech Market",
      match: Math.round(occupation.matchScore * 100),
      salaryRange: `₹${(salaryData.min / 100000).toFixed(1)}L - ₹${(salaryData.max / 100000).toFixed(1)}L`,
      location: location,
      description: `This role aligns with your assessed skills and career interests. ${salaryData.level} positions are in high demand in the Indian market.`,
      skills: occupation.requiredSkills || ["Technical Skills", "Problem Solving", "Communication"],
      pros: [
        "High demand in Indian IT industry",
        "Excellent growth opportunities",
        "Remote work options available",
        "Competitive compensation in INR"
      ],
      timeToTransition: occupation.matchScore > 0.8 ? "1-3 months" : "3-6 months",
      rating: 4.5 + (Math.random() * 0.5)
    };
  });
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Career Recommendations</h1>
          <p className="text-muted-foreground">
            Loading your personalized recommendations...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show message if no assessment data available
  if (matchedOccupations.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Career Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered career suggestions based on your profile, skills, and market trends.
          </p>
        </div>
        
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Assessment Data Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete the career assessment quiz to get personalized career recommendations based on your skills and interests.
              </p>
              <Button onClick={() => navigate('/dashboard/career-quiz')}>
                Take Career Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Career Recommendations</h1>
        <p className="text-muted-foreground">
          AI-powered career suggestions based on your profile, skills, and market trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((career) => (
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

      <Card className="bg-gray-800 text-white border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Get More Personalized Recommendations</h3>
            <p className="opacity-90 mb-4">
              Your recommendations are based on your latest assessment. Retake the quiz for updated suggestions.
            </p>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/dashboard/career-quiz')}
            >
              Retake Career Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}