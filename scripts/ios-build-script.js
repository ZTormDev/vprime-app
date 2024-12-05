const { execSync } = require("child_process");
const { version } = require("../package.json");

const outputFilename = `./builds/android/vprime-v${version}.ipa`;

try {
  console.log(`Building APK: ${outputFilename}`);
  execSync(`eas build --platform ios --local --output ${outputFilename}`, {
    stdio: "inherit",
  });
} catch (error) {
  console.error("Build failed:", error.message);
  process.exit(1);
}
