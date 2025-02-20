import UploadForm from "./comp";
import SearchForm from "./search";


const UploadPage = () => {
  return (
    <div>
      <br />br
      <br /><br /><br /> <br />
      <h1>Upload File to S3</h1>
      <UploadForm />
      <br /><br /><br />
      <SearchForm></SearchForm>
    </div>
  );
};

export default UploadPage;
