exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Cloudinary returns the URL in req.file.path
        const filePath = req.file.path;

        res.json({
            success: true,
            filePath: filePath,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'File upload failed' });
    }
};
