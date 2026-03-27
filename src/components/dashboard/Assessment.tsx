import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, Brain, Zap, Target, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Sector-specific technical questions - Comprehensive for all sectors
const sectorQuestions: Record<string, any[]> = {
  tech: [
    {
      id: "tech-1",
      category: "Programming Fundamentals",
      difficulty: "beginner",
      question: "What is the output of: console.log(typeof null)?",
      options: [
        { id: "a", label: "'null'", score: 0 },
        { id: "b", label: "'object'", score: 25 },
        { id: "c", label: "'undefined'", score: 0 },
        { id: "d", label: "'string'", score: 0 }
      ],
      explanation: "In JavaScript, typeof null returns 'object' - this is a known bug that has been preserved for backward compatibility."
    },
    {
      id: "tech-2",
      category: "Web Development",
      difficulty: "intermediate",
      question: "When does useEffect run by default (with empty dependency array)?",
      options: [
        { id: "a", label: "On every render", score: 0 },
        { id: "b", label: "Only on mount", score: 25 },
        { id: "c", label: "Only on unmount", score: 0 },
        { id: "d", label: "Never", score: 0 }
      ],
      explanation: "With an empty dependency array [], useEffect runs only once after the initial render (mount)."
    },
    {
      id: "tech-3",
      category: "Database",
      difficulty: "intermediate",
      question: "What is the main advantage of indexing in databases?",
      options: [
        { id: "a", label: "Reduces storage space", score: 0 },
        { id: "b", label: "Speeds up data retrieval", score: 25 },
        { id: "c", label: "Improves data security", score: 0 },
        { id: "d", label: "Makes writes faster", score: 0 }
      ],
      explanation: "Indexes create data structures that allow faster row retrieval based on column values."
    },
    {
      id: "tech-4",
      category: "Algorithms",
      difficulty: "advanced",
      question: "What is the time complexity of binary search?",
      options: [
        { id: "a", label: "O(n)", score: 0 },
        { id: "b", label: "O(log n)", score: 25 },
        { id: "c", label: "O(n log n)", score: 0 },
        { id: "d", label: "O(1)", score: 0 }
      ],
      explanation: "Binary search divides the search space in half each step, resulting in O(log n) time complexity."
    },
    {
      id: "tech-5",
      category: "Cloud Computing",
      difficulty: "intermediate",
      question: "Which AWS service is used for serverless computing?",
      options: [
        { id: "a", label: "EC2", score: 0 },
        { id: "b", label: "Lambda", score: 25 },
        { id: "c", label: "S3", score: 0 },
        { id: "d", label: "RDS", score: 0 }
      ],
      explanation: "AWS Lambda enables serverless computing - you run code without provisioning or managing servers."
    },
    {
      id: "tech-6",
      category: "Version Control",
      difficulty: "beginner",
      question: "What does 'git pull' do compared to 'git fetch'?",
      options: [
        { id: "a", label: "Downloads changes without merging", score: 0 },
        { id: "b", label: "Downloads and merges changes", score: 25 },
        { id: "c", label: "Only uploads changes", score: 0 },
        { id: "d", label: "Creates a new branch", score: 0 }
      ],
      explanation: "git pull downloads and automatically merges changes, while git fetch only downloads."
    },
    {
      id: "tech-7",
      category: "Security",
      difficulty: "advanced",
      question: "What is the primary purpose of OAuth 2.0?",
      options: [
        { id: "a", label: "Data encryption", score: 0 },
        { id: "b", label: "Authorization framework", score: 25 },
        { id: "c", label: "Password hashing", score: 0 },
        { id: "d", label: "Session management", score: 0 }
      ],
      explanation: "OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts."
    },
    {
      id: "tech-8",
      category: "Data Structures",
      difficulty: "intermediate",
      question: "Which data structure is best for implementing a LIFO (Last In First Out) system?",
      options: [
        { id: "a", label: "Queue", score: 0 },
        { id: "b", label: "Stack", score: 25 },
        { id: "c", label: "Linked List", score: 0 },
        { id: "d", label: "Tree", score: 0 }
      ],
      explanation: "A Stack follows LIFO principle - the last element added is the first one to be removed."
    }
  ],
  medical: [
    {
      id: "med-1",
      category: "Medical Terminology",
      difficulty: "beginner",
      question: "What does 'BP' stand for in medical terms?",
      options: [
        { id: "a", label: "Body Protein", score: 0 },
        { id: "b", label: "Blood Pressure", score: 25 },
        { id: "c", label: "Breathing Pattern", score: 0 },
        { id: "d", label: "Bone Position", score: 0 }
      ],
      explanation: "BP stands for Blood Pressure, a vital sign measured in healthcare settings."
    },
    {
      id: "med-2",
      category: "Healthcare IT",
      difficulty: "intermediate",
      question: "What is the primary purpose of an Electronic Health Record (EHR)?",
      options: [
        { id: "a", label: "Billing only", score: 0 },
        { id: "b", label: "Store patient medical history digitally", score: 25 },
        { id: "c", label: "Track employee schedules", score: 0 },
        { id: "d", label: "Manage inventory", score: 0 }
      ],
      explanation: "EHRs are digital versions of patient medical histories maintained by healthcare providers."
    },
    {
      id: "med-3",
      category: "Patient Privacy",
      difficulty: "intermediate",
      question: "What does HIPAA primarily protect?",
      options: [
        { id: "a", label: "Doctor salaries", score: 0 },
        { id: "b", label: "Patient privacy and health information", score: 25 },
        { id: "c", label: "Hospital equipment", score: 0 },
        { id: "d", label: "Medical research data", score: 0 }
      ],
      explanation: "HIPAA (Health Insurance Portability and Accountability Act) protects patient health information privacy."
    },
    {
      id: "med-4",
      category: "Clinical Practice",
      difficulty: "advanced",
      question: "What is evidence-based medicine?",
      options: [
        { id: "a", label: "Using only traditional remedies", score: 0 },
        { id: "b", label: "Making decisions based on research and clinical expertise", score: 25 },
        { id: "c", label: "Following hospital protocols only", score: 0 },
        { id: "d", label: "Relying on patient intuition", score: 0 }
      ],
      explanation: "Evidence-based medicine integrates clinical expertise with best available research evidence."
    },
    {
      id: "med-5",
      category: "Pharmacology",
      difficulty: "intermediate",
      question: "What is the 'first-pass effect' in drug metabolism?",
      options: [
        { id: "a", label: "Drug absorption in the stomach", score: 0 },
        { id: "b", label: "Drug breakdown in the liver before reaching circulation", score: 25 },
        { id: "c", label: "Drug excretion through kidneys", score: 0 },
        { id: "d", label: "Initial drug interaction with target receptor", score: 0 }
      ],
      explanation: "First-pass metabolism occurs when a drug is absorbed in the gastrointestinal tract and transported to the liver before entering systemic circulation."
    },
    {
      id: "med-6",
      category: "Diagnostic Imaging",
      difficulty: "advanced",
      question: "What is the primary advantage of MRI over CT scans?",
      options: [
        { id: "a", label: "Faster scan time", score: 0 },
        { id: "b", label: "No ionizing radiation exposure", score: 25 },
        { id: "c", label: "Lower cost", score: 0 },
        { id: "d", label: "Better for bone imaging", score: 0 }
      ],
      explanation: "MRI uses magnetic fields and radio waves without ionizing radiation, making it safer for repeated use."
    },
    {
      id: "med-7",
      category: "Patient Safety",
      difficulty: "beginner",
      question: "What is the 'five rights' of medication administration?",
      options: [
        { id: "a", label: "Right patient, drug, dose, route, time", score: 25 },
        { id: "b", label: "Right price, place, product, promotion, people", score: 0 },
        { id: "c", label: "Right diagnosis, treatment, care, follow-up, record", score: 0 },
        { id: "d", label: "Right nurse, doctor, pharmacist, patient, family", score: 0 }
      ],
      explanation: "The five rights ensure safe medication administration: right patient, drug, dose, route, and time."
    },
    {
      id: "med-8",
      category: "Medical Ethics",
      difficulty: "intermediate",
      question: "What does 'informed consent' require?",
      options: [
        { id: "a", label: "Patient signs a form without explanation", score: 0 },
        { id: "b", label: "Patient receives adequate information to make a decision", score: 25 },
        { id: "c", label: "Doctor decides what is best for patient", score: 0 },
        { id: "d", label: "Family gives permission for treatment", score: 0 }
      ],
      explanation: "Informed consent requires that patients receive sufficient information about a procedure to make an educated decision."
    }
  ],
  business: [
    {
      id: "biz-1",
      category: "Finance",
      difficulty: "beginner",
      question: "What does ROI stand for?",
      options: [
        { id: "a", label: "Return on Investment", score: 25 },
        { id: "b", label: "Rate of Interest", score: 0 },
        { id: "c", label: "Revenue of Industry", score: 0 },
        { id: "d", label: "Risk of Investment", score: 0 }
      ],
      explanation: "ROI (Return on Investment) measures the profitability of an investment."
    },
    {
      id: "biz-2",
      category: "Management",
      difficulty: "intermediate",
      question: "What is the primary goal of SWOT analysis?",
      options: [
        { id: "a", label: "Calculate profits", score: 0 },
        { id: "b", label: "Evaluate internal and external business factors", score: 25 },
        { id: "c", label: "Hire employees", score: 0 },
        { id: "d", label: "Set prices", score: 0 }
      ],
      explanation: "SWOT analysis identifies Strengths, Weaknesses, Opportunities, and Threats for strategic planning."
    },
    {
      id: "biz-3",
      category: "Marketing",
      difficulty: "intermediate",
      question: "What is the '4 Ps' of marketing?",
      options: [
        { id: "a", label: "People, Process, Physical Evidence, Promotion", score: 0 },
        { id: "b", label: "Product, Price, Place, Promotion", score: 25 },
        { id: "c", label: "Planning, Production, Pricing, Publicity", score: 0 },
        { id: "d", label: "Profit, Performance, Position, Portfolio", score: 0 }
      ],
      explanation: "The 4 Ps are Product, Price, Place, and Promotion - fundamental marketing mix elements."
    },
    {
      id: "biz-4",
      category: "Business Analytics",
      difficulty: "advanced",
      question: "What does KPI stand for?",
      options: [
        { id: "a", label: "Key Performance Indicator", score: 25 },
        { id: "b", label: "Knowledge Process Integration", score: 0 },
        { id: "c", label: "Key Product Innovation", score: 0 },
        { id: "d", label: "Knowledge-based Performance Index", score: 0 }
      ],
      explanation: "KPIs (Key Performance Indicators) are measurable values that demonstrate effectiveness."
    },
    {
      id: "biz-5",
      category: "Accounting",
      difficulty: "intermediate",
      question: "What is the difference between accounts receivable and accounts payable?",
      options: [
        { id: "a", label: "Both are assets", score: 0 },
        { id: "b", label: "Receivables are money owed to you, payables are money you owe", score: 25 },
        { id: "c", label: "Payables are income, receivables are expenses", score: 0 },
        { id: "d", label: "They are the same thing", score: 0 }
      ],
      explanation: "Accounts receivable represents money owed to you by customers, while accounts payable represents money you owe to suppliers."
    },
    {
      id: "biz-6",
      category: "Project Management",
      difficulty: "beginner",
      question: "What is a 'critical path' in project management?",
      options: [
        { id: "a", label: "The most expensive tasks in the project", score: 0 },
        { id: "b", label: "The longest sequence of dependent tasks", score: 25 },
        { id: "c", label: "The project budget", score: 0 },
        { id: "d", label: "The project team", score: 0 }
      ],
      explanation: "The critical path determines the minimum project duration - delays on this path directly delay the project."
    },
    {
      id: "biz-7",
      category: "Human Resources",
      difficulty: "intermediate",
      question: "What is the purpose of a performance appraisal?",
      options: [
        { id: "a", label: "To punish underperforming employees", score: 0 },
        { id: "b", label: "To evaluate and improve employee performance", score: 25 },
        { id: "c", label: "To determine salary only", score: 0 },
        { id: "d", label: "To terminate employment", score: 0 }
      ],
      explanation: "Performance appraisals are used to assess employee work, provide feedback, and identify development needs."
    },
    {
      id: "biz-8",
      category: "Business Law",
      difficulty: "advanced",
      question: "What is required for a valid contract?",
      options: [
        { id: "a", label: "Just a handshake", score: 0 },
        { id: "b", label: "Offer, acceptance, and consideration", score: 25 },
        { id: "c", label: "Only written agreement", score: 0 },
        { id: "d", label: "Lawyer present", score: 0 }
      ],
      explanation: "A valid contract requires offer, acceptance, and consideration (something of value)."
    }
  ],
  science: [
    {
      id: "sci-1",
      category: "Research Methods",
      difficulty: "beginner",
      question: "What is the independent variable in an experiment?",
      options: [
        { id: "a", label: "The variable being measured", score: 0 },
        { id: "b", label: "The variable that is manipulated", score: 25 },
        { id: "c", label: "The constant variable", score: 0 },
        { id: "d", label: "The control variable", score: 0 }
      ],
      explanation: "The independent variable is the variable that researchers change or control in an experiment."
    },
    {
      id: "sci-2",
      category: "Data Analysis",
      difficulty: "intermediate",
      question: "What is a correlation coefficient range?",
      options: [
        { id: "a", label: "0 to 1", score: 0 },
        { id: "b", label: "-1 to 1", score: 25 },
        { id: "c", label: "-100 to 100", score: 0 },
        { id: "d", label: "0 to 100", score: 0 }
      ],
      explanation: "Correlation coefficients range from -1 (perfect negative) to +1 (perfect positive)."
    },
    {
      id: "sci-3",
      category: "Scientific Computing",
      difficulty: "intermediate",
      question: "What is Python primarily used for in science?",
      options: [
        { id: "a", label: "Web browsing", score: 0 },
        { id: "b", label: "Data analysis and scientific computing", score: 25 },
        { id: "c", label: "Video gaming", score: 0 },
        { id: "d", label: "Word processing", score: 0 }
      ],
      explanation: "Python is widely used in scientific research for data analysis, simulation, and machine learning."
    },
    {
      id: "sci-4",
      category: "Laboratory Skills",
      difficulty: "advanced",
      question: "What is the purpose of a control group in an experiment?",
      options: [
        { id: "a", label: "To test the hypothesis", score: 0 },
        { id: "b", label: "To provide a baseline for comparison", score: 25 },
        { id: "c", label: "To ensure all variables are changed", score: 0 },
        { id: "d", label: "To increase sample size", score: 0 }
      ],
      explanation: "Control groups provide a baseline to compare against the experimental group."
    },
    {
      id: "sci-5",
      category: "Chemistry",
      difficulty: "intermediate",
      question: "What is the pH of a neutral solution?",
      options: [
        { id: "a", label: "0", score: 0 },
        { id: "b", label: "7", score: 25 },
        { id: "c", label: "14", score: 0 },
        { id: "d", label: "1", score: 0 }
      ],
      explanation: "A pH of 7 is neutral; below 7 is acidic and above 7 is basic (alkaline)."
    },
    {
      id: "sci-6",
      category: "Physics",
      difficulty: "beginner",
      question: "What is Newton's first law of motion also known as?",
      options: [
        { id: "a", label: "Law of Acceleration", score: 0 },
        { id: "b", label: "Law of Inertia", score: 25 },
        { id: "c", label: "Law of Action and Reaction", score: 0 },
        { id: "d", label: "Law of Gravity", score: 0 }
      ],
      explanation: "Newton's first law states an object at rest stays at rest and object in motion stays in motion unless acted upon by external force - also called the law of inertia."
    },
    {
      id: "sci-7",
      category: "Biology",
      difficulty: "intermediate",
      question: "What is the basic unit of life?",
      options: [
        { id: "a", label: "Atom", score: 0 },
        { id: "b", label: "Cell", score: 25 },
        { id: "c", label: "Molecule", score: 0 },
        { id: "d", label: "Tissue", score: 0 }
      ],
      explanation: "The cell is the basic structural and functional unit of all living organisms."
    },
    {
      id: "sci-8",
      category: "Laboratory Safety",
      difficulty: "beginner",
      question: "What should you do first in case of a chemical spill?",
      options: [
        { id: "a", label: "Continue working and ignore it", score: 0 },
        { id: "b", label: "Notify instructor and evacuate the area if needed", score: 25 },
        { id: "c", label: "Clean it up immediately with water", score: 0 },
        { id: "d", label: "Leave the lab and go home", score: 0 }
      ],
      explanation: "Always alert your supervisor and follow proper safety protocols when dealing with chemical spills."
    }
  ],
  engineering: [
    {
      id: "eng-1",
      category: "Mechanical",
      difficulty: "beginner",
      question: "What is Hooke's Law?",
      options: [
        { id: "a", label: "F = ma", score: 0 },
        { id: "b", label: "Force is proportional to displacement", score: 25 },
        { id: "c", label: "E = mc²", score: 0 },
        { id: "d", label: "PV = nRT", score: 0 }
      ],
      explanation: "Hooke's Law states that force needed to extend/compress a spring is proportional to distance."
    },
    {
      id: "eng-2",
      category: "Electrical",
      difficulty: "intermediate",
      question: "What is Ohm's Law?",
      options: [
        { id: "a", label: "P = IV", score: 0 },
        { id: "b", label: "V = IR", score: 25 },
        { id: "c", label: "E = mc²", score: 0 },
        { id: "d", label: "F = ma", score: 0 }
      ],
      explanation: "Ohm's Law states that voltage equals current times resistance (V = IR)."
    },
    {
      id: "eng-3",
      category: "Civil",
      difficulty: "intermediate",
      question: "What is the purpose of a foundation in construction?",
      options: [
        { id: "a", label: "Aesthetic appeal", score: 0 },
        { id: "b", label: "Transfer building load to ground", score: 25 },
        { id: "c", label: "Hold decorative elements", score: 0 },
        { id: "d", label: "Separate floors", score: 0 }
      ],
      explanation: "Foundations distribute building weight safely to the ground and prevent settling."
    },
    {
      id: "eng-4",
      category: "Systems",
      difficulty: "advanced",
      question: "What is feedback in control systems?",
      options: [
        { id: "a", label: "Customer complaints", score: 0 },
        { id: "b", label: "Signal returning to modify system behavior", score: 25 },
        { id: "c", label: "Energy loss", score: 0 },
        { id: "d", label: "Project planning", score: 0 }
      ],
      explanation: "Feedback in control systems compares output to desired input to maintain stability."
    },
    {
      id: "eng-5",
      category: "Thermodynamics",
      difficulty: "intermediate",
      question: "What is the first law of thermodynamics also known as?",
      options: [
        { id: "a", label: "Law of Entropy", score: 0 },
        { id: "b", label: "Law of Energy Conservation", score: 25 },
        { id: "c", label: "Law of Heat Transfer", score: 0 },
        { id: "d", label: "Law of Efficiency", score: 0 }
      ],
      explanation: "The first law states energy cannot be created or destroyed, only converted - conservation of energy."
    },
    {
      id: "eng-6",
      category: "Materials Science",
      difficulty: "beginner",
      question: "What is the difference between ductile and brittle materials?",
      options: [
        { id: "a", label: "Ductile materials break easily, brittle don't", score: 0 },
        { id: "b", label: "Ductile materials can be stretched without breaking", score: 25 },
        { id: "c", label: "Brittle materials are stronger", score: 0 },
        { id: "d", label: "There is no difference", score: 0 }
      ],
      explanation: "Ductile materials (like steel) can undergo significant plastic deformation before fracture, while brittle materials (like glass) break with little deformation."
    },
    {
      id: "eng-7",
      category: "CAD",
      difficulty: "intermediate",
      question: "What does CAD stand for?",
      options: [
        { id: "a", label: "Computer Animation Design", score: 0 },
        { id: "b", label: "Computer-Aided Design", score: 25 },
        { id: "c", label: "Computer Application Development", score: 0 },
        { id: "d", label: "Centralized Architecture Design", score: 0 }
      ],
      explanation: "CAD (Computer-Aided Design) uses software to create technical drawings and 3D models."
    },
    {
      id: "eng-8",
      category: "Quality Control",
      difficulty: "advanced",
      question: "What is Six Sigma methodology primarily used for?",
      options: [
        { id: "a", label: "Reducing defects to 3.4 per million opportunities", score: 25 },
        { id: "b", label: "Maximizing production speed", score: 0 },
        { id: "c", label: "Reducing employee headcount", score: 0 },
        { id: "d", label: "Increasing product variety", score: 0 }
      ],
      explanation: "Six Sigma aims to reduce process variation and defects to near zero (3.4 DPMO)."
    }
  ],
  aviation: [
    {
      id: "avia-1",
      category: "Airline Operations",
      difficulty: "beginner",
      question: "What does IATA stand for?",
      options: [
        { id: "a", label: "International Air Transport Association", score: 25 },
        { id: "b", label: "International Aviation Training Authority", score: 0 },
        { id: "c", label: "Internal Air Traffic Administration", score: 0 },
        { id: "d", label: "International Aircraft Testing Agency", score: 0 }
      ],
      explanation: "IATA (International Air Transport Association) is the trade association for world airlines."
    },
    {
      id: "avia-2",
      category: "Aviation Safety",
      difficulty: "intermediate",
      question: "What is the primary purpose of a pre-flight checklist?",
      options: [
        { id: "a", label: "Save time", score: 0 },
        { id: "b", label: "Ensure all systems are operational before flight", score: 25 },
        { id: "c", label: "Complete documentation", score: 0 },
        { id: "d", label: "Entertain passengers", score: 0 }
      ],
      explanation: "Pre-flight checklists ensure all critical systems are functioning properly before takeoff."
    },
    {
      id: "avia-3",
      category: "Air Traffic Control",
      difficulty: "intermediate",
      question: "What does ATC primarily control?",
      options: [
        { id: "a", label: "Airline ticket prices", score: 0 },
        { id: "b", label: "Air traffic flow and safety", score: 25 },
        { id: "c", label: "Airport building maintenance", score: 0 },
        { id: "d", label: "Flight catering services", score: 0 }
      ],
      explanation: "ATC (Air Traffic Control) manages aircraft movements to maintain safe operations."
    },
    {
      id: "avia-4",
      category: "Airport Management",
      difficulty: "advanced",
      question: "What is runway incursion?",
      options: [
        { id: "a", label: "Landing without wheels down", score: 0 },
        { id: "b", label: "Unauthorized presence on runway", score: 25 },
        { id: "c", label: "Running out of fuel", score: 0 },
        { id: "d", label: "Taking off without permission", score: 0 }
      ],
      explanation: "Runway incursion is any occurrence where an aircraft or vehicle enters a runway without authorization."
    },
    {
      id: "avia-5",
      category: "Aerodynamics",
      difficulty: "intermediate",
      question: "What is the primary force that opposes lift in an aircraft?",
      options: [
        { id: "a", label: "Weight", score: 0 },
        { id: "b", label: "Drag", score: 25 },
        { id: "c", label: "Thrust", score: 0 },
        { id: "d", label: "Friction", score: 0 }
      ],
      explanation: "Drag is the aerodynamic force that opposes an aircraft's motion through the air."
    },
    {
      id: "avia-6",
      category: "Navigation",
      difficulty: "beginner",
      question: "What does VOR stand for in aviation navigation?",
      options: [
        { id: "a", label: "Visual Optical Receiver", score: 0 },
        { id: "b", label: "VHF Omnidirectional Range", score: 25 },
        { id: "c", label: "Virtual Orbital Router", score: 0 },
        { id: "d", label: "Vertical Orientation Reference", score: 0 }
      ],
      explanation: "VOR is a navigation system that provides aircraft with bearing information relative to the ground station."
    },
    {
      id: "avia-7",
      category: "Meteorology",
      difficulty: "intermediate",
      question: "What is wind shear and why is it dangerous?",
      options: [
        { id: "a", label: "Strong wind at ground level - causes turbulence", score: 0 },
        { id: "b", label: "Sudden change in wind speed/direction - can cause loss of control", score: 25 },
        { id: "c", label: "Horizontal wind pattern - affects fuel consumption", score: 0 },
        { id: "d", label: "Wind from vertical direction - causes drag", score: 0 }
      ],
      explanation: "Wind shear is a sudden change in wind speed or direction that can cause an aircraft to lose lift and control."
    },
    {
      id: "avia-8",
      category: "Aircraft Systems",
      difficulty: "advanced",
      question: "What is the primary function of the pitot-static system?",
      options: [
        { id: "a", label: "Measure aircraft weight", score: 0 },
        { id: "b", label: "Provide airspeed and altitude data", score: 25 },
        { id: "c", label: "Control engine fuel flow", score: 0 },
        { id: "d", label: "Monitor cabin temperature", score: 0 }
      ],
      explanation: "The pitot-static system measures dynamic pressure (airspeed) and static pressure (altitude)."
    }
  ],
  finance: [
    {
      id: "fin-1",
      category: "Investment",
      difficulty: "beginner",
      question: "What is a stock?",
      options: [
        { id: "a", label: "A loan to a company", score: 0 },
        { id: "b", label: "Ownership share in a company", score: 25 },
        { id: "c", label: "A type of bond", score: 0 },
        { id: "d", label: "A savings account", score: 0 }
      ],
      explanation: "Stocks represent partial ownership in a company, giving shareholders claim to assets and earnings."
    },
    {
      id: "fin-2",
      category: "Banking",
      difficulty: "intermediate",
      question: "What is the primary function of a central bank?",
      options: [
        { id: "a", label: "Provide loans to individuals", score: 0 },
        { id: "b", label: "Manage money supply and monetary policy", score: 25 },
        { id: "c", label: "Process credit card payments", score: 0 },
        { id: "d", label: "Offer mortgage loans", score: 0 }
      ],
      explanation: "Central banks control a country's money supply, interest rates, and financial system stability."
    },
    {
      id: "fin-3",
      category: "Risk Management",
      difficulty: "intermediate",
      question: "What is diversification in investing?",
      options: [
        { id: "a", label: "Putting all money in one stock", score: 0 },
        { id: "b", label: "Spreading investments across different assets", score: 25 },
        { id: "c", label: "Only investing in bonds", score: 0 },
        { id: "d", label: "Avoiding all risk", score: 0 }
      ],
      explanation: "Diversification reduces risk by spreading investments across various assets and sectors."
    },
    {
      id: "fin-4",
      category: "Financial Analysis",
      difficulty: "advanced",
      question: "What does P/E ratio measure?",
      options: [
        { id: "a", label: "Company debt", score: 0 },
        { id: "b", label: "Stock price relative to earnings", score: 25 },
        { id: "c", label: "Revenue growth", score: 0 },
        { id: "d", label: "Dividend yield", score: 0 }
      ],
      explanation: "P/E (Price-to-Earnings) ratio shows how much investors pay for each dollar of earnings."
    },
    {
      id: "fin-5",
      category: "Banking",
      difficulty: "intermediate",
      question: "What is the purpose of a credit score?",
      options: [
        { id: "a", label: "Calculate tax obligations", score: 0 },
        { id: "b", label: "Measure creditworthiness of a borrower", score: 25 },
        { id: "c", label: "Determine employment eligibility", score: 0 },
        { id: "d", label: "Set interest rates for savings", score: 0 }
      ],
      explanation: "Credit scores indicate the likelihood that a borrower will repay debts on time."
    },
    {
      id: "fin-6",
      category: "Economics",
      difficulty: "beginner",
      question: "What is inflation?",
      options: [
        { id: "a", label: "Decrease in prices over time", score: 0 },
        { id: "b", label: "Increase in prices over time", score: 25 },
        { id: "c", label: "Stable prices", score: 0 },
        { id: "d", label: "Increase in wages", score: 0 }
      ],
      explanation: "Inflation is the rate at which the general price level rises, eroding purchasing power."
    },
    {
      id: "fin-7",
      category: "Taxation",
      difficulty: "intermediate",
      question: "What is the difference between tax deduction and tax credit?",
      options: [
        { id: "a", label: "They are the same thing", score: 0 },
        { id: "b", label: "Deduction reduces taxable income, credit reduces tax owed", score: 25 },
        { id: "c", label: "Credit reduces taxable income, deduction reduces tax owed", score: 0 },
        { id: "d", label: "Neither affects taxes", score: 0 }
      ],
      explanation: "Tax deductions lower taxable income, while tax credits directly reduce the amount of tax owed."
    },
    {
      id: "fin-8",
      category: "Financial Markets",
      difficulty: "advanced",
      question: "What is a derivative in finance?",
      options: [
        { id: "a", label: "A type of stock", score: 0 },
        { id: "b", label: "Financial contract whose value depends on an underlying asset", score: 25 },
        { id: "c", label: "A savings account", score: 0 },
        { id: "d", label: "A type of bond", score: 0 }
      ],
      explanation: "Derivatives are financial instruments whose value is derived from an underlying asset (like options, futures)."
    }
  ],
  arts: [
    {
      id: "art-1",
      category: "Design Principles",
      difficulty: "beginner",
      question: "What is the principle of contrast in design?",
      options: [
        { id: "a", label: "Using similar elements", score: 0 },
        { id: "b", label: "Using opposing elements for visual interest", score: 25 },
        { id: "c", label: "Repeating the same pattern", score: 0 },
        { id: "d", label: "Aligning all elements", score: 0 }
      ],
      explanation: "Contrast uses differences in color, size, shape to create visual interest and hierarchy."
    },
    {
      id: "art-2",
      category: "Color Theory",
      difficulty: "intermediate",
      question: "What are complementary colors?",
      options: [
        { id: "a", label: "Colors next to each other on color wheel", score: 0 },
        { id: "b", label: "Colors opposite each other on color wheel", score: 25 },
        { id: "c", label: "Colors that are the same", score: 0 },
        { id: "d", label: "Colors that mix to make white", score: 0 }
      ],
      explanation: "Complementary colors are opposite each other on the color wheel and create high contrast."
    },
    {
      id: "art-3",
      category: "Digital Media",
      difficulty: "intermediate",
      question: "What file format is best for transparent backgrounds?",
      options: [
        { id: "a", label: "JPEG", score: 0 },
        { id: "b", label: "PNG", score: 25 },
        { id: "c", label: "BMP", score: 0 },
        { id: "d", label: "TIFF", score: 0 }
      ],
      explanation: "PNG supports transparency and is ideal for graphics requiring transparent backgrounds."
    },
    {
      id: "art-4",
      category: "Photography",
      difficulty: "advanced",
      question: "What does 'aperture' control in photography?",
      options: [
        { id: "a", label: "Image storage size", score: 0 },
        { id: "b", label: "Light intake and depth of field", score: 25 },
        { id: "c", label: "Image resolution", score: 0 },
        { id: "d", label: "Color saturation", score: 0 }
      ],
      explanation: "Aperture controls how much light enters the camera and affects depth of field."
    },
    {
      id: "art-5",
      category: "Typography",
      difficulty: "intermediate",
      question: "What is 'kerning' in typography?",
      options: [
        { id: "a", label: "The size of the font", score: 0 },
        { id: "b", label: "Space between individual letter pairs", score: 25 },
        { id: "c", label: "The weight of the font", score: 0 },
        { id: "d", label: "The height of lowercase letters", score: 0 }
      ],
      explanation: "Kerning is the adjustment of space between specific pairs of characters for visual balance."
    },
    {
      id: "art-6",
      category: "Visual Arts",
      difficulty: "beginner",
      question: "What is the 'rule of thirds' in visual composition?",
      options: [
        { id: "a", label: "Divide image into three equal parts", score: 0 },
        { id: "b", label: "Place key elements along grid lines for better composition", score: 25 },
        { id: "c", label: "Use exactly three colors in design", score: 0 },
        { id: "d", label: "Keep main subject in center", score: 0 }
      ],
      explanation: "Rule of thirds divides the frame into a 3x3 grid, placing important elements along lines or intersections."
    },
    {
      id: "art-7",
      category: "Animation",
      difficulty: "intermediate",
      question: "What is 'keyframes' in animation?",
      options: [
        { id: "a", label: "The first and last frames of animation", score: 0 },
        { id: "b", label: "Frames that define start and end points of smooth transitions", score: 25 },
        { id: "c", label: "Frames per second setting", score: 0 },
        { id: "d", label: "Background images in animation", score: 0 }
      ],
      explanation: "Keyframes define specific points in animation where properties change, with software interpolating between them."
    },
    {
      id: "art-8",
      category: "UX Design",
      difficulty: "advanced",
      question: "What is the primary purpose of a wireframe in design?",
      options: [
        { id: "a", label: "To add colors and styling", score: 0 },
        { id: "b", label: "To plan layout and functionality without visual distraction", score: 25 },
        { id: "c", label: "To create final visual design", score: 0 },
        { id: "d", label: "To test code functionality", score: 0 }
      ],
      explanation: "Wireframes are basic layouts that show structure and functionality without design distractions."
    }
  ],
  education: [
    {
      id: "edu-1",
      category: "Pedagogy",
      difficulty: "beginner",
      question: "What is differentiated instruction?",
      options: [
        { id: "a", label: "Teaching the same content to all students", score: 0 },
        { id: "b", label: "Tailoring teaching to meet student needs", score: 25 },
        { id: "c", label: "Giving more homework", score: 0 },
        { id: "d", label: "Using only textbooks", score: 0 }
      ],
      explanation: "Differentiated instruction adapts teaching methods to address diverse student learning needs."
    },
    {
      id: "edu-2",
      category: "Assessment",
      difficulty: "intermediate",
      question: "What is formative assessment?",
      options: [
        { id: "a", label: "Final exam", score: 0 },
        { id: "b", label: "Ongoing assessment during learning", score: 25 },
        { id: "c", label: "Standardized test", score: 0 },
        { id: "d", label: "Grading only", score: 0 }
      ],
      explanation: "Formative assessment provides feedback during instruction to improve learning."
    },
    {
      id: "edu-3",
      category: "EdTech",
      difficulty: "intermediate",
      question: "What is a Learning Management System (LMS)?",
      options: [
        { id: "a", label: "A type of textbook", score: 0 },
        { id: "b", label: "Software for managing and delivering educational courses", score: 25 },
        { id: "c", label: "A grading system", score: 0 },
        { id: "d", label: "A teacher certification program", score: 0 }
      ],
      explanation: "LMS platforms like Moodle and Canvas help deliver and manage online courses."
    },
    {
      id: "edu-4",
      category: "Child Development",
      difficulty: "advanced",
      question: "What is the zone of proximal development?",
      options: [
        { id: "a", label: "The classroom physical space", score: 0 },
        { id: "b", label: "Tasks a learner can do with help", score: 25 },
        { id: "c", label: "The age range for school", score: 0 },
        { id: "d", label: "The distance to school", score: 0 }
      ],
      explanation: "ZPD is the gap between what a learner can do alone and with guidance - Vygotsky's concept."
    },
    {
      id: "edu-5",
      category: "Curriculum",
      difficulty: "intermediate",
      question: "What is 'backward design' in curriculum development?",
      options: [
        { id: "a", label: "Starting from basics and adding complexity", score: 0 },
        { id: "b", label: "Starting with outcomes and designing learning experiences backwards", score: 25 },
        { id: "c", label: "Teaching from last chapter to first", score: 0 },
        { id: "d", label: "Designing assessments after teaching", score: 0 }
      ],
      explanation: "Backward design begins with desired outcomes, then creates assessments and learning activities."
    },
    {
      id: "edu-6",
      category: "Classroom Management",
      difficulty: "beginner",
      question: "What is the purpose of 'positive reinforcement' in behavior management?",
      options: [
        { id: "a", label: "Punishing unwanted behavior", score: 0 },
        { id: "b", label: "Strengthening desired behavior by adding something pleasant", score: 25 },
        { id: "c", label: "Ignoring student behavior", score: 0 },
        { id: "d", label: "Giving warnings to students", score: 0 }
      ],
      explanation: "Positive reinforcement adds rewards to encourage desired behavior, making it more likely to recur."
    },
    {
      id: "edu-7",
      category: "Special Education",
      difficulty: "intermediate",
      question: "What is 'IEP' in special education?",
      options: [
        { id: "a", label: "International Education Program", score: 0 },
        { id: "b", label: "Individualized Education Program", score: 25 },
        { id: "c", label: "Integrated Education Plan", score: 0 },
        { id: "d", label: "Instructional Enhancement Program", score: 0 }
      ],
      explanation: "IEP is a legally binding document outlining specific educational services for students with disabilities."
    },
    {
      id: "edu-8",
      category: "Educational Research",
      difficulty: "advanced",
      question: "What does 'action research' involve in education?",
      options: [
        { id: "a", label: "Researchers studying schools from outside", score: 0 },
        { id: "b", label: "Teachers investigating their own practice to improve it", score: 25 },
        { id: "c", label: "Testing educational theories in labs", score: 0 },
        { id: "d", label: "Comparing different school systems", score: 0 }
      ],
      explanation: "Action research is a reflective process where teachers study their own practice to solve problems."
    }
  ],
  law: [
    {
      id: "law-1",
      category: "Legal Concepts",
      difficulty: "beginner",
      question: "What is 'prima facie' evidence?",
      options: [
        { id: "a", label: "Final verdict", score: 0 },
        { id: "b", label: "Evidence sufficient to prove a fact unless disproved", score: 25 },
        { id: "c", label: "Evidence from witnesses only", score: 0 },
        { id: "d", label: "Circumstantial evidence", score: 0 }
      ],
      explanation: "Prima facie evidence establishes a fact unless rebutted by other evidence."
    },
    {
      id: "law-2",
      category: "Contract Law",
      difficulty: "intermediate",
      question: "What is required for a valid contract?",
      options: [
        { id: "a", label: "Just a handshake", score: 0 },
        { id: "b", label: "Offer, acceptance, and consideration", score: 25 },
        { id: "c", label: "Only written agreement", score: 0 },
        { id: "d", label: "Lawyer present", score: 0 }
      ],
      explanation: "A valid contract requires offer, acceptance, and consideration (something of value)."
    },
    {
      id: "law-3",
      category: "Intellectual Property",
      difficulty: "intermediate",
      question: "What does copyright protect?",
      options: [
        { id: "a", label: "Business ideas", score: 0 },
        { id: "b", label: "Original creative works", score: 25 },
        { id: "c", label: "Patentable inventions", score: 0 },
        { id: "d", label: "Trademarked logos", score: 0 }
      ],
      explanation: "Copyright protects original literary, artistic, musical, and other creative works."
    },
    {
      id: "law-4",
      category: "Legal Ethics",
      difficulty: "advanced",
      question: "What is attorney-client privilege?",
      options: [
        { id: "a", label: "Lawyer gets paid regardless", score: 0 },
        { id: "b", label: "Confidential communications between lawyer and client", score: 25 },
        { id: "c", label: "Client must always tell the truth", score: 0 },
        { id: "d", label: "Lawyers can work for free", score: 0 }
      ],
      explanation: "Attorney-client privilege protects confidential communications from disclosure."
    },
    {
      id: "law-5",
      category: "Tort Law",
      difficulty: "intermediate",
      question: "What is negligence in legal terms?",
      options: [
        { id: "a", label: "Intentional harm to another", score: 0 },
        { id: "b", label: "Failure to exercise reasonable care causing harm", score: 25 },
        { id: "c", label: "Breaking a contract", score: 0 },
        { id: "d", label: "Speaking about someone publicly", score: 0 }
      ],
      explanation: "Negligence is the failure to act with the level of care someone of ordinary prudence would exercise."
    },
    {
      id: "law-6",
      category: "Criminal Law",
      difficulty: "beginner",
      question: "What does 'beyond reasonable doubt' mean in criminal cases?",
      options: [
        { id: "a", label: "More likely than not", score: 0 },
        { id: "b", label: "Almost certain - very high standard of proof", score: 25 },
        { id: "c", label: "Possible but not proven", score: 0 },
        { id: "d", label: "Based on circumstantial evidence", score: 0 }
      ],
      explanation: "Beyond reasonable doubt is the highest standard of proof, requiring near-certainty of guilt."
    },
    {
      id: "law-7",
      category: "Constitutional Law",
      difficulty: "intermediate",
      question: "What is 'due process' in legal terms?",
      options: [
        { id: "a", label: "Process of making laws", score: 0 },
        { id: "b", label: "Fair treatment through the legal system", score: 25 },
        { id: "c", label: "Quick resolution of disputes", score: 0 },
        { id: "d", label: "Writing a legal document", score: 0 }
      ],
      explanation: "Due process ensures fair treatment through normal judicial proceedings as a citizen's entitlement."
    },
    {
      id: "law-8",
      category: "Corporate Law",
      difficulty: "advanced",
      question: "What is 'limited liability' in business structure?",
      options: [
        { id: "a", label: "Business has no debt", score: 0 },
        { id: "b", label: "Owner's personal assets are protected from business debts", score: 25 },
        { id: "c", label: "Business has unlimited capital", score: 0 },
        { id: "d", label: "Taxes are limited", score: 0 }
      ],
      explanation: "Limited liability protects owners' personal assets from being used to pay business debts."
    }
  ],
  marketing: [
    {
      id: "mkt-1",
      category: "Digital Marketing",
      difficulty: "beginner",
      question: "What does SEO stand for?",
      options: [
        { id: "a", label: "Sales Enhancement Operation", score: 0 },
        { id: "b", label: "Search Engine Optimization", score: 25 },
        { id: "c", label: "Social Media Engagement Output", score: 0 },
        { id: "d", label: "Strategic Email Organization", score: 0 }
      ],
      explanation: "SEO (Search Engine Optimization) improves website visibility in search results."
    },
    {
      id: "mkt-2",
      category: "Consumer Behavior",
      difficulty: "intermediate",
      question: "What is the 'purchase funnel'?",
      options: [
        { id: "a", label: "The checkout process", score: 0 },
        { id: "b", label: "Stages from awareness to purchase", score: 25 },
        { id: "c", label: "Shipping delivery route", score: 0 },
        { id: "d", label: "Product packaging design", score: 0 }
      ],
      explanation: "The purchase funnel represents the customer journey from awareness to conversion."
    },
    {
      id: "mkt-3",
      category: "Social Media",
      difficulty: "intermediate",
      question: "What is 'engagement rate' in social media?",
      options: [
        { id: "a", label: "Number of followers", score: 0 },
        { id: "b", label: "Level of interaction relative to audience size", score: 25 },
        { id: "c", label: "Amount spent on ads", score: 0 },
        { id: "d", label: "Post frequency", score: 0 }
      ],
      explanation: "Engagement rate measures how actively audiences interact with content (likes, comments, shares)."
    },
    {
      id: "mkt-4",
      category: "Analytics",
      difficulty: "advanced",
      question: "What is conversion rate?",
      options: [
        { id: "a", label: "Website visitors", score: 0 },
        { id: "b", label: "Percentage of visitors who take desired action", score: 25 },
        { id: "c", label: "Email open rate", score: 0 },
        { id: "d", label: "Ad impressions", score: 0 }
      ],
      explanation: "Conversion rate measures the percentage of users who complete a desired action."
    },
    {
      id: "mkt-5",
      category: "Branding",
      difficulty: "intermediate",
      question: "What is 'brand equity'?",
      options: [
        { id: "a", label: "The cost to make a product", score: 0 },
        { id: "b", label: "The commercial value derived from brand perception", score: 25 },
        { id: "c", label: "The number of products sold", score: 0 },
        { id: "d", label: "The price of the brand stock", score: 0 }
      ],
      explanation: "Brand equity is the additional value a brand adds to a product beyond its actual function."
    },
    {
      id: "mkt-6",
      category: "Content Marketing",
      difficulty: "beginner",
      question: "What is the primary goal of content marketing?",
      options: [
        { id: "a", label: "Direct selling of products", score: 0 },
        { id: "b", label: "Attract and retain audience through valuable content", score: 25 },
        { id: "c", label: "Reduce advertising costs", score: 0 },
        { id: "d", label: "Create more social media posts", score: 0 }
      ],
      explanation: "Content marketing focuses on creating and distributing valuable content to attract target audiences."
    },
    {
      id: "mkt-7",
      category: "Email Marketing",
      difficulty: "intermediate",
      question: "What does 'CTR' stand for in marketing?",
      options: [
        { id: "a", label: "Content Type Rating", score: 0 },
        { id: "b", label: "Click-Through Rate", score: 25 },
        { id: "c", label: "Cost To Reach", score: 0 },
        { id: "d", label: "Customer Trust Rating", score: 0 }
      ],
      explanation: "CTR measures the percentage of people who click on a link compared to total viewers."
    },
    {
      id: "mkt-8",
      category: "Marketing Strategy",
      difficulty: "advanced",
      question: "What is 'market segmentation'?",
      options: [
        { id: "a", label: "Dividing total sales by number of products", score: 0 },
        { id: "b", label: "Dividing a market into distinct groups of buyers", score: 25 },
        { id: "c", label: "Setting product prices", score: 0 },
        { id: "d", label: "Choosing advertising channels", score: 0 }
      ],
      explanation: "Market segmentation divides a market into groups with similar needs or characteristics."
    }
  ],
  mechanical: [
    {
      id: "mech-1",
      category: "Manufacturing",
      difficulty: "beginner",
      question: "What is 'CNC' in manufacturing?",
      options: [
        { id: "a", label: "Computer Numerical Control", score: 25 },
        { id: "b", label: "Central Numerical Calculation", score: 0 },
        { id: "c", label: "Computer Network Connection", score: 0 },
        { id: "d", label: "Central New Construction", score: 0 }
      ],
      explanation: "CNC uses computers to control machine tools for precision manufacturing."
    },
    {
      id: "mech-2",
      category: "Materials",
      difficulty: "intermediate",
      question: "What is the difference between ductile and brittle materials?",
      options: [
        { id: "a", label: "Ductile materials are softer", score: 0 },
        { id: "b", label: "Ductile materials can be stretched without breaking", score: 25 },
        { id: "c", label: "Brittle materials are more expensive", score: 0 },
        { id: "d", label: "They are the same", score: 0 }
      ],
      explanation: "Ductile materials can deform plastically before breaking; brittle materials break with little deformation."
    },
    {
      id: "mech-3",
      category: "Thermodynamics",
      difficulty: "intermediate",
      question: "What is the Carnot efficiency?",
      options: [
        { id: "a", label: "100% - all heat converts to work", score: 0 },
        { id: "b", label: "Maximum theoretical efficiency based on temperature difference", score: 25 },
        { id: "c", label: "Efficiency of actual engines", score: 0 },
        { id: "d", label: "Efficiency of electric motors", score: 0 }
      ],
      explanation: "Carnot efficiency is the maximum possible efficiency for a heat engine operating between two temperatures."
    },
    {
      id: "mech-4",
      category: "Machine Design",
      difficulty: "advanced",
      question: "What is 'factor of safety' in engineering design?",
      options: [
        { id: "a", label: "The cost of the project divided by output", score: 0 },
        { id: "b", label: "Ratio of material's strength to applied stress", score: 25 },
        { id: "c", label: "The number of safety features in a machine", score: 0 },
        { id: "d", label: "The warranty period", score: 0 }
      ],
      explanation: "Factor of safety ensures designs can handle unexpected loads by designing for higher stress than expected."
    },
    {
      id: "mech-5",
      category: "Fluid Mechanics",
      difficulty: "intermediate",
      question: "What does Pascal's law state?",
      options: [
        { id: "a", label: "Pressure increases with depth", score: 0 },
        { id: "b", label: "Pressure applied to fluid transmits equally throughout", score: 25 },
        { id: "c", label: "Fluids always flow from high to low pressure", score: 0 },
        { id: "d", label: "Viscosity decreases with temperature", score: 0 }
      ],
      explanation: "Pascal's law states that pressure applied to an enclosed fluid is transmitted to every portion of the fluid."
    },
    {
      id: "mech-6",
      category: "Statics",
      difficulty: "beginner",
      question: "What is a 'free body diagram'?",
      options: [
        { id: "a", label: "A diagram of a building's floor plan", score: 0 },
        { id: "b", label: "A sketch showing all forces acting on a body", score: 25 },
        { id: "c", label: "A drawing of a machine part", score: 0 },
        { id: "d", label: "A blueprint of a house", score: 0 }
      ],
      explanation: "A free body diagram shows all external forces and moments acting on a body in equilibrium."
    },
    {
      id: "mech-7",
      category: "Kinematics",
      difficulty: "intermediate",
      question: "What is the difference between speed and velocity?",
      options: [
        { id: "a", label: "They are the same", score: 0 },
        { id: "b", label: "Velocity includes direction, speed does not", score: 25 },
        { id: "c", label: "Speed is measured in m/s, velocity in km/h", score: 0 },
        { id: "d", label: "Velocity is always higher than speed", score: 0 }
      ],
      explanation: "Speed is scalar (magnitude only), velocity is vector (includes direction)."
    },
    {
      id: "mech-8",
      category: "Quality Control",
      difficulty: "advanced",
      question: "What is 'Six Sigma' methodology?",
      options: [
        { id: "a", label: "Six different manufacturing processes", score: 0 },
        { id: "b", label: "Process improvement to reduce defects to 3.4 per million", score: 25 },
        { id: "c", label: "Six types of quality certifications", score: 0 },
        { id: "d", label: "Six-step problem solving", score: 0 }
      ],
      explanation: "Six Sigma uses data-driven methods to achieve near-perfect quality (3.4 defects per million)."
    }
  ],
  manufacturing: [
    {
      id: "mfg-1",
      category: "Production Planning",
      difficulty: "beginner",
      question: "What is 'lean manufacturing'?",
      options: [
        { id: "a", label: "Using minimal materials in production", score: 0 },
        { id: "b", label: "Systematic elimination of waste while maintaining productivity", score: 25 },
        { id: "c", label: "Reducing the number of workers", score: 0 },
        { id: "d", label: "Making products as small as possible", score: 0 }
      ],
      explanation: "Lean manufacturing focuses on minimizing waste while maximizing customer value."
    },
    {
      id: "mfg-2",
      category: "Quality Management",
      difficulty: "intermediate",
      question: "What is 'Kaizen' in manufacturing?",
      options: [
        { id: "a", label: "A type of machine", score: 0 },
        { id: "b", label: "Continuous improvement philosophy", score: 25 },
        { id: "c", label: "A quality inspection method", score: 0 },
        { id: "d", label: "A production scheduling system", score: 0 }
      ],
      explanation: "Kaizen is a Japanese philosophy of continuous improvement in small increments."
    },
    {
      id: "mfg-3",
      category: "Supply Chain",
      difficulty: "intermediate",
      question: "What is 'Just-in-Time' (JIT) manufacturing?",
      options: [
        { id: "a", label: "Producing items as fast as possible", score: 0 },
        { id: "b", label: "Receiving materials only when needed for production", score: 25 },
        { id: "c", label: "Shipping products immediately after production", score: 0 },
        { id: "d", label: "Using fastest available machines", score: 0 }
      ],
      explanation: "JIT reduces inventory costs by receiving materials just in time for production."
    },
    {
      id: "mfg-4",
      category: "Process Engineering",
      difficulty: "advanced",
      question: "What is 'takt time' in production?",
      options: [
        { id: "a", label: "Time to complete one unit", score: 0 },
        { id: "b", label: "Available production time divided by customer demand", score: 25 },
        { id: "c", label: "Time between machine failures", score: 0 },
        { id: "d", label: "Break time for workers", score: 0 }
      ],
      explanation: "Takt time is the rate at which you need to complete a product to meet customer demand."
    },
    {
      id: "mfg-5",
      category: "Industrial Safety",
      difficulty: "beginner",
      question: "What is 'PPE' in manufacturing?",
      options: [
        { id: "a", label: "Production Planning Engine", score: 0 },
        { id: "b", label: "Personal Protective Equipment", score: 25 },
        { id: "c", label: "Process Performance Evaluation", score: 0 },
        { id: "d", label: "Product Process Enhancement", score: 0 }
      ],
      explanation: "PPE includes items like helmets, gloves, goggles to protect workers from hazards."
    },
    {
      id: "mfg-6",
      category: "Automation",
      difficulty: "intermediate",
      question: "What is the main advantage of automation in manufacturing?",
      options: [
        { id: "a", label: "Reducing the number of products made", score: 0 },
        { id: "b", label: "Increased consistency and reduced labor costs", score: 25 },
        { id: "c", label: "Making products more expensive", score: 0 },
        { id: "d", label: "Eliminating all workers", score: 0 }
      ],
      explanation: "Automation improves consistency, reduces errors, and can lower long-term labor costs."
    },
    {
      id: "mfg-7",
      category: "Inventory Management",
      difficulty: "intermediate",
      question: "What is 'ABC analysis' in inventory?",
      options: [
        { id: "a", label: "Analyzing three types of inventory", score: 0 },
        { id: "b", label: "Categorizing items by importance and value", score: 25 },
        { id: "c", label: "Counting inventory three times", score: 0 },
        { id: "d", label: "A method of product coding", score: 0 }
      ],
      explanation: "ABC analysis categorizes inventory by value: A items (high value, few), B (medium), C (low value, many)."
    },
    {
      id: "mfg-8",
      category: "Process Improvement",
      difficulty: "advanced",
      question: "What is 'root cause analysis'?",
      options: [
        { id: "a", label: "Finding the main cause of a problem", score: 25 },
        { id: "b", label: "Identifying the primary product defect", score: 0 },
        { id: "c", label: "Determining the main supplier", score: 0 },
        { id: "d", label: "Finding the most expensive machine", score: 0 }
      ],
      explanation: "Root cause analysis identifies the underlying reason for a problem to prevent recurrence."
    }
  ],
  logistics: [
    {
      id: "log-1",
      category: "Supply Chain",
      difficulty: "beginner",
      question: "What is 'supply chain management'?",
      options: [
        { id: "a", label: "Managing a single warehouse", score: 0 },
        { id: "b", label: "Coordinating all activities from raw materials to customer delivery", score: 25 },
        { id: "c", label: "Only managing transportation", score: 0 },
        { id: "d", label: "Hiring logistics staff", score: 0 }
      ],
      explanation: "Supply chain management coordinates all flow of goods, information, and finances from supplier to customer."
    },
    {
      id: "log-2",
      category: "Inventory",
      difficulty: "intermediate",
      question: "What is 'safety stock' in inventory management?",
      options: [
        { id: "a", label: "Extra inventory kept for unexpected demand", score: 25 },
        { id: "b", label: "Stock that cannot be sold", score: 0 },
        { id: "c", label: "Inventory for safety equipment", score: 0 },
        { id: "d", label: "Minimum inventory level", score: 0 }
      ],
      explanation: "Safety stock is buffer inventory to protect against demand variability and supply uncertainty."
    },
    {
      id: "log-3",
      category: "Transportation",
      difficulty: "intermediate",
      question: "What is 'freight forwarding'?",
      options: [
        { id: "a", label: "Moving goods by foot", score: 0 },
        { id: "b", label: "Arranging transportation and logistics for shipments", score: 25 },
        { id: "c", label: "Delivering products to customers", score: 0 },
        { id: "d", label: "Loading goods onto trucks", score: 0 }
      ],
      explanation: "Freight forwarders arrange shipment logistics including routing, documentation, and customs."
    },
    {
      id: "log-4",
      category: "Warehouse",
      difficulty: "advanced",
      question: "What is 'cross-docking' in logistics?",
      options: [
        { id: "a", label: "Loading and unloading at the same dock", score: 0 },
        { id: "b", label: "Direct transfer from inbound to outbound without storage", score: 25 },
        { id: "c", label: "Transporting goods across borders", score: 0 },
        { id: "d", label: "Docking multiple trucks at once", score: 0 }
      ],
      explanation: "Cross-docking moves products directly from receiving to shipping with minimal storage."
    },
    {
      id: "log-5",
      category: "Distribution",
      difficulty: "intermediate",
      question: "What is 'last mile delivery'?",
      options: [
        { id: "a", label: "The final mile of a marathon", score: 0 },
        { id: "b", label: "Final step of delivery from hub to end customer", score: 25 },
        { id: "c", label: "The longest part of shipping", score: 0 },
        { id: "d", label: "Delivering to the last customer only", score: 0 }
      ],
      explanation: "Last mile delivery is the final leg of delivery from distribution center to customer."
    },
    {
      id: "log-6",
      category: "Forecasting",
      difficulty: "beginner",
      question: "What is demand forecasting?",
      options: [
        { id: "a", label: "Guessing what customers want", score: 0 },
        { id: "b", label: "Predicting future customer demand to plan operations", score: 25 },
        { id: "c", label: "Asking customers what they want", score: 0 },
        { id: "d", label: "Setting product prices", score: 0 }
      ],
      explanation: "Demand forecasting uses data to predict future demand for better inventory and production planning."
    },
    {
      id: "log-7",
      category: "Optimization",
      difficulty: "intermediate",
      question: "What is 'route optimization'?",
      options: [
        { id: "a", label: "Choosing the most scenic route", score: 0 },
        { id: "b", label: "Finding the most efficient delivery routes", score: 25 },
        { id: "c", label: "Using GPS navigation", score: 0 },
        { id: "d", label: "Planning only highway routes", score: 0 }
      ],
      explanation: "Route optimization uses algorithms to find the most efficient paths, reducing costs and time."
    },
    {
      id: "log-8",
      category: "E-commerce Logistics",
      difficulty: "advanced",
      question: "What is 'reverse logistics'?",
      options: [
        { id: "a", label: "Going back to the starting point", score: 0 },
        { id: "b", label: "Managing returns and recycling of products", score: 25 },
        { id: "c", label: "Delivering products in reverse order", score: 0 },
        { id: "d", label: "Sending products backwards on conveyor belts", score: 0 }
      ],
      explanation: "Reverse logistics handles product returns, recycling, and refurbishing."
    }
  ],
  space: [
    {
      id: "space-1",
      category: "Orbital Mechanics",
      difficulty: "beginner",
      question: "What is 'orbital velocity'?",
      options: [
        { id: "a", label: "Speed of an airplane", score: 0 },
        { id: "b", label: "Speed required to maintain orbit around a body", score: 25 },
        { id: "c", label: "Speed of light in space", score: 0 },
        { id: "d", label: "Maximum speed of a rocket", score: 0 }
      ],
      explanation: "Orbital velocity is the speed needed to maintain a stable orbit, balancing gravity and centrifugal force."
    },
    {
      id: "space-2",
      category: "Rocket Science",
      difficulty: "intermediate",
      question: "What does 'specific impulse' measure in a rocket engine?",
      options: [
        { id: "a", label: "The height the rocket reaches", score: 0 },
        { id: "b", label: "Efficiency of rocket propellant", score: 25 },
        { id: "c", label: "The speed of exhaust gases", score: 0 },
        { id: "d", label: "The weight of the rocket", score: 0 }
      ],
      explanation: "Specific impulse measures how efficiently a rocket uses propellant (thrust per unit of propellant)."
    },
    {
      id: "space-3",
      category: "Spacecraft Systems",
      difficulty: "intermediate",
      question: "What is a 'satellite' in space technology?",
      options: [
        { id: "a", label: "An astronaut", score: 0 },
        { id: "b", label: "An object orbiting a larger body for communication or observation", score: 25 },
        { id: "c", label: "A space station", score: 0 },
        { id: "d", label: "A type of telescope", score: 0 }
      ],
      explanation: "Satellites are objects placed in orbit to collect data, provide communications, or for observation."
    },
    {
      id: "space-4",
      category: "Space Mission",
      difficulty: "advanced",
      question: "What is a 'gravity assist' maneuver?",
      options: [
        { id: "a", label: "Using a planet's gravity to change spacecraft speed or direction", score: 25 },
        { id: "b", label: "Landing on a planet using gravity", score: 0 },
        { id: "c", label: "Measuring gravitational pull of planets", score: 0 },
        { id: "d", label: "Sending a probe into deep space", score: 0 }
      ],
      explanation: "Gravity assist uses a planet's gravitational field to increase or decrease spacecraft velocity."
    },
    {
      id: "space-5",
      category: "Astronomy",
      difficulty: "intermediate",
      question: "What is the 'Karman line'?",
      options: [
        { id: "a", label: "A line on a map of Mars", score: 0 },
        { id: "b", label: "The boundary between Earth's atmosphere and outer space (100km)", score: 25 },
        { id: "c", label: "The edge of the solar system", score: 0 },
        { id: "d", label: "The orbit of the International Space Station", score: 0 }
      ],
      explanation: "The Karman line at 100km altitude is commonly considered the boundary of outer space."
    },
    {
      id: "space-6",
      category: "Spacecraft Design",
      difficulty: "beginner",
      question: "What is the primary purpose of 'thermal control' in spacecraft?",
      options: [
        { id: "a", label: "Keeping astronauts warm", score: 0 },
        { id: "b", label: "Managing temperature extremes in space environment", score: 25 },
        { id: "c", label: "Heating food for astronauts", score: 0 },
        { id: "d", label: "Controlling the spacecraft's engine temperature", score: 0 }
      ],
      explanation: "Spacecraft thermal control manages heating and cooling to protect equipment in space temperature extremes."
    },
    {
      id: "space-7",
      category: "Communications",
      difficulty: "intermediate",
      question: "What is 'latency' in space communications?",
      options: [
        { id: "a", label: "The size of data sent", score: 0 },
        { id: "b", label: "Time delay in signal transmission", score: 25 },
        { id: "c", label: "Distance to spacecraft", score: 0 },
        { id: "d", label: "Signal strength", score: 0 }
      ],
      explanation: "Latency is the time delay in communication, particularly significant for distant space missions."
    },
    {
      id: "space-8",
      category: "Space Law",
      difficulty: "advanced",
      question: "What does 'Outer Space Treaty' primarily establish?",
      options: [
        { id: "a", label: "Space tourism regulations", score: 0 },
        { id: "b", label: "Space as free for exploration by all nations, no national claims", score: 25 },
        { id: "c", label: "Rules for space mining", score: 0 },
        { id: "d", label: "Spacecraft safety standards", score: 0 }
      ],
      explanation: "The Outer Space Treaty (1967) establishes space as the province of all humanity, not subject to national appropriation."
    }
  ],
  creative: [
    {
      id: "cre-1",
      category: "UI Design",
      difficulty: "beginner",
      question: "What is 'responsive design'?",
      options: [
        { id: "a", label: "Designing for fast loading", score: 0 },
        { id: "b", label: "Creating layouts that adapt to different screen sizes", score: 25 },
        { id: "c", label: "Designing for specific devices only", score: 0 },
        { id: "d", label: "Quick design turnaround", score: 0 }
      ],
      explanation: "Responsive design creates interfaces that work well on all device sizes, from phones to desktops."
    },
    {
      id: "cre-2",
      category: "UX Design",
      difficulty: "intermediate",
      question: "What is a 'user persona' in design?",
      options: [
        { id: "a", label: "A real user of the product", score: 0 },
        { id: "b", label: "A fictional representation of target user for design decisions", score: 25 },
        { id: "c", label: "The developer's profile", score: 0 },
        { id: "d", label: "A user feedback document", score: 0 }
      ],
      explanation: "User personas are fictional characters created to represent different user types for design decisions."
    },
    {
      id: "cre-3",
      category: "Design Tools",
      difficulty: "intermediate",
      question: "What is 'Figma' used for?",
      options: [
        { id: "a", label: "Photo editing", score: 0 },
        { id: "b", label: "UI/UX design and prototyping", score: 25 },
        { id: "c", label: "Video editing", score: 0 },
        { id: "d", label: "3D modeling", score: 0 }
      ],
      explanation: "Figma is a collaborative design tool for creating user interfaces and prototypes."
    },
    {
      id: "cre-4",
      category: "Design Process",
      difficulty: "advanced",
      question: "What is 'design thinking'?",
      options: [
        { id: "a", label: "Thinking about how to design products", score: 0 },
        { id: "b", label: "User-centered problem-solving approach using empathy and iteration", score: 25 },
        { id: "c", label: "Creating designs quickly", score: 0 },
        { id: "d", label: "Thinking in design software", score: 0 }
      ],
      explanation: "Design thinking is a problem-solving methodology focused on user needs through empathy, ideation, and iteration."
    },
    {
      id: "cre-5",
      category: "Color",
      difficulty: "beginner",
      question: "What are 'warm colors' in design?",
      options: [
        { id: "a", label: "Colors from cool tones like blue and green", score: 0 },
        { id: "b", label: "Red, orange, yellow - associated with warmth and energy", score: 25 },
        { id: "c", label: "Colors that are literally hot", score: 0 },
        { id: "d", label: "Colors used in summer designs", score: 0 }
      ],
      explanation: "Warm colors (red, orange, yellow) create feelings of energy, warmth, and excitement."
    },
    {
      id: "cre-6",
      category: "Typography",
      difficulty: "intermediate",
      question: "What is 'visual hierarchy' in design?",
      options: [
        { id: "a", label: "Arranging text by importance", score: 0 },
        { id: "b", label: "Arranging elements to guide viewer's attention in order of importance", score: 25 },
        { id: "c", label: "Ranking fonts from best to worst", score: 0 },
        { id: "d", label: "Vertical arrangement of text", score: 0 }
      ],
      explanation: "Visual hierarchy uses size, color, contrast to direct attention to most important elements first."
    },
    {
      id: "cre-7",
      category: "Motion Design",
      difficulty: "intermediate",
      question: "What is 'micro-interaction' in UI design?",
      options: [
        { id: "a", label: "Very small design elements", score: 0 },
        { id: "b", label: "Small animations that provide feedback or enhance experience", score: 25 },
        { id: "c", label: "Interaction with small screens", score: 0 },
        { id: "d", label: "Designing for mobile devices only", score: 0 }
      ],
      explanation: "Micro-interactions are subtle animations that provide feedback like button clicks or form validations."
    },
    {
      id: "cre-8",
      category: "Portfolio",
      difficulty: "advanced",
      question: "What is the primary purpose of a design portfolio?",
      options: [
        { id: "a", label: "To show all the work you've ever done", score: 0 },
        { id: "b", label: "To demonstrate skills and attract clients or employers", score: 25 },
        { id: "c", label: "To store design files", score: 0 },
        { id: "d", label: "To compete in design contests", score: 0 }
      ],
      explanation: "A portfolio showcases best work to demonstrate abilities and win opportunities."
    }
  ],
  film: [
    {
      id: "film-1",
      category: "Film Production",
      difficulty: "beginner",
      question: "What is the 'three-act structure' in filmmaking?",
      options: [
        { id: "a", label: "Three different camera angles", score: 0 },
        { id: "b", label: "Setup, confrontation, resolution - basic story structure", score: 25 },
        { id: "c", label: "Three types of shots", score: 0 },
        { id: "d", label: "Three people directing a film", score: 0 }
      ],
      explanation: "Three-act structure divides a story into setup (act 1), confrontation (act 2), resolution (act 3)."
    },
    {
      id: "film-2",
      category: "Cinematography",
      difficulty: "intermediate",
      question: "What does 'depth of field' refer to in cinematography?",
      options: [
        { id: "a", label: "How dark the image appears", score: 0 },
        { id: "b", label: "Range of distance in focus in a shot", score: 25 },
        { id: "c", label: "The physical size of the camera", score: 0 },
        { id: "d", label: "How long the scene lasts", score: 0 }
      ],
      explanation: "Depth of field is the distance between the nearest and farthest objects in focus."
    },
    {
      id: "film-3",
      category: "Video Editing",
      difficulty: "intermediate",
      question: "What is a 'cut' in film editing?",
      options: [
        { id: "a", label: "Removing part of the film", score: 0 },
        { id: "b", label: "Direct transition from one shot to another", score: 25 },
        { id: "c", label: "Reducing video length", score: 0 },
        { id: "d", label: "Splitting audio from video", score: 0 }
      ],
      explanation: "A cut is the most basic transition where one shot immediately follows another."
    },
    {
      id: "film-4",
      category: "Sound Design",
      difficulty: "advanced",
      question: "What is 'diegetic sound' in film?",
      options: [
        { id: "a", label: "Sound from outside the film", score: 0 },
        { id: "b", label: "Sound that originates from within the story world", score: 25 },
        { id: "c", label: "Background music", score: 0 },
        { id: "d", label: "Dialogue only", score: 0 }
      ],
      explanation: "Diegetic sound is audio that exists within the story world (like character dialogue or on-screen events)."
    },
    {
      id: "film-5",
      category: "Lighting",
      difficulty: "beginner",
      question: "What is 'key light' in film lighting?",
      options: [
        { id: "a", label: "The main, brightest light source", score: 25 },
        { id: "b", label: "Light from the camera", score: 0 },
        { id: "c", label: "Emergency lighting", score: 0 },
        { id: "d", label: "Light that indicates character emotions", score: 0 }
      ],
      explanation: "Key light is the primary light source that creates the main illumination and shadows."
    },
    {
      id: "film-6",
      category: "Screenwriting",
      difficulty: "intermediate",
      question: "What is a 'beat' in screenwriting?",
      options: [
        { id: "a", label: "A musical element in film", score: 0 },
        { id: "b", label: "Smallest unit of change in story value", score: 25 },
        { id: "c", label: "A scene transition", score: 0 },
        { id: "d", label: "A camera movement", score: 0 }
      ],
      explanation: "A beat is a moment in the story where characters' emotional state changes."
    },
    {
      id: "film-7",
      category: "Advertising",
      difficulty: "intermediate",
      question: "What is 'brand integration' in film and TV?",
      options: [
        { id: "a", label: "Putting brand logos in end credits", score: 0 },
        { id: "b", label: "Incorporating products naturally into content", score: 25 },
        { id: "c", label: "Creating separate commercial breaks", score: 0 },
        { id: "d", label: "Advertising before the film starts", score: 0 }
      ],
      explanation: "Brand integration embeds products or services naturally into storytelling rather than separate commercials."
    },
    {
      id: "film-8",
      category: "Post-Production",
      difficulty: "advanced",
      question: "What is 'color grading'?",
      options: [
        { id: "a", label: "Adding colors to black and white films", score: 0 },
        { id: "b", label: "Adjusting colors for mood and style in post-production", score: 25 },
        { id: "c", label: "Choosing costumes by color", score: 0 },
        { id: "d", label: "Finding errors in footage", score: 0 }
      ],
      explanation: "Color grading adjusts colors and tones to create visual style and emotional impact."
    }
  ]
};

