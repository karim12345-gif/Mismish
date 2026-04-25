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

// Global Replace map specifically for known path breaks based on depth changes:
walk(basePath, (file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // 1. GuestAuthModal moved from depth 4 to depth 2
  if (file.includes("GuestAuthModal.tsx")) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/hooks/g, "../hooks");
    content = content.replace(
      /\.\.\/\.\.\/\.\.\/\.\.\/assets/g,
      "../../assets",
    );
    modified = true;
  }

  // 3. Auth Screens moved from depth 3 to depth 4
  if (file.includes("src/features/auth/screens/")) {
    content = content.replace(/\.\.\/\.\.\/navigation/g, "../../../navigation");
    content = content.replace(/\.\.\/\.\.\/context/g, "../../../context");
    content = content.replace(/\.\.\/\.\.\/hooks/g, "../../../hooks");
    modified = true;
  }

  // 4. Auth Onboarding moved from depth 4 to depth 4 but different relative to components
  if (file.includes("src/features/auth/onboarding/")) {
    content = content.replace(
      /\.\.\/\.\.\/\.\.\/components/g,
      "../../../../components",
    );
  }

  // 5. Home Screen components path fix (from `./home/components` to `./components`)
  if (file.includes("Home.screen.tsx")) {
    content = content.replace(/\.\/home\/components/g, "./components");
    modified = true;
  }

  // 6. Map Screen components path fix (from `./map/components` to `./components`)
  if (file.includes("MapScreen.tsx")) {
    content = content.replace(/\.\/map\/components/g, "./components");
    content = content.replace(/\.\/map\//g, "./");
    modified = true;
  }
  if (file.includes("MapScreen.types.ts")) {
    content = content.replace(/\.\.\/\.\.\/services/g, "../../../services");
    modified = true;
  }

  // 7. Profile Screen / Settings Screen / Complete Profile Screen path fix
  if (file.includes("src/features/profile/screens/")) {
    // they moved from auth layers to depth 4
    content = content.replace(/\.\.\/\.\.\/context/g, "../../../context");
    content = content.replace(/\.\.\/\.\.\/hooks/g, "../../../hooks");
  }

  if (
    file.includes("Orders.screen.tsx") ||
    file.includes("Cart.screen.tsx") ||
    file.includes("SurpriseBag.screen.tsx") ||
    file.includes("Checkout.screen.tsx")
  ) {
    content = content.replace(/\.\.\/\.\.\/context/g, "../../../context");
    content = content.replace(/\.\.\/\.\.\/hooks/g, "../../../hooks");
    content = content.replace(/\.\.\/\.\.\/services/g, "../../../services");
    content = content.replace(/\.\.\/\.\.\/navigation/g, "../../../navigation");
  }

  if (file.includes("CartItem.tsx") || file.includes("CheckoutHeader.tsx")) {
    content = content.replace(
      /\.\.\/\.\.\/\.\.\/context/g,
      "../../../../context",
    );
  }

  // 8. General cleanup for any index.ts root exports pointing to unauthenticated
  if (file.includes("src/screens/index.ts")) {
    content = content.replace(
      /\.\/unauthenticated/g,
      "../features/auth/screens",
    );
    modified = true;
  }

  fs.writeFileSync(file, content, "utf8");
});

console.log("Fix imports completed");
