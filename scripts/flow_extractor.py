import json
import os
from mitmproxy import http

class FlowSummarizer:
    def __init__(self):
        self.endpoints = {}
        self.graphql_calls = []
        self.hosts = {}
        self.output_path = os.environ.get("SUMMARY_OUTPUT_PATH", "summary.json")

    def response(self, flow: http.HTTPFlow):
        # Update hosts and endpoints
        host = flow.request.pretty_host
        method = flow.request.method
        url = flow.request.url
        
        # We want the key to be "METHOD URL"
        endpoint_key = f"{method} {url}"
        
        self.hosts[host] = self.hosts.get(host, 0) + 1
        self.endpoints[endpoint_key] = self.endpoints.get(endpoint_key, 0) + 1

        # Check for GraphQL
        if "/graphql" in flow.request.path:
            try:
                content = flow.request.get_text()
                if content:
                    data = json.loads(content)
                    if isinstance(data, list):
                        for item in data:
                            self._process_graphql_item(flow, item)
                    else:
                        self._process_graphql_item(flow, data)
            except Exception:
                # Silently ignore parse errors for non-JSON or malformed GraphQL
                pass

    def _process_graphql_item(self, flow, item):
        operation_name = item.get("operationName")
        variables = item.get("variables")
        sha256_hash = None
        
        extensions = item.get("extensions")
        if extensions and "persistedQuery" in extensions:
            sha256_hash = extensions["persistedQuery"].get("sha256Hash")

        self.graphql_calls.append({
            "host": flow.request.pretty_host,
            "operationName": operation_name,
            "path": flow.request.path,
            "sha256Hash": sha256_hash,
            "variables": variables
        })

    def done(self):
        # Sort keys for consistency
        summary = {
            "endpoints": dict(sorted(self.endpoints.items())),
            "graphql_calls": self.graphql_calls,
            "hosts": dict(sorted(self.hosts.items()))
        }
        
        with open(self.output_path, "w") as f:
            json.dump(summary, f, indent=2)

addons = [
    FlowSummarizer()
]
