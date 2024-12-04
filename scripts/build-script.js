const { execSync } = require("child_process");
const { version } = require("../package.json");

const outputFilename = `../builds/android/vprime-v${version}.apk`;

try {
  console.log(`Building APK: ${outputFilename}`);
  execSync(`eas build --platform android --local --output ${outputFilename}`, {
    stdio: "inherit",
  });
} catch (error) {
  console.error("Build failed:", error.message);
  process.exit(1);
}
