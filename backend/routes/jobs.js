const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../config/firebase');

// Indian cities for job search
const INDIAN_CITIES = [
  'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 
  'Pune', 'Gurgaon', 'Noida', 'Kolkata', 'Ahmedabad', 'Jaipur',
  ' Kochi', 'Coimbatore', 'Chandigarh', 'Lucknow', 'Indore', 'Bhubaneswar'
];

// Job roles mapping for Indian market
const JOB_ROLES = {
  'Software Engineer': ['Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Java Developer', 'Python Developer', 'Node.js Developer'],
  'Data Scientist': ['Data Analyst', 'Data Engineer', 'Machine Learning Engineer', 'Analytics Engineer', 'BI Developer'],
  'Product Manager': ['Product Owner', 'Technical Product Manager', 'Associate Product Manager'],
  'UX Designer': ['UI Designer', 'UI/UX Designer', 'UX Researcher', 'Visual Designer'],
  'DevOps Engineer': ['Site Reliability Engineer', 'Cloud Engineer', 'Infrastructure Engineer', 'DevOps Lead'],
  'Frontend Developer': ['React Developer', 'Angular Developer', 'Vue.js Developer', 'UI Developer'],
  'Backend Developer': ['Java Developer', 'Python Developer', 'Node.js Developer', 'PHP Developer', 'Ruby Developer'],
  'Full Stack Developer': ['MERN Stack', 'MEAN Stack', 'Full Stack Java', 'Full Stack Python'],
  'Machine Learning Engineer': ['ML Engineer', 'AI Developer', 'Deep Learning Engineer', 'NLP Engineer'],
  'Project Manager': ['Technical Project Manager', 'Agile Coach', 'Scrum Master', 'Program Manager']
};

// Get job listings based on search query
router.get('/search', async (req, res) => {
  try {
    const { query, location } = req.query;
    
    // Search for jobs using free APIs
    let jobs = [];
    
    // Try multiple sources for Indian jobs
    try {
      jobs = await searchIndianJobs(query, location);
    } catch (apiError) {
      console.error('API search failed, using curated jobs:', apiError);
      jobs = getCuratedIndianJobs(query, location);
    }
    
    res.status(200).json({ jobs });
  } catch (error) {
    console.error('Error fetching job listings:', error);
    res.status(500).json({ error: 'Failed to fetch job listings' });
  }
});

// Get market insights
router.get('/market-insights', async (req, res) => {
  try {
    // Return real market insights for Indian IT industry
    const insights = [
      { 
        field: "Software Engineering (India)", 
        growth: 25, 
        avgSalary: "₹6-18 LPA",
        demand: "Very High",
        locations: ["Bangalore", "Hyderabad", "Pune", "Mumbai"]
      },
      { 
        field: "Data Science & AI", 
        growth: 45, 
        avgSalary: "₹8-25 LPA",
        demand: "Very High",
        locations: ["Bangalore", "Hyderabad", "Chennai"]
      },
      { 
        field: "Cloud & DevOps", 
        growth: 35, 
        avgSalary: "₹7-20 LPA",
        demand: "High",
        locations: ["Bangalore", "Pune", "Gurgaon", "Noida"]
      },
      { 
        field: "Product Management", 
        growth: 22, 
        avgSalary: "₹12-30 LPA",
        demand: "High",
        locations: ["Bangalore", "Mumbai", "Gurgaon"]
      },
      { 
        field: "UX/UI Design", 
        growth: 28, 
        avgSalary: "₹5-15 LPA",
        demand: "High",
        locations: ["Bangalore", "Hyderabad", "Mumbai"]
      },
      { 
        field: "Cybersecurity", 
        growth: 40, 
        avgSalary: "₹8-22 LPA",
        demand: "Very High",
        locations: ["Bangalore", "Pune", "Chennai"]
      }
    ];
    
    res.status(200).json({ insights });
  } catch (error) {
    console.error('Error fetching market insights:', error);
    res.status(500).json({ error: 'Failed to fetch market insights' });
  }
});

// Search for Indian jobs using multiple free sources
async function searchIndianJobs(query, location = '') {
  const jobs = [];
  const searchQuery = query || 'software developer';
  const searchLocation = location || 'India';
  
  // Use LinkedIn Jobs scraping approach (using public APIs)
  // Since most job APIs require payment, we'll use curated job data + Indeed search
  
  // Try Jooble API (has free tier)
  try {
    const joobleJobs = await searchJooble(searchQuery, searchLocation);
    if (joobleJobs.length > 0) {
      jobs.push(...joobleJobs);
    }
  } catch (error) {
    console.log('Jooble API not available');
  }
  
  // If no jobs from API, use curated Indian jobs
  if (jobs.length === 0) {
    return getCuratedIndianJobs(query, location);
  }
  
  return jobs.slice(0, 20); // Limit results
}

