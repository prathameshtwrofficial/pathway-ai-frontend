import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, BookOpen, ExternalLink, Search, Youtube, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { 
  Route, 
  CheckCircle, 
  Clock, 
  Award, 
  Play,
  Calendar,
  Users,
  TrendingUp,
  Briefcase,
  Code,
  Database,
  Cloud,
  Brain,
  PenTool,
  Stethoscope,
  Building2,
  GraduationCap,
  Gavel,
  Plane,
  Megaphone,
  Calculator
} from "lucide-react";

// Roadmap data for different sectors and job roles
const sectorRoadmaps: Record<string, Record<string, any>> = {
  tech: {
    "Software Engineer": {
      icon: Code,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build core programming skills and fundamentals",
          milestones: [
            { title: "HTML/CSS/JavaScript Mastery", type: "course", duration: "4 weeks", skills: ["HTML", "CSS", "JavaScript"] },
            { title: "Git & Version Control", type: "course", duration: "2 weeks", skills: ["Git", "GitHub", "Branch Management"] },
            { title: "Build Portfolio Website", type: "project", duration: "3 weeks", skills: ["Responsive Design", "Deployment"] },
            { title: "Basic Data Structures", type: "course", duration: "4 weeks", skills: ["Arrays", "Linked Lists", "Stacks", "Queues"] }
          ]
        },
        {
          id: 2,
          title: "Core Skills Phase",
          duration: "4 months",
          description: "Master modern frameworks and backend development",
          milestones: [
            { title: "React Fundamentals", type: "course", duration: "4 weeks", skills: ["React", "JSX", "Components", "State"] },
            { title: "Node.js & Express", type: "course", duration: "4 weeks", skills: ["Express", "REST APIs", "Middleware"] },
            { title: "Database Design (SQL/NoSQL)", type: "course", duration: "3 weeks", skills: ["PostgreSQL", "MongoDB", "Schema Design"] },
            { title: "Full-Stack Project", type: "project", duration: "6 weeks", skills: ["Full Integration", "Authentication", "Deployment"] },
            { title: "Computer Science Fundamentals", type: "course", duration: "4 weeks", skills: ["Algorithms", "Time Complexity", "Space Complexity"] }
          ]
        },
        {
          id: 3,
          title: "Advanced Phase",
          duration: "4 months",
          description: "Specialize in cloud, DevOps, and system design",
          milestones: [
            { title: "AWS/Cloud Fundamentals", type: "course", duration: "4 weeks", skills: ["EC2", "S3", "Lambda", "VPC"] },
            { title: "System Design Basics", type: "course", duration: "3 weeks", skills: ["Scalability", "Load Balancing", "Caching"] },
            { title: "Docker & Kubernetes", type: "course", duration: "4 weeks", skills: ["Containers", "Orchestration", "Deployment"] },
            { title: "Advanced React Patterns", type: "course", duration: "3 weeks", skills: ["Hooks", "Context", "Performance"] },
            { title: "CI/CD Pipeline Setup", type: "project", duration: "3 weeks", skills: ["GitHub Actions", "Testing", "Deployment"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for interviews and professional growth",
          milestones: [
            { title: "LeetCode/DSA Practice", type: "course", duration: "6 weeks", skills: ["Problem Solving", "Patterns"] },
            { title: "System Design Interview Prep", type: "course", duration: "4 weeks", skills: ["Architecture", "Design Patterns"] },
            { title: "Build Advanced Project", type: "project", duration: "4 weeks", skills: ["Full Stack", "Cloud Native"] },
            { title: "Resume & LinkedIn Optimization", type: "course", duration: "1 week", skills: ["Personal Branding"] }
          ]
        }
      ]
    },
    "Data Scientist": {
      icon: Brain,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build programming and math foundations",
          milestones: [
            { title: "Python Programming", type: "course", duration: "4 weeks", skills: ["Python", "Data Types", "OOP"] },
            { title: "Statistics & Probability", type: "course", duration: "4 weeks", skills: ["Descriptive Stats", "Probability", "Distributions"] },
            { title: "Linear Algebra", type: "course", duration: "3 weeks", skills: ["Matrices", "Vectors", "Operations"] },
            { title: "Data Analysis with Pandas", type: "course", duration: "3 weeks", skills: ["Pandas", "NumPy", "Data Cleaning"] }
          ]
        },
        {
          id: 2,
          title: "Machine Learning Phase",
          duration: "5 months",
          description: "Master ML algorithms and frameworks",
          milestones: [
            { title: "Machine Learning Fundamentals", type: "course", duration: "5 weeks", skills: ["Supervised Learning", "Unsupervised Learning"] },
            { title: "Scikit-Learn & Model Building", type: "course", duration: "4 weeks", skills: ["Regression", "Classification", "Evaluation"] },
            { title: "Deep Learning with TensorFlow", type: "course", duration: "5 weeks", skills: ["Neural Networks", "CNNs", "RNNs"] },
            { title: "NLP Fundamentals", type: "course", duration: "4 weeks", skills: ["Text Processing", "Embeddings", "Transformers"] },
            { title: "ML Project Portfolio", type: "project", duration: "6 weeks", skills: ["End-to-End ML", "Deployment"] }
          ]
        },
        {
          id: 3,
          title: "Specialization Phase",
          duration: "4 months",
          description: "Focus on advanced techniques and tools",
          milestones: [
            { title: "Advanced SQL & Big Data", type: "course", duration: "4 weeks", skills: ["Spark", "Hive", "ETL"] },
            { title: "MLOps & Deployment", type: "course", duration: "3 weeks", skills: ["ML Pipelines", "Model Serving"] },
            { title: "Data Visualization", type: "course", duration: "3 weeks", skills: ["Tableau", "Matplotlib", "Storytelling"] },
            { title: "Feature Engineering", type: "course", duration: "3 weeks", skills: ["Feature Selection", "Transformation"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "2 months",
          description: "Prepare for data science roles",
          milestones: [
            { title: "Kaggle Competitions", type: "project", duration: "4 weeks", skills: ["Competition Strategies"] },
            { title: "Portfolio Building", type: "project", duration: "3 weeks", skills: ["Case Studies", "GitHub"] },
            { title: "Interview Prep", type: "course", duration: "3 weeks", skills: ["SQL", "ML", "Statistics"] }
          ]
        }
      ]
    },
    "DevOps Engineer": {
      icon: Cloud,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build Linux and networking foundations",
          milestones: [
            { title: "Linux Fundamentals", type: "course", duration: "4 weeks", skills: ["Linux", "Bash", "Shell Scripting"] },
            { title: "Networking Basics", type: "course", duration: "3 weeks", skills: ["TCP/IP", "DNS", "HTTP"] },
            { title: "Git & Version Control", type: "course", duration: "2 weeks", skills: ["Git", "GitHub", "CI/CD Basics"] },
            { title: "Python for Automation", type: "course", duration: "4 weeks", skills: ["Python", "Automation Scripts"] }
          ]
        },
        {
          id: 2,
          title: "Containerization Phase",
          duration: "4 months",
          description: "Master containers and orchestration",
          milestones: [
            { title: "Docker Fundamentals", type: "course", duration: "4 weeks", skills: ["Containers", "Images", "Dockerfile"] },
            { title: "Kubernetes Basics", type: "course", duration: "4 weeks", skills: ["Pods", "Services", "Deployments"] },
            { title: "Container Orchestration", type: "course", duration: "3 weeks", skills: ["Helm", "Ingress", "Storage"] },
            { title: "CI/CD Pipeline Design", type: "project", duration: "5 weeks", skills: ["Jenkins", "GitLab", "GitHub Actions"] }
          ]
        },
        {
          id: 3,
          title: "Cloud & Infrastructure Phase",
          duration: "4 months",
          description: "Master cloud platforms and IaC",
          milestones: [
            { title: "AWS Fundamentals", type: "course", duration: "5 weeks", skills: ["EC2", "S3", "VPC", "IAM"] },
            { title: "Infrastructure as Code", type: "course", duration: "4 weeks", skills: ["Terraform", "CloudFormation"] },
            { title: "Configuration Management", type: "course", duration: "3 weeks", skills: ["Ansible", "Chef", "Puppet"] },
            { title: "Monitoring & Logging", type: "course", duration: "3 weeks", skills: ["Prometheus", "Grafana", "ELK"] }
          ]
        },
        {
          id: 4,
          title: "Advanced Phase",
          duration: "3 months",
          description: "Master advanced DevOps practices",
          milestones: [
            { title: "Security in DevOps", type: "course", duration: "3 weeks", skills: ["DevSecOps", "Security Scanning"] },
            { title: "GitOps Implementation", type: "project", duration: "4 weeks", skills: ["ArgoCD", "Flux"] },
            { title: "Platform Engineering", type: "course", duration: "3 weeks", skills: ["Internal Developer Platform"] },
            { title: "Final DevOps Project", type: "project", duration: "4 weeks", skills: ["Full Pipeline", "Cloud Native"] }
          ]
        }
      ]
    }
  },
  healthcare: {
    "Healthcare Administrator": {
      icon: Building2,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build healthcare industry knowledge",
          milestones: [
            { title: "Healthcare Systems Overview", type: "course", duration: "4 weeks", skills: ["US Healthcare", "Delivery Models"] },
            { title: "Healthcare Terminology", type: "course", duration: "3 weeks", skills: ["Medical Terms", "Coding Basics"] },
            { title: "Healthcare Regulations", type: "course", duration: "3 weeks", skills: ["HIPAA", "Compliance"] },
            { title: "Introduction to Health Insurance", type: "course", duration: "3 weeks", skills: ["Insurance Types", "Billing"] }
          ]
        },
        {
          id: 2,
          title: "Management Skills Phase",
          duration: "4 months",
          description: "Develop leadership and management skills",
          milestones: [
            { title: "Healthcare Management Principles", type: "course", duration: "4 weeks", skills: ["Leadership", "Planning"] },
            { title: "Healthcare Finance", type: "course", duration: "4 weeks", skills: ["Budgeting", "Financial Analysis"] },
            { title: "Quality Improvement", type: "course", duration: "3 weeks", skills: ["PDCA", "Metrics", "JCAHO"] },
            { title: "Healthcare Operations", type: "course", duration: "4 weeks", skills: ["Scheduling", "Resource Management"] }
          ]
        },
        {
          id: 3,
          title: "Specialization Phase",
          duration: "4 months",
          description: "Focus on specific healthcare areas",
          milestones: [
            { title: "Health Information Systems", type: "course", duration: "4 weeks", skills: ["EHR", "Data Management"] },
            { title: "Healthcare Marketing", type: "course", duration: "3 weeks", skills: ["Patient Acquisition", "Branding"] },
            { title: "Healthcare Policy", type: "course", duration: "3 weeks", skills: ["Policy Analysis", "Advocacy"] },
            { title: "Compliance & Risk Management", type: "course", duration: "4 weeks", skills: ["Risk Assessment", "Audit"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for leadership roles",
          milestones: [
            { title: "Strategic Planning", type: "course", duration: "3 weeks", skills: ["Strategy", "Vision"] },
            { title: "Healthcare Consulting Project", type: "project", duration: "4 weeks", skills: ["Consulting", "Analysis"] },
            { title: "Leadership Development", type: "course", duration: "3 weeks", skills: ["Executive Skills", "Communication"] }
          ]
        }
      ]
    },
    "Clinical Research Coordinator": {
      icon: Stethoscope,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build clinical research foundations",
          milestones: [
            { title: "Clinical Research Basics", type: "course", duration: "4 weeks", skills: ["Research Methods", "Phases"] },
            { title: "GCP (Good Clinical Practice)", type: "course", duration: "3 weeks", skills: ["GCP Guidelines", "Ethics"] },
            { title: "Medical Terminology", type: "course", duration: "3 weeks", skills: ["Medical Terms", "Documentation"] },
            { title: "Research Ethics", type: "course", duration: "2 weeks", skills: ["IRB", "Informed Consent"] }
          ]
        },
        {
          id: 2,
          title: "Clinical Operations Phase",
          duration: "4 months",
          description: "Master clinical trial operations",
          milestones: [
            { title: "Protocol Development", type: "course", duration: "3 weeks", skills: ["Protocol Writing", "Design"] },
            { title: "Site Management", type: "course", duration: "4 weeks", skills: ["Site Selection", "Activation"] },
            { title: "Patient Recruitment", type: "course", duration: "3 weeks", skills: ["Recruitment Strategies", "Retention"] },
            { title: "Data Management", type: "course", duration: "4 weeks", skills: ["EDC", "Data Capture", "CRFs"] }
          ]
        },
        {
          id: 3,
          title: "Regulatory Phase",
          duration: "3 months",
          description: "Learn regulatory requirements",
          milestones: [
            { title: "FDA Regulations", type: "course", duration: "4 weeks", skills: ["IND", "NDA", "Submissions"] },
            { title: "Regulatory Submissions", type: "course", duration: "3 weeks", skills: ["CTAs", "Amendments"] },
            { title: "Safety Reporting", type: "course", duration: "3 weeks", skills: ["AE/SAE Reporting", "PV"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "2 months",
          description: "Prepare for certification and roles",
          milestones: [
            { title: "Clinical Trial Simulation", type: "project", duration: "4 weeks", skills: ["End-to-End Trial"] },
            { title: "Certification Prep", type: "course", duration: "3 weeks", skills: ["CCRC", "CCRP"] }
          ]
        }
      ]
    }
  },
  business: {
    "Business Analyst": {
      icon: Briefcase,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build business analysis fundamentals",
          milestones: [
            { title: "Business Analysis Fundamentals", type: "course", duration: "4 weeks", skills: ["BA Role", "Requirements"] },
            { title: "Business Process Modeling", type: "course", duration: "3 weeks", skills: ["BPMN", "Flowcharts", "Process Maps"] },
            { title: "Data Analysis Basics", type: "course", duration: "4 weeks", skills: ["Excel", "SQL Basics", "Statistics"] },
            { title: "Stakeholder Management", type: "course", duration: "3 weeks", skills: ["Communication", "Elicitation"] }
          ]
        },
        {
          id: 2,
          title: "Analysis Skills Phase",
          duration: "4 months",
          description: "Develop advanced analysis capabilities",
          milestones: [
            { title: "Requirements Gathering", type: "course", duration: "4 weeks", skills: ["JAD Sessions", "Interviews", "Documentation"] },
            { title: "Data Visualization & Analytics", type: "course", duration: "4 weeks", skills: ["Tableau", "Power BI", "Insights"] },
            { title: "Financial Analysis", type: "course", duration: "4 weeks", skills: ["Financial Statements", "ROI", "Budgeting"] },
            { title: "Gap Analysis", type: "course", duration: "3 weeks", skills: ["Current State", "Future State", "Solutions"] }
          ]
        },
        {
          id: 3,
          title: "Specialization Phase",
          duration: "4 months",
          description: "Focus on specific business domains",
          milestones: [
            { title: "Agile Methodologies", type: "course", duration: "3 weeks", skills: ["Scrum", "Kanban", "User Stories"] },
            { title: "Technical Writing", type: "course", duration: "3 weeks", skills: ["BRD", "FRD", "User Guides"] },
            { title: "SQL for Analysts", type: "course", duration: "4 weeks", skills: ["Advanced Queries", "Joins", "Aggregations"] },
            { title: "Project Management Basics", type: "course", duration: "3 weeks", skills: ["PM Fundamentals", "Scheduling"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for BA roles",
          milestones: [
            { title: "Business Analysis Project", type: "project", duration: "5 weeks", skills: ["End-to-End BA Project"] },
            { title: "ECBA/CBAP Preparation", type: "course", duration: "3 weeks", skills: ["Certification Prep"] },
            { title: "Portfolio Development", type: "project", duration: "3 weeks", skills: ["Case Studies", "Documentation"] }
          ]
        }
      ]
    },
    "Product Manager": {
      icon: TrendingUp,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build product management fundamentals",
          milestones: [
            { title: "Product Management Basics", type: "course", duration: "4 weeks", skills: ["PM Role", "Frameworks"] },
            { title: "User Research", type: "course", duration: "3 weeks", skills: ["User Interviews", "Surveys", "Personas"] },
            { title: "Market Analysis", type: "course", duration: "3 weeks", skills: ["Competitor Analysis", "Market Sizing"] },
            { title: "Product Thinking", type: "course", duration: "3 weeks", skills: ["MVP", "Product-Market Fit"] }
          ]
        },
        {
          id: 2,
          title: "Product Development Phase",
          duration: "4 months",
          description: "Master product development lifecycle",
          milestones: [
            { title: "Roadmap & Strategy", type: "course", duration: "4 weeks", skills: ["Roadmapping", "Prioritization"] },
            { title: "Agile for PMs", type: "course", duration: "3 weeks", skills: ["Scrum", "Sprints", "Backlog"] },
            { title: "Metrics & Analytics", type: "course", duration: "4 weeks", skills: ["KPIs", "A/B Testing", "Analytics"] },
            { title: "Product Design", type: "course", duration: "3 weeks", skills: ["UX Basics", "Prototyping", "Wireframing"] }
          ]
        },
        {
          id: 3,
          title: "Advanced Skills Phase",
          duration: "4 months",
          description: "Develop advanced PM skills",
          milestones: [
            { title: "Technical PM Skills", type: "course", duration: "4 weeks", skills: ["Technical Basics", "API", "Data"] },
            { title: "Stakeholder Management", type: "course", duration: "3 weeks", skills: ["Executive Communication", "Alignment"] },
            { title: "Growth & Retention", type: "course", duration: "4 weeks", skills: ["Growth Strategies", "Churn"] },
            { title: "Pricing & Monetization", type: "course", duration: "3 weeks", skills: ["Pricing Models", "Revenue"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for PM roles",
          milestones: [
            { title: "Build Portfolio Project", type: "project", duration: "5 weeks", skills: ["PRD", "Case Study"] },
            { title: "Interview Prep", type: "course", duration: "4 weeks", skills: ["Case Questions", "Product Sense"] },
            { title: "Industry Networking", type: "course", duration: "2 weeks", skills: ["LinkedIn", "Communities"] }
          ]
        }
      ]
    }
  },
  finance: {
    "Financial Analyst": {
      icon: Calculator,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build finance and accounting fundamentals",
          milestones: [
            { title: "Financial Accounting", type: "course", duration: "4 weeks", skills: ["GAAP", "Financial Statements"] },
            { title: "Management Accounting", type: "course", duration: "3 weeks", skills: ["Cost Accounting", "Budgeting"] },
            { title: "Excel Advanced", type: "course", duration: "3 weeks", skills: ["Formulas", "Pivot Tables", "VBA"] },
            { title: "Finance Math", type: "course", duration: "3 weeks", skills: ["Time Value", "NPV", "IRR"] }
          ]
        },
        {
          id: 2,
          title: "Analysis Skills Phase",
          duration: "4 months",
          description: "Master financial analysis techniques",
          milestones: [
            { title: "Financial Modeling", type: "course", duration: "5 weeks", skills: ["DCF", "LBO", "Mergers"] },
            { title: "Valuation Techniques", type: "course", duration: "4 weeks", skills: ["Relative", "Absolute", "Multiples"] },
            { title: "Investment Analysis", type: "course", duration: "4 weeks", skills: ["Portfolio Theory", "Risk/Return"] },
            { title: "Financial Planning & Analysis", type: "course", duration: "4 weeks", skills: ["FP&A", "Forecasting"] }
          ]
        },
        {
          id: 3,
          title: "Specialization Phase",
          duration: "4 months",
          description: "Focus on specific finance areas",
          milestones: [
            { title: "Capital Markets", type: "course", duration: "4 weeks", skills: ["Equities", "Fixed Income", "Derivatives"] },
            { title: "Corporate Finance", type: "course", duration: "4 weeks", skills: ["Capital Budgeting", "WACC"] },
            { title: "Risk Management", type: "course", duration: "3 weeks", skills: ["Market Risk", "Credit Risk"] },
            { title: "Financial Technology", type: "course", duration: "3 weeks", skills: ["FinTech", "Data Analytics"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for finance roles",
          milestones: [
            { title: "Build Financial Models", type: "project", duration: "5 weeks", skills: ["Valuation", "Pitch Deck"] },
            { title: "CFA Level 1 Prep", type: "course", duration: "4 weeks", skills: ["CFA Curriculum"] },
            { title: "Bloomberg Terminal Training", type: "course", duration: "2 weeks", skills: ["Market Data", "Analysis"] }
          ]
        }
      ]
    },
    "Investment Banker": {
      icon: TrendingUp,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build investment banking fundamentals",
          milestones: [
            { title: "Financial Accounting", type: "course", duration: "4 weeks", skills: ["Financial Statements", "Analysis"] },
            { title: "Corporate Finance", type: "course", duration: "4 weeks", skills: ["Capital Structure", "Valuation"] },
            { title: "Excel & Modeling", type: "course", duration: "4 weeks", skills: ["Financial Modeling", "VBA"] },
            { title: "Industry Overview", type: "course", duration: "2 weeks", skills: ["IB Sector", "Product Types"] }
          ]
        },
        {
          id: 2,
          title: "Technical Skills Phase",
          duration: "4 months",
          description: "Master investment banking techniques",
          milestones: [
            { title: "M&A Analysis", type: "course", duration: "4 weeks", skills: ["Deal Structure", "Accretion/Dilution"] },
            { title: "DCF Valuation", type: "course", duration: "4 weeks", skills: ["WACC", "Terminal Value"] },
            { title: "LBO Modeling", type: "course", duration: "4 weeks", skills: ["Leveraged Buyout", "Returns"] },
            { title: "Pitch Book Creation", type: "project", duration: "4 weeks", skills: ["Presentation", "Analysis"] }
          ]
        },
        {
          id: 3,
          title: "Deal Experience Phase",
          duration: "4 months",
          description: "Gain practical deal experience",
          milestones: [
            { title: "Due Diligence", type: "course", duration: "3 weeks", skills: ["DD Process", "Data Room"] },
            { title: "Deal Structuring", type: "course", duration: "4 weeks", skills: ["Term Sheets", "Financing"] },
            { title: "Client Presentation", type: "course", duration: "3 weeks", skills: ["Pitching", "Negotiation"] },
            { title: "Simulated Deal", type: "project", duration: "5 weeks", skills: ["End-to-End Transaction"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for investment banking career",
          milestones: [
            { title: "Superday Prep", type: "course", duration: "4 weeks", skills: ["Technical", "Fit Questions"] },
            { title: "Model Building Final", type: "project", duration: "4 weeks", skills: ["Full Model"] },
            { title: "Networking Strategy", type: "course", duration: "2 weeks", skills: [" outreach", "Relationships"] }
          ]
        }
      ]
    }
  },
  marketing: {
    "Digital Marketer": {
      icon: Megaphone,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build digital marketing fundamentals",
          milestones: [
            { title: "Digital Marketing Overview", type: "course", duration: "3 weeks", skills: ["Channels", "Funnel"] },
            { title: "Content Marketing", type: "course", duration: "4 weeks", skills: ["Content Strategy", "Creation"] },
            { title: "Social Media Marketing", type: "course", duration: "4 weeks", skills: ["Platforms", "Strategy"] },
            { title: "Analytics Basics", type: "course", duration: "3 weeks", skills: ["Google Analytics", "Metrics"] }
          ]
        },
        {
          id: 2,
          title: "Channel Expertise Phase",
          duration: "4 months",
          description: "Master key digital marketing channels",
          milestones: [
            { title: "SEO Fundamentals", type: "course", duration: "4 weeks", skills: ["On-page", "Off-page", "Technical"] },
            { title: "PPC Advertising", type: "course", duration: "4 weeks", skills: ["Google Ads", "Campaigns"] },
            { title: "Email Marketing", type: "course", duration: "3 weeks", skills: ["Automation", "Segmentation"] },
            { title: "Paid Social", type: "course", duration: "4 weeks", skills: ["Facebook Ads", "Targeting"] }
          ]
        },
        {
          id: 3,
          title: "Advanced Marketing Phase",
          duration: "4 months",
          description: "Develop advanced marketing skills",
          milestones: [
            { title: "Marketing Automation", type: "course", duration: "3 weeks", skills: ["HubSpot", "Marketo"] },
            { title: "Conversion Optimization", type: "course", duration: "4 weeks", skills: ["A/B Testing", "CRO"] },
            { title: "Data-Driven Marketing", type: "course", duration: "4 weeks", skills: ["Attribution", "Data Analysis"] },
            { title: "Brand Strategy", type: "course", duration: "3 weeks", skills: ["Positioning", "Messaging"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for marketing roles",
          milestones: [
            { title: "Digital Marketing Campaign", type: "project", duration: "5 weeks", skills: ["Full Campaign"] },
            { title: "Google Ads Certification", type: "course", duration: "2 weeks", skills: ["Certification"] },
            { title: "Portfolio Development", type: "project", duration: "3 weeks", skills: ["Case Studies"] }
          ]
        }
      ]
    }
  },
  education: {
    "Instructional Designer": {
      icon: GraduationCap,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build instructional design fundamentals",
          milestones: [
            { title: "Instructional Design Basics", type: "course", duration: "4 weeks", skills: ["ADDIE", "SAM"] },
            { title: "Adult Learning Theory", type: "course", duration: "3 weeks", skills: ["Andragogy", "Knowles"] },
            { title: "Learning Objectives", type: "course", duration: "3 weeks", skills: ["Bloom's", "Writing Objectives"] },
            { title: "Storyboarding", type: "course", duration: "3 weeks", skills: ["Visual Design", "Flow"] }
          ]
        },
        {
          id: 2,
          title: "Content Development Phase",
          duration: "4 months",
          description: "Master content development tools",
          milestones: [
            { title: "E-Learning Development", type: "course", duration: "4 weeks", skills: ["Articulate", "Rise"] },
            { title: "Multimedia Design", type: "course", duration: "4 weeks", skills: ["Video", "Audio", "Graphics"] },
            { title: "Learning Management Systems", type: "course", duration: "3 weeks", skills: ["Moodle", "Canvas", "Blackboard"] },
            { title: "Interactive Content", type: "course", duration: "4 weeks", skills: ["H5P", "Gamification"] }
          ]
        },
        {
          id: 3,
          title: "Advanced Phase",
          duration: "4 months",
          description: "Develop advanced ID capabilities",
          milestones: [
            { title: "Microlearning Design", type: "course", duration: "3 weeks", skills: ["Modular Design", "Mobile"] },
            { title: "Assessment Design", type: "course", duration: "4 weeks", skills: ["Formative", "Summative"] },
            { title: "LMS Administration", type: "course", duration: "3 weeks", skills: ["Configuration", "Analytics"] },
            { title: "Accessibility Standards", type: "course", duration: "3 weeks", skills: ["WCAG", "508 Compliance"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for ID roles",
          milestones: [
            { title: "Build E-Learning Course", type: "project", duration: "5 weeks", skills: ["Full Course"] },
            { title: "Portfolio Development", type: "project", duration: "4 weeks", skills: ["Work Samples"] },
            { title: "Certification Prep", type: "course", duration: "2 weeks", skills: ["ATD", "eLearning"] }
          ]
        }
      ]
    }
  },
  law: {
    "Paralegal": {
      icon: Gavel,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build legal fundamentals",
          milestones: [
            { title: "Legal Research & Writing", type: "course", duration: "4 weeks", skills: ["Case Law", "Statutes"] },
            { title: "Legal Ethics", type: "course", duration: "3 weeks", skills: ["Professional Responsibility"] },
            { title: "Civil Litigation", type: "course", duration: "4 weeks", skills: ["Procedure", "Discovery"] },
            { title: "Legal Terminology", type: "course", duration: "3 weeks", skills: ["Legal Terms", "Usage"] }
          ]
        },
        {
          id: 2,
          title: "Practice Area Phase",
          duration: "4 months",
          description: "Specialize in practice areas",
          milestones: [
            { title: "Corporate Law", type: "course", duration: "4 weeks", skills: ["Business Entities", "Governance"] },
            { title: "Real Estate Law", type: "course", duration: "3 weeks", skills: ["Transactions", "Title"] },
            { title: "Intellectual Property", type: "course", duration: "4 weeks", skills: ["Patents", "Trademarks", "Copyright"] },
            { title: "Legal Technology", type: "course", duration: "4 weeks", skills: ["Legal Software", "AI Tools"] }
          ]
        },
        {
          id: 3,
          title: "Skills Development Phase",
          duration: "4 months",
          description: "Master practical paralegal skills",
          milestones: [
            { title: "Document Preparation", type: "course", duration: "4 weeks", skills: ["Pleadings", "Contracts"] },
            { title: "Case Management", type: "course", duration: "3 weeks", skills: ["Organization", "Timeline"] },
            { title: "Client Relations", type: "course", duration: "3 weeks", skills: ["Communication", "Ethics"] },
            { title: "Court Procedures", type: "course", duration: "4 weeks", skills: ["Filings", "Rules"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for certification and employment",
          milestones: [
            { title: "Paralegal Certification Prep", type: "course", duration: "4 weeks", skills: ["NALA", "NFPA"] },
            { title: "Legal Internship", type: "project", duration: "4 weeks", skills: ["Real Work Experience"] },
            { title: "Portfolio Development", type: "project", duration: "3 weeks", skills: ["Writing Samples"] }
          ]
        }
      ]
    }
  },
  aviation: {
    "Airport Operations Manager": {
      icon: Plane,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build aviation industry knowledge",
          milestones: [
            { title: "Aviation Industry Overview", type: "course", duration: "3 weeks", skills: ["Industry Structure", "Stakeholders"] },
            { title: "Airport Operations", type: "course", duration: "4 weeks", skills: ["Operations", "Procedures"] },
            { title: "Aviation Safety", type: "course", duration: "4 weeks", skills: ["Safety Management", "SMS"] },
            { title: "Aviation Security", type: "course", duration: "3 weeks", skills: ["Security Protocols", "TSA"] }
          ]
        },
        {
          id: 2,
          title: "Operations Management Phase",
          duration: "4 months",
          description: "Master airport operations",
          milestones: [
            { title: "Airside Operations", type: "course", duration: "4 weeks", skills: ["Runway", "Taxiway", "Apron"] },
            { title: "Landside Operations", type: "course", duration: "4 weeks", skills: ["Terminal", "Parking", "Ground Transport"] },
            { title: "Passenger Services", type: "course", duration: "3 weeks", skills: ["Customer Service", "Handling"] },
            { title: "Ground Handling", type: "course", duration: "4 weeks", skills: ["Baggage", "Catering", "Fuel"] }
          ]
        },
        {
          id: 3,
          title: "Business & Compliance Phase",
          duration: "4 months",
          description: "Learn business and regulatory aspects",
          milestones: [
            { title: "Airport Regulations", type: "course", duration: "4 weeks", skills: ["FAA", "ICAO", "Local"] },
            { title: "Airport Finance", type: "course", duration: "3 weeks", skills: ["Revenue", "Budgeting", "Contracts"] },
            { title: "Crisis Management", type: "course", duration: "4 weeks", skills: ["Emergency Response", "Contingency"] },
            { title: "Sustainability", type: "course", duration: "3 weeks", skills: ["Environmental", "Carbon"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for management roles",
          milestones: [
            { title: "Operations Simulation", type: "project", duration: "4 weeks", skills: ["Scenario Planning"] },
            { title: "Leadership Development", type: "course", duration: "4 weeks", skills: ["Management", "Teams"] },
            { title: "Airport Certification", type: "course", duration: "2 weeks", skills: ["Part 139"] }
          ]
        }
      ]
    }
  },
  arts: {
    "UX Designer": {
      icon: PenTool,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build UX design fundamentals",
          milestones: [
            { title: "UX Design Principles", type: "course", duration: "4 weeks", skills: ["Design Thinking", "User-Centered"] },
            { title: "User Research", type: "course", duration: "4 weeks", skills: ["Interviews", "Surveys", "Personas"] },
            { title: "Information Architecture", type: "course", duration: "3 weeks", skills: ["Sitemaps", "User Flows"] },
            { title: "Usability Testing", type: "course", duration: "3 weeks", skills: ["Testing", "Feedback"] }
          ]
        },
        {
          id: 2,
          title: "Visual Design Phase",
          duration: "4 months",
          description: "Master visual design tools and skills",
          milestones: [
            { title: "Visual Design Fundamentals", type: "course", duration: "4 weeks", skills: ["Typography", "Color", "Layout"] },
            { title: "Figma Mastery", type: "course", duration: "4 weeks", skills: ["Prototyping", "Components"] },
            { title: "Wireframing", type: "course", duration: "3 weeks", skills: ["Low-fidelity", "Communication"] },
            { title: "Interaction Design", type: "course", duration: "4 weeks", skills: ["Animations", "Micro-interactions"] }
          ]
        },
        {
          id: 3,
          title: "Advanced Design Phase",
          duration: "4 months",
          description: "Develop advanced design capabilities",
          milestones: [
            { title: "Design Systems", type: "course", duration: "4 weeks", skills: ["Components", "Tokens", "Documentation"] },
            { title: "Accessibility", type: "course", duration: "3 weeks", skills: ["WCAG", "Inclusive Design"] },
            { title: "Motion Design", type: "course", duration: "3 weeks", skills: ["After Effects", "Lottie"] },
            { title: "UX Writing", type: "course", duration: "3 weeks", skills: ["Microcopy", "Content Strategy"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for UX roles",
          milestones: [
            { title: "Build Design Portfolio", type: "project", duration: "6 weeks", skills: ["Case Studies", "End-to-End"] },
            { title: "Interview Prep", type: "course", duration: "3 weeks", skills: ["Whiteboard", "Portfolio Review"] },
            { title: "Industry Tools", type: "course", duration: "2 weeks", skills: ["FigJam", "Miro"] }
          ]
        }
      ]
    }
  },
  science: {
    "Research Scientist": {
      icon: Brain,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build research methodology foundations",
          milestones: [
            { title: "Research Methods", type: "course", duration: "4 weeks", skills: ["Qualitative", "Quantitative"] },
            { title: "Scientific Writing", type: "course", duration: "3 weeks", skills: ["Papers", "Grants"] },
            { title: "Statistics for Research", type: "course", duration: "4 weeks", skills: ["SPSS", "R", "Analysis"] },
            { title: "Literature Review", type: "course", duration: "3 weeks", skills: ["Search", "Synthesis"] }
          ]
        },
        {
          id: 2,
          title: "Specialization Phase",
          duration: "5 months",
          description: "Develop expertise in specific area",
          milestones: [
            { title: "Advanced Topics in Field", type: "course", duration: "6 weeks", skills: ["Specialized Knowledge"] },
            { title: "Lab Techniques", type: "course", duration: "5 weeks", skills: ["Equipment", "Methods"] },
            { title: "Data Analysis", type: "course", duration: "5 weeks", skills: ["Advanced Statistics", "Visualization"] },
            { title: "Research Ethics", type: "course", duration: "3 weeks", skills: ["IRB", "Compliance"] }
          ]
        },
        {
          id: 3,
          title: "Publication Phase",
          duration: "4 months",
          description: "Build publication record",
          milestones: [
            { title: "Manuscript Preparation", type: "project", duration: "5 weeks", skills: ["Writing", "Formatting"] },
            { title: "Peer Review Process", type: "course", duration: "3 weeks", skills: ["Review", "Response"] },
            { title: "Conference Presentations", type: "course", duration: "4 weeks", skills: ["Posters", "Talks"] },
            { title: "Grant Writing", type: "course", duration: "4 weeks", skills: ["Funding", "Proposals"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "2 months",
          description: "Prepare for research career",
          milestones: [
            { title: "PhD/Postdoc Strategy", type: "course", duration: "3 weeks", skills: ["Applications", "Networking"] },
            { title: "Research Network Building", type: "course", duration: "3 weeks", skills: ["Collaborations", "Conferences"] }
          ]
        }
      ]
    }
  },
  engineering: {
    "Civil Engineer": {
      icon: Building2,
      phases: [
        {
          id: 1,
          title: "Foundation Phase",
          duration: "3 months",
          description: "Build civil engineering fundamentals",
          milestones: [
            { title: "Engineering Fundamentals", type: "course", duration: "4 weeks", skills: ["Statics", "Dynamics"] },
            { title: "Structural Analysis", type: "course", duration: "4 weeks", skills: ["Load Analysis", "Beams"] },
            { title: "Materials Science", type: "course", duration: "3 weeks", skills: ["Concrete", "Steel", "Soils"] },
            { title: "CAD Software", type: "course", duration: "3 weeks", skills: ["AutoCAD", "Revit"] }
          ]
        },
        {
          id: 2,
          title: "Design Skills Phase",
          duration: "4 months",
          description: "Master design and analysis",
          milestones: [
            { title: "Structural Design", type: "course", duration: "5 weeks", skills: ["Steel", "Concrete", "Design"] },
            { title: "Foundation Design", type: "course", duration: "4 weeks", skills: ["Shallow", "Deep Foundations"] },
            { title: "Hydrology & Drainage", type: "course", duration: "4 weeks", skills: ["Water", "Stormwater"] },
            { title: "Highway Engineering", type: "course", duration: "4 weeks", skills: ["Pavement", "Traffic"] }
          ]
        },
        {
          id: 3,
          title: "Professional Skills Phase",
          duration: "4 months",
          description: "Develop professional competencies",
          milestones: [
            { title: "Building Codes & Standards", type: "course", duration: "4 weeks", skills: ["IBC", "AASHTO", "ASCE"] },
            { title: "Construction Management", type: "course", duration: "4 weeks", skills: ["Scheduling", "Cost", "Contracts"] },
            { title: "Project Management", type: "course", duration: "3 weeks", skills: ["PMBOK", "Leadership"] },
            { title: "Environmental Engineering", type: "course", duration: "4 weeks", skills: ["Sustainability", "Impact"] }
          ]
        },
        {
          id: 4,
          title: "Professional Phase",
          duration: "3 months",
          description: "Prepare for licensure and career",
          milestones: [
            { title: "FE Exam Preparation", type: "course", duration: "4 weeks", skills: ["Fundamentals"] },
            { title: "Design Project", type: "project", duration: "5 weeks", skills: ["Complete Design"] },
            { title: "Professional Development", type: "course", duration: "2 weeks", skills: ["Ethics", "Networking"] }
          ]
        }
      ]
    }
  }
};

// Default fallback roadmap for unknown sectors
const defaultRoadmap = {
  phases: [
    {
      id: 1,
      title: "Foundation Phase",
      duration: "3 months",
      description: "Build fundamental skills for your career path",
      milestones: [
        { title: "Industry Fundamentals", type: "course", duration: "4 weeks", skills: ["Industry Basics", "Key Concepts"] },
        { title: "Core Skills Development", type: "course", duration: "4 weeks", skills: ["Essential Skills"] },
        { title: "Professional Foundations", type: "course", duration: "4 weeks", skills: ["Basics", "Tools"] }
      ]
    },
    {
      id: 2,
      title: "Skill Building Phase",
      duration: "4 months",
      description: "Develop advanced skills and knowledge",
      milestones: [
        { title: "Advanced Topics", type: "course", duration: "4 weeks", skills: ["Deep Dive"] },
        { title: "Practical Application", type: "project", duration: "4 weeks", skills: ["Hands-on Experience"] },
        { title: "Specialization", type: "course", duration: "4 weeks", skills: ["Focus Area"] }
      ]
    },
    {
      id: 3,
      title: "Professional Development Phase",
      duration: "4 months",
      description: "Prepare for professional success",
      milestones: [
        { title: "Industry Certifications", type: "certification", duration: "4 weeks", skills: ["Certification Prep"] },
        { title: "Portfolio Development", type: "project", duration: "4 weeks", skills: ["Work Samples"] },
        { title: "Networking & Job Prep", type: "course", duration: "4 weeks", skills: ["Career Skills"] }
      ]
    }
  ]
};

interface Milestone {
  title: string;
  type: string;
  duration: string;
  skills: string[];
  status?: string;
}

interface Phase {
  id: number;
  title: string;
  duration: string;
  description: string;
  milestones: Milestone[];
  status?: string;
  progress?: number;
}

export function PersonalizedRoadmap() {
  const [userSector, setUserSector] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<any[]>([]);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch user sector and target role from Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setRoadmap(defaultRoadmap);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Get sector from career assessment
        const sector = data.aiAssessment?.selectedSector || data.userSector || "";
        setUserSector(sector);
        
        // Get target role from matched occupations
        if (data.matchedOccupations && data.matchedOccupations.length > 0) {
          setTargetRole(data.matchedOccupations[0].title);
        }
        
        // Load the appropriate roadmap
        if (sector && sectorRoadmaps[sector]) {
          const sectorData = sectorRoadmaps[sector];
          // Get first available role or default
          const roleKey = Object.keys(sectorData)[0];
          setRoadmap(sectorData[roleKey]);
        } else {
          setRoadmap(defaultRoadmap);
        }
      } else {
        setRoadmap(defaultRoadmap);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const getIcon = (type: string) => {
    switch (type) {
      case "course": return BookOpen;
      case "project": return Target;
      case "certification": return Award;
      default: return BookOpen;
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "course": return BookOpen;
      case "project": return Target;
      case "certification": return Award;
      default: return BookOpen;
    }
  };

  // Generate relevant resource URLs based on milestone title, skills and sector
  const getResourceLinks = (milestoneTitle: string, skills: string[], sector: string, role: string) => {
    const sectorName = sector ? sector.charAt(0).toUpperCase() + sector.slice(1) : '';
    const roleName = role || '';
    
    // Dynamic search queries including sector and role
    const searchQuery = encodeURIComponent(`${milestoneTitle} ${skills.slice(0, 3).join(' ')} ${sectorName} ${roleName} course tutorial`);
    const generalSearch = encodeURIComponent(`${milestoneTitle} ${skills.slice(0, 2).join(' ')} how to learn`);
    const youtubeQuery = encodeURIComponent(`${milestoneTitle} ${skills[0] || ''} tutorial ${sectorName}`);
    const skillQuery = encodeURIComponent(`${skills.slice(0, 2).join(' ')} ${sectorName} course`);
    
    return {
      // Primary: Google Search for most relevant results
      google: `https://www.google.com/search?q=${searchQuery}`,
      // Alternative: Google with "I'm Feeling Lucky" for quick answers
      googleLucky: `https://www.google.com/search?q=${generalSearch}&btnI=I'm+Feeling+Lucky`,
      // Video learning on YouTube
      youtube: `https://www.youtube.com/results?search_query=${youtubeQuery}`,
      // Online course platforms
      udemy: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(milestoneTitle + ' ' + skills[0])}&src=sac`,
      coursera: `https://www.coursera.org/search?query=${encodeURIComponent(milestoneTitle + ' ' + (skills[0] || sectorName))}`,
      edx: `https://www.edx.org/search?q=${encodeURIComponent(milestoneTitle + ' ' + (skills[0] || sectorName))}`,
      skillshare: `https://www.skillshare.com/browse?query=${encodeURIComponent(milestoneTitle + ' ' + (skills[0] || sectorName))}`,
      // Free resources
      freecodecamp: `https://www.freecodecamp.org/learn/?query=${encodeURIComponent(skills[0] || milestoneTitle)}`,
      khanacademy: `https://www.khanacademy.org/search?page=1&q=${encodeURIComponent(milestoneTitle + ' ' + skills[0])}`,
      // GitHub for projects
      github: `https://github.com/search?q=${encodeURIComponent(milestoneTitle + ' ' + skills[0])}&type=repositories`
    };
  };

  // Handle milestone start - show options or redirect to Google
  const handleStartMilestone = (milestoneTitle: string, skills: string[]) => {
    const links = getResourceLinks(milestoneTitle, skills, userSector, targetRole);
    // Primary: Open Google search which gives most relevant results
    window.open(links.google, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8 px-2 md:px-0">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="space-y-6 md:space-y-8 px-2 md:px-0">
        <Card className="p-8 text-center">
          <Route className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Roadmap Available</h2>
          <p className="text-muted-foreground mb-4">
            Complete your career assessment to get a personalized learning roadmap.
          </p>
          <Button onClick={() => navigate('/career-quiz')}>
            <Target className="mr-2 h-4 w-4" />
            Take Career Quiz
          </Button>
        </Card>
      </div>
    );
  }

  const RoadmapIcon = roadmap.icon || Route;

  // Calculate progress
  const totalMilestones = roadmap.phases?.reduce((acc: number, phase: Phase) => 
    acc + (phase.milestones?.length || 0), 0) || 0;
  const completedMilestones = roadmap.phases?.reduce((acc: number, phase: Phase) => 
    acc + (phase.milestones?.filter(m => m.status === 'completed').length || 0), 0) || 0;
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <RoadmapIcon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
          Personalized Learning Roadmap
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {userSector 
            ? `Your customized path to becoming a ${targetRole || 'professional'} in ${userSector.charAt(0).toUpperCase() + userSector.slice(1)} with timeline and milestones.`
            : "Your customized career path with detailed milestones and learning resources."}
        </p>
      </div>

      {/* Roadmap Overview */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Route className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span>Your Learning Journey</span>
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Follow these milestones to achieve your career goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-accent">{completedMilestones}</div>
              <div className="text-muted-foreground">Milestones</div>
            </div>
            <div>
              <div className="font-medium text-primary">
                {roadmap.phases?.reduce((acc: number, phase: Phase) => 
                  acc + (phase.milestones?.filter(m => m.status === 'in-progress').length || 0), 0) || 0}
              </div>
              <div className="text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">
                {roadmap.phases?.reduce((acc: number, phase: Phase) => 
                  acc + (phase.milestones?.filter(m => !m.status || m.status === 'pending').length || 0), 0) || 0}
              </div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Phases */}
      <div className="space-y-6">
        {roadmap.phases?.map((phase: Phase, phaseIdx: number) => (
          <Card key={phase.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      phase.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                      phase.status === "in-progress" ? "bg-gray-100 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                      {phase.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : phase.status === "in-progress" ? (
                        <Play className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{phase.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{phase.duration}</span>
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{phase.description}</p>
                </div>
                <Badge className={
                  phase.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" :
                  phase.status === "in-progress" ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600" :
                  "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                }>
                  {phase.status === "completed" ? "Completed" : 
                   phase.status === "in-progress" ? "In Progress" : "Pending"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Milestones ({phase.milestones?.length || 0})
                </h4>
                <div className="grid gap-4">
                  {phase.milestones?.map((milestone, idx) => {
                    const MilestoneIcon = getMilestoneIcon(milestone.type);
                    
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-smooth"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          milestone.status === "completed" ? "bg-accent/10" :
                          milestone.status === "in-progress" ? "bg-primary/10" : "bg-muted/10"
                        }`}>
                          <MilestoneIcon className={`h-4 w-4 ${
                            milestone.status === "completed" ? "text-accent" :
                            milestone.status === "in-progress" ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium">{milestone.title}</h5>
                            <Badge variant="outline" className="text-xs">
                              {milestone.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{milestone.duration}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {milestone.skills?.map((skill, skillIdx) => (
                              <span key={skillIdx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {!milestone.status || milestone.status === "pending" ? (
                          <Button size="sm" variant="outline" onClick={() => handleStartMilestone(milestone.title, milestone.skills || [])}>
                            Start
                          </Button>
                        ) : milestone.status === "in-progress" ? (
                          <Button size="sm" variant="default" onClick={() => handleStartMilestone(milestone.title, milestone.skills || [])}>
                            Continue
                          </Button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gray-800 text-white border-0">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to Accelerate Your Progress?</h3>
            <p className="opacity-90">
              Get personalized mentoring and additional resources to fast-track your career growth.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Users className="mr-2 h-4 w-4" />
                Find Mentor
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Courses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PersonalizedRoadmap;