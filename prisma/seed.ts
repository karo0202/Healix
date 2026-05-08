import { ensureDemoData } from "../src/lib/demo-data";

async function main() {
  await ensureDemoData();
  console.log("Seed finished: demo doctors + sample appointment (if DB was empty).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
