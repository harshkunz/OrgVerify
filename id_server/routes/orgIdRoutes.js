// routes/orgIdRoutes.js
import express from 'express';
import multer from 'multer';
import { 
  createOrgID, 
  getOrgIdByNumber, 
  getOrgIDByName, 
  searchOrgIDs, 
  uploadOrgIDsExcel,
  updateOrgData,
} from '../controllers/orgIdController.js';

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel'
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Excel files only!'), false); 
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});


router.post('/create', createOrgID);
router.get('/search', searchOrgIDs);
router.get('/search/name', getOrgIDByName);
router.post('/upload-excel', upload.single('file'), uploadOrgIDsExcel);


router.get('/find/:orgIdNumber', getOrgIdByNumber);
router.put("/update/:id", updateOrgData);

export default router;

