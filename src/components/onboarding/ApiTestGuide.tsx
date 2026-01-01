import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiTestGuideProps {
  token?: string;
  tenantName?: string;
}

export function ApiTestGuide({ token, tenantName }: ApiTestGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
  const ingestUrl = `${supabaseUrl}/functions/v1/ingest`;

  const curlExample = `curl -X POST "${ingestUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-TOKEN: ${token || 'YOUR_TOKEN_HERE'}" \\
  -d '{
    "source_ip": "192.168.1.100",
    "path": "/admin/login.php",
    "method": "POST",
    "headers": {"User-Agent": "Mozilla/5.0"},
    "body": "username=admin&password=test123"
  }'`;

  const jsExample = `// JavaScript/Fetch Example
const response = await fetch("${ingestUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-TOKEN": "${token || 'YOUR_TOKEN_HERE'}"
  },
  body: JSON.stringify({
    source_ip: "192.168.1.100",
    path: "/admin/login.php", 
    method: "POST",
    headers: { "User-Agent": "Mozilla/5.0" },
    body: "username=admin&password=test123"
  })
});

const result = await response.json();
console.log(result);`;

  const pythonExample = `# Python Example
import requests

url = "${ingestUrl}"
headers = {
    "Content-Type": "application/json",
    "X-API-TOKEN": "${token || 'YOUR_TOKEN_HERE'}"
}
data = {
    "source_ip": "192.168.1.100",
    "path": "/admin/login.php",
    "method": "POST",
    "headers": {"User-Agent": "Mozilla/5.0"},
    "body": "username=admin&password=test123"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`;

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Disalin ke clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Test Ingest Endpoint
        </CardTitle>
        <CardDescription>
          Gunakan contoh berikut untuk mengirim event test ke sistem
          {tenantName && <span className="text-primary"> (Tenant: {tenantName})</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curl" className="mt-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{curlExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(curlExample, 'curl')}
              >
                {copied === 'curl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="js" className="mt-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{jsExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(jsExample, 'js')}
              >
                {copied === 'js' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="python" className="mt-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{pythonExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(pythonExample, 'python')}
              >
                {copied === 'python' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-medium text-sm mb-2">📝 Field yang didukung:</h4>
          <ul className="text-sm text-muted-foreground grid grid-cols-2 gap-1">
            <li><code className="text-xs bg-muted px-1 rounded">source_ip</code> - IP attacker (wajib)</li>
            <li><code className="text-xs bg-muted px-1 rounded">path</code> - URL path (wajib)</li>
            <li><code className="text-xs bg-muted px-1 rounded">method</code> - HTTP method (wajib)</li>
            <li><code className="text-xs bg-muted px-1 rounded">headers</code> - Request headers</li>
            <li><code className="text-xs bg-muted px-1 rounded">body</code> - Request body</li>
            <li><code className="text-xs bg-muted px-1 rounded">user_agent</code> - User agent</li>
            <li><code className="text-xs bg-muted px-1 rounded">country</code> - Country code</li>
            <li><code className="text-xs bg-muted px-1 rounded">service</code> - Service name</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
