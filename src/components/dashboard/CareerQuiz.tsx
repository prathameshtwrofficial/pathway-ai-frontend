import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Brain, Target, Users, Lightbulb, Trophy } from "lucide-react";

// TODO: Replace with real API call for dynamic questions
const quizQuestions = [
  {
    id: "q1",
    question: "What field interests you most?",
    options: [
      { id: "technology", label: "Technology & Innovation", icon: "💻" },
      { id: "business", label: "Business & Finance", icon: "💼" },
      { id: "healthcare", label: "Healthcare & Medicine", icon: "🏥" },
      { id: "education", label: "Education & Teaching", icon: "📚" },
      { id: "arts", label: "Arts & Design", icon: "🎨" }
    ]
  },
  {
    id: "q2",
    question: "What motivates you most at work?",
    options: [
      { id: "problem-solving", label: "Solving complex problems", icon: "🧩" },
      { id: "helping-others", label: "Helping others succeed", icon: "🤝" },
      { id: "creating", label: "Creating new things", icon: "🎯" },
      { id: "leading", label: "Leading and managing teams", icon: "👥" },
      { id: "analyzing", label: "Analyzing data and trends", icon: "📊" }
    ]
  },
  {
    id: "q3",
    question: "How do you prefer to work?",
    options: [
      { id: "teamwork", label: "Collaborating in teams", icon: "👥" },
      { id: "independent", label: "Working independently", icon: "👤" },
      { id: "leadership", label: "Taking leadership roles", icon: "🎯" },
      { id: "creative", label: "Expressing creativity", icon: "🎨" },
      { id: "structured", label: "Following structured processes", icon: "📋" }
    ]
  },
  {
    id: "q4",
    question: "How do you approach learning new skills?",
    options: [
      { id: "continuous-learning", label: "Continuous self-learning", icon: "📖" },
      { id: "structured-courses", label: "Structured courses and certifications", icon: "🎓" },
      { id: "hands-on", label: "Hands-on experience and practice", icon: "🔧" },
      { id: "mentorship", label: "Learning through mentorship", icon: "👨‍🏫" },
      { id: "trial-error", label: "Trial and error approach", icon: "🔄" }
    ]
  },
  {
    id: "q5",
    question: "What type of work environment suits you best?",
    options: [
      { id: "fast-paced", label: "Fast-paced and dynamic", icon: "⚡" },
      { id: "stable", label: "Stable and predictable", icon: "🏢" },
      { id: "flexible", label: "Flexible and remote-friendly", icon: "🏠" },
      { id: "creative", label: "Creative and inspiring", icon: "💡" },
      { id: "analytical", label: "Analytical and research-focused", icon: "🔬" }
    ]
  }
];

const getCareerRecommendation = (answers: Record<string, string>) => {
  // Simple scoring logic - can be enhanced with AI/ML later
  const scores = {
    technology: 0,
    business: 0,
    healthcare: 0,
    education: 0,
    arts: 0
  };

  // Map answers to career categories
  Object.values(answers).forEach(answer => {
    switch (answer) {
      case "technology":
      case "problem-solving":
      case "creating":
        scores.technology += 20;
        break;
      case "business":
      case "leading":
      case "structured":
        scores.business += 20;
        break;
      case "healthcare":
      case "helping-others":
        scores.healthcare += 20;
        break;
      case "education":
      case "mentorship":
        scores.education += 20;
        break;
      case "arts":
      case "creative":
        scores.arts += 20;
        break;
    }
  });

  const topCareer = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);

  const recommendations = {
    technology: {
      title: "Technology & Innovation",
      description: "You have a strong analytical mind and enjoy solving complex problems. Careers in software development, data science, or engineering would be perfect for you.",
      icon: "💻",
      color: "blue"
    },
    business: {
      title: "Business & Finance",
      description: "You excel at leadership and strategic thinking. Consider careers in management, finance, or entrepreneurship.",
      icon: "💼",
      color: "green"
    },
    healthcare: {
      title: "Healthcare & Medicine",
      description: "Your caring nature and desire to help others makes healthcare an ideal field for you.",
      icon: "🏥",
      color: "red"
    },
    education: {
      title: "Education & Teaching",
      description: "You have a passion for sharing knowledge and mentoring others. Education could be your calling.",
      icon: "📚",
      color: "purple"
    },
    arts: {
      title: "Arts & Design",
      description: "Your creative spirit and innovative thinking make you perfect for artistic and design careers.",
      icon: "🎨",
      color: "orange"
    }
  };

  return recommendations[topCareer[0]];
};

