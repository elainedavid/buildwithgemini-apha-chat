import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';
dotenv.config();

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "qwiklabs-gcp-04-a63326fe2771";
const LOCATION = "us-central1";
const GCS_URI = "gs://qwiklabs-gcp-04-a63326fe2771-rag/rag/pranic_healing_guide.md";

async function main() {
  console.log("Getting Google Auth Token...");
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse.token;

  if (!token) {
    throw new Error("Failed to obtain access token");
  }

  // 1. Switch region's RAG managed DB to serverless mode
  console.log("1. Setting RAG Engine config to serverless mode...");
  const configRes = await fetch(
    `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/ragEngineConfig`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ragManagedDbConfig: {
          serverless: {},
        },
      }),
    }
  );
  console.log("Config status:", configRes.status);
  const configData = await configRes.json();
  console.log("Config res:", JSON.stringify(configData, null, 2));

  // 2. Create the Corpus
  console.log("2. Creating RAG Corpus...");
  const createRes = await fetch(
    `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/ragCorpora`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: "pranic-healing-guide-corpus",
      }),
    }
  );
  console.log("Create status:", createRes.status);
  const createData: any = await createRes.json();
  console.log("Create res:", JSON.stringify(createData, null, 2));

  let corpusName = createData.name;
  if (createData.metadata && createData.name?.includes("/operations/")) {
    console.log("Polling operation:", createData.name);
    let done = false;
    while (!done) {
      await new Promise((r) => setTimeout(r, 3000));
      const opRes = await fetch(
        `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/${createData.name}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const opData: any = await opRes.json();
      if (opData.done) {
        done = true;
        corpusName = opData.response?.name || opData.metadata?.ragCorpus;
        console.log("Operation finished. Corpus name:", corpusName);
      } else {
        console.log("Still waiting...");
      }
    }
  }

  if (!corpusName || corpusName.includes("/operations/")) {
    console.log("Fetching corpus list...");
    const listRes = await fetch(
      `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/ragCorpora`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const listData: any = await listRes.json();
    const found = (listData.ragCorpora || []).find((c: any) => c.displayName === "pranic-healing-guide-corpus");
    if (found) corpusName = found.name;
  }

  console.log("Final Corpus Name:", corpusName);

  // 3. Import File into Corpus
  console.log(`3. Importing ${GCS_URI} into ${corpusName}...`);
  const importRes = await fetch(
    `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/${corpusName}:importRagFiles`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        importRagFilesConfig: {
          gcsSource: {
            uris: [GCS_URI],
          },
          ragFileTransformationConfig: {
            chunkingConfig: {
              chunkSize: 512,
              chunkOverlap: 100,
            },
          },
        },
      }),
    }
  );
  console.log("Import status:", importRes.status);
  const importData = await importRes.json();
  console.log("Import res:", JSON.stringify(importData, null, 2));
}

main().catch(console.error);
