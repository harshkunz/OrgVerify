// controllers/orgIdController.js
import OrgID from '../models/OrgID.js';
import { getNextSequence } from '../utils/counter.js';
import excelToJson from 'convert-excel-to-json';
import fs from 'fs';


export const uploadOrgIDsExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded',
        type: 'validation'
      });
    }

    const filePath = req.file.path;

    // Convert Excel to JSON
    const result = excelToJson({
      sourceFile: filePath,
      sheets: [{
        name: 'Sheet1',
        header: { rows: 1 },
        columnToKey: {
          A: 'firstName',
          B: 'middleName',
          C: 'lastName',
          D: 'gender',
        }
      }]
    });

    const orgIDsData = result.Sheet1;

    if (!orgIDsData || orgIDsData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the Excel file',
        type: 'validation'
      });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'middleName', 'lastName', 'gender'];
    const missingFields = requiredFields.filter(field => 
      !orgIDsData[0][field]
    );

    if (missingFields.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        type: 'validation'
      });
    }

    // Process and validate each record
    const validOrgIDs = [];
    const errors = [];

    for (const [index, record] of orgIDsData.entries()) {
      try {
        // Validate required fields
        if (!record.firstName || !record.lastName || !record.lastName || !record.gender) {
          throw new Error('First name, middle name,  last name, and gender are required');
        }

        // Check for existing record
        const existingID = await OrgID.findOne({ 
          firstName: record.firstName.trim(),
          middleName: record.middleName?.trim(),
          lastName: record.lastName.trim(),
          gender: record.gender.trim()
        });

        if (existingID) {
          throw new Error('Organization ID already exists for this person');
        }

        // Generate Organization ID number
        const orgIdNumber = await getNextSequence('orgId');

        // Prepare the record
        validOrgIDs.push({
          firstName: record.firstName.trim(),
          middleName: record.middleName?.trim(),
          lastName: record.lastName.trim(),
          gender: record.gender.trim(),
          orgIdNumber // Include the generated Organization ID number
        });
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        type: 'validation',
        errors,
        recordsProcessed: 0
      });
    }

    // Insert records
    try {
      const result = await OrgID.insertMany(validOrgIDs, { ordered: false });
      fs.unlinkSync(filePath);
      
      return res.status(201).json({
        success: true,
        message: 'File processed successfully',
        recordsProcessed: result.length,
        orgIDs: result
      });
    } catch (mongoError) {
      fs.unlinkSync(filePath);
      
      if (mongoError.code === 11000) {
        const duplicates = mongoError.writeErrors?.map(err => err.err.op.orgIdNumber) || 
                         [mongoError.keyValue?.orgIdNumber] || 
                         ['Unknown'];
        
        return res.status(400).json({
          success: false,
          message: `Duplicate Organization IDs detected: ${duplicates.join(', ')}`,
          type: 'duplicate',
          duplicateIds: duplicates,
          recordsProcessed: mongoError.result?.insertedCount || 0
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Database error occurred',
        type: 'database',
        error: mongoError.message
      });
    }
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    next(error);
  }
};


export const createOrgID = async (req, res) => {
  const { firstName, middleName, lastName, gender, phone_no, dateOfBirth, address } = req.body;
  
  // Remove middleName from required validation
  if (!firstName || !lastName || !gender || !phone_no) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: firstName, lastName, gender, phone_no'
    });
  }

  try {
    let orgIdNumber;
    let retries = 3;
    while (retries > 0) {
      try {
        orgIdNumber = await getNextSequence('orgId');
        break;
      } catch (error) {
        if (error.code === 11000) {
          retries -= 1;
          console.warn('Duplicate orgIdNumber detected, retrying...');
        } else {
          throw error;
        }
      }
    }

    if (!orgIdNumber) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate a unique Organization ID number after multiple attempts'
      });
    }

    const existingID = await OrgID.findOne({
      firstName: firstName.trim(),
      middleName: middleName?.trim() || '', // Handle optional middleName
      lastName: lastName.trim(),
      gender: gender.trim()
    });
    
    if (existingID) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID already exists for this person'
      });
    }

    const orgID = new OrgID({
      firstName: firstName.trim(),
      middleName: middleName?.trim() || '', // Handle optional middleName
      lastName: lastName.trim(),
      gender: gender.trim(),
      phone_no: phone_no.trim(),
      dateOfBirth: dateOfBirth || new Date(Date.now() - 22 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      address: address || {},
      orgIdNumber: orgIdNumber.toString()
    });

    await orgID.save();
    
    res.status(201).json({
      success: true,
      orgID
    });
  } catch (error) {
    console.error('Error creating Organization ID:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


export const searchOrgIDs = async (req, res) => {
  try {
    // Extract query parameters
    const { gender, firstName, middleName, lastName } = req.query;
    
    // Build the search filter dynamically
    const filter = {};
    
    if (gender) filter.gender = { $regex: new RegExp(gender, 'i') };
    if (firstName) filter.firstName = { $regex: new RegExp(firstName, 'i') };
    if (middleName) filter.middleName = { $regex: new RegExp(middleName, 'i') };
    if (lastName) filter.lastName = { $regex: new RegExp(lastName, 'i') };
    
    // Execute the query
    const orgIDs = await OrgID.find(filter);
    
    res.status(200).json({
      success: true,
      count: orgIDs.length,
      data: orgIDs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};


export const getOrgIDByName = async (req, res) => {
  const { firstName, middleName, lastName, gender } = req.query;

  try {
    const orgID = await OrgID.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, "i") }, // Case-insensitive match
      middleName: { $regex: new RegExp(`^${middleName}$`, "i") }, // Case-insensitive match
      lastName: { $regex: new RegExp(`^${lastName}$`, "i") }, // Case-insensitive match
      gender: { $regex: new RegExp(`^${gender}$`, "i") } // Case-insensitive match
    });

    if (!orgID) {
      return res.status(404).json({
        success: false,
        error: "Organization ID not found"
      });
    }
    res.status(200).json(orgID)
  }
  catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}



// step 2
export const getOrgIdByNumber = async (req, res) => {
  const orgIdNumber = req.params.orgIdNumber;
  if(!orgIdNumber){
    return res.status(400).json({
      success: false,
      message: 'Please provide an Organization ID number'
    });
  }

  if(orgIdNumber.length !== 16){
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid Organization ID number (16 digits)'
    });
  }
  try {
    const orgID = await OrgID.findOne({ orgIdNumber: orgIdNumber });
    if (!orgID) {
      return res.status(404).json({
        success: false,
        error: "Organization ID not found"
      });
    }
    res.status(200).json({success: true, orgID})
  }
  catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const updateOrgData = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id)
    return res.status(400).json({ success: false, message: "Organization ID missing" });

  try {
    const org = await OrgID.findById(id);
    if (!org)
      return res.status(404).json({ success: false, message: "Organization record not found" });

    const allowed = ["firstName", "middleName", "lastName", "gender", "role", "phone_no"];
    allowed.forEach(key => {
      if (updates[key] !== undefined) org[key] = updates[key];
    });

    await org.save();
    res.status(200).json({ success: true, message: "Organization details updated", org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


