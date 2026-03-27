import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Clean, Simple Icons with good contrast
const Icons = {
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 5-6" />
    </svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Compass: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  Document: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Arrow: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  TrendingDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  ),
  Dollar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Layers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Share: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Loader: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin">
      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
  Lightbulb: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  Brain: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  Rocket: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Award: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

interface UserProfileData {
  resumeText?: string;
  atsAnalysis?: any;
  aiAssessment?: any;
  resume?: any;
  userSector?: string;
}

interface GeneratedReport {
  id?: string;
  generatedAt: string;
  reportTypes: string[];
  summary?: {
    overallScore: number;
    scores: {
      skills: number;
      career: number;
      market: number;
      resume: number;
    };
    keyFindings: string[];
    nextActions: string[];
  };
  reports?: {
    skills?: any;
    career?: any;
    market?: any;
    resume?: any;
  };
}

export function ReportGeneration() {
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>(['skills', 'career', 'market', 'resume']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<GeneratedReport[]>([]);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "view" | "history">("generate");
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const fetchUserProfileData = async () => {
    if (!currentUser?.uid) {
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      setDataError(null);
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfileData(data as UserProfileData);
      } else {
        setUserProfileData({});
      }
    } catch (error) {
      console.error('Error fetching user profile data:', error);
      setDataError('Failed to load profile data.');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchReportHistory = async () => {
    if (!currentUser?.uid) return;
    
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/reports/user/${currentUser.uid}`);
      if (response.ok) {
        const data = await response.json();
        setReportHistory(data.reports || []);
      }
    } catch (error) {
      console.error("Error fetching report history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      fetchUserProfileData();
      fetchReportHistory();
    }
  }, [currentUser?.uid]);

  const handleRefresh = () => {
    if (currentUser?.uid) {
      fetchUserProfileData();
      fetchReportHistory();
    }
  };

  const reportOptions = [
    { id: "skills", label: "Skills Assessment", icon: Icons.Brain, description: "Analyze your technical & soft skills" },
    { id: "career", label: "Career Path", icon: Icons.Compass, description: "Career trajectory with scope analysis" },
    { id: "market", label: "Job Market Fit", icon: Icons.Chart, description: "India-specific market analysis" },
    { id: "resume", label: "Resume Improvement", icon: Icons.Document, description: "Actionable improvements" },
  ];

  const handleReportTypeToggle = (reportId: string) => {
    setSelectedReportTypes(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleGenerateReport = async () => {
    if (!currentUser?.uid) {
      toast({
        title: "Login Required",
        description: "Please login to generate reports",
        variant: "destructive",
      });
      return;
    }

    const reportTypesToGenerate = selectedReportTypes.length > 0 
      ? selectedReportTypes 
      : ['skills', 'career', 'market', 'resume'];

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          reportTypes: reportTypesToGenerate,
          userData: userProfileData || {}
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentReport(data.report);
        setReportHistory(prev => [data.report, ...prev]);
        setActiveTab("view");
        
        toast({
          title: "Report Generated Successfully!",
          description: `Your ${reportTypesToGenerate.length} report(s) are ready`,
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const viewReport = (report: GeneratedReport) => {
    setCurrentReport(report);
    setActiveTab("view");
  };

  const hasUserData = userProfileData && (
    userProfileData.resumeText || 
    userProfileData.atsAnalysis || 
    userProfileData.aiAssessment ||
    userProfileData.resume
  );

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-emerald-600 dark:bg-emerald-500";
    if (score >= 60) return "bg-amber-600 dark:bg-amber-500";
    return "bg-rose-600 dark:bg-rose-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Icons.Document className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              Career Report Generation
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              AI-powered insights based on India's job market (2024-2025)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <Icons.Refresh className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg mb-6">
            <TabsTrigger value="generate" className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">
              Generate
            </TabsTrigger>
            <TabsTrigger value="view" disabled={!currentReport} className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">
              View Report
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">
              History ({reportHistory.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Generate Tab */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Select Report Types</CardTitle>
                    <CardDescription className="dark:text-gray-400">Choose the insights you need</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dataLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Icons.Loader />
                        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading profile data...</span>
                      </div>
                    ) : dataError ? (
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <Icons.Alert />
                          <span>{dataError}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`mb-4 p-3 rounded-lg ${hasUserData ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                        <div className="flex items-center gap-2">
                          {hasUserData ? (
                            <>
                              <Icons.Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Data loaded - Ready for personalized reports
                              </span>
                            </>
                          ) : (
                            <>
                              <Icons.Alert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                Limited data - basic reports will be generated
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reportOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedReportTypes.includes(option.id);
                        return (
                          <div 
                            key={option.id}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-gray-800 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                            onClick={() => handleReportTypeToggle(option.id)}
                          >
                            <Checkbox 
                              id={option.id}
                              checked={isSelected}
                              onCheckedChange={() => handleReportTypeToggle(option.id)}
                            />
                            <Icon />
                            <div className="flex-1">
                              <Label htmlFor={option.id} className="font-medium cursor-pointer dark:text-white">
                                {option.label}
                              </Label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300">
                      <Icons.Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button 
                      onClick={handleGenerateReport}
                      disabled={isGenerating || selectedReportTypes.length === 0 || !currentUser?.uid}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      {isGenerating ? (
                        <>
                          <Icons.Loader className="mr-2 h-4 w-4" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Icons.Sparkles className="mr-2 h-4 w-4" />
                          Generate Reports
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Preview */}
              <div className="bg-gray-800 dark:bg-gray-700 rounded-lg p-6 text-white">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icons.Star className="w-5 h-5 text-amber-400" />
                  What You'll Get
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Icons.Star, title: "Overall Score", desc: "Career readiness score" },
                    { icon: Icons.Brain, title: "Skills Analysis", desc: "Technical & soft skills" },
                    { icon: Icons.Compass, title: "Career Paths", desc: "Best-fit trajectories" },
                    { icon: Icons.Chart, title: "Market Insights", desc: "India job trends" },
                    { icon: Icons.Document, title: "Resume Tips", desc: "Actionable improvements" },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-300" />
                        <div>
                          <div className="text-sm font-medium">{item.title}</div>
                          <div className="text-xs text-gray-400">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-amber-500/20 rounded-lg border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-300 text-sm">
                    <Icons.Zap className="w-4 h-4" />
                    Real-time India market data
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* View Report Tab */}
          <TabsContent value="view">
            {currentReport ? (
              <div className="space-y-6">
                {/* Overall Summary */}
                {currentReport.summary && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Icons.Star className="w-5 h-5 text-amber-500" />
                        Overall Career Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Score Circle */}
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                            <circle
                              cx="64" cy="64" r="56"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeDasharray={`${(currentReport.summary.overallScore / 100) * 352} 352`}
                              strokeLinecap="round"
                              className={getScoreColor(currentReport.summary.overallScore).replace('text-', 'text-')}
                              style={{ stroke: 'currentColor' }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-bold ${getScoreColor(currentReport.summary.overallScore)}`}>
                              {currentReport.summary.overallScore}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Score Cards */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                          {[
                            { key: 'skills', label: 'Skills', icon: Icons.Brain },
                            { key: 'career', label: 'Career', icon: Icons.Compass },
                            { key: 'market', label: 'Market', icon: Icons.Chart },
                            { key: 'resume', label: 'Resume', icon: Icons.Document },
                          ].map((item) => {
                            const Icon = item.icon;
                            const score = currentReport.summary?.scores?.[item.key as keyof typeof currentReport.summary.scores] || 0;
                            return (
                              <div key={item.key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                                <Icon className="w-4 h-4 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
                                <div className={`text-xl font-bold ${getScoreColor(score)}`}>{score}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Key Findings */}
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="font-medium mb-3 dark:text-white">Key Insights:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {currentReport.summary.keyFindings?.map((finding, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm dark:text-gray-300">
                              <Icons.Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {finding}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Report */}
                {currentReport.reports?.skills && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Icons.Brain className="w-5 h-5" />
                        Skills Assessment (India Market)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentReport.reports.skills.totalSkills}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentReport.reports.skills.technicalSkills?.length || 0}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Technical</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentReport.reports.skills.softSkills?.length || 0}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Soft</div>
                        </div>
                      </div>

                      {/* Sector */}
                      {currentReport.reports.skills.detectedSector && (
                        <div className="p-4 bg-gray-800 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-gray-400 text-sm">Detected Sector:</span>
                              <span className="ml-2 font-semibold text-white">{currentReport.reports.skills.detectedSector}</span>
                            </div>
                            <Badge variant="outline" className="bg-emerald-900/30 text-emerald-400 border-emerald-700">
                              {(currentReport.reports.skills.sectorData as any)?.demand || 'Medium'} Demand
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <div>
                              <div className="text-emerald-400 font-semibold">
                                {(currentReport.reports.skills.sectorData as any)?.growth || 'N/A'}
                              </div>
                              <div className="text-gray-400">Growth</div>
                            </div>
                            <div>
                              <div className="text-white font-semibold">
                                {(currentReport.reports.skills.sectorData as any)?.outlook || 'N/A'}
                              </div>
                              <div className="text-gray-400">Outlook</div>
                            </div>
                            <div>
                              <div className="text-violet-400 font-semibold">
                                {currentReport.reports.skills.hotSkillsMatch?.matchPercentage ? `${currentReport.reports.skills.hotSkillsMatch.matchPercentage}%` : 'N/A'}
                              </div>
                              <div className="text-gray-400">Match</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Skills Match */}
                      {currentReport.reports.skills.hotSkillsMatch && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 dark:text-white flex items-center gap-2">
                              <Icons.Check className="h-4 w-4 text-emerald-500" />
                              Matched Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentReport.reports.skills.hotSkillsMatch.matched?.slice(0, 6).map((skill: string, i: number) => (
                                <Badge key={i} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 dark:text-white flex items-center gap-2">
                              <Icons.Alert className="h-4 w-4 text-amber-500" />
                              Skills to Learn
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentReport.reports.skills.hotSkillsMatch.missing?.slice(0, 6).map((skill: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Recommendations */}
                      {currentReport.reports.skills.recommendations?.length > 0 && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <h4 className="font-medium mb-3 dark:text-white flex items-center gap-2">
                            <Icons.Lightbulb className="h-4 w-4 text-amber-500" />
                            Recommendations
                          </h4>
                          <div className="space-y-2">
                            {currentReport.reports.skills.recommendations.map((rec: any, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <Badge variant={rec.priority === 'high' ? 'destructive' : 'outline'} className="text-xs mt-0.5">
                                  {rec.priority}
                                </Badge>
                                <div>
                                  <p className="dark:text-gray-200">{rec.suggestion}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{rec.impact}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Career Path Report */}
                {currentReport.reports?.career && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Icons.Compass className="w-5 h-5" />
                        Career Path Analysis (India)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {/* Scope Analysis */}
                      {currentReport.reports.career.scopeAnalysis && (
                        <div className="p-4 bg-gray-800 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-gray-400 text-sm">Current Sector:</span>
                              <span className="ml-2 font-semibold text-white">
                                {(currentReport.reports.career.scopeAnalysis as any)?.currentSector || 'N/A'}
                              </span>
                            </div>
                            <Badge className={
                              (currentReport.reports.career.scopeAnalysis as any)?.demand === 'Very High' 
                                ? 'bg-emerald-600' 
                                : 'bg-amber-600'
                            }>
                              {(currentReport.reports.career.scopeAnalysis as any)?.demand || 'Medium'} Demand
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-center text-sm">
                            <div>
                              <div className="text-white font-semibold">
                                {(currentReport.reports.career.scopeAnalysis as any)?.scope || 'N/A'}
                              </div>
                              <div className="text-gray-400">Scope</div>
                            </div>
                            <div>
                              <div className="text-emerald-400 font-semibold">
                                {(currentReport.reports.career.scopeAnalysis as any)?.growth || 'N/A'}
                              </div>
                              <div className="text-gray-400">Growth</div>
                            </div>
                            <div>
                              <div className="text-violet-400 font-semibold">
                                {Array.isArray((currentReport.reports.career.scopeAnalysis as any)?.topCities) 
                                  ? ((currentReport.reports.career.scopeAnalysis as any).topCities as string[]).slice(0, 2).join(', ') 
                                  : 'N/A'}
                              </div>
                              <div className="text-gray-400">Top Cities</div>
                            </div>
                            <div>
                              <div className={
                                (currentReport.reports.career.scopeAnalysis as any)?.shouldConsiderSwitch 
                                  ? 'text-amber-400' 
                                  : 'text-emerald-400'
                              }>
                                {(currentReport.reports.career.scopeAnalysis as any)?.shouldConsiderSwitch ? 'Consider' : 'Stay'}
                              </div>
                              <div className="text-gray-400">Recommendation</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Career Paths */}
                      {currentReport.reports.career.careerPaths?.map((path: any, i: number) => (
                        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={path.level === 'Primary' ? 'default' : 'outline'}>
                                {path.level}
                              </Badge>
                              <h4 className="font-semibold dark:text-white">{path.title}</h4>
                            </div>
                            <Badge className={getScoreBg(path.matchScore)}>
                              {path.matchScore}% Match
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Icons.Dollar className="w-4 h-4 text-emerald-500" />
                              <span className="dark:text-gray-300">{path.salaryRange?.entry || '₹6-12L'} - {path.salaryRange?.mid || '₹12-25L'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icons.TrendingUp className="w-4 h-4 text-violet-500" />
                              <span className="dark:text-gray-300">{path.growthPotential}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icons.Users className="w-4 h-4 text-purple-500" />
                              <span className="dark:text-gray-300">{path.companiesHiring}+</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icons.Target className="w-4 h-4 text-amber-500" />
                              <span className="dark:text-gray-300">{path.demand}</span>
                            </div>
                          </div>
                          {path.nextSteps?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Next Steps:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {path.nextSteps.map((step: string, si: number) => (
                                  <span key={si} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                                    <Icons.Arrow className="w-3 h-3" />{step}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Switch Recommendations */}
                      {currentReport.reports.career.scopeAnalysis?.switchRecommendations?.length > 0 && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <h4 className="font-medium mb-3 text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <Icons.TrendingDown className="h-4 w-4" />
                            Better Opportunities
                          </h4>
                          <div className="space-y-2">
                            {currentReport.reports.career.scopeAnalysis.switchRecommendations.map((rec: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                <div>
                                  <span className="font-medium dark:text-white">{rec.sector}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{rec.reason}</span>
                                </div>
                                <Badge variant="outline">{rec.avgSalary?.mid}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Market Fit Report */}
                {currentReport.reports?.market && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Icons.Chart className="w-5 h-5" />
                        Job Market Fit (India 2024-2025)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {/* Scores */}
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { key: 'atsScore', label: 'ATS' },
                          { key: 'keywordMatch', label: 'Keywords' },
                          { key: 'formatScore', label: 'Format' },
                          { key: 'completeness', label: 'Complete' },
                          { key: 'contentQuality', label: 'Quality' },
                        ].map((item) => {
                          const score = currentReport.reports.market.marketFit?.[item.key as keyof typeof currentReport.reports.market.marketFit] || 0;
                          return (
                            <div key={item.key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                              <div className={`text-lg font-bold ${getScoreColor(score)}`}>{score}%</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Sector Data */}
                      {currentReport.reports.market.sectorData && (
                        <div className="p-4 bg-gray-800 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-lg font-semibold text-white">
                                {typeof currentReport.reports.market.sectorData === 'object' && currentReport.reports.market.sectorData !== null
                                  ? (currentReport.reports.market.sectorData as any).detectedSector || 'Technology'
                                  : String(currentReport.reports.market.sectorData || 'Technology')}
                              </span>
                            </div>
                            <Badge className="bg-emerald-600">
                              {typeof currentReport.reports.market.sectorData === 'object' && currentReport.reports.market.sectorData !== null
                                ? (currentReport.reports.market.sectorData as any).demand || 'Medium'
                                : 'Medium'} Demand
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                            <div className="p-2 bg-white/10 rounded">
                              <div className="text-emerald-400 font-semibold">
                                {typeof currentReport.reports.market.sectorData === 'object' && currentReport.reports.market.sectorData !== null
                                  ? (currentReport.reports.market.sectorData as any).avgSalary?.entry || '₹6-12L'
                                  : '₹6-12L'}
                              </div>
                              <div className="text-gray-400 text-xs">Entry</div>
                            </div>
                            <div className="p-2 bg-white/10 rounded">
                              <div className="text-violet-400 font-semibold">
                                {typeof currentReport.reports.market.sectorData === 'object' && currentReport.reports.market.sectorData !== null
                                  ? (currentReport.reports.market.sectorData as any).avgSalary?.mid || '₹12-25L'
                                  : '₹12-25L'}
                              </div>
                              <div className="text-gray-400 text-xs">Mid</div>
                            </div>
                            <div className="p-2 bg-white/10 rounded">
                              <div className="text-amber-400 font-semibold">
                                {typeof currentReport.reports.market.sectorData === 'object' && currentReport.reports.market.sectorData !== null
                                  ? (currentReport.reports.market.sectorData as any).avgSalary?.senior || '₹25-50L'
                                  : '₹25-50L'}
                              </div>
                              <div className="text-gray-400 text-xs">Senior</div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div>
                              <span className="text-gray-400">Cities:</span>
                              <span className="ml-2 text-white">
                                {typeof currentReport.reports.market.sectorData === 'object' && currentReport.reports.market.sectorData !== null && Array.isArray((currentReport.reports.market.sectorData as any).topCities)
                                  ? (currentReport.reports.market.sectorData as any).topCities.slice(0, 3).join(', ')
                                  : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Growth:</span>
                              <span className="ml-2 text-emerald-400">
                                {typeof currentReport.reports.market.sectorData === 'object' && currentReport.reports.market.sectorData !== null
                                  ? (currentReport.reports.market.sectorData as any).growth || 'N/A'
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Companies */}
                      {(currentReport.reports.market.sectorData as any)?.topCompanies && (
                        <div>
                          <h4 className="font-medium mb-2 dark:text-white flex items-center gap-2">
                            <Icons.Building className="h-4 w-4" />
                            Top Hiring Companies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray((currentReport.reports.market.sectorData as any).topCompanies) 
                              ? ((currentReport.reports.market.sectorData as any).topCompanies as string[]).slice(0, 10).map((company: string, i: number) => (
                                <Badge key={i} variant="outline" className="dark:border-gray-600 dark:text-gray-300">{company}</Badge>
                              )) 
                              : null}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Resume Report */}
                {currentReport.reports?.resume && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Icons.Document className="w-5 h-5" />
                        Resume & Learning Path
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {/* Score */}
                      {(currentReport.reports.resume as any)?.overallScore !== undefined && (
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`text-4xl font-bold ${getScoreColor((currentReport.reports.resume as any).overallScore)}`}>
                              {(currentReport.reports.resume as any).overallScore}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Resume Score</div>
                          </div>
                          <div className="flex-1">
                            <Progress value={(currentReport.reports.resume as any).overallScore} className="h-3" />
                          </div>
                        </div>
                      )}
                      
                      {/* Projects */}
                      {(currentReport.reports.resume as any)?.projectRecommendations?.length > 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <h4 className="font-medium mb-3 dark:text-white flex items-center gap-2">
                            <Icons.Layers className="h-4 w-4" />
                            Project Recommendations
                          </h4>
                          <div className="space-y-2">
                            {((currentReport.reports.resume as any).projectRecommendations as any[]).map((proj: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                <div>
                                  <span className="font-medium dark:text-white">{proj.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">{proj.difficulty}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">{proj.demand}</Badge>
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400">{proj.salary}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Learning Paths */}
                      {(currentReport.reports.resume as any)?.learningPaths?.length > 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <h4 className="font-medium mb-3 dark:text-white flex items-center gap-2">
                            <Icons.Book className="h-4 w-4" />
                            Learning Path
                          </h4>
                          <div className="space-y-2">
                            {((currentReport.reports.resume as any).learningPaths as any[]).map((path: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                <div className="flex items-center gap-2">
                                  <Badge variant={path.priority === 'Critical' ? 'destructive' : path.priority === 'High' ? 'default' : 'outline'} className="text-xs">
                                    {path.priority}
                                  </Badge>
                                  <span className="dark:text-white">{path.skill}</span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{path.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {(currentReport.reports.resume as any)?.suggestions?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 dark:text-white">Resume Improvements</h4>
                          <div className="space-y-2">
                            {((currentReport.reports.resume as any).suggestions as any[]).slice(0, 5).map((sug: any, i: number) => (
                              <div key={i} className={`p-3 rounded-lg border ${
                                sug.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                                sug.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                                'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <Badge variant={sug.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
                                    {sug.priority}
                                  </Badge>
                                  <span className="text-sm font-medium dark:text-white">{sug.category}</span>
                                </div>
                                <p className="text-sm mt-1 dark:text-gray-300">{sug.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
                    <Icons.Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Icons.Document className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2 dark:text-white">No Report Generated</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Generate a report to view your career analysis</p>
                <Button onClick={() => setActiveTab("generate")} className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700">
                  Generate Report
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <Icons.Clock className="w-5 h-5" />
                  Report History
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Access your previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Icons.Loader />
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Loading history...</span>
                  </div>
                ) : reportHistory.length > 0 ? (
                  <div className="space-y-3">
                    {reportHistory.map((report, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer bg-white dark:bg-gray-800"
                        onClick={() => viewReport(report)}
                      >
                        <div className="flex items-center gap-3">
                          <Icons.Document className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="font-medium dark:text-white">
                              {report.reportTypes?.join(", ") || "Career Report"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Generated {new Date(report.generatedAt).toLocaleDateString()}
                            </p>
                            {report.summary && (
                              <Badge variant="outline" className="mt-1">
                                Score: {report.summary.overallScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          viewReport(report);
                        }}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Icons.Document className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reports generated yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ReportGeneration;
