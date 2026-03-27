import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Star,
  Sparkles,
  Target,
  Briefcase,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Zap
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "question" | "feedback" | "response" | "analysis";
  analysis?: ResponseAnalysis;
}

interface ResponseAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  starAnalysis: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
    score: number;
  };
  feedback: string;
}

// Default fallback questions
const fallbackQuestions = [
  "Tell me about yourself and your background.",
  "What interests you most about this position?",
  "Describe a challenging project you've worked on.",
  "How do you handle working under pressure?",
  "Where do you see yourself in 5 years?",
  "What are your greatest strengths and weaknesses?",
  "Why are you looking to leave your current position?",
  "How do you stay updated with new technologies?",
  "Describe a time you had to work with a difficult team member.",
  "What questions do you have for us?"
];

// Generate interview questions using ML API
const generateInterviewQuestions = async (role: string, skills: string[] = []) => {
  try {
    const response = await fetch('/api/ml/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, skills, count: 5 })
    });

    if (!response.ok) throw new Error('ML API failed');
    
    const data = await response.json();
    return data.questions || fallbackQuestions;
  } catch (error) {
    console.error('Error generating questions with ML:', error);
    return fallbackQuestions;
  }
};

// Analyze response using ML API
const analyzeResponse = async (question: string, response: string, role: string): Promise<ResponseAnalysis> => {
  try {
    const apiResponse = await fetch('/api/ml/analyze-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, response, role })
    });

    if (!apiResponse.ok) throw new Error('Analysis API failed');
    
    return await apiResponse.json();
  } catch (error) {
    console.error('Error analyzing response:', error);
    // Return basic analysis
    return {
      score: 70,
      strengths: ['Attempted the question'],
      improvements: ['Add more details'],
      starAnalysis: { situation: false, task: false, action: true, result: false, score: 25 },
      feedback: 'Good attempt! Add more specific examples using the STAR method.'
    };
  }
};

// Interface for matched occupation
interface MatchedOccupation {
  occupationId: string;
  title: string;
  matchScore: number;
  requiredSkills?: string[];
}

