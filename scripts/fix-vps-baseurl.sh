#!/bin/bash
python3 << 'PYEOF'
import json, glob
for p in ["/root/.openclaw/openclaw.json"] + glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    with open(p) as f: d=json.load(f)
    provs = d.get("models",{}).get("providers",{}) if "models" in d else d.get("providers",{})
    if "anthropic" in provs and "baseUrl" not in provs["anthropic"]:
        provs["anthropic"]["baseUrl"] = "https://api.anthropic.com"
        with open(p,"w") as f: json.dump(d,f,indent=2)
        print(f"  fixed: {p}")
print("done")
PYEOF
pkill -f openclaw-gateway
sleep 2
nohup openclaw-gateway >/dev/null 2>&1 &
sleep 5
openclaw agent --agent main --message 'diga oi' --local 2>&1 | head -3
