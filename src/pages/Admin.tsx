import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import ProjectsManager from '@/components/admin/ProjectsManager';
import CertificatesManager from '@/components/admin/CertificatesManager';
import ResumeManager from '@/components/admin/ResumeManager';
import MessagesManager from '@/components/admin/MessagesManager';
import ActivityManager from '@/components/admin/ActivityManager';
import HeroManager from '@/components/admin/HeroManager';
import AboutManager from '@/components/admin/AboutManager';
import ContactManager from '@/components/admin/ContactManager';
import { LogOut, Home, Shield, Bell, Mail, User, FileText, Briefcase, Award, Settings, Lock, UserCircle, Terminal, Skull } from 'lucide-react';
import SecuritySettings from '@/components/admin/SecuritySettings';
import ProfileManager from '@/components/admin/ProfileManager';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import MatrixRain from '@/components/MatrixRain';

const Admin = () => {
  const { user, isAdmin, adminLoading, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('projects');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadActivity, setUnreadActivity] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && !adminLoading && user && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
    }
  }, [isAdmin, adminLoading, loading, user, toast]);

  // Fetch unread counts
  useEffect(() => {
    if (isAdmin) {
      fetchUnreadCounts();
    }
  }, [isAdmin]);

  const fetchUnreadCounts = async () => {
    try {
      const [messagesResult, activityResult] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact' }).eq('is_read', false),
        supabase.from('activity_log').select('id', { count: 'exact' }).eq('is_read', false),
      ]);

      setUnreadMessages(messagesResult.count || 0);
      setUnreadActivity(activityResult.count || 0);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
    });
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-destructive rounded-lg p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact the site owner to get admin access.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Matrix Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <MatrixRain />
      </div>
      
      {/* Scan Line Effect */}
      <div className="scan-line" />

      {/* Header */}
      <header className="terminal-header-bar sticky top-0 z-50 backdrop-blur-md bg-terminal-darker/90">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Kali-inspired Logo */}
            <div className="kali-logo p-2 rounded-lg bg-terminal-green/10 border border-terminal-green/30">
              <Skull className="w-8 h-8 dragon-icon" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-terminal-green glow-text font-mono flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                <span className="hidden sm:inline">root@admin</span>
                <span className="sm:hidden">admin</span>
                <span className="text-terminal-cyan">:~#</span>
              </h1>
              <p className="text-xs text-terminal-green/60 font-mono">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              size="sm"
              className="hacker-button border-terminal-green/30 hover:border-terminal-green/60 hover:bg-terminal-green/10"
            >
              <Home className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">View Site</span>
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="destructive" 
              size="sm"
              className="hacker-button bg-terminal-red/20 border border-terminal-red/50 hover:bg-terminal-red/30"
            >
              <LogOut className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Navigation - Dropdown */}
          <div className="md:hidden mb-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full border-terminal-green/30 bg-terminal-dark/80 text-terminal-green font-mono">
                <SelectValue placeholder="$ select module_" />
              </SelectTrigger>
              <SelectContent className="bg-terminal-dark border-terminal-green/30">
                <SelectItem value="hero" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <User className="w-4 h-4" /> hero
                  </div>
                </SelectItem>
                <SelectItem value="about" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <FileText className="w-4 h-4" /> about
                  </div>
                </SelectItem>
                <SelectItem value="projects" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <Briefcase className="w-4 h-4" /> projects
                  </div>
                </SelectItem>
                <SelectItem value="certificates" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <Award className="w-4 h-4" /> certs
                  </div>
                </SelectItem>
                <SelectItem value="resume" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <FileText className="w-4 h-4" /> resume
                  </div>
                </SelectItem>
                <SelectItem value="contact" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <Settings className="w-4 h-4" /> contact
                  </div>
                </SelectItem>
                <SelectItem value="messages" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <Mail className="w-4 h-4" /> messages
                    {unreadMessages > 0 && (
                      <Badge className="ml-1 px-1 py-0 text-[10px] bg-terminal-red text-white">
                        {unreadMessages}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value="activity" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <Bell className="w-4 h-4" /> activity
                    {unreadActivity > 0 && (
                      <Badge className="ml-1 px-1 py-0 text-[10px] bg-terminal-red text-white">
                        {unreadActivity}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value="security" className="text-terminal-red hover:bg-terminal-red/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-red">&gt;</span>
                    <Lock className="w-4 h-4 text-terminal-red" /> security
                    <Badge className="ml-1 px-1 py-0 text-[10px] bg-terminal-red/20 text-terminal-red border border-terminal-red/50">!</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="profile" className="text-terminal-green hover:bg-terminal-green/10 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">&gt;</span>
                    <UserCircle className="w-4 h-4" /> profile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tablet & Desktop Navigation - Scrollable Tabs */}
          <ScrollArea className="hidden md:block w-full mb-8">
            <TabsList className="inline-flex w-max min-w-full justify-start gap-1 p-1 bg-terminal-dark/50 border border-terminal-green/20 rounded-lg">
              <TabsTrigger 
                value="hero" 
                className="text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <User className="w-3 h-3 mr-1" />
                ./hero
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <FileText className="w-3 h-3 mr-1" />
                ./about
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <Briefcase className="w-3 h-3 mr-1" />
                ./projects
              </TabsTrigger>
              <TabsTrigger 
                value="certificates" 
                className="text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <Award className="w-3 h-3 mr-1" />
                ./certs
              </TabsTrigger>
              <TabsTrigger 
                value="resume" 
                className="text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <FileText className="w-3 h-3 mr-1" />
                ./resume
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <Settings className="w-3 h-3 mr-1" />
                ./contact
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="relative text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <Mail className="w-3 h-3 mr-1" />
                ./mail
                {unreadMessages > 0 && (
                  <Badge className="ml-1 px-1 py-0 text-[10px] bg-terminal-red text-white animate-pulse">
                    {unreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="relative text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <Bell className="w-3 h-3 mr-1" />
                ./logs
                {unreadActivity > 0 && (
                  <Badge className="ml-1 px-1 py-0 text-[10px] bg-terminal-red text-white animate-pulse">
                    {unreadActivity}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="text-xs px-3 font-mono text-terminal-red/70 data-[state=active]:bg-terminal-red/20 data-[state=active]:text-terminal-red data-[state=active]:shadow-[0_0_10px_rgba(255,0,64,0.3)] hover:text-terminal-red hover:bg-terminal-red/10 transition-all duration-200"
              >
                <Lock className="w-3 h-3 mr-1" />
                ./sec
                <span className="ml-1 text-[10px] animate-pulse">⚠</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="text-xs px-3 font-mono text-terminal-green/70 data-[state=active]:bg-terminal-green/20 data-[state=active]:text-terminal-green data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:text-terminal-green hover:bg-terminal-green/10 transition-all duration-200"
              >
                <UserCircle className="w-3 h-3 mr-1" />
                ./me
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="bg-terminal-green/10" />
          </ScrollArea>

          <TabsContent value="hero" className="hacker-card p-4 md:p-6">
            <HeroManager />
          </TabsContent>

          <TabsContent value="about" className="hacker-card p-4 md:p-6">
            <AboutManager />
          </TabsContent>

          <TabsContent value="projects" className="hacker-card p-4 md:p-6">
            <ProjectsManager />
          </TabsContent>

          <TabsContent value="certificates" className="hacker-card p-4 md:p-6">
            <CertificatesManager />
          </TabsContent>

          <TabsContent value="resume" className="hacker-card p-4 md:p-6">
            <ResumeManager />
          </TabsContent>

          <TabsContent value="contact" className="hacker-card p-4 md:p-6">
            <ContactManager />
          </TabsContent>

          <TabsContent value="messages" className="hacker-card p-4 md:p-6">
            <MessagesManager />
          </TabsContent>

          <TabsContent value="activity" className="hacker-card p-4 md:p-6">
            <ActivityManager />
          </TabsContent>

          <TabsContent value="security" className="hacker-card p-4 md:p-6">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="profile" className="hacker-card p-4 md:p-6">
            <ProfileManager />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer Terminal Line */}
      <footer className="fixed bottom-0 left-0 right-0 bg-terminal-darker/90 border-t border-terminal-green/20 py-2 px-4 backdrop-blur-md z-40">
        <div className="container mx-auto flex items-center justify-between text-xs font-mono text-terminal-green/50">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
            system: active
          </span>
          <span className="hidden sm:block">session: encrypted</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
