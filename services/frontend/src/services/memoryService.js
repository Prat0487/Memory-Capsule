// In your createMemory method of MemoryService class
createMemory = async (files, metadata) => {
  // Debug what's being sent
  console.log('Preparing request with:', { metadata, files: files.length })
  
  // Create FormData object
  const formData = new FormData()
  
  // Add all metadata as fields
  for (const [key, value] of Object.entries(metadata)) {
    formData.append(key, value)
    console.log(`Adding field ${key}:`, value)
  }
  
  // Add files if any exist
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
      console.log(`Adding file ${i}:`, files[i].name)
    }
  }
  
  // Show in browser what's being sent
  console.log('FormData entries:')
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1])
  }
  
  // Make the actual request
  return axios.post('http://localhost:3000/memories/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })
}