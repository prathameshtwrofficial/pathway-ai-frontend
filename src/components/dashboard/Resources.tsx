import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Code, FileText, Video, ExternalLink, Search } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for resources
const resourcesData = {
  courses: [
    {
      id: 1,
      title: "Introduction to Web Development",
      provider: "Coursera",
      level: "Beginner",
      duration: "8 weeks",
      link: "https://www.coursera.org/",
      tags: ["HTML", "CSS", "JavaScript"]
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      provider: "edX",
      level: "Intermediate",
      duration: "12 weeks",
      link: "https://www.edx.org/",
      tags: ["Python", "Statistics", "Machine Learning"]
    },
    {
      id: 3,
      title: "UX Design Principles",
      provider: "Udemy",
      level: "Beginner",
      duration: "6 weeks",
      link: "https://www.udemy.com/",
      tags: ["Design", "User Research", "Prototyping"]
    },
    {
      id: 4,
      title: "Advanced React Development",
      provider: "Frontend Masters",
      level: "Advanced",
      duration: "4 weeks",
      link: "https://frontendmasters.com/",
      tags: ["React", "Redux", "TypeScript"]
    }
  ],
  tutorials: [
    {
      id: 1,
      title: "Building a RESTful API with Node.js",
      author: "Tech Guide",
      type: "Article",
      readTime: "15 min",
      link: "https://example.com/tutorial1",
      tags: ["Node.js", "Express", "API"]
    },
    {
      id: 2,
      title: "Mastering CSS Grid Layout",
      author: "CSS Tricks",
      type: "Video",
      readTime: "25 min",
      link: "https://example.com/tutorial2",
      tags: ["CSS", "Layout", "Responsive Design"]
    },
    {
      id: 3,
      title: "Introduction to Docker Containers",
      author: "Docker Docs",
      type: "Documentation",
      readTime: "30 min",
      link: "https://example.com/tutorial3",
      tags: ["Docker", "Containers", "DevOps"]
    }
  ],
  books: [
    {
      id: 1,
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      year: 2008,
      link: "https://example.com/book1",
      tags: ["Programming", "Best Practices", "Agile"]
    },
    {
      id: 2,
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Gang of Four",
      year: 1994,
      link: "https://example.com/book2",
      tags: ["Object-Oriented", "Design Patterns", "Architecture"]
    },
    {
      id: 3,
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt, David Thomas",
      year: 1999,
      link: "https://example.com/book3",
      tags: ["Programming", "Career", "Best Practices"]
    }
  ]
};

export function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter resources based on search query
  const filterResources = (resources, query) => {
    if (!query) return resources;
    
    return resources.filter(resource => 
      resource.title.toLowerCase().includes(query.toLowerCase()) ||
      (resource.tags && resource.tags.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      ))
    );
  };
  
  const filteredCourses = filterResources(resourcesData.courses, searchQuery);
  const filteredTutorials = filterResources(resourcesData.tutorials, searchQuery);
  const filteredBooks = filterResources(resourcesData.books, searchQuery);

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Learning Resources</h1>
        <p className="text-muted-foreground">Discover courses, tutorials, and books to enhance your skills</p>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resources by title or tag..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="courses">
        <TabsList className="mb-4">
          <TabsTrigger value="courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            <Video className="mr-2 h-4 w-4" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="books">
            <FileText className="mr-2 h-4 w-4" />
            Books
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-4">
          {filteredCourses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No courses found matching your search.</p>
          ) : (
            filteredCourses.map(course => (
              <Card key={course.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardDescription>{course.provider} • {course.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={course.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Course
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="tutorials" className="space-y-4">
          {filteredTutorials.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No tutorials found matching your search.</p>
          ) : (
            filteredTutorials.map(tutorial => (
              <Card key={tutorial.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                    <Badge variant="outline">{tutorial.type}</Badge>
                  </div>
                  <CardDescription>{tutorial.author} • {tutorial.readTime} read</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutorial.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={tutorial.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Read Tutorial
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="books" className="space-y-4">
          {filteredBooks.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No books found matching your search.</p>
          ) : (
            filteredBooks.map(book => (
              <Card key={book.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{book.title}</CardTitle>
                  <CardDescription>{book.author} • {book.year}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {book.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={book.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Book
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}