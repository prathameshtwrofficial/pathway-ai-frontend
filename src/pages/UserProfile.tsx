import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Save, Edit3 } from "lucide-react";
import { Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserProfileData {
  displayName: string;
  email: string;
  contactNo?: string;
  socialMediaLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}

const UserProfile = () => {
  const { currentUser, userData, updateUserData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    displayName: "",
    email: "",
    contactNo: "",
    socialMediaLinks: {
      linkedin: "",
      twitter: "",
      instagram: "",
      github: ""
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Set basic data from auth
        setProfileData(prev => ({
          ...prev,
          email: currentUser.email || "",
          displayName: currentUser.displayName || ""
        }));

        // Get additional profile data from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const firestoreData = userDoc.data();
          setProfileData(prev => ({
            ...prev,
            displayName: firestoreData.displayName || currentUser.displayName || "",
            contactNo: firestoreData.contactNo || "",
            socialMediaLinks: {
              linkedin: firestoreData.socialMediaLinks?.linkedin || "",
              twitter: firestoreData.socialMediaLinks?.twitter || "",
              instagram: firestoreData.socialMediaLinks?.instagram || "",
              github: firestoreData.socialMediaLinks?.github || ""
            }
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      // Handle nested social media links
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserProfileData] as any,
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      // Update data in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        contactNo: profileData.contactNo,
        socialMediaLinks: profileData.socialMediaLinks,
        updatedAt: new Date()
      });

      // Update local userData state
      await updateUserData({
        displayName: profileData.displayName,
        contactNo: profileData.contactNo,
        socialMediaLinks: profileData.socialMediaLinks
      });

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card className="max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>You need to be logged in to view your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and social media links</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details and contact information</CardDescription>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  placeholder="Your email address"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact Number</Label>
              <Input
                id="contactNo"
                name="contactNo"
                value={profileData.contactNo || ""}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Your phone number"
              />
            </div>

            <div className="space-y-4">
              <Label>Social Media Links</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="socialMediaLinks.linkedin"
                    value={profileData.socialMediaLinks?.linkedin || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    name="socialMediaLinks.twitter"
                    value={profileData.socialMediaLinks?.twitter || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="socialMediaLinks.instagram"
                    value={profileData.socialMediaLinks?.instagram || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    name="socialMediaLinks.github"
                    value={profileData.socialMediaLinks?.github || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;