import { useState } from "react";

const SearchForm = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSearch = async () => {
    if (!file) return;

    try {
      const res = await fetch("/api/searchIm", {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          "x-file-name": file.name,
        },
        body: file,
      });

      if (res.ok) {
        const searchData = await res.json();
        console.log("Search results:", searchData);
        alert("Search completed successfully!");
      } else {
        alert("Failed to search image.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to search image.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSearch} disabled={!file}>
        Search
      </button>
    </div>
  );
};

export default SearchForm;
