# My agent: APHA Community & Learning Assistant

One-liner: A conversational agent that helps Pranic Healing students and practitioners discover events, track their certification journey, and find local study groups with a catalog of APHA workshops and community resources.

Tool coverage:
- Memory: User's completed courses (e.g., Basic Pranic Healing, Advanced, Psychotherapy), certification goal (e.g., Associate Healer), preferred format (online/in-person), and city/region.
- Tools: Event lookup/filtering by course level and location, study group finder, and FAQ knowledge retrieval for APHA policies & Pranic Healing principles.
- Catalog/UI: Upcoming APHA workshops, Twin Hearts meditation schedules, and local study groups rendered as rich cards and tables (A2UI).
- Image gen: Custom course milestone badges and event promotional banners.
- Sandbox: Workshop bundle pricing and early-bird registration fee calculations.

Core rails (everyone): memory, tools, eval, deploy, frontend
My stretch menu (pick later): A2UI display cards/tables, RAG knowledge retrieval, image generation, code sandbox fee calculator
First eval question: "I've taken Basic Pranic Healing. What upcoming Advanced courses can I take near Los Angeles, and what are the prerequisites?"
