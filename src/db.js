async function uploadToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error("Image upload failed");
  }

  return data.data.url;
}

import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, getDoc
} from "firebase/firestore";
import { db } from "./firebase";


const COL = "business_cards";

export const getCards = async () => {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCard = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const saveCard = async (card, logoFile) => {
  let logoUrl = card.logoUrl || "";

  if (logoFile) {
    logoUrl = await uploadToImgBB(logoFile);
  }

  const data = { ...card, logoUrl };
  delete data.id;

  if (card.id) {
    await updateDoc(doc(db, COL, card.id), data);
    return card.id;
  } else {
    const docRef = await addDoc(collection(db, COL), data);
    return docRef.id;
  }
};

export const deleteCard = async (id) => {
  await deleteDoc(doc(db, COL, id));
};