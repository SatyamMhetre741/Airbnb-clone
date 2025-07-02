// Utility functions for file operations
const fs = require('fs');
const path = require('path');

// Ensure the upload directory exists
exports.ensureUploadDirectoryExists = () => {
    const uploadDir = path.join(__dirname, '../public/images/uploads');
    
    if (!fs.existsSync(uploadDir)) {
        console.log(`Creating upload directory: ${uploadDir}`);
        fs.mkdirSync(uploadDir, { recursive: true });
    } else {
        console.log(`Upload directory exists: ${uploadDir}`);
    }
    
    // Check if the directory is writable
    try {
        const testFile = path.join(uploadDir, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('Upload directory is writable');
    } catch (error) {
        console.error('Upload directory is not writable:', error);
    }
    
    return uploadDir;
};
