import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft, Brain, Target, Sparkles, Loader2, RefreshCw, User, Briefcase, TrendingUp, CheckCircle2 } from "lucide-react";
import { sectors, occupationQuestions, calculateMatches, getQuestionsForSector, occupations, getRecommendedSkills, getResourcesForSector } from "@/data/careerSectors";

// Types for AI-driven quiz
interface UserProfile {
  skills: string[];
  interests: string[];
  personality: string[];
  workStyle: string[];
  experienceLevel: number;
  sectors: string[];
  sectorDetails: Record<string, any>;
}

interface QuizAnswer {
  questionId: string;
  question: string;
  selectedOption: any;
  timestamp: string;
}

interface QuestionOption {
  id: string;
  label: string;
  [key: string]: any; // Allow additional properties like sector, workStyle, etc.
}

interface Question {
  question: string;
  options: QuestionOption[];
  questionType: string;
  questionNumber: number;
  questionId?: string;
  activeSectors?: string[];
  description?: string;
  isComplete?: boolean;
  recommendations?: any[];
}

interface QuizState {
  currentQuestion: number;
  currentQuestionData: Question | null;
  answers: QuizAnswer[];
  profile: UserProfile;
  recommendations: any[];
  isComplete: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  isGeneratingQuestion: boolean;
  error: string | null;
}

// Initial profile state
const initialProfile: UserProfile = {
  skills: [],
  interests: [],
  personality: [],
  workStyle: [],
  experienceLevel: 5,
  sectors: [],
  sectorDetails: {}
};

