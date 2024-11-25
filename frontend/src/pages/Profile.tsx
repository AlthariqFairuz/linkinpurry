import { useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';

export default function Profile() {
  const navigate = useNavigate();
  
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

  return (
    <div className="min-h-screen bg-gray-100 pb-[68px]">
      <Navbar onLogout={handleLogout} onProfile={handleHome} isProfilePage={true}/>
       <main className="pt-20 pb-8">
        <div className='text-black'>coming soon ngabs profile</div>
        
      </main>
       <Footer />
    </div>
  );
}