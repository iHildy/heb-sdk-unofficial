import json
import re

log_file = "heb-mcp-b84kgk4s8kgkwccocs08k8kg-232341943523-logs-2026-01-14-23-29-12.txt"

with open(log_file, "r") as f:
    for line in f:
        if "DEBUG: entryPoint(home-page) response:" in line:
            json_str = line.split("response: ", 1)[1].strip()
            try:
                data = json.loads(json_str)
                components = (
                    data.get("data", {})
                    .get("nativeEntryPoint", {})
                    .get("visualComponents", [])
                )

                print(f"Found {len(components)} components:")
                for i, comp in enumerate(components):
                    typename = comp.get("__typename", "Unknown")
                    print(f"\n[{i + 1}] {typename}")

                    # Print potential list fields to see where data might be hiding
                    for key, value in comp.items():
                        if isinstance(value, list):
                            print(f"  - {key}: {len(value)} items")
                        elif isinstance(value, dict):
                            print(f"  - {key}: (dict)")
                        else:
                            # print basic fields for context, truncate long strings
                            val_str = str(value)
                            if len(val_str) > 50:
                                val_str = val_str[:50] + "..."
                            print(f"  - {key}: {val_str}")

            except json.JSONDecodeError as e:
                print(f"Failed to decode JSON: {e}")
            break
