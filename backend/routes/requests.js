const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  createComplaint,
  createDocumentRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  addComment,
  getMyDepartmentTasks,
  updateDepartmentTask,
  updateRequestStage,
  generateCertificateForRequest,
  downloadCertificate,
  getAnalytics,
  getComplaintAnalytics,
  getDocumentAnalytics,
  deleteRequest,
  archiveDepartmentTask,
  unarchiveDepartmentTask,
  predictComplaintType,
  predictDocumentType
} = require('../controllers/requestController');
const { auth, requireRole } = require('../middleware/auth');

router.post('/complaints', auth, requireRole('citizen'), upload.single('image'), createComplaint);
router.post('/documents', auth, requireRole('citizen'), createDocumentRequest);
router.get('/my', auth, requireRole('citizen'), getMyRequests);

router.post('/predict/complaint-type', auth, requireRole('citizen'), predictComplaintType);
router.post('/predict/document-type', auth, requireRole('citizen'), predictDocumentType);

router.get('/', auth, requireRole('admin', 'officer'), getAllRequests);
router.get('/analytics', auth, requireRole('admin'), getAnalytics);
router.get('/analytics/complaints', auth, requireRole('admin', 'officer'), getComplaintAnalytics);
router.get('/analytics/documents', auth, requireRole('admin', 'officer'), getDocumentAnalytics);
router.get('/department/tasks', auth, requireRole('officer'), getMyDepartmentTasks);
router.patch('/tasks/:taskId', auth, requireRole('officer'), updateDepartmentTask);
router.patch('/tasks/:taskId/archive', auth, requireRole('officer'), archiveDepartmentTask);
router.patch('/tasks/:taskId/unarchive', auth, requireRole('officer'), unarchiveDepartmentTask);

router.get('/test-download-route', (req, res) => {
  res.json({ message: 'download route file is active' });
});

router.get('/:id', auth, getRequestById);
router.delete('/:id', auth, requireRole('citizen'), deleteRequest);


router.post('/:id/comments', auth, requireRole('officer', 'admin'), addComment);
router.patch('/:id/stage', auth, requireRole('officer'), updateRequestStage);

router.post('/:id/generate-certificate', auth, requireRole('officer', 'admin'), generateCertificateForRequest);
router.get('/:id/download-certificate', auth, requireRole('citizen', 'officer', 'admin'), downloadCertificate);

module.exports = router;