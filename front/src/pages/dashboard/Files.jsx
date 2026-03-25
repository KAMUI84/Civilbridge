// File Upload System with Drag & Drop
import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Files() {
  const { dashboardConfig } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock files data
  const mockFiles = [
    { id: 1, name: 'Bridge_Design_Plan.pdf', size: '2.4 MB', type: 'PDF', uploadedBy: 'Sarah Wilson', uploadedAt: '2024-03-19', project: 'Bridge Design Project' },
    { id: 2, name: 'Construction_Schedule.xlsx', size: '1.1 MB', type: 'Excel', uploadedBy: 'Mike Johnson', uploadedAt: '2024-03-18', project: 'Road Construction' },
    { id: 3, name: 'Site_Photos.zip', size: '15.7 MB', type: 'ZIP', uploadedBy: 'David Chen', uploadedAt: '2024-03-17', project: 'Infrastructure Audit' },
    { id: 4, name: 'Technical_Specifications.docx', size: '856 KB', type: 'Word', uploadedBy: 'John Doe', uploadedAt: '2024-03-16', project: 'Bridge Design Project' }
  ];

  React.useEffect(() => {
    setFiles(mockFiles);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString().split('T')[0],
      project: 'Unassigned'
    }));

    setFiles([...newFiles, ...files]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type) => {
    const icons = {
      'PDF': '📄',
      'EXCEL': '📊',
      'WORD': '📝',
      'ZIP': '📦',
      'IMAGE': '🖼️',
      'VIDEO': '🎥',
      'AUDIO': '🎵'
    };
    return icons[type] || '📄';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>File Management</h1>
        <p style={styles.subtitle}>Upload, organize, and share project files</p>
      </div>

      {/* Upload Area */}
      <div style={styles.uploadSection}>
        <div
          style={{
            ...styles.uploadArea,
            ...(dragActive ? styles.uploadAreaActive : {})
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div style={styles.uploadContent}>
            <div style={styles.uploadIcon}>📁</div>
            <h3 style={styles.uploadTitle}>
              {dragActive ? 'Drop files here' : 'Drag & Drop files here'}
            </h3>
            <p style={styles.uploadSubtitle}>or click to browse</p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            <button style={styles.browseButton}>
              Choose Files
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select style={styles.filterSelect}>
          <option>All Files</option>
          <option>PDF</option>
          <option>Images</option>
          <option>Documents</option>
          <option>Archives</option>
        </select>
      </div>

      {/* Files Grid */}
      <div style={styles.filesGrid}>
        {filteredFiles.map(file => (
          <div key={file.id} style={styles.fileCard}>
            <div style={styles.fileHeader}>
              <div style={styles.fileIcon}>
                {getFileIcon(file.type)}
              </div>
              <div style={styles.fileActions}>
                <button style={styles.fileAction}>👁️</button>
                <button style={styles.fileAction}>⬇️</button>
                <button style={styles.fileAction}>🗑️</button>
              </div>
            </div>
            
            <div style={styles.fileInfo}>
              <h4 style={styles.fileName}>{file.name}</h4>
              <div style={styles.fileMeta}>
                <span style={styles.fileSize}>{file.size}</span>
                <span style={styles.fileType}>{file.type}</span>
              </div>
              <div style={styles.fileDetails}>
                <div style={styles.fileDetail}>
                  <span style={styles.detailLabel}>Uploaded by:</span>
                  <span style={styles.detailValue}>{file.uploadedBy}</span>
                </div>
                <div style={styles.fileDetail}>
                  <span style={styles.detailLabel}>Project:</span>
                  <span style={styles.detailValue}>{file.project}</span>
                </div>
                <div style={styles.fileDetail}>
                  <span style={styles.detailLabel}>Date:</span>
                  <span style={styles.detailValue}>{file.uploadedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>File Preview</h3>
              <button
                onClick={() => setSelectedFile(null)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.previewArea}>
                <div style={styles.previewIcon}>
                  {getFileIcon(selectedFile.type)}
                </div>
                <h4 style={styles.previewTitle}>{selectedFile.name}</h4>
                <p style={styles.previewInfo}>
                  Size: {selectedFile.size} | Type: {selectedFile.type}
                </p>
                <div style={styles.previewActions}>
                  <button style={styles.previewButton}>Download</button>
                  <button style={styles.previewButton}>Share</button>
                  <button style={styles.previewButtonDanger}>Delete</button>
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
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    fontSize: '18px',
    color: 'var(--text-muted)'
  }
};
