import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Download,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const analysisResults = {
  overallScore: 78,
  sections: [
    {
      name: "ATS Compatibility",
      score: 85,
      status: "good",
      feedback: "Good formatting and keyword usage. Resume is ATS-friendly.",
      improvements: ["Add more industry-specific keywords", "Include skills section"]
    },
    {
      name: "Content Quality",
      score: 72,
      status: "needs-improvement", 
      feedback: "Content is solid but could be more impactful.",
      improvements: ["Add quantifiable achievements", "Use stronger action verbs", "Include more specific technologies"]
    },
    {
      name: "Structure & Format",
      score: 90,
      status: "excellent",
      feedback: "Excellent structure and professional formatting.",
      improvements: ["Perfect formatting - no changes needed"]
    },
    {
      name: "Keyword Optimization",
      score: 65,
      status: "needs-improvement",
      feedback: "Missing some key industry terms.",
      improvements: ["Add 'React', 'Node.js', 'API development'", "Include soft skills keywords", "Add certification keywords"]
    }
  ],
  keywordMatches: [
    { keyword: "JavaScript", matched: true, importance: "high" },
    { keyword: "React", matched: false, importance: "high" },
    { keyword: "Node.js", matched: false, importance: "high" },
    { keyword: "TypeScript", matched: true, importance: "medium" },
    { keyword: "AWS", matched: false, importance: "medium" },
    { keyword: "Agile", matched: true, importance: "medium" },
    { keyword: "Leadership", matched: false, importance: "low" },
    { keyword: "Problem Solving", matched: true, importance: "low" }
  ]
};

export function ResumeAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please paste a job description to analyze your resume against.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasResults(true);
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been analyzed against the job description.",
      });
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-accent";
      case "good": return "text-primary";
      case "needs-improvement": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return CheckCircle;
      case "good": return CheckCircle;
      case "needs-improvement": return AlertTriangle;
      default: return Target;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Optimize your resume for Applicant Tracking Systems and specific job descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Job Description Analysis</span>
            </CardTitle>
            <CardDescription>
              Paste the job description you want to match your resume against
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="resize-none"
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
              variant="default"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Resume Match
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Analysis Results</span>
            </CardTitle>
            <CardDescription>
              ATS compatibility and optimization suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasResults && !isAnalyzing && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Analyze your resume against a job description to see results
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <p className="font-medium mb-2">Analyzing your resume...</p>
                <p className="text-sm text-muted-foreground">
                  Checking ATS compatibility and keyword matching
                </p>
              </div>
            )}

            {hasResults && (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className={`text-3xl font-bold ${getScoreColor(analysisResults.overallScore)}`}>
                    {analysisResults.overallScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Overall ATS Score</p>
                </div>

                {/* Section Scores */}
                <div className="space-y-4">
                  <h4 className="font-medium">Detailed Analysis</h4>
                  {analysisResults.sections.map((section) => {
                    const StatusIcon = getStatusIcon(section.status);
                    
                    return (
                      <div key={section.name} className="space-y-2 p-3 rounded-lg bg-muted/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(section.status)}`} />
                            <span className="font-medium">{section.name}</span>
                          </div>
                          <span className={`font-bold ${getScoreColor(section.score)}`}>
                            {section.score}%
                          </span>
                        </div>
                        <Progress value={section.score} className="h-1" />
                        <p className="text-xs text-muted-foreground">{section.feedback}</p>
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full" variant="default">
                  <Download className="mr-2 h-4 w-4" />
                  Download Detailed Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keyword Analysis */}
      {hasResults && (
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Keyword Analysis</span>
            </CardTitle>
            <CardDescription>
              How well your resume matches important keywords from the job description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisResults.keywordMatches.map((keyword) => (
                <div 
                  key={keyword.keyword}
                  className={`p-3 rounded-lg border-2 ${
                    keyword.matched 
                      ? "border-accent/20 bg-accent/5" 
                      : "border-destructive/20 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{keyword.keyword}</span>
                    {keyword.matched ? (
                      <CheckCircle className="h-4 w-4 text-accent" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        keyword.importance === "high" ? "border-destructive/20 text-destructive" :
                        keyword.importance === "medium" ? "border-warning/20 text-warning" :
                        "border-muted text-muted-foreground"
                      }`}
                    >
                      {keyword.importance}
                    </Badge>
                    <span className={`text-xs font-medium ${
                      keyword.matched ? "text-accent" : "text-destructive"
                    }`}>
                      {keyword.matched ? "Found" : "Missing"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}