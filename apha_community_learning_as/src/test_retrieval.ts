import { consultPranicDocs } from './ragTool';

async function main() {
  console.log("Testing consultPranicDocs('What is prana and what are its sources?')...");
  const result = await consultPranicDocs({ query: "What is prana and what are its sources?" });
  console.log("\n--- RETRIEVAL RESULT ---");
  console.log(result);
}

main().catch(console.error);
