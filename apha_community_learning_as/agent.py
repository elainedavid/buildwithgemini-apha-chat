import os
import requests
from dotenv import load_dotenv
from google.adk.agents import Agent
load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "qwiklabs-gcp-04-a63326fe2771")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
CORPUS_NAME = "projects/871461648659/locations/us-central1/ragCorpora/6615444804979392512"

def consult_pranic_docs(query: str = "") -> str:
    """Searches the official grounded Pranic Healing knowledge base (what is prana, names across cultures, energy anatomy, 5-step healing process, Twin Hearts meditation, Pranic Breathing, Superbrain Yoga, course levels, and community events). Call this tool whenever answering questions about Pranic Healing concepts, techniques, courses, or events."""
    import google.auth
    import google.auth.transport.requests

    try:
        credentials, project = google.auth.default()
        auth_req = google.auth.transport.requests.Request()
        credentials.refresh(auth_req)
        token = credentials.token
    except Exception as e:
        return f"Auth error: {e}"

    if not query:
        query = "Pranic Healing concepts principles techniques 5 steps meditation courses"

    url = f"https://us-central1-aiplatform.googleapis.com/v1beta1/projects/{PROJECT_ID}/locations/us-central1:retrieveContexts"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    body = {
        "vertexRagStore": {
            "ragResources": [
                {
                    "ragCorpus": CORPUS_NAME
                }
            ]
        },
        "query": {
            "text": query
        }
    }
    resp = requests.post(url, headers=headers, json=body)
    if resp.status_code != 200:
        return f"Retrieval error ({resp.status_code}): {resp.text}"
    
    data = resp.json()
    contexts = data.get("contexts", {}).get("contexts", [])
    passages = [c.get("text", "").strip() for c in contexts if c.get("text", "").strip()]
    return "\n\n---\n\n".join(passages) or "No relevant passages found."

root_agent = Agent(
    name="apha_learning_assistant",
    model="gemini-2.5-flash",
    instruction="""You are the official American Pranic Healing Association (APHA) Community & Learning Assistant (pranichealing.us).
Your mission is to welcome users, help them discover upcoming Pranic Healing events/workshops, track their learning pathway, connect with local study groups/Twin Hearts meditation sessions, and answer questions.

Crucial Instructions:
- When answering questions regarding Pranic Healing concepts, techniques, 5-step healing process, meditation methods, courses, or events, call the 'consult_pranic_docs' retrieval tool to get grounded information.
- Be compassionate, warm, and professional.""",
    tools=[consult_pranic_docs]
)
