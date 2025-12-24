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
import { LogOut, Home, Shield, Bell, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="messages" className="relative">
              <Mail className="w-4 h-4 mr-1" />
              Messages
              {unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="relative">
              <Bell className="w-4 h-4 mr-1" />
              Activity
              {unreadActivity > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {unreadActivity}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectsManager />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificatesManager />
          </TabsContent>

          <TabsContent value="resume">
            <ResumeManager />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesManager />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
