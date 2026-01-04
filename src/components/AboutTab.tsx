import { Database, Code } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'about', label: 'About the Application' },
  { id: 'features', label: 'Features' },
  { id: 'technology', label: 'Technology Stack' },
  { id: 'developer', label: 'Developer' },
  { id: 'version', label: 'Version' },
];

export const AboutTab = () => {
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <nav className="space-y-1">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    activeSection === section.id && 'bg-accent'
                  )}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.label}
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex-1 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Database className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Data Room</h1>
            <p className="text-xl text-muted-foreground">
              Secure document management and organization system
            </p>
          </div>

          <Card id="about" className="p-6 scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-4">About the Application</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Data Room Software is a modern, full-featured virtual data room application designed for 
                securely storing, managing, and organizing documents. Built with a focus on user experience 
                and functionality, it provides an intuitive interface for managing complex document hierarchies.
              </p>
              <p>
                This application allows users to create multiple data rooms, organize documents in nested 
                folder structures, upload PDF files, and manage their document library with ease. The system 
                is designed to handle real-world scenarios such as due diligence processes, document sharing, 
                and secure document storage.
              </p>
            </div>
          </Card>

          <Card id="features" className="p-6 scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Create and manage multiple data rooms</li>
              <li>Organize documents in nested folder structures</li>
              <li>Upload individual files or entire folders</li>
              <li>Upload folders with nested structure preserved</li>
              <li>View PDF, Word, Excel, TXT, and CSV files</li>
              <li>Rename and delete folders and files</li>
              <li>Grid and list view modes</li>
              <li>Sorting and filtering capabilities</li>
              <li>Responsive design for all devices</li>
              <li>Local data storage using IndexedDB</li>
            </ul>
          </Card>

          <Card id="technology" className="p-6 scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Frontend</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>React 18+ with TypeScript</li>
                  <li>Vite for build tooling</li>
                  <li>Tailwind CSS for styling</li>
                  <li>Shadcn UI components</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">State Management</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Redux Toolkit (RTK)</li>
                  <li>React-Redux hooks</li>
                  <li>IndexedDB for persistence</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card id="developer" className="p-6 scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-4">Developer</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This application was developed as part of a technical assessment, demonstrating modern 
                web development practices, clean code architecture, and attention to user experience.
              </p>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>Built with modern web technologies</span>
                </div>
              </div>
            </div>
          </Card>

          <Card id="version" className="p-6 scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-4">Version</h2>
            <p className="text-muted-foreground">
              Version 1.0.0 - MVP Release
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
