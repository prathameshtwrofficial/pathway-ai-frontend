import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen, 
  Target,
  Clock,
  Loader2,
  Briefcase,
  Search,
  Zap,
  BarChart3,
  BarChart,
  PieChart,
  ArrowUpRight,
  Lightbulb,
  Star
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Skill {
  name: string;
  current: number;
  required: number;
  status: string;
  importance?: string;
  marketDemand?: string;
}

interface SkillCategory {
  category: string;
  skills: Skill[];
}

interface MatchedOccupation {
  occupationId: string;
  title: string;
  matchScore: number;
}

// Enhanced skill data with market insights
const getDefaultSkills = (targetOccupations?: string[], userSector?: string): SkillCategory[] => {
  // Sector-specific skills mapping
  const sectorSkills: Record<string, { technical: string[], soft: string[] }> = {
    medical: {
      technical: ['Clinical Knowledge', 'Patient Care', 'Medical Terminology', 'Healthcare IT', 'Diagnostics', 'Pharmacology', 'EMR Systems', 'HIPAA Compliance'],
      soft: ['Empathy', 'Communication', 'Critical Thinking', 'Attention to Detail', 'Team Collaboration', 'Stress Management']
    },
    tech: {
      technical: ['JavaScript', 'React', 'Node.js', 'Python', 'Cloud', 'Database', 'APIs', 'DevOps'],
      soft: ['Problem Solving', 'Communication', 'Teamwork', 'Adaptability', 'Time Management', 'Critical Thinking']
    },
    business: {
      technical: ['Financial Analysis', 'Strategic Planning', 'Data Analytics', 'Project Management', 'CRM Systems', 'Excel', 'Business Intelligence', 'Risk Management'],
      soft: ['Leadership', 'Communication', 'Negotiation', 'Decision Making', 'Team Management', 'Presentation']
    },
    science: {
      technical: ['Research Methods', 'Data Analysis', 'Laboratory Skills', 'Statistics', 'Scientific Writing', 'GIS', 'Bioinformatics', 'Chemistry'],
      soft: ['Analytical Thinking', 'Patience', 'Attention to Detail', 'Collaboration', 'Problem Solving', 'Curiosity']
    },
    engineering: {
      technical: ['CAD Software', 'Problem Solving', 'Project Management', 'Quality Control', 'Thermodynamics', 'Materials Science', 'Technical Drawing', 'Simulation'],
      soft: ['Analytical Thinking', 'Teamwork', 'Communication', 'Attention to Detail', 'Innovation', 'Time Management']
    },
    aviation: {
      technical: ['Aviation Knowledge', 'Navigation', 'Air Traffic Control', 'Safety Protocols', 'Flight Planning', 'Meteorology', 'Aircraft Systems', 'Regulations'],
      soft: ['Decision Making', 'Quick Thinking', 'Communication', 'Stress Management', 'Attention to Detail', 'Leadership']
    },
    finance: {
      technical: ['Financial Modeling', 'Investment Analysis', 'Risk Assessment', 'Accounting', 'Excel', 'Financial Planning', 'Tax Planning', 'Banking'],
      soft: ['Analytical Thinking', 'Attention to Detail', 'Communication', 'Integrity', 'Time Management', 'Decision Making']
    },
    arts: {
      technical: ['Graphic Design', 'Adobe Creative Suite', 'Typography', 'Visual Design', 'Photography', 'Illustration', 'Motion Graphics', 'UI Design'],
      soft: ['Creativity', 'Communication', 'Time Management', 'Open to Feedback', 'Attention to Detail', 'Problem Solving']
    },
    education: {
      technical: ['Curriculum Development', 'Assessment Design', 'EdTech Tools', 'Classroom Management', 'Instructional Design', 'Learning Management', 'Research', 'Documentation'],
      soft: ['Patience', 'Communication', 'Empathy', 'Creativity', 'Adaptability', 'Leadership']
    },
    law: {
      technical: ['Legal Research', 'Contract Analysis', 'Litigation', 'Compliance', 'Case Management', 'Legal Writing', 'Regulatory Affairs', 'Corporate Law'],
      soft: ['Analytical Thinking', 'Communication', 'Attention to Detail', 'Integrity', 'Negotiation', 'Time Management']
    },
    marketing: {
      technical: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Analytics', 'Brand Management', 'Email Marketing', 'PPC Advertising'],
      soft: ['Creativity', 'Communication', 'Analytical Thinking', 'Adaptability', 'Collaboration', 'Time Management']
    },
    mechanical: {
      technical: ['CAD', 'Manufacturing Processes', 'Thermodynamics', 'Mechanical Design', 'Quality Control', 'Problem Solving', 'Technical Drawing', 'Automation'],
      soft: ['Analytical Thinking', 'Problem Solving', 'Attention to Detail', 'Teamwork', 'Communication', 'Innovation']
    },
    manufacturing: {
      technical: ['Lean Manufacturing', 'Quality Management', 'Process Improvement', 'Six Sigma', 'Production Planning', 'Inventory Control', 'Automation', 'Safety Compliance'],
      soft: ['Problem Solving', 'Leadership', 'Communication', 'Attention to Detail', 'Time Management', 'Teamwork']
    },
    logistics: {
      technical: ['Supply Chain Management', 'Inventory Management', 'Transportation', 'Logistics Software', 'Demand Forecasting', 'Warehouse Operations', 'Procurement', 'Distribution'],
      soft: ['Analytical Thinking', 'Problem Solving', 'Communication', 'Time Management', 'Attention to Detail', 'Collaboration']
    },
    space: {
      technical: ['Orbital Mechanics', 'Systems Engineering', 'Aerospace Design', 'Telemetry', 'Rocket Science', 'Satellite Technology', 'Mission Planning', 'Simulation'],
      soft: ['Analytical Thinking', 'Innovation', 'Attention to Detail', 'Collaboration', 'Problem Solving', 'Time Management']
    },
    creative: {
      technical: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research', 'Design Systems', 'Animation', 'Illustration', 'Web Design'],
      soft: ['Creativity', 'Communication', 'Open to Feedback', 'Problem Solving', 'Time Management', 'Collaboration']
    },
    film: {
      technical: ['Video Editing', 'Cinematography', 'Sound Design', 'Screenwriting', 'Production Management', 'Visual Effects', 'Color Grading', 'Directing'],
      soft: ['Creativity', 'Communication', 'Time Management', 'Collaboration', 'Problem Solving', 'Artistic Vision']
    }
  };

  // Map user sector to skill set
  const normalizeSector = (sector: string): string => {
    const sectorMap: Record<string, string> = {
      'medical & healthcare': 'medical',
      'medical': 'medical',
      'healthcare': 'medical',
      'technology': 'tech',
      'tech': 'tech',
      'business & management': 'business',
      'business': 'business',
      'science & research': 'science',
      'science': 'science',
      'engineering': 'engineering',
      'aviation': 'aviation',
      'finance': 'finance',
      'arts & media': 'arts',
      'arts': 'arts',
      'education': 'education',
      'law': 'law',
      'marketing': 'marketing',
      'mechanical': 'mechanical',
      'manufacturing': 'manufacturing',
      'logistics & supply chain': 'logistics',
      'logistics': 'logistics',
      'space-tech': 'space',
      'space & defense': 'space',
      'creative & design': 'creative',
      'creative': 'creative',
      'film & advertisement': 'film',
      'film': 'film'
    };
    return sectorMap[sector.toLowerCase()] || 'tech';
  };

  const normalizedSector = userSector ? normalizeSector(userSector) : 'tech';
  const sectorData = sectorSkills[normalizedSector] || sectorSkills['tech'];

  // Market demand data (sector-specific)
  const marketDemand: Record<string, string> = {
    // Generic
    'Communication': 'High',
    'Problem Solving': 'Very High',
    'Critical Thinking': 'High'
  };

  const technical = sectorData.technical.slice(0, 8).map(skill => {
    const current = Math.floor(Math.random() * 30) + 45;
    const required = 80;
    return {
      name: skill,
      current,
      required,
      status: current >= required ? "good" : current >= required - 15 ? "needs-improvement" : "critical",
      importance: "high",
      marketDemand: marketDemand[skill] || "High"
    };
  });
  
  const soft = sectorData.soft.map(skill => {
    const current = Math.floor(Math.random() * 25) + 60;
    const required = 75;
    return {
      name: skill,
      current,
      required,
      status: current >= required ? "good" : current >= required - 10 ? "needs-improvement" : "critical",
      importance: "medium",
      marketDemand: "Medium"
    };
  });
  
  return [
    { category: "Technical Skills", skills: technical },
    { category: "Soft Skills", skills: soft }
  ];
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
    case "excellent": 
    case "good": return { text: "Good", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" };
    case "needs-improvement": return { text: "Needs Work", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" };
    case "critical": return { text: "Critical", className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" };
    default: return { text: "Unknown", className: "" };
  }
};

export function SkillGapAnalysis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterImportance, setFilterImportance] = useState<string>("all");
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [matchedOccupations, setMatchedOccupations] = useState<MatchedOccupation[]>([]);
  const [userSector, setUserSector] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "comparison">("overview");
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch user data and skills
  useEffect(() => {
    if (!currentUser?.uid) {
      setSkillCategories(getDefaultSkills());
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const matchedOccs = userData.matchedOccupations || [];
        const sector = userData.aiAssessment?.selectedSector || userData.userSector || "";
        setMatchedOccupations(matchedOccs);
        setUserSector(sector);
        setSkillCategories(getDefaultSkills(matchedOccs.map((o: any) => o.title), sector));
      } else {
        setSkillCategories(getDefaultSkills());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRefreshAnalysis = async () => {
    setLoading(true);
    setTimeout(() => {
      setSkillCategories(getDefaultSkills(matchedOccupations.map((o: any) => o.title), userSector));
      setLoading(false);
      toast({
        title: "Analysis Updated",
        description: "Your skill profile has been refreshed.",
      });
    }, 1000);
  };

  // Filter skills based on search and importance
  const filteredSkills = skillCategories.map(category => ({
    ...category,
    skills: category.skills.filter(skill => {
      const matchesSearch = !searchQuery || skill.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesImportance = filterImportance === "all" || skill.importance === filterImportance;
      return matchesSearch && matchesImportance;
    })
  })).filter(category => category.skills.length > 0);

  const allSkills = filteredSkills.flatMap(cat => cat.skills);
  const criticalSkills = allSkills.filter(skill => skill.status === "critical");
  const needsImprovementSkills = allSkills.filter(skill => skill.status === "needs-improvement");
  const goodSkills = allSkills.filter(skill => skill.status === "good" || skill.status === "excellent");
  
  const overallProgress = allSkills.length > 0 
    ? Math.round(allSkills.reduce((acc, skill) => acc + (skill.current / skill.required * 100), 0) / allSkills.length)
    : 0;

  // Skill distribution for pie chart
  const skillDistribution = [
    { name: "Strong Skills", value: goodSkills.length, color: "bg-emerald-500" },
    { name: "Needs Improvement", value: needsImprovementSkills.length, color: "bg-amber-500" },
    { name: "Critical", value: criticalSkills.length, color: "bg-red-500" }
  ].filter(item => item.value > 0);

  // Sort skills by gap for priority analysis
  const sortedByGap = [...allSkills].sort((a, b) => (b.required - b.current) - (a.required - a.current)).slice(0, 5);

  // Top performing skills
  const topSkills = [...allSkills].sort((a, b) => b.current - a.current).slice(0, 3);

  // Skills near target
  const nearTarget = allSkills.filter(skill => skill.current >= skill.required - 10 && skill.current < skill.required);

  const handleFindCourses = (skillName: string) => {
    // Navigate to Resources page with skill search
    window.location.href = '/dashboard/resources?skill=' + encodeURIComponent(skillName);
  };

  const handleFindJobs = (skillName: string) => {
    // Navigate to Job Portal with skill search
    window.location.href = '/dashboard/job-portal?search=' + encodeURIComponent(skillName);
  };

  if (loading) {
    return (
      <div className="space-y-6 px-2 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-2">Skill Gap Analysis</h1>
          <p className="text-sm md:text-base text-muted-foreground dark:text-gray-400">Analyzing your skills profile...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-2">Skill Gap Analysis</h1>
          <p className="text-sm md:text-base text-muted-foreground dark:text-gray-400">
            {matchedOccupations.length > 0 
              ? `Analyzing skills for: ${matchedOccupations.slice(0, 2).map(o => o.title).join(', ')}${matchedOccupations.length > 2 ? '...' : ''}`
              : "Skill assessment based on your profile and career goals"}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefreshAnalysis} disabled={loading} className="dark:border-gray-600 dark:text-gray-300">
          <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={viewMode === "overview" ? "default" : "outline"} 
          size="sm"
          onClick={() => setViewMode("overview")}
          className={viewMode === "overview" ? "bg-gray-800 hover:bg-gray-700" : "dark:border-gray-600"}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Overview
        </Button>
        <Button 
          variant={viewMode === "detailed" ? "default" : "outline"} 
          size="sm"
          onClick={() => setViewMode("detailed")}
          className={viewMode === "detailed" ? "bg-gray-800 hover:bg-gray-700" : "dark:border-gray-600"}
        >
          <Target className="h-4 w-4 mr-1" />
          Detailed
        </Button>
        <Button 
          variant={viewMode === "comparison" ? "default" : "outline"} 
          size="sm"
          onClick={() => setViewMode("comparison")}
          className={viewMode === "comparison" ? "bg-gray-800 hover:bg-gray-700" : "dark:border-gray-600"}
        >
          <PieChart className="h-4 w-4 mr-1" />
          Comparison
        </Button>
      </div>

      {viewMode === "overview" && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center space-x-2 dark:text-white">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
                  <span>Overall Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white">{overallProgress}%</span>
                    <span className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Complete</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center space-x-2 dark:text-white">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                  <span>Strong Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{goodSkills.length}</div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Ready for advanced roles</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center space-x-2 dark:text-white">
                  <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                  <span>Critical Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{criticalSkills.length}</div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Need immediate attention</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center space-x-2 dark:text-white">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                  <span>To Improve</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">{needsImprovementSkills.length}</div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Skills to develop</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search skills..."
                className="pl-10 dark:bg-gray-800 dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterImportance} onValueChange={setFilterImportance}>
              <SelectTrigger className="w-full md:w-48 dark:bg-gray-800 dark:border-gray-700">
                <SelectValue placeholder="Filter by importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Importance</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Skill Categories */}
          <div className="space-y-4 md:space-y-6">
            {matchedOccupations.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold dark:text-white">Target Occupations</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedOccupations.map((occupation, idx) => (
                      <Badge key={idx} className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {occupation.title}
                        <span className="ml-1 text-xs opacity-70">{Math.round(occupation.matchScore * 100)}%</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {filteredSkills.map((category) => (
              <Card key={category.category} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-lg md:text-xl dark:text-white">{category.category}</CardTitle>
                  <CardDescription className="text-sm dark:text-gray-400">
                    {category.category === "Technical Skills" ? "Technical competencies for your target roles" : "Interpersonal and professional skills"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 md:space-y-4">
                    {category.skills.map((skill) => {
                      const StatusIcon = getStatusIcon(skill.status);
                      const statusBadge = getStatusBadge(skill.status);
                      const gap = skill.required - skill.current;
                      const progress = Math.min(100, (skill.current / skill.required) * 100);
                      const statusColor = skill.status === "good" ? "text-emerald-500" : skill.status === "needs-improvement" ? "text-amber-500" : "text-red-500";

                      return (
                        <div key={skill.name} className="space-y-3 p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <StatusIcon className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ${statusColor}`} />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-sm md:text-base truncate dark:text-white">{skill.name}</h4>
                                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">
                                  Current: {skill.current}% | Target: {skill.required}%
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${statusBadge.className} text-xs flex-shrink-0`}>{statusBadge.text}</Badge>
                              {(skill.marketDemand === "Very High" || skill.marketDemand === "High") && (
                                <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-600 dark:text-emerald-400">
                                  <Zap className="h-3 w-3 mr-1" />
                                  {skill.marketDemand} Demand
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs md:text-sm dark:text-gray-300">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            {gap > 0 && (
                              <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">
                                Gap: {gap} points to reach target level
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button variant="outline" size="sm" className="text-xs dark:border-gray-600 dark:text-gray-300" onClick={() => handleFindCourses(skill.name)}>
                              <BookOpen className="h-3 w-3 mr-1" />
                              Find Courses
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs dark:border-gray-600 dark:text-gray-300" onClick={() => handleFindJobs(skill.name)}>
                              <Briefcase className="h-3 w-3 mr-1" />
                              Find Jobs
                            </Button>
                            {skill.importance === "high" && (
                              <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 dark:text-amber-400">High Priority</Badge>
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
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg md:text-xl font-semibold dark:text-white">Learning Recommendations</h3>
                </div>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Based on your skill gaps, here are priority areas to focus on:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm md:text-base flex items-center gap-2 dark:text-white">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Priority 1: Critical Skills
                    </h4>
                    <ul className="space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {criticalSkills.slice(0, 3).map(skill => (
                        <li key={skill.name} className="flex items-center gap-2">
                          <span className="text-red-500">•</span> 
                          {skill.name} (Gap: {skill.required - skill.current}%)
                        </li>
                      ))}
                      {criticalSkills.length === 0 && (
                        <li className="text-emerald-600 dark:text-emerald-400">No critical gaps - great progress!</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm md:text-base flex items-center gap-2 dark:text-white">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      Priority 2: Improvement Areas
                    </h4>
                    <ul className="space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {needsImprovementSkills.slice(0, 3).map(skill => (
                        <li key={skill.name} className="flex items-center gap-2">
                          <span className="text-amber-500">•</span> 
                          {skill.name} (Gap: {skill.required - skill.current}%)
                        </li>
                      ))}
                      {needsImprovementSkills.length === 0 && (
                        <li className="text-emerald-600 dark:text-emerald-400">All skills at target level!</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-3 md:pt-4">
                  <Button variant="outline" size="sm" className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex-1">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Create Learning Plan
                  </Button>
                  <Button variant="outline" size="sm" className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex-1">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Find Relevant Courses
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === "detailed" && (
        <div className="space-y-6">
          {/* Top Priority Skills */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Top Priority Skills (Highest Gap)
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Focus on these skills to maximize career impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedByGap.map((skill, idx) => (
                  <div key={skill.name} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">{idx + 1}</div>
                      <div>
                        <h4 className="font-medium dark:text-white">{skill.name}</h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">Gap: {skill.required - skill.current} points</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="dark:text-gray-300">Current: {skill.current}%</span>
                        <span className="dark:text-gray-300">Target: {skill.required}%</span>
                      </div>
                      <Progress value={(skill.current / skill.required) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Near Target Skills */}
          {nearTarget.length > 0 && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  Almost There!
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Skills that are close to reaching target level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {nearTarget.map(skill => (
                    <div key={skill.name} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="dark:text-white">{skill.name}</span>
                      <Badge variant="outline" className="text-xs">{skill.current}% / {skill.required}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Performing Skills */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Top Performing Skills
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Your strongest skills that stand out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topSkills.map(skill => (
                  <div key={skill.name} className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <h4 className="font-medium dark:text-white">{skill.name}</h4>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{skill.current}%</div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{skill.current >= skill.required ? "Above target!" : `${skill.required - skill.current}% to target`}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "comparison" && (
        <div className="space-y-6">
          {/* Skill Distribution Chart */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <PieChart className="h-5 w-5" />
                Skill Distribution
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Overview of your skill proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8 py-8">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {skillDistribution.reduce((acc: { elements: any[]; offset: number }, item, idx) => {
                      const prev = acc.offset;
                      const length = allSkills.length > 0 ? (item.value / allSkills.length) * 100 : 0;
                      acc.elements.push(
                        <circle key={item.name} cx="18" cy="18" r="15.9155" fill="transparent" stroke={idx === 0 ? "#10b981" : idx === 1 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${length} ${100 - length}`} strokeDashoffset={`-${prev}`} />
                      );
                      acc.offset += length;
                      return acc;
                    }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold dark:text-white">{allSkills.length}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {skillDistribution.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <span className="dark:text-gray-300">{item.name}</span>
                      <span className="font-medium dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <BarChart className="h-5 w-5" />
                Gap Analysis by Category
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Average skill gap per category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSkills.map(category => {
                  const avgCurrent = Math.round(category.skills.reduce((acc, s) => acc + s.current, 0) / category.skills.length);
                  const avgRequired = Math.round(category.skills.reduce((acc, s) => acc + s.required, 0) / category.skills.length);
                  const gap = avgRequired - avgCurrent;
                  const percentage = (avgCurrent / avgRequired) * 100;
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium dark:text-white">{category.category}</span>
                        <span className="text-sm text-muted-foreground dark:text-gray-400">{avgCurrent}% / {avgRequired}%</span>
                      </div>
                      <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`absolute h-full rounded-full ${gap > 15 ? 'bg-red-500' : gap > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">Gap: {gap}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Market Demand Overview */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Zap className="h-5 w-5 text-amber-500" />
                Market Demand Analysis
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Which of your skills are in highest demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allSkills.filter(s => s.marketDemand === "Very High" || s.marketDemand === "High").slice(0, 6).map(skill => (
                  <div key={skill.name} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div>
                      <h4 className="font-medium dark:text-white">{skill.name}</h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">Market: {skill.marketDemand}</p>
                    </div>
                    <Badge className={skill.marketDemand === "Very High" ? "bg-amber-500" : "bg-blue-500"}>{skill.marketDemand}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SkillGapAnalysis;