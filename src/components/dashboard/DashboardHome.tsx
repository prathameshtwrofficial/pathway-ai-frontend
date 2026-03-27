import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuizProgress } from "@/components/dashboard/QuizProgress";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ArrowRight, Target, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function DashboardHome() {
  const { currentUser, userData, loading } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [careerDialogOpen, setCareerDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [savingCareer, setSavingCareer] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [careerData, setCareerData] = useState({
    education: "",
    skills: "",
    interests: "",
    experience: "",
    careerGoals: ""
  });

  const [quizData, setQuizData] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: ""
  });

  const [recommendedResources, setRecommendedResources] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  // AI Assessment data from Firestore
  const [aiAssessment, setAiAssessment] = useState<any>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(true);

  // Fetch AI assessment from Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setAssessmentLoading(false);
      return;
    }

    // Set up real-time listener for AI assessment (stored at user document level)
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, 
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Check for aiAssessment field at the user document level
            // Also support the new top-level fields
            if (data.aiAssessment) {
              console.log("AI Assessment data:", data.aiAssessment);
              setAiAssessment(data.aiAssessment);
            } else if (data.userRecommendations && data.userRecommendations.length > 0) {
              // Support new top-level fields format from CareerQuiz v4.0
              console.log("Using top-level assessment data");
              setAiAssessment({
                recommendations: data.userRecommendations,
                matchedOccupations: data.matchedOccupations || [],
                selectedSector: data.userSector,
                recommendedSkills: data.userRecommendedSkills,
                assessmentVersion: data.lastAssessmentVersion
              });
            } else {
              setAiAssessment(null);
            }
          } else {
            setAiAssessment(null);
          }
        } catch (err) {
          console.error("Error reading AI assessment:", err);
          setAiAssessment(null);
        } finally {
          setAssessmentLoading(false);
        }
      },
      (error) => {
        // Error callback for onSnapshot
        console.error("Firestore error for AI assessment:", error);
        setAssessmentLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Fetch recommended resources from API or use assessment data
  useEffect(() => {
    const fetchResources = async () => {
      setResourcesLoading(true);
      try {
        // First, try to use resources from AI assessment
        if (aiAssessment?.recommendedResources && aiAssessment.recommendedResources.length > 0) {
          setRecommendedResources(aiAssessment.recommendedResources.slice(0, 3).map((r: string, i: number) => ({
            id: `resource-${i}`,
            title: r,
            description: `Recommended resource for your ${aiAssessment.selectedSector || 'selected'} career path`
          })));
          setResourcesLoading(false);
          return;
        }
        
        // Fallback to API
        const response = await fetch('/api/resources');
        if (response.ok) {
          const data = await response.json();
          if (data.resources && data.resources.length > 0) {
            setRecommendedResources(data.resources.slice(0, 3));
          }
        }
      } catch (error) {
        console.log("Using fallback resources - API not available");
      } finally {
        setResourcesLoading(false);
      }
    };

    // Fetch resources if we have AI assessment or legacy career assessment
    if (aiAssessment || userProfile?.careerAssessment?.interests) {
      fetchResources();
    }
  }, [aiAssessment, userProfile?.careerAssessment?.interests]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setProfileLoading(false);
      return;
    }

    console.log("Setting up real-time listener for user:", currentUser.uid);

    // Set up real-time listener for user profile
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      try {
        console.log("Received user profile update:", docSnap.exists());
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("User profile data:", data);
          setUserProfile(data);
        } else {
          // New user - no profile data yet
          console.log("No user profile data found - this is normal for new users");
          setUserProfile(null);
        }
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error processing user profile data:", err);
        // Don't set error for data processing issues - just use null profile
        setUserProfile(null);
      }
      setProfileLoading(false);
    }, (error) => {
      console.error("Error listening to user profile:", error);
      // Don't show error for missing data - just load with empty profile
      setUserProfile(null);
      setError(null);
      setProfileLoading(false);
    });

    return unsubscribe;
  }, [currentUser, retryCount]);

  // Update user activity every 10 seconds
  useEffect(() => {
    if (!currentUser?.uid) return;

    const updateActivity = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          lastActivity: new Date(),
          // You can add more progress tracking here
        });
      } catch (error) {
        console.error("Error updating user activity:", error);
      }
    };

    // Update immediately
    updateActivity();

    // Set up interval for every 10 seconds
    const interval = setInterval(updateActivity, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSavingCareer(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        careerAssessment: careerData,
        careerAssessmentCompleted: true,
        careerAssessmentDate: new Date()
      });

      setCareerDialogOpen(false);
      toast({
        title: "Career Assessment Saved!",
        description: "Your career preferences have been recorded.",
      });
    } catch (error) {
      console.error("Error saving career assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save career assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingCareer(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSavingQuiz(true);
    try {
      // Calculate score based on answers (simple implementation)
      let score = 0;
      if (quizData.question1 === "technology") score += 25;
      if (quizData.question2 === "problem-solving") score += 25;
      if (quizData.question3 === "teamwork") score += 25;
      score += 25; // Base score

      const quizResult = {
        ...quizData,
        score: score,
        totalQuestions: 4,
        completedAt: new Date()
      };

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        quizResults: userProfile?.quizResults ? [...userProfile.quizResults, quizResult] : [quizResult],
        lastQuizDate: new Date()
      });

      setQuizDialogOpen(false);
      toast({
        title: "Quiz Completed!",
        description: `You scored ${score}%. Results saved to your profile.`,
      });
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingQuiz(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't show errors for missing data - just load with empty state
  // Only show error if it's a critical Firebase connection issue
  if (error && retryCount < 3) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => setRetryCount(prev => prev + 1)}>
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const displayName = currentUser?.displayName || userData?.displayName || 'User';

  try {
    console.log("Rendering DashboardHome component", { currentUser, userData, userProfile, loading, profileLoading });

    return (
      <div className="space-y-4 px-2 md:px-0">
        {/* Mobile-friendly header */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Welcome back, {displayName}! Here's your learning progress.
          </p>
        </div>

        {/* User Welcome Card - Mobile optimized */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              Welcome, {displayName}! 👋
            </CardTitle>
            <CardDescription className="text-sm">
              {userProfile ? "Your progress is being tracked in real-time" : "Complete your profile to get personalized recommendations"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Mobile: 2x2 grid, Desktop: 4 column grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="text-center p-2 md:p-0">
                <div className="text-xl md:text-2xl font-bold text-primary">
                  {/* Show 1 if AI assessment completed, otherwise count quizzes */}
                  {aiAssessment?.recommendations || userProfile?.hasCompletedAssessment ? "1" : 
                    (Array.isArray(userProfile?.careerQuizAttempts) ? userProfile.careerQuizAttempts.length : 0)}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Assessments</div>
              </div>
              <div className="text-center p-2 md:p-0">
                <div className="text-xl md:text-2xl font-bold text-accent">
                  {userProfile?.resume ? "1" : "0"}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Resume Uploaded</div>
              </div>
              <div className="text-center p-2 md:p-0">
                <div className="text-lg md:text-2xl font-bold text-green-600">
                  {/* Show sector if assessment completed */}
                  {aiAssessment?.selectedSector ? 
                    aiAssessment.selectedSector.charAt(0).toUpperCase() + aiAssessment.selectedSector.slice(1) :
                    (userProfile?.learningProgress ? "Active" : "Not Started")}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">{aiAssessment?.selectedSector ? "Sector" : "Status"}</div>
              </div>
              <div className="text-center p-2 md:p-0">
                <div className="text-lg md:text-2xl font-bold text-blue-600">
                  {userProfile ? "Returning" : "New"}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">User Status</div>
              </div>
            </div>
            {userProfile?.lastActivity && (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Last active: {userProfile.lastActivity?.toDate ? new Date(userProfile.lastActivity.toDate()).toLocaleString() : 'Recently'}
                </p>
              </div>
            )}
            {(!userProfile || ((!userProfile.careerQuizAttempts || userProfile.careerQuizAttempts.length === 0) && !userProfile.resume)) && (
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs md:text-sm text-yellow-800 text-center">
                  👋 Welcome! Complete your profile by uploading a resume and taking the career quiz to get personalized recommendations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile-first grid layout */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Career Path Card - Full width on mobile, spans 2 on larger screens */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Target className="h-5 w-5" />
                {aiAssessment?.recommendations ? 'Your AI Career Match' : 'Your Career Path'}
              </CardTitle>
              <CardDescription className="text-sm">
                {aiAssessment?.recommendations 
                  ? 'Based on your AI-powered assessment' 
                  : 'Track your progress towards your career goals'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* AI Assessment Results */}
              {aiAssessment?.recommendations && aiAssessment.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {aiAssessment.recommendations.slice(0, 3).map((rec: any, index: number) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-primary">{rec.title}</h4>
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                          {rec.match}% Match
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{rec.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {rec.salaryRange && <span>💰 {rec.salaryRange}</span>}
                        {rec.growthPotential && <span>📈 {rec.growthPotential}</span>}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show recommended skills if available */}
                  {aiAssessment?.recommendedSkills && aiAssessment.recommendedSkills.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Recommended Skills
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {aiAssessment.recommendedSkills.slice(0, 6).map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show matched occupations if available */}
                  {aiAssessment?.matchedOccupations && aiAssessment.matchedOccupations.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Top Career Matches
                      </h5>
                      <div className="space-y-2">
                        {aiAssessment.matchedOccupations.slice(0, 3).map((occ: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <span className="font-medium text-sm">{occ.title}</span>
                              <span className="text-xs text-muted-foreground ml-2">({occ.category})</span>
                            </div>
                            <span className="text-xs font-medium text-primary">{occ.matchScore}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => {
                      localStorage.setItem('assessmentRetake', 'true');
                      window.location.href = '/career-quiz';
                    }}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Retake Assessment
                  </Button>
                </div>
              ) : userProfile?.careerAssessment ? (
                <div className="space-y-3 md:space-y-4">
                  <div className="p-3 md:p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm md:text-base">Your Career Assessment</h4>
                    {/* Mobile: Single column, Desktop: 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block mb-1">Education:</span>
                        <p className="font-medium">{userProfile.careerAssessment.education}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Skills:</span>
                        <p className="font-medium">{userProfile.careerAssessment.skills}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Interests:</span>
                        <p className="font-medium">{userProfile.careerAssessment.interests}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Experience:</span>
                        <p className="font-medium">{userProfile.careerAssessment.experience}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => setCareerDialogOpen(true)}>
                    <Target className="mr-2 h-4 w-4" />
                    Update Career Assessment
                  </Button>
                </div>
              ) : (
                <div className="h-[180px] md:h-[200px] flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 px-4">
                  <Target className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                  <p className="text-sm md:text-base text-muted-foreground">Complete your career assessment to see personalized recommendations</p>
                  <Button size="sm" className="w-full md:w-auto" onClick={() => setCareerDialogOpen(true)}>
                    <Target className="mr-2 h-4 w-4" />
                    See Careers
                  </Button>
                </div>
              )}

              {/* Career Assessment Dialog - Always rendered */}
              <Dialog open={careerDialogOpen} onOpenChange={setCareerDialogOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl">Career Assessment</DialogTitle>
                    <DialogDescription className="text-sm">
                      Tell us about yourself to get personalized career recommendations
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCareerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-sm">Education Level</Label>
                      <Select value={careerData.education} onValueChange={(value) => setCareerData(prev => ({ ...prev, education: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                          <SelectItem value="masters">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills" className="text-sm">Your Main Skills</Label>
                      <Textarea
                        id="skills"
                        placeholder="e.g., JavaScript, Python, React, Data Analysis..."
                        value={careerData.skills}
                        onChange={(e) => setCareerData(prev => ({ ...prev, skills: e.target.value }))}
                        required
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests" className="text-sm">Career Interests</Label>
                      <Textarea
                        id="interests"
                        placeholder="e.g., Technology, Healthcare, Finance, Education..."
                        value={careerData.interests}
                        onChange={(e) => setCareerData(prev => ({ ...prev, interests: e.target.value }))}
                        required
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm">Years of Experience</Label>
                      <Select value={careerData.experience} onValueChange={(value) => setCareerData(prev => ({ ...prev, experience: value }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goals" className="text-sm">Career Goals</Label>
                      <Textarea
                        id="goals"
                        placeholder="What do you want to achieve in your career?"
                        value={careerData.careerGoals}
                        onChange={(e) => setCareerData(prev => ({ ...prev, careerGoals: e.target.value }))}
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" disabled={savingCareer} className="flex-1 h-10">
                        {savingCareer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                        Save Assessment
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setCareerDialogOpen(false)} className="h-10">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Upcoming Tasks Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Upcoming Tasks</CardTitle>
              <CardDescription className="text-sm">Your scheduled learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="flex-1 text-sm md:text-base truncate">Complete Python Basics Quiz</span>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">Today</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="flex-1 text-sm md:text-base truncate">Resume Review Session</span>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">Tomorrow</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="flex-1 text-sm md:text-base truncate">Web Development Tutorial</span>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">In 2 days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Progress Card */}
          <QuizProgress />

          {/* Recommended Resources Card - Full width on mobile, spans 2 on larger screens */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Recommended Resources</CardTitle>
              <CardDescription className="text-sm">Based on your career interests</CardDescription>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : recommendedResources.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {recommendedResources.map((resource) => (
                    <div key={resource.id} className="flex items-start p-3 md:p-4 border rounded-lg">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded flex items-center justify-center mr-3 flex-shrink-0">
                        <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm md:text-base truncate">{resource.title}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start p-3 md:p-4 border rounded-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded flex items-center justify-center mr-3 flex-shrink-0">
                      <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm md:text-base truncate">Introduction to Data Science</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">Learn the fundamentals of data analysis and visualization</p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 md:p-4 border rounded-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary md:w-5 md:h-5">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm md:text-base truncate">Modern JavaScript Frameworks</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">Master React, Vue, and Angular for front-end development</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard render error:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Something went wrong loading the dashboard.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
}