import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MapPin, DollarSign, Calendar, Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  url: string;
  postedDate: string;
}

export function JobPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock job data for initial display
  const mockJobs: Job[] = [
    {
      id: "job1",
      title: "Frontend Developer",
      company: "Tech Solutions Inc.",
      location: "Remote",
      description: "We're looking for a talented Frontend Developer to join our team.",
      salary: "$80,000 - $120,000",
      url: "https://example.com/job1",
      postedDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "job2",
      title: "Data Scientist",
      company: "Data Insights Corp",
      location: "New York, NY",
      description: "Join our team as a Data Scientist and help drive business decisions.",
      salary: "$90,000 - $130,000",
      url: "https://example.com/job2",
      postedDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: "job3",
      title: "UX Designer",
      company: "Creative Design Studio",
      location: "San Francisco, CA",
      description: "Create beautiful and intuitive user experiences for our clients.",
      salary: "$75,000 - $110,000",
      url: "https://example.com/job3",
      postedDate: new Date(Date.now() - 259200000).toISOString()
    }
  ];

  useEffect(() => {
    // Load initial jobs
    setJobs(mockJobs);
  }, []);

  const searchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (location) params.append('location', location);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs);
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to search jobs. Please try again.",
        variant: "destructive",
      });
      // Fallback to mock data
      setJobs(mockJobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return "1 day ago";
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Job Portal</CardTitle>
          <CardDescription>
            Find job opportunities that match your skills and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Job title, company, or keywords"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Location (city, state, or remote)"
                  className="pl-8"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={searchJobs} disabled={loading}>
              {loading ? "Searching..." : "Search Jobs"}
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="remote">Remote</TabsTrigger>
              <TabsTrigger value="tech">Tech</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No jobs found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge variant="outline">New</Badge>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Briefcase className="mr-1 h-4 w-4" />
                            <span className="mr-4">{job.company}</span>
                            <MapPin className="mr-1 h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="flex items-center text-sm">
                              <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                              <span>{job.salary}</span>
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
              {jobs.filter(job => job.location.toLowerCase() === "remote").length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No remote jobs found.</p>
                </div>
              ) : (
                jobs
                  .filter(job => job.location.toLowerCase() === "remote")
                  .map((job) => (
                    <Card key={job.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <Badge variant="outline">Remote</Badge>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Briefcase className="mr-1 h-4 w-4" />
                              <span className="mr-4">{job.company}</span>
                              <MapPin className="mr-1 h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="flex items-center text-sm">
                                <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                                <span>{job.salary}</span>
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
            
            {/* Other tabs would follow the same pattern */}
            <TabsContent value="tech" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Tech jobs will be displayed here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Design jobs will be displayed here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="marketing" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Marketing jobs will be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Market Insights</CardTitle>
          <CardDescription>
            Current trends and statistics in the job market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Top Growing Fields</h3>
              <ul className="space-y-2">
                <li className="text-sm">Data Science (22% growth)</li>
                <li className="text-sm">Cybersecurity (31% growth)</li>
                <li className="text-sm">Healthcare Tech (15% growth)</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Average Salaries</h3>
              <ul className="space-y-2">
                <li className="text-sm">Entry Level: $50K - $70K</li>
                <li className="text-sm">Mid Level: $70K - $100K</li>
                <li className="text-sm">Senior Level: $100K - $150K</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">In-Demand Skills</h3>
              <ul className="space-y-2">
                <li className="text-sm">Cloud Computing</li>
                <li className="text-sm">AI/Machine Learning</li>
                <li className="text-sm">Data Analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}