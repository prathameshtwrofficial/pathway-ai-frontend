import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Target, TrendingUp, Users, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="mb-6 text-4xl font-bold lg:text-6xl xl:text-7xl">
              AI Career Compass
            </h1>
            <p className="mb-4 text-xl lg:text-2xl opacity-90">
              Your Intelligent Career Guidance System
            </p>
            <p className="mb-8 text-lg opacity-80 max-w-2xl mx-auto">
              Leverage the power of AI and Machine Learning to discover your perfect career path, 
              analyze skill gaps, and get personalized roadmaps for professional success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                variant="hero" 
                size="xl" 
                className="shadow-glow hover:shadow-xl transform hover:scale-105"
              >
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="xl"
                className="glass text-white border-white/30 hover:bg-white/20"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our ML-driven platform analyzes your skills, interests, and market trends 
              to provide personalized career guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Career Analysis</CardTitle>
                <CardDescription>
                  Advanced algorithms analyze your resume and preferences to suggest optimal career paths.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Skill Gap Analysis</CardTitle>
                <CardDescription>
                  Identify missing skills and get personalized recommendations to advance your career.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Personalized Roadmap</CardTitle>
                <CardDescription>
                  Get step-by-step guidance with courses, projects, and milestones tailored to your goals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>ATS Resume Analyzer</CardTitle>
                <CardDescription>
                  Optimize your resume for Applicant Tracking Systems with AI-powered analysis.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Interview Coach</CardTitle>
                <CardDescription>
                  Practice interviews with our AI chatbot and get personalized feedback.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Career Recommendations</CardTitle>
                <CardDescription>
                  Machine learning models provide data-driven career suggestions based on your profile.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have discovered their perfect career path 
              with AI Career Compass.
            </p>
            <Button 
              asChild 
              variant="hero" 
              size="xl"
              className="bg-white text-primary hover:bg-white/90 shadow-glow"
            >
              <Link to="/signup">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">AI Career Compass</h3>
            <p className="text-muted-foreground mb-4">
              Intelligent Career Guidance System powered by Machine Learning
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 AI Career Compass. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;