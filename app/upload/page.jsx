// app/upload/page.jsx
"use client";
import React, { useState, useRef } from "react";
import { BiCloud } from "react-icons/bi";
import { useCreateAsset } from "@livepeer/react";
import { ContentFocus, useActiveProfile, useCreatePost, VideoType, ImageType } from '@lens-protocol/react-web';
import axios from "axios";
import { v4 as uuid } from "uuid";
import Header from '../header';

// هنا API قم بإضافة مفتاح
const pinata_api_key = "add-api-key"
// هنا Secret API قم بإضافة مفتاح
const pinata_secret_api_key = "add-secret-api-key"

export default function Upload() {

  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [urlImage, setUrlImage] = useState("");
  const [video, setVideo] = useState("");
  const [uploaded, setUploaded] = useState(false);

  const videoRef = useRef();

  // إستدعاء بيانات الحساب الذي في حالة تسجيل دخول
  const { data: publisher, error: isError, loading: profileLoading } = useActiveProfile();

  console.log(publisher)
  
  // بواسطة هذا الخطاف سنقوم بالنشر على البروتوكول
  const {
    execute: create,
    error: postError,
    isPending: isPosting
  } = useCreatePost({ publisher, upload });
  

  const { mutate: createAsset, data: assets, status, progress, error } = useCreateAsset(
    video ? {sources: [{
        name: video.name,
        file: video,
        storage: {ipfs: true, metadata: {name: description, description: description}},
      }],
    } : null
  );

  // IPFS تعمل الدالة على تخزين بيانات المنشور على
  // useCreatePost تعمل الدالة في داخل خطاف
  async function upload(data) {
    // Pinata تخزين البيانات بمساعدة خدمات
    const res = await axios({method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data: JSON.stringify(data),
      headers: {
        'pinata_api_key': pinata_api_key,
        'pinata_secret_api_key': pinata_secret_api_key,
        "Content-Type": "application/json"
      }
    })
    return `ipfs://${res.data.IpfsHash}`;
  }

  {/*
    * Pinata بإستخدام IPFS تقوم الدالة اولا بتخزين الصورة المصغرة على
    * Livepeer ثم تقوم بطلب تحميل الفيديو على
  */}
  const uploadThumbnailAndVideo = async () => {
    setUploaded(true)

    const formData = new FormData()
    formData.append("file", thumbnail)
    
    const resFile = await axios({method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        'pinata_api_key': pinata_api_key,
        'pinata_secret_api_key': pinata_secret_api_key,
        "Content-Type": "multipart/form-data"
      },
    });
    setUrlImage(`ipfs://${resFile.data.IpfsHash}`)
    
    // لتحميل الفيديو useCreateAsset من الخطاف createAsset إستدعاء دالة
    await createAsset?.()
  };

  // تقوم الدالة بنشر المنشور على البروتوكول
  async function createPost() {
    // useCreatePost إستدعاء دالة النشر من الخطاف
    await create({
      // إعطاء قيمة مميزة للمنشور بحيث من المستحيل ان تتشابه مع منشور اخر
      metadata_id: uuid(),
      // تخزين وصف الفيديو بحيث يتم عرضه في المنشور
      content: description,
      // إعطاء اسم للمنشور
      name: `Video by ${publisher.handle}`,
      // تحديد نوع المنشور وهو فيديو
      contentFocus: ContentFocus.VIDEO,
      locale: 'ar',
      tags: ['business_&_entrepreneurs'],
      // إضافة الصورة المصغيرة للفيديو بحيث يتم عرضها للمنشور
      image: {
        url: urlImage,
        mimeType: thumbnail?.type=="image/jpeg" ? ImageType.JPEG : ImageType.PNG
      },
      // بحيث يتم عرضه في المنشور Livepeer إضافة الفيديو الذي تم تخزينه على
      media: [
        {
          url: assets[0]?.storage.ipfs.url,
          cover: urlImage,
          mimeType: VideoType.MP4,
        }
      ],
    });
    // قم بطباعة هذا النص عندما ينتهي من النشر على البروتوكول
    console.log("Published post!")
  }

  const renderButton = () => {
    // في حال لم يتم تحميل الفيديو بعد سيقوم بإظهار زر التحميل
    if (!uploaded) {
      return (
        <button
          onClick={() => {
            uploadThumbnailAndVideo()
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-lg flex px-4 justify-between flex-row items-center"
        >
          <BiCloud />
          <p className="mr-2">Upload</p>
        </button>
      )
    }
    else {
      // سيتوجب عليه الإنتظار اولاً Livepeer في حال لم يكتمل تحميل الفيديو على
      if (!assets) {
        return (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-lg flex px-4 justify-between flex-row items-center"
          >
            <p className="mr-2">Waiting...</p>
          </button>
        )
      }
      // سيظهر للمستخدم زر نشر الفيديو Livepeer بمجرد ان يتم تحميل الفيديو على
      if (assets) {
        return (
          <button
            onClick={() => {
              createPost()
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-lg flex px-4 justify-between flex-row items-center"
          >
            <BiCloud />
            <p className="mr-2">Post Video</p>
          </button>
        )
      }
    }
  }

  return (
    <div className='my-4 mx-8'>
      <Header />
      <div className="w-full h-screen flex flex-row -mt-8">
        <div className="flex-1 flex flex-col">
          <div className="mt-5 mr-10 flex justify-end">
            <div className="flex items-center mr-8">
              <a href="/" className="bg-transparent text-white py-2 px-6 border rounded-lg border-white mr-6">
                Back
              </a>
              {renderButton()}
            </div>
          </div>
          <div className="flex flex-col mt-5 lg:flex-row">
            <div className="flex lg:w-3/4 flex-col">
              <label className="text-white">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Learning Web3 now is like buying Bitcoin in 2009 and investing in many cryptocurrencies to this day."
                className="w-[90%] bg-black text-white h-32 placeholder:text-gray-500  rounded-md mt-2 p-2 border border-[#444752] focus:outline-none"
              />
              <label className="text-white mt-10">Thumbnail</label>
              <input
                type="file"
                accept={"image/*"}
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="w-[90%] text-white placeholder:text-gray-500 rounded-md mt-2 h-12 p-2 border border-[#444752] focus:outline-none"
              />
            </div>

            <div
              onClick={() => videoRef.current.click()}
              className={
                video
                  ? " w-96 rounded-md h-64 items-center justify-center flex"
                  : "border-2 border-gray-600  w-96 border-dashed rounded-md mt-8 h-64 items-center justify-center flex"
              }
            >
              {video ? (
                <video controls src={URL.createObjectURL(video)} className="h-full rounded-md" />
              ) : (
                <p className="text-[#c1c5ce]">Upload Video</p>
              )}
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            ref={videoRef}
            accept={"video/*"}
            onChange={(e) => {
              setVideo(e.target.files[0]);
              console.log(e.target.files[0]);
            }}
          />
        </div>
      </div>
    </div>
  );
}