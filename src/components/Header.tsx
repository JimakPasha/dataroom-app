import { useLocation, useNavigate } from 'react-router-dom';
import { Database, Info } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoomsPage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about-documentation';

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Data Room</h1>
          </div>
          <nav className="flex items-center gap-1">
            <Button
              variant={isRoomsPage ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              Rooms
            </Button>
            <Button
              variant={isAboutPage ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate('/about-documentation')}
              className="gap-2"
            >
              <Info className="h-4 w-4" />
              About & Documentation
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

