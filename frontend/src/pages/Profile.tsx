import { useNavigate } from 'react-router-dom';
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

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState({
    fullName: false,
    email: false,
    username: false,
    skills: false,
    workHistory: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const id = await getUserId();
        if (!id) {
          navigate('/login');
          return;
        }
        
        const user = await fetchUser(id);
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        console.error('Fetch user error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      navigate('/login', {
        state: {
          message: 'Logout successful!'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleHome = () => {
    navigate('/home');
  };

  const handleUpdateField = async (field: keyof User, value: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/user/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value
        })
      });

      if (response.ok) {
        setUserData(prev => prev ? { ...prev, [field]: value } : null);
        setIsEditing(prev => ({ ...prev, [field]: false }));
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-[68px]">
      <Navbar onLogout={handleLogout} onProfile={handleHome} isProfilePage={true}/>
      
      <main className="pt-20 pb-8">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <ProfilePicture size="lg" src={userData.profilePhotoPath} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Change Photo</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update Profile Photo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose a new photo to update your profile picture.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input type="file" accept="image/*" />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Update</AlertDialogAction>
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
                email: 'Email',
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
                          onClick={() => handleUpdateField(field as keyof User, userData?.[field as keyof User] || '')}
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
                    variant='iconLight'
                    onClick={() => handleUpdateField('skills', userData?.skills || '')}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="whitespace-pre-wrap">{userData?.skills}</p>
                  <Button
                    variant="iconLight"
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
                    onClick={() => handleUpdateField('workHistory', userData?.workHistory || '')}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="whitespace-pre-wrap">{userData?.workHistory}</p>
                  <Button
                    variant="ghost"
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
      
      <Footer />
    </div>
  );
}