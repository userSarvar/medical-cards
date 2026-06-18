import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, getDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";

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
    const storageRef = ref(storage, `logos/${Date.now()}_${logoFile.name}`);
    await uploadBytes(storageRef, logoFile);
    logoUrl = await getDownloadURL(storageRef);
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

export const deleteCard = async (id, logoUrl) => {
  if (logoUrl) {
    try {
      const logoRef = ref(storage, logoUrl);
      await deleteObject(logoRef);
    } catch (_) {}
  }
  await deleteDoc(doc(db, COL, id));
};