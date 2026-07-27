# Patch: go-vikunja/vikunja origin/main

- Base commit: 07272f6cdc886671064c1779f69c5550eec7623c
- Target commit: 48d202f3ced4645fe49f20278afe3a48fa4a259e
- Target ref: origin/main

Apply by decoding the base64 and decompressing with xz to obtain a binary-safe patch:

```bash
base64 -d go-vikunja-main.diff.xz.base64 | xz -d > go-vikunja-main.patch
```

Then apply via:

```bash
git apply --binary go-vikunja-main.patch
```
