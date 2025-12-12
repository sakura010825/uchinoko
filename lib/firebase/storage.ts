"use client"

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./config"
import type { ImageUploadResult, ImageDeleteResult } from "./types"

export const uploadImage = async (
  file: File,
  path: string
): Promise<ImageUploadResult> => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snapshot.ref)
    return { url, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

export const deleteImage = async (path: string): Promise<ImageDeleteResult> => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

