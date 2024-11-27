import { useState, useEffect } from 'react';
import Footer from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';
import { User } from '@/types/User';
import { getUserId } from '@/api/getUserId';
import { fetchUser } from '@/api/fetchUser';
import { ProfilePicture } from '@/components/ui/profilephoto';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PencilIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import LoadingComponent from '@/components/ui/loadingcomponent';

export default function Profile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState({
    fullName: false,
    username: false,
    skills: false,
    workHistory: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const id = await getUserId();
        const user = await fetchUser(id);

        if (user) {
          setUserData(user);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user details: " + error,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const handleUpdateProfile = async (field: keyof User, value: string) => {
    if (!userData) return;
    
    try {
      const formData = new FormData();
      
      // Add all current user data to form
      formData.append('fullName', userData.fullName || '');
      formData.append('username', userData.username);
      formData.append('skills', userData.skills || '');
      formData.append('workHistory', userData.workHistory || '');
      
      // Override the field being updated
      formData.append(field, value);
      
      // Add photo if one is selected
      if (selectedFile && field === 'profilePhotoPath') {
        formData.append('photo', selectedFile);
      }
      setIsLoading(true);
      const response = await fetch(`http://localhost:3000/api/profile/${userData.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setUserData(prev => prev ? { 
          ...prev, 
          ...data.body // Update all returned fields
        } : null);
        
        setIsEditing(prev => ({ ...prev, [field]: false }));
        setSelectedFile(null);
        setIsLoading(false);
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "success",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] pb-[68px]">
      <Navbar/>   
      {isLoading ? <LoadingComponent /> : (
        <main className="pt-20 pb-8">
          <div className="max-w-3xl mx-auto px-4 space-y-6">
            <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <ProfilePicture size="lg" src={userData?.profilePhotoPath} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">Change Photo</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update Profile Photo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose a new photo to update your profile picture.
                      {selectedFile && (
                        <span className="block mt-2 text-sm text-green-600">
                          Selected: {selectedFile.name}
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedFile(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleUpdateProfile('profilePhotoPath', userData?.profilePhotoPath || '')}
                      disabled={!selectedFile}
                    >
                      Upload Photo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({
                fullName: 'Full Name',
                username: 'Username'
              }).map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="flex items-center space-x-2">
                    {isEditing[field as keyof typeof isEditing] ? (
                      <>
                        <Input
                          value={userData?.[field as keyof User] || ''}
                          onChange={(e) => setUserData(prev => 
                            prev ? { ...prev, [field]: e.target.value } : null
                          )}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => handleUpdateProfile(
                            field as keyof User, 
                            String(userData?.[field as keyof User] || '')
                          )}
                          variant="default"
                          size="sm"
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">{userData?.[field as keyof User]}</span>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setIsEditing(prev => ({ ...prev, [field]: true }))}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing.skills ? (
                <div className="space-y-2">
                  <Textarea
                    value={userData?.skills || ''}
                    onChange={(e) => setUserData(prev => 
                      prev ? { ...prev, skills: e.target.value } : null
                    )}
                    placeholder="Enter your skills (separate with commas)"
                    className="min-h-[100px]"
                  />
                  <Button 
                    variant="default"
                    onClick={() => handleUpdateProfile('skills', userData?.skills || '')}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="whitespace-pre-wrap">{userData?.skills}</p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsEditing(prev => ({ ...prev, skills: true }))}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing.workHistory ? (
                <div className="space-y-2">
                  <Textarea
                    value={userData?.workHistory || ''}
                    onChange={(e) => setUserData(prev => 
                      prev ? { ...prev, workHistory: e.target.value } : null
                    )}
                    placeholder="Enter your work history"
                    className="min-h-[150px]"
                  />
                  <Button 
                    onClick={() => handleUpdateProfile('workHistory', userData?.workHistory || '')}
                    size="sm"
                    variant="default"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="whitespace-pre-wrap">{userData?.workHistory}</p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsEditing(prev => ({ ...prev, workHistory: true }))}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </main>
      )}
      <Footer />
    </div>
  );
}