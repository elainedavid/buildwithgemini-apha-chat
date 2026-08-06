import { FunctionTool } from '@google/adk';
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

export const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "qwiklabs-gcp-04-a63326fe2771";
export const LOCATION = "us-central1";
export const HARDCODED_CORPUS_NAME = "projects/871461648659/locations/us-central1/ragCorpora/6615444804979392512";

/**
 * Queries the Vertex AI RAG Engine retrieveContexts REST API to retrieve grounded passages
 * from the Pranic Healing corpus.
 */
export async function consultPranicDocs(params: any): Promise<string> {
  let query = typeof params === 'string' ? params : (params?.query || params?.input || params?.text || params?.search_query || params?.q);
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    query = "Pranic Healing concepts principles techniques 5 steps meditation courses";
  }

  try {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
      return "Error: Could not retrieve Google Cloud authentication token.";
    }

    let corpusName = params.corpusName || HARDCODED_CORPUS_NAME;

    // Fallback lookup if corpus name is missing
    if (!corpusName) {
      const listRes = await fetch(
        `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/ragCorpora`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const listData: any = await listRes.json();
      const corpora = listData.ragCorpora || [];
      const found = corpora.find((c: any) => c.displayName === "pranic-healing-guide-corpus") || corpora[0];
      if (found) {
        corpusName = found.name;
      }
    }

    if (!corpusName) {
      return "Error: No RAG corpus found for Pranic Healing documents.";
    }

    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}:retrieveContexts`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vertexRagStore: {
          ragResources: [
            {
              ragCorpus: corpusName
            }
          ]
        },
        query: {
          text: query
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return `Retrieval API error (${response.status}): ${errText}`;
    }

    const data: any = await response.json();
    const contexts = data?.contexts?.contexts || [];
    const passages = contexts
      .map((c: any) => c.text?.trim())
      .filter((t: string) => t && t.length > 0);

    if (passages.length === 0) {
      return "No relevant passages found in the Pranic Healing knowledge base for this query.";
    }

    return passages.join("\n\n---\n\n");
  } catch (error: any) {
    return `Retrieval failed with exception: ${error?.message || error}`;
  }
}

export const pranicHealingRetrievalTool = new FunctionTool({
  name: "consultPranicDocs",
  description: "Searches the official grounded Pranic Healing knowledge base (what is prana, names across cultures, energy anatomy, 5-step healing process, Twin Hearts meditation, Pranic Breathing, Superbrain Yoga, course levels, and community events). Call this tool whenever answering questions about Pranic Healing concepts, techniques, courses, or events.",
  execute: async (params: any) => consultPranicDocs(params || {})
});
