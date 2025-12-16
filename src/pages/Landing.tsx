import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Activity, Bell, Users, Lock, Zap, Globe, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Activity,
      title: 'Monitoring Realtime',
      description: 'Pantau semua serangan ke honeypot Anda secara langsung dengan dashboard interaktif.'
    },
    {
      icon: Shield,
      title: 'Skor Risiko Otomatis',
      description: 'Sistem scoring transparan berbasis rule: rate, path sensitif, pola brute force.'
    },
    {
      icon: Users,
      title: 'Multi-Tenant',
      description: 'Kelola banyak customer dalam satu platform dengan data terpisah dan aman.'
    },
    {
      icon: Bell,
      title: 'Alert Webhook',
      description: 'Notifikasi ke Discord, Telegram, Slack saat threshold terlampaui.'
    },
    {
      icon: Lock,
      title: 'Keamanan Tinggi',
      description: '2FA TOTP, rate limiting, audit log lengkap, token API ter-hash.'
    },
    {
      icon: BarChart3,
      title: 'Analitik Mendalam',
      description: 'Top IP, top path, tren mingguan, distribusi risiko dalam visualisasi menarik.'
    }
  ];

  const stats = [
    { value: '10M+', label: 'Events Diproses' },
    { value: '99.9%', label: 'Uptime' },
    { value: '500+', label: 'Tenant Aktif' },
    { value: '<1s', label: 'Latency' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg text-gradient">NeyPotAmablex</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link to="/login">
              <Button>Mulai Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Platform Monitoring Honeypot #1 di Indonesia</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto leading-tight mb-6">
            Deteksi Serangan Lebih Awal dengan{' '}
            <span className="text-gradient">Honeypot Monitoring</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Pantau, analisis, dan respon ancaman siber secara realtime. 
            Dilengkapi multi-tenant, RBAC, dan alert otomatis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/login">
              <Button size="lg" className="gap-2 text-lg px-8">
                Coba Sekarang <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Lihat Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Lengkap untuk Keamanan</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk monitoring honeypot dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass-card p-6 hover:border-primary/50 transition-all duration-300 group">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-muted-foreground text-lg">Tiga langkah mudah untuk memulai</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Deploy Honeypot', desc: 'Pasang honeypot decoy di infrastruktur Anda dengan Docker' },
              { step: '02', title: 'Konfigurasi Token', desc: 'Buat API token untuk mengirim events ke platform' },
              { step: '03', title: 'Monitor & Respon', desc: 'Pantau dashboard realtime dan terima alert saat ada ancaman' }
            ].map((item, idx) => (
              <div key={item.step} className="text-center relative">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Harga Transparan</h2>
            <p className="text-muted-foreground text-lg">Pilih paket sesuai kebutuhan Anda</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Gratis',
                desc: 'Untuk coba-coba',
                features: ['1 Tenant', '1.000 events/hari', 'Retensi 7 hari', 'Dashboard basic']
              },
              {
                name: 'Pro',
                price: 'Rp 499rb',
                period: '/bulan',
                desc: 'Untuk bisnis kecil',
                features: ['5 Tenant', '50.000 events/hari', 'Retensi 30 hari', 'Alert webhook', 'Ekspor CSV/JSON'],
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'Untuk enterprise',
                features: ['Unlimited Tenant', 'Unlimited events', 'Retensi 90 hari', 'SSO/SAML', 'Dedicated support', 'On-premise option']
              }
            ].map((plan) => (
              <div key={plan.name} className={`glass-card p-6 relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Populer
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Mulai Sekarang
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass-card p-12 text-center max-w-3xl mx-auto border-primary/30">
            <Globe className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Siap Mengamankan Infrastruktur Anda?</h2>
            <p className="text-muted-foreground mb-8">
              Mulai gratis hari ini. Tidak perlu kartu kredit.
            </p>
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Daftar Gratis <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-gradient">NeyPotAmablex</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 NeyPotAmablex. Honeypot Monitoring Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