export function CareerQuiz() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    currentQuestionData: null,
    answers: [],
    profile: initialProfile,
    recommendations: [],
    isComplete: false,
    isLoading: true,
    isSubmitting: false,
    isGeneratingQuestion: true,
    error: null
  });

  const [selectedOption, setSelectedOption] = useState<string>("");

  // Fetch existing assessment from Firestore on mount
  useEffect(() => {
    // Check if this is a retake attempt
    const isRetake = localStorage.getItem('assessmentRetake');
    
    if (isRetake) {
      // Clear the flag and start fresh
      localStorage.removeItem('assessmentRetake');
      // Reset state for retake - don't show loading state, generate question immediately
      setState(prev => ({
        ...prev,
        currentQuestion: 0,
        currentQuestionData: null,
        answers: [],
        profile: initialProfile,
        recommendations: [],
        isComplete: false,
        isLoading: false, // Don't show skeleton
        isSubmitting: false,
        isGeneratingQuestion: false,
        error: null
      }));
      // Generate first question directly without showing loading
      generateQuestion(0);
      return;
    }

    if (!currentUser?.uid) {
      generateQuestion(0);
      return;
    }

    const fetchExistingAssessment = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if there's a completed AI assessment (version 3.0)
          if (userData.aiAssessment?.profile && userData.aiAssessment?.recommendations && userData.lastAssessmentVersion === '3.0') {
            setState(prev => ({
              ...prev,
              profile: userData.aiAssessment.profile,
              recommendations: userData.aiAssessment.recommendations,
              answers: userData.aiAssessment.answers || [],
              isComplete: true,
              isLoading: false
            }));
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching existing assessment:", error);
        // Don't show error to user - just continue to generate new question
      }

      // No existing assessment - start new quiz
      generateQuestion(0);
    };

    fetchExistingAssessment();
  }, [currentUser]);

  // Generate question locally using career sectors data
  const generateQuestion = async (questionNumber: number, previousAnswers?: QuizAnswer[], profile?: UserProfile) => {
    setState(prev => ({ ...prev, isGeneratingQuestion: true, error: null }));
    
    // Use passed parameters or fall back to state
    const answersToUse = previousAnswers ?? state.answers;
    const profileToUse = profile ?? state.profile;
    
    try {
      // Question 1: Sector selection
      if (questionNumber === 0) {
        const sectorQuestion: Question = {
          question: "Which career area are you most interested in?",
          options: sectors.map(s => ({
            id: s.id,
            label: `${s.icon} ${s.name}`,
            sector: s.id
          })),
          questionType: "sector-selection",
          questionNumber: 1,
          questionId: "sector-selection",
          description: "Select a sector to discover matching career paths"
        };
        
        setState(prev => ({
          ...prev,
          currentQuestionData: sectorQuestion,
          currentQuestion: 1,
          answers: answersToUse,
          profile: profileToUse,
          isGeneratingQuestion: false,
          isSubmitting: false,
          isLoading: false
        }));
        setSelectedOption("");
        return;
      }
      
      // Get the selected sector from previous answers
      const lastAnswer = answersToUse[answersToUse.length - 1];
      const selectedSector = lastAnswer?.selectedOption?.sector || profileToUse.sectors[0];
      
      if (!selectedSector) {
        // No sector selected, go back to sector selection
        generateQuestion(0, answersToUse, profileToUse);
        return;
      }
      
      // Get answered question IDs
      const answeredIds = answersToUse.map(a => a.questionId).filter(Boolean);
      
      // Get sector-specific questions that haven't been answered
      const sectorQuestions = getQuestionsForSector(selectedSector);
      const availableQuestions = sectorQuestions.filter(q => !answeredIds.includes(q.id));
      
      // If no more questions or 4+ answers, show recommendations
      if (availableQuestions.length === 0 || answersToUse.length >= 4) {
        // Calculate matches
        const matchedOccupations = calculateMatches(answersToUse, selectedSector);
        const topMatches = matchedOccupations.slice(0, 5).map(occ => ({
          id: occ.id,
          title: occ.title,
          description: occ.description,
          match: occ.match, // Keep as match for recommendations array
          matchScore: occ.match, // Also add matchScore for compatibility
          salaryRange: occ.salaryRange,
          growthPotential: occ.growthPotential,
          requiredSkills: occ.requiredSkills,
          category: occ.sector // Add category for DashboardHome compatibility
        }));
        
        const recommendationQuestion: Question = {
          question: `Based on your interests in ${selectedSector}, here are your top career matches:`,
          options: topMatches.map(rec => ({
            id: rec.id,
            label: `${rec.title} (${rec.match}% match)`
          })),
          questionType: "final-recommendation",
          questionNumber: answersToUse.length + 1,
          questionId: "final-recommendation",
          isComplete: true,
          recommendations: topMatches
        };
        
        setState(prev => ({
          ...prev,
          currentQuestionData: recommendationQuestion,
          currentQuestion: answersToUse.length + 1,
          answers: answersToUse,
          profile: profileToUse,
          isGeneratingQuestion: false,
          isSubmitting: false,
          isLoading: false
        }));
        setSelectedOption("");
        
        // Automatically complete the assessment
        await handleAssessmentComplete(topMatches);
        return;
      }
      
      // Get next question from available questions
      const nextQ = availableQuestions[0];
      const occupationQuestion: Question = {
        question: nextQ.question,
        options: nextQ.options.map(opt => ({
          id: opt.id,
          label: opt.label,
          score: opt.score,
          questionId: nextQ.id,
          occupationId: nextQ.occupationId,
          occupationTitle: nextQ.occupationTitle
        })),
        questionType: "occupation-specific",
        questionNumber: answersToUse.length + 1,
        questionId: nextQ.id,
        description: `This helps determine your fit for ${nextQ.occupationTitle} roles`
      };
      
      setState(prev => ({
        ...prev,
        currentQuestionData: occupationQuestion,
        currentQuestion: answersToUse.length + 1,
        answers: answersToUse,
        profile: profileToUse,
        isGeneratingQuestion: false,
        isSubmitting: false,
        isLoading: false
      }));
      setSelectedOption("");
      
    } catch (error) {
      console.error("Error generating question:", error);
      // Fallback to sector selection on error - but prevent infinite loop
      const totalAttempts = (state.answers.length || 0);
      if (totalAttempts > 10) {
        // Too many attempts - force completion with defaults
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false, 
          isGeneratingQuestion: false,
          isComplete: true,
          recommendations: [{
            id: "default",
            title: "Technology Professional",
            description: "Based on your interest, explore technology-related career paths.",
            match: 70,
            matchScore: 70,
            salaryRange: "₹4L - ₹15L",
            growthPotential: "High",
            category: "tech",
            requiredSkills: ["Technical Skills", "Problem Solving"]
          }]
        }));
        return;
      }
      setState(prev => ({ ...prev, isSubmitting: false, isGeneratingQuestion: false }));
      generateQuestion(0, answersToUse, profileToUse);
    }
  };

  // Handle assessment completion
  const handleAssessmentComplete = async (recommendations: any[]) => {
    if (!recommendations || recommendations.length === 0) {
      // If no recommendations, try fallback - don't show error
      setState(prev => ({
        ...prev,
        recommendations: [{
          id: "tech-specialist",
          title: "Technology Specialist",
          description: "Based on your interest in technology, consider exploring roles in software development, data analysis, or IT support.",
          match: 75,
          matchScore: 75,
          salaryRange: "₹4L - ₹15L",
          growthPotential: "High",
          category: "tech",
          requiredSkills: ["Programming", "Problem Solving", "IT Support"]
        }],
        isComplete: true,
        isSubmitting: false,
        isGeneratingQuestion: false
      }));
      return;
    }

    // Calculate recommended skills and resources
    const selectedSector = state.profile.sectors[0] || 'tech';
    const matchedOccupations = calculateMatches(state.answers, selectedSector);
    const recommendedSkills = getRecommendedSkills(matchedOccupations);
    const recommendedResources = getResourcesForSector(selectedSector);

    const assessmentData = {
      profile: state.profile,
      answers: state.answers,
      recommendations: recommendations,
      selectedSector: selectedSector,
      recommendedSkills: recommendedSkills,
      recommendedResources: recommendedResources,
      matchedOccupations: matchedOccupations.slice(0, 5).map(occ => ({
        id: occ.id,
        title: occ.title,
        category: occ.sector, // Use sector as category for DashboardHome compatibility
        matchScore: occ.match, // Rename match to matchScore for DashboardHome compatibility
        requiredSkills: occ.requiredSkills
      })),
      completedAt: new Date().toISOString(),
      assessmentVersion: '4.0'
    };

    setState(prev => ({
      ...prev,
      recommendations: recommendations,
      isComplete: true,
      isSubmitting: false,
      isGeneratingQuestion: false
    }));

    // Save comprehensive data to Firestore
    if (currentUser?.uid) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          aiAssessment: assessmentData,
          lastAssessmentDate: new Date().toISOString(),
          lastAssessmentVersion: '4.0',
          // Also save to top-level fields for easy access by other components
          userSector: selectedSector,
          userRecommendedSkills: recommendedSkills,
          userRecommendations: recommendations,
          matchedOccupations: matchedOccupations.slice(0, 5).map(occ => ({
            id: occ.id,
            title: occ.title,
            category: occ.sector,
            matchScore: occ.match,
            requiredSkills: occ.requiredSkills
          })),
          hasCompletedAssessment: true
        }, { merge: true });
        
        console.log('Assessment saved successfully with skills and resources');
      } catch (firestoreError) {
        console.log('Error saving assessment:', firestoreError);
        // Don't show error to user - assessment still works
      }
    }

    toast({
      title: "Assessment Complete! 🎉",
      description: `AI found ${recommendations.length} personalized career paths for you. ${recommendedSkills.length} skills recommended.`,
    });
  };

  // Submit answer and get next question
  const handleSubmitAnswer = async () => {
    if (!selectedOption || state.isSubmitting || !state.currentQuestionData) return;

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      // Get the selected option object
      const selectedOptionData = state.currentQuestionData.options.find(opt => opt.id === selectedOption);
      
      if (!selectedOptionData) {
        throw new Error('Invalid option selected');
      }

      // Add this answer to answers array - use the actual questionId from the backend response
      const newAnswer: QuizAnswer = {
        questionId: state.currentQuestionData.questionId || `q${state.currentQuestionData.questionNumber}`,
        question: state.currentQuestionData.question,
        selectedOption: selectedOptionData,
        timestamp: new Date().toISOString()
      };
      
      const updatedAnswers = [...state.answers, newAnswer];

      // Update profile with the answer data
      const updatedProfile = {
        ...state.profile,
        sectors: selectedOptionData.sector 
          ? [selectedOptionData.sector] 
          : state.profile.sectors,
        workStyle: selectedOptionData.workStyle 
          ? [...state.profile.workStyle, selectedOptionData.workStyle] 
          : state.profile.workStyle,
        interests: selectedOptionData.interest 
          ? [...state.profile.interests, selectedOptionData.interest] 
          : state.profile.interests,
        personality: selectedOptionData.motivation 
          ? [...state.profile.personality, selectedOptionData.motivation] 
          : state.profile.personality,
        sectorDetails: selectedOptionData.sector 
          ? { ...state.profile.sectorDetails, [selectedOptionData.sector]: selectedOptionData }
          : state.profile.sectorDetails
      };

      // Check if we're done (question type is final-recommendation)
      if (state.currentQuestionData.questionType === 'final-recommendation') {
        // Get final recommendations
        await getFinalRecommendations(updatedAnswers, updatedProfile);
        return;
      }

      // Generate next question - use the updated question count and pass all necessary data
      const nextQuestionNumber = state.currentQuestion;
      await generateQuestion(nextQuestionNumber, updatedAnswers, updatedProfile);

    } catch (error) {
      console.error("Error submitting answer:", error);
      // Don't show error to user - try to continue with next question
      // Include the selected option data in the fallback
      const selectedOptionData = state.currentQuestionData.options.find(opt => opt.id === selectedOption);
      
      if (selectedOptionData) {
        const newAnswer: QuizAnswer = {
          questionId: state.currentQuestionData.questionId || `q${state.currentQuestionData.questionNumber}`,
          question: state.currentQuestionData.question,
          selectedOption: selectedOptionData,
          timestamp: new Date().toISOString()
        };
        const updatedAnswers = [...state.answers, newAnswer];
        const updatedProfile = {
          ...state.profile,
          sectors: selectedOptionData.sector ? [selectedOptionData.sector] : state.profile.sectors,
          workStyle: selectedOptionData.workStyle ? [...state.profile.workStyle, selectedOptionData.workStyle] : state.profile.workStyle,
          interests: selectedOptionData.interest ? [...state.profile.interests, selectedOptionData.interest] : state.profile.interests,
          personality: selectedOptionData.motivation ? [...state.profile.personality, selectedOptionData.motivation] : state.profile.personality
        };
        setState(prev => ({ ...prev, isSubmitting: false, answers: updatedAnswers, profile: updatedProfile }));
        await generateQuestion(state.currentQuestion, updatedAnswers, updatedProfile);
      } else {
        setState(prev => ({ ...prev, isSubmitting: false }));
        await generateQuestion(state.currentQuestion, state.answers, state.profile);
      }
    }
  };

  // Get final recommendations
  const getFinalRecommendations = async (answers: QuizAnswer[], profile: UserProfile) => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch('/api/ml/career-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          userId: currentUser?.uid
        })
      });

      if (!response.ok) throw new Error('Failed to get recommendations');
      
      const data = await response.json();
      
      await handleAssessmentComplete(data.recommendations);

    } catch (error) {
      console.error("Error getting recommendations:", error);
      // Provide fallback recommendations instead of showing error
      const fallbackRecommendations = [
        {
          id: "tech-specialist",
          title: "Technology Specialist",
          description: "Based on your responses, technology roles could be a great fit. Consider exploring software development, data analysis, or IT positions.",
          match: 70,
          matchScore: 70,
          salaryRange: "₹4L - ₹15L",
          growthPotential: "High",
          category: "tech",
          requiredSkills: ["Programming", "Problem Solving", "Data Analysis"]
        },
        {
          id: "business-analyst",
          title: "Business Analyst",
          description: "Your analytical skills and interest in problem-solving make business analysis a good career path.",
          match: 65,
          matchScore: 65,
          salaryRange: "₹5L - ₹12L",
          growthPotential: "Medium",
          category: "business",
          requiredSkills: ["Analysis", "Communication", "Business Knowledge"]
        }
      ];
      await handleAssessmentComplete(fallbackRecommendations);
    }
  };

  // Handle retake assessment
  const handleRetake = async () => {
    localStorage.setItem('assessmentRetake', 'true');

    setState(prev => ({
      ...prev,
      currentQuestion: 0,
      currentQuestionData: null,
      answers: [],
      profile: initialProfile,
      recommendations: [],
      isComplete: false,
      isLoading: false,
      isSubmitting: false,
      isGeneratingQuestion: true,
      error: null
    }));

    if (currentUser?.uid) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          aiAssessment: null,
          lastAssessmentDate: null,
          lastAssessmentVersion: null,
          assessmentVersion: null,
          // Clear top-level assessment fields too
          userSector: null,
          userRecommendedSkills: null,
          userRecommendations: null,
          hasCompletedAssessment: false
        }, { merge: true });
        console.log('Assessment cleared for retake');
      } catch (firestoreError) {
        console.log('Error clearing assessment:', firestoreError);
      }
    }

    navigate('/career-quiz');
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto px-4 md:px-0">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <Card className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-24 w-full mt-6" />
            <Skeleton className="h-10 w-32 mx-auto mt-4" />
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto px-4 md:px-0">
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{state.error}</p>
          <Button onClick={() => generateQuestion(0)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Results view
  if (state.isComplete && state.recommendations.length > 0) {
    const topRecommendation = state.recommendations[0];
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Your AI Career Assessment Results
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Based on {state.answers.length} sector-focused questions
          </p>
        </div>

        {/* Profile Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Your Profile</h3>
                <p className="text-sm text-muted-foreground">AI-Built from {state.answers.length} responses</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {state.profile.sectors.map(sector => (
                <span key={sector} className="px-2 py-1 bg-primary/10 rounded text-xs capitalize">{sector}</span>
              ))}
              {state.profile.interests.map(interest => (
                <span key={interest} className="px-2 py-1 bg-accent/10 rounded text-xs">{interest}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Recommendation */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 md:p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎯</div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {topRecommendation.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                  {topRecommendation.description}
                </p>
                
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{topRecommendation.salaryRange}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{topRecommendation.growthPotential} Growth</span>
                  </div>
                </div>
                
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-accent/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-accent mr-2" />
                  <span className="font-semibold text-accent">{topRecommendation.match}% Match</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={handleRetake} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Assessment
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Recommendations */}
        {state.recommendations.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Other Career Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.recommendations.slice(1).map((rec: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <span className="text-sm font-semibold text-accent">{rec.match}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{rec.salaryRange}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{state.answers.length}</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">{topRecommendation.match}%</div>
                <div className="text-sm text-muted-foreground">Top Match</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{state.recommendations.length}</div>
                <div className="text-sm text-muted-foreground">Career Options</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz view
  if (!state.currentQuestionData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = (state.currentQuestion / 5) * 100; // Estimate 5 questions total

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 md:px-0">
      {/* Back button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          AI Career Assessment
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Dynamic sector-based assessment
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Step {state.currentQuestion} 
              {state.currentQuestionData.description && ` - ${state.currentQuestionData.description}`}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {state.currentQuestionData.question}
          </CardTitle>
          {state.currentQuestionData.description && (
            <CardDescription>
              {state.currentQuestionData.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {state.isGeneratingQuestion ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                className="space-y-3"
              >
                {state.currentQuestionData.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || state.isSubmitting || state.isGeneratingQuestion}
                  className="flex-1"
                >
                  {state.isSubmitting || state.isGeneratingQuestion ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {state.isGeneratingQuestion ? 'Loading...' : 'Processing...'}
                    </>
                  ) : state.currentQuestionData.isComplete ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      View Results
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Submit Answer
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">How it works</h4>
              <p className="text-sm text-muted-foreground">
                Select the option that best describes your interests. 
                Based on your choice, the AI will narrow down suitable career paths for you.
                Your selections help filter careers from sectors like Technology, Healthcare, Arts, Aviation, Science, and more.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CareerQuiz;
