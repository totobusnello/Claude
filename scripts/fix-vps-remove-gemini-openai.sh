#!/bin/bash
# Remove all gemini-openai references from openclaw config and agent models
# Run: ssh root@187.77.234.79 'bash -s' < ~/Claude/scripts/fix-vps-remove-gemini-openai.sh

python3 << 'PYEOF'
import json, glob

# Clean openclaw.json
with open("/root/.openclaw/openclaw.json") as f: c=json.load(f)
provs = c.get("models",{}).get("providers",{})
if "gemini-openai" in provs:
    del provs["gemini-openai"]
    print("  openclaw.json: removed gemini-openai provider")

# Replace any gemini-openai refs in fallbacks
def clean_fallbacks(obj, path=""):
    if isinstance(obj, dict):
        for k,v in obj.items():
            if isinstance(v, str) and "gemini-openai" in v:
                obj[k] = v.replace("gemini-openai/", "gemini/")
                print(f"  {path}.{k}: replaced gemini-openai -> gemini")
            elif isinstance(v, list):
                for i,item in enumerate(v):
                    if isinstance(item, str) and "gemini-openai" in item:
                        v[i] = item.replace("gemini-openai/", "gemini/")
                        print(f"  {path}.{k}[{i}]: replaced gemini-openai -> gemini")
            elif isinstance(v, dict):
                clean_fallbacks(v, f"{path}.{k}")

clean_fallbacks(c)
with open("/root/.openclaw/openclaw.json","w") as f: json.dump(c,f,indent=2)
print("  openclaw.json saved")

# Clean all agent models.json
for p in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f: d=json.load(f)
    if "gemini-openai" in d.get("providers",{}):
        del d["providers"]["gemini-openai"]
        with open(p,"w") as f: json.dump(d,f,indent=2)
        print(f"  {p}: removed gemini-openai")

print("Done - all gemini-openai refs removed")
PYEOF

# Check remaining refs
echo "Remaining gemini-openai refs:"
grep -rc "gemini-openai" /root/.openclaw/openclaw.json /root/.openclaw/agents/*/agent/models.json 2>/dev/null | grep -v ":0$"
echo "(should be empty)"
