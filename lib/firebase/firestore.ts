"use client"

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "./config"
import type {
  UchinoKoTecho,
  UchinoKoTechoCreateData,
  UchinoKoTechoUpdateData,
  Post,
  PostCreateData,
  PostUpdateData,
  Karikari,
  ApiResponse,
  FirestoreResult,
} from "./types"

// うちの子手帳関連
export const createUchinoKoTecho = async (
  userId: string,
  data: Omit<UchinoKoTecho, "id" | "userId" | "createdAt" | "updatedAt">
) => {
  try {
    // birthDateをTimestampに変換
    const firestoreData: any = {
      ...data,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    if (data.birthDate) {
      if (data.birthDate instanceof Date) {
        firestoreData.birthDate = Timestamp.fromDate(data.birthDate)
      } else if (typeof data.birthDate === "string") {
        firestoreData.birthDate = Timestamp.fromDate(new Date(data.birthDate))
      }
    } else {
      firestoreData.birthDate = null
    }

    const docRef = await addDoc(collection(db, "uchinoKoTecho"), firestoreData)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const updateUchinoKoTecho = async (
  id: string,
  data: UchinoKoTechoUpdateData
) => {
  try {
    const docRef = doc(db, "uchinoKoTecho", id)
    // birthDateをTimestampに変換
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    if (data.birthDate !== undefined) {
      if (data.birthDate === null) {
        updateData.birthDate = null
      } else if (data.birthDate instanceof Date) {
        updateData.birthDate = Timestamp.fromDate(data.birthDate)
      } else if (typeof data.birthDate === "string") {
        updateData.birthDate = Timestamp.fromDate(new Date(data.birthDate))
      }
    }

    await updateDoc(docRef, updateData)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getUchinoKoTecho = async (userId: string) => {
  try {
    const q = query(
      collection(db, "uchinoKoTecho"),
      where("userId", "==", userId)
    )
    const querySnapshot = await getDocs(q)
    const techoList: UchinoKoTecho[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      techoList.push({
        id: doc.id,
        ...data,
        birthDate: data.birthDate ? (data.birthDate instanceof Timestamp ? data.birthDate.toDate() : new Date(data.birthDate)) : null,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as UchinoKoTecho)
    })
    return { data: techoList, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getUchinoKoTechoById = async (id: string) => {
  try {
    const docRef = doc(db, "uchinoKoTecho", id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return { data: null, error: "うちの子手帳が見つかりません" }
    }

    const data = docSnap.data()
    const techo: UchinoKoTecho = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as UchinoKoTecho

    return { data: techo, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// 投稿関連
export const createPost = async (
  userId: string,
  data: PostCreateData
) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...data,
      userId,
      karikariCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getPost = async (postId: string) => {
  try {
    const docRef = doc(db, "posts", postId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return { data: null, error: "投稿が見つかりません" }
    }

    const data = docSnap.data()
    const post: Post = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Post

    return { data: post, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const updatePost = async (
  postId: string,
  userId: string,
  data: PostUpdateData
) => {
  try {
    // 投稿がユーザーのものか確認
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    
    if (!postSnap.exists()) {
      return { error: "投稿が見つかりません" }
    }

    const postData = postSnap.data()
    if (postData.userId !== userId) {
      return { error: "この投稿を編集する権限がありません" }
    }

    // 投稿を更新
    await updateDoc(postRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })

    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getPosts = async (limitCount: number = 20, startAfter?: any) => {
  try {
    let q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )

    if (startAfter) {
      q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(startAfter),
        limit(limitCount)
      )
    }

    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    let lastDoc = null

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Post)
      lastDoc = doc
    })

    return { data: posts, lastDoc, error: null }
  } catch (error: any) {
    return { data: null, lastDoc: null, error: error.message }
  }
}

export const searchPosts = async (searchTerm: string, limitCount: number = 20) => {
  try {
    // Firestoreの制限により、完全な全文検索は難しいため、
    // 猫の名前での検索を実装（将来的にはAlgoliaなどの検索サービスを推奨）
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const post = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Post

      // クライアント側でフィルタリング
      if (
        post.catName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.aiTranslation.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        posts.push(post)
      }
    })

    return { data: posts, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getUserPosts = async (userId: string) => {
  try {
    // インデックスエラーを回避するため、orderByを削除してクライアント側でソート
    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId)
    )
    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Post)
    })
    // クライアント側でソート（新しい順）
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return { data: posts, error: null }
  } catch (error: any) {
    console.error("getUserPosts error:", error)
    return { data: null, error: error.message }
  }
}

// カリカリ関連
export const addKarikari = async (postId: string, userId: string) => {
  try {
    // カリカリを追加
    await addDoc(collection(db, "karikari"), {
      postId,
      userId,
      createdAt: Timestamp.now(),
    })

    // 投稿のカリカリ数を更新
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    if (postSnap.exists()) {
      const currentCount = postSnap.data().karikariCount || 0
      await updateDoc(postRef, {
        karikariCount: currentCount + 1,
      })
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const removeKarikari = async (postId: string, userId: string) => {
  try {
    // カリカリを削除
    const q = query(
      collection(db, "karikari"),
      where("postId", "==", postId),
      where("userId", "==", userId)
    )
    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // 投稿のカリカリ数を更新
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    if (postSnap.exists()) {
      const currentCount = postSnap.data().karikariCount || 0
      await updateDoc(postRef, {
        karikariCount: Math.max(0, currentCount - 1),
      })
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const checkKarikari = async (postId: string, userId: string) => {
  try {
    const q = query(
      collection(db, "karikari"),
      where("postId", "==", postId),
      where("userId", "==", userId)
    )
    const querySnapshot = await getDocs(q)
    return { hasKarikari: !querySnapshot.empty, error: null }
  } catch (error: any) {
    return { hasKarikari: false, error: error.message }
  }
}

// スタンプチャレンジ関連
export const getUserPostCount = async (userId: string) => {
  try {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId)
    )
    const querySnapshot = await getDocs(q)
    // docs.lengthを使用して確実にカウント
    const count = querySnapshot.docs.length
    return { count, error: null }
  } catch (error: any) {
    console.error("getUserPostCount error:", error)
    return { count: 0, error: error.message }
  }
}

export const getUserPostsForStamps = async (userId: string, limitCount: number = 8) => {
  try {
    // インデックスエラーを回避するため、orderByを削除してクライアント側でソート
    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId)
    )
    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Post)
    })
    // クライアント側でソート（新しい順）
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    // 指定された件数まで取得
    const limitedPosts = posts.slice(0, limitCount)
    return { data: limitedPosts, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const deletePost = async (postId: string, userId: string, imageUrl: string) => {
  try {
    // 投稿がユーザーのものか確認
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    
    if (!postSnap.exists()) {
      return { data: undefined, error: "投稿が見つかりません" }
    }

    const postData = postSnap.data()
    if (postData.userId !== userId) {
      return { data: undefined, error: "この投稿を削除する権限がありません" }
    }

    // Storageから画像を削除
    if (imageUrl) {
      try {
        // Firebase StorageのURLからパスを抽出
        // URL形式: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media
        const urlParts = imageUrl.split("/o/")
        if (urlParts.length > 1) {
          const pathWithQuery = urlParts[1].split("?")[0]
          const decodedPath = decodeURIComponent(pathWithQuery)
          const { deleteImage } = await import("./storage")
          await deleteImage(decodedPath)
        }
      } catch (storageError: any) {
        // 画像削除のエラーはログに記録するが、投稿削除は続行
        console.error("画像削除エラー:", storageError)
      }
    }

    // 投稿を削除
    await deleteDoc(postRef)

    // 関連するカリカリも削除
    const karikariQuery = query(
      collection(db, "karikari"),
      where("postId", "==", postId)
    )
    const karikariSnapshot = await getDocs(karikariQuery)
    const deletePromises = karikariSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    return { data: undefined, error: null }
  } catch (error: any) {
    return { data: undefined, error: error.message }
  }
}