export function InterviewChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Interview Coach. I can help you practice for interviews with personalized questions based on your target role, and provide detailed feedback on your responses.\n\n✨ Features:\n• Role-specific interview questions\n• STAR method analysis\n• Quantifiable achievements detection\n• Real-time feedback\n\nWould you like to start a mock interview?",
      sender: "ai",
      timestamp: new Date(),
      type: "question"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [interviewMode, setInterviewMode] = useState<"chat" | "mock">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [matchedOccupations, setMatchedOccupations] = useState<MatchedOccupation[]>([]);
  const [defaultRoles] = useState<string[]>(["Software Engineer", "Data Scientist", "Product Manager", "UX Designer", "DevOps Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Machine Learning Engineer", "Project Manager"]);
  const [availableRoles, setAvailableRoles] = useState<string[]>(defaultRoles);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responseAnalysis, setResponseAnalysis] = useState<ResponseAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"coach" | "tips">("coach");
  const hasResults = messages.length > 1;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch matched occupations from Firestore
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Check for matched occupations in various locations
        const occupations = data.matchedOccupations || data.aiAssessment?.matchedOccupations || [];
        
        if (occupations.length > 0) {
          setMatchedOccupations(occupations);
          
          // Create roles from matched occupations
          const occupationRoles = occupations.map((o: MatchedOccupation) => o.title);
          setAvailableRoles([...occupationRoles, ...defaultRoles.filter(r => !occupationRoles.includes(r))]);
          
          // Auto-select the top matched occupation if no role is selected
          if (!selectedRole && occupations.length > 0) {
            setSelectedRole(occupations[0].title);
          }
        }
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // Fetch skills from user profile
  const getUserSkills = async (): Promise<string[]> => {
    if (!currentUser?.uid) return [];
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Try various locations for skills
        const skills = data.skills || 
                       data.aiAssessment?.profile?.skills || 
                       data.technicalAssessment?.skills ||
                       [];
        return skills;
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
    }
    return [];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "response"
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // If in mock interview mode, analyze the response
      if (interviewMode === "mock" && generatedQuestions.length > 0) {
        const currentQuestion = generatedQuestions[currentQuestionIndex] || "Tell me about yourself.";
        
        // Analyze the response using ML API
        const analysis = await analyzeResponse(currentQuestion, userInput, selectedRole);
        
        // Get next question or end interview
        let nextQuestion = "";
        let isComplete = false;
        
        if (currentQuestionIndex < generatedQuestions.length - 1) {
          nextQuestion = generatedQuestions[currentQuestionIndex + 1];
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          isComplete = true;
          nextQuestion = "🎉 Congratulations! You've completed the mock interview!\n\nReview your performance below and check the Tips tab for interview best practices.";
        }

        // Create analysis message
        const analysisMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: analysis.feedback,
          sender: "ai",
          timestamp: new Date(),
          type: "analysis",
          analysis: analysis
        };

        setResponseAnalysis(analysis);
        setMessages(prev => [...prev, analysisMessage]);
        
        // Update scores
        setSessionScore(prev => prev + analysis.score);
        setQuestionsAsked(prev => prev + 1);
        
        // Add next question or completion message
        setIsTyping(false);
        
        if (!isComplete) {
          const nextQMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: "Next question: " + nextQuestion,
            sender: "ai",
            timestamp: new Date(),
            type: "question"
          };
          setMessages(prev => [...prev, nextQMessage]);
        } else {
          const completeMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: nextQuestion,
            sender: "ai",
            timestamp: new Date(),
            type: "question"
          };
          setMessages(prev => [...prev, completeMessage]);
        }
      } else {
        // Chat mode - use real AI chatbot
        try {
          const response = await fetch('/api/chatbot/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userInput,
              role: selectedRole,
              history: messages.map(m => ({ sender: m.sender, content: m.content }))
            })
          });

          if (response.ok) {
            const data = await response.json();
            
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: data.message,
              sender: "ai",
              timestamp: new Date(),
              type: "response"
            };
            setMessages(prev => [...prev, aiMessage]);
          } else {
            throw new Error('Chat API failed');
          }
        } catch (chatError) {
          console.error('Chat API error:', chatError);
          // Fallback response
          const fallbackResponses = [
            "That's a great question! I'd be happy to help you with interview preparation. Would you like to start a mock interview to practice?",
            "For interview success, I recommend researching the company, practicing common questions with the STAR method, and preparing your own questions to ask. Shall we practice now?",
            "To ace your interview, focus on showcasing your achievements with quantifiable results. Would you like me to help you prepare for a specific question?"
          ];
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
            sender: "ai",
            timestamp: new Date(),
            type: "response"
          };
          setMessages(prev => [...prev, aiMessage]);
        }
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
    }
  };

  const startMockInterview = async () => {
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select a role to practice interviews for.",
        variant: "destructive",
      });
      return;
    }

    setInterviewMode("mock");
    setSessionScore(0);
    setQuestionsAsked(0);
    setCurrentQuestionIndex(0);
    setResponseAnalysis(null);

    try {
      // Get user's skills for personalized questions
      const skills = await getUserSkills();
      
      // Use ML to generate role-specific questions
      const questions = await generateInterviewQuestions(selectedRole, skills);
      setGeneratedQuestions(questions.slice(0, 5));

      const startMessage: Message = {
        id: Date.now().toString(),
        content: `Let's begin your mock interview for ${selectedRole}!\n\n🎯 I'll ask you ${questions.length} questions and provide detailed feedback on each response.\n\nTip: Use the STAR method (Situation, Task, Action, Result) and include quantifiable achievements.\n\nFirst question: ${questions[0]}`,
        sender: "ai",
        timestamp: new Date(),
        type: "question"
      };

      setMessages(prev => [...prev, startMessage]);
      
      toast({
        title: "Interview Started",
        description: `Practicing for ${selectedRole} role. Good luck!`,
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Error",
        description: "Unable to start interview. Using standard questions.",
        variant: "destructive",
      });
      
      setGeneratedQuestions(fallbackQuestions.slice(0, 5));
    }
  };

  const resetSession = () => {
    setMessages([
      {
        id: "1",
        content: "Session reset! I'm ready to help you practice for your interviews.\n\n✨ I can generate personalized questions based on your target role and provide detailed feedback.\n\nWhat role would you like to practice for?",
        sender: "ai",
        timestamp: new Date(),
        type: "question"
      }
    ]);
    setInterviewMode("chat");
    setSessionScore(0);
    setQuestionsAsked(0);
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setResponseAnalysis(null);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice Input",
        description: "Speak your answer. (Speech-to-text coming soon!)",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Interview Coach
          </h1>
          <p className="text-muted-foreground mt-1">
            Practice with personalized questions and get real-time feedback on your responses.
          </p>
        </div>
        {hasResults && (
          <Button variant="outline" onClick={resetSession}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New Session
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="coach">Interview Coach</TabsTrigger>
          <TabsTrigger value="tips">Tips & Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="coach" className="mt-4">
          {/* Session Stats */}
          {interviewMode === "mock" && questionsAsked > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card className="bg-gradient-card border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{questionsAsked}</div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">
                    {questionsAsked > 0 ? Math.round(sessionScore / questionsAsked) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {responseAnalysis?.starAnalysis?.score || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">STAR Score</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="h-5 w-5 text-warning" />
                    <span className="text-2xl font-bold text-warning">AI</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Powered</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-gradient-card border-0 shadow-lg h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          AI Interview Coach
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Powered
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {interviewMode === "mock" 
                            ? `Question ${currentQuestionIndex + 1} of ${generatedQuestions.length}`
                            : "Practice mode - Ask me anything about interviews"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Online
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[85%] ${
                          message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          message.sender === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          {message.sender === "user" ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-4 ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.type === "analysis"
                                ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                                : "bg-muted"
                          }`}
                        >
                          {message.type === "analysis" && message.analysis && (
                            <div className="mb-3 pb-3 border-b border-blue-200 dark:border-blue-800">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-blue-900 dark:text-blue-100">Response Analysis</span>
                                <Badge className={`
                                  ${message.analysis.score >= 80 ? 'bg-green-500' : 
                                    message.analysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                                `}>
                                  {message.analysis.score}/100
                                </Badge>
                              </div>
                              
                              {/* STAR Analysis */}
                              <div className="flex gap-2 mb-2">
                                <span className={`text-xs px-2 py-1 rounded ${message.analysis.starAnalysis.situation ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  Situation
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${message.analysis.starAnalysis.task ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  Task
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${message.analysis.starAnalysis.action ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  Action
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${message.analysis.starAnalysis.result ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  Result
                                </span>
                              </div>
                              
                              {/* Strengths */}
                              {message.analysis.strengths.length > 0 && (
                                <div className="mb-2">
                                  <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="font-medium">Strengths</span>
                                  </div>
                                  <ul className="text-xs text-green-600 space-y-1">
                                    {message.analysis.strengths.map((s, i) => (
                                      <li key={i}>• {s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Improvements */}
                              {message.analysis.improvements.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 text-xs text-orange-700 mb-1">
                                    <Lightbulb className="h-3 w-3" />
                                    <span className="font-medium">Improvements</span>
                                  </div>
                                  <ul className="text-xs text-orange-600 space-y-1">
                                    {message.analysis.improvements.map((imp, i) => (
                                      <li key={i}>• {imp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <div className="flex-1 flex space-x-2">
                      <Input
                        placeholder={interviewMode === "mock" ? "Type your answer..." : "Ask me about interview tips..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={toggleRecording}
                        className={isRecording ? "bg-destructive/10 text-destructive" : ""}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Interview Setup
                  </CardTitle>
                  <CardDescription>
                    {matchedOccupations.length > 0 
                      ? `Based on your ${matchedOccupations.length} career matches`
                      : "Select a role to practice for"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Show matched occupations */}
                  {matchedOccupations.length > 0 && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Your Career Matches</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {matchedOccupations.slice(0, 3).map((occupation, idx) => (
                          <Badge 
                            key={idx} 
                            variant={selectedRole === occupation.title ? "default" : "outline"}
                            className="cursor-pointer text-xs justify-start"
                            onClick={() => setSelectedRole(occupation.title)}
                          >
                            {occupation.title}
                            <span className="ml-1 opacity-70">
                              {Math.round(occupation.matchScore * 100)}%
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Target Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    onClick={startMockInterview}
                    className="w-full"
                    variant="default"
                    disabled={interviewMode === "mock" || !selectedRole}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {matchedOccupations.length > 0 ? "Start Interview" : "Start Practice"}
                  </Button>
                  
                  <Button
                    onClick={resetSession}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Session
                  </Button>
                </CardContent>
              </Card>

              {/* Interview Tips */}
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="p-2 rounded bg-muted/20">
                    <p className="font-medium mb-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      Use STAR Method
                    </p>
                    <p className="text-muted-foreground text-xs">Situation, Task, Action, Result</p>
                  </div>
                  <div className="p-2 rounded bg-muted/20">
                    <p className="font-medium mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Quantify Results
                    </p>
                    <p className="text-muted-foreground text-xs">Use numbers, percentages, metrics</p>
                  </div>
                  <div className="p-2 rounded bg-muted/20">
                    <p className="font-medium mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      Keep Answers Concise
                    </p>
                    <p className="text-muted-foreground text-xs">1-2 minutes per answer</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Interview Preparation Guide
              </CardTitle>
              <CardDescription>
                Master these techniques to ace your interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* STAR Method */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  The STAR Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>S</Badge>
                      <span className="font-medium">Situation</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Describe the context - where/when/what</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>T</Badge>
                      <span className="font-medium">Task</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Explain your responsibility or challenge</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>A</Badge>
                      <span className="font-medium">Action</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Describe what YOU did specifically</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>R</Badge>
                      <span className="font-medium">Result</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Share the outcome with metrics</p>
                  </div>
                </div>
              </div>

              {/* Common Questions */}
              <div>
                <h3 className="font-bold text-lg mb-3">Common Interview Questions</h3>
                <div className="space-y-2">
                  {[
                    "Tell me about yourself",
                    "Why do you want this role?",
                    "What are your strengths and weaknesses?",
                    "Where do you see yourself in 5 years?",
                    "Why should we hire you?",
                    "Tell me about a challenge you overcame"
                  ].map((q, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Language */}
              <div>
                <h3 className="font-bold text-lg mb-3">Body Language Tips</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: "👁️", tip: "Maintain eye contact" },
                    { icon: "😊", tip: "Smile genuinely" },
                    { icon: "🤝", tip: "Offer a firm handshake" },
                    { icon: "🧘", tip: "Sit up straight" },
                    { icon: "🙋", tip: "Use hand gestures" },
                    { icon: "🎯", tip: "Focus on the speaker" },
                    { icon: "😌", tip: "Stay calm" },
                    { icon: "🙏", tip: "Be polite to all" }
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <p className="text-xs">{item.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions to Ask */}
              <div>
                <h3 className="font-bold text-lg mb-3">Questions to Ask the Interviewer</h3>
                <div className="space-y-2">
                  {[
                    "What does success look like in this role?",
                    "How does the team work together?",
                    "What are the biggest challenges the team faces?",
                    "How has this role evolved?",
                    "What opportunities for growth exist?",
                    "What's the company culture like?"
                  ].map((q, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


