const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk
const uploadControllers = {};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);
});

function handleFileSelect(event) {
  const files = event.target.files;
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileId = `${file.name}-${Date.now()}`;

    const fileItem = document.createElement('div');
    fileItem.innerHTML = `
      <p>${file.name}</p>
      <button id="upload-${fileId}">Upload</button>
      <button id="pause-${fileId}" disabled>Pause</button>
      <button id="resume-${fileId}" disabled>Resume</button>
      <button id="cancel-${fileId}">Cancel</button>
      <div id="progressBar-${fileId}" class="progressBar"><div></div></div>
    `;
    fileList.appendChild(fileItem);

    uploadControllers[fileId] = {
      file,
      fileId,
      currentChunk: 0,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
      paused: false,
      canceled: false,
      progressBar: document.getElementById(`progressBar-${fileId}`).firstElementChild,
      uploadButton: document.getElementById(`upload-${fileId}`),
      pauseButton: document.getElementById(`pause-${fileId}`),
      resumeButton: document.getElementById(`resume-${fileId}`),
      cancelButton: document.getElementById(`cancel-${fileId}`),
    };

    // Attach event listeners
    document.getElementById(`upload-${fileId}`).addEventListener('click', () => startUpload(fileId));
    document.getElementById(`pause-${fileId}`).addEventListener('click', () => pauseUpload(fileId));
    document.getElementById(`resume-${fileId}`).addEventListener('click', () => resumeUpload(fileId));
    document.getElementById(`cancel-${fileId}`).addEventListener('click', () => cancelUpload(fileId));
  }
}

function startUpload(fileId) {
  const controller = uploadControllers[fileId];
  controller.paused = false;
  controller.canceled = false;

  // Update button states
  controller.uploadButton.disabled = true;
  controller.pauseButton.disabled = false;
  controller.resumeButton.disabled = true;
  controller.cancelButton.disabled = false;

  console.log(`Starting upload for file: ${controller.file.name}`);
  uploadChunk(fileId);
}

async function uploadChunk(fileId) {
  const controller = uploadControllers[fileId];
  const { file, currentChunk, totalChunks, paused, canceled } = controller;

  if (paused || canceled) return;

  if (currentChunk < totalChunks) {
    const start = currentChunk * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', currentChunk);
    formData.append('totalChunks', totalChunks);
    formData.append('fileName', file.name);
    formData.append('fileId', fileId);

    try {
      console.log(`Uploading chunk ${currentChunk + 1} of ${totalChunks} for file: ${file.name}`);

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

      const percentCompleted = ((currentChunk + 1) / totalChunks) * 100;
      controller.progressBar.style.width = `${percentCompleted}%`;
      controller.progressBar.textContent = `${Math.round(percentCompleted)}%`;

      console.log(`Chunk ${currentChunk + 1} uploaded successfully. Progress: ${percentCompleted.toFixed(2)}%`);

      controller.currentChunk++;
      uploadChunk(fileId);
    } catch (error) {
      console.error('Error uploading chunk:', error);
      alert(`Error uploading chunk: ${error.message}`);
    }
  } else {
    console.log(`${file.name} uploaded successfully!`);
    alert(`${file.name} uploaded successfully!`);

    // Reset buttons after upload is complete
    controller.uploadButton.disabled = false;
    controller.pauseButton.disabled = true;
    controller.resumeButton.disabled = true;
    controller.cancelButton.disabled = true;
  }
}

function pauseUpload(fileId) {
  const controller = uploadControllers[fileId];
  controller.paused = true;
  // Update button states
  controller.pauseButton.disabled = true;
  controller.resumeButton.disabled = false;
  console.log(`Upload paused for file: ${controller.file.name}`);
}

function resumeUpload(fileId) {
  const controller = uploadControllers[fileId];
  if (!controller.canceled) {
    controller.paused = false;
    // Update button states
    controller.pauseButton.disabled = false;
    controller.resumeButton.disabled = true;
    console.log(`Resuming upload for file: ${controller.file.name}`);
    uploadChunk(fileId);
  }
}

function cancelUpload(fileId) {
  const controller = uploadControllers[fileId];
  controller.canceled = true;
  controller.progressBar.style.width = '0%';
  controller.progressBar.textContent = 'Canceled';

  // Update button states
  controller.uploadButton.disabled = false;
  controller.pauseButton.disabled = true;
  controller.resumeButton.disabled = true;
  controller.cancelButton.disabled = true;

  console.log(`Upload canceled for file: ${controller.file.name}`);
  alert(`${controller.file.name} upload canceled`);
}



// const CHUNK_SIZE = 10 * 1024 * 1024; 
// document.getElementById('uploadButton').addEventListener('click', uploadFile);
// 
// async function uploadFile() {
//   const fileInput = document.getElementById('fileInput');
//   const file = fileInput.files[0];
//   
//   if (!file) {
//     alert('Please select a file to upload.');
//     return;
//   }
// 
//   const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
//   const fileId = `${file.name}-${Date.now()}`;
//   const progressBar = document.getElementById('progressBar').firstElementChild;
// 
//   for (let i = 0; i < totalChunks; i++) {
//     const start = i * CHUNK_SIZE;
//     const end = Math.min(start + CHUNK_SIZE, file.size);
//     const chunk = file.slice(start, end);
// 
//     const formData = new FormData();
//     formData.append('chunk', chunk);
//     formData.append('chunkIndex', i);
//     formData.append('totalChunks', totalChunks);
//     formData.append('fileName', file.name);
//     formData.append('fileId', fileId);
// 
//     try {
//       const response = await fetch('http://localhost:7000/api/upload', {
//         method: 'POST',
//         body: formData
//       });
//       
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
// 
//       const data = await response.json();
//       if (data.message !== 'Chunk uploaded successfully' && data.message !== 'File upload successful') {
//         throw new Error(data.message);
//       }
// 
//       const percentCompleted = ((i + 1) / totalChunks) * 100;
//       progressBar.style.width = `${percentCompleted}%`;
//       progressBar.textContent = `${Math.round(percentCompleted)}%`;
//       console.log(`Chunk ${i + 1} of ${totalChunks} uploaded`);
//     } catch (error) {
//       console.error('Error uploading chunk:', error);
//       alert(`Error uploading chunk: ${error.message}`);
//       return;
//     }
//   }
// 
//   alert('File uploaded successfully!');
// }
