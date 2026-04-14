import React, { useCallback, useEffect, useMemo, useState } from 'react';
import documentsService from '../../services/documentsService';
import { projectsService } from '../../services/projectsService';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [state, setState] = useState({ loading: true, error: '' });
  const [uploadMessage, setUploadMessage] = useState('');

  const loadFiles = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const [documentsResponse, projectsResponse] = await Promise.all([
        documentsService.list(selectedProjectId ? { project_id: selectedProjectId } : {}),
        projectsService.getUserProjects().catch(() => ({ projects: [] })),
      ]);
      setFiles(documentsResponse?.documents || []);
      setProjects(projectsResponse?.projects || projectsResponse || []);
      setState({ loading: false, error: '' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Failed to load files.' });
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDrag = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const uploadFiles = useCallback(async (fileList) => {
    if (!selectedProjectId) {
      setUploadMessage('Select a project before uploading documents.');
      return;
    }

    try {
      setUploading(true);
      setUploadMessage('');
      await documentsService.uploadToProject(selectedProjectId, fileList);
      setUploadMessage('Files uploaded successfully.');
      await loadFiles();
    } catch (error) {
      setUploadMessage(error.message || 'Failed to upload files.');
    } finally {
      setUploading(false);
    }
  }, [loadFiles, selectedProjectId]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      uploadFiles(event.dataTransfer.files);
    }
  }, [uploadFiles]);

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      uploadFiles(event.target.files);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await documentsService.download(documentId);
      if (response?.url) {
        window.open(response.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setUploadMessage(error.message || 'Failed to download file.');
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch =
        String(file.originalName || file.fileUrl || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(file.project?.projectName || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || String(file.docType || '').toUpperCase() === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [files, searchTerm, typeFilter]);

  const getFileIcon = (type) => {
    const icons = {
      BOQ_PDF: 'PDF',
      PLAN_UPLOAD: 'PLN',
      FEASIBILITY_PDF: 'FSB',
      ESTIMATE_PDF: 'EST',
      IMAGE: 'IMG',
      OTHER: 'DOC',
    };
    return icons[type] || 'FILE';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>File Management</h1>
        <p style={styles.subtitle}>Upload, organize, and share project files</p>
      </div>

      <div style={styles.uploadSection}>
        <div
          style={{ ...styles.uploadArea, ...(dragActive ? styles.uploadAreaActive : {}) }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div style={styles.uploadContent}>
            <div style={styles.uploadIcon}>FILE</div>
            <h3 style={styles.uploadTitle}>{dragActive ? 'Drop files here' : 'Drag & Drop files here'}</h3>
            <p style={styles.uploadSubtitle}>Upload to the selected project using the real document endpoint.</p>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.projectName || project.title || `Project ${project.id}`}</option>
              ))}
            </select>
            <input type="file" multiple onChange={handleFileSelect} style={styles.fileInput} />
            <button style={styles.browseButton} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Choose Files'}
            </button>
            {uploadMessage ? <p style={styles.uploadMessage}>{uploadMessage}</p> : null}
          </div>
        </div>
      </div>

      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={styles.searchInput}
        />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} style={styles.filterSelect}>
          <option value="ALL">All Files</option>
          <option value="BOQ_PDF">BOQ PDF</option>
          <option value="PLAN_UPLOAD">Plan Uploads</option>
          <option value="FEASIBILITY_PDF">Feasibility</option>
          <option value="ESTIMATE_PDF">Estimate</option>
          <option value="IMAGE">Images</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {state.loading ? (
        <div style={styles.filesGrid}>
          {Array.from({ length: 6 }).map((_, index) => <div key={index} style={styles.fileSkeleton} />)}
        </div>
      ) : state.error ? (
        <div style={styles.stateBlock}>
          <p style={styles.stateText}>{state.error}</p>
          <button style={styles.browseButton} onClick={loadFiles}>Retry</button>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div style={styles.stateBlock}>
          <p style={styles.stateText}>No files found for the current filters or project selection.</p>
        </div>
      ) : (
        <div style={styles.filesGrid}>
          {filteredFiles.map((file) => (
            <div key={file.id} style={styles.fileCard}>
              <div style={styles.fileHeader}>
                <div style={styles.fileIcon}>{getFileIcon(file.docType)}</div>
                <div style={styles.fileActions}>
                  <button style={styles.fileAction} onClick={() => setSelectedFile(file)}>View</button>
                  <button style={styles.fileAction} onClick={() => handleDownload(file.id)}>Down</button>
                </div>
              </div>

              <div style={styles.fileInfo}>
                <h4 style={styles.fileName}>{file.originalName || 'Untitled document'}</h4>
                <div style={styles.fileMeta}>
                  <span style={styles.fileSize}>{file.mimeType || 'application/octet-stream'}</span>
                  <span style={styles.fileType}>{file.docType || 'OTHER'}</span>
                </div>
                <div style={styles.fileDetails}>
                  <div style={styles.fileDetail}>
                    <span style={styles.detailLabel}>Project:</span>
                    <span style={styles.detailValue}>{file.project?.projectName || 'Unknown project'}</span>
                  </div>
                  <div style={styles.fileDetail}>
                    <span style={styles.detailLabel}>Version:</span>
                    <span style={styles.detailValue}>{file.version || 1}</span>
                  </div>
                  <div style={styles.fileDetail}>
                    <span style={styles.detailLabel}>Date:</span>
                    <span style={styles.detailValue}>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>File Preview</h3>
              <button onClick={() => setSelectedFile(null)} style={styles.closeButton}>X</button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.previewArea}>
                <div style={styles.previewIcon}>{getFileIcon(selectedFile.docType)}</div>
                <h4 style={styles.previewTitle}>{selectedFile.originalName}</h4>
                <p style={styles.previewInfo}>
                  Type: {selectedFile.docType} • Project: {selectedFile.project?.projectName || 'Unknown'}
                </p>
                <div style={styles.previewActions}>
                  <button style={styles.previewButton} onClick={() => handleDownload(selectedFile.id)}>Download</button>
                  <button style={styles.previewButton} onClick={() => setSelectedFile(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '24px'
  },
  header: { marginBottom: 24 },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  uploadSection: { marginBottom: 24 },
  uploadArea: {
    border: '1px dashed #262626',
    borderRadius: 16,
    background: 'var(--card-bg)',
    padding: 24
  },
  uploadAreaActive: {
    borderColor: '#00f2ff',
    background: 'rgba(0,242,255,0.05)'
  },
  uploadContent: {
    display: 'grid',
    justifyItems: 'center',
    gap: 12,
    textAlign: 'center'
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(0,242,255,0.12)',
    color: '#00f2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700
  },
  uploadTitle: {
    margin: 0,
    color: 'var(--text-color)'
  },
  uploadSubtitle: {
    margin: 0,
    color: 'var(--text-muted)'
  },
  uploadMessage: {
    margin: 0,
    color: 'var(--text-muted)'
  },
  fileInput: { display: 'none' },
  browseButton: {
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #00f2ff, #6366f1)',
    color: '#07111f',
    fontWeight: 700,
    padding: '12px 18px',
    cursor: 'pointer'
  },
  searchSection: {
    display: 'flex',
    gap: 12,
    marginBottom: 24
  },
  searchInput: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #262626',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-color)'
  },
  filterSelect: {
    minWidth: 180,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #262626',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-color)'
  },
  filesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20
  },
  fileCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 20
  },
  fileSkeleton: {
    height: 220,
    borderRadius: 12,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))'
  },
  fileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(0,242,255,0.12)',
    color: '#00f2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700
  },
  fileActions: {
    display: 'flex',
    gap: 8
  },
  fileAction: {
    border: '1px solid #262626',
    background: 'transparent',
    borderRadius: 8,
    color: 'var(--text-color)',
    padding: '8px 10px',
    cursor: 'pointer'
  },
  fileInfo: { display: 'grid', gap: 10 },
  fileName: {
    margin: 0,
    color: 'var(--text-color)'
  },
  fileMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    color: 'var(--text-muted)',
    fontSize: 12
  },
  fileDetails: {
    display: 'grid',
    gap: 8
  },
  fileDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: 13
  },
  detailLabel: { color: 'var(--text-muted)' },
  detailValue: { color: 'var(--text-color)' },
  stateBlock: {
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    textAlign: 'center',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 24
  },
  stateText: {
    color: 'var(--text-muted)',
    margin: 0
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    width: '100%',
    maxWidth: 560,
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    padding: 24
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: { margin: 0, color: 'var(--text-color)' },
  closeButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-color)',
    cursor: 'pointer'
  },
  modalContent: {},
  previewArea: {
    textAlign: 'center',
    display: 'grid',
    gap: 12
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(0,242,255,0.12)',
    color: '#00f2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    margin: '0 auto'
  },
  previewTitle: { margin: 0, color: 'var(--text-color)' },
  previewInfo: { margin: 0, color: 'var(--text-muted)' },
  previewActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12
  },
  previewButton: {
    border: '1px solid #262626',
    background: 'transparent',
    color: 'var(--text-color)',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer'
  }
};
