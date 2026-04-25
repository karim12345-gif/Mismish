const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "src");

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      callback(fullPath);
    }
  }
}

walk(basePath, (file) => {
  let content = fs.readFileSync(file, "utf8");
  const relativePath = path.relative(basePath, file);
  const depth = relativePath.split(path.sep).length - 1; // e.g., features/home/Home.tsx -> depth 2

  let prefix = "";
  for (let i = 0; i < depth; i++) prefix += "../";
  if (prefix === "") prefix = "./";

  // Replace all instances of `../../something` or `../../../something` with exact prefix depth if it's pointing to root domains
  content = content.replace(
    /(?:\.\.\/)+((?:context|hooks|services|navigation|components|assets)[/'"])/g,
    prefix + "$1",
  );

  // Specific fixes
  content = content.replace(
    /\.\/\.\.\/components\/AIAssistantBottomSheet/g,
    "../../components/AIAssistantBottomSheet",
  );

  // Auth screen specific index
  if (file.includes("src/screens/index.ts")) {
    content = content.replace(
      /..\/features\/auth\/screens/g,
      "../features/auth/screens",
    );
    content = content.replace(
      /\.\/unauthenticated/g,
      "../features/auth/screens",
    );
  }

  // Map Screen fixes
  if (file.includes("MapScreen.tsx")) {
    content = content.replace(/from "\.\/map"/g, 'from "./"');
  }

  // GuestAuthModal relative import issue
  if (file.includes("GuestAuthModal.tsx")) {
    content = content.replace(/..\/..\/..\/hooks/g, "../hooks");
  }

  // Quick fix for implicit any maps (TS7006)
  if (file.includes("Orders.screen.tsx")) {
    content = content.replace(
      /\(orders \?\? \[\]\)\.filter\(\(o\)/g,
      "(orders ?? []).filter((o: any)",
    );
    content = content.replace(
      /displayed\.map\(\(order\)/g,
      "displayed.map((order: any)",
    );
  }
  if (file.includes("SurpriseBag.screen.tsx")) {
    content = content.replace(
      /stores\?\.find\(\(s\)/g,
      "stores?.find((s: any)",
    );
    content = content.replace(
      /\(inventory \?\? \[\]\)\.map\(\(bag, index\)/g,
      "(inventory ?? []).map((bag: any, index: number)",
    );
  }
  if (file.includes("MapScreen.tsx")) {
    content = content.replace(
      /clusters\.map\(\(item, idx\)/g,
      "clusters.map((item: any, idx: number)",
    );
    content = content.replace(
      /FILTER_CHIPS\.map\(\(chip\)/g,
      "FILTER_CHIPS.map((chip: any)",
    );
  }
  if (file.includes("Checkout.screen.tsx")) {
    content = content.replace(
      /cartItems\.find\(\(i\)/g,
      "cartItems.find((i: any)",
    );
  }

  // Fix nested imports explicitly broken in specific files:
  if (
    file.includes("Orders.screen.tsx") &&
    content.includes("./components/GuestAuthModal")
  ) {
    content = content.replace(
      /\.\/components\/GuestAuthModal/g,
      "../../components/GuestAuthModal",
    );
  }
  if (file.includes("SurpriseBag.screen.tsx")) {
    content = content.replace(
      /\.\/components\/StoreItemCard/g,
      "./StoreItemCard",
    );
    content = content.replace(
      /\.\/components\/HowMismishWorksModal/g,
      "../../components/HowMismishWorksModal",
    );
    content = content.replace(
      /\.\/components\/SurpriseBagBottomSheet/g,
      "./SurpriseBagBottomSheet",
    );
    content = content.replace(
      /\.\/components\/AvailabilityTimeBottomSheet/g,
      "./AvailabilityTimeBottomSheet",
    );
    content = content.replace(
      /\.\.\/\.\.\/context\/CartContext/g,
      "../../context/CartContext",
    );
  }

  // Also fix auth start screen
  if (file.includes("AuthStart") && file.includes("screen.tsx")) {
    content = content.replace(/@components\/index/g, "../../../components");
  }

  fs.writeFileSync(file, content, "utf8");
});

console.log("Fix AST completed.");
