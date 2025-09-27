# Patch: dpschen/vikunja main_non_agents

- Base commit: 07272f6cdc886671064c1779f69c5550eec7623c
- Target commit: 7671d2ea3efd59067d6d474a8a41bed6626affa9
- Target ref: dpschen/main_non_agents

Apply by decoding the base64 and decompressing with xz to obtain a binary-safe patch:

```bash
base64 -d dpschen-main_non_agents.diff.xz.base64 | xz -d > dpschen-main_non_agents.patch
```

Then apply via:

```bash
git apply --binary dpschen-main_non_agents.patch
```
