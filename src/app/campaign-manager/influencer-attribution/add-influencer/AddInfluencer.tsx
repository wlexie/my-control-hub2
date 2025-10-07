"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { UploadCloud, X, Trash2, Plus } from "lucide-react";

type SocialLink = {
  platform: string;
  url: string;
};

const AddInfluencer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "failed"
  >("idle");
  const [progress, setProgress] = useState(0);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Instagram", url: "https://www.instagram.com/aziziad/" },
    { platform: "", url: "" },
  ]);

  const [phone, setPhone] = useState("");

  // handle file upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFilePreview(URL.createObjectURL(uploadedFile));
      setUploadStatus("uploading");
      setProgress(0);

      // simulate upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            const success = Math.random() > 0.2;
            setUploadStatus(success ? "success" : "failed");
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
  }, []);

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setUploadStatus("idle");
    setProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif"] },
    multiple: false,
  });

  // handle social links
  const handleSocialChange = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
  };

  return (
    <div className="p-6 md:p-6 min-h-screen max-w-8xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 space-y-10">
        {/* Influencer Details */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Influencer Details
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-md font-medium text-gray-600 mb-1">
                Full Names<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Azziad Nasenya"
                className="border rounded-xl p-3 w-full focus:ring-2 bg-gray-100 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-600 mb-1">
                Influencer Handle<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="@azzi_ad"
                className="border rounded-xl p-3 w-full focus:ring-2 bg-gray-100 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-600 mb-1">
                ID Number<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter ID Number"
                className="border rounded-xl p-3 w-full focus:ring-2 bg-gray-100 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-600 mb-1">
                Phone Number<span className="text-red-500">*</span>
              </label>
              <PhoneInput
                country={"ke"}
                value={phone}
                onChange={setPhone}
                inputStyle={{
                  width: "100%",
                  borderRadius: "12px",
                  padding: "20px 50px",
                  border: "1px solid #D1D5DB",
                  fontFamily: "cursive",
                  backgroundColor: "#F3F4F6",
                }}
                buttonStyle={{
                  border: "1px solid #D1D5DB",
                  borderRadius: "12px 0 0 12px",
                }}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-600 mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. azziad@gmail.com"
                className="border rounded-xl p-3 w-full bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-600 mb-1">
                Country<span className="text-red-500">*</span>
              </label>
              <select className="border rounded-xl p-3 w-full focus:ring-2 bg-gray-100 focus:ring-blue-500 outline-none">
                <option value="">Select Country</option>
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
              </select>
            </div>
          </div>
        </section>

        {/* ✅ Social Media Links (updated to match your screenshot) */}
        <section>
          <h3 className="text-md font-semibold text-gray-800 mb-4">
            Social Media Links
          </h3>

          {socialLinks.map((link, index) => (
            <div key={index} className="mb-6">
              <div className="mb-4">
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Platform <span className="text-red-500">*</span>
                </label>
                <select
                  value={link.platform}
                  onChange={(e) =>
                    handleSocialChange(index, "platform", e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 bg-gray-100 py-2 text-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Social Media Platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="block text-md font-medium text-gray-700 mb-1">
                  URL Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    handleSocialChange(index, "url", e.target.value)
                  }
                  placeholder="https://www.instagram.com/username/"
                  className="w-full border border-gray-200 rounded-lg bg-gray-100 px-3 py-2 text-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="flex items-center text-md font-medium text-red-500 mt-2 hover:underline"
              >
                Delete Link <Trash2 className="w-4 h-4 ml-1" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSocialLink}
            className="flex items-center text-md font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
          >
            Add Another Link <Plus className="w-4 h-4 ml-1" />
          </button>
        </section>

        {/* Profile Photo Upload */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Profile Photo Upload
          </h3>
          <p className="text-md text-gray-500 mb-2">Add your image here</p>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
          >
            <input {...getInputProps()} />
            {!filePreview && (
              <>
                <UploadCloud className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-md text-gray-600">
                  Drag your file(s) to start uploading <br />
                  <span className="text-blue-500 font-medium">or</span>
                </p>
                <button
                  type="button"
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-md"
                >
                  Browse Files
                </button>
                <p className="text-sm text-gray-400 mt-3">
                  Only supports .jpg, .jpeg, .gif, and .png files
                </p>
              </>
            )}

            {filePreview && (
              <div className="flex flex-col items-center">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover mb-3"
                />
                <p className="text-md font-medium text-gray-700">
                  {file?.name}
                </p>
                <p className="text-md text-gray-500 mb-2">
                  {file?.size ? `${(file.size / 1024).toFixed(0)} KB` : "0 KB"}
                </p>

                {uploadStatus === "uploading" && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-green-500 h-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {uploadStatus === "uploading" && (
                  <p className="text-md text-gray-500">
                    Uploading in progress...
                  </p>
                )}
                {uploadStatus === "success" && (
                  <p className="text-md text-green-600">✅ Pic Uploaded</p>
                )}
                {uploadStatus === "failed" && (
                  <p className="text-md text-red-500">❌ Upload Failed</p>
                )}

                <button
                  type="button"
                  onClick={removeFile}
                  className="mt-2 text-gray-500 hover:text-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          <button className="border border-red-500 text-red-500 px-6 bg-red-100 py-2 rounded-xl font-medium hover:bg-red-200 hover:text-red-600">
            Clear Form
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700">
            Create Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInfluencer;
