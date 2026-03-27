import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MapPin, DollarSign, Calendar, Search, Filter, Sparkles, TrendingUp, Users, Star, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  url: string;
  postedDate: string;
  jobType?: string;
  skills?: string[];
}

interface JobMarketInsight {
  field: string;
  growth: number;
  avgSalary: string;
}

// Interface for matched occupation from Firestore
interface MatchedOccupation {
  occupationId: string;
  title: string;
  matchScore: number;
}

export function JobPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [matchedOccupations, setMatchedOccupations] = useState<MatchedOccupation[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [marketInsights, setMarketInsights] = useState<JobMarketInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-search when debounced query or location changes
  useEffect(() => {
    if (debouncedSearch || selectedCity !== "all" || location) {
      searchJobs();
    }
  }, [debouncedSearch, selectedCity, location]);

  // Popular cities for job search
  const popularCities = [
    { value: "all", label: "All Locations" },
    { value: "remote", label: "Remote" },
    { value: "Bangalore", label: "Bangalore" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Chennai", label: "Chennai" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Delhi", label: "Delhi" },
    { value: "Pune", label: "Pune" },
    { value: "Kolkata", label: "Kolkata" },
    { value: "Ahmedabad", label: "Ahmedabad" },
  ];

  // Job sector categories for sector-specific job loading
  const jobSectors = {
    tech: ['Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer'],
    data: ['Data Analyst', 'Data Engineer', 'Business Analyst', 'BI Developer', 'Analytics Manager'],
    design: ['UI Designer', 'UX Designer', 'Product Designer', 'Graphic Designer', 'Visual Designer'],
    marketing: ['Digital Marketing', 'SEO Specialist', 'Content Marketing', 'Social Media Manager', 'Brand Manager'],
    finance: ['Financial Analyst', 'Investment Banking', 'Accountant', 'Financial Controller', 'Risk Analyst'],
    healthcare: ['Healthcare Manager', 'Medical Technologist', 'Hospital Administrator', 'Clinical Research', 'Healthcare IT'],
    education: ['Teacher', 'Education Coordinator', 'Instructional Designer', 'Training Manager', 'Academic Advisor'],
    engineering: ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Process Engineer', 'Quality Engineer']
  };

  // Fetch matched occupations from Firestore
  useEffect(() => {
    if (!currentUser?.uid) return;

    const aiAssessmentRef = doc(db, 'users', currentUser.uid, 'aiAssessment', 'results');
    const unsubscribe = onSnapshot(aiAssessmentRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.matchedOccupations && Array.isArray(data.matchedOccupations)) {
          setMatchedOccupations(data.matchedOccupations);
          // Fetch recommended jobs based on matched occupations
          fetchRecommendedJobs(data.matchedOccupations);
        }
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // Fetch recommended jobs based on matched occupations
  const fetchRecommendedJobs = async (occupations: MatchedOccupation[]) => {
    if (occupations.length === 0) return;
    
    setRecommendedLoading(true);
    try {
      // Build search query from occupation titles
      const occupationTitles = occupations.map(o => o.title).slice(0, 3); // Take top 3
      const query = occupationTitles.join(' OR ');
      
      const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(query)}&location=`);
      const data = await response.json();
      
      if (response.ok && data.jobs) {
        setRecommendedJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
    } finally {
      setRecommendedLoading(false);
    }
  };

  // Fetch job market insights from API
  useEffect(() => {
    const fetchMarketInsights = async () => {
      setInsightsLoading(true);
      try {
        const response = await fetch('/api/jobs/market-insights');
        if (response.ok) {
          const data = await response.json();
          setMarketInsights(data.insights || getDefaultInsights());
        } else {
          setMarketInsights(getDefaultInsights());
        }
      } catch (error) {
        console.error('Error fetching market insights:', error);
        setMarketInsights(getDefaultInsights());
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchMarketInsights();
  }, []);

  // Default market insights fallback
  const getDefaultInsights = (): JobMarketInsight[] => [
    { field: "Software Engineering", growth: 22, avgSalary: "$85,000 - $140,000" },
    { field: "Data Science", growth: 35, avgSalary: "$95,000 - $150,000" },
    { field: "Cloud Computing", growth: 28, avgSalary: "$90,000 - $145,000" },
    { field: "AI/Machine Learning", growth: 40, avgSalary: "$100,000 - $165,000" },
    { field: "Cybersecurity", growth: 31, avgSalary: "$85,000 - $135,000" },
    { field: "Product Management", growth: 20, avgSalary: "$90,000 - $150,000" }
  ];

  const searchJobs = async () => {
    setLoading(true);
    try {
      // Use selected city or custom location
      const searchLocation = selectedCity === "all" ? location : (selectedCity === "remote" ? "remote" : selectedCity);
      
      const params = new URLSearchParams();
      if (searchQuery || debouncedSearch) params.append('query', searchQuery || debouncedSearch);
      if (searchLocation) params.append('location', searchLocation);

      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        toast({
          title: "Jobs Found",
          description: `Found ${data.jobs.length} jobs matching your search.`,
        });
      } else {
        // If no jobs from API, try a fresh search without location to get fallback jobs
        const fallbackResponse = await fetch('/api/jobs/search?query=software');
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackResponse.ok && fallbackData.jobs) {
          setJobs(fallbackData.jobs);
          toast({
            title: "Showing Available Jobs",
            description: `Showing ${fallbackData.jobs.length} jobs (some may not match your exact location).`,
          });
        } else {
          throw new Error('No jobs found');
        }
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      toast({
        title: "Jobs Unavailable",
        description: "Unable to fetch jobs at the moment. Please try again later.",
        variant: "destructive",
      });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Also search on initial load with empty query to get default jobs
  useEffect(() => {
    const fetchInitialJobs = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/jobs/search?query=&location=');
        const data = await response.json();
        if (response.ok && data.jobs) {
          setJobs(data.jobs);
        }
      } catch (error) {
        console.log('Using empty job list - API not available');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialJobs();
  }, []);

  // Handle tab change for sector-based job search
  useEffect(() => {
    // This effect will be triggered when tabs change - handled via onValueChange
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filterJobsByCategory = (category: string, jobsToFilter: Job[]) => {
    if (category === "all") return jobsToFilter;
    
    // For sector-specific tabs, fetch fresh jobs from API instead of filtering
    if (['tech', 'data', 'design', 'marketing', 'finance', 'healthcare', 'education', 'engineering'].includes(category)) {
      // Return empty array to trigger fresh search for sector
      return [];
    }
    
    if (category === "remote") return jobsToFilter.filter(job => 
      job.location.toLowerCase().includes("remote") || 
      job.location.toLowerCase().includes("work from home")
    );
    return jobsToFilter;
  };

  // Handle sector-based job search
  const handleSectorSearch = async (sector: string) => {
    setLoading(true);
    try {
      const searchRoles = jobSectors[sector as keyof typeof jobSectors] || ['Developer'];
      const query = searchRoles.slice(0, 2).join(' OR ');
      
      const response = await fetch(`/api/jobs/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok && data.jobs) {
        setJobs(data.jobs);
        toast({
          title: `${sector.charAt(0).toUpperCase() + sector.slice(1)} Jobs`,
          description: `Found ${data.jobs.length} jobs in ${sector} sector.`,
        });
      }
    } catch (error) {
      console.error('Error fetching sector jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
            <Briefcase className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            Job Portal
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Find job opportunities that match your skills and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title, company, or keywords"
                  className="pl-8 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchJobs()}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="w-full md:w-48 relative">
              {showLocationInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Enter city or location"
                    className="flex-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchJobs()}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => { setShowLocationInput(false); setLocation(""); setSelectedCity("all"); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  value={selectedCity}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setShowLocationInput(true);
                    } else {
                      setSelectedCity(e.target.value);
                    }
                  }}
                >
                  {popularCities.map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                  <option value="custom">+ Custom Location</option>
                </select>
              )}
            </div>
            <Button onClick={searchJobs} disabled={loading} className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {/* Active Filters Display */}
          {(selectedCity !== "all" || location || searchQuery) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {selectedCity !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {selectedCity === "remote" ? "Remote" : selectedCity}
                  <button onClick={() => setSelectedCity("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {location}
                  <button onClick={() => { setLocation(""); setSelectedCity("all"); }}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}

          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
            if (['tech', 'data', 'design', 'finance', 'marketing', 'healthcare', 'education', 'engineering'].includes(value)) {
              handleSectorSearch(value);
            }
          }}>
            <TabsList className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg">
              <TabsTrigger value="recommended" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">For You</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">All Jobs</TabsTrigger>
              <TabsTrigger value="remote" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">Remote</TabsTrigger>
              <TabsTrigger value="tech" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">Tech</TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">Data</TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">Design</TabsTrigger>
              <TabsTrigger value="finance" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">Finance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommended" className="space-y-4">
              {matchedOccupations.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Complete the career assessment to get personalized job recommendations</p>
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard/assessment'}>
                    Take Career Quiz
                  </Button>
                </div>
              ) : recommendedLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 bg-muted rounded w-48 mb-4"></div>
                    <div className="text-muted-foreground">Finding jobs for you...</div>
                  </div>
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recommended jobs found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  {/* Matched Occupations Display */}
                  <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Your Top Career Matches</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchedOccupations.slice(0, 3).map((occupation, idx) => (
                        <Badge key={idx} className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                          {occupation.title}
                          <span className="ml-1 text-xs opacity-70">
                            {Math.round(occupation.matchScore * 100)}%
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {recommendedJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Active
                              </Badge>
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                Recommended
                              </Badge>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Briefcase className="mr-1 h-4 w-4" />
                              <span className="mr-4">{job.company}</span>
                              <MapPin className="mr-1 h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {job.skills?.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              <div className="flex items-center text-sm">
                                <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                                <span>{job.salary || "Competitive"}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                                <span>{formatDate(job.postedDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex items-start">
                            <Button asChild>
                              <a href={job.url} target="_blank" rel="noopener noreferrer">
                                Apply Now
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 bg-muted rounded w-48 mb-4"></div>
                    <div className="text-muted-foreground">Searching jobs...</div>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No jobs found. Try adjusting your search criteria.</p>
                  <Button variant="outline" onClick={searchJobs}>
                    Refresh Search
                  </Button>
                </div>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Briefcase className="mr-1 h-4 w-4" />
                            <span className="mr-4">{job.company}</span>
                            <MapPin className="mr-1 h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.skills?.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            <div className="flex items-center text-sm">
                              <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                              <span>{job.salary || "Competitive"}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                              <span>{formatDate(job.postedDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-start">
                          <Button asChild>
                            <a href={job.url} target="_blank" rel="noopener noreferrer">
                              Apply Now
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="remote" className="space-y-4">
              {filterJobsByCategory("remote", jobs).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No remote jobs found. Try a different search.</p>
                </div>
              ) : (
                filterJobsByCategory("remote", jobs).map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <JobCard job={job} formatDate={formatDate} />
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="tech" className="space-y-4">
              {filterJobsByCategory("tech", jobs).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tech jobs found. Try a different search.</p>
                </div>
              ) : (
                filterJobsByCategory("tech", jobs).map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <JobCard job={job} formatDate={formatDate} />
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="design" className="space-y-4">
              {filterJobsByCategory("design", jobs).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No design jobs found. Try a different search.</p>
                </div>
              ) : (
                filterJobsByCategory("design", jobs).map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <JobCard job={job} formatDate={formatDate} />
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="marketing" className="space-y-4">
              {filterJobsByCategory("marketing", jobs).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No marketing jobs found. Try a different search.</p>
                </div>
              ) : (
                filterJobsByCategory("marketing", jobs).map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <JobCard job={job} formatDate={formatDate} />
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Job Market Insights - Now Dynamic */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-accent" />
            Job Market Insights
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Current trends and statistics in the job market (Data-driven)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{insight.field}</h3>
                    <Badge className={insight.growth > 30 ? "bg-green-500" : insight.growth > 20 ? "bg-blue-500" : "bg-yellow-500"}>
                      +{insight.growth}%
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                    <span>{insight.avgSalary}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Additional Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-accent" />
                <h4 className="font-medium">Top Hiring Companies</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Tech giants and startups are actively hiring. Remote positions increased by 45% this year.
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Hot Skills to Learn</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Cloud Architecture, ML/AI, and DevOps skills are in highest demand with 40% salary premium.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Job card component for reusability
function JobCard({ job, formatDate }: { job: Job; formatDate: (d: string) => string }) {
  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Active
          </Badge>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Briefcase className="mr-1 h-4 w-4" />
          <span className="mr-4">{job.company}</span>
          <MapPin className="mr-1 h-4 w-4" />
          <span>{job.location}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="flex items-center text-sm">
            <DollarSign className="mr-1 h-4 w-4 text-green-500" />
            <span>{job.salary || "Competitive"}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="mr-1 h-4 w-4 text-blue-500" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 md:mt-0 flex items-start">
        <Button asChild>
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            Apply Now
          </a>
        </Button>
      </div>
    </div>
  );
}