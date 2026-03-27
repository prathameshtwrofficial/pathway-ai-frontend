import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Target, TrendingUp, Users, Zap, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiTrendingUp, FiTarget, FiCompass, FiZap } from "react-icons/fi";
import "./LandingPage.css";

const Typewriter = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100); // Speed of typing
      return () => clearTimeout(timeout);
    } else {
      // Pause at the end, then reset
      const resetTimeout = setTimeout(() => {
        setDisplayText("");
        setCurrentIndex(0);
      }, 2000); // Pause for 2 seconds before restarting
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}<span className="animate-pulse">|</span></span>;
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Floating background elements */}
        <div className="hero-bg-element hero-bg-element-1"></div>
        <div className="hero-bg-element hero-bg-element-2"></div>
        <div className="hero-bg-element hero-bg-element-3"></div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <div className="hero-badge">
                <Sparkles className="h-4 w-4" />
                Powered by Advanced AI & Machine Learning
              </div>

              {/* Title */}
              <h1 className="hero-title">
                <Typewriter text="AI Career Compass" />
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle">
                Your Intelligent Career Guidance System
              </p>

              {/* Description */}
              <p className="hero-description">
                Leverage the power of AI and Machine Learning to discover your perfect career path,
                analyze skill gaps, and get personalized roadmaps for professional success.
              </p>

              {/* Buttons */}
              <div className="hero-buttons">
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
            </motion.div>

            {/* Right Column - Visual Area */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="hero-visual"
            >
                            <div className="relative w-full max-w-lg mx-auto">
                {/* AI Dashboard Visualization */}
                <motion.div
                  className="ai-dashboard"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  {/* Central AI Core */}
                  <motion.div
                    className="ai-core"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="ai-core-inner">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Connecting Nodes */}
                  <motion.div
                    className="node node-1"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                  >
                    <FiTarget className="h-5 w-5 text-secondary" />
                  </motion.div>
                  <motion.div
                    className="node node-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    <FiTrendingUp className="h-5 w-5 text-accent" />
                  </motion.div>
                  <motion.div
                    className="node node-3"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  >
                    <FiZap className="h-5 w-5 text-warning" />
                  </motion.div>
                  <motion.div
                    className="node node-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    <FiCompass className="h-5 w-5 text-primary" />
                  </motion.div>

                  {/* Data Flow Lines */}
                  <svg className="data-flow" viewBox="0 0 300 300" fill="none">
                    <motion.path
                      d="M150 150 L80 80"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                    <motion.path
                      d="M150 150 L220 80"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 1.5 }}
                    />
                    <motion.path
                      d="M150 150 L220 220"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 2 }}
                    />
                    <motion.path
                      d="M150 150 L80 220"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 2.5 }}
                    />
                  </svg>

                  {/* Floating Particles */}
                  <motion.div
                    className="particle particle-1"
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -15, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div
                    className="particle particle-2"
                    animate={{
                      x: [0, -15, 0],
                      y: [0, 20, 0],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  />
                  <motion.div
                    className="particle particle-3"
                    animate={{
                      x: [0, 10, 0],
                      y: [0, -25, 0],
                      opacity: [0.4, 0.9, 0.4]
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
                  />
                </motion.div>

                {/* Feature Labels */}
                <motion.div
                  className="feature-labels"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                >
                  <div className="feature-label label-1">
                    <span className="text-xs font-medium text-white/80">AI Analysis</span>
                  </div>
                  <div className="feature-label label-2">
                    <span className="text-xs font-medium text-white/80">Career Paths</span>
                  </div>
                  <div className="feature-label label-3">
                    <span className="text-xs font-medium text-white/80">Job Matching</span>
                  </div>
                  <div className="feature-label label-4">
                    <span className="text-xs font-medium text-white/80">Guidance</span>
                  </div>
                </motion.div>
         </div>
       </motion.div>
     </div>
   </div>
 </section>

      {/* AI Technology Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our ML-driven platform analyzes your skills, interests, and market trends
              to provide personalized career guidance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border border-border/20 shadow-sm hover:shadow-lg hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiTarget className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Skill Gap Analysis</CardTitle>
                  <CardDescription>
                    Identify and bridge skill gaps with AI-powered insights.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border border-border/20 shadow-sm hover:shadow-lg hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiTrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>AI Career Roadmaps</CardTitle>
                  <CardDescription>
                    Get personalized career paths tailored to your goals.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border border-border/20 shadow-sm hover:shadow-lg hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-warning/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiZap className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Real-Time Market Insights</CardTitle>
                  <CardDescription>
                    Stay updated with current job market trends and demands.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border border-border/20 shadow-sm hover:shadow-lg hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiCompass className="h-6 w-6 text-warning" />
                  </div>
                  <CardTitle>Personalized Guidance</CardTitle>
                  <CardDescription>
                    Receive tailored advice from AI career experts.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your career in three simple steps with AI-powered guidance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/50 via-secondary/50 to-accent/50"></div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Tell Us Your Goals</h3>
              <p className="text-muted-foreground">
                Share your career aspirations, skills, and interests with our AI system.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analyzes Your Profile</h3>
              <p className="text-muted-foreground">
                Our advanced algorithms process your information and market data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your Roadmap</h3>
              <p className="text-muted-foreground">
                Receive a personalized career development plan with actionable steps.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ready to Discover Your Next Career Step with AI?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their careers with AI Career Compass.
            </p>
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
          </motion.div>
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
