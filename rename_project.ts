import * as fs from 'fs';
import * as path from 'path';

function getBriefPath(workspaceDir: string): string | null {
  const primaryPath = path.join(workspaceDir, 'project_brief.md');
  if (fs.existsSync(primaryPath)) return primaryPath;
  const parentPath = path.join(workspaceDir, '..', 'project_brief.md');
  if (fs.existsSync(parentPath)) return parentPath;
  return null;
}

function deriveSlug(briefPath: string): string {
  const content = fs.readFileSync(briefPath, 'utf-8');
  const match = content.match(/^#[ \t]*My agent:[ \t]*(.+)$/m);
  if (!match) {
    throw new Error('Could not find "# My agent: <name>" in project_brief.md');
  }

  let rawName = match[1].trim();
  // Strip trailing parenthetical e.g. "Name (subtitle)"
  rawName = rawName.replace(/\s*\([^)]*\)\s*$/, '');

  // Convert to slug: lowercase, letters/numbers/hyphens only
  let slug = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Truncate to 26 characters max
  if (slug.length > 26) {
    slug = slug.substring(0, 26).replace(/-+$/, '');
  }

  return slug || 'my-agent';
}

function findProjectDir(workspaceDir: string): string | null {
  const rootManifest = path.join(workspaceDir, 'agents-cli-manifest.yaml');
  if (fs.existsSync(rootManifest)) return workspaceDir;

  const entries = fs.readdirSync(workspaceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const childManifest = path.join(workspaceDir, entry.name, 'agents-cli-manifest.yaml');
      if (fs.existsSync(childManifest)) {
        return path.join(workspaceDir, entry.name);
      }
    }
  }
  return null;
}

function main() {
  const workspaceDir = process.cwd();
  console.log(`Workspace directory: ${workspaceDir}`);

  const briefPath = getBriefPath(workspaceDir);
  if (!briefPath) {
    console.error('Error: project_brief.md not found.');
    process.exit(1);
  }
  console.log(`Found brief at: ${briefPath}`);

  const newSlug = deriveSlug(briefPath);
  console.log(`Derived new project slug: "${newSlug}"`);

  const projectDir = findProjectDir(workspaceDir);
  if (!projectDir) {
    console.error('Error: No scaffolded project found with agents-cli-manifest.yaml');
    process.exit(1);
  }
  console.log(`Found project directory at: ${projectDir}`);

  // 1. Update agents-cli-manifest.yaml
  const manifestPath = path.join(projectDir, 'agents-cli-manifest.yaml');
  if (fs.existsSync(manifestPath)) {
    let manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    manifestContent = manifestContent.replace(/^name:\s*"?[^"\n]+"?/m, `name: "${newSlug}"`);
    fs.writeFileSync(manifestPath, manifestContent, 'utf-8');
    console.log(`Updated name in ${manifestPath} to "${newSlug}"`);
  }

  // 2. Update pyproject.toml if present
  const pyprojectPath = path.join(projectDir, 'pyproject.toml');
  if (fs.existsSync(pyprojectPath)) {
    let pyprojectContent = fs.readFileSync(pyprojectPath, 'utf-8');
    pyprojectContent = pyprojectContent.replace(/^name\s*=\s*"[^"]+"/m, `name = "${newSlug}"`);
    fs.writeFileSync(pyprojectPath, pyprojectContent, 'utf-8');
    console.log(`Updated name in ${pyprojectPath} to "${newSlug}"`);
  }

  // 3. Rename project directory if needed
  const currentDirName = path.basename(projectDir);
  const parentDir = path.dirname(projectDir);
  if (currentDirName !== newSlug) {
    const targetDir = path.join(parentDir, newSlug);
    if (fs.existsSync(targetDir)) {
      console.warn(`Warning: Target directory ${targetDir} already exists. Skipping directory rename.`);
    } else {
      fs.renameSync(projectDir, targetDir);
      console.log(`Renamed project folder from ${projectDir} to ${targetDir}`);
    }
  } else {
    console.log(`Project directory name already matches "${newSlug}".`);
  }

  console.log('Successfully completed project rename using TypeScript.');
}

main();