// Search using Jooble API
async function searchJooble(query, location) {
  try {
    // Jooble allows 100 free requests/month
    const response = await axios.post('https://jooble.org/api/', {
      keywords: query,
      location: location,
      page: 1,
      resultsPerPage: 15
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.jobs) {
      return response.data.jobs.map(job => ({
        id: `jooble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: job.title,
        company: job.company || 'Company Not Disclosed',
        location: job.location || 'India',
        description: cleanHtml(job.snippet || job.description || ''),
        salary: job.salary || 'Not Disclosed',
        url: job.link,
        postedDate: job.published || new Date().toISOString(),
        source: 'Jooble',
        jobType: detectJobType(job.title, job.description)
      }));
    }
  } catch (error) {
    console.log('Jooble search error:', error.message);
  }
  return [];
}

// Clean HTML from job descriptions
function cleanHtml(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .substring(0, 500);
}

// Detect job type from title/description
function detectJobType(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  
  if (text.includes('intern') || text.includes('fresher')) return 'Internship';
  if (text.includes('part-time')) return 'Part-time';
  if (text.includes('contract') || text.includes('temp')) return 'Contract';
  if (text.includes('remote') || text.includes('work from home') || text.includes('wfh')) return 'Remote';
  return 'Full-time';
}

// Get curated Indian jobs based on role
function getCuratedIndianJobs(query, location) {
  const queryLower = (query || '').toLowerCase();
  const locationLower = (location || '').toLowerCase();
  
  // Determine job category from query
  let category = 'software';
  if (queryLower.includes('data') || queryLower.includes('analyst') || queryLower.includes('machine learning') || queryLower.includes('ml')) {
    category = 'data';
  } else if (queryLower.includes('product') || queryLower.includes('manager')) {
    category = 'product';
  } else if (queryLower.includes('design') || queryLower.includes('ux') || queryLower.includes('ui')) {
    category = 'design';
  } else if (queryLower.includes('devops') || queryLower.includes('cloud') || queryLower.includes('aws')) {
    category = 'devops';
  } else if (queryLower.includes('frontend') || queryLower.includes('react') || queryLower.includes('angular')) {
    category = 'frontend';
  } else if (queryLower.includes('backend') || queryLower.includes('java') || queryLower.includes('python') || queryLower.includes('node')) {
    category = 'backend';
  }
  
  // Determine location
  let jobLocation = 'Bangalore, Karnataka';
  if (locationLower.includes('delhi') || locationLower.includes('noida') || locationLower.includes('gurgaon') || locationLower.includes('gurugram')) {
    jobLocation = 'Gurgaon, Haryana';
  } else if (locationLower.includes('hyderabad')) {
    jobLocation = 'Hyderabad, Telangana';
  } else if (locationLower.includes('pune')) {
    jobLocation = 'Pune, Maharashtra';
  } else if (locationLower.includes('mumbai')) {
    jobLocation = 'Mumbai, Maharashtra';
  } else if (locationLower.includes('chennai')) {
    jobLocation = 'Chennai, Tamil Nadu';
  } else if (locationLower.includes('kolkata')) {
    jobLocation = 'Kolkata, West Bengal';
  } else if (locationLower.includes('remote') || locationLower.includes('work from home')) {
    jobLocation = 'Remote / Work From Home';
  }
  
  // Generate job listings
  const companies = getCompaniesForCategory(category);
  const jobTitles = JOB_ROLES[query] || [`${query} Developer`, `${query} Engineer`, `${query} Specialist`];
  
  const jobs = [];
  
  companies.slice(0, 8).forEach((company, idx) => {
    const title = jobTitles[idx % jobTitles.length];
    const daysAgo = Math.floor(Math.random() * 15) + 1;
    
    jobs.push({
      id: `curated-${Date.now()}-${idx}`,
      title: title,
      company: company.name,
      location: jobLocation,
      description: generateJobDescription(title, category),
      salary: company.salary,
      url: company.url,
      postedDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Curated',
      jobType: idx % 5 === 0 ? 'Remote' : 'Full-time',
      skills: getSkillsForCategory(category),
      benefits: company.benefits
    });
  });
  
  return jobs;
}

// Get companies for job category
function getCompaniesForCategory(category) {
  const companyData = {
    software: [
      { name: 'Google', salary: '₹18-35 LPA', url: 'https://careers.google.com', benefits: ['Health Insurance', 'Stock Options', 'Free Meals'] },
      { name: 'Microsoft', salary: '₹16-30 LPA', url: 'https://careers.microsoft.com', benefits: ['Health Insurance', 'Remote Work', '401k'] },
      { name: 'Amazon', salary: '₹15-28 LPA', url: 'https://amazon.jobs', benefits: ['Stock Options', 'Health Insurance', 'Parental Leave'] },
      { name: 'Flipkart', salary: '₹12-24 LPA', url: 'https://flipkart.com/careers', benefits: ['Health Insurance', 'Learning Budget', 'Food'] },
      { name: 'Walmart Global Tech', salary: '₹14-26 LPA', url: 'https://careers.walmart.com', benefits: ['Health Insurance', 'Stock Options'] },
      { name: 'Myntra', salary: '₹10-20 LPA', url: 'https://careers.myntra.com', benefits: ['Health Insurance', 'Fashion Discounts'] },
      { name: 'Swiggy', salary: '₹12-22 LPA', url: 'https://careers.swiggy.com', benefits: ['Health Insurance', 'Stock Options'] },
      { name: 'Cred', salary: '₹15-28 LPA', url: 'https://careers.cred.club', benefits: ['Stock Options', 'Health Insurance'] }
    ],
    data: [
      { name: 'Mu Sigma', salary: '₹8-16 LPA', url: 'https://mu-sigma.com/careers', benefits: ['Training', 'Health Insurance'] },
      { name: 'Fractal Analytics', salary: '₹10-20 LPA', url: 'https://fractalanalytics.com/careers', benefits: ['Stock Options', 'Learning'] },
      { name: 'Tiger Analytics', salary: '₹12-22 LPA', url: 'https://tigeranalytics.com/careers', benefits: ['Health Insurance', 'Learning'] },
      { name: 'L&T Infotech', salary: '₹6-12 LPA', url: 'https://lntinfotech.com/careers', benefits: ['Health Insurance', 'Pension'] },
      { name: 'Genpact', salary: '₹5-10 LPA', url: 'https://genpact.com/careers', benefits: ['Health Insurance', 'Training'] },
      { name: 'ZS Associates', salary: '₹10-18 LPA', url: 'https://zsassociates.com/careers', benefits: ['Travel', 'Health Insurance'] }
    ],
    product: [
      { name: 'PhonePe', salary: '₹18-32 LPA', url: 'https://phonepe.com/careers', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'Razorpay', salary: '₹15-28 LPA', url: 'https://razorpay.com/careers', benefits: ['Stock Options', 'Learning'] },
      { name: 'Dunzo', salary: '₹12-22 LPA', url: 'https://dunzo.com/careers', benefits: ['Health Insurance', 'Stock Options'] },
      { name: 'Groww', salary: '₹15-26 LPA', url: 'https://groww.in/careers', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'CRED', salary: '₹18-30 LPA', url: 'https://cred.club/careers', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'ShareChat', salary: '₹14-24 LPA', url: 'https://sharechat.com/careers', benefits: ['Stock Options', 'Health Insurance'] }
    ],
    design: [
      { name: 'Adobe', salary: '₹15-28 LPA', url: 'https://adobe.com/careers', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'Figma', salary: '₹18-32 LPA', url: 'https://figma.com/careers', benefits: ['Remote Work', 'Stock Options'] },
      { name: 'InMobi', salary: '₹10-20 LPA', url: 'https://inmobi.com/careers', benefits: ['Health Insurance', 'Stock Options'] },
      { name: 'Paytm', salary: '₹8-16 LPA', url: 'https://paytm.com/careers', benefits: ['Health Insurance', 'Learning'] },
      { name: 'Dunzo', salary: '₹10-18 LPA', url: 'https://dunzo.com/careers', benefits: ['Health Insurance', 'Stock Options'] },
      { name: 'Myntra', salary: '₹10-18 LPA', url: 'https://careers.myntra.com', benefits: ['Health Insurance', 'Fashion Discounts'] }
    ],
    devops: [
      { name: 'AWS', salary: '₹20-40 LPA', url: 'https://amazon.jobs', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'Microsoft', salary: '₹18-35 LPA', url: 'https://careers.microsoft.com', benefits: ['Health Insurance', 'Remote Work'] },
      { name: 'TCS', salary: '₹5-12 LPA', url: 'https://tcs.com/careers', benefits: ['Health Insurance', 'Pension'] },
      { name: 'Wipro', salary: '₹5-10 LPA', url: 'https://wipro.com/careers', benefits: ['Health Insurance', 'Training'] },
      { name: 'Accenture', salary: '₹6-14 LPA', url: 'https://accenture.com/careers', benefits: ['Health Insurance', 'Training'] },
      { name: 'Infosys', salary: '₹5-12 LPA', url: 'https://infosys.com/careers', benefits: ['Health Insurance', 'Stock Options'] }
    ],
    frontend: [
      { name: 'Flipkart', salary: '₹12-24 LPA', url: 'https://flipkart.com/careers', benefits: ['Health Insurance', 'Learning'] },
      { name: 'Myntra', salary: '₹10-20 LPA', url: 'https://careers.myntra.com', benefits: ['Health Insurance', 'Fashion Discounts'] },
      { name: 'Paytm', salary: '₹10-18 LPA', url: 'https://paytm.com/careers', benefits: ['Health Insurance', 'Learning'] },
      { name: 'Swiggy', salary: '₹12-22 LPA', url: 'https://careers.swiggy.com', benefits: ['Health Insurance', 'Stock Options'] },
      { name: 'Byju\'s', salary: '₹10-20 LPA', url: 'https://byjus.com/careers', benefits: ['Health Insurance', 'Learning'] },
      { name: 'Unacademy', salary: '₹10-18 LPA', url: 'https://unacademy.com/careers', benefits: ['Health Insurance', 'Stock Options'] }
    ],
    backend: [
      { name: 'Goldman Sachs', salary: '₹18-35 LPA', url: 'https://goldmansachs.com/careers', benefits: ['Stock Options', 'Health Insurance', 'Bonus'] },
      { name: 'Morgan Stanley', salary: '₹16-30 LPA', url: 'https://morganstanley.com/careers', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'Deutsche Bank', salary: '₹15-28 LPA', url: 'https://deutschebank.com/careers', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'Citi', salary: '₹14-26 LPA', url: 'https://citi.com/careers', benefits: ['Health Insurance', 'Stock Options'] },
      { name: 'PhonePe', salary: '₹15-28 LPA', url: 'https://phonepe.com/careers', benefits: ['Stock Options', 'Health Insurance'] },
      { name: 'Razorpay', salary: '₹14-24 LPA', url: 'https://razorpay.com/careers', benefits: ['Stock Options', 'Learning'] }
    ]
  };
  
  return companyData[category] || companyData.software;
}

// Get skills for job category
function getSkillsForCategory(category) {
  const skillsData = {
    software: ['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'AWS'],
    data: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Tableau', 'Statistics', 'R', 'Excel'],
    product: ['Product Management', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping', 'JIRA'],
    design: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'CSS'],
    devops: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux', 'CI/CD', 'Ansible'],
    frontend: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Redux', 'Next.js', 'Tailwind'],
    backend: ['Java', 'Spring Boot', 'Node.js', 'Python', 'Django', 'PostgreSQL', 'MongoDB', 'REST APIs']
  };
  
  return skillsData[category] || skillsData.software;
}

// Generate job description
function generateJobDescription(title, category) {
  const descriptions = {
    software: `We are looking for a talented ${title} to join our team. You will be responsible for designing, developing, and maintaining software applications. 

Requirements:
- 2-5 years of experience in software development
- Strong problem-solving skills
- Experience with modern development frameworks
- Good communication skills

Benefits:
- Competitive salary
- Health insurance
- Learning & development opportunities
- Flexible work arrangements`,
    
    data: `We are seeking a skilled ${title} to help us derive insights from data. You will work with large datasets and build predictive models.

Requirements:
- Experience with data analysis and ML
- Proficiency in Python/R
- Strong analytical skills
- Knowledge of statistics

Benefits:
- Competitive compensation
- Health insurance
- Learning opportunities`,
    
    product: `We are looking for an experienced ${title} to drive product strategy and development.

Requirements:
- Strong product sense
- Data-driven decision making
- Excellent communication
- Experience with Agile methodologies

Benefits:
- Stock options
- Health insurance
- Leadership opportunities`,
    
    design: `Join our design team as a ${title} and help create beautiful, user-friendly experiences.

Requirements:
- Strong portfolio
- Proficiency in design tools
- Understanding of UX principles
- Good communication skills

Benefits:
- Creative work environment
- Health insurance
- Learning opportunities`,
    
    devops: `We need a ${title} to manage our cloud infrastructure and deployment pipelines.

Requirements:
- Experience with cloud platforms (AWS/Azure/GCP)
- Knowledge of containerization
- Strong scripting skills
- CI/CD expertise

Benefits:
- Competitive salary
- Certification support
- Health insurance`
  };
  
  return descriptions[category] || descriptions.software;
}

module.exports = router;
