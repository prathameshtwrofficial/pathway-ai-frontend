// Local career sectors and occupations data for offline question generation

export interface Sector {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Occupation {
  id: string;
  title: string;
  sector: string;
  description: string;
  requiredSkills: string[];
  interests: string[];
  salaryRange: string;
  growthPotential: string;
  workStyle: string[];
}

export interface OccupationQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    score: number;
  }[];
  occupationId: string;
  occupationTitle: string;
}

export const sectors: Sector[] = [
  { id: "tech", name: "Technology", icon: "💻", description: "Software, IT, and digital technology" },
  { id: "mechanical", name: "Mechanical", icon: "⚙️", description: "Machines, vehicles, and mechanical systems" },
  { id: "manufacturing", name: "Manufacturing", icon: "🏭", description: "Production, factory, and industrial operations" },
  { id: "aviation", name: "Aviation", icon: "✈️", description: "Aircraft, piloting, and aviation operations" },
  { id: "space-tech", name: "Space & Defense", icon: "🚀", description: "Space exploration, defense, and aerospace" },
  { id: "medical", name: "Medical & Healthcare", icon: "🏥", description: "Healthcare, medicine, and medical devices" },
  { id: "arts-media", name: "Arts & Media", icon: "🎨", description: "Creative arts, design, and media" },
  { id: "film-advertisement", name: "Film & Advertisement", icon: "🎬", description: "Film, video, advertising, and entertainment" },
  { id: "logistics-supply", name: "Logistics & Supply Chain", icon: "📦", description: "Transportation, logistics, and supply chain" },
  { id: "science", name: "Science & Research", icon: "🔬", description: "Scientific research and laboratory work" },
  { id: "business", name: "Business & Management", icon: "💼", description: "Business operations, management, and finance" },
  { id: "creative", name: "Creative & Design", icon: "🎭", description: "Creative and design professions" }
];