// Default fallback questions
const defaultTechnicalQuestions = [
  {
    id: "gen-1",
    category: "Problem Solving",
    difficulty: "beginner",
    question: "What is the first step in problem-solving?",
    options: [
      { id: "a", label: "Implement solution", score: 0 },
      { id: "b", label: "Define the problem", score: 25 },
      { id: "c", label: "Test results", score: 0 },
      { id: "d", label: "Ask for help", score: 0 }
    ],
    explanation: "Defining the problem clearly is the first and most important step in solving any problem."
  },
  {
    id: "gen-2",
    category: "Critical Thinking",
    difficulty: "intermediate",
    question: "What is a hypothesis?",
    options: [
      { id: "a", label: "A proven fact", score: 0 },
      { id: "b", label: "A testable explanation for observations", score: 25 },
      { id: "c", label: "A final conclusion", score: 0 },
      { id: "d", label: "A research method", score: 0 }
    ],
    explanation: "A hypothesis is a proposed explanation that can be tested through experimentation."
  },
  {
    id: "gen-3",
    category: "Data Literacy",
    difficulty: "intermediate",
    question: "What is data visualization?",
    options: [
      { id: "a", label: "Storing data in databases", score: 0 },
      { id: "b", label: "Representing data graphically", score: 25 },
      { id: "c", label: "Deleting old data", score: 0 },
      { id: "d", label: "Encrypting data", score: 0 }
    ],
    explanation: "Data visualization uses charts, graphs, and maps to make data easier to understand."
  },
  {
    id: "gen-4",
    category: "Project Management",
    difficulty: "advanced",
    question: "What is the critical path in project management?",
    options: [
      { id: "a", label: "The most expensive tasks", score: 0 },
      { id: "b", label: "Longest sequence of dependent tasks", score: 25 },
      { id: "c", label: "The project budget", score: 0 },
      { id: "d", label: "The project team", score: 0 }
    ],
    explanation: "Critical path determines minimum project duration - delays on this path delay the project."
  }
];

