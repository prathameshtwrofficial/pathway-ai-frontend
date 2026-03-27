import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Play, 
  Search, 
  Star,
  Clock,
  Users,
  BookMarked,
  GraduationCap,
  Lightbulb,
  Filter,
  X,
  ExternalLink,
  Heart,
  Bookmark,
  TrendingUp,
  Loader2,
  Grid,
  List,
  SlidersHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Resource {
  id: string;
  title: string;
  provider?: string;
  author?: string;
  level: string;
  duration?: string;
  readTime?: string;
  rating?: number;
  students?: number;
  views?: number;
  free: boolean;
  tags: string[];
  category: string;
  url?: string;
  type?: string;
  year?: number;
  pages?: number;
}

interface SkillGap {
  skillName: string;
  priority: "high" | "medium" | "low";
}

export function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("courses");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  
  // New filter states
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch user data from Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserSkills(['JavaScript', 'React', 'Python', 'Data Science']);
      setRecommendedSkills(['Machine Learning', 'Cloud Computing', 'DevOps']);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Get user's current skills
        if (data.aiAssessment?.skills) {
          const skills = data.aiAssessment.skills.map((s: any) => s.name);
          setUserSkills(skills.length > 0 ? skills : ['JavaScript', 'React', 'Python']);
        } else {
          setUserSkills(['JavaScript', 'React', 'Python', 'Data Science']);
        }
        
        // Get recommended skills from skill gaps
        if (data.skillGaps) {
          setSkillGaps(data.skillGaps);
          const gaps = data.skillGaps.map((g: SkillGap) => g.skillName);
          setRecommendedSkills(gaps.length > 0 ? gaps : ['Machine Learning', 'Cloud Computing']);
        } else {
          setRecommendedSkills(['Machine Learning', 'Cloud Computing', 'DevOps']);
        }
        
        // Get bookmarks
        if (data.bookmarkedResources) {
          setBookmarkedIds(data.bookmarkedResources);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Curated resources database with more variety
  const allResources: Resource[] = useMemo(() => [
    // Courses - Tech
    { id: 'c1', title: 'Complete Web Development Bootcamp 2024', provider: 'Udemy', level: 'Beginner', duration: '12 weeks', rating: 4.8, students: 150000, free: false, tags: ['HTML', 'CSS', 'JavaScript', 'React'], category: 'tech', url: 'https://udemy.com' },
    { id: 'c2', title: 'Python for Data Science and Machine Learning', provider: 'Coursera', level: 'Intermediate', duration: '8 weeks', rating: 4.7, students: 200000, free: true, tags: ['Python', 'Machine Learning', 'Data Science'], category: 'tech', url: 'https://coursera.org' },
    { id: 'c3', title: 'AWS Certified Solutions Architect', provider: 'A Cloud Guru', level: 'Advanced', duration: '10 weeks', rating: 4.9, students: 80000, free: false, tags: ['AWS', 'Cloud', 'Architecture'], category: 'tech', url: 'https://acloudguru.com' },
    { id: 'c4', title: 'React - The Complete Guide', provider: 'Udemy', level: 'Intermediate', duration: '6 weeks', rating: 4.8, students: 120000, free: false, tags: ['React', 'Redux', 'JavaScript'], category: 'tech', url: 'https://udemy.com' },
    { id: 'c5', title: 'Machine Learning Specialization', provider: 'Coursera', level: 'Intermediate', duration: '16 weeks', rating: 4.9, students: 300000, free: true, tags: ['Machine Learning', 'Python', 'AI'], category: 'tech', url: 'https://coursera.org' },
    { id: 'c6', title: 'Advanced System Design', provider: 'Educative', level: 'Advanced', duration: '8 weeks', rating: 4.7, students: 45000, free: false, tags: ['System Design', 'Architecture', 'Design Patterns'], category: 'tech', url: 'https://educative.io' },
    { id: 'c7', title: 'Full-Stack JavaScript Developer', provider: 'freeCodeCamp', level: 'Intermediate', duration: '20 weeks', rating: 4.8, students: 250000, free: true, tags: ['JavaScript', 'Node.js', 'React', 'MongoDB'], category: 'tech', url: 'https://freecodecamp.org' },
    { id: 'c8', title: 'Kubernetes for Developers', provider: 'Pluralsight', level: 'Advanced', duration: '6 weeks', rating: 4.6, students: 30000, free: false, tags: ['Kubernetes', 'Docker', 'DevOps'], category: 'tech', url: 'https://pluralsight.com' },
    // Courses - Business
    { id: 'c9', title: 'Business Analysis Fundamentals', provider: 'LinkedIn Learning', level: 'Beginner', duration: '4 weeks', rating: 4.5, students: 50000, free: false, tags: ['Business Analysis', 'Requirements', 'Agile'], category: 'business', url: 'https://linkedin.com/learning' },
    { id: 'c10', title: 'Product Management Professional', provider: 'Coursera', level: 'Intermediate', duration: '12 weeks', rating: 4.8, students: 75000, free: true, tags: ['Product Management', 'Strategy', 'Agile'], category: 'business', url: 'https://coursera.org' },
    // Courses - Design
    { id: 'c11', title: 'UX Design Masterclass', provider: 'Interaction Design Foundation', level: 'Beginner', duration: '10 weeks', rating: 4.7, students: 60000, free: true, tags: ['UX Design', 'User Research', 'Figma'], category: 'design', url: 'https://interaction-design.org' },
    { id: 'c12', title: 'Advanced UI Design Patterns', provider: 'Udemy', level: 'Advanced', duration: '8 weeks', rating: 4.6, students: 35000, free: false, tags: ['UI Design', 'Design Systems', 'Prototyping'], category: 'design', url: 'https://udemy.com' },
    // Tutorials
    { id: 't1', title: 'Building REST APIs with Node.js and Express', author: 'FreeCodeCamp', type: 'Article', readTime: '20 min', level: 'Intermediate', tags: ['Node.js', 'API', 'Express'], category: 'tech', free: true, url: 'https://freecodecamp.org' },
    { id: 't2', title: 'React Hooks Complete Guide', author: 'React Docs', type: 'Documentation', readTime: '30 min', level: 'Intermediate', tags: ['React', 'Hooks', 'JavaScript'], category: 'tech', free: true, url: 'https://react.dev' },
    { id: 't3', title: 'Python Data Structures Explained', author: 'Real Python', type: 'Article', readTime: '15 min', level: 'Beginner', tags: ['Python', 'Data Structures'], category: 'tech', free: true, url: 'https://realpython.com' },
    { id: 't4', title: 'Docker Container Basics', author: 'Docker', type: 'Documentation', readTime: '25 min', level: 'Beginner', tags: ['Docker', 'Containers'], category: 'tech', free: true, url: 'https://docker.com' },
    { id: 't5', title: 'GraphQL vs REST API Comparison', author: 'Apollo', type: 'Article', readTime: '12 min', level: 'Intermediate', tags: ['GraphQL', 'REST', 'API'], category: 'tech', free: true, url: 'https://apollographql.com' },
    { id: 't6', title: 'TypeScript Advanced Types', author: 'TypeScript Docs', type: 'Documentation', readTime: '45 min', level: 'Advanced', tags: ['TypeScript', 'Types', 'JavaScript'], category: 'tech', free: true, url: 'https://typescriptlang.org' },
    // Books
    { id: 'b1', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', year: 2008, rating: 4.8, pages: 464, tags: ['Programming', 'Best Practices'], category: 'tech', free: false, url: 'https://amazon.com' },
    { id: 'b2', title: 'The Pragmatic Programmer', author: 'Andrew Hunt, David Thomas', year: 1999, rating: 4.7, pages: 352, tags: ['Programming', 'Career'], category: 'tech', free: false, url: 'https://amazon.com' },
    { id: 'b3', title: 'Introduction to Algorithms', author: 'Thomas Cormen', year: 2009, rating: 4.9, pages: 1312, tags: ['Algorithms', 'Computer Science'], category: 'tech', free: false, url: 'https://amazon.com' },
    { id: 'b4', title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Gang of Four', year: 1994, rating: 4.7, pages: 416, tags: ['Design Patterns', 'OOP', 'Software Engineering'], category: 'tech', free: false, url: 'https://amazon.com' },
    // Videos
    { id: 'v1', title: 'Full Stack Web Development Course', author: 'FreeCodeCamp', duration: '12 hours', level: 'Beginner', views: 500000, tags: ['Web Dev', 'JavaScript', 'React'], category: 'tech', free: true, url: 'https://youtube.com' },
    { id: 'v2', title: 'Machine Learning for Beginners', author: 'Microsoft Learn', duration: '8 hours', level: 'Beginner', views: 300000, tags: ['Machine Learning', 'Python'], category: 'tech', free: true, url: 'https://youtube.com' },
    { id: 'v3', title: 'AWS Solutions Architect Tutorial', author: 'Cloud Academy', duration: '10 hours', level: 'Advanced', views: 200000, tags: ['AWS', 'Cloud'], category: 'tech', free: false, url: 'https://youtube.com' },
    { id: 'v4', title: 'System Design Interview Guide', author: 'Tech Lead', duration: '6 hours', level: 'Advanced', views: 150000, tags: ['System Design', 'Interview'], category: 'tech', free: true, url: 'https://youtube.com' },
  ], []);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let filtered = [...allResources];

    // Category filter
    const categoryMap: Record<string, string[]> = {
      courses: ['tech', 'business', 'design'],
      tutorials: ['tech'],
      books: ['tech'],
      videos: ['tech']
    };
    if (categoryMap[selectedCategory]) {
      filtered = filtered.filter(r => categoryMap[selectedCategory].includes(r.category));
    }

    // Search filter
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
        r.author?.toLowerCase().includes(q) ||
        r.provider?.toLowerCase().includes(q)
      );
    }

    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(r => r.level?.toLowerCase() === levelFilter);
    }

    // Price filter
    if (priceFilter === "free") {
      filtered = filtered.filter(r => r.free);
    } else if (priceFilter === "paid") {
      filtered = filtered.filter(r => !r.free);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popularity":
        filtered.sort((a, b) => (b.students || b.views || 0) - (a.students || a.views || 0));
        break;
      case "newest":
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
    }

    return filtered;
  }, [allResources, selectedCategory, debouncedQuery, levelFilter, priceFilter, sortBy]);

  // Get personalized recommendations based on skill gaps
  const recommendedResources = useMemo(() => {
    if (skillGaps.length === 0) return filteredResources.slice(0, 4);
    
    return filteredResources.filter(r => 
      r.tags?.some(tag => 
        skillGaps.some(gap => 
          gap.skillName.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(gap.skillName.toLowerCase())
        )
      )
    ).slice(0, 4);
  }, [filteredResources, skillGaps]);

  const toggleBookmark = (resourceId: string) => {
    setBookmarkedIds(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleResourceClick = (resource: Resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-6 space-y-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 text-gray-600 dark:text-gray-300">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <BookOpen className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              Learning Resources
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Curated resources to accelerate your career growth
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
              {filteredResources.length} resources
            </Badge>
            <div className="flex border rounded-md dark:border-gray-600">
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      {(userSkills.length > 0 || recommendedSkills.length > 0) && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Recommended For You
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Based on your skill gaps and career goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Your skills:</span>
              {userSkills.slice(0, 3).map((skill, i) => (
                <Badge key={i} className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{skill}</Badge>
              ))}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Gap areas:</span>
              {recommendedSkills.slice(0, 2).map((skill, i) => (
                <Badge key={i} variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">
                  + {skill}
                </Badge>
              ))}
            </div>
            {recommendedResources.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {recommendedResources.map(resource => (
                  <div 
                    key={resource.id} 
                    className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate dark:text-white">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                          {resource.provider || resource.author}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                        {resource.free ? "Free" : "Paid"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search resources by title, skill, or author..."
            className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="dark:border-gray-600"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          
          <select
            className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          
          <select
            className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          
          <select
            className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Sort by Rating</option>
            <option value="popularity">Sort by Popularity</option>
            <option value="newest">Sort by Newest</option>
          </select>

          {/* Active Filters */}
          {(levelFilter !== "all" || priceFilter !== "all" || searchQuery) && (
            <div className="flex flex-wrap gap-2">
              {levelFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Level: {levelFilter}
                  <button onClick={() => setLevelFilter("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {priceFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priceFilter === "free" ? "Free" : "Paid"}
                  <button onClick={() => setPriceFilter("all")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resource Type Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg">
          <TabsTrigger value="courses" className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">
            <GraduationCap className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">
            <FileText className="h-4 w-4" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">
            <BookMarked className="h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white dark:data-[state=active]:bg-gray-700">
            <Play className="h-4 w-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        {/* Resources Display */}
        <TabsContent value={selectedCategory} className="mt-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">No resources found</h3>
              <p className="text-muted-foreground dark:text-gray-400">Try adjusting your search or filters</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setSearchQuery(""); setLevelFilter("all"); setPriceFilter("all"); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2 dark:text-white">{resource.title}</CardTitle>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(resource.id); }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Bookmark className={`h-4 w-4 ${bookmarkedIds.includes(resource.id) ? "fill-primary text-primary" : "text-gray-400"}`} />
                        </button>
                      </div>
                    </div>
                    <CardDescription className="dark:text-gray-400">
                      {resource.provider || resource.author} {resource.duration && `• ${resource.duration}`} {resource.readTime && `• ${resource.readTime} read`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags?.slice(0, 4).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                        {resource.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {resource.rating}
                          </span>
                        )}
                        {(resource.students || resource.views) && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {((resource.students || resource.views || 0) / 1000).toFixed(0)}k
                          </span>
                        )}
                        {resource.level && (
                          <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">{resource.level}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {resource.free && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">Free</Badge>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                          onClick={() => handleResourceClick(resource)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Access
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium dark:text-white">{resource.title}</h3>
                          {resource.free && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs">Free</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                          {resource.provider || resource.author} {resource.duration && `• ${resource.duration}`}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resource.tags?.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {resource.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{resource.rating}</span>
                          </div>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => handleResourceClick(resource)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Popular Skills Section */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Popular Skills to Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['React', 'Python', 'Machine Learning', 'AWS', 'TypeScript', 'Docker', 'Kubernetes', 'Data Science', 'SQL', 'GraphQL'].map((skill, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                size="sm"
                className="dark:border-gray-600"
                onClick={() => setSearchQuery(skill)}
              >
                {skill}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Resources;
