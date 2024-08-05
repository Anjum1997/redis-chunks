const CHUNK_SIZE = 10 * 1024 * 1024; 
document.getElementById('uploadButton').addEventListener('click', uploadFile);

async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a file to upload.');
    return;
  }

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${file.name}-${Date.now()}`;
  const progressBar = document.getElementById('progressBar').firstElementChild;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', i);
    formData.append('totalChunks', totalChunks);
    formData.append('fileName', file.name);
    formData.append('fileId', fileId);

    try {
      const response = await fetch('http://localhost:7000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.message !== 'Chunk uploaded successfully' && data.message !== 'File upload successful') {
        throw new Error(data.message);
      }

      const percentCompleted = ((i + 1) / totalChunks) * 100;
      progressBar.style.width = `${percentCompleted}%`;
      progressBar.textContent = `${Math.round(percentCompleted)}%`;
      console.log(`Chunk ${i + 1} of ${totalChunks} uploaded`);
    } catch (error) {
      console.error('Error uploading chunk:', error);
      alert(`Error uploading chunk: ${error.message}`);
      return;
    }
  }

  alert('File uploaded successfully!');
}
