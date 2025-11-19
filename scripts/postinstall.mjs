import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const publicDir = join(projectRoot, "public");
const chromiumDir = join(projectRoot, "node_modules", "@sparticuz", "chromium");
const binDir = join(chromiumDir, "bin");
const outputPath = join(publicDir, "chromium-pack.tar");

console.log("📦 Creating Chromium package...");
console.log("Project root:", projectRoot);
console.log("Chromium dir:", chromiumDir);
console.log("Bin dir:", binDir);

try {
  // Create public directory if it doesn't exist
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
    console.log("✅ Created public directory");
  }

  // Check if chromium directory exists
  if (!existsSync(chromiumDir)) {
    console.log("❌ @sparticuz/chromium not found in node_modules");
    console.log("💡 Run: npm install @sparticuz/chromium");
    process.exit(1);
  }

  // Check if bin directory exists
  if (!existsSync(binDir)) {
    console.log("❌ Chromium bin directory not found");
    console.log("📁 Contents of @sparticuz/chromium:");

    try {
      const contents = readdirSync(chromiumDir);
      console.log(contents);
    } catch (e) {
      console.log("Could not read directory");
    }

    // Try to find chromium in different locations
    console.log("🔍 Searching for chromium binary...");
    try {
      const findCmd =
        process.platform === "win32"
          ? "dir /s /b node_modules\\*chromium*"
          : 'find node_modules -name "*chromium*" -type f';

      const result = execSync(findCmd, { encoding: "utf8" });
      console.log("Found files:", result);
    } catch (findError) {
      console.log("Search failed:", findError.message);
    }

    process.exit(1);
  }

  // List contents of bin directory
  console.log("📁 Contents of bin directory:");
  try {
    const binContents = readdirSync(binDir);
    console.log(binContents);
  } catch (e) {
    console.log("Could not read bin directory");
  }

  // Create tar archive
  console.log("📦 Creating chromium-pack.tar...");

  if (process.platform === "win32") {
    // Windows: Use tar if available, otherwise copy files
    try {
      execSync(`tar -cf "${outputPath}" -C "${binDir}" .`, {
        stdio: "inherit",
        cwd: projectRoot,
      });
    } catch (tarError) {
      console.log("❌ Tar failed, trying copy method...");
      // Copy files to public/chromium
      const chromiumPublicDir = join(publicDir, "chromium");
      if (!existsSync(chromiumPublicDir)) {
        mkdirSync(chromiumPublicDir, { recursive: true });
      }
      execSync(`xcopy "${binDir}" "${chromiumPublicDir}" /E /I /H`, {
        stdio: "inherit",
      });
      console.log("✅ Chromium files copied to public/chromium/");
    }
  } else {
    // Linux/Mac: Use tar
    execSync(`tar -cf "${outputPath}" -C "${binDir}" .`, {
      stdio: "inherit",
      cwd: projectRoot,
    });
  }

  // Verify the archive was created
  if (existsSync(outputPath)) {
    let stats;
    try {
      stats = execSync(`du -h "${outputPath}"`).toString().trim();
    } catch (e) {
      // On Windows, use different command
      stats = execSync(`dir "${outputPath}"`).toString().trim();
    }
    console.log("✅ Chromium package created successfully!");
    console.log("📊 File info:", stats);
  } else {
    throw new Error("Archive file was not created");
  }
} catch (error) {
  console.error("❌ Failed to create Chromium package:", error.message);

  // Fallback: Create a simple approach
  console.log("🔄 Using simplified approach...");

  // Create a marker file to indicate Chromium setup
  const markerContent = `
# Chromium Setup
# This file indicates that Chromium setup was attempted
# For production, @sparticuz/chromium-min will handle Chromium automatically
# For local development, ensure Chrome is installed or set CHROME_EXECUTABLE_PATH
  `.trim();

  try {
    const markerPath = join(publicDir, "CHROMIUM_SETUP.md");
    execSync(`echo "${markerContent}" > "${markerPath}"`);
    console.log("✅ Created setup marker file");
  } catch (e) {
    console.log("Could not create marker file");
  }

  console.log("⚠️  Chromium setup completed with warnings");
  process.exit(0);
}
