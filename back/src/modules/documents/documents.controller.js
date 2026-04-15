import {
  deleteProjectDocument,
  generateProjectPackagePdf,
  getProjectDocumentDownload,
  listProjectDocuments,
  regenerateProjectDocument,
  reviewProjectDocument,
} from "./documents.service.js";

export const getDocuments = async (req, res) => {
  try {
    const documents = await listProjectDocuments({
      actor: req.user,
      projectId: req.query.project_id,
      entityType: req.query.entity_type,
      reviewStatus: req.query.review_status,
    });

    res.json({ success: true, documents });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to fetch documents" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    await deleteProjectDocument({
      documentId: req.params.id,
      actor: req.user,
    });

    res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to delete document" });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const result = await getProjectDocumentDownload({
      documentId: req.params.id,
      actor: req.user,
    });

    res.json({
      success: true,
      url: result.signedUrl,
      filename: result.document.originalName,
      document: result.document,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to fetch document" });
  }
};

export const generateProjectPackage = async (req, res) => {
  try {
    const result = await generateProjectPackagePdf({
      projectId: req.params.projectId,
      actor: req.user,
      approveDocument: req.body?.approveDocument === true,
      reviewNotes: req.body?.reviewNotes || null,
    });

    res.status(201).json({
      success: true,
      document: result.document,
      signedUrl: result.signedUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to generate project package" });
  }
};

export const reviewDocument = async (req, res) => {
  try {
    const document = await reviewProjectDocument({
      documentId: req.params.id,
      actor: req.user,
      reviewStatus: req.body?.reviewStatus,
      reviewNotes: req.body?.reviewNotes || null,
    });

    res.json({ success: true, document });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to review document" });
  }
};

export const regenerateDocument = async (req, res) => {
  try {
    const result = await regenerateProjectDocument({
      documentId: req.params.id,
      actor: req.user,
    });

    res.json({
      success: true,
      document: result.document,
      signedUrl: result.signedUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to regenerate document" });
  }
};
