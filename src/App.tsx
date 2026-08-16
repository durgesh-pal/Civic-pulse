import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { AICivicAssistant } from './components/ai/AICivicAssistant';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { NearbyIssuesPage } from './pages/NearbyIssuesPage';
import { MapExplorePage } from './pages/MapExplorePage';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { IssueManagementPage } from './pages/IssueManagementPage';
import { FieldWorkerDashboard } from './pages/FieldWorkerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { Search, X, MapPin } from 'lucide-react';
import { Issue } from './types';

const MainApp: React.FC = () => {
  const { role, toastMessage, showToast } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Issue[]>([]);

  // Keyboard shortcut '/' for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/issues?search=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.issues || []));
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render view router
  const renderCurrentView = () => {
    if (currentView.startsWith('issue_detail_')) {
      const issueId = currentView.replace('issue_detail_', '');
      return <IssueDetailPage issueId={issueId} onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'citizen_dashboard':
        return <CitizenDashboard onNavigate={handleNavigate} />;
      case 'report_issue':
        return <ReportIssuePage onNavigate={handleNavigate} />;
      case 'my_reports':
        return <MyReportsPage onNavigate={handleNavigate} />;
      case 'nearby_issues':
        return <NearbyIssuesPage onNavigate={handleNavigate} />;
      case 'map_explore':
        return <MapExplorePage onNavigate={handleNavigate} />;
      case 'authority_dashboard':
      case 'sla_monitoring':
        return <AuthorityDashboard onNavigate={handleNavigate} />;
      case 'issue_management':
        return <IssueManagementPage onNavigate={handleNavigate} />;
      case 'worker_dashboard':
      case 'my_resolved_tasks':
        return <FieldWorkerDashboard onNavigate={handleNavigate} />;
      case 'admin_dashboard':
      case 'spam_inspection':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'departments':
        return <DepartmentsPage onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'help_support':
        return <HelpSupportPage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const isLanding = currentView === 'landing';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Role-Aware Sidebar (hidden on public landing page for immersive hero) */}
        {!isLanding && (
          <div className="hidden md:block">
            <Sidebar currentView={currentView} onNavigate={handleNavigate} />
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0">{renderCurrentView()}</main>
      </div>

      {/* Government Standard Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating 24x7 JanMitra AI Assistant */}
      <AICivicAssistant />

      {/* Global Toast System */}
      <Toast message={toastMessage} onClose={() => showToast('', 'info')} />

      {/* Global Search Dialog Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket # (e.g. CIV-2026-00101), street address, or problem type..."
                className="flex-1 text-sm font-medium text-slate-800 focus:outline-hidden"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
              {searchQuery.trim() === '' ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Type to search across all registered civic complaints
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No issues found matching "{searchQuery}"
                </div>
              ) : (
                searchResults.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => {
                      setSearchOpen(false);
                      handleNavigate(`issue_detail_${issue.id}`);
                    }}
                    className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {issue.ticketNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{issue.location.address}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      {issue.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
