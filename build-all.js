const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'YCC_POS_IMPLEMENTATION');

function run(cmd, cwd) {
  console.log(`Running: ${cmd} in ${cwd || root}`);
  execSync(cmd, { cwd: cwd || root, stdio: 'inherit', shell: true });
}

// Clean and create dist
const distPath = path.join(root, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });

// Install deps in root workspace
console.log('📦 Installing workspace dependencies...');
run('pnpm install --no-frozen-lockfile');

// Build POS
console.log('🔨 Building POS...');
run('pnpm install --no-frozen-lockfile', path.join(root, '04_CORE_POS'));
run('npx vite build', path.join(root, '04_CORE_POS'));

// Build KDS
console.log('🔨 Building KDS...');
run('pnpm install --no-frozen-lockfile', path.join(root, '05_KDS_SYSTEM'));
run('npx tsc && npx vite build', path.join(root, '05_KDS_SYSTEM'));

// Build Admin
console.log('🔨 Building Admin...');
run('pnpm install --no-frozen-lockfile', path.join(root, '06_ADMIN_PANEL'));
run('npx vite build', path.join(root, '06_ADMIN_PANEL'));

// Copy builds to dist
console.log('📁 Copying builds to dist...');
fs.cpSync(path.join(root, '04_CORE_POS/dist'), path.join(distPath, 'pos'), { recursive: true });
fs.cpSync(path.join(root, '05_KDS_SYSTEM/dist'), path.join(distPath, 'kds'), { recursive: true });
fs.cpSync(path.join(root, '06_ADMIN_PANEL/dist'), path.join(distPath, 'admin'), { recursive: true });

// Create landing page
const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YCC POS System</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #059669 0%, #065f46 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
    .apps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .app-card {
      background: rgba(255,255,255,0.1);
      border-radius: 1rem;
      padding: 2rem;
      text-decoration: none;
      color: white;
      transition: all 0.3s ease;
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
    }
    .app-card:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-5px);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    .app-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
    .app-desc { opacity: 0.8; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏌️‍♂️ YCC POS System</h1>
    <p>Sistema de Punto de Venta para Country Club</p>
    <div class="apps">
      <a href="/pos/" class="app-card">
        <div class="icon">💰</div>
        <div class="app-title">POS Terminal</div>
        <div class="app-desc">Terminal de ventas y cobro</div>
      </a>
      <a href="/kds/" class="app-card">
        <div class="icon">📋</div>
        <div class="app-title">KDS Cocina</div>
        <div class="app-desc">Pantalla de cocina y barra</div>
      </a>
      <a href="/admin/" class="app-card">
        <div class="icon">⚙️</div>
        <div class="app-title">Admin Panel</div>
        <div class="app-desc">Panel de administración</div>
      </a>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);

console.log('✅ All apps built and ready in YCC_POS_IMPLEMENTATION/dist/');