export function CareerQuiz() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  useEffect(() => {
    // Check if user has already taken the quiz
    const checkExistingQuiz = async () => {
      if (!currentUser?.uid) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.careerQuizAttempts && userData.careerQuizAttempts.length > 0) {
            // User has taken quiz before, show latest results
            const latestAttempt = userData.careerQuizAttempts[userData.careerQuizAttempts.length - 1];
            setAnswers(latestAttempt.answers);
            setRecommendation(latestAttempt.recommendation);
            setShowResults(true);
          }
        }
      } catch (error) {
        console.error("Error checking existing quiz:", error);
      }
    };

    checkExistingQuiz();
  }, [currentUser]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const finalRecommendation = getCareerRecommendation(answers);

      const quizAttempt = {
        answers,
        recommendation: finalRecommendation,
        completedAt: new Date(),
        score: Math.floor(Math.random() * 40) + 60, // Mock score 60-100
        attemptNumber: 1 // Will be updated based on existing attempts
      };

      const userDocRef = doc(db, 'users', currentUser.uid);

      // Get current user data to check existing attempts
      const userDoc = await getDoc(userDocRef);
      let existingAttempts = [];
      if (userDoc.exists()) {
        existingAttempts = userDoc.data().careerQuizAttempts || [];
      }

      // Add new attempt with correct attempt number
      quizAttempt.attemptNumber = existingAttempts.length + 1;
      const updatedAttempts = [...existingAttempts, quizAttempt];

      await setDoc(userDocRef, {
        careerQuizAttempts: updatedAttempts,
        lastQuizDate: new Date()
      }, { merge: true });

      setRecommendation(finalRecommendation);
      setShowResults(true);

      toast({
        title: "Quiz Completed!",
        description: `Your career assessment results are ready. (Attempt #${quizAttempt.attemptNumber})`,
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setRecommendation(null);
  };

  if (showResults && recommendation) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Your Career Assessment Results</h1>
          <p className="text-sm md:text-base text-muted-foreground">Based on your responses, here's your personalized career recommendation</p>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6 md:p-8">
            <div className="text-center space-y-6">
              <div className="text-6xl">{recommendation.icon}</div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">{recommendation.title}</h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">{recommendation.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleRetake} variant="outline" className="flex-1 sm:flex-none">
                  <Target className="mr-2 h-4 w-4" />
                  Retake Quiz
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="flex-1 sm:flex-none">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Quiz Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{quizQuestions.length}</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">85%</div>
                <div className="text-sm text-muted-foreground">Career Match</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">High</div>
                <div className="text-sm text-muted-foreground">Interest Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion];

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 md:px-0">
      {/* Back to Dashboard Button */}
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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Career Personality Quiz</h1>
        <p className="text-sm md:text-base text-muted-foreground">Discover your ideal career path with our personality assessment</p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{currentQ.question}</CardTitle>
          <CardDescription>Select the option that best describes you</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQ.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQ.id, value)}
            className="space-y-3"
          >
            {currentQ.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm md:text-base">{option.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="flex-1"
            >
              {currentQuestion === quizQuestions.length - 1 ? (
                saving ? "Saving..." : "Complete Quiz"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Quiz Tips</h4>
              <p className="text-sm text-muted-foreground">
                Answer honestly based on your true interests and preferences. There's no right or wrong answer - this assessment is about finding the best career fit for you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// TODO: Future API Integration
// Replace quizQuestions with API call:
// const [quizQuestions, setQuizQuestions] = useState([]);
// useEffect(() => {
//   fetch('/api/career-quiz-questions')
//     .then(res => res.json())
//     .then(data => setQuizQuestions(data));
// }, []);

// TODO: Enhanced Scoring Algorithm
// Replace getCareerRecommendation with AI-powered analysis:
// const getCareerRecommendation = async (answers) => {
//   const response = await fetch('/api/career-analysis', {
//     method: 'POST',
//     body: JSON.stringify({ answers }),
//     headers: { 'Content-Type': 'application/json' }
//   });
//   return response.json();
// };