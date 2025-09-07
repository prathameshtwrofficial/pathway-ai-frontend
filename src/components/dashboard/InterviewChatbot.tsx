import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "question" | "feedback" | "response";
}

const interviewQuestions = [
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

export function InterviewChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Interview Coach. I'm here to help you practice for your upcoming interviews. Would you like to start with a mock interview, or do you have specific questions you'd like to practice?",
      sender: "ai",
      timestamp: new Date(),
      type: "question"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [interviewMode, setInterviewMode] = useState<"chat" | "mock" | "practice">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, interviewMode);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: "ai",
        timestamp: new Date(),
        type: aiResponse.type
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      if (aiResponse.type === "feedback") {
        setSessionScore(prev => prev + aiResponse.score);
        setQuestionsAsked(prev => prev + 1);
      }
    }, Math.random() * 1000 + 1000);
  };

  const generateAIResponse = (userInput: string, mode: string) => {
    if (mode === "mock") {
      // Generate feedback and next question
      const score = Math.floor(Math.random() * 20) + 70; // Score between 70-90
      const feedback = [
        `Great response! I particularly liked how you structured your answer. Score: ${score}/100`,
        `Good answer, but try to be more specific with examples. Score: ${score}/100`,
        `Excellent use of the STAR method in your response! Score: ${score}/100`,
        `Strong answer! Consider adding more quantifiable results. Score: ${score}/100`
      ];
      
      const nextQuestion = interviewQuestions[Math.floor(Math.random() * interviewQuestions.length)];
      
      return {
        content: `${feedback[Math.floor(Math.random() * feedback.length)]}\n\nNext question: ${nextQuestion}`,
        type: "feedback" as const,
        score
      };
    }

    // Default chat responses
    const responses = [
      "That's a great point! Can you elaborate on that with a specific example?",
      "I understand. How would you handle a similar situation in the future?",
      "Interesting perspective! What do you think are the key skills needed for this role?",
      "Thank you for sharing that. Let's practice another common interview question: " + 
        interviewQuestions[Math.floor(Math.random() * interviewQuestions.length)]
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      type: "question" as const,
      score: 0
    };
  };

  const startMockInterview = () => {
    setInterviewMode("mock");
    setSessionScore(0);
    setQuestionsAsked(0);
    
    const startMessage: Message = {
      id: Date.now().toString(),
      content: "Great! Let's start your mock interview. I'll ask you questions and provide feedback on your responses. Remember to use the STAR method (Situation, Task, Action, Result) for behavioral questions.\n\nFirst question: " + interviewQuestions[0],
      sender: "ai",
      timestamp: new Date(),
      type: "question"
    };
    
    setMessages(prev => [...prev, startMessage]);
  };

  const resetSession = () => {
    setMessages([
      {
        id: "1",
        content: "Session reset! I'm ready to help you practice for your interviews. What would you like to work on?",
        sender: "ai",
        timestamp: new Date(),
        type: "question"
      }
    ]);
    setInterviewMode("chat");
    setSessionScore(0);
    setQuestionsAsked(0);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Speak your answer and we'll convert it to text.",
      });
    } else {
      // Simulate speech-to-text
      setInputValue("This is a simulated speech-to-text response. In a real implementation, this would be your spoken answer converted to text.");
      toast({
        title: "Recording Stopped",
        description: "Your speech has been converted to text.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Interview Coach</h1>
        <p className="text-muted-foreground">
          Practice interviews with our AI coach and get personalized feedback on your responses.
        </p>
      </div>

      {/* Session Stats */}
      {interviewMode === "mock" && questionsAsked > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-card border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{questionsAsked}</div>
              <p className="text-sm text-muted-foreground">Questions Asked</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {questionsAsked > 0 ? Math.round(sessionScore / questionsAsked) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-5 w-5 text-warning fill-current" />
                <span className="text-2xl font-bold text-warning">4.2</span>
              </div>
              <p className="text-sm text-muted-foreground">Session Rating</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-gradient-card border-0 shadow-lg h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Interview Coach</CardTitle>
                    <CardDescription>
                      {interviewMode === "mock" ? "Mock Interview Mode" : "Practice Chat Mode"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
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
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      {message.sender === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
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
                    placeholder="Type your response..."
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
              <CardTitle className="text-lg">Session Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={startMockInterview}
                className="w-full"
                variant="default"
                disabled={interviewMode === "mock"}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Mock Interview
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

          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="p-2 rounded bg-muted/20">
                <p className="font-medium mb-1">STAR Method</p>
                <p className="text-muted-foreground">Structure answers: Situation, Task, Action, Result</p>
              </div>
              <div className="p-2 rounded bg-muted/20">
                <p className="font-medium mb-1">Be Specific</p>
                <p className="text-muted-foreground">Use concrete examples and quantifiable results</p>
              </div>
              <div className="p-2 rounded bg-muted/20">
                <p className="font-medium mb-1">Practice Out Loud</p>
                <p className="text-muted-foreground">Use voice recording to improve delivery</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}