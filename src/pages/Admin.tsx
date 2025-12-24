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
import { LogOut, Home, Shield, Bell, Mail, User, FileText, Briefcase, Award, Settings, Lock, UserCircle, Menu } from 'lucide-react';
import SecuritySettings from '@/components/admin/SecuritySettings';
import ProfileManager from '@/components/admin/ProfileManager';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary glow-text">
              &lt; Admin Panel /&gt;
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button onClick={handleSignOut} variant="destructive" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Navigation - Dropdown */}
          <div className="md:hidden mb-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Hero
                  </div>
                </SelectItem>
                <SelectItem value="about">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> About
                  </div>
                </SelectItem>
                <SelectItem value="projects">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Projects
                  </div>
                </SelectItem>
                <SelectItem value="certificates">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" /> Certificates
                  </div>
                </SelectItem>
                <SelectItem value="resume">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Resume
                  </div>
                </SelectItem>
                <SelectItem value="contact">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Contact
                  </div>
                </SelectItem>
                <SelectItem value="messages">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Messages
                    {unreadMessages > 0 && (
                      <Badge variant="destructive" className="ml-1 px-1 py-0 text-[10px]">
                        {unreadMessages}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value="activity">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Activity
                    {unreadActivity > 0 && (
                      <Badge variant="destructive" className="ml-1 px-1 py-0 text-[10px]">
                        {unreadActivity}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value="security">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Security
                  </div>
                </SelectItem>
                <SelectItem value="profile">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Profile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tablet & Desktop Navigation - Scrollable Tabs */}
          <ScrollArea className="hidden md:block w-full mb-8">
            <TabsList className="inline-flex w-max min-w-full justify-start gap-1 p-1">
              <TabsTrigger value="hero" className="text-xs px-3">
                <User className="w-3 h-3 mr-1" />
                Hero
              </TabsTrigger>
              <TabsTrigger value="about" className="text-xs px-3">
                <FileText className="w-3 h-3 mr-1" />
                About
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs px-3">
                <Briefcase className="w-3 h-3 mr-1" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="certificates" className="text-xs px-3">
                <Award className="w-3 h-3 mr-1" />
                Certs
              </TabsTrigger>
              <TabsTrigger value="resume" className="text-xs px-3">
                <FileText className="w-3 h-3 mr-1" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs px-3">
                <Settings className="w-3 h-3 mr-1" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="messages" className="relative text-xs px-3">
                <Mail className="w-3 h-3 mr-1" />
                Messages
                {unreadMessages > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1 py-0 text-[10px]">
                    {unreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="relative text-xs px-3">
                <Bell className="w-3 h-3 mr-1" />
                Activity
                {unreadActivity > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1 py-0 text-[10px]">
                    {unreadActivity}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs px-3">
                <Lock className="w-3 h-3 mr-1" />
                Security
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs px-3">
                <UserCircle className="w-3 h-3 mr-1" />
                Profile
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="hero">
            <HeroManager />
          </TabsContent>

          <TabsContent value="about">
            <AboutManager />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsManager />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificatesManager />
          </TabsContent>

          <TabsContent value="resume">
            <ResumeManager />
          </TabsContent>

          <TabsContent value="contact">
            <ContactManager />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesManager />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityManager />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
