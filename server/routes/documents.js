const express = require("express");
const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");

const router = express.Router();
const emptyContent = { type: "doc", content: [{ type: "paragraph" }] };
const normalizeJson = (value) => {
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, normalizeJson(value[key])]),
    );
  }
  return value;
};
const jsonMatches = (left, right) =>
  JSON.stringify(normalizeJson(left)) === JSON.stringify(normalizeJson(right));

router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        preview: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json({ documents });
  } catch (error) {
    console.error("Could not load account documents:", error);
    return res.status(500).json({ error: "Could not load your documents." });
  }
});

router.post("/", async (req, res) => {
  const { title, pageSettings } = req.body ?? {};
  if (title != null && typeof title !== "string") {
    return res.status(400).json({ error: "Document title must be text." });
  }
  if (pageSettings != null && (typeof pageSettings !== "object" || Array.isArray(pageSettings))) {
    return res.status(400).json({ error: "Page settings must be an object." });
  }
  try {
    const document = await prisma.document.create({
      data: {
        title: typeof title === "string" && title.trim() ? title.trim() : "Untitled Document",
        content: emptyContent,
        pageSettings: pageSettings ?? undefined,
        userId: req.user.userId,
      },
    });
    return res.status(201).json({ document });
  } catch (error) {
    console.error("Could not create account document:", error);
    return res.status(500).json({ error: "Could not create your document." });
  }
});

router.post("/sync", async (req, res) => {
  const { id, title, content, preview, wordCount, pageSettings, baseUpdatedAt, restoreDeleted = false } = req.body ?? {};
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "A document ID is required for sync." });
  }
  if (typeof title !== "string" || !content || typeof content !== "object" || Array.isArray(content)) {
    return res.status(400).json({ error: "Document title and content are required." });
  }
  if (preview != null && typeof preview !== "string") {
    return res.status(400).json({ error: "Document preview must be text." });
  }
  if (wordCount != null && (!Number.isInteger(wordCount) || wordCount < 0)) {
    return res.status(400).json({ error: "Word count must be a non-negative integer." });
  }
  if (pageSettings != null && (typeof pageSettings !== "object" || Array.isArray(pageSettings))) {
    return res.status(400).json({ error: "Page settings must be an object." });
  }
  if (baseUpdatedAt != null && (typeof baseUpdatedAt !== "string" || Number.isNaN(Date.parse(baseUpdatedAt)))) {
    return res.status(400).json({ error: "The sync version is invalid." });
  }
  if (typeof restoreDeleted !== "boolean") {
    return res.status(400).json({ error: "The restore option is invalid." });
  }

  try {
    const existing = await prisma.document.findUnique({ where: { id } });
    if (existing && existing.userId !== req.user.userId) {
      return res.status(404).json({ error: "Document not found." });
    }
    const requestMatchesStored = existing && !existing.deletedAt
      && existing.title === (title.trim() || "Untitled Document")
      && jsonMatches(existing.content, content)
      && existing.preview === (preview || "").slice(0, 300)
      && existing.wordCount === (wordCount || 0)
      && jsonMatches(existing.pageSettings, pageSettings ?? null);
    if (existing && requestMatchesStored) {
      return res.json({ document: existing });
    }
    if (existing?.deletedAt && !restoreDeleted) {
      return res.status(409).json({
        error: "This document was deleted from the account while this device was offline.",
        document: existing,
      });
    }
    if (existing && (!baseUpdatedAt || new Date(baseUpdatedAt).getTime() !== existing.updatedAt.getTime())) {
      return res.status(409).json({
        error: "This document changed on another device. Your local copy is preserved until the conflict is resolved.",
        document: existing,
      });
    }
    const data = {
      title: title.trim() || "Untitled Document",
      content,
      preview: (preview || "").slice(0, 300),
      wordCount: wordCount || 0,
      pageSettings: pageSettings ?? undefined,
      deletedAt: null,
      userId: req.user.userId,
    };
    let document;
    if (existing) {
      const updated = await prisma.document.updateMany({
        where: {
          id,
          userId: req.user.userId,
          updatedAt: new Date(baseUpdatedAt),
          deletedAt: existing.deletedAt ? { not: null } : null,
        },
        data,
      });
      if (updated.count !== 1) {
        const latest = await prisma.document.findUnique({ where: { id } });
        return res.status(409).json({
          error: "This document changed on another device. Your local copy is preserved until the conflict is resolved.",
          document: latest,
        });
      }
      document = await prisma.document.findUnique({ where: { id } });
    } else {
      document = await prisma.document.create({ data: { id, ...data } });
    }
    return res.json({ document });
  } catch (error) {
    if (error.code === "P2002") {
      const existing = await prisma.document.findUnique({ where: { id } }).catch(() => null);
      return res.status(409).json({
        error: "This document ID is already in use.",
        ...(existing?.userId === req.user.userId ? { document: existing } : {}),
      });
    }
    console.error("Could not sync account document:", error);
    return res.status(500).json({ error: "Could not sync this document." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.userId, deletedAt: null },
    });
    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }
    return res.json({ document });
  } catch (error) {
    console.error("Could not load account document:", error);
    return res.status(500).json({ error: "Could not load this document." });
  }
});

