# Patch: dpschen/vikunja main

- Base commit: 07272f6cdc886671064c1779f69c5550eec7623c
- Target commit: 8d26392a5904d6268aedaa30b722ce3cc5dbb304
- Target ref: dpschen/main

Apply by decoding the base64 and decompressing with xz to obtain a binary-safe patch:

```bash
base64 -d dpschen-main.diff.xz.base64 | xz -d > dpschen-main.patch
```

Then apply via:

```bash
git apply --binary dpschen-main.patch
```
