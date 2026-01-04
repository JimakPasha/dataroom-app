import { Database, Code, Zap, Shield, Search, FolderTree, FileText, Grid3x3, ArrowUpDown, Info, Layers, TrendingUp, Rocket, Cpu, Settings, Database as DbIcon, Box, Globe, Lock, Users, BarChart3, Target, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';

interface SubSection {
  id: string;
  label: string;
}

interface Section {
  id: string;
  label: string;
  subsections?: SubSection[];
}

const sections: Section[] = [
  {
    id: 'about',
    label: 'About the Application',
    subsections: [
      { id: 'about-dataroom-management', label: 'Data Room Management' },
      { id: 'about-folder-structure', label: 'Hierarchical Folder Structure' },
      { id: 'about-file-management', label: 'File Management' },
      { id: 'about-search', label: 'Search and Navigation' },
      { id: 'about-display-modes', label: 'Display Modes' },
      { id: 'about-sorting', label: 'Sorting and Organization' },
      { id: 'about-ui', label: 'User Interface' },
      { id: 'about-security', label: 'Security and Validation' },
      { id: 'about-additional', label: 'Additional Features' },
      { id: 'about-scalability', label: 'Scalability and Extensibility' },
    ],
  },
  {
    id: 'business',
    label: 'For Business',
    subsections: [
      { id: 'business-why-choose', label: 'Why Choose Data Room?' },
      { id: 'business-applications', label: 'Applications in Various Industries' },
      { id: 'business-advantages', label: 'Key Advantages' },
      { id: 'business-roi', label: 'ROI and Business Value' },
    ],
  },
  {
    id: 'technical',
    label: 'Technical Details',
    subsections: [
      { id: 'technical-stack', label: 'Technology Stack' },
      { id: 'technical-architecture', label: 'Application Architecture' },
      { id: 'technical-solutions', label: 'Key Technical Solutions' },
      { id: 'technical-tools', label: 'Development Tools' },
      { id: 'technical-patterns', label: 'Patterns and Practices' },
      { id: 'technical-production', label: 'Production Readiness' },
    ],
  },
];

export const AboutPage = () => {
  const [activeSection, setActiveSection] = useState<string>('about');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['about']));

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      let foundSection = '';

      for (const section of sections) {
        if (section.subsections) {
          for (let i = section.subsections.length - 1; i >= 0; i--) {
            const subsection = section.subsections[i];
            const subsectionElement = document.getElementById(subsection.id);
            if (subsectionElement && subsectionElement.offsetTop <= scrollPosition) {
              foundSection = subsection.id;
              setExpandedSections((prev) => new Set(prev).add(section.id));
              break;
            }
          }
        }
      }

      if (!foundSection) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          const sectionElement = document.getElementById(section.id);
          if (sectionElement && sectionElement.offsetTop <= scrollPosition) {
            foundSection = section.id;
            break;
          }
        }
      }

      if (foundSection) {
        setActiveSection(foundSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
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
      
      const parentSection = sections.find((s) => s.subsections?.some((sub) => sub.id === id));
      if (parentSection) {
        setExpandedSections((prev) => new Set(prev).add(parentSection.id));
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const hasSubsections = section.subsections && section.subsections.length > 0;
                  const isActive = activeSection === section.id || 
                    (hasSubsections && section.subsections?.some((sub) => activeSection === sub.id));

                  return (
                    <div key={section.id} className="space-y-1">
                      <div className="flex items-center">
                        {hasSubsections && (
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="p-1 hover:bg-accent rounded-sm mr-1"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        {!hasSubsections && <div className="w-6" />}
                        <Button
                          variant={isActive && !hasSubsections ? 'secondary' : 'ghost'}
                          className={cn(
                            'flex-1 justify-start text-sm',
                            isActive && !hasSubsections && 'bg-accent',
                            hasSubsections && isActive && 'font-semibold'
                          )}
                          onClick={() => scrollToSection(section.id)}
                        >
                          {section.label}
                        </Button>
                      </div>
                      {hasSubsections && isExpanded && (
                        <div className="ml-6 space-y-0.5">
                          {section.subsections?.map((subsection) => {
                            const isSubActive = activeSection === subsection.id;
                            return (
                              <Button
                                key={subsection.id}
                                variant="ghost"
                                className={cn(
                                  'w-full justify-start text-xs h-8 pl-3',
                                  isSubActive && 'bg-accent font-medium'
                                )}
                                onClick={() => scrollToSection(subsection.id)}
                              >
                                {subsection.label}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="flex-1 space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Database className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="text-5xl font-bold">Data Room</h1>
              <p className="text-2xl text-muted-foreground">
                Professional Document Management System
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Modern solution for secure storage, organization, and management of corporate documents
              </p>
            </div>

            <Card id="about" className="p-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">About the Application</h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  <strong className="text-foreground">Data Room</strong> is a full-featured virtual document management system 
                  designed for enterprises that require a reliable, secure, and intuitive solution for organizing corporate documents. 
                  The application provides a comprehensive set of tools for creating virtual document repositories, managing files 
                  and folders, and efficiently navigating complex document hierarchies.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div id="about-dataroom-management" className="space-y-4 scroll-mt-24">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Data Room Management
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>Create unlimited virtual document repositories</li>
                      <li>Unique identification of each repository with its own name</li>
                      <li>Full lifecycle management: create, rename, delete</li>
                      <li>Automatic tracking of creation and last modification dates</li>
                      <li>Isolated document storage within each repository</li>
                    </ul>
                  </div>

                  <div id="about-folder-structure" className="space-y-4 scroll-mt-24">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <FolderTree className="h-5 w-5 text-primary" />
                      Hierarchical Folder Structure
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>Create unlimited folder nesting (nested folders)</li>
                      <li>Visual folder tree with expand/collapse support</li>
                      <li>Intuitive navigation through breadcrumbs</li>
                      <li>Quick navigation to any folder via sidebar</li>
                      <li>Cascading folder deletion with all contents</li>
                      <li>Visual hierarchy indicators (like VS Code/Finder)</li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div id="about-file-management" className="space-y-4 scroll-mt-24">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      File Management
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>File upload via drag & drop or file picker dialog</li>
                      <li>Folder upload with complete structure preservation</li>
                      <li>Support for multiple simultaneous file uploads</li>
                      <li>Recursive folder processing (nested folders supported)</li>
                      <li>Empty folder upload support (Chrome/Edge via File System Access API)</li>
                      <li>Formats: PDF, Word (.docx), Excel (.xls, .xlsx), TXT, CSV</li>
                      <li>Built-in PDF viewer in modal window</li>
                      <li>Word document viewing with HTML conversion</li>
                      <li>Excel file viewing with multiple sheet support</li>
                      <li>Text file viewing with formatting</li>
                      <li>Download files to local computer</li>
                      <li>Rename files with validation</li>
                      <li>Delete files with confirmation</li>
                      <li>Automatic name conflict resolution (adding suffixes)</li>
                      <li>File size validation (maximum 10MB)</li>
                      <li>File name sanitization (removing invalid characters)</li>
                      <li>Folder structure validation and automatic creation</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Search and Navigation
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>Full-text search by file and folder names</li>
                      <li>Instant real-time search results</li>
                      <li>Hotkeys: Ctrl+K / Cmd+K for quick access</li>
                      <li>Display full path to found items</li>
                      <li>Quick navigation to found files and folders</li>
                      <li>Open files directly from search results</li>
                      <li>Separate results into folders and files</li>
                      <li>Sort search results</li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div id="about-display-modes" className="space-y-4 scroll-mt-24">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Grid3x3 className="h-5 w-5 text-primary" />
                      Display Modes
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>Grid View mode with item cards</li>
                      <li>List View mode with table representation</li>
                      <li>Instant switching between modes</li>
                      <li>Save user preferences in localStorage</li>
                      <li>Responsive grid for different screen sizes</li>
                      <li>Hover effects and visual feedback</li>
                    </ul>
                  </div>

                  <div id="about-sorting" className="space-y-4 scroll-mt-24">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <ArrowUpDown className="h-5 w-5 text-primary" />
                      Sorting and Organization
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>Sort by name (alphabetical, A-Z / Z-A)</li>
                      <li>Sort by modification date (new/old)</li>
                      <li>Separate display of folders and files</li>
                      <li>Mixed display (folders and files together)</li>
                      <li>Customizable folder position (top or mixed)</li>
                      <li>Save sorting settings between sessions</li>
                      <li>Visual indicators of current sorting</li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      User Interface
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>Modern design based on Shadcn UI</li>
                      <li>Fully responsive interface (desktop, tablet, mobile)</li>
                      <li>Context menus (right-click) for quick actions</li>
                      <li>Dropdown menus with icons for each action</li>
                      <li>Toast notifications for user feedback</li>
                      <li>Modal windows for important operations</li>
                      <li>Loading indicators (spinners) for async operations</li>
                      <li>Error handling with clear messages</li>
                      <li>Empty states with helpful hints</li>
                      <li>Tooltips for additional information</li>
                    </ul>
                  </div>

                  <div id="about-security" className="space-y-4 scroll-mt-24">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security and Validation
                    </h3>
                    <ul className="space-y-2 list-disc list-inside ml-2">
                      <li>File type validation before upload</li>
                      <li>File size check (maximum 10MB)</li>
                      <li>File and folder name sanitization</li>
                      <li>Protection against invalid characters in names</li>
                      <li>Empty name validation</li>
                      <li>Name length limit (maximum 255 characters)</li>
                      <li>Confirmation for deletion of important elements</li>
                      <li>Data isolation between different Data Rooms</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Additional Features
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Information dialogs with details about files and folders (size, dates, item count)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Breadcrumbs with support for collapsing long paths</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Visual icons for different file types (PDF, Word, Excel, TXT, CSV)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>File size formatting (KB, MB, GB)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Date formatting in readable format</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Support for deep folder nesting (10+ levels)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Automatic application state saving</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Edge case handling (duplicate names, empty folders, large files)</span>
                    </div>
                  </div>
                </div>

                <div id="about-scalability" className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20 scroll-mt-24">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Scalability and Extensibility
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p>
                      <strong className="text-foreground">Application architecture</strong> is designed with future growth and feature expansion in mind:
                    </p>
                    <ul className="space-y-2 list-disc list-inside ml-4">
                      <li><strong>Modular structure:</strong> Components are separated by functionality, making it easy to add new features</li>
                      <li><strong>Centralized state management:</strong> Redux Toolkit provides predictable data management and simplifies integration of new features</li>
                      <li><strong>TypeScript typing:</strong> Full typing ensures safety when adding new functionality</li>
                      <li><strong>Data abstraction:</strong> IndexedDB is wrapped in a convenient API that can easily be replaced with a real backend</li>
                      <li><strong>Component architecture:</strong> Reusable UI components simplify creation of new interfaces</li>
                    </ul>
                    <p className="mt-4">
                      <strong className="text-foreground">Potential development directions:</strong>
                    </p>
                    <ul className="space-y-2 list-disc list-inside ml-4">
                      <li>Integration with cloud storage (AWS S3, Google Cloud Storage, Azure Blob)</li>
                      <li>Access control system and user roles</li>
                      <li>Document versioning and change history</li>
                      <li>Commenting and annotations on documents</li>
                      <li>Full-text search by file content (OCR, indexing)</li>
                      <li>Export and import folder structures</li>
                      <li>Document sharing with temporary links</li>
                      <li>Audit log of all user actions</li>
                      <li>Integration with external systems via API</li>
                      <li>Mobile application (React Native)</li>
                      <li>Offline mode with synchronization</li>
                      <li>Advanced analytics and reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card id="business" className="p-8 scroll-mt-24 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">For Business</h2>
              </div>

              <div className="space-y-8">
                <div id="business-why-choose" className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border scroll-mt-24">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Why Choose Data Room?</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Target className="h-5 w-5" />
                        <h4 className="font-semibold text-foreground">Efficiency</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reduce document search time by 80%. An intuitive interface and powerful search allow 
                        you to find the files you need in seconds, not minutes.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Shield className="h-5 w-5" />
                        <h4 className="font-semibold text-foreground">Security</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Isolated repositories for each project. Access control and data validation 
                        ensure protection of confidential information.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Zap className="h-5 w-5" />
                        <h4 className="font-semibold text-foreground">Performance</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Instant loading and interface response. Optimized work with large volumes 
                        of data without loss of speed.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">Applications in Various Industries</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-background/50">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Due Diligence and M&A Transactions
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Perfect solution for conducting due diligence in mergers and acquisitions. Organize 
                        thousands of documents by category, ensuring quick access for investors and auditors.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Structured storage of financial reports</li>
                        <li>Organization of legal documents</li>
                        <li>Quick access for all transaction participants</li>
                      </ul>
                    </Card>

                    <Card className="p-6 bg-background/50">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Corporate Document Management
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Centralized repository for all corporate documents. Simplify work 
                        with contracts, reports, and internal documents.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Single point of access to documents</li>
                        <li>Versioning and change history</li>
                        <li>Simplified navigation by departments</li>
                      </ul>
                    </Card>

                    <Card className="p-6 bg-background/50">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Legal and Consulting Services
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Organize documents by clients and projects. Quick search and access to needed 
                        materials increase team productivity.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Document isolation by clients</li>
                        <li>Quick search by projects</li>
                        <li>Professional presentation of materials</li>
                      </ul>
                    </Card>

                    <Card className="p-6 bg-background/50">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Research and Development
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Structure research materials, patents, technical documentation. 
                        Support for various file formats makes the system universal.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Organization by topics and projects</li>
                        <li>Support for technical formats</li>
                        <li>Quick access to historical data</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <div id="business-advantages" className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border scroll-mt-24">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Key Advantages</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Time Savings</h4>
                          <p className="text-sm text-muted-foreground">
                            Reduce document search time from hours to seconds. Instant search and 
                            intuitive navigation save up to 20 hours of working time per month.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Scalability</h4>
                          <p className="text-sm text-muted-foreground">
                            The system easily scales from small projects to enterprise solutions 
                            with thousands of documents and hundreds of users.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Zero Learning Curve</h4>
                          <p className="text-sm text-muted-foreground">
                            Intuitive interface familiar from working with file systems. 
                            New users start working productively from day one.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Risk Reduction</h4>
                          <p className="text-sm text-muted-foreground">
                            Data validation, version control, and project isolation minimize risks 
                            of loss or misuse of documents.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Professional Image</h4>
                          <p className="text-sm text-muted-foreground">
                            Modern, clean interface creates a professional impression on clients, 
                            partners, and investors when presenting documents.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Integration Flexibility</h4>
                          <p className="text-sm text-muted-foreground">
                            Architecture allows easy integration with existing corporate 
                            systems and cloud services.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="business-roi" className="bg-primary/10 p-6 rounded-lg border border-primary/20 scroll-mt-24">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">ROI and Business Value</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">80%</div>
                      <p className="text-sm text-muted-foreground">Reduction in document search time</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">20+</div>
                      <p className="text-sm text-muted-foreground">Hours of working time saved per month</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">100%</div>
                      <p className="text-sm text-muted-foreground">Compatibility with existing processes</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* TECHNICAL DETAILS */}
            <Card id="technical" className="p-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <Code className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Technical Details</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Technology Stack</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Frontend Framework
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <strong className="text-foreground">React 18+</strong>
                          <p className="text-muted-foreground mt-1">
                            Modern library for building user interfaces. Uses functional components with hooks, 
                            ensuring clean and reusable code.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">TypeScript</strong>
                          <p className="text-muted-foreground mt-1">
                            Full typing of the entire application ensures type safety, autocomplete 
                            in IDE, and early error detection during development.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">Vite</strong>
                          <p className="text-muted-foreground mt-1">
                            Lightning-fast bundler and dev server. HMR (Hot Module Replacement) provides 
                            instant updates of changes without page reload.
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <Box className="h-5 w-5 text-primary" />
                        UI and Styling
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <strong className="text-foreground">Tailwind CSS</strong>
                          <p className="text-muted-foreground mt-1">
                            Utility-first CSS framework for rapid interface development. Allows creating 
                            responsive designs without writing custom CSS.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">Shadcn UI</strong>
                          <p className="text-muted-foreground mt-1">
                            Collection of high-quality, accessible components based on Radix UI. Components 
                            are copied into the project, providing full control over the code.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">Radix UI</strong>
                          <p className="text-muted-foreground mt-1">
                            Low-level primitives for building accessible components. Provides 
                            keyboard navigation, focus management, ARIA attributes out of the box.
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        State Management
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <strong className="text-foreground">Redux Toolkit (RTK)</strong>
                          <p className="text-muted-foreground mt-1">
                            Official recommended way to work with Redux. Simplifies writing Redux logic, 
                            includes built-in support for async operations via createAsyncThunk.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">React-Redux</strong>
                          <p className="text-muted-foreground mt-1">
                            Official React bindings for Redux. Typed hooks (useAppSelector, 
                            useAppDispatch) ensure safe work with state.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">Redux Slices</strong>
                          <p className="text-muted-foreground mt-1">
                            Modular state organization: dataroomSlice, folderSlice, fileSlice, uiSlice, 
                            settingsSlice. Each slice is responsible for its own domain area.
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <DbIcon className="h-5 w-5 text-primary" />
                        Data Storage
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <strong className="text-foreground">IndexedDB</strong>
                          <p className="text-muted-foreground mt-1">
                            Client-side NoSQL database for storing large volumes of structured data. 
                            Supports transactions, indexes, and asynchronous operations.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">LocalStorage</strong>
                          <p className="text-muted-foreground mt-1">
                            Used for storing user settings (display mode, sorting, 
                            folder position). Easily synchronizes between tabs.
                          </p>
                        </div>
                        <div>
                          <strong className="text-foreground">DB API Abstraction</strong>
                          <p className="text-muted-foreground mt-1">
                            All database operations are encapsulated in the db.ts module. This allows easy replacement 
                            of IndexedDB with a real backend API without changing the rest of the code.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div id="technical-architecture" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Application Architecture</h3>
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-lg mb-3 text-foreground">Project Structure</h4>
                        <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm space-y-1">
                          <div>src/</div>
                          <div className="ml-4">components/          # React components</div>
                          <div className="ml-8">ui/                  # Base UI components (Shadcn)</div>
                          <div className="ml-8">dialogs/             # Modal windows</div>
                          <div className="ml-4">pages/               # Application pages</div>
                          <div className="ml-4">store/               # Redux store and slices</div>
                          <div className="ml-4">lib/                 # Utilities and helpers</div>
                          <div className="ml-8">db.ts                 # IndexedDB wrapper</div>
                          <div className="ml-8">utils.ts              # Helper functions</div>
                          <div className="ml-8">validators.ts         # Data validation</div>
                          <div className="ml-4">hooks/               # Custom React hooks</div>
                          <div className="ml-4">types/               # TypeScript types</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-lg mb-3 text-foreground">State Management</h4>
                        <div className="space-y-3 text-sm">
                          <p className="text-muted-foreground">
                            The application uses centralized state management through Redux Toolkit:
                          </p>
                          <ul className="list-disc list-inside ml-4 space-y-2 text-muted-foreground">
                            <li><strong className="text-foreground">dataroomSlice:</strong> Data Room management (create, delete, select active)</li>
                            <li><strong className="text-foreground">folderSlice:</strong> Folder management and navigation (current folder, folder list)</li>
                            <li><strong className="text-foreground">fileSlice:</strong> File management (upload, view, delete)</li>
                            <li><strong className="text-foreground">uiSlice:</strong> UI state (open dialogs, selected items)</li>
                            <li><strong className="text-foreground">settingsSlice:</strong> User settings (display mode, sorting)</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-lg mb-3 text-foreground">Async Operations</h4>
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <p>
                            All IndexedDB operations are performed through <strong className="text-foreground">createAsyncThunk</strong> from Redux Toolkit:
                          </p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Automatic loading/error state management</li>
                            <li>Error handling at thunk level</li>
                            <li>Optimistic UI updates</li>
                            <li>API delay mocking for realistic UX</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div id="technical-solutions" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Key Technical Solutions</h3>
                  <div className="space-y-6">
                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        File Processing
                      </h4>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">File Upload:</strong> File API is used to read files into ArrayBuffer, 
                          which is then saved to IndexedDB. Support for multiple uploads with error handling for each file separately.
                        </p>
                        <p>
                          <strong className="text-foreground">Folder Upload:</strong> Two methods are supported for folder uploads:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li><strong className="text-foreground">File System Access API</strong> (Chrome/Edge): Uses <code className="bg-muted px-1 rounded">showDirectoryPicker()</code> to recursively process folders, including empty folders. Recursively traverses directory structure and processes all files and subfolders.</li>
                          <li><strong className="text-foreground">webkitdirectory</strong> (Firefox/Safari): Uses HTML5 directory input attribute to select folders. Processes <code className="bg-muted px-1 rounded">webkitRelativePath</code> to reconstruct folder hierarchy. Empty folders require at least one file.</li>
                        </ul>
                        <p>
                          <strong className="text-foreground">Drag & Drop Folders:</strong> Uses <code className="bg-muted px-1 rounded">DataTransfer.items</code> with <code className="bg-muted px-1 rounded">webkitGetAsEntry()</code> to detect and process folder drops. Recursively processes <code className="bg-muted px-1 rounded">FileSystemDirectoryEntry</code> to extract all files and folders.
                        </p>
                        <p>
                          <strong className="text-foreground">PDF Viewing:</strong> Blob URL is created from ArrayBuffer, which is then 
                          displayed in an iframe. Automatic URL cleanup when closing the viewer to prevent memory leaks.
                        </p>
                        <p>
                          <strong className="text-foreground">Word Viewing:</strong> The <code className="bg-muted px-1 rounded">mammoth</code> library 
                          converts .docx files to HTML while preserving formatting.
                        </p>
                        <p>
                          <strong className="text-foreground">Excel Viewing:</strong> The <code className="bg-muted px-1 rounded">xlsx</code> library 
                          parses Excel files and converts them to HTML tables. Support for multiple sheets with switching between them.
                        </p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Search and Filtering
                      </h4>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Search Implementation:</strong> <code className="bg-muted px-1 rounded">useMemo</code> is used 
                          to memoize search results. Search is performed on file and folder names using <code className="bg-muted px-1 rounded">includes()</code> 
                          for partial matching (case-insensitive).
                        </p>
                        <p>
                          <strong className="text-foreground">Path Building:</strong> Recursive functions <code className="bg-muted px-1 rounded">buildFolderPath</code> 
                          and <code className="bg-muted px-1 rounded">buildFilePath</code> build full paths to elements for display in search results.
                        </p>
                        <p>
                          <strong className="text-foreground">Hotkeys:</strong> Global keyboard event handlers for quick 
                          access to search (Ctrl+K / Cmd+K) and closing dialogs (Escape).
                        </p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <FolderTree className="h-5 w-5 text-primary" />
                        Navigation and Hierarchy
                      </h4>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Folder Tree:</strong> Recursive component <code className="bg-muted px-1 rounded">FolderTreeItem</code> 
                          displays folder hierarchy. Expand/collapse state is managed locally in each component via <code className="bg-muted px-1 rounded">useState</code>.
                        </p>
                        <p>
                          <strong className="text-foreground">Breadcrumbs:</strong> Dynamic path building from root to current folder. 
                          Automatic collapsing of long paths with display of hidden elements in dropdown menu.
                        </p>
                        <p>
                          <strong className="text-foreground">Visual Indicators:</strong> CSS styles for displaying hierarchy lines, 
                          similar to file managers. Support for up to 10+ levels of nesting with compact indentation.
                        </p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Performance Optimization
                      </h4>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Memoization:</strong> Using <code className="bg-muted px-1 rounded">useMemo</code> 
                          to cache sorted lists of files and folders, search results. Recalculation occurs only when dependencies change.
                        </p>
                        <p>
                          <strong className="text-foreground">Lazy Loading:</strong> Files are loaded from IndexedDB only when opening 
                          the viewer, not when displaying the list. This significantly speeds up initial page load.
                        </p>
                        <p>
                          <strong className="text-foreground">Virtualization:</strong> For large lists, virtualization can easily be added 
                          via libraries like <code className="bg-muted px-1 rounded">react-window</code> or <code className="bg-muted px-1 rounded">react-virtual</code>.
                        </p>
                        <p>
                          <strong className="text-foreground">Debouncing:</strong> Search can be optimized through debouncing to reduce 
                          the number of calculations when typing quickly.
                        </p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Validation and Error Handling
                      </h4>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">File Validation:</strong> The <code className="bg-muted px-1 rounded">validators.ts</code> module 
                          contains functions for checking file types, sizes, and names. Validation is performed on the client before upload.
                        </p>
                        <p>
                          <strong className="text-foreground">Sanitization:</strong> The <code className="bg-muted px-1 rounded">sanitizeFileName</code> function 
                          removes invalid characters from file and folder names, preventing filesystem issues.
                        </p>
                        <p>
                          <strong className="text-foreground">Duplicate Handling:</strong> The <code className="bg-muted px-1 rounded">generateUniqueName</code> function 
                          automatically adds suffixes (1), (2) to file names when duplicates are detected.
                        </p>
                        <p>
                          <strong className="text-foreground">Error Boundaries:</strong> React Error Boundaries can be added for graceful 
                          error handling at the component level.
                        </p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Security
                      </h4>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Data Isolation:</strong> Each Data Room is isolated at the database level. 
                          All queries are filtered by <code className="bg-muted px-1 rounded">dataRoomId</code>, preventing data leakage between projects.
                        </p>
                        <p>
                          <strong className="text-foreground">Client-side Validation:</strong> All user inputs are validated before 
                          saving. This prevents saving incorrect data and protects against XSS attacks.
                        </p>
                        <p>
                          <strong className="text-foreground">Type Safety:</strong> TypeScript provides type safety at compile time, 
                          preventing many classes of errors.
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>

                <div id="technical-tools" className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Development Tools</h3>
                  <Card className="p-6">
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground">Build and Development</h4>
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                          <li><strong className="text-foreground">Vite:</strong> Fast build and HMR</li>
                          <li><strong className="text-foreground">TypeScript:</strong> Compilation with type checking</li>
                          <li><strong className="text-foreground">ESLint:</strong> Code linting</li>
                          <li><strong className="text-foreground">Prettier:</strong> Code formatting</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground">Libraries</h4>
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                          <li><strong className="text-foreground">react-router-dom:</strong> Client-side routing</li>
                          <li><strong className="text-foreground">mammoth:</strong> Word to HTML conversion</li>
                          <li><strong className="text-foreground">xlsx:</strong> Excel file parsing</li>
                          <li><strong className="text-foreground">lucide-react:</strong> Icons</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Patterns and Practices</h3>
                  <Card className="p-6">
                    <div className="space-y-4 text-sm text-muted-foreground">
                      <div>
                        <strong className="text-foreground">Component Composition:</strong> Components are built on composition principles, 
                        ensuring reusability and ease of testing.
                      </div>
                      <div>
                        <strong className="text-foreground">Custom Hooks:</strong> Logic is extracted into reusable hooks (useAppSelector, 
                        useAppDispatch), simplifying work with Redux.
                      </div>
                      <div>
                        <strong className="text-foreground">Separation of Concerns:</strong> Clear separation into layers: UI components, 
                        business logic (Redux), data work (db.ts), utilities.
                      </div>
                      <div>
                        <strong className="text-foreground">DRY Principle:</strong> Common functions are extracted into utilities (formatDate, formatFileSize, 
                        getFileIcon), eliminating code duplication.
                      </div>
                      <div>
                        <strong className="text-foreground">Type Safety:</strong> All data is typed through TypeScript interfaces, 
                        ensuring safety and autocomplete in IDE.
                      </div>
                    </div>
                  </Card>
                </div>

                <div id="technical-production" className="bg-muted/50 p-6 rounded-lg border scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Production Readiness</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Implemented:</h4>
                      <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                        <li>Handling of all edge cases</li>
                        <li>Validation of all user inputs</li>
                        <li>Error handling with clear messages</li>
                        <li>Performance optimization</li>
                        <li>Responsive design</li>
                        <li>Accessibility (ARIA attributes via Radix UI)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Can be added for production:</h4>
                      <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-4">
                        <li>Unit and integration tests (Jest, React Testing Library)</li>
                        <li>E2E tests (Playwright, Cypress)</li>
                        <li>Error monitoring (Sentry)</li>
                        <li>Analytics (Google Analytics, Mixpanel)</li>
                        <li>User action logging</li>
                        <li>Bundle size optimization (code splitting, lazy loading)</li>
                        <li>PWA functionality (Service Workers, offline mode)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
