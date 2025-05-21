import * as fs from 'fs';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production';
const certPath = path.resolve(process.cwd(), 'supabase-ca.crt');

if (isProd && process.env.SUPABASE_CA_CERT) {
  if (!fs.existsSync(certPath)) {
    const cert = process.env.SUPABASE_CA_CERT.replace(/\\n/g, '\n');
    fs.mkdirSync(path.dirname(certPath), { recursive: true });
    fs.writeFileSync(certPath, cert, 'utf-8');
    console.log('Wrote supabase-ca.crt from ENV');
  }
} else {
  console.log('🧪 Using local supabase-ca.crt');
}
