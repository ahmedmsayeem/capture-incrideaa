import { useState } from "react";

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileName = encodeURIComponent(file.name);
    const fileType = file.type;

    try {
      // Get the signed URL from the API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType }),
      });

      const { uploadURL } = await res.json();

      // Upload the file to S3 using the signed URL
      await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: file,
      });

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
};

export default UploadForm;