export const occupations: Occupation[] = [
  // Technology Sector
  {
    id: "software-engineer",
    title: "Software Engineer",
    sector: "tech",
    description: "Design, develop, and maintain software applications.",
    requiredSkills: ["Programming", "Problem Solving", "Data Structures", "Algorithms", "Version Control", "Database"],
    interests: ["coding", "building", "technology", "innovation", "apps"],
    salaryRange: "₹4L - ₹20L",
    growthPotential: "Very High",
    workStyle: ["collaborative", "independent"]
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    sector: "tech",
    description: "Analyze data using statistical methods to drive business decisions.",
    requiredSkills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization", "Big Data"],
    interests: ["analytics", "statistics", "research", "patterns", "ai"],
    salaryRange: "₹5L - ₹22L",
    growthPotential: "Very High",
    workStyle: ["independent", "analytical"]
  },
  {
    id: "ai-ml-engineer",
    title: "AI/ML Engineer",
    sector: "tech",
    description: "Design and deploy AI and machine learning solutions.",
    requiredSkills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "Neural Networks", "Mathematics"],
    interests: ["ai", "machine-learning", "algorithms", "innovation", "research"],
    salaryRange: "₹6L - ₹25L",
    growthPotential: "Very High",
    workStyle: ["independent", "research-oriented"]
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    sector: "tech",
    description: "Create user-centered designs for digital products.",
    requiredSkills: ["User Research", "Wireframing", "Prototyping", "Figma", "Usability Testing", "HTML/CSS"],
    interests: ["design", "user-experience", "empathy", "usability", "accessibility"],
    salaryRange: "₹4L - ₹15L",
    growthPotential: "High",
    workStyle: ["creative", "research-oriented"]
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    sector: "tech",
    description: "Protect organizations from cyber threats.",
    requiredSkills: ["Network Security", "Penetration Testing", "Security Tools", "Risk Assessment", "Incident Response"],
    interests: ["security", "protection", "networking", "ethical-hacking", "compliance"],
    salaryRange: "₹5L - ₹18L",
    growthPotential: "Very High",
    workStyle: ["analytical", "detail-oriented"]
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    sector: "tech",
    description: "Design and manage cloud infrastructure.",
    requiredSkills: ["AWS/Azure/GCP", "Docker", "Kubernetes", "Infrastructure as Code", "Networking"],
    interests: ["cloud-computing", "infrastructure", "automation", "devops", "scalability"],
    salaryRange: "₹6L - ₹20L",
    growthPotential: "Very High",
    workStyle: ["technical", "problem-solving"]
  },
  {
    id: "mobile-developer",
    title: "Mobile App Developer",
    sector: "tech",
    description: "Develop mobile applications for iOS and Android.",
    requiredSkills: ["React Native/Flutter", "Swift/Kotlin", "API Integration", "UI/UX", "App Store"],
    interests: ["mobile-apps", "ios", "android", "ui-design", "startups"],
    salaryRange: "₹4L - ₹18L",
    growthPotential: "High",
    workStyle: ["creative", "independent"]
  },
  // Mechanical Sector
  {
    id: "mechanical-engineer",
    title: "Mechanical Engineer",
    sector: "mechanical",
    description: "Design, develop, and test mechanical devices.",
    requiredSkills: ["CAD", "Thermodynamics", "Physics", "Manufacturing Processes", "Material Science"],
    interests: ["machines", "design", "physics", "automotive", "robotics"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "High",
    workStyle: ["hands-on", "analytical"]
  },
  {
    id: "electrical-engineer",
    title: "Electrical Engineer",
    sector: "mechanical",
    description: "Design and test electrical equipment.",
    requiredSkills: ["Circuit Analysis", "Electronics", "Power Systems", "CAD", "Embedded Systems"],
    interests: ["electronics", "circuits", "innovation", "power", "automation"],
    salaryRange: "₹4L - ₹14L",
    growthPotential: "High",
    workStyle: ["analytical", "technical"]
  },
  {
    id: "robotics-engineer",
    title: "Robotics Engineer",
    sector: "mechanical",
    description: "Design and build robotic systems.",
    requiredSkills: ["Robotics", "Programming", "Sensors", "Control Systems", "CAD/CAM"],
    interests: ["robots", "automation", "ai", "building", "electronics"],
    salaryRange: "₹5L - ₹16L",
    growthPotential: "Very High",
    workStyle: ["hands-on", "innovative"]
  },
  {
    id: "automotive-engineer",
    title: "Automotive Engineer",
    sector: "mechanical",
    description: "Design and develop vehicles.",
    requiredSkills: ["Vehicle Design", "Aerodynamics", "Engine Systems", "CAD", "Testing"],
    interests: ["cars", "vehicles", "design", "innovation", "sustainability"],
    salaryRange: "₹4L - ₹15L",
    growthPotential: "High",
    workStyle: ["analytical", "team-oriented"]
  },
  // Manufacturing Sector
  {
    id: "manufacturing-engineer",
    title: "Manufacturing Engineer",
    sector: "manufacturing",
    description: "Optimize manufacturing processes.",
    requiredSkills: ["Process Design", "Lean Manufacturing", "Quality Control", "CAD", "Automation"],
    interests: ["production", "efficiency", "optimization", "automation", "quality"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "High",
    workStyle: ["hands-on", "process-oriented"]
  },
  {
    id: "quality-engineer",
    title: "Quality Engineer",
    sector: "manufacturing",
    description: "Ensure product quality and standards.",
    requiredSkills: ["Quality Assurance", "Six Sigma", "Statistical Process Control", "ISO Standards", "Testing"],
    interests: ["quality", "process-improvement", "data-analysis", "standards", "compliance"],
    salaryRange: "₹3L - ₹10L",
    growthPotential: "Medium",
    workStyle: ["detail-oriented", "analytical"]
  },
  // Aviation Sector
  {
    id: "pilot",
    title: "Commercial Pilot",
    sector: "aviation",
    description: "Pilot aircraft for commercial airlines.",
    requiredSkills: ["Aviation Knowledge", "Navigation", "Decision Making", "Communication", "Leadership"],
    interests: ["flying", "aviation", "travel", "technology", "adventure"],
    salaryRange: "₹8L - ₹30L",
    growthPotential: "High",
    workStyle: ["responsible", "detail-oriented"]
  },
  {
    id: "air-traffic-controller",
    title: "Air Traffic Controller",
    sector: "aviation",
    description: "Coordinate aircraft movements.",
    requiredSkills: ["Communication", "Multi-tasking", "Spatial Awareness", "Decision Making", "Pressure Handling"],
    interests: ["aviation", "coordination", "responsibility", "technology", "teamwork"],
    salaryRange: "₹6L - ₹18L",
    growthPotential: "High",
    workStyle: ["high-pressure", "detail-oriented"]
  },
  {
    id: "aircraft-mechanic",
    title: "Aircraft Mechanic",
    sector: "aviation",
    description: "Maintain and repair aircraft.",
    requiredSkills: ["Aircraft Maintenance", "Technical Knowledge", "Inspection", "Troubleshooting", "Documentation"],
    interests: ["aviation", "mechanics", "aircraft", "technical", "hands-on"],
    salaryRange: "₹3L - ₹10L",
    growthPotential: "Medium",
    workStyle: ["hands-on", "detail-oriented"]
  },
  // Space & Defense Sector
  {
    id: "space-systems-engineer",
    title: "Space Systems Engineer",
    sector: "space-tech",
    description: "Design space exploration systems.",
    requiredSkills: ["Orbital Mechanics", "Systems Engineering", "Telemetry", "Aerospace Design", "Simulation"],
    interests: ["space", "satellites", "exploration", "nasa", "innovation"],
    salaryRange: "₹8L - ₹25L",
    growthPotential: "High",
    workStyle: ["research-oriented", "detail-oriented"]
  },
  {
    id: "defense-analyst",
    title: "Defense Analyst",
    sector: "space-tech",
    description: "Analyze defense systems and strategies.",
    requiredSkills: ["Strategic Analysis", "Research", "Intelligence", "Communication", "Security"],
    interests: ["defense", "strategy", "security", "politics", "research"],
    salaryRange: "₹6L - ₹20L",
    growthPotential: "High",
    workStyle: ["analytical", "detail-oriented"]
  },
  // Medical Sector
  {
    id: "doctor",
    title: "Physician/Doctor",
    sector: "medical",
    description: "Diagnose and treat patients.",
    requiredSkills: ["Clinical Diagnosis", "Patient Care", "Medical Knowledge", "Communication", "Procedures"],
    interests: ["medicine", "helping-others", "healthcare", "science", "research"],
    salaryRange: "₹8L - ₹50L",
    growthPotential: "High",
    workStyle: ["patient-facing", "analytical"]
  },
  {
    id: "nurse",
    title: "Registered Nurse",
    sector: "medical",
    description: "Provide patient care.",
    requiredSkills: ["Patient Care", "Clinical Skills", "Communication", "Compassion", "Critical Thinking"],
    interests: ["helping-others", "healthcare", "patient-care", "nursing", "teamwork"],
    salaryRange: "₹3L - ₹8L",
    growthPotential: "High",
    workStyle: ["patient-facing", "collaborative"]
  },
  {
    id: "pharmacist",
    title: "Pharmacist",
    sector: "medical",
    description: "Dispense medications and counsel patients.",
    requiredSkills: ["Pharmaceutical Knowledge", "Patient Counseling", "Medication Therapy", "Chemistry", "Attention to Detail"],
    interests: ["medicine", "chemistry", "helping-others", "healthcare", "research"],
    salaryRange: "₹4L - ₹12L",
    growthPotential: "High",
    workStyle: ["patient-facing", "detail-oriented"]
  },
  {
    id: "physical-therapist",
    title: "Physical Therapist",
    sector: "medical",
    description: "Help patients recover movement.",
    requiredSkills: ["Rehabilitation", "Movement Analysis", "Therapeutic Techniques", "Patient Motivation", "Anatomy"],
    interests: ["healthcare", "helping-others", "fitness", "rehabilitation", "sports"],
    salaryRange: "₹3L - ₹10L",
    growthPotential: "High",
    workStyle: ["patient-facing", "hands-on"]
  },
  {
    id: "biomedical-engineer",
    title: "Biomedical Engineer",
    sector: "medical",
    description: "Design medical devices.",
    requiredSkills: ["Biomechanics", "Medical Devices", "Biomaterials", "Regulatory Affairs", "CAD"],
    interests: ["medicine", "technology", "healthcare", "innovation", "design"],
    salaryRange: "₹5L - ₹15L",
    growthPotential: "Very High",
    workStyle: ["research-oriented", "detail-oriented"]
  },
  // Arts & Media Sector
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    sector: "arts-media",
    description: "Create visual designs.",
    requiredSkills: ["Adobe Creative Suite", "Typography", "Color Theory", "Visual Design", "Branding"],
    interests: ["design", "art", "creativity", "branding", "visual-communication"],
    salaryRange: "₹2L - ₹8L",
    growthPotential: "Medium",
    workStyle: ["creative", "independent"]
  },
  {
    id: "photographer",
    title: "Photographer",
    sector: "arts-media",
    description: "Capture photographs professionally.",
    requiredSkills: ["Photography", "Photo Editing", "Lighting", "Composition", "Equipment"],
    interests: ["photography", "art", "visuals", "storytelling", "creative"],
    salaryRange: "₹2L - ₹12L",
    growthPotential: "Variable",
    workStyle: ["creative", "independent"]
  },
  {
    id: "journalist",
    title: "Journalist",
    sector: "arts-media",
    description: "Research and report news.",
    requiredSkills: ["Writing", "Research", "Interviewing", "Critical Thinking", "Communication"],
    interests: ["news", "writing", "storytelling", "current-events", "investigation"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "Medium",
    workStyle: ["deadline-driven", "independent"]
  },
  {
    id: "content-creator",
    title: "Content Creator",
    sector: "arts-media",
    description: "Create digital content.",
    requiredSkills: ["Content Writing", "Social Media", "Video Production", "Audience Engagement", "Branding"],
    interests: ["content", "social-media", "creativity", "digital", "storytelling"],
    salaryRange: "₹2L - ₹15L",
    growthPotential: "High",
    workStyle: ["creative", "independent"]
  },
  // Film & Advertisement Sector
  {
    id: "video-editor",
    title: "Video Editor",
    sector: "film-advertisement",
    description: "Edit video footage.",
    requiredSkills: ["Video Editing", "Storytelling", "Motion Graphics", "Color Grading", "Audio"],
    interests: ["film", "video", "storytelling", "editing", "creativity"],
    salaryRange: "₹2L - ₹10L",
    growthPotential: "Medium",
    workStyle: ["creative", "technical"]
  },
  {
    id: "film-director",
    title: "Film Director",
    sector: "film-advertisement",
    description: "Lead creative aspects of film production.",
    requiredSkills: ["Filmmaking", "Creative Vision", "Leadership", "Storytelling", "Production Management"],
    interests: ["film", "storytelling", "creative-direction", "cinema", "leadership"],
    salaryRange: "₹5L - ₹50L+",
    growthPotential: "Variable",
    workStyle: ["creative-leadership", "collaborative"]
  },
  {
    id: "advertising-creative",
    title: "Advertising Creative",
    sector: "film-advertisement",
    description: "Create advertising campaigns.",
    requiredSkills: ["Creative Writing", "Concept Development", "Brand Strategy", "Visual Design", "Presentation"],
    interests: ["advertising", "creativity", "branding", "marketing", "storytelling"],
    salaryRange: "₹4L - ₹15L",
    growthPotential: "High",
    workStyle: ["creative", "deadline-driven"]
  },
  {
    id: "animator",
    title: "Animator",
    sector: "film-advertisement",
    description: "Create animated content.",
    requiredSkills: ["Animation Software", "Drawing", "Storyboarding", "Timing", "Motion Graphics"],
    interests: ["animation", "drawing", "film", "creativity", "digital"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "High",
    workStyle: ["creative", "technical"]
  },
  // Logistics & Supply Chain Sector
  {
    id: "logistics-manager",
    title: "Logistics Manager",
    sector: "logistics-supply",
    description: "Manage supply chain operations.",
    requiredSkills: ["Supply Chain", "Operations Management", "Transportation", "Forecasting", "Leadership"],
    interests: ["logistics", "operations", "optimization", "business", "efficiency"],
    salaryRange: "₹4L - ₹15L",
    growthPotential: "High",
    workStyle: ["analytical", "leadership"]
  },
  {
    id: "supply-chain-analyst",
    title: "Supply Chain Analyst",
    sector: "logistics-supply",
    description: "Analyze supply chain processes.",
    requiredSkills: ["Data Analysis", "Excel", "Supply Chain Concepts", "Forecasting", "Problem Solving"],
    interests: ["analytics", "supply-chain", "optimization", "data", "business"],
    salaryRange: "₹4L - ₹12L",
    growthPotential: "High",
    workStyle: ["analytical", "detail-oriented"]
  },
  {
    id: "warehouse-manager",
    title: "Warehouse Manager",
    sector: "logistics-supply",
    description: "Manage warehouse operations.",
    requiredSkills: ["Warehouse Operations", "Inventory Management", "Leadership", "Safety Compliance", "Technology"],
    interests: ["operations", "management", "logistics", "efficiency", "teamwork"],
    salaryRange: "₹3L - ₹10L",
    growthPotential: "Medium",
    workStyle: ["hands-on", "leadership"]
  },
  // Science & Research Sector
  {
    id: "research-scientist",
    title: "Research Scientist",
    sector: "science",
    description: "Conduct scientific research.",
    requiredSkills: ["Research Methods", "Data Analysis", "Scientific Writing", "Laboratory Techniques", "Critical Thinking"],
    interests: ["research", "science", "discovery", "experimentation", "innovation"],
    salaryRange: "₹4L - ₹20L",
    growthPotential: "High",
    workStyle: ["research-oriented", "analytical"]
  },
  {
    id: "chemist",
    title: "Chemist",
    sector: "science",
    description: "Study chemical substances.",
    requiredSkills: ["Chemistry", "Laboratory Skills", "Analysis", "Research", "Safety"],
    interests: ["chemistry", "research", "laboratory", "innovation", "science"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "High",
    workStyle: ["laboratory", "detail-oriented"]
  },
  {
    id: "biologist",
    title: "Biologist",
    sector: "science",
    description: "Study living organisms.",
    requiredSkills: ["Biology", "Laboratory Skills", "Research", "Data Analysis", "Fieldwork"],
    interests: ["biology", "life-sciences", "research", "nature", "healthcare"],
    salaryRange: "₹3L - ₹15L",
    growthPotential: "High",
    workStyle: ["research-oriented", "field-oriented"]
  },
  {
    id: "physicist",
    title: "Physicist",
    sector: "science",
    description: "Study matter and energy.",
    requiredSkills: ["Physics", "Mathematical Modeling", "Research", "Programming", "Laboratory"],
    interests: ["physics", "theory", "research", "innovation", "mathematics"],
    salaryRange: "₹4L - ₹20L",
    growthPotential: "High",
    workStyle: ["theoretical", "analytical"]
  },
  {
    id: "environmental-scientist",
    title: "Environmental Scientist",
    sector: "science",
    description: "Solve environmental problems.",
    requiredSkills: ["Environmental Science", "Field Research", "Data Analysis", "Regulations", "GIS"],
    interests: ["environment", "sustainability", "conservation", "science", "policy"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "High",
    workStyle: ["field-oriented", "analytical"]
  },
  // Business & Management Sector
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    sector: "business",
    description: "Plan marketing strategies.",
    requiredSkills: ["Marketing Strategy", "Digital Marketing", "Analytics", "Brand Management", "Content"],
    interests: ["marketing", "creativity", "strategy", "business", "digital"],
    salaryRange: "₹5L - ₹18L",
    growthPotential: "High",
    workStyle: ["creative", "strategic"]
  },
  {
    id: "accountant",
    title: "Accountant",
    sector: "business",
    description: "Prepare financial records.",
    requiredSkills: ["Accounting", "Financial Analysis", "Tax", "Auditing", "Software"],
    interests: ["finance", "numbers", "accuracy", "business", "compliance"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "High",
    workStyle: ["detail-oriented", "analytical"]
  },
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    sector: "business",
    description: "Analyze financial data.",
    requiredSkills: ["Financial Modeling", "Excel", "Data Analysis", "Investment Analysis", "Communication"],
    interests: ["finance", "investments", "analytics", "markets", "research"],
    salaryRange: "₹5L - ₹15L",
    growthPotential: "High",
    workStyle: ["analytical", "detail-oriented"]
  },
  {
    id: "product-manager",
    title: "Product Manager",
    sector: "business",
    description: "Lead product development.",
    requiredSkills: ["Product Strategy", "User Research", "Roadmapping", "Stakeholder Management", "Data Analysis"],
    interests: ["product", "strategy", "user-needs", "business", "innovation"],
    salaryRange: "₹8L - ₹20L",
    growthPotential: "Very High",
    workStyle: ["leadership", "collaborative"]
  },
  {
    id: "hr-manager",
    title: "HR Manager",
    sector: "business",
    description: "Manage human resources.",
    requiredSkills: ["Recruitment", "Employee Relations", "Training", "HR Policies", "Communication"],
    interests: ["people", "management", "training", "culture", "development"],
    salaryRange: "₹4L - ₹15L",
    growthPotential: "High",
    workStyle: ["collaborative", "communication-oriented"]
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    sector: "business",
    description: "Analyze business processes.",
    requiredSkills: ["Business Analysis", "Requirements", "Process Modeling", "SQL", "Communication"],
    interests: ["business", "process-improvement", "technology", "analysis", "problem-solving"],
    salaryRange: "₹5L - ₹15L",
    growthPotential: "High",
    workStyle: ["analytical", "communication-oriented"]
  },
  // Creative & Design Sector
  {
    id: "ui-designer",
    title: "UI Designer",
    sector: "creative",
    description: "Design visual interfaces.",
    requiredSkills: ["Visual Design", "UI Tools", "Typography", "Color Theory", "Responsive Design"],
    interests: ["design", "visuals", "interfaces", "aesthetics", "user-interface"],
    salaryRange: "₹4L - ₹12L",
    growthPotential: "High",
    workStyle: ["creative", "detail-oriented"]
  },
  {
    id: "fashion-designer",
    title: "Fashion Designer",
    sector: "creative",
    description: "Design clothing and accessories.",
    requiredSkills: ["Fashion Design", "Textiles", "Sketching", "Trend Analysis", "Pattern Making"],
    interests: ["fashion", "design", "creativity", "trends", "art"],
    salaryRange: "₹2L - ₹15L",
    growthPotential: "Variable",
    workStyle: ["creative", "artistic"]
  },
  {
    id: "interior-designer",
    title: "Interior Designer",
    sector: "creative",
    description: "Design interior spaces.",
    requiredSkills: ["Interior Design", "Space Planning", "CAD", "Color Theory", "Materials"],
    interests: ["design", "architecture", "spaces", "aesthetics", "creativity"],
    salaryRange: "₹3L - ₹12L",
    growthPotential: "Medium",
    workStyle: ["creative", "client-oriented"]
  },
  {
    id: "game-designer",
    title: "Game Designer",
    sector: "creative",
    description: "Design video games.",
    requiredSkills: ["Game Design", "Storytelling", "Level Design", "Unity/Unreal", "Prototyping"],
    interests: ["games", "design", "storytelling", "technology", "creativity"],
    salaryRange: "₹4L - ₹15L",
    growthPotential: "High",
    workStyle: ["creative", "technical"]
  }
];

// Detailed occupation-specific questions with scoring
export const occupationQuestions: OccupationQuestion[] = [
  // ============ TECHNOLOGY SECTOR ============
  {
    id: "se-q1",
    question: "What type of problems do you enjoy solving most?",
    options: [
      { id: "se-a", label: "Building new applications from scratch", score: 4 },
      { id: "se-b", label: "Optimizing existing systems for better performance", score: 3 },
      { id: "se-c", label: "Debugging and fixing issues", score: 3 },
      { id: "se-d", label: "Designing system architecture", score: 4 }
    ],
    occupationId: "software-engineer",
    occupationTitle: "Software Engineer"
  },
  {
    id: "se-q2",
    question: "How do you prefer to work on projects?",
    options: [
      { id: "se2-a", label: "Working alone on complex problems", score: 3 },
      { id: "se2-b", label: "Collaborating with a team", score: 4 },
      { id: "se2-c", label: "Leading a team of developers", score: 4 },
      { id: "se2-d", label: "Mentoring junior developers", score: 3 }
    ],
    occupationId: "software-engineer",
    occupationTitle: "Software Engineer"
  },
  {
    id: "se-q3",
    question: "What programming areas interest you most?",
    options: [
      { id: "se3-a", label: "Web development (Frontend/Backend)", score: 4 },
      { id: "se3-b", label: "Mobile app development", score: 4 },
      { id: "se3-c", label: "Systems programming and low-level code", score: 3 },
      { id: "se3-d", label: "Cloud and distributed systems", score: 4 }
    ],
    occupationId: "software-engineer",
    occupationTitle: "Software Engineer"
  },
  {
    id: "ds-q1",
    question: "What excites you most about working with data?",
    options: [
      { id: "ds-a", label: "Finding hidden patterns and insights", score: 4 },
      { id: "ds-b", label: "Building predictive models", score: 4 },
      { id: "ds-c", label: "Visualizing data to tell stories", score: 3 },
      { id: "ds-d", label: "Cleaning and organizing messy data", score: 2 }
    ],
    occupationId: "data-scientist",
    occupationTitle: "Data Scientist"
  },
  {
    id: "ds-q2",
    question: "How do you approach solving a complex data problem?",
    options: [
      { id: "ds2-a", label: "Start with data exploration and visualization", score: 4 },
      { id: "ds2-b", label: "Formulate hypotheses and test statistically", score: 4 },
      { id: "ds2-c", label: "Build machine learning models first", score: 3 },
      { id: "ds2-d", label: "Consult with domain experts", score: 2 }
    ],
    occupationId: "data-scientist",
    occupationTitle: "Data Scientist"
  },
  {
    id: "ds-q3",
    question: "What tools do you prefer for data analysis?",
    options: [
      { id: "ds3-a", label: "Python with Pandas/NumPy", score: 4 },
      { id: "ds3-b", label: "R programming", score: 3 },
      { id: "ds3-c", label: "SQL and databases", score: 3 },
      { id: "ds3-d", label: "BI tools like Tableau/PowerBI", score: 3 }
    ],
    occupationId: "data-scientist",
    occupationTitle: "Data Scientist"
  },
  {
    id: "ai-q1",
    question: "What area of AI interests you most?",
    options: [
      { id: "ai-a", label: "Computer Vision and Image Recognition", score: 4 },
      { id: "ai-b", label: "Natural Language Processing", score: 4 },
      { id: "ai-c", label: "Reinforcement Learning", score: 3 },
      { id: "ai-d", label: "Generative AI and LLMs", score: 4 }
    ],
    occupationId: "ai-ml-engineer",
    occupationTitle: "AI/ML Engineer"
  },
  {
    id: "ai-q2",
    question: "How do you approach building an AI solution?",
    options: [
      { id: "ai2-a", label: "Research state-of-the-art methods", score: 4 },
      { id: "ai2-b", label: "Start simple and iterate", score: 3 },
      { id: "ai2-c", label: "Focus on data quality first", score: 4 },
      { id: "ai2-d", label: "Consider deployment and scalability", score: 3 }
    ],
    occupationId: "ai-ml-engineer",
    occupationTitle: "AI/ML Engineer"
  },
  {
    id: "ai-q3",
    question: "What deep learning frameworks do you prefer?",
    options: [
      { id: "ai3-a", label: "TensorFlow", score: 3 },
      { id: "ai3-b", label: "PyTorch", score: 4 },
      { id: "ai3-c", label: "Keras", score: 3 },
      { id: "ai3-d", label: "JAX", score: 2 }
    ],
    occupationId: "ai-ml-engineer",
    occupationTitle: "AI/ML Engineer"
  },
  {
    id: "ux-q1",
    question: "What aspect of UX interests you most?",
    options: [
      { id: "ux-a", label: "User research and understanding needs", score: 4 },
      { id: "ux-b", label: "Interaction design and prototyping", score: 4 },
      { id: "ux-c", label: "Visual design and aesthetics", score: 3 },
      { id: "ux-d", label: "Usability testing and iteration", score: 4 }
    ],
    occupationId: "ux-designer",
    occupationTitle: "UX Designer"
  },
  {
    id: "ux-q2",
    question: "How do you approach designing for users?",
    options: [
      { id: "ux2-a", label: "Start with user research", score: 4 },
      { id: "ux2-b", label: "Create personas and journey maps", score: 4 },
      { id: "ux2-c", label: "Iterate based on testing", score: 4 },
      { id: "ux2-d", label: "Balance business goals with user needs", score: 4 }
    ],
    occupationId: "ux-designer",
    occupationTitle: "UX Designer"
  },
  {
    id: "ux-q3",
    question: "What design tools do you prefer?",
    options: [
      { id: "ux3-a", label: "Figma", score: 4 },
      { id: "ux3-b", label: "Adobe XD", score: 3 },
      { id: "ux3-c", label: "Sketch", score: 3 },
      { id: "ux3-d", label: "Prototyping tools like InVision", score: 3 }
    ],
    occupationId: "ux-designer",
    occupationTitle: "UX Designer"
  },
  {
    id: "cyber-q1",
    question: "What aspect of security interests you most?",
    options: [
      { id: "cyber-a", label: "Threat detection and monitoring", score: 4 },
      { id: "cyber-b", label: "Penetration testing and vulnerability assessment", score: 4 },
      { id: "cyber-c", label: "Security architecture and design", score: 3 },
      { id: "cyber-d", label: "Incident response and forensics", score: 3 }
    ],
    occupationId: "cybersecurity-analyst",
    occupationTitle: "Cybersecurity Analyst"
  },
  {
    id: "cyber-q2",
    question: "How do you approach securing a system?",
    options: [
      { id: "cyber2-a", label: "Assume breach and minimize impact", score: 4 },
      { id: "cyber2-b", label: "Defense in depth approach", score: 4 },
      { id: "cyber2-c", label: "Regular security audits", score: 3 },
      { id: "cyber2-d", label: "Employee training and awareness", score: 2 }
    ],
    occupationId: "cybersecurity-analyst",
    occupationTitle: "Cybersecurity Analyst"
  },
  {
    id: "cloud-q1",
    question: "What cloud platform do you prefer?",
    options: [
      { id: "cloud-a", label: "AWS (Amazon Web Services)", score: 4 },
      { id: "cloud-b", label: "Microsoft Azure", score: 3 },
      { id: "cloud-c", label: "Google Cloud Platform", score: 3 },
      { id: "cloud-d", label: "Multi-cloud approach", score: 4 }
    ],
    occupationId: "cloud-engineer",
    occupationTitle: "Cloud Engineer"
  },
  {
    id: "cloud-q2",
    question: "What motivates you most in cloud work?",
    options: [
      { id: "cloud2-a", label: "Building scalable architectures", score: 4 },
      { id: "cloud2-b", label: "Automating infrastructure", score: 4 },
      { id: "cloud2-c", label: "Cost optimization", score: 3 },
      { id: "cloud2-d", label: "Disaster recovery planning", score: 2 }
    ],
    occupationId: "cloud-engineer",
    occupationTitle: "Cloud Engineer"
  },
  {
    id: "mobile-q1",
    question: "What type of mobile development interests you?",
    options: [
      { id: "mobile-a", label: "Native iOS (Swift)", score: 3 },
      { id: "mobile-b", label: "Native Android (Kotlin)", score: 3 },
      { id: "mobile-c", label: "Cross-platform (React Native/Flutter)", score: 4 },
      { id: "mobile-d", label: "Mobile games", score: 3 }
    ],
    occupationId: "mobile-developer",
    occupationTitle: "Mobile App Developer"
  },
  // ============ MECHANICAL SECTOR ============
  {
    id: "mech-q1",
    question: "What type of mechanical work interests you most?",
    options: [
      { id: "mech-a", label: "Designing new products and machines", score: 4 },
      { id: "mech-b", label: "Analyzing and improving existing systems", score: 3 },
      { id: "mech-c", label: "Manufacturing and production", score: 3 },
      { id: "mech-d", label: "Research and development", score: 4 }
    ],
    occupationId: "mechanical-engineer",
    occupationTitle: "Mechanical Engineer"
  },
  {
    id: "mech-q2",
    question: "What CAD software do you prefer?",
    options: [
      { id: "mech2-a", label: "SolidWorks", score: 4 },
      { id: "mech2-b", label: "AutoCAD", score: 3 },
      { id: "mech2-c", label: "CATIA", score: 3 },
      { id: "mech2-d", label: "Fusion 360", score: 4 }
    ],
    occupationId: "mechanical-engineer",
    occupationTitle: "Mechanical Engineer"
  },
  {
    id: "mech-q3",
    question: "What industry interests you most?",
    options: [
      { id: "mech3-a", label: "Automotive", score: 4 },
      { id: "mech3-b", label: "Aerospace", score: 4 },
      { id: "mech3-c", label: "Consumer products", score: 3 },
      { id: "mech3-d", label: "Energy and power", score: 3 }
    ],
    occupationId: "mechanical-engineer",
    occupationTitle: "Mechanical Engineer"
  },
  {
    id: "ee-q1",
    question: "What type of electrical systems interest you most?",
    options: [
      { id: "ee-a", label: "Power generation and distribution", score: 4 },
      { id: "ee-b", label: "Electronic circuits and devices", score: 4 },
      { id: "ee-c", label: "Control systems and automation", score: 3 },
      { id: "ee-d", label: "Signal processing and communications", score: 3 }
    ],
    occupationId: "electrical-engineer",
    occupationTitle: "Electrical Engineer"
  },
  {
    id: "robotics-q1",
    question: "What type of robotics interests you most?",
    options: [
      { id: "robot-a", label: "Industrial and manufacturing robots", score: 3 },
      { id: "robot-b", label: "Service and helper robots", score: 3 },
      { id: "robot-c", label: "Autonomous vehicles and drones", score: 4 },
      { id: "robot-d", label: "Medical and surgical robots", score: 4 }
    ],
    occupationId: "robotics-engineer",
    occupationTitle: "Robotics Engineer"
  },
  {
    id: "auto-q1",
    question: "What area of automotive engineering interests you?",
    options: [
      { id: "auto-a", label: "Vehicle design and styling", score: 4 },
      { id: "auto-b", label: "Engine and powertrain", score: 3 },
      { id: "auto-c", label: "Electric and hybrid vehicles", score: 4 },
      { id: "auto-d", label: "Autonomous driving technology", score: 4 }
    ],
    occupationId: "automotive-engineer",
    occupationTitle: "Automotive Engineer"
  },
  // ============ MEDICAL SECTOR ============
  {
    id: "doc-q1",
    question: "What type of medicine interests you most?",
    options: [
      { id: "doc-a", label: "Primary care and family medicine", score: 4 },
      { id: "doc-b", label: "Surgical specialties", score: 4 },
      { id: "doc-c", label: "Internal medicine and subspecialties", score: 4 },
      { id: "doc-d", label: "Emergency and critical care", score: 3 }
    ],
    occupationId: "doctor",
    occupationTitle: "Physician/Doctor"
  },
  {
    id: "doc-q2",
    question: "How do you approach patient care?",
    options: [
      { id: "doc2-a", label: "Holistic approach considering all factors", score: 4 },
      { id: "doc2-b", label: "Evidence-based medicine", score: 4 },
      { id: "doc2-c", label: "Patient education and prevention", score: 4 },
      { id: "doc2-d", label: "Compassionate and empathetic care", score: 4 }
    ],
    occupationId: "doctor",
    occupationTitle: "Physician/Doctor"
  },
  {
    id: "nur-q1",
    question: "What nursing specialty interests you most?",
    options: [
      { id: "nur-a", label: "Emergency and trauma", score: 4 },
      { id: "nur-b", label: "Critical care and ICU", score: 4 },
      { id: "nur-c", label: "Pediatrics", score: 3 },
      { id: "nur-d", label: "Community and public health", score: 3 }
    ],
    occupationId: "nurse",
    occupationTitle: "Registered Nurse"
  },
  {
    id: "pharm-q1",
    question: "What pharmacy setting interests you most?",
    options: [
      { id: "pharm-a", label: "Community/retail pharmacy", score: 4 },
      { id: "pharm-b", label: "Hospital and clinical pharmacy", score: 4 },
      { id: "pharm-c", label: "Pharmaceutical industry", score: 3 },
      { id: "pharm-d", label: "Research and development", score: 3 }
    ],
    occupationId: "pharmacist",
    occupationTitle: "Pharmacist"
  },
  {
    id: "pt-q1",
    question: "What type of physical therapy interests you most?",
    options: [
      { id: "pt-a", label: "Sports rehabilitation", score: 4 },
      { id: "pt-b", label: "Orthopedic and post-surgical", score: 4 },
      { id: "pt-c", label: "Neurological rehabilitation", score: 3 },
      { id: "pt-d", label: "Pediatric therapy", score: 3 }
    ],
    occupationId: "physical-therapist",
    occupationTitle: "Physical Therapist"
  },
  {
    id: "bme-q1",
    question: "What type of biomedical work interests you most?",
    options: [
      { id: "bme-a", label: "Medical devices and implants", score: 4 },
      { id: "bme-b", label: "Diagnostic equipment", score: 3 },
      { id: "bme-c", label: "Tissue engineering and biomaterials", score: 4 },
      { id: "bme-d", label: "Healthcare IT and monitoring", score: 3 }
    ],
    occupationId: "biomedical-engineer",
    occupationTitle: "Biomedical Engineer"
  },
  // ============ ARTS & MEDIA SECTOR ============
  {
    id: "gd-q1",
    question: "What type of design work interests you most?",
    options: [
      { id: "gd-a", label: "Brand identity and logos", score: 4 },
      { id: "gd-b", label: "Print and publication design", score: 3 },
      { id: "gd-c", label: "Digital and web design", score: 4 },
      { id: "gd-d", label: "Packaging and product design", score: 3 }
    ],
    occupationId: "graphic-designer",
    occupationTitle: "Graphic Designer"
  },
  {
    id: "gd-q2",
    question: "What design tools do you prefer?",
    options: [
      { id: "gd2-a", label: "Adobe Photoshop and Illustrator", score: 4 },
      { id: "gd2-b", label: "Figma and Sketch", score: 4 },
      { id: "gd2-c", label: "Canva and similar tools", score: 2 },
      { id: "gd2-d", label: "Hand-drawn and traditional art", score: 3 }
    ],
    occupationId: "graphic-designer",
    occupationTitle: "Graphic Designer"
  },
  {
    id: "photo-q1",
    question: "What type of photography interests you most?",
    options: [
      { id: "photo-a", label: "Portrait and fashion", score: 4 },
      { id: "photo-b", label: "Event and wedding", score: 3 },
      { id: "photo-c", label: "Commercial and product", score: 4 },
      { id: "photo-d", label: "Fine art and conceptual", score: 3 }
    ],
    occupationId: "photographer",
    occupationTitle: "Photographer"
  },
  {
    id: "journal-q1",
    question: "What type of journalism interests you most?",
    options: [
      { id: "journal-a", label: "Breaking news and reporting", score: 4 },
      { id: "journal-b", label: "Investigative journalism", score: 4 },
      { id: "journal-c", label: "Feature and human interest", score: 3 },
      { id: "journal-d", label: "Digital and multimedia", score: 4 }
    ],
    occupationId: "journalist",
    occupationTitle: "Journalist"
  },
  {
    id: "content-q1",
    question: "What type of content creation interests you most?",
    options: [
      { id: "content-a", label: "Video content (YouTube, TikTok)", score: 4 },
      { id: "content-b", label: "Written content (blogs, articles)", score: 3 },
      { id: "content-c", label: "Live streaming and engagement", score: 4 },
      { id: "content-d", label: "Podcast and audio", score: 3 }
    ],
    occupationId: "content-creator",
    occupationTitle: "Content Creator"
  },
  // ============ FILM & ADVERTISEMENT SECTOR ============
  {
    id: "ve-q1",
    question: "What type of video editing interests you most?",
    options: [
      { id: "ve-a", label: "Feature films and cinema", score: 4 },
      { id: "ve-b", label: "Commercials and advertisements", score: 4 },
      { id: "ve-c", label: "Documentaries", score: 3 },
      { id: "ve-d", label: "YouTube and digital content", score: 3 }
    ],
    occupationId: "video-editor",
    occupationTitle: "Video Editor"
  },
  {
    id: "fd-q1",
    question: "What type of filmmaking interests you most?",
    options: [
      { id: "fd-a", label: "Feature films and cinema", score: 4 },
      { id: "fd-b", label: "Documentaries", score: 3 },
      { id: "fd-c", label: "Commercials and music videos", score: 4 },
      { id: "fd-d", label: "TV and streaming series", score: 3 }
    ],
    occupationId: "film-director",
    occupationTitle: "Film Director"
  },
  {
    id: "ac-q1",
    question: "What type of advertising interests you most?",
    options: [
      { id: "ac-a", label: "TV and video commercials", score: 4 },
      { id: "ac-b", label: "Digital and social media", score: 4 },
      { id: "ac-c", label: "Print and outdoor", score: 3 },
      { id: "ac-d", label: "Brand campaigns", score: 4 }
    ],
    occupationId: "advertising-creative",
    occupationTitle: "Advertising Creative"
  },
  {
    id: "anim-q1",
    question: "What type of animation interests you most?",
    options: [
      { id: "anim-a", label: "2D traditional animation", score: 3 },
      { id: "anim-b", label: "3D CGI animation", score: 4 },
      { id: "anim-c", label: "Motion graphics", score: 4 },
      { id: "anim-d", label: "Stop motion", score: 3 }
    ],
    occupationId: "animator",
    occupationTitle: "Animator"
  },
  // ============ AVIATION SECTOR ============
  {
    id: "pil-q1",
    question: "What type of flying interests you most?",
    options: [
      { id: "pil-a", label: "Commercial airline flying", score: 4 },
      { id: "pil-b", label: "Private and charter jets", score: 3 },
      { id: "pil-c", label: "Cargo and freight", score: 3 },
      { id: "pil-d", label: "Helicopter operations", score: 3 }
    ],
    occupationId: "pilot",
    occupationTitle: "Commercial Pilot"
  },
  {
    id: "pil-q2",
    question: "How do you handle in-flight emergencies?",
    options: [
      { id: "pil2-a", label: "Follow established procedures", score: 4 },
      { id: "pil2-b", label: "Stay calm and focused", score: 4 },
      { id: "pil2-c", label: "Communicate clearly with air traffic", score: 4 },
      { id: "pil2-d", label: "Make quick decisions", score: 4 }
    ],
    occupationId: "pilot",
    occupationTitle: "Commercial Pilot"
  },
  {
    id: "atc-q1",
    question: "What type of ATC work interests you most?",
    options: [
      { id: "atc-a", label: "Tower (ground and takeoff/landing)", score: 4 },
      { id: "atc-b", label: "Approach control", score: 4 },
      { id: "atc-c", label: "Center (en-route)", score: 3 },
      { id: "atc-d", label: "Flight service station", score: 2 }
    ],
    occupationId: "air-traffic-controller",
    occupationTitle: "Air Traffic Controller"
  },
  {
    id: "am-q1",
    question: "What type of aircraft maintenance interests you most?",
    options: [
      { id: "am-a", label: "Line maintenance (routine checks)", score: 3 },
      { id: "am-b", label: "Heavy maintenance and inspections", score: 4 },
      { id: "am-c", label: "Avionics and electrical systems", score: 4 },
      { id: "am-d", label: "Engine repair and overhaul", score: 4 }
    ],
    occupationId: "aircraft-mechanic",
    occupationTitle: "Aircraft Mechanic"
  },
  // ============ SCIENCE & RESEARCH SECTOR ============
  {
    id: "rs-q1",
    question: "What field of science interests you most?",
    options: [
      { id: "rs-a", label: "Physics (theoretical or applied)", score: 4 },
      { id: "rs-b", label: "Chemistry (organic, inorganic, physical)", score: 4 },
      { id: "rs-c", label: "Biology (molecular, cellular, ecology)", score: 4 },
      { id: "rs-d", label: "Earth and environmental science", score: 3 }
    ],
    occupationId: "research-scientist",
    occupationTitle: "Research Scientist"
  },
  {
    id: "rs-q2",
    question: "How do you approach research?",
    options: [
      { id: "rs2-a", label: "Hypothesis-driven experimentation", score: 4 },
      { id: "rs2-b", label: "Data analysis and modeling", score: 4 },
      { id: "rs2-c", label: "Literature review and theory", score: 3 },
      { id: "rs2-d", label: "Collaboration with other scientists", score: 3 }
    ],
    occupationId: "research-scientist",
    occupationTitle: "Research Scientist"
  },
  {
    id: "chem-q1",
    question: "What area of chemistry interests you most?",
    options: [
      { id: "chem-a", label: "Organic chemistry (synthesis)", score: 4 },
      { id: "chem-b", label: "Analytical chemistry", score: 4 },
      { id: "chem-c", label: "Physical chemistry", score: 3 },
      { id: "chem-d", label: "Biochemistry", score: 4 }
    ],
    occupationId: "chemist",
    occupationTitle: "Chemist"
  },
  {
    id: "bio-q1",
    question: "What area of biology interests you most?",
    options: [
      { id: "bio-a", label: "Molecular and cell biology", score: 4 },
      { id: "bio-b", label: "Ecology and evolution", score: 3 },
      { id: "bio-c", label: "Genetics and genomics", score: 4 },
      { id: "bio-d", label: "Marine biology", score: 3 }
    ],
    occupationId: "biologist",
    occupationTitle: "Biologist"
  },
  {
    id: "phys-q1",
    question: "What area of physics interests you most?",
    options: [
      { id: "phys-a", label: "Theoretical physics", score: 4 },
      { id: "phys-b", label: "Experimental physics", score: 4 },
      { id: "phys-c", label: "Applied physics (engineering)", score: 4 },
      { id: "phys-d", label: "Astrophysics and cosmology", score: 4 }
    ],
    occupationId: "physicist",
    occupationTitle: "Physicist"
  },
  {
    id: "env-q1",
    question: "What environmental area interests you most?",
    options: [
      { id: "env-a", label: "Climate change and sustainability", score: 4 },
      { id: "env-b", label: "Water quality and resources", score: 3 },
      { id: "env-c", label: "Wildlife and conservation", score: 4 },
      { id: "env-d", label: "Pollution and remediation", score: 3 }
    ],
    occupationId: "environmental-scientist",
    occupationTitle: "Environmental Scientist"
  },
  // ============ BUSINESS & MANAGEMENT SECTOR ============
  {
    id: "mm-q1",
    question: "What marketing area interests you most?",
    options: [
      { id: "mm-a", label: "Digital marketing and SEO", score: 4 },
      { id: "mm-b", label: "Content and social media marketing", score: 4 },
      { id: "mm-c", label: "Brand and creative marketing", score: 4 },
      { id: "mm-d", label: "Performance marketing and analytics", score: 4 }
    ],
    occupationId: "marketing-manager",
    occupationTitle: "Marketing Manager"
  },
  {
    id: "mm-q2",
    question: "How do you measure marketing success?",
    options: [
      { id: "mm2-a", label: "ROI and conversion metrics", score: 4 },
      { id: "mm2-b", label: "Brand awareness and sentiment", score: 3 },
      { id: "mm2-c", label: "Customer engagement and loyalty", score: 4 },
      { id: "mm2-d", label: "Growth and retention metrics", score: 4 }
    ],
    occupationId: "marketing-manager",
    occupationTitle: "Marketing Manager"
  },
  {
    id: "acc-q1",
    question: "What area of accounting interests you most?",
    options: [
      { id: "acc-a", label: "Public accounting (audit, tax)", score: 4 },
      { id: "acc-b", label: "Corporate accounting", score: 3 },
      { id: "acc-c", label: "Management accounting", score: 4 },
      { id: "acc-d", label: "Forensic accounting", score: 3 }
    ],
    occupationId: "accountant",
    occupationTitle: "Accountant"
  },
  {
    id: "fa-q1",
    question: "What type of financial analysis interests you most?",
    options: [
      { id: "fa-a", label: "Equity research", score: 4 },
      { id: "fa-b", label: "Corporate finance", score: 4 },
      { id: "fa-c", label: "Quantitative analysis", score: 3 },
      { id: "fa-d", label: "Risk management", score: 4 }
    ],
    occupationId: "financial-analyst",
    occupationTitle: "Financial Analyst"
  },
  {
    id: "pm-q1",
    question: "What type of product management interests you most?",
    options: [
      { id: "pm-a", label: "Consumer products", score: 4 },
      { id: "pm-b", label: "Enterprise and B2B products", score: 4 },
      { id: "pm-c", label: "Technical products", score: 4 },
      { id: "pm-d", label: "Mobile applications", score: 3 }
    ],
    occupationId: "product-manager",
    occupationTitle: "Product Manager"
  },
  {
    id: "hr-q1",
    question: "What HR area interests you most?",
    options: [
      { id: "hr-a", label: "Recruitment and talent acquisition", score: 4 },
      { id: "hr-b", label: "Employee training and development", score: 4 },
      { id: "hr-c", label: "Employee relations and culture", score: 4 },
      { id: "hr-d", label: "Compensation and benefits", score: 3 }
    ],
    occupationId: "hr-manager",
    occupationTitle: "HR Manager"
  },
  {
    id: "ba-q1",
    question: "What type of business analysis interests you most?",
    options: [
      { id: "ba-a", label: "Requirements gathering and analysis", score: 4 },
      { id: "ba-b", label: "Process improvement and optimization", score: 4 },
      { id: "ba-c", label: "Data analysis and reporting", score: 4 },
      { id: "ba-d", label: "System implementation", score: 3 }
    ],
    occupationId: "business-analyst",
    occupationTitle: "Business Analyst"
  },
  // ============ LOGISTICS & SUPPLY CHAIN SECTOR ============
  {
    id: "lm-q1",
    question: "What aspect of logistics interests you most?",
    options: [
      { id: "lm-a", label: "Transportation and distribution", score: 4 },
      { id: "lm-b", label: "Warehouse and inventory management", score: 3 },
      { id: "lm-c", label: "Supply chain optimization", score: 4 },
      { id: "lm-d", label: "Procurement and sourcing", score: 3 }
    ],
    occupationId: "logistics-manager",
    occupationTitle: "Logistics Manager"
  },
  {
    id: "sca-q1",
    question: "What supply chain area interests you most?",
    options: [
      { id: "sca-a", label: "Demand forecasting", score: 4 },
      { id: "sca-b", label: "Inventory optimization", score: 4 },
      { id: "sca-c", label: "Supplier analysis", score: 3 },
      { id: "sca-d", label: "Transportation planning", score: 3 }
    ],
    occupationId: "supply-chain-analyst",
    occupationTitle: "Supply Chain Analyst"
  },
  {
    id: "wm-q1",
    question: "What warehouse operations interest you most?",
    options: [
      { id: "wm-a", label: "Inventory control and accuracy", score: 4 },
      { id: "wm-b", label: "Order fulfillment and picking", score: 3 },
      { id: "wm-c", label: "Receiving and shipping", score: 3 },
      { id: "wm-d", label: "Technology and automation", score: 4 }
    ],
    occupationId: "warehouse-manager",
    occupationTitle: "Warehouse Manager"
  },
  // ============ SPACE & DEFENSE SECTOR ============
  {
    id: "sse-q1",
    question: "What space-related work interests you most?",
    options: [
      { id: "sse-a", label: "Satellite design and operations", score: 4 },
      { id: "sse-b", label: "Spacecraft mission planning", score: 4 },
      { id: "sse-c", label: "Launch vehicle systems", score: 3 },
      { id: "sse-d", label: "Space exploration and research", score: 4 }
    ],
    occupationId: "space-systems-engineer",
    occupationTitle: "Space Systems Engineer"
  },
  {
    id: "def-q1",
    question: "What defense area interests you most?",
    options: [
      { id: "def-a", label: "Strategic analysis and planning", score: 4 },
      { id: "def-b", label: "Intelligence analysis", score: 4 },
      { id: "def-c", label: "Defense technology development", score: 4 },
      { id: "def-d", label: "Policy and international relations", score: 3 }
    ],
    occupationId: "defense-analyst",
    occupationTitle: "Defense Analyst"
  },
  // ============ MANUFACTURING SECTOR ============
  {
    id: "mfe-q1",
    question: "What aspect of manufacturing interests you most?",
    options: [
      { id: "mfe-a", label: "Process design and optimization", score: 4 },
      { id: "mfe-b", label: "Quality control and assurance", score: 3 },
      { id: "mfe-c", label: "Automation and robotics", score: 4 },
      { id: "mfe-d", label: "Supply chain and logistics", score: 3 }
    ],
    occupationId: "manufacturing-engineer",
    occupationTitle: "Manufacturing Engineer"
  },
  {
    id: "qe-q1",
    question: "What quality area interests you most?",
    options: [
      { id: "qe-a", label: "Quality assurance and testing", score: 4 },
      { id: "qe-b", label: "Process improvement (Six Sigma)", score: 4 },
      { id: "qe-c", label: "Compliance and auditing", score: 3 },
      { id: "qe-d", label: "Root cause analysis", score: 4 }
    ],
    occupationId: "quality-engineer",
    occupationTitle: "Quality Engineer"
  },
  // ============ CREATIVE & DESIGN SECTOR ============
  {
    id: "ui-q1",
    question: "What UI design work interests you most?",
    options: [
      { id: "ui-a", label: "Mobile app interfaces", score: 4 },
      { id: "ui-b", label: "Web applications", score: 4 },
      { id: "ui-c", label: "Dashboard and data visualization", score: 3 },
      { id: "ui-d", label: "Design systems and components", score: 4 }
    ],
    occupationId: "ui-designer",
    occupationTitle: "UI Designer"
  },
  {
    id: "fashion-q1",
    question: "What fashion area interests you most?",
    options: [
      { id: "fashion-a", label: "Apparel design", score: 4 },
      { id: "fashion-b", label: "Accessory design", score: 3 },
      { id: "fashion-c", label: "Textile design", score: 3 },
      { id: "fashion-d", label: "Fashion merchandising", score: 3 }
    ],
    occupationId: "fashion-designer",
    occupationTitle: "Fashion Designer"
  },
  {
    id: "interior-q1",
    question: "What interior design area interests you most?",
    options: [
      { id: "interior-a", label: "Residential design", score: 4 },
      { id: "interior-b", label: "Commercial and office spaces", score: 3 },
      { id: "interior-c", label: "Hospitality design", score: 3 },
      { id: "interior-d", label: "Sustainable and green design", score: 4 }
    ],
    occupationId: "interior-designer",
    occupationTitle: "Interior Designer"
  },
  {
    id: "game-q1",
    question: "What game design area interests you most?",
    options: [
      { id: "game-a", label: "Game mechanics and systems design", score: 4 },
      { id: "game-b", label: "Level design", score: 4 },
      { id: "game-c", label: "Narrative and story design", score: 3 },
      { id: "game-d", label: "Game art and visual design", score: 3 }
    ],
    occupationId: "game-designer",
    occupationTitle: "Game Designer"
  }
];

// Get questions for a specific sector
export function getQuestionsForSector(sectorId: string): OccupationQuestion[] {
  const sectorOccupations = occupations.filter(occ => occ.sector === sectorId);
  const occIds = sectorOccupations.map(occ => occ.id);
  return occupationQuestions.filter(q => occIds.includes(q.occupationId));
}

// Calculate occupation matches based on user answers
export interface MatchedOccupation extends Occupation {
  match: number;
  matchedSkills?: string[];
}

export function calculateMatches(answers: any[], sectorId: string): MatchedOccupation[] {
  const sectorOccupations = occupations.filter(occ => occ.sector === sectorId);
  
  // Score each occupation
  const scored: MatchedOccupation[] = sectorOccupations.map(occ => {
    let score = 0;
    let maxScore = 0;
    
    answers.forEach(answer => {
      const selectedOption = answer.selectedOption;
      if (selectedOption?.score) {
        // Check if this answer is relevant to this occupation
        const question = occupationQuestions.find(q => q.id === answer.questionId);
        if (question?.occupationId === occ.id) {
          score += selectedOption.score;
        }
        maxScore += 4;
      }
    });
    
    const match = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
    return { ...occ, match };
  });
  
  // Sort by match score
  return scored.sort((a, b) => b.match - a.match);
}

// Get recommended skills based on matched occupations
export function getRecommendedSkills(matchedOccupations: MatchedOccupation[]): string[] {
  const skillCounts: Record<string, number> = {};
  
  matchedOccupations.slice(0, 5).forEach(occ => {
    occ.requiredSkills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  
  return Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill]) => skill);
}

// Get recommended resources based on sector
export function getResourcesForSector(sectorId: string): string[] {
  const resourceMap: Record<string, string[]> = {
    "tech": ["Online Programming Courses", "GitHub Projects", "Tech Blogs", "Coding Practice Platforms"],
    "medical": ["Medical Journals", "Healthcare Conferences", "Clinical Research", "Medical Education"],
    "arts-media": ["Design Portfolios", "Art Communities", "Media Production Courses", "Creative Workshops"],
    "business": ["Business Case Studies", "Management Courses", "Industry Reports", "Networking Events"],
    "science": ["Scientific Journals", "Research Papers", "Laboratory Training", "Science Conferences"],
    "mechanical": ["CAD Software Training", "Engineering Forums", "Mechanical Design Courses", "Industry Standards"],
    "aviation": ["Flight Training", "Aviation Safety Courses", "Pilot Certifications", "Aviation News"],
    "manufacturing": ["Lean Manufacturing Training", "Quality Management Courses", "Process Improvement", "Industrial Safety"],
    "logistics-supply": ["Supply Chain Courses", "Logistics Management", "Warehouse Operations", "Freight Forwarding"],
    "space-tech": ["Aerospace Engineering", "Space Technology Courses", "NASA Resources", "Defense Industry News"],
    "film-advertisement": ["Film Production", "Video Editing Courses", "Advertising Campaigns", "Media Analytics"],
    "creative": ["Design Tools Training", "Creative Portfolios", "Art Exhibitions", "Design Trends"]
  };
  
  return resourceMap[sectorId] || ["General Career Development", "Industry News", "Professional Networking"];
}
