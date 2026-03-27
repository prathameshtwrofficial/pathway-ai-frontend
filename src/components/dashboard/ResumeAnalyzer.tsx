import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Download,
  Zap,
  File,
  X,
  Eye,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Code,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define types for ATS analysis results
interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

interface Experience {
  company: string;
  title: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Skills {
  technical: string[];
  soft: string[];
  tools: string[];
}

interface Formatting {
  hasBulletPoints: boolean;
  hasNumbers: boolean;
  sectionHeaders: number;
  hasQuantifiedAchievements: boolean;
  hasActionVerbs: boolean;
  consistentFormatting: boolean;
  avgLineLength: number;
}

interface ParsedResume {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  certifications: string[];
  projects: { name: string; description: string }[];
  languages: { language: string; proficiency: string }[];
  sectionsFound: string[];
  formatting: Formatting;
  wordCount: number;
  charCount: number;
}

interface ATSScores {
  keywordMatch: number;
  formatScore: number;
  completeness: number;
  contentQuality: number;
  sectionsPresent: number;
}

interface Improvement {
  category: string;
  priority: string;
  suggestion: string;
  details: string;
}

interface ATSAnalysis {
  overallScore: number;
  parsedResume: ParsedResume;
  scores: ATSScores;
  missingKeywords: string[];
  matchedKeywords: string[];
  improvements: Improvement[];
  atsRecommendation: string;
}

// Default empty results
const defaultResults: ATSAnalysis | null = null;

export function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ATSAnalysis | null>(defaultResults);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .txt, .pdf, .doc, or .docx file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);

    try {
      // Upload file to backend for text extraction
      const formData = new FormData();
      formData.append('resume', file);

      toast({
        title: "Extracting Text",
        description: "Please wait while we extract text from your resume...",
      });

      const response = await fetch('/api/resume/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to extract text');
      }

      const data = await response.json();
      
      setResumeText(data.text);
      setActiveTab("text");
      setIsAnalyzing(false);
      
      toast({
        title: "Text Extracted Successfully!",
        description: `Extracted ${data.wordCount} words from ${file.name}. Click 'Analyze with ATS' to get your analysis.`,
      });
    } catch (error: any) {
      console.error('File extraction error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Extraction Failed",
        description: error.message || "Could not extract text from file. Please paste text manually.",
        variant: "destructive",
      });
      // Still switch to text tab so user can paste manually
      setActiveTab("text");
    }
  };

  // This function is no longer needed - text extraction is done server-side
  // Keeping for backwards compatibility but it's not called anymore
  const extractTextFromFile = async (file: File): Promise<string> => {
    // This should not be called anymore - we use the API instead
    console.warn('Client-side text extraction is deprecated');
    return '';
  };

  // Load saved resume from Firestore
  const loadSavedResume = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Check for resume text saved directly (from ResumeAnalyzer)
        if (data.resumeText) {
          setResumeText(data.resumeText);
          toast({
            title: "Resume Loaded",
            description: "Your previously uploaded resume has been loaded.",
          });
        }
        // Check for ATS analysis with embedded resume text (fallback)
        else if (data.atsAnalysis?.resumeText) {
          setResumeText(data.atsAnalysis.resumeText);
          toast({
            title: "Resume Loaded",
            description: "Your previously uploaded resume has been loaded.",
          });
        }
        
        // Check for job description
        if (data.atsAnalysis?.jobDescription) {
          setJobDescription(data.atsAnalysis.jobDescription);
        }
      }
    } catch (error) {
      console.error('Error loading saved resume:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume Required",
        description: "Please upload a resume or paste the text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Call ATS analysis API
      const response = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: resumeText, 
          jobDescription: jobDescription,
          userId: currentUser?.uid // Pass userId for Firestore saving
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'ATS analysis failed');
      }
      
      const results = await response.json();
      
      // Save analysis to Firestore for report generation
      if (currentUser?.uid && results) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          // Get existing data to preserve
          const existingDoc = await getDoc(userDocRef);
          const existingData = existingDoc.exists() ? existingDoc.data() : {};
          
          await setDoc(userDocRef, {
            ...existingData,
            resumeText: resumeText, // Save the resume text for report generation
            atsAnalysis: results,
            resume: existingData.resume || {
              fileName: 'analyzedResume',
              uploadedAt: new Date(),
              wordCount: resumeText.split(/\s+/).filter(w => w.length > 0).length
            },
            lastAnalysisDate: new Date().toISOString(),
            lastResumeUpdate: new Date().toISOString()
          }, { merge: true });
          console.log('Resume text and ATS analysis saved to Firestore');
        } catch (firestoreError) {
          console.error('Error saving to Firestore:', firestoreError);
        }
      }
      
      setAnalysisResults(results);
      setIsAnalyzing(false);
      setHasResults(true);
      
      toast({
        title: "Analysis Complete!",
        description: `Your resume scored ${results.overallScore}% ATS match.`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setResumeText("");
    setJobDescription("");
    setAnalysisResults(null);
    setHasResults(false);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 border-red-200 bg-red-50";
      case "medium": return "text-yellow-600 border-yellow-200 bg-yellow-50";
      default: return "text-gray-500 border-gray-200 bg-gray-50";
    }
  };

  // Check if sector analysis is available
  const sectorData = analysisResults ? (analysisResults as any).sectorAnalysis : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Advanced ATS Resume Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume and compare against job descriptions for maximum ATS compatibility.
          </p>
        </div>
        {hasResults && (
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="text">Paste Text</TabsTrigger>
          <TabsTrigger value="results" disabled={!hasResults}>Results</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-4">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload Resume</span>
              </CardTitle>
              <CardDescription>
                Upload your resume (PDF, DOCX, or TXT) for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">Click to upload your resume</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports PDF, DOCX, DOC, TXT (max 5MB)
                </p>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-primary" />
                    <span className="font-medium">{uploadedFile.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={loadSavedResume}>
                  Load Previous Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paste Text Tab */}
        <TabsContent value="text" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Text Input */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Resume Text</span>
                </CardTitle>
                <CardDescription>
                  Paste your resume text here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your resume content here...

Example:
John Doe
john.doe@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years..."

                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={15}
                  className="resize-none font-mono text-sm"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Word count: {resumeText.split(/\s+/).filter(w => w.length > 0).length}</span>
                  <span>Characters: {resumeText.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Job Description Input */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Job Description (Optional)</span>
                </CardTitle>
                <CardDescription>
                  Paste the job description to compare against
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the job description here to see how well your resume matches...

Required Skills:
- JavaScript, React, TypeScript
- Node.js, Express
- PostgreSQL, MongoDB
- AWS, Docker..."

                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={15}
                  className="resize-none text-sm"
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !resumeText.trim()}
                  className="w-full"
                  variant="default"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Zap className="mr-2 h-5 w-5 animate-pulse" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze with ATS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-4">
          {analysisResults && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-40 h-40 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-muted"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          strokeDasharray={`${(analysisResults.overallScore / 100) * 440} 440`}
                          strokeLinecap="round"
                          className={getScoreColor(analysisResults.overallScore)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getScoreColor(analysisResults.overallScore)}`}>
                          {analysisResults.overallScore}%
                        </span>
                        <span className="text-xs text-muted-foreground">ATS Score</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">ATS Compatibility: {analysisResults.atsRecommendation}</h3>
                        <p className="text-muted-foreground mt-1">
                          Your resume is {analysisResults.overallScore >= 80 ? 'well-optimized' : analysisResults.overallScore >= 60 ? 'moderately optimized' : 'not yet optimized'} for Applicant Tracking Systems.
                        </p>
                      </div>
                      
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(analysisResults.scores.keywordMatch)}`}>
                            {analysisResults.scores.keywordMatch}%
                          </div>
                          <div className="text-xs text-muted-foreground">Keywords</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(analysisResults.scores.formatScore)}`}>
                            {analysisResults.scores.formatScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">Format</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(analysisResults.scores.completeness)}`}>
                            {analysisResults.scores.completeness}%
                          </div>
                          <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(analysisResults.scores.contentQuality)}`}>
                            {analysisResults.scores.contentQuality}%
                          </div>
                          <div className="text-xs text-muted-foreground">Quality</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sector Analysis - Only show if available */}
              {sectorData && (
                <Card className="bg-gradient-card border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <span>Sector-Specific Market Analysis (India)</span>
                    </CardTitle>
                    <CardDescription>
                      Current job market trends and demand analysis for {sectorData.detectedSector} sector in India
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Detected Sector</div>
                        <div className="text-xl font-semibold text-primary">{sectorData.detectedSector}</div>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Market Demand</div>
                        <div className="text-xl font-semibold text-green-600">{sectorData.sectorDemand}</div>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Hot Skills Match</div>
                        <div className="text-xl font-semibold text-blue-600">
                          {sectorData.matchedHotSkills?.length || 0}/{sectorData.hotSkills?.length || 0}
                        </div>
                      </div>
                    </div>

                    {/* India-Specific Salary Ranges */}
                    {sectorData.marketInsights && (
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          India Salary Ranges (₹)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Entry Level (0-2 yrs)</div>
                            <div className="text-lg font-bold text-emerald-600">{sectorData.marketInsights.entryLevelSalary || '₹3-6 LPA'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Mid Level (2-5 yrs)</div>
                            <div className="text-lg font-bold text-blue-600">{sectorData.marketInsights.midLevelSalary || '₹6-15 LPA'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Senior Level (5+ yrs)</div>
                            <div className="text-lg font-bold text-purple-600">{sectorData.marketInsights.seniorLevelSalary || '₹15-35 LPA'}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Top Cities: {sectorData.marketInsights.topHiringCities?.slice(0, 3).join(', ') || 'Bangalore, Hyderabad, Pune'}
                          </span>
                          <span className="text-muted-foreground">
                            Industry Growth: {sectorData.marketInsights.industryGrowth || '15%'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Hot Skills */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        In-Demand Skills for {sectorData.detectedSector}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sectorData.hotSkills?.map((skill: string, i: number) => (
                          <Badge 
                            key={i} 
                            variant={sectorData.matchedHotSkills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase())) ? "default" : "outline"}
                            className={sectorData.matchedHotSkills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase())) ? "bg-green-500" : ""}
                          >
                            {sectorData.matchedHotSkills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase())) && <CheckCircle className="h-3 w-3 mr-1" />}
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Trending Roles */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        Trending Roles in {sectorData.detectedSector}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sectorData.trendingRoles?.map((role: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-blue-50">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              {analysisResults.improvements.length > 0 && (
                <Card className="bg-gradient-card border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span>Improvements Needed</span>
                    </CardTitle>
                    <CardDescription>
                      Actionable suggestions to improve your ATS score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResults.improvements.map((improvement, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border ${getPriorityColor(improvement.priority)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {improvement.priority === 'high' ? (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              ) : improvement.priority === 'medium' ? (
                                <Target className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="font-medium">{improvement.category}</span>
                              <Badge variant="outline" className="text-xs">
                                {improvement.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="mt-2 font-medium">{improvement.suggestion}</p>
                          <p className="text-sm text-muted-foreground mt-1">{improvement.details}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Keyword Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Keywords */}
                <Card className="bg-gradient-card border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Matched Keywords</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResults.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.matchedKeywords.map((keyword, index) => (
                          <Badge key={index} className="bg-green-100 text-green-700 border-green-200">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No keywords matched. Add a job description for keyword matching.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Missing Keywords */}
                <Card className="bg-gradient-card border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span>Missing Keywords</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResults.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.missingKeywords.map((keyword, index) => (
                          <Badge key={index} className="bg-red-100 text-red-700 border-red-200">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">All important keywords are present!</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Parsed Resume Details */}
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Resume Analysis Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  {analysisResults.parsedResume.contact && Object.keys(analysisResults.parsedResume.contact).length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('contact')}
                        className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Contact Information</span>
                        </div>
                        {expandedSections.contact ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {expandedSections.contact && (
                        <div className="mt-2 pl-4 space-y-2">
                          {analysisResults.parsedResume.contact.name && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{analysisResults.parsedResume.contact.name}</span>
                            </div>
                          )}
                          {analysisResults.parsedResume.contact.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{analysisResults.parsedResume.contact.email}</span>
                            </div>
                          )}
                          {analysisResults.parsedResume.contact.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{analysisResults.parsedResume.contact.phone}</span>
                            </div>
                          )}
                          {analysisResults.parsedResume.contact.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{analysisResults.parsedResume.contact.location}</span>
                            </div>
                          )}
                          {analysisResults.parsedResume.contact.linkedin && (
                            <div className="flex items-center gap-2 text-sm">
                              <Linkedin className="h-3 w-3 text-muted-foreground" />
                              <span>{analysisResults.parsedResume.contact.linkedin}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  {(analysisResults.parsedResume.skills.technical.length > 0 || 
                    analysisResults.parsedResume.skills.soft.length > 0 ||
                    analysisResults.parsedResume.skills.tools.length > 0) && (
                    <div>
                      <button
                        onClick={() => toggleSection('skills')}
                        className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <span className="font-medium">Skills ({analysisResults.parsedResume.skills.technical.length + analysisResults.parsedResume.skills.soft.length + analysisResults.parsedResume.skills.tools.length})</span>
                        </div>
                        {expandedSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {expandedSections.skills && (
                        <div className="mt-2 pl-4 space-y-3">
                          {analysisResults.parsedResume.skills.technical.length > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground">Technical</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResults.parsedResume.skills.technical.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysisResults.parsedResume.skills.soft.length > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground">Soft Skills</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResults.parsedResume.skills.soft.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysisResults.parsedResume.skills.tools.length > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground">Tools</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResults.parsedResume.skills.tools.map((tool, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{tool}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Experience */}
                  {analysisResults.parsedResume.experience.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('experience')}
                        className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-medium">Experience ({analysisResults.parsedResume.experience.length})</span>
                        </div>
                        {expandedSections.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {expandedSections.experience && (
                        <div className="mt-2 pl-4 space-y-3">
                          {analysisResults.parsedResume.experience.map((exp, i) => (
                            <div key={i} className="border-l-2 border-primary/30 pl-3">
                              <div className="font-medium">{exp.title}</div>
                              <div className="text-sm text-muted-foreground">{exp.company} | {exp.duration}</div>
                              {exp.description && (
                                <div className="text-sm mt-1">{exp.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Education */}
                  {analysisResults.parsedResume.education.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('education')}
                        className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-medium">Education ({analysisResults.parsedResume.education.length})</span>
                        </div>
                        {expandedSections.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {expandedSections.education && (
                        <div className="mt-2 pl-4 space-y-2">
                          {analysisResults.parsedResume.education.map((edu, i) => (
                            <div key={i}>
                              <div className="font-medium">{edu.degree}</div>
                              <div className="text-sm text-muted-foreground">{edu.institution} {edu.year && `| ${edu.year}`}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Certifications */}
                  {analysisResults.parsedResume.certifications.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('certifications')}
                        className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">Certifications ({analysisResults.parsedResume.certifications.length})</span>
                        </div>
                        {expandedSections.certifications ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {expandedSections.certifications && (
                        <div className="mt-2 pl-4 flex flex-wrap gap-2">
                          {analysisResults.parsedResume.certifications.map((cert, i) => (
                            <Badge key={i} variant="outline">{cert}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Languages */}
                  {analysisResults.parsedResume.languages.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('languages')}
                        className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          <span className="font-medium">Languages ({analysisResults.parsedResume.languages.length})</span>
                        </div>
                        {expandedSections.languages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {expandedSections.languages && (
                        <div className="mt-2 pl-4 flex flex-wrap gap-2">
                          {analysisResults.parsedResume.languages.map((lang, i) => (
                            <Badge key={i} variant="outline">
                              {lang.language} ({lang.proficiency})
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button className="w-full max-w-xs" variant="default">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button className="w-full max-w-xs" variant="outline">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Apply to Jobs
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
