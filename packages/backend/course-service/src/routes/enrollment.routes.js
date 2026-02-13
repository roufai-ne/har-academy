const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Inter-service routes (no JWT auth, uses X-Service-Auth header)
router.post('/service/enroll', enrollmentController.serviceEnroll);
router.delete('/service/:courseId/revoke', enrollmentController.serviceRevoke);
router.get('/verify-access', enrollmentController.verifyAccess);

// Protected routes (JWT required)
router.use(verifyToken);

router.post('/', enrollmentController.enrollInCourse);
router.get('/my', enrollmentController.getMyEnrollments);
router.get('/:id', enrollmentController.getEnrollmentDetails);
router.put('/:id/progress', enrollmentController.updateLessonProgress);
router.get('/:id/certificate', enrollmentController.getCertificate);
router.post('/:id/cancel', enrollmentController.cancelEnrollment);

module.exports = router;
