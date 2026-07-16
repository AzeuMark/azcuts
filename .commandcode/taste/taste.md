# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# workflow
- When implementing projects with defined phases, implement them one phase at a time and ask the user to confirm before proceeding to the next phase. Confidence: 0.78

# encryption
- Use Node.js built-in crypto (AES-256-CBC) instead of bcrypt for password encryption/decryption. Confidence: 0.70

# code-style
- Import and reuse existing functions from their source files instead of duplicating them in test files. Confidence: 0.70

# mongodb
- Store service images in MongoDB instead of the local filesystem uploads folder, and delete the image when the service is deleted to prevent orphaned data. Confidence: 0.70

