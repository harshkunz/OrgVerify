const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

// Upload controller - to be updated for company-based file uploads
const uploadExcelFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded',
        type: 'validation'
      });
    }

    // File upload functionality for company-based system
    // TODO: Implement company/employee bulk upload
    fs.unlinkSync(req.file.path);
    
    return res.status(501).json({
      success: false,
      message: 'File upload functionality is being updated for company-based system'
    });

  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    next(error);
  }
};

module.exports = {
  uploadExcelFile
};
