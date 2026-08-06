import os
import vertexai

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT") or "qwiklabs-gcp-04-a63326fe2771"
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION") or "us-central1"

print(f"Connecting to Vertex AI in project {PROJECT_ID}, location {LOCATION}...")
client = vertexai.Client(project=PROJECT_ID, location=LOCATION)

try:
    existing = list(client.agent_engines.list())
    if existing:
        print(f"Found {len(existing)} existing Agent Engine / Memory Bank instance(s):")
        for eng in existing:
            mb_id = eng.api_resource.name.split("/")[-1]
            print(f"  - Resource Name: {eng.api_resource.name} (ID: {mb_id})")
        
        first_id = existing[0].api_resource.name.split("/")[-1]
        print(f"\nReusing existing MEMORY_BANK_ID={first_id}")
        with open("memory_bank_id.txt", "w") as f:
            f.write(first_id)
        exit(0)
except Exception as e:
    print("Listing existing engines failed/skipped:", e)

print("Creating new Vertex AI Memory Bank instance...")
memory_bank = client.agent_engines.create()
resource_name = memory_bank.api_resource.name
memory_bank_id = resource_name.split("/")[-1]

print("\nSUCCESS!")
print("MEMORY_BANK_ID:", memory_bank_id)
print("resource_name:", resource_name)

with open("memory_bank_id.txt", "w") as f:
    f.write(memory_bank_id)
