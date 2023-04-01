import { Inter } from "next/font/google";
import Image from "next/image";
import { useRef, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const imageUploadInput = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const _uploadImage = async () => {
    setLoading(true);
    var formdata = new FormData();

    formdata.append("image", image, image["name"]);

    try {
      await fetch("/api/upload", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
        },
        body: formdata,
      });
      alert("Image uploaded successfully");
    } catch {
      alert("Unable to upload the image. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    if (!imageUploadInput?.current?.files) return;

    const file = imageUploadInput.current.files[0];
    if (!file) {
      return;
    }

    const isWithinUploadLimit = file?.size <= 5000000;

    if (!isWithinUploadLimit) {
      // eslint-disable-next-line no-alert
      alert("Maximum image file size allowed is 5MB");
      return;
    }
    setImage(file);
  };
  return (
    <>
      <div className="main">
        <div className="splitdiv" id="leftdiv">
          <h1 className="main-h1">
            Upload an Image to see how ServerlessQ will trigger your resizing
            method
          </h1>

          <button
            type="button"
            disabled={loading}
            id="leftbutton"
            onClick={() => imageUploadInput.current?.click()}
          >
            Choose Image
          </button>
          <input
            type="file"
            style={{ display: "none" }}
            id="inputUpload"
            data-id="upload"
            onChange={handleUpload}
            ref={imageUploadInput}
            accept={"image/*"}
          />
        </div>

        <div className="splitdiv" id="rightdiv">
          <h1> Image will appear here</h1>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              flexDirection: "column",
            }}
          >
            {image && (
              <>
                <Image
                  width={500}
                  height={500}
                  src={URL.createObjectURL(image)}
                  alt="image"
                />

                <button
                  type="button"
                  id="leftbutton"
                  onClick={_uploadImage}
                  disabled={loading}
                >
                  Upload Image
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
