import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMemoryById } from '../services/blockchain';

function SharedMemoryView() {
  const { id } = useParams();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const memoryData = await getMemoryById(id);
        if (memoryData) {
          setMemory(memoryData);
        } else {
          setError("Memory not found");
        }
      } catch (err) {
        setError("Error loading memory");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, [id]);

  if (loading) return <div className="loading">Loading memory...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!memory) return <div className="not-found">Memory not found</div>;

  return (
    <div className="shared-memory-container">
      <h1>{memory.title}</h1>
      <p className="description">{memory.description}</p>
      
      <div className="memory-files">
        {memory.files && memory.files.map((file, index) => (
          <div key={index} className="memory-file">
            {file.type.startsWith('image/') ? (
              <img src={file.url} alt={file.name} />
            ) : (
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SharedMemoryView;