interface AssessmentQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: { id: string; label: string; score: number }[];
  explanation?: string;
}

interface SkillScore {
  category: string;
  score: number;
  totalQuestions: number;
  level: string;
}

export function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; score: number }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [hasCareerAssessment, setHasCareerAssessment] = useState<boolean | null>(null);
  const [careerSector, setCareerSector] = useState<string>("");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Check if user has taken career assessment
  useEffect(() => {
    const checkCareerAssessment = async () => {
      if (!currentUser?.uid) {
        setHasCareerAssessment(false);
        setLoadingQuestions(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const hasAssessment = !!(data.aiAssessment?.selectedSector || data.userSector);
          setHasCareerAssessment(hasAssessment);
          
          if (hasAssessment) {
            const sector = data.aiAssessment?.selectedSector || data.userSector;
            setCareerSector(sector);
            // Load sector-specific questions
            loadSectorQuestions(sector);
          } else {
            setLoadingQuestions(false);
          }
        } else {
          setHasCareerAssessment(false);
          setLoadingQuestions(false);
        }
      } catch (error) {
        console.error("Error checking career assessment:", error);
        setHasCareerAssessment(false);
        setLoadingQuestions(false);
      }
    };

    checkCareerAssessment();
  }, [currentUser]);

  const loadSectorQuestions = (sector: string) => {
    // Get sector-specific questions or use default
    // Map common sector names to keys
    const sectorKeyMap: Record<string, string> = {
      'technology': 'tech',
      'tech': 'tech',
      'medical': 'medical',
      'healthcare': 'medical',
      'medical & healthcare': 'medical',
      'business': 'business',
      'business & management': 'business',
      'science': 'science',
      'science & research': 'science',
      'engineering': 'engineering',
      'mechanical': 'mechanical',
      'aviation': 'aviation',
      'finance': 'finance',
      'financial': 'finance',
      'arts': 'arts',
      'arts-media': 'arts',
      'arts & media': 'arts',
      'education': 'education',
      'law': 'law',
      'marketing': 'marketing',
      'manufacturing': 'manufacturing',
      'logistics': 'logistics',
      'logistics-supply': 'logistics',
      'logistics & supply chain': 'logistics',
      'space-tech': 'space',
      'space & defense': 'space',
      'creative': 'creative',
      'creative & design': 'creative',
      'film': 'film',
      'film-advertisement': 'film',
      'film & advertisement': 'film'
    };
    
    const sectorKey = sectorKeyMap[sector.toLowerCase()] || sector.toLowerCase();
    const sectorQuestionsData = sectorQuestions[sectorKey] || defaultTechnicalQuestions;
    
    // Shuffle questions to get fresh set each time (Fisher-Yates shuffle)
    const shuffled = [...sectorQuestionsData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Take first 5 questions for variety
    setAssessmentQuestions(shuffled.slice(0, 5));
    setLoadingQuestions(false);
  };

  const handleManualSectorSelect = (sector: string) => {
    setSelectedSector(sector);
    setShowManualSelector(false);
    loadSectorQuestions(sector);
  };

  const handleAnswer = (optionId: string) => {
    const option = assessmentQuestions[currentQuestionIndex].options.find(o => o.id === optionId);
    const score = option?.score || 0;
    
    setAnswers({
      ...answers,
      [assessmentQuestions[currentQuestionIndex].id]: { optionId, score }
    });
    
    // Update current score
    const newScore = Object.values({ ...answers, [assessmentQuestions[currentQuestionIndex].id]: { optionId, score } })
      .reduce((sum, a) => sum + a.score, 0);
    setCurrentScore(newScore);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate skill scores by category
      const categoryScores: Record<string, { total: number; count: number }> = {};
      
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = assessmentQuestions.find(q => q.id === questionId);
        if (question) {
          if (!categoryScores[question.category]) {
            categoryScores[question.category] = { total: 0, count: 0 };
          }
          categoryScores[question.category].total += answer.score;
          categoryScores[question.category].count += 1;
        }
      });

      // Determine skill levels
      const skillScores: SkillScore[] = Object.entries(categoryScores).map(([category, data]) => {
        const avgScore = data.count > 0 ? (data.total / (data.count * 25)) * 100 : 0;
        let level = "Beginner";
        if (avgScore >= 80) level = "Expert";
        else if (avgScore >= 60) level = "Advanced";
        else if (avgScore >= 40) level = "Intermediate";
        
        return {
          category,
          score: Math.round(avgScore),
          totalQuestions: data.count,
          level
        };
      });

      // Determine which sector was used
      const usedSector = careerSector || selectedSector;

      // Save results to Firestore if user is logged in
      if (currentUser?.uid) {
        await setDoc(doc(db, 'users', currentUser.uid, 'technicalAssessment', 'results'), {
          skillScores,
          totalScore: currentScore,
          maxPossibleScore: assessmentQuestions.length * 25,
          completedAt: new Date().toISOString(),
          assessmentId: `tech-${Date.now()}`,
          sector: usedSector || 'general',
          assessmentSource: careerSector ? 'career-assessment' : 'manual'
        });
      }

      toast({
        title: "Assessment Completed!",
        description: `You scored ${currentScore} points in ${usedSector || 'general'} sector. Check your skill profile for details.`,
        variant: "default",
      });
      
      // Navigate to skill analysis
      navigate("/dashboard/skill-analysis");
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error saving your results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loadingQuestions) {
    return (
      <div className="container max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Technical Skills Assessment
        </h1>
        <p className="text-muted-foreground mb-6">
          Adaptive AI-powered assessment that evaluates your technical proficiency
        </p>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  // No career assessment taken - show prompt
  if (hasCareerAssessment === false && !showManualSelector) {
    return (
      <div className="container max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Technical Skills Assessment
        </h1>
        <p className="text-muted-foreground mb-6">
          Adaptive AI-powered assessment that evaluates your technical proficiency
        </p>
        
        <Card className="mt-6">
          <CardContent className="p-6 text-center space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Career Assessment Required</h3>
              <p className="text-muted-foreground mb-4">
                Please take the Career Personality Quiz first to get personalized technical questions based on your career interests.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/career-quiz')}>
                <Target className="mr-2 h-4 w-4" />
                Take Career Quiz
              </Button>
              <Button variant="outline" onClick={() => setShowManualSelector(true)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Go Manual
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manual sector selector
  if (showManualSelector) {
    const sectors = [
      { id: "tech", name: "Technology", icon: "💻" },
      { id: "medical", name: "Medical & Healthcare", icon: "🏥" },
      { id: "business", name: "Business & Management", icon: "💼" },
      { id: "science", name: "Science & Research", icon: "🔬" },
      { id: "engineering", name: "Engineering", icon: "⚙️" },
      { id: "aviation", name: "Aviation", icon: "✈️" },
      { id: "finance", name: "Finance & Banking", icon: "💰" },
      { id: "arts", name: "Arts & Media", icon: "🎨" },
      { id: "education", name: "Education", icon: "📚" },
      { id: "law", name: "Law & Legal", icon: "⚖️" },
      { id: "marketing", name: "Marketing", icon: "📢" },
      { id: "mechanical", name: "Mechanical & Manufacturing", icon: "🏭" },
      { id: "logistics", name: "Logistics & Supply Chain", icon: "📦" },
      { id: "space", name: "Space & Defense", icon: "🚀" },
      { id: "creative", name: "Creative & Design", icon: "🎭" },
      { id: "film", name: "Film & Advertisement", icon: "🎬" }
    ];

    return (
      <div className="container max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Technical Skills Assessment
        </h1>
        <p className="text-muted-foreground mb-6">
          Select a sector to customize your technical assessment questions
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Choose Your Sector</CardTitle>
            <CardDescription>
              Select the industry/field you want to be assessed in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sectors.map((sector) => (
                <Button
                  key={sector.id}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => handleManualSectorSelect(sector.id)}
                >
                  <span className="text-2xl">{sector.icon}</span>
                  <span className="text-sm">{sector.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No questions loaded
  if (assessmentQuestions.length === 0) {
    return (
      <div className="container max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Technical Skills Assessment
        </h1>
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Unable to load assessment questions.</p>
            <Button onClick={() => setShowManualSelector(true)}>
              Select Sector Manually
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Technical Skills Assessment
        </h1>
        <p className="text-muted-foreground">
          {careerSector 
            ? `Based on your career assessment in ${careerSector.charAt(0).toUpperCase() + careerSector.slice(1)} sector`
            : `Customized assessment for ${selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)} sector`}
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentQuestionIndex + 1} of {assessmentQuestions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentQuestion?.question}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentQuestion?.difficulty}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Category: {currentQuestion?.category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={answers[currentQuestion?.id]?.optionId} 
            onValueChange={handleAnswer}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 mb-4 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isSubmitting}
          >
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentQuestionIndex === assessmentQuestions.length - 1 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Assessment
              </>
            ) : (
              "Next Question"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Assessment;