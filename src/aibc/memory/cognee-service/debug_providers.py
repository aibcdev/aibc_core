
from cognee.infrastructure.llm.get_llm_client import LLMProvider

print("Valid Providers:")
for provider in LLMProvider:
    print(f"- {provider.value}")