router.put("/:id", async (req, res) => {
  const { title, content, preview, wordCount, pageSettings } = req.body ?? {};
  if (title != null && typeof title !== "string") {
    return res.status(400).json({ error: "Document title must be text." });
  }
  if (content !== undefined && (!content || typeof content !== "object" || Array.isArray(content))) {
    return res.status(400).json({ error: "Document content must be a TipTap document." });
  }
  if (preview != null && typeof preview !== "string") {
    return res.status(400).json({ error: "Document preview must be text." });
  }
  if (wordCount != null && (!Number.isInteger(wordCount) || wordCount < 0)) {
    return res.status(400).json({ error: "Word count must be a non-negative integer." });
  }
  if (pageSettings != null && (typeof pageSettings !== "object" || Array.isArray(pageSettings))) {
    return res.status(400).json({ error: "Page settings must be an object." });
  }

  try {
    const existing = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.userId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Document not found." });
    }

    const data = {};
    if (title !== undefined) data.title = title.trim() || "Untitled Document";
    if (content !== undefined) data.content = content;
    if (preview !== undefined) data.preview = preview.slice(0, 300);
    if (wordCount !== undefined) data.wordCount = wordCount;
    if (pageSettings !== undefined) data.pageSettings = pageSettings;

    const document = await prisma.document.update({
      where: { id: existing.id },
      data,
    });
    return res.json({ document });
  } catch (error) {
    console.error("Could not save account document:", error);
    return res.status(500).json({ error: "Could not save your document." });
  }
});

router.delete("/:id", async (req, res) => {
  const { expectedUpdatedAt, force = false, title, content, preview, wordCount, pageSettings } = req.body ?? {};
  if (typeof force !== "boolean") {
    return res.status(400).json({ error: "The force-delete option is invalid." });
  }
  if (expectedUpdatedAt != null && (typeof expectedUpdatedAt !== "string" || Number.isNaN(Date.parse(expectedUpdatedAt)))) {
    return res.status(400).json({ error: "The delete version is invalid." });
  }
  try {
    let existing = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing && content && typeof content === "object" && !Array.isArray(content)) {
      try {
        await prisma.document.create({
          data: {
            id: req.params.id,
            title: typeof title === "string" && title.trim() ? title.trim() : "Untitled Document",
            content,
            preview: typeof preview === "string" ? preview.slice(0, 300) : "",
            wordCount: Number.isInteger(wordCount) && wordCount >= 0 ? wordCount : 0,
            pageSettings: pageSettings && typeof pageSettings === "object" && !Array.isArray(pageSettings)
              ? pageSettings
              : undefined,
            deletedAt: new Date(),
            userId: req.user.userId,
          },
        });
        return res.status(204).end();
      } catch (createError) {
        if (createError.code !== "P2002") throw createError;
        existing = await prisma.document.findFirst({
          where: { id: req.params.id, userId: req.user.userId },
        });
      }
    }
    if (!existing || existing.deletedAt) return res.status(204).end();
    if (!force && expectedUpdatedAt && new Date(expectedUpdatedAt).getTime() !== existing.updatedAt.getTime()) {
      return res.status(409).json({
        error: "This document changed in your account while its deletion was offline.",
        document: existing,
      });
    }
    const result = await prisma.document.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.userId,
        deletedAt: null,
        ...(force || !expectedUpdatedAt ? {} : { updatedAt: new Date(expectedUpdatedAt) }),
      },
      data: { deletedAt: new Date() },
    });
    if (!result.count) {
      const latest = await prisma.document.findFirst({
        where: { id: req.params.id, userId: req.user.userId },
      });
      if (latest?.deletedAt) return res.status(204).end();
      if (latest) {
        return res.status(409).json({
          error: "This document changed in your account while its deletion was offline.",
          document: latest,
        });
      }
    }
    return res.status(204).end();
  } catch (error) {
    console.error("Could not delete account document:", error);
    return res.status(500).json({ error: "Could not delete this document." });
  }
});

module.exports = router;
