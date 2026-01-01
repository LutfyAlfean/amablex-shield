import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Building2, 
  Key, 
  Activity, 
  Bell,
  ChevronRight,
  X,
  Rocket,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '@/hooks/useTenants';
import { useApiTokens } from '@/hooks/useApiTokens';
import { useEvents } from '@/hooks/useEvents';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: typeof Building2;
  path: string;
  isComplete: boolean;
}

export function OnboardingGuide() {
  const navigate = useNavigate();
  const { tenants } = useTenants();
  const { tokens } = useApiTokens();
  const { events } = useEvents();
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('onboarding_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const steps: Step[] = [
    {
      id: 'tenant',
      title: 'Buat Tenant Pertama',
      description: 'Tenant adalah workspace untuk mengisolasi data honeypot per klien/proyek',
      icon: Building2,
      path: '/tenants',
      isComplete: tenants.length > 0,
    },
    {
      id: 'token',
      title: 'Generate API Token',
      description: 'Token diperlukan untuk mengirim event dari honeypot ke sistem',
      icon: Key,
      path: '/tokens',
      isComplete: tokens.length > 0,
    },
    {
      id: 'event',
      title: 'Kirim Event Pertama',
      description: 'Test endpoint ingest dengan mengirim event dari honeypot atau curl',
      icon: Activity,
      path: '/dashboard',
      isComplete: events.length > 0,
    },
    {
      id: 'alert',
      title: 'Setup Alert (Opsional)',
      description: 'Konfigurasi webhook Discord/Telegram untuk notifikasi real-time',
      icon: Bell,
      path: '/alerts',
      isComplete: false, // Optional step
    },
  ];

  const completedSteps = steps.filter(s => s.isComplete).length;
  const progress = (completedSteps / (steps.length - 1)) * 100; // Exclude optional step

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('onboarding_dismissed', 'true');
  };

  const handleReset = () => {
    setDismissed(false);
    localStorage.removeItem('onboarding_dismissed');
  };

  if (dismissed || completedSteps >= 3) {
    return null;
  }

  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 gap-2"
      >
        <BookOpen className="h-4 w-4" />
        Panduan Setup
      </Button>
    );
  }

  return (
    <Card className="glass-card border-primary/30 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Selamat Datang di NeyPot!</CardTitle>
              <CardDescription>Ikuti langkah-langkah berikut untuk memulai</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {completedSteps}/3
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isNext = !step.isComplete && steps.slice(0, index).every(s => s.isComplete || s.id === 'alert');
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                  isNext ? 'bg-primary/5 border border-primary/20' : ''
                } ${step.isComplete ? 'opacity-60' : ''}`}
                onClick={() => navigate(step.path)}
              >
                <div className={`p-2 rounded-full ${
                  step.isComplete 
                    ? 'bg-green-500/20 text-green-500' 
                    : isNext 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${step.isComplete ? 'line-through' : ''}`}>
                    {step.title}
                    {step.id === 'alert' && (
                      <Badge variant="secondary" className="ml-2 text-xs">Opsional</Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {isNext && (
                  <Button size="sm" variant="default">
                    Mulai <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Tutorial */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Cara Kerja NeyPot
          </h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li><strong>Tenant</strong> = Workspace untuk mengisolasi data per klien/proyek</li>
            <li><strong>API Token</strong> = Kunci untuk autentikasi honeypot saat mengirim event</li>
            <li><strong>Honeypot</strong> mengirim request ke <code className="bg-muted px-1 py-0.5 rounded text-xs">/api/ingest</code></li>
            <li><strong>Dashboard</strong> menampilkan semua event dengan risk scoring</li>
            <li><strong>Alert</strong> mengirim notifikasi ke Discord/Telegram saat threshold tercapai</li>
          </ol>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Tutup Panduan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
