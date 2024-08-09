const fs = require('fs');
const path = require('path');

exports.uploadChunk = async (req, res) => {
  try {
    const { chunkIndex, totalChunks, fileName, fileId } = req.body;
    const chunk = req.file;

    if (!chunk) {
      return res.status(400).json({ message: 'Chunk file missing' });
    }

    const chunkDir = path.join(__dirname, `../uploads/${fileId}`);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const chunkPath = path.join(chunkDir, `${chunkIndex}`);
    console.log(`Saving chunk to: ${chunkPath}`);
    fs.renameSync(chunk.path, chunkPath);

    const files = fs.readdirSync(chunkDir);
    if (files.length === Number(totalChunks)) {
      const finalPath = path.join(__dirname, `../uploads/${fileName}`);
      const writeStream = fs.createWriteStream(finalPath);

      function appendToFileStream(index) {
        if (index < totalChunks) {
          const chunkFilePath = path.join(chunkDir, `${index}`);
          const readStream = fs.createReadStream(chunkFilePath);
          readStream.pipe(writeStream, { end: false });
          readStream.on('end', () => {
            fs.unlinkSync(chunkFilePath);
            appendToFileStream(index + 1);
          });
          readStream.on('error', (err) => {
            console.error('Error reading chunk file:', err);
            res.status(500).json({ message: 'Error reading chunk file', error: err });
          });
        } else {
          writeStream.end();
        }
      }
      

      writeStream.on('finish', () => {
        fs.rmdirSync(chunkDir, { recursive: true });
        res.status(200).json({ message: 'File upload successful', filePath: finalPath });
      });

      writeStream.on('error', (err) => {
        console.error('Error writing final file:', err);
        res.status(500).json({ message: 'Error writing final file', error: err });
      });

      appendToFileStream(0);
    } else {
      res.status(200).json({ message: 'Chunk uploaded successfully' });
    }
  } catch (error) {
    console.error('Error uploading chunk:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
