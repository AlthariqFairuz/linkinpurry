import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingComponent from '@/components/ui/loadingcomponent';
import { useToast } from '@/hooks/use-toast';
import { NetworkResponse } from '@/types/Network';
import { getUserId } from '@/api/getUserId';

export const DaftarKoneksi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [connections, setConnections] = useState<NetworkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUserId = async () => {
      const currentUserId = await getUserId();
      setCurrentUserId(currentUserId);
    };
    getCurrentUserId();
  }, []);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/connections/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch connections');
        }

        const data = await response.json();
        setConnections(data.body.connections);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load connections:" + error,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [id, toast]);

  if (currentUserId === id) {
    navigate('/network');
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <main className="pt-24 pb-32 px-4">
        <div className="max-w-[1128px] mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Connections</h1>
          
          {isLoading ? (
            <LoadingComponent />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((connection) => (
                <Card 
                  key={connection.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/profile/${connection.id}`)}
                >
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={connection.profilePhotoPath} alt={connection.fullName} />
                      <AvatarFallback>{connection.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate text-left">{connection.fullName}</h3>
                      <p className="text-sm text-gray-500 truncate text-left">@{connection.username}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && connections.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No connections found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DaftarKoneksi;
